import { apiFetch } from "./apiFetch";

export type Invite = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  expiresAt: string;
};

/**
 * ADMIN — list invites
 */
export async function listInvites(): Promise<Invite[]> {
  return apiFetch("/invites");
}

/**
 * ADMIN — create invite
 */
export async function createInvite(
  email: string,
  role: "ADMIN" | "MEMBER"
) {
  return apiFetch("/invites", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

/**
 * ADMIN — revoke invite
 */
export async function revokeInvite(inviteId: string) {
  return apiFetch(`/invites/${inviteId}`, {
    method: "DELETE",
  });
}

/**
 * 🌍 PUBLIC — fetch invite for acceptance
 */
export async function getPublicInvite(inviteId: string): Promise<Invite> {
  return apiFetch(`/invites/${inviteId}/public`, {
    auth: false,
  });
}
