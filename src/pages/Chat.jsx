import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useNotifications } from '../contexts/NotificationContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateChatModal from '../components/CreateChatModal';
import { Button } from '../components/ui/button';
import { Plus, Wifi, WifiOff } from 'lucide-react';

const Chat = () => {

  document.title = "Chat - Message Your Friends"

  const { isConnected, unreadCount, error, currentChat } = useChat();
  const { markAsReadByType } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  // Mark message notifications as read when user visits this page
  useEffect(() => {
    markAsReadByType('messages');
  }, [markAsReadByType]);

  return (
    <div className={`h-[calc(100vh-7rem)] flex flex-col ${isMobile ? 'm-0' : ''}`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b backdrop-blur icon pt-2">
        <div className={`flex h-14 items-center ${isMobile ? 'px-2' : 'px-4'}`}>
         
          
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 icon text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Disconnected</span>
                </>
              )}
            </div>
            
            {error && (
              <div className="text-xs text-red-500 max-w-32 truncate" title={error}>
                {error}
              </div>
            )}
            
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4 icon" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={`flex flex-1 min-h-0 ${isMobile ? 'm-0' : ''}`}>
        {isMobile ? (
          // Mobile view - show either chat list or chat window based on selection
          <div className="flex-1 w-full m-0">
            {currentChat ? (
              <ChatWindow isMobile={isMobile} />
            ) : (
              <ChatList />
            )}
          </div>
        ) : (
          // Desktop view - show both side by side
          <>
            <div className="w-80 border-r">
              <ChatList />
            </div>
            <div className="flex-1">
              <ChatWindow />
            </div>
          </>
        )}
      </div>

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Chat;
