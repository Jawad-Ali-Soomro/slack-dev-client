import { Loader2, UserPlus, Clock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarProps } from "@/utils/avatarUtils";
import { cn } from "@/lib/utils";
import { PiUserPlusDuotone } from "react-icons/pi";

export default function FriendUserCard({
  person,
  onAvatarClick,
  onAdd,
  isSending = false,
  requestStatus = null,
  action,
  compact = false,
  index = 0,
}) {
  const isPending = requestStatus === "sent";
  const isReceived = requestStatus === "received";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "friend-user-card group",
        compact && "friend-user-card--compact",
      )}
    >
      <div />

      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar
            className={cn(
              "cursor-pointer ring-2 ring-theme-subtle group-hover:ring-theme/40 transition-all",
              compact ? "h-10 w-10" : "h-12 w-12",
            )}
            onClick={() => onAvatarClick?.(person.id)}
          >
            <AvatarImage {...getAvatarProps(person.avatar, person.username)} />
            <AvatarFallback className="bg-theme-subtle text-theme font-bold">
              {person.username?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {person.username}
          </p>
          {!compact && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {person.email}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {action ||
          (isReceived ? (
            <span className="friend-user-card__badge friend-user-card__badge--received">
              <Clock className="h-3 w-3" />
              Incoming
            </span>
          ) : isPending ? (
            <span className="friend-user-card__badge friend-user-card__badge--pending">
              <UserCheck className="h-3 w-3" />
              Requested
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isSending}
              onClick={() => onAdd?.(person.id)}
              className="h-12 w-12 rounded-xl font-bold bg-theme-gradient text-white hover:opacity-90 disabled:opacity-60 shadow-sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <PiUserPlusDuotone size={16} />
                  {/* Add */}
                </>
              )}
            </Button>
          ))}
      </div>
    </motion.div>
  );
}
