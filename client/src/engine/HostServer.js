// ═══════════════════════════════════════════════
// BuggedOut — Host Server Wrapper
// Replaces the Express/Socket.io backend logic
// ═══════════════════════════════════════════════

import * as gm from "./gameEngine.js";
import { GAME_CONFIG } from "./constants.js";

export class HostServer {
  constructor(roomId, fakeSocket) {
    this.roomId = roomId;
    this.io = fakeSocket;
  }

  handleClientEvent(socketId, event, data = {}) {
    // ─── IDENTITY OVERRIDE ──────────────────
    // Since identities were set locally before the room existed, the client
    // passes its identity along with room:create and room:join.
    if (data.identity) {
      gm.setPlayerIdentity(
        socketId,
        data.identity.username,
        data.identity.color,
      );
    }

    switch (event) {
      // ─── ROOM MANAGEMENT ──────────────────
      case "room:create": {
        const result = gm.createRoom(socketId, data.roomName);
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);

        // Ensure gm uses our generated roomId
        result.room.id = this.roomId;
        gm.setRoomIdOverride(result.room.name, this.roomId);

        this.io.serverEmitToRoom(this.roomId, "room:state", result.room);
        this.io.updateLobbyPresence(result.room);
        break;
      }

      case "room:join": {
        const result = gm.joinRoom(socketId, this.roomId);
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);

        this.io.serverEmit(socketId, "room:state", result.room);
        this.io.serverEmitToRoom(
          this.roomId,
          "room:playerJoined",
          result.player,
        );
        this.io.updateLobbyPresence(result.room);
        break;
      }

      case "room:leave": {
        const result = gm.leaveRoom(socketId);
        if (!result) return;

        if (result.roomDeleted) {
          this.io.removeLobbyPresence();
          return;
        }

        if (result.gameOver) {
          this.io.serverEmitToRoom(this.roomId, "game:over", result.gameOver);
        } else if (result.room) {
          this.io.serverEmitToRoom(this.roomId, "room:playerLeft", {
            playerId: socketId,
          });
          this.io.serverEmitToRoom(this.roomId, "room:state", result.room);
          this.io.updateLobbyPresence(result.room);
        }
        break;
      }

      // ─── LOBBY ACTIONS ────────────────────
      case "room:setReady": {
        const result = gm.setPlayerReady(socketId, data.isReady);
        if (!result) return;
        this.io.serverEmitToRoom(this.roomId, "room:readyStateChanged", {
          playerId: result.playerId,
          isReady: result.isReady,
        });
        break;
      }

      case "room:changeTopic": {
        const result = gm.changeTopic(socketId, data.topic);
        if (!result) return;
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);
        this.io.serverEmitToRoom(this.roomId, "room:topicChanged", {
          topic: result.topic,
        });
        break;
      }

      case "room:startGame": {
        const check = gm.canStartGame(socketId);
        if (check.error)
          return this.io.serverEmit(socketId, "error:message", check.error);

        this.io.serverEmitToRoom(this.roomId, "game:countdown", { seconds: 3 });

        setTimeout(() => {
          const result = gm.startGame(this.roomId);
          if (!result) return;

          Object.entries(result.playerStarts).forEach(([sid, pdata]) => {
            this.io.serverEmit(sid, "game:started", {
              role: pdata.role,
              tasks: pdata.tasks,
              roomLayout: pdata.roomLayout,
              room: result.room,
            });
          });

          // Start game timer (10 min)
          const room = gm.getRoom(this.roomId);
          if (room) {
            this.io.updateLobbyPresence(room);
            room.timers.game = setTimeout(() => {
              if (room.status === "active" || room.status === "meeting") {
                const recap = {
                  winner: "imposter",
                  reason: "Time ran out — deployment deadline missed!",
                  imposter: (() => {
                    const imp = Object.values(room.players).find(
                      (p) => p.role === "imposter",
                    );
                    return imp
                      ? { id: imp.id, username: imp.username, color: imp.color }
                      : null;
                  })(),
                  tasksCompleted: Object.values(room.tasks).filter(
                    (t) => t.completedBy,
                  ).length,
                  totalTasks: Object.keys(room.tasks).length,
                  deployProgress: room.deployProgress,
                  corruptionLevel: room.corruptionLevel,
                  meetingCount: room.meetingCount,
                  playerStats: Object.values(room.players).map((p) => ({
                    username: p.username,
                    color: p.color,
                    role: p.role,
                    status: p.status,
                    tasksCompleted: p.tasksCompleted,
                  })),
                };
                room.status = "ended";
                this.io.serverEmitToRoom(this.roomId, "game:over", recap);
              }
            }, GAME_CONFIG.GAME_TIMER);
          }
        }, 3500);
        break;
      }

      // ─── GAMEPLAY ─────────────────────────
      case "player:moveToRoom": {
        const result = gm.movePlayer(socketId, data.roomName);
        if (!result) return;
        this.io.serverEmitToRoom(this.roomId, "player:locationUpdate", {
          playerId: result.playerId,
          roomName: result.roomName,
        });
        break;
      }

      case "task:attempt": {
        const result = gm.handleTaskAttempt(
          this.roomId,
          socketId,
          data.taskId,
          data.answer,
        );
        if (!result) return;
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);

        if (result.success) {
          this.io.serverEmit(socketId, "task:result", {
            taskId: result.taskId,
            success: true,
            faked: result.faked || false,
            explanation: result.explanation || null,
          });

          if (!result.faked) {
            this.io.serverEmitToRoom(this.roomId, "deploy:progressUpdate", {
              progress: result.deployProgress,
            });
            // Send completed event to others so UI updates
            this.io.serverEmitToRoom(this.roomId, "task:completed", {
              taskId: result.taskId,
              playerId: result.playerId,
            });
          } else {
            this.io.serverEmitToRoom(this.roomId, "corruption:update", {
              level: result.corruptionLevel,
            });
          }

          if (result.gameOver) {
            this.io.serverEmitToRoom(this.roomId, "game:over", result.gameOver);
          }
        } else {
          this.io.serverEmit(socketId, "task:result", {
            taskId: result.taskId,
            success: false,
            message: result.message,
          });
        }
        break;
      }

      // ─── IMPOSTER ABILITIES ───────────────
      case "imposter:sabotage": {
        const result = gm.handleSabotage(this.roomId, socketId, data.type);
        if (!result) return;
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);

        this.io.serverEmitToRoom(this.roomId, "sabotage:started", {
          type: result.sabotage.type,
          room: result.sabotage.room,
          timeLimit:
            data.type === "emergency"
              ? GAME_CONFIG.CRITICAL_SABOTAGE_TIMER / 1000
              : GAME_CONFIG.DISRUPTIVE_FREEZE_DURATION / 1000,
        });
        this.io.serverEmitToRoom(
          this.roomId,
          "chat:message",
          result.chatMessage,
        );

        // Wait, gm sets a server-side setTimeout that relies on checking win conditions.
        // It's handled in `gameEngine.js`, we just need a hook if it triggers.
        // I will add a `onGameOver` callback to gameEngine or just poll it.
        // Let's modify gameEngine so that when sabotage resolves or fails, it emits back!
        // Actually, we can handle the timeout manually here to ensure it emits:
        if (data.type === "emergency") {
          setTimeout(() => {
            const room = gm.getRoom(this.roomId);
            if (room && room.status === "active" && !room.activeSabotage) {
              // It was either resolved or failed.
              // If it failed, it added corruption. We must broadcast the new corruption!
              this.io.serverEmitToRoom(this.roomId, "corruption:update", {
                level: room.corruptionLevel,
              });
              const win = gm.checkWinConditions(room);
              if (win) this.io.serverEmitToRoom(this.roomId, "game:over", win);
            }
          }, GAME_CONFIG.CRITICAL_SABOTAGE_TIMER + 500); // Check shortly after duration
        }
        break;
      }

      case "imposter:framePlayer": {
        const result = gm.handleFramePlayer(
          this.roomId,
          socketId,
          data.targetId,
        );
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);
        this.io.serverEmit(socketId, "frame:activated", {
          framing: result.framing,
        });
        break;
      }

      case "sabotage:resolve": {
        const result = gm.resolveSabotage(this.roomId, socketId);
        if (!result) return;
        this.io.serverEmitToRoom(this.roomId, "sabotage:resolved", {
          type: "resolved",
        });
        this.io.serverEmitToRoom(
          this.roomId,
          "chat:message",
          result.chatMessage,
        );
        break;
      }

      // ─── MEETINGS ─────────────────────────
      case "meeting:call": {
        const result = gm.callMeeting(this.roomId, socketId);
        if (!result) return;
        if (result.error)
          return this.io.serverEmit(socketId, "error:message", result.error);

        this.io.serverEmitToRoom(this.roomId, "meeting:called", {
          calledBy: result.calledBy,
          log: result.log,
        });

        setTimeout(() => {
          gm.startVotePhase(this.roomId);
          this.io.serverEmitToRoom(this.roomId, "meeting:phaseChange", {
            phase: "voting",
          });

          setTimeout(() => {
            const tallyResult = gm.tallyVotes(this.roomId);
            if (!tallyResult) return;
            this.io.serverEmitToRoom(this.roomId, "vote:results", tallyResult);

            if (tallyResult.gameOver) {
              setTimeout(
                () =>
                  this.io.serverEmitToRoom(
                    this.roomId,
                    "game:over",
                    tallyResult.gameOver,
                  ),
                3000,
              );
            } else {
              setTimeout(() => {
                gm.endMeeting(this.roomId);
                this.io.serverEmitToRoom(this.roomId, "meeting:ended");
              }, 4000);
            }
          }, GAME_CONFIG.VOTE_TIMER);
        }, GAME_CONFIG.DISCUSSION_TIMER);
        break;
      }

      case "vote:cast": {
        const result = gm.handleVote(this.roomId, socketId, data.targetId);
        if (!result) return;

        this.io.serverEmitToRoom(this.roomId, "vote:update", {
          totalVotes: result.totalVotes,
          totalAlive: result.totalAlive,
        });

        if (result.allVoted) {
          const tallyResult = gm.tallyVotes(this.roomId);
          if (!tallyResult) return;
          this.io.serverEmitToRoom(this.roomId, "vote:results", tallyResult);

          if (tallyResult.gameOver) {
            setTimeout(
              () =>
                this.io.serverEmitToRoom(
                  this.roomId,
                  "game:over",
                  tallyResult.gameOver,
                ),
              3000,
            );
          } else {
            setTimeout(() => {
              gm.endMeeting(this.roomId);
              this.io.serverEmitToRoom(this.roomId, "meeting:ended");
            }, 4000);
          }
        }
        break;
      }

      // ─── CHAT ─────────────────────────────
      case "chat:message": {
        const result = gm.addChatMessage(socketId, data.text);
        if (!result) return;
        this.io.serverEmitToRoom(this.roomId, "chat:message", result.message);
        break;
      }
    }
  }
}
