import { useState, useEffect, useMemo, useRef } from "react";
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
  Eye,
  Edit,
  Trash2,
  ArrowDown,
  ArrowLeft,
  Info,
  X,
  AtSign,
  FileText,
  Film,
  Music,
  Loader2,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import UserDetailsModal from "./user-details-modal";
import GroupDetailsModal from "./group-details-modal";
import { Skeleton } from "./ui/skeleton";
import chatUploadService from "../services/chat-upload-service";
import taskService from "../services/task-service";
import { statusBadgeTone } from "@/lib/status-badge-styles";

const MAX_CHAT_FILES = 5;
const MAX_CHAT_FILE_BYTES = 20 * 1024 * 1024;

const resolveUserId = (value) => String(value?.id || value?._id || "");

const personIdOf = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const rememberPerson = (directory, person) => {
  const id = personIdOf(person);
  if (!id) return;
  const existing = directory.get(id) || {};
  directory.set(id, {
    id,
    username: person.username || person.name || existing.username || "User",
    avatar: person.avatar || existing.avatar || null,
  });
};

const buildPeopleDirectory = (participants, messages, user) => {
  const directory = new Map();
  (participants || []).forEach((person) => rememberPerson(directory, person));
  (messages || []).forEach((message) => {
    rememberPerson(directory, message.sender);
    if (message.replyTo?.sender && typeof message.replyTo.sender === "object") {
      rememberPerson(directory, message.replyTo.sender);
    }
    (message.readBy || []).forEach((read) => {
      if (read?.user && typeof read.user === "object") {
        rememberPerson(directory, read.user);
      }
    });
  });
  if (user) rememberPerson(directory, user);
  return directory;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mentionAtCursor = (text, cursor) => {
  const upto = String(text || "").slice(0, cursor);
  const match = upto.match(/(^|\s)@([^\n@]*)$/);
  if (!match) return null;
  return {
    query: match[2],
    start: upto.length - match[2].length - 1,
  };
};

const splitMessageTags = (content, names) => {
  const unique = [...new Set((names || []).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!content || !unique.length) return [{ type: "text", value: content || "" }];
  const pattern = new RegExp(`@(${unique.map(escapeRegExp).join("|")})`, "g");
  const parts = [];
  let last = 0;
  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: "text", value: content.slice(last, index) });
    parts.push({ type: "tag", value: match[1] });
    last = index + match[0].length;
  }
  if (last < content.length) parts.push({ type: "text", value: content.slice(last) });
  return parts.length ? parts : [{ type: "text", value: content }];
};

const isOverdueTask = (task) => {
  if (!task?.dueDate) return false;
  if (task.status === "completed" || task.status === "cancelled") return false;
  return new Date(task.dueDate) < new Date();
};

const canAssignOverdueTag = (task, user, isAdmin) => {
  if (!isOverdueTask(task)) return false;
  if (isAdmin) return true;
  return personIdOf(task.assignedBy) === resolveUserId(user);
};

const chatTagPeople = (participants, user) => {
  const self = resolveUserId(user);
  return (participants || [])
    .map((person) => ({
      id: personIdOf(person),
      username: person.username || person.name || "User",
      avatar: person.avatar || null,
    }))
    .filter((person) => person.id && person.id !== self && person.username);
};

const TaggedMessage = ({ content, names, overdueNames }) => {
  const overdue = new Set(overdueNames || []);
  return splitMessageTags(content, names).map((part, index) => {
    if (part.type !== "tag") return <span key={index}>{part.value}</span>;
    const late = overdue.has(part.value);
    return (
      <span
        key={index}
        className={`mx-0.5 inline-flex items-center rounded-[10px] px-1.5 py-0.5 text-[12px] font-bold ${
          late
            ? statusBadgeTone("overdue")
            : "bg-[#FF914B]/15 text-[#c2410c] dark:text-[#ffb48a]"
        }`}
      >
        @{part.value}
      </span>
    );
  });
};

const personRecord = (value, directory) => {
  const id = personIdOf(value);
  const known = directory.get(id);
  const named = typeof value === "object" ? value : null;
  return {
    id,
    username: named?.username || named?.name || known?.username || "User",
    avatar: named?.avatar || known?.avatar || null,
  };
};

const viewersByMessageId = (messages, directory) => {
  const grouped = new Map();
  messages.forEach((message) => {
    const senderId = personIdOf(message.sender);
    const people = [];
    (message.readBy || []).forEach((read) => {
      const reader = personRecord(read.user, directory);
      if (!reader.id || reader.id === senderId) return;
      if (people.some((person) => person.id === reader.id)) return;
      people.push(reader);
    });
    if (people.length) grouped.set(String(message._id), people);
  });
  return grouped;
};

const repliesByMessageId = (messages, directory) => {
  const grouped = new Map();
  messages.forEach((message) => {
    const parentId = message.replyTo?._id;
    if (!parentId || message.isDeleted) return;
    const replier = personRecord(message.sender, directory);
    if (!replier.id) return;
    const list = grouped.get(String(parentId)) || [];
    if (!list.some((person) => person.id === replier.id)) {
      list.push(replier);
    }
    grouped.set(String(parentId), list);
  });
  return grouped;
};

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const slash = avatar.startsWith("/") ? "" : "/";
  return `${apiUrl}${slash}${avatar}`;
};

const findOtherParticipant = (currentChat, currentUserId) =>
  currentChat?.participants.find((p) => {
    const participantId = String(p._id || p.id || "");
    return participantId && participantId !== currentUserId;
  });

const resolveOnline = (otherParticipant, isUserOnline) => {
  if (!otherParticipant) return false;
  return isUserOnline(otherParticipant._id || otherParticipant.id);
};

const typingUsersFor = (currentChat, getTypingUsers) => {
  if (!currentChat) return [];
  return getTypingUsers(currentChat._id);
};

const chatShellClass = (isMobile) =>
  `flex flex-col h-full ${isMobile ? "m-0 w-full" : ""}`;

const headerPadClass = (isMobile) =>
  `flex-shrink-0 ${isMobile ? "px-3 py-3" : "px-5 py-4"}`;

const presenceDotClass = (isOnline) =>
  `absolute bottom-0 right-0 h-3 w-3 rounded-[12px] ring-2 ring-white dark:ring-black ${isOnline ? "bg-emerald-500" : "bg-gray-300"
  }`;

const statusTextClass = (typingCount, isOnline) => {
  if (typingCount > 0) return "mt-0.5 flex items-center gap-1.5 text-xs text-[#FF914B]";
  if (isOnline) {
    return "mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400";
  }
  return "mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground";
};

const messagesPadClass = (isMobile) =>
  `relative flex-1 overflow-y-auto bg-[#f7f8f6] dark:bg-black/30 ${isMobile ? "px-3 py-3" : "px-5 py-5"}`;

const composerPadClass = (isMobile) =>
  `relative flex-shrink-0 bg-white dark:bg-transparent ${isMobile ? "p-3" : "px-4 py-4"}`;

const formatMessageTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

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

const senderKey = (item) => String(item?.sender?._id || item?.sender?.id || "");

const senderDisplayLabel = (message, user) =>
  message.sender.name ||
  message.sender.username ||
  user?.username ||
  user?.name ||
  "U";

const resolveSenderAvatar = (isOwn, message, user) => {
  if (isOwn) return message.sender.avatar || user?.avatar;
  return message.sender.avatar;
};

const continuesFromPrev = (prevMessage, senderId, isDeleted) =>
  Boolean(
    prevMessage &&
    senderKey(prevMessage) === senderId &&
    !prevMessage.isDeleted &&
    !isDeleted,
  );

const continuesToNext = (nextMessage, senderId, isDeleted) =>
  Boolean(
    nextMessage &&
    senderKey(nextMessage) === senderId &&
    !nextMessage.isDeleted &&
    !isDeleted,
  );

const messageRowClass = (fromPrev, isOwn) => {
  const gap = fromPrev ? "mt-1" : "mt-4";
  const align = isOwn ? "justify-end" : "justify-start";
  return `group flex ${gap} ${align}`;
};

const messageInnerClass = (isOwn) => {
  const dir = isOwn ? "flex-row-reverse" : "flex-row";
  return `flex max-w-[min(78%,520px)] items-end gap-2 ${dir}`;
};

const bubbleStackClass = (isOwn) => {
  const align = isOwn ? "items-end" : "items-start";
  return `relative flex min-w-0 flex-col gap-1 ${align}`;
};

const bubbleClass = (isOwn, mediaOnly, isDeleted) => {
  const pad = mediaOnly ? "p-1" : "px-3.5 py-2";
  const tone = isOwn
    ? "rounded-[15px] rounded-br-none bg-[var(--theme-accent)] text-white"
    : "rounded-[15px] rounded-bl-none bg-white text-black";
  const faded = isDeleted ? "opacity-60" : "";
  return `relative ${pad} ${tone} ${faded}`;
};

const replyQuoteClass = (isOwn) => {
  if (isOwn) return "mb-1.5 rounded-md mt-1 border-l-4 border-white px-2.5 py-1.5 text-xs bg-white/15 text-white";
  return "mb-1.5 rounded-md mt-1 border-l-4 border-1 bg-gray-100 px-2.5 py-1.5 text-xs border-gray-300 text-black";
};

const editedLabelClass = (isOwn) => {
  if (isOwn) return "mt-0.5 block text-[10px] absolute right-2 uppercase bg-gray-100 text-black -top-5";
  return "mt-0.5 block text-[10px] absolute right-2 uppercase bg-gray-100 text-black -top-5";
};

const actionsBarClass = (isOwn) => {
  const side = isOwn ? "right-full mr-1.5" : "left-full ml-1.5";
  return `absolute top-1 flex items-center gap-0.5 rounded-[12px] border border-black/[0.06] bg-white p-0.5 opacity-0 transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-[#2a2a2c] ${side}`;
};

const profileTitle = (username) => {
  if (username) return `View ${username}'s profile`;
  return "View profile";
};

const shouldShowAttachments = (isDeleted, message) => {
  if (isDeleted) return false;
  return (message.attachments || []).length > 0;
};

const showMessageText = (isDeleted, message) =>
  isDeleted || !isAutoFileCaption(message);

const isMediaOnlyBubble = (showText, message) =>
  !showText && (message.attachments || []).length > 0;

const typingVerb = (count) => (count === 1 ? "is" : "are");

const contextBannerLabel = (editingMessage) =>
  editingMessage ? "Editing" : "Reply";

const contextBannerBody = (editingMessage, replyTo) => {
  if (editingMessage) return editingMessage.content;
  return replyTo?.content;
};

const messagePlaceholder = (editingMessage) =>
  editingMessage ? "Edit message..." : "Write a message";

const emojiPickerTheme = (theme) => (theme === "dark" ? "dark" : "light");

const isSendDisabled = (uploadingFiles, messagesLoading, messageText, pendingFiles) => {
  if (uploadingFiles) return true;
  if (messagesLoading) return true;
  if (!messageText.trim() && pendingFiles.length === 0) return true;
  return false;
};

const attachDisabled = (editingMessage, uploadingFiles) =>
  Boolean(editingMessage) || uploadingFiles;

const FileLink = ({ href, name, size, Icon, own = false }) => {
  const shell = own
    ? "bg-white/15 text-white"
    : "border border-black/[0.06] bg-black/[0.03] text-gray-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white";
  const iconWrap = own ? "bg-white/20" : "bg-[#FF914B]/12 text-[#FF914B]";
  const sizeTone = own ? "text-white/70" : "text-muted-foreground";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 ${shell}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{name}</span>
        {size ? (
          <span className={`block text-[11px] ${sizeTone}`}>{size}</span>
        ) : null}
      </span>
    </a>
  );
};

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
      {loaded ? null : (
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
        {src ? null : (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF914B]" />
          </span>
        )}
        {src ? (
          <embed
            title={name}
            src={src}
            type="application/pdf"
            className="h-full w-full bg-white"
          />
        ) : null}
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
          {size ? (
            <span className="block text-[10px] font-medium text-muted-foreground">
              {size}
            </span>
          ) : null}
        </span>
      </a>
    </div>
  );
};

const ChatEmptyState = () => (
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

const ChatHeader = ({
  isMobile,
  onBack,
  isGroup,
  memberCount,
  otherParticipant,
  onAvatarClick,
  onOpenGroup,
  chatAvatarUrl,
  chatName,
  isOnline,
}) => (
  <div className={headerPadClass(isMobile)}>
    <div className="flex items-center gap-3">
      {isMobile ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-[12px] text-gray-700 hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/10"
          title="Back to chat list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : null}
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => {
          if (isGroup) {
            onOpenGroup?.();
            return;
          }
          if (otherParticipant) {
            onAvatarClick(otherParticipant._id || otherParticipant.id);
          }
        }}
      >
        <div className="relative">
          <Avatar className="chat-avatar h-11 w-11">
            <AvatarImage src={chatAvatarUrl} />
            <AvatarFallback>{chatName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isGroup ? null : <span className={presenceDotClass(isOnline)} />}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-tight text-gray-900 dark:text-white">
            {chatName}
          </h3>
          {isGroup ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </p>
          ) : null}
        </div>
      </button>
      {isGroup ? (
        <button
          type="button"
          onClick={onOpenGroup}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-gray-500 hover:bg-black/[0.05] hover:text-[var(--theme-accent)] dark:hover:bg-white/10"
          title="Group details"
        >
          <Info className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  </div>
);


const ChatMessagesLoading = () => (
  <div className="flex flex-col gap-6 h-full">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className={`flex ${item % 2 === 0 ? "justify-end" : "justify-start"}`}
      >
        <div className="flex items-end gap-3 max-w-[300px]">
          {item % 2 !== 0 ? (
            <Skeleton className="w-10 h-10 rounded-[12px] shrink-0" />
          ) : null}

          <div className="flex flex-col gap-2">
            <Skeleton
              className={`h-12 rounded-[20px] ${item % 2 === 0 ? "w-40" : "w-52"
                }`}
            />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>

          {item % 2 === 0 ? (
            <Skeleton className="w-10 h-10 rounded-[12px] shrink-0" />
          ) : null}
        </div>
      </div>
    ))}
  </div>
);

const ChatMessagesEmpty = () => (
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
);

const MessageAttachment = ({ attachment, messageId, index, isOwn, onOpenImage }) => {
  const href = chatUploadService.fileUrl(attachment);
  const name = chatUploadService.fileName(attachment);
  const size = chatUploadService.formatFileSize(attachment?.size);
  const key = `${messageId}-file-${index}`;

  if (chatUploadService.isImage(attachment)) {
    return (
      <ImageAttachment
        key={key}
        href={href}
        name={name}
        onOpen={() => onOpenImage({ href, name })}
      />
    );
  }

  if (chatUploadService.isPdf(attachment)) {
    return (
      <PdfAttachment key={key} href={href} name={name} size={size} />
    );
  }

  if (chatUploadService.isVideo(attachment)) {
    return (
      <video
        key={key}
        src={href}
        controls
        className="max-h-72 w-full rounded-2xl"
      />
    );
  }

  if (chatUploadService.isAudio(attachment)) {
    return (
      <audio key={key} src={href} controls className="w-full" />
    );
  }

  const Icon = attachmentIcon(attachment);
  return (
    <FileLink
      key={key}
      href={href}
      name={name}
      size={size}
      Icon={Icon}
      own={isOwn}
    />
  );
};

const ChatMessageActions = ({
  isDeleted,
  isOwn,
  message,
  onReply,
  onEdit,
  onDelete,
}) => {
  if (isDeleted) return null;

  return (
    <div className={actionsBarClass(isOwn)}>
    
      {isOwn ? (
        <>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-[12px] text-gray-500 hover:bg-black/[0.05] hover:text-[#FF914B] dark:hover:bg-white/10"
            onClick={() => onEdit(message)}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-[12px] text-gray-500 hover:bg-red-50 hover:text-red-500"
            onClick={() => onDelete(message._id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
};

const isOwnMessage = (senderId, currentUserId) =>
  Boolean(senderId) && senderId === currentUserId;

const ChatMessageAvatar = ({
  toNext,
  message,
  senderAvatar,
  senderLabel,
  onAvatarClick,
}) => {
  if (toNext) return <span className="w-8 shrink-0" />;

  return (
    <Avatar
      className="h-8 w-8 shrink-0 cursor-pointer"
      onClick={() => onAvatarClick(message.sender._id || message.sender.id)}
      title={profileTitle(message.sender.username)}
    >
      <AvatarImage src={resolveAvatarUrl(senderAvatar)} />
      <AvatarFallback>{senderLabel.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};

const TinyPersonAvatar = ({ person, onClick }) => (
  <Avatar
    className="chat-avatar h-4 w-4 cursor-pointer border-0 p-0 ring-2 ring-white dark:ring-[#111]"
    title={person.username}
    onClick={
      onClick
        ? (event) => {
            event.stopPropagation();
            onClick(person.id);
          }
        : undefined
    }
  >
    <AvatarImage className="rounded-full" src={resolveAvatarUrl(person.avatar)} />
    <AvatarFallback className="rounded-full text-[8px]">
      {(person.username || "?").charAt(0).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

const PersonAvatarStack = ({ people }) => {
  if (!people?.length) return null;
  const visible = people.slice(0, 3);
  const extra = people.length - visible.length;

  return (
    <span className="flex items-center -space-x-1">
      {visible.map((person) => (
        <TinyPersonAvatar key={person.id} person={person} />
      ))}
      {extra > 0 ? (
        <span className="pl-1 text-[10px] font-semibold text-muted-foreground">
          +{extra}
        </span>
      ) : null}
    </span>
  );
};

const ReceiptPeople = ({ title, people, onAvatarClick }) => {
  if (!people?.length) return null;
  return (
    <div>
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-0.5">
        {people.map((person) => (
          <li key={`${title}-${person.id}`}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[12px] px-2 py-1.5 text-left hover:bg-black/[0.04] dark:hover:bg-white/10"
              onClick={() => onAvatarClick(person.id)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={resolveAvatarUrl(person.avatar)} />
                <AvatarFallback className="text-[10px]">
                  {(person.username || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-medium text-gray-900 dark:text-white">
                {person.username}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MessageReceipts = ({ seenPeople, repliedPeople, isOwn, onAvatarClick }) => {
  const [open, setOpen] = useState(false);
  if (!seenPeople.length && !repliedPeople.length) return null;

  return (
    <div className={`relative ${isOwn ? "self-end" : "self-start"}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-1.5 py-1 dark:border-white/10 dark:bg-[#1c1c1e]"
        title="Who viewed and replied"
      >
        {seenPeople.length ? (
          <span className="flex items-center gap-1">
            <PersonAvatarStack people={seenPeople} />
          </span>
        ) : null}
        {seenPeople.length && repliedPeople.length ? (
          <span className="h-3 w-px bg-black/10 dark:bg-white/15" />
        ) : null}
        {repliedPeople.length ? (
          <span className="flex items-center gap-1">
            <Reply className="h-3 w-3 text-[#FF914B]" />
            <PersonAvatarStack people={repliedPeople} />
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          className={`absolute bottom-full z-20 mb-1 w-52 rounded-2xl border border-black/[0.06] bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1c1c1e] ${
            isOwn ? "right-0" : "left-0"
          }`}
        >
          <ReceiptPeople
            title="Viewed"
            people={seenPeople}
            onAvatarClick={onAvatarClick}
          />
          {seenPeople.length && repliedPeople.length ? (
            <div className="my-1 h-px bg-black/[0.06] dark:bg-white/10" />
          ) : null}
          <ReceiptPeople
            title="Replied"
            people={repliedPeople}
            onAvatarClick={onAvatarClick}
          />
        </div>
      ) : null}
    </div>
  );
};

const ChatMessageBubble = ({
  message,
  isOwn,
  isDeleted,
  showText,
  mediaOnly,
  onOpenImage,
  tagNames,
  overdueNames,
}) => (
  <div className={bubbleClass(isOwn, mediaOnly, isDeleted)}>

    {shouldShowAttachments(isDeleted, message) ? (
      <div className="mb-2 flex flex-col gap-2">
        {(message.attachments || []).map((attachment, fileIndex) => (
          <MessageAttachment
            key={`${message._id}-file-${fileIndex}`}
            attachment={attachment}
            messageId={message._id}
            index={fileIndex}
            isOwn={isOwn}
            onOpenImage={onOpenImage}
          />
        ))}
      </div>
    ) : null}

    {showText ? (
      <p className="text-[14px] font-normal leading-relaxed whitespace-pre-wrap break-words">
        <TaggedMessage
          content={message.content}
          names={tagNames}
          overdueNames={overdueNames}
        />
      </p>
    ) : null}

    {message.isEdited ? (
      <span className={editedLabelClass(isOwn)}>Edited</span>
    ) : null}
  </div>
);

const ChatMessageItem = ({
  message,
  index,
  messages,
  user,
  directory,
  isGroup,
  seenPeople,
  repliedPeople,
  onAvatarClick,
  onOpenImage,
  onReply,
  onEdit,
  onDelete,
  tagNames,
  overdueNames,
}) => {
  const senderId = senderKey(message);
  const currentUserId = resolveUserId(user);
  const isOwn = isOwnMessage(senderId, currentUserId);
  const isDeleted = message.isDeleted;
  const senderAvatar = resolveSenderAvatar(isOwn, message, user);
  const senderLabel = senderDisplayLabel(message, user);
  const prevMessage = messages[index - 1];
  const nextMessage = messages[index + 1];
  const fromPrev = continuesFromPrev(prevMessage, senderId, isDeleted);
  const toNext = continuesToNext(nextMessage, senderId, isDeleted);
  const showText = showMessageText(isDeleted, message);
  const mediaOnly = isMediaOnlyBubble(showText, message);
  const replyAuthor = message.replyTo
    ? personRecord(message.replyTo.sender, directory)
    : null;

  return (
    <div className={messageRowClass(fromPrev, isOwn)}>
      <div className={messageInnerClass(isOwn)}>
        <ChatMessageAvatar
          toNext={toNext}
          message={message}
          senderAvatar={senderAvatar}
          senderLabel={senderLabel}
          onAvatarClick={onAvatarClick}
        />

        <div className={bubbleStackClass(isOwn)}>
        <ChatMessageBubble
          message={message}
          isOwn={isOwn}
          isDeleted={isDeleted}
          showText={showText}
          mediaOnly={mediaOnly}
          onOpenImage={onOpenImage}
          tagNames={tagNames}
          overdueNames={overdueNames}
        />

          <span className="px-1 text-[11px] text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>

          {isGroup && !isDeleted ? (
            <MessageReceipts
              seenPeople={seenPeople}
              repliedPeople={repliedPeople}
              isOwn={isOwn}
              onAvatarClick={onAvatarClick}
            />
          ) : null}

          <ChatMessageActions
            isDeleted={isDeleted}
            isOwn={isOwn}
            message={message}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

const ChatTypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-[12px] border border-black/[0.06] bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-[#1c1c1e]">
        <div className="h-1.5 w-1.5 animate-bounce rounded-[12px] bg-[#FF914B]"></div>
        <div
          className="h-1.5 w-1.5 animate-bounce rounded-[12px] bg-[#FF914B]"
          style={{ animationDelay: "0.15s" }}
        ></div>
        <div
          className="h-1.5 w-1.5 animate-bounce rounded-[12px] bg-[#FF914B]"
          style={{ animationDelay: "0.3s" }}
        ></div>
      </div>
      <span className="text-xs text-muted-foreground">
        {typingUsers.map((u) => u.userName).join(", ")}{" "}
        {typingVerb(typingUsers.length)} typing
      </span>
    </div>
  );
};

const ChatMessagesList = ({
  messages,
  user,
  participants,
  isGroup,
  onAvatarClick,
  onOpenImage,
  onReply,
  onEdit,
  onDelete,
  tagNames,
  overdueNames,
}) => {
  const directory = buildPeopleDirectory(participants, messages, user);
  const seenMap = viewersByMessageId(messages, directory);
  const replyMap = repliesByMessageId(messages, directory);

  return (
    <>
      {messages.map((message, index) => (
        <ChatMessageItem
          key={message._id}
          message={message}
          index={index}
          messages={messages}
          user={user}
          directory={directory}
          isGroup={isGroup}
          seenPeople={seenMap.get(String(message._id)) || []}
          repliedPeople={replyMap.get(String(message._id)) || []}
          onAvatarClick={onAvatarClick}
          onOpenImage={onOpenImage}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          tagNames={tagNames}
          overdueNames={overdueNames}
        />
      ))}
    </>
  );
};

const ChatMessagesPane = ({
  isMobile,
  messagesContainerRef,
  messagesLoading,
  messages,
  user,
  participants,
  isGroup,
  typingUsers,
  messagesEndRef,
  onAvatarClick,
  onOpenImage,
  onReply,
  onEdit,
  onDelete,
  groupMembers,
  onOpenGroup,
  tagNames,
  overdueNames,
}) => {
  let body = <ChatMessagesList
    messages={messages}
    user={user}
    participants={participants}
    isGroup={isGroup}
    onAvatarClick={onAvatarClick}
    onOpenImage={onOpenImage}
    onReply={onReply}
    onEdit={onEdit}
    onDelete={onDelete}
    tagNames={tagNames}
    overdueNames={overdueNames}
  />;
  if (messagesLoading) body = <ChatMessagesLoading />;
  else if (messages.length === 0) body = <ChatMessagesEmpty />;

  return (
    <div ref={messagesContainerRef} className={messagesPadClass(isMobile)}>
      {body}
      <ChatTypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatPendingFiles = ({ pendingFiles, onRemove }) => {
  if (pendingFiles.length === 0) return null;

  return (
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
              className="h-9 w-9 rounded-[15px] object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-[#FF914B]/10 text-[#FF914B]">
              <FileText className="h-4 w-4" />
            </span>
          )}
          <span className="max-w-[140px] truncate text-xs font-medium">
            {item.file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-[12px] p-1 text-gray-500 hover:text-red-500"
            title="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const ChatContextBanner = ({
  replyTo,
  editingMessage,
  onCancel,
}) => {
  if (!replyTo && !editingMessage) return null;

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-[#FF914B]/20 bg-[#FF914B]/10 px-3 py-2">
      <div className="min-w-0 border-l-2 border-[#FF914B] pl-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FF914B]">
          {contextBannerLabel(editingMessage)}
        </p>
        <p className="truncate text-xs text-gray-600 dark:text-gray-300">
          {contextBannerBody(editingMessage, replyTo)}
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[12px] text-gray-500 hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/10"
        title="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const MentionMenu = ({
  people,
  activeIndex,
  overdueById,
  overdueCount,
  showOverdue,
  onPick,
  onTagOverdue,
}) => (
    <div className="mb-2 max-h-64 overflow-y-auto rounded-[15px] border border-black/[0.06] bg-white shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
    {people.length === 0 ? (
      <p className="px-3 py-3 text-xs text-muted-foreground">No one matches that tag</p>
    ) : (
      people.map((person, index) => {
        const titles = overdueById[person.id] || [];
        return (
          <button
            key={person.id}
            type="button"
            onClick={() => onPick(person)}
            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left ${
              index === activeIndex ? "bg-[#FF914B]/10" : "hover:bg-black/[0.03] dark:hover:bg-white/5"
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                {person.username}
              </span>
              {titles.length ? (
                <span className="block truncate text-[11px] text-red-500">
                  {titles[0]}
                  {titles.length > 1 ? ` +${titles.length - 1}` : ""}
                </span>
              ) : null}
            </span>
            {titles.length ? (
              <span className={`shrink-0 rounded-[10px] px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeTone("overdue")}`}>
                Overdue
              </span>
            ) : null}
          </button>
        );
      })
    )}
  </div>
);

const ChatComposerForm = ({
  onSubmit,
  fileInputRef,
  inputRef,
  emojiPickerRef,
  messageText,
  onTyping,
  onKeyDown,
  editingMessage,
  uploadingFiles,
  messagesLoading,
  pendingFiles,
  showEmojiPicker,
  onToggleEmoji,
  onEmojiClick,
  theme,
  mentionOpen,
  mentionPeople,
  mentionIndex,
  overdueById,
  overdueCount,
  showOverdue,
  onPickMention,
  onTagOverdue,
  onInsertAt,
}) => (
  <form onSubmit={onSubmit} className="flex items-end gap-2">
    <div className="min-w-0 flex-1">
      {mentionOpen ? (
        <MentionMenu
          people={mentionPeople}
          activeIndex={mentionIndex}
          overdueById={showOverdue ? overdueById : {}}
          overdueCount={overdueCount}
          showOverdue={showOverdue}
          onPick={onPickMention}
          onTagOverdue={onTagOverdue}
        />
      ) : null}
      <div className="chat-composer flex flex-1 items-center gap-1 border border-black/[0.06] bg-[#f6f7f8] px-1.5 transition-colors focus-within:border-[var(--theme-accent)]/50 dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 disabled:opacity-40 dark:hover:bg-white/10"
        onClick={() => fileInputRef.current?.click()}
        disabled={attachDisabled(editingMessage, uploadingFiles)}
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      <Input
        ref={inputRef}
        value={messageText}
        onChange={onTyping}
        onKeyDown={onKeyDown}
        placeholder={messagePlaceholder(editingMessage)}
        className="h-11 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
        disabled={messagesLoading}
      />

      <div
        className="relative emoji-picker-wrapper shrink-0"
        ref={emojiPickerRef}
      >
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-[12px] text-gray-500 hover:bg-white hover:text-[#FF914B] dark:hover:bg-white/10"
          onClick={onToggleEmoji}
          title="Emoji"
        >
          <Smile className="h-4 w-4" />
        </button>

        {showEmojiPicker ? (
          <div className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-2xl">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              autoFocusSearch={false}
              theme={emojiPickerTheme(theme)}
              width={320}
              height={380}
            />
          </div>
        ) : null}
      </div>
      </div>
    </div>

    <button
      type="submit"
      disabled={isSendDisabled(
        uploadingFiles,
        messagesLoading,
        messageText,
        pendingFiles,
      )}
      className="chat-composer flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--theme-accent)] text-white transition-colors hover:bg-[var(--theme-accent-2)] disabled:opacity-40"
      title="Send message"
    >
      {uploadingFiles ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </button>
  </form>
);

const ChatComposer = ({
  isMobile,
  pendingFiles,
  onRemovePending,
  replyTo,
  editingMessage,
  onCancelContext,
  onSubmit,
  fileInputRef,
  inputRef,
  emojiPickerRef,
  messageText,
  onTyping,
  onKeyDown,
  uploadingFiles,
  mentionOpen,
  mentionPeople,
  mentionIndex,
  overdueById,
  overdueCount,
  showOverdue,
  onPickMention,
  onTagOverdue,
  onInsertAt,
  messagesLoading,
  showEmojiPicker,
  onToggleEmoji,
  onEmojiClick,
  theme,
  onFileUpload,
}) => (
  <div className={composerPadClass(isMobile)}>
    <ChatPendingFiles pendingFiles={pendingFiles} onRemove={onRemovePending} />
    <ChatContextBanner
      replyTo={replyTo}
      editingMessage={editingMessage}
      onCancel={onCancelContext}
    />
    <ChatComposerForm
      onSubmit={onSubmit}
      fileInputRef={fileInputRef}
      inputRef={inputRef}
      emojiPickerRef={emojiPickerRef}
      messageText={messageText}
      onTyping={onTyping}
      onKeyDown={onKeyDown}
      editingMessage={editingMessage}
      mentionOpen={mentionOpen}
      mentionPeople={mentionPeople}
      mentionIndex={mentionIndex}
      overdueById={overdueById}
      overdueCount={overdueCount}
      showOverdue={showOverdue}
      onPickMention={onPickMention}
      onTagOverdue={onTagOverdue}
      onInsertAt={onInsertAt}
      uploadingFiles={uploadingFiles}
      messagesLoading={messagesLoading}
      pendingFiles={pendingFiles}
      showEmojiPicker={showEmojiPicker}
      onToggleEmoji={onToggleEmoji}
      onEmojiClick={onEmojiClick}
      theme={theme}
    />
    <input
      ref={fileInputRef}
      type="file"
      multiple
      onChange={onFileUpload}
      className="hidden"
    />
  </div>
);

const ChatImagePreview = ({ imagePreview, onClose }) => {
  if (!imagePreview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/95 text-gray-800"
        onClick={onClose}
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
  );
};

const ChatScrollButton = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      type="button"
      className="absolute bottom-24 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-[12px] border border-black/[0.08] bg-white text-gray-700 hover:text-[#FF914B] dark:border-white/10 dark:bg-[#2a2a2c] dark:text-white"
      onClick={onClick}
    >
      <ArrowDown className="h-4 w-4" />
    </button>
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

  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const [messageText, setMessageText] = useState("");
  const [mention, setMention] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [overdueById, setOverdueById] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
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
    setShowGroupDetails(false);
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
      setMention(null);
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
      setMention(null);
      clearPendingFiles();
      stopTyping(currentChat._id);
      scrollToBottomLocal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send that file");
    } finally {
      setUploadingFiles(false);
    }
  };

  const tagPeople = useMemo(
    () => chatTagPeople(currentChat?.participants, user),
    [currentChat?.participants, user],
  );

  const mentionPeople = useMemo(() => {
    const query = (mention?.query || "").trim().toLowerCase();
    return tagPeople
      .filter((person) => !query || person.username.toLowerCase().includes(query))
      .sort((a, b) => {
        const aLate = overdueById[a.id]?.length ? 0 : 1;
        const bLate = overdueById[b.id]?.length ? 0 : 1;
        if (aLate !== bLate) return aLate - bLate;
        return a.username.localeCompare(b.username);
      });
  }, [tagPeople, mention?.query, overdueById]);

  const overdueNames = useMemo(
    () =>
      tagPeople
        .filter((person) => overdueById[person.id]?.length)
        .map((person) => person.username),
    [tagPeople, overdueById],
  );

  useEffect(() => {
    let cancelled = false;
    const people = chatTagPeople(currentChat?.participants, user);
    if (!currentChat?._id || !people.length) {
      setOverdueById({});
      return undefined;
    }

    const load = async () => {
      const entries = await Promise.all(
        people.map(async (person) => {
          try {
            const response = await taskService.getTasks({ assignTo: person.id });
            const titles = (response.tasks || [])
              .filter((task) => canAssignOverdueTag(task, user, isAdmin))
              .map((task) => task.title)
              .filter(Boolean);
            return [person.id, titles];
          } catch {
            return [person.id, []];
          }
        }),
      );
      if (!cancelled) {
        setOverdueById(Object.fromEntries(entries.filter(([, titles]) => titles.length)));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentChat?._id, currentChat?.participants, user, isAdmin]);

  const handleTyping = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart ?? value.length;
    setMessageText(value);
    setMention(mentionAtCursor(value, cursor));
    setMentionIndex(0);

    if (currentChat) {
      if (value.trim()) {
        startTyping(currentChat._id);
      } else {
        stopTyping(currentChat._id);
      }
    }
  };

  const insertMention = (person) => {
    const start = mention?.start ?? messageText.length;
    const cursor = inputRef.current?.selectionStart ?? messageText.length;
    const next = `${messageText.slice(0, start)}@${person.username} ${messageText.slice(cursor)}`;
    const caret = start + person.username.length + 2;
    setMessageText(next);
    setMention(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const tagOverduePeople = () => {
    const names = overdueNames.map((name) => `@${name}`);
    if (!names.length) {
      toast.error("Nobody in this chat has an overdue task");
      return;
    }
    const prefix = messageText && !/\s$/.test(messageText) ? `${messageText} ` : messageText;
    setMessageText(`${prefix}${names.join(" ")} `);
    setMention(null);
    inputRef.current?.focus();
  };

  const insertAtSign = () => {
    const cursor = inputRef.current?.selectionStart ?? messageText.length;
    const before = messageText.slice(0, cursor);
    const after = messageText.slice(cursor);
    const needsSpace = before && !/\s$/.test(before);
    const next = `${before}${needsSpace ? " " : ""}@${after}`;
    const caret = before.length + (needsSpace ? 2 : 1);
    setMessageText(next);
    setMention({ query: "", start: caret - 1 });
    setMentionIndex(0);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const handleKeyDown = (e) => {
    if (mention) {
      if (e.key === "ArrowDown" && mentionPeople.length) {
        e.preventDefault();
        setMentionIndex((index) => (index + 1) % mentionPeople.length);
        return;
      }
      if (e.key === "ArrowUp" && mentionPeople.length) {
        e.preventDefault();
        setMentionIndex((index) => (index - 1 + mentionPeople.length) % mentionPeople.length);
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && mentionPeople[mentionIndex]) {
        e.preventDefault();
        insertMention(mentionPeople[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMention(null);
        return;
      }
    }
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

    const room = MAX_CHAT_FILES - pendingFiles.length;
    if (accepted.length > room) {
      accepted.slice(Math.max(room, 0)).forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      toast.error(`You can attach up to ${MAX_CHAT_FILES} files`);
    }
    if (room <= 0) return;
    const nextFiles = accepted.slice(0, room);
    setPendingFiles((current) => [...current, ...nextFiles]);
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

  const typingUsers = typingUsersFor(currentChat, getTypingUsers);
  const currentUserId = resolveUserId(user);
  const isGroup = currentChat?.type === "group";
  const otherParticipant = isGroup
    ? null
    : findOtherParticipant(currentChat, currentUserId);
  const isOnline = resolveOnline(otherParticipant, isUserOnline);
  const groupMembers = isGroup ? currentChat.participants || [] : null;

  if (!currentChat) {
    return <ChatEmptyState />;
  }

  return (
    <div className={chatShellClass(isMobile)}>
      <ChatHeader
        isMobile={isMobile}
        onBack={() => setCurrentChat(null)}
        isGroup={isGroup}
        memberCount={groupMembers?.length || 0}
        otherParticipant={otherParticipant}
        onAvatarClick={handleUserAvatarClick}
        onOpenGroup={() => setShowGroupDetails(true)}
        chatAvatarUrl={resolveAvatarUrl(getChatAvatar(currentChat))}
        chatName={getChatName(currentChat)}
        isOnline={isOnline}
      />

      <div className="flex relative flex-col h-full overflow-hidden">
        <ChatMessagesPane
          isMobile={isMobile}
          messagesContainerRef={messagesContainerRef}
          messagesLoading={messagesLoading}
          messages={messages}
          user={user}
          participants={currentChat?.participants}
          isGroup={isGroup}
          groupMembers={groupMembers}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          onAvatarClick={handleUserAvatarClick}
          onOpenImage={setImagePreview}
          onReply={handleReplyToMessage}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onOpenGroup={() => setShowGroupDetails(true)}
          tagNames={[
            ...tagPeople.map((person) => person.username),
            user?.username,
          ].filter(Boolean)}
          overdueNames={overdueNames}
        />

        <ChatScrollButton
          show={showScrollButton}
          onClick={scrollToBottomLocal}
        />

        <ChatComposer
          isMobile={isMobile}
          pendingFiles={pendingFiles}
          onRemovePending={removePendingFile}
          replyTo={replyTo}
          editingMessage={editingMessage}
          onCancelContext={() => {
            setReplyTo(null);
            setEditingMessage(null);
            setMessageText("");
            setMention(null);
          }}
          onSubmit={handleSendMessage}
          fileInputRef={fileInputRef}
          inputRef={inputRef}
          emojiPickerRef={emojiPickerRef}
          messageText={messageText}
          onTyping={handleTyping}
          onKeyDown={handleKeyDown}
          mentionOpen={Boolean(mention)}
          mentionPeople={mentionPeople}
          mentionIndex={mentionIndex}
          overdueById={overdueById}
          overdueCount={overdueNames.length}
          showOverdue={overdueNames.length > 0}
          onPickMention={insertMention}
          onTagOverdue={tagOverduePeople}
          onInsertAt={insertAtSign}
          uploadingFiles={uploadingFiles}
          messagesLoading={messagesLoading}
          showEmojiPicker={showEmojiPicker}
          onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
          onEmojiClick={handleEmojiClick}
          theme={theme}
          onFileUpload={handleFileUpload}
        />
      </div>

      <ChatImagePreview
        imagePreview={imagePreview}
        onClose={() => setImagePreview(null)}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUserId(null);
        }}
      />

      <GroupDetailsModal
        isOpen={showGroupDetails}
        chat={currentChat}
        currentUserId={currentUserId}
        isUserOnline={isUserOnline}
        onClose={() => setShowGroupDetails(false)}
        onMemberClick={handleUserAvatarClick}
      />
    </div>
  );
};

export default ChatWindow;
