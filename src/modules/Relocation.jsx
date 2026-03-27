import { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import { COUNTRIES } from "../data/countries.js";
import { TC } from "../data/totalcomp.js";
import { gS } from "../utils/salary.js";
import { FAMS } from "../data/jobs.js";

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

// Rough effective total-deduction rates (income tax + employee social) at mid-level salaries
const EFF_RATE = {
  us: 0.36, gb: 0.34, ch: 0.32, mt: 0.27, ae: 0.00,
  sg: 0.28, hk: 0.17, jp: 0.40, kr: 0.35, tw: 0.22, ph: 0.30, my: 0.22,
};

// Employer social security rate
const ER_RATE = {
  us: 0.0765, gb: 0.138, ch: 0.13, mt: 0.10, ae: 0.125,
  sg: 0.17, hk: 0.05, jp: 0.145, kr: 0.10, tw: 0.18, ph: 0.095, my: 0.15,
};

// Cost of Living index (NYC = 100)
const COL = {
  us: 100, gb: 88, ch: 115, mt: 62, ae: 82,
  sg: 94, hk: 97, jp: 78, kr: 74, tw: 58, ph: 38, my: 44,
};

// Work permit / visa estimates
const VISA = {
  us: { name: "H-1B / O-1", cost: 5000, wks: "26–52", quota: true, zh: "H-1B / O-1" },
  gb: { name: "Skilled Worker Visa", cost: 1800, wks: "3–8", quota: false, zh: "技術工作者簽證" },
  ch: { name: "Work Permit B/L", cost: 800, wks: "4–8", quota: true, zh: "B/L 工作許可" },
  mt: { name: "Single Permit", cost: 350, wks: "4–12", quota: false, zh: "單一許可證" },
  ae: { name: "Employment Visa", cost: 1400, wks: "2–4", quota: false, zh: "就業簽證" },
  sg: { name: "Employment Pass", cost: 250, wks: "3–8", quota: false, zh: "就業準證" },
  hk: { name: "Employment Visa", cost: 290, wks: "4–8", quota: false, zh: "就業簽證" },
  jp: { name: "Engineer / HSP Visa", cost: 600, wks: "4–12", quota: false, zh: "技術/高度人才簽證" },
  kr: { name: "E-7 Work Visa", cost: 450, wks: "4–8", quota: false, zh: "E-7 工作簽證" },
  tw: { name: "Work Permit + ARC", cost: 220, wks: "2–6", quota: false, zh: "工作許可 + 居留證" },
  ph: { name: "AEP / 9(g) Visa", cost: 700, wks: "4–8", quota: false, zh: "外籍員工許可 / 工作簽" },
  my: { name: "Employment Pass (Cat II)", cost: 650, wks: "4–8", quota: false, zh: "就業準證（第二類）" },
};

// Relocation package estimates (USD) — one-time cost
function relocCost(fromId, toId, salary) {
  // Base: 1 month salary + flat logistics
  const base = salary * 0.08;
  const highColDest = ["us", "sg", "hk", "ch"].includes(toId);
  const intercontinental = (fromId !== toId) && (
    (["us", "gb", "ch", "mt"].includes(fromId) && ["sg", "hk", "jp", "kr", "tw", "ph", "my", "ae"].includes(toId)) ||
    (["sg", "hk", "jp", "kr", "tw", "ph", "my", "ae"].includes(fromId) && ["us", "gb", "ch", "mt"].includes(toId))
  );
  let flat = intercontinental ? 12000 : 6000;
  if (highColDest) flat += 4000;
  return Math.round(base + flat);
}

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

const Delta = ({ value, prefix = "$", suffix = "K", positiveGood = true }) => {
  if (value === 0) return <span style={{ fontSize: 13, color: D.tx4 }}>—</span>;
  const pos = value > 0;
  const color = positiveGood ? (pos ? D.sage : D.clay) : (pos ? D.clay : D.sage);
  return (
    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", color }}>
      {pos ? "+" : ""}{prefix}{Math.abs(Math.round(value * 10) / 10)}{suffix}
    </span>
  );
};

const TRACKS = [
  { id: "ic", zh: "IC", en: "IC" },
  { id: "mgmt", zh: "管理", en: "Mgmt" },
];
const LEVELS = [1, 2, 3, 4, 5];

export default function Relocation({ lang, t }) {
  const [fromId, setFromId] = useState("tw");
  const [toId,   setToId]   = useState("sg");
  const [selFam, setSelFam] = useState("eng");
  const [selSub, setSelSub] = useState("be");
  const [track,  setTrack]  = useState("ic");
  const [selLvl, setSelLvl] = useState(3);
  const [showAll, setShowAll] = useState(false);

  const fromC = COUNTRIES.find(c => c.id === fromId);
  const toC   = COUNTRIES.find(c => c.id === toId);
  const tc_to = TC[toId] || {};

  const fromSal = gS(fromId, selFam, selSub, track, selLvl - 1); // K (selLvl is 1-based display)
  const toSal   = gS(toId,   selFam, selSub, track, selLvl - 1); // K

  const fromGross   = fromSal * 1000;
  const toGross     = toSal   * 1000;
  const fromNet     = fromGross * (1 - (EFF_RATE[fromId] || 0));
  const toNet       = toGross   * (1 - (EFF_RATE[toId]   || 0));

  const fromErCost  = fromGross * (ER_RATE[fromId] || 0);
  const toErCost    = toGross   * (ER_RATE[toId]   || 0);
  const fromTotal   = fromGross + fromErCost;
  const toTotal     = toGross   + toErCost;

  const fromTC      = fromGross * (1 + (TC[fromId]?.bonus || 0) / 100 + (TC[fromId]?.token || 0) / 100 + (ER_RATE[fromId] || 0) + (TC[fromId]?.allow || 0) / 100);
  const toTC        = toGross   * (1 + (tc_to.bonus || 0) / 100 + (tc_to.token || 0) / 100 + (ER_RATE[toId] || 0) + (tc_to.allow || 0) / 100);

  const fromColAdj  = fromNet   / (COL[fromId] || 100) * 100;
  const toColAdj    = toNet     / (COL[toId]   || 100) * 100;

  const visa    = VISA[toId] || {};
  const reloc   = relocCost(fromId, toId, toGross);

  const fmt = v => v >= 1000000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v / 1000)}K`;

  // Swap countries
  const swap = () => { setFromId(toId); setToId(fromId); };

  // Change subfunction when family changes
  const handleFamChange = fid => {
    setSelFam(fid);
    const f = FAMS.find(f => f.id === fid);
    if (f) setSelSub(f.subs[0].id);
  };

  const allFams = FAMS;
  const subs = FAMS.find(f => f.id === selFam)?.subs || [];

  const rows = [
    { label: t("Base Salary","底薪"), from: fromSal * 1000, to: toSal * 1000, positiveGood: true },
    { label: t("Est. Income Tax","預估所得稅"), from: fromGross * (EFF_RATE[fromId] || 0) * 0.75, to: toGross * (EFF_RATE[toId] || 0) * 0.75, positiveGood: false },
    { label: t("Social Security (EE)","社保員工端"), from: fromGross * (ER_RATE[fromId] || 0) * 0.45, to: toGross * (ER_RATE[toId] || 0) * 0.45, positiveGood: false },
    { label: t("Est. Net Pay","預估稅後淨薪"), from: fromNet, to: toNet, positiveGood: true, bold: true },
    { label: t("ER Social Cost","雇主社保成本"), from: fromErCost, to: toErCost, positiveGood: false },
    { label: t("Total ER Cost","雇主總成本"), from: fromTotal, to: toTotal, positiveGood: false, bold: true },
    { label: t("Total Comp Pkg","總薪酬包"), from: fromTC, to: toTC, positiveGood: true, bold: true },
    { label: t("Net (COL-adjusted)","稅後（COL調整後）"), from: fromColAdj, to: toColAdj, positiveGood: true },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Cross-Border Relocation Planner", "跨境調派成本規劃")}
        </div>
        <p style={{ fontSize: 14, color: D.tx3, marginTop: 4 }}>
          {t("Select From → To country and role to compare salary, take-home pay, employer costs, visa requirements, and relocation expenses", "選擇起始國→目的國與職位，即時比對薪資差異、稅後到手、雇主總成本、簽證需求與搬遷費用")}
        </p>
      </div>

      {/* How to use */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { icon: "🎯", title: t("Use case","使用情境"),          desc: t("'We want to move a TW IC3 engineer to Singapore — what's the salary gap, visa cost, and first-year budget?'","「台灣IC3工程師調派新加坡，薪資差多少？簽證費多少？第一年預算要抓多少？」") },
          { icon: "📐", title: t("COL-Adjusted Net","COL調整後淨薪"), desc: t("Purchasing power comparison: $80K in Taipei ≈ $130K in Singapore in real living standard.","購買力比較：台北$80K的生活水準相當於新加坡$130K。COL指數以紐約=100為基準。") },
          { icon: "📋", title: t("Visa timeline","簽證時程提醒"),   desc: t("US H-1B has annual lottery (register April). SG EP min salary SGD $5,000/month. Plan 3–12 months ahead.","美國H-1B每年4月抽籤。新加坡EP最低月薪SGD 5,000。提前3-12個月規劃。") },
          { icon: "💰", title: t("First-year premium","第一年溢價"),   desc: t("Relocation adds a one-time cost (logistics + visa + settling-in). Amortise over 2–3 years in planning.","搬遷費為一次性成本（物流＋簽證＋安置），建議在規劃時攤提至2-3年計算。") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── SELECTORS ──────────────────────────────── */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>

            {/* From/To country */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>
                {t("ROUTE", "調派路線")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 4 }}>{t("From","從")}</div>
                  <select value={fromId} onChange={e => setFromId(e.target.value)} style={{
                    padding: "7px 10px", borderRadius: 6, border: `1px solid ${D.ln}`,
                    background: D.surface, color: D.tx, fontSize: 14,
                    fontFamily: "'DM Mono','Noto Sans TC',monospace", cursor: "pointer",
                  }}>
                    {COUNTRIES.map(c => (
                      <option key={c.id} value={c.id}>{c.flag} {t(c.n, c.zh)}</option>
                    ))}
                  </select>
                </div>
                <button onClick={swap} style={{
                  marginTop: 16, padding: "6px 10px", borderRadius: 6,
                  border: `1px solid ${D.ln}`, background: "transparent",
                  color: D.slate, cursor: "pointer", fontSize: 16,
                }}>⇄</button>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 4 }}>{t("To","至")}</div>
                  <select value={toId} onChange={e => setToId(e.target.value)} style={{
                    padding: "7px 10px", borderRadius: 6, border: `1px solid ${D.ln}`,
                    background: D.surface, color: D.tx, fontSize: 14,
                    fontFamily: "'DM Mono','Noto Sans TC',monospace", cursor: "pointer",
                  }}>
                    {COUNTRIES.map(c => (
                      <option key={c.id} value={c.id}>{c.flag} {t(c.n, c.zh)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Job selectors */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>
                {t("ROLE", "職位")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 3 }}>{t("Family","職能")}</div>
                  <select value={selFam} onChange={e => handleFamChange(e.target.value)} style={{
                    padding: "5px 8px", borderRadius: 5, border: `1px solid ${D.ln}`,
                    background: D.surface, color: D.tx, fontSize: 12,
                    fontFamily: "'DM Mono','Noto Sans TC',monospace",
                  }}>
                    {allFams.map(f => <option key={f.id} value={f.id}>{t(f.label, f.zh)}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 3 }}>{t("Sub-function","子職能")}</div>
                  <select value={selSub} onChange={e => setSelSub(e.target.value)} style={{
                    padding: "5px 8px", borderRadius: 5, border: `1px solid ${D.ln}`,
                    background: D.surface, color: D.tx, fontSize: 12,
                    fontFamily: "'DM Mono','Noto Sans TC',monospace",
                  }}>
                    {subs.map(s => <option key={s.id} value={s.id}>{t(s.l || s.id, s.zh || s.id)}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 3 }}>{t("Track","軌道")}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {TRACKS.map(tr => (
                      <Btn key={tr.id} active={track === tr.id} onClick={() => setTrack(tr.id)}>
                        {t(tr.en, tr.zh)}
                      </Btn>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: D.tx4, marginBottom: 3 }}>{t("Level","職等")}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {LEVELS.map(l => (
                      <Btn key={l} active={selLvl === l} onClick={() => setSelLvl(l)}>
                        {track === "ic" ? `IC${l}` : `M${l}`}
                      </Btn>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {fromId === toId && (
        <Card glow style={{ marginBottom: 14 }}>
          <div style={{ padding: "20px", textAlign: "center", color: D.tx3, fontSize: 14 }}>
            {t("Please select different From and To countries", "請選擇不同的起始國與目的國")}
          </div>
        </Card>
      )}

      {fromId !== toId && (
        <>
          {/* ── COMPARISON CARD ─────────────────────── */}
          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
                {t("COMPENSATION COMPARISON", "薪酬比較")}
              </span>

              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16, marginBottom: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{fromC?.flag}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: D.tx, marginTop: 4, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(fromC?.n, fromC?.zh)}</div>
                  <div style={{ fontSize: 11, color: D.tx4 }}>{t("Origin","起始地")}</div>
                </div>
                <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 28, color: D.slate }}>→</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{toC?.flag}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: D.tx, marginTop: 4, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(toC?.n, toC?.zh)}</div>
                  <div style={{ fontSize: 11, color: D.tx4 }}>{t("Destination","目的地")}</div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${D.ln}`, marginBottom: 8 }} />

              {rows.map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12, padding: "8px 0",
                  borderBottom: `1px solid ${D.lnF}`,
                  background: row.bold ? D.slate + "04" : "transparent",
                  borderRadius: row.bold ? 4 : 0,
                }}>
                  <div style={{ fontSize: 12, color: row.bold ? D.tx2 : D.tx3, fontWeight: row.bold ? 600 : 400, paddingLeft: 4, display: "flex", alignItems: "center", fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
                    {row.label}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? 700 : 500, fontFamily: "'DM Mono',monospace", color: D.tx2 }}>
                      {fmt(row.from)}
                    </span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? 700 : 500, fontFamily: "'DM Mono',monospace", color: D.tx2 }}>
                      {fmt(row.to)}
                    </span>
                    <span style={{ marginLeft: 8 }}>
                      <Delta value={(row.to - row.from) / 1000} suffix="K" positiveGood={row.positiveGood} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── TWO BOTTOM CARDS ────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

            {/* Visa & Work Permit */}
            <Card glow>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 12 }}>
                  {t("WORK PERMIT", "工作許可")} — {toC?.flag} {t(toC?.n, toC?.zh)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: D.ink, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 4 }}>
                  {lang === "zh" ? (visa.zh || visa.name) : visa.name}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: D.tx4 }}>{t("Est. Cost","預估費用")}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.copper }}>${visa.cost?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: D.tx4 }}>{t("Processing","處理時間")}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.slate }}>{visa.wks} {t("wks","週")}</div>
                  </div>
                  {visa.quota && (
                    <div>
                      <div style={{ fontSize: 11, color: D.tx4 }}>{t("Quota","配額")}</div>
                      <div style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: D.wine + "18", color: D.wine, marginTop: 2 }}>
                        {t("Yes — plan ahead","有配額限制，提前規劃")}
                      </div>
                    </div>
                  )}
                </div>
                {toId === "sg" && (
                  <div style={{ marginTop: 10, fontSize: 11, color: D.tx3, padding: "6px 10px", background: D.copper + "0a", borderRadius: 5 }}>
                    {t("Min. fixed monthly salary: SGD $5,000 (EP); $3,150 (S Pass)", "最低月薪要求：SGD $5,000（EP）；$3,150（S Pass）")}
                  </div>
                )}
                {toId === "us" && (
                  <div style={{ marginTop: 10, fontSize: 11, color: D.tx3, padding: "6px 10px", background: D.copper + "0a", borderRadius: 5 }}>
                    {t("H-1B lottery: April registration, Oct 1 start. O-1 for extraordinary talent (no quota).", "H-1B 抽籤：4月登記，10月1日生效。O-1為傑出人才（無配額）。")}
                  </div>
                )}
              </div>
            </Card>

            {/* Relocation package */}
            <Card glow>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 12 }}>
                  {t("RELOCATION PACKAGE ESTIMATE", "搬遷費用估算")}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink, marginBottom: 8 }}>
                  ${(reloc / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: 12, color: D.tx3, marginBottom: 12 }}>{t("One-time employer cost estimate","雇主一次性費用估算")}</div>
                {[
                  [t("Logistics & shipping","物流&運輸"), "$3,000–8,000"],
                  [t("Temporary accommodation (4–8wk)","臨時住宿（4–8週）"), "$2,000–6,000"],
                  [t("Flight & travel","機票&交通"), "$800–2,500"],
                  [t("Settling-in allowance","安置津貼"), `${fmt(toGross * 0.05)}–${fmt(toGross * 0.10)}`],
                  [t("Visa/permit filing","簽證/許可申請"), `$${(visa.cost || 0).toLocaleString()}`],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${D.lnF}`, fontSize: 12 }}>
                    <span style={{ color: D.tx3 }}>{label}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", color: D.tx2 }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 11, color: D.tx4 }}>
                  {t("Excludes tax equalisation, COLA, dependent education, or housing allowance ongoing costs.",
                     "不含稅務平衡、生活成本補貼、子女教育或持續性住房津貼。")}
                </div>
              </div>
            </Card>
          </div>

          {/* ── TOTAL FIRST-YEAR COST ───────────────── */}
          <Card glow>
            <div style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: D.tx3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
                {t("TOTAL FIRST-YEAR EMPLOYER COST", "第一年雇主總成本")}
              </span>
              <div style={{ display: "flex", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, padding: "14px 16px", background: D.lnF, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: D.tx3, marginBottom: 4 }}>{fromC?.flag} {t(fromC?.n, fromC?.zh)} ({t("current","現有")})</div>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink }}>
                    {fmt(fromTotal)}
                  </div>
                  <div style={{ fontSize: 12, color: D.tx3 }}>{t("Annual employer cost","年度雇主成本")}</div>
                </div>
                <div style={{ flex: 1, minWidth: 200, padding: "14px 16px", background: D.sage + "0c", borderRadius: 8, border: `1px solid ${D.sage}20` }}>
                  <div style={{ fontSize: 12, color: D.tx3, marginBottom: 4 }}>{toC?.flag} {t(toC?.n, toC?.zh)} ({t("first year","第一年")})</div>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink }}>
                    {fmt(toTotal + reloc + (visa.cost || 0))}
                  </div>
                  <div style={{ fontSize: 12, color: D.tx3 }}>{t("Base + ER social + relocation","底薪 + 雇主社保 + 搬遷")}</div>
                </div>
                <div style={{ flex: 1, minWidth: 200, padding: "14px 16px", background: D.copper + "0a", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: D.tx3, marginBottom: 4 }}>{t("First-year premium","第一年溢價")}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.copper }}>
                    +{fmt(toTotal + reloc + (visa.cost || 0) - fromTotal)}
                  </div>
                  <div style={{ fontSize: 12, color: D.tx3 }}>{t("vs ongoing annual cost","相較持續年度成本")}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: D.tx4, lineHeight: 1.5 }}>
                ⚠️ {t("Estimates only. Actual costs depend on seniority, housing market, family size, tax treaty provisions, and employer policy. Does not include ongoing assignment allowances (COLA, housing, education).",
                     "僅供估算參考。實際成本取決於職級、住房市場、家庭人數、稅務協定及公司政策。不含持續性派駐津貼（生活費補貼、住房、教育）。")}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
