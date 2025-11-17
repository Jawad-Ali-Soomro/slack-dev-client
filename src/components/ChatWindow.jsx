import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
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
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import UserDetailsModal from './UserDetailsModal';

const ChatWindow = ({ isMobile = false }) => {
  const { 
    currentChat, 
    messages, 
    sendMessage, 
    updateMessage, 
    deleteMessage, 
    markAsRead,
    getChatName, 
    getChatAvatar,
    isUserOnline,
    getTypingUsers,
    startTyping,
    stopTyping,
    messagesEndRef,
    loading,
    setCurrentChat
  } = useChat();
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messageText, setMessageText] = useState('');
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

  useEffect(() => {
    if (currentChat) {
      markAsRead(currentChat._id);
    }
  }, [currentChat, markAsRead]);

  // Custom scroll to bottom function for better control
  const scrollToBottomLocal = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to bottom when messages change (but not on initial load)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Use immediate scroll to prevent layout shift
      requestAnimationFrame(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      });
    }
  }, [messages.length]);

  // Scroll to bottom when current chat changes
  useEffect(() => {
    if (currentChat) {
      // Wait for messages to load, then scroll
      const timer = setTimeout(() => {
        if (messages.length > 0) {
          scrollToBottomLocal();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentChat]);

  // Initial scroll to bottom when component mounts with messages
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Force immediate scroll to bottom on mount
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - 200;
    }
  }, []);

  // Handle scroll events to show/hide scroll-to-bottom button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
      setShowScrollButton(!isNearBottom && messages.length > 5);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat) return;

    if (editingMessage) {
      await updateMessage(editingMessage._id, messageText);
      setEditingMessage(null);
    } else {
      await sendMessage(messageText, 'text', [], replyTo?._id);
      setReplyTo(null);
    }
    
    setMessageText('');
    stopTyping(currentChat._id);
    
    // Scroll to bottom after sending message - use immediate scroll to prevent layout shift
    if (messagesContainerRef.current) {
      // Scroll immediately to prevent layout shift
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
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
    if (e.key === 'Enter' && !e.shiftKey) {
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
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle file upload logic here
    console.log('Files to upload:', files);
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId);
      setShowUserDetails(true);
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      // Use setTimeout to avoid immediate closure when clicking the button
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const formatMessageTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    // If avatar is already a full URL, return as is
    if (avatar.startsWith('http')) return avatar;
    // If avatar is a relative path, prefix with server URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    return `${apiUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  };

  const typingUsers = currentChat ? getTypingUsers(currentChat._id) : [];
  const otherParticipant = currentChat?.participants.find(p => p._id !== user?.id && p._id !== user?._id);
  const isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;



  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-[10px] bg-muted flex items-center justify-center">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a chat</h3>
          <p className="text-muted-foreground">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'm-0 w-full' : ''}`}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b icon ${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentChat(null)}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Back to chat list"
              >
                <ArrowLeft className="h-5 w-5 icon" />
              </Button>
            )}
            <div className="relative">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => otherParticipant && handleUserAvatarClick(otherParticipant._id || otherParticipant.id)}
              >
                <AvatarImage src={getAvatarUrl(getChatAvatar(currentChat))} />
                <AvatarFallback>
                  {getChatName(currentChat).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline ? <div className="w-3 rounded-full absolute bottom-0 -right-1 h-3 bg-green-500"></div> : <div className="w-3 rounded-full absolute bottom-0 -right-1 h-3 bg-red-500"></div>}
              
            </div>
            <div className='flex items-center gap-2'>
              <h3 className="font-bold">{getChatName(currentChat)}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4 icon icon" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4 icon icon" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4 icon icon" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages - Scrollable Area */}
        <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto space-y-4 relative ${isMobile ? 'p-2' : 'p-4'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-[10px] h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Send className="h-12 w-12 mx-auto mb-4" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user?.id || message.sender._id === user?._id;
            const isDeleted = message.isDeleted;
            
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end rounded-[20px]' : 'justify-start rounded-[20px]'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse rounded-[20px]' : 'flex-row rounded-[20px]'}`}>
                  {!isOwn && (
                    <Avatar 
                      className="h-10 w-10 mt-1 border border-gray-200 dark:border-gray-600 p-1 rounded-[20px] cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleUserAvatarClick(message.sender._id || message.sender.id)}
                      title={message.sender.username ? `View ${message.sender.username}'s profile` : 'View profile'}
                    >
                      <AvatarImage src={getAvatarUrl(message.sender.avatar)} className='rounded-[20px]' />
                      <AvatarFallback>
                        {(message.sender.name || message.sender.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`space-y-1 ${isOwn ? 'items-end rounded-[20px]' : 'items-start rounded-[20px]'}`}>
                    <div
                      className={`px-5 py-3 relative ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-b-[20px] rounded-tl-[20px]'
                          : 'dark:bg-[rgba(255,255,255,.1)] bg-white mt-5 rounded-b-[20px] rounded-tr-[20px]'
                      } ${isDeleted ? 'opacity-60' : ''}`}
                    >
                      
                      <p className={`text-sm rounded-b-20px font-bold`}>{message.content}</p>
                      
                     <div className="flex justify-between pt-1">
                     {message.replyTo && (
                        <div className="text-xs opacity-70 mb-1 rounded">
                         (replied)
                        </div>
                      )}
                      {message.isEdited && (
                        <p className="text-xs opacity-70">(edited)</p>
                      )} 
                     </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className='lowercase text-[10px] font-bold'>{formatMessageTime(message.createdAt)}</span>
                      
                      {isOwn && !isDeleted && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditMessage(message)}
                          >
                            <Edit className="h-3 w-3 icon icon" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
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
                          className="h-6 w-6 p-0"
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
        
        {/* Scroll to bottom button */}
     
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />

      
        </div>

        {/* Reply indicator */}
       

        {/* Reply indicator */}
        {/* {replyTo && (
          <div className="border-t p-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">Replying to {replyTo.sender.name}</p>
                <p className="text-muted-foreground truncate">{replyTo.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )} */}

      {/* Message Input - Fixed at Bottom */}
      <div className={`flex-shrink-0 border-t icon relative ${isMobile ? 'p-2' : 'p-4'}`}>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4 icon" />
          </Button>
          
          <Input
            ref={inputRef}
            value={messageText}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={editingMessage ? "Edit message..." : replyTo ? "Aa" : "Aa"}
            className="flex-1 border-gray-300"
            disabled={loading}
          />
          
          <div className="relative emoji-picker-wrapper" ref={emojiPickerRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={'w-12 border-gray-300 border'}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4 icon icon" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  width={350}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={!messageText.trim() || loading}
            className={'w-12'}
          >
            <Send className="h-4 w-4 icon icon" />
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
