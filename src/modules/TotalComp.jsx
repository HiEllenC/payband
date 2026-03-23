import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import JobSelector from "../components/JobSelector.jsx";
import { COUNTRIES } from "../data/countries.js";
import { TC } from "../data/totalcomp.js";
import { gS, fmt } from "../utils/salary.js";

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
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Total Compensation Anatomy", "總薪酬結構解剖")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Beyond base salary — the full employer cost", "超越底薪——雇主實際成本全貌")}
        </p>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(sel.length, 3) + ",1fr)", gap: 12 }}>
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
        </div>
      )}
    </div>
  );
}
