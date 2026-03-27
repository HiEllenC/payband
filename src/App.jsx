import { useState, useEffect, useCallback, memo, lazy, Suspense } from "react";

// Modules — lazy loaded for code splitting
const Home          = lazy(() => import("./modules/Home.jsx"));
const Salary        = lazy(() => import("./modules/Salary.jsx"));
const TotalComp     = lazy(() => import("./modules/TotalComp.jsx"));
const LaborLaw      = lazy(() => import("./modules/LaborLaw.jsx"));
const Calendar      = lazy(() => import("./modules/Calendar.jsx"));
const Regulation    = lazy(() => import("./modules/Regulation.jsx"));
const Countries     = lazy(() => import("./modules/Countries.jsx"));
const Relocation    = lazy(() => import("./modules/Relocation.jsx"));
const GrossToNet    = lazy(() => import("./modules/GrossToNet.jsx"));
const Markets       = lazy(() => import("./modules/Markets.jsx"));
const AllowancePlanner = lazy(() => import("./modules/AllowancePlanner.jsx"));

// Data
import { FAMS } from "./data/jobs.js";

/*
 ╔═══════════════════════════════════════════════════╗
 ║  PAYBAND v1.1 — PREMIUM TERMINAL               ║
 ║  DM Mono · Fixed Map · Editorial Landing          ║
 ╚═══════════════════════════════════════════════════╝
*/

const D = {
  bg: "#f4f6f8", surface: "#ffffff", surfA: "rgba(255,255,255,0.95)", elev: "rgba(255,255,255,0.98)",
  tx:  "#111827", tx2: "#1f2937", tx3: "#4b5563", tx4: "#9ca3af", tx5: "#d1d5db",
  ink: "#111827", slate: "#1a56db", sage: "#0ea5e9", copper: "#f59e0b", clay: "#ef4444", wine: "#8b5cf6",
  ln:  "rgba(15,23,42,0.08)", lnF: "rgba(15,23,42,0.04)",
};

const BG = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#f4f6f8 0%,#f5f7fb 35%,#f2f6fa 65%,#f0f4f8 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(${D.slate}08 1px,transparent 1px),linear-gradient(90deg,${D.slate}08 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
    <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, background: `radial-gradient(circle,${D.slate}06 0%,transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
    <div style={{ position: "absolute", bottom: "-5%", left: "10%", width: 400, height: 400, background: `radial-gradient(circle,${D.copper}05 0%,transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
  </div>
);

// ═══════ HEADER (module-level to prevent remount on every App render) ═══════
const AppHeader = memo(function AppHeader({ tab, setTab, setDetail, usdt, setUsdt, lang, setLang, t, TABS }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(240,244,248,0.88)", backdropFilter: "blur(24px)", borderBottom: `1px solid rgba(15,23,42,0.08)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1360, margin: "0 auto", height: 58, padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => { setTab("home"); setDetail(null); }}>
          {/* 3-bar salary band icon */}
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ flexShrink: 0 }}>
            <rect x="0" y="0"   width="18" height="3" rx="1.5" fill={D.slate} opacity="0.9" />
            <rect x="0" y="5.5" width="12" height="3" rx="1.5" fill={D.slate} opacity="0.7" />
            <rect x="0" y="11" width="7"  height="3" rx="1.5" fill={D.slate} opacity="0.5" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.ink, letterSpacing: 1.5 }}>
            i<span style={{ color: D.slate }}>Pay</span>band
          </span>
        </div>
        <nav style={{ display: "flex", gap: 1, overflowX: "auto", msOverflowStyle: "none", scrollbarWidth: "none", flex: 1, margin: "0 16px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {TABS.map((i, idx) => i.sep
            ? <div key={`sep-${idx}`} style={{ width: 1, height: 18, background: "rgba(15,23,42,0.12)", margin: "0 4px", alignSelf: "center", flexShrink: 0 }} />
            : (
            <button key={i.id} onClick={() => { setTab(i.id); setDetail(null); }} style={{
              background: "transparent", border: "none",
              color: tab === i.id ? D.tx : D.tx4,
              padding: "6px 12px", cursor: "pointer",
              fontSize: 13, fontWeight: tab === i.id ? 700 : 400,
              fontFamily: "'DM Mono','Noto Sans TC',monospace",
              borderBottom: tab === i.id ? `2px solid ${D.slate}` : "2px solid transparent",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {t(i.e, i.z)}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => setUsdt(!usdt)} style={{ background: "none", border: `1px solid ${D.ln}`, color: usdt ? D.copper : D.tx3, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Mono',monospace" }}>
            {usdt ? "₮ USDT" : "$ USD"}
          </button>
          <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} style={{ background: "none", border: `1px solid ${D.ln}`, color: D.tx3, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </div>
      </div>
    </header>
  );
});

// ═══════ MAIN APP ═══════
export default function App() {
  const [tab, setTab] = useState("home");
  const [selC, setSelC] = useState(["sg", "tw", "ph"]);
  const [selFam, setSelFam] = useState("eng");
  const [selSub, setSelSub] = useState("be");
  const [track, setTrack] = useState("ic");
  const [selLvl, setSelLvl] = useState(2); // default IC3/M3
  const [usdt, setUsdt] = useState(false);
  const [lang, setLang] = useState("zh");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [ready, setReady] = useState(false);
  const [calView, setCalView] = useState("sheet"); // "sheet" or "calendar" or "yearcomp"

  useEffect(() => { const id = setTimeout(() => setReady(true), 60); return () => clearTimeout(id); }, []);

  const t = useCallback((e, z) => lang === "zh" ? z : e, [lang]);

  // Reset subfunction when family changes (selSub included in deps to avoid stale closure)
  useEffect(() => {
    const f = FAMS.find(f => f.id === selFam);
    if (f && !f.subs.find(s => s.id === selSub)) setSelSub(f.subs[0].id);
  }, [selFam, selSub]);

  const togC = id => setSelC(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 6 ? [...p, id] : p);

  const TABS = [
    { id: "home",       e: "Home",            z: "首頁" },
    { sep: true },
    { id: "salary",     e: "Salary Matrix",   z: "薪資帶寬" },
    { id: "totalcomp",  e: "Comp Structure",  z: "薪酬結構" },
    { id: "relocate",   e: "Cross-Border",    z: "跨境調派" },
    { id: "netpay",     e: "Take-Home",       z: "到手試算" },
    { id: "allowance",  e: "Allowances",      z: "津貼規劃" },
    { id: "markets",    e: "FX & Crypto",     z: "匯率與幣市" },
    { sep: true },
    { id: "labor",      e: "Labor Law",       z: "勞動法規" },
    { id: "calendar",   e: "Holidays",        z: "假日行事曆" },
    { id: "regulation", e: "Reg Tracker",     z: "監管動態" },
    { sep: true },
    { id: "countries",  e: "Country Files",   z: "國家檔案" },
  ];

  const sharedJobProps = {
    selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl,
  };

  return (
    <div style={{ minHeight: "100vh", color: D.tx, position: "relative", fontFamily: "'Inter','Noto Sans TC',sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.65 }}>
      <style>{`
*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:'Inter','Noto Sans TC',sans-serif}::selection{background:${D.slate}22}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(15,23,42,0.12);border-radius:4px}input::placeholder{color:${D.tx4}}table tr:hover{background:${D.slate}06!important}button{font-family:'Inter','Noto Sans TC',sans-serif}p,span,td,th,li{line-height:1.65}.mono{font-family:'DM Mono',monospace!important}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid ${D.slate};outline-offset:2px;border-radius:4px}
      `}</style>
      <BG />
      <div style={{ position: "relative", zIndex: 1 }}>
        <AppHeader tab={tab} setTab={setTab} setDetail={setDetail} usdt={usdt} setUsdt={setUsdt} lang={lang} setLang={setLang} t={t} TABS={TABS} />
        <main style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 32px 48px" }}>
          <Suspense fallback={<div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontFamily: "'DM Mono',monospace", fontSize: 13 }}>Loading…</div>}>
          {tab === "home" && (
            <Home selC={selC} togC={togC} setTab={setTab} ready={ready} t={t} lang={lang} />
          )}
          {tab === "salary" && (
            <Salary
              selC={selC} togC={togC}
              {...sharedJobProps}
              usdt={usdt} lang={lang} t={t}
            />
          )}
          {tab === "totalcomp" && (
            <TotalComp
              selC={selC} togC={togC}
              {...sharedJobProps}
              usdt={usdt} lang={lang} t={t}
            />
          )}
          {tab === "relocate" && (
            <Relocation lang={lang} t={t} {...sharedJobProps} />
          )}
          {tab === "markets" && (
            <Markets lang={lang} t={t} usdt={usdt} />
          )}
          {tab === "netpay" && (
            <GrossToNet lang={lang} t={t} />
          )}
          {tab === "allowance" && (
            <AllowancePlanner lang={lang} t={t} />
          )}
          {tab === "labor" && (
            <LaborLaw selC={selC} togC={togC} lang={lang} t={t} />
          )}
          {tab === "calendar" && (
            <Calendar selC={selC} togC={togC} calView={calView} setCalView={setCalView} lang={lang} t={t} />
          )}
          {tab === "regulation" && (
            <Regulation lang={lang} t={t} />
          )}
          {tab === "countries" && (
            <Countries
              search={search} setSearch={setSearch}
              detail={detail} setDetail={setDetail}
              ready={ready} usdt={usdt} lang={lang} t={t}
            />
          )}
          </Suspense>
        </main>
        <footer style={{ borderTop: `1px solid ${D.ln}`, padding: "14px 32px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: D.tx4 }}>Payband v1.1 · {t("Mock data · API pending", "模擬數據 · API待接")} · Ellen Chuang</span>
        </footer>
      </div>
    </div>
  );
}
