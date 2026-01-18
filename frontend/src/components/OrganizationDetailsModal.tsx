import { useState } from "react";

interface OrganizationDetailsModalProps {
  isOpen: boolean;
  onConfirm: (orgName: string, teamSize: string) => Promise<void>;
  onCancel: () => void;
}

const TEAM_SIZES = ["1-5", "6-10", "11-25", "26-50", "51-100", "100+"];

export default function OrganizationDetailsModal({
  isOpen,
  onConfirm,
  onCancel,
}: OrganizationDetailsModalProps) {
  const [orgName, setOrgName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ orgName?: string; teamSize?: string }>({});

  if (!isOpen) return null;

  function validate() {
    const newErrors: { orgName?: string; teamSize?: string } = {};
    if (!orgName.trim()) {
      newErrors.orgName = "Organization name is required";
    }
    if (!teamSize) {
      newErrors.teamSize = "Team size is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleConfirm() {
    if (!validate()) return;

    setLoading(true);
    try {
      await onConfirm(orgName.trim(), teamSize);
    } catch (error) {
      console.error("Failed to update workspace:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all animate-scale-in">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Switch to Organization</h3>
          <p className="text-slate-600 text-center">
            Please provide your organization details to switch from Individual to Organization account.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
                if (errors.orgName) setErrors({ ...errors, orgName: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.orgName ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Enter organization name"
              disabled={loading}
            />
            {errors.orgName && (
              <p className="text-red-500 text-xs mt-1">{errors.orgName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Team Size <span className="text-red-500">*</span>
            </label>
            <select
              value={teamSize}
              onChange={(e) => {
                setTeamSize(e.target.value);
                if (errors.teamSize) setErrors({ ...errors, teamSize: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.teamSize ? "border-red-500" : "border-slate-300"
              }`}
              disabled={loading}
            >
              <option value="">Select team size</option>
              {TEAM_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            {errors.teamSize && (
              <p className="text-red-500 text-xs mt-1">{errors.teamSize}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !orgName.trim() || !teamSize}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Updating..." : "Confirm & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

