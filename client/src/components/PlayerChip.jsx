// ═══════════════════════════════════════════════
// BuggedOut — PlayerChip Component
// ═══════════════════════════════════════════════

export default function PlayerChip({
  player,
  showLocation = false,
  isYou = false,
  isSuspect = false,
}) {
  if (!player) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        borderRadius: "4px",
        background: isYou ? "rgba(0,255,136,0.05)" : "transparent",
        border: isSuspect
          ? "1px solid rgba(255,68,68,0.4)"
          : "1px solid transparent",
        animation: isSuspect ? "pulse-dot 2s infinite" : "none",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: player.color || "#00ff88",
          boxShadow: `0 0 6px ${player.color || "#00ff88"}44`,
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            color: player.status === "revoked" ? "#555" : "#e0e0e0",
            textDecoration:
              player.status === "revoked" ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.username || "Unknown"}
          {isYou && (
            <span
              style={{
                color: "#00ff88",
                marginLeft: "4px",
                fontSize: "0.65rem",
              }}
            >
              (you)
            </span>
          )}
        </span>
        {showLocation && player.currentRoom && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              color: "#ffb347",
            }}
          >
            {player.currentRoom}
          </span>
        )}
      </div>
    </div>
  );
}
