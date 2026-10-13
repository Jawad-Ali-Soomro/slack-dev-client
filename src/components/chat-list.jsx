import { useState } from "react";
import { useChat } from "../contexts/chat-context";
import { useAuth } from "../contexts/auth-context";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, Search } from "lucide-react";
import UserDetailsModal from "./user-details-modal";

const ChatList = () => {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    setCurrentChat,
    getChatName,
    getChatAvatar,
    isUserOnline,
    chatsLoading,
  } = useChat();

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${apiUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const filteredChats = chats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleUserAvatarClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      setSelectedUserId(userId);
      setShowUserDetails(true);
    }
  };

  if (chatsLoading && chats.length === 0) {
    return (
      <div className="flex flex-col h-full icon m-0 w-full">
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="chat-search pl-10 h-11 border-0 bg-[#f4f5f7] dark:bg-white/5 text-black dark:text-white"
              disabled
            />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-[15px] h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full icon m-0 w-full">
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="chat-search pl-10 h-11 border-0 bg-[#f4f5f7] dark:bg-white/5 text-black dark:text-white"
          />
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chatsLoading && chats.length > 0 ? (
          <div className="flex items-center justify-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-[15px] animate-bounce"></div>
              <div
                className="w-2 h-2 bg-primary rounded-[15px] animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-primary rounded-[15px] animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">No chats found</p>
            <p className="text-xs">Start a conversation with someone</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2 pb-3">
            {filteredChats.map((chat) => {
              const isActive = currentChat?._id === chat._id;
              const chatName = getChatName(chat);
              const chatAvatar = getChatAvatar(chat);
              const currentUserId = String(user?.id || user?._id || "");
              const otherParticipant = chat.participants.find((p) => {
                const participantId = String(p._id || p.id || "");
                return participantId && participantId !== currentUserId;
              });
              const isOnline = otherParticipant
                ? isUserOnline(otherParticipant._id || otherParticipant.id)
                : false;

              return (
                <button
                  key={chat._id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-[var(--theme-accent)]/12"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/5"
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      className="chat-avatar h-11 w-11 cursor-pointer"
                      onClick={(e) =>
                        otherParticipant &&
                        handleUserAvatarClick(
                          e,
                          otherParticipant._id || otherParticipant.id,
                        )
                      }
                      title={
                        otherParticipant?.username
                          ? `View ${otherParticipant.username}'s profile`
                          : "View profile"
                      }
                    >
                      <AvatarImage src={getAvatarUrl(chatAvatar)} />
                      <AvatarFallback>
                        {chatName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {chatName}
                      </h3>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--theme-accent)] px-1 text-[10px] font-bold text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};

export default ChatList;
