import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsageStats, UsageStats } from "@/api/plan";

export default function UsageWarningBanner() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  async function loadUsageStats() {
    try {
      const stats = await getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !usageStats) {
    return null;
  }

  // Only show if there are warnings (80% threshold)
  if (!usageStats.warnings || usageStats.warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Usage Warning</p>
            <ul className="text-sm text-yellow-700 mt-1">
              {usageStats.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          to="/billing"
          className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
