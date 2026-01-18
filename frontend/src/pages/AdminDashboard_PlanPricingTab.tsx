import { useEffect, useState } from "react";
import { getAllPlanPricing, updatePlanPricing, PlanPricing } from "@/api/admin";
import { useToastContext } from "@/contexts/ToastContext";
import Loader from "@/components/Loader";

const PLAN_NAMES: Record<string, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

export default function PlanPricingTab() {
  const [pricing, setPricing] = useState<PlanPricing[]>([]);
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
  const toast = useToastContext();

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    try {
      setLoading(true);
      const data = await getAllPlanPricing();
      setPricing(data);
    } catch (error: any) {
      toast.error(`Failed to load plan pricing: ${error.message || "Unknown error"}`);
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
      await updatePlanPricing(
        planType,
        formData.individualPrice,
        formData.organizationPrice,
        formData.currency,
        formData.billingCycle,
        formData.isActive
      );
      toast.success(`Plan pricing updated successfully for ${PLAN_NAMES[planType] || planType}`);
      setEditing(null);
      await loadPricing();
    } catch (error: any) {
      toast.error(`Failed to update pricing: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader message="Loading plan pricing..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Plan Pricing Management</h2>
        <p className="text-sm text-slate-600 mb-6">
          Manage pricing for each plan. Changes will apply to new subscriptions immediately.
        </p>

        <div className="space-y-4">
          {pricing.map((plan) => (
            <div
              key={plan.id}
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
