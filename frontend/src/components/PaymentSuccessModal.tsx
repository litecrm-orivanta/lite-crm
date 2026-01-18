import { Link } from "react-router-dom";
import LiteCRMLogo from "./LiteCRMLogo";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  planType: string; // e.g., "STARTER", "PROFESSIONAL", "BUSINESS"
  workspaceType?: "individual" | "organization";
  onClose: () => void;
}

// Features based on plan type
const PLAN_FEATURES: Record<string, { label: string; starter?: boolean | string; professional?: boolean | string; business?: boolean | string }[]> = {
  individual: [
    { label: "Unlimited Leads", starter: true, professional: true },
    { label: "1 User", starter: true, professional: true },
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
  ],
  organization: [
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
  ],
};

export default function PaymentSuccessModal({
  isOpen,
  planType,
  workspaceType = "individual",
  onClose,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const normalizedPlanType = planType.toUpperCase();
  const features = PLAN_FEATURES[workspaceType] || PLAN_FEATURES.individual;
  
  // Get features that are enabled for this plan
  const enabledFeatures = features.filter((feature) => {
    const planKey = normalizedPlanType.toLowerCase() as "starter" | "professional" | "business";
    return feature[planKey] === true || (typeof feature[planKey] === "string" && feature[planKey] !== "");
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-xl text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
          <p className="text-lg opacity-90">
            Your payment was successful and your <span className="font-semibold">{planType}</span> plan has been activated!
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-slate-700 mb-6 text-center text-lg">
            Enjoy these features hassle-free:
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {enabledFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-slate-700 font-medium text-sm">
                  {feature.label}
                  {typeof feature[normalizedPlanType.toLowerCase() as "starter" | "professional" | "business"] === "string" && (
                    <span className="text-slate-500 ml-1">
                      ({feature[normalizedPlanType.toLowerCase() as "starter" | "professional" | "business"]})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-4 border-t border-slate-200">
            <Link
              to="/"
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
