// ═══════════════════════════════════════════════
// BuggedOut — GameLobbyScreen
// Waiting room: player list, topic picker, ready up
// ═══════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, X, LogOut, ChevronDown } from "lucide-react";
import TerminalCard from "../components/TerminalCard.jsx";

const TOPICS = ["DSA", "Java", "Python", "Web Dev", "SQL", "Systems"];

export default function GameLobbyScreen({
  room,
  players,
  myId,
  isHost,
  onReady,
  onChangeTopic,
  onStartGame,
  onLeave,
  countdown,
}) {
  const [topicOpen, setTopicOpen] = useState(false);
  const playerList = Object.values(players || {});
  const allReady = playerList.length >= 2 && playerList.every((p) => p.isReady);
  const myPlayer = players?.[myId];
  const isReady = myPlayer?.isReady || false;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        gap: "20px",
        padding: "40px",
        overflow: "hidden",
      }}
    >
      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "6rem",
                color: "#00ff88",
                fontWeight: 700,
                textShadow: "0 0 40px rgba(0,255,136,0.5)",
              }}
            >
              {countdown}
            </motion.div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "1rem",
                color: "#888899",
                marginTop: "20px",
              }}
            >
              Sprint starting...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL — Player List (60%) */}
      <div
        style={{
          flex: 6,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.1rem",
              color: "#00ff88",
            }}
          >
            Sprint Room:{" "}
            <span style={{ color: "#ffb347" }}>{room?.name || "???"}</span>
          </h1>
          <button
            onClick={onLeave}
            className="btn"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <LogOut size={14} /> Leave
          </button>
        </div>

        <TerminalCard title="TEAM ROSTER" glowColor="green" isActive>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <AnimatePresence>
              {playerList.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    background: "#1a1a24",
                    borderRadius: "4px",
                    border: `1px solid ${player.id === myId ? "#00ff8833" : "#2a2a3a"}`,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: player.color || "#00ff88",
                      boxShadow: `0 0 8px ${player.color || "#00ff88"}44`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.85rem",
                      color: "#e0e0e0",
                      flex: 1,
                    }}
                  >
                    {player.username}
                    {player.id === myId && (
                      <span
                        style={{
                          color: "#00ff88",
                          fontSize: "0.65rem",
                          marginLeft: "6px",
                        }}
                      >
                        (you)
                      </span>
                    )}
                  </span>
                  {room?.host === player.id && (
                    <span
                      style={{
                        color: "#ffb347",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Crown size={14} />
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                        }}
                      >
                        HOST
                      </span>
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: player.isReady ? "#00ff88" : "#ff4444",
                    }}
                  >
                    {player.isReady ? <Check size={14} /> : <X size={14} />}
                    {player.isReady ? "READY" : "NOT READY"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {playerList.length < 2 && (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  color: "#555",
                  textAlign: "center",
                  padding: "10px",
                }}
              >
                Waiting for more players to join...
                <span style={{ animation: "blink 1s infinite" }}>▌</span>
              </p>
            )}
          </div>
        </TerminalCard>
      </div>

      {/* RIGHT PANEL — Settings (40%) */}
      <div
        style={{
          flex: 4,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <TerminalCard title="SPRINT SETTINGS" glowColor="amber" isActive>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Topic selector */}
            <div>
              <label
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  color: "#888899",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Coding Topic
              </label>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => isHost && setTopicOpen(!topicOpen)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0a0a0f",
                    border: "1px solid #2a2a3a",
                    color: "#00d4ff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8rem",
                    cursor: isHost ? "pointer" : "not-allowed",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "3px",
                  }}
                >
                  {room?.topic || "DSA"}
                  {isHost && <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {topicOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#111118",
                        border: "1px solid #2a2a3a",
                        borderRadius: "3px",
                        zIndex: 10,
                        marginTop: "2px",
                      }}
                    >
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            onChangeTopic(t);
                            setTopicOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 14px",
                            background:
                              t === room?.topic
                                ? "rgba(0,212,255,0.08)"
                                : "transparent",
                            border: "none",
                            color: t === room?.topic ? "#00d4ff" : "#e0e0e0",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            textAlign: "left",
                            borderBottom: "1px solid #1a1a24",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!isHost && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.6rem",
                    color: "#555",
                  }}
                >
                  Only the host can change topic
                </span>
              )}
            </div>

            {/* Player count info */}
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#888899",
                }}
              >
                <span>Players:</span>
                <span style={{ color: "#e0e0e0" }}>
                  {playerList.length} / 6
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#888899",
                  marginTop: "6px",
                }}
              >
                <span>Min to start:</span>
                <span
                  style={{
                    color: playerList.length >= 2 ? "#00ff88" : "#ff4444",
                  }}
                >
                  2
                </span>
              </div>
            </div>
          </div>
        </TerminalCard>

        {/* Ready / Start buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReady(!isReady)}
            className={isReady ? "btn btn-red" : "btn btn-green"}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {isReady ? "[ CANCEL READY ]" : "[ READY UP ]"}
          </motion.button>

          {isHost && (
            <motion.button
              whileHover={allReady ? { scale: 1.02 } : {}}
              whileTap={allReady ? { scale: 0.98 } : {}}
              onClick={() => allReady && onStartGame()}
              disabled={!allReady}
              className="btn btn-green"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.9rem",
                fontWeight: 600,
                opacity: allReady ? 1 : 0.3,
                animation: allReady ? "pulse 2s infinite" : "none",
              }}
            >
              [ START GAME ]
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
