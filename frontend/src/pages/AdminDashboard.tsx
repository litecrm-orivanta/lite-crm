import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/auth/AuthContext";
import { Navigate } from "react-router-dom";
import {
  getAdminStats,
  getAllWorkspaces,
  getAllUsers,
  getAllPayments,
  getAllLeads,
  getAllWorkflows,
  getAllSubscriptions,
  getWorkflowExecutions,
  getAnalytics,
  updateUser,
  updateWorkspace,
  updateLead,
  deleteLead,
  updateWorkflow,
  deleteWorkflow,
  updateSubscriptionStatus,
  suspendWorkspace,
  unsuspendWorkspace,
  identifyDummyAccounts,
  deleteDummyAccounts,
  getAllPlanPricing,
  updatePlanPricing,
  AdminStats,
} from "@/api/admin";
import { apiFetch } from "@/api/apiFetch";
import { Link } from "react-router-dom";
import LiteCRMLogo, { LiteCRMLogoIcon } from "@/components/LiteCRMLogo";
import Loader from "@/components/Loader";
import { useToastContext } from "@/contexts/ToastContext";
import { useDialogContext } from "@/contexts/DialogContext";
import { sendAdminNotification } from "@/api/notifications";

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces" | "users" | "leads" | "workflows" | "subscriptions" | "executions" | "analytics" | "payments" | "payment-gateway" | "dummy-accounts" | "plan-pricing" | "notifications">("overview");
  const toast = useToastContext();
  const dialog = useDialogContext();

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const planMax = Math.max(1, ...(stats?.plansBreakdown || []).map((plan) => plan.count));
  const revenueSeries = (stats?.monthlyRevenue || []).slice(-6);
  const revenueMax = Math.max(1, ...revenueSeries.map((item) => item.revenue));

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, workspacesData] = await Promise.all([
        getAdminStats(),
        getAllWorkspaces(1, 10),
      ]);
      setStats(statsData);
      setWorkspaces(workspacesData.workspaces || []);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load admin dashboard. Super admin access required.");
    } finally {
      setLoading(false);
    }
  }

  // Redirect non-super-admins
  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Loader message="Loading admin dashboard..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage users, workspaces, subscriptions, and payments</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3 text-sm overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("workspaces")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "workspaces"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Workspaces
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "leads"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "workflows"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "subscriptions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("executions")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "executions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Executions
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "analytics"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "payments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("payment-gateway")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "payment-gateway"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Payment Gateway
            </button>
            <button
              onClick={() => setActiveTab("plan-pricing")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "plan-pricing"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Plan Pricing
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === "notifications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Super Admin Overview</h2>
                <p className="text-sm text-slate-200 mt-1">
                  Monitor platform health, revenue, and user activity in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm"
                >
                  Send Notification
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm"
                >
                  View Payments
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Users</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-slate-500 mt-1">All workspaces</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Workspaces</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.totalWorkspaces}</p>
                <p className="text-xs text-slate-500 mt-1">Active accounts</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Active Subscriptions</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.activeSubscriptions}</p>
                <p className="text-xs text-slate-500 mt-1">Paying customers</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Revenue</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(stats.totalRevenue)}
                </p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Plans Distribution</h2>
                <div className="space-y-3">
                  {stats.plansBreakdown.map((plan) => (
                    <div key={plan.plan} className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="font-medium">{plan.plan}</span>
                        <span>{plan.count} workspaces</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(plan.count / planMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue (Last 6 Months)</h2>
                <div className="flex items-end gap-3 h-40">
                  {revenueSeries.length === 0 ? (
                    <div className="text-sm text-slate-500">No revenue data yet.</div>
                  ) : (
                    revenueSeries.map((item) => (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-indigo-500 rounded-t-lg"
                          style={{ height: `${(item.revenue / revenueMax) * 100}%` }}
                        />
                        <div className="text-xs text-slate-500 mt-2">
                          {new Date(`${item.month}-01`).toLocaleString("en-IN", { month: "short" })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            {stats.recentPayments && stats.recentPayments.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Payments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Workspace</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Amount</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Status</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-slate-100">
                          <td className="p-2 text-sm text-slate-700">
                            {payment.subscription?.workspace?.name || "N/A"}
                          </td>
                          <td className="p-2 text-sm text-slate-900 font-medium">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: payment.currency === "USD" ? "INR" : (payment.currency || "INR"),
                              maximumFractionDigits: 2,
                            }).format(payment.amount)}
                          </td>
                          <td className="p-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                payment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-2 text-sm text-slate-600">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workspaces Tab */}
        {activeTab === "workspaces" && (
          <WorkspacesTab workspaces={workspaces} onUpdate={loadData} />
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <UsersTab onUpdate={loadData} />
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <LeadsTab />
        )}

        {/* Workflows Tab */}
        {activeTab === "workflows" && (
          <WorkflowsTab />
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <SubscriptionsTab />
        )}

        {/* Workflow Executions Tab */}
        {activeTab === "executions" && (
          <WorkflowExecutionsTab />
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnalyticsTab />
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <PaymentsTab />
        )}
        {activeTab === "plan-pricing" && (
          <PlanPricingTab />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab />
        )}


        {/* Payment Gateway Tab */}
        {activeTab === "payment-gateway" && (
          <PaymentGatewayTab />
        )}

        {/* Dummy Accounts Tab */}
        {activeTab === "dummy-accounts" && (
          <DummyAccountsTab />
        )}
      </div>
    </AppLayout>
  );
}

function NotificationsTab() {
  const toast = useToastContext();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAll, setTargetAll] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [workspaceIds, setWorkspaceIds] = useState("");
  const [userIds, setUserIds] = useState("");
  const [sending, setSending] = useState(false);
  const titleCount = title.length;
  const bodyCount = body.length;

  const targetSummary = (() => {
    if (targetAll) return "All users";
    const targets: string[] = [];
    if (roles.length) targets.push(`Roles: ${roles.join(", ")}`);
    if (workspaceIds.trim()) targets.push("Workspace IDs");
    if (userIds.trim()) targets.push("User IDs");
    return targets.length ? targets.join(" • ") : "No targets selected";
  })();

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.warning("Title and message are required");
      return;
    }

    const parsedWorkspaceIds = parseList(workspaceIds);
    const parsedUserIds = parseList(userIds);

    if (!targetAll && roles.length === 0 && parsedWorkspaceIds.length === 0 && parsedUserIds.length === 0) {
      toast.warning("Select at least one target");
      return;
    }

    try {
      setSending(true);
      const result = await sendAdminNotification({
        title: title.trim(),
        body: body.trim(),
        targets: {
          all: targetAll,
          roles: roles.length > 0 ? roles : undefined,
          workspaceIds: parsedWorkspaceIds.length > 0 ? parsedWorkspaceIds : undefined,
          userIds: parsedUserIds.length > 0 ? parsedUserIds : undefined,
        },
      });

      if (result?.success) {
        toast.success(`Notification sent to ${result.recipients || 0} users`);
        setTitle("");
        setBody("");
        setTargetAll(false);
        setRoles([]);
        setWorkspaceIds("");
        setUserIds("");
      } else {
        toast.error(result?.message || "Failed to send notification");
      }
    } catch (error: any) {
      toast.error(`Failed to send notification: ${error?.message || "Unknown error"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Send Notification</h2>
        <p className="text-sm text-slate-600">
          Send in-app alerts to all users or selected segments.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Notification title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows={4}
            placeholder="Write the notification message"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Targeting</label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={targetAll}
            onChange={(e) => {
              const checked = e.target.checked;
              setTargetAll(checked);
              if (checked) {
                setRoles([]);
                setWorkspaceIds("");
                setUserIds("");
              }
            }}
          />
          All users
        </label>

        <div className="flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={roles.includes("ADMIN")}
              onChange={(e) =>
                setRoles((prev) =>
                  e.target.checked ? [...prev, "ADMIN"] : prev.filter((role) => role !== "ADMIN")
                )
              }
              disabled={targetAll}
            />
            Admins
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={roles.includes("MEMBER")}
              onChange={(e) =>
                setRoles((prev) =>
                  e.target.checked ? [...prev, "MEMBER"] : prev.filter((role) => role !== "MEMBER")
                )
              }
              disabled={targetAll}
            />
            Members
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Workspace IDs (comma-separated)</label>
            <input
              value={workspaceIds}
              onChange={(e) => setWorkspaceIds(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g. ws1, ws2"
              disabled={targetAll}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">User IDs (comma-separated)</label>
            <input
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g. user1, user2"
              disabled={targetAll}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-slate-500">
          Target: {targetSummary} • Title {titleCount}/80 • Message {bodyCount}/500
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </div>
  );
}

function DummyAccountsTab() {
  const [dummyAccounts, setDummyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDummyAccounts();
  }, []);

  async function loadDummyAccounts() {
    try {
      setLoading(true);
      setError(null);
      const accounts = await identifyDummyAccounts();
      setDummyAccounts(accounts);
    } catch (error: any) {
      setError(`Failed to load dummy accounts: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectAccount(workspaceId: string) {
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedAccounts.size === dummyAccounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(dummyAccounts.map((a) => a.id)));
    }
  }

  async function handleDelete() {
    if (selectedAccounts.size === 0) {
      setError("Please select at least one account to delete");
      return;
    }

    const confirmed = await dialog.confirm({
      title: "Delete Accounts",
      message: `Are you sure you want to delete ${selectedAccounts.size} account(s)? This action cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);
      const result = await deleteDummyAccounts(Array.from(selectedAccounts));
      const successMsg = `Deleted ${result.deleted} account(s). ${result.failed > 0 ? `${result.failed} failed.` : ""}`;
      setError(successMsg);
      setTimeout(() => setError(null), 5000);
      setSelectedAccounts(new Set());
      await loadDummyAccounts();
    } catch (error: any) {
      setError(`Failed to delete accounts: ${error.message || "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <Loader message="Identifying dummy accounts..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className={`rounded-lg border px-4 py-3 ${
          error.includes('Deleted') || error.includes('success')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dummy/Test Accounts</h2>
            <p className="text-sm text-slate-600 mt-1">
              Accounts identified as test or dummy accounts based on email patterns, workspace names, or low activity.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadDummyAccounts}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
            >
              Refresh
            </button>
            {selectedAccounts.size > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {deleting ? "Deleting..." : `Delete ${selectedAccounts.size} Account(s)`}
              </button>
            )}
          </div>
        </div>

        {dummyAccounts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No dummy accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.size === dummyAccounts.length && dummyAccounts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Leads</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Users</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Created</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Reason</th>
                </tr>
              </thead>
              <tbody>
                {dummyAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.has(account.id)}
                        onChange={() => toggleSelectAccount(account.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">{account.name}</td>
                    <td className="p-4 text-sm text-slate-700">{account.email}</td>
                    <td className="p-4 text-sm text-slate-700">{account.leadCount}</td>
                    <td className="p-4 text-sm text-slate-700">{account.userCount}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{account.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentGatewayTab() {
  const [uatConfig, setUatConfig] = useState<any>(null);
  const [prodConfig, setProdConfig] = useState<any>(null);
  const [activeEnvironment, setActiveEnvironment] = useState<'UAT' | 'PRODUCTION'>('UAT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<'UAT' | 'PRODUCTION' | null>(null);
  const [formData, setFormData] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    webhookUrl: '',
    webhookSecret: '',
    isActive: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.tsx:520',message:'loadConfigs entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      setLoading(true);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.tsx:524',message:'before apiFetch calls',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const [uat, prod, active] = await Promise.all([
        apiFetch('/admin/payment-gateway/config?environment=UAT'),
        apiFetch('/admin/payment-gateway/config?environment=PRODUCTION'),
        apiFetch('/admin/payment-gateway/active-environment').catch(() => ({ environment: 'UAT' })),
      ]);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.tsx:528',message:'apiFetch success',data:{uatHasData:!!uat,prodHasData:!!prod},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setUatConfig(uat);
      setProdConfig(prod);
      setActiveEnvironment(active.environment || 'UAT');
      setError(null);
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.tsx:532',message:'loadConfigs error',data:{errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setError(`Failed to load payment gateway config: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEnvironment(newEnvironment: 'UAT' | 'PRODUCTION') {
    try {
      setSaving(true);
      setError(null);
      await apiFetch('/admin/payment-gateway/active-environment', {
        method: 'PUT',
        body: JSON.stringify({ environment: newEnvironment }),
      });
      setActiveEnvironment(newEnvironment);
      const successMsg = `Active payment environment switched to ${newEnvironment}`;
      setError(successMsg);
      setTimeout(() => setError(null), 5000);
    } catch (error: any) {
      setError(`Failed to switch environment: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(environment: 'UAT' | 'PRODUCTION') {
    setEditing(environment);
    const config = environment === 'UAT' ? uatConfig : prodConfig;
    
    // Generate default webhook URL if not set
    // Note: Razorpay requires publicly accessible HTTPS URL (not localhost)
    const defaultWebhookUrl = environment === 'UAT' 
      ? 'https://your-ngrok-url.ngrok.io/api/payments/razorpay/webhook'
      : 'https://yourdomain.com/api/payments/razorpay/webhook';
    
    setFormData({
      razorpayKeyId: config?.razorpayKeyId || '',
      razorpayKeySecret: config?.razorpayKeySecret === '***' ? '' : (config?.razorpayKeySecret || ''),
      webhookUrl: config?.webhookUrl || defaultWebhookUrl,
      webhookSecret: config?.webhookSecret === '***' ? '' : (config?.webhookSecret || ''),
      isActive: config?.isActive || false,
    });
  }

  async function handleSave(environment: 'UAT' | 'PRODUCTION') {
    try {
      setSaving(true);
      setError(null);
      await apiFetch('/admin/payment-gateway/config', {
        method: 'PUT',
        body: JSON.stringify({
          environment,
          ...formData,
        }),
      });
      await loadConfigs();
      setEditing(null);
      const successMsg = 'Payment gateway configuration saved successfully!';
      setError(successMsg);
      setTimeout(() => setError(null), 5000);
    } catch (error: any) {
      setError(`Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(environment: 'UAT' | 'PRODUCTION') {
    try {
      setError(null);
      const result = await apiFetch('/admin/payment-gateway/test', {
        method: 'POST',
        body: JSON.stringify({ environment, amount: 100 }),
      });
      setError(null);
      // Show success message temporarily
      const successMsg = `Test order created: ${result.order.id}. Use Razorpay test cards to complete payment.`;
      setError(successMsg);
      setTimeout(() => setError(null), 5000);
    } catch (error: any) {
      setError(`Test failed: ${error.message || "Unknown error"}`);
    }
  }

  if (loading) {
    return <Loader message="Loading payment gateway configuration..." />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className={`rounded-lg border px-4 py-3 ${
          error.includes('created') || error.includes('success') || error.includes('saved')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Razorpay Configuration</h2>
            <p className="text-sm text-slate-600 mt-1">
              Configure Razorpay payment gateway keys and webhook settings for UAT and Production environments.
            </p>
          </div>
          
          {/* Active Environment Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Active for Payments:</span>
            <div className="relative inline-flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => handleToggleEnvironment('UAT')}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeEnvironment === 'UAT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                } disabled:opacity-50`}
              >
                UAT
              </button>
              <button
                onClick={() => handleToggleEnvironment('PRODUCTION')}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeEnvironment === 'PRODUCTION'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                } disabled:opacity-50`}
              >
                PRODUCTION
              </button>
            </div>
          </div>
        </div>
        
        {activeEnvironment === 'UAT' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ UAT Mode Active:</strong> All payments will use UAT credentials for validation. Switch to PRODUCTION when ready for live users.
            </p>
          </div>
        )}
        
        {activeEnvironment === 'PRODUCTION' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ PRODUCTION Mode Active:</strong> All payments will use PRODUCTION credentials. Live payments enabled.
            </p>
          </div>
        )}

        {/* UAT Configuration */}
        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3">UAT Environment</h3>
          {editing === 'UAT' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key ID</label>
                <input
                  type="text"
                  value={formData.razorpayKeyId}
                  onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="rzp_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={formData.razorpayKeySecret}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Your secret key"
                />
              </div>
              
              {/* Webhook Configuration */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Webhook Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Webhook URL
                      <span className="text-xs text-slate-500 ml-1">(Configure this in Razorpay Dashboard)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                      placeholder="https://your-ngrok-url.ngrok.io/api/payments/razorpay/webhook"
                    />
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>⚠️ Important:</strong> Razorpay requires a publicly accessible HTTPS URL (not localhost). 
                      For UAT testing, use ngrok or similar tunnel service:
                      <ol className="list-decimal list-inside mt-1 ml-2 space-y-0.5">
                        <li>Install ngrok: <code className="bg-yellow-100 px-1 rounded">https://ngrok.com/download</code></li>
                        <li>Run: <code className="bg-yellow-100 px-1 rounded">ngrok http 3000</code></li>
                        <li>Copy the HTTPS URL (e.g., <code className="bg-yellow-100 px-1 rounded">https://abc123.ngrok.io</code>)</li>
                        <li>Use: <code className="bg-yellow-100 px-1 rounded">https://abc123.ngrok.io/api/payments/razorpay/webhook</code></li>
                      </ol>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Webhook Secret
                      <span className="text-xs text-slate-500 ml-1">(From Razorpay Dashboard)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.webhookSecret}
                      onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="Webhook secret for signature verification"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Razorpay Dashboard → Webhooks → Webhook Secret
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave('UAT')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTest('UAT')}
                  className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 ml-auto"
                >
                  Test Payment
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Key ID:</strong> {uatConfig?.razorpayKeyId || 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Webhook URL:</strong> {uatConfig?.webhookUrl || 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Webhook Secret:</strong> {uatConfig?.webhookSecret ? '***' : 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Status:</strong> {uatConfig?.isActive ? 'Active' : 'Inactive'}
              </p>
              <button
                onClick={() => handleEdit('UAT')}
                className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
              >
                {uatConfig ? "Edit Configuration" : "Configure"}
              </button>
            </div>
          )}
        </div>

        {/* Production Configuration */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3">Production Environment</h3>
          {editing === 'PRODUCTION' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key ID</label>
                <input
                  type="text"
                  value={formData.razorpayKeyId}
                  onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="rzp_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={formData.razorpayKeySecret}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Your secret key"
                />
              </div>
              
              {/* Webhook Configuration */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Webhook Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Webhook URL
                      <span className="text-xs text-slate-500 ml-1">(Configure this in Razorpay Dashboard)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                      placeholder="https://yourdomain.com/api/payments/razorpay/webhook"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Copy this URL to Razorpay Dashboard → Webhooks → Add New Webhook
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Webhook Secret
                      <span className="text-xs text-slate-500 ml-1">(From Razorpay Dashboard)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.webhookSecret}
                      onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="Webhook secret for signature verification"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Get this from Razorpay Dashboard → Webhooks → Webhook Secret
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave('PRODUCTION')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTest('PRODUCTION')}
                  className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 ml-auto"
                >
                  Test Payment
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Key ID:</strong> {prodConfig?.razorpayKeyId || 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Webhook URL:</strong> {prodConfig?.webhookUrl || 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Webhook Secret:</strong> {prodConfig?.webhookSecret ? '***' : 'Not configured'}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Status:</strong> {prodConfig?.isActive ? 'Active' : 'Inactive'}
              </p>
              <button
                onClick={() => handleEdit('PRODUCTION')}
                className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
              >
                {prodConfig ? "Edit Configuration" : "Configure"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkspacesTab({ workspaces: initialWorkspaces, onUpdate }: { workspaces: any[]; onUpdate: () => void }) {
  const [workspaces, setWorkspaces] = useState<any[]>(initialWorkspaces);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [isManual, setIsManual] = useState(false);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set());
  const [bulkPlan, setBulkPlan] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const toast = useToastContext();

  useEffect(() => {
    loadWorkspaces();
  }, [page]);

  useEffect(() => {
    setSelectedWorkspaces(new Set());
  }, [page, searchTerm, planFilter]);

  async function loadWorkspaces() {
    try {
      setLoading(true);
      const data = await getAllWorkspaces(page, 20);
      setWorkspaces(data.workspaces || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load workspaces:", error);
      toast.error(`Failed to load workspaces: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateWorkspace(workspaceId: string, subscriptionId?: string) {
    try {
      setUpdating(true);
      
      // Update workspace
      if (newName) {
        await updateWorkspace(workspaceId, {
          name: newName,
          plan: newPlan || undefined,
        });
      }

      // Update subscription if exists
      if (subscriptionId && newPlan) {
        await fetch(`/api/subscriptions/${workspaceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            planType: newPlan,
            amount: newAmount ? parseFloat(newAmount) : undefined,
            isManual,
            adminNotes: adminNotes || undefined,
          }),
        });
      } else if (newPlan) {
        // Create new subscription
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            workspaceId,
            planType: newPlan,
            amount: newAmount ? parseFloat(newAmount) : 0,
            isManual,
            adminNotes: adminNotes || undefined,
          }),
        });
      }

      toast.success("Workspace updated successfully!");
      setEditingWorkspace(null);
      setNewPlan("");
      setNewName("");
      setNewAmount("");
      setIsManual(false);
      setAdminNotes("");
      await loadWorkspaces();
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to update workspace: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  const filteredWorkspaces = workspaces.filter((ws) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      ws.name?.toLowerCase().includes(search) ||
      ws.id?.toLowerCase().includes(search);
    const plan = ws.subscription?.planType || ws.plan || "FREE";
    const matchesPlan = !planFilter || plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const allSelected =
    filteredWorkspaces.length > 0 &&
    filteredWorkspaces.every((ws) => selectedWorkspaces.has(ws.id));

  function toggleSelectWorkspace(workspaceId: string) {
    setSelectedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedWorkspaces(new Set());
    } else {
      setSelectedWorkspaces(new Set(filteredWorkspaces.map((ws) => ws.id)));
    }
  }

  async function handleBulkPlanUpdate() {
    if (!bulkPlan) {
      toast.warning("Select a plan to apply");
      return;
    }
    if (selectedWorkspaces.size === 0) {
      toast.warning("Select at least one workspace");
      return;
    }
    try {
      setBulkUpdating(true);
      await Promise.all(
        Array.from(selectedWorkspaces).map((workspaceId) =>
          updateWorkspace(workspaceId, { plan: bulkPlan })
        )
      );
      toast.success(`Updated ${selectedWorkspaces.size} workspace(s)`);
      setSelectedWorkspaces(new Set());
      setBulkPlan("");
      await loadWorkspaces();
      onUpdate();
    } catch (error: any) {
      toast.error(`Bulk update failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBulkUpdating(false);
    }
  }

  if (loading && workspaces.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading workspaces...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search workspaces by name or ID"
          className="flex-1 min-w-[220px] px-3 py-2 border border-slate-300 rounded text-sm"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Plans</option>
          <option value="FREE">FREE</option>
          <option value="STARTER">STARTER</option>
          <option value="PROFESSIONAL">PROFESSIONAL</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
        <div className="flex items-center gap-2">
          <select
            value={bulkPlan}
            onChange={(e) => setBulkPlan(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded text-sm"
          >
            <option value="">Bulk Plan</option>
            <option value="FREE">FREE</option>
            <option value="STARTER">STARTER</option>
            <option value="PROFESSIONAL">PROFESSIONAL</option>
            <option value="BUSINESS">BUSINESS</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
          </select>
          <button
            onClick={handleBulkPlanUpdate}
            disabled={bulkUpdating}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {bulkUpdating ? "Updating..." : "Apply"}
          </button>
        </div>
        {selectedWorkspaces.size > 0 && (
          <span className="text-sm text-slate-600">
            Selected: {selectedWorkspaces.size}
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="p-4 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Plan</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Users</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Leads</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkspaces.map((ws) => (
            <tr key={ws.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedWorkspaces.has(ws.id)}
                  onChange={() => toggleSelectWorkspace(ws.id)}
                />
              </td>
              <td className="p-4 text-sm text-slate-900 font-medium">{ws.name}</td>
              <td className="p-4 text-sm text-slate-700">
                {editingWorkspace === ws.id ? (
                  <>
                    <input
                      type="text"
                      value={newName || ws.name}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Workspace name"
                      className="px-2 py-1 border border-slate-300 rounded text-sm mb-2 w-full"
                    />
                    <select
                      value={newPlan || ws.subscription?.planType || ws.plan || "FREE"}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
                    >
                      <option value="FREE">FREE</option>
                      <option value="STARTER">STARTER</option>
                      <option value="PROFESSIONAL">PROFESSIONAL</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </>
                ) : (
                  <>
                    <div className="font-medium">{ws.name}</div>
                    <div className="text-xs text-slate-500">{ws.subscription?.planType || ws.plan || "FREE"}</div>
                  </>
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">
                {editingWorkspace === ws.id ? (
                  <input
                    type="number"
                    value={newAmount || ws.subscription?.amount || 0}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Amount"
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-24"
                  />
                ) : (
                  ws.subscription?.amount 
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(ws.subscription.amount)
                    : "₹0"
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{ws._count?.users || ws.users?.length || 0}</td>
              <td className="p-4 text-sm text-slate-700">{ws._count?.leads || 0}</td>
              <td className="p-4 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ws.subscription?.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : ws.subscription?.status === "TRIAL"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {ws.subscription?.status || "TRIAL"}
                </span>
              </td>
              <td className="p-4 text-sm">
                {editingWorkspace === ws.id ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={isManual}
                        onChange={(e) => setIsManual(e.target.checked)}
                      />
                      Manual (no payment)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Admin notes..."
                      className="px-2 py-1 border border-slate-300 rounded text-xs w-32"
                      rows={2}
                    />
                    <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateWorkspace(ws.id, ws.subscription?.id)}
                      disabled={updating}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkspace(null);
                        setNewPlan("");
                        setNewName("");
                        setNewAmount("");
                        setIsManual(false);
                        setAdminNotes("");
                      }}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingWorkspace(ws.id);
                      setNewName(ws.name);
                      setNewPlan(ws.subscription?.planType || ws.plan || "FREE");
                      setNewAmount(ws.subscription?.amount?.toString() || "0");
                      setIsManual(ws.subscription?.isManual || false);
                      setAdminNotes(ws.subscription?.adminNotes || "");
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function UsersTab({ onUpdate }: { onUpdate: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ role: "", search: "" });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("");
  const [editWorkspaceId, setEditWorkspaceId] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const toast = useToastContext();

  useEffect(() => {
    loadUsers();
  }, [page]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers(page, 20);
      let usersData = data.users || [];
      
      // Client-side filters
      if (filters.role) {
        usersData = usersData.filter((user: any) => user.role === filters.role);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        usersData = usersData.filter((user: any) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.workspace?.name?.toLowerCase().includes(searchLower)
        );
      }
      
      setUsers(usersData);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      toast.error(`Failed to load users: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(userId: string) {
    try {
      setUpdating(true);
      await updateUser(userId, {
        name: editName || undefined,
        email: editEmail || undefined,
        role: editRole || undefined,
        workspaceId: editWorkspaceId || undefined,
      });
      toast.success("User updated successfully!");
      setEditingUser(null);
      setEditName("");
      setEditEmail("");
      setEditRole("");
      setEditWorkspaceId("");
      await loadUsers();
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  if (loading && users.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name, email, workspace..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            loadUsers();
          }}
          className="px-3 py-2 border border-slate-300 rounded text-sm flex-1"
        />
        <select
          value={filters.role}
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            loadUsers();
          }}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MEMBER">MEMBER</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Role</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Leads</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Created</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-900 font-medium">
                {editingUser === user.id ? (
                  <input
                    type="text"
                    value={editName || user.name || ""}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-32"
                  />
                ) : (
                  user.name || "N/A"
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">
                {editingUser === user.id ? (
                  <input
                    type="email"
                    value={editEmail || user.email || ""}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-40"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{user.workspace?.name || "N/A"}</td>
              <td className="p-4 text-sm">
                {editingUser === user.id ? (
                  <select
                    value={editRole || user.role || "MEMBER"}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {user.role}
                  </span>
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{user._count?.leads || 0}</td>
              <td className="p-4 text-sm text-slate-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm">
                {editingUser === user.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateUser(user.id)}
                      disabled={updating}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setEditName("");
                        setEditEmail("");
                        setEditRole("");
                        setEditWorkspaceId("");
                      }}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingUser(user.id);
                      setEditName(user.name || "");
                      setEditEmail(user.email || "");
                      setEditRole(user.role || "");
                      setEditWorkspaceId(user.workspaceId || "");
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ stage: "", search: "" });
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editStage, setEditStage] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const toast = useToastContext();
  const dialog = useDialogContext();

  useEffect(() => {
    loadLeads();
  }, [page, filters.stage]);

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await getAllLeads(page, 20, {
        stage: filters.stage || undefined,
      });
      let leadsData = data.leads || [];
      
      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        leadsData = leadsData.filter((lead: any) =>
          lead.name?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower)
        );
      }
      
      setLeads(leadsData);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load leads:", error);
      toast.error(`Failed to load leads: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLead(leadId: string) {
    try {
      setUpdating(true);
      await updateLead(leadId, {
        name: editName || undefined,
        email: editEmail || undefined,
        phone: editPhone || undefined,
        stage: editStage || undefined,
      });
      toast.success("Lead updated successfully!");
      setEditingLead(null);
      setEditName("");
      setEditEmail("");
      setEditPhone("");
      setEditStage("");
      await loadLeads();
    } catch (error: any) {
      toast.error(`Failed to update lead: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteLead(leadId: string) {
    const confirmed = await dialog.confirm({
      title: "Delete Lead",
      message: "Are you sure you want to delete this lead?",
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteLead(leadId);
      toast.success("Lead deleted successfully!");
      await loadLeads();
    } catch (error: any) {
      toast.error(`Failed to delete lead: ${error.message || "Unknown error"}`);
    }
  }

  if (loading && leads.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading leads...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, company..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded text-sm flex-1"
        />
        <select
          value={filters.stage}
          onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Stages</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="FOLLOW_UP">FOLLOW_UP</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Owner</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Stage</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Created</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-900 font-medium">
                {editingLead === lead.id ? (
                  <input
                    type="text"
                    value={editName || lead.name || ""}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-32"
                  />
                ) : (
                  lead.name
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">
                {editingLead === lead.id ? (
                  <input
                    type="email"
                    value={editEmail || lead.email || ""}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-40"
                  />
                ) : (
                  lead.email || "N/A"
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">
                {editingLead === lead.id ? (
                  <input
                    type="text"
                    value={editPhone || lead.phone || ""}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-32"
                  />
                ) : (
                  lead.phone || "N/A"
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{lead.workspace?.name || "N/A"}</td>
              <td className="p-4 text-sm text-slate-700">{lead.owner?.name || lead.owner?.email || "N/A"}</td>
              <td className="p-4 text-sm">
                {editingLead === lead.id ? (
                  <select
                    value={editStage || lead.stage || "NEW"}
                    onChange={(e) => setEditStage(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="FOLLOW_UP">FOLLOW_UP</option>
                    <option value="WON">WON</option>
                    <option value="LOST">LOST</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.stage === "WON"
                        ? "bg-green-100 text-green-800"
                        : lead.stage === "LOST"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {lead.stage}
                  </span>
                )}
              </td>
              <td className="p-4 text-sm text-slate-600">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm">
                {editingLead === lead.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateLead(lead.id)}
                      disabled={updating}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingLead(null);
                        setEditName("");
                        setEditEmail("");
                        setEditPhone("");
                        setEditStage("");
                      }}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLead(lead.id);
                        setEditName(lead.name || "");
                        setEditEmail(lead.email || "");
                        setEditPhone(lead.phone || "");
                        setEditStage(lead.stage || "");
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function WorkflowsTab() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ active: "", search: "" });
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editActive, setEditActive] = useState<boolean>(false);
  const [updating, setUpdating] = useState(false);
  const toast = useToastContext();
  const dialog = useDialogContext();

  useEffect(() => {
    loadWorkflows();
  }, [page, filters.active]);

  async function loadWorkflows() {
    try {
      setLoading(true);
      const data = await getAllWorkflows(page, 20, {
        active: filters.active ? filters.active === "true" : undefined,
      });
      let workflowsData = data.workflows || [];
      
      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        workflowsData = workflowsData.filter((workflow: any) =>
          workflow.name?.toLowerCase().includes(searchLower) ||
          workflow.workspace?.name?.toLowerCase().includes(searchLower)
        );
      }
      
      setWorkflows(workflowsData);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load workflows:", error);
      toast.error(`Failed to load workflows: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateWorkflow(workflowId: string) {
    try {
      setUpdating(true);
      await updateWorkflow(workflowId, {
        name: editName || undefined,
        active: editActive,
      });
      toast.success("Workflow updated successfully!");
      setEditingWorkflow(null);
      setEditName("");
      setEditActive(false);
      await loadWorkflows();
    } catch (error: any) {
      toast.error(`Failed to update workflow: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteWorkflow(workflowId: string) {
    const confirmed = await dialog.confirm({
      title: "Delete Workflow",
      message: "Are you sure you want to delete this workflow?",
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteWorkflow(workflowId);
      toast.success("Workflow deleted successfully!");
      await loadWorkflows();
    } catch (error: any) {
      toast.error(`Failed to delete workflow: ${error.message || "Unknown error"}`);
    }
  }

  if (loading && workflows.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading workflows...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or workspace..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded text-sm flex-1"
        />
        <select
          value={filters.active}
          onChange={(e) => setFilters({ ...filters, active: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Nodes</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Executions</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Created</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr key={workflow.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-900 font-medium">
                {editingWorkflow === workflow.id ? (
                  <input
                    type="text"
                    value={editName || workflow.name || ""}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm w-40"
                  />
                ) : (
                  workflow.name
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{workflow.workspace?.name || "N/A"}</td>
              <td className="p-4 text-sm">
                {editingWorkflow === workflow.id ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                    />
                    <span className="text-xs">Active</span>
                  </label>
                ) : (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      workflow.active
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {workflow.active ? "Active" : "Inactive"}
                  </span>
                )}
              </td>
              <td className="p-4 text-sm text-slate-700">{workflow._count?.nodes || 0}</td>
              <td className="p-4 text-sm text-slate-700">{workflow._count?.executions || 0}</td>
              <td className="p-4 text-sm text-slate-600">
                {new Date(workflow.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm">
                {editingWorkflow === workflow.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateWorkflow(workflow.id)}
                      disabled={updating}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkflow(null);
                        setEditName("");
                        setEditActive(false);
                      }}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingWorkflow(workflow.id);
                        setEditName(workflow.name || "");
                        setEditActive(workflow.active || false);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SubscriptionRow({ subscription: sub, onUpdate }: { subscription: any; onUpdate: () => void }) {
  const [newStatus, setNewStatus] = useState(sub.status);
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();
  const dialog = useDialogContext();

  async function handleStatusChange() {
    if (newStatus === sub.status) return;
    try {
      setLoading(true);
      await updateSubscriptionStatus(sub.workspaceId, newStatus);
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend() {
    const confirmed = await dialog.confirm({
      title: "Suspend Workspace",
      message: `Are you sure you want to suspend workspace "${sub.workspace?.name}"?`,
      confirmText: "Suspend",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      setLoading(true);
      await suspendWorkspace(sub.workspaceId);
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to suspend: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsuspend() {
    const confirmed = await dialog.confirm({
      title: "Unsuspend Workspace",
      message: `Are you sure you want to unsuspend workspace "${sub.workspace?.name}"?`,
      confirmText: "Unsuspend",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      setLoading(true);
      await unsuspendWorkspace(sub.workspaceId);
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to unsuspend: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="p-4 text-sm text-slate-900 font-medium">
        {sub.workspace?.name || "N/A"}
      </td>
      <td className="p-4 text-sm text-slate-700">{sub.planType}</td>
      <td className="p-4 text-sm">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            sub.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : sub.status === "TRIAL"
              ? "bg-blue-100 text-blue-800"
              : sub.status === "CANCELLED"
              ? "bg-red-100 text-red-800"
              : sub.status === "SUSPENDED"
              ? "bg-orange-100 text-orange-800"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {sub.status}
        </span>
      </td>
      <td className="p-4 text-sm text-slate-900 font-medium">
        ₹{sub.amount.toFixed(2)}
      </td>
      <td className="p-4 text-sm text-slate-600">
        {new Date(sub.startDate).toLocaleDateString()}
      </td>
      <td className="p-4 text-sm text-slate-600">
        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "N/A"}
      </td>
      <td className="p-4 text-sm">
        {sub.isManual ? (
          <span className="text-green-600">Yes</span>
        ) : (
          <span className="text-slate-400">No</span>
        )}
      </td>
      <td className="p-4 text-sm">
        <div className="flex flex-col gap-2">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            onBlur={handleStatusChange}
            disabled={loading}
            className="px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50"
          >
            <option value="TRIAL">TRIAL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
          <div className="flex gap-1">
            {sub.status === "SUSPENDED" ? (
              <button
                onClick={handleUnsuspend}
                disabled={loading}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
              >
                Unsuspend
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                disabled={loading}
                className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Suspend
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const toast = useToastContext();

  useEffect(() => {
    loadSubscriptions();
  }, [page, planTypeFilter, statusFilter]);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await getAllSubscriptions(page, 20, {
        planType: planTypeFilter || undefined,
        status: statusFilter || undefined,
      });
      setSubscriptions(data.subscriptions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load subscriptions:", error);
      toast.error(`Failed to load subscriptions: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">Loading subscriptions...</div>
      </div>
    );
  }

  if (!loading && subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">No subscriptions found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <select
          value={planTypeFilter}
          onChange={(e) => {
            setPlanTypeFilter(e.target.value);
            setPage(1); // Reset to first page when filter changes
          }}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Plans</option>
          <option value="FREE">FREE</option>
          <option value="STARTER">STARTER</option>
          <option value="PROFESSIONAL">PROFESSIONAL</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1); // Reset to first page when filter changes
          }}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Statuses</option>
          <option value="TRIAL">TRIAL</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Plan</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Start Date</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">End Date</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Manual</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} subscription={sub} onUpdate={loadSubscriptions} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function WorkflowExecutionsTab() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const toast = useToastContext();

  useEffect(() => {
    loadExecutions();
  }, [page, statusFilter]);

  async function loadExecutions() {
    try {
      setLoading(true);
      const data = await getWorkflowExecutions(page, 20, {
        status: statusFilter || undefined,
      });
      setExecutions(data.executions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load executions:", error);
      toast.error(`Failed to load workflow executions: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && executions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">Loading executions...</div>
      </div>
    );
  }

  if (!loading && executions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">No workflow executions found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1); // Reset to first page when filter changes
          }}
          className="px-3 py-2 border border-slate-300 rounded text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="RUNNING">RUNNING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Workflow</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Started</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Completed</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Error</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((exec) => (
              <tr key={exec.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm text-slate-900 font-medium">
                  {exec.workflow?.name || "N/A"}
                </td>
                <td className="p-4 text-sm text-slate-700">
                  {exec.workflow?.workspace?.name || "N/A"}
                </td>
                <td className="p-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      exec.status === "SUCCESS"
                        ? "bg-green-100 text-green-800"
                        : exec.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : exec.status === "RUNNING"
                        ? "bg-blue-100 text-blue-800"
                        : exec.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {exec.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(exec.createdAt).toLocaleString()}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {exec.completedAt ? new Date(exec.completedAt).toLocaleString() : "N/A"}
                </td>
                <td className="p-4 text-sm text-red-600 max-w-xs truncate">
                  {exec.error || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
      toast.error(`Failed to load analytics: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="text-center py-8 text-slate-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Workspaces" value={analytics.overview?.totalWorkspaces || 0} />
        <StatCard title="Total Users" value={analytics.overview?.totalUsers || 0} />
        <StatCard title="Total Leads" value={analytics.overview?.totalLeads || 0} />
        <StatCard title="Total Workflows" value={analytics.overview?.totalWorkflows || 0} />
        <StatCard title="Active Subscriptions" value={analytics.overview?.activeSubscriptions || 0} />
        <StatCard title="Total Revenue" value={`₹${(analytics.overview?.totalRevenue || 0).toFixed(2)}`} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Stage */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Leads by Stage</h3>
          <div className="space-y-2">
            {analytics.leadsByStage?.map((item: any) => (
              <div key={item.stage} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.stage}</span>
                <span className="text-sm font-medium text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Users by Role</h3>
          <div className="space-y-2">
            {analytics.usersByRole?.map((item: any) => (
              <div key={item.role} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.role}</span>
                <span className="text-sm font-medium text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions by Plan */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscriptions by Plan</h3>
          <div className="space-y-2">
            {analytics.subscriptionsByPlan?.map((item: any) => (
              <div key={item.plan} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.plan}</span>
                <span className="text-sm font-medium text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscriptions by Status</h3>
          <div className="space-y-2">
            {analytics.subscriptionsByStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.status}</span>
                <span className="text-sm font-medium text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Signups</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analytics.monthlySignups?.map((item: any) => (
            <div key={item.month} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{item.month}</span>
              <span className="text-sm font-medium text-slate-900">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToastContext();

  useEffect(() => {
    loadPayments();
  }, [page]);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await getAllPayments(page, 20);
      setPayments(data.payments || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load payments:", error);
      toast.error(`Failed to load payments: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading && payments.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Workspace</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Method</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Transaction ID</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm text-slate-900 font-medium">
                  {payment.subscription?.workspace?.name || "N/A"}
                </td>
                <td className="p-4 text-sm text-slate-900 font-medium">
                  ₹{payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td className="p-4 text-sm text-slate-700">{payment.paymentMethod || "N/A"}</td>
                <td className="p-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      payment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 font-mono text-xs">
                  {payment.transactionId || "N/A"}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString()
                    : new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Plan Pricing Tab Component
function PlanPricingTab() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    individualPrice: 0,
    organizationPrice: 0,
    currency: "INR",
    billingCycle: "monthly",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PLAN_NAMES: Record<string, string> = {
    FREE: "Free",
    STARTER: "Starter",
    PROFESSIONAL: "Professional",
    BUSINESS: "Business",
    ENTERPRISE: "Enterprise",
  };

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPlanPricing();
      setPricing(data);
    } catch (error: any) {
      setError(`Failed to load plan pricing: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(planType: string) {
    const plan = pricing.find((p) => p.planType === planType);
    if (plan) {
      setEditing(planType);
      setFormData({
        individualPrice: plan.individualPrice,
        organizationPrice: plan.organizationPrice,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        isActive: plan.isActive,
      });
    }
  }

  async function handleSave(planType: string) {
    try {
      setSaving(true);
      setError(null);
      await updatePlanPricing(
        planType,
        formData.individualPrice,
        formData.organizationPrice,
        formData.currency,
        formData.billingCycle,
        formData.isActive
      );
      setError(null);
      const successMsg = `Plan pricing updated successfully for ${PLAN_NAMES[planType] || planType}`;
      setError(successMsg);
      setTimeout(() => setError(null), 5000);
      setEditing(null);
      await loadPricing();
    } catch (error: any) {
      setError(`Failed to update pricing: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader message="Loading plan pricing..." />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className={`rounded-lg border px-4 py-3 ${
          error.includes('success') || error.includes('updated')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Plan Pricing Management</h2>
        <p className="text-sm text-slate-600 mb-6">
          Manage pricing for each plan. Changes will apply to new subscriptions immediately.
        </p>

        <div className="space-y-4">
          {pricing.map((plan) => (
            <div
              key={plan.planType}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              {editing === plan.planType ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {PLAN_NAMES[plan.planType] || plan.planType}
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-600">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Individual Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.individualPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            individualPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Organization Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.organizationPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleSave(plan.planType)}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      disabled={saving}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {PLAN_NAMES[plan.planType] || plan.planType}
                      </h3>
                      {plan.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Individual:</span>{" "}
                        <span className="font-semibold text-slate-900">
                          ₹{plan.individualPrice.toLocaleString("en-IN")}
                        </span>
                        /{plan.billingCycle}
                      </div>
                      <div>
                        <span className="text-slate-600">Organization:</span>{" "}
                        <span className="font-semibold text-slate-900">
                          ₹{plan.organizationPrice.toLocaleString("en-IN")}
                        </span>
                        /{plan.billingCycle}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(plan.planType)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
