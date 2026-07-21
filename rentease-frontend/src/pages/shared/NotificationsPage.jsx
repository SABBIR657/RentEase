import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import { useNotificationStore } from "../../store/notificationStore";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { formatRelativeTime } from "../../utils/formatters";

const TYPE_ICONS = {
  application: "📋",
  booking: "📅",
  message: "💬",
  review: "⭐",
  system: "🔔",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { markAllRead } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications?limit=50").then((r) => r.data),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const { mutate: markAll } = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      markAllRead();
      queryClient.invalidateQueries(["notifications"]);
      toast.success("All marked as read");
    },
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const notifications = data?.data || [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-subtitle">
            {unread > 0 ? `${unread} unread` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="ghost" onClick={() => markAll()}>
            <CheckCheck size={15} className="mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see updates here when things happen."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card p-4 flex items-start gap-3 transition-colors
                ${!n.isRead ? "bg-blue-50 border-blue-100" : ""}`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0
                ${!n.isRead ? "bg-primary-100" : "bg-gray-100"}`}
              >
                {TYPE_ICONS[n.type] || "🔔"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${!n.isRead ? "text-primary-900" : "text-gray-900"}`}
                >
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n._id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-primary-800"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotif(n._id)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
