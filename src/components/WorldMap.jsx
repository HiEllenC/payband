import { useState } from "react";
import { COUNTRIES } from "../data/countries.js";

const D = {
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  tx5: "#c8c8d0",
  slate: "#546378",
  copper: "#96714a",
};

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

// ═══════ WORLD MAP / COUNTRY SELECTOR ═══════
export default function WorldMap({ selected, onSelect, countries = COUNTRIES, t: tr }) {
  const [hov, setHov] = useState(null);
  const regions = [
    { label: "Americas", zh: "美洲", countries: ["us"] },
    { label: "Europe", zh: "歐洲", countries: ["gb", "ch", "mt"] },
    { label: "Middle East", zh: "中東", countries: ["ae"] },
    { label: "East Asia", zh: "東亞", countries: ["jp", "kr", "hk", "tw"] },
    { label: "SE Asia", zh: "東南亞", countries: ["sg", "my", "ph"] },
  ];
  return (
    <div style={{ padding: "14px 16px", borderRadius: 8, background: "rgba(250,249,247,0.5)", border: "1px solid rgba(200,200,210,0.22)", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Tag color={D.tx3}>{selected.length}/6 {tr ? tr("selected", "已選擇") : "selected"}</Tag>
        <Tag color={D.tx4}>{tr ? tr("Click to toggle", "點擊切換") : "Click to toggle"}</Tag>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {regions.map(r => (
          <div key={r.label} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, textAlign: "center", marginBottom: 8, fontWeight: 500 }}>
              {tr ? tr(r.label, r.zh) : r.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
              {r.countries.map(cid => {
                const c = countries.find(x => x.id === cid);
                if (!c) return null;
                const sel = selected.includes(cid);
                const ho = hov === cid;
                return (
                  <div key={cid}
                    onClick={() => onSelect(cid)}
                    onMouseEnter={() => setHov(cid)}
                    onMouseLeave={() => setHov(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 12px", borderRadius: 6, cursor: "pointer", width: "100%",
                      background: sel ? D.slate + "10" : ho ? D.copper + "08" : "transparent",
                      border: "1px solid " + (sel ? D.slate + "30" : ho ? D.copper + "20" : "transparent"),
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: sel ? D.slate : ho ? D.copper : D.tx5,
                      opacity: sel ? 0.7 : ho ? 0.5 : 0.25,
                      boxShadow: sel ? "0 0 6px " + D.slate + "30" : "none",
                      transition: "all 0.2s",
                    }} />
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? D.slate : ho ? D.copper : D.tx3, fontFamily: "'DM Mono','Noto Sans TC',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tr ? tr(c.n, c.zh) : c.n}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
