// ═══════════════════════════════════════════════
// BuggedOut — CountdownTimer Component
// ═══════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

export default function CountdownTimer({
  seconds,
  onExpire,
  urgent = false,
  label = "",
}) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [seconds]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire && onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [seconds, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = urgent || remaining <= 10;

  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.8rem",
        fontWeight: 600,
        color: isUrgent ? "#ff4444" : "#ffb347",
        animation: isUrgent ? "pulse-dot 1s infinite" : "none",
      }}
    >
      {label && <span style={{ marginRight: "4px" }}>{label}</span>}⏱{" "}
      {String(mins).padStart(1, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
