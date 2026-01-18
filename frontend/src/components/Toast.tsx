import { useEffect, useState } from "react";
import { LiteCRMLogoIcon } from "./LiteCRMLogo";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const colors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-600",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
    },
  };

  const color = colors[toast.type];
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`${color.bg} ${color.border} border rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 min-w-[320px] max-w-md transform transition-all duration-300 ease-out`}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div className={`${color.icon} text-xl font-bold flex-shrink-0 mt-0.5`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <p className={`${color.text} text-sm font-medium`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`${color.text} hover:opacity-70 text-lg font-bold flex-shrink-0`}
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: Toast["type"], message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => showToast("success", message, duration);
  const error = (message: string, duration?: number) => showToast("error", message, duration);
  const info = (message: string, duration?: number) => showToast("info", message, duration);
  const warning = (message: string, duration?: number) => showToast("warning", message, duration);

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast,
  };
}
