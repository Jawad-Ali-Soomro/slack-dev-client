import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { chatService } from '../services/chatService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const newSocket = io(apiUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        
        // Auto-reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          setTimeout(() => {
            newSocket.connect();
          }, 3000);
        }
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        setError('Connection failed: ' + error.message);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (!isConnected) {
            newSocket.connect();
          }
        }, 5000);
      });

      newSocket.on('connected', (data) => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        if (currentChat && message.chat === currentChat._id) {
          scrollToBottom();
        }
        
        // Show toast notification for new messages (only if not from current user)
        if (message.sender && message.sender._id !== user?.id && message.sender._id !== user?._id) {
          const senderName = message.sender.name || message.sender.username || 'Unknown User';
          toast.success(`${senderName} sent a message just now`, {
            description: message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content,
            duration: 4000,
            position: 'top-right',
            action: {
              label: 'View Chat',
              onClick: () => {
                // Find the chat and switch to it
                const chat = chats.find(c => c._id === message.chat);
                if (chat) {
                  setCurrentChat(chat);
                }
              }
            }
          });
        }
      });

      newSocket.on('chat_updated', (updatedChat) => {
        console.log('Received chat update:', updatedChat);
        console.log('Updated chat participants:', updatedChat.participants);
        setChats(prev => 
          prev.map(chat => chat._id === updatedChat._id ? updatedChat : chat)
        );
      });

      newSocket.on('message_updated', (message) => {
        setMessages(prev => 
          prev.map(msg => msg._id === message._id ? message : msg)
        );
      });

      newSocket.on('message_deleted', (data) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, isDeleted: true, content: 'This message was deleted' }
              : msg
          )
        );
      });

      newSocket.on('user_online', (data) => {
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { ...data, isOnline: true }];
        });
        
        // Show toast notification when a user comes online (only if not current user)
        if (data.userId !== user?.id && data.userId !== user?._id) {
          const userName = data.name || data.username || 'Unknown User';
          toast.info(`${userName} is now online`, {
            duration: 3000,
            position: 'top-right'
          });
        }
      });

      newSocket.on('user_offline', (data) => {
        setOnlineUsers(prev => 
          prev.map(u => 
            u.userId === data.userId 
              ? { ...u, isOnline: false, lastSeen: data.lastSeen }
              : u
          )
        );
        
        // Show toast notification when a user goes offline (only if not current user)
        if (data.userId !== user?.id && data.userId !== user?._id) {
          const userName = data.name || data.username || 'Unknown User';
          toast.warning(`${userName} is now offline`, {
            duration: 3000,
            position: 'top-right'
          });
        }
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: data.isTyping 
            ? [...(prev[data.chatId] || []).filter(u => u.userId !== data.userId), data]
            : (prev[data.chatId] || []).filter(u => u.userId !== data.userId)
        }));
        
        
      });

      newSocket.on('message_read', (data) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { 
                  ...msg, 
                  readBy: [...(msg.readBy || []), { user: data.userId, readAt: data.readAt }]
                }
              : msg
          )
        );
      });

      newSocket.on('new_notification', (notification) => {
        addNotification(notification);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  // Load initial data
  // Load chats when user is available (from DB first)
  useEffect(() => {
    if (user) {
      loadChats();
      loadUnreadCount();
    }
  }, [user]);

  // Additional socket events when socket connects
  useEffect(() => {
    if (socket && user) {
      // Socket is connected, we can now sync real-time updates
    }
  }, [socket, user]);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat) {
      loadMessages();
      if (socket) {
        joinChat(currentChat._id);
      }
    } else {
      // Clear messages when no chat is selected
      setMessages([]);
    }
  }, [currentChat, socket]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getUserChats();
      setChats(response.data);
    } catch (err) {
      setError('Failed to load chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!currentChat) {
      setMessages([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await chatService.getChatMessages(currentChat._id);
      setMessages(response.data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const createChat = async (participants, type = 'direct', name = null, description = null) => {
    try {
      setLoading(true);
      const response = await chatService.createChat({
        participants,
        type,
        name,
        description
      });
      
      setChats(prev => [response.data, ...prev]);
      setCurrentChat(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to create chat');
      console.error('Error creating chat:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, type = 'text', attachments = [], replyTo = null) => {
    if (!currentChat || !content.trim()) return;

    try {
      const response = await chatService.sendMessage({
        chatId: currentChat._id,
        content: content.trim(),
        type,
        attachments,
        replyTo
      });

      // Don't add to messages here - let the socket handle it to avoid duplicates
      // The socket will receive the message and add it to the state
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const updateMessage = async (messageId, content) => {
    try {
      const response = await chatService.updateMessage(messageId, { content });
      setMessages(prev => 
        prev.map(msg => msg._id === messageId ? response.data : msg)
      );
    } catch (err) {
      setError('Failed to update message');
      console.error('Error updating message:', err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, content: 'This message was deleted' }
            : msg
        )
      );
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  };

  const markAsRead = async (chatId) => {
    try {
      await chatService.markAsRead(chatId);
      setMessages(prev => 
        prev.map(msg => 
          msg.chat === chatId 
            ? { 
                ...msg, 
                readBy: [...(msg.readBy || []), { user: user.id, readAt: new Date() }]
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing_start', { chatId });
      
      clearTimeout(typingTimeoutRef.current[chatId]);
      typingTimeoutRef.current[chatId] = setTimeout(() => {
        stopTyping(chatId);
      }, 3000);
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('typing_stop', { chatId });
      clearTimeout(typingTimeoutRef.current[chatId]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatName = (chat) => {
    if (chat.type === 'group') {
      return chat.name;
    }
    
    if (!chat.participants || chat.participants.length === 0) {
      return 'Unknown User';
    }
    
    const currentUserId = user?.id || user?._id;
    const otherParticipant = chat.participants.find(p => {
      const participantId = p._id || p.id;
      return participantId && participantId.toString() !== currentUserId?.toString();
    });
    
    if (!otherParticipant) {
      return 'Unknown User';
    }
    
    return otherParticipant.username || otherParticipant.name || 'Unknown User';
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return null; // You can add group avatar logic here
    }
    
    if (!chat.participants || chat.participants.length === 0) {
      return null;
    }
    
    const currentUserId = user?.id || user?._id;
    const otherParticipant = chat.participants.find(p => {
      const participantId = p._id || p.id;
      return participantId && participantId.toString() !== currentUserId?.toString();
    });
    
    return otherParticipant?.avatar;
  };

  const isUserOnline = (userId) => {
    const onlineUser = onlineUsers.find(u => u.userId === userId);
    return onlineUser?.isOnline || false;
  };

  const getTypingUsers = (chatId) => {
    return typingUsers[chatId] || [];
  };

  const value = {
    // State
    chats,
    currentChat,
    messages,
    unreadCount,
    onlineUsers,
    typingUsers,
    isConnected,
    loading,
    error,
    messagesEndRef,

    // Actions
    createChat,
    setCurrentChat,
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
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
    setError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
