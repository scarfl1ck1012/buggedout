// ═══════════════════════════════════════════════
// BuggedOut — useGameState Hook
// Central game state with useReducer
// ═══════════════════════════════════════════════

import { useReducer, useCallback } from "react";

const initialState = {
  screen: "landing", // landing | lobby | gameLobby | game | result
  username: "",
  color: "#00ff88",
  roomId: null,
  room: null,
  role: null,
  tasks: [],
  roomLayout: [],
  players: {},
  deployProgress: 0,
  corruptionLevel: 0,
  currentRoom: "DSA Lab",
  activeSabotage: null,
  meetingActive: false,
  meetingCalledBy: null,
  meetingLog: [],
  meetingPhase: "discussion", // discussion | voting | results
  votes: {},
  voteResults: null,
  gameOver: null,
  countdown: null,
  imposterAbilities: null,
  frameActive: null,
  error: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "SET_IDENTITY":
      return { ...state, username: action.username, color: action.color };

    case "SET_SCREEN":
      return { ...state, screen: action.screen };

    case "SET_ROOM":
      return {
        ...state,
        room: action.room,
        roomId: action.room.id,
        players: action.room.players || {},
        deployProgress: action.room.deployProgress || 0,
        corruptionLevel: action.room.corruptionLevel || 0,
        screen: "gameLobby",
      };

    case "UPDATE_PLAYER_JOINED": {
      const roomPlayers = state.room?.players || {};
      const newRoomPlayers = {
        ...roomPlayers,
        [action.player.id]: action.player,
      };
      return {
        ...state,
        players: { ...state.players, [action.player.id]: action.player },
        room: state.room
          ? {
              ...state.room,
              players: newRoomPlayers,
              playerCount: Object.keys(newRoomPlayers).length,
            }
          : state.room,
      };
    }

    case "UPDATE_PLAYER_LEFT": {
      const newPlayers = { ...state.players };
      delete newPlayers[action.playerId];
      return {
        ...state,
        players: newPlayers,
        room: state.room
          ? {
              ...state.room,
              players: newPlayers,
              playerCount: Object.keys(newPlayers).length,
            }
          : state.room,
      };
    }

    case "READY_STATE_CHANGED":
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            isReady: action.isReady,
          },
        },
        room: state.room
          ? {
              ...state.room,
              players: {
                ...state.room.players,
                [action.playerId]: {
                  ...(state.room.players?.[action.playerId] || {}),
                  isReady: action.isReady,
                },
              },
            }
          : state.room,
      };

    case "TOPIC_CHANGED":
      return {
        ...state,
        room: state.room ? { ...state.room, topic: action.topic } : state.room,
      };

    case "GAME_COUNTDOWN":
      return { ...state, countdown: action.seconds };

    case "GAME_STARTED":
      return {
        ...state,
        screen: "game",
        role: action.role,
        tasks: action.tasks,
        roomLayout: action.roomLayout,
        room: action.room || state.room,
        players: action.room?.players || state.players,
        deployProgress: 0,
        corruptionLevel: 0,
        countdown: null,
        meetingActive: false,
        gameOver: null,
        currentRoom: "DSA Lab",
      };

    case "PLAYER_LOCATION_UPDATE":
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            currentRoom: action.roomName,
          },
        },
      };

    case "TASK_COMPLETED": {
      const updatedTasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, completedBy: "other" } : t,
      );
      return { ...state, tasks: updatedTasks };
    }

    case "TASK_RESULT": {
      if (action.success) {
        const updatedTasks = state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, completedBy: "you" } : t,
        );
        return { ...state, tasks: updatedTasks };
      } else {
        const updatedTasks = state.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, failedAttempts: (t.failedAttempts || 0) + 1 }
            : t,
        );
        return { ...state, tasks: updatedTasks };
      }
    }

    case "DEPLOY_PROGRESS":
      return { ...state, deployProgress: action.progress };

    case "CORRUPTION_UPDATE":
      return { ...state, corruptionLevel: action.level };

    case "SABOTAGE_STARTED":
      return {
        ...state,
        activeSabotage: {
          type: action.sabotageType,
          room: action.room,
          timeLimit: action.timeLimit,
        },
      };

    case "SABOTAGE_RESOLVED":
      return { ...state, activeSabotage: null };

    case "MEETING_CALLED":
      return {
        ...state,
        meetingActive: true,
        meetingCalledBy: action.calledBy,
        meetingLog: action.log,
        meetingPhase: "discussion",
        votes: {},
        voteResults: null,
      };

    case "MEETING_PHASE_CHANGE":
      return { ...state, meetingPhase: action.phase };

    case "VOTE_UPDATE":
      return {
        ...state,
        votes: { totalVotes: action.totalVotes, totalAlive: action.totalAlive },
      };

    case "VOTE_RESULTS":
      return { ...state, meetingPhase: "results", voteResults: action.results };

    case "MEETING_ENDED":
      return {
        ...state,
        meetingActive: false,
        meetingCalledBy: null,
        meetingLog: [],
        meetingPhase: "discussion",
        voteResults: null,
      };

    case "GAME_OVER":
      return { ...state, screen: "result", gameOver: action.recap };

    case "SET_CURRENT_ROOM":
      return { ...state, currentRoom: action.roomName };

    case "FRAME_ACTIVATED":
      return { ...state, frameActive: action.framing };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "RESET":
      return {
        ...initialState,
        username: state.username,
        color: state.color,
        screen: "lobby",
      };

    case "FULL_ROOM_STATE":
      return {
        ...state,
        room: action.room,
        players: action.room.players || {},
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    setIdentity: (username, color) =>
      dispatch({ type: "SET_IDENTITY", username, color }),
    setScreen: (screen) => dispatch({ type: "SET_SCREEN", screen }),
    setRoom: (room) => dispatch({ type: "SET_ROOM", room }),
    playerJoined: (player) =>
      dispatch({ type: "UPDATE_PLAYER_JOINED", player }),
    playerLeft: (playerId) =>
      dispatch({ type: "UPDATE_PLAYER_LEFT", playerId }),
    readyStateChanged: (playerId, isReady) =>
      dispatch({ type: "READY_STATE_CHANGED", playerId, isReady }),
    topicChanged: (topic) => dispatch({ type: "TOPIC_CHANGED", topic }),
    gameCountdown: (seconds) => dispatch({ type: "GAME_COUNTDOWN", seconds }),
    gameStarted: (data) => dispatch({ type: "GAME_STARTED", ...data }),
    playerLocationUpdate: (playerId, roomName) =>
      dispatch({ type: "PLAYER_LOCATION_UPDATE", playerId, roomName }),
    taskCompleted: (taskId) => dispatch({ type: "TASK_COMPLETED", taskId }),
    taskResult: (data) => dispatch({ type: "TASK_RESULT", ...data }),
    deployProgress: (progress) =>
      dispatch({ type: "DEPLOY_PROGRESS", progress }),
    corruptionUpdate: (level) => dispatch({ type: "CORRUPTION_UPDATE", level }),
    sabotageStarted: (data) =>
      dispatch({
        type: "SABOTAGE_STARTED",
        sabotageType: data.type,
        room: data.room,
        timeLimit: data.timeLimit,
      }),
    sabotageResolved: () => dispatch({ type: "SABOTAGE_RESOLVED" }),
    meetingCalled: (data) => dispatch({ type: "MEETING_CALLED", ...data }),
    meetingPhaseChange: (phase) =>
      dispatch({ type: "MEETING_PHASE_CHANGE", phase }),
    voteUpdate: (data) => dispatch({ type: "VOTE_UPDATE", ...data }),
    voteResults: (results) => dispatch({ type: "VOTE_RESULTS", results }),
    meetingEnded: () => dispatch({ type: "MEETING_ENDED" }),
    gameOver: (recap) => dispatch({ type: "GAME_OVER", recap }),
    setCurrentRoom: (roomName) =>
      dispatch({ type: "SET_CURRENT_ROOM", roomName }),
    frameActivated: (framing) => dispatch({ type: "FRAME_ACTIVATED", framing }),
    setError: (error) => dispatch({ type: "SET_ERROR", error }),
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    reset: () => dispatch({ type: "RESET" }),
    fullRoomState: (room) => dispatch({ type: "FULL_ROOM_STATE", room }),
  };

  return { state, actions, dispatch };
}
