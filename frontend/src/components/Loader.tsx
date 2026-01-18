import { LiteCRMLogoIcon } from "./LiteCRMLogo";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ message = "Loading...", fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <LiteCRMLogoIcon size="lg" className="animate-spin" />
      </div>
      {message && (
        <p className="text-slate-600 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  // For inline loaders (no message), return just the icon
  if (!message) {
    return (
      <div className="flex items-center justify-center">
        <LiteCRMLogoIcon size="sm" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
