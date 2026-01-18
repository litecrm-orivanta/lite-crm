import { useState, useEffect } from "react";
import { apiFetch } from "@/api/apiFetch";
import { Link, useParams, useNavigate } from "react-router-dom";
import LiteCRMLogo from "@/components/LiteCRMLogo";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow space-y-6">
        <div className="flex justify-center">
          <LiteCRMLogo size="md" />
        </div>
        <h1 className="text-2xl font-semibold text-center">Reset Password</h1>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-600">
              Password reset successfully! Redirecting to login...
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 text-center">
              Enter your new password below.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                className="w-full rounded border px-3 py-2"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <input
                className="w-full rounded border px-3 py-2"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
