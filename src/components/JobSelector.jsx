import Card from "./Card.jsx";
import { FAMS, JLVL } from "../data/jobs.js";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  lnF: "rgba(0,0,0,0.03)",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
};

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

// ═══════ JOB SELECTOR ═══════
export default function JobSelector({ selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl, lang, t }) {
  const fam = FAMS.find(f => f.id === selFam);
  const curLvl = JLVL[track][selLvl];

  return (
    <Card glow style={{ marginBottom: 12 }}>
      <div style={{ padding: "14px 18px" }}>
        {/* Row 1: Family */}
        <div style={{ marginBottom: 10 }}>
          <Tag>{t("Job Family", "職能族群")} · {FAMS.length}</Tag>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 5 }}>
            {FAMS.map(f => (
              <button key={f.id} onClick={() => setSelFam(f.id)} style={{
                background: selFam === f.id ? D.slate + "0c" : "transparent",
                border: "1px solid " + (selFam === f.id ? D.slate + "25" : "transparent"),
                color: selFam === f.id ? D.slate : D.tx4,
                padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 500,
                fontFamily: "'DM Mono','Noto Sans TC',monospace",
              }}>
                {t(f.label, f.zh)}
              </button>
            ))}
          </div>
        </div>
        {/* Row 2: Subfunction */}
        <div style={{ marginBottom: 10, paddingTop: 10, borderTop: "1px solid " + D.lnF }}>
          <Tag>{t("Role / Subfunction", "職位/子職能")} · {fam?.subs.length || 0}</Tag>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 5 }}>
            {fam?.subs.map(s => (
              <button key={s.id} onClick={() => setSelSub(s.id)} style={{
                background: selSub === s.id ? D.sage + "0c" : "transparent",
                border: "1px solid " + (selSub === s.id ? D.sage + "25" : "transparent"),
                color: selSub === s.id ? D.sage : D.tx4,
                padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 500,
                fontFamily: "'DM Mono','Noto Sans TC',monospace",
              }}>
                {t(s.l, s.zh)}
              </button>
            ))}
          </div>
        </div>
        {/* Row 3: Track + Level */}
        <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: "1px solid " + D.lnF }}>
          <div>
            <Tag>{t("Track", "軌道")}</Tag>
            <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
              {[{ id: "ic", e: "Individual Contributor", z: "個人貢獻者" }, { id: "mgmt", e: "Management", z: "管理職" }].map(tr => (
                <button key={tr.id} onClick={() => setTrack(tr.id)} style={{
                  background: track === tr.id ? D.copper + "0c" : "transparent",
                  border: "1px solid " + (track === tr.id ? D.copper + "25" : "transparent"),
                  color: track === tr.id ? D.copper : D.tx4,
                  padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 500,
                  fontFamily: "'DM Mono',monospace",
                }}>
                  {t(tr.e, tr.z)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid " + D.lnF, paddingLeft: 20 }}>
            <Tag>{t("Level", "職等")}</Tag>
            <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
              {JLVL[track].map((l, i) => (
                <button key={l.id} onClick={() => setSelLvl(i)} style={{
                  background: selLvl === i ? D.copper + "0c" : "transparent",
                  border: "1px solid " + (selLvl === i ? D.copper + "25" : "transparent"),
                  color: selLvl === i ? D.copper : D.tx4,
                  padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 500,
                  fontFamily: "'DM Mono',monospace",
                }}>
                  {t(l.l, l.zh)}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Level description */}
        {curLvl && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: D.copper + "06", borderRadius: 6, borderLeft: "3px solid " + D.copper + "30" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: D.copper, fontFamily: "'DM Mono',monospace" }}>{t(curLvl.l, curLvl.zh)}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: D.tx4 }}>{t("Exp: ", "經驗：") + curLvl.yr}</span>
                {curLvl.head !== "N/A" && <span style={{ fontSize: 11, color: D.tx4 }}>{t("Headcount: ", "管理人數：") + curLvl.head}</span>}
              </div>
            </div>
            <div style={{ fontSize: 13, color: D.tx2, lineHeight: 1.6 }}>{lang === "zh" ? curLvl.scopeZ : curLvl.scope}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
