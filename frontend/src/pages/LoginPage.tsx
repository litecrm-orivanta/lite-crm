import { useState, useEffect } from "react";
import { apiFetch } from "@/api/apiFetch";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import LiteCRMLogo from "@/components/LiteCRMLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    // Check if redirected from password reset
    const state = location.state as any;
    if (state?.passwordChanged) {
      setPasswordChanged(true);
      setSuccessMessage(state.message || "Password reset successfully! Please log in with your new password.");
    }
  }, [location]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = res.accessToken || res.token;
      if (!token) throw new Error("No token returned");

      login(token, res.sessionId);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function onGoogleLogin() {
    // Use relative path so nginx can proxy to backend
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow space-y-6">
        <div className="flex justify-center">
          <LiteCRMLogo size="md" />
        </div>
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-200">
            {successMessage}
          </div>
        )}

        {passwordChanged && (
          <div className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Security Alert: Recent Password Change</p>
                <p className="mb-2">Your password was recently changed. If this was not you, please report this immediately to support or your administrator.</p>
                <a 
                  href="mailto:support@orivanta.ai" 
                  className="text-amber-900 underline font-medium hover:text-amber-950"
                >
                  Report Security Issue →
                </a>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2">
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">or</div>

        <button
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-2 rounded border py-2 text-slate-700 hover:bg-slate-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
