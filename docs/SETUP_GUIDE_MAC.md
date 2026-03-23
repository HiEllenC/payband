# Payband — Claude Code 遷移設定指南
## 適用於 M4 Mac

---

## 第一步：安裝 Claude Code

打開 Terminal（終端機），貼上這行指令：

```bash
curl -fsSL https://code.claude.com/install.sh | sh
```

安裝完成後，關閉並重新打開 Terminal，然後驗證：

```bash
claude --version
```

應該會看到版本號碼。

---

## 第二步：登入認證

你已經有 Claude Pro 訂閱，直接用瀏覽器登入：

```bash
claude
```

第一次執行會跳出瀏覽器要你登入 Anthropic 帳號，用你現有的 Claude 帳號登入就好。

---

## 第三步：建立專案

```bash
# 建立專案資料夾
mkdir -p ~/Projects/payband
cd ~/Projects/payband

# 初始化 Git
git init

# 初始化 React 專案（用 Vite，比 CRA 快很多）
npm create vite@latest . -- --template react
npm install

# 把目前的單檔複製進來（稍後拆分）
# 先從 Claude.ai 下載 crypto-salary-platform.jsx
# 放到 src/ 資料夾
```

---

## 第四步：初始化 Claude Code 專案設定

```bash
cd ~/Projects/payband
claude /init
```

這會生成 `CLAUDE.md`——用我們準備好的版本覆蓋它。

---

## 第五步：開始用 Claude Code 開發

```bash
cd ~/Projects/payband
claude
```

進入 Claude Code 後，你可以用自然語言指令：

### 常用指令範例

```
> 讀取 src/App.jsx，把 TotalComp 元件加入 Salary Range P25/P50/P75

> 把 HOLIDAYS_DB 從 App.jsx 拆分到 src/data/holidays.js

> 幫我新增 Token Vesting 模擬器模組，放在 src/modules/TokenVesting.jsx

> 執行 npm run dev 看看有沒有錯誤

> 把目前的改動 commit，訊息用 "feat: add salary range bands P25/P50/P75"
```

### 快捷鍵
- `!npm run dev` — 直接執行指令（前面加 !）
- `/compact` — 壓縮對話歷史，釋放 context window
- `/help` — 看所有可用指令
- `Ctrl+C` — 取消目前操作

---

## 第六步：部署到 Netlify

```bash
npm run build
# 產出在 dist/ 資料夾

# 安裝 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

---

## 專案結構遷移計劃

目前是單一 1940 行的 .jsx 檔案。用 Claude Code 拆分成模組化結構：

```
第1步：拆分資料檔（data/）— 約 800 行移出
第2步：拆分元件（components/）— 約 200 行移出  
第3步：拆分模組（modules/）— 每個 tab 一個檔案
第4步：建立 App.jsx 作為路由和 shell
```

拆完後每個檔案大約 100-300 行，可維護性大幅提升。

---

## 開發工作流程

```
1. 開 Terminal → cd ~/Projects/payband
2. 開 claude
3. 用中文描述你要什麼功能
4. Claude Code 會讀你的 codebase、寫程式碼、跑測試
5. 你確認 diff 後按 y 接受改動
6. Claude Code 自動 git commit
7. npm run dev 看效果
8. 滿意後 netlify deploy
```

---

## 注意事項

- **Claude Pro 方案** 包含 Claude Code 使用額度，不需要額外付費
- **M4 Mac** 跑 Claude Code 完全沒問題，本機不需要 GPU
- **所有運算在雲端**，你的 Mac 只負責顯示終端機和跑 dev server
- **每次對話有 context window 上限**，用 `/compact` 管理
- **CLAUDE.md** 是你的專案說明書，Claude Code 每次啟動都會讀
