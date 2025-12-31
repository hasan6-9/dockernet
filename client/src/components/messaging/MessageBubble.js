// client/src/components/messaging/MessageBubble.js
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Paperclip } from "lucide-react";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  // Handle both populated sender object and string ID
  const senderId =
    typeof message.sender === "object" ? message.sender._id : message.sender;
  const isOwnMessage = senderId === user._id;

  const renderFileAttachment = () => {
    if (message.messageType !== "file") return null;

    return (
      <a
        href={message.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
      >
        <Paperclip className="w-4 h-4" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message.fileName}</p>
          <p className="text-xs opacity-75">
            {(message.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </a>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          {/* File Attachment */}
          {renderFileAttachment()}

          {/* Message Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Edited Indicator */}
          {message.editedAt && (
            <p
              className={`text-xs mt-1 ${
                isOwnMessage ? "text-blue-100" : "text-gray-500"
              }`}
            >
              (edited)
            </p>
          )}
        </div>

        {/* Message Info */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* Read Receipt (only for own messages) */}
          {isOwnMessage && (
            <span className="text-gray-500">
              {message.readAt ? (
                <CheckCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
