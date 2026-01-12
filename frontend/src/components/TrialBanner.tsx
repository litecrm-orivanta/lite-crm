import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/api/apiFetch";

export default function TrialBanner() {
  const [trialInfo, setTrialInfo] = useState<{
    daysLeft: number | null;
    isTrialValid: boolean;
    plan: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrialInfo() {
      try {
        const data = await apiFetch("/me/workspace");
        console.log("Trial info loaded:", data);
        setTrialInfo({
          daysLeft: data.daysLeft,
          isTrialValid: data.isTrialValid,
          plan: data.plan,
        });
      } catch (err) {
        console.error("Failed to load trial info:", err);
        // Don't hide banner on error - try to show something
      } finally {
        setLoading(false);
      }
    }
    loadTrialInfo();
  }, []);

  if (loading) {
    return null;
  }

  // Show banner if trial info exists and is valid
  if (!trialInfo) {
    return null;
  }

  // Only show banner if trial is active and has days left
  if (!trialInfo.isTrialValid || trialInfo.daysLeft === null || trialInfo.daysLeft <= 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">
            {trialInfo.daysLeft === 1 
              ? "1 day left in your free trial"
              : `${trialInfo.daysLeft} days left in your free trial`
            }
          </span>
        </div>
        <Link
          to="/upgrade"
          className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
        >
          Make Payment
        </Link>
      </div>
    </div>
  );
}
