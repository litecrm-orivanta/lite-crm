import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import LiteCRMLogo from "@/components/LiteCRMLogo";
import ConsolidatedBanner from "@/components/ConsolidatedBanner";
import { getUnreadCount } from "@/api/notifications";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { email, role, isSuperAdmin, logout, token } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastInteractionRef = useRef(Date.now());

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-slate-900 font-medium"
      : "text-slate-600 hover:text-slate-900";

  useEffect(() => {
    if (!token) return;
    getUnreadCount()
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => setUnreadCount(0));
  }, [location.pathname, token]);

  useEffect(() => {
    if (!token) return;

    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
    };
    window.addEventListener("click", updateInteraction);
    window.addEventListener("keydown", updateInteraction);
    window.addEventListener("mousemove", updateInteraction);

    const interval = setInterval(() => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) return;
      const idleMs = Date.now() - lastInteractionRef.current;
      if (idleMs > 60000) return;
      fetch("/api/auth/session/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }, 60000);

    return () => {
      window.removeEventListener("click", updateInteraction);
      window.removeEventListener("keydown", updateInteraction);
      window.removeEventListener("mousemove", updateInteraction);
      clearInterval(interval);
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-100">
      <ConsolidatedBanner />
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hover:opacity-90 transition-opacity"
            >
              <LiteCRMLogo size="md" />
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              {isSuperAdmin ? (
                // Super Admin Navigation - Dedicated Admin Interface
                <>
                  <Link to="/admin" className={isActive("/admin")}>
                    Super Admin
                  </Link>
                  <Link to="/settings" className={isActive("/settings")}>
                    Settings
                  </Link>
                  <Link to="/notifications" className={isActive("/notifications")}>
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1 rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/docs" className={isActive("/docs")}>
                    Docs
                  </Link>
                </>
              ) : (
                // Regular User Navigation
                <>
                  <Link to="/" className={isActive("/")}>
                    Dashboard
                  </Link>

                  <Link to="/kanban" className={isActive("/kanban")}>
                    Pipeline
                  </Link>

                  <Link to="/calendar" className={isActive("/calendar")}>
                    Calendar
                  </Link>

                  <Link to="/reports" className={isActive("/reports")}>
                    Reports
                  </Link>

                  <Link to="/workflows" className={isActive("/workflows")}>
                    Workflows
                  </Link>

                  {role === "ADMIN" && (
                    <Link to="/team" className={isActive("/team")}>
                      Team
                    </Link>
                  )}

                  {role === "ADMIN" && !isSuperAdmin && (
                    <Link to="/workspace-admin" className={isActive("/workspace-admin")}>
                      Workspace Admin
                    </Link>
                  )}

                  <Link to="/billing" className={isActive("/billing")}>
                    Billing
                  </Link>

                  <Link to="/settings" className={isActive("/settings")}>
                    Settings
                  </Link>
                  <Link to="/notifications" className={isActive("/notifications")}>
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1 rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link to="/docs" className={isActive("/docs")}>
                    Docs
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{email}</span>
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
