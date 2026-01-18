import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { getMySubscription, cancelSubscription, Subscription, getPlanDetails, PlanDetails } from "@/api/subscriptions";
import { getMyPayments, Payment } from "@/api/payments";
import { getMyInvoices, Invoice } from "@/api/invoices";
import { useToastContext } from "@/contexts/ToastContext";
import CancelSubscriptionModal from "@/components/CancelSubscriptionModal";
import { getWorkspaceInfo } from "@/api/workspace";

const PLAN_TYPES = ["FREE", "STARTER", "PROFESSIONAL", "BUSINESS"];

// Plan pricing mapping
const PLAN_PRICING: Record<string, { individual: number; organization: number }> = {
  FREE: { individual: 0, organization: 0 },
  STARTER: { individual: 899, organization: 1999 },
  PROFESSIONAL: { individual: 1599, organization: 3999 },
  BUSINESS: { individual: 0, organization: 7999 }, // Business only for organizations
};

export default function BillingPage() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workspaceType, setWorkspaceType] = useState<"individual" | "organization">("individual");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscription" | "payments" | "invoices">("subscription");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [subData, paymentsData, invoicesData, workspaceData] = await Promise.all([
        getMySubscription(),
        getMyPayments(),
        getMyInvoices(),
        getWorkspaceInfo().catch(() => null),
      ]);
      setSubscription(subData);
      setPayments(paymentsData);
      setInvoices(invoicesData);
      if (workspaceData?.type === "ORG") {
        setWorkspaceType("organization");
      } else {
        setWorkspaceType("individual");
      }
    } catch (error) {
      console.error("Failed to load billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }

  function handleUpgrade(planType: string) {
    // Redirect to upgrade page instead of directly upgrading
    navigate("/upgrade");
  }

  function handleCancel() {
    setShowCancelModal(true);
  }

  async function handleConfirmCancel(reason: string) {
    try {
      await cancelSubscription(reason || undefined);
      await loadData();
      toast.success("Subscription cancelled successfully");
    } catch (error: any) {
      toast.error(`Failed to cancel subscription: ${error.message || "Unknown error"}`);
      throw error;
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Loading billing information...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Manage your subscription, payments, and invoices</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("subscription")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "subscription"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Subscription
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

        {/* Subscription Tab */}
        {activeTab === "subscription" && subscription && (
          <SubscriptionTab
            subscription={subscription}
            workspaceType={workspaceType}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
          />
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

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </AppLayout>
  );
}

function SubscriptionTab({
  subscription,
  workspaceType,
  onUpgrade,
  onCancel,
}: {
  subscription: Subscription;
  workspaceType: "individual" | "organization";
  onUpgrade: (planType: string) => void;
  onCancel: () => void;
}) {
  const [planDetails, setPlanDetails] = useState<Record<string, PlanDetails>>({});
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadPlanDetails();
  }, []);

  async function loadPlanDetails() {
    try {
      const details: Record<string, PlanDetails> = {};
      for (const planType of PLAN_TYPES) {
        try {
          details[planType] = await getPlanDetails(planType);
        } catch (error) {
          console.error(`Failed to load plan details for ${planType}:`, error);
        }
      }
      setPlanDetails(details);
    } catch (error) {
      console.error("Failed to load plan details:", error);
    } finally {
      setLoadingPlans(false);
    }
  }

  const currentPlan = planDetails[subscription.planType] || {
    name: subscription.planType,
    amount: subscription.amount,
    features: {},
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Current Plan</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{currentPlan.name}</h3>
              <p className="text-sm text-slate-600">
                {subscription.amount > 0
                  ? `${formatPrice(subscription.amount)}/${subscription.billingCycle || "month"}`
                  : "Free Plan"}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : subscription.status === "TRIAL"
                    ? "bg-blue-100 text-blue-800"
                    : subscription.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {subscription.status}
              </span>
            </div>
          </div>
          {subscription.endDate && (
            <p className="text-sm text-slate-600">
              {subscription.status === "CANCELLED"
                ? `Cancelled on ${new Date(subscription.cancelledAt || "").toLocaleDateString()}`
                : `Renews on ${new Date(subscription.endDate).toLocaleDateString()}`}
            </p>
          )}
          {subscription.isManual && (
            <p className="text-sm text-blue-600">This plan was manually assigned by an admin</p>
          )}
        </div>
      </div>

      {/* Available Plans for Current Workspace Type */}
      {!loadingPlans && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Available Plans for {workspaceType === "individual" ? "Individual" : "Organization"} Account
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm">
              <span className="text-slate-600">Current Type:</span>
              <span className="font-semibold text-slate-900 capitalize">{workspaceType}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAN_TYPES.map((planType) => {
              const plan = planDetails[planType];
              if (!plan) return null;

              const isCurrent = subscription.planType === planType;
              const isUpgrade = PLAN_TYPES.indexOf(planType) > PLAN_TYPES.indexOf(subscription.planType);
              const pricing = PLAN_PRICING[planType];
              const displayPrice = workspaceType === "organization" 
                ? (pricing?.organization || plan.amount)
                : (pricing?.individual || plan.amount);
              
              // Determine if plan belongs to current workspace type
              const isCurrentTypePlan = (planType === "BUSINESS" && workspaceType === "organization") ||
                (planType !== "BUSINESS" && true); // STARTER, PROFESSIONAL work for both
              
              // Filter: Only show BUSINESS for organization type, show others for both
              if (planType === "BUSINESS" && workspaceType === "individual") {
                return null; // Don't show BUSINESS plan for individual workspace
              }

              return (
                <div
                  key={planType}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-4">
                    {displayPrice > 0 ? formatPrice(displayPrice) : "Free"}
                    {displayPrice > 0 && <span className="text-sm font-normal text-slate-600">/mo</span>}
                  </p>
                  <ul className="space-y-2 mb-4 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      {plan.features.maxLeads === -1 ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Unlimited Leads</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4"></span>
                          <span>{plan.features.maxLeads} Leads</span>
                        </>
                      )}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4"></span>
                      <span>
                        {plan.features.maxUsers === -1 ? "Unlimited" : plan.features.maxUsers} Users
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.features.workflows ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Workflows</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4"></span>
                          <span className="text-slate-400">Workflows</span>
                        </>
                      )}
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.features.integrations ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Integrations</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4"></span>
                          <span className="text-slate-400">Integrations</span>
                        </>
                      )}
                    </li>
                  </ul>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpgrade(planType)}
                      disabled={!isUpgrade}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        isUpgrade
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {isUpgrade ? "Upgrade" : "Downgrade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans for Other Workspace Type */}
      {!loadingPlans && (
        <div className="bg-slate-50 p-6 rounded-xl shadow-sm border-2 border-dashed border-slate-300 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {workspaceType === "individual" 
                ? "Switching to Organization? Check out these plans..." 
                : "Switching to Individual? Check out these plans..."}
            </h2>
            <p className="text-sm text-slate-600">
              {workspaceType === "individual"
                ? "Organization plans offer team collaboration, user management, and advanced features."
                : "Individual plans are perfect for solo entrepreneurs with essential CRM features."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAN_TYPES.filter(planType => {
              // Show opposite type plans
              if (workspaceType === "individual") {
                // For individual, show organization plans (but not BUSINESS in this section, it's shown above if applicable)
                return planType !== "BUSINESS"; // BUSINESS already shown above for organization
              } else {
                // For organization, show individual plans (STARTER, PROFESSIONAL)
                return planType !== "BUSINESS" && planType !== "FREE";
              }
            }).map((planType) => {
              const plan = planDetails[planType];
              if (!plan) return null;

              const pricing = PLAN_PRICING[planType];
              const displayPrice = workspaceType === "individual"
                ? (pricing?.organization || plan.amount)
                : (pricing?.individual || plan.amount);

              return (
                <div
                  key={planType}
                  className="p-4 rounded-lg border-2 border-slate-300 bg-white hover:border-slate-400 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-4">
                    {displayPrice > 0 ? formatPrice(displayPrice) : "Free"}
                    {displayPrice > 0 && <span className="text-sm font-normal text-slate-600">/mo</span>}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    {workspaceType === "individual"
                      ? "Includes team collaboration and user management features."
                      : "Perfect for solo entrepreneurs with essential CRM features."}
                  </p>
                  <button
                    onClick={() => onUpgrade(planType)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View on Upgrade Page
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {subscription.status === "ACTIVE" && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">Cancel Subscription</h3>
          <p className="text-sm text-red-700 mb-3">
            Cancelling your subscription will stop automatic renewals. You'll retain access until the end of your billing period.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "INR" || currency === "₹") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(price);
    }
    return `${currency} ${price.toFixed(2)}`;
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center py-12">
        <p className="text-slate-500">No payment history found</p>
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
                {formatPrice(payment.amount, payment.currency)}
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

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "INR" || currency === "₹") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(price);
    }
    return `${currency} ${price.toFixed(2)}`;
  };

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
            <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-900 font-medium font-mono">
                {invoice.invoiceNumber}
              </td>
              <td className="p-4 text-sm text-slate-900 font-medium">
                {formatPrice(invoice.amount, invoice.currency)}
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
              <td className="p-4 text-sm">
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
