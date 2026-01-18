import { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import LiteCRMLogo from "@/components/LiteCRMLogo";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/api/payments";
import { PlanPricing } from "@/api/admin";
import { apiFetch } from "@/api/apiFetch";
import { useToastContext } from "@/contexts/ToastContext";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import OrganizationDetailsModal from "@/components/OrganizationDetailsModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { updateWorkspaceType, getWorkspaceInfo } from "@/api/workspace";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type BillingPeriod = "monthly" | "quarterly" | "yearly";
type PlanType = "individual" | "organization";

// Default plan pricing (fallback if API fails)
const DEFAULT_PLAN_PRICES = {
  individual: {
    starter: 899,
    professional: 1599,
    business: 4999,
  },
  organization: {
    starter: 1999,
    professional: 3999,
    business: 7999,
  },
};

// Discount rates
const DISCOUNTS = {
  monthly: 0.05,    // 5% off
  quarterly: 0.10,  // 10% off
  yearly: 0.20,     // 20% off
};

const INDIVIDUAL_FEATURES = [
  { label: "Unlimited Leads", starter: true, professional: true },
  { label: "Users", starter: "1", professional: "1" },
  { label: "Lead Assignment", starter: true, professional: true },
  { label: "Tasks & Follow-ups", starter: true, professional: true },
  { label: "Notes & Activity Timeline", starter: true, professional: true },
  { label: "Native Workflow Automation", starter: true, professional: true },
  { label: "Unlimited Custom Workflows", starter: true, professional: true },
  { label: "Multi-Channel Messaging", starter: true, professional: true },
  { label: "Email Templates", starter: true, professional: true },
  { label: "CSV Export & Bulk Operations", starter: true, professional: true },
  { label: "Kanban Board & Calendar View", starter: true, professional: true },
  { label: "Reports & Analytics", starter: true, professional: true },
  { label: "Email Support", starter: "48h response", professional: "24h response" },
  { label: "Priority Support", starter: false, professional: false },
];

const ORGANIZATION_FEATURES = [
  { label: "Unlimited Leads", starter: true, professional: true, business: true },
  { label: "Users", starter: "1", professional: "Up to 5", business: "Unlimited" },
  { label: "Lead Assignment", starter: true, professional: true, business: true },
  { label: "Tasks & Follow-ups", starter: true, professional: true, business: true },
  { label: "Notes & Activity Timeline", starter: true, professional: true, business: true },
  { label: "Native Workflow Automation", starter: true, professional: true, business: true },
  { label: "Unlimited Custom Workflows", starter: true, professional: true, business: true },
  { label: "Multi-Channel Messaging", starter: true, professional: true, business: true },
  { label: "Team Collaboration", starter: false, professional: true, business: true },
  { label: "Team Invites & Management", starter: false, professional: true, business: true },
  { label: "Email Templates", starter: true, professional: true, business: true },
  { label: "CSV Export & Bulk Operations", starter: true, professional: true, business: true },
  { label: "Kanban Board & Calendar View", starter: true, professional: true, business: true },
  { label: "Reports & Analytics", starter: true, professional: true, business: true },
  { label: "Email Support", starter: "48h response", professional: "24h response", business: "4h response" },
  { label: "Dedicated Workflow Instance", starter: false, professional: false, business: true },
  { label: "Priority Support", starter: false, professional: false, business: true },
];


export default function Upgrade() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [planPricing, setPlanPricing] = useState<PlanPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedPlanType, setPurchasedPlanType] = useState<string>("");
  const [workspaceType, setWorkspaceType] = useState<"individual" | "organization">("individual");
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPlanSelection, setPendingPlanSelection] = useState<{
    backendPlanType: string;
    planType: "individual" | "organization";
    totalPrice: number;
  } | null>(null);
  const [pendingWorkspaceSwitch, setPendingWorkspaceSwitch] = useState<{
    backendPlanType: string;
    totalPrice: number;
  } | null>(null);
  const toast = useToastContext();

  // Fetch dynamic pricing and workspace type from API
  useEffect(() => {
    async function loadPricing() {
      try {
        const pricing = await apiFetch<PlanPricing[]>("/plan-pricing");
        setPlanPricing(pricing);
        
        // Get workspace type to show correct features in success modal
        try {
          const workspace = await getWorkspaceInfo();
          if (workspace?.type === "ORG") {
            setWorkspaceType("organization");
          } else {
            setWorkspaceType("individual");
          }
        } catch (error) {
          // Default to individual if API fails
          console.error("Failed to load workspace info:", error);
        }
      } catch (error) {
        console.error("Failed to load plan pricing:", error);
        // Use default pricing if API fails
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  // Helper function to get price from API or fallback to default
  const getPrice = (planType: string, workspaceType: "individual" | "organization"): number => {
    const pricing = planPricing.find((p) => p.planType === planType.toUpperCase());
    if (pricing) {
      return workspaceType === "organization" ? pricing.organizationPrice : pricing.individualPrice;
    }
    // Fallback to default
    const planKey = planType.toLowerCase() as keyof typeof DEFAULT_PLAN_PRICES.individual;
    return DEFAULT_PLAN_PRICES[workspaceType][planKey] || 0;
  };

  // Get current pricing (use API data if available, otherwise defaults)
  const PLAN_PRICES = {
    individual: {
      starter: getPrice("STARTER", "individual"),
      professional: getPrice("PROFESSIONAL", "individual"),
      business: getPrice("BUSINESS", "individual"),
    },
    organization: {
      starter: getPrice("STARTER", "organization"),
      professional: getPrice("PROFESSIONAL", "organization"),
      business: getPrice("BUSINESS", "organization"),
    },
  };

  // Move openRazorpayCheckout inside component to access state setters
  async function openRazorpayCheckout(order: any, planType: string) {
    if (!order.key_id) {
      toast.error("Payment gateway configuration missing. Please contact support.");
      return;
    }

    const options = {
      key: order.key_id, // Razorpay Key ID from backend
      amount: order.amount,
      currency: order.currency,
      name: 'Lite CRM',
      description: `Subscription for ${planType} plan`,
      order_id: order.id,
      handler: async function (response: any) {
        try {
          const result = await verifyRazorpayPayment({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            environment: 'UAT',
          });
          
          // Extract plan type from verification result or order
          const activatedPlanType = result?.subscription?.planType || planType;
          setPurchasedPlanType(activatedPlanType);
          setShowSuccessModal(true);
        } catch (error: any) {
          toast.error(`Payment verification failed: ${error.message || "Unknown error"}`);
        }
      },
      prefill: {
        email: '',
        contact: '',
      },
      theme: {
        color: '#1e293b',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  // Handle plan selection with workspace type checking
  async function handlePlanSelection(
    backendPlanType: string,
    selectedPlanType: "individual" | "organization",
    totalPrice: number,
  ) {
    // Check if workspace type switch is needed
    if (selectedPlanType !== workspaceType) {
      // INDIVIDUAL → ORGANIZATION: Show org details modal
      if (selectedPlanType === "organization") {
        setPendingPlanSelection({ backendPlanType, planType: selectedPlanType, totalPrice });
        setShowOrgModal(true);
        return;
      }
      // ORGANIZATION → INDIVIDUAL: Show confirmation modal
      else {
        setPendingWorkspaceSwitch({ backendPlanType, totalPrice });
        setShowConfirmModal(true);
        return;
      }
    }

    // Proceed with payment
    try {
      const order = await createRazorpayOrder({
        amount: totalPrice,
        currency: 'INR',
        planType: backendPlanType,
        billingPeriod: billingPeriod,
        environment: 'UAT',
      });

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayCheckout(order, backendPlanType);
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(order, backendPlanType);
      }
    } catch (error: any) {
      toast.error(`Failed to initiate payment: ${error.message || "Unknown error"}`);
    }
  }

  // Handle workspace type switch confirmation (Organization → Individual)
  async function handleWorkspaceSwitchConfirm() {
    if (!pendingWorkspaceSwitch) return;

    try {
      await updateWorkspaceType({ type: "SOLO" });
      setWorkspaceType("individual");
      toast.success("Switched to Individual account");
      setShowConfirmModal(false);
      
      // Reload workspace info to refresh
      const workspace = await getWorkspaceInfo();
      if (workspace?.type === "ORG") {
        setWorkspaceType("organization");
      } else {
        setWorkspaceType("individual");
      }

      // Proceed with payment
      const order = await createRazorpayOrder({
        amount: pendingWorkspaceSwitch.totalPrice,
        currency: 'INR',
        planType: pendingWorkspaceSwitch.backendPlanType,
        billingPeriod: billingPeriod,
        environment: 'UAT',
      });

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayCheckout(order, pendingWorkspaceSwitch.backendPlanType);
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(order, pendingWorkspaceSwitch.backendPlanType);
      }

      setPendingWorkspaceSwitch(null);
    } catch (error: any) {
      toast.error(`Failed to switch workspace type: ${error.message}`);
      setShowConfirmModal(false);
      setPendingWorkspaceSwitch(null);
    }
  }

  // Handle organization details confirmation
  async function handleOrgDetailsConfirm(orgName: string, teamSize: string) {
    if (!pendingPlanSelection) return;

    try {
      // Update workspace type to ORG
      await updateWorkspaceType({
        type: "ORG",
        name: orgName,
        teamSize: teamSize,
      });
      setWorkspaceType("organization");
      toast.success("Switched to Organization account");
      setShowOrgModal(false);

      // Proceed with payment
      const order = await createRazorpayOrder({
        amount: pendingPlanSelection.totalPrice,
        currency: 'INR',
        planType: pendingPlanSelection.backendPlanType,
        billingPeriod: billingPeriod,
        environment: 'UAT',
      });

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => openRazorpayCheckout(order, pendingPlanSelection.backendPlanType);
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(order, pendingPlanSelection.backendPlanType);
      }

      setPendingPlanSelection(null);
    } catch (error: any) {
      toast.error(`Failed to update workspace: ${error.message || "Unknown error"}`);
    }
  }

  return (
    <AppLayout>
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        planType={purchasedPlanType}
        workspaceType={workspaceType}
        onClose={() => {
          setShowSuccessModal(false);
          window.location.href = '/';
        }}
      />
      <OrganizationDetailsModal
        isOpen={showOrgModal}
        onConfirm={handleOrgDetailsConfirm}
        onCancel={() => {
          setShowOrgModal(false);
          setPendingPlanSelection(null);
        }}
      />
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Switch to Individual Account"
        message="You're switching from Organization to Individual account. Your organization details will be removed. Continue?"
        confirmText="Yes, Switch"
        cancelText="Cancel"
        onConfirm={handleWorkspaceSwitchConfirm}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingWorkspaceSwitch(null);
        }}
        variant="warning"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Premium Header */}
          <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <LiteCRMLogo size="lg" />
          </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
            <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
              The most affordable CRM with unlimited leads, native automation, and self-hosted option
          </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              All plans include workflow automation, unlimited leads, and multi-channel messaging
          </p>
          {/* Current Workspace Type Badge */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className="text-sm text-slate-600">Current Account Type:</span>
              <span className="text-sm font-semibold text-slate-900 capitalize">
                {workspaceType === "individual" ? "Individual" : "Organization"}
              </span>
            </div>
          </div>
        </div>

          {/* Billing Period Selector */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl border-2 border-slate-200 bg-white p-1.5 shadow-lg">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  5% OFF
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("quarterly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "quarterly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quarterly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  10% OFF
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Individual Plans Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Individual Plans</h2>
              <p className="text-lg text-slate-600">Perfect for solo entrepreneurs and freelancers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <PlanCard
              name="Starter"
                originalPrice={PLAN_PRICES.individual.starter}
                billingPeriod={billingPeriod}
              subtitle="Perfect for individuals getting started"
              features={[
                "Unlimited leads",
                "1 user",
                  "Native workflow automation",
                  "Multi-channel messaging",
                "Tasks & follow-ups",
                  "CSV export & bulk operations",
                  "Email support (48h)",
              ]}
                cta="Get Started"
              highlight={false}
              planType="individual"
              toast={toast}
              onSelectPlan={handlePlanSelection}
            />

            <PlanCard
              name="Professional"
                originalPrice={PLAN_PRICES.individual.professional}
                billingPeriod={billingPeriod}
              subtitle="Enhanced features for professionals"
              badge="Most Popular"
              features={[
                "Everything in Starter",
                "1 user",
                  "Advanced workflow features",
                  "Priority support (24h)",
                  "Custom workflow templates",
                  "Advanced analytics",
                  "Email templates",
                ]}
                cta="Get Started"
              highlight={true}
              planType="individual"
              toast={toast}
              onSelectPlan={handlePlanSelection}
            />
            </div>
          </div>

          {/* Organization Plans Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Organization Plans</h2>
              <p className="text-lg text-slate-600">Built for teams that need collaboration and scale</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <PlanCard
                name="Starter Team"
                originalPrice={PLAN_PRICES.organization.starter}
                billingPeriod={billingPeriod}
                subtitle="Perfect for small businesses"
                features={[
                  "Unlimited leads",
                  "1 user",
                  "Native workflow automation",
                  "Multi-channel messaging",
                  "Tasks & follow-ups",
                  "CSV export & bulk operations",
                  "Email support (48h)",
                ]}
                cta="Get Started"
                highlight={false}
                planType="organization"
                toast={toast}
                onSelectPlan={handlePlanSelection}
              />

              <PlanCard
                name="Professional Team"
                originalPrice={PLAN_PRICES.organization.professional}
                billingPeriod={billingPeriod}
                subtitle="Best for growing teams"
                badge="Most Popular"
                features={[
                  "Everything in Starter Team",
                  "Up to 5 users",
                  "Team collaboration",
                  "Team invites & management",
                  "Priority support (24h)",
                  "Shared workflows",
                  "Advanced analytics",
                ]}
                cta="Get Started"
                highlight={true}
                planType="organization"
                toast={toast}
                onSelectPlan={handlePlanSelection}
            />

            <PlanCard
              name="Business"
                originalPrice={PLAN_PRICES.organization.business}
                billingPeriod={billingPeriod}
                subtitle="For serious sales teams"
              features={[
                  "Everything in Professional Team",
                  "Unlimited users",
                  "Dedicated workflow instance",
                  "Priority support (4h)",
                  "Custom integrations",
                  "Advanced analytics",
                  "API access",
                ]}
                cta="Get Started"
              highlight={false}
                planType="organization"
              toast={toast}
              onSelectPlan={handlePlanSelection}
            />
            </div>
          </div>

          {/* Feature Comparison Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Individual Features */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Individual Plans Features</h3>
              </div>
              <div className="overflow-x-auto">
            <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Professional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INDIVIDUAL_FEATURES.map((f, idx) => (
                  <tr key={f.label} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                    <FeatureCell value={f.starter} />
                    <FeatureCell value={f.professional} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            {/* Organization Features */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Organization Plans Features</h3>
          </div>
              <div className="overflow-x-auto">
            <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Professional</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ORGANIZATION_FEATURES.map((f, idx) => (
                  <tr key={f.label} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                    <FeatureCell value={f.starter} />
                    <FeatureCell value={f.professional} highlight />
                    <FeatureCell value={f.business} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ---------- COMPONENTS ---------- */

type ToastApi = {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
};

function PlanCard({
  name,
  originalPrice,
  billingPeriod,
  subtitle,
  badge,
  features,
  cta,
  highlight,
  planType,
  toast,
  onSelectPlan,
}: {
  name: string;
  originalPrice: number;
  billingPeriod: BillingPeriod;
  subtitle: string;
  badge?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  planType: PlanType;
  toast: ToastApi;
  onSelectPlan: (backendPlanType: string, planType: PlanType, totalPrice: number) => Promise<void>;
}) {
  const discount = DISCOUNTS[billingPeriod];
  let discountedPrice: number;
  let totalPrice: number;
  let monthlyEquivalent: number;
  let savings: number;
  let originalTotal: number;

  if (billingPeriod === "monthly") {
    discountedPrice = originalPrice * (1 - discount);
    totalPrice = discountedPrice;
    monthlyEquivalent = discountedPrice;
    savings = originalPrice - discountedPrice;
    originalTotal = originalPrice;
  } else if (billingPeriod === "quarterly") {
    originalTotal = originalPrice * 3;
    totalPrice = originalTotal * (1 - discount);
    monthlyEquivalent = totalPrice / 3;
    savings = originalTotal - totalPrice;
  } else {
    // yearly
    originalTotal = originalPrice * 12;
    totalPrice = originalTotal * (1 - discount);
    monthlyEquivalent = totalPrice / 12;
    savings = originalTotal - totalPrice;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`relative rounded-xl border-2 p-6 bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        highlight
          ? "border-blue-500 shadow-blue-100 scale-[1.02] ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {badge}
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {billingPeriod !== "monthly" && (
        <div className="absolute -top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {billingPeriod === "quarterly" ? "10% OFF" : "20% OFF"}
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <h3 className="text-2xl font-bold text-slate-900 mb-1.5">{name}</h3>
        <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
        
        {/* Pricing Display */}
        <div className="mb-4">
          {billingPeriod === "monthly" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-2xl text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
                <span className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(discountedPrice)}
                </span>
              </div>
              <span className="text-slate-500 text-sm">/month</span>
              <span className="text-green-600 text-sm font-semibold">
                Save {formatPrice(savings)}/month
              </span>
            </div>
          ) : billingPeriod === "quarterly" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(originalTotal)}
                </span>
                <span className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <span className="text-slate-700 text-lg font-semibold">
                {formatPrice(monthlyEquivalent)}/month
              </span>
              <span className="text-slate-500 text-xs">
                Billed quarterly • Save {formatPrice(savings)}
              </span>
            </div>
          ) : (
            // yearly
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(originalTotal)}
                </span>
                <span className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <span className="text-slate-700 text-lg font-semibold">
                {formatPrice(monthlyEquivalent)}/month
              </span>
              <span className="text-slate-500 text-xs">
                Billed annually • Save {formatPrice(savings)}
              </span>
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-2.5 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={async () => {
          try {
            // Map plan name to backend plan type
            let backendPlanType = 'STARTER';
            if (name.toLowerCase().includes('professional')) {
              backendPlanType = 'PROFESSIONAL';
            } else if (name.toLowerCase().includes('business')) {
              backendPlanType = 'BUSINESS';
            }

            // Call onSelectPlan with plan details - this will handle workspace type checking
            await onSelectPlan(backendPlanType, planType, totalPrice);
          } catch (error: any) {
            toast.error(`Failed to initiate payment: ${error.message || "Unknown error"}`);
          }
        }}
        className={`block w-full text-center py-3 px-4 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
          highlight
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            : "bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function FeatureCell({
  value,
  highlight,
}: {
  value?: boolean | string;
  highlight?: boolean;
}) {
  const baseClasses = `px-6 py-3 text-center ${highlight ? "bg-blue-50" : ""}`;
  
  if (value === true) {
    return (
      <td className={baseClasses}>
        <svg
          className="w-6 h-6 text-green-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className={baseClasses}>
        <span className="text-slate-300 text-xl">—</span>
      </td>
    );
  }
  return (
    <td className={`${baseClasses} font-semibold text-slate-700`}>{value}</td>
  );
}
