import { useState } from "react";
import Card from "../components/Card.jsx";
import WorldMap from "../components/WorldMap.jsx";
import JobSelector from "../components/JobSelector.jsx";
import { COUNTRIES } from "../data/countries.js";
import { JLVL } from "../data/jobs.js";
import { gS, gBand, compaRatio, fmt } from "../utils/salary.js";

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
const bC = [D.slate, D.sage, D.copper, D.clay, D.wine, "#6b6b8a"];

// Redesigned cell: P50 large, band bar below, P25/P75 labels clear
function BandCell({ band, actual, color, usdt, lvlId, lang }) {
  const [hov, setHov] = useState(false);
  const cr = actual ? compaRatio(actual, band.p50) : null;
  const crColor = cr == null ? "#a8a8b4" : cr < 85 ? "#c0392b" : cr > 115 ? "#27ae60" : "#e67e22";
  // bar positioning: 0% = band.p25, 100% = band.p75
  const barMax = band.p75 * 1.08;
  const pPct = v => `${Math.min((v / barMax) * 100, 100)}%`;
  const p25pct = pPct(band.p25);
  const p50pct = pPct(band.p50);
  const p75pct = pPct(band.p75);
  const actPct = actual > 0 ? pPct(actual) : null;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ padding: "10px 12px", borderRadius: 8, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderTop: `3px solid ${color}`, minWidth: 0 }}>
      {/* Level tag */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 4, textTransform: "uppercase" }}>
        {lvlId}
      </div>
      {/* P50 — prominent */}
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color, lineHeight: 1, marginBottom: 6 }}>
        {fmt(band.p50, usdt)}
      </div>
      {/* Range bar */}
      <div style={{ position: "relative", height: 8, borderRadius: 4, background: "rgba(0,0,0,0.06)", marginBottom: 5 }}>
        {/* P25–P75 filled band */}
        <div style={{
          position: "absolute",
          left: p25pct, right: `${100 - parseFloat(p75pct)}%`,
          height: "100%", background: color, opacity: 0.3, borderRadius: 4,
        }} />
        {/* P50 tick */}
        <div style={{
          position: "absolute", left: p50pct, transform: "translateX(-50%)",
          width: 3, height: "100%", background: color, opacity: 0.85, borderRadius: 2,
        }} />
        {/* Actual dot */}
        {actPct && (
          <div style={{
            position: "absolute", left: actPct, transform: "translate(-50%,-25%)",
            width: 12, height: 12, borderRadius: "50%", background: crColor,
            boxShadow: "0 0 0 2px #fff, 0 0 0 3px " + crColor + "60",
          }} />
        )}
      </div>
      {/* P25 / P75 labels — always visible, deepen on hover */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: hov ? "#6b7280" : "#c4c9d4", fontFamily: "'DM Mono',monospace", transition: "color 0.15s" }}>
        <span>{fmt(band.p25, usdt)}</span>
        <span>{fmt(band.p75, usdt)}</span>
      </div>
      {/* Compa-ratio */}
      {cr != null && (
        <div style={{ marginTop: 5, fontSize: 10, fontFamily: "'DM Mono',monospace", color: crColor, fontWeight: 600 }}>
          CR {cr}% {cr < 85 ? (lang === "zh" ? "⚠ 偏低" : "⚠ low") : cr > 115 ? (lang === "zh" ? "✓ 偏高" : "✓ high") : (lang === "zh" ? "✓ 適中" : "✓ mid")}
        </div>
      )}
    </div>
  );
}

export default function Salary({ selC, togC, selFam, setSelFam, selSub, setSelSub, track, setTrack, selLvl, setSelLvl, usdt, lang, t }) {
  const [actualSalary, setActualSalary] = useState("");
  const [showBand, setShowBand] = useState(true);
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);
  const lvls = JLVL[track];
  const actual = parseFloat(actualSalary) || 0;

  // Derive readable labels for the "You selected" banner
  const lvlLabel = track === "ic" ? `IC${selLvl + 1}` : `M${selLvl + 1}`;
  const trackLabel = track === "ic" ? t("Individual Contributor", "個人貢獻 IC 軌") : t("Management", "管理 M 軌");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
          {t("Salary Band Matrix", "薪資帶寬矩陣")}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowBand(b => !b)} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 6,
            background: showBand ? D.slate : "#f0f0f4", color: showBand ? "#fff" : D.tx4,
            border: "none", cursor: "pointer", fontFamily: "'DM Mono',monospace",
          }}>
            {showBand ? t("Band View", "帶寬模式") : t("Point View", "點位模式")}
          </button>
        </div>
      </div>

      <JobSelector
        selFam={selFam} setSelFam={setSelFam}
        selSub={selSub} setSelSub={setSelSub}
        track={track} setTrack={setTrack}
        selLvl={selLvl} setSelLvl={setSelLvl}
        lang={lang} t={t}
      />

      {/* ── YOU SELECTED banner ── */}
      {sel.length > 0 && (
        <div style={{ margin: "12px 0", padding: "12px 16px", borderRadius: 10, background: `${D.slate}08`, border: `1px solid ${D.slate}20`, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: D.slate, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4 }}>
            {t("📍 You selected", "📍 你選的是")}
          </span>
          {sel.map((c, i) => (
            <span key={c.id} style={{ fontSize: 13, padding: "3px 10px", borderRadius: 20, background: `${bC[i]}15`, color: bC[i], fontWeight: 600, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>
              {c.flag} {t(c.n, c.zh)}
            </span>
          ))}
          <span style={{ fontSize: 12, color: D.tx3, fontFamily: "'DM Mono',monospace" }}>·</span>
          <span style={{ fontSize: 12, color: D.tx2, fontFamily: "'DM Mono','Noto Sans TC',monospace", fontWeight: 500 }}>
            {selFam && <>{selFam.toUpperCase()}{selSub ? ` › ${selSub}` : ""}</>}
          </span>
          <span style={{ fontSize: 12, color: D.tx3, fontFamily: "'DM Mono',monospace" }}>·</span>
          <span style={{ fontSize: 12, color: D.tx2, fontFamily: "'DM Mono','Noto Sans TC',monospace", fontWeight: 500 }}>
            {trackLabel} — {lvlLabel}
          </span>
          {actual > 0 && (
            <>
              <span style={{ fontSize: 12, color: D.tx3, fontFamily: "'DM Mono',monospace" }}>·</span>
              <span style={{ fontSize: 12, color: D.copper, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
                {t("Your salary:", "你的薪資：")} {actual}K USD
              </span>
            </>
          )}
        </div>
      )}

      {/* How to read this */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 12 }}>
        {[
          { tag: "P25", color: "#aaa",    title: t("Market Floor","市場低標"),    desc: t("Entry / lower bound — suitable for new hires & junior candidates","適合新人，低於此薪資在留才上有風險") },
          { tag: "P50", color: D.slate,   title: t("Market Midpoint","市場中位數"), desc: t("Standard offer target — aligned with the industry median","標準 Offer 水位，符合同業中位數") },
          { tag: "P75", color: D.sage,    title: t("Top of Band","市場高標"),      desc: t("Retention / talent competition — use for senior or scarce roles","留才競爭力水位，用於稀缺或高階職位") },
          { tag: "CR",  color: D.copper,  title: t("Compa-Ratio","薪資比值"),      desc: t("Your salary ÷ P50 × 100. 100% = market mid. Below 85% = retention risk","你的薪資 ÷ P50 × 100。低於 85% 有留才風險") },
        ].map(({ tag, color, title, desc }) => (
          <div key={tag} style={{ padding: "10px 14px", borderRadius: 8, background: color === "#aaa" ? "rgba(0,0,0,0.025)" : `${color}08`, border: `1px solid ${color === "#aaa" ? "rgba(0,0,0,0.07)" : color + "20"}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ minWidth: 32, height: 22, borderRadius: 4, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color }}>{tag}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: D.tx3, lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* C&B Recommendation callout */}
      <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 8, background: `${D.sage}08`, border: `1px solid ${D.sage}25`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: D.sage, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 3 }}>
            {t("C&B Tip", "C&B 建議")}
          </div>
          <div style={{ fontSize: 12, color: D.tx3, lineHeight: 1.6 }}>
            {t(
              "Salary ranges shown here exclude token grants. For a full package view including bonus, token vesting, and employer costs, see the Comp Structure tab.",
              "此薪資帶寬不含代幣授予（Token Grant）。若需含獎金、代幣歸屬與雇主成本的完整套餐對比，請前往「薪酬結構拆解」頁。"
            )}
          </div>
        </div>
      </div>

      {/* Compa-Ratio Input */}
      <Card style={{ marginBottom: 12, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: D.tx4, marginBottom: 4, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {t("Compa-Ratio Check", "薪資比值檢驗")}
            </div>
            <div style={{ fontSize: 12, color: D.tx3 }}>
              {sel.length > 0
                ? t(`Enter an actual salary to see where it falls in the band (benchmarked vs. ${sel[0].n})`, `輸入實際薪資，查看在帶寬中的位置（以${sel[0].zh}為基準）`)
                : t("Enter an actual salary to see where it falls in the band", "輸入實際薪資，查看在帶寬中的位置與市場競爭力")
              }
            </div>
          </div>
          <input
            type="number"
            min="0"
            value={actualSalary}
            onChange={e => setActualSalary(e.target.value)}
            placeholder={t("e.g. 85 (USD K)", "例如 85（千美元）")}
            style={{
              width: 160, padding: "6px 12px", borderRadius: 6, border: `1px solid #ddd`,
              fontSize: 14, fontFamily: "'DM Mono',monospace", background: "#fafafa", outline: "none",
            }}
          />
          {actual > 0 && (() => {
            const refId = sel[0]?.id || "us";
            const refBand = gBand(refId, selFam, selSub, track, selLvl);
            const belowFloor = actual < refBand.p25;
            const belowMid = actual < refBand.p50;
            const aboveTop = actual > refBand.p75;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: belowFloor ? "#fdecea" : aboveTop ? "#eafaf1" : "#fef9e7", color: belowFloor ? "#c0392b" : aboveTop ? "#27ae60" : "#e67e22", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
                  {belowFloor ? t("⚠ Below market floor (P25)","⚠ 低於市場下限 P25") : aboveTop ? t("✓ Above market top (P75)","✓ 超過市場頂端 P75") : t("✓ Within market band","✓ 落在市場帶寬內")}
                </div>
                {belowFloor && (
                  <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#fdecea", color: "#c0392b", fontFamily: "'DM Mono','Noto Sans TC',monospace", border: "1px solid #f5c6c6" }}>
                    {t("Consider revising the offer — below P25 significantly increases turnover risk.", "建議重新考量 Offer — 低於 P25 會明顯提高離職風險。")}
                  </div>
                )}
                {belowMid && !belowFloor && (
                  <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#fff8e1", color: "#b7791f", fontFamily: "'DM Mono','Noto Sans TC',monospace", border: "1px solid #ffd96a40" }}>
                    {t("Below midpoint — moderate retention risk", "低於中位數 — 留才有一定風險")}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Card>

      <WorldMap selected={selC} onSelect={togC} t={t} />

      {sel.map((c, ci) => {
        // Compute band for selected level to drive the market comparison badge
        const refBand = gBand(c.id, selFam, selSub, track, selLvl);
        const p50 = gS(c.id, selFam, selSub, track, selLvl);
        const isAtP25 = actual > 0 && actual >= refBand.p25 && actual < refBand.p50;
        const isBelowP25 = actual > 0 && actual < refBand.p25;

        return (
        <Card key={c.id} glow style={{ marginTop: 12 }}>
          <div style={{ padding: "14px 18px" }}>
            {/* Country header — stronger contrast */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${bC[ci]}18` }}>
              <span style={{ fontSize: 22 }}>{c.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(c.n, c.zh)}</div>
                <div style={{ fontSize: 11, color: D.tx3, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                  {showBand
                    ? t("P25 low / P50 midpoint / P75 high · colored bar = band width","P25 低標 / P50 中位數 / P75 高標 · 色條=帶寬範圍")
                    : t("P50 midpoint salary","P50 市場中位薪資")}
                </div>
              </div>
              {/* vs Market badge — shown when actual salary is entered */}
              {isBelowP25 && (
                <div style={{ padding: "5px 12px", borderRadius: 20, background: "#fff3cd", border: "1px solid #ffc10740", color: "#92600a", fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono','Noto Sans TC',monospace", whiteSpace: "nowrap" }}>
                  {t("⚠ Below P25 — Retention Risk", "⚠ 低於 P25 — 留才風險")}
                </div>
              )}
              {isAtP25 && (
                <div style={{ padding: "5px 12px", borderRadius: 20, background: "#fff8e1", border: "1px solid #ffd96a40", color: "#b7791f", fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono','Noto Sans TC',monospace", whiteSpace: "nowrap" }}>
                  {t("vs Market: Below Midpoint", "市場對比：低於中位數 — 留才風險")}
                </div>
              )}
            </div>

            {showBand ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${lvls.length}, 1fr)`, gap: 8 }}>
                {lvls.map((l, li) => {
                  const band = gBand(c.id, selFam, selSub, track, li);
                  return <BandCell key={l.id} band={band} actual={actual} color={bC[ci]} usdt={usdt} lvlId={l.id.toUpperCase()} lang={lang} />;
                })}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${lvls.length}, 1fr)`, gap: 8 }}>
                {lvls.map((l, li) => {
                  const v = gS(c.id, selFam, selSub, track, li);
                  const mx = Math.max(...sel.map(x => gS(x.id, selFam, selSub, track, lvls.length - 1)));
                  // Alternating row background: odd levels slightly more visible
                  const altBg = li % 2 === 0 ? `${bC[ci]}06` : `${bC[ci]}0e`;
                  const altBorder = li % 2 === 0 ? `${bC[ci]}18` : `${bC[ci]}28`;
                  return (
                    <div key={l.id} style={{ padding: "10px 12px", borderRadius: 8, background: altBg, border: `1px solid ${altBorder}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: bC[ci], fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 4 }}>{l.id.toUpperCase()}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: bC[ci], marginBottom: 6 }}>{fmt(v, usdt)}</div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{ width: `${mx > 0 ? (v / (mx * 1.08)) * 100 : 0}%`, height: "100%", background: bC[ci], opacity: 0.5, borderRadius: 3, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
        );
      })}

      {/* ── COMPARISON RESULTS ─────────────────────── */}
      {sel.length >= 2 && (() => {
        const ranked = sel.map(c => ({
          c,
          p50: gS(c.id, selFam, selSub, track, selLvl),
          band: gBand(c.id, selFam, selSub, track, selLvl),
        })).sort((a, b) => b.p50 - a.p50);
        const top = ranked[0];
        const bot = ranked[ranked.length - 1];
        const spread = top.p50 > 0 ? (top.p50 / bot.p50).toFixed(1) : 1;
        // COL index (NYC=100)
        const COL = { us:100,gb:88,ch:115,mt:62,ae:82,sg:94,hk:97,jp:78,kr:74,tw:58,ph:38,my:44 };
        const colRanked = sel.map(c => ({
          c, adj: gS(c.id, selFam, selSub, track, selLvl) / (COL[c.id] || 100) * 100,
        })).sort((a, b) => b.adj - a.adj);
        const colTop = colRanked[0];
        // EE tax burden estimate
        const TAX = { us:0.36,gb:0.34,ch:0.32,mt:0.27,ae:0.00,sg:0.28,hk:0.17,jp:0.40,kr:0.35,tw:0.22,ph:0.30,my:0.22 };
        const netRanked = sel.map(c => ({
          c, net: gS(c.id, selFam, selSub, track, selLvl) * (1 - (TAX[c.id] || 0.3)),
        })).sort((a, b) => b.net - a.net);
        const netTop = netRanked[0];
        const cmpLvlLabel = track === "ic" ? `IC${selLvl + 1}` : `M${selLvl + 1}`;

        return (
          <Card glow style={{ marginTop: 16, border: `1px solid ${D.slate}20`, background: `${D.slate}04` }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: D.slate, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 14 }}>
                📊 {t("COMPARISON RESULTS","比較結果")} — {cmpLvlLabel}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                {[
                  {
                    icon: "🥇",
                    title: t("Highest P50","最高市場中位"),
                    country: top.c,
                    value: `${fmt(top.p50, usdt)}`,
                    sub: t(`Band: ${fmt(top.band.p25,usdt)} – ${fmt(top.band.p75,usdt)}`, `帶寬：${fmt(top.band.p25,usdt)} – ${fmt(top.band.p75,usdt)}`),
                    color: D.sage,
                  },
                  {
                    icon: "🔻",
                    title: t("Lowest P50","最低市場中位"),
                    country: bot.c,
                    value: `${fmt(bot.p50, usdt)}`,
                    sub: t(`${spread}× gap vs highest market`, `與最高市場差距 ${spread} 倍`),
                    color: D.clay,
                  },
                  {
                    icon: "💸",
                    title: t("Best Take-Home","稅後最高到手"),
                    country: netTop.c,
                    value: `~${fmt(Math.round(netTop.net), usdt)}`,
                    sub: t("After income tax + social security","扣除所得稅與社保後估算"),
                    color: D.copper,
                  },
                  {
                    icon: "🏠",
                    title: t("Best Purchasing Power","最佳購買力（COL調整）"),
                    country: colTop.c,
                    value: `${fmt(Math.round(colTop.adj), usdt)}`,
                    sub: t("Salary ÷ cost-of-living index (NYC=100)","薪資 ÷ 生活成本指數，紐約=100基準"),
                    color: D.slate,
                  },
                ].map(({ icon, title, country, value, sub, color }) => (
                  <div key={title} style={{ padding: "12px 14px", borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>{icon} <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{title}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{country.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{t(country.n, country.zh)}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color, marginBottom: 3 }}>{value}</div>
                    <div style={{ fontSize: 11, color: D.tx4, lineHeight: 1.4 }}>{sub}</div>
                  </div>
                ))}
              </div>
              {/* Ranking bar */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 11, color: D.tx4, marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>
                  {t("P50 RANKING — all selected countries","P50 排名——所有選定國家")}
                </div>
                {ranked.map((r, i) => (
                  <div key={r.c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 20, fontSize: 12, color: D.tx4, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>#{i+1}</div>
                    <div style={{ width: 22, fontSize: 16 }}>{r.c.flag}</div>
                    <div style={{ width: 80, fontSize: 12, color: D.tx2, fontFamily: "'DM Mono','Noto Sans TC',monospace", fontWeight: 500 }}>{t(r.c.n, r.c.zh)}</div>
                    <div style={{ flex: 1, height: 20, background: "rgba(0,0,0,0.04)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(r.p50 / top.p50) * 100}%`, height: "100%", background: bC[sel.indexOf(r.c)], opacity: 0.5, borderRadius: 4, transition: "width 0.5s", display: "flex", alignItems: "center", paddingLeft: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: "#fff" }}>{fmt(r.p50, usdt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Legend */}
      {showBand && sel.length > 0 && (
        <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { dot: "rect", color: "#aaa",    label: t("P25 — market low (suitable for new hires)","P25 — 市場低標（適合新人）") },
            { dot: "line", color: D.slate,   label: t("P50 — market midpoint (standard offer)","P50 — 市場中位數（標準 Offer 水位）") },
            { dot: "rect", color: D.sage,    label: t("P75 — market high (retention / top talent)","P75 — 市場高標（留才競爭力）") },
            { dot: "dot",  color: "#e67e22", label: t("● Your salary (Compa-Ratio dot)","● 你的薪資（CR 比值點）") },
          ].map(({ dot, color, label }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: D.tx4 }}>
              {dot === "line"
                ? <div style={{ width: 3, height: 14, borderRadius: 2, background: color, opacity: 0.8 }} />
                : dot === "dot"
                ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                : <div style={{ width: 14, height: 8, borderRadius: 3, background: color, opacity: 0.3 }} />
              }
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
