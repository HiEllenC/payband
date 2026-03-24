import { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import { COUNTRIES } from "../data/countries.js";

const D = {
  tx: "#1c1c1f", tx2: "#4a4a52", tx3: "#7d7d88", tx4: "#a8a8b4",
  lnF: "rgba(0,0,0,0.03)", ln: "rgba(0,0,0,0.06)",
  ink: "#2d3142", slate: "#546378", sage: "#5f7a61", copper: "#96714a",
  clay: "#a06b52", wine: "#8a5565", surface: "#faf9f7",
};

// Country tax treatment for token/equity vesting
const TOKEN_TAX = {
  us: { rate: 0.37, zh: "RSU 歸屬時按普通收入課稅（聯邦最高 37%＋州稅約 5.5%）。歸屬後增值按資本利得（0/15/20%）。", en: "RSU taxed as ordinary income at vest (federal up to 37% + ~5.5% state). Post-vest appreciation taxed as capital gains." },
  gb: { rate: 0.28, zh: "EMI 期權：CGT 10–20%。非核准期權：行使時 PAYE 扣薪稅（最高 45%）。年度 CGT 免稅額 £3,000。", en: "EMI options: CGT 10–20%. Unapproved options: PAYE at exercise (up to 45%). Annual CGT allowance £3,000." },
  ch: { rate: 0.31, zh: "歸屬時按市值課稅，員工社保 AHV/IV 約 6.3%。各州稅率不同，有效稅率約 28–35%。", en: "Taxed at fair market value on vest. Employee social security AHV/IV ~6.3%. Cantons vary, effective ~28–35%." },
  mt: { rate: 0.35, zh: "股權：歸屬時所得稅（最高 35%）＋社保。加密代幣：無明確規範，通常按薪資收入處理。", en: "Equity: income tax up to 35% + social security at vest. Crypto tokens: no specific framework, likely treated as income." },
  ae: { rate: 0.00, zh: "無個人所得稅，無資本利得稅。外籍員工無強制社保。代幣歸屬最有利的司法管轄區。", en: "No personal income tax. No CGT. No mandatory social security for expats. Most favorable jurisdiction for token vesting." },
  sg: { rate: 0.22, zh: "ESOP 在行使時課稅（薪資所得）。無資本利得稅。外籍員工 CPF 不適用。最高稅率 24%。", en: "ESOP taxed at exercise as employment income. No CGT. CPF not applicable for foreigners. Max rate 24%." },
  hk: { rate: 0.15, zh: "股票期權在行使時課稅（薪俸稅，上限 15%）。無資本利得稅。外籍員工 MPF 貢獻 5%（上限）。", en: "Share options taxed at exercise under Salaries Tax (capped at 15%). No CGT. MPF contribution 5% for employees (capped)." },
  jp: { rate: 0.45, zh: "股票期權：行使時按薪資所得課稅。加密貨幣：雜項收入，有效稅率 15–55%。CGT 20.315%。", en: "Stock options: employment income at exercise. Crypto: miscellaneous income, effective 15–55%. CGT 20.315%." },
  kr: { rate: 0.40, zh: "RSU：歸屬時按薪資所得課稅。CGT：大股東 22–25%。加密貨幣收益：超過門檻 20%（2025 起正式課稅）。", en: "RSU: income at vest. CGT: 22–25% for large shareholders. Crypto gains: 20% above threshold (formally taxed from 2025)." },
  tw: { rate: 0.30, zh: "員工認股：行使差額為薪資所得（5–40%）。合格新創期權有優惠稅率。無獨立 CGT，計入綜所稅。", en: "Employee stock: spread at exercise is employment income (5–40%). Qualifying startup options have preferential rates. No separate CGT." },
  ph: { rate: 0.35, zh: "RSU/期權：歸屬/行使時按普通收入課稅（最高 35%）。股份 CGT 15%。無正式加密貨幣稅務框架。", en: "RSU/options: ordinary income at vesting/exercise (up to 35%). Shares CGT 15%. No formal crypto tax framework." },
  my: { rate: 0.30, zh: "ESOS：行使價值超過參考價部分為薪資所得。無資本利得稅。加密貨幣：無正式指引，可能按收入課稅。", en: "ESOS: excess of exercise value over reference price is employment income. No CGT. Crypto: no formal guidance, likely income." },
};

function calcVesting(grant, cliffYrs, totalYrs) {
  // All amounts in USD. Returns array of { yr, vested, cumulative }
  const perYear = grant / totalYrs;
  const result = [];
  let cumulative = 0;

  for (let yr = 1; yr <= totalYrs; yr++) {
    let vested = 0;
    if (cliffYrs > 0 && yr < cliffYrs) {
      vested = 0;
    } else if (cliffYrs > 0 && yr === cliffYrs) {
      vested = perYear * cliffYrs; // all accumulated at cliff
    } else {
      vested = perYear;
    }
    cumulative += vested;
    result.push({ yr, vested, cumulative });
  }
  return result;
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

  const vestData = useMemo(() =>
    calcVesting(grant, cliffYrs, totalYrs),
    [grant, cliffYrs, totalYrs]
  );

  const scenarios = [
    { label: "-50%", mult: 0.5,  color: D.clay },
    { label: t("Base", "基準"),   mult: 1.0,  color: D.slate },
    { label: "+50%", mult: 1.5,  color: D.sage },
    { label: `${priceChg >= 0 ? "+" : ""}${priceChg}%`, mult: 1 + priceChg / 100, color: D.copper },
  ];

  const maxVested = Math.max(...vestData.map(d => d.vested), 1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Token / Equity Vesting Simulator", "代幣 / 股權歸屬模擬器")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Set grant amount, cliff, and vesting schedule — see year-by-year payout under 3 price scenarios, plus each country's tax treatment", "設定授予金額、懸崖期與歸屬頻率，查看3種價格情境下的逐年到手金額，以及各國稅務處理方式")}
        </p>
      </div>

      {/* Concept guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { icon: "⛰️", title: t("Cliff","懸崖期（Cliff）"),       desc: t("Employee receives NOTHING until cliff date. 1yr cliff = zero payout if they leave before 12 months.","懸崖期內離職＝0。1年懸崖=滿12個月前離職一毛不拿，到達後才一次補發。") },
          { icon: "📅", title: t("Vesting Frequency","歸屬頻率"),   desc: t("After cliff: how often tokens unlock. Quarterly = every 3 months. Monthly = smoother cashflow.","懸崖後每隔多久釋放一批：每月最平滑，每季最常見（加密交易所標準結構）。") },
          { icon: "💸", title: t("Price Scenarios","價格情境"),      desc: t("Token grant is denominated in units × price. -50% scenario = tokens worth half. Plan for volatility.","代幣授予以數量×價格計算。-50%情境測試最壞情況，+50%展示留才吸引力。") },
          { icon: "🌍", title: t("Tax Impact","各國稅務影響"),       desc: t("UAE: 0% tax = full value. Japan: up to 55% = highest burden. Jurisdiction matters as much as grant size.","阿聯酋0%稅，全拿；日本最高55%，差距極大。選對國家就是最好的薪酬設計。") },
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
                {t("Custom Price Change", "自訂價格變動")}：
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
            <div key={d.yr} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 4, fontFamily: "'DM Mono',monospace" }}>
                {t("Year","第")}{d.yr}{lang === "zh" ? "年" : ""}
                {cliffYrs > 0 && d.yr === cliffYrs && (
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
                <tr key={d.yr} style={{ borderTop: `1px solid ${D.lnF}` }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: D.tx, fontFamily: "'DM Mono',monospace" }}>
                    {t("Year","第")}{d.yr}{lang === "zh" ? "年" : ""}
                    {cliffYrs > 0 && d.yr === cliffYrs && (
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

      {/* ── COUNTRY TAX TREATMENT ─────────────────── */}
      <Card glow>
        <div style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
            {t("COUNTRY TAX TREATMENT", "各國稅務處理")}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 10, marginTop: 14 }}>
            {Object.entries(TOKEN_TAX).map(([id, info]) => {
              const c = COUNTRIES.find(c => c.id === id);
              const afterTax = grant * (1 - info.rate);
              return (
                <div key={id} style={{ padding: "12px 14px", borderRadius: 8, background: D.lnF, border: `1px solid ${D.ln}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{c?.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
                        {t(c?.n, c?.zh)}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: info.rate === 0 ? D.sage : D.clay }}>
                        {info.rate === 0 ? t("Tax Free","免稅") : `~${Math.round(info.rate * 100)}%`}
                      </div>
                      <div style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
                        {t("After-tax","稅後")} ≈${(afterTax / 1000).toFixed(0)}K
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
            ⚠️ {t("Illustrative only. Token/equity tax treatment varies significantly by jurisdiction, grant type, and individual circumstances. Always consult a qualified tax advisor before making compensation decisions.", "僅供參考。代幣/股權稅務處理因司法管轄區、授予類型和個人情況差異極大。做出薪酬決策前，請務必諮詢合格稅務顧問。")}
          </div>
        </div>
      </Card>
    </div>
  );
}
