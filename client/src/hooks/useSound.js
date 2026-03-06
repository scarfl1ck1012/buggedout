// ═══════════════════════════════════════════════
// BuggedOut — useSound Hook
// Web Audio API based sound system
// ═══════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from "react";

// Sound definitions using Web Audio API synthesis
const SOUND_DEFS = {
  taskComplete: { freq: [523, 659, 784], dur: 0.12, type: "sine", vol: 0.3 },
  taskFail: { freq: [200, 150], dur: 0.2, type: "square", vol: 0.2 },
  meetingCalled: {
    freq: [880, 440, 880, 440],
    dur: 0.15,
    type: "square",
    vol: 0.25,
  },
  voteReveal: {
    freq: [220, 330, 440, 550, 660],
    dur: 0.1,
    type: "triangle",
    vol: 0.3,
  },
  playerRevoked: {
    freq: [440, 220, 110],
    dur: 0.2,
    type: "sawtooth",
    vol: 0.2,
  },
  imposterWin: {
    freq: [150, 100, 80, 60],
    dur: 0.3,
    type: "sawtooth",
    vol: 0.25,
  },
  crewmateWin: {
    freq: [523, 659, 784, 1047],
    dur: 0.15,
    type: "sine",
    vol: 0.3,
  },
  sabotageStart: {
    freq: [600, 400, 600, 400],
    dur: 0.12,
    type: "square",
    vol: 0.2,
  },
  sabotageStop: { freq: [400, 523, 659], dur: 0.12, type: "sine", vol: 0.25 },
  buttonClick: { freq: [800], dur: 0.05, type: "sine", vol: 0.1 },
  playerJoin: { freq: [440, 554], dur: 0.1, type: "sine", vol: 0.15 },
};

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const ctxRef = useRef(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playSound = useCallback(
    (name) => {
      if (isMuted) return;
      const def = SOUND_DEFS[name];
      if (!def) return;

      try {
        const ctx = getContext();
        const now = ctx.currentTime;

        def.freq.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = def.type;
          osc.frequency.setValueAtTime(freq, now + i * def.dur);

          gain.gain.setValueAtTime(def.vol, now + i * def.dur);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + (i + 1) * def.dur,
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * def.dur);
          osc.stop(now + (i + 1) * def.dur + 0.05);
        });
      } catch (e) {
        // Audio context may not be available
      }
    },
    [isMuted, getContext],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return { playSound, isMuted, toggleMute };
}
