import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { COUNTRIES } from "../data/countries.js";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  lnF: "rgba(0,0,0,0.03)",
  ln: "rgba(0,0,0,0.06)",
  slate: "#546378",
  sage: "#5f7a61",
  wine: "#8a5565",
  surface: "#faf9f7",
};

// ═══════ LABOR LAW MODULE ═══════
export default function LaborLaw({ selC, togC, lang, t }) {
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);

  const sections = [
    {
      title: t("Leave Entitlements", "假別制度"), rows: [
        { k: "ph", kz: null, e: "Public Holidays", z: "國定假日", num: true },
        { k: "al", kz: "alZ", e: "Annual Leave", z: "特休/年假" },
        { k: "sick", kz: "sickZ", e: "Sick Leave", z: "病假" },
        { k: "mar", kz: "marZ", e: "Marriage Leave", z: "婚假" },
        { k: "mat", kz: "matZ", e: "Maternity Leave", z: "產假" },
        { k: "pat", kz: "patZ", e: "Paternity Leave", z: "陪產假" },
        { k: "bvt", kz: "bvtZ", e: "Bereavement Leave", z: "喪假" },
      ]
    },
    {
      title: t("Employment Terms", "僱傭條件"), rows: [
        { k: "prob", kz: "probZ", e: "Probation Period", z: "試用期" },
        { k: "notice", kz: "noticeZ", e: "Notice Period", z: "預告期" },
        { k: "sev", kz: "sevZ", e: "Severance Pay", z: "資遣費" },
        { k: "th13", kz: "th13Z", e: "13th Month Pay", z: "第13個月薪" },
      ]
    },
    {
      title: t("Working Conditions", "工作條件"), rows: [
        { k: "wkhr", kz: null, e: "Work Hours/Week", z: "每週工時" },
        { k: "ot", kz: "otZ", e: "Overtime Premium", z: "加班費" },
        { k: "minw", kz: "minwZ", e: "Minimum Wage", z: "最低工資" },
      ]
    },
    {
      title: t("Social Security & Pension", "社會保險與退休金"), rows: [
        { k: "erSS", kz: "erSSZ", e: "Employer SS Rate", z: "雇主社保費率" },
        { k: "eeSS", kz: "eeSSZ", e: "Employee SS Rate", z: "員工社保費率" },
        { k: "pen", kz: "penZ", e: "Pension System", z: "退休金制度" },
      ]
    },
    {
      title: t("Termination Protection", "解僱保護"), rows: [
        { k: "term", kz: "termZ", e: "Termination Rules", z: "解僱規定" },
        { k: "unfair", kz: "unfairZ", e: "Unfair Dismissal Protection", z: "不當解僱保護" },
      ]
    },
  ];

  const getVal = (c, r) => {
    if (!c || !c.labor) return "-";
    if (r.num) return c.labor[r.k] ?? 0;
    if (lang === "zh" && r.kz) return c.labor[r.kz] || c.labor[r.k] || "-";
    return c.labor[r.k] || "-";
  };

  const maxPH = sel.length ? Math.max(...sel.map(c => c.labor?.ph ?? 0)) : 0;
  const minPH = sel.length ? Math.min(...sel.map(c => c.labor?.ph ?? 99)) : 0;
  let rowIdx = 0;

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 6 }}>
        {t("Labor Law Comparison", "勞動法規對比")}
      </div>
      <div style={{ fontSize: 14, color: D.tx3, marginBottom: 20 }}>
        {t("20 categories across 5 dimensions", "5大維度共20項類別")}
      </div>
      <WorldMap selected={selC} onSelect={togC} t={t} />
      <Card glow style={{ marginTop: 12 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 13, color: D.tx3, fontWeight: 500, fontFamily: "'DM Mono',monospace", position: "sticky", left: 0, background: D.surface, zIndex: 2, borderBottom: "1px solid " + D.ln, minWidth: 150 }}>
                  {t("Category", "類別")}
                </th>
                {sel.map(c => (
                  <th key={c.id} style={{ textAlign: "center", padding: "14px 12px", borderBottom: "1px solid " + D.ln, minWidth: 135 }}>
                    <div style={{ fontSize: 22 }}>{c.flag}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: D.tx, marginTop: 2 }}>{t(c.n, c.zh)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, si) => [
                <tr key={"sec-" + si} style={{ borderTop: si === 0 ? "none" : "2px solid " + D.ln }}>
                  <td colSpan={sel.length + 1} style={{ padding: "10px 16px 6px", fontSize: 13, fontWeight: 600, color: D.slate, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, background: D.slate + "05" }}>
                    {sec.title.toUpperCase()}
                  </td>
                </tr>,
                ...sec.rows.map((r) => {
                  rowIdx++;
                  return (
                    <tr key={r.k} style={{ borderTop: "1px solid " + D.lnF }}>
                      <td style={{ padding: "11px 18px", fontSize: 14, color: D.tx, fontWeight: 500, position: "sticky", left: 0, background: rowIdx % 2 ? D.slate + "03" : D.surface, zIndex: 1, borderRight: "1px solid " + D.lnF }}>
                        {t(r.e, r.z)}
                      </td>
                      {sel.map(c => {
                        const v = getVal(c, r);
                        const isN = r.num;
                        let color = D.tx2;
                        if (r.k === "ph" && typeof v === "number") {
                          if (v === maxPH) color = D.sage;
                          if (v === minPH) color = D.wine;
                        }
                        return (
                          <td key={c.id} style={{ textAlign: "center", padding: "11px 12px", fontSize: isN ? 15 : 10.5, fontFamily: isN ? "'DM Mono',monospace" : "inherit", fontWeight: isN ? 500 : 400, color, verticalAlign: "top" }}>
                            {isN ? (v + " " + t("d", "天")) : String(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ])}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
