import { useState, useEffect } from "react";
import { apiFetch } from "@/api/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import LiteCRMLogo from "@/components/LiteCRMLogo";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<'link' | 'otp' | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, mode: mode || 'link' }),
      });

      if (mode === 'otp') {
        setOtpSent(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  async function resetWithOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ 
          email, 
          otp, 
          password: newPassword,
          mode: 'otp' 
        }),
      });

      setPasswordResetSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Password reset successfully! Please log in with your new password.",
            passwordChanged: true 
          } 
        });
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
        <h1 className="text-2xl font-semibold text-center">Forgot Password</h1>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && mode !== 'otp' ? (
          <div className="space-y-4">
            <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-600">
              If an account exists with this email, a password reset link has been sent. Please check your inbox.
            </div>
            <Link
              to="/login"
              className="block text-center text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : mode === null ? (
          <>
            <p className="text-sm text-slate-600 text-center">
              Choose how you'd like to reset your password:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('link')}
                className="w-full rounded border-2 border-slate-200 px-4 py-3 text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="font-medium text-slate-900">📧 Reset Link via Email</div>
                <div className="text-sm text-slate-600 mt-1">
                  We'll send you a secure link to reset your password
                </div>
              </button>

              <button
                onClick={() => setMode('otp')}
                className="w-full rounded border-2 border-slate-200 px-4 py-3 text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="font-medium text-slate-900">🔢 OTP via Email</div>
                <div className="text-sm text-slate-600 mt-1">
                  We'll send you a verification code to reset your password
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-slate-600">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        ) : passwordResetSuccess && mode === 'otp' ? (
          <div className="space-y-4">
            <div className="rounded bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">Password Reset Successful!</p>
              </div>
              <p>Your password has been changed successfully. Redirecting to login page...</p>
            </div>
          </div>
        ) : otpSent && mode === 'otp' ? (
          <form onSubmit={resetWithOTP} className="space-y-4">
            <div className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <p className="font-medium mb-1">OTP Sent!</p>
              <p>We've sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2 text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full rounded border px-3 py-2"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full rounded border px-3 py-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setOtpSent(false);
                  setOtp("");
                }}
                className="flex-1 rounded border border-slate-300 py-2 text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !otp || otp.length !== 6 || !newPassword || !confirmPassword}
                className="flex-1 rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-slate-600 text-center">
              Enter your email address and we'll {mode === 'otp' ? 'send you an OTP' : 'send you a link'} to reset your password.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                className="w-full rounded border px-3 py-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Sending…" : mode === 'otp' ? "Send OTP" : "Send Reset Link"}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-slate-600">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
