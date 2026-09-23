import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { useNotifications } from "../contexts/notification-context";
import invitationService from "../services/invitation-service";
import { PiBellDuotone, PiUsersDuotone } from "react-icons/pi";

const TEAM_INVITE_TYPES = ["team_invite", "TEAM_INVITE"];

const TeamInviteBell = ({ onResponded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const {
    notifications,
    loading,
    markAsRead,
    applyNotificationUpdate,
  } = useNotifications();

  const teamInvites = useMemo(
    () =>
      (notifications || []).filter((n) =>
        TEAM_INVITE_TYPES.includes(n.type),
      ),
    [notifications],
  );

  const unreadCount = teamInvites.filter((n) => !n.isRead).length;

  const handleOpenChange = (open) => {
    setIsOpen(open);
  };

  const handleRespond = async (notification, action) => {
    const invitation = notification.invitationId;
    const invitationId = invitation?._id || invitation?.id || invitation;
    if (!invitationId) {
      toast.error("Invitation is no longer available");
      return;
    }
    try {
      setRespondingId(notification.id || notification._id);
      await invitationService.respondToInvitation(invitationId, action);
      toast.success(
        `Invitation ${action === "accept" ? "accepted" : "declined"}`,
      );
      await markAsRead(notification.id || notification._id);
      applyNotificationUpdate({
        ...notification,
        isRead: true,
        invitationId:
          invitation && typeof invitation === "object"
            ? {
                ...invitation,
                status: action === "accept" ? "accepted" : "rejected",
              }
            : invitation,
      });
      onResponded?.();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} invitation`);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="relative h-12 w-12 rounded-[15px] bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-white/10"
        >
          <Bell className="w-5 h-5 icon" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-[15px] text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 rounded-[15px] bg-white dark:bg-black border-gray-200 dark:border-gray-700"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold">Workspace invitations</h3>
          <p className="text-xs text-gray-500 mt-1">
            Only invites to join a workspace
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading && teamInvites.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : teamInvites.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <PiBellDuotone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No workspace invitations</p>
            </div>
          ) : (
            <AnimatePresence>
              {teamInvites.map((notification) => {
                const invitation = notification.invitationId;
                const status = invitation?.status;
                const isResponding =
                  respondingId === (notification.id || notification._id);
                return (
                  <motion.div
                    key={notification.id || notification._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 ${
                      !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <PiUsersDuotone className="w-4 h-4 mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Workspace invitation</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        {invitation && status && status !== "pending" ? (
                          <span
                            className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${
                              status === "accepted"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {status === "accepted" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {status === "accepted" ? "Accepted" : "Declined"}
                          </span>
                        ) : invitation ? (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              disabled={isResponding}
                              onClick={() => handleRespond(notification, "accept")}
                              className="h-7 px-3 rounded-[10px] text-xs"
                            >
                              {isResponding ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isResponding}
                              onClick={() => handleRespond(notification, "reject")}
                              className="h-7 px-3 rounded-[10px] text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamInviteBell;
