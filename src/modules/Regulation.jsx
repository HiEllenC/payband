import { useState, useEffect } from "react";
import Card from "../components/Card.jsx";
import Dot from "../components/Dot.jsx";
import { COUNTRIES } from "../data/countries.js";
import { REG_TIMELINE, REG_FRAMEWORK } from "../data/regulations.js";

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

// ═══════ REGULATION MODULE ═══════
export default function Regulation({ lang, t }) {
  const [regView, setRegView] = useState("timeline");
  const [regCountry, setRegCountry] = useState(null);
  const [articles, setArticles] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (regView !== "ai") return;
    (async () => {
      try {
        const raw = localStorage.getItem("reg-articles-v2");
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data)) {
            setArticles(data);
            if (data.some(a => a.date === todayStr)) return;
          }
        }
      } catch (e) {}
      await generateDailyArticles();
    })();
  }, [regView]);

  const generateDailyArticles = async () => {
    setAiLoading(true);
    const isZh = lang === "zh";
    const topCountries = ["us", "sg", "ae", "hk", "jp", "tw"];
    const newArticles = [...articles.filter(a => a.date !== todayStr)];

    for (const cid of topCountries) {
      const cc = COUNTRIES.find(c => c.id === cid);
      if (!cc) continue;

      const cryptoPrompt = isZh
        ? `你是加密貨幣法規記者。搜尋${cc.zh}最新的加密貨幣監管新聞（2025-2026年）。用繁體中文寫一篇300字以內的新聞稿。格式：第一行是新聞標題（不要加任何前綴符號），空一行後是正文。正文需包含：具體監管機構名稱、法規變動內容、生效日期、對交易所的影響。語氣專業但易讀。`
        : `You are a crypto regulation journalist. Search for the latest crypto regulation news for ${cc.n} (2025-2026). Write a news article under 300 words. Format: first line is the headline (no prefix symbols), then a blank line, then the body. Include: specific regulatory body names, what changed, effective dates, impact on exchanges. Professional but readable tone.`;

      const hrPrompt = isZh
        ? `你是跨境人力資源分析師。搜尋${cc.zh}最新的勞動法規或人力資源政策變動（2025-2026年），特別是影響科技業/金融業的政策。用繁體中文寫一篇300字以內的分析稿。格式：第一行是標題（不要加任何前綴符號），空一行後是正文。正文需包含：政策名稱、主管機關、對薪酬福利的影響、企業應對建議。`
        : `You are a cross-border HR analyst. Search for the latest labor law or HR policy changes in ${cc.n} (2025-2026), especially those affecting tech/finance sectors. Write an analysis under 300 words. Format: first line is the headline (no prefix symbols), then a blank line, then the body. Include: policy name, governing body, impact on compensation & benefits, recommended actions for employers.`;

      for (const [cat, prompt] of [["crypto", cryptoPrompt], ["hr", hrPrompt]]) {
        try {
          const res = await fetch("/api/ai-news", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, lang })
          });
          if (!res.ok) throw new Error(`API error ${res.status}`);
          const data = await res.json();
          const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
          const firstLine = text.split("\n").find(l => l.trim());
          const body = text.split("\n").slice(text.split("\n").findIndex(l => l.trim()) + 1).join("\n").trim();
          newArticles.push({
            id: cid + "-" + cat + "-" + todayStr,
            category: cat,
            country: cid,
            title: (firstLine || "").replace(/^[#*]+\s*/, ""),
            body: body || text,
            date: todayStr,
            time: "08:00",
            lang: lang,
          });
        } catch (e) {}
      }
    }
    setArticles(newArticles);
    try { localStorage.setItem("reg-articles-v2", JSON.stringify(newArticles)); } catch (e) {}
    setAiLoading(false);
  };

  const regCount = COUNTRIES.filter(c => c.rs === "regulated").length;
  const evoCount = COUNTRIES.filter(c => c.rs === "evolving").length;
  const filtered = regCountry ? REG_TIMELINE.filter(r => r.cid === regCountry) : REG_TIMELINE;
  const typeMap = {
    N: { en: "NEW", zh: "新增", color: "#2d8a4e", bg: "#2d8a4e12" },
    A: { en: "AMENDED", zh: "修正", color: "#b08600", bg: "#b0860012" },
    V: { en: "REVOKED", zh: "廢止", color: "#9e3b3b", bg: "#9e3b3b12" },
    P: { en: "PROPOSED", zh: "草案", color: D.slate, bg: D.slate + "0a" },
  };
  const impactMap = {
    high: { en: "High Impact", zh: "高影響", color: "#c04040" },
    med: { en: "Medium", zh: "中影響", color: "#b08600" },
    low: { en: "Low", zh: "低影響", color: D.tx4 },
  };

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 6 }}>
        {t("Crypto Regulation Intelligence", "加密貨幣法規情報")}
      </div>
      <div style={{ fontSize: 14, color: D.tx3, marginBottom: 14 }}>
        {t("Timeline, regulatory framework analysis, and AI-powered real-time monitoring", "時間軸、監管框架分析與AI即時監控")}
      </div>

      {/* Mode guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 16 }}>
        {[
          { icon: "⏱️", title: t("Timeline","法規時間軸"),        desc: t("20 regulatory events 2018–2026, tagged NEW / AMENDED / REVOKED / PROPOSED. Filter by country or impact level.","2018–2026年20條法規事件，標記新增/修正/廢止/草案，可依國家或影響程度篩選。") },
          { icon: "🗂️", title: t("Framework Matrix","監管框架矩陣"), desc: t("12 countries × 6 dimensions: regulator, license type, tax treatment, stablecoin, DeFi, custody rules.","12國×6維度：監管機構・牌照類型・稅務・穩定幣・DeFi・託管規則並列對比。") },
          { icon: "🤖", title: t("AI Daily News","AI法規日報"),    desc: t("Claude AI + web search generates daily briefings: Crypto Regulation + HR & Labor news per selected language.","Claude AI＋網路搜尋每日自動生成：幣圈法規 + 勞動法規兩大類別新聞。") },
          { icon: "🚦", title: t("Regulatory Status","監管狀態"),   desc: t("Regulated = clear licensing framework. Evolving = active legislation in progress. Affects employer compliance burden.","Regulated=明確牌照框架；Evolving=法規制定中。影響雇主合規義務與營運風險。") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{icon} <span style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{title}</span></div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
        {[
          { n: regCount, l: t("Regulated", "已監管"), c: D.sage },
          { n: evoCount, l: t("Evolving", "演進中"), c: D.copper },
          { n: REG_TIMELINE.filter(r => r.type === "N").length, l: t("New Laws", "新法規"), c: "#2d8a4e" },
          { n: REG_TIMELINE.filter(r => r.type === "A").length, l: t("Amendments", "修正案"), c: "#b08600" },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: s.c }}>{s.n}</div>
              <div style={{ fontSize: 12, color: D.tx3, marginTop: 4 }}>{s.l}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[{ id: "timeline", e: "Timeline", z: "時間軸" }, { id: "framework", e: "Framework", z: "監管框架" }, { id: "ai", e: "Daily News", z: "法規日報" }].map(v => (
          <button key={v.id} onClick={() => setRegView(v.id)} style={{
            background: regView === v.id ? D.slate + "12" : "transparent",
            border: "1px solid " + (regView === v.id ? D.slate + "30" : "transparent"),
            color: regView === v.id ? D.slate : D.tx4, padding: "7px 18px", borderRadius: 6, cursor: "pointer",
            fontSize: 14, fontWeight: regView === v.id ? 600 : 400, fontFamily: "'DM Mono','Noto Sans TC',monospace",
          }}>
            {t(v.e, v.z)}
          </button>
        ))}
      </div>

      {/* TIMELINE VIEW */}
      {regView === "timeline" && (
        <div>
          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button onClick={() => setRegCountry(null)} style={{ background: !regCountry ? D.slate + "12" : "transparent", border: "1px solid " + (!regCountry ? D.slate + "30" : "transparent"), color: !regCountry ? D.slate : D.tx4, padding: "4px 12px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontWeight: !regCountry ? 600 : 400 }}>
                {t("All Countries", "全部國家")}
              </button>
              {COUNTRIES.map(c => (
                <button key={c.id} onClick={() => setRegCountry(c.id)} style={{ background: regCountry === c.id ? D.slate + "12" : "transparent", border: "1px solid " + (regCountry === c.id ? D.slate + "30" : "transparent"), color: regCountry === c.id ? D.slate : D.tx4, padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: regCountry === c.id ? 600 : 400 }}>
                  {c.flag} {c.id.toUpperCase()}
                </button>
              ))}
            </div>
          </Card>

          <Card glow>
            <div style={{ padding: "16px 20px" }}>
              {[...filtered].reverse().map((ev, i) => {
                const cc = COUNTRIES.find(c => c.id === ev.cid);
                const tp = typeMap[ev.type] || typeMap.P;
                const imp = impactMap[ev.impact] || impactMap.low;
                return (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < filtered.length - 1 ? "1px solid " + D.lnF : "none" }}>
                    <div style={{ width: 80, flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: D.tx }}>{ev.date}</div>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: imp.color + "14", color: imp.color, fontWeight: 500 }}>{lang === "zh" ? imp.zh : imp.en}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: tp.color, border: "2px solid " + D.surface, boxShadow: "0 0 0 2px " + tp.color + "30" }} />
                      {i < filtered.length - 1 && <div style={{ width: 2, flex: 1, background: D.ln, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: tp.bg, color: tp.color, fontWeight: 700, fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>{lang === "zh" ? tp.zh : tp.en}</span>
                        {cc && <span style={{ fontSize: 14 }}>{cc.flag}</span>}
                        {cc && <span style={{ fontSize: 13, fontWeight: 500, color: D.tx }}>{t(cc.n, cc.zh)}</span>}
                      </div>
                      <div style={{ fontSize: 14, color: D.tx2, lineHeight: 1.6 }}>{lang === "zh" ? ev.zh : ev.en}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* FRAMEWORK VIEW */}
      {regView === "framework" && (
        <Card glow>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", left: 0, zIndex: 3, background: D.surface, padding: "12px 14px", textAlign: "left", borderBottom: "2px solid " + D.ln, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", minWidth: 140 }}>
                    {t("Dimension", "維度")}
                  </th>
                  {COUNTRIES.map(c => (
                    <th key={c.id} style={{ padding: "10px 8px", textAlign: "center", borderBottom: "2px solid " + D.ln, minWidth: 130 }}>
                      <div style={{ fontSize: 16 }}>{c.flag}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: D.tx, marginTop: 2 }}>{t(c.n, c.zh)}</div>
                      <Dot s={c.rs} lang={lang} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: "authority", kz: "authZ", e: "Regulatory Authority", z: "監管機構" },
                  { k: "license", kz: "licZ", e: "License Type", z: "牌照類型" },
                  { k: "tax", kz: "taxZ", e: "Tax Treatment", z: "稅務處理" },
                  { k: "stablecoin", kz: "stableZ", e: "Stablecoin Rules", z: "穩定幣規定" },
                  { k: "defi", kz: "defiZ", e: "DeFi Regulation", z: "DeFi監管" },
                  { k: "custody", kz: "custZ", e: "Custody Rules", z: "託管規定" },
                ].map((row, ri) => (
                  <tr key={row.k} style={{ borderTop: "1px solid " + D.lnF }}>
                    <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "12px 14px", fontSize: 13, fontWeight: 600, color: D.tx, background: ri % 2 ? D.slate + "03" : D.surface, borderRight: "1px solid " + D.lnF }}>
                      {t(row.e, row.z)}
                    </td>
                    {COUNTRIES.map(c => {
                      const fw = REG_FRAMEWORK[c.id] || {};
                      const val = lang === "zh" ? (fw[row.kz] || fw[row.k] || "—") : (fw[row.k] || "—");
                      return (
                        <td key={c.id} style={{ padding: "10px 8px", fontSize: 12, color: D.tx2, textAlign: "center", verticalAlign: "top", borderLeft: "1px solid " + D.lnF, lineHeight: 1.5 }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* AI DAILY NEWS VIEW */}
      {regView === "ai" && (
        <div>
          {aiLoading && (
            <Card glow style={{ marginBottom: 14 }}>
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: D.tx }}>{t("Generating today's briefings...", "正在生成今日簡報...")}</div>
                <div style={{ fontSize: 13, color: D.tx3, marginTop: 4 }}>{t("AI is searching the web and writing articles for 6 countries × 2 categories", "AI正在搜尋並撰寫6國×2類別的文章")}</div>
                <style>{`@keyframes pb-slide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
                <div style={{ width: 200, height: 4, background: D.lnF, borderRadius: 4, margin: "16px auto 0", overflow: "hidden" }}>
                  <div style={{ width: "30%", height: "100%", background: D.sage, borderRadius: 4, animation: "pb-slide 1.4s ease-in-out infinite" }} />
                </div>
              </div>
            </Card>
          )}

          {!aiLoading && articles.length > 0 && (() => {
            const todayArticles = articles.filter(a => a.date === todayStr);
            const olderArticles = articles.filter(a => a.date !== todayStr && a.date.startsWith(thisMonth));
            const cryptoToday = todayArticles.filter(a => a.category === "crypto");
            const hrToday = todayArticles.filter(a => a.category === "hr");

            const ArticleCard = ({ art, featured }) => {
              const cc = COUNTRIES.find(c => c.id === art.country);
              return (
                <div onClick={() => setActiveArticle(art.id)} style={{
                  padding: featured ? "16px 18px" : "12px 14px",
                  borderBottom: "1px solid " + D.lnF, cursor: "pointer",
                  background: "transparent", transition: "background 0.15s",
                }} onMouseEnter={e => e.currentTarget.style.background = D.slate + "04"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 600, fontFamily: "'DM Mono',monospace", background: art.category === "crypto" ? D.sage + "14" : D.copper + "14", color: art.category === "crypto" ? D.sage : D.copper }}>
                      {art.category === "crypto" ? "CRYPTO" : "HR"}
                    </span>
                    {cc && <span style={{ fontSize: 13 }}>{cc.flag}</span>}
                    {cc && <span style={{ fontSize: 12, color: D.tx4 }}>{t(cc.n, cc.zh)}</span>}
                    <span style={{ fontSize: 11, color: D.tx5, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{art.time}</span>
                  </div>
                  <div style={{ fontSize: featured ? 16 : 14, fontWeight: 600, color: D.tx, lineHeight: 1.4, marginBottom: 4 }}>{art.title}</div>
                  <div style={{ fontSize: 13, color: D.tx3, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {art.body.split("\n").find(l => l.trim()) || ""}
                  </div>
                </div>
              );
            };

            if (activeArticle) {
              const art = articles.find(a => a.id === activeArticle);
              if (!art) return null;
              const cc = COUNTRIES.find(c => c.id === art.country);
              return (
                <div>
                  <button onClick={() => setActiveArticle(null)} style={{ background: "none", border: "1px solid " + D.ln, color: D.tx3, padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Mono',monospace", marginBottom: 16 }}>
                    ← {t("Back to list", "返回列表")}
                  </button>
                  <Card accent={art.category === "crypto" ? D.sage : D.copper} glow>
                    <div style={{ padding: "28px 32px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 4, fontWeight: 700, fontFamily: "'DM Mono',monospace", letterSpacing: 1, background: art.category === "crypto" ? D.sage + "14" : D.copper + "14", color: art.category === "crypto" ? D.sage : D.copper }}>
                          {art.category === "crypto" ? t("CRYPTO REGULATION", "加密貨幣法規") : t("HR & LABOR", "人力資源")}
                        </span>
                        {cc && <span style={{ fontSize: 16 }}>{cc.flag}</span>}
                        {cc && <span style={{ fontSize: 13, color: D.tx3 }}>{t(cc.n, cc.zh)}</span>}
                        <span style={{ fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", marginLeft: "auto" }}>{art.date} {art.time}</span>
                      </div>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: D.tx, lineHeight: 1.4, marginBottom: 20, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{art.title}</h2>
                      <div style={{ width: 48, height: 3, background: art.category === "crypto" ? D.sage : D.copper, borderRadius: 2, marginBottom: 20, opacity: 0.4 }} />
                      {art.body.split("\n").map((p, i) => {
                        const trimmed = p.trim();
                        if (!trimmed) return <div key={i} style={{ height: 14 }} />;
                        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("·")) {
                          return (
                            <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", marginLeft: 4 }}>
                              <span style={{ color: art.category === "crypto" ? D.sage : D.copper, flexShrink: 0, fontSize: 16 }}>▸</span>
                              <span style={{ fontSize: 15, color: D.tx2, lineHeight: 1.8 }}>{trimmed.replace(/^[•\-·]\s*/, "")}</span>
                            </div>
                          );
                        }
                        if (trimmed.includes("**")) {
                          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
                          return <p key={i} style={{ fontSize: 15, color: D.tx2, lineHeight: 1.9, margin: "0 0 8px" }}>{parts.map((s, j) => j % 2 === 1 ? <strong key={j} style={{ color: D.tx, fontWeight: 600 }}>{s}</strong> : s)}</p>;
                        }
                        return <p key={i} style={{ fontSize: 15, color: D.tx2, lineHeight: 1.9, margin: "0 0 8px" }}>{trimmed}</p>;
                      })}
                      <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid " + D.lnF, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: D.tx5 }}>{t("Generated by AI + Web Search. For reference only.", "由AI+網路搜尋生成，僅供參考。")}</span>
                        <span style={{ fontSize: 10, color: D.tx5, fontFamily: "'DM Mono',monospace" }}>Payband Daily</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            }

            return (
              <div>
                {todayArticles.length > 0 && (
                  <Card glow style={{ marginBottom: 14 }}>
                    <div style={{ padding: "14px 18px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 4, height: 20, borderRadius: 2, background: D.sage }} />
                          <span style={{ fontSize: 18, fontWeight: 700, color: D.tx }}>{t("Today's Briefing", "今日簡報")}</span>
                        </div>
                        <span style={{ fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>{todayStr} 08:00 {t("auto-generated", "自動生成")}</span>
                      </div>
                      <div style={{ fontSize: 12, color: D.tx4, marginBottom: 10 }}>{todayArticles.length} {t("articles", "篇文章")} · {new Set(todayArticles.map(a => a.country)).size} {t("countries", "國")}</div>
                    </div>
                    {cryptoToday.length > 0 && (
                      <div>
                        <div style={{ padding: "8px 18px", background: D.sage + "06", fontSize: 12, fontWeight: 600, color: D.sage, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, borderTop: "1px solid " + D.lnF }}>
                          🔗 {t("CRYPTO REGULATION", "加密貨幣法規")}
                        </div>
                        {cryptoToday.map(a => <ArticleCard key={a.id} art={a} featured />)}
                      </div>
                    )}
                    {hrToday.length > 0 && (
                      <div>
                        <div style={{ padding: "8px 18px", background: D.copper + "06", fontSize: 12, fontWeight: 600, color: D.copper, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, borderTop: "1px solid " + D.ln }}>
                          👔 {t("HR & LABOR LAW", "人力資源與勞動法規")}
                        </div>
                        {hrToday.map(a => <ArticleCard key={a.id} art={a} featured />)}
                      </div>
                    )}
                  </Card>
                )}
                {olderArticles.length > 0 && (
                  <Card glow style={{ marginBottom: 14 }}>
                    <div style={{ padding: "14px 18px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: D.tx4 }} />
                        <span style={{ fontSize: 16, fontWeight: 600, color: D.tx3 }}>{t("Earlier This Month", "本月稍早")}</span>
                      </div>
                    </div>
                    {olderArticles.slice(0, 20).map(a => <ArticleCard key={a.id} art={a} />)}
                  </Card>
                )}
                {todayArticles.length === 0 && !aiLoading && (
                  <Card glow>
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
                      <div style={{ fontSize: 16, color: D.tx3, marginBottom: 12 }}>{t("No articles yet today", "今日尚無文章")}</div>
                      <button onClick={generateDailyArticles} style={{ background: D.ink, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>
                        {t("Generate Now", "立即生成")}
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
