import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useNotifications } from '../contexts/NotificationContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateChatModal from '../components/CreateChatModal';
import { Button } from '../components/ui/button';
import { Plus, Wifi, WifiOff } from 'lucide-react';

const Chat = () => {
  const { isConnected, unreadCount, error } = useChat();
  const { markAsReadByType } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

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
    <div className='max-h-[90vh]'>
      {/* Header */}
      <div className="border-b backdrop-blur icon pt-2">
        <div className="flex h-14 items-center px-4">
         
          
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {isMobile ? (
          // Mobile view - show either chat list or chat window
          <div className="flex-1">
            <ChatList />
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
