import { useState } from "react";

const D = {
  elev: "rgba(255,254,252,0.88)",
  surfA: "rgba(250,249,247,0.72)",
  tx3: "#7d7d88",
};

// ═══════ GLASS CARD COMPONENT ═══════
export default function Card({ children, style = {}, onClick, accent, glow }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ position: "relative", borderRadius: 8, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {accent && (
        <div style={{
          position: "absolute", inset: -1, borderRadius: 9,
          background: `linear-gradient(${h ? "135deg" : "170deg"}, ${accent}${h ? "50" : "18"}, transparent 55%, ${accent}${h ? "28" : "08"})`,
          opacity: h ? 0.8 : 0.4, transition: "all 0.6s cubic-bezier(.22,1,.36,1)",
        }} />
      )}
      <div style={{
        position: "relative", borderRadius: 8, overflow: "hidden",
        background: h && onClick ? D.elev : glow ? "rgba(250,249,247,0.78)" : D.surfA,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${h && onClick ? "rgba(84,99,120,0.18)" : "rgba(200,200,210,0.3)"}`,
        boxShadow: h && onClick ? "0 12px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02)" : glow ? "0 1px 24px rgba(0,0,0,0.02)" : "none",
        transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
        transform: h && onClick ? "translateY(-3px)" : "none",
      }}>
        {children}
      </div>
    </div>
  );
}
