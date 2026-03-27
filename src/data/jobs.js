// ═══════ JOB ARCHITECTURE ═══════
export const FAMS = [
  {id:"eng",label:"Engineering",zh:"工程技術",tag:"ENG",subs:[
    {id:"fe",l:"Frontend Engineer",zh:"前端工程師"},{id:"be",l:"Backend Engineer",zh:"後端工程師"},
    {id:"bc",l:"Blockchain Engineer",zh:"區塊鏈工程師"},{id:"sc",l:"Smart Contract Dev",zh:"智能合約開發"},
    {id:"dv",l:"DevOps / SRE",zh:"DevOps/SRE"},{id:"mb",l:"Mobile Engineer",zh:"行動端工程師"},
    {id:"qa",l:"QA Engineer",zh:"品質工程師"},{id:"sa",l:"Solutions Architect",zh:"解決方案架構師"},
  ]},
  {id:"trd",label:"Trading",zh:"交易量化",tag:"TRD",subs:[
    {id:"qt",l:"Quant Trader",zh:"量化交易員"},{id:"qr",l:"Quant Researcher",zh:"量化研究員"},
    {id:"mm",l:"Market Maker",zh:"做市商"},{id:"rm",l:"Risk Manager",zh:"風險管理師"},
    {id:"ts",l:"Trade Support",zh:"交易支援"},
  ]},
  {id:"cmp",label:"Compliance & Legal",zh:"合規法務",tag:"CMP",subs:[
    {id:"co",l:"Compliance Officer",zh:"合規官"},{id:"am",l:"AML/KYC Analyst",zh:"反洗錢/KYC分析師"},
    {id:"lg",l:"Legal Counsel",zh:"法務顧問"},{id:"ra",l:"Regulatory Affairs",zh:"法規事務"},
    {id:"ia",l:"Internal Audit",zh:"內部稽核"},
  ]},
  {id:"prd",label:"Product & Design",zh:"產品設計",tag:"PRD",subs:[
    {id:"pm",l:"Product Manager",zh:"產品經理"},{id:"ux",l:"UX/UI Designer",zh:"UX/UI設計師"},
    {id:"ur",l:"UX Researcher",zh:"UX研究員"},{id:"tp",l:"Technical PM",zh:"技術專案經理"},
  ]},
  {id:"mkt",label:"Marketing",zh:"行銷",tag:"MKT",subs:[
    {id:"gm",l:"Growth Marketing",zh:"增長行銷"},{id:"cm",l:"Content/Community",zh:"內容/社群"},
    {id:"pr",l:"PR & Communications",zh:"公關傳播"},{id:"br",l:"Brand Marketing",zh:"品牌行銷"},
  ]},
  {id:"bd",label:"Business Dev",zh:"商務拓展",tag:"BD",subs:[
    {id:"bp",l:"BD / Partnerships",zh:"商務合作"},{id:"is",l:"Institutional Sales",zh:"機構銷售"},
    {id:"am2",l:"Account Manager",zh:"客戶經理"},{id:"st",l:"Strategy",zh:"策略分析"},
  ]},
  {id:"fin",label:"Finance",zh:"財務會計",tag:"FIN",subs:[
    {id:"fa",l:"Financial Analyst",zh:"財務分析師"},{id:"ac",l:"Accountant",zh:"會計師"},
    {id:"tr",l:"Treasury",zh:"資金管理"},{id:"tx",l:"Tax Specialist",zh:"稅務專員"},
    {id:"ct",l:"Controller",zh:"財務長/稽核長"},
  ]},
  {id:"hr",label:"Human Resources",zh:"人力資源",tag:"HR",subs:[
    {id:"cb",l:"C&B Specialist",zh:"薪酬福利專員"},{id:"hb",l:"HRBP",zh:"人力資源業務夥伴"},
    {id:"ta",l:"Talent Acquisition",zh:"招募專員"},{id:"ld",l:"L&D / OD",zh:"培訓發展/組織發展"},
    {id:"hx",l:"HR Operations",zh:"人事作業"},
  ]},
  {id:"sec",label:"Security",zh:"資訊安全",tag:"SEC",subs:[
    {id:"se",l:"Security Engineer",zh:"資安工程師"},{id:"pt",l:"Penetration Tester",zh:"滲透測試"},
    {id:"ir",l:"Incident Response",zh:"事件應變"},{id:"gc",l:"GRC Analyst",zh:"治理風控合規分析"},
  ]},
  {id:"dat",label:"Data & AI",zh:"數據與AI",tag:"DAT",subs:[
    {id:"da",l:"Data Analyst",zh:"數據分析師"},{id:"de",l:"Data Engineer",zh:"數據工程師"},
    {id:"ml",l:"ML / AI Engineer",zh:"機器學習工程師"},{id:"bi",l:"BI Analyst",zh:"商業智慧分析師"},
  ]},
  {id:"ops",label:"Operations",zh:"營運管理",tag:"OPS",subs:[
    {id:"ot",l:"Ops & Trading Ops",zh:"營運/交易營運"},{id:"pm2",l:"Project Manager",zh:"專案管理"},
    {id:"lt",l:"Listing / Token Ops",zh:"上幣/代幣營運"},{id:"sp",l:"Vendor / Procurement",zh:"供應商管理"},
  ]},
  {id:"cs",label:"Customer Service",zh:"客戶服務",tag:"CS",subs:[
    {id:"c1",l:"Customer Support",zh:"客服專員"},{id:"c2",l:"VIP / KA Support",zh:"VIP/大客戶服務"},
    {id:"c3",l:"Dispute Resolution",zh:"爭議處理"},{id:"c4",l:"Knowledge Base",zh:"知識庫管理"},
  ]},
];

// Level definitions with scope descriptions
export const JLVL = {
  ic:[
    {id:"ic1",l:"IC1 Junior/Associate",zh:"IC1 初階/助理",yr:"0-2y",
      scope:"Execute defined tasks under guidance. Follow established processes and standards.",
      scopeZ:"在指導下執行已定義的任務。遵循既有流程和標準。",
      head:"3-5",team:"N/A"},
    {id:"ic2",l:"IC2 Mid-level",zh:"IC2 中階",yr:"2-4y",
      scope:"Handle standard work independently. Begin mentoring juniors. Contribute to process improvement.",
      scopeZ:"獨立處理標準工作。開始指導初階人員。參與流程改善。",
      head:"N/A",team:"N/A"},
    {id:"ic3",l:"IC3 Senior",zh:"IC3 資深",yr:"4-7y",
      scope:"Own complex projects end-to-end. Make technical decisions for team. Drive cross-functional collaboration.",
      scopeZ:"端對端負責複雜專案。為團隊做技術決策。推動跨職能協作。",
      head:"N/A",team:"N/A"},
    {id:"ic4",l:"IC4 Staff / Expert",zh:"IC4 首席/專家",yr:"7-12y",
      scope:"Cross-team technical impact. Define architecture and direction. Recognized domain expert.",
      scopeZ:"跨團隊技術影響力。定義架構方向。公認的領域專家。",
      head:"N/A",team:"N/A"},
    {id:"ic5",l:"IC5 Principal / Fellow",zh:"IC5 總首席/院士",yr:"10y+",
      scope:"Organization-wide impact. Set technical strategy. Influence industry standards. Equivalent to Director+.",
      scopeZ:"全組織影響力。制定技術策略。影響行業標準。等同總監以上。",
      head:"N/A",team:"N/A"},
  ],
  mgmt:[
    {id:"m1",l:"M1 Team Lead",zh:"M1 組長",yr:"4-6y",
      scope:"Manage 3-8 direct reports. Execute team deliverables. First-level people management.",
      scopeZ:"管理3-8名直屬。交付團隊成果。初階人員管理。",
      head:"3-8",team:"Single"},
    {id:"m2",l:"M2 Manager",zh:"M2 經理",yr:"6-9y",
      scope:"Own a function. Budget responsibility. Hiring, performance review, termination decisions.",
      scopeZ:"負責一個職能。預算責任。招聘、績效考核、解聘決策。",
      head:"8-15",team:"Single function"},
    {id:"m3",l:"M3 Senior Manager",zh:"M3 資深經理",yr:"8-12y",
      scope:"Multi-team management. Strategic input. P&L awareness. Represent function to leadership.",
      scopeZ:"多團隊管理。策略輸入。損益意識。代表職能向高層匯報。",
      head:"15-30",team:"Multi-team"},
    {id:"m4",l:"M4 Director",zh:"M4 總監",yr:"10-15y",
      scope:"Department head. Full P&L ownership. Executive stakeholder management. Drive organizational change.",
      scopeZ:"部門主管。完整損益責任。高管利害關係人管理。推動組織變革。",
      head:"30-80",team:"Department"},
    {id:"m5",l:"M5 VP / C-Level",zh:"M5 副總裁/高管",yr:"12y+",
      scope:"C-suite executive. Set organization strategy. Board reporting. P&L and regulatory accountability.",
      scopeZ:"最高管理層。制定組織策略。董事會匯報。損益與法規責任。",
      head:"80+",team:"Organization"},
  ],
};

// Country multipliers
export const CM = {us:1.0,ch:1.05,sg:0.72,ae:0.75,hk:0.70,gb:0.68,kr:0.48,jp:0.50,tw:0.35,mt:0.52,ph:0.16,my:0.22};

// Base salary (USD K) by family: [IC1, IC2, IC3, IC4, IC5] and [M1..M5]
export const FB = {
  eng:{ic:[52,78,115,165,220],mgmt:[105,140,175,220,290]},
  trd:{ic:[65,100,160,240,350],mgmt:[145,195,260,350,480]},
  cmp:{ic:[48,72,118,145,190],mgmt:[95,130,165,210,275]},
  prd:{ic:[50,76,112,155,205],mgmt:[100,135,172,225,300]},
  mkt:{ic:[40,60,90,130,175],mgmt:[82,110,145,190,250]},
  bd:{ic:[42,65,98,145,195],mgmt:[90,125,165,220,300]},
  fin:{ic:[45,68,100,140,185],mgmt:[90,120,158,205,270]},
  hr:{ic:[38,55,82,118,160],mgmt:[75,100,135,180,240]},
  sec:{ic:[55,82,120,170,228],mgmt:[110,148,185,235,310]},
  dat:{ic:[48,72,108,152,200],mgmt:[98,132,168,215,285]},
  ops:{ic:[35,50,75,110,150],mgmt:[68,95,128,170,225]},
  cs:{ic:[28,40,58,82,115],mgmt:[55,75,100,135,180]},
};

// Subfunction salary modifiers
export const SM = {
  fe:0.95,be:1.0,bc:1.18,sc:1.22,dv:1.02,mb:0.95,qa:0.85,sa:1.15,
  qt:1.15,qr:1.10,mm:1.20,rm:0.90,ts:0.75,
  co:1.0,am:0.88,lg:1.08,ra:0.95,ia:0.92,
  pm:1.0,ux:0.92,ur:0.88,tp:1.05,
  gm:1.0,cm:0.82,pr:0.90,br:0.88,
  bp:1.05,is:1.10,am2:0.85,st:1.0,
  fa:0.95,ac:0.82,tr:1.05,tx:0.95,ct:1.10,
  cb:0.95,hb:1.0,ta:0.90,ld:0.88,hx:0.78,
  se:1.0,pt:1.05,ir:0.95,gc:0.88,
  da:0.90,de:1.0,ml:1.22,bi:0.85,
  ot:0.85,pm2:0.95,lt:0.90,sp:0.80,
  c1:0.80,c2:0.95,c3:0.85,c4:0.78,
};
