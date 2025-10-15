import React, { useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageCircle, Plus, Search, Users } from 'lucide-react';

const ChatList = () => {
  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    setCurrentChat, 
    unreadCount, 
    getChatName, 
    getChatAvatar,
    isUserOnline,
    loading 
  } = useChat();

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    // If avatar is already a full URL, return as is
    if (avatar.startsWith('http')) return avatar;
    // If avatar is a relative path, prefix with server URL
    return `http://localhost:4000${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateChat, setShowCreateChat] = useState(false);

  const filteredChats = chats.filter(chat => 
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r icon">
      {/* Header */}
      <div className="p-4 border-b icon">
      
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">No chats found</p>
            <p className="text-xs">Start a conversation with someone</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => {
              const isActive = currentChat?._id === chat._id;
              const chatName = getChatName(chat);
              const chatAvatar = getChatAvatar(chat);
              const otherParticipant = chat.participants.find(p => p._id !== user?.id && p._id !== user?._id);
              const isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;

              
              return (
                <Card
                  key={chat._id}
                  className={`cursor-pointer border dark:bg-black bg-white ${
                    isActive ? 'bg-muted border bg-white dark:bg-[rgba(255,255,255,.1)] bg-gray-100' : ''
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-300 dark:border-gray-700">
                          <AvatarImage src={getAvatarUrl(chatAvatar)} />
                          <AvatarFallback>
                            {chatName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-lg"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {chatName}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                            {/* <img className='w-6 h-6 rounded-lg' src={getAvatarUrl(chat.lastMessage?.sender?.avatar)} alt="" /> */}
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                            {
                              // console.log(chat.lastMessage)
                            }
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {/* {chat.type === 'group' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {chat.participants.length} members
                            </span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
