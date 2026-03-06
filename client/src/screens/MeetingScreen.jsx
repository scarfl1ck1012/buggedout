// ═══════════════════════════════════════════════
// BuggedOut — MeetingScreen (Modal Overlay)
// Git Blame Log + Discussion + Voting
// ═══════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "../components/ChatPanel.jsx";
import VoteButton from "../components/VoteButton.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";

export default function MeetingScreen({
  calledBy,
  log,
  players,
  myId,
  phase,
  voteResults,
  messages,
  sendMessage,
  onVote,
  playSound,
}) {
  const [myVote, setMyVote] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const playerList = Object.values(players || {}).filter(
    (p) => p.status === "alive",
  );
  const maxVotes = playerList.length;

  useEffect(() => {
    if (voteResults) {
      setShowResults(true);
      playSound?.("voteReveal");
    }
  }, [voteResults]);

  const handleVote = (targetId) => {
    if (myVote || phase !== "voting") return;
    setMyVote(targetId);
    onVote(targetId);
    playSound?.("buttonClick");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          background: "#111118",
          border: "1px solid #ff4444",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 60px rgba(255,68,68,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #2a2a3a",
            background: "rgba(255,68,68,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.85rem",
              color: "#ff4444",
              fontWeight: 600,
            }}
          >
            🚨 EMERGENCY CODE REVIEW
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#888899",
            }}
          >
            Called by:{" "}
            <span style={{ color: "#ffb347" }}>
              {calledBy?.username || "Unknown"}
            </span>
          </span>
        </div>

        {/* Content — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Git Blame Log */}
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                color: "#888899",
                marginBottom: "8px",
                letterSpacing: "0.05em",
              }}
            >
              GIT BLAME LOG (last 90 seconds):
            </div>
            <div
              style={{
                background: "#0a0a0f",
                border: "1px solid #2a2a3a",
                borderRadius: "4px",
                padding: "10px",
                maxHeight: "120px",
                overflowY: "auto",
              }}
            >
              {!log || log.length === 0 ? (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.65rem",
                    color: "#555",
                  }}
                >
                  No recent activity logged.
                </div>
              ) : (
                log.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.65rem",
                      color: "#e0e0e0",
                      padding: "2px 0",
                    }}
                  >
                    <span style={{ color: "#888899" }}>
                      [{entry.timeAgo}s ago]
                    </span>{" "}
                    <span
                      style={{
                        color:
                          entry.username === "UNKNOWN" ? "#ff4444" : "#00d4ff",
                      }}
                    >
                      {entry.username || "System"}
                    </span>{" "}
                    <span style={{ color: "#888899" }}>→</span>{" "}
                    <span>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat / Discussion */}
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                color: "#888899",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {phase === "discussion"
                  ? "DISCUSSION"
                  : phase === "voting"
                    ? "VOTING PHASE"
                    : "RESULTS"}
              </span>
              {phase === "discussion" && <CountdownTimer seconds={60} />}
              {phase === "voting" && <CountdownTimer seconds={30} urgent />}
            </div>
            <div
              style={{
                background: "#0a0a0f",
                border: "1px solid #2a2a3a",
                borderRadius: "4px",
                height: "140px",
              }}
            >
              <ChatPanel
                messages={messages}
                onSend={sendMessage}
                disabled={phase === "results"}
                maxHeight="100px"
              />
            </div>
          </div>

          {/* Vote Results */}
          <AnimatePresence>
            {showResults && voteResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#0a0a0f",
                  border: `1px solid ${voteResults.wasImposter ? "#00ff88" : "#ff4444"}`,
                  borderRadius: "4px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                {voteResults.revoked ? (
                  <>
                    <motion.div
                      animate={{
                        x: [0, -10, 10, -10, 10, 0],
                        opacity: [1, 1, 1, 1, 1, 1],
                      }}
                      transition={{ duration: 0.8 }}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "1.1rem",
                        color: "#ff4444",
                        fontWeight: 700,
                        marginBottom: "10px",
                      }}
                    >
                      ACCESS REVOKED — {voteResults.revoked.username}
                    </motion.div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.8rem",
                        color: voteResults.wasImposter ? "#00ff88" : "#ffb347",
                      }}
                    >
                      {voteResults.wasImposter
                        ? `☠ IMPOSTER FOUND — ${voteResults.revoked.username} was the Rogue Dev`
                        : `😇 ${voteResults.revoked.username} was innocent.`}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.9rem",
                      color: "#888899",
                    }}
                  >
                    No one was revoked. (Tie or skip)
                  </div>
                )}

                {/* Vote breakdown */}
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {(voteResults.breakdown || []).map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      <span
                        style={{
                          color: entry.color || "#888899",
                          minWidth: "100px",
                          textAlign: "right",
                        }}
                      >
                        {entry.username}
                      </span>
                      <div
                        style={{
                          height: "12px",
                          width: `${Math.max(4, (entry.count / maxVotes) * 150)}px`,
                          background: entry.color || "#888899",
                          borderRadius: "2px",
                        }}
                      />
                      <span style={{ color: "#e0e0e0" }}>({entry.count})</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voting section */}
          {(phase === "voting" || (phase === "discussion" && !showResults)) &&
            !showResults && (
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.7rem",
                    color: "#888899",
                    marginBottom: "8px",
                  }}
                >
                  VOTE — WHO IS THE IMPOSTER?
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {playerList
                    .filter((p) => p.id !== myId)
                    .map((p) => (
                      <VoteButton
                        key={p.id}
                        player={p}
                        isSelected={myVote === p.id}
                        onVote={handleVote}
                        disabled={!!myVote || phase !== "voting"}
                        maxVotes={maxVotes}
                      />
                    ))}
                  <VoteButton
                    player={{
                      id: "skip",
                      username: "SKIP VOTE",
                      color: "#888899",
                    }}
                    isSelected={myVote === "skip"}
                    onVote={() => handleVote("skip")}
                    disabled={!!myVote || phase !== "voting"}
                    maxVotes={maxVotes}
                  />
                </div>
                {myVote && (
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.65rem",
                      color: "#00ff88",
                      textAlign: "center",
                      marginTop: "8px",
                    }}
                  >
                    ✓ Vote submitted. Waiting for others...
                  </div>
                )}
              </div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
}
