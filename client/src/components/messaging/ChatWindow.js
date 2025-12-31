// client/src/components/messaging/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { messageAPI } from "../../api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import OnlineStatus from "../common/OnlineStatus";

const ChatWindow = ({ conversation, onConversationUpdate }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParticipant = conversation.otherParticipant;

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages();
      joinConversation();
      markConversationAsRead();
    }

    return () => {
      if (socket && conversation) {
        // Leave conversation room on unmount
        socket.off("new_message");
        socket.off("user_typing");
        socket.off("user_stopped_typing");
      }
    };
  }, [conversation._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getMessages(conversation._id);
      setMessages(response.data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    if (socket && isConnected) {
      socket.emit("join_conversation", conversation._id);

      // Listen for new messages
      socket.on("new_message", (message) => {
        if (message.conversationId === conversation._id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      // Listen for typing indicators
      socket.on("user_typing", (data) => {
        if (data.conversationId === conversation._id) {
          setTyping(true);

          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // Set new timeout to hide typing indicator
          typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
          }, 3000);
        }
      });

      socket.on("user_stopped_typing", (data) => {
        if (data.conversationId === conversation._id) {
          setTyping(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      });
    }
  };

  const markConversationAsRead = async () => {
    try {
      await messageAPI.markConversationAsRead(conversation._id);
      // Emit event to update unread count in real-time
      if (socket && isConnected) {
        socket.emit("conversation_read", conversation._id);
      }
      // Trigger conversation update to refresh list
      onConversationUpdate();
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content, fileData) => {
    if (socket && isConnected) {
      const messageData = {
        conversationId: conversation._id,
        content,
        messageType: fileData ? "file" : "text",
        ...(fileData && {
          fileUrl: fileData.url,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
        }),
      };

      socket.emit("send_message", messageData);
      onConversationUpdate();
    }
  };

  const handleTyping = () => {
    if (socket && isConnected) {
      socket.emit("typing_start", conversation._id);
    }
  };

  const handleStopTyping = () => {
    if (socket && isConnected) {
      socket.emit("typing_stop", conversation._id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Profile Photo */}
          <div className="relative">
            {otherParticipant?.profilePhoto?.url ? (
              <img
                src={otherParticipant.profilePhoto.url}
                alt={otherParticipant.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {otherParticipant?.firstName?.[0]}
                {otherParticipant?.lastName?.[0]}
              </div>
            )}
            <div className="absolute bottom-0 right-0">
              <OnlineStatus
                status={otherParticipant?.onlineStatus || "offline"}
                size="sm"
              />
            </div>
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Dr. {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h3>
            <div className="text-xs text-gray-500">
              <OnlineStatus
                status={otherParticipant?.onlineStatus || "offline"}
                lastActive={otherParticipant?.lastActive}
                showLabel={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            {typing && (
              <TypingIndicator userName={otherParticipant?.firstName} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
};

export default ChatWindow;
