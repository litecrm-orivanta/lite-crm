// Use relative path /api so nginx can proxy to backend
// In production, nginx proxies /api/* to backend:3000/*
const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let err: any;
    try {
      err = await res.json();
    } catch {
      err = { message: res.statusText };
    }

    // 🔒 BUSINESS RULE: UPGRADE REQUIRED
    if (res.status === 403 && err?.message) {
      throw {
        type: "UPGRADE_REQUIRED",
        message: err.message,
      };
    }

    throw err;
  }

  return res.json();
}
