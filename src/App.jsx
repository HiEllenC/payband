import { useState, useEffect, useCallback } from "react";

// Modules
import Home from "./modules/Home.jsx";
import Salary from "./modules/Salary.jsx";
import TotalComp from "./modules/TotalComp.jsx";
import LaborLaw from "./modules/LaborLaw.jsx";
import Calendar from "./modules/Calendar.jsx";
import Regulation from "./modules/Regulation.jsx";
import Countries from "./modules/Countries.jsx";
import Relocation from "./modules/Relocation.jsx";
import GrossToNet from "./modules/GrossToNet.jsx";
import Markets from "./modules/Markets.jsx";

// Data
import { FAMS } from "./data/jobs.js";

/*
 ╔═══════════════════════════════════════════════════╗
 ║  PAYBAND v1.1 — PREMIUM TERMINAL               ║
 ║  DM Mono · Fixed Map · Editorial Landing          ║
 ╚═══════════════════════════════════════════════════╝
*/

const D = {
  bg: "#eae8e4", surface: "#faf9f7", surfA: "rgba(250,249,247,0.72)", elev: "rgba(255,254,252,0.88)",
  tx: "#1c1c1f", tx2: "#4a4a52", tx3: "#7d7d88", tx4: "#a8a8b4", tx5: "#c8c8d0",
  ink: "#2d3142", slate: "#546378", sage: "#5f7a61", copper: "#96714a", clay: "#a06b52", wine: "#8a5565",
  ln: "rgba(0,0,0,0.06)", lnF: "rgba(0,0,0,0.03)",
};

const BG = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#ece9e3 0%,#f0eeea 35%,#efede8 65%,#ece9e4 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.3, backgroundImage: `linear-gradient(${D.slate}05 1px,transparent 1px),linear-gradient(90deg,${D.slate}05 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
    <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, background: `radial-gradient(circle,${D.slate}05 0%,transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
    <div style={{ position: "absolute", bottom: "-5%", left: "10%", width: 400, height: 400, background: `radial-gradient(circle,${D.sage}04 0%,transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
  </div>
);

// ═══════ MAIN APP ═══════
export default function App() {
  const [tab, setTab] = useState("home");
  const [selC, setSelC] = useState(["us", "sg", "ae"]);
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

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const t = useCallback((e, z) => lang === "zh" ? z : e, [lang]);

  // Reset subfunction when family changes
  useEffect(() => {
    const f = FAMS.find(f => f.id === selFam);
    if (f && !f.subs.find(s => s.id === selSub)) setSelSub(f.subs[0].id);
  }, [selFam]);

  const togC = id => setSelC(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 6 ? [...p, id] : p);

  const TABS = [
    { id: "home",       e: "Home",            z: "首頁" },
    { id: "salary",     e: "Salary Matrix",   z: "薪資帶寬" },
    { id: "totalcomp",  e: "Comp Structure",  z: "薪酬結構" },
    { id: "relocate",   e: "Cross-Border",    z: "跨境調派" },
    { id: "netpay",     e: "Take-Home",       z: "到手試算" },
    { id: "markets",    e: "FX & Crypto",     z: "匯率與幣市" },
    { id: "labor",      e: "Labor Law",       z: "勞動法規" },
    { id: "calendar",   e: "Holidays",        z: "假日行事曆" },
    { id: "regulation", e: "Reg Tracker",     z: "監管動態" },
    { id: "countries",  e: "Country Files",   z: "國家檔案" },
  ];

  const Header = () => (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(240,238,234,0.75)", backdropFilter: "blur(24px)", borderBottom: `1px solid rgba(0,0,0,0.04)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1360, margin: "0 auto", height: 58, padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => { setTab("home"); setDetail(null); }}>
          <span style={{ fontSize: 18, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: D.ink, letterSpacing: 2 }}>
            Pay<span style={{ color: D.slate }}>band</span>
          </span>
        </div>
        <nav style={{ display: "flex", gap: 1, overflowX: "auto", msOverflowStyle: "none", scrollbarWidth: "none", flex: 1, margin: "0 16px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {TABS.map(i => (
            <button key={i.id} onClick={() => { setTab(i.id); setDetail(null); }} style={{
              background: "transparent", border: "none",
              color: tab === i.id ? D.tx : D.tx4,
              padding: "6px 12px", cursor: "pointer",
              fontSize: 13, fontWeight: tab === i.id ? 500 : 400,
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

  const sharedJobProps = {
    selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl,
  };

  return (
    <div style={{ minHeight: "100vh", color: D.tx, position: "relative", fontFamily: "'DM Mono','Noto Sans TC',monospace", fontSize: 16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${D.slate}18}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px}input::placeholder{color:${D.tx4}}table tr:hover{background:${D.slate}03!important}button{font-family:inherit}
      `}</style>
      <BG />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
        <main style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 32px 48px" }}>
          {tab === "home" && (
            <Home selC={selC} togC={togC} setTab={setTab} ready={ready} t={t} />
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
            <Relocation lang={lang} t={t} />
          )}
          {tab === "markets" && (
            <Markets lang={lang} t={t} usdt={usdt} />
          )}
          {tab === "netpay" && (
            <GrossToNet lang={lang} t={t} />
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
        </main>
        <footer style={{ borderTop: `1px solid ${D.ln}`, padding: "14px 32px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: D.tx4 }}>Payband v1.1 · {t("Mock data · API pending", "模擬數據 · API待接")} · Ellen Chuang</span>
        </footer>
      </div>
    </div>
  );
}
