// Minimal Socket.IO Context - Fresh Start
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    // Only initialize if we have a token
    if (!token) {
      console.log("⚠️  No token, skipping Socket.IO initialization");
      return;
    }

    console.log("🔧 Initializing Socket.IO client...");

    // Socket.IO connects to root path, not /api
    // Remove /api suffix if present in REACT_APP_API_URL
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const socketUrl = apiUrl.replace("/api", "");

    console.log("🔧 API URL:", apiUrl);
    console.log("🔧 Socket.IO URL:", socketUrl);
    console.log("🔧 Token present:", !!token);

    // Create socket with minimal configuration
    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection successful
    newSocket.on("connect", () => {
      console.log("✅ Socket.IO connected! ID:", newSocket.id);
      setIsConnected(true);
    });

    // Connection error
    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
      console.error("❌ Error details:", error);
      setIsConnected(false);
    });

    // Disconnected
    newSocket.on("disconnect", (reason) => {
      console.log("⚠️  Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up Socket.IO connection");
      newSocket.close();
    };
  }, [token]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
