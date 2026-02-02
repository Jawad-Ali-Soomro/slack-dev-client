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
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { chatService } from "../services/chatService";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(new Map()); // Use Map for better performance
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);
  const socketInitialized = useRef(false);
  const messageIdsRef = useRef(new Set()); // Track message IDs to prevent duplicates

  useEffect(() => {
    if (!user || !token || socketInitialized.current) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

    const newSocket = io(apiUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      socketInitialized.current = true;
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason !== "io client disconnect") {
        setTimeout(() => {
          newSocket.connect();
        }, 3000);
      }
    });

    newSocket.on("connect_error", (error) => {
      setIsConnected(false);
      setError("Connection failed: " + error.message);
      setTimeout(() => {
        if (!isConnected) {
          newSocket.connect();
        }
      }, 5000);
    });

    newSocket.on("online_users", (users) => {
      setOnlineUsers(
        users.map((u) => ({
          ...u,
          isOnline: true,
        }))
      );
    });

    newSocket.on("new_message", handleNewMessage);

    newSocket.on("chat_updated", (updatedChat) => {
      setChats((prev) => {
        const index = prev.findIndex((c) => c._id === updatedChat._id);

        if (index === -1) {
          return [updatedChat, ...prev];
        }

        const newChats = [...prev];
        newChats.splice(index, 1);
        return [updatedChat, ...newChats];
      });
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
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (exists) {
          return prev.map((u) =>
            u.userId === data.userId
              ? { ...u, isOnline: true, lastSeen: data.lastSeen }
              : u
          );
        }
        return [...prev, { ...data, isOnline: true }];
      });
    });

    newSocket.on("user_offline", (data) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId
            ? { ...u, isOnline: false, lastSeen: data.lastSeen }
            : u
        )
      );
    });

    newSocket.on("user_typing", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.chatId]: data.isTyping
          ? [
              ...(prev[data.chatId] || []).filter(
                (u) => u.userId !== data.userId
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

    newSocket.on("new_notification", (notification) => {
      addNotification(notification);
    });

    setSocket(newSocket);
    socketInitialized.current = true;

    return () => {
      if (newSocket) {
        newSocket.off("new_message", handleNewMessage);
        newSocket.close();
      }
      socketInitialized.current = false;
    };
  }, [user, token]);

  const handleNewMessage = useCallback((message) => {

    if (messageIdsRef.current.has(message._id)) return;
    messageIdsRef.current.add(message._id);

    setMessages((prev) => {
      const newMessages = new Map(prev);
      if (!newMessages.has(message._id)) {
        newMessages.set(message._id, message);
      }
      return newMessages;
    });

    setChats((prev) => {
      const chatIndex = prev.findIndex((chat) => chat._id === message.chat);
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

    if (currentChat?._id === message.chat) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [currentChat]);

  useEffect(() => {
    if (user && !loading) {
      loadChats();
      loadUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !currentChat?._id) return;

    socket.emit("join_chat", currentChat._id);

    loadMessages();

    const markAsRead = async () => {
      try {
        const unreadMessages = Array.from(messages.values())
          .filter(msg => 
            msg.chat === currentChat._id && 
            !msg.readBy?.some(r => r.user === user?.id || r.user === user?._id)
          );

        if (unreadMessages.length > 0) {
          await chatService.markAsRead(currentChat._id);
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    markAsRead();

    return () => {
      if (socket && currentChat?._id) {
        socket.emit("leave_chat", currentChat._id);
      }
    };
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

  const loadMessages = async () => {
    if (!currentChat) {
      setMessages(new Map());
      return;
    }

    try {
      setLoading(true);
      const response = await chatService.getChatMessages(currentChat._id);

      const newMessagesMap = new Map();
      messageIdsRef.current.clear();
      
      response.data.forEach(message => {
        messageIdsRef.current.add(message._id);
        newMessagesMap.set(message._id, message);
      });
      
      setMessages(newMessagesMap);

      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
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
    description = null
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
      });

      const existingChatInList = chats.find(
        (chat) => chat._id === response.data._id
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

  const sendMessage = async (
    content,
    type = "text",
    attachments = [],
    replyTo = null
  ) => {
    if (!currentChat || !content.trim()) return;

    try {
      const response = await chatService.sendMessage({
        chatId: currentChat._id,
        content: content.trim(),
        type,
        attachments,
        replyTo,
      });

      return response.data;
    } catch (err) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      return chat.avatar || null;
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
    const onlineUser = onlineUsers.find((u) => u.userId === userId);
    return onlineUser?.isOnline || false;
  };

  const getTypingUsers = (chatId) => {
    return typingUsers[chatId] || [];
  };

  const messagesArray = Array.from(messages.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

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

    createChat,
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};