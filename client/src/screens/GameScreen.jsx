// ═══════════════════════════════════════════════
// BuggedOut — GameScreen (Main Gameplay)
// 4-zone layout: StatusBar, RoomNav, MainPanel, RightSidebar
// ═══════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Skull,
  AlertTriangle,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Users as UsersIcon,
} from "lucide-react";
import socket from "../socket.js";
import ProgressBar from "../components/ProgressBar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import PlayerChip from "../components/PlayerChip.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import RoleReveal from "../components/RoleReveal.jsx";
import { useAntigravity } from "../hooks/useAntigravity.js";

const ROOM_ICONS = {
  "DSA Lab": "🖥️",
  "Backend Core": "⚙️",
  "Frontend Studio": "🎨",
  "Database Vault": "🗄️",
  "Systems Root": "🔒",
};
const ROOM_DESCS = {
  "DSA Lab": "The algorithm engine is failing. Optimize before it crashes.",
  "Backend Core":
    "The API gateway is throwing 500s. Fix it before the client notices.",
  "Frontend Studio":
    "The UI components are rendering garbage. Time for a hotfix.",
  "Database Vault":
    "Queries are timing out. The data layer needs critical patches.",
  "Systems Root": "Kernel panic imminent. Only root access can save us now.",
};

export default function GameScreen({
  state,
  myId,
  onMoveRoom,
  onTaskSubmit,
  onCallMeeting,
  onSabotage,
  onFramePlayer,
  onResolveSabotage,
  messages,
  sendMessage,
  playSound,
  isMuted,
  toggleMute,
}) {
  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState(null);

  const {
    role,
    tasks,
    players,
    deployProgress,
    corruptionLevel,
    currentRoom,
    activeSabotage,
    roomLayout,
  } = state;

  const isImposter = role === "imposter";
  const playerList = Object.values(players || {});
  const alivePlayers = playerList.filter((p) => p.status === "alive");

  useAntigravity(
    activeSabotage?.type === "zero_g" && activeSabotage?.room === currentRoom,
  );

  // Group tasks by room
  const tasksByRoom = useMemo(() => {
    const grouped = {};
    (tasks || []).forEach((t) => {
      if (!grouped[t.room]) grouped[t.room] = [];
      grouped[t.room].push(t);
    });
    return grouped;
  }, [tasks]);

  const currentRoomTasks = tasksByRoom[currentRoom] || [];
  const uncompletedByRoom = useMemo(() => {
    const counts = {};
    (tasks || []).forEach((t) => {
      if (!counts[t.room]) counts[t.room] = 0;
      if (!t.completedBy) counts[t.room]++;
    });
    return counts;
  }, [tasks]);

  const handleRoomClick = (roomName) => {
    onMoveRoom(roomName);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        overflow: "hidden",
      }}
    >
      {/* Role Reveal */}
      {showRoleReveal && (
        <RoleReveal
          role={role}
          onComplete={() => {
            setShowRoleReveal(false);
            playSound?.("buttonClick");
          }}
        />
      )}

      {/* ═══ ZONE A — TOP STATUS BAR ═══ */}
      <div
        style={{
          height: "56px",
          background: "#111118",
          borderBottom: "1px solid #2a2a3a",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1.2,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Rocket size={14} style={{ color: "#00ff88" }} />
          <ProgressBar value={deployProgress} color="#00ff88" label="Deploy" />
        </div>
        <div
          style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Skull size={14} style={{ color: "#ff4444" }} />
          <ProgressBar
            value={corruptionLevel}
            color="#ff4444"
            label="Corrupt"
          />
        </div>

        {activeSabotage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              background: "rgba(255,68,68,0.1)",
              border: "1px solid #ff4444",
              borderRadius: "3px",
              animation: "pulse-dot 1s infinite",
            }}
          >
            <AlertTriangle size={14} style={{ color: "#ff4444" }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.65rem",
                color: "#ff4444",
              }}
            >
              SABOTAGE ACTIVE
            </span>
            {!isImposter && (
              <button
                onClick={onResolveSabotage}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6rem",
                  padding: "2px 8px",
                  background: "rgba(255,68,68,0.2)",
                  border: "1px solid #ff4444",
                  color: "#ff4444",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                RESOLVE
              </button>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCallMeeting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            background: "rgba(255,68,68,0.08)",
            border: "1px solid #ff4444",
            color: "#ff4444",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            cursor: "pointer",
            borderRadius: "3px",
          }}
        >
          🔴 CODE REVIEW
        </motion.button>

        <CountdownTimer seconds={600} label="" />

        <button
          onClick={toggleMute}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#888899",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ═══ ZONE B — ROOM NAVIGATION (left sidebar) ═══ */}
        <div
          style={{
            width: "200px",
            background: "#111118",
            borderRight: "1px solid #2a2a3a",
            display: "flex",
            flexDirection: "column",
            padding: "12px 0",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              color: "#888899",
              padding: "0 14px 10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Rooms
          </div>
          {(
            roomLayout || Object.keys(ROOM_ICONS).map((name) => ({ name }))
          ).map((r) => {
            const roomName = r.name;
            const isActive = currentRoom === roomName;
            const hasSabotage = activeSabotage?.room === roomName;
            const taskCount = uncompletedByRoom[roomName] || 0;

            return (
              <button
                key={roomName}
                onClick={() => handleRoomClick(roomName)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  background: isActive ? "#1a1a24" : "transparent",
                  border: "none",
                  borderLeft: isActive
                    ? "3px solid #00ff88"
                    : "3px solid transparent",
                  color: isActive ? "#e0e0e0" : "#888899",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{ROOM_ICONS[roomName] || "📁"}</span>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {roomName}
                </span>
                {hasSabotage && (
                  <span
                    style={{
                      color: "#ff4444",
                      animation: "pulse-dot 1s infinite",
                    }}
                  >
                    🔴
                  </span>
                )}
                {taskCount > 0 && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#ffb347",
                      background: "rgba(255,179,71,0.1)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {taskCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Imposter Tools */}
          {isImposter && (
            <div
              style={{
                marginTop: "auto",
                borderTop: "1px solid #2a2a3a",
                padding: "12px",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6rem",
                  color: "#ff4444",
                  marginBottom: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                ☠ Rogue Tools
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <button
                  onClick={() => onSabotage("silent")}
                  className="btn btn-red"
                  style={{
                    fontSize: "0.6rem",
                    padding: "6px 8px",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  ⚡ Silent Sabotage
                </button>
                <button
                  onClick={() => onSabotage("zero_g")}
                  className="btn btn-red"
                  style={{
                    fontSize: "0.6rem",
                    padding: "6px 8px",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  🌌 Zero-G Injector
                </button>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() =>
                      setSelectedFrame(selectedFrame ? null : true)
                    }
                    className="btn btn-red"
                    style={{
                      fontSize: "0.6rem",
                      padding: "6px 8px",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    🎭 Frame Player
                  </button>
                  {selectedFrame && (
                    <div
                      style={{
                        position: "absolute",
                        left: "100%",
                        top: 0,
                        background: "#111118",
                        border: "1px solid #2a2a3a",
                        borderRadius: "3px",
                        padding: "4px",
                        marginLeft: "4px",
                        zIndex: 10,
                        minWidth: "120px",
                      }}
                    >
                      {alivePlayers
                        .filter((p) => p.id !== myId)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              onFramePlayer(p.id);
                              setSelectedFrame(null);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "4px 8px",
                              background: "transparent",
                              border: "none",
                              color: "#e0e0e0",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "0.6rem",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            {p.username}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSabotage("emergency")}
                  className="btn btn-red"
                  style={{
                    fontSize: "0.6rem",
                    padding: "6px 8px",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  🚨 Emergency Bug
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ ZONE C — MAIN ROOM PANEL ═══ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Room header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #2a2a3a",
            }}
          >
            <h2
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "1rem",
                color: "#e0e0e0",
                marginBottom: "4px",
              }}
            >
              {ROOM_ICONS[currentRoom] || "📁"} {currentRoom}
            </h2>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                color: "#888899",
                fontStyle: "italic",
              }}
            >
              "{ROOM_DESCS[currentRoom] || "Terminal access required."}"
            </p>
          </div>

          {/* Tasks area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {currentRoomTasks.length === 0 ? (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.8rem",
                  color: "#555",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                No tasks in this room.
              </div>
            ) : (
              currentRoomTasks.map((task) => (
                <TaskCard key={task.id} task={task} onSubmit={onTaskSubmit} />
              ))
            )}
          </div>
        </div>

        {/* ═══ ZONE D — RIGHT SIDEBAR ═══ */}
        <div
          style={{
            width: "240px",
            background: "#111118",
            borderLeft: "1px solid #2a2a3a",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Player tracker */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #2a2a3a",
              flex: "0 0 auto",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                color: "#888899",
                marginBottom: "8px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <UsersIcon size={12} /> Active Developers
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {playerList.map((p) => (
                <PlayerChip
                  key={p.id}
                  player={p}
                  showLocation
                  isYou={p.id === myId}
                />
              ))}
            </div>
          </div>

          {/* Chat */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                color: "#888899",
                padding: "10px 12px 4px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              System Chat
            </div>
            <ChatPanel
              messages={messages}
              onSend={sendMessage}
              maxHeight="9999px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
