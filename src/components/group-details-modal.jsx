import { useState } from "react";
import { X, UserMinus } from "lucide-react";
import { PiPencil, PiPencilCircleFill, PiPencilDuotone, PiUserMinus, PiUsersDuotone } from "react-icons/pi";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useChat } from "../contexts/chat-context";
import EditGroupChatModal from "./edit-group-chat-modal";

const personId = (person) => String(person?._id || person?.id || "");

const personName = (person) => person?.username || person?.name || "Member";

const avatarSrc = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${apiUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
};

const GroupDetailsModal = ({
  isOpen,
  chat,
  currentUserId,
  isUserOnline,
  onClose,
  onMemberClick,
}) => {
  const { removeGroupMember } = useChat();
  const [editing, setEditing] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !chat || chat.type !== "group") return null;

  const adminId = String(chat.createdBy?._id || chat.createdBy?.id || chat.createdBy || "");
  const isAdmin = adminId && adminId === String(currentUserId || "");
  const members = chat.participants || [];

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      setRemovingId(memberId);
      setError("");
      await removeGroupMember(chat._id, memberId);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not remove that member");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <Card
          className="flex max-h-[min(720px,90vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
          onClick={(event) => event.stopPropagation()}
        >
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl font-bold">Group details</CardTitle>
              <Button variant="ghost" size="sm" className="h-12 w-12" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto relative">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200/80 bg-gray-50 px-4 py-5 dark:border-white/10 dark:bg-white/[0.04]">
             <div className="flex justify-start items-center gap-4">
             <span className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden p-2 rounded-full border border-black/[0.06] bg-white dark:border-white/10 dark:bg-zinc-800">
                {chat.logo ? (
                  <img src={avatarSrc(chat.logo)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PiUsersDuotone className="h-10 w-10 text-gray-700 dark:text-gray-200" />
                )}
              </span>
              <div className="max-w-full text-left">
                <p className="truncate text-left text-base font-black text-gray-900 dark:text-white">
                  {chat.name || "Group"}
                </p>
                <p className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                {chat.description?.trim() || "No description yet"}
              </p>
              </div>
             </div>
              
              {isAdmin ? (
                <Button type="button" variant={'ghost'} className={'w-[50px] absolute right-8 top-6'} onClick={() => setEditing(true)}>
                  <PiPencilDuotone />
                </Button>
              ) : null}
            </div>

            {error ? (
              <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs border-b pb-2 px-3 flex justify-between items-center font-semibold uppercase tracking-wide text-muted-foreground">
                group Members
                {
                  members.length > 0 ? (
                    <span className="text-xs text-gray-500">
                      {members.length}
                    </span>
                  ) : null
                }
              </p>
              <div className="space-y-1">
                {members.map((member) => {
                  const id = personId(member);
                  const name = personName(member);
                  const online = isUserOnline?.(id);
                  const memberIsAdmin = id === adminId;
                  return (
                    <div
                      key={id || name}
                      className="flex items-center gap-3 rounded-[15px] px-2 py-2 hover:bg-black/[0.04] dark:hover:bg-white/5"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() => onMemberClick?.(id)}
                      >
                        <span className="relative shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarSrc(member.avatar)} />
                            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                              online ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {name}
                            {id === String(currentUserId || "") ? " (You)" : ""}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {memberIsAdmin ? "Admin" : online ? "Online" : "Offline"}
                          </span>
                        </span>
                      </button>
                      {isAdmin && !memberIsAdmin ? (
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          title="Remove member"
                          disabled={removingId === id}
                          onClick={() => handleRemove(id)}
                        >
                          <PiUserMinus className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <EditGroupChatModal
        isOpen={editing}
        chat={chat}
        onClose={() => setEditing(false)}
      />
    </>
  );
};

export default GroupDetailsModal;
