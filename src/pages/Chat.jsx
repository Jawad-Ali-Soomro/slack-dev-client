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
    <div className="chat-shell">
      {isMobile ? (
        <div className="chat-panel min-w-0 flex-1">
          {currentChat ? <ChatWindow isMobile={isMobile} /> : <ChatList />}
        </div>
      ) : (
        <>
          <div className="chat-panel w-[340px] shrink-0">
            <ChatList />
          </div>
          <div className="chat-panel min-w-0 flex-1">
            <ChatWindow />
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
