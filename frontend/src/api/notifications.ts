import { apiFetch } from "./apiFetch";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

export async function listNotifications(page = 1, limit = 20) {
  return apiFetch(`/notifications?page=${page}&limit=${limit}`);
}

export async function getUnreadCount() {
  return apiFetch("/notifications/unread-count");
}

export async function markNotificationRead(notificationId: string) {
  return apiFetch("/notifications/read-one", {
    method: "PATCH",
    body: JSON.stringify({ notificationId }),
  });
}

export async function markAllNotificationsRead() {
  return apiFetch("/notifications/read", {
    method: "PATCH",
  });
}

export async function sendAdminNotification(payload: {
  title: string;
  body: string;
  targets: {
    all?: boolean;
    workspaceIds?: string[];
    roles?: string[];
    userIds?: string[];
  };
}) {
  return apiFetch("/admin/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
