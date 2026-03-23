import { useState } from "react";
import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import JobSelector from "../components/JobSelector.jsx";
import { COUNTRIES } from "../data/countries.js";
import { JLVL } from "../data/jobs.js";
import { gS, gBand, compaRatio, fmt } from "../utils/salary.js";

const D = {
  tx: "#1c1c1f", tx2: "#3c3c44", tx4: "#a8a8b4",
  slate: "#546378", sage: "#5f7a61", copper: "#96714a", clay: "#a06b52", wine: "#8a5565",
};
const bC = [D.slate, D.sage, D.copper, D.clay, D.wine, "#6b6b8a"];

function RangeBar({ band, actual, color, usdt }) {
  const max = band.p75 * 1.15;
  const pct = v => `${Math.min((v / max) * 100, 100)}%`;
  const cr = actual ? compaRatio(actual, band.p50) : null;
  const crColor = cr == null ? D.tx4 : cr < 85 ? "#c0392b" : cr > 115 ? "#27ae60" : "#e67e22";

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Range bar */}
      <div style={{ position: "relative", height: 28, borderRadius: 6, background: "#f0f0f4", overflow: "visible" }}>
        {/* P25–P75 band */}
        <div style={{
          position: "absolute", left: pct(band.p25), width: `calc(${pct(band.p75)} - ${pct(band.p25)})`,
          height: "100%", background: `${color}28`, borderRadius: 4,
        }} />
        {/* P50 marker */}
        <div style={{
          position: "absolute", left: pct(band.p50), transform: "translateX(-50%)",
          width: 2, height: "100%", background: color, opacity: 0.7,
        }} />
        {/* Actual salary marker */}
        {actual > 0 && (
          <div style={{
            position: "absolute", left: pct(actual), transform: "translateX(-50%)",
            width: 10, height: 10, borderRadius: "50%", background: crColor,
            top: "50%", marginTop: -5, boxShadow: `0 0 0 2px white`,
          }} />
        )}
        {/* P50 label */}
        <span style={{
          position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, fontWeight: 500, fontFamily: "'DM Mono',monospace", color,
        }}>
          {fmt(band.p50, usdt)}
        </span>
        {/* Band range label */}
        <span style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace",
        }}>
          {fmt(band.p25, usdt)}–{fmt(band.p75, usdt)}
        </span>
      </div>
      {/* Compa-ratio */}
      {cr != null && (
        <div style={{ fontSize: 11, color: crColor, fontFamily: "'DM Mono',monospace", marginTop: 3, textAlign: "right" }}>
          Compa-Ratio: {cr}%
        </div>
      )}
    </div>
  );
}

export default function Salary({ selC, togC, selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl, usdt, lang, t }) {
  const [actualSalary, setActualSalary] = useState("");
  const [showBand, setShowBand] = useState(true);
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);
  const lvls = JLVL[track];
  const actual = parseFloat(actualSalary) || 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Salary Matrix", "薪資矩陣")}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowBand(b => !b)} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 6,
            background: showBand ? D.slate : "#f0f0f4", color: showBand ? "#fff" : D.tx4,
            border: "none", cursor: "pointer", fontFamily: "'DM Mono',monospace",
          }}>
            {showBand ? t("Band View", "帶寬模式") : t("Point View", "點位模式")}
          </button>
        </div>
      </div>

      <JobSelector
        selFam={selFam} setSelFam={setSelFam}
        selSub={selSub} setSelSub={setSelSub}
        track={track} setTrack={setTrack}
        selLvl={selLvl} setSelLvl={setSelLvl}
        lang={lang} t={t}
      />

      {/* Compa-Ratio Input */}
      <Card style={{ marginBottom: 12, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: D.tx2, fontFamily: "'DM Mono',monospace" }}>
            {t("My Salary (USD K):", "我的薪資（千美元）：")}
          </span>
          <input
            type="number"
            value={actualSalary}
            onChange={e => setActualSalary(e.target.value)}
            placeholder={t("e.g. 85", "例如 85")}
            style={{
              width: 110, padding: "6px 12px", borderRadius: 6, border: `1px solid #ddd`,
              fontSize: 14, fontFamily: "'DM Mono',monospace", background: "#fafafa", outline: "none",
            }}
          />
          <span style={{ fontSize: 12, color: D.tx4 }}>
            {t("→ See where you stand in the band", "→ 看你在薪資帶中的位置")}
          </span>
          {actual > 0 && (
            <span style={{ fontSize: 12, color: D.slate, fontFamily: "'DM Mono',monospace" }}>
              {t("P25: below band  P50: market mid  P75: top of band", "P25=低於中位 P50=市場中位 P75=高於中位")}
            </span>
          )}
        </div>
      </Card>

      <WorldMap selected={selC} onSelect={togC} t={t} />

      <Card glow style={{ marginTop: 12 }}>
        <div style={{ padding: 18 }}>
          {/* Level headers */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, paddingLeft: 120 }}>
            {lvls.map((l, li) => (
              <div key={l.id} style={{ flex: 1, textAlign: "center", fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>
                {l.id.toUpperCase()}
              </div>
            ))}
          </div>

          {sel.map((c, ci) => (
            <div key={c.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ fontSize: 15, color: D.tx, fontWeight: 500 }}>{t(c.n, c.zh)}</span>
              </div>

              {showBand ? (
                // Band view: one row per level
                <div style={{ display: "flex", gap: 4 }}>
                  {lvls.map((l, li) => {
                    const band = gBand(c.id, selFam, selSub, track, li);
                    return (
                      <div key={l.id} style={{ flex: 1 }}>
                        <RangeBar band={band} actual={actual} color={bC[ci]} usdt={usdt} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Point view: simple bar (original style)
                <div style={{ display: "flex", gap: 4 }}>
                  {lvls.map((l, li) => {
                    const v = gS(c.id, selFam, selSub, track, li);
                    const mx = Math.max(...sel.map(x => gS(x.id, selFam, selSub, track, lvls.length - 1)));
                    return (
                      <div key={l.id} style={{ flex: 1 }}>
                        <div style={{ height: 34, borderRadius: 5, background: `${bC[ci]}06`, position: "relative", overflow: "hidden" }}>
                          <div style={{ width: `${(v / (mx * 1.1)) * 100}%`, height: "100%", background: `${bC[ci]}20`, borderRadius: 4, transition: "width 0.7s" }} />
                          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: bC[ci] }}>
                            {fmt(v, usdt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Legend */}
          {showBand && (
            <div style={{ display: "flex", gap: 16, marginTop: 8, paddingTop: 12, borderTop: "1px solid #f0f0f4", flexWrap: "wrap" }}>
              {[
                { label: t("P25 (85%)", "P25 下四分位"), color: "#aaa" },
                { label: t("P50 mid", "P50 中位"), color: D.slate },
                { label: t("P75 (120%)", "P75 上四分位"), color: "#aaa" },
                { label: t("Your salary", "你的薪資"), color: "#e67e22" },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: D.tx4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
