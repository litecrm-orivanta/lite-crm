import { useState } from "react";
import { apiFetch } from "@/api/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import LiteCRMLogo from "@/components/LiteCRMLogo";

type Mode = "SOLO" | "ORG";
const TEAM_SIZES = ["1", "2-10", "11-50", "51-200", "200+"];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 - OTP Verification
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 3
  const [mode, setMode] = useState<Mode | null>(null);

  // Step 4 (ORG)
  const [workspaceName, setWorkspaceName] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  async function sendOTP() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError(null);
    setSendingOTP(true);

    try {
      await apiFetch("/auth/send-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setOtpSent(true);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setSendingOTP(false);
    }
  }

  async function verifyOTP() {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Verify OTP with backend before proceeding
      await apiFetch("/auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      // OTP verified successfully, proceed to mode selection
      setOtpVerified(true);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || "Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!otpVerified) {
      setError("Please verify your email with OTP first");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload: any = { name, email, password, mode, otp }; // Include OTP for verification
      if (mode === "ORG") {
        payload.workspaceName = workspaceName;
        payload.teamSize = teamSize;
      }

      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const token = res.accessToken || res.token;
      if (!token) throw new Error("No token returned");

      signup(token, res.sessionId);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="text-sm text-slate-600 disabled:opacity-30"
          >
            ← Back
          </button>
          <div className="text-sm text-slate-500">
            Step {step} of {mode === "ORG" ? 4 : 3}
          </div>
        </div>

        <div className="flex justify-center">
          <LiteCRMLogo size="md" />
        </div>

        <h1 className="text-2xl font-semibold text-center">
          Create your account
        </h1>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                disabled={!name || !email || !password || sendingOTP}
                onClick={sendOTP}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {sendingOTP ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 - OTP Verification */}
        {step === 2 && otpSent && (
          <div className="space-y-4">
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
              />
              <p className="text-xs text-slate-500 mt-2 text-center">
                Didn't receive the code?{" "}
                <button
                  onClick={sendOTP}
                  disabled={sendingOTP}
                  className="text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            <div className="flex justify-end">
              <button
                disabled={!otp || otp.length !== 6 || loading}
                onClick={verifyOTP}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Mode Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setMode("SOLO");
                setStep(4);
              }}
              className="w-full rounded border px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="font-medium">Just for myself</div>
              <div className="text-sm text-slate-500">
                Manage my own leads
              </div>
            </button>

            <button
              onClick={() => {
                setMode("ORG");
                setStep(4);
              }}
              className="w-full rounded border px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="font-medium">Set up an organisation</div>
              <div className="text-sm text-slate-500">
                Work with a team
              </div>
            </button>
          </div>
        )}

        {/* STEP 4 — ORG */}
        {step === 4 && mode === "ORG" && (
          <div className="space-y-4">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Organisation name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />

            <select
              className="w-full rounded border px-3 py-2"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
            >
              <option value="">Team size</option>
              {TEAM_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex justify-end">
              <button
                disabled={!workspaceName || !teamSize || loading}
                onClick={submit}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — SOLO */}
        {step === 4 && mode === "SOLO" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You'll get a private workspace. You can invite teammates later.
            </p>

            <div className="flex justify-end">
              <button
                disabled={loading}
                onClick={submit}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
