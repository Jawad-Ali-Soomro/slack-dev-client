import React, { useState, useEffect } from "react";
import { useChat } from "../contexts/chat-context";
import { useNotifications } from "../contexts/notification-context";
import ChatList from "../components/chat-list";
import ChatWindow from "../components/chat-window";

const Chat = () => {
  document.title = "Chat - Message Your Friends";

  const { currentChat } = useChat();
  const { markAsReadByType } = useNotifications();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    markAsReadByType("messages");
  }, [markAsReadByType]);

  return (
    <div
      className={`h-[calc(100vh-5rem)] flex flex-col ${isMobile ? "m-0" : ""}`}
    >
      {/* Chat Interface */}
      <div className={`flex flex-1 min-h-0 ${isMobile ? "m-0" : ""}`}>
        {isMobile ? (
          <div className="flex-1 w-full m-0">
            {currentChat ? <ChatWindow isMobile={isMobile} /> : <ChatList />}
          </div>
        ) : (
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

    </div>
  );
};

export default Chat;
