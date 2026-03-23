# Payband — Claude Code 接手指南
# 完整開發進度 + 待辦任務

---

## 你是誰
你正在接手一個由 Ellen Chuang 和 Claude.ai 共同建造的跨境薪酬情報平台。所有程式碼目前在 src/App.jsx 單一檔案中（約1940行）。你的第一個任務是讀懂它，然後按計劃繼續開發。

## 專案擁有者
**Ellen Chuang** — Andes Group（加密貨幣/金融科技控股公司）C&B Head，5年跨境薪酬經驗（PH/TW/SG/MY/UAE）。她不寫程式碼——她的價值是把深度 HR 領域知識轉化為 AI 輔助的產品規格。所有對話請用**繁體中文**回應。

---

## ✅ 已完成功能（v1.0）

### 1. 首頁（HOME）
- Hero 區塊含品牌名稱、副標題、CTA 按鈕
- 5 個統計數字卡（12國/480職位/10職等/10假別/471交易所）
- 5 個功能特色卡片，點擊跳轉對應 tab
- 動畫數字計數器（Num 元件，用 useRef + requestAnimationFrame，已修復 unmount crash）

### 2. 薪資矩陣（SALARY）
- 職能選擇器（JobSel）：12 職能族群 → 48 子職能 → 雙軌道（IC/管理）→ 5 職等
- 每個職等有工作範疇描述（scope/scopeZ）、經驗年資、管理人數
- 薪資公式：base = FB[family][track][level] × CM[country] × SM[subfunction]
- 最多選 6 國並排比較，用橫條圖顯示

### 3. 總薪酬（TOTAL COMP）— 已重構
- 三層架構：並排對比圖 → 對比表格 → 明細標籤
- 並排堆疊橫條圖：所有國家垂直排列，寬度按比例縮放（最大國=100%）
- 5 項拆分：Base/Bonus/Token/ER Cost/Allowance，每項有獨立色碼
- 對比表格：每格顯示金額 + 佔比% + mini 橫條，最高值自動高亮
- 底部：雇主總成本、倍數、法定提撥明細
- 已修復：除零保護（total || 1）、fmt() 統一金額格式、空狀態提示

### 4. 勞動法規（LABOR LAW）
- 20 項 × 12 國對比矩陣表
- 5 大分類：休假權益(7)、僱傭條款(4)、工作條件(3)、社保與退休(3)、解僱保護(2)
- 每項有中英文雙語
- Sticky 第一欄、分類標題行、公假天數高亮最大/最小值

### 5. 行事曆（CALENDAR）— 已大幅升級
- **三種檢視模式**：考勤總表（預設首頁）/ 月曆 / 跨年對比
- **三年假日資料庫**（2025-2027），年份按鈕切換
  - 2025：歷史確認
  - 2026：官方確認（依各國政府公告逐筆驗證）
  - 2027：預估（帶橙色警告提示）
- **假日類型標記**：
  - R = Regular（法定假，菲律賓出勤200%薪）
  - S = Special Non-Working（菲律賓特別非工作日，出勤130%薪）
  - O = Observed/Substitute（補假，原假日逢週末移到工作日）
  - B = Bank Holiday（英國銀行假日）
- **考勤總表**（原矩陣）：表頭凍結（sticky header + maxHeight:70vh）、日期×國家矩陣、每格顯示假日類型徽章+名稱、特別假用紫色背景區分
- **月曆**：國家水平排列、假日 chips、每月摘要統計
- **跨年對比**：選單一國家 → 三年年度假日/工作日總覽 → 12月逐月對比表 → 當月假日明細
- 已修復：UAE 週末=Sat-Sun（2022改制）、農曆新年2026=2/17、所有伊斯蘭節日日期

### 6. 法規追蹤（REGULATION）— 完全重建
- **時間軸模式**：20條法規事件，每條有 diff 標記
  - 🟢 NEW（新增）/ 🟡 AMENDED（修正）/ 🔴 REVOKED（廢止）/ ⚪ PROPOSED（草案）
  - 影響程度：高/中/低，按國家篩選
  - 時間跨度 2018-2026
- **監管框架模式**：12國 × 6維度對比矩陣（監管機構/牌照類型/稅務/穩定幣/DeFi/託管）
- **法規日報模式**（AI Daily News）：
  - Claude API + Web Search 自動生成文章
  - 兩大分類：🔗 CRYPTO REGULATION / 👔 HR & LABOR
  - 語言跟隨全站設定（中文→繁體中文文章，英文→English only）
  - 文章列表頁：今日簡報 / 本月稍早
  - 文章詳情頁：結構化排版（標題/正文/條列項/粗體自動渲染）
  - Storage 快取：當日已生成則不重複搜尋
  - 底部聲明：「由AI+網路搜尋生成，僅供參考」

### 7. 國家檔案（COUNTRIES）
- 12 國卡片 grid，點擊進入詳情頁
- 詳情頁含：國旗、基本資訊、薪酬概覽、勞動法摘要

### 共用元件
- **Card**：毛玻璃卡片，hover 上浮，可選 accent 漸變邊框
- **WorldMap**：區域分組國家選擇器（美洲/歐洲/中東/東亞/東南亞），最多選6國
- **JobSel**：4 層選擇器（職能→子職能→軌道→職等），含職等工作範疇描述卡
- **Num**：動畫計數器，useRef cleanup
- **Dot**：監管狀態指示燈（regulated/evolving）
- **HBar**：小型水平條圖
- **Tag**：標籤元件

### 設計系統
- 字體：DM Mono + Noto Sans TC（Google Fonts CDN）
- 色板：slate=#546378, sage=#5f7a61, copper=#96714a, clay=#a06b52, wine=#8a5565
- 背景：#eae8e4 暖灰米色 + grid overlay
- 毛玻璃：backdrop-filter: blur(14px)
- 語言切換：zh/en toggle，t(en, zh) helper

### 資料架構
- 12 國：US, GB, CH, MT, AE, SG, HK, TW, JP, KR, PH, MY
- 12 職能族群 × 48 子職能
- 雙軌道：IC(IC1-IC5) + Management(M1-M5)，每級有 scope 描述
- 薪資乘數：CM[country] × SM[subfunction] × FB[family][track][level]
- TC[country]：bonus%, token%, er%, allow%, multi, erL, bN, tN
- HOLIDAYS_DB[year][country]：含 t 欄位（R/S/O/B）
- REG_TIMELINE：法規事件陣列
- REG_FRAMEWORK：12國監管框架

---

## 🔴 Phase 1 — 核心薪酬情報工具（最高優先）

### 1A. Salary Range P25/P50/P75
**目標**：把單一薪資點位改為薪資帶寬
- 每個 level × country 顯示 P25（最低）/ P50（中位）/ P75（最高）
- 視覺：range bar 顯示帶寬，marker 標出位置
- 加入 Compa-Ratio 輸入框：用戶輸入實際薪資 → 自動計算在 band 中的位置
- P25 = base × 0.85, P50 = base, P75 = base × 1.20（可調）

### 1B. Token/Equity Vesting 模擬器
**目標**：加密交易所的 token 佔薪酬 30-60%，必須模擬歸屬時間表
- 新增 tab 或在 Total Comp 中新增子視圖
- 選擇 vesting 結構：4年/1年 cliff、月度/季度 vesting
- Token 價格波動滑桿（±50%）
- 輸出：逐年歸屬金額表 + 不同價格情境的可變現金額
- 各國 token 稅務處理差異摘要

### 1C. 調派成本試算器（From → To Country）
**目標**：C&B 每天在做的事——「從台灣調人到新加坡，成本差多少？」
- 新增 tab 或模組
- 選擇：起始國 → 目的國 → 職能 → 子職能 → 職等
- 自動計算：薪資差異、稅後差異、社保差異
- 額外顯示：簽證費用估算、搬遷成本估算
- 輸出：單頁對比卡

### 1D. Gross-to-Net 計算器
**目標**：$100K 在不同國家到手多少？
- 輸入：年薪（Gross）
- 計算：所得稅（累進稅率）、社保（員工端）、淨到手金額
- 每國用簡化但合理的稅率模型
- 12 國並排對比：同一 Gross 金額的 Net 差異
- 月薪和年薪切換

---

## 🟡 Phase 2 — 深度薪酬結構（次要優先）

### 2A. 津貼明細展開
- 把「津貼」從單一%拆成：Housing/Education/Transport/Airfare/Relocation/Meal
- 各國差異巨大（UAE 全有，US 幾乎沒有）

### 2B. PPP 購買力平價
- 加 PPP 乘數顯示實質購買力
- $28K 在台北 ≈ $72K 在新加坡的生活品質

### 2C. 工作簽證模組
- 各國簽證類型、最低薪資門檻（如新加坡EP $5,000/月）
- 處理時間、配額、費用

### 2D. 每國獨立薪資曲線
- 日本 IC1→IC5 只有 3-4 倍差距，美國 5-6 倍
- 替換統一 country_multiplier 為每國獨立的 level progression

---

## 🟢 Phase 3 — 企業功能

### 3A. 匯出 PDF/Excel
### 3B. PE/Contractor 分類指南
### 3C. 新增中國/印度/德國/澳洲
### 3D. 多幣種顯示（Local Currency + USD）

---

## ⚪ Phase 4 — 策略規劃

### 4A. 組織人力成本模擬器（輸入團隊組成，算出各國年度總成本）
### 4B. 情境模擬（Token 價格跌50%、最低工資調升的影響）
### 4C. Compa-Ratio 分析（上傳 CSV，自動算 compa-ratio 分佈）

---

## 🏗️ 第一個任務：模組化拆分

目前所有 1940 行都在 src/App.jsx 裡。請先拆分成以下結構：

```
src/
  App.jsx              — 主 shell：Header, Footer, Tab routing, 全域 state
  data/
    countries.js       — COUNTRIES 陣列（含 labor law 數據）
    jobs.js            — FAMS, JLVL, CM, FB, SM
    totalcomp.js       — TC 結構
    holidays.js        — HOLIDAYS_DB (2025-2027), WEEKENDS
    regulations.js     — REG_TIMELINE, REG_FRAMEWORK
  components/
    Card.jsx           — 毛玻璃卡片
    WorldMap.jsx       — 國家選擇器
    JobSelector.jsx    — 職能/子職能/軌道/職等 選擇器
    Num.jsx            — 動畫計數器
    Dot.jsx            — 監管狀態指示燈
  modules/
    Home.jsx
    Salary.jsx
    TotalComp.jsx
    LaborLaw.jsx
    Calendar.jsx
    Regulation.jsx
    Countries.jsx
  utils/
    salary.js          — gS() 薪資計算函數, fmt() 格式化
    i18n.js            — t() 翻譯 helper
```

拆分規則：
1. 每個 data 檔案 export const
2. 每個 component/module export default
3. App.jsx import 所有模組，管理全域 state（tab, selC, selFam, selSub, track, selLvl, usdt, lang, search, detail, ready, calView, calMonth, calYear, compCountry）
4. 拆完後跑 npm run dev 確認沒有錯誤
5. git commit -m "refactor: modularize into data/components/modules/utils"

拆完後告訴 Ellen，然後開始 Phase 1A（Salary Range P25/P50/P75）。
