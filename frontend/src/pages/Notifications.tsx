import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications";
import { useToastContext } from "@/contexts/ToastContext";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await listNotifications(1, 50);
      setItems(data.items || []);
    } catch (error: any) {
      toast.error(`Failed to load notifications: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (error: any) {
      toast.error(`Failed to mark all read: ${error?.message || "Unknown error"}`);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    } catch (error: any) {
      toast.error(`Failed to mark read: ${error?.message || "Unknown error"}`);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-600">Your latest updates and alerts</p>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const unread = !item.readAt;
              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 bg-white ${unread ? "border-blue-200" : "border-slate-200"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {unread && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
