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
  AdminStats,
} from "@/api/admin";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces" | "users" | "leads" | "workflows" | "subscriptions" | "executions" | "analytics" | "payments">("overview");

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

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
      alert("Failed to load admin dashboard. Super admin access required.");
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
          <div className="text-center py-12">
            <p className="text-slate-500">Loading admin dashboard...</p>
          </div>
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
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("workspaces")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "workspaces"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Workspaces
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "leads"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "workflows"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "subscriptions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("executions")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "executions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Executions
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "analytics"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "payments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Workspaces</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.totalWorkspaces}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Active Subscriptions</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.activeSubscriptions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-slate-900">
                  ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Plans Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Plans Distribution</h2>
              <div className="space-y-3">
                {stats.plansBreakdown.map((plan) => (
                  <div key={plan.plan} className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">{plan.plan}</span>
                    <span className="text-slate-900 font-semibold">{plan.count} workspaces</span>
                  </div>
                ))}
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
                            ${payment.amount.toFixed(2)} {payment.currency}
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
      </div>
    </AppLayout>
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

  useEffect(() => {
    loadWorkspaces();
  }, [page]);

  async function loadWorkspaces() {
    try {
      setLoading(true);
      const data = await getAllWorkspaces(page, 20);
      setWorkspaces(data.workspaces || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load workspaces:", error);
      alert(`Failed to load workspaces: ${error.message || "Unknown error"}`);
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

      alert("Workspace updated successfully!");
      setEditingWorkspace(null);
      setNewPlan("");
      setNewName("");
      setNewAmount("");
      setIsManual(false);
      setAdminNotes("");
      await loadWorkspaces();
      onUpdate();
    } catch (error: any) {
      alert(`Failed to update workspace: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  if (loading && workspaces.length === 0) {
    return <div className="text-center py-8 text-slate-500">Loading workspaces...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
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
          {workspaces.map((ws) => (
            <tr key={ws.id} className="border-b border-slate-100 hover:bg-slate-50">
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
                  `$${ws.subscription?.amount?.toFixed(2) || "0.00"}`
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
      alert(`Failed to load users: ${error.message || "Unknown error"}`);
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
      alert("User updated successfully!");
      setEditingUser(null);
      setEditName("");
      setEditEmail("");
      setEditRole("");
      setEditWorkspaceId("");
      await loadUsers();
      onUpdate();
    } catch (error: any) {
      alert(`Failed to update user: ${error.message || "Unknown error"}`);
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
      alert(`Failed to load leads: ${error.message || "Unknown error"}`);
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
      alert("Lead updated successfully!");
      setEditingLead(null);
      setEditName("");
      setEditEmail("");
      setEditPhone("");
      setEditStage("");
      await loadLeads();
    } catch (error: any) {
      alert(`Failed to update lead: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteLead(leadId: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await deleteLead(leadId);
      alert("Lead deleted successfully!");
      await loadLeads();
    } catch (error: any) {
      alert(`Failed to delete lead: ${error.message || "Unknown error"}`);
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
      alert(`Failed to load workflows: ${error.message || "Unknown error"}`);
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
      alert("Workflow updated successfully!");
      setEditingWorkflow(null);
      setEditName("");
      setEditActive(false);
      await loadWorkflows();
    } catch (error: any) {
      alert(`Failed to update workflow: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteWorkflow(workflowId: string) {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await deleteWorkflow(workflowId);
      alert("Workflow deleted successfully!");
      await loadWorkflows();
    } catch (error: any) {
      alert(`Failed to delete workflow: ${error.message || "Unknown error"}`);
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

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
      alert(`Failed to load subscriptions: ${error.message || "Unknown error"}`);
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
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
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

function WorkflowExecutionsTab() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

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
      alert(`Failed to load workflow executions: ${error.message || "Unknown error"}`);
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
      alert(`Failed to load analytics: ${error.message || "Unknown error"}`);
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
      alert(`Failed to load payments: ${error.message || "Unknown error"}`);
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
