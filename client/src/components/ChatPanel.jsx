// ═══════════════════════════════════════════════
// BuggedOut — ChatPanel Component
// ═══════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";

export default function ChatPanel({
  messages = [],
  onSend,
  disabled = false,
  maxHeight = "200px",
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          maxHeight,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              color: "#555",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No messages yet...
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              lineHeight: "1.4",
            }}
          >
            {msg.type === "system" ? (
              <span style={{ color: "#ffb347", fontStyle: "italic" }}>
                {msg.text}
              </span>
            ) : (
              <>
                <span
                  style={{ color: msg.color || "#00ff88", fontWeight: 600 }}
                >
                  {msg.username}:
                </span>{" "}
                <span style={{ color: "#e0e0e0" }}>{msg.text}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #2a2a3a",
          padding: "6px",
          gap: "6px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="type message..."
          className="input-terminal"
          style={{
            flex: 1,
            fontSize: "0.7rem",
            padding: "6px 10px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="btn btn-green"
          style={{
            padding: "6px 12px",
            fontSize: "0.7rem",
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
