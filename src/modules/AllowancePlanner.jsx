import { useState, useMemo } from "react";
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

// Annual allowance data by country (% of base salary unless noted as fixed USD)
// Types: housing, transport, meal, medical, education, relocation (one-time)
const ALLOW_DATA = {
  us: {
    housing: 0,      transport: 0,    meal: 0,
    medical: 0,      education: 0,    relocation: 8000, // avg one-time domestic
    notes: { zh: "美國一般不給住房/交通津貼，薪酬全部計入底薪。部分公司提供一次性搬遷費 $5K–$15K。", en: "US rarely offers housing/transport allowances — comp is baked into base. Some companies offer one-time relocation $5K–$15K." },
  },
  gb: {
    housing: 0,      transport: 600,  meal: 0,
    medical: 1200,   education: 0,    relocation: 10000,
    notes: { zh: "英國公司常見年度私人醫療保險補貼。通勤費補貼視合約而定。", en: "UK: private medical insurance allowance common. Commute allowance varies by contract." },
  },
  ch: {
    housing: 0,      transport: 1200, meal: 2400,
    medical: 0,      education: 20000, relocation: 15000,
    notes: { zh: "瑞士外籍員工常獲子女國際學校補助（年 $20K+）。餐補較普遍。", en: "Switzerland: expat staff often receive international school subsidy ($20K+/yr). Meal allowance common." },
  },
  mt: {
    housing: 0,      transport: 800,  meal: 1200,
    medical: 1000,   education: 0,    relocation: 8000,
    notes: { zh: "馬爾他薪酬套餐通常含基本交通與餐補，用以彌補相對較低的底薪。", en: "Malta packages often include transport and meal allowances to supplement relatively lower base salaries." },
  },
  ae: {
    housing: 0.25,   transport: 0.10, meal: 0.05,
    medical: 0.05,   education: 0.10, relocation: 15000,
    notes: { zh: "阿聯酋是亞太加密行業津貼最豐厚的地點：住房 25%、子女教育 10%、交通 10%。部分公司全包型套餐含房租。", en: "UAE: most generous allowance package in crypto APAC — housing 25%, education 10%, transport 10%. Some offer fully-furnished housing." },
  },
  sg: {
    housing: 0,      transport: 0.03, meal: 0.02,
    medical: 0.02,   education: 0,    relocation: 12000,
    notes: { zh: "新加坡一般無大型住房津貼（底薪高覆蓋）。外籍員工搬遷費約 $8K–$15K 一次性。", en: "Singapore: minimal housing allowance (high base covers it). Expat relocation ~$8K–$15K one-time." },
  },
  hk: {
    housing: 0.08,   transport: 0.02, meal: 0.02,
    medical: 0.02,   education: 0,    relocation: 12000,
    notes: { zh: "香港部分公司仍提供住房津貼（底薪 8%），以補貼極高房租。員工通勤費可抵扣（2%）。", en: "HK: some firms offer housing allowance (~8% of base) to offset extremely high rents. Transport subsidy 2%." },
  },
  jp: {
    housing: 0.05,   transport: 0.02, meal: 0.01,
    medical: 0,      education: 0,    relocation: 10000,
    notes: { zh: "日本法律規定交通費免稅最高 ¥15萬/月。部分大企業提供宿舍或住房補貼（約 5%）。", en: "Japan: commute allowance up to ¥150K/mo tax-free by law. Some large firms provide dormitory or housing subsidy (~5%)." },
  },
  kr: {
    housing: 0.04,   transport: 0.02, meal: 0.02,
    medical: 0,      education: 0,    relocation: 8000,
    notes: { zh: "韓國公司常提供餐補（月 2%）及交通補貼。首爾辦公室員工通常有住房補貼。", en: "Korea: meal allowance (2%/mo) and transport subsidy common. Seoul office staff often get housing support." },
  },
  tw: {
    housing: 0,      transport: 0.01, meal: 0.02,
    medical: 0,      education: 0,    relocation: 6000,
    notes: { zh: "台灣津貼結構相對簡單：年終獎金為主，餐補常見。住房津貼不普遍（底薪覆蓋）。", en: "Taiwan: simple allowance structure — year-end bonus is the main benefit. Meal allowance common. No significant housing allowance." },
  },
  ph: {
    housing: 0.05,   transport: 0.03, meal: 0.03,
    medical: 0.03,   education: 0,    relocation: 5000,
    notes: { zh: "菲律賓常見組合：住房補貼（5%）＋餐補＋交通補貼。醫療補充保險較普遍（超過 PhilHealth 法定）。", en: "Philippines: housing allowance (5%) + meal + transport is a standard expat package. Supplemental medical above PhilHealth is common." },
  },
  my: {
    housing: 0.05,   transport: 0.03, meal: 0.02,
    medical: 0.02,   education: 0,    relocation: 8000,
    notes: { zh: "馬來西亞外籍員工可獲住房（5%）及車輛/交通補貼（3%）。吉隆坡高端住宅偏貴，住房補貼有助留才。", en: "Malaysia: expat housing (5%) and vehicle/transport (3%) are standard. KL premium housing costs justify the housing benefit." },
  },
};

const ALLOW_TYPES = [
  { key: "housing",    label_zh: "住房", label_en: "Housing",   color: D.slate,  icon: "🏠" },
  { key: "transport",  label_zh: "交通", label_en: "Transport", color: D.sage,   icon: "🚌" },
  { key: "meal",       label_zh: "餐費", label_en: "Meal",      color: D.copper, icon: "🍱" },
  { key: "medical",    label_zh: "醫療", label_en: "Medical",   color: D.clay,   icon: "🏥" },
  { key: "education",  label_zh: "子女教育", label_en: "Education", color: D.wine, icon: "🎓" },
];

const Btn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 4,
    border: `1px solid ${active ? D.slate : D.ln}`,
    background: active ? D.slate + "14" : "transparent",
    color: active ? D.slate : D.tx3,
    fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono','Noto Sans TC',monospace",
    transition: "all 0.15s",
  }}>
    {children}
  </button>
);

export default function AllowancePlanner({ lang, t }) {
  const [base, setBase]       = useState(80000);
  const [sortBy, setSortBy]   = useState("total");
  const [filterKey, setFilter] = useState("all"); // "all" | specific type key

  const results = useMemo(() => {
    return COUNTRIES.map(c => {
      const d = ALLOW_DATA[c.id];
      if (!d) return null;
      const annual = ALLOW_TYPES.reduce((sum, type) => {
        const raw = d[type.key];
        return sum + (raw < 1 ? base * raw : raw);
      }, 0);
      return { c, d, annual };
    }).filter(Boolean).sort((a, b) => {
      if (sortBy === "total")   return b.annual - a.annual;
      if (sortBy === "country") return (a.c.n || "").localeCompare(b.c.n || "");
      // sort by specific type
      const av = ALLOW_DATA[a.c.id][sortBy];
      const bv = ALLOW_DATA[b.c.id][sortBy];
      const aVal = av < 1 ? base * av : av;
      const bVal = bv < 1 ? base * bv : bv;
      return bVal - aVal;
    });
  }, [base, sortBy]);

  const maxAnnual = Math.max(...results.map(r => r.annual), 1);

  const fmt = v => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Allowance Planner", "津貼規劃工具")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Housing · Transport · Meal · Medical · Education — annual allowance breakdown across 12 countries, benchmarked to base salary", "住房・交通・餐費・醫療・子女教育 — 12國年度津貼結構，以底薪比例計算到實際金額")}
        </p>
      </div>

      {/* Concept chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { icon: "🏠", title: t("Housing","住房津貼"),    desc: t("UAE tops at 25% of base. HK ~8% for expats. US/SG/TW typically $0.","UAE 最高達底薪 25%。香港外籍 8%。美國/新加坡/台灣通常不給。") },
          { icon: "🎓", title: t("Education","子女教育"),   desc: t("Switzerland and UAE stand out — international school subsidy often $15K–$25K/yr.","瑞士和阿聯酋最突出，國際學校補貼每年 $15K–$25K。") },
          { icon: "💊", title: t("Medical","醫療補充"),     desc: t("Most countries: supplemental private medical above statutory. UK, US, PH prominent.","多數國家提供法定以上私人醫療補充。英、美、菲最常見。") },
          { icon: "📊", title: t("Total Package","總福利"), desc: t("Add allowances to base + bonus to get true employer cost. UAE highest, TW/US lowest.","津貼加入底薪+獎金=真實雇主成本。AE 最高，TW/US 最低。") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── DECISION FRAMEWORK CARD ────────────────── */}
      <Card glow style={{ marginBottom: 14, border: "1px solid rgba(37,99,235,0.15)", background: "rgba(37,99,235,0.03)" }}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, color: D.slate, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 12 }}>
            🗺️ {t("Decision Framework — When to Offer Allowances", "決策框架 — 何時需要提供津貼")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
            {[
              {
                icon: "✈️",
                title: t("Expatriate Employees", "外派員工"),
                color: D.slate,
                items: [
                  t("Housing allowance: 20–30% of base salary", "住房津貼：底薪的 20–30%"),
                  t("Relocation: one-time $10K–$20K", "搬遷費：一次性 $10K–$20K"),
                  t("Education: if bringing family", "子女教育：攜家眷時必給"),
                ],
              },
              {
                icon: "🌍",
                title: t("Attracting Talent to AE", "吸引國際人才至阿聯酋"),
                color: D.copper,
                items: [
                  t("Full package: housing + education + transport", "全套方案：住房＋子女教育＋交通"),
                  t("Housing is the #1 ask from senior hires", "住房是資深人才入職的首要條件"),
                  t("Medical supplement above mandatory", "法定以上的醫療補充保險"),
                ],
              },
              {
                icon: "🏙️",
                title: t("Local Hiring (SG / HK / TW)", "本地招募（SG/HK/TW）"),
                color: D.sage,
                items: [
                  t("Allowance needs are relatively low", "津貼需求相對較低"),
                  t("Base salary is more important than perks", "底薪競爭力比津貼更關鍵"),
                  t("Meal + transport allowances common; housing rare", "餐補+交通常見；住房補貼不普遍"),
                ],
              },
            ].map(({ icon, title, color, items }) => (
              <div key={title} style={{ padding: "12px 14px", borderRadius: 8, background: color + "06", border: `1px solid ${color}1a` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 8 }}>
                  {icon} {title}
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: D.tx2, lineHeight: 1.8 }}>
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Annual Base Salary (USD)", "年度底薪（USD）")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[60000, 80000, 120000, 180000].map(v => (
                  <Btn key={v} active={base === v} onClick={() => setBase(v)}>${v / 1000}K</Btn>
                ))}
                <input
                  type="number" value={base} min={0} max={1000000}
                  onChange={e => setBase(Number(e.target.value))}
                  style={{ width: 100, padding: "5px 8px", borderRadius: 4, border: `1px solid ${D.ln}`, background: "transparent", color: D.tx, fontSize: 12, fontFamily: "'DM Mono',monospace" }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Sort By", "排序")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Btn active={sortBy === "total"}   onClick={() => setSortBy("total")}>{t("Total Allowance","總津貼")}</Btn>
                {ALLOW_TYPES.map(type => (
                  <Btn key={type.key} active={sortBy === type.key} onClick={() => setSortBy(type.key)}>
                    {type.icon} {lang === "zh" ? type.label_zh : type.label_en}
                  </Btn>
                ))}
                <Btn active={sortBy === "country"} onClick={() => setSortBy("country")}>{t("Country","國家")}</Btn>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bar chart */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
              {t("ANNUAL ALLOWANCE COMPARISON", "年度津貼比較")}
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {ALLOW_TYPES.map(type => (
                <div key={type.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: type.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: D.tx3 }}>{lang === "zh" ? type.label_zh : type.label_en}</span>
                </div>
              ))}
            </div>
          </div>

          {results.map(({ c, d, annual }) => {
            const pct = annual / maxAnnual;
            const totalPct = base > 0 ? annual / base * 100 : 0;
            const typeVals = ALLOW_TYPES.map(type => {
              const raw = d[type.key];
              return { ...type, val: raw < 1 ? base * raw : raw };
            }).filter(t => t.val > 0);
            const total = typeVals.reduce((s, t) => s + t.val, 0) || 1;
            return (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(c.n, c.zh)}</div>
                    <div style={{ fontSize: 11, color: D.tx4 }}>{Math.round(totalPct)}% {t("of base","底薪")}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex", height: 26, borderRadius: 5, overflow: "hidden",
                      width: `${Math.max(pct * 100, annual > 0 ? 3 : 0)}%`,
                      transition: "width 0.5s cubic-bezier(.22,1,.36,1)",
                      background: D.lnF,
                    }}>
                      {typeVals.map(type => (
                        <div key={type.key} style={{
                          width: `${type.val / total * 100}%`,
                          background: type.color, opacity: 0.5,
                          minWidth: type.val > 0 ? 2 : 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {type.val / total > 0.2 && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "'DM Mono',monospace" }}>
                              {fmt(type.val)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 70, textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: annual > 0 ? D.slate : D.tx4 }}>
                      {annual > 0 ? fmt(annual) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detail table */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace", minWidth: 130 }}>
                  {t("Country","國家")}
                </th>
                {ALLOW_TYPES.map(type => (
                  <th key={type.key} style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: type.color, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>
                    {type.icon} {lang === "zh" ? type.label_zh : type.label_en}
                  </th>
                ))}
                <th style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: D.ink, fontFamily: "'DM Mono',monospace" }}>
                  {t("Relocation (1x)","搬遷費（一次性）")}
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                  {t("Annual Total","年度合計")}
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: D.copper, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}
                  title={t("AE is the crypto industry benchmark (highest allowance). vs Industry shows how each country compares.", "以 AE（阿聯酋）為加密行業最高津貼基準，vs Industry 顯示各國津貼相對位置。")}
                >
                  {t("vs Industry ⓘ","vs 行業 ⓘ")}
                </th>
                <th style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 11, color: D.slate, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>
                  {t("Base + Allow","底薪＋津貼")}
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Compute AE benchmark allowance (the crypto industry high benchmark)
                const aeData = ALLOW_DATA["ae"];
                const aeBenchmark = aeData
                  ? ALLOW_TYPES.reduce((sum, type) => {
                      const raw = aeData[type.key];
                      return sum + (raw < 1 ? base * raw : raw);
                    }, 0)
                  : 1;
                return results.map(({ c, d, annual }, ri) => {
                  const vsIndustryPct = aeBenchmark > 0 ? Math.round(annual / aeBenchmark * 100) : 0;
                  const isAbove = vsIndustryPct >= 100;
                  const totalPackage = base + annual;
                  return (
                    <tr key={c.id} style={{ borderTop: `1px solid ${D.lnF}`, background: ri % 2 ? D.slate + "02" : "transparent" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{c.flag}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(c.n, c.zh)}</div>
                            <div style={{ fontSize: 10, color: D.tx4 }}>{c.id.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      {ALLOW_TYPES.map(type => {
                        const raw = d[type.key];
                        const val = raw < 1 ? base * raw : raw;
                        return (
                          <td key={type.key} style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                            {val > 0 ? (
                              <>
                                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: type.color }}>{fmt(val)}</div>
                                <div style={{ fontSize: 10, color: D.tx4 }}>{raw < 1 ? `${Math.round(raw * 100)}%` : "fixed"}</div>
                              </>
                            ) : (
                              <span style={{ color: D.tx4 }}>—</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                        {d.relocation > 0 ? (
                          <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: D.ink }}>{fmt(d.relocation)}</div>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: annual > 0 ? D.slate : D.tx4 }}>
                          {annual > 0 ? fmt(annual) : "—"}
                        </div>
                        {annual > 0 && (
                          <div style={{ fontSize: 10, color: D.tx4 }}>{Math.round(annual / base * 100)}% {t("of base","底薪")}</div>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                        {c.id === "ae" ? (
                          <div style={{ fontSize: 12, fontWeight: 700, color: D.copper, fontFamily: "'DM Mono',monospace" }}>
                            {t("Benchmark","基準")} 🏆
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: isAbove ? D.sage : annual === 0 ? D.tx4 : D.clay }}>
                              {annual === 0 ? "—" : `${vsIndustryPct}%`}
                            </div>
                            <div style={{ fontSize: 10, color: D.tx4 }}>
                              {annual === 0 ? t("no allowance","無津貼") : isAbove ? t("above median","高於行業") : t("below median","低於行業")}
                            </div>
                          </>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.slate }}>
                          {fmt(totalPackage)}
                        </div>
                        <div style={{ fontSize: 10, color: D.tx4 }}>
                          {fmt(base)} + {annual > 0 ? fmt(annual) : t("$0 allow","$0 津貼")}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notes per country */}
      <Card glow>
        <div style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 14, display: "block" }}>
            {t("COUNTRY NOTES — ALLOWANCE PRACTICE", "各國津貼慣例說明")}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
            {results.map(({ c, d }) => (
              <div key={c.id} style={{ padding: "12px 14px", borderRadius: 8, background: D.lnF, border: `1px solid ${D.ln}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{c.flag}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(c.n, c.zh)}</span>
                </div>
                <p style={{ fontSize: 11, color: D.tx3, lineHeight: 1.6 }}>
                  {lang === "zh" ? d.notes.zh : d.notes.en}
                </p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: D.wine + "09", borderRadius: 6, fontSize: 11, color: D.tx3 }}>
            ⚠️ {t("Benchmarks based on crypto/fintech industry practices. Actual allowances vary by company policy and employment contract. Percentages represent industry midpoints.",
               "基於加密/金融科技行業慣例的基準數據。實際津貼依公司政策和勞動合約而定。百分比為行業中位數。")}
          </div>
        </div>
      </Card>
    </div>
  );
}
