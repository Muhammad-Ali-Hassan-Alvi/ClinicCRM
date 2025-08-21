// src/hooks/useWhatsApp.js
import { useState, useEffect, useCallback } from "react";
import socket from "@/lib/socket";

export const useWhatsApp = () => {
  const [connected, setConnected] = useState(false);
  const [qr, setQr] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---- Setup socket listeners ----
  useEffect(() => {
    console.log("[IO] Hook mounted, setting up listeners...");

    socket.on("connect", () => {
      console.log("[IO] Connected to server");
      // Ask backend for current status
      socket.emit("request-initial-status");
    });

    socket.on("disconnect", () => {
      console.log("[IO] Disconnected from server");
      setConnected(false);
    });

    socket.on("status", (status) => {
      console.log("[IO] Status update:", status);
      if (status === "ready") {
        setConnected(true);
        socket.emit("get-chats");
      } else {
        setConnected(false);
      }
    });

    socket.on("qr", (qrData) => {
      console.log("[IO] Received QR");
      setQr(qrData);
    });

    socket.on("initial-status", (data) => {
      console.log("[IO] Initial status:", data);
      if (data.ready) {
        setConnected(true);
        setChats(data.chats || []);
      } else {
        setConnected(false);
        if (data.qr) setQr(data.qr);
      }
    });

    socket.on("chats", (chatList) => {
      console.log("[IO] Chats received:", chatList.length);
      setChats(chatList);
    });

    socket.on("chat-messages", ({ chatId, messages }) => {
      console.log(`[IO] Messages for ${chatId}:`, messages.length);
      if (chatId === selectedChatId) {
        setMessages(messages);
      }
    });

    socket.on("new_message", ({ chatId, message }) => {
      console.log("[IO] New message:", message);
      if (chatId === selectedChatId) {
        setMessages((prev) => [...prev, message]);
      }
      // refresh chats preview
      socket.emit("get-chats");
    });

    socket.on("error-message", (msg) => {
      console.error("[IO] Error:", msg);
      setError(msg);
    });

    return () => {
      console.log("[IO] Cleaning up listeners...");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("status");
      socket.off("qr");
      socket.off("initial-status");
      socket.off("chats");
      socket.off("chat-messages");
      socket.off("new_message");
      socket.off("error-message");
    };
  }, [selectedChatId]);

  // ---- Actions ----
  const loadMessages = useCallback((chatId) => {
    setSelectedChatId(chatId);
    setMessages([]); // reset before loading
    socket.emit("get-chat-messages", chatId);
  }, []);

  const sendMessage = useCallback((chatId, text) => {
    if (!text.trim()) return;
    socket.emit("send-message", {
      chatId,
      message: text,
      tempId: Date.now(), // track optimistic message
    });
  }, []);

  const refreshChats = useCallback(() => {
    socket.emit("get-chats");
  }, []);

  const logout = useCallback(() => {
    socket.emit("logout");
    setConnected(false);
    setChats([]);
    setMessages([]);
    setQr(null);
    setSelectedChatId(null);
  }, []);

  return {
    connected,
    qr,
    chats,
    selectedChatId,
    setSelectedChatId,
    messages,
    loadMessages,
    sendMessage,
    refreshChats,
    logout,
    loading,
    error,
  };
};
