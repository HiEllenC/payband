import { useState, useEffect } from "react";
import Card from "../components/Card.jsx";
import { COUNTRIES } from "../data/countries.js";

// ═══════ DESIGN TOKENS ═══════
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

const FONT = "'DM Mono','Noto Sans TC',monospace";

// ═══════ FX STATIC FALLBACK ═══════
const FX_STATIC = {
  us: { name:"US Dollar",           zh:"美元",           sym:"USD", rate:1.000,  change:0.0,   local:"$"    },
  gb: { name:"British Pound",       zh:"英鎊",           sym:"GBP", rate:0.791,  change:-0.12, local:"£"    },
  ch: { name:"Swiss Franc",         zh:"瑞士法郎",       sym:"CHF", rate:0.894,  change:+0.08, local:"Fr"   },
  mt: { name:"Euro",                zh:"歐元",           sym:"EUR", rate:0.921,  change:-0.05, local:"€"    },
  ae: { name:"UAE Dirham",          zh:"迪拉姆",         sym:"AED", rate:3.673,  change:0.0,   local:"د.إ"  },
  sg: { name:"S$ Dollar",           zh:"新加坡元",       sym:"SGD", rate:1.352,  change:+0.04, local:"S$"   },
  hk: { name:"HK Dollar",           zh:"港元",           sym:"HKD", rate:7.784,  change:+0.01, local:"HK$"  },
  tw: { name:"NT Dollar",           zh:"新台幣",         sym:"TWD", rate:32.48,  change:-0.32, local:"NT$"  },
  jp: { name:"Japanese Yen",        zh:"日圓",           sym:"JPY", rate:148.92, change:-1.20, local:"¥"    },
  kr: { name:"Korean Won",          zh:"韓元",           sym:"KRW", rate:1342.5, change:-8.5,  local:"₩"    },
  ph: { name:"Philippine Peso",     zh:"菲律賓披索",     sym:"PHP", rate:56.18,  change:-0.42, local:"₱"    },
  my: { name:"Malaysian Ringgit",   zh:"馬來西亞令吉",   sym:"MYR", rate:4.718,  change:-0.02, local:"RM"   },
};

// CoinGecko IDs for FX lookup (stablecoins pegged to USD)
const FX_META = {
  us: { name:"US Dollar",         zh:"美元",           sym:"USD", local:"$",   cgId:null          },
  gb: { name:"British Pound",     zh:"英鎊",           sym:"GBP", local:"£",   cgId:"gbp"         },
  ch: { name:"Swiss Franc",       zh:"瑞士法郎",       sym:"CHF", local:"Fr",  cgId:"chf"         },
  mt: { name:"Euro",              zh:"歐元",           sym:"EUR", local:"€",   cgId:"eur"         },
  ae: { name:"UAE Dirham",        zh:"迪拉姆",         sym:"AED", local:"د.إ", cgId:"aed"         },
  sg: { name:"S$ Dollar",         zh:"新加坡元",       sym:"SGD", local:"S$",  cgId:"sgd"         },
  hk: { name:"HK Dollar",         zh:"港元",           sym:"HKD", local:"HK$", cgId:"hkd"         },
  tw: { name:"NT Dollar",         zh:"新台幣",         sym:"TWD", local:"NT$", cgId:"twd"         },
  jp: { name:"Japanese Yen",      zh:"日圓",           sym:"JPY", local:"¥",   cgId:"jpy"         },
  kr: { name:"Korean Won",        zh:"韓元",           sym:"KRW", local:"₩",   cgId:"krw"         },
  ph: { name:"Philippine Peso",   zh:"菲律賓披索",     sym:"PHP", local:"₱",   cgId:"php"         },
  my: { name:"Malaysian Ringgit", zh:"馬來西亞令吉",   sym:"MYR", local:"RM",  cgId:"myr"         },
};

// ═══════ CRYPTO STATIC FALLBACK ═══════
const CRYPTO_STATIC = [
  { rank:1,  icon:"₿",  name:"Bitcoin",       sym:"BTC",  price:84250,  vol24h:38.2, mcap:1665, chg:+2.14 },
  { rank:2,  icon:"Ξ",  name:"Tether",        sym:"USDT", price:1.000,  vol24h:52.8, mcap:140,  chg:+0.01 },
  { rank:3,  icon:"Ξ",  name:"Ethereum",      sym:"ETH",  price:2140,   vol24h:18.6, mcap:258,  chg:+1.82 },
  { rank:4,  icon:"◎",  name:"Solana",        sym:"SOL",  price:142.5,  vol24h:6.8,  mcap:70,   chg:+3.41 },
  { rank:5,  icon:"✕",  name:"XRP",           sym:"XRP",  price:2.28,   vol24h:8.2,  mcap:131,  chg:-0.88 },
  { rank:6,  icon:"⬡",  name:"BNB",           sym:"BNB",  price:548,    vol24h:2.4,  mcap:80,   chg:+0.62 },
  { rank:7,  icon:"◈",  name:"USD Coin",      sym:"USDC", price:1.000,  vol24h:9.1,  mcap:58,   chg:+0.00 },
  { rank:8,  icon:"◆",  name:"Dogecoin",      sym:"DOGE", price:0.182,  vol24h:2.8,  mcap:27,   chg:+5.22 },
  { rank:9,  icon:"▲",  name:"Cardano",       sym:"ADA",  price:0.648,  vol24h:0.9,  mcap:23,   chg:-1.44 },
  { rank:10, icon:"⬡",  name:"Avalanche",     sym:"AVAX", price:26.4,   vol24h:0.6,  mcap:11,   chg:+2.88 },
];

// ═══════ ADOPTION DATA ═══════
const ADOPTION = {
  us:  { score:82, rank:6,  use:"Institutional & ETF",           zh:"機構投資 & ETF"          },
  gb:  { score:74, rank:8,  use:"Trading & fintech",              zh:"交易 & 金融科技"          },
  ch:  { score:71, rank:9,  use:"Crypto Valley (Zug), DeFi",     zh:"加密谷（楚格）、DeFi"     },
  mt:  { score:65, rank:11, use:"Exchange licensing hub",         zh:"交易所牌照中心"            },
  ae:  { score:88, rank:3,  use:"Wealth storage & trading",       zh:"財富儲存與交易"            },
  sg:  { score:85, rank:4,  use:"Regional hub, MAS-regulated",    zh:"區域中心，MAS監管"         },
  hk:  { score:83, rank:5,  use:"Spot ETF, SFC licensed",         zh:"現貨ETF，SFC牌照"          },
  jp:  { score:78, rank:7,  use:"Retail trading (FSA reg.)",      zh:"零售交易（FSA監管）"       },
  kr:  { score:91, rank:2,  use:"Highest retail volume per GDP",  zh:"人均交易量全球最高"        },
  tw:  { score:68, rank:10, use:"Growing retail + Web3 startups", zh:"零售增長 + Web3新創"       },
  ph:  { score:94, rank:1,  use:"Remittance + GameFi (Axie)",     zh:"匯款 + GameFi（Axie）"     },
  my:  { score:62, rank:12, use:"P2P trading, unbanked reach",    zh:"P2P交易，觸達無銀行族群"  },
};

// ═══════ HELPERS ═══════
const Tag = ({ children, color = D.tx3 }) => (
  <span style={{
    fontSize: 11, fontWeight: 500, letterSpacing: 2.5,
    color, fontFamily: FONT, textTransform: "uppercase",
  }}>
    {children}
  </span>
);

const SectionTitle = ({ children }) => (
  <div style={{ marginBottom: 20 }}>
    <Tag color={D.slate}>{children}</Tag>
  </div>
);

const ChgBadge = ({ value }) => {
  const up = value > 0;
  const zero = value === 0;
  const color = zero ? D.tx4 : up ? D.sage : D.wine;
  const sign  = zero ? "" : up ? "+" : "";
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, fontFamily: FONT,
      color,
      background: zero ? "transparent" : up ? "rgba(95,122,97,0.08)" : "rgba(138,85,101,0.08)",
      padding: "2px 6px", borderRadius: 4,
    }}>
      {sign}{value.toFixed(2)}%
    </span>
  );
};

// Mini bar (sparkline-style), value scaled against max
const MiniBar = ({ value, max, color = D.slate }) => {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 72, height: 6, borderRadius: 3,
        background: D.lnF, border: `1px solid ${D.ln}`, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          transition: "width 0.6s cubic-bezier(.22,1,.36,1)",
        }} />
      </div>
      <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT, minWidth: 28 }}>
        {value.toFixed(1)}B
      </span>
    </div>
  );
};

// Score bar for adoption index
const ScoreBar = ({ score, color = D.sage }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 80, height: 6, borderRadius: 3,
      background: D.lnF, border: `1px solid ${D.ln}`, overflow: "hidden",
    }}>
      <div style={{
        width: `${score}%`, height: "100%", borderRadius: 3,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
      }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: FONT, minWidth: 24 }}>
      {score}
    </span>
  </div>
);

// FX trend bar — shows magnitude of change in [-1.5, +1.5] range
const FxTrendBar = ({ change }) => {
  const MAX = 1.5;
  const up   = change > 0;
  const zero = change === 0;
  const absChange = Math.abs(change);
  const pct = zero ? 0 : Math.min(100, (absChange / MAX) * 100);
  const color = zero ? D.tx4 : up ? D.sage : D.wine;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* negative side */}
      <div style={{
        width: 36, height: 5, borderRadius: 3,
        background: D.lnF, border: `1px solid ${D.ln}`, overflow: "hidden",
        display: "flex", justifyContent: "flex-end",
      }}>
        {!up && !zero && (
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 3,
            background: D.wine,
          }} />
        )}
      </div>
      {/* center tick */}
      <div style={{ width: 1, height: 10, background: D.ln }} />
      {/* positive side */}
      <div style={{
        width: 36, height: 5, borderRadius: 3,
        background: D.lnF, border: `1px solid ${D.ln}`, overflow: "hidden",
      }}>
        {up && (
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 3,
            background: D.sage,
          }} />
        )}
      </div>
      <span style={{
        fontSize: 11, fontFamily: FONT, minWidth: 44, textAlign: "right",
        color: zero ? D.tx4 : color, fontWeight: 500,
      }}>
        {zero ? "—" : (up ? "+" : "") + change.toFixed(2)}
      </span>
    </div>
  );
};

// Rank badge for adoption
const RankBadge = ({ rank }) => {
  const color = rank === 1 ? D.copper : rank <= 3 ? D.clay : D.slate;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 6,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: FONT }}>
        {rank}
      </span>
    </div>
  );
};

// ═══════ GUIDE CARDS ═══════
const GUIDES = (t) => [
  {
    icon: "⇄",
    title: t("FX Rates", "外匯匯率"),
    body: t(
      "Live-equivalent rates for all 12 platform currencies vs USD. Toggle to USDT to see stablecoin parity. 24h change reflects interbank movement.",
      "平台12國貨幣對美元的即時等效匯率。切換至USDT可查看穩定幣平價。24小時變動反映銀行間市場走勢。"
    ),
    color: D.slate,
  },
  {
    icon: "▲",
    title: t("Top 10 by Volume", "成交量前10幣種"),
    body: t(
      "Ranked by 24-hour trading volume (USD billions). High volume signals liquidity — important for payroll conversion and treasury ops.",
      "依24小時交易量（十億美元）排名。高成交量代表高流動性，對薪資換匯與資金管理至關重要。"
    ),
    color: D.copper,
  },
  {
    icon: "◎",
    title: t("Stablecoins", "穩定幣"),
    body: t(
      "USDT and USDC dominate crypto payroll rails. Their combined 24h volume often exceeds BTC — reflecting institutional settlement demand.",
      "USDT與USDC主導加密薪資支付管道。兩者合計的24小時交易量時常超越BTC，反映機構結算需求。"
    ),
    color: D.sage,
  },
  {
    icon: "◈",
    title: t("Adoption Index", "加密採用指數"),
    body: t(
      "Composite score (0–100) based on retail penetration, regulatory clarity, exchange volume, and Web3 startup density across the 12 platform countries.",
      "綜合指數（0–100），涵蓋零售滲透率、法規清晰度、交易所交易量，以及12個平台國家的Web3新創密度。"
    ),
    color: D.wine,
  },
];

// ═══════ TABLE HEADER STYLE ═══════
const TH = ({ children, align = "left", width }) => (
  <th style={{
    padding: "8px 12px",
    textAlign: align,
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.8,
    color: D.tx4,
    textTransform: "uppercase",
    borderBottom: `1px solid ${D.ln}`,
    background: D.lnF,
    whiteSpace: "nowrap",
    width,
  }}>
    {children}
  </th>
);

const TD = ({ children, align = "left", style: extra = {} }) => (
  <td style={{
    padding: "10px 12px",
    textAlign: align,
    fontFamily: FONT,
    fontSize: 13,
    color: D.tx,
    borderBottom: `1px solid ${D.lnF}`,
    verticalAlign: "middle",
    ...extra,
  }}>
    {children}
  </td>
);

// ─── CoinGecko coin IDs for top-10 by volume ───────────────────────────────
const CG_COINS = [
  { cgId: "bitcoin",      icon: "₿", sym: "BTC"  },
  { cgId: "tether",       icon: "Ξ", sym: "USDT" },
  { cgId: "ethereum",     icon: "Ξ", sym: "ETH"  },
  { cgId: "solana",       icon: "◎", sym: "SOL"  },
  { cgId: "ripple",       icon: "✕", sym: "XRP"  },
  { cgId: "binancecoin",  icon: "⬡", sym: "BNB"  },
  { cgId: "usd-coin",     icon: "◈", sym: "USDC" },
  { cgId: "dogecoin",     icon: "◆", sym: "DOGE" },
  { cgId: "cardano",      icon: "▲", sym: "ADA"  },
  { cgId: "avalanche-2",  icon: "⬡", sym: "AVAX" },
];

// 1 USDT ≈ 1 USD — same rate applies
function usdtRate(rate) { return rate; }

// ─── LocalStorage cache helpers ──────────────────────────────────────────────
const CACHE_KEY = "payband_crypto_v1";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes — CoinGecko free: 30 req/min

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
    return null; // stale
  } catch { return null; }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({ lang }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 8 }}>
    <div style={{
      width: 16, height: 16, border: `2px solid ${D.ln}`,
      borderTop: `2px solid ${D.slate}`, borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ fontSize: 13, color: D.tx4, fontFamily: FONT }}>{lang === "zh" ? "載入即時數據中…" : "Loading live data…"}</span>
  </div>
);

// ─── Live badge ─────────────────────────────────────────────────────────────
const LiveBadge = ({ status, timeStr, lang }) => {
  const cfg = {
    live:   { dot: D.sage,  text: D.sage,  label: lang === "zh" ? `即時 · ${timeStr}` : `LIVE · ${timeStr}` },
    cached: { dot: D.copper, text: D.copper, label: lang === "zh" ? `快取 · ${timeStr}` : `CACHED · ${timeStr}` },
    static: { dot: D.tx4,   text: D.tx4,   label: lang === "zh" ? "靜態數據" : "STATIC DATA" },
  }[status] ?? { dot: D.tx4, text: D.tx4, label: "—" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.dot,
        boxShadow: status === "live" ? `0 0 0 2px rgba(95,122,97,0.25)` : "none",
      }} />
      <span style={{ fontSize: 11, color: cfg.text, fontFamily: FONT, fontWeight: 500 }}>
        {cfg.label}
      </span>
    </div>
  );
};

// ═══════ MAIN COMPONENT ═══════
export default function Markets({ lang, t, usdt }) {
  const [crypto, setCrypto] = useState(null);
  const [fx, setFx] = useState(null);
  const [cryptoStatus, setCryptoStatus] = useState("static"); // "live" | "cached" | "static"
  const [fxStatus, setFxStatus] = useState("static");
  const [cryptoTimeStr, setCryptoTimeStr] = useState("");
  const [fxTimeStr, setFxTimeStr] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [fxLoading, setFxLoading] = useState(true);

  // Fetch CoinGecko — with localStorage cache (TTL 2 min)
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setCrypto(cached.data);
      setCryptoStatus("cached");
      setCryptoTimeStr(fmtTime(cached.ts));
      setCryptoLoading(false);
      return;
    }
    const ids = CG_COINS.map(c => c.cgId).join(",");
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=total_volume_desc&per_page=10&sparkline=false&price_change_percentage=24h`
    )
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const sorted = [...data].sort((a, b) => b.total_volume - a.total_volume);
        const mapped = sorted.map((d, i) => {
          const meta = CG_COINS.find(c => c.cgId === d.id) ?? {};
          return {
            rank: i + 1,
            icon: meta.icon ?? "◆",
            name: d.name,
            sym: d.symbol.toUpperCase(),
            price: d.current_price,
            vol24h: d.total_volume / 1e9,
            mcap: d.market_cap / 1e9,
            chg: d.price_change_percentage_24h ?? 0,
          };
        });
        saveCache(mapped);
        setCrypto(mapped);
        setCryptoStatus("live");
        setCryptoTimeStr(fmtTime(Date.now()));
      })
      .catch(() => {
        setCrypto(CRYPTO_STATIC);
        setCryptoStatus("static");
      })
      .finally(() => setCryptoLoading(false));
  }, []);

  // Fetch open.er-api.com FX rates — no cache needed (free tier: 1500/month)
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data.result !== "success") throw new Error("API error");
        const rates = data.rates;
        const built = {};
        Object.entries(FX_META).forEach(([id, meta]) => {
          const sym = meta.sym;
          const liveRate = sym === "USD" ? 1.0 : (rates[sym] ?? null);
          const staticEntry = FX_STATIC[id];
          built[id] = { ...meta, rate: liveRate ?? staticEntry.rate };
        });
        setFx(built);
        setFxStatus("live");
        // open.er-api returns time_last_update_utc
        setFxTimeStr(fmtTime(Date.now()));
      })
      .catch(() => {
        setFx(Object.fromEntries(Object.entries(FX_STATIC).map(([k, v]) => [k, { ...v }])));
        setFxStatus("static");
      })
      .finally(() => setFxLoading(false));
  }, []);

  const guides = GUIDES(t);
  const liveCrypto = crypto ?? CRYPTO_STATIC;
  const liveFx = fx ?? Object.fromEntries(Object.entries(FX_STATIC).map(([k, v]) => [k, { ...v }]));
  const maxVol = Math.max(...liveCrypto.map(c => c.vol24h));
  const countryMap = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));

  // Sort adoption by rank
  const adoptionRows = Object.entries(ADOPTION)
    .sort(([, a], [, b]) => a.rank - b.rank);

  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Guide cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
        {guides.map((g, i) => (
          <Card key={i} glow style={{ minHeight: 0 }}>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${g.color}14`, border: `1px solid ${g.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, color: g.color, flexShrink: 0,
                }}>
                  {g.icon}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: g.color,
                  fontFamily: FONT, letterSpacing: 0.3,
                }}>
                  {g.title}
                </span>
              </div>
              <p style={{
                fontSize: 12, color: D.tx3, lineHeight: 1.75,
                margin: 0, fontFamily: FONT,
              }}>
                {g.body}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 — TOP 10 CRYPTO (moved to top)
      ══════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle>
          {t("01 — Top 10 Crypto by 24h Volume", "01 — 24小時成交量前10幣種")}
        </SectionTitle>

        <Card glow>
          <div style={{ padding: "20px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: D.tx, fontFamily: FONT }}>
                  {t("Global Crypto Markets", "全球加密貨幣市場")}
                </span>
                <LiveBadge status={cryptoStatus} timeStr={cryptoTimeStr} lang={lang} />
              </div>
              <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT }}>
                {t("Prices in USD · Volume in USD billions", "價格單位：美元 · 交易量單位：十億美元")}
              </span>
            </div>

            {cryptoLoading ? <Spinner lang={lang} /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH width={32}>#</TH>
                    <TH>{t("Asset", "資產")}</TH>
                    <TH align="right">{t("Price", "價格")}</TH>
                    <TH align="right">{t("24h Vol (B)", "24h量（B）")}</TH>
                    <TH align="right">{t("Mkt Cap (B)", "市值（B）")}</TH>
                    <TH align="right">{t("24h Δ", "24h漲跌")}</TH>
                    <TH>{t("Volume Bar", "成交量")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {liveCrypto.map((c, idx) => {
                    const rowBg = idx % 2 === 0 ? "transparent" : D.lnF;
                    const isStable = c.sym === "USDT" || c.sym === "USDC";
                    const rankColor = c.rank === 1 ? D.copper : c.rank <= 3 ? D.clay : D.slate;
                    const barColor = isStable ? D.sage : c.chg >= 0 ? D.slate : D.wine;
                    let priceStr;
                    if (c.price >= 10000) priceStr = "$" + c.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
                    else if (c.price >= 1) priceStr = "$" + c.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
                    else priceStr = "$" + c.price.toFixed(3);
                    return (
                      <tr key={c.sym} style={{ background: rowBg }}>
                        <TD>
                          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FONT, color: rankColor, background: `${rankColor}12`, padding: "2px 6px", borderRadius: 4 }}>
                            {c.rank}
                          </span>
                        </TD>
                        <TD>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18, width: 28, textAlign: "center", color: isStable ? D.sage : D.copper }}>{c.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: FONT }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: D.tx4, fontFamily: FONT, letterSpacing: 1.2 }}>
                                {c.sym}
                                {isStable && (
                                  <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: D.sage, background: "rgba(95,122,97,0.12)", padding: "1px 5px", borderRadius: 3 }}>
                                    {t("STABLE", "穩定幣")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD align="right"><span style={{ fontFamily: FONT, fontWeight: 600, color: D.ink, fontSize: 13 }}>{priceStr}</span></TD>
                        <TD align="right"><span style={{ fontFamily: FONT, color: D.tx, fontSize: 13 }}>${c.vol24h.toFixed(1)}B</span></TD>
                        <TD align="right"><span style={{ fontFamily: FONT, color: D.tx3, fontSize: 12 }}>${c.mcap >= 1000 ? (c.mcap/1000).toFixed(2)+"T" : c.mcap.toFixed(0)+"B"}</span></TD>
                        <TD align="right"><ChgBadge value={c.chg} /></TD>
                        <TD><MiniBar value={c.vol24h} max={maxVol} color={barColor} /></TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
            {!cryptoLoading && (() => {
              const stables = liveCrypto.filter(c => c.sym === "USDT" || c.sym === "USDC");
              const stableVol = stables.reduce((s, c) => s + c.vol24h, 0);
              const btc = liveCrypto.find(c => c.sym === "BTC");
              const pct = btc && btc.vol24h > 0 ? ((stableVol / btc.vol24h - 1) * 100).toFixed(0) : "62";
              return (
                <div style={{ display: "flex", gap: 20, marginTop: 14, padding: "10px 12px", background: D.lnF, borderRadius: 6, border: `1px solid ${D.ln}` }}>
                  <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT }}>
                    {t(
                      `Combined USDT+USDC 24h volume: $${stableVol.toFixed(1)}B — exceeds BTC by ${pct}%. Stablecoins are the dominant payroll settlement rail.`,
                      `USDT+USDC合計24h交易量：$${stableVol.toFixed(1)}B — 超越BTC達${pct}%。穩定幣已成為最主流的薪資結算管道。`
                    )}
                  </span>
                </div>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — FX RATES
      ══════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle>
          {t("02 — FX Rates", "02 — 外匯匯率")}
        </SectionTitle>

        <Card glow>
          <div style={{ padding: "20px 24px 16px" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: D.tx, fontFamily: FONT }}>
                    {t("Currency vs ", "貨幣對")}
                  </span>
                  <span style={{
                    fontSize: 15, fontWeight: 700, fontFamily: FONT,
                    color: usdt ? D.sage : D.copper,
                    background: usdt ? "rgba(95,122,97,0.10)" : "rgba(150,113,74,0.10)",
                    padding: "1px 8px", borderRadius: 4, marginLeft: 4,
                  }}>
                    {usdt ? "USDT" : "USD"}
                  </span>
                </div>
                <LiveBadge status={fxStatus} timeStr={fxTimeStr} lang={lang} />
              </div>
              <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT }}>
                {fxStatus === "live"
                  ? t("Live rate · open.er-api.com", "即時匯率 · open.er-api.com")
                  : t("Indicative rate · Early 2026", "參考匯率 · 2026年初")}
              </span>
            </div>

            {fxLoading ? <Spinner lang={lang} /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH width={40}>{t("Flag", "旗")}</TH>
                    <TH>{t("Currency", "貨幣")}</TH>
                    <TH>{t("Code", "代碼")}</TH>
                    <TH align="right">
                      {usdt
                        ? t("1 USDT =", "1 USDT =")
                        : t("1 USD =", "1 USD =")}
                    </TH>
                    <TH align="right">{t("Local → USD", "本幣→USD")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(liveFx).map(([id, fx], idx) => {
                    const country = countryMap[id];
                    const displayRate = usdt ? usdtRate(fx.rate) : fx.rate;
                    const reverseRate = displayRate === 0 ? 0 : (1 / displayRate);
                    const isUSD = id === "us";
                    const rowBg = idx % 2 === 0 ? "transparent" : D.lnF;
                    return (
                      <tr key={id} style={{ background: rowBg }}>
                        <TD>
                          <span style={{ fontSize: 20, lineHeight: 1 }}>
                            {country?.flag ?? "🏳️"}
                          </span>
                        </TD>
                        <TD>
                          <span style={{ fontSize: 13, color: D.tx, fontFamily: FONT }}>
                            {lang === "zh" ? fx.zh : fx.name}
                          </span>
                        </TD>
                        <TD>
                          <span style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
                            color: D.slate, fontFamily: FONT,
                            background: "rgba(84,99,120,0.08)",
                            padding: "2px 6px", borderRadius: 4,
                          }}>
                            {fx.sym}
                          </span>
                        </TD>
                        <TD align="right">
                          <span style={{ fontFamily: FONT, fontWeight: 600, color: D.ink }}>
                            {isUSD && usdt
                              ? "1.000 $"
                              : `${displayRate.toLocaleString("en-US", { minimumFractionDigits: displayRate >= 100 ? 1 : 3, maximumFractionDigits: displayRate >= 100 ? 1 : 3 })} ${fx.local}`}
                          </span>
                        </TD>
                        <TD align="right">
                          <span style={{ fontSize: 12, color: D.tx3, fontFamily: FONT }}>
                            {isUSD
                              ? "—"
                              : `${fx.local} 1 = $${reverseRate.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
                          </span>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}

            <p style={{ fontSize: 11, color: D.tx4, margin: "14px 0 0", fontFamily: FONT }}>
              {t(
                "Rates expressed as local currency units per 1 USD (or 1 USDT when toggled).",
                "匯率以每1美元（或切換後每1 USDT）可兌換之本幣單位表示。"
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3 — CRYPTO ADOPTION INDEX
      ══════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle>
          {t("03 — Crypto Adoption Index", "03 — 加密貨幣採用指數")}
        </SectionTitle>

        <Card glow>
          <div style={{ padding: "20px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: D.tx, fontFamily: FONT }}>
                {t("12 Platform Countries · Composite Score 0–100", "12個平台國家 · 綜合指數 0–100")}
              </span>
              <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT }}>
                {t("Based on penetration, regulation, volume & Web3 density", "綜合滲透率、法規、交易量與Web3密度")}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {adoptionRows.map(([id, ad]) => {
                const country = countryMap[id];
                const fx = FX_META[id];
                const scoreColor = ad.score >= 90 ? D.clay : ad.score >= 80 ? D.slate : ad.score >= 70 ? D.sage : D.tx3;
                return (
                  <div key={id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 8,
                    background: D.surface,
                    border: `1px solid ${D.ln}`,
                    transition: "border-color 0.2s",
                  }}>
                    <RankBadge rank={ad.rank} />
                    <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
                      {country?.flag ?? "🏳️"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: D.tx, fontFamily: FONT }}>
                          {lang === "zh" ? country?.zh : country?.n}
                        </span>
                        <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT, letterSpacing: 1 }}>
                          {fx?.sym}
                        </span>
                      </div>
                      <ScoreBar score={ad.score} color={scoreColor} />
                      <div style={{
                        fontSize: 11, color: D.tx3, fontFamily: FONT,
                        marginTop: 5, lineHeight: 1.5,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {lang === "zh" ? ad.zh : ad.use}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap",
              padding: "10px 12px", background: D.lnF, borderRadius: 6,
              border: `1px solid ${D.ln}`,
            }}>
              {[
                { range: "90–100", color: D.clay,  label: t("Pioneer", "先驅市場")   },
                { range: "80–89",  color: D.slate, label: t("Advanced", "成熟市場")   },
                { range: "70–79",  color: D.sage,  label: t("Growing", "成長市場")    },
                { range: "60–69",  color: D.tx3,   label: t("Emerging", "新興市場")   },
              ].map(lg => (
                <div key={lg.range} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: lg.color,
                  }} />
                  <span style={{ fontSize: 11, color: D.tx4, fontFamily: FONT }}>
                    <span style={{ color: lg.color, fontWeight: 600 }}>{lg.range}</span>
                    {" "}{lg.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          DISCLAIMER
      ══════════════════════════════════════════ */}
      <Card glow>
        <div style={{
          padding: "14px 20px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 16, color: D.tx4, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2, color: D.tx4,
              textTransform: "uppercase", fontFamily: FONT, display: "block",
              marginBottom: 4,
            }}>
              {t("Disclaimer", "免責聲明")}
            </span>
            <p style={{ fontSize: 12, color: D.tx4, margin: 0, lineHeight: 1.75, fontFamily: FONT }}>
              {t(
                "Crypto data: CoinGecko API (live, refreshed on page load). FX rates: open.er-api.com (live). Adoption scores are editorial estimates and not real-time. Rates are indicative and do not represent executable quotes.",
                "加密貨幣數據來源：CoinGecko API（即時，每次載入頁面時刷新）。匯率來源：open.er-api.com（即時）。採用指數為編輯估算，非即時數據。所有匯率僅供參考，不代表可執行報價。"
              )}
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
