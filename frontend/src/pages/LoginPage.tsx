import { useState } from "react";
import { apiFetch } from "@/api/apiFetch";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import LiteCRMLogo from "@/components/LiteCRMLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      login(token);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function onGoogleLogin() {
    window.location.href = "http://localhost:3000/auth/google";
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

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded border px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
