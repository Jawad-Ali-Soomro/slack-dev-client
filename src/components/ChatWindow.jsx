import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Reply,
  Edit,
  Trash2,
  ArrowDown,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import UserDetailsModal from "./UserDetailsModal";
import { chatService } from "@/services/chatService";
import HorizontalLoader from "./HorizontalLoader";
import SkeletonLoader from "./SkeletonLoader";
import { Skeleton } from "./ui/skeleton";

const ChatWindow = ({ isMobile = false }) => {
  const {
    currentChat,
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    getChatName,
    getChatAvatar,
    isUserOnline,
    getTypingUsers,
    startTyping,
    stopTyping,
    messagesEndRef,
    messagesLoading,
    setCurrentChat,
    loading,
  } = useChat();

  const { user } = useAuth();
  const { theme } = useTheme();
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottomLocal = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (
      messages.length > 0 &&
      messagesContainerRef.current &&
      !messagesLoading
    ) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;
        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [messages.length, messagesLoading]);

  // Handle scroll events
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
      setShowScrollButton(!isNearBottom && messages.length > 5);
    };

    messagesContainer.addEventListener("scroll", handleScroll);
    return () => messagesContainer.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat || messagesLoading) return;

    if (editingMessage) {
      await updateMessage(editingMessage._id, messageText);
      setEditingMessage(null);
    } else {
      await sendMessage(messageText, "text", [], replyTo?._id);
      setReplyTo(null);
    }

    setMessageText("");
    stopTyping(currentChat._id);
    scrollToBottomLocal();
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (currentChat) {
      if (e.target.value.trim()) {
        startTyping(currentChat._id);
      } else {
        stopTyping(currentChat._id);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageText(message.content);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle file upload
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId);
      setShowUserDetails(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const formatMessageTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${apiUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const typingUsers = currentChat ? getTypingUsers(currentChat._id) : [];
  const currentUserId = String(user?.id || user?._id || "");
  const otherParticipant = currentChat?.participants.find((p) => {
    const participantId = String(p._id || p.id || "");
    return participantId && participantId !== currentUserId;
  });
  const isOnline = otherParticipant
    ? isUserOnline(otherParticipant._id || otherParticipant.id)
    : false;

  if (!currentChat) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center px-6">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#FF914B] to-[#ff6a3d] shadow-lg shadow-[#FF914B]/20">
            <Send className="h-9 w-9 text-white" />
          </div>
          <h3 className="mb-1.5 text-xl font-bold text-gray-900 dark:text-white">
            Your messages
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isMobile ? "m-0 w-full" : ""}`}>
      {/* Header */}

      <div
        className={`flex-shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/40 ${isMobile ? "p-2" : "px-4 py-3"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentChat(null)}
                className="-ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Back to chat list"
              >
                <ArrowLeft className="h-5 w-5 icon" />
              </Button>
            )}
            <div className="relative">
              <Avatar
                className="h-11 w-11 cursor-pointer ring-2 ring-[#FF914B]/20 transition-all hover:ring-[#FF914B]/50"
                onClick={() =>
                  otherParticipant &&
                  handleUserAvatarClick(
                    otherParticipant._id || otherParticipant.id,
                  )
                }
              >
                <AvatarImage src={getAvatarUrl(getChatAvatar(currentChat))} />
                <AvatarFallback>
                  {getChatName(currentChat).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-black ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold leading-tight text-gray-900 dark:text-white">
                {getChatName(currentChat)}
              </h3>
              <span className="text-xs font-medium text-muted-foreground">
                {typingUsers.length > 0
                  ? "typing..."
                  : isOnline
                    ? "Active Now"
                    : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex relative flex-col h-full overflow-hidden">
        {/* Messages */}

        <div
          ref={messagesContainerRef}
          className={`relative flex-1 space-y-1 overflow-y-auto dark:bg-transparent ${isMobile ? "p-2" : "p-4"}`}
        >
          {messagesLoading ? (
            // <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col gap-6 h-full">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`flex ${item % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-3 max-w-[300px]">
                    {item % 2 !== 0 && (
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    )}

                    <div className="flex flex-col gap-2">
                      <Skeleton
                        className={`h-12 rounded-[20px] ${
                          item % 2 === 0 ? "w-40" : "w-52"
                        }`}
                      />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>

                    {item % 2 === 0 && (
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : // <p className="text-sm text-muted-foreground">Loading messages...</p>
          // </div>
          messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Send className="h-12 icon w-12 mx-auto mb-4" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const senderId = String(
                message.sender._id || message.sender.id || "",
              );
              const currentUserId = String(user?.id || user?._id || "");
              const isOwn = senderId && senderId === currentUserId;
              const isDeleted = message.isDeleted;
              const senderAvatar = isOwn
                ? message.sender.avatar || user?.avatar
                : message.sender.avatar;
              const senderLabel =
                message.sender.name ||
                message.sender.username ||
                user?.username ||
                user?.name ||
                "U";

              return (
                <div
                  key={message._id}
                  className={`group flex py-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[78%] items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar
                      className="mt-1 h-9 w-9 shrink-0 cursor-pointer rounded-[12px] border border-gray-200 p-0.5 transition-opacity hover:opacity-80 dark:border-gray-600"
                      onClick={() =>
                        handleUserAvatarClick(
                          message.sender._id || message.sender.id,
                        )
                      }
                      title={
                        message.sender.username
                          ? `View ${message.sender.username}'s profile`
                          : "View profile"
                      }
                    >
                      <AvatarImage
                        src={getAvatarUrl(senderAvatar)}
                        className="rounded-[10px]"
                      />
                      <AvatarFallback>
                        {senderLabel.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`relative px-4 py-2.5 shadow-sm font-bold ${
                          isOwn
                            ? "rounded-2xl rounded-br-none bg-white text-gray-900"
                            : "rounded-2xl rounded-bl-none border border-gray-100 bg-white text-gray-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                        } ${isDeleted ? "opacity-60" : ""}`}
                      >
                        {message.replyTo && (
                          <div
                            className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs ${
                              isOwn
                                ? "border-white/60 bg-white/15 text-white/90"
                                : "border-[#FF914B] bg-[#FF914B]/10 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            <span className="line-clamp-2">
                              {message.replyTo?.content}
                            </span>
                          </div>
                        )}

                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>

                        {message.isEdited && (
                          <span className="mt-0.5 block text-[10px] opacity-70">
                            (edited)
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-xs text-muted-foreground ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <span className="text-[10px] font-semibold lowercase">
                          {formatMessageTime(message.createdAt)}
                        </span>

                        {isOwn && !isDeleted && (
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0 hover:text-[#FF914B]"
                              onClick={() => handleEditMessage(message)}
                            >
                              <Edit className="h-3 w-3 icon" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 rounded-full p-0 hover:text-red-500"
                              onClick={() => handleDeleteMessage(message._id)}
                            >
                              <Trash2 className="h-3 w-3 icon" />
                            </Button>
                          </div>
                        )}

                        {!isOwn && !isDeleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 rounded-full p-0 opacity-0 transition-opacity hover:text-[#FF914B] group-hover:opacity-100"
                            onClick={() => handleReplyToMessage(message)}
                          >
                            <Reply className="h-3 w-3 icon" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 py-2">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#FF914B]"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-[#FF914B]"
                  style={{ animationDelay: "0.15s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-[#FF914B]" 
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">
                {typingUsers.map((u) => u.userName).join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            type="button"
            className="absolute bottom-24 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:scale-105 hover:text-[#FF914B] dark:border-white/10 dark:bg-white/10 dark:text-white"
            onClick={scrollToBottomLocal}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* Message Input */}
        <div
          className={`relative flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/40 ${isMobile ? "p-2" : "p-4"}`}
        >
          {/* Reply / Edit preview */}
          {(replyTo || editingMessage) && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-[14px] border-l-2 border-[#FF914B] bg-[#FF914B]/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#FF914B]">
                  {editingMessage ? "Editing message" : "Replying to"}
                </p>
                <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                  {editingMessage ? editingMessage.content : replyTo?.content}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setEditingMessage(null);
                  setMessageText("");
                }}
                className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/10"
              >
                <Trash2 className="h-3.5 w-3.5 icon" />
              </button>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 transition-colors focus-within:border-[#FF914B]/50 dark:border-white/10 dark:bg-white/[0.04]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 shrink-0 rounded-full p-0 text-muted-foreground hover:text-[#FF914B]"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4 icon" />
              </Button>

              <Input
                ref={inputRef}
                value={messageText}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={
                  editingMessage ? "Edit message..." : "Type A Message..."
                }
                className="h-11 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                disabled={messagesLoading}
              />

              <div
                className="relative emoji-picker-wrapper shrink-0"
                ref={emojiPickerRef}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0 text-muted-foreground hover:text-[#FF914B]"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4 icon" />
                </Button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      autoFocusSearch={false}
                      theme={theme === "dark" ? "dark" : "light"}
                      width={350}
                      height={400}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!messageText.trim() || messagesLoading}
              className="h-11 w-11 shrink-0 rounded-full p-0"
              title="Send message"
            >
              <Send className="h-4 w-4 icon" />
            </Button>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* User Details Modal */}
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

export default ChatWindow;
