import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/auth/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { apiFetch } from "@/api/apiFetch";
import { useToastContext } from "@/contexts/ToastContext";

export default function WorkspaceAdminDashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "payments" | "invoices">("overview");
  const toast = useToastContext();

  useEffect(() => {
    if (role === "ADMIN") {
      loadData();
    }
  }, [role]);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, usersData, paymentsData, invoicesData] = await Promise.all([
        apiFetch("/workspace-admin/stats"),
        apiFetch("/workspace-admin/users"),
        apiFetch("/workspace-admin/payments"),
        apiFetch("/workspace-admin/invoices"),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Failed to load workspace admin data:", error);
      toast.error("Failed to load workspace admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // Redirect non-admins
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Loading workspace admin dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Workspace Admin</h1>
          <p className="text-slate-600">Manage your workspace: users, payments, and invoices</p>
          <p className="text-sm text-blue-600 mt-2">
            💡 To upgrade your plan, go to <Link to="/upgrade" className="underline font-semibold hover:text-blue-800">Upgrade</Link> page.
          </p>
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
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "payments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "invoices"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Invoices
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Workspace Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Workspace Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Workspace Name</p>
                  <p className="text-lg font-semibold text-slate-900">{stats.workspace?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Plan</p>
                  <p className="text-lg font-semibold text-slate-900">{stats.workspace?.plan || "FREE"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="text-lg font-semibold text-slate-900">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      stats.subscription?.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : stats.subscription?.status === "TRIAL"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                      {stats.subscription?.status || "TRIAL"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {stats.subscription?.amount 
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(stats.subscription.amount)
                      : "₹0"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Users</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.stats?.users || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Leads</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.stats?.leads || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Workflows</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.stats?.workflows || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Integrations</h3>
                <p className="text-3xl font-bold text-slate-900">{stats.stats?.integrations || 0}</p>
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
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Amount</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Status</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments.slice(0, 5).map((payment: any) => (
                        <tr key={payment.id} className="border-b border-slate-100">
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Leads</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-900 font-medium">{user.name || "N/A"}</td>
                    <td className="p-4 text-sm text-slate-700">{user.email}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{user._count?.leads || 0}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <PaymentsTab payments={payments} />
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <InvoicesTab invoices={invoices} />
        )}
      </div>
    </AppLayout>
  );
}

function PaymentsTab({ payments }: { payments: any[] }) {
  if (payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center py-12">
        <p className="text-slate-500">No payments found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
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
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: payment.currency === "USD" ? "INR" : (payment.currency || "INR"),
                  maximumFractionDigits: 2,
                }).format(payment.amount)}
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
  );
}

function InvoicesTab({ invoices }: { invoices: any[] }) {
  if (invoices.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center py-12">
        <p className="text-slate-500">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Invoice #</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Due Date</th>
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-900 font-medium font-mono">
                {invoice.invoiceNumber}
              </td>
              <td className="p-4 text-sm text-slate-900 font-medium">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: invoice.currency === "USD" ? "INR" : (invoice.currency || "INR"),
                  maximumFractionDigits: 2,
                }).format(invoice.amount)}
              </td>
              <td className="p-4 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    invoice.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "SENT"
                      ? "bg-blue-100 text-blue-800"
                      : invoice.status === "OVERDUE"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="p-4 text-sm text-slate-600">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
              </td>
              <td className="p-4 text-sm text-slate-600">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
