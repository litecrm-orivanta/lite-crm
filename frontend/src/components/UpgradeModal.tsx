import { useNavigate } from "react-router-dom";
import { LiteCRMLogoIcon } from "./LiteCRMLogo";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  feature?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  feature,
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <LiteCRMLogoIcon size="sm" className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              {feature && (
                <p className="text-sm text-slate-600">Feature: {feature}</p>
              )}
            </div>
          </div>

          {/* Message */}
          <p className="text-slate-700 mb-6 leading-relaxed">{message}</p>

          {/* Features highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-2">Upgrade to unlock:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Unlimited leads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>More team members</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                <span>Advanced features</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                navigate("/upgrade");
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
