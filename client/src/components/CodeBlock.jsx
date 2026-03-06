// ═══════════════════════════════════════════════
// BuggedOut — CodeBlock Component
// ═══════════════════════════════════════════════

export default function CodeBlock({
  code = "",
  language = "python",
  highlightLines = [],
}) {
  const lines = code.split("\n");

  return (
    <div
      style={{
        background: "#0a0a0f",
        border: "1px solid #2a2a3a",
        borderRadius: "4px",
        overflow: "auto",
        maxHeight: "300px",
      }}
    >
      <div
        style={{
          padding: "4px 10px",
          borderBottom: "1px solid #2a2a3a",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6rem",
          color: "#888899",
        }}
      >
        {language}
      </div>
      <pre
        style={{
          margin: 0,
          padding: "10px 0",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.75rem",
          lineHeight: "1.6",
        }}
      >
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = highlightLines.includes(lineNum);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                background: isHighlighted
                  ? "rgba(255,179,71,0.1)"
                  : "transparent",
                borderLeft: isHighlighted
                  ? "2px solid #ffb347"
                  : "2px solid transparent",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "36px",
                  textAlign: "right",
                  paddingRight: "12px",
                  color: isHighlighted ? "#ffb347" : "#444",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                {lineNum}
              </span>
              <code
                style={{
                  color: isHighlighted ? "#ffb347" : "#00ff88",
                  padding: "0 10px 0 0",
                  whiteSpace: "pre",
                }}
              >
                {line}
              </code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
