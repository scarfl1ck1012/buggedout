// ═══════════════════════════════════════════════
// BuggedOut — TerminalCard Component
// ═══════════════════════════════════════════════

import { motion } from "framer-motion";

export default function TerminalCard({
  title,
  subtitle,
  children,
  glowColor = "green",
  isActive = false,
  className = "",
}) {
  const glowMap = {
    green: {
      border: "#00ff88",
      shadow: "rgba(0,255,136,0.15)",
      dot: "#00ff88",
    },
    red: { border: "#ff4444", shadow: "rgba(255,68,68,0.15)", dot: "#ff4444" },
    amber: {
      border: "#ffb347",
      shadow: "rgba(255,179,71,0.15)",
      dot: "#ffb347",
    },
    cyan: { border: "#00d4ff", shadow: "rgba(0,212,255,0.15)", dot: "#00d4ff" },
  };
  const g = glowMap[glowColor] || glowMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
      style={{
        background: "#111118",
        border: `1px solid ${isActive ? g.border : "#2a2a3a"}`,
        borderRadius: "4px",
        boxShadow: isActive
          ? `0 0 12px ${g.shadow}, 0 0 24px ${g.shadow}`
          : "none",
        overflow: "hidden",
        transition: "all 0.15s ease",
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderBottom: "1px solid #2a2a3a",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: g.dot,
              boxShadow: `0 0 6px ${g.shadow}`,
            }}
          />
          <span style={{ color: g.dot, fontWeight: 600 }}>{title}</span>
          {subtitle && (
            <span
              style={{
                color: "#888899",
                marginLeft: "auto",
                fontSize: "0.7rem",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </motion.div>
  );
}
