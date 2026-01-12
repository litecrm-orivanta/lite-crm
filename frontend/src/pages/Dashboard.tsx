import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { Lead, listLeads, createLead, updateLeadStage, deleteLead } from "@/api/leads";
import { useNavigate } from "react-router-dom";

const STAGES = ["NEW", "CONTACTED", "WON", "LOST"];
const SOURCES = ["Website", "Ads", "Referral", "Manual", "Import"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{7,15}$/;

export default function Dashboard() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [region, setRegion] = useState("");

  const [upgradeError, setUpgradeError] = useState<string | null>(null);

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
    const data = await listLeads();
    setLeads(data);
    setLoading(false);
  }

  async function onCreateLead(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    try {
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

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setSource("");
      setRegion("");
      setUpgradeError(null);
    } catch (err: any) {
      if (err?.type === "UPGRADE_REQUIRED") {
        setUpgradeError(err.message);
        return;
      }
      alert("Something went wrong");
    }
  }

  async function onStageChange(id: string, stage: string) {
    await updateLeadStage(id, stage);
    loadLeads();
  }

  async function onDeleteLead(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteLead(id);
      loadLeads(); // Reload leads after deletion
    } catch (err: any) {
      alert(err?.message || "Failed to delete lead");
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesQuery =
        !query ||
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.email?.toLowerCase().includes(query.toLowerCase()) ||
        l.company?.toLowerCase().includes(query.toLowerCase());

      const matchesStage = stageFilter === "ALL" || l.stage === stageFilter;

      const matchesSource =
        sourceFilter === "ALL" || !sourceFilter || l.source === sourceFilter;

      const matchesRegion =
        !regionFilter ||
        (l.region?.toLowerCase().includes(regionFilter.toLowerCase()) ?? false);

      return (
        matchesQuery &&
        matchesStage &&
        matchesSource &&
        matchesRegion
      );
    });
  }, [leads, query, stageFilter, sourceFilter, regionFilter]);

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
          <Link
            to="/workflows"
            className="px-5 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all"
          >
            Workflows
          </Link>
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
                disabled={!canCreate}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                Add Lead
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
                        <select
                          value={l.stage}
                          onChange={(e) => onStageChange(l.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onDeleteLead(l.id, l.name)}
                          className="text-red-600 hover:text-red-700 hover:underline text-sm font-medium transition-colors"
                          title="Delete lead"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
