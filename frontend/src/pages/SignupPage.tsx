import { useState } from "react";
import { apiFetch } from "@/api/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import LiteCRMLogo from "@/components/LiteCRMLogo";

type Mode = "SOLO" | "ORG";
type N8nInstanceType = "SHARED" | "DEDICATED";
const TEAM_SIZES = ["1", "2-10", "11-50", "51-200", "200+"];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [mode, setMode] = useState<Mode | null>(null);

  // Step 3 (ORG)
  const [workspaceName, setWorkspaceName] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 4 (n8n instance type)
  const [n8nInstanceType, setN8nInstanceType] = useState<N8nInstanceType>("SHARED");
  const [showDedicatedWarning, setShowDedicatedWarning] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const payload: any = { name, email, password, mode, n8nInstanceType };
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

      signup(token);
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
                disabled={!name || !email || !password}
                onClick={() => setStep(2)}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setMode("SOLO");
                setStep(3);
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
                setStep(3);
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

        {/* STEP 3 — ORG */}
        {step === 3 && mode === "ORG" && (
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
                onClick={() => setStep(4)}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — SOLO */}
        {step === 3 && mode === "SOLO" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You'll get a private workspace. You can invite teammates later.
            </p>

            <div className="flex justify-end">
              <button
                disabled={loading}
                onClick={() => setStep(4)}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — n8n Instance Type Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-medium mb-2">Workflow Automation Setup</h2>
              <p className="text-sm text-slate-600 mb-4">
                Choose how workflows will be managed for your workspace.
              </p>
            </div>

            {/* SHARED Option (Default) */}
            <button
              onClick={() => {
                setN8nInstanceType("SHARED");
                setShowDedicatedWarning(false);
              }}
              className={`w-full rounded border px-4 py-3 text-left transition ${
                n8nInstanceType === "SHARED"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <input
                      type="radio"
                      checked={n8nInstanceType === "SHARED"}
                      onChange={() => {
                        setN8nInstanceType("SHARED");
                        setShowDedicatedWarning(false);
                      }}
                      className="text-blue-600"
                    />
                    Shared Instance (Recommended)
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Cost-effective shared workflow engine with user isolation
                  </div>
                </div>
              </div>
            </button>

            {/* DEDICATED Option */}
            <button
              onClick={() => {
                setN8nInstanceType("DEDICATED");
                setShowDedicatedWarning(true);
              }}
              className={`w-full rounded border px-4 py-3 text-left transition ${
                n8nInstanceType === "DEDICATED"
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <input
                      type="radio"
                      checked={n8nInstanceType === "DEDICATED"}
                      onChange={() => {
                        setN8nInstanceType("DEDICATED");
                        setShowDedicatedWarning(true);
                      }}
                      className="text-orange-600"
                    />
                    Dedicated Instance
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Your own isolated workflow engine (Enterprise only)
                  </div>
                </div>
              </div>
            </button>

            {/* Warning for DEDICATED (non-enterprise) */}
            {showDedicatedWarning && n8nInstanceType === "DEDICATED" && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-orange-600 text-xl">⚠️</div>
                  <div className="flex-1">
                    <div className="font-medium text-orange-900 mb-1">
                      Increased Pricing Notice
                    </div>
                    <div className="text-sm text-orange-800">
                      Dedicated instances require additional infrastructure resources
                      and will incur higher costs. This option is recommended for
                      Enterprise/Business accounts only.
                    </div>
                    <div className="text-xs text-orange-700 mt-2">
                      💡 You can change this setting later, but it may require
                      migration.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStep(step - 1)}
                className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
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
