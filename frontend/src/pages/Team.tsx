import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { listUsers, User } from "@/api/users";
import { listInvites, createInvite, revokeInvite, Invite } from "@/api/invites";
import { getMySubscription } from "@/api/subscriptions";
import { useToastContext } from "@/contexts/ToastContext";
import { useDialogContext } from "@/contexts/DialogContext";
import UpgradeModal from "@/components/UpgradeModal";

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const toast = useToastContext();
  const dialog = useDialogContext();

  async function loadAll() {
    try {
      const [u, i, sub] = await Promise.all([
        listUsers(),
        listInvites(),
        getMySubscription().catch(() => null),
      ]);
      setUsers(u);
      setInvites(i);
      setSubscription(sub);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    try {
      // Check user limit before inviting
      const planType = subscription?.planType || "FREE";
      const maxUsers = planType === "STARTER" ? 1 : planType === "PROFESSIONAL" ? 5 : planType === "BUSINESS" || planType === "ENTERPRISE" ? Infinity : 1;
      
      if (maxUsers !== Infinity && users.length >= maxUsers) {
        setShowUpgradeModal(true);
        return;
      }

      await createInvite(email, role);
      toast.success("Invite sent successfully!");
      setEmail("");
      setRole("MEMBER");
      loadAll();
    } catch (err: any) {
      if (err?.message?.includes("upgrade")) {
        setShowUpgradeModal(true);
      } else {
        toast.error(err?.message || "Failed to send invite");
      }
    }
  }

  async function revoke(id: string) {
    const confirmed = await dialog.confirm({
      title: "Revoke Invite",
      message: "Revoke this invite?",
      confirmText: "Revoke",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await revokeInvite(id);
      toast.success("Invite revoked successfully");
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || "Failed to revoke invite");
    }
  }

  const planType = subscription?.planType || "FREE";
  const maxUsers = planType === "STARTER" ? 1 : planType === "PROFESSIONAL" ? 5 : planType === "BUSINESS" || planType === "ENTERPRISE" ? Infinity : 1;

  return (
    <AppLayout>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Required"
        message={`Your current plan (${planType}) allows up to ${maxUsers === Infinity ? "unlimited" : maxUsers} user${maxUsers === 1 ? "" : "s"}. To invite more team members, please upgrade your plan.`}
        feature="Team Collaboration"
      />
      <div className="space-y-8">

        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-slate-600">
            Manage users and invitations
          </p>
        </div>

        {/* INVITE */}
        <form
          onSubmit={sendInvite}
          className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded shadow"
        >
          <input
            className="flex-1 rounded border px-3 py-2"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="rounded border px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="rounded bg-slate-900 px-4 py-2 text-white">
            Send Invite
          </button>
        </form>

        {/* USERS */}
        <div className="rounded bg-white shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* INVITES */}
        {invites.length > 0 && (
          <div className="rounded bg-white shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="px-4 py-3">{i.email}</td>
                    <td className="px-4 py-3">{i.role}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(i.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => revoke(i.id)}
                        className="text-red-600 text-sm"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
