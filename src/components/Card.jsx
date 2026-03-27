import { useState } from "react";

const D = {
  elev: "rgba(255,255,255,0.98)",
  surfA: "rgba(255,255,255,0.95)",
  tx3: "#475569",
};

// ═══════ GLASS CARD COMPONENT ═══════
export default function Card({ children, style = {}, onClick, accent, glow }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ position: "relative", borderRadius: 12, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {accent && (
        <div style={{
          position: "absolute", inset: -1, borderRadius: 13,
          background: `linear-gradient(${h ? "135deg" : "170deg"}, ${accent}${h ? "50" : "18"}, transparent 55%, ${accent}${h ? "28" : "08"})`,
          opacity: h ? 0.8 : 0.4, transition: "all 0.6s cubic-bezier(.22,1,.36,1)",
        }} />
      )}
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        background: h && onClick ? "#fff" : glow ? "rgba(255,255,255,0.88)" : D.surfA,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1px solid rgba(15,23,42,${h && onClick ? "0.10" : "0.07"})`,
        boxShadow: h && onClick ? "0 8px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)" : glow ? "0 2px 12px rgba(15,23,42,0.06)" : "0 1px 3px rgba(15,23,42,0.07)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
        transform: h && onClick ? "translateY(-2px)" : "none",
      }}>
        {children}
      </div>
    </div>
  );
}
