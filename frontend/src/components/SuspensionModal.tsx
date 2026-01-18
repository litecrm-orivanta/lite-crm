import { LiteCRMLogoIcon } from "./LiteCRMLogo";

interface SuspensionModalProps {
  isOpen: boolean;
  message?: string;
}

export default function SuspensionModal({
  isOpen,
  message = "Your account has been suspended. Please contact the administrator or support team to resolve this issue.",
}: SuspensionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scale-in border-2 border-red-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Account Suspended</h3>
              <p className="text-sm text-slate-600 mt-0.5">Access Restricted</p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-slate-700 leading-relaxed mb-4">{message}</p>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-sm font-semibold text-red-900 mb-2">What to do next:</p>
              <ul className="text-sm text-red-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">1.</span>
                  <span>Contact your workspace administrator to resolve the suspension</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">2.</span>
                  <span>Reach out to our support team for assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">3.</span>
                  <span>Once resolved, your access will be restored automatically</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Info */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500 text-center">
              This restriction has been applied by an administrator. All actions are frozen until the suspension is lifted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}