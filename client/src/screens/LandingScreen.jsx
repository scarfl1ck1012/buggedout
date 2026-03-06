// ═══════════════════════════════════════════════
// BuggedOut — LandingScreen
// ASCII logo, username input, color picker
// ═══════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";

const ASCII_LOGO = `
 ██████╗ ██╗   ██╗ ██████╗  ██████╗ ███████╗██████╗  ██████╗ ██╗   ██╗████████╗
 ██╔══██╗██║   ██║██╔════╝ ██╔════╝ ██╔════╝██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
 ██████╔╝██║   ██║██║  ███╗██║  ███╗█████╗  ██║  ██║██║   ██║██║   ██║   ██║   
 ██╔══██╗██║   ██║██║   ██║██║   ██║██╔══╝  ██║  ██║██║   ██║██║   ██║   ██║   
 ██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝   ██║   
 ╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   
`;

const COLORS = [
  { name: "Green", value: "#00ff88" },
  { name: "Cyan", value: "#00d4ff" },
  { name: "Red", value: "#ff4444" },
  { name: "Orange", value: "#ffb347" },
  { name: "Purple", value: "#9b59b6" },
  { name: "Yellow", value: "#f1c40f" },
  { name: "Pink", value: "#ff69b4" },
  { name: "White", value: "#ffffff" },
];

const CODE_CHARS =
  "01{}[]<>/;:=+-*&|!@#$%^~`const let var function return if else for while";

export default function LandingScreen({ onEnter }) {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("#00ff88");

  const handleEnter = () => {
    if (username.trim().length >= 2) {
      onEnter(username.trim(), selectedColor);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleEnter();
  };

  // Generate code rain columns
  const rainColumns = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${i * 3.5 + Math.random() * 2}%`,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Code rain background */}
      {rainColumns.map((col) => (
        <div
          key={col.id}
          style={{
            position: "absolute",
            left: col.left,
            top: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: "rgba(0,255,136,0.06)",
            animation: `code-rain ${col.duration}s linear ${col.delay}s infinite`,
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {Array.from(
            { length: 20 },
            (_, j) => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
          ).join("\n")}
        </div>
      ))}

      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          position: "relative",
          zIndex: 2,
          maxWidth: "600px",
          width: "90%",
        }}
      >
        {/* ASCII Logo */}
        <pre
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(0.25rem, 1.1vw, 0.6rem)",
            color: "#00ff88",
            textAlign: "center",
            lineHeight: "1.1",
            animation: "flicker 4s infinite",
            whiteSpace: "pre",
            overflow: "hidden",
            textShadow: "0 0 10px rgba(0,255,136,0.4)",
          }}
        >
          {ASCII_LOGO}
        </pre>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.8rem",
            color: "#888899",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          "A sprint goes wrong. Trust no one's commits."
        </p>

        {/* Username input */}
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <label
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#888899",
              display: "block",
              marginBottom: "6px",
            }}
          >
            {">"} Enter your username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="DevMaster99"
            maxLength={16}
            className="input-terminal"
            style={{ fontSize: "1rem" }}
            autoFocus
          />
        </div>

        {/* Color picker */}
        <div style={{ textAlign: "center" }}>
          <label
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#888899",
              display: "block",
              marginBottom: "10px",
            }}
          >
            {">"} Choose your avatar color
          </label>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {COLORS.map((c) => (
              <motion.button
                key={c.value}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(c.value)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: c.value,
                  border:
                    selectedColor === c.value
                      ? "2px solid #fff"
                      : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow:
                    selectedColor === c.value
                      ? `0 0 16px ${c.value}66, 0 0 32px ${c.value}33`
                      : "none",
                  transition: "box-shadow 0.2s ease",
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Enter button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
          disabled={username.trim().length < 2}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1rem",
            fontWeight: 600,
            padding: "14px 48px",
            background: "rgba(0,255,136,0.06)",
            border: "2px solid #00ff88",
            color: "#00ff88",
            cursor: username.trim().length >= 2 ? "pointer" : "not-allowed",
            letterSpacing: "0.1em",
            borderRadius: "4px",
            animation:
              username.trim().length >= 2 ? "pulse 2s infinite" : "none",
            opacity: username.trim().length >= 2 ? 1 : 0.3,
            transition: "opacity 0.3s ease",
          }}
        >
          [ ENTER THE SERVER ]
        </motion.button>
      </motion.div>
    </div>
  );
}
