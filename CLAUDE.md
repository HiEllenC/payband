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

## Language
- 所有 Agent 以繁體中文溝通，技術術語保留英文
- 程式碼註解使用英文

## Netlify 部署規則（所有 Agent 必須遵守）

### 部署限制
- 每次部署都有成本，**每天最多 5 次部署**
- **禁止任何 Agent 自行執行部署**，所有部署必須經過 Ellen 本人確認
- 修改完成後，先在本機預覽確認效果，不要直接 push

### 工作流程
1. 所有修改先在本機完成
2. 使用 `npx netlify dev` 或直接開瀏覽器檢查效果
3. 反覆修改直到接近完整
4. 準備好後，通知 Ellen 並附上修改摘要
5. Ellen 確認後才可以 git push（觸發 Netlify 自動部署）
6. 如果當天已部署 5 次但仍需更多，必須明確告知 Ellen 並說明原因

### 禁止指令
- ❌ `git push`（任何遠端推送）
- ❌ `netlify deploy`（任何 Netlify CLI 部署）
- ❌ 任何會觸發遠端部署的操作
- ✅ `git add` 和 `git commit`（本機操作，不花錢）
- ✅ `npx netlify dev`（本機預覽，不花錢）

## 專業 Agent 團隊（Payband 專用）

在這個專案裡，除了通用 agents，優先使用以下專業角色：

| Agent | 何時用 |
|-------|--------|
| `salary-matrix-auditor` | 更新 FB/CM/SM 數據、懷疑薪資數字不對、新增職能時 |
| `labor-law-auditor` | 更新法規內容、新增/修改節假日 DB、懷疑法規數值有誤時 |
| `crypto-comp-reviewer` | 開發 VestingSim、TotalComp、Relocation、GrossToNet 時 |
| `hr-ux-reviewer` | 設計新模組 UI、重大改版前、確認 HR 用戶流程是否順暢時 |
| `data-validator` | 快速掃描所有數據層問題（通用版） |
| `i18n-checker` | 確認中英文雙語完整性 |

### 標準審查流程（重大改動前）
```
用 subagents 平行審查：
- salary-matrix-auditor 驗證薪資數據
- labor-law-auditor 驗證法規和節假日
- i18n-checker 確認雙語完整
- code-reviewer 審查程式碼品質
- hr-ux-reviewer 確認 HR 用戶體驗
不要修改，給我審查報告。
```

## 協作守則
- 誠實回報問題，不要為了客氣而隱藏風險
- 不確定的事情直接說「不確定」，不要猜測
- 每個 Agent 完成任務後，輸出簡潔的完成摘要
- 修改程式碼時遵循最小改動原則

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
