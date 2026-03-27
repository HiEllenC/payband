// DataSources — reusable data attribution footer for each module
// Usage: <DataSources sources={SALARY_SOURCES} t={t} lang={lang} />

const D = {
  tx3: "#475569", tx4: "#94a3b8", slate: "#1a56db", lnF: "rgba(15,23,42,0.04)", ln: "rgba(15,23,42,0.08)",
};

// ── Shared source registry ────────────────────────────────────────────────────
export const SOURCES = {
  // Salary / compensation
  cryptojobslist: {
    name: "CryptoJobsList Salary Report",
    url:  "https://cryptojobslist.com/blog/crypto-web3-salary-report",
    type: "survey", year: "2024",
    zh: "CryptoJobsList 加密薪資報告",
  },
  web3career: {
    name: "Web3.career Salary Data",
    url:  "https://web3.career/web3-salaries",
    type: "platform", year: "2024–2025",
    zh: "Web3.career 薪資數據",
  },
  levelsfyi: {
    name: "Levels.fyi (Crypto Companies)",
    url:  "https://www.levels.fyi/companies/coinbase",
    type: "platform", year: "2024–2025",
    zh: "Levels.fyi 加密公司薪資",
  },
  hays_asia: {
    name: "Hays Asia Salary Guide 2024",
    url:  "https://www.hays.com.sg/salary-guide",
    type: "report", year: "2024",
    zh: "Hays Asia 薪資指南 2024",
  },
  michael_page: {
    name: "Michael Page APAC Salary Benchmark 2024",
    url:  "https://www.michaelpage.com.sg/salary-benchmark",
    type: "report", year: "2024",
    zh: "Michael Page APAC 薪酬基準 2024",
  },
  glassdoor: {
    name: "Glassdoor Salary Insights",
    url:  "https://www.glassdoor.com/Salaries/",
    type: "platform", year: "2024–2025",
    zh: "Glassdoor 薪資洞察",
  },
  // Labor law — government sources
  mom_sg: {
    name: "Singapore MOM — Employment Act",
    url:  "https://www.mom.gov.sg/employment-practices/leave-and-holidays",
    type: "official", year: "2025",
    zh: "新加坡人力部 — 就業法",
  },
  mhlaw_tw: {
    name: "Taiwan MOL — Labor Standards Act",
    url:  "https://www.mol.gov.tw/1607/1632/1633/",
    type: "official", year: "2025",
    zh: "台灣勞動部 — 勞動基準法",
  },
  mohre_ae: {
    name: "UAE MOHRE — Federal Decree-Law No. 33",
    url:  "https://www.mohre.gov.ae/en/laws-and-regulations/laws.aspx",
    type: "official", year: "2024",
    zh: "阿聯酋人力資源部 — 聯邦勞工法",
  },
  dole_ph: {
    name: "Philippines DOLE — Labor Code",
    url:  "https://www.dole.gov.ph/",
    type: "official", year: "2025",
    zh: "菲律賓勞動部 — 勞工法典",
  },
  gov_uk: {
    name: "UK Government — Employment Rights",
    url:  "https://www.gov.uk/browse/employing-people",
    type: "official", year: "2025",
    zh: "英國政府 — 就業權利",
  },
  mhlw_jp: {
    name: "Japan MHLW — Labor Standards",
    url:  "https://www.mhlw.go.jp/english/policy/employ-labour/labour-standards/",
    type: "official", year: "2025",
    zh: "日本厚生勞動省 — 勞動標準",
  },
  moel_kr: {
    name: "Korea MOEL — Labor Standards Act",
    url:  "https://www.moel.go.kr/english/",
    type: "official", year: "2025",
    zh: "韓國勞動部 — 勞動標準法",
  },
  // FX / Crypto
  openexrates: {
    name: "Open Exchange Rates API",
    url:  "https://openexchangerates.org",
    type: "api", year: "Live",
    zh: "開放匯率 API",
  },
  coingecko: {
    name: "CoinGecko API",
    url:  "https://www.coingecko.com/en/api",
    type: "api", year: "Live",
    zh: "CoinGecko API",
  },
};

// Source groups per module
export const MODULE_SOURCES = {
  salary:     ["cryptojobslist", "web3career", "levelsfyi", "hays_asia", "michael_page", "glassdoor"],
  totalcomp:  ["cryptojobslist", "web3career", "levelsfyi", "hays_asia"],
  labor:      ["mom_sg", "mhlaw_tw", "mohre_ae", "dole_ph", "gov_uk", "mhlw_jp", "moel_kr"],
  markets:    ["openexrates", "coingecko"],
  relocation: ["cryptojobslist", "hays_asia", "mom_sg", "mohre_ae"],
  netpay:     ["mom_sg", "mhlaw_tw", "mohre_ae", "gov_uk", "mhlw_jp"],
  allowance:  ["hays_asia", "michael_page", "cryptojobslist"],
  countries:  ["mom_sg", "mhlaw_tw", "mohre_ae", "dole_ph", "gov_uk", "mhlw_jp", "moel_kr", "cryptojobslist"],
};

const TYPE_LABEL = {
  official: { en: "Official", zh: "官方",   color: "#059669" },
  survey:   { en: "Survey",   zh: "調查",   color: "#1a56db" },
  platform: { en: "Platform", zh: "平台",   color: "#7c3aed" },
  report:   { en: "Report",   zh: "報告",   color: "#f59e0b" },
  api:      { en: "Live API", zh: "即時API", color: "#0ea5e9" },
};

export default function DataSources({ module, t, lang, lastUpdated = "2025 Q1" }) {
  const keys = MODULE_SOURCES[module] || [];
  if (!keys.length) return null;

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${D.lnF}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: D.tx4, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
          {t("Data Sources", "資料來源")}
        </div>
        <div style={{ fontSize: 11, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>
          {t(`Last updated: ${lastUpdated}`, `資料更新：${lastUpdated}`)}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {keys.map(key => {
          const s = SOURCES[key];
          if (!s) return null;
          const tl = TYPE_LABEL[s.type] || TYPE_LABEL.report;
          return (
            <a
              key={key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 5,
                background: `${tl.color}08`, border: `1px solid ${tl.color}25`,
                textDecoration: "none", fontSize: 11,
                fontFamily: "'DM Mono','Noto Sans TC',monospace",
                color: D.tx3, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${tl.color}14`; e.currentTarget.style.color = tl.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${tl.color}08`; e.currentTarget.style.color = D.tx3; }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: tl.color, letterSpacing: 1, textTransform: "uppercase" }}>
                {lang === "zh" ? tl.zh : tl.en}
              </span>
              <span>{lang === "zh" ? s.zh : s.name}</span>
              <span style={{ color: D.tx4 }}>↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
