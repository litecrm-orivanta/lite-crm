import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { Lead, listLeads, createLead, updateLeadStage, deleteLead, exportLeadsToCSV, bulkUpdateLeads, bulkDeleteLeads, bulkAssignLeads } from "@/api/leads";
import { listUsers } from "@/api/users";
import { listSavedFilters, createSavedFilter, deleteSavedFilter, SavedFilter } from "@/api/saved-filters";
import { previewCSV, importFromCSV, importFromGoogleSheets, CSVPreview } from "@/api/bulk-import";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { getMySubscription } from "@/api/subscriptions";
import { useToastContext } from "@/contexts/ToastContext";
import { useDialogContext } from "@/contexts/DialogContext";
import UpgradeModal from "@/components/UpgradeModal";
import Loader from "@/components/Loader";

const STAGES = ["NEW", "CONTACTED", "WON", "LOST"];
const SOURCES = ["Website", "Ads", "Referral", "Manual", "Import"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian phone number: 10 digits starting with 6-9, optionally prefixed with +91
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

export default function Dashboard() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  // Redirect super admins to admin dashboard
  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStage, setUpdatingStage] = useState<Set<string>>(new Set());
  const [deletingLead, setDeletingLead] = useState<Set<string>>(new Set());
  const [creatingLead, setCreatingLead] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<'stage' | 'assign' | 'delete' | null>(null);
  const [bulkStage, setBulkStage] = useState("");
  const [bulkOwnerId, setBulkOwnerId] = useState("");

  // Bulk import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'preview' | 'mapping'>('select');
  const [importSource, setImportSource] = useState<'csv' | 'google-sheets' | 'google-drive' | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);

  // create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [region, setRegion] = useState("");

  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const toast = useToastContext();
  const dialog = useDialogContext();

  // filters
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("");

  const emailValid = !email || emailRegex.test(email);
  const phoneValid = !phone || phoneRegex.test(phone);
  const canCreate =
    name.trim().length > 0 && emailValid && phoneValid;

  async function loadLeads() {
    setLoading(true);
    try {
      const data = await listLeads({
        stage: stageFilter !== "ALL" ? stageFilter : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
        region: regionFilter || undefined,
        search: query || undefined,
      });
    setLeads(data);
    } catch (err: any) {
      console.error("Failed to load leads:", err);
      toast.error(`Failed to load leads: ${err.message || "Unknown error"}`);
    } finally {
    setLoading(false);
    }
  }

  async function loadSubscription() {
    try {
      const data = await getMySubscription();
      setSubscription(data);
    } catch (err: any) {
      console.error("Failed to load subscription:", err);
      setSubscription(null);
    }
  }

  async function onCreateLead(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate || creatingLead) return;

    setCreatingLead(true);
    try {
      // Check lead limit before creating (only if subscription is loaded)
      if (subscription?.planType) {
        const planType = subscription.planType;
        const maxLeads = planType === "FREE" ? 5 : -1; // -1 means unlimited
        if (maxLeads !== -1 && leads.length >= maxLeads) {
          setUpgradeError("Your current plan allows up to 5 leads. Please upgrade to add more.");
          setShowUpgradeModal(true);
          return;
        }
      }

      const newLead = await createLead({
        name: name.trim(),
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        source: source || undefined,
        region: region || undefined,
      });

      // optimistic update
      setLeads((prev) => [newLead, ...prev]);
      toast.success("Lead created successfully!");

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setSource("");
      setRegion("");
      setUpgradeError(null);
    } catch (err: any) {
      if (err?.type === "UPGRADE_REQUIRED" || err?.message?.includes("upgrade") || err?.message?.includes("limit")) {
        setUpgradeError("Your current plan doesn't allow adding more leads. Please upgrade to continue.");
        setShowUpgradeModal(true);
        return;
      }
      toast.error(err?.message || "Failed to create lead");
    } finally {
      setCreatingLead(false);
    }
  }

  async function onStageChange(id: string, stage: string) {
    setUpdatingStage((prev) => new Set(prev).add(id));
    try {
      await updateLeadStage(id, stage);
      await loadLeads();
      toast.success("Lead stage updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lead stage");
    } finally {
      setUpdatingStage((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function onDeleteLead(id: string, name: string) {
    const confirmed = await dialog.confirm({
      title: "Delete Lead",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    setDeletingLead((prev) => new Set(prev).add(id));
    try {
      await deleteLead(id);
      await loadLeads(); // Reload leads after deletion
      toast.success("Lead deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete lead");
    } finally {
      setDeletingLead((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  useEffect(() => {
    loadLeads();
    loadSavedFilters();
    loadUsers();
    loadSubscription();
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedLeads.size > 0);
  }, [selectedLeads]);

  // Reload leads when filters change
  useEffect(() => {
    loadLeads();
  }, [stageFilter, sourceFilter, regionFilter, query]);

  // Bulk import handlers
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      try {
        const preview = await previewCSV(text);
        setCsvPreview(preview);
        setImportStep('mapping');
      } catch (error: any) {
        toast.error(`Failed to preview CSV: ${error.message || "Unknown error"}`);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvData || Object.keys(columnMapping).length === 0) {
      toast.warning("Please map at least one column");
      return;
    }

    try {
      setImporting(true);
      const result = await importFromCSV(csvData, columnMapping);
      toast.success(`Import completed! ${result.success} leads imported, ${result.failed} failed.`);
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
      setShowImportModal(false);
      setImportStep('select');
      setCsvFile(null);
      setCsvData("");
      setCsvPreview(null);
      setColumnMapping({});
      await loadLeads();
    } catch (error: any) {
      toast.error(`Import failed: ${error.message || "Unknown error"}`);
    } finally {
      setImporting(false);
    }
  }

  async function loadSavedFilters() {
    try {
      const filters = await listSavedFilters();
      setSavedFilters(filters);
    } catch (err) {
      console.error("Failed to load saved filters:", err);
    }
  }

  async function loadUsers() {
    try {
      const userList = await listUsers();
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  async function handleExport() {
    try {
      const blob = await exportLeadsToCSV({
        stage: stageFilter !== "ALL" ? stageFilter : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
        region: regionFilter || undefined,
        search: query || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      toast.error(`Failed to export: ${err.message || "Unknown error"}`);
    }
  }

  async function handleSaveFilter() {
    const name = await dialog.prompt({
      title: "Save Filter",
      message: "Enter a name for this filter:",
      placeholder: "Filter name",
    });
    if (!name?.trim()) return;

    try {
      await createSavedFilter(name.trim(), {
        query,
        stageFilter,
        sourceFilter,
        regionFilter,
      });
      await loadSavedFilters();
      toast.success("Filter saved successfully!");
    } catch (err: any) {
      toast.error(`Failed to save filter: ${err.message || "Unknown error"}`);
    }
  }

  async function loadSavedFilter(filter: SavedFilter) {
    const filters = filter.filters as any;
    setQuery(filters.query || "");
    setStageFilter(filters.stageFilter || "ALL");
    setSourceFilter(filters.sourceFilter || "ALL");
    setRegionFilter(filters.regionFilter || "");
    // Reload leads with the new filters
    await loadLeads();
  }

  function toggleSelectLead(leadId: string) {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  }

  async function handleBulkUpdate() {
    if (selectedLeads.size === 0 || bulkProcessing) return;

    setBulkProcessing(true);
    try {
      const updates: any = {};
      if (bulkStage) updates.stage = bulkStage;
      if (bulkOwnerId) updates.ownerId = bulkOwnerId;

      await bulkUpdateLeads(Array.from(selectedLeads), updates);
      setSelectedLeads(new Set());
      setBulkAction(null);
      setBulkStage("");
      setBulkOwnerId("");
      await loadLeads();
      toast.success("Leads updated successfully!");
    } catch (err: any) {
      toast.error(`Failed to update leads: ${err.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedLeads.size === 0 || bulkProcessing) return;
    const confirmed = await dialog.confirm({
      title: "Delete Leads",
      message: `Are you sure you want to delete ${selectedLeads.size} lead(s)?`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    setBulkProcessing(true);
    try {
      await bulkDeleteLeads(Array.from(selectedLeads));
      setSelectedLeads(new Set());
      setBulkAction(null);
      await loadLeads();
      toast.success("Leads deleted successfully!");
    } catch (err: any) {
      toast.error(`Failed to delete leads: ${err.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleBulkAssign() {
    if (selectedLeads.size === 0 || !bulkOwnerId || bulkProcessing) return;

    setBulkProcessing(true);
    try {
      await bulkAssignLeads(Array.from(selectedLeads), bulkOwnerId);
      setSelectedLeads(new Set());
      setBulkAction(null);
      setBulkOwnerId("");
      await loadLeads();
      toast.success("Leads assigned successfully!");
    } catch (err: any) {
      toast.error(`Failed to assign leads: ${err.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  }

  // Since we're doing server-side filtering now, filteredLeads is just the leads from API
  // Client-side filtering removed as filters are applied on the server
  const filteredLeads = leads;

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredLeads.length;
    const byStage = {
      NEW: filteredLeads.filter(l => l.stage === "NEW").length,
      CONTACTED: filteredLeads.filter(l => l.stage === "CONTACTED").length,
      WON: filteredLeads.filter(l => l.stage === "WON").length,
      LOST: filteredLeads.filter(l => l.stage === "LOST").length,
    };
    return { total, ...byStage };
  }, [filteredLeads]);

  return (
    <AppLayout>
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-screen -m-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and track your sales leads
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium shadow-sm hover:shadow transition-all"
            >
              Import Leads
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium shadow-sm hover:shadow transition-all"
            >
              Export CSV
            </button>
          <Link
            to="/workflows"
            className="px-5 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all"
          >
            Workflows
          </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="Total Leads" value={stats.total} gradient="from-blue-500 to-blue-600" />
          <StatCard label="New" value={stats.NEW} gradient="from-emerald-500 to-emerald-600" />
          <StatCard label="Contacted" value={stats.CONTACTED} gradient="from-amber-500 to-amber-600" />
          <StatCard label="Won" value={stats.WON} gradient="from-green-500 to-green-600" />
          <StatCard label="Lost" value={stats.LOST} gradient="from-red-500 to-red-600" />
        </div>

        {upgradeError && (
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">{upgradeError}</p>
                <button
                  onClick={() => navigate("/upgrade")}
                  className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white font-medium hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD LEAD FORM */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Lead</h2>
          <form
            onSubmit={onCreateLead}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            <input
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <select
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Source</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />

            <div className="md:col-span-6 flex items-center gap-2">
              <button
                type="submit"
                disabled={!canCreate || creatingLead}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {creatingLead ? (
                  <>
                    <Loader message="" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Add Lead"
                )}
              </button>
              {(!emailValid || !phoneValid) && (
                <p className="text-xs text-red-500">
                  {!emailValid ? "Invalid email" : !phoneValid ? "Invalid phone" : ""}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveFilter}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Save Filter
              </button>
              {savedFilters.length > 0 && (
                <select
                  onChange={(e) => {
                    const filter = savedFilters.find(f => f.id === e.target.value);
                    if (filter) loadSavedFilter(filter);
                  }}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  defaultValue=""
                >
                  <option value="">Load Saved Filter...</option>
                  {savedFilters.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search leads..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="ALL">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="ALL">All Sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter by region..."
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* BULK ACTIONS TOOLBAR */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedLeads.size} lead(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkAction('stage')}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Change Stage
                </button>
                <button
                  onClick={() => setBulkAction('assign')}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Assign Owner
                </button>
                <button
                  onClick={() => setBulkAction('delete')}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLeads(new Set());
                setBulkAction(null);
              }}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        )}

        {/* BULK ACTION MODALS */}
        {bulkAction === 'stage' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-4">
            <select
              value={bulkStage}
              onChange={(e) => setBulkStage(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Select Stage</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkStage || bulkProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkProcessing ? (
                <>
                  <Loader message="" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update"
              )}
            </button>
            <button
              onClick={() => {
                setBulkAction(null);
                setBulkStage("");
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        )}

        {bulkAction === 'assign' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-4">
            <select
              value={bulkOwnerId}
              onChange={(e) => setBulkOwnerId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Select Owner</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              disabled={!bulkOwnerId || bulkProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkProcessing ? (
                <>
                  <Loader message="" />
                  <span>Assigning...</span>
                </>
              ) : (
                "Assign"
              )}
            </button>
            <button
              onClick={() => {
                setBulkAction(null);
                setBulkOwnerId("");
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        )}

        {bulkAction === 'delete' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-4">
            <span className="text-sm text-slate-700">
              Are you sure you want to delete {selectedLeads.size} lead(s)?
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkProcessing ? (
                <>
                  <Loader message="" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </button>
            <button
              onClick={() => {
                setBulkAction(null);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        )}

        {/* LEADS TABLE */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
            <p className="text-slate-600">Get started by adding your first lead above</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Lead</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Contact</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Company</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Source</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Region</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Owner</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Stage</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Created</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(l.id)}
                          onChange={() => toggleSelectLead(l.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/leads/${l.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {l.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {l.email || l.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {l.company || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {l.source ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {l.source}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {l.region || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {l.owner?.name || l.owner?.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {updatingStage.has(l.id) ? (
                          <div className="flex items-center gap-2">
                            <Loader message="" />
                            <span className="text-xs text-slate-500">Updating...</span>
                          </div>
                        ) : (
                          <select
                            value={l.stage}
                            onChange={(e) => onStageChange(l.id, e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {deletingLead.has(l.id) ? (
                          <div className="flex items-center gap-2">
                            <Loader message="" />
                            <span className="text-xs text-slate-500">Deleting...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onDeleteLead(l.id, l.name)}
                            disabled={deletingLead.has(l.id)}
                            className="text-red-600 hover:text-red-700 hover:underline text-sm font-medium transition-colors disabled:opacity-50"
                            title="Delete lead"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Import Leads</h2>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportStep('select');
                      setCsvFile(null);
                      setCsvData("");
                      setCsvPreview(null);
                      setColumnMapping({});
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {importStep === 'select' && (
                  <div className="space-y-4">
                    <p className="text-slate-600 mb-4">Choose your import source:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* CSV Upload - Active */}
                      <button
                        onClick={() => {
                          setImportSource('csv');
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv';
                          input.onchange = handleFileSelect;
                          input.click();
                        }}
                        className="group relative p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all text-left shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 text-lg">Upload CSV</h3>
                        <p className="text-sm text-slate-600">Import leads from a CSV file</p>
                      </button>

                      {/* Google Sheets - Coming Soon */}
                      <button
                        onClick={() => {
                          setImportSource('google-sheets');
                          toast.info("Google Sheets integration coming soon! For now, export your sheet as CSV and upload it.");
                        }}
                        className="group relative p-6 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left shadow-sm overflow-hidden"
                        disabled
                      >
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                            Coming Soon
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <div className="relative flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md opacity-75">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 text-lg relative">Google Sheets</h3>
                        <p className="text-sm text-slate-600 relative">Import from Google Sheets</p>
                      </button>

                      {/* Google Drive - Coming Soon */}
                      <button
                        onClick={() => {
                          setImportSource('google-drive');
                          toast.info("Google Drive integration coming soon! For now, download the file and upload as CSV.");
                        }}
                        className="group relative p-6 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left shadow-sm overflow-hidden"
                        disabled
                      >
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                            Coming Soon
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-slate-100/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <div className="relative flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md opacity-75">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 text-lg relative">Google Drive</h3>
                        <p className="text-sm text-slate-600 relative">Import from Google Drive</p>
                      </button>
                    </div>
                  </div>
                )}

                {importStep === 'mapping' && csvPreview && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Map Columns</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Map your CSV columns to Lite CRM fields. {csvPreview.totalRows} rows found.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {csvPreview.headers.map((header) => (
                        <div key={header} className="flex items-center gap-4">
                          <div className="w-48 text-sm font-medium text-slate-700">{header}</div>
                          <div className="flex-1">
                            <select
                              value={columnMapping[header] || ""}
                              onChange={(e) =>
                                setColumnMapping({ ...columnMapping, [header]: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                              <option value="">-- Skip --</option>
                              <option value="name">Name</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="company">Company</option>
                              <option value="source">Source</option>
                              <option value="region">Region</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {csvPreview.preview.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Preview (first 5 rows):</h4>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                {csvPreview.headers.map((h) => (
                                  <th key={h} className="px-3 py-2 text-left font-medium text-slate-700">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {csvPreview.preview.map((row, idx) => (
                                <tr key={idx}>
                                  {csvPreview.headers.map((h) => (
                                    <td key={h} className="px-3 py-2 text-slate-600">
                                      {row[h] || "—"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleImport}
                        disabled={importing || Object.keys(columnMapping).length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {importing ? "Importing..." : "Import Leads"}
                      </button>
                      <button
                        onClick={() => {
                          setImportStep('select');
                          setCsvPreview(null);
                          setColumnMapping({});
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white shadow-lg`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </div>
  );
}
