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

// Country tax treatment — income rate at vest + capital gains rate on post-vest appreciation
const TOKEN_TAX = {
  us: { income: 0.37, cgt: 0.20, zh: "RSU 歸屬時按普通收入課稅（最高 37%＋州稅）。歸屬後增值按長期 CGT 20%。", en: "RSU taxed as ordinary income at vest (up to 37% + state). Post-vest appreciation: long-term CGT 20%." },
  gb: { income: 0.45, cgt: 0.20, zh: "非核准期權：行使時 PAYE 最高 45%。歸屬後增值：CGT 20%（扣除 £3K 免稅額後）。", en: "Unapproved options: PAYE up to 45% at vest. Post-vest: CGT 20% (above £3K allowance)." },
  ch: { income: 0.35, cgt: 0.00, zh: "歸屬時按市值課稅（有效稅率 28–35%）。瑞士無資本利得稅（私人資產）。", en: "Taxed at FMV on vest (effective 28–35%). Switzerland has no CGT on private asset gains." },
  mt: { income: 0.35, cgt: 0.15, zh: "歸屬時所得稅最高 35%。代幣出售：CGT 15%（加密資產依最新指引課稅）。", en: "Income tax up to 35% at vest. Token sale: CGT 15% per latest crypto guidance." },
  ae: { income: 0.00, cgt: 0.00, zh: "無個人所得稅，無資本利得稅。阿聯酋是代幣歸屬最有利的司法管轄區。", en: "Zero income tax. Zero CGT. UAE is the most favorable jurisdiction for token vesting." },
  sg: { income: 0.24, cgt: 0.00, zh: "ESOP 在行使時課稅（最高 24%，薪資所得）。無資本利得稅。", en: "ESOP taxed at exercise as employment income (max 24%). No CGT in Singapore." },
  hk: { income: 0.15, cgt: 0.00, zh: "股票期權歸屬時薪俸稅，上限 15%。無資本利得稅。HK 是 APAC 最低稅負地。", en: "Share options taxed under Salaries Tax (capped 15%). No CGT. Lowest APAC tax burden." },
  jp: { income: 0.55, cgt: 0.2031, zh: "RSU/期權歸屬時：薪資所得最高 55%（含地方稅）。賣出增值：CGT 20.315%。", en: "RSU/option at vest: employment income up to 55% (incl. local). Post-vest appreciation: CGT 20.315%." },
  kr: { income: 0.49, cgt: 0.22, zh: "RSU 歸屬時：薪資所得最高 49.5%（含地方稅）。大股東賣出：CGT 22–25%。", en: "RSU at vest: income up to 49.5% (incl. local surcharge). Large shareholder sale: CGT 22–25%." },
  tw: { income: 0.40, cgt: 0.00, zh: "員工認股行使差額：薪資所得 5–40%。無獨立 CGT，計入綜合所得稅。賣出通常免稅。", en: "Stock exercise spread: employment income 5–40%. No separate CGT; post-vest sale generally exempt." },
  ph: { income: 0.35, cgt: 0.15, zh: "歸屬/行使時：普通收入最高 35%。股份出售 CGT 15%。無正式加密稅務框架。", en: "At vest/exercise: ordinary income up to 35%. Share sale: CGT 15%. No formal crypto tax framework." },
  my: { income: 0.30, cgt: 0.00, zh: "ESOS 行使差額：薪資所得。無資本利得稅（持有資產）。加密貨幣尚無正式指引。", en: "ESOS exercise spread: employment income. No CGT on capital assets. Crypto: no formal guidance." },
};

function calcVesting(grant, cliffYrs, totalYrs, freq) {
  const periodsPerYear = freq === "monthly" ? 12 : freq === "quarterly" ? 4 : 1;
  const totalPeriods = totalYrs * periodsPerYear;
  const cliffPeriod = cliffYrs * periodsPerYear;
  const perPeriod = grant / totalPeriods;
  const result = [];
  let cumulative = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    let vested = 0;
    if (cliffPeriod > 0 && p < cliffPeriod) {
      vested = 0;
    } else if (cliffPeriod > 0 && p === cliffPeriod) {
      vested = perPeriod * cliffPeriod;
    } else {
      vested = perPeriod;
    }
    cumulative += vested;
    const yr = Math.ceil(p / periodsPerYear);
    const pInYr = ((p - 1) % periodsPerYear) + 1;
    const label = freq === "quarterly"
      ? `Q${pInYr} · Y${yr}`
      : freq === "monthly"
        ? `M${String(pInYr).padStart(2, "0")} · Y${yr}`
        : `Year ${yr}`;
    result.push({ period: p, yr, vested, cumulative, label, isCliff: cliffPeriod > 0 && p === cliffPeriod });
  }
  return result;
}

// Dual-layer tax calc: income at vest + CGT on appreciation
function calcDualTax(vestValue, priceMult, tax) {
  const incomeTax = vestValue * tax.income;
  const afterIncome = vestValue - incomeTax;
  // CGT applies to appreciation above vest price
  const appreciation = vestValue * (priceMult - 1);
  const cgtTax = appreciation > 0 ? appreciation * tax.cgt : 0;
  const totalTax = incomeTax + cgtTax;
  const netProceeds = vestValue * priceMult - totalTax;
  return { incomeTax, afterIncome, appreciation, cgtTax, totalTax, netProceeds };
}

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

export default function VestingSim({ usdt, lang, t }) {
  const [grant, setGrant]       = useState(200000);
  const [cliffYrs, setCliffYrs] = useState(1);
  const [freq, setFreq]         = useState("quarterly");
  const [totalYrs, setTotalYrs] = useState(4);
  const [priceChg, setPriceChg] = useState(0);
  const [selCountry, setSelCountry] = useState("sg");
  const [saleChg, setSaleChg]   = useState(50); // % appreciation when sold vs vest price

  const vestData = useMemo(() =>
    calcVesting(grant, cliffYrs, totalYrs, freq),
    [grant, cliffYrs, totalYrs, freq]
  );

  const scenarios = [
    { label: "-50%", mult: 0.5,  color: D.clay },
    { label: t("Base", "基準"),   mult: 1.0,  color: D.slate },
    { label: "+50%", mult: 1.5,  color: D.sage },
    { label: `${priceChg >= 0 ? "+" : ""}${priceChg}%`, mult: 1 + priceChg / 100, color: D.copper },
  ];

  const maxVested = Math.max(...vestData.map(d => d.vested), 1);

  // Aggregate by year for CashflowChart
  const yearlyData = useMemo(() => {
    const byYr = {};
    vestData.forEach(d => {
      if (!byYr[d.yr]) byYr[d.yr] = 0;
      byYr[d.yr] += d.vested;
    });
    return Object.entries(byYr).map(([yr, vested]) => ({ yr: Number(yr), vested }));
  }, [vestData]);

  const tax = TOKEN_TAX[selCountry];
  const saleMult = 1 + saleChg / 100;
  const totalVested = vestData[vestData.length - 1]?.cumulative || grant;

  // CashflowChart: year-by-year after-tax cashflow
  const cashflowRows = useMemo(() => {
    let cum = 0;
    return yearlyData.map(({ yr, vested }) => {
      const { incomeTax, cgtTax, netProceeds } = calcDualTax(vested, saleMult, tax);
      cum += netProceeds;
      return { yr, vested, incomeTax, cgtTax, net: vested * saleMult - incomeTax - cgtTax, cumNet: cum };
    });
  }, [yearlyData, tax, saleMult]);

  const maxNetProceeds = Math.max(...cashflowRows.map(r => r.vested * saleMult), 1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Token / Equity Vesting Simulator", "代幣 / 股權歸屬模擬器")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Vesting schedule + dual-layer tax (income at vest + CGT on appreciation) + country cashflow comparison", "歸屬時程 + 雙層稅務（歸屬時所得稅 + 出售增值 CGT）+ 各國到手現金流比較")}
        </p>
      </div>

      {/* Concept guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { icon: "⛰️", title: t("Cliff","懸崖期（Cliff）"),       desc: t("Employee receives NOTHING until cliff date. 1yr cliff = zero payout if they leave before 12 months.","懸崖期內離職＝0。1年懸崖=滿12個月前離職一毛不拿，到達後才一次補發。") },
          { icon: "📅", title: t("Vesting Frequency","歸屬頻率"),   desc: t("After cliff: how often tokens unlock. Quarterly = every 3 months. Monthly = smoother cashflow.","懸崖後每隔多久釋放一批：每月最平滑，每季最常見（加密交易所標準結構）。") },
          { icon: "🧾", title: t("Income Tax at Vest","歸屬時所得稅"), desc: t("When tokens vest, most countries treat this as employment income — taxed immediately at marginal rate.","代幣歸屬時，多數國家視為薪資收入立即課稅，按邊際稅率計算。") },
          { icon: "📈", title: t("Capital Gains Tax","資本利得稅"), desc: t("If you HOLD tokens after vest and price rises, the appreciation is taxed separately as CGT (many APAC countries: 0%).","歸屬後繼續持有、價格上漲的部分，以 CGT 計算。AE/SG/HK/TW/MY 均為 0% CGT。") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── INPUTS ─────────────────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
            {t("GRANT PARAMETERS", "授予參數")}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 14 }}>

            {/* Grant amount */}
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Total Grant (USD)", "總授予金額（USD）")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[50000, 100000, 200000, 500000].map(v => (
                  <Btn key={v} active={grant === v} onClick={() => setGrant(v)}>
                    ${v / 1000}K
                  </Btn>
                ))}
                <input
                  type="number" value={grant} min={0} max={10000000}
                  onChange={e => setGrant(Number(e.target.value))}
                  style={{ width: 100, padding: "5px 8px", borderRadius: 4, border: `1px solid ${D.ln}`, background: "transparent", color: D.tx, fontSize: 12, fontFamily: "'DM Mono',monospace" }}
                />
              </div>
            </div>

            {/* Cliff */}
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Cliff", "懸崖期")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[[0, t("None","無")], [1, "1yr"], [2, "2yr"]].map(([v, l]) => (
                  <Btn key={v} active={cliffYrs === v} onClick={() => setCliffYrs(v)}>{l}</Btn>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Vesting Frequency", "歸屬頻率")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["monthly", t("Monthly","每月")], ["quarterly", t("Quarterly","每季")], ["annual", t("Annual","每年")]].map(([v, l]) => (
                  <Btn key={v} active={freq === v} onClick={() => setFreq(v)}>{l}</Btn>
                ))}
              </div>
            </div>

            {/* Vesting period */}
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Vesting Period", "歸屬期限")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[3, 4, 5].map(v => (
                  <Btn key={v} active={totalYrs === v} onClick={() => setTotalYrs(v)}>{v}{t("yr","年")}</Btn>
                ))}
              </div>
            </div>

            {/* Custom price slider */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>
                {t("Custom Price Change at Vest", "歸屬時自訂價格變動")}：
                <span style={{ color: priceChg >= 0 ? D.sage : D.clay, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>
                  {priceChg >= 0 ? "+" : ""}{priceChg}%
                </span>
              </div>
              <input
                type="range" min={-80} max={200} value={priceChg}
                onChange={e => setPriceChg(Number(e.target.value))}
                style={{ width: "100%", accentColor: D.slate }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                <span>-80%</span><span>0</span><span>+200%</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "8px 12px", background: D.slate + "08", borderRadius: 6, fontSize: 12, color: D.tx2, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
            {t("Total Grant", "總授予")} <strong>${(grant / 1000).toFixed(0)}K</strong>
            {cliffYrs > 0 && <> · {t("Cliff", "懸崖期")} {cliffYrs}{t("yr","年")}</>}
            · {freq === "monthly" ? t("Monthly vesting","每月歸屬") : freq === "quarterly" ? t("Quarterly vesting","每季歸屬") : t("Annual vesting","每年歸屬")}
            · {totalYrs}{t("yr total","年總計")}
          </div>
        </div>
      </Card>

      {/* ── VESTING TIMELINE BARS ──────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
              {t("VESTING TIMELINE", "歸屬時間表")}
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {scenarios.map(sc => (
                <div key={sc.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: sc.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: sc.color, fontFamily: "'DM Mono',monospace" }}>{sc.label}</span>
                </div>
              ))}
            </div>
          </div>

          {vestData.map((d) => (
            <div key={d.period} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 4, fontFamily: "'DM Mono',monospace" }}>
                {d.label}
                {d.isCliff && (
                  <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 3, background: D.copper + "20", color: D.copper }}>
                    CLIFF
                  </span>
                )}
                {d.vested === 0 && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: D.tx4 }}>{t("(cliff lock-up)","（懸崖鎖定期）")}</span>
                )}
              </div>
              {scenarios.map(sc => {
                const val = d.vested * sc.mult;
                const pct = maxVested > 0 ? (val / (maxVested * Math.max(...scenarios.map(s => s.mult)) * 1.1)) * 100 : 0;
                return (
                  <div key={sc.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 40, fontSize: 10, color: sc.color, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{sc.label}</div>
                    <div style={{ flex: 1, background: D.lnF, borderRadius: 3, height: 20, overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.max(pct, val > 0 ? 1 : 0)}%`,
                        height: "100%", background: sc.color, opacity: 0.5,
                        borderRadius: 3, transition: "width 0.5s cubic-bezier(.22,1,.36,1)",
                        display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
                      }}>
                        {val > 10000 && (
                          <span style={{ fontSize: 10, color: "#fff", fontFamily: "'DM Mono',monospace", fontWeight: 600, whiteSpace: "nowrap" }}>
                            ${(val / 1000).toFixed(0)}K
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: 72, fontSize: 11, color: D.tx2, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>
                      ${(val / 1000).toFixed(1)}K
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* ── YEAR-BY-YEAR TABLE ─────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: `2px solid ${D.ln}`, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", minWidth: 100 }}>
                  {t("Year", "年度")}
                </th>
                {scenarios.map(sc => (
                  <th key={sc.label} style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 12, color: sc.color, fontFamily: "'DM Mono',monospace" }}>
                    {sc.label}
                  </th>
                ))}
                <th style={{ padding: "12px 12px", textAlign: "center", borderBottom: `2px solid ${D.ln}`, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", minWidth: 110 }}>
                  {t("Cumulative (Base)", "累計（基準）")}
                </th>
              </tr>
            </thead>
            <tbody>
              {vestData.map((d) => (
                <tr key={d.period} style={{ borderTop: `1px solid ${D.lnF}` }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: D.tx, fontFamily: "'DM Mono',monospace" }}>
                    {d.label}
                    {d.isCliff && (
                      <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px", borderRadius: 3, background: D.copper + "20", color: D.copper }}>
                        CLIFF
                      </span>
                    )}
                  </td>
                  {scenarios.map(sc => (
                    <td key={sc.label} style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: d.vested === 0 ? D.tx4 : sc.color }}>
                        {d.vested === 0 ? "—" : `$${((d.vested * sc.mult) / 1000).toFixed(1)}K`}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                    <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.ink }}>
                      ${(d.cumulative / 1000).toFixed(0)}K
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: `3px solid ${D.ln}`, background: D.slate + "06" }}>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
                  {t("TOTAL", "合計")}
                </td>
                {scenarios.map(sc => (
                  <td key={sc.label} style={{ padding: "12px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: sc.color }}>
                      ${((grant * sc.mult) / 1000).toFixed(0)}K
                    </div>
                  </td>
                ))}
                <td style={{ padding: "12px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink }}>
                    ${(grant / 1000).toFixed(0)}K
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════
          DUAL-LAYER TAX + CASHFLOW CHART
          ══════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 8 }}>
        <div style={{ height: 1, flex: 1, background: D.ln }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
          {t("DUAL-LAYER TAX ANALYSIS", "雙層稅務分析")}
        </span>
        <div style={{ height: 1, flex: 1, background: D.ln }} />
      </div>

      {/* Country selector + sale price */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 8 }}>
                {t("Select Country for Tax Calculation", "選擇計算稅務的國家")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(TOKEN_TAX).map(([id, info]) => {
                  const c = COUNTRIES.find(c => c.id === id);
                  return (
                    <button key={id} onClick={() => setSelCountry(id)} style={{
                      padding: "5px 10px", borderRadius: 6,
                      border: `1.5px solid ${selCountry === id ? D.slate : D.ln}`,
                      background: selCountry === id ? D.slate + "12" : "transparent",
                      cursor: "pointer", fontSize: 13,
                      fontFamily: "'DM Mono','Noto Sans TC',monospace",
                      color: selCountry === id ? D.slate : D.tx3,
                      transition: "all 0.15s",
                    }}>
                      {c?.flag} {t(c?.n, c?.zh)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>
                {t("Token Price Appreciation When Sold", "出售時價格漲幅（相對歸屬時）")}：
                <span style={{ color: saleChg >= 0 ? D.sage : D.clay, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>
                  {saleChg >= 0 ? "+" : ""}{saleChg}%
                </span>
              </div>
              <input
                type="range" min={-80} max={300} value={saleChg}
                onChange={e => setSaleChg(Number(e.target.value))}
                style={{ width: "100%", accentColor: D.sage }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                <span>-80%</span><span>0%</span><span>+300%</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: D.tx4, lineHeight: 1.5 }}>
                {t("Sell immediately at vest: 0%. Hold and price rises: positive. Price drops: negative.",
                   "歸屬時立即賣出：0%。持有後漲價：正值。跌價：負值。")}
              </div>
            </div>
          </div>

          {/* Summary cards for selected country */}
          {(() => {
            const { incomeTax, cgtTax, netProceeds } = calcDualTax(totalVested, saleMult, tax);
            const grossSale = totalVested * saleMult;
            const selectedC = COUNTRIES.find(c => c.id === selCountry);
            return (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: D.tx4, marginBottom: 10, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
                  {selectedC?.flag} {t(selectedC?.n, selectedC?.zh)} — {t("Full Grant After Dual-Layer Tax", "全額授予雙層稅後結果")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                  {[
                    { label: t("Gross Vested","毛歸屬額"), val: totalVested, color: D.ink, sub: t("at grant price","按授予時價格") },
                    { label: t("Income Tax at Vest","歸屬時所得稅"), val: -incomeTax, color: D.copper, sub: `~${Math.round(tax.income * 100)}% ${t("rate","稅率")}` },
                    ...(saleChg !== 0 ? [{ label: saleChg > 0 ? t("Capital Gains Tax","資本利得稅") : t("Capital Loss","資本損失"), val: -cgtTax, color: D.clay, sub: `~${Math.round(tax.cgt * 100)}% CGT` }] : []),
                    { label: t("Net Proceeds","稅後到手"), val: netProceeds, color: D.sage, sub: `${Math.round(netProceeds / grossSale * 100)}% ${t("of sale value","占出售金額")}` },
                  ].map(({ label, val, color, sub }) => (
                    <div key={label} style={{ padding: "12px 14px", borderRadius: 8, background: color + "08", border: `1px solid ${color}18` }}>
                      <div style={{ fontSize: 11, color: D.tx4, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color }}>
                        {val >= 0 ? "" : "-"}${(Math.abs(val) / 1000).toFixed(0)}K
                      </div>
                      <div style={{ fontSize: 11, color: D.tx4, marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: "8px 12px", background: D.slate + "06", borderRadius: 6, fontSize: 11, color: D.tx3, lineHeight: 1.6 }}>
                  {lang === "zh" ? tax.zh : tax.en}
                </div>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* ── CASHFLOW CHART ─────────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
              {t("AFTER-TAX CASHFLOW BY YEAR", "逐年稅後現金流")}
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { color: D.sage,   label: t("Net After All Tax","全稅後淨額") },
                { color: D.copper, label: t("Income Tax","所得稅") },
                { color: D.clay,   label: "CGT" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: D.tx3 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {cashflowRows.map((row) => {
            const grossVal = row.vested * saleMult;
            const pct = grossVal / maxNetProceeds;
            const netPct = row.net / grossVal;
            const itPct = row.incomeTax / grossVal;
            const cgtPct = row.cgtTax / grossVal;
            return (
              <div key={row.yr} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono',monospace" }}>
                    {t("Year","年")} {row.yr}
                  </span>
                  <span style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                    {t("Gross","毛額")} ${(row.vested / 1000).toFixed(0)}K
                    {saleChg !== 0 && ` → ${t("at sale","出售")} $${(grossVal / 1000).toFixed(0)}K`}
                    {" "} · {t("Net","淨")} <span style={{ color: D.sage, fontWeight: 600 }}>${(row.net / 1000).toFixed(0)}K</span>
                  </span>
                </div>
                {/* Stacked bar: net + income tax + CGT */}
                <div style={{ display: "flex", height: 28, borderRadius: 5, overflow: "hidden", width: `${Math.max(pct * 100, 4)}%`, transition: "width 0.5s cubic-bezier(.22,1,.36,1)", background: D.lnF }}>
                  <div style={{ width: `${netPct * 100}%`, background: D.sage, opacity: 0.55, display: "flex", alignItems: "center", paddingLeft: 6, minWidth: 4 }}>
                    {netPct > 0.2 && <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>${(row.net / 1000).toFixed(0)}K</span>}
                  </div>
                  <div style={{ width: `${itPct * 100}%`, background: D.copper, opacity: 0.5, minWidth: itPct > 0 ? 2 : 0 }} />
                  <div style={{ width: `${cgtPct * 100}%`, background: D.clay, opacity: 0.5, minWidth: cgtPct > 0 ? 2 : 0 }} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                  {[
                    { label: t("Net","淨"), val: row.net, color: D.sage },
                    { label: t("Inc Tax","所得稅"), val: row.incomeTax, color: D.copper },
                    ...(row.cgtTax > 0 ? [{ label: "CGT", val: row.cgtTax, color: D.clay }] : []),
                    { label: t("Cumulative","累計淨額"), val: row.cumNet, color: D.slate },
                  ].map(item => (
                    <div key={item.label} style={{ fontSize: 10, color: item.color, fontFamily: "'DM Mono',monospace" }}>
                      {item.label} <strong>${(item.val / 1000).toFixed(0)}K</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Total summary */}
          {(() => {
            const last = cashflowRows[cashflowRows.length - 1];
            if (!last) return null;
            const totalIt = cashflowRows.reduce((s, r) => s + r.incomeTax, 0);
            const totalCgt = cashflowRows.reduce((s, r) => s + r.cgtTax, 0);
            const totalNet = last.cumNet;
            const grossSaleTotal = totalVested * saleMult;
            return (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `2px solid ${D.ln}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 2 }}>{t("Total Gross (at sale)","全部出售毛額")}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink }}>${(grossSaleTotal / 1000).toFixed(0)}K</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 2 }}>{t("Total Income Tax","所得稅合計")}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.copper }}>-${(totalIt / 1000).toFixed(0)}K</div>
                </div>
                {totalCgt > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: D.tx4, marginBottom: 2 }}>CGT</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.clay }}>-${(totalCgt / 1000).toFixed(0)}K</div>
                  </div>
                )}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 2 }}>{t("Total Net Proceeds","稅後合計到手")}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.sage }}>${(totalNet / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 11, color: D.tx4 }}>{Math.round(totalNet / grossSaleTotal * 100)}% {t("retained","實際保留")}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* ── COUNTRY TAX TREATMENT ─────────────────── */}
      <Card glow>
        <div style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
            {t("ALL COUNTRIES — DUAL-LAYER TAX SUMMARY", "各國雙層稅務一覽")}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 10, marginTop: 14 }}>
            {Object.entries(TOKEN_TAX).map(([id, info]) => {
              const c = COUNTRIES.find(c => c.id === id);
              const { netProceeds } = calcDualTax(grant, saleMult, info);
              const grossSale = grant * saleMult;
              return (
                <div key={id} onClick={() => setSelCountry(id)} style={{
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                  background: selCountry === id ? D.slate + "0a" : D.lnF,
                  border: `1px solid ${selCountry === id ? D.slate + "30" : D.ln}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{c?.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
                        {t(c?.n, c?.zh)}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                        <span style={{ color: D.copper }}>{Math.round(info.income * 100)}%</span>
                        <span style={{ color: D.tx4 }}> income</span>
                        {" + "}
                        <span style={{ color: info.cgt > 0 ? D.clay : D.sage }}>{Math.round(info.cgt * 100)}%</span>
                        <span style={{ color: D.tx4 }}> CGT</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.sage }}>
                        ${(netProceeds / 1000).toFixed(0)}K {t("net","淨")}
                      </div>
                      <div style={{ fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                        {Math.round(netProceeds / grossSale * 100)}% {t("retained","保留")}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: D.tx3, lineHeight: 1.55 }}>
                    {lang === "zh" ? info.zh : info.en}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: D.wine + "09", borderRadius: 6, fontSize: 11, color: D.tx3, lineHeight: 1.5 }}>
            ⚠️ {t("Illustrative only. Token/equity tax treatment varies by jurisdiction, grant type, holding period, and individual circumstances. Always consult a qualified tax advisor.", "僅供參考。代幣/股權稅務處理因司法管轄區、授予類型、持有期間和個人情況差異極大。請務必諮詢合格稅務顧問。")}
          </div>
        </div>
      </Card>
    </div>
  );
}
