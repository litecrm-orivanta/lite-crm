import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicInvite } from "@/api/invites";
import { apiFetch } from "@/api/apiFetch";
import { useAuth } from "@/auth/AuthContext";

export default function AcceptInvite() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) return;

    getPublicInvite(inviteId)
      .then((i) => {
        setEmail(i.email);
        setRole(i.role);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Invalid or expired invite");
        setLoading(false);
      });
  }, [inviteId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          mode: "INVITE",
          inviteId,
        }),
      });

      signup(res.accessToken);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invite acceptance failed");
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading invite…</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          Join your team
        </h1>

        <p className="text-sm text-slate-600 text-center">
          Invited as <b>{role}</b>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2 bg-slate-100"
            value={email}
            disabled
          />

          <input
            className="w-full rounded border px-3 py-2"
            type="password"
            placeholder="Set password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full rounded bg-slate-900 py-2 text-white">
            Accept Invite
          </button>
        </form>
      </div>
    </div>
  );
}
