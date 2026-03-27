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

// ── Tax bracket helper ──────────────────────────────────────────────────────
function calcBrackets(income, brackets) {
  let tax = 0;
  for (const [lo, hi, rate] of brackets) {
    if (income <= lo) break;
    const upper = hi === Infinity ? income : Math.min(income, hi);
    tax += (upper - lo) * rate;
  }
  return tax;
}

// ── Simplified but defensible tax models (annual, USD basis) ───────────────
function calcNet(cid, gross) {
  let income = 0;
  let social = 0;

  switch (cid) {
    case "us": {
      // Federal 2024 single filer + avg state ~5.5%
      income = calcBrackets(gross, [
        [0, 11600, 0.10], [11600, 47150, 0.12], [47150, 100525, 0.22],
        [100525, 191950, 0.24], [191950, 243725, 0.32],
        [243725, 609350, 0.35], [609350, Infinity, 0.37],
      ]) + gross * 0.055;
      // SS 6.2% up to $168,600 + Medicare 1.45% + 0.9% above $200K
      social = Math.min(gross, 168600) * 0.062 + gross * 0.0145
             + Math.max(gross - 200000, 0) * 0.009;
      break;
    }
    case "gb": {
      // UK 2024/25, personal allowance £12,570 ≈ $15,800
      const pa = 15800;
      const taxable = Math.max(gross - pa, 0);
      income = calcBrackets(taxable, [
        [0, 37700, 0.20], [37700, 125140, 0.40], [125140, Infinity, 0.45],
      ]);
      // NI: 0-PA: 0%, PA-£50K: 12%, £50K+: 2%
      const ni50 = 62600;
      social = Math.max(Math.min(gross, ni50) - pa, 0) * 0.12
             + Math.max(gross - ni50, 0) * 0.02;
      break;
    }
    case "ch": {
      // Switzerland (Zurich basis, includes federal + cantonal + communal)
      income = calcBrackets(gross, [
        [0, 17000, 0.00], [17000, 31000, 0.04], [31000, 41000, 0.08],
        [41000, 55000, 0.14], [55000, 72000, 0.20], [72000, 127000, 0.28],
        [127000, 170000, 0.33], [170000, Infinity, 0.37],
      ]);
      social = gross * 0.063; // AHV/IV/EO employee ~6.3%
      break;
    }
    case "mt": {
      income = calcBrackets(gross, [
        [0, 9100, 0.00], [9100, 14500, 0.15],
        [14500, 19500, 0.25], [19500, Infinity, 0.35],
      ]);
      social = Math.min(gross, 22700) * 0.10; // SSC 10% capped
      break;
    }
    case "ae": {
      income = 0; // No personal income tax
      social = 0; // No mandatory social security for expats
      break;
    }
    case "sg": {
      income = calcBrackets(gross, [
        [0, 20000, 0.00], [20000, 30000, 0.02], [30000, 40000, 0.035],
        [40000, 80000, 0.07], [80000, 120000, 0.115],
        [120000, 160000, 0.15], [160000, 200000, 0.18],
        [200000, 240000, 0.19], [240000, 280000, 0.195],
        [280000, 320000, 0.20], [320000, 500000, 0.22],
        [500000, 1000000, 0.23], [1000000, Infinity, 0.24],
      ]);
      // CPF: OW ceiling SGD 7,400/mo; AW ceiling SGD 102,000/yr (~USD 75,500 at 1.35)
      // Employee rate 20% (age ≤55). Cap at USD 75,500 to reflect annual wage ceiling.
      social = Math.min(gross, 75500) * 0.20;
      break;
    }
    case "hk": {
      // HK: progressive vs 15% standard charge — take lower
      const pa = 17000; // personal allowance ≈ HKD 132K = ~USD 17K
      const taxable = Math.max(gross - pa, 0);
      const progressive = calcBrackets(taxable, [
        [0, 52000, 0.02], [52000, 104000, 0.06],
        [104000, 156000, 0.10], [156000, Infinity, 0.14],
      ]);
      income = Math.min(progressive, gross * 0.15);
      // MPF: 5% employee; relevant income ceiling HKD 30,000/mo = HKD 360,000/yr ≈ USD 46,000
      // Max annual contribution ≈ USD 2,300
      social = Math.min(gross, 46000) * 0.05;
      break;
    }
    case "jp": {
      // National + 10% local inhabitant tax
      const national = calcBrackets(gross, [
        [0, 16500, 0.05], [16500, 33000, 0.10], [33000, 88000, 0.20],
        [88000, 177500, 0.23], [177500, 209000, 0.33],
        [209000, 418000, 0.40], [418000, Infinity, 0.45],
      ]);
      income = national + gross * 0.10;
      social = gross * 0.145; // pension 9.15% + health 4.99% + employment 0.6%
      break;
    }
    case "kr": {
      // National + 10% local surtax
      const national = calcBrackets(gross, [
        [0, 14000, 0.06], [14000, 50000, 0.15], [50000, 88000, 0.24],
        [88000, 150000, 0.35], [150000, 300000, 0.38],
        [300000, 500000, 0.40], [500000, Infinity, 0.42],
      ]);
      income = national * 1.10;
      social = gross * 0.09; // NPS 4.5% + health ~3.5% + employment ~0.9% + LTCI ~0.45%
      break;
    }
    case "tw": {
      // TWD deductions: standard TWD 124K + salary special TWD 207K + exemption TWD 92K = ~TWD 423K ≈ USD 14,000
      const taxable = Math.max(gross - 14000, 0);
      income = calcBrackets(taxable, [
        [0, 19000, 0.05], [19000, 54000, 0.12], [54000, 109000, 0.20],
        [109000, 205000, 0.30], [205000, Infinity, 0.40],
      ]);
      social = gross * 0.0676; // labor ins 1.59% + health ~5.17% (pension 6% is employer contribution, not EE)
      break;
    }
    case "ph": {
      income = calcBrackets(gross, [
        [0, 16800, 0.00], [16800, 26600, 0.15], [26600, 53300, 0.20],
        [53300, 133300, 0.25], [133300, 266600, 0.30],
        [266600, Infinity, 0.35],
      ]);
      // SSS capped, PhilHealth 5%, Pag-IBIG capped
      social = Math.min(gross, 36000) * 0.045
             + Math.min(gross, 130000) * 0.04
             + Math.min(gross, 4000) * 0.02;
      break;
    }
    case "my": {
      income = calcBrackets(gross, [
        [0, 5400, 0.00], [5400, 8000, 0.01], [8000, 13000, 0.03],
        [13000, 21300, 0.08], [21300, 35000, 0.135],
        [35000, 70000, 0.21], [70000, 108000, 0.24],
        [108000, 250000, 0.245], [250000, 400000, 0.25],
        [400000, 600000, 0.26], [600000, Infinity, 0.28],
      ]);
      social = Math.min(gross, 60000) * 0.11 + gross * 0.005; // EPF 11% + SOCSO ~0.5%
      break;
    }
    default: break;
  }

  const total = income + social;
  const net = Math.max(gross - total, 0);
  return {
    income_tax: Math.round(income),
    social: Math.round(social),
    net: Math.round(net),
    eff: gross > 0 ? total / gross : 0,
  };
}

const PRESET_GROSS = [60000, 100000, 150000, 200000, 300000];

const Btn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 4,
    border: `1px solid ${active ? D.slate : D.ln}`,
    background: active ? D.slate + "14" : "transparent",
    color: active ? D.slate : D.tx3,
    fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono','Noto Sans TC',monospace",
  }}>
    {children}
  </button>
);

export default function GrossToNet({ lang, t }) {
  const [gross, setGross]     = useState(100000);
  const [period, setPeriod]   = useState("annual"); // "annual" | "monthly"
  const [sortBy, setSortBy]   = useState("net");    // "net" | "eff" | "country"

  const results = useMemo(() => {
    return COUNTRIES.map(c => {
      const r = calcNet(c.id, gross);
      return { c, ...r };
    }).sort((a, b) => {
      if (sortBy === "net")     return b.net - a.net;
      if (sortBy === "eff")     return a.eff - b.eff;
      if (sortBy === "country") return (a.c.n || "").localeCompare(b.c.n || "");
      return 0;
    });
  }, [gross, sortBy]);

  const div = period === "monthly" ? 12 : 1;
  const maxNet = Math.max(...results.map(r => r.net), 1);

  const fmtAmt = v => {
    const n = v / div;
    return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Take-Home Pay Calculator", "到手薪資試算")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Enter annual gross salary → see exactly how much the employee pockets after income tax and social security in all 12 countries", "輸入年度毛薪，即時看到12國員工扣除所得稅與社會保險後的實際到手金額比較")}
        </p>
      </div>

      {/* How to use */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { icon: "💡", title: t("Use case","使用情境"), desc: t("C&B question: '$100K gross in Singapore vs Japan — who takes home more?'","C&B常見問題：同樣$100K毛薪，新加坡員工比日本員工多拿多少？") },
          { icon: "📊", title: t("What's included","計算項目"), desc: t("Income tax (progressive brackets) + employee social security. Employer costs are excluded.","所得稅（累進稅率）＋員工社保。不含雇主端社保成本。") },
          { icon: "🇦🇪", title: t("Best take-home","最高到手"), desc: t("UAE: 0% income tax + no social for expats → 100% of gross. AE, HK, SG consistently top.","阿聯酋：0%所得稅＋外籍免社保→毛薪全到手。AE、HK、SG長期領先。") },
          { icon: "🇯🇵", title: t("Highest tax burden","稅負最重"), desc: t("Japan: 33% national+local income tax + 14.5% social = ~48% deducted at high salaries.","日本：所得稅33%＋地方稅10%＋社保14.5%，高薪段有效扣除率近50%。") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── CONTROLS ───────────────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Annual Gross Salary (USD)", "年度毛薪（USD）")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PRESET_GROSS.map(v => (
                  <Btn key={v} active={gross === v} onClick={() => setGross(v)}>${v / 1000}K</Btn>
                ))}
                <input
                  type="number" value={gross} min={0} max={2000000}
                  onChange={e => setGross(Number(e.target.value))}
                  style={{ width: 110, padding: "5px 8px", borderRadius: 4, border: `1px solid ${D.ln}`, background: "transparent", color: D.tx, fontSize: 12, fontFamily: "'DM Mono',monospace" }}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <input
                  type="range" min={20000} max={500000} step={5000} value={gross}
                  onChange={e => setGross(Number(e.target.value))}
                  style={{ width: 320, accentColor: D.slate }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Display Period", "顯示週期")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn active={period === "annual"}  onClick={() => setPeriod("annual")}>{t("Annual","年薪")}</Btn>
                <Btn active={period === "monthly"} onClick={() => setPeriod("monthly")}>{t("Monthly","月薪")}</Btn>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: D.tx3, marginBottom: 6 }}>{t("Sort By", "排序")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn active={sortBy === "net"}     onClick={() => setSortBy("net")}>{t("Net Pay","淨薪")}</Btn>
                <Btn active={sortBy === "eff"}     onClick={() => setSortBy("eff")}>{t("Tax Burden","稅負")}</Btn>
                <Btn active={sortBy === "country"} onClick={() => setSortBy("country")}>{t("Country","國家")}</Btn>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── PLAIN-LANGUAGE INTRO ───────────────────────── */}
      <div style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(84,99,120,0.05)", border: "1px solid rgba(84,99,120,0.12)", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: D.slate, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 4 }}>
          {t("What this shows", "這個圖表告訴你什麼")}
        </div>
        <div style={{ fontSize: 13, color: D.tx2, lineHeight: 1.7 }}>
          {t(
            "Enter an annual salary and see how much employees actually take home after income tax and social security in each country. Same gross pay — very different real purchasing power.",
            "輸入年薪，看看同樣的錢在不同國家員工實際能拿到多少。相同的毛薪——在不同地點的實質購買力差距可能超乎預期。"
          )}
        </div>
      </div>

      {/* ── BAR CHART ──────────────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
              {t("NET PAY COMPARISON", "稅後薪資比較")}
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { color: D.sage,   label: t("Net Pay","淨薪") },
                { color: D.copper, label: t("Income Tax","所得稅") },
                { color: D.clay,   label: t("Social","社保") },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: D.tx3 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {results.map((r) => (
            <div key={r.c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, fontSize: 18, textAlign: "center" }}>{r.c.flag}</div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(r.c.n, r.c.zh)}</div>
                <div style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>{Math.round(r.eff * 100)}% {t("deducted","扣除")}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", height: 28, borderRadius: 5, overflow: "hidden", width: `${Math.max((r.net / maxNet) * 100, 4)}%`, transition: "width 0.5s cubic-bezier(.22,1,.36,1)" }}>
                  {/* Net */}
                  <div style={{ flex: r.net, background: D.sage, opacity: 0.45, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>
                      {fmtAmt(r.net)}
                    </span>
                  </div>
                  {/* Income tax segment on top of bar — shown as overlay */}
                </div>
                {/* Deduction bar below */}
                <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 2, width: `${Math.max((r.net / maxNet) * 100, 4)}%` }}>
                  <div style={{ flex: r.income_tax, background: D.copper, opacity: 0.55 }} />
                  <div style={{ flex: r.social, background: D.clay, opacity: 0.55 }} />
                </div>
              </div>
              <div style={{ width: 90, textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.sage }}>{fmtAmt(r.net)}</div>
                <div style={{ fontSize: 10, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>-{fmtAmt(r.income_tax + r.social)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── KEY INSIGHTS CARD ──────────────────────── */}
      {(() => {
        const byNet     = [...results].sort((a, b) => b.net - a.net);
        const byEff     = [...results].sort((a, b) => a.eff - b.eff);
        const topNet    = byNet[0];
        const topNetPct = gross > 0 ? Math.round(topNet.net / gross * 100) : 0;
        const top3Low   = byEff.slice(0, 3);
        const maxNet2   = byNet[0].net;
        const minNet    = byNet[byNet.length - 1].net;
        const diffNet   = maxNet2 - minNet;
        const grossK    = Math.round(gross / 1000);
        return (
          <Card glow style={{ marginBottom: 14, border: "1px solid rgba(5,150,105,0.18)", background: "rgba(5,150,105,0.03)" }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, color: D.sage, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 14 }}>
                🔍 {t("Key Insights", "重點發現")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)", fontSize: 13, color: D.tx2 }}>
                  🏆 {t(
                    `Best take-home: ${topNet.c.flag} ${t(topNet.c.n, topNet.c.zh)} — on $${grossK}K gross, employee keeps $${Math.round(topNet.net / 1000)}K (${topNetPct}% retention rate)`,
                    `最高到手：${topNet.c.flag} ${t(topNet.c.n, topNet.c.zh)} — 同樣 $${grossK}K 毛薪，到手 $${Math.round(topNet.net / 1000)}K（${topNetPct}% 保留率）`
                  )}
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", fontSize: 13, color: D.tx2 }}>
                  📉 {t("Lowest tax burden — Top 3:", "最低稅負 — 前三名：")}
                  {" "}
                  {top3Low.map((r, i) => (
                    <span key={r.c.id}>
                      {r.c.flag} <strong>{t(r.c.n, r.c.zh)}</strong> ({Math.round(r.eff * 100)}%){i < 2 ? "、" : ""}
                    </span>
                  ))}
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.12)", fontSize: 13, color: D.tx2 }}>
                  ⚡ {t(
                    `Largest take-home gap: $${Math.round(diffNet / 1000)}K difference between best and worst — employee experience of "the same offer" varies dramatically by location.`,
                    `最高與最低到手差距：$${Math.round(diffNet / 1000)}K — 同一份 offer 在不同地點員工的實質感受差異極大，薪酬設計時需考量員工體感。`
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* ── DETAILED TABLE ─────────────────────────── */}
      <Card glow>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  t("Country","國家"),
                  t("Gross","毛薪"),
                  t("Income Tax","所得稅"),
                  t("Social Security","社保"),
                  t("Total Deducted","總扣除"),
                  t("Net Pay","淨薪"),
                  t("Eff. Rate","有效稅率"),
                  t("Net/Gross","淨/毛"),
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: "12px " + (i === 0 ? "16px" : "12px"),
                    textAlign: i === 0 ? "left" : "center",
                    borderBottom: `2px solid ${D.ln}`,
                    fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, ri) => {
                const total_ded = r.income_tax + r.social;
                const keepPct = gross > 0 ? Math.round(r.net / gross * 100) : 0;
                return (
                  <tr key={r.c.id} style={{ borderTop: `1px solid ${D.lnF}`, background: ri % 2 ? D.slate + "02" : "transparent" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{r.c.flag}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(r.c.n, r.c.zh)}</div>
                          <div style={{ fontSize: 11, color: D.tx4 }}>{r.c.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: D.tx2 }}>{fmtAmt(gross)}</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.copper }}>{fmtAmt(r.income_tax)}</span>
                      <div style={{ fontSize: 10, color: D.tx4 }}>{gross > 0 ? Math.round(r.income_tax / gross * 100) : 0}%</div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.clay }}>{fmtAmt(r.social)}</span>
                      <div style={{ fontSize: 10, color: D.tx4 }}>{gross > 0 ? Math.round(r.social / gross * 100) : 0}%</div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: D.tx2 }}>{fmtAmt(total_ded)}</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.sage }}>{fmtAmt(r.net)}</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: r.eff <= 0.20 ? D.sage : r.eff > 0.35 ? D.clay : D.copper }}
                        title={r.eff <= 0.20 ? t("Low burden ≤20%","低稅負 ≤20%") : r.eff > 0.35 ? t("High burden >35%","高稅負 >35%") : t("Moderate burden 20–35%","中等稅負 20–35%")}
                      >
                        {Math.round(r.eff * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", borderLeft: `1px solid ${D.lnF}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ flex: 1, height: 6, background: D.lnF, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: keepPct + "%", height: "100%", background: D.sage, opacity: 0.5, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: D.sage, width: 32 }}>{keepPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${D.lnF}`, fontSize: 11, color: D.tx4, lineHeight: 1.5 }}>
          ⚠️ {t("Simplified models using 2024 rates. Does not include all deductions, credits, or surcharges. UAE has 0% income tax with no social security for foreign employees. Consult a tax professional for actual payroll planning.",
               "基於 2024 年稅率的簡化模型，未包含所有扣除額、抵稅額或附加稅。阿聯酋外籍員工享有0%所得稅且無社保。實際薪資規劃請諮詢稅務專業人士。")}
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${D.lnF}`, fontSize: 12, color: D.sage, lineHeight: 1.6, background: "rgba(5,150,105,0.04)" }}>
          💡 {t(
            "Design tip: For high-salary roles ($150K+), after-tax experience in AE / HK / SG far exceeds Europe and Japan. This is a key retention advantage for crypto companies hiring global talent.",
            "設計建議：對高薪職位（$150K+），AE/HK/SG 的稅後感受遠超歐日，是加密公司吸引並留住國際人才的重要工具。"
          )}
        </div>
      </Card>
    </div>
  );
}
