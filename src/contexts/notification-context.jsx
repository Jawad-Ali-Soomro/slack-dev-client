import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import notificationService from "../services/notification-service";
import { useAuth } from "./auth-context";

const NotificationContext = createContext();

const notificationIdOf = (notification) =>
  String(notification?.id || notification?._id || "");

const normalizeNotification = (notification) => {
  const id = notificationIdOf(notification);
  return id ? { ...notification, id } : notification;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
    tasks: 0,
    meetings: 0,
    projects: 0,
    teams: 0,
    messages: 0,
    code: 0,
  });

  const notificationsRef = useRef([]);
  notificationsRef.current = notifications;

  const updateUnreadCount = useCallback((notificationsList) => {
    const unread = notificationsList.filter((notif) => !notif.isRead).length;
    setUnreadCount(unread);

    const counts = {
      tasks: 0,
      meetings: 0,
      projects: 0,
      teams: 0,
      messages: 0,
      code: 0,
    };

    notificationsList.forEach((notif) => {
      if (!notif.isRead) {
        const type = notif.type || notif.notificationType || "general";
        switch (type) {
          case "task":
          case "task_assigned":
          case "task_updated":
          case "task_completed":
          case "task_status_updated":
          case "task_reassigned":
          case "task_unassigned":
          case "task_overdue":
          case "TASK_ASSIGNED":
          case "TASK_UPDATED":
          case "TASK_COMPLETED":
            counts.tasks++;
            break;
          case "meeting":
          case "meeting_invite":
          case "meeting_reminder":
          case "meeting_assigned":
          case "meeting_updated":
          case "meeting_status_updated":
          case "meeting_rescheduled":
          case "meeting_reassigned":
          case "meeting_unassigned":
          case "MEETING_INVITE":
          case "MEETING_REMINDER":
            counts.meetings++;
            break;
          case "project":
          case "project_invite":
          case "project_updated":
          case "PROJECT_INVITE":
          case "PROJECT_UPDATED":
            counts.projects++;
            break;
          case "team":
          case "team_invite":
          case "team_updated":
          case "team_invite_accepted":
          case "team_invite_rejected":
          case "team_welcome":
          case "TEAM_INVITE":
          case "TEAM_UPDATED":
            counts.teams++;
            break;
          case "message":
          case "chat":
          case "MESSAGE":
          case "CHAT":
            counts.messages++;
            break;
          case "code":
          case "code_invite":
          case "code_session":
          case "CODE_INVITE":
          case "CODE_SESSION":
            counts.code++;
            break;
        }
      }
    });

    setUnreadCounts(counts);
  }, []);

  const loadNotifications = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      try {
        if (!silent) setLoading(true);
        const response = await notificationService.getNotifications({
          limit: 100,
        });
        const list = (response.notifications || []).map(normalizeNotification);
        notificationsRef.current = list;
        setNotifications(list);
        updateUnreadCount(list);
      } catch (error) {
        if (!silent) toast.error("Failed to load notifications");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [updateUnreadCount],
  );

  const addNotification = useCallback(
    (notification) => {
      const incoming = normalizeNotification(notification);
      const incomingId = notificationIdOf(incoming);
      if (!incomingId) return;
      if (
        notificationsRef.current.some(
          (notif) => notificationIdOf(notif) === incomingId,
        )
      ) {
        return;
      }

      const updated = [incoming, ...notificationsRef.current];
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);

      const notificationType = incoming.type || "info";
      const message = incoming.message || "";
      const title = incoming.title || message || "New Notification";
      const description = incoming.title ? message : "";

      if (notificationType === "message") {
        const senderName =
          incoming.sender?.username ||
          incoming.sender?.name ||
          "Someone";
        toast(`${senderName} just messaged you`, {
          icon: null,
          duration: 5000,
          action: {
            label: <Eye className="h-4 w-4" aria-label="Open chat" />,
            onClick: () => {
              window.location.href = "/dashboard/chat";
            },
          },
          actionButtonStyle: {
            background: "transparent",
            border: "none",
            padding: "4px",
            height: "28px",
            width: "28px",
          },
        });
      } else {
        toast.info(title, {
          description,
          duration: 5000,
        });
      }
    },
    [updateUnreadCount],
  );

  const applyNotificationUpdate = useCallback(
    (notification) => {
      const incoming = normalizeNotification(notification);
      const incomingId = notificationIdOf(incoming);
      if (!incomingId) return;

      const prev = notificationsRef.current;
      const idx = prev.findIndex(
        (notif) => notificationIdOf(notif) === incomingId,
      );
      if (idx === -1) return;
      const updated = [...prev];
      updated[idx] = { ...prev[idx], ...incoming };
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
    },
    [updateUnreadCount],
  );

  const removeNotificationLocal = useCallback(
    (notificationId) => {
      const id = String(notificationId || "");
      if (!id) return;
      const prev = notificationsRef.current;
      const updated = prev.filter((notif) => notificationIdOf(notif) !== id);
      if (updated.length === prev.length) return;
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
    },
    [updateUnreadCount],
  );

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      const id = String(notificationId);
      const updated = notificationsRef.current.map((notif) =>
        notificationIdOf(notif) === id ? { ...notif, isRead: true } : notif,
      );
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const updated = notificationsRef.current.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const markAsReadByType = async (type) => {
    try {
      const unreadNotifications = notifications.filter((notif) => {
        if (notif.isRead) return false;

        const notificationType =
          notif.type || notif.notificationType || "general";

        switch (type) {
          case "tasks":
            return [
              "task",
              "task_assigned",
              "task_updated",
              "task_completed",
              "TASK_ASSIGNED",
              "TASK_UPDATED",
              "TASK_COMPLETED",
            ].includes(notificationType);
          case "meetings":
            return [
              "meeting",
              "meeting_invite",
              "meeting_reminder",
              "MEETING_INVITE",
              "MEETING_REMINDER",
            ].includes(notificationType);
          case "projects":
            return [
              "project",
              "project_invite",
              "project_updated",
              "PROJECT_INVITE",
              "PROJECT_UPDATED",
            ].includes(notificationType);
          case "teams":
            return [
              "team",
              "team_invite",
              "team_updated",
              "team_invite_accepted",
              "team_invite_rejected",
              "TEAM_INVITE",
              "TEAM_UPDATED",
            ].includes(notificationType);
          case "messages":
            return ["message", "chat", "MESSAGE", "CHAT"].includes(
              notificationType,
            );
          case "code":
            return [
              "code",
              "code_invite",
              "code_session",
              "CODE_INVITE",
              "CODE_SESSION",
            ].includes(notificationType);
          default:
            return false;
        }
      });

      if (unreadNotifications.length === 0) return;

      const promises = unreadNotifications.map((notif) =>
        notificationService.markAsRead(notif.id || notif._id),
      );

      await Promise.all(promises);

      const updated = notificationsRef.current.map((notif) => {
          const notificationType =
            notif.type || notif.notificationType || "general";
          let shouldMarkAsRead = false;

          switch (type) {
            case "tasks":
              shouldMarkAsRead = [
                "task",
                "task_assigned",
                "task_updated",
                "task_completed",
                "TASK_ASSIGNED",
                "TASK_UPDATED",
                "TASK_COMPLETED",
              ].includes(notificationType);
              break;
            case "meetings":
              shouldMarkAsRead = [
                "meeting",
                "meeting_invite",
                "meeting_reminder",
                "MEETING_INVITE",
                "MEETING_REMINDER",
              ].includes(notificationType);
              break;
            case "projects":
              shouldMarkAsRead = [
                "project",
                "project_invite",
                "project_updated",
                "PROJECT_INVITE",
                "PROJECT_UPDATED",
              ].includes(notificationType);
              break;
            case "teams":
              shouldMarkAsRead = [
                "team",
                "team_invite",
                "team_updated",
                "team_invite_accepted",
                "team_invite_rejected",
                "TEAM_INVITE",
                "TEAM_UPDATED",
              ].includes(notificationType);
              break;
            case "messages":
              shouldMarkAsRead = [
                "message",
                "chat",
                "MESSAGE",
                "CHAT",
              ].includes(notificationType);
              break;
            case "code":
              shouldMarkAsRead = [
                "code",
                "code_invite",
                "code_session",
                "CODE_INVITE",
                "CODE_SESSION",
              ].includes(notificationType);
              break;
          }

          return shouldMarkAsRead ? { ...notif, isRead: true } : notif;
        });

      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
    } catch (error) {
      console.error(`Failed to mark ${type} notifications as read:`, error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const id = String(notificationId);
      const updated = notificationsRef.current.filter(
        (notif) => notificationIdOf(notif) !== id,
      );
      notificationsRef.current = updated;
      updateUnreadCount(updated);
      setNotifications(updated);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();
      notificationsRef.current = [];
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error("Failed to delete all notifications");
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      notificationsRef.current = [];
      setNotifications([]);
      setUnreadCount(0);
      setUnreadCounts({
        tasks: 0,
        meetings: 0,
        projects: 0,
        teams: 0,
        messages: 0,
        code: 0,
      });
    }
  }, [user, loadNotifications]);

  const value = {
    notifications,
    unreadCount,
    unreadCounts,
    loading,
    loadNotifications,
    addNotification,
    applyNotificationUpdate,
    removeNotificationLocal,
    markAsRead,
    markAllAsRead,
    markAsReadByType,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
