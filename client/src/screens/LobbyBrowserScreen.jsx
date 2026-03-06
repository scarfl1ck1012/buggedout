// ═══════════════════════════════════════════════
// BuggedOut — LobbyBrowserScreen
// See open game rooms, create new room
// ═══════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Monitor, RefreshCw } from "lucide-react";
import socket from "../socket.js";
import TerminalCard from "../components/TerminalCard.jsx";

export default function LobbyBrowserScreen({
  onJoinRoom,
  onCreateRoom,
  username,
}) {
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    const handleRooms = (roomList) => setRooms(roomList);
    socket.on("rooms:list", handleRooms);

    // Request fresh list
    socket.emit("rooms:list");

    return () => socket.off("rooms:list", handleRooms);
  }, []);

  const handleCreate = () => {
    onCreateRoom(newRoomName || undefined);
    setShowCreate(false);
    setNewRoomName("");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.3rem",
              color: "#00ff88",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            <Monitor
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Active Sprints
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#888899",
            }}
          >
            Welcome, <span style={{ color: "#ffb347" }}>{username}</span> —
            choose a sprint to join
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="btn btn-green"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.8rem",
            padding: "10px 20px",
          }}
        >
          <Plus size={16} /> CREATE NEW ROOM
        </motion.button>
      </div>

      {/* Room list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
          alignContent: "start",
        }}
      >
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <TerminalCard title={`Room: "${room.name}"`} glowColor="green">
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#888899" }}>Host:</span>
                    <span style={{ color: "#e0e0e0" }}>{room.host}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#888899" }}>Players:</span>
                    <span style={{ color: "#ffb347" }}>
                      <Users
                        size={12}
                        style={{ verticalAlign: "middle", marginRight: "4px" }}
                      />
                      {room.playerCount}/{room.maxPlayers}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#888899" }}>Topic:</span>
                    <span style={{ color: "#00d4ff" }}>{room.topic}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#888899" }}>Status:</span>
                    <span style={{ color: "#00ff88" }}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onJoinRoom(room.id)}
                    className="btn btn-green"
                    style={{ marginTop: "8px", width: "100%" }}
                    disabled={room.playerCount >= room.maxPlayers}
                  >
                    {room.playerCount >= room.maxPlayers
                      ? "[ ROOM FULL ]"
                      : "[ JOIN ROOM ]"}
                  </motion.button>
                </div>
              </TerminalCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {rooms.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.9rem",
                color: "#555",
              }}
            >
              No active sprints found. Start one.
              <span style={{ animation: "blink 1s infinite" }}>▌</span>
            </p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#111118",
                border: "1px solid #00ff88",
                borderRadius: "6px",
                padding: "30px",
                width: "400px",
                boxShadow: "0 0 40px rgba(0,255,136,0.1)",
              }}
            >
              <h2
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1rem",
                  color: "#00ff88",
                  marginBottom: "20px",
                }}
              >
                Create New Sprint Room
              </h2>
              <label
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  color: "#888899",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Room Name (optional)
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="sprint-x7f2"
                className="input-terminal"
                style={{ marginBottom: "16px" }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowCreate(false)}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="btn btn-green"
                  style={{ flex: 1 }}
                >
                  Create Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
