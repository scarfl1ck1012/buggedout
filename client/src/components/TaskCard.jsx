// ═══════════════════════════════════════════════
// BuggedOut — TaskCard Component
// ═══════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CodeBlock from "./CodeBlock.jsx";

export default function TaskCard({ task, onSubmit, disabled = false }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(
    task?.failedAttempts || 0,
  );

  useEffect(() => {
    if (task && task.failedAttempts > failedAttempts) {
      setSubmitted(false);
      setFailedAttempts(task.failedAttempts);
      setSelected(null);
    }
  }, [task?.failedAttempts, failedAttempts]);

  if (!task) return null;

  const isCompleted = task.completedBy !== null;

  const handleSubmit = () => {
    if (!selected || submitted || isCompleted) return;
    setSubmitted(true);
    onSubmit(task.id, selected);
  };

  const typeLabel = {
    spot_the_bug: "🔍 Spot the Bug",
    fill_the_gap: "✏️ Fill the Gap",
    predict_output: "🔮 Predict Output",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#111118",
        border: `1px solid ${isCompleted ? "#00aa55" : "#2a2a3a"}`,
        borderRadius: "4px",
        overflow: "hidden",
        position: "relative",
        opacity: isCompleted ? 0.5 : 1,
      }}
    >
      {/* Completed overlay */}
      {isCompleted && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1.2rem",
            color: "#00ff88",
            fontWeight: 700,
          }}
        >
          ✓ FIXED
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #2a2a3a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          data-antigravity
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            color: "#00ff88",
            fontWeight: 600,
          }}
        >
          {task.title}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            color: "#ffb347",
            background: "rgba(255,179,71,0.1)",
            padding: "2px 8px",
            borderRadius: "3px",
          }}
        >
          {typeLabel[task.type] || task.type}
        </span>
      </div>

      {/* Description */}
      <div
        data-antigravity
        style={{
          padding: "8px 14px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.7rem",
          color: "#888899",
        }}
      >
        {task.description}
      </div>

      {/* Code */}
      <div data-antigravity style={{ padding: "0 14px 10px" }}>
        <CodeBlock code={task.code} language={task.language || "python"} />
      </div>

      {/* Options */}
      <div
        style={{
          padding: "0 14px 10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {(task.options || []).map((opt, i) => (
          <button
            key={i}
            data-antigravity
            onClick={() => !submitted && !isCompleted && setSelected(opt)}
            disabled={submitted || isCompleted}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              padding: "6px 14px",
              background: selected === opt ? "rgba(0,255,136,0.12)" : "#1a1a24",
              border: `1px solid ${selected === opt ? "#00ff88" : "#2a2a3a"}`,
              color: selected === opt ? "#00ff88" : "#e0e0e0",
              borderRadius: "3px",
              cursor: submitted || isCompleted ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Submit */}
      <div style={{ padding: "0 14px 12px" }}>
        <button
          data-antigravity
          onClick={handleSubmit}
          disabled={!selected || submitted || isCompleted || disabled}
          className="btn btn-green"
          style={{
            width: "100%",
            opacity: !selected || submitted || isCompleted ? 0.4 : 1,
          }}
        >
          {submitted ? "⏳ SUBMITTING..." : "[ SUBMIT FIX ]"}
        </button>
      </div>
    </motion.div>
  );
}
