import Card from "../components/Card.jsx";
import { COUNTRIES } from "../data/countries.js";

const D = {
  tx:  "#0f172a",
  tx2: "#1e293b",
  tx3: "#475569",
  tx4: "#94a3b8",
  lnF: "rgba(15,23,42,0.04)",
  ln:  "rgba(15,23,42,0.08)",
  ink: "#0f172a",
  slate:  "#1a56db",
  sage:   "#059669",
  copper: "#f59e0b",
  clay:   "#dc2626",
  wine:   "#7c3aed",
  surface:"#f8fafc",
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
        {t("Labor Law Comparison Matrix", "勞動法規比較矩陣")}
      </div>
      <div style={{ fontSize: 14, color: D.tx3, marginBottom: 14 }}>
        {t("12 countries × 20 categories across 5 dimensions — leave entitlements, employment terms, working conditions, social security & termination protections", "12國 × 5大維度 × 20項類別——休假、僱傭條款、工作條件、社保退休與解僱保護")}
      </div>

      {/* Dimension guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8, marginBottom: 16 }}>
        {[
          { icon: "🏖️", title: t("Leave Entitlements","休假權益（7項）"),     desc: t("Annual leave, public holidays, maternity, paternity, sick leave, marriage, bereavement","年假・國假・產假・陪產・病假・婚假・喪假") },
          { icon: "📝", title: t("Employment Terms","僱傭條款（4項）"),       desc: t("Probation, notice period, 13th month pay, overtime premium","試用期・預告期・第13個月薪・加班費率") },
          { icon: "⚙️", title: t("Working Conditions","工作條件（3項）"),     desc: t("Weekly hours cap, minimum wage, business visa entitlement","每週工時上限・最低工資・商務假") },
          { icon: "🛡️", title: t("Social Security","社保與退休（3項）"),      desc: t("Employer & employee social contribution rates, pension scheme type","雇主/員工提撥比率・退休金制度類型") },
          { icon: "⚖️", title: t("Termination","解僱保護（2項）"),            desc: t("Severance formula, unfair dismissal protection strength","資遣費計算公式・不當解僱保護力度") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{icon} <span style={{ fontSize: 12, fontWeight: 600, color: D.ink, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{title}</span></div>
            <div style={{ fontSize: 11, color: D.tx3, lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Country selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
        {COUNTRIES.map(c => {
          const active = selC.includes(c.id);
          return (
            <button key={c.id} onClick={() => togC(c.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px", borderRadius: 7, cursor: "pointer",
              border: active ? `1.5px solid ${D.slate}` : "1.5px solid rgba(0,0,0,0.08)",
              background: active ? D.slate : D.surface,
              color: active ? "#fff" : D.tx2,
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: "'DM Mono','Noto Sans TC',monospace",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              {t(c.n, c.zh)}
            </button>
          );
        })}
        {selC.length > 0 && (
          <button onClick={() => selC.forEach(id => togC(id))} style={{
            padding: "7px 14px", borderRadius: 7, cursor: "pointer",
            border: "1.5px solid rgba(220,38,38,0.3)",
            background: "rgba(220,38,38,0.05)",
            color: "#dc2626",
            fontSize: 13, fontFamily: "'DM Mono','Noto Sans TC',monospace",
            transition: "all 0.15s",
          }}>
            {t("✕ Clear", "✕ 清空")}
          </button>
        )}
      </div>

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
                          <td key={c.id} style={{ textAlign: "center", padding: "11px 12px", fontSize: isN ? 15 : 12, fontFamily: isN ? "'DM Mono',monospace" : "inherit", fontWeight: isN ? 500 : 400, color, verticalAlign: "top" }}>
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
