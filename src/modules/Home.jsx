import Num from "../components/Num.jsx";
import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  ink: "#2d3142",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
  clay: "#a06b52",
  wine: "#8a5565",
};

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

// ═══════ HOME MODULE ═══════
export default function Home({ selC, togC, setTab, ready, t }) {
  return (
    <div>
      {/* Hero section with map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "48px 0 40px", alignItems: "center" }}>
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(-20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1)" }}>
          <Tag color={D.copper}>Cross-Border Compensation Intelligence</Tag>
          <h1 style={{ fontSize: 42, fontWeight: 400, color: D.tx, lineHeight: 1.25, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginTop: 16, letterSpacing: -0.5 }}>
            {t("Global crypto", "跨國加密貨幣")}<br />
            {t("compensation,", "薪酬情報，")}<br />
            <span style={{ color: D.slate }}>{t("decoded.", "全面解碼。")}</span>
          </h1>
          <p style={{ fontSize: 15, color: D.tx3, lineHeight: 1.85, marginTop: 20, maxWidth: 420 }}>
            {t(
              "Total comp structures, labor regulations, leave policies, and public holidays across 12 crypto jurisdictions. Built by cross-border C&B practitioners.",
              "總薪酬結構、勞動法規、假別制度與行事曆。橫跨12個加密貨幣管轄區，由跨境薪酬福利實務專家打造。"
            )}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button onClick={() => setTab("totalcomp")} style={{ background: D.ink, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono',monospace", letterSpacing: 0.3 }}>
              {t("Explore Total Comp", "探索總薪酬")}
            </button>
            <button onClick={() => setTab("labor")} style={{ background: "transparent", color: D.tx2, border: `1px solid rgba(0,0,0,0.06)`, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>
              {t("Labor Law Compare", "勞動法規對比")}
            </button>
          </div>
        </div>
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s" }}>
          <WorldMap selected={selC} onSelect={togC} t={t} />
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <span style={{ fontSize: 12, color: D.tx4 }}>{t("Click countries to compare", "點選國家進行比較")}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, padding: "28px 0", borderTop: `1px solid rgba(0,0,0,0.06)`, borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
        {[
          { v: "12", l: t("Countries", "國家"), c: D.slate },
          { v: "480", l: t("Roles", "職位"), c: D.sage },
          { v: "10", l: t("Levels", "職等"), c: D.copper },
          { v: "10", l: t("Leave Types", "假別"), c: D.clay },
          { v: "471", l: t("Exchanges", "交易所"), c: D.wine },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", opacity: ready ? 1 : 0, transition: `all 0.5s ease ${0.4 + i * 0.08}s` }}>
            <Num value={s.v} color={s.c} size={30} />
            <div style={{ fontSize: 12, color: D.tx4, letterSpacing: 1.5, fontWeight: 500, fontFamily: "'DM Mono',monospace", marginTop: 5 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 36 }}>
        {[
          {
            t: t("Comp Structure", "薪酬結構拆解"),
            d: t("Compare Base + Bonus + Token + ER Social + Allowance across countries. See which jurisdiction has the highest total employer cost.", "比較各國底薪・獎金・代幣・雇主社保・津貼組合。含代幣歸屬模擬器：4年時間表×3種價格情境。"),
            c: D.slate, go: "totalcomp",
          },
          {
            t: t("Salary Band Matrix", "薪資帶寬矩陣"),
            d: t("P25 / P50 / P75 salary bands for 12 job families × 48 roles × IC & Management tracks × 12 countries. Includes Compa-Ratio checker.", "12職能族群×48子職能×雙軌道×12國的P25/P50/P75帶寬。含Compa-Ratio快速比較你的薪資位置。"),
            c: D.sage, go: "salary",
          },
          {
            t: t("Cross-Border Relocation", "跨境調派規劃"),
            d: t("From → To country planner: salary delta, take-home diff, employer cost, visa requirements & relocation budget in one card.", "選起始國→目的國，一張卡片顯示薪資差額、稅後對比、簽證費用與搬遷預算。"),
            c: D.copper, go: "relocate",
          },
          {
            t: t("Take-Home Calculator", "到手薪資試算"),
            d: t("Enter any gross salary → see net pay after income tax + social security in all 12 countries side by side. AE = 0% tax.", "輸入毛薪，即時比較12國稅後到手。阿聯酋0%稅，日本扣近50%，差距一目瞭然。"),
            c: D.clay, go: "netpay",
          },
          {
            t: t("Labor Law Matrix", "勞動法規矩陣"),
            d: t("20 categories across 5 dimensions — leave, probation, severance, social security, termination. Sticky country compare table.", "5大維度×20項類別並列對比，含年假天數、產假週數、資遣費公式、加班費率等。"),
            c: D.wine, go: "labor",
          },
          {
            t: t("Holiday Calendar", "假日行事曆"),
            d: t("3 views: Attendance matrix, monthly calendar, year comparison. 2025–2027 verified holiday database with type tags.", "3種模式：考勤矩陣・月曆・跨年對比。2025–2027官方假日資料庫，含假日類型標記。"),
            c: D.tx3, go: "calendar",
          },
        ].map((f, i) => (
          <Card key={i} accent={f.c} onClick={() => setTab(f.go)} style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(12px)", transition: `all 0.5s ease ${0.5 + i * 0.06}s` }}>
            <div style={{ padding: "20px 18px" }}>
              <div style={{ width: 24, height: 2, borderRadius: 2, background: f.c, opacity: 0.4, marginBottom: 14 }} />
              <div style={{ fontSize: 16, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{f.t}</div>
              <p style={{ fontSize: 13, color: D.tx3, marginTop: 8, lineHeight: 1.65 }}>{f.d}</p>
              <div style={{ marginTop: 14, fontSize: 13, color: f.c, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>{t("Explore →", "前往 →")}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
