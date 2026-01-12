import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { listUsers, User } from "@/api/users";
import { listInvites, createInvite, revokeInvite, Invite } from "@/api/invites";

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [u, i] = await Promise.all([
      listUsers(),
      listInvites(),
    ]);
    setUsers(u);
    setInvites(i);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    await createInvite(email, role);
    setEmail("");
    setRole("MEMBER");
    loadAll();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this invite?")) return;
    await revokeInvite(id);
    loadAll();
  }

  return (
    <AppLayout>
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
