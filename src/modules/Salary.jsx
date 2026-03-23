import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import JobSelector from "../components/JobSelector.jsx";
import { COUNTRIES } from "../data/countries.js";
import { JLVL } from "../data/jobs.js";
import { gS, fmt } from "../utils/salary.js";

const D = {
  tx: "#1c1c1f",
  tx4: "#a8a8b4",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
  clay: "#a06b52",
  wine: "#8a5565",
};

const LV = ["#9a9aa6", "#6b7fa0", "#7a6a9e", "#9a6878", "#96714a"];
const bC = [D.slate, D.sage, D.copper, D.clay, D.wine, "#6b6b8a"];

// ═══════ SALARY MODULE ═══════
export default function Salary({ selC, togC, selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl, usdt, lang, t }) {
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);
  const lvls = JLVL[track];

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 20 }}>
        {t("Salary Matrix", "薪資矩陣")}
      </div>
      <JobSelector
        selFam={selFam} setSelFam={setSelFam}
        selSub={selSub} setSelSub={setSelSub}
        track={track} setTrack={setTrack}
        selLvl={selLvl} setSelLvl={setSelLvl}
        lang={lang} t={t}
      />
      <WorldMap selected={selC} onSelect={togC} t={t} />
      <Card glow style={{ marginTop: 12 }}>
        <div style={{ padding: 18 }}>
          {sel.map((c, ci) => (
            <div key={c.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ fontSize: 15, color: D.tx, fontWeight: 500 }}>{t(c.n, c.zh)}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {lvls.map((l, li) => {
                  const v = gS(c.id, selFam, selSub, track, li);
                  const mx = Math.max(...sel.map(x => gS(x.id, selFam, selSub, track, lvls.length - 1)));
                  return (
                    <div key={l.id} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: LV[li], fontWeight: 500, fontFamily: "'DM Mono',monospace", marginBottom: 3, textAlign: "center" }}>
                        {l.id.toUpperCase()}
                      </div>
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
