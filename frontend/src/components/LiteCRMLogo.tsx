interface LiteCRMLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LiteCRMLogo({ className = "", size = "md" }: LiteCRMLogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        className={sizeMap[size]}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="24" fill="url(#gradient)" />
        {/* Letter L */}
        <path
          d="M16 14V34H20V18H28V14H16Z"
          fill="white"
        />
        {/* Letter C (simplified) */}
        <path
          d="M30 18C30 16.9 30.9 16 32 16C33.1 16 34 16.9 34 18V26C34 27.1 33.1 28 32 28C30.9 28 30 27.1 30 26V22H32V26H32C32 26.6 32.4 27 33 27C33.6 27 34 26.6 34 26V18C34 17.4 33.6 17 33 17C32.4 17 32 17.4 32 18V20H30V18Z"
          fill="white"
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-slate-900 text-lg">Lite CRM</span>
    </div>
  );
}

// Logo icon only (without text)
export function LiteCRMLogoIcon({ className = "", size = "md" }: LiteCRMLogoProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="url(#logoGradient)" />
      <path
        d="M16 14V34H20V18H28V14H16Z"
        fill="white"
      />
      <path
        d="M30 18C30 16.9 30.9 16 32 16C33.1 16 34 16.9 34 18V26C34 27.1 33.1 28 32 28C30.9 28 30 27.1 30 26V22H32V26H32C32 26.6 32.4 27 33 27C33.6 27 34 26.6 34 26V18C34 17.4 33.6 17 33 17C32.4 17 32 17.4 32 18V20H30V18Z"
        fill="white"
      />
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
