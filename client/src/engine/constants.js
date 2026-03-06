// ═══════════════════════════════════════════════
// BuggedOut — Game Balance Constants
// ═══════════════════════════════════════════════

export const GAME_CONFIG = {
  MIN_PLAYERS: 2, // lowered for testing, real game = 4
  MAX_PLAYERS: 6,
  IMPOSTERS_COUNT: 1,

  // Task counts by player count
  TASK_COUNTS: {
    2: 8, // testing
    3: 10, // testing
    4: 12,
    5: 14,
    6: 16,
  },

  DEPLOY_PROGRESS_PER_TASK: (playerCount) => {
    const totalTasks = GAME_CONFIG.TASK_COUNTS[playerCount] || 14;
    return Math.ceil(100 / totalTasks);
  },

  CORRUPTION_PER_FAKE_TASK: 6,
  CORRUPTION_PER_UNRESOLVED_SABOTAGE: 15,

  SABOTAGE_COOLDOWN: 60000, // 60s between sabotages
  MEETING_COOLDOWN: 30000, // 30s between meetings
  CRITICAL_SABOTAGE_TIMER: 45000, // 45s to resolve
  DISRUPTIVE_FREEZE_DURATION: 30000, // 30s freeze

  FRAME_ABILITY_COOLDOWN: 2, // once per 2 meetings
  SILENT_SABOTAGE_COOLDOWN: 90000, // 90s

  VOTE_TIMER: 30000, // 30s
  DISCUSSION_TIMER: 60000, // 60s
  GAME_TIMER: 600000, // 10 minutes

  ROOMS: [
    { name: "DSA Lab", icon: "🖥️" },
    { name: "Backend Core", icon: "⚙️" },
    { name: "Frontend Studio", icon: "🎨" },
    { name: "Database Vault", icon: "🗄️" },
    { name: "Systems Root", icon: "🔒" },
  ],

  TOPICS: ["DSA", "Java", "Python", "Web Dev", "SQL", "Systems"],

  ROOM_DESCRIPTIONS: {
    "DSA Lab": "The algorithm engine is failing. Optimize before it crashes.",
    "Backend Core":
      "The API gateway is throwing 500s. Fix it before the client notices.",
    "Frontend Studio":
      "The UI components are rendering garbage. Time for a hotfix.",
    "Database Vault":
      "Queries are timing out. The data layer needs critical patches.",
    "Systems Root": "Kernel panic imminent. Only root access can save us now.",
  },
};

export const SABOTAGE_TYPES = {
  SILENT: {
    id: "silent",
    name: "Silent Sabotage",
    description:
      "Freeze deploy bar for 30s. Simulates infinite loop injection.",
    cooldown: GAME_CONFIG.SILENT_SABOTAGE_COOLDOWN,
    duration: GAME_CONFIG.DISRUPTIVE_FREEZE_DURATION,
    isCritical: false,
  },
  FRAME: {
    id: "frame",
    name: "Frame Player",
    description: "Next action logged under another player's name.",
    cooldownMeetings: GAME_CONFIG.FRAME_ABILITY_COOLDOWN,
    isCritical: false,
  },
  EMERGENCY: {
    id: "emergency",
    name: "Emergency Bug",
    description: "Force critical outage. Resolve in 45s or imposter wins.",
    cooldown: GAME_CONFIG.SABOTAGE_COOLDOWN,
    duration: GAME_CONFIG.CRITICAL_SABOTAGE_TIMER,
    isCritical: true,
  },
  ZERO_G: {
    id: "zero_g",
    name: "Zero-G Injector",
    description:
      "Disables local gravity protocols on the target's machine, causing their UI to shatter and drift.",
    cooldown: GAME_CONFIG.SABOTAGE_COOLDOWN,
    duration: GAME_CONFIG.DISRUPTIVE_FREEZE_DURATION, // Same duration as silent sabotage
    isCritical: false,
  },
};

export const ROOM_STATUSES = {
  WAITING: "waiting",
  STARTING: "starting",
  ACTIVE: "active",
  MEETING: "meeting",
  ENDED: "ended",
};

export const ROLES = {
  CREWMATE: "crewmate",
  IMPOSTER: "imposter",
};
