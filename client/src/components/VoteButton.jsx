// ═══════════════════════════════════════════════
// BuggedOut — VoteButton Component
// ═══════════════════════════════════════════════

import { motion } from "framer-motion";

export default function VoteButton({
  player,
  voteCount = 0,
  isSelected = false,
  onVote,
  disabled = false,
  maxVotes = 1,
}) {
  if (!player) return null;

  const barWidth = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={() => !disabled && onVote && onVote(player.id || player.target)}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        background: isSelected ? "rgba(0,255,136,0.08)" : "#1a1a24",
        border: `1px solid ${isSelected ? player.color || "#00ff88" : "#2a2a3a"}`,
        borderRadius: "4px",
        width: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        boxShadow: isSelected
          ? `0 0 12px ${player.color || "#00ff88"}22`
          : "none",
        opacity: disabled && !isSelected ? 0.5 : 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Vote bar background */}
      {voteCount > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${barWidth}%`,
            background: `${player.color || "#00ff88"}15`,
            transition: "width 0.5s ease",
          }}
        />
      )}

      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: player.color || "#888",
          flexShrink: 0,
          position: "relative",
        }}
      />

      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.75rem",
          color: "#e0e0e0",
          position: "relative",
          flex: 1,
          textAlign: "left",
        }}
      >
        {player.username}
      </span>

      {voteCount > 0 && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: player.color || "#00ff88",
            fontWeight: 600,
            position: "relative",
          }}
        >
          {voteCount}
        </span>
      )}
    </motion.button>
  );
}
