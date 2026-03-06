// ═══════════════════════════════════════════════
// BuggedOut — RoleReveal Component
// ═══════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function RoleReveal({ role, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete && onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isImposter = role === "imposter";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.9)",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              padding: "60px 80px",
              background: isImposter
                ? "rgba(255,68,68,0.08)"
                : "rgba(0,255,136,0.08)",
              border: `2px solid ${isImposter ? "#ff4444" : "#00ff88"}`,
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: `0 0 60px ${isImposter ? "rgba(255,68,68,0.3)" : "rgba(0,255,136,0.3)"}`,
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "3rem",
                marginBottom: "16px",
              }}
            >
              {isImposter ? "☠️" : "🛡️"}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8rem",
                color: "#888899",
                marginBottom: "8px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Your Role
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: isImposter ? "#ff4444" : "#00ff88",
                marginBottom: "20px",
                animation: "flicker 3s infinite",
              }}
            >
              {isImposter ? "ROGUE DEVELOPER" : "SYSTEMS ENGINEER"}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
                color: "#888899",
                lineHeight: "1.6",
                maxWidth: "350px",
                margin: "0 auto",
              }}
            >
              {isImposter
                ? "Sabotage the codebase. Deceive your team. Corrupt the deploy."
                : "Fix bugs. Find the imposter. Complete the deployment."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
