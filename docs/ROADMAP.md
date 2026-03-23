# Payband 進化路線圖
## Evolution Roadmap — Based on 6 C&B Expert Review

---

## 📊 Current State (v1.x Milestone)
- **Lines of code:** 1,940
- **7 Modules:** Home, Salary, Total Comp, Labor Law, Calendar, Regulation, Countries
- **12 Countries × 12 Job Families × 48 Subfunctions × 10 Levels**
- **3-Year Holiday DB** with type classification (R/S/O/B)
- **AI Daily Briefing** with web search integration

---

## 🔴 PHASE 1 — Core Compensation Intelligence (P0)
> *"Make it a decision tool, not a display tool"* — Ellen

### 1A. Salary Range P25/P50/P75
- Replace single point value with salary band
- Each level × country shows Min(P25) / Mid(P50) / Max(P75)
- Visual: range bar with marker showing position
- Add Compa-Ratio input: user enters actual salary → shows position in band

### 1B. Token/Equity Vesting Simulator
- Vesting structures: 4yr/1yr cliff, monthly/quarterly/annual
- Token price volatility slider (±50%)
- Output: Year-by-year vesting schedule with USD value at different price points
- Compare vesting across countries (tax treatment differs)

### 1C. Relocation Cost Calculator (From → To)
- Select: Origin Country → Destination Country → Role → Level
- Auto-calculate: Salary delta, Tax delta, Social Security delta
- Add: Visa processing cost, Relocation package estimate
- Output: One-page comparison card

### 1D. Gross-to-Net Calculator
- Input: Gross annual salary by country
- Calculate: Income tax (progressive brackets), Social security (EE), Net take-home
- Show monthly and annual breakdown
- Compare across countries for same gross amount

---

## 🟡 PHASE 2 — Deep Compensation Structure (P1)

### 2A. Allowance Detail Breakdown
- Expand "津貼" from single % to itemized:
  - Housing, Education, Transport, Annual Airfare, Relocation, Meal, Phone
- Country-specific: UAE has all; SG has some; US has almost none
- Impact on total employer cost

### 2B. PPP (Purchasing Power Parity) Layer
- Add Big Mac Index / PPP multiplier per country
- Show "PPP-adjusted salary" alongside nominal
- Visual: what $100K buys in each country

### 2C. Work Visa / Immigration Module
- Visa types per country (EP, S Pass, Work Permit, etc.)
- Minimum salary thresholds for each visa type
- Processing time, quota limits, renewal rules
- Cost to employer (visa fees, medical, insurance)

### 2D. Country-Specific Salary Curves
- Replace flat country_multiplier with per-country progression curves
- Japan: flatter curve (3-4× from IC1 to IC5)
- US: steeper curve (5-6×)
- Data: separate FB arrays per country for accuracy

---

## 🟢 PHASE 3 — Enterprise Features (P2)

### 3A. Export to PDF/Excel
- One-click export of any comparison view
- Formatted for executive presentation
- Include charts, tables, disclaimers

### 3B. PE / Contractor Classification Guide
- Per-country rules for employee vs contractor
- Risk indicators for remote workers
- EOR/PEO cost comparison

### 3C. Additional Countries
- China (mainland, special status)
- India (huge engineering talent pool)
- Germany (EU reference)
- Australia (APAC)

### 3D. Multi-Currency Display
- Add local currency alongside USD
- Real-time FX rate (or fixed monthly rate)
- Contract currency indicator

---

## ⚪ PHASE 4 — Strategic Planning (P3)

### 4A. Organization Cost Simulator
- Input team composition (N roles × levels)
- Calculate total annual cost per country
- Compare: "Build this team in SG vs PH vs UAE"

### 4B. Scenario Planning Engine
- Token price crash (-50%): impact on total comp
- Minimum wage increase: team cost delta
- New regulation: compliance cost estimate

### 4C. Compa-Ratio Analytics
- Upload team data (CSV)
- Auto-calculate compa-ratio distribution
- Flag underpaid/overpaid employees by market data

### 4D. Social Security Totalization Agreements
- Cross-reference matrix: which country pairs have agreements
- Impact on expat social security costs

---

## 🏗️ Architecture Strategy

### Current: Single-file React component (~2000 lines)
### Target: Must remain single-file for Artifact rendering

**Approach:** Each phase adds ~400-600 lines. After Phase 2, consider:
- Aggressive data compression (JSON → binary-like format)
- Lazy rendering (only compute visible tab)
- Move static data to separate const blocks at top

### Estimated final size: ~3500-4000 lines (manageable in single .jsx)

---

## 📅 Suggested Build Order

| Session | Deliverable | Est. Lines Added |
|---------|------------|-----------------|
| Next | Phase 1A: Salary Range + Compa-Ratio | +300 |
| Next | Phase 1B: Token Vesting Simulator | +250 |
| Next | Phase 1C: Relocation Calculator | +200 |
| Next | Phase 1D: Gross-to-Net | +300 |
| Later | Phase 2A-2D | +500 |
| Later | Phase 3A-3D | +400 |
| Future | Phase 4A-4D | +500 |

---

*Generated: 2026-03-22*
*Platform: Payband v1.x*
*Author: Ellen Chuang × Claude AI*
