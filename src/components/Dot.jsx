// ═══════ STATUS DOT INDICATOR ═══════
const D = {
  sage: "#5f7a61",
  copper: "#96714a",
};

export default function Dot({ s, lang: lg }) {
  const m = {
    regulated: { c: D.sage, e: "Regulated", z: "已監管" },
    evolving: { c: D.copper, e: "Evolving", z: "演進中" },
  };
  const v = m[s] || m.evolving;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: v.c }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.c, opacity: 0.6 }} />
      {lg === "zh" ? v.z : v.e}
    </span>
  );
}
