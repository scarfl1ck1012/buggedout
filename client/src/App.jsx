// ═══════════════════════════════════════════════
// BuggedOut — App.jsx (Master Controller)
// State-driven screen routing + Socket event wiring
// ═══════════════════════════════════════════════

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import socket from "./socket.js";
import { useGameState } from "./hooks/useGameState.js";
import { useChat } from "./hooks/useChat.js";
import { useSound } from "./hooks/useSound.js";

import LandingScreen from "./screens/LandingScreen.jsx";
import LobbyBrowserScreen from "./screens/LobbyBrowserScreen.jsx";
import GameLobbyScreen from "./screens/GameLobbyScreen.jsx";
import GameScreen from "./screens/GameScreen.jsx";
import MeetingScreen from "./screens/MeetingScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";

export default function App() {
  const { state, actions } = useGameState();
  const { messages, sendMessage, clearMessages } = useChat();
  const { playSound, isMuted, toggleMute } = useSound();

  // ═══ SOCKET EVENT WIRING ═══════════════════
  useEffect(() => {
    // Session restore
    if (socket.identity) {
      actions.setIdentity(socket.identity.username, socket.identity.color);
      actions.setScreen("lobby");
    }

    // Identity confirmation
    socket.on("identity:set", () => {
      actions.setScreen("lobby");
    });

    // Room state (on join)
    socket.on("room:state", (room) => {
      actions.setRoom(room);
      playSound("playerJoin");
    });

    // Player joined
    socket.on("room:playerJoined", (player) => {
      actions.playerJoined(player);
      playSound("playerJoin");
    });

    // Player left
    socket.on("room:playerLeft", ({ playerId }) => {
      actions.playerLeft(playerId);
    });

    // Ready state changed
    socket.on("room:readyStateChanged", ({ playerId, isReady }) => {
      actions.readyStateChanged(playerId, isReady);
      playSound("buttonClick");
    });

    // Topic changed
    socket.on("room:topicChanged", ({ topic }) => {
      actions.topicChanged(topic);
    });

    // Game countdown
    socket.on("game:countdown", ({ seconds }) => {
      actions.gameCountdown(seconds);
      // Tick down
      let count = seconds;
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          actions.gameCountdown(null);
        } else {
          actions.gameCountdown(count);
        }
      }, 1000);
    });

    // Game started (per-player, includes role)
    socket.on("game:started", (data) => {
      actions.gameStarted(data);
      clearMessages();
    });

    // Player location update
    socket.on("player:locationUpdate", ({ playerId, roomName }) => {
      actions.playerLocationUpdate(playerId, roomName);
    });

    // Task completed by other player
    socket.on("task:completed", ({ taskId }) => {
      actions.taskCompleted(taskId);
      playSound("taskComplete");
    });

    // Task result (your own submission)
    socket.on("task:result", (data) => {
      actions.taskResult(data);
      if (data.success) {
        playSound("taskComplete");
      } else {
        playSound("taskFail");
        actions.setError("Task failed: " + (data.message || "Wrong answer"));
      }
    });

    // Deploy progress
    socket.on("deploy:progressUpdate", ({ progress }) => {
      actions.deployProgress(progress);
    });

    // Corruption update
    socket.on("corruption:update", ({ level }) => {
      actions.corruptionUpdate(level);
    });

    // Sabotage started
    socket.on("sabotage:started", (data) => {
      actions.sabotageStarted(data);
      playSound("sabotageStart");
    });

    // Sabotage resolved
    socket.on("sabotage:resolved", () => {
      actions.sabotageResolved();
      playSound("sabotageStop");
    });

    // Frame activated (imposter only)
    socket.on("frame:activated", ({ framing }) => {
      actions.frameActivated(framing);
    });

    // Meeting called
    socket.on("meeting:called", (data) => {
      actions.meetingCalled(data);
      playSound("meetingCalled");
    });

    // Meeting phase change
    socket.on("meeting:phaseChange", ({ phase }) => {
      actions.meetingPhaseChange(phase);
    });

    // Vote update
    socket.on("vote:update", (data) => {
      actions.voteUpdate(data);
    });

    // Vote results
    socket.on("vote:results", (results) => {
      actions.voteResults(results);
      playSound("voteReveal");
      if (results.revoked) {
        setTimeout(() => playSound("playerRevoked"), 1000);
      }
    });

    // Meeting ended
    socket.on("meeting:ended", () => {
      actions.meetingEnded();
    });

    // Game over
    socket.on("game:over", (recap) => {
      actions.gameOver(recap);
      if (recap.winner === "crewmates") {
        playSound("crewmateWin");
      } else {
        playSound("imposterWin");
      }
    });

    // Error
    socket.on("error:message", (msg) => {
      actions.setError(msg);
      setTimeout(() => actions.clearError(), 4000);
    });

    return () => {
      socket.off("identity:set");
      socket.off("room:state");
      socket.off("room:playerJoined");
      socket.off("room:playerLeft");
      socket.off("room:readyStateChanged");
      socket.off("room:topicChanged");
      socket.off("game:countdown");
      socket.off("game:started");
      socket.off("player:locationUpdate");
      socket.off("task:completed");
      socket.off("task:result");
      socket.off("deploy:progressUpdate");
      socket.off("corruption:update");
      socket.off("sabotage:started");
      socket.off("sabotage:resolved");
      socket.off("frame:activated");
      socket.off("meeting:called");
      socket.off("meeting:phaseChange");
      socket.off("vote:update");
      socket.off("vote:results");
      socket.off("meeting:ended");
      socket.off("game:over");
      socket.off("error:message");
    };
  }, []);

  // ═══ HANDLERS ══════════════════════════════

  const handleEnterServer = useCallback((username, color) => {
    actions.setIdentity(username, color);
    socket.emit("player:setIdentity", { username, color });
  }, []);

  const handleCreateRoom = useCallback((roomName) => {
    socket.emit("room:create", { roomName });
  }, []);

  const handleJoinRoom = useCallback((roomId) => {
    socket.emit("room:join", { roomId });
  }, []);

  const handleLeaveRoom = useCallback(() => {
    socket.emit("room:leave");
    actions.reset();
  }, []);

  const handleReady = useCallback((isReady) => {
    socket.emit("room:setReady", { isReady });
  }, []);

  const handleChangeTopic = useCallback((topic) => {
    socket.emit("room:changeTopic", { topic });
  }, []);

  const handleStartGame = useCallback(() => {
    socket.emit("room:startGame");
  }, []);

  const handleMoveRoom = useCallback((roomName) => {
    actions.setCurrentRoom(roomName);
    socket.emit("player:moveToRoom", { roomName });
  }, []);

  const handleTaskSubmit = useCallback((taskId, answer) => {
    socket.emit("task:attempt", { taskId, answer });
  }, []);

  const handleCallMeeting = useCallback(() => {
    socket.emit("meeting:call");
  }, []);

  const handleVote = useCallback((targetId) => {
    socket.emit("vote:cast", { targetId });
  }, []);

  const handleSabotage = useCallback((type) => {
    socket.emit("imposter:sabotage", { type });
  }, []);

  const handleFramePlayer = useCallback((targetId) => {
    socket.emit("imposter:framePlayer", { targetId });
  }, []);

  const handleResolveSabotage = useCallback(() => {
    socket.emit("sabotage:resolve");
  }, []);

  const handlePlayAgain = useCallback(() => {
    actions.reset();
  }, []);

  const handleBackToLobby = useCallback(() => {
    actions.reset();
  }, []);

  // ═══ RENDER ════════════════════════════════

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Error toast */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9000,
              background: "rgba(255,68,68,0.15)",
              border: "1px solid #ff4444",
              borderRadius: "4px",
              padding: "10px 24px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.75rem",
              color: "#ff4444",
            }}
          >
            ⚠ {state.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screens */}
      {state.screen === "landing" && (
        <LandingScreen onEnter={handleEnterServer} />
      )}

      {state.screen === "lobby" && (
        <LobbyBrowserScreen
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          username={state.username}
        />
      )}

      {state.screen === "gameLobby" && (
        <GameLobbyScreen
          room={state.room}
          players={state.players}
          myId={socket.id}
          isHost={state.room?.host === socket.id}
          onReady={handleReady}
          onChangeTopic={handleChangeTopic}
          onStartGame={handleStartGame}
          onLeave={handleLeaveRoom}
          countdown={state.countdown}
        />
      )}

      {state.screen === "game" && (
        <>
          <GameScreen
            state={state}
            myId={socket.id}
            onMoveRoom={handleMoveRoom}
            onTaskSubmit={handleTaskSubmit}
            onCallMeeting={handleCallMeeting}
            onSabotage={handleSabotage}
            onFramePlayer={handleFramePlayer}
            onResolveSabotage={handleResolveSabotage}
            messages={messages}
            sendMessage={sendMessage}
            playSound={playSound}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />
          {state.meetingActive && (
            <MeetingScreen
              calledBy={state.meetingCalledBy}
              log={state.meetingLog}
              players={state.players}
              myId={socket.id}
              phase={state.meetingPhase}
              voteResults={state.voteResults}
              messages={messages}
              sendMessage={sendMessage}
              onVote={handleVote}
              playSound={playSound}
            />
          )}
        </>
      )}

      {state.screen === "result" && (
        <ResultScreen
          gameOver={state.gameOver}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
}
