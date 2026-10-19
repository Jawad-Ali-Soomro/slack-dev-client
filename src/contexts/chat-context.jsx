import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { useNotifications } from "./notification-context";
import { chatService } from "../services/chat-service";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    addNotification,
    applyNotificationUpdate,
    removeNotificationLocal,
    loadNotifications,
  } = useNotifications();
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);
  const socketInitialized = useRef(false);
  const messageIdsRef = useRef(new Set());
  const currentChatRef = useRef(currentChat);
  const chatsRef = useRef(chats);
  const userIdRef = useRef("");
  const readTimersRef = useRef({});
  const socketRef = useRef(null);
  const notificationHandlersRef = useRef({
    addNotification,
    applyNotificationUpdate,
    removeNotificationLocal,
    loadNotifications,
  });
  notificationHandlersRef.current = {
    addNotification,
    applyNotificationUpdate,
    removeNotificationLocal,
    loadNotifications,
  };

  currentChatRef.current = currentChat;
  chatsRef.current = chats;

  const normalizeId = (id) => (id == null ? "" : String(id));

  userIdRef.current = normalizeId(user?.id || user?._id);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    messageIdsRef.current = new Set(messages.keys());
  }, [messages]);

  const addMessage = useCallback(
    (message) => {
      const messageId = normalizeId(message._id);
      if (!messageId || messageIdsRef.current.has(messageId)) return;
      messageIdsRef.current.add(messageId);
      const senderId = normalizeId(
        message.sender?._id || message.sender?.id || message.sender,
      );

      setMessages((prev) => {
        const next = new Map(prev);
        const incomingChat = normalizeId(message.chat);
        let carriedReads = [];
        for (const [id, existing] of next) {
          if (!existing?.pending) continue;
          if (normalizeId(existing.chat) !== incomingChat) continue;
          const existingSender = normalizeId(
            existing.sender?._id || existing.sender?.id || existing.sender,
          );
          if (existingSender !== senderId) continue;
          if ((existing.content || "") !== (message.content || "")) continue;
          carriedReads = existing.readBy || [];
          next.delete(id);
          messageIdsRef.current.delete(normalizeId(id));
          break;
        }
        if (!next.has(messageId)) {
          next.set(messageId, {
            ...message,
            readBy: message.readBy?.length ? message.readBy : carriedReads,
          });
        }
        return next;
      });

      const chatId = normalizeId(message.chat);
      setChats((prev) => {
        const chatIndex = prev.findIndex(
          (chat) => normalizeId(chat._id) === chatId,
        );
        if (chatIndex === -1) return prev;

        const updated = [...prev];
        const chat = updated[chatIndex];

        const currentLastMessageDate = chat.lastMessage?.createdAt
          ? new Date(chat.lastMessage.createdAt)
          : new Date(0);
        const newMessageDate = message.createdAt
          ? new Date(message.createdAt)
          : new Date();

        if (newMessageDate > currentLastMessageDate) {
          updated[chatIndex] = {
            ...chat,
            lastMessage: message,
            updatedAt: new Date(),
          };

          const [movedChat] = updated.splice(chatIndex, 1);
          return [movedChat, ...updated];
        }

        return updated;
      });

      if (normalizeId(currentChatRef.current?._id) === chatId) {
        setTimeout(() => scrollToBottom(), 100);
        if (senderId && senderId !== userIdRef.current) {
          clearTimeout(readTimersRef.current[chatId]);
          readTimersRef.current[chatId] = setTimeout(() => {
            chatService.markAsRead(chatId).catch(() => {});
          }, 250);
        }
      }
    },
    [scrollToBottom],
  );

  const joinAllChats = useCallback((activeSocket) => {
    if (!activeSocket) return;
    chatsRef.current.forEach((chat) => {
      if (chat?._id) {
        activeSocket.emit("join_chat", chat._id);
      }
    });
    if (currentChatRef.current?._id) {
      activeSocket.emit("join_chat", currentChatRef.current._id);
    }
  }, []);

  useEffect(() => {
    if (!user || !isAuthenticated || socketInitialized.current) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    let hasConnectedOnce = false;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      socketInitialized.current = true;
      joinAllChats(newSocket);
      if (hasConnectedOnce) {
        notificationHandlersRef.current.loadNotifications?.({ silent: true });
      }
      hasConnectedOnce = true;
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      setIsConnected(false);
      setError(error?.message || "Connection failed");
    });

    newSocket.on("online_users", (users) => {
      setOnlineUsers(
        users.map((u) => ({
          ...u,
          userId: normalizeId(u.userId),
          isOnline: true,
        })),
      );
    });

    newSocket.on("new_message", addMessage);

    newSocket.on("chat_updated", (updatedChat) => {
      setChats((prev) => {
        const index = prev.findIndex(
          (c) => normalizeId(c._id) === normalizeId(updatedChat._id),
        );

        if (index === -1) {
          return [updatedChat, ...prev];
        }

        const newChats = [...prev];
        newChats.splice(index, 1);
        return [updatedChat, ...newChats];
      });
      setCurrentChat((prev) =>
        prev && normalizeId(prev._id) === normalizeId(updatedChat._id)
          ? { ...prev, ...updatedChat }
          : prev,
      );
    });

    newSocket.on("removed_from_chat", ({ chatId }) => {
      const removedId = normalizeId(chatId);
      setChats((prev) => prev.filter((chat) => normalizeId(chat._id) !== removedId));
      setCurrentChat((prev) =>
        prev && normalizeId(prev._id) === removedId ? null : prev,
      );
    });

    newSocket.on("message_updated", (message) => {
      setMessages((prev) => {
        const newMessages = new Map(prev);
        if (newMessages.has(message._id)) {
          newMessages.set(message._id, message);
        }
        return newMessages;
      });
    });

    newSocket.on("message_deleted", (data) => {
      setMessages((prev) => {
        const newMessages = new Map(prev);
        if (newMessages.has(data.messageId)) {
          const msg = newMessages.get(data.messageId);
          newMessages.set(data.messageId, {
            ...msg,
            isDeleted: true,
            content: "This message was deleted",
          });
        }
        return newMessages;
      });
    });

    newSocket.on("user_online", (data) => {
      const userId = normalizeId(data.userId);
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => normalizeId(u.userId) === userId);
        if (exists) {
          return prev.map((u) =>
            normalizeId(u.userId) === userId
              ? {
                  ...u,
                  ...data,
                  userId,
                  isOnline: true,
                  lastSeen: data.lastSeen,
                }
              : u,
          );
        }
        return [...prev, { ...data, userId, isOnline: true }];
      });
    });

    newSocket.on("user_offline", (data) => {
      const userId = normalizeId(data.userId);
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => normalizeId(u.userId) === userId);
        if (!exists) {
          return [...prev, { ...data, userId, isOnline: false }];
        }
        return prev.map((u) =>
          normalizeId(u.userId) === userId
            ? { ...u, isOnline: false, lastSeen: data.lastSeen }
            : u,
        );
      });
    });

    newSocket.on("user_typing", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.chatId]: data.isTyping
          ? [
              ...(prev[data.chatId] || []).filter(
                (u) => u.userId !== data.userId,
              ),
              data,
            ]
          : (prev[data.chatId] || []).filter((u) => u.userId !== data.userId),
      }));
    });

    newSocket.on("message_read", (data) => {
      setMessages((prev) => {
        const newMessages = new Map(prev);
        if (newMessages.has(data.messageId)) {
          const msg = newMessages.get(data.messageId);
          newMessages.set(data.messageId, {
            ...msg,
            readBy: [
              ...(msg.readBy || []),
              { user: data.userId, readAt: data.readAt },
            ],
          });
        }
        return newMessages;
      });
    });

    newSocket.on("messages_seen", (data) => {
      const readerId = normalizeId(data.userId);
      const chatId = normalizeId(data.chatId);
      if (!readerId) return;
      const reader = {
        _id: readerId,
        id: readerId,
        username: data.username || data.userName || "User",
        avatar: data.avatar || null,
      };
      setMessages((prev) => {
        const next = new Map(prev);
        let changed = false;
        next.forEach((msg, id) => {
          const messageChat = normalizeId(msg.chat?._id || msg.chat?.id || msg.chat);
          if (chatId && messageChat && messageChat !== chatId) return;
          const senderId = normalizeId(msg.sender?._id || msg.sender?.id || msg.sender);
          if (senderId === readerId) return;
          const already = (msg.readBy || []).some((read) => {
            const seenId =
              typeof read.user === "object"
                ? normalizeId(read.user._id || read.user.id)
                : normalizeId(read.user);
            return seenId === readerId;
          });
          if (already) return;
          changed = true;
          next.set(id, {
            ...msg,
            readBy: [...(msg.readBy || []), { user: reader, readAt: data.readAt }],
          });
        });
        return changed ? next : prev;
      });
    });

    newSocket.on("new_notification", (notification) => {
      notificationHandlersRef.current.addNotification?.(notification);
    });

    newSocket.on("notification_updated", (notification) => {
      notificationHandlersRef.current.applyNotificationUpdate?.(notification);
    });

    newSocket.on("notification_deleted", (data) => {
      notificationHandlersRef.current.removeNotificationLocal?.(
        data?.id || data?.notificationId,
      );
    });

    newSocket.on("task_updated", (task) => {
      window.dispatchEvent(new CustomEvent("tasks:changed", { detail: task }));
    });

    newSocket.on("workspace_status", (status) => {
      window.dispatchEvent(
        new CustomEvent("workspace:status", { detail: status }),
      );
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    socketInitialized.current = true;

    return () => {
      if (newSocket) {
        newSocket.off("new_message", addMessage);
        newSocket.off("new_notification");
        newSocket.off("notification_updated");
        newSocket.off("notification_deleted");
        newSocket.off("task_updated");
        newSocket.off("workspace_status");
        newSocket.close();
      }
      socketRef.current = null;
      socketInitialized.current = false;
    };
  }, [user?.id, isAuthenticated, addMessage, joinAllChats]);

  useEffect(() => {
    if (!socket || !isConnected || chats.length === 0) return;
    joinAllChats(socket);
  }, [socket, isConnected, chats, joinAllChats]);

  useEffect(() => {
    if (user && !loading) {
      loadChats();
      loadUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !currentChat?._id) return;

    socket.emit("join_chat", currentChat._id);
    loadMessages(currentChat._id);

    const markAsRead = async () => {
      try {
        await chatService.markAsRead(currentChat._id);
        loadUnreadCount();
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    markAsRead();
  }, [currentChat?._id, socket]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getUserChats();
      setChats(response.data);
    } catch (err) {
      setError("Failed to load chats");
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId = currentChat?._id) => {
    if (!chatId) {
      setMessages(new Map());
      messageIdsRef.current.clear();
      return;
    }

    const normalizedChatId = normalizeId(chatId);

    try {
      setMessagesLoading(true);

      const response = await chatService.getChatMessages(chatId);

      setMessages((prev) => {
        const merged = new Map();

        response.data.forEach((message) => {
          const id = normalizeId(message._id);
          merged.set(id, message);
        });

        prev.forEach((message, id) => {
          if (
            normalizeId(message.chat) === normalizedChatId &&
            !merged.has(id)
          ) {
            merged.set(id, message);
          }
        });

        return merged;
      });

      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  };

  const createChat = async (
    participants,
    type = "direct",
    name = null,
    description = null,
    logo = null,
  ) => {
    try {
      setLoading(true);

      if (type === "direct" && participants.length === 1) {
        const currentUserId = user?.id || user?._id;
        const existingChat = chats.find((chat) => {
          if (chat.type !== "direct" || chat.participants.length !== 2)
            return false;

          const participantIds = chat.participants.map((p) => p._id || p.id);
          return (
            participantIds.includes(currentUserId) &&
            participantIds.includes(participants[0])
          );
        });

        if (existingChat) {
          setCurrentChat(existingChat);
          return existingChat;
        }
      }

      const response = await chatService.createChat({
        participants,
        type,
        name,
        description,
        logo: logo?.logo,
        logoPublicId: logo?.logoPublicId,
      });

      const existingChatInList = chats.find(
        (chat) => chat._id === response.data._id,
      );

      if (!existingChatInList) {
        setChats((prev) => [response.data, ...prev]);
      }

      setCurrentChat(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to create chat");
      console.error("Error creating chat:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (chatId, updates) => {
    const response = await chatService.updateGroup(chatId, updates);
    const updated = response.data;
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === updated._id ? { ...chat, ...updated } : chat,
      ),
    );
    setCurrentChat((prev) =>
      prev && prev._id === updated._id ? { ...prev, ...updated } : prev,
    );
    return updated;
  };

  const removeGroupMember = async (chatId, memberId) => {
    const response = await chatService.removeGroupMember(chatId, memberId);
    const updated = response.data;
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === updated._id ? { ...chat, ...updated } : chat,
      ),
    );
    setCurrentChat((prev) =>
      prev && prev._id === updated._id ? { ...prev, ...updated } : prev,
    );
    return updated;
  };

  const sendMessage = async (
    content,
    type = "text",
    attachments = [],
    replyTo = null,
  ) => {
    const trimmed = (content || "").trim();
    if (!currentChat || (!trimmed && attachments.length === 0)) return;

    const clientId = `pending:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const senderId = user?.id || user?._id;
    const replyId = replyTo?._id || replyTo || null;
    const replyPreview =
      replyTo && typeof replyTo === "object"
        ? {
            _id: replyTo._id,
            content: replyTo.content,
            sender: replyTo.sender,
          }
        : undefined;

    const previewContent =
      trimmed ||
      (attachments.length === 1
        ? attachments[0]?.name || "Sent a file"
        : attachments.length > 1
          ? `Sent ${attachments.length} files`
          : "");

    addMessage({
      _id: clientId,
      chat: currentChat._id,
      sender: {
        _id: senderId,
        username: user?.username,
        name: user?.username,
        email: user?.email,
        avatar: user?.avatar,
      },
      content: previewContent,
      type,
      attachments,
      replyTo: replyPreview,
      createdAt: new Date().toISOString(),
      pending: true,
      readBy: [],
    });

    try {
      const response = await chatService.sendMessage({
        chatId: currentChat._id,
        content: trimmed,
        type,
        attachments,
        replyTo: replyId || undefined,
      });

      const message = response.data;
      if (message?._id) {
        const messageId = normalizeId(message._id);
        messageIdsRef.current.delete(clientId);
        messageIdsRef.current.add(messageId);
        setMessages((prev) => {
          const next = new Map(prev);
          next.delete(clientId);
          next.set(messageId, message);
          return next;
        });
      }

      return message;
    } catch (err) {
      messageIdsRef.current.delete(clientId);
      setMessages((prev) => {
        const next = new Map(prev);
        next.delete(clientId);
        return next;
      });
      setError("Failed to send message");
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const updateMessage = async (messageId, content) => {
    try {
      const response = await chatService.updateMessage(messageId, { content });
      setMessages((prev) => {
        const newMessages = new Map(prev);
        if (newMessages.has(messageId)) {
          newMessages.set(messageId, response.data);
        }
        return newMessages;
      });
    } catch (err) {
      setError("Failed to update message");
      console.error("Error updating message:", err);
      throw err;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => {
        const newMessages = new Map(prev);
        if (newMessages.has(messageId)) {
          const msg = newMessages.get(messageId);
          newMessages.set(messageId, {
            ...msg,
            isDeleted: true,
            content: "This message was deleted",
          });
        }
        return newMessages;
      });
    } catch (err) {
      setError("Failed to delete message");
      console.error("Error deleting message:", err);
      throw err;
    }
  };

  const joinChat = (chatId) => {
    if (socket && chatId) {
      socket.emit("join_chat", chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && chatId) {
      socket.emit("leave_chat", chatId);
    }
  };

  const startTyping = (chatId) => {
    if (socket && chatId) {
      socket.emit("typing_start", { chatId });

      clearTimeout(typingTimeoutRef.current[chatId]);
      typingTimeoutRef.current[chatId] = setTimeout(() => {
        stopTyping(chatId);
      }, 3000);
    }
  };

  const stopTyping = (chatId) => {
    if (socket && chatId) {
      socket.emit("typing_stop", { chatId });
      clearTimeout(typingTimeoutRef.current[chatId]);
      delete typingTimeoutRef.current[chatId];
    }
  };

  const getChatName = (chat) => {
    if (chat.type === "group") {
      return chat.name;
    }

    if (!chat.participants || chat.participants.length === 0) {
      return "Unknown User";
    }

    const currentUserId = user?.id || user?._id;
    const otherParticipant = chat.participants.find((p) => {
      const participantId = p._id || p.id;
      return (
        participantId && participantId.toString() !== currentUserId?.toString()
      );
    });

    if (!otherParticipant) {
      return "Unknown User";
    }

    return otherParticipant.username || otherParticipant.name || "Unknown User";
  };

  const getChatAvatar = (chat) => {
    if (chat.type === "group") {
      return chat.logo || chat.avatar || null;
    }

    if (!chat.participants || chat.participants.length === 0) {
      return null;
    }

    const currentUserId = user?.id || user?._id;
    const otherParticipant = chat.participants.find((p) => {
      const participantId = p._id || p.id;
      return (
        participantId && participantId.toString() !== currentUserId?.toString()
      );
    });

    return otherParticipant?.avatar || null;
  };

  const isUserOnline = (userId) => {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) return false;
    const onlineUser = onlineUsers.find(
      (u) => normalizeId(u.userId) === normalizedUserId,
    );
    return onlineUser?.isOnline === true;
  };

  const getTypingUsers = (chatId) => {
    return typingUsers[chatId] || [];
  };

  const messagesArray = Array.from(messages.values())
    .filter(
      (message) =>
        !currentChat ||
        normalizeId(message.chat) === normalizeId(currentChat._id),
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const value = {
    chats,
    currentChat,
    messages: messagesArray,
    unreadCount,
    onlineUsers,
    typingUsers,
    isConnected,
    loading,
    error,
    messagesEndRef,
    messagesLoading,
    createChat,
    updateGroup,
    removeGroupMember,
    setCurrentChat,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadChats,
    loadMessages,
    loadUnreadCount,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    scrollToBottom,
    getChatName,
    getChatAvatar,
    isUserOnline,
    getTypingUsers,
    setError,
    socket,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
