import { apiFetch } from "./apiFetch";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
};

export async function listUsers(): Promise<User[]> {
  return apiFetch("/users");
}

export async function changeUserRole(
  userId: string,
  role: "ADMIN" | "MEMBER"
) {
  return apiFetch(`/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function removeUser(userId: string) {
  return apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
}

export async function checkN8nReady(): Promise<{ n8nReady: boolean }> {
  return apiFetch("/me/n8n-ready");
}
