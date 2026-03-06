// ═══════════════════════════════════════════════
// BuggedOut — ProgressBar Component
// ═══════════════════════════════════════════════

import { motion } from "framer-motion";

export default function ProgressBar({
  value = 0,
  color = "#00ff88",
  label = "",
  animated = true,
}) {
  const segments = 20;
  const filled = Math.round((value / 100) * segments);
  const glowColor =
    color === "#ff4444" ? "rgba(255,68,68,0.3)" : "rgba(0,255,136,0.3)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: "#888899",
            whiteSpace: "nowrap",
            minWidth: "40px",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          gap: "2px",
          flex: 1,
          height: "14px",
        }}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              background: i < filled ? color : "#1a1a24",
              boxShadow:
                i === filled - 1 && animated ? `0 0 8px ${glowColor}` : "none",
            }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              height: "100%",
              borderRadius: "1px",
              border: `1px solid ${i < filled ? color : "#2a2a3a"}`,
              opacity: i < filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.75rem",
          color,
          fontWeight: 600,
          minWidth: "35px",
          textAlign: "right",
        }}
      >
        {value}%
      </span>
    </div>
  );
}
