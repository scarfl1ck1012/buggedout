// ═══════════════════════════════════════════════
// BuggedOut — useChat Hook
// ═══════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import socket from "../socket.js";

export function useChat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        return next.length > 50 ? next.slice(-50) : next;
      });
    };

    socket.on("chat:message", handleMessage);
    return () => socket.off("chat:message", handleMessage);
  }, []);

  const sendMessage = useCallback((text) => {
    if (text.trim()) {
      socket.emit("chat:message", { text: text.trim() });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearMessages };
}
