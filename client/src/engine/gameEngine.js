// ═══════════════════════════════════════════════
// BuggedOut — Game Manager (Core Game Engine)
// ═══════════════════════════════════════════════

import {
  GAME_CONFIG,
  SABOTAGE_TYPES,
  ROOM_STATUSES,
  ROLES,
} from "./constants.js";
import TASK_BANK from "./taskBank.js";

// All active game rooms
const rooms = new Map();

// Player socket → room mapping
const playerRooms = new Map();

// Player identities (set before joining rooms)
const playerIdentities = new Map();

// ─── Random ID Generator ─────────────────
function generateId(prefix = "sprint") {
  const hex = Math.random().toString(16).substring(2, 6);
  return `${prefix}-${hex}`;
}

// ─── Shuffle Array ────────────────────────
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ═══════════════════════════════════════════════
// ROOM MANAGEMENT
// ═══════════════════════════════════════════════

export function createRoom(socketId, roomName) {
  const identity = playerIdentities.get(socketId);
  if (!identity) return { error: "Set identity first" };

  const id = generateId();
  const room = {
    id,
    name: roomName || id,
    host: socketId,
    topic: "DSA",
    status: ROOM_STATUSES.WAITING,

    players: {},
    tasks: {},
    deployProgress: 0,
    corruptionLevel: 0,

    activeSabotage: null,
    meetingLog: [],
    chatHistory: [],
    gameLog: [],

    settings: {
      maxPlayers: GAME_CONFIG.MAX_PLAYERS,
      taskCount: 14,
      meetingCooldown: GAME_CONFIG.MEETING_COOLDOWN,
      sabotageTimeout: GAME_CONFIG.CRITICAL_SABOTAGE_TIMER,
    },

    timers: {
      gameStart: null,
      sabotage: null,
      meeting: null,
      vote: null,
      game: null,
      deployFreeze: null,
    },

    votingActive: false,
    votes: {},
    meetingCalledBy: null,
    lastMeetingTime: null,
    meetingCount: 0,

    imposterFrameTarget: null,
    imposterFrameActive: false,
    imposterLastSabotageTime: 0,
    imposterSilentSabotageTime: 0,
    imposterFrameMeetingCooldown: 0,
  };

  // Add host as first player
  room.players[socketId] = createPlayerObject(socketId, identity);
  rooms.set(id, room);
  playerRooms.set(socketId, id);

  return { room: sanitizeRoom(room) };
}

export function setRoomIdOverride(oldId, newId) {
  const room = rooms.get(oldId);
  if (room) {
    rooms.delete(oldId);
    room.id = newId;
    rooms.set(newId, room);
    for (const [pid, rid] of playerRooms.entries()) {
      if (rid === oldId) playerRooms.set(pid, newId);
    }
  }
}

export function joinRoom(socketId, roomId) {
  const identity = playerIdentities.get(socketId);
  if (!identity) return { error: "Set identity first" };

  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.status !== ROOM_STATUSES.WAITING)
    return { error: "Game already in progress" };
  if (Object.keys(room.players).length >= room.settings.maxPlayers)
    return { error: "Room full" };

  room.players[socketId] = createPlayerObject(socketId, identity);
  playerRooms.set(socketId, roomId);

  return {
    room: sanitizeRoom(room),
    player: sanitizePlayer(room.players[socketId]),
  };
}

export function leaveRoom(socketId) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;

  const room = rooms.get(roomId);
  if (!room) {
    playerRooms.delete(socketId);
    return null;
  }

  delete room.players[socketId];
  playerRooms.delete(socketId);

  const playerCount = Object.keys(room.players).length;

  // If room empty, clean up
  if (playerCount === 0) {
    cleanupRoom(roomId);
    return { roomDeleted: true, roomId };
  }

  // If host left during waiting, transfer host
  if (room.host === socketId && room.status === ROOM_STATUSES.WAITING) {
    room.host = Object.keys(room.players)[0];
  }

  // If game is active, check win conditions
  if (
    room.status === ROOM_STATUSES.ACTIVE ||
    room.status === ROOM_STATUSES.MEETING
  ) {
    const result = checkWinConditions(room);
    if (result) {
      return { roomId, leftDuringGame: true, gameOver: result };
    }
  }

  return { roomId, room: sanitizeRoom(room) };
}

function createPlayerObject(socketId, identity) {
  return {
    id: socketId,
    username: identity.username,
    color: identity.color,
    role: null,
    status: "alive",
    currentRoom: GAME_CONFIG.ROOMS[0].name,
    tasksCompleted: 0,
    isReady: false,
    hasVoted: false,
    voteTarget: null,
  };
}

// ═══════════════════════════════════════════════
// LOBBY ACTIONS
// ═══════════════════════════════════════════════

export function setPlayerIdentity(socketId, username, color) {
  playerIdentities.set(socketId, { username, color });
}

export function setPlayerReady(socketId, isReady) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;
  const room = rooms.get(roomId);
  if (!room || !room.players[socketId]) return null;

  room.players[socketId].isReady = isReady;
  return { roomId, playerId: socketId, isReady };
}

export function changeTopic(socketId, topic) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.host !== socketId) return { error: "Only host can change topic" };

  room.topic = topic;
  return { roomId, topic };
}

export function canStartGame(socketId) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return { error: "Not in a room" };
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };
  if (room.host !== socketId) return { error: "Only host can start" };
  if (Object.keys(room.players).length < GAME_CONFIG.MIN_PLAYERS) {
    return { error: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players` };
  }

  const allReady = Object.values(room.players).every((p) => p.isReady);
  if (!allReady) return { error: "Not all players are ready" };

  return { ok: true, roomId };
}

// ═══════════════════════════════════════════════
// GAME START
// ═══════════════════════════════════════════════

export function startGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.status = ROOM_STATUSES.ACTIVE;

  // Assign roles
  assignRoles(room);

  // Select tasks from bank
  selectTasksForGame(room);

  // Build per-player game start data
  const playerStarts = {};
  for (const [sid, player] of Object.entries(room.players)) {
    playerStarts[sid] = {
      role: player.role,
      tasks: getPlayerVisibleTasks(room, sid),
      roomLayout: GAME_CONFIG.ROOMS,
    };
  }

  // Log game start
  room.gameLog.push({
    time: Date.now(),
    type: "game_start",
    message: `Game started with ${Object.keys(room.players).length} players`,
  });

  return { roomId, playerStarts, room: sanitizeRoom(room) };
}

function assignRoles(room) {
  const playerIds = shuffle(Object.keys(room.players));
  // First player in shuffled array is imposter
  playerIds.forEach((id, index) => {
    room.players[id].role =
      index < GAME_CONFIG.IMPOSTERS_COUNT ? ROLES.IMPOSTER : ROLES.CREWMATE;
  });
}

function selectTasksForGame(room) {
  const playerCount = Object.keys(room.players).length;
  const totalTasks = GAME_CONFIG.TASK_COUNTS[playerCount] || 14;
  const topic = room.topic;

  // Get tasks from the bank for selected topic
  let availableTasks = TASK_BANK[topic]
    ? [...TASK_BANK[topic]]
    : [...TASK_BANK["DSA"]];
  availableTasks = shuffle(availableTasks);

  // Select up to totalTasks
  const selected = availableTasks.slice(0, totalTasks);

  // Distribute across rooms
  const gameRooms = GAME_CONFIG.ROOMS;
  room.tasks = {};

  selected.forEach((task, index) => {
    const roomAssignment = gameRooms[index % gameRooms.length];
    const taskId = `task_${String(index + 1).padStart(3, "0")}`;
    room.tasks[taskId] = {
      id: taskId,
      originalId: task.id,
      room: roomAssignment.name,
      type: task.type,
      title: task.title,
      description: task.description,
      code: task.code,
      language: task.language,
      options: task.options,
      correctAnswer: task.correctAnswer,
      explanation: task.explanation,
      difficulty: task.difficulty,
      completedBy: null,
      isSabotaged: false,
    };
  });

  room.settings.taskCount = Object.keys(room.tasks).length;
}

// ═══════════════════════════════════════════════
// TASK HANDLING
// ═══════════════════════════════════════════════

export function handleTaskAttempt(roomId, playerId, taskId, answer) {
  const room = rooms.get(roomId);
  if (!room || room.status !== ROOM_STATUSES.ACTIVE) return null;

  const task = room.tasks[taskId];
  if (!task || task.completedBy) return { error: "Task not available" };

  const player = room.players[playerId];
  if (!player || player.status !== "alive") return null;

  const isCorrect = answer === task.correctAnswer;
  const isImposter = player.role === ROLES.IMPOSTER;

  if (isCorrect) {
    task.completedBy = playerId;

    if (isImposter) {
      // Imposter can fix tasks too, but we log it as suspicious
      room.gameLog.push({
        time: Date.now(),
        type: "task_completed",
        playerId,
        username: "UNKNOWN",
        message: `Task fixed in ${task.room}`,
        taskId,
        room: task.room,
      });
    } else {
      player.tasksCompleted++;
      room.gameLog.push({
        time: Date.now(),
        type: "task_completed",
        playerId,
        username: room.imposterFrameActive
          ? room.imposterFrameTarget || player.username
          : player.username,
        message: `${player.username} fixed "${task.title}" in ${task.room}`,
        taskId,
        room: task.room,
      });
    }

    // Update deploy progress
    if (!room.timers.deployFreeze) {
      const progress = GAME_CONFIG.DEPLOY_PROGRESS_PER_TASK(
        Object.keys(room.players).length,
      );
      room.deployProgress = Math.min(100, room.deployProgress + progress);
    }

    // Check win
    const winResult = checkWinConditions(room);
    return {
      roomId,
      success: true,
      taskId,
      playerId,
      deployProgress: room.deployProgress,
      explanation: task.explanation,
      gameOver: winResult || null,
    };
  } else {
    // Wrong answer
    if (isImposter) {
      // Imposter submitting wrong answer = corruption
      room.corruptionLevel = Math.min(
        100,
        room.corruptionLevel + GAME_CONFIG.CORRUPTION_PER_FAKE_TASK,
      );
      task.isSabotaged = true;

      room.gameLog.push({
        time: Date.now(),
        type: "task_corrupted",
        playerId,
        username: "UNKNOWN",
        message: `Task corrupted in ${task.room}`,
        taskId,
        room: task.room,
      });

      const winResult = checkWinConditions(room);
      return {
        roomId,
        success: true, // Imposter sees success (fake)
        faked: true,
        taskId,
        playerId,
        corruptionLevel: room.corruptionLevel,
        gameOver: winResult || null,
      };
    }

    return {
      roomId,
      success: false,
      taskId,
      playerId,
      message: "Wrong answer, try again.",
    };
  }
}

// ═══════════════════════════════════════════════
// IMPOSTER ABILITIES
// ═══════════════════════════════════════════════

export function handleSabotage(roomId, socketId, sabotageType) {
  const room = rooms.get(roomId);
  if (!room || room.status !== ROOM_STATUSES.ACTIVE) return null;

  const player = room.players[socketId];
  if (!player || player.role !== ROLES.IMPOSTER)
    return { error: "Not imposter" };

  const now = Date.now();

  if (sabotageType === "silent") {
    if (
      now - room.imposterSilentSabotageTime <
      SABOTAGE_TYPES.SILENT.cooldown
    ) {
      return { error: "Silent sabotage on cooldown" };
    }

    room.imposterSilentSabotageTime = now;
    room.activeSabotage = {
      type: "silent",
      startedAt: now,
      room: player.currentRoom,
    };

    // Freeze deploy bar
    room.timers.deployFreeze = setTimeout(() => {
      room.timers.deployFreeze = null;
      room.activeSabotage = null;
    }, SABOTAGE_TYPES.SILENT.duration);

    room.gameLog.push({
      time: now,
      type: "sabotage",
      message: "⚠ Infinite loop detected — deploy pipeline frozen",
      room: player.currentRoom,
    });

    room.chatHistory.push({
      id: generateId("msg"),
      type: "system",
      text: "⚠ Infinite Loop detected! Deploy pipeline frozen!",
      timestamp: now,
    });

    return {
      roomId,
      sabotage: room.activeSabotage,
      chatMessage: room.chatHistory[room.chatHistory.length - 1],
    };
  }

  if (sabotageType === "emergency") {
    if (
      now - room.imposterLastSabotageTime <
      SABOTAGE_TYPES.EMERGENCY.cooldown
    ) {
      return { error: "Emergency sabotage on cooldown" };
    }

    room.imposterLastSabotageTime = now;
    room.activeSabotage = {
      type: "emergency",
      startedAt: now,
      room: player.currentRoom,
      resolved: false,
    };

    room.gameLog.push({
      time: now,
      type: "sabotage",
      message: "🚨 CRITICAL OUTAGE — Emergency bug deployed!",
      room: player.currentRoom,
    });

    room.chatHistory.push({
      id: generateId("msg"),
      type: "system",
      text: "🚨 CRITICAL OUTAGE! Emergency bug deployed! Resolve in 45s or system crashes!",
      timestamp: now,
    });

    // Start timer — if not resolved, imposter wins
    room.timers.sabotage = setTimeout(() => {
      if (
        room.activeSabotage &&
        room.activeSabotage.type === "emergency" &&
        !room.activeSabotage.resolved
      ) {
        room.corruptionLevel = Math.min(
          100,
          room.corruptionLevel + GAME_CONFIG.CORRUPTION_PER_UNRESOLVED_SABOTAGE,
        );
        room.activeSabotage = null;
        // Check win
        checkWinConditions(room);
      }
    }, SABOTAGE_TYPES.EMERGENCY.duration);

    return {
      roomId,
      sabotage: room.activeSabotage,
      chatMessage: room.chatHistory[room.chatHistory.length - 1],
    };
  }

  if (sabotageType === "zero_g") {
    if (
      now - (room.imposterZeroGSabotageTime || 0) <
      SABOTAGE_TYPES.ZERO_G.cooldown
    ) {
      return { error: "Zero-G Injector on cooldown" };
    }

    room.imposterZeroGSabotageTime = now;
    room.activeSabotage = {
      type: "zero_g",
      startedAt: now,
      room: player.currentRoom,
    };

    // Auto-resolve after duration
    room.timers.zeroG = setTimeout(() => {
      room.timers.zeroG = null;
      if (room.activeSabotage?.type === "zero_g") {
        room.activeSabotage = null;
      }
    }, SABOTAGE_TYPES.ZERO_G.duration);

    room.gameLog.push({
      time: now,
      type: "sabotage",
      message: "⚠️ Zero-G Anomaly detected! Gravity protocols disabled.",
      room: player.currentRoom,
    });

    room.chatHistory.push({
      id: generateId("msg"),
      type: "system",
      text: "⚠️ Zero-G Anomaly! Gravity lost in the current sector!",
      timestamp: now,
    });

    return {
      roomId,
      sabotage: room.activeSabotage,
      chatMessage: room.chatHistory[room.chatHistory.length - 1],
    };
  }

  return { error: "Unknown sabotage type" };
}

export function handleFramePlayer(roomId, socketId, targetId) {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  const player = room.players[socketId];
  if (!player || player.role !== ROLES.IMPOSTER)
    return { error: "Not imposter" };

  if (room.imposterFrameMeetingCooldown > 0) {
    return {
      error: `Frame ability on cooldown (${room.imposterFrameMeetingCooldown} meetings remaining)`,
    };
  }

  const target = room.players[targetId];
  if (!target) return { error: "Target not found" };

  room.imposterFrameActive = true;
  room.imposterFrameTarget = target.username;
  room.imposterFrameMeetingCooldown = SABOTAGE_TYPES.FRAME.cooldownMeetings;

  // Frame lasts until next meeting
  return { roomId, framing: target.username };
}

export function resolveSabotage(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room || !room.activeSabotage) return null;

  if (room.activeSabotage.type === "emergency") {
    room.activeSabotage.resolved = true;
    if (room.timers.sabotage) {
      clearTimeout(room.timers.sabotage);
      room.timers.sabotage = null;
    }
  }

  if (room.activeSabotage.type === "silent" && room.timers.deployFreeze) {
    clearTimeout(room.timers.deployFreeze);
    room.timers.deployFreeze = null;
  }

  if (room.activeSabotage.type === "zero_g" && room.timers.zeroG) {
    clearTimeout(room.timers.zeroG);
    room.timers.zeroG = null;
  }

  room.activeSabotage = null;

  room.chatHistory.push({
    id: generateId("msg"),
    type: "system",
    text: "✅ Sabotage resolved! Systems recovering.",
    timestamp: Date.now(),
  });

  return {
    roomId,
    resolved: true,
    chatMessage: room.chatHistory[room.chatHistory.length - 1],
  };
}

// ═══════════════════════════════════════════════
// MEETING / VOTING
// ═══════════════════════════════════════════════

export function callMeeting(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== ROOM_STATUSES.ACTIVE) return null;

  const now = Date.now();
  if (
    room.lastMeetingTime &&
    now - room.lastMeetingTime < GAME_CONFIG.MEETING_COOLDOWN
  ) {
    return { error: "Meeting on cooldown" };
  }

  room.status = ROOM_STATUSES.MEETING;
  room.meetingCalledBy = socketId;
  room.lastMeetingTime = now;
  room.meetingCount++;
  room.votingActive = false;
  room.votes = {};

  // Reset vote state for all alive players
  Object.values(room.players).forEach((p) => {
    if (p.status === "alive") {
      p.hasVoted = false;
      p.voteTarget = null;
    }
  });

  // Build meeting log from last 90 seconds of game log
  const cutoff = now - 90000;
  room.meetingLog = room.gameLog
    .filter((entry) => entry.time >= cutoff)
    .map((entry) => ({
      ...entry,
      timeAgo: Math.round((now - entry.time) / 1000),
    }));

  // Clear frame after meeting
  if (room.imposterFrameActive) {
    room.imposterFrameActive = false;
    room.imposterFrameTarget = null;
  }
  if (room.imposterFrameMeetingCooldown > 0) {
    room.imposterFrameMeetingCooldown--;
  }

  // Clear any active sabotage
  if (room.activeSabotage) {
    room.activeSabotage = null;
    if (room.timers.sabotage) clearTimeout(room.timers.sabotage);
    if (room.timers.deployFreeze) clearTimeout(room.timers.deployFreeze);
    room.timers.sabotage = null;
    room.timers.deployFreeze = null;
  }

  const caller = room.players[socketId];

  room.gameLog.push({
    time: now,
    type: "meeting_called",
    playerId: socketId,
    username: caller ? caller.username : "Unknown",
    message: `Code review called by ${caller ? caller.username : "Unknown"}`,
  });

  return {
    roomId,
    calledBy: caller ? { id: socketId, username: caller.username } : null,
    log: room.meetingLog,
  };
}

export function startVotePhase(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.votingActive = true;
  return { roomId };
}

export function handleVote(roomId, voterId, targetId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== ROOM_STATUSES.MEETING) return null;
  if (!room.votingActive) return null;

  const voter = room.players[voterId];
  if (!voter || voter.status !== "alive" || voter.hasVoted) return null;

  voter.hasVoted = true;
  voter.voteTarget = targetId;
  room.votes[voterId] = targetId; // targetId can be 'skip'

  // Check if all alive players have voted
  const alivePlayers = Object.values(room.players).filter(
    (p) => p.status === "alive",
  );
  const allVoted = alivePlayers.every((p) => p.hasVoted);

  return {
    roomId,
    voterId,
    totalVotes: Object.keys(room.votes).length,
    totalAlive: alivePlayers.length,
    allVoted,
  };
}

export function tallyVotes(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const tally = {};
  tally["skip"] = 0;

  // Count votes
  Object.values(room.votes).forEach((target) => {
    tally[target] = (tally[target] || 0) + 1;
  });

  // Find max
  let maxVotes = 0;
  let maxTarget = "skip";
  let tie = false;

  Object.entries(tally).forEach(([target, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      maxTarget = target;
      tie = false;
    } else if (count === maxVotes && target !== maxTarget) {
      tie = true;
    }
  });

  let revoked = null;
  let wasImposter = false;

  if (!tie && maxTarget !== "skip") {
    const targetPlayer = room.players[maxTarget];
    if (targetPlayer) {
      targetPlayer.status = "revoked";
      revoked = {
        id: maxTarget,
        username: targetPlayer.username,
        color: targetPlayer.color,
        role: targetPlayer.role,
      };
      wasImposter = targetPlayer.role === ROLES.IMPOSTER;
    }
  }

  // Build breakdown
  const breakdown = Object.entries(tally)
    .map(([target, count]) => {
      if (target === "skip") return { target: "skip", username: "SKIP", count };
      const p = room.players[target];
      return {
        target,
        username: p ? p.username : "Unknown",
        color: p ? p.color : "#888",
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  room.gameLog.push({
    time: Date.now(),
    type: "vote_result",
    message: revoked
      ? `${revoked.username} was revoked (${wasImposter ? "IMPOSTER" : "innocent"})`
      : "Vote ended: no one was revoked",
    revoked: revoked ? revoked.username : null,
    wasImposter,
  });

  // Check win conditions
  const winResult = checkWinConditions(room);

  return {
    roomId,
    breakdown,
    revoked,
    wasImposter,
    gameOver: winResult || null,
  };
}

export function endMeeting(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.status = ROOM_STATUSES.ACTIVE;
  room.votingActive = false;
  room.votes = {};
  room.meetingLog = [];
  room.meetingCalledBy = null;

  return { roomId };
}

// ═══════════════════════════════════════════════
// PLAYER MOVEMENT & CHAT
// ═══════════════════════════════════════════════

export function movePlayer(socketId, roomName) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;
  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.players[socketId];
  if (!player || player.status !== "alive") return null;

  player.currentRoom = roomName;

  room.gameLog.push({
    time: Date.now(),
    type: "player_move",
    playerId: socketId,
    username:
      player.role === ROLES.IMPOSTER
        ? room.imposterFrameActive
          ? room.imposterFrameTarget
          : "UNKNOWN"
        : player.username,
    message: `Moved to ${roomName}`,
    room: roomName,
  });

  return { roomId, playerId: socketId, roomName };
}

export function addChatMessage(socketId, text) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;
  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.players[socketId];
  if (!player) return null;

  const msg = {
    id: generateId("msg"),
    type: "player",
    playerId: socketId,
    username: player.username,
    color: player.color,
    text: text.substring(0, 200), // Limit message length
    timestamp: Date.now(),
  };

  room.chatHistory.push(msg);
  // Keep last 50 messages
  if (room.chatHistory.length > 50) {
    room.chatHistory = room.chatHistory.slice(-50);
  }

  return { roomId, message: msg };
}

// ═══════════════════════════════════════════════
// WIN CONDITIONS
// ═══════════════════════════════════════════════

function checkWinConditions(room) {
  // Crewmate wins: deploy hits 100%
  if (room.deployProgress >= 100) {
    return endGame(room, "crewmates", "Deploy complete — all tasks fixed!");
  }

  // Crewmate wins: imposter voted out
  const imposter = Object.values(room.players).find(
    (p) => p.role === ROLES.IMPOSTER,
  );
  if (imposter && imposter.status === "revoked") {
    return endGame(room, "crewmates", "Imposter found and revoked!");
  }

  // Imposter wins: corruption hits 100%
  if (room.corruptionLevel >= 100) {
    return endGame(
      room,
      "imposter",
      "System corruption reached critical levels!",
    );
  }

  // Imposter wins: only 2 or fewer alive (imposter + 1 crewmate)
  const alivePlayers = Object.values(room.players).filter(
    (p) => p.status === "alive",
  );
  if (alivePlayers.length <= 2 && imposter && imposter.status === "alive") {
    return endGame(room, "imposter", "Too few developers remaining!");
  }

  return null;
}

function endGame(room, winner, reason) {
  room.status = ROOM_STATUSES.ENDED;

  // Clear all timers
  Object.entries(room.timers).forEach(([key, timer]) => {
    if (timer) {
      clearTimeout(timer);
      room.timers[key] = null;
    }
  });

  const imposter = Object.values(room.players).find(
    (p) => p.role === ROLES.IMPOSTER,
  );

  const recap = {
    winner,
    reason,
    imposter: imposter
      ? {
          id: imposter.id,
          username: imposter.username,
          color: imposter.color,
        }
      : null,
    tasksCompleted: Object.values(room.tasks).filter((t) => t.completedBy)
      .length,
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

  // Auto cleanup after 60 seconds
  setTimeout(() => {
    cleanupRoom(room.id);
  }, 60000);

  return recap;
}

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    // Clear all timers
    Object.values(room.timers).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
  }
  rooms.delete(roomId);
  // Clean up player mappings
  for (const [sid, rid] of playerRooms.entries()) {
    if (rid === roomId) playerRooms.delete(sid);
  }
}

function sanitizeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    host: room.host,
    topic: room.topic,
    status: room.status,
    playerCount: Object.keys(room.players).length,
    maxPlayers: room.settings.maxPlayers,
    players: Object.fromEntries(
      Object.entries(room.players).map(([id, p]) => [id, sanitizePlayer(p)]),
    ),
    deployProgress: room.deployProgress,
    corruptionLevel: room.corruptionLevel,
    activeSabotage: room.activeSabotage
      ? { type: room.activeSabotage.type, room: room.activeSabotage.room }
      : null,
    chatHistory: room.chatHistory.slice(-20),
  };
}

function sanitizePlayer(player) {
  return {
    id: player.id,
    username: player.username,
    color: player.color,
    status: player.status,
    currentRoom: player.currentRoom,
    tasksCompleted: player.tasksCompleted,
    isReady: player.isReady,
    // NEVER expose role here
  };
}

function getPlayerVisibleTasks(room, socketId) {
  return Object.entries(room.tasks).map(([taskId, task]) => ({
    id: taskId,
    room: task.room,
    type: task.type,
    title: task.title,
    description: task.description,
    code: task.code,
    language: task.language,
    options: task.options,
    difficulty: task.difficulty,
    completedBy: task.completedBy
      ? task.completedBy === socketId
        ? "you"
        : "other"
      : null,
  }));
}

// ═══════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════

export function getAllRooms() {
  const list = [];
  for (const [id, room] of rooms.entries()) {
    if (room.status === ROOM_STATUSES.WAITING) {
      list.push({
        id: room.id,
        name: room.name,
        host: room.players[room.host]?.username || "Unknown",
        playerCount: Object.keys(room.players).length,
        maxPlayers: room.settings.maxPlayers,
        topic: room.topic,
        status: room.status,
      });
    }
  }
  return list;
}

export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

export function getRoomForPlayer(socketId) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return null;
  return rooms.get(roomId) || null;
}

export function getPlayerRoomId(socketId) {
  return playerRooms.get(socketId) || null;
}

export function handleDisconnect(socketId) {
  playerIdentities.delete(socketId);
  return leaveRoom(socketId);
}

export function getGameTasks(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return getPlayerVisibleTasks(room, socketId);
}

export function getImposterAbilities(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  const player = room.players[socketId];
  if (!player || player.role !== ROLES.IMPOSTER) return null;

  const now = Date.now();
  return {
    silent: {
      ready:
        now - room.imposterSilentSabotageTime >= SABOTAGE_TYPES.SILENT.cooldown,
      cooldownRemaining: Math.max(
        0,
        SABOTAGE_TYPES.SILENT.cooldown -
          (now - room.imposterSilentSabotageTime),
      ),
    },
    frame: {
      ready: room.imposterFrameMeetingCooldown === 0,
      cooldownMeetings: room.imposterFrameMeetingCooldown,
    },
    emergency: {
      ready:
        now - room.imposterLastSabotageTime >=
        SABOTAGE_TYPES.EMERGENCY.cooldown,
      cooldownRemaining: Math.max(
        0,
        SABOTAGE_TYPES.EMERGENCY.cooldown -
          (now - room.imposterLastSabotageTime),
      ),
    },
    zero_g: {
      ready:
        now - (room.imposterZeroGSabotageTime || 0) >=
        SABOTAGE_TYPES.ZERO_G.cooldown,
      cooldownRemaining: Math.max(
        0,
        SABOTAGE_TYPES.ZERO_G.cooldown -
          (now - (room.imposterZeroGSabotageTime || 0)),
      ),
    },
  };
}
