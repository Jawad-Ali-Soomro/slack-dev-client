import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { codeCollaborationService } from '../services/codeCollaborationService';

const CodeCollaborationContext = createContext();

export const useCodeCollaboration = () => {
  const context = useContext(CodeCollaborationContext);
  if (!context) {
    throw new Error('useCodeCollaboration must be used within a CodeCollaborationProvider');
  }
  return context;
};

export const CodeCollaborationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [cursorPositions, setCursorPositions] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (token && user) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const newSocket = io(apiUrl, {
        auth: { token: token },
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
        console.log('disconnected from code collaboration server:', reason);
        setIsConnected(false);
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 3000);
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        setError('Connection failed: ' + error.message);
      });

      newSocket.on('connected', (data) => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('code_updated', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          setCurrentSession(prev => ({
            ...prev,
            code: data.code
          }));
        }
      });

      newSocket.on('cursor_updated', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          setCursorPositions(prev => ({
            ...prev,
            [data.userId]: data.cursorPosition
          }));
        }
      });

      newSocket.on('user_joined_session', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          setParticipants(prev => {
            const exists = prev.some(p => p._id === data.user._id);
            if (!exists) {
              return [...prev, data.user];
            }
            return prev;
          });
          toast.success(`${data.user.username} joined the session`, {
            duration: 3000,
            position: 'top-center'
          });
        }
      });

      newSocket.on('user_left_session', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          setParticipants(prev => prev.filter(p => p._id !== data.userId));
          setCursorPositions(prev => {
            const newPositions = { ...prev };
            delete newPositions[data.userId];
            return newPositions;
          });
          toast.info('A participant left the session', {
            duration: 3000,
            position: 'top-center'
          });
        }
      });

      newSocket.on('user_typing_session', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: data.isTyping
          }));
        }
      });

      newSocket.on('session_ended', (data) => {
        if (currentSession && data.sessionId === currentSession._id) {
          toast.warning('Session ended by owner', {
            description: data.reason,
            duration: 5000,
            position: 'top-center'
          });
          setCurrentSession(null);
          setParticipants([]);
          setCursorPositions({});
          setTypingUsers({});
          // Reload sessions to update the list
          loadUserSessions();
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user]);

  // Load user sessions when user is available
  useEffect(() => {
    if (user && token) {
      loadUserSessions();
    }
  }, [user, token]);

  // Load sessions
  const loadUserSessions = async () => {
    try {
      const response = await codeCollaborationService.getUserSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading user sessions:', error);
    }
  };

  // Load public sessions
  const loadPublicSessions = async (language = null) => {
    try {
      const response = await codeCollaborationService.getPublicSessions(1, 20, language);
      return response.sessions || [];
    } catch (error) {
      console.error('Error loading public sessions:', error);
      return [];
    }
  };

  // Create session
  const createSession = async (sessionData) => {
    try {
      const response = await codeCollaborationService.createSession(sessionData);
      const newSession = response.session;
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Join session
  const joinSession = async (sessionId) => {
    try {
      const response = await codeCollaborationService.joinSession(sessionId);
      const session = response.session;
      
      
      setCurrentSession(session);
      const uniqueParticipants = session.participants
        .map(p => p.user)
        .filter((participant, index, self) => 
          index === self.findIndex(p => p._id === participant._id)
        );
      
      setParticipants(uniqueParticipants);
      
      if (socket) {
        socket.emit('join_session', { sessionId });
      }
      
      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;
    
    try {
      await codeCollaborationService.leaveSession(currentSession._id);
      
      if (socket) {
        socket.emit('leave_session', { sessionId: currentSession._id });
      }
      
      setCurrentSession(null);
      setParticipants([]);
      setCursorPositions({});
      setTypingUsers({});
      
      toast.success('Left session successfully', {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  const updateCode = async (code, cursorPosition = null) => {
    if (!currentSession) return;
    
    try {
      setCurrentSession(prev => ({
        ...prev,
        code: code
      }));
      
      // Update cursor position
      if (cursorPosition) {
        setCursorPositions(prev => ({
          ...prev,
          [user?.id || user?._id]: cursorPosition
        }));
      }
      
      if (socket) {
        socket.emit('code_change', {
          sessionId: currentSession._id,
          code: code,
          cursorPosition: cursorPosition
        });
      }
      await codeCollaborationService.updateCode(currentSession._id, code, cursorPosition);
    } catch (error) {
      console.error('Error updating code:', error);
    }
  };

  const updateCursor = async (cursorPosition) => {
    if (!currentSession) return;
    
    try {
      setCursorPositions(prev => ({
        ...prev,
        [user?.id || user?._id]: cursorPosition
      }));
      
      if (socket) {
        socket.emit('cursor_move', {
          sessionId: currentSession._id,
          cursorPosition: cursorPosition
        });
      }
      
      await codeCollaborationService.updateCursor(currentSession._id, cursorPosition);
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  };

  // Handle typing
  const handleTyping = (isTyping) => {
    if (!currentSession || !socket) return;
    
    setIsTyping(isTyping);
    
    socket.emit('user_typing_session', {
      sessionId: currentSession._id,
      isTyping: isTyping
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('user_typing_session', {
          sessionId: currentSession._id,
          isTyping: false
        });
      }, 2000);
    }
  };

  // End session (owner only)
  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      await codeCollaborationService.endSession(currentSession._id);
      
      if (socket) {
        socket.emit('session_ended', { 
          sessionId: currentSession._id,
          reason: 'Session ended by owner'
        });
      }
      
      setCurrentSession(null);
      setParticipants([]);
      setCursorPositions({});
      setTypingUsers({});
      
      // Reload sessions
      await loadUserSessions();
      
      toast.success('Session ended successfully', {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  // Delete session permanently (owner only)
  const deleteSession = async (sessionId) => {
    try {
      await codeCollaborationService.deleteSession(sessionId);
      
      // Reload sessions to update the list
      await loadUserSessions();
      
      toast.success('Session deleted successfully', {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  // Generate invite code
  const generateInviteCode = async (sessionId) => {
    try {
      const result = await codeCollaborationService.generateInviteCode(sessionId);
      return result.data;
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Failed to generate invite code', {
        duration: 3000,
        position: 'top-center'
      });
      throw error;
    }
  };

  // Join session by invite code
  const joinByInviteCode = async (inviteCode) => {
    try {
      console.log('Attempting to join with invite code:', inviteCode);
      const result = await codeCollaborationService.joinByInviteCode(inviteCode);
      console.log('Join result:', result);
      
      // Reload sessions to update the list
      await loadUserSessions();
      
      toast.success('Joined session successfully', {
        duration: 3000,
        position: 'top-center'
      });
      
      return result.data;
    } catch (error) {
      console.error('Error joining by invite code:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to join session', {
        duration: 3000,
        position: 'top-center'
      });
      throw error;
    }
  };

  // Get session by invite code (for preview)
  const getSessionByInviteCode = async (inviteCode) => {
    try {
      const result = await codeCollaborationService.getSessionByInviteCode(inviteCode);
      return result.data;
    } catch (error) {
      console.error('Error getting session by invite code:', error);
      throw error;
    }
  };

  // Invite user to session
  const inviteUser = async (sessionId, invitedUserId) => {
    try {
      await codeCollaborationService.inviteUser(sessionId, invitedUserId);
      
      toast.success('User invited successfully', {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to invite user', {
        duration: 3000,
        position: 'top-center'
      });
      throw error;
    }
  };

  const value = {
    socket,
    isConnected,
    error,
    sessions,
    currentSession,
    code: currentSession?.code || '',
    participants,
    typingUsers,
    cursorPositions,
    isTyping,
    loadUserSessions,
    loadPublicSessions,
    createSession,
    joinSession,
    leaveSession,
    updateCode,
    updateCursor,
    handleTyping,
    endSession,
    deleteSession,
    generateInviteCode,
    joinByInviteCode,
    getSessionByInviteCode,
    inviteUser
  };

  return (
    <CodeCollaborationContext.Provider value={value}>
      {children}
    </CodeCollaborationContext.Provider>
  );
};
