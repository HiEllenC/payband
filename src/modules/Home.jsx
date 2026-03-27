import Num from "../components/Num.jsx";
import Card from "../components/Card.jsx";
import { WorldMapHero } from "../components/WorldMap.jsx";

const D = {
  tx:  "#0f172a",
  tx2: "#1e293b",
  tx3: "#475569",
  tx4: "#94a3b8",
  lnF: "rgba(15,23,42,0.04)",
  ln:  "rgba(15,23,42,0.08)",
  ink: "#0f172a",
  slate:  "#1a56db",
  sage:   "#0ea5e9",
  copper: "#f59e0b",
  clay:   "#dc2626",
  wine:   "#7c3aed",
  surface:"#f8fafc",
};

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

// ═══════ HOME MODULE ═══════
export default function Home({ selC, togC, setTab, ready, t, lang = "zh" }) {
  return (
    <div>
      {/* Hero section with map */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 40, padding: "48px 0 40px", alignItems: "center" }}>
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(-20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1)" }}>
          <Tag color={D.copper}>{t("Cross-Border Compensation Intelligence", "跨境薪酬情報平台")}</Tag>
          <h1 style={{ fontSize: 42, fontWeight: 600, color: D.tx, lineHeight: 1.25, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginTop: 16, letterSpacing: 0 }}>
            {t("Cross-border hiring &", "加密業跨境招募、")}<br />
            {t("comp design for crypto teams —", "薪酬設計、留才策略，")}<br />
            <span style={{ color: D.slate }}>{t("real exchange data, 12 markets.", "以交易所真實數據為本。")}</span>
          </h1>
          <p style={{ fontSize: 15, color: D.tx3, lineHeight: 1.85, marginTop: 20, maxWidth: 420 }}>
            {t(
              "Built for crypto exchange HR and C&B teams. Get salary benchmarks, take-home calculations, and labor law data across 12 markets — all sourced from real industry compensation data.",
              "專為加密交易所 HR 與 C&B 打造。匯集業界真實薪酬數據，涵蓋 12 個市場、480 個職位，即時查詢薪資帶寬、稅後試算與勞動法規，讓每個跨境薪酬決策都有底氣。"
            )}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button onClick={() => setTab("totalcomp")} style={{ background: D.ink, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono',monospace", letterSpacing: 0.3 }}>
              {t("Compare Comp Packages", "比較薪酬套餐")}
            </button>
            <button onClick={() => setTab("labor")} style={{ background: "transparent", color: D.tx2, border: `1px solid rgba(0,0,0,0.06)`, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>
              {t("Compare Labor Laws", "比較勞動法規")}
            </button>
          </div>
        </div>
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s", display: "flex", alignItems: "center" }}>
          <WorldMapHero lang={lang} />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, padding: "28px 0", borderTop: `1px solid rgba(0,0,0,0.06)`, borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
        {[
          { v: "12", l: t("Countries covered", "覆蓋國家"), sub: t("incl. SG, AE, HK, JP", "含新加坡・阿聯酋・香港・日本"), c: D.slate },
          { v: "480", l: t("Job Roles", "職位資料"), sub: t("across 12 job families", "12 大職能族群"), c: D.slate },
          { v: "10", l: t("Career Levels", "職等層級"), sub: t("IC1–5 & M1–5 tracks", "IC1–5 & M1–5 雙軌各 5 級"), c: D.slate },
          { v: "10", l: t("Leave Types", "假別類型"), sub: t("annual, sick, parental…", "年假・病假・育嬰…"), c: D.slate },
          { v: "471", l: t("Exchanges tracked", "交易所追蹤"), sub: t("global crypto benchmarks", "全球加密市場基準"), c: D.slate },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", opacity: ready ? 1 : 0, transition: `all 0.5s ease ${0.4 + i * 0.08}s` }}>
            <Num value={s.v} color={s.c} size={36} />
            <div style={{ fontSize: 12, color: D.tx2, letterSpacing: 1, fontWeight: 600, fontFamily: "'DM Mono',monospace", marginTop: 6 }}>{s.l}</div>
            <div style={{ fontSize: 11, color: D.tx4, marginTop: 3, lineHeight: 1.4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* How to use — 3 steps */}
      <div style={{ margin: "36px 0 28px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 16 }}>
          {t("How to use  ·  3 steps", "如何使用  ·  3 步驟")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            {
              step: "01",
              title: t("Pick your countries", "選擇國家"),
              desc: t("Click countries on the map (or use the selector) to compare up to 6 markets side by side.", "在地圖點選國家（最多 6 個），即可並排比較各市場薪酬數據。"),
              c: D.slate,
            },
            {
              step: "02",
              title: t("Select role & level", "選定職位與職等"),
              desc: t("Choose job family → subfunction → IC or Management track → level. Salary data updates instantly.", "選職能族群 → 子職能 → IC 或管理軌道 → 職等，薪資數據即時更新。"),
              c: D.sage,
            },
            {
              step: "03",
              title: t("Read the results", "解讀結果"),
              desc: t("See P25 / P50 / P75 salary ranges, take-home estimates, and cross-country rankings — all in one view.", "查看 P25 / P50 / P75 帶寬、稅後估算與跨國排名，一頁全覽。"),
              c: D.copper,
            },
          ].map((step, i) => (
            <div key={i} style={{ padding: "18px 20px", borderRadius: 10, background: `${step.c}10`, border: `1px solid ${step.c}25`, opacity: ready ? 1 : 0, transition: `all 0.5s ease ${0.3 + i * 0.08}s` }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: step.c, opacity: 0.3, lineHeight: 1, marginBottom: 10 }}>{step.step}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 8 }}>{step.title}</div>
              <p style={{ fontSize: 13, color: D.tx3, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          {
            t: t("Comp Structure", "薪酬結構拆解"),
            scenario: t("Hiring a Singapore engineer? See the full employer cost breakdown.", "想雇用新加坡工程師，不確定雇主實際總成本是多少？"),
            d: t("Compare base + bonus + token + social security + allowances side by side. Includes a 4-year token vesting simulator with 3 price scenarios.", "並排比較底薪・獎金・代幣・社保・津貼。含代幣歸屬模擬器：4年時間表 × 3 種價格情境。"),
            c: D.slate, go: "totalcomp",
          },
          {
            t: t("Salary Band Matrix", "薪資帶寬矩陣"),
            scenario: t("Is a candidate's expected salary above or below market? Find out instantly.", "應徵者的期望薪資，是高於還是低於市場行情？"),
            d: t("P25 / P50 / P75 salary ranges for 480 roles across 12 countries. Enter an actual salary to see its market position (Compa-Ratio).", "480 個職位在 12 國的 P25 / P50 / P75 帶寬。輸入實際薪資，立即得知市場位置（Compa-Ratio）。"),
            c: D.slate, go: "salary",
          },
          {
            t: t("Cross-Border Relocation", "跨境調派規劃"),
            scenario: t("Relocating an employee from Taiwan to Dubai — what changes for their package?", "員工從台灣派駐杜拜，薪酬套餐會怎麼變？"),
            d: t("From → To planner: salary delta, take-home difference, employer cost, visa requirements, and relocation budget — all in one card.", "起始國→目的國：薪差、稅後變化、雇主成本、簽證費與搬遷預算，一張卡片完整呈現。"),
            c: D.copper, go: "relocate",
          },
          {
            t: t("Take-Home Calculator", "到手薪資試算"),
            scenario: t("Same gross salary, but how much does the employee actually pocket in each country?", "同樣的毛薪，在不同國家員工實際到手多少？"),
            d: t("Enter any gross salary → compare net pay after income tax + social security across all 12 countries. UAE = 0% tax. Japan ≈ 50% deduction.", "輸入毛薪，即時比較 12 國稅後到手。阿聯酋 0% 稅，日本扣近 50%，差距一目瞭然。"),
            c: D.slate, go: "netpay",
          },
          {
            t: t("Labor Law Matrix", "勞動法規矩陣"),
            scenario: t("Terminating an employee in the Philippines — what are the legal requirements?", "在菲律賓要資遣員工，法定義務是什麼？"),
            d: t("20 categories across 5 dimensions: leave, probation, severance, social security, termination. Any countries compared side by side.", "5大維度×20項類別並列對比，含年假天數、產假週數、資遣費公式、加班費率等。"),
            c: D.slate, go: "labor",
          },
          {
            t: t("Holiday Calendar", "假日行事曆"),
            scenario: t("Planning a cross-country launch — when is everyone actually at work?", "規劃跨國上線日期，哪天各地都有上班？"),
            d: t("3 views: attendance matrix, monthly calendar, year comparison. Verified 2025–2027 holiday database with holiday type tags.", "3種模式：考勤矩陣・月曆・跨年對比。2025–2027 官方假日資料庫，含假日類型標記。"),
            c: D.tx3, go: "calendar",
          },
        ].map((f, i) => (
          <Card key={i} accent={f.c} onClick={() => setTab(f.go)} style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(12px)", transition: `all 0.5s ease ${0.5 + i * 0.06}s` }}>
            <div style={{ padding: "20px 18px" }}>
              <div style={{ width: 24, height: 2, borderRadius: 2, background: f.c, opacity: 0.4, marginBottom: 14 }} />
              <div style={{ fontSize: 16, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{f.t}</div>
              {/* Use case scenario — one plain-language sentence */}
              <div style={{ fontSize: 12, color: f.c, fontStyle: "italic", marginTop: 8, lineHeight: 1.55, paddingLeft: 10, borderLeft: `2px solid ${f.c}40` }}>
                {f.scenario}
              </div>
              <p style={{ fontSize: 13, color: D.tx3, marginTop: 8, lineHeight: 1.65 }}>{f.d}</p>
              <div style={{ marginTop: 14, fontSize: 13, color: f.c, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>{t("Explore →", "前往 →")}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
