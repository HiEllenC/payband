# Payband — Cross-Border Crypto Compensation Intelligence Platform

## Project Overview
A React-based salary intelligence platform for the crypto exchange industry, covering 12 countries, 12 job families, 48 subfunctions, and 10 career levels (dual-track IC/Management).

## Owner
Ellen Chuang — Head of C&B at Andes Group (multi-entity crypto/fintech holding company). 5+ years cross-border compensation experience across PH/TW/SG/MY/UAE.

## Tech Stack
- **Framework:** React (single-page app)
- **Fonts:** DM Mono + Noto Sans TC (Google Fonts)
- **Styling:** Inline styles (no CSS framework)
- **API:** Anthropic Claude API for AI Daily Briefing module
- **Storage:** Browser localStorage via window.storage API
- **Deploy target:** Netlify (static site)
- **Language:** Bilingual Traditional Chinese / English with runtime toggle

## Architecture

### 7 Main Modules (Tabs)
1. **HOME** — Landing page with hero, stats, feature cards
2. **SALARY** — Salary matrix: Job Family → Subfunction → Track → Level × Country
3. **TOTAL COMP** — Side-by-side comparison chart + breakdown table (Base/Bonus/Token/ER Cost/Allowance)
4. **LABOR LAW** — 20 categories × 5 dimensions across 12 countries (with section groupings)
5. **CALENDAR** — 3 views: Attendance Sheet / Monthly Calendar / Year Comparison. 2025-2027 holiday DB with type tags (R/S/O/B)
6. **REGULATION** — 3 views: Timeline (diff tags: NEW/AMENDED/REVOKED/PROPOSED), Framework matrix, AI Daily News
7. **COUNTRIES** — Country profiles with deep-dive detail pages

### Data Model
- **12 Countries:** US, GB, CH, MT, AE, SG, HK, TW, JP, KR, PH, MY
- **12 Job Families:** ENG, TRD, CMP, PRD, MKT, BD, FIN, HR, SEC, DAT, OPS, CS
- **48 Subfunctions** with salary modifiers
- **Dual Track:** IC (IC1-IC5) + Management (M1-M5), each with scope descriptions
- **Salary formula:** `base × country_multiplier × subfunction_modifier`
- **Total Comp:** TC[country] has bonus%, token%, er%, allow%, multi
- **Holiday DB:** HOLIDAYS_DB[year][country] = [{m, d, n, z, t}]
- **Holiday types:** R=Regular, S=Special Non-Working (PH), O=Observed/Substitute, B=Bank Holiday (GB)

### Design System
- Palette: slate=#546378, sage=#5f7a61, copper=#96714a, clay=#a06b52, wine=#8a5565
- Background: warm grey #eae8e4
- Cards: frosted glass with backdrop-filter blur
- All text bilingual via `t(en, zh)` helper

## Coding Conventions
- **Language:** All user-facing text must be bilingual (EN + Traditional Chinese 繁體中文)
- **No external UI libraries** — pure React + inline styles
- **Font family:** Always include `'DM Mono','Noto Sans TC',monospace`
- **Data accuracy:** Holiday dates must be verified against official government sources
- **Philippines:** Always distinguish Regular holidays (200% pay) vs Special Non-Working (130% pay)
- **Calendar:** Week starts on Monday (ISO standard)
- **UAE:** Weekends are Saturday-Sunday (changed 2022)

## Planned Evolution (see docs/ROADMAP.md)
- Phase 1: Salary Range P25/50/75, Token Vesting Simulator, Relocation Calculator, Gross-to-Net
- Phase 2: Allowance Details, PPP, Work Visa, Country-specific Salary Curves
- Phase 3: PDF Export, PE/Contractor Guide, More Countries, Multi-Currency
- Phase 4: Org Cost Simulator, Scenario Planning, Compa-Ratio Analytics

## File Structure (target)
```
src/
  App.jsx              — Main app shell, routing, Header, BG
  data/
    countries.js       — COUNTRIES array with labor law data
    jobs.js            — FAMS, JLVL, CM, FB, SM
    totalcomp.js       — TC structure per country
    holidays.js        — HOLIDAYS_DB (2025-2027)
    regulations.js     — REG_TIMELINE, REG_FRAMEWORK
  components/
    Card.jsx           — Reusable glass card component
    WorldMap.jsx       — Country selector (region-grouped)
    JobSelector.jsx    — Job family/role/track/level picker
    Num.jsx            — Animated number counter
  modules/
    Home.jsx
    Salary.jsx
    TotalComp.jsx
    LaborLaw.jsx
    Calendar.jsx
    Regulation.jsx
    Countries.jsx
  utils/
    salary.js          — gS() salary calculator, fmt()
    i18n.js            — t() translation helper
docs/
  ROADMAP.md           — Full evolution roadmap
```
