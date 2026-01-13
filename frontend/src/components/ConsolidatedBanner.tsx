import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/api/apiFetch";
import { getUsageStats, UsageStats } from "@/api/plan";
import { useAuth } from "@/auth/AuthContext";

interface TrialInfo {
  daysLeft: number | null;
  isTrialValid: boolean;
  plan: string;
}

export default function ConsolidatedBanner() {
  const { isSuperAdmin } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed (expires after 5 minutes)
    const dismissedKey = `banner_dismissed_timestamp`;
    const dismissedTimestamp = localStorage.getItem(dismissedKey);
    
    if (dismissedTimestamp) {
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      const now = Date.now();
      const minutesSinceDismiss = (now - dismissedTime) / (1000 * 60);
      
      // Re-show banner after 5 minutes
      if (minutesSinceDismiss < 5) {
        setDismissed(true);
      } else {
        // Expired, clear the dismissal
        localStorage.removeItem(dismissedKey);
      }
    }

    loadBannerData();
  }, []);

  async function loadBannerData() {
    try {
      const [trialData, usageData] = await Promise.all([
        apiFetch("/me/workspace").catch(() => null),
        getUsageStats().catch(() => null),
      ]);

      if (trialData) {
        setTrialInfo({
          daysLeft: trialData.daysLeft,
          isTrialValid: trialData.isTrialValid,
          plan: trialData.plan,
        });
      }

      if (usageData) {
        setUsageStats(usageData);
      }
    } catch (error) {
      console.error("Failed to load banner data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    const dismissedKey = `banner_dismissed_timestamp`;
    localStorage.setItem(dismissedKey, Date.now().toString());
    setDismissed(true);
    
    // Auto-reappear after 5 minutes
    setTimeout(() => {
      localStorage.removeItem(dismissedKey);
      setDismissed(false);
      loadBannerData(); // Refresh to check if warnings still exist
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Don't show banner for super admins
  if (isSuperAdmin) {
    return null;
  }

  if (loading || dismissed) {
    return null;
  }

  // Determine what to show
  const hasTrialWarning =
    trialInfo?.isTrialValid === true &&
    trialInfo.daysLeft !== null &&
    trialInfo.daysLeft > 0 &&
    trialInfo.daysLeft <= 3; // Show if 3 days or less

  const hasUsageWarning =
    usageStats?.warnings && Array.isArray(usageStats.warnings) && usageStats.warnings.length > 0;

  // Don't show banner if no warnings
  if (!hasTrialWarning && !hasUsageWarning) {
    return null;
  }

  // Determine banner style based on urgency
  const isUrgent =
    (hasTrialWarning && trialInfo?.daysLeft !== null && trialInfo.daysLeft <= 1) ||
    (hasUsageWarning &&
      usageStats?.warnings?.some((w) => w.includes("500%") || w.includes("400%")));

  // Build message
  const messages: string[] = [];

  if (hasTrialWarning && trialInfo) {
    if (trialInfo.daysLeft === 1) {
      messages.push("Your free trial ends tomorrow");
    } else if (trialInfo.daysLeft === 2) {
      messages.push("2 days left in your free trial");
    } else {
      messages.push(`${trialInfo.daysLeft} days left in your free trial`);
    }
  }

  if (hasUsageWarning && usageStats?.warnings) {
    // Show first 2 warnings to avoid clutter
    const warningsToShow = usageStats.warnings.slice(0, 2);
    warningsToShow.forEach((warning) => {
      messages.push(warning);
    });
    if (usageStats.warnings.length > 2) {
      messages.push(`+${usageStats.warnings.length - 2} more`);
    }
  }

  // If no messages, don't show banner
  if (messages.length === 0) {
    return null;
  }

  // Determine banner colors
  const bgColor = isUrgent
    ? "bg-gradient-to-r from-red-600 to-orange-600"
    : hasTrialWarning
    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
    : "bg-yellow-50 border-l-4 border-yellow-400";
  const textColor = isUrgent || hasTrialWarning ? "text-white" : "text-yellow-800";
  const buttonClass = isUrgent
    ? "px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm"
    : hasTrialWarning
    ? "px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
    : "px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors text-sm";

  return (
    <div className={`${bgColor} ${textColor} px-4 py-3 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          {isUrgent || hasTrialWarning ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}

          {/* Messages */}
          <div className="flex-1">
            <p className="font-medium">
              {isUrgent
                ? "Action Required"
                : hasTrialWarning
                ? "Trial Ending Soon"
                : "Usage Warning"}
            </p>
            <div className="text-sm mt-1">
              {messages.map((msg, idx) => (
                <span key={idx}>
                  {msg}
                  {idx < messages.length - 1 && " • "}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/upgrade" className={buttonClass}>
            Upgrade Plan
          </Link>
          <button
            onClick={handleDismiss}
            className={`${textColor} hover:opacity-70 transition-opacity p-1`}
            aria-label="Dismiss banner"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
