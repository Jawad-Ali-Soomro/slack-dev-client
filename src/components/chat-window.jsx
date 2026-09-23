import { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/chat-context";
import { useAuth } from "../contexts/auth-context";
import { useTheme } from "../contexts/theme-context";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Send,
  Smile,
  Paperclip,
  Reply,
  Edit,
  Trash2,
  ArrowDown,
  ArrowLeft,
  X,
  FileText,
  Film,
  Music,
  Loader2,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import UserDetailsModal from "./user-details-modal";
import { Skeleton } from "./ui/skeleton";
import chatUploadService from "../services/chat-upload-service";

const MAX_CHAT_FILES = 5;
const MAX_CHAT_FILE_BYTES = 20 * 1024 * 1024;

const FileLink = ({ href, name, size, Icon, own = false }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 ${
      own
        ? "bg-white/15 text-white"
        : "border border-black/[0.06] bg-black/[0.03] text-gray-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
    }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        own ? "bg-white/20" : "bg-[#FF914B]/12 text-[#FF914B]"
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] font-medium">{name}</span>
      {size && (
        <span className={`block text-[11px] ${own ? "text-white/70" : "text-muted-foreground"}`}>
          {size}
        </span>
      )}
    </span>
  </a>
);

const ImageAttachment = ({ href, name, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <FileLink href={href} name={name} Icon={FileText} />;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block w-full overflow-hidden rounded-2xl text-left"
      title="View image"
    >
      {!loaded && (
        <span className="flex h-40 w-full items-center justify-center bg-black/[0.04] dark:bg-white/5">
          <Loader2 className="h-5 w-5 animate-spin text-[#FF914B]" />
        </span>
      )}
      <img
        src={href}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`max-h-72 w-full object-cover ${loaded ? "block" : "hidden"}`}
      />
    </button>
  );
};

const PdfAttachment = ({ href, name, size }) => {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    fetch(href)
      .then((response) => {
        if (!response.ok) throw new Error("pdf");
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [href]);

  if (failed) {
    return <FileLink href={href} name={name} size={size} Icon={FileText} />;
  }

  return (
    <div className="w-full min-w-[260px] overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/10">
      <div className="relative h-72 w-full bg-[#f4f5f8]">
        {!src && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF914B]" />
          </span>
        )}
        {src && (
          <embed
            title={name}
            src={src}
            type="application/pdf"
            className="h-full w-full bg-white"
          />
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-2 text-gray-800"
      >
        <FileText className="h-4 w-4 shrink-0 text-[#FF914B]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold">{name}</span>
          {size && (
            <span className="block text-[10px] font-medium text-muted-foreground">
              {size}
            </span>
          )}
        </span>
      </a>
    </div>
  );
};

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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

  const clearPendingFiles = () => {
    setPendingFiles((current) => {
      current.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      return [];
    });
  };

  useEffect(() => {
    return () => {
      clearPendingFiles();
    };
  }, [currentChat?._id]);

  const messageTypeFor = (files) => {
    if (!files.length) return "text";
    if (files.every((file) => file.mimetype?.startsWith("image/"))) return "image";
    if (files.every((file) => file.mimetype?.startsWith("video/"))) return "video";
    if (files.every((file) => file.mimetype?.startsWith("audio/"))) return "audio";
    return "file";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!currentChat || messagesLoading || uploadingFiles) return;
    if (!text && pendingFiles.length === 0) return;

    if (editingMessage) {
      if (!text) return;
      await updateMessage(editingMessage._id, text);
      setEditingMessage(null);
      setMessageText("");
      stopTyping(currentChat._id);
      return;
    }

    try {
      let attachments = [];
      if (pendingFiles.length > 0) {
        setUploadingFiles(true);
        const uploaded = await chatUploadService.uploadMultipleFiles(
          pendingFiles.map((item) => item.file),
        );
        attachments = uploaded.files || [];
      }

      await sendMessage(
        text,
        messageTypeFor(attachments),
        attachments,
        replyTo?._id,
      );
      setReplyTo(null);
      setMessageText("");
      clearPendingFiles();
      stopTyping(currentChat._id);
      scrollToBottomLocal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send that file");
    } finally {
      setUploadingFiles(false);
    }
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
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (!selected.length || editingMessage) return;

    const accepted = [];
    selected.forEach((file) => {
      if (file.size > MAX_CHAT_FILE_BYTES) {
        toast.error(`${file.name} is larger than 20MB`);
        return;
      }
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "";
      accepted.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview,
      });
    });

    setPendingFiles((current) => {
      const room = MAX_CHAT_FILES - current.length;
      if (accepted.length > room) {
        accepted.slice(Math.max(room, 0)).forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
        toast.error(`You can attach up to ${MAX_CHAT_FILES} files`);
      }
      if (room <= 0) return current;
      return [...current, ...accepted.slice(0, room)];
    });
  };

  const removePendingFile = (id) => {
    setPendingFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
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
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const attachmentIcon = (attachment) => {
    if (chatUploadService.isVideo(attachment)) return Film;
    if (chatUploadService.isAudio(attachment)) return Music;
    return FileText;
  };

  const isAutoFileCaption = (message) => {
    const attachments = message.attachments || [];
    if (!attachments.length) return false;
    if (attachments.length === 1) {
      return message.content === chatUploadService.fileName(attachments[0]);
    }
    return message.content === `Sent ${attachments.length} files`;
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
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF914B] to-[#ff6a3d] shadow-lg shadow-[#FF914B]/20">
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

      <div
        className={`flex-shrink-0 border-b border-black/[0.06] bg-white dark:border-white/10 dark:bg-black/40 ${isMobile ? "px-2 py-2.5" : "px-5 py-3.5"}`}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={() => setCurrentChat(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/10"
              title="Back to chat list"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="relative">
            <Avatar
              className="h-11 w-11 cursor-pointer"
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
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-black ${
                isOnline ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-gray-900 dark:text-white">
              {getChatName(currentChat)}
            </h3>
            <p
              className={`mt-0.5 flex items-center gap-1.5 text-xs ${
                typingUsers.length > 0
                  ? "text-[#FF914B]"
                  : isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  typingUsers.length > 0
                    ? "bg-[#FF914B]"
                    : isOnline
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                }`}
              />
              {typingUsers.length > 0
                ? "Typing..."
                : isOnline
                  ? "Active now"
                  : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex relative flex-col h-full overflow-hidden">

        <div
          ref={messagesContainerRef}
          className={`relative flex-1 overflow-y-auto dark:bg-transparent ${isMobile ? "px-2 py-3" : "px-5 py-4"}`}
        >
          {messagesLoading ? (
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
                        className={`h-12 rounded-[20px] ${item % 2 === 0 ? "w-40" : "w-52"
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
          ) :
            messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF914B]/10 text-[#FF914B]">
                    <Send className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    No messages yet
                  </p>
                  <p className="mt-1 text-xs">Say hello to start the conversation</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
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
                const senderKey = (item) =>
                  String(item?.sender?._id || item?.sender?.id || "");
                const prevMessage = messages[index - 1];
                const nextMessage = messages[index + 1];
                const continuesFromPrev =
                  prevMessage &&
                  senderKey(prevMessage) === senderId &&
                  !prevMessage.isDeleted &&
                  !isDeleted;
                const continuesToNext =
                  nextMessage &&
                  senderKey(nextMessage) === senderId &&
                  !nextMessage.isDeleted &&
                  !isDeleted;
                const showText = isDeleted || !isAutoFileCaption(message);
                const mediaOnly =
                  !showText && (message.attachments || []).length > 0;

                return (
                  <div
                    key={message._id}
                    className={`group flex ${continuesFromPrev ? "mt-1" : "mt-4"} ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[min(78%,520px)] items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {continuesToNext ? (
                        <span className="w-8 shrink-0" />
                      ) : (
                        <Avatar
                          className="h-8 w-8 shrink-0 cursor-pointer"
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
                          <AvatarImage src={getAvatarUrl(senderAvatar)} />
                          <AvatarFallback>
                            {senderLabel.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`relative flex min-w-0 flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`relative ${mediaOnly ? "p-1" : "px-3.5 py-2"} ${
                            isOwn
                              ? "rounded-[22px] rounded-br-md bg-gradient-to-br from-[#FF914B] to-[#ff6a3d] text-white"
                              : "rounded-[22px] rounded-bl-md border border-black/[0.06] bg-white text-gray-900 dark:border-white/10 dark:bg-[#1c1c1e] dark:text-white"
                          } ${isDeleted ? "opacity-60" : ""}`}
                        >
                          {message.replyTo && (
                            <div
                              className={`mb-1.5 rounded-md mt-1 border-l-2 px-2.5 py-1.5 text-xs ${
                                isOwn
                                  ? "border-white/70 bg-white/15 text-white/90"
                                  : "border-[#FF914B] bg-[#FF914B]/10 text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              <span className="line-clamp-2">
                                {message.replyTo?.content}
                              </span>
                            </div>
                          )}

                          {!isDeleted && (message.attachments || []).length > 0 && (
                            <div className="mb-2 flex flex-col gap-2">
                              {(message.attachments || []).map((attachment, index) => {
                                const href = chatUploadService.fileUrl(attachment);
                                const name = chatUploadService.fileName(attachment);
                                const size = chatUploadService.formatFileSize(attachment?.size);

                                if (chatUploadService.isImage(attachment)) {
                                  return (
                                    <ImageAttachment
                                      key={`${message._id}-file-${index}`}
                                      href={href}
                                      name={name}
                                      onOpen={() =>
                                        setImagePreview({ href, name })
                                      }
                                    />
                                  );
                                }

                                if (chatUploadService.isPdf(attachment)) {
                                  return (
                                    <PdfAttachment
                                      key={`${message._id}-file-${index}`}
                                      href={href}
                                      name={name}
                                      size={size}
                                    />
                                  );
                                }

                                if (chatUploadService.isVideo(attachment)) {
                                  return (
                                    <video
                                      key={`${message._id}-file-${index}`}
                                      src={href}
                                      controls
                                      className="max-h-72 w-full rounded-2xl"
                                    />
                                  );
                                }

                                if (chatUploadService.isAudio(attachment)) {
                                  return (
                                    <audio
                                      key={`${message._id}-file-${index}`}
                                      src={href}
                                      controls
                                      className="w-full"
                                    />
                                  );
                                }

                                const Icon = attachmentIcon(attachment);
                                return (
                                  <FileLink
                                    key={`${message._id}-file-${index}`}
                                    href={href}
                                    name={name}
                                    size={size}
                                    Icon={Icon}
                                    own={isOwn}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {showText && (
                            <p className="text-[14px] font-normal leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}

                          {message.isEdited && (
                            <span className={`mt-0.5 block text-[10px] ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                              Edited
                            </span>
                          )}
                        </div>

                        <span className="px-1 text-[11px] text-muted-foreground">
                          {formatMessageTime(message.createdAt)}
                        </span>

                      {!isDeleted && (
                        <div
                          className={`absolute top-1 flex items-center gap-0.5 rounded-full border border-black/[0.06] bg-white p-0.5 opacity-0 transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-[#2a2a2c] ${
                            isOwn ? "right-full mr-1.5" : "left-full ml-1.5"
                          }`}
                        >
                          {!isOwn && (
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-black/[0.05] hover:text-[#FF914B] dark:hover:bg-white/10"
                              onClick={() => handleReplyToMessage(message)}
                              title="Reply"
                            >
                              <Reply className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {isOwn && (
                            <>
                              <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-black/[0.05] hover:text-[#FF914B] dark:hover:bg-white/10"
                                onClick={() => handleEditMessage(message)}
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500"
                                onClick={() => handleDeleteMessage(message._id)}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          {typingUsers.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-[#1c1c1e]">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF914B]"></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF914B]"
                  style={{ animationDelay: "0.15s" }}
                ></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF914B]"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">
                {typingUsers.map((u) => u.userName).join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <button
            type="button"
            className="absolute bottom-24 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-gray-700 hover:text-[#FF914B] dark:border-white/10 dark:bg-[#2a2a2c] dark:text-white"
            onClick={scrollToBottomLocal}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        <div
          className={`relative flex-shrink-0 border-t border-black/[0.06] dark:border-white/10 dark:bg-black/40 ${isMobile ? "p-2" : "px-4 py-3"}`}
        >
          {pendingFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex max-w-full items-center gap-2 rounded-2xl border border-black/[0.06] py-1 pl-1 pr-2 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt=""
                      className="h-9 w-9 rounded-[10px] object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FF914B]/10 text-[#FF914B]">
                      <FileText className="h-4 w-4" />
                    </span>
                  )}
                  <span className="max-w-[140px] truncate text-xs font-medium">
                    {item.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePendingFile(item.id)}
                    className="rounded-full p-1 text-gray-500 hover:text-red-500"
                    title="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(replyTo || editingMessage) && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-[#FF914B]/20 bg-[#FF914B]/10 px-3 py-2">
              <div className="min-w-0 border-l-2 border-[#FF914B] pl-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FF914B]">
                  {editingMessage ? "Editing" : "Reply"}
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
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/10"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-1 rounded-full border border-black/[0.06] px-1.5 transition-colors focus-within:border-[#FF914B]/40 dark:border-white/10">
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-[#FF914B] disabled:opacity-40 dark:hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={Boolean(editingMessage) || uploadingFiles}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <Input
                ref={inputRef}
                value={messageText}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={
                  editingMessage ? "Edit message..." : "Message"
                }
                className="h-11 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                disabled={messagesLoading}
              />

              <div
                className="relative emoji-picker-wrapper shrink-0"
                ref={emojiPickerRef}
              >
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-[#FF914B] dark:hover:bg-white/10"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-2xl">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      autoFocusSearch={false}
                      theme={theme === "dark" ? "dark" : "light"}
                      width={320}
                      height={380}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                uploadingFiles ||
                messagesLoading ||
                (!messageText.trim() && pendingFiles.length === 0)
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF914B] text-white transition-colors hover:bg-[#ff7a2e] disabled:opacity-40"
              title="Send message"
            >
              {uploadingFiles ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
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

      {imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setImagePreview(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-800"
            onClick={() => setImagePreview(null)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={imagePreview.href}
            alt={imagePreview.name}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

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
