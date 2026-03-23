import Card from "../components/Card.jsx";
import Dot from "../components/Dot.jsx";
import { COUNTRIES } from "../data/countries.js";
import { TC } from "../data/totalcomp.js";
import { JLVL, FAMS } from "../data/jobs.js";
import { gS, fmt } from "../utils/salary.js";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  lnF: "rgba(0,0,0,0.03)",
  ln: "rgba(0,0,0,0.06)",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
  clay: "#a06b52",
};

const LV = ["#9a9aa6", "#6b7fa0", "#7a6a9e", "#9a6878", "#96714a"];

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

function CDetail({ c, onBack, usdt, lang, t }) {
  const tc = TC[c.id];
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: `1px solid rgba(0,0,0,0.06)`, color: D.tx3, padding: "5px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: 12, fontFamily: "'DM Mono',monospace" }}>
        ← {t("Back", "返回")}
      </button>
      <Card accent={D.slate} glow>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>{c.flag}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 500, color: D.tx }}>{t(c.n, c.zh)}</div>
              <Dot s={c.rs} lang={lang} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { l: t("Exchanges", "交易所"), v: c.xc, c: D.sage },
              { l: t("Tax", "稅率"), v: c.tax, c: D.clay },
              { l: t("Comp Multi", "薪酬倍數"), v: `${tc?.multi || "—"}×`, c: D.copper },
              { l: t("ER Cost", "雇主提撥"), v: tc?.erL || "—", c: D.slate, sm: true },
            ].map((item, i) => (
              <div key={i} style={{ background: `${item.c}06`, borderRadius: 6, padding: 12, borderLeft: `3px solid ${item.c}30` }}>
                <Tag color={D.tx4}>{item.l}</Tag>
                <div style={{ marginTop: 4, fontSize: item.sm ? 11 : 18, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: item.c }}>{item.v}</div>
              </div>
            ))}
          </div>
          <Tag color={D.sage}>{t("Labor Law", "勞動法規")}</Tag>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 8, marginBottom: 16 }}>
            {[
              { l: t("Holidays", "假日"), v: `${c.labor.ph}d` },
              { l: t("Annual", "特休"), v: lang === "zh" ? c.labor.alZ : c.labor.al },
              { l: t("Maternity", "產假"), v: lang === "zh" ? c.labor.matZ : c.labor.mat },
              { l: t("Severance", "資遣費"), v: lang === "zh" ? c.labor.sevZ : c.labor.sev },
              { l: t("Sick", "病假"), v: lang === "zh" ? c.labor.sickZ : c.labor.sick },
              { l: t("Marriage", "婚假"), v: lang === "zh" ? c.labor.marZ : c.labor.mar },
              { l: t("Notice", "預告"), v: lang === "zh" ? c.labor.noticeZ : c.labor.notice },
              { l: t("13th Mo", "13月薪"), v: lang === "zh" ? c.labor.th13Z : c.labor.th13 },
            ].map((item, i) => (
              <div key={i} style={{ background: D.lnF, borderRadius: 4, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: D.tx4, fontWeight: 500, fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{item.l}</div>
                <div style={{ fontSize: 13, color: D.tx2, fontWeight: 500, lineHeight: 1.4 }}>{item.v}</div>
              </div>
            ))}
          </div>
          <Tag color={D.slate}>{t("Salary Grid · IC", "薪資 · IC軌")}</Tag>
          <div style={{ overflow: "auto", borderRadius: 6, border: `1px solid ${D.lnF}`, marginTop: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: `${D.slate}04` }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: D.tx3, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>
                    {t("Role", "職位")}
                  </th>
                  {JLVL.ic.map((l, i) => (
                    <th key={l.id} style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, color: LV[i], fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>
                      {t(l.l, l.zh)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FAMS.map(fm => fm.subs.map((sf, si) => (
                  <tr key={sf.id} style={{ borderTop: si === 0 ? `1.5px solid ${D.ln}` : `1px solid ${D.lnF}` }}>
                    <td style={{ padding: "4px 10px", fontSize: 13, color: si === 0 ? D.tx : D.tx3, fontWeight: si === 0 ? 600 : 400 }}>
                      {si === 0 && <span style={{ fontSize: 11, color: D.slate, fontFamily: "'DM Mono',monospace", marginRight: 3 }}>{fm.tag}</span>}
                      {t(sf.l, sf.zh)}
                    </td>
                    {JLVL.ic.map((l, li) => (
                      <td key={l.id} style={{ textAlign: "center", padding: "4px 4px", fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 500, color: D.slate }}>
                        {fmt(gS(c.id, fm.id, sf.id, "ic", li), usdt)}
                      </td>
                    ))}
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════ COUNTRIES MODULE ═══════
export default function Countries({ search, setSearch, detail, setDetail, ready, usdt, lang, t }) {
  if (detail) {
    return <CDetail c={detail} onBack={() => setDetail(null)} usdt={usdt} lang={lang} t={t} />;
  }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 20 }}>
        {t("Country Profiles", "國家檔案")}
      </div>
      <Card glow style={{ marginBottom: 12 }}>
        <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: D.tx4 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("Search...", "搜尋...")}
            style={{ background: "transparent", border: "none", color: D.tx, flex: 1, fontSize: 15, outline: "none", fontWeight: 500, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}
          />
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {COUNTRIES.filter(c => c.n.toLowerCase().includes(search.toLowerCase()) || c.zh.includes(search)).map((c, i) => {
          const tc = TC[c.id];
          return (
            <Card key={c.id} accent={D.slate} onClick={() => setDetail(c)} style={{ opacity: ready ? 1 : 0, transition: `all 0.3s ease ${i * 0.03}s` }}>
              <div style={{ padding: "16px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 28 }}>{c.flag}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: D.tx }}>{t(c.n, c.zh)}</div>
                      <Dot s={c.rs} lang={lang} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { l: t("Mid SWE", "中級工程"), v: fmt(gS(c.id, "eng", "be", "ic", 2), usdt), c: D.slate },
                    { l: t("Holidays", "假日"), v: `${c.labor.ph}d`, c: D.sage },
                    { l: t("Comp", "成本"), v: `${tc?.multi || "—"}×`, c: D.copper },
                  ].map((s, si) => (
                    <div key={si} style={{ background: `${s.c}06`, borderRadius: 4, padding: "8px 10px" }}>
                      <div style={{ fontSize: 11, color: D.tx4, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>{s.l}</div>
                      <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: s.c, marginTop: 1 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
