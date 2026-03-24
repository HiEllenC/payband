/**
 * Official government labor law sources — 12 countries
 * Tier 1: English, well-structured (high Claude confidence expected)
 * Tier 2: Non-English / complex (requires translation step)
 */
export const SOURCES = [
  // ─── TIER 1: English ───────────────────────────────────────────────────────
  {
    id: "sg",
    name: "Singapore",
    tier: 1,
    lang: "en",
    urls: [
      "https://www.mom.gov.sg/employment-practices/leave/annual-leave/entitlement",
      "https://www.mom.gov.sg/employment-practices/leave/maternity-leave/eligibility-and-entitlement",
      "https://www.mom.gov.sg/employment-practices/leave/paternity-leave",
      "https://www.mom.gov.sg/employment-practices/hours-of-work-overtime-and-rest-days",
      "https://www.mom.gov.sg/employment-practices/retrenchment/retrenchment-benefits",
    ],
  },
  {
    id: "hk",
    name: "Hong Kong",
    tier: 1,
    lang: "en",
    urls: [
      "https://www.labour.gov.hk/eng/legislat/content2.htm",
      "https://www.labour.gov.hk/eng/news/mwo.htm",
    ],
  },
  {
    id: "ae",
    name: "UAE",
    tier: 1,
    lang: "en",
    urls: [
      "https://mohre.gov.ae/en/laws-regulations.aspx",
      "https://u.ae/en/information-and-services/jobs/types-of-leave-for-employees-in-the-private-sector",
    ],
  },
  {
    id: "ph",
    name: "Philippines",
    tier: 1,
    lang: "en",
    urls: [
      "https://www.dole.gov.ph/labor-laws/",
      "https://www.officialgazette.gov.ph/labor-code/",
    ],
  },
  {
    id: "my",
    name: "Malaysia",
    tier: 1,
    lang: "en",
    urls: [
      "https://www.mohr.gov.my/en/",
      "https://www.ecos.com.my/en/resources/employment-act",
    ],
  },
  {
    id: "gb",
    name: "United Kingdom",
    tier: 1,
    lang: "en",
    urls: [
      "https://www.gov.uk/holiday-entitlement-rights",
      "https://www.gov.uk/maternity-pay-leave",
      "https://www.gov.uk/paternity-pay-leave",
      "https://www.gov.uk/redundancy-your-rights",
      "https://www.gov.uk/national-minimum-wage-rates",
    ],
  },
  {
    id: "mt",
    name: "Malta",
    tier: 1,
    lang: "en",
    urls: [
      "https://legislation.mt/eli/cap/452/eng/pdf",
    ],
  },

  // ─── TIER 2: Non-English / Complex ─────────────────────────────────────────
  {
    id: "tw",
    name: "Taiwan",
    tier: 2,
    lang: "zh-TW",
    translateFirst: true,
    urls: [
      "https://laws.mol.gov.tw/Eng/FLAW/FLAWDAT0101.aspx", // English version
    ],
  },
  {
    id: "jp",
    name: "Japan",
    tier: 2,
    lang: "ja",
    translateFirst: true,
    urls: [
      "https://www.mhlw.go.jp/english/policy/employ-labour/labour-standards/dl/09.pdf",
    ],
  },
  {
    id: "kr",
    name: "South Korea",
    tier: 2,
    lang: "ko",
    translateFirst: true,
    urls: [
      "https://www.moel.go.kr/english/poli/poliLaw_view.do?bbs_seq=20130200370",
    ],
  },
  {
    id: "us",
    name: "United States",
    tier: 2,
    lang: "en",
    complex: true, // federal + state patchwork
    urls: [
      "https://www.dol.gov/general/topic/workhours",
      "https://www.dol.gov/general/topic/wages/minimumwage",
      "https://www.dol.gov/general/topic/benefits/fmla",
    ],
  },
  {
    id: "ch",
    name: "Switzerland",
    tier: 2,
    lang: "de",
    translateFirst: true,
    urls: [
      "https://www.seco.admin.ch/seco/en/home/Arbeit/Arbeitsbedingungen/arbeitsrecht.html",
    ],
  },
];
