// ═══════════════════════════════════════════════
// BuggedOut — ResultScreen
// Win/Lose with full game recap
// ═══════════════════════════════════════════════

import { motion } from "framer-motion";
import { Trophy, Skull, RotateCcw, Home } from "lucide-react";

export default function ResultScreen({ gameOver, onPlayAgain, onBackToLobby }) {
  if (!gameOver) return null;

  const crewmatesWon = gameOver.winner === "crewmates";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "40px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "600px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Victory banner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{
            textAlign: "center",
            padding: "30px 40px",
            background: crewmatesWon
              ? "rgba(0,255,136,0.05)"
              : "rgba(255,68,68,0.05)",
            border: `2px solid ${crewmatesWon ? "#00ff88" : "#ff4444"}`,
            borderRadius: "8px",
            width: "100%",
            boxShadow: `0 0 60px ${crewmatesWon ? "rgba(0,255,136,0.15)" : "rgba(255,68,68,0.15)"}`,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
            {crewmatesWon ? (
              <Trophy size={56} style={{ color: "#00ff88" }} />
            ) : (
              <Skull size={56} style={{ color: "#ff4444" }} />
            )}
          </div>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.5rem",
              color: crewmatesWon ? "#00ff88" : "#ff4444",
              fontWeight: 700,
              marginBottom: "8px",
              animation: "flicker 3s infinite",
            }}
          >
            {crewmatesWon ? "DEPLOYMENT SUCCESSFUL ✅" : "SYSTEM COMPROMISED ☠"}
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.75rem",
              color: "#888899",
            }}
          >
            {crewmatesWon
              ? "The sprint is complete. The rogue developer has been contained."
              : "The codebase is destroyed. The rogue developer wins."}
          </p>
        </motion.div>

        {/* Imposter reveal */}
        {gameOver.imposter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "#888899",
                marginBottom: "4px",
              }}
            >
              THE IMPOSTER WAS:
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: gameOver.imposter.color || "#ff4444",
                  boxShadow: `0 0 8px ${gameOver.imposter.color || "#ff4444"}66`,
                }}
              />
              <span
                style={{
                  fontSize: "1.1rem",
                  color: "#ff4444",
                  fontWeight: 600,
                }}
              >
                {gameOver.imposter.username}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#888899" }}>🔴</span>
            </div>
          </motion.div>
        )}

        {/* Game Recap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            width: "100%",
            background: "#111118",
            border: "1px solid #2a2a3a",
            borderRadius: "6px",
            padding: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#888899",
              marginBottom: "12px",
              letterSpacing: "0.1em",
            }}
          >
            GAME RECAP
          </div>

          <div
            style={{
              borderBottom: "1px solid #2a2a3a",
              paddingBottom: "12px",
              marginBottom: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
              }}
            >
              <span style={{ color: "#888899" }}>Tasks Completed:</span>
              <span style={{ color: "#e0e0e0" }}>
                {gameOver.tasksCompleted} / {gameOver.totalTasks}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
              }}
            >
              <span style={{ color: "#888899" }}>Deploy Progress:</span>
              <span style={{ color: "#00ff88" }}>
                {gameOver.deployProgress}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
              }}
            >
              <span style={{ color: "#888899" }}>Corruption Level:</span>
              <span style={{ color: "#ff4444" }}>
                {gameOver.corruptionLevel}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
              }}
            >
              <span style={{ color: "#888899" }}>Meetings Called:</span>
              <span style={{ color: "#e0e0e0" }}>
                {gameOver.meetingCount || 0}
              </span>
            </div>
          </div>

          {/* Player Stats */}
          <div
            style={{
              fontSize: "0.7rem",
              color: "#888899",
              marginBottom: "8px",
            }}
          >
            PLAYER STATS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(gameOver.playerStats || []).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  background: "#1a1a24",
                  borderRadius: "3px",
                  fontSize: "0.7rem",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.color || "#888",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#e0e0e0",
                    flex: 1,
                    textDecoration:
                      p.status === "revoked" ? "line-through" : "none",
                  }}
                >
                  {p.username}
                </span>
                <span style={{ color: "#ffb347" }}>
                  {p.tasksCompleted} tasks
                </span>
                <span
                  style={{
                    color: p.role === "imposter" ? "#ff4444" : "#00ff88",
                    fontSize: "0.6rem",
                    padding: "1px 6px",
                    background:
                      p.role === "imposter"
                        ? "rgba(255,68,68,0.1)"
                        : "rgba(0,255,136,0.1)",
                    borderRadius: "3px",
                  }}
                >
                  {p.role === "imposter" ? "IMPOSTER" : "CREW"}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ display: "flex", gap: "12px" }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="btn btn-green"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              fontSize: "0.85rem",
            }}
          >
            <RotateCcw size={16} /> PLAY AGAIN
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBackToLobby}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              fontSize: "0.85rem",
            }}
          >
            <Home size={16} /> BACK TO LOBBY
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
