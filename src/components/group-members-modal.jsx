import { X } from "lucide-react";
import { PiUsersDuotone } from "react-icons/pi";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserAvatar } from "./user-avatar";
import { useAuth } from "../contexts/auth-context";
import { useChat } from "../contexts/chat-context";
import { getAvatarUrl } from "../utils/avatar-utils";

const memberId = (member) => String(member?._id || member?.id || "");

const GroupMembersModal = ({ isOpen, chat, onClose, onSelectUser }) => {
  const { user } = useAuth();
  const { isUserOnline, getChatName } = useChat();

  if (!isOpen || !chat) return null;

  const currentUserId = String(user?.id || user?._id || "");
  const members = Array.isArray(chat.participants) ? chat.participants : [];
  const groupName = getChatName(chat) || "Group";
  const logo = chat.logo || chat.avatar || "";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="mx-4 flex max-h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader className="shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-gray-50 dark:border-white/10 dark:bg-zinc-800">
                {logo ? (
                  <img
                    src={getAvatarUrl(logo, groupName)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PiUsersDuotone className="h-7 w-7 text-gray-700 dark:text-gray-200" />
                )}
              </span>
              <div className="min-w-0">
                <CardTitle className="truncate text-xl font-bold">{groupName}</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-10 w-10 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pb-4">
          <div className="space-y-1">
            {members.map((member) => {
              const id = memberId(member);
              const isYou = id && id === currentUserId;
              const online = id ? isUserOnline(id) : false;
              const name = member.username || member.name || "User";

              return (
                <button
                  key={id || name}
                  type="button"
                  onClick={() => id && onSelectUser?.(id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <span className="relative shrink-0">
                    <UserAvatar user={member} size="lg" showHoverCard={false} ring={false} />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                        online ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-600"
                      }`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {name}
                      </span>
                      {isYou ? (
                        <span className="shrink-0 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          You
                        </span>
                      ) : null}
                    </span>
                    {member.email ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupMembersModal;
