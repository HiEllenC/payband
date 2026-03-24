import { useState } from "react";
import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import JobSelector from "../components/JobSelector.jsx";
import { COUNTRIES } from "../data/countries.js";
import { TC } from "../data/totalcomp.js";
import { gS, fmt } from "../utils/salary.js";
import VestingSim from "./VestingSim.jsx";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  lnF: "rgba(0,0,0,0.03)",
  ln: "rgba(0,0,0,0.06)",
  ink: "#2d3142",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
  clay: "#a06b52",
  wine: "#8a5565",
  surface: "#faf9f7",
};

// ═══════ TOTAL COMP MODULE ═══════
export default function TotalComp({ selC, togC, selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl, usdt, lang, t }) {
  const [subView, setSubView] = useState("comp"); // "comp" | "vesting"
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);
  const li = selLvl;
  const parts = [
    { k: "base", l: t("Base", "底薪"), c: D.slate },
    { k: "bonus", l: t("Bonus", "獎金"), c: D.sage },
    { k: "token", l: "Token", c: D.copper },
    { k: "er", l: t("ER Cost", "雇主成本"), c: D.clay },
    { k: "allow", l: t("Allow", "津貼"), c: D.wine },
  ];

  const data = sel.map(c => {
    const base = gS(c.id, selFam, selSub, track, li);
    const tc = TC[c.id] || {};
    const vals = {
      base,
      bonus: Math.round(base * (tc.bonus || 0) / 100),
      token: Math.round(base * (tc.token || 0) / 100),
      er: Math.round(base * (tc.er || 0) / 100),
      allow: Math.round(base * (tc.allow || 0) / 100),
    };
    const total = Object.values(vals).reduce((a, b) => a + b, 0) || 1;
    return { c, tc, vals, total, base };
  });
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div>
      {/* ── SUB-TAB BAR ────────────────────────────── */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: `1px solid ${D.ln}`, paddingBottom: 0 }}>
        {[
          { id: "comp",    label: t("Comp Breakdown", "薪酬結構拆解") },
          { id: "vesting", label: t("Vesting Simulator", "代幣/股權歸屬模擬") },
        ].map(sv => (
          <button key={sv.id} onClick={() => setSubView(sv.id)} style={{
            background: "transparent", border: "none",
            color: subView === sv.id ? D.tx : D.tx4,
            padding: "8px 18px", cursor: "pointer",
            fontSize: 14, fontWeight: subView === sv.id ? 600 : 400,
            fontFamily: "'DM Mono','Noto Sans TC',monospace",
            borderBottom: subView === sv.id ? `2px solid ${D.slate}` : "2px solid transparent",
            marginBottom: -1, transition: "all 0.2s",
          }}>
            {sv.label}
          </button>
        ))}
      </div>

      {subView === "vesting" && (
        <VestingSim usdt={usdt} lang={lang} t={t} />
      )}

      {subView === "comp" && (<>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Compensation Structure Breakdown", "薪酬結構拆解")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Base · Bonus · Token · ER Social · Allowance — the full employer cost across 12 countries", "底薪・獎金・代幣・雇主社保・津貼——12國雇主實際總成本全貌")}
        </p>
      </div>
      {/* Component guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { key: "Base",    color: D.slate,  zh: "底薪",    desc: t("Core salary — country benchmark","各國市場基準底薪，最大比重") },
          { key: "Bonus",   color: D.sage,   zh: "獎金",    desc: t("Performance + 13th month","績效/年終，依國家習俗差異大") },
          { key: "Token",   color: D.copper, zh: "代幣/股權", desc: t("RSU / Token / ESOP grant value","加密交易所薪酬核心，佔比30-60%") },
          { key: "ER Cost", color: D.clay,   zh: "雇主社保", desc: t("Statutory employer social security","法定雇主提撥，AE最高12.5%") },
          { key: "Allow",   color: D.wine,   zh: "津貼",    desc: t("Housing / transport / relocation","UAE津貼最豐，JP/KR/TW較少") },
        ].map(({ key, color, zh, desc }) => (
          <div key={key} style={{ padding: "10px 14px", borderRadius: 8, background: color + "08", border: `1px solid ${color}18`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, opacity: 0.7, marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(key, zh)}</div>
              <div style={{ fontSize: 11, color: D.tx3, lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <JobSelector
        selFam={selFam} setSelFam={setSelFam}
        selSub={selSub} setSelSub={setSelSub}
        track={track} setTrack={setTrack}
        selLvl={selLvl} setSelLvl={setSelLvl}
        lang={lang} t={t}
      />
      <WorldMap selected={selC} onSelect={togC} t={t} />

      {sel.length === 0 && (
        <Card glow>
          <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 14, color: D.tx4 }}>
            {t("Select countries above to compare", "請在上方選擇國家進行比較")}
          </div>
        </Card>
      )}

      {sel.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {/* VISUAL COMPARISON CHART */}
          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
                {t("SIDE-BY-SIDE COMPARISON", "並排對比")}
              </span>
              <div style={{ display: "flex", gap: 16, marginTop: 10, marginBottom: 16 }}>
                {parts.map(p => (
                  <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: p.c, opacity: 0.5 }} />
                    <span style={{ fontSize: 12, color: D.tx3 }}>{p.l}</span>
                  </div>
                ))}
              </div>
              {data.map((d, i) => (
                <div key={d.c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < data.length - 1 ? 14 : 0 }}>
                  <div style={{ width: 110, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 20 }}>{d.c.flag}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: D.tx, lineHeight: 1.2 }}>{t(d.c.n, d.c.zh)}</div>
                      <div style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>{d.tc.multi || "—"}×</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <div style={{ display: "flex", height: 36, borderRadius: 6, overflow: "hidden", width: Math.max((d.total / maxTotal * 100), 5) + "%", transition: "width 0.6s cubic-bezier(.22,1,.36,1)" }}>
                      {parts.map(p => {
                        const w = d.total > 0 ? (d.vals[p.k] / d.total) * 100 : 0;
                        return (
                          <div key={p.k} style={{ width: w + "%", background: p.c, opacity: 0.4, display: "flex", alignItems: "center", justifyContent: "center", minWidth: w > 6 ? 20 : 0, borderRight: "1px solid rgba(255,255,255,0.5)", transition: "width 0.4s" }}>
                            {w > 10 && <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "'DM Mono',monospace", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{d.vals[p.k]}K</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.ink }}>{fmt(d.total, usdt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* COMPARISON TABLE */}
          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ position: "sticky", left: 0, zIndex: 3, background: D.surface, padding: "12px 16px", textAlign: "left", borderBottom: "2px solid " + D.ln, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", minWidth: 130 }}>
                      {t("Component", "薪酬項目")}
                    </th>
                    {data.map(d => (
                      <th key={d.c.id} style={{ padding: "10px 12px", textAlign: "center", borderBottom: "2px solid " + D.ln, minWidth: 120 }}>
                        <div style={{ fontSize: 18 }}>{d.c.flag}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: D.tx, marginTop: 2 }}>{t(d.c.n, d.c.zh)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p, ri) => (
                    <tr key={p.k} style={{ borderTop: "1px solid " + D.lnF }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "10px 16px", background: ri % 2 ? D.slate + "03" : D.surface, borderRight: "1px solid " + D.lnF }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: p.c, opacity: 0.5 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: D.tx }}>{p.l}</span>
                        </div>
                      </td>
                      {data.map(d => {
                        const val = d.vals[p.k];
                        const pct = d.total > 0 ? Math.round(val / d.total * 100) : 0;
                        const maxVal = Math.max(...data.map(x => x.vals[p.k]), 1);
                        const isMax = val === maxVal && data.length > 1;
                        return (
                          <td key={d.c.id} style={{ padding: "10px 12px", textAlign: "center", borderLeft: "1px solid " + D.lnF }}>
                            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: isMax ? p.c : D.tx }}>{fmt(val, usdt)}</div>
                            <div style={{ fontSize: 11, color: D.tx4, marginTop: 2 }}>{pct}%</div>
                            <div style={{ width: "100%", height: 4, background: D.lnF, borderRadius: 2, marginTop: 4 }}>
                              <div style={{ width: (val / maxVal * 100) + "%", height: "100%", background: p.c, opacity: 0.4, borderRadius: 2, transition: "width 0.5s" }} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr style={{ borderTop: "3px solid " + D.ln, background: D.slate + "06" }}>
                    <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "12px 16px", background: D.slate + "0a", borderRight: "1px solid " + D.lnF }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: D.tx }}>{t("TOTAL EMPLOYER COST", "雇主總成本")}</span>
                    </td>
                    {data.map(d => (
                      <td key={d.c.id} style={{ padding: "12px 12px", textAlign: "center", borderLeft: "1px solid " + D.lnF }}>
                        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink }}>{fmt(d.total, usdt)}</div>
                        <div style={{ fontSize: 12, color: D.copper, fontWeight: 500 }}>{d.tc.multi || "—"}× {t("of base", "底薪")}</div>
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderTop: "1px solid " + D.lnF }}>
                    <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "10px 16px", background: D.surface, borderRight: "1px solid " + D.lnF }}>
                      <span style={{ fontSize: 12, color: D.tx3 }}>{t("ER Statutory Detail", "雇主法定提撥")}</span>
                    </td>
                    {data.map(d => (
                      <td key={d.c.id} style={{ padding: "10px 12px", textAlign: "center", borderLeft: "1px solid " + D.lnF }}>
                        <div style={{ fontSize: 12, color: D.clay }}>{d.tc.erL || "—"}</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* DETAIL CHIPS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(sel.length, 3) + ",1fr)", gap: 12, marginBottom: 14 }}>
            {data.map(d => (
              <Card key={d.c.id} glow>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{d.c.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: D.tx }}>{t(d.c.n, d.c.zh)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: D.sage + "0c", color: D.sage }}>{d.tc.bN} {d.tc.bonus}%</span>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: D.copper + "0c", color: D.copper }}>{d.tc.tN} {d.tc.token}%</span>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: D.clay + "0c", color: D.clay }}>{d.tc.erL}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* ── COMPARISON RESULTS ─────────────────────── */}
          {data.length >= 2 && (() => {
            const byTotal   = [...data].sort((a,b) => b.total - a.total);
            const byMulti   = [...data].sort((a,b) => (b.tc.multi||1) - (a.tc.multi||1));
            const byToken   = [...data].sort((a,b) => (b.tc.token||0) - (a.tc.token||0));
            const byER      = [...data].sort((a,b) => (b.tc.er||0) - (a.tc.er||0));
            const cheapest  = byTotal[byTotal.length - 1];
            const costliest = byTotal[0];
            const spread    = costliest.total > 0 ? (costliest.total / cheapest.total).toFixed(1) : 1;

            return (
              <Card glow style={{ border: "1px solid rgba(84,99,120,0.15)", background: "rgba(84,99,120,0.03)" }}>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, color: D.slate, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 14 }}>
                    📊 {t("COMPARISON RESULTS — TOTAL EMPLOYER COST","比較結果 — 雇主總成本")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
                    {[
                      { icon:"💰", title: t("Most Expensive to Hire","雇用成本最高"),   d: costliest, val: fmt(costliest.total, usdt), sub: t(`${costliest.tc.multi||"—"}× base · ${spread}× vs cheapest`,`${costliest.tc.multi||"—"}倍底薪・是最低成本的${spread}倍`), color: D.clay },
                      { icon:"✅", title: t("Most Affordable","雇用成本最低"),           d: cheapest,  val: fmt(cheapest.total, usdt),  sub: t(`${cheapest.tc.multi||"—"}× base`,`${cheapest.tc.multi||"—"}倍底薪`), color: D.sage },
                      { icon:"🪙", title: t("Highest Token Allocation","代幣比例最高"),  d: byToken[0],val: `${byToken[0].tc.token||0}%`,  sub: t(byToken[0].tc.tN || "—", byToken[0].tc.tN || "—"), color: D.copper },
                      { icon:"🛡️", title: t("Highest ER Social Cost","雇主社保最重"),   d: byER[0],   val: `${byER[0].tc.er||0}%`,         sub: t(byER[0].tc.erL || "—", byER[0].tc.erL || "—"), color: D.wine },
                    ].map(({ icon, title, d, val, sub, color }) => (
                      <div key={title} style={{ padding: "12px 14px", borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
                        <div style={{ fontSize: 12, marginBottom: 6 }}>{icon} <span style={{ fontWeight: 600, color, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{title}</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 18 }}>{d.c.flag}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(d.c.n, d.c.zh)}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color, marginBottom: 3 }}>{val}</div>
                        <div style={{ fontSize: 11, color: D.tx4 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  {/* Ranked bar */}
                  <div style={{ paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 11, color: D.tx4, marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>
                      {t("TOTAL COST RANKING","總成本排名")}
                    </div>
                    {byTotal.map((d, i) => (
                      <div key={d.c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 20, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>#{i+1}</div>
                        <span style={{ fontSize: 16 }}>{d.c.flag}</span>
                        <div style={{ width: 80, fontSize: 12, fontWeight: 500, color: D.tx2, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(d.c.n, d.c.zh)}</div>
                        <div style={{ flex: 1, height: 20, background: "rgba(0,0,0,0.04)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${(d.total / byTotal[0].total) * 100}%`, height: "100%", background: D.slate, opacity: 0.4, borderRadius: 4, transition: "width 0.5s", display: "flex", alignItems: "center", paddingLeft: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: "#fff", whiteSpace:"nowrap" }}>{fmt(d.total, usdt)}</span>
                          </div>
                        </div>
                        <div style={{ width: 36, fontSize: 11, color: D.copper, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{d.tc.multi||"—"}×</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
      </>)}
    </div>
  );
}
