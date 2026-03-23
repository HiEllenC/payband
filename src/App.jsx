import { useState, useEffect, useCallback, useRef } from "react";

/*
 ╔═══════════════════════════════════════════════════╗
 ║  PAYBAND v1.1 — PREMIUM TERMINAL               ║
 ║  DM Mono · Fixed Map · Editorial Landing          ║
 ╚═══════════════════════════════════════════════════╝
*/

const D = {
  bg:"#eae8e4", surface:"#faf9f7", surfA:"rgba(250,249,247,0.72)", elev:"rgba(255,254,252,0.88)",
  tx:"#1c1c1f", tx2:"#4a4a52", tx3:"#7d7d88", tx4:"#a8a8b4", tx5:"#c8c8d0",
  ink:"#2d3142", slate:"#546378", sage:"#5f7a61", copper:"#96714a", clay:"#a06b52", wine:"#8a5565",
  ln:"rgba(0,0,0,0.06)", lnF:"rgba(0,0,0,0.03)",
};
const LV=["#9a9aa6","#6b7fa0","#7a6a9e","#9a6878","#96714a"];

// ═══════ ANIMATED NUMBER ═══════
const Num = ({ value, color = D.ink, size = 32 }) => {
  const [d, setD] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const n = parseInt(value) || 0;
    const st = performance.now();
    const tick = (now) => {
      const p = Math.min((now - st) / 1000, 1);
      setD(Math.round(n * (1 - Math.pow(1 - p, 4))));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);
  return <span style={{ fontSize: size, fontWeight: 400, fontFamily: "'DM Mono',monospace", color, letterSpacing: -0.5 }}>{d}</span>;
};

// ═══════ CARD ═══════
const Card = ({ children, style={}, onClick, accent, glow }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ position:"relative", borderRadius:8, cursor:onClick?"pointer":"default", ...style }}>
      {accent && <div style={{
        position:"absolute", inset:-1, borderRadius:9,
        background:`linear-gradient(${h?"135deg":"170deg"}, ${accent}${h?"50":"18"}, transparent 55%, ${accent}${h?"28":"08"})`,
        opacity: h ? 0.8 : 0.4, transition:"all 0.6s cubic-bezier(.22,1,.36,1)",
      }}/>}
      <div style={{
        position:"relative", borderRadius:8, overflow:"hidden",
        background: h&&onClick ? D.elev : glow ? "rgba(250,249,247,0.78)" : D.surfA,
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        border:`1px solid ${h&&onClick?"rgba(84,99,120,0.18)":"rgba(200,200,210,0.3)"}`,
        boxShadow: h&&onClick ? "0 12px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02)" : glow ? "0 1px 24px rgba(0,0,0,0.02)" : "none",
        transition:"all 0.4s cubic-bezier(.22,1,.36,1)",
        transform: h&&onClick ? "translateY(-3px)" : "none",
      }}>{children}</div>
    </div>
  );
};

// ═══════ PRIMITIVES ═══════
const Tag = ({ children, color=D.tx3 }) => <span style={{ fontSize:11, fontWeight:500, letterSpacing:2.5, color, fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>{children}</span>;
const Dot = ({ s, lang:lg }) => { const m={regulated:{c:D.sage,e:"Regulated",z:"已監管"},evolving:{c:D.copper,e:"Evolving",z:"演進中"}}; const v=m[s]||m.evolving; return <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:13,fontWeight:500,color:v.c}}><span style={{width:6,height:6,borderRadius:"50%",background:v.c,opacity:0.6}}/>{lg==="zh"?v.z:v.e}</span>; };
const HBar = ({ value, max=100, color=D.slate, h=4 }) => (<div style={{width:"100%",height:h,background:`${color}08`,borderRadius:99,overflow:"hidden"}}><div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,opacity:0.35,borderRadius:99,transition:"width 0.8s cubic-bezier(.22,1,.36,1)"}}/></div>);
const fmt = (v,u) => u?`₮${v}K`:`$${v}K`;

// ═══════ DATA ═══════
// ═══════ JOB ARCHITECTURE ═══════
const FAMS=[
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
const JLVL={
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
const CM={us:1.0,ch:1.05,sg:0.72,ae:0.75,hk:0.70,gb:0.68,kr:0.48,jp:0.50,tw:0.28,mt:0.52,ph:0.16,my:0.22};
// Base salary (USD K) by family: [IC1, IC2, IC3, IC4, IC5] and [M1..M5]
const FB={
  eng:{ic:[52,78,115,165,220],mgmt:[105,140,175,220,290]},
  trd:{ic:[65,100,160,240,350],mgmt:[145,195,260,350,480]},
  cmp:{ic:[48,72,105,145,190],mgmt:[95,130,165,210,275]},
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
const SM={
  fe:0.95,be:1.0,bc:1.18,sc:1.22,dv:1.02,mb:0.95,qa:0.85,sa:1.15,
  qt:1.15,qr:1.10,mm:1.20,rm:0.90,ts:0.75,
  co:1.0,am:0.88,lg:1.08,ra:0.95,ia:0.92,
  pm:1.0,ux:0.92,ur:0.88,tp:1.05,
  gm:1.0,cm:0.82,pr:0.90,br:0.88,
  bp:1.05,is:1.10,am2:0.85,st:1.0,
  fa:0.95,ac:0.82,tr:1.05,tx:0.95,ct:1.10,
  cb:0.95,hb:1.0,ta:0.90,ld:0.88,hx:0.78,
  se:1.0,pt:1.05,ir:0.95,gc:0.88,
  da:0.90,de:1.0,ml:1.12,bi:0.85,
  ot:0.85,pm2:0.95,lt:0.90,sp:0.80,
  c1:0.80,c2:0.95,c3:0.85,c4:0.78,
};

const TC={us:{bonus:20,token:25,er:7.65,allow:8,multi:1.42,erL:"FICA 7.65%",bN:"Performance bonus",tN:"RSU/Token 4yr"},ch:{bonus:15,token:15,er:13,allow:15,multi:1.50,erL:"AHV/BVG ~13%",bN:"Annual + 13th",tN:"Token 3-4yr"},sg:{bonus:17,token:20,er:17,allow:8,multi:1.52,erL:"CPF 17%",bN:"AWS + Perf",tN:"ESOP 4yr"},ae:{bonus:20,token:22,er:12.5,allow:30,multi:1.65,erL:"GPSSA 12.5%",bN:"Performance",tN:"Token 3-4yr"},hk:{bonus:17,token:20,er:5,allow:8,multi:1.45,erL:"MPF 5%",bN:"Double pay+bonus",tN:"Equity 4yr"},gb:{bonus:15,token:18,er:13.8,allow:6,multi:1.45,erL:"NIC 13.8%",bN:"Performance",tN:"EMI 4yr"},jp:{bonus:33,token:10,er:15,allow:5,multi:1.58,erL:"社保 ~15%",bN:"夏冬獎金",tN:"Stock options"},kr:{bonus:25,token:10,er:10,allow:5,multi:1.52,erL:"四大保險 ~10%",bN:"Quarterly/Annual",tN:"RSU"},tw:{bonus:12,token:5,er:18,allow:5,multi:1.38,erL:"勞健保+勞退 ~18%",bN:"年終+三節",tN:"員工認股"},ph:{bonus:8,token:3,er:9.5,allow:3,multi:1.28,erL:"SSS/Phil ~9.5%",bN:"13th month(法定)",tN:"ESOP(少見)"},my:{bonus:12,token:5,er:15,allow:3,multi:1.38,erL:"EPF+SOCSO ~15%",bN:"Annual bonus",tN:"ESOS"},mt:{bonus:10,token:12,er:10,allow:3,multi:1.38,erL:"SSC 10%",bN:"Performance",tN:"Equity"}};

// Country data with proper map coordinates (Mercator-like projection)
const COUNTRIES=[
  {id:"us",n:"United States",zh:"美國",flag:"🇺🇸",xc:105,tax:"10-37%",col:78,rs:"evolving",ts:95,
    mx:152,my:108,
    labor:{ph:11,al:"0 (no mandate)",alZ:"0（無聯邦強制）",ad:0,mat:"12wk unpaid FMLA",matZ:"12週無薪FMLA",pat:"12wk unpaid FMLA",patZ:"12週無薪FMLA",sev:"Not mandated",sevZ:"無強制",mar:"None",marZ:"無強制",sick:"State varies",sickZ:"依州而異",notice:"At-will",noticeZ:"自由僱傭",th13:"No",th13Z:"無",prob:"No statutory max",probZ:"無法定上限",bvt:"No federal mandate",bvtZ:"無聯邦強制",wkhr:"40",ot:"1.5× after 40hr/wk",otZ:"週40hr後1.5倍",minw:"$7.25/hr federal",minwZ:"聯邦$7.25/hr",erSS:"7.65% (FICA)",erSSZ:"7.65%（FICA）",eeSS:"7.65%",eeSSZ:"7.65%",pen:"401(k) voluntary",penZ:"401(k)自願提撥",term:"At-will (any reason)",termZ:"自由僱傭（任何理由）",unfair:"Limited federal",unfairZ:"有限聯邦保護"},
    holidays:["New Year 元旦","MLK Day","Presidents' Day","Memorial Day","Juneteenth 六月節","Independence Day 獨立日","Labor Day 勞動節","Columbus Day","Veterans Day","Thanksgiving 感恩節","Christmas 聖誕節"],
    rg:{date:"2026-01",title:"FIT21 Stablecoin Act",sum:"Stablecoin legislation advancing."}},
  {id:"gb",n:"United Kingdom",zh:"英國",flag:"🇬🇧",xc:44,tax:"0-45%",col:75,rs:"evolving",ts:90,mx:323,my:73,
    labor:{ph:8,al:"28d incl bank",alZ:"28天含銀行假",ad:28,mat:"52wk(39 paid)",matZ:"52週（39帶薪）",pat:"2wk flat rate",patZ:"2週定額",sev:"0.5-1.5wk/yr",sevZ:"依年齡0.5-1.5週/年",mar:"None",marZ:"無強制",sick:"SSP 28wk",sickZ:"SSP最長28週",notice:"1wk/yr max12",noticeZ:"每年1週上限12",th13:"No",th13Z:"無",prob:"3-6 months",probZ:"3-6個月",bvt:"Reasonable time",bvtZ:"合理時間",wkhr:"48 max (opt-out)",otZ:"48hr上限可退出",ot:"No statutory premium",minw:"£11.44/hr (23+)",minwZ:"£11.44/hr（23歲+）",erSS:"13.8% NIC",erSSZ:"13.8%雇主NIC",eeSS:"12% NIC",eeSSZ:"12%員工NIC",pen:"3-5% auto-enroll",penZ:"3-5%自動登記",term:"Fair reason required (2yr+)",termZ:"需正當理由（2年+）",unfair:"Strong (after 2yr)",unfairZ:"強保護（2年後）"},
    holidays:["New Year 元旦","Good Friday","Easter Mon","Early May","Spring Bank","Summer Bank","Christmas 聖誕","Boxing Day"],
    rg:{date:"2026-01",title:"Crypto Regime Draft",sum:"FCA comprehensive proposals."}},
  {id:"ch",n:"Switzerland",zh:"瑞士",flag:"🇨🇭",xc:31,tax:"0-40%",col:95,rs:"regulated",ts:88,mx:366,my:92,
    labor:{ph:9,al:"20d(4wk min)",alZ:"20天（最低4週）",ad:20,mat:"14wk 80%",matZ:"14週80%薪",pat:"2wk paid",patZ:"2週帶薪",sev:"Not mandated",sevZ:"無強制",mar:"1 day",marZ:"1天",sick:"3wk+ Bern scale",sickZ:"3週起依伯恩量表",notice:"1-3 months",noticeZ:"1-3個月",th13:"92% employers",th13Z:"92%雇主提供",prob:"1-3 months",probZ:"1-3個月",bvt:"1-3 days",bvtZ:"1-3天",wkhr:"42-45",ot:"125% premium",otZ:"125%加班費",minw:"No federal (cantonal)",minwZ:"無聯邦（各州）",erSS:"~6.4% AHV/IV",erSSZ:"約6.4% AHV/IV",eeSS:"~6.4% AHV/IV",eeSSZ:"約6.4% AHV/IV",pen:"BVG mandatory 7-18%",penZ:"BVG強制7-18%",term:"No reason needed",termZ:"無需理由",unfair:"Limited; abusive only",unfairZ:"有限；僅濫用解僱"},
    holidays:["New Year 元旦","Good Friday","Easter Mon","Ascension","Whit Monday","National Day 國慶","Christmas 聖誕","St. Stephen's","NYE 除夕"],
    rg:{date:"2025-10",title:"DLT Expansion",sum:"FINMA DLT facilities expanding."}},
  {id:"mt",n:"Malta",zh:"馬爾他",flag:"🇲🇹",xc:15,tax:"0-35%",col:55,rs:"regulated",ts:58,mx:370,my:125,
    labor:{ph:14,al:"24+2d",alZ:"24+2天",ad:24,mat:"18wk(14 paid)",matZ:"18週（14帶薪）",pat:"10d paid",patZ:"10天帶薪",sev:"By service length",sevZ:"依年資",mar:"2 days",marZ:"2天",sick:"2wk/yr full pay",sickZ:"每年2週全薪",notice:"1-12 weeks",noticeZ:"1-12週",th13:"No",th13Z:"無",prob:"6-12 months",probZ:"6-12個月",bvt:"1 day",bvtZ:"1天",wkhr:"40",ot:"150% premium",otZ:"150%加班費",minw:"€192.73/wk",minwZ:"€192.73/週",erSS:"10% SSC",erSSZ:"10% SSC",eeSS:"10% SSC",eeSSZ:"10% SSC",pen:"SSC pension",penZ:"SSC退休金",term:"Fair reason required",termZ:"需正當理由",unfair:"Moderate",unfairZ:"中等保護"},
    holidays:["New Year","St Paul","St Joseph","Freedom Day","Good Friday","Workers Day","Sette Giugno","St Peter & Paul","Assumption","Victory Day","Independence","Immaculate","Republic Day","Christmas"],
    rg:{date:"2025-08",title:"MiCA Alignment",sum:"VFA aligning with EU MiCA."}},
  {id:"ae",n:"UAE",zh:"阿聯酋",flag:"🇦🇪",xc:65,tax:"0%",col:72,rs:"regulated",ts:78,mx:426,my:135,
    labor:{ph:14,al:"30d after 1yr",alZ:"30天（滿1年後）",ad:30,mat:"60d(45+15)",matZ:"60天（45全薪+15半薪）",pat:"5d paid",patZ:"5天帶薪",sev:"21-30d/yr",sevZ:"每年21-30天",mar:"5 days",marZ:"5天",sick:"90d tiered",sickZ:"90天分層給薪",notice:"30d min",noticeZ:"最低30天",th13:"Common practice",th13Z:"實務常見",prob:"6 months max",probZ:"最長6個月",bvt:"5d (1st degree)",bvtZ:"5天（一等親）",wkhr:"48 (8×6d)",ot:"125-150%",otZ:"125-150%加班費",minw:"No federal min",minwZ:"無聯邦最低",erSS:"12.5% GPSSA",erSSZ:"12.5% GPSSA",eeSS:"0% (expats)",eeSSZ:"0%（外籍）",pen:"GPSSA / gratuity",penZ:"GPSSA/離職金",term:"Valid reason required",termZ:"需正當理由",unfair:"Moderate (2022 reform)",unfairZ:"中等（2022改革後）"},
    holidays:["New Year 元旦","Isra Mi'raj","Eid al-Fitr×3","Arafat","Eid al-Adha×3","Hijri NY","Prophet Birthday","Commemoration","National Day×2"],
    rg:{date:"2025-11",title:"VARA Custody Rules",sum:"Custody segregation enhanced."}},
  {id:"sg",n:"Singapore",zh:"新加坡",flag:"🇸🇬",xc:82,tax:"0-22%",col:85,rs:"regulated",ts:92,mx:508,my:170,
    labor:{ph:11,al:"7-14d tenure",alZ:"7-14天依年資",ad:7,mat:"16wk govt-paid",matZ:"16週政府補助",pat:"2wk govt-paid",patZ:"2週政府補助",sev:"Retrenchment benefit",sevZ:"資遣福利常見",mar:"1-3d common",marZ:"1-3天常見",sick:"14+60d",sickZ:"門診14+住院60天",notice:"1d-4wk",noticeZ:"1天至4週",th13:"AWS customary",th13Z:"AWS常年花紅",prob:"3-6 months",probZ:"3-6個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"44",ot:"150% after 44hr",otZ:"44hr後150%",minw:"No general (PWM sectors)",minwZ:"無（PWM行業有）",erSS:"17% CPF",erSSZ:"17% CPF",eeSS:"20% CPF",eeSSZ:"20% CPF",pen:"CPF (mandatory)",penZ:"CPF（強制）",term:"No reason needed",termZ:"無需理由",unfair:"Limited; wrongful only",unfairZ:"有限；僅不當解僱"},
    holidays:["New Year 元旦","CNY 農曆新年×2","Good Friday","Labour Day 勞動節","Hari Raya Puasa","Vesak Day 衛塞節","Hari Raya Haji","National Day 國慶","Deepavali 屠妖節","Christmas 聖誕"],
    rg:{date:"2025-12",title:"MAS Stablecoin",sum:"Stablecoin reserve requirements."}},
  {id:"hk",n:"Hong Kong",zh:"香港",flag:"🇭🇰",xc:38,tax:"0-15%",col:82,rs:"regulated",ts:85,mx:530,my:112,
    labor:{ph:17,al:"7-14d tenure",alZ:"7-14天依年資",ad:7,mat:"14wk 80%",matZ:"14週80%薪",pat:"5d 80%",patZ:"5天80%薪",sev:"2/3mo×yr (24mo+)",sevZ:"月薪2/3×年資（24月+）",mar:"1-3d common",marZ:"1-3天常見",sick:"Accrual 2-4d/mo",sickZ:"累積2-4天/月",notice:"7d-1mo",noticeZ:"7天至1個月",th13:"Double pay common",th13Z:"雙糧普遍",prob:"1-3 months",probZ:"1-3個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"No statutory max",ot:"No statutory premium",otZ:"無法定加班費",minw:"HK$40/hr",minwZ:"HK$40/hr",erSS:"5% MPF",erSSZ:"5% MPF",eeSS:"5% MPF",eeSSZ:"5% MPF",pen:"MPF (mandatory)",penZ:"MPF（強制）",term:"Valid reason (1mo+)",termZ:"需正當理由（1月+）",unfair:"Moderate",unfairZ:"中等保護"},
    holidays:["New Year 元旦","CNY×3","Ching Ming 清明","Good Friday","Easter Mon","Labour Day","Buddha Birthday 佛誕","Dragon Boat 端午","HKSAR Day","Mid-Autumn 中秋","Chung Yeung 重陽","National Day 國慶","Christmas×2"],
    rg:{date:"2026-02",title:"VATP Licensing",sum:"6 licenses granted."}},
  {id:"tw",n:"Taiwan",zh:"台灣",flag:"🇹🇼",xc:18,tax:"5-40%",col:52,rs:"evolving",ts:75,mx:540,my:118,
    labor:{ph:12,al:"3-30d tenure",alZ:"3-30天依年資",ad:3,mat:"8wk paid",matZ:"8週帶薪",pat:"7d paid",patZ:"7天帶薪",sev:"0.5mo×yr (new)",sevZ:"每年0.5月（新制）",mar:"8 days paid",marZ:"8天帶薪",sick:"30d/yr 50%",sickZ:"30天/年50%薪",notice:"10-30d",noticeZ:"10-30天",th13:"Very common",th13Z:"非常普遍",prob:"3 months",probZ:"3個月",bvt:"3-8d by relation",bvtZ:"3-8天依親等",wkhr:"40",ot:"133-167%",otZ:"133-167%加班費",minw:"NT$27,470/mo",minwZ:"NT$27,470/月",erSS:"~11% (labor+health)",erSSZ:"約11%（勞保+健保）",eeSS:"~3% (labor+health)",eeSSZ:"約3%（勞保+健保）",pen:"6% labor pension",penZ:"6%勞退雇主提撥",term:"Legal grounds required",termZ:"需法定事由",unfair:"Strong (LSA Art.11-12)",unfairZ:"強保護（勞基法11-12條）"},
    holidays:["元旦","除夕+春節×3","228和平紀念","清明","勞動節","端午","中秋","國慶×2"],
    rg:{date:"2025-11",title:"Virtual Asset Act",sum:"VASP legislation under review."}},
  {id:"jp",n:"Japan",zh:"日本",flag:"🇯🇵",xc:29,tax:"5-45%",col:68,rs:"regulated",ts:80,mx:568,my:82,
    labor:{ph:16,al:"10-20d tenure",alZ:"10-20天依年資",ad:10,mat:"14wk 67%",matZ:"14週67%",pat:"Childcare leave avail",patZ:"育兒假可用",sev:"Retirement allowance",sevZ:"退職金慣例",mar:"5d common",marZ:"5天常見",sick:"Health insurance",sickZ:"健保給付",notice:"30 days",noticeZ:"30天",th13:"Biannual bonus std",th13Z:"夏冬雙季獎金",prob:"3-6 months",probZ:"3-6個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"40",ot:"125-150%",otZ:"125-150%加班費",minw:"¥1,004/hr (nat avg)",minwZ:"¥1,004/hr（全國均）",erSS:"~15% Shakai Hoken",erSSZ:"約15%社會保險",eeSS:"~15% Shakai Hoken",eeSSZ:"約15%社會保險",pen:"Kosei Nenkin mandatory",penZ:"厚生年金強制",term:"Extremely difficult",termZ:"極難解僱",unfair:"Very strong",unfairZ:"非常強保護"},
    holidays:["New Year 元旦×3","成人の日","建國紀念","天皇誕生日","春分","昭和の日","憲法紀念","綠の日","子供の日","海の日","山の日","敬老の日","秋分","體育の日","文化の日","勤勞感謝"],
    rg:{date:"2025-12",title:"Crypto Tax Reform",sum:"Flat 20% taxation push."}},
  {id:"kr",n:"South Korea",zh:"韓國",flag:"🇰🇷",xc:24,tax:"6-45%",col:65,rs:"regulated",ts:82,mx:543,my:92,
    labor:{ph:15,al:"15-25d",alZ:"15-25天依年資",ad:15,mat:"90d(60+30)",matZ:"90天（60+30）",pat:"10d paid",patZ:"10天帶薪",sev:"30d×yr mandatory",sevZ:"30天×年資（強制）",mar:"3-5d common",marZ:"3-5天常見",sick:"Company policy",sickZ:"公司政策",notice:"30 days",noticeZ:"30天",th13:"Bonuses common",th13Z:"獎金常見",prob:"3 months",probZ:"3個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"40 (52 max incl OT)",ot:"150% premium",otZ:"150%加班費",minw:"₩9,860/hr",minwZ:"₩9,860/hr",erSS:"~10% (4 insurances)",erSSZ:"約10%（四大保險）",eeSS:"~10%",eeSSZ:"約10%",pen:"NPS 4.5% each",penZ:"國民年金各4.5%",term:"Just cause required",termZ:"需正當理由",unfair:"Strong",unfairZ:"強保護"},
    holidays:["元旦","春節×3","三一節","兒童節","佛誕","顯忠日","光復節","中秋×3","開天節","韓文日","聖誕"],
    rg:{date:"2026-01",title:"Crypto Tax Defer",sum:"CGT deferred to 2027."}},
  {id:"ph",n:"Philippines",zh:"菲律賓",flag:"🇵🇭",xc:12,tax:"0-35%",col:38,rs:"regulated",ts:65,mx:522,my:172,
    labor:{ph:18,al:"5d SIL",alZ:"5天SIL",ad:5,mat:"105d paid (SSS)",matZ:"105天帶薪（SSS）",pat:"7d paid",patZ:"7天帶薪",sev:"0.5-1mo×yr",sevZ:"0.5-1月×年資",mar:"Not mandated",marZ:"無強制",sick:"In SIL",sickZ:"含在SIL內",notice:"30 days",noticeZ:"30天",th13:"Mandatory",th13Z:"法定強制",prob:"6 months max",probZ:"最長6個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"48 (8×6d)",ot:"125% (regular), 130% (rest)",otZ:"平日125% 休日130%",minw:"₱610/day (NCR)",minwZ:"₱610/天（NCR）",erSS:"~9.5% SSS/Phil/Pag",erSSZ:"約9.5% SSS/Phil/Pag",eeSS:"~5%",eeSSZ:"約5%",pen:"SSS pension",penZ:"SSS退休金",term:"Just/authorized cause",termZ:"需正當/法定事由",unfair:"Moderate",unfairZ:"中等保護"},
    holidays:["元旦","CNY","EDSA","英勇日","聖週×3","勞動節","Eid×2","獨立日","Ninoy Aquino","英雄日","Bonifacio","聖誕前夜","聖誕","Rizal Day","除夕"],
    rg:{date:"2025-09",title:"BSP VASP Update",sum:"Custodial insurance mandate."}},
  {id:"my",n:"Malaysia",zh:"馬來西亞",flag:"🇲🇾",xc:8,tax:"0-30%",col:42,rs:"regulated",ts:60,mx:502,my:162,
    labor:{ph:11,al:"8-16d",alZ:"8-16天依年資",ad:8,mat:"98d paid",matZ:"98天帶薪",pat:"7d paid",patZ:"7天帶薪",sev:"10-20d/yr",sevZ:"每年10-20天",mar:"1-3d common",marZ:"1-3天常見",sick:"14-22d+60",sickZ:"14-22天+60住院",notice:"4-8 weeks",noticeZ:"4-8週",th13:"Common practice",th13Z:"實務常見",prob:"3-6 months",probZ:"3-6個月",bvt:"Not mandated",bvtZ:"無強制",wkhr:"45",ot:"150% (normal), 200% (rest)",otZ:"平日150% 休日200%",minw:"RM1,500/mo",minwZ:"RM1,500/月",erSS:"~15% EPF+SOCSO",erSSZ:"約15% EPF+SOCSO",eeSS:"~13% EPF",eeSSZ:"約13% EPF",pen:"EPF mandatory",penZ:"EPF強制提撥",term:"Valid reason required",termZ:"需正當理由",unfair:"Moderate (Industrial Ct)",unfairZ:"中等（勞工法庭）"},
    holidays:["New Year","Thaipusam","Nuzul Al-Quran","Labour Day","Hari Raya×2","Agong Birthday","Haji×2","Malaysia Day","Mawlid","Deepavali","Christmas"],
    rg:{date:"2025-10",title:"SC Digital Asset",sum:"Cybersecurity standards up."}},
];

// ═══════ WORLD MAP ═══════
const WorldMap = ({ selected, onSelect, countries = COUNTRIES, t: tr }) => {
  const [hov, setHov] = useState(null);
  const regions = [
    { label: "Americas", zh:"美洲", countries: ["us"] },
    { label: "Europe", zh:"歐洲", countries: ["gb","ch","mt"] },
    { label: "Middle East", zh:"中東", countries: ["ae"] },
    { label: "East Asia", zh:"東亞", countries: ["jp","kr","hk","tw"] },
    { label: "SE Asia", zh:"東南亞", countries: ["sg","my","ph"] },
  ];
  return (
    <div style={{padding:"14px 16px",borderRadius:8,background:"rgba(250,249,247,0.5)",border:"1px solid rgba(200,200,210,0.22)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <Tag color={D.tx3}>{selected.length}/6 {tr ? tr("selected","已選擇") : "selected"}</Tag>
        <Tag color={D.tx4}>{tr ? tr("Click to toggle","點擊切換") : "Click to toggle"}</Tag>
      </div>
      <div style={{display:"flex",gap:8}}>
        {regions.map(r => (
          <div key={r.label} style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:D.tx4,fontFamily:"'DM Mono',monospace",letterSpacing:1.5,textAlign:"center",marginBottom:8,fontWeight:500}}>{tr ? tr(r.label, r.zh) : r.label}</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
              {r.countries.map(cid => {
                const c = countries.find(x=>x.id===cid);
                if(!c) return null;
                const sel = selected.includes(cid);
                const ho = hov === cid;
                return (
                  <div key={cid} onClick={()=>onSelect(cid)} onMouseEnter={()=>setHov(cid)} onMouseLeave={()=>setHov(null)}
                    style={{
                      display:"flex",alignItems:"center",gap:6,
                      padding:"8px 12px",borderRadius:6,cursor:"pointer",width:"100%",
                      background: sel ? D.slate+"10" : ho ? D.copper+"08" : "transparent",
                      border: "1px solid "+(sel ? D.slate+"30" : ho ? D.copper+"20" : "transparent"),
                      transition:"all 0.2s",
                    }}>
                    <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
                      background: sel ? D.slate : ho ? D.copper : D.tx5,
                      opacity: sel ? 0.7 : ho ? 0.5 : 0.25,
                      boxShadow: sel ? "0 0 6px "+D.slate+"30" : "none",
                      transition:"all 0.2s",
                    }}/>
                    <span style={{fontSize:16}}>{c.flag}</span>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{fontSize:13,fontWeight:sel?600:400,color:sel?D.slate:ho?D.copper:D.tx3,fontFamily:"'DM Mono','Noto Sans TC',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tr ? tr(c.n, c.zh) : c.n}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════ MAIN APP ═══════
export default function App() {
  const [tab, setTab] = useState("home");
  const [selC, setSelC] = useState(["us","sg","ae"]);
  const [selFam, setSelFam] = useState("eng");
  const [selSub, setSelSub] = useState("be");
  const [track, setTrack] = useState("ic");
  const [usdt, setUsdt] = useState(false);
  const [lang, setLang] = useState("zh");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [ready, setReady] = useState(false);
  const [calC, setCalC] = useState("tw");
  const [calView, setCalView] = useState("sheet"); // "sheet" or "calendar" or "yearcomp"
  useEffect(()=>{setTimeout(()=>setReady(true),60)},[]);
  const t = useCallback((e,z)=>lang==="zh"?z:e,[lang]);
  const fam = FAMS.find(f=>f.id===selFam);
  const lvls = JLVL[track];
  useEffect(()=>{const f=FAMS.find(f=>f.id===selFam);if(f&&!f.subs.find(s=>s.id===selSub))setSelSub(f.subs[0].id)},[selFam]);
  const togC = id => setSelC(p=>p.includes(id)?p.filter(x=>x!==id):p.length<6?[...p,id]:p);

  const TABS=[{id:"home",e:"Home",z:"首頁"},{id:"salary",e:"Salary",z:"薪資"},{id:"totalcomp",e:"Total Comp",z:"總薪酬"},{id:"labor",e:"Labor Law",z:"勞動法規"},{id:"calendar",e:"Calendar",z:"行事曆"},{id:"regulation",e:"Regulation",z:"法規"},{id:"countries",e:"Countries",z:"國家"}];

  const BG=()=>(<div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#ece9e3 0%,#f0eeea 35%,#efede8 65%,#ece9e4 100%)"}}/>
    <div style={{position:"absolute",inset:0,opacity:0.3,backgroundImage:`linear-gradient(${D.slate}05 1px,transparent 1px),linear-gradient(90deg,${D.slate}05 1px,transparent 1px)`,backgroundSize:"48px 48px"}}/>
    <div style={{position:"absolute",top:"-10%",right:"-5%",width:600,height:600,background:`radial-gradient(circle,${D.slate}05 0%,transparent 55%)`,borderRadius:"50%",filter:"blur(80px)"}}/>
    <div style={{position:"absolute",bottom:"-5%",left:"10%",width:400,height:400,background:`radial-gradient(circle,${D.sage}04 0%,transparent 55%)`,borderRadius:"50%",filter:"blur(80px)"}}/>
  </div>);

  const Header=()=>(<header style={{position:"sticky",top:0,zIndex:100,background:"rgba(240,238,234,0.75)",backdropFilter:"blur(24px)",borderBottom:`1px solid rgba(0,0,0,0.04)`}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1360,margin:"0 auto",height:58,padding:"0 28px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>{setTab("home");setDetail(null)}}>
        <span style={{fontSize:18,fontWeight:500,fontFamily:"'DM Mono',monospace",color:D.ink,letterSpacing:2}}>Crypto<span style={{color:D.slate}}>Comp</span></span>
      </div>
      <nav style={{display:"flex",gap:1}}>{TABS.map(i=>(<button key={i.id} onClick={()=>{setTab(i.id);setDetail(null)}} style={{background:"transparent",border:"none",color:tab===i.id?D.tx:D.tx4,padding:"6px 12px",cursor:"pointer",fontSize:14,fontWeight:tab===i.id?500:400,fontFamily:"'DM Mono','Noto Sans TC',monospace",borderBottom:tab===i.id?`2px solid ${D.slate}`:"2px solid transparent",transition:"all 0.2s"}}>{t(i.e,i.z)}</button>))}</nav>
      <div style={{display:"flex",gap:5}}>
        <button onClick={()=>setUsdt(!usdt)} style={{background:"none",border:`1px solid ${D.ln}`,color:usdt?D.copper:D.tx3,padding:"3px 10px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{usdt?"₮ USDT":"$ USD"}</button>
        <button onClick={()=>setLang(lang==="zh"?"en":"zh")} style={{background:"none",border:`1px solid ${D.ln}`,color:D.tx3,padding:"3px 10px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:500}}>{lang==="zh"?"EN":"中文"}</button>
      </div>
    </div>
  </header>);

  // ═══════ HOME ═══════
  const Home = () => (
    <div>
      {/* Hero section with map */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,padding:"48px 0 40px",alignItems:"center"}}>
        <div style={{opacity:ready?1:0,transform:ready?"translateX(0)":"translateX(-20px)",transition:"all 0.8s cubic-bezier(.22,1,.36,1)"}}>
          <Tag color={D.copper}>Cross-Border Compensation Intelligence</Tag>
          <h1 style={{fontSize:42,fontWeight:400,color:D.tx,lineHeight:1.25,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginTop:16,letterSpacing:-0.5}}>
            {t("Global crypto","跨國加密貨幣")}<br/>
            {t("compensation,","薪酬情報，")}<br/>
            <span style={{color:D.slate}}>{t("decoded.","全面解碼。")}</span>
          </h1>
          <p style={{fontSize:15,color:D.tx3,lineHeight:1.85,marginTop:20,maxWidth:420}}>
            {t("Total comp structures, labor regulations, leave policies, and public holidays across 12 crypto jurisdictions. Built by cross-border C&B practitioners.",
               "總薪酬結構、勞動法規、假別制度與行事曆。橫跨12個加密貨幣管轄區，由跨境薪酬福利實務專家打造。")}
          </p>
          <div style={{display:"flex",gap:10,marginTop:28}}>
            <button onClick={()=>setTab("totalcomp")} style={{background:D.ink,color:"#fff",border:"none",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:500,fontFamily:"'DM Mono',monospace",letterSpacing:0.3}}>{t("Explore Total Comp","探索總薪酬")}</button>
            <button onClick={()=>setTab("labor")} style={{background:"transparent",color:D.tx2,border:`1px solid ${D.ln}`,padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t("Labor Law Compare","勞動法規對比")}</button>
          </div>
        </div>
        <div style={{opacity:ready?1:0,transform:ready?"translateX(0)":"translateX(20px)",transition:"all 0.8s cubic-bezier(.22,1,.36,1) 0.2s"}}>
          <WorldMap selected={selC} onSelect={togC} t={t}/>
          <div style={{textAlign:"center",marginTop:6}}><span style={{fontSize:12,color:D.tx4}}>{t("Click countries to compare","點選國家進行比較")}</span></div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:16,padding:"28px 0",borderTop:`1px solid ${D.ln}`,borderBottom:`1px solid ${D.ln}`}}>
        {[{v:"12",l:t("Countries","國家"),c:D.slate},{v:"480",l:t("Roles","職位"),c:D.sage},{v:"10",l:t("Levels","職等"),c:D.copper},{v:"10",l:t("Leave Types","假別"),c:D.clay},{v:"471",l:t("Exchanges","交易所"),c:D.wine}].map((s,i)=>(
          <div key={i} style={{textAlign:"center",opacity:ready?1:0,transition:`all 0.5s ease ${0.4+i*0.08}s`}}>
            <Num value={s.v} color={s.c} size={30}/>
            <div style={{fontSize:12,color:D.tx4,letterSpacing:1.5,fontWeight:500,fontFamily:"'DM Mono',monospace",marginTop:5}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:14,marginTop:36}}>
        {[
          {t:t("Total Comp Anatomy","總薪酬結構解剖"),d:t("Base, bonus, token, employer cost — full picture","底薪、獎金、代幣、雇主成本——全貌"),c:D.slate,go:"totalcomp"},
          {t:t("Salary Matrix","薪資矩陣"),d:t("8 families × 24 roles × dual track × 12 countries","8族群×24職位×雙軌道×12國"),c:D.sage,go:"salary"},
          {t:t("Labor Law","勞動法規"),d:t("Leave, severance, notice — side by side","假別、資遣、預告——並列對比"),c:D.copper,go:"labor"},
          {t:t("Calendars","行事曆"),d:t("Public holidays for every jurisdiction","12國國定假日"),c:D.clay,go:"calendar"},
          {t:t("Crypto Regulation","幣圈法規"),d:t("Licensing, tax, regulatory status","牌照、稅務、監管"),c:D.wine,go:"regulation"},
          {t:t("Country Profiles","國家檔案"),d:t("Deep-dive with all data layers","所有維度深度整合"),c:D.tx3,go:"countries"},
        ].map((f,i)=>(<Card key={i} accent={f.c} onClick={()=>setTab(f.go)} style={{opacity:ready?1:0,transform:ready?"translateY(0)":"translateY(12px)",transition:`all 0.5s ease ${0.5+i*0.06}s`}}>
          <div style={{padding:"20px 18px"}}>
            <div style={{width:24,height:2,borderRadius:2,background:f.c,opacity:0.4,marginBottom:14}}/>
            <div style={{fontSize:16,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}>{f.t}</div>
            <p style={{fontSize:14,color:D.tx3,marginTop:8,lineHeight:1.55}}>{f.d}</p>
            <div style={{marginTop:14,fontSize:13,color:f.c,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t("Explore →","前往 →")}</div>
          </div>
        </Card>))}
      </div>
    </div>
  );

  // ═══════ JOB SELECTOR ═══════
  const [selLvl, setSelLvl] = useState(2); // default IC3/M3
  const JobSel=()=>{
    const curLvl = JLVL[track][selLvl];
    return (<Card glow style={{marginBottom:12}}>
      <div style={{padding:"14px 18px"}}>
        {/* Row 1: Family */}
        <div style={{marginBottom:10}}>
          <Tag>{t("Job Family","職能族群")} · {FAMS.length}</Tag>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>
            {FAMS.map(f=>(<button key={f.id} onClick={()=>setSelFam(f.id)} style={{background:selFam===f.id?D.slate+"0c":"transparent",border:"1px solid "+(selFam===f.id?D.slate+"25":"transparent"),color:selFam===f.id?D.slate:D.tx4,padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}>{t(f.label,f.zh)}</button>))}
          </div>
        </div>
        {/* Row 2: Subfunction */}
        <div style={{marginBottom:10,paddingTop:10,borderTop:"1px solid "+D.lnF}}>
          <Tag>{t("Role / Subfunction","職位/子職能")} · {fam?.subs.length||0}</Tag>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>
            {fam?.subs.map(s=>(<button key={s.id} onClick={()=>setSelSub(s.id)} style={{background:selSub===s.id?D.sage+"0c":"transparent",border:"1px solid "+(selSub===s.id?D.sage+"25":"transparent"),color:selSub===s.id?D.sage:D.tx4,padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}>{t(s.l,s.zh)}</button>))}
          </div>
        </div>
        {/* Row 3: Track + Level */}
        <div style={{display:"flex",gap:20,paddingTop:10,borderTop:"1px solid "+D.lnF}}>
          <div>
            <Tag>{t("Track","軌道")}</Tag>
            <div style={{display:"flex",gap:3,marginTop:5}}>
              {[{id:"ic",e:"Individual Contributor",z:"個人貢獻者"},{id:"mgmt",e:"Management",z:"管理職"}].map(tr=>(<button key={tr.id} onClick={()=>setTrack(tr.id)} style={{background:track===tr.id?D.copper+"0c":"transparent",border:"1px solid "+(track===tr.id?D.copper+"25":"transparent"),color:track===tr.id?D.copper:D.tx4,padding:"4px 12px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t(tr.e,tr.z)}</button>))}
            </div>
          </div>
          <div style={{flex:1,borderLeft:"1px solid "+D.lnF,paddingLeft:20}}>
            <Tag>{t("Level","職等")}</Tag>
            <div style={{display:"flex",gap:3,marginTop:5}}>
              {JLVL[track].map((l,i)=>(<button key={l.id} onClick={()=>setSelLvl(i)} style={{background:selLvl===i?D.copper+"0c":"transparent",border:"1px solid "+(selLvl===i?D.copper+"25":"transparent"),color:selLvl===i?D.copper:D.tx4,padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t(l.l,l.zh)}</button>))}
            </div>
          </div>
        </div>
        {/* Level description card */}
        {curLvl && (
          <div style={{marginTop:10,padding:"10px 14px",background:D.copper+"06",borderRadius:6,borderLeft:"3px solid "+D.copper+"30"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:14,fontWeight:600,color:D.copper,fontFamily:"'DM Mono',monospace"}}>{t(curLvl.l,curLvl.zh)}</span>
              <div style={{display:"flex",gap:10}}>
                <span style={{fontSize:11,color:D.tx4}}>{t("Exp: ","經驗：")+curLvl.yr}</span>
                {curLvl.head!=="N/A" && <span style={{fontSize:11,color:D.tx4}}>{t("Headcount: ","管理人數：")+curLvl.head}</span>}
              </div>
            </div>
            <div style={{fontSize:13,color:D.tx2,lineHeight:1.6}}>{lang==="zh" ? curLvl.scopeZ : curLvl.scope}</div>
          </div>
        )}
      </div>
    </Card>);
  };

  // ═══════ TOTAL COMP ═══════
  const TotalComp=()=>{
    const sel=selC.map(id=>COUNTRIES.find(c=>c.id===id)).filter(Boolean);
    const li=selLvl;
    const parts=[{k:"base",l:t("Base","底薪"),c:D.slate},{k:"bonus",l:t("Bonus","獎金"),c:D.sage},{k:"token",l:"Token",c:D.copper},{k:"er",l:t("ER Cost","雇主成本"),c:D.clay},{k:"allow",l:t("Allow","津貼"),c:D.wine}];

    const data = sel.map(c => {
      const base = gS(c.id, selFam, selSub, track, li);
      const tc = TC[c.id] || {};
      const vals = {
        base,
        bonus: Math.round(base * (tc.bonus||0) / 100),
        token: Math.round(base * (tc.token||0) / 100),
        er: Math.round(base * (tc.er||0) / 100),
        allow: Math.round(base * (tc.allow||0) / 100),
      };
      const total = Object.values(vals).reduce((a,b)=>a+b,0) || 1;
      return { c, tc, vals, total, base };
    });
    const maxTotal = Math.max(...data.map(d=>d.total), 1);

    return(<div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}>{t("Total Compensation Anatomy","總薪酬結構解剖")}</div>
        <p style={{fontSize:14,color:D.tx3,marginTop:4}}>{t("Beyond base salary — the full employer cost","超越底薪——雇主實際成本全貌")}</p>
      </div>
      <JobSel/>
      <WorldMap selected={selC} onSelect={togC} t={t}/>

      {sel.length===0 && <Card glow><div style={{padding:"40px 20px",textAlign:"center",fontSize:14,color:D.tx4}}>{t("Select countries above to compare","請在上方選擇國家進行比較")}</div></Card>}

      {sel.length > 0 && (<div style={{marginTop:12}}>
        {/* ── VISUAL COMPARISON CHART ── */}
        <Card glow style={{marginBottom:14}}>
          <div style={{padding:"18px 20px"}}>
            <Tag>{t("SIDE-BY-SIDE COMPARISON","並排對比")}</Tag>
            <div style={{display:"flex",gap:16,marginTop:10,marginBottom:16}}>
              {parts.map(p => (
                <div key={p.k} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:12,height:12,borderRadius:3,background:p.c,opacity:0.5}}/>
                  <span style={{fontSize:12,color:D.tx3}}>{p.l}</span>
                </div>
              ))}
            </div>
            {data.map((d,i) => (
              <div key={d.c.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<data.length-1?14:0}}>
                <div style={{width:110,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:20}}>{d.c.flag}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:D.tx,lineHeight:1.2}}>{t(d.c.n,d.c.zh)}</div>
                    <div style={{fontSize:11,color:D.tx4,fontFamily:"'DM Mono',monospace"}}>{d.tc.multi||"—"}×</div>
                  </div>
                </div>
                <div style={{flex:1,position:"relative"}}>
                  <div style={{display:"flex",height:36,borderRadius:6,overflow:"hidden",width:Math.max((d.total/maxTotal*100),5)+"%",transition:"width 0.6s cubic-bezier(.22,1,.36,1)"}}>
                    {parts.map(p => {
                      const w = d.total > 0 ? (d.vals[p.k]/d.total)*100 : 0;
                      return <div key={p.k} style={{width:w+"%",background:p.c,opacity:0.4,display:"flex",alignItems:"center",justifyContent:"center",minWidth:w>6?20:0,borderRight:"1px solid rgba(255,255,255,0.5)",transition:"width 0.4s"}}>
                        {w>10 && <span style={{fontSize:11,fontWeight:600,color:"#fff",fontFamily:"'DM Mono',monospace",textShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>{d.vals[p.k]}K</span>}
                      </div>;
                    })}
                  </div>
                </div>
                <div style={{width:80,textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:20,fontWeight:600,fontFamily:"'DM Mono',monospace",color:D.ink}}>{fmt(d.total,usdt)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── COMPARISON TABLE ── */}
        <Card glow style={{marginBottom:14}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{position:"sticky",left:0,zIndex:3,background:D.surface,padding:"12px 16px",textAlign:"left",borderBottom:"2px solid "+D.ln,fontSize:12,color:D.tx4,fontFamily:"'DM Mono',monospace",minWidth:130}}>{t("Component","薪酬項目")}</th>
                  {data.map(d => (
                    <th key={d.c.id} style={{padding:"10px 12px",textAlign:"center",borderBottom:"2px solid "+D.ln,minWidth:120}}>
                      <div style={{fontSize:18}}>{d.c.flag}</div>
                      <div style={{fontSize:13,fontWeight:600,color:D.tx,marginTop:2}}>{t(d.c.n,d.c.zh)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parts.map((p,ri) => (
                  <tr key={p.k} style={{borderTop:"1px solid "+D.lnF}}>
                    <td style={{position:"sticky",left:0,zIndex:2,padding:"10px 16px",background:ri%2?D.slate+"03":D.surface,borderRight:"1px solid "+D.lnF}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:10,height:10,borderRadius:3,background:p.c,opacity:0.5}}/>
                        <span style={{fontSize:13,fontWeight:600,color:D.tx}}>{p.l}</span>
                      </div>
                    </td>
                    {data.map(d => {
                      const val = d.vals[p.k];
                      const pct = d.total > 0 ? Math.round(val/d.total*100) : 0;
                      const maxVal = Math.max(...data.map(x=>x.vals[p.k]), 1);
                      const isMax = val === maxVal && data.length > 1;
                      return (
                        <td key={d.c.id} style={{padding:"10px 12px",textAlign:"center",borderLeft:"1px solid "+D.lnF}}>
                          <div style={{fontSize:16,fontWeight:600,fontFamily:"'DM Mono',monospace",color:isMax?p.c:D.tx}}>{fmt(val,usdt)}</div>
                          <div style={{fontSize:11,color:D.tx4,marginTop:2}}>{pct}%</div>
                          <div style={{width:"100%",height:4,background:D.lnF,borderRadius:2,marginTop:4}}>
                            <div style={{width:(val/maxVal*100)+"%",height:"100%",background:p.c,opacity:0.4,borderRadius:2,transition:"width 0.5s"}}/>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{borderTop:"3px solid "+D.ln,background:D.slate+"06"}}>
                  <td style={{position:"sticky",left:0,zIndex:2,padding:"12px 16px",background:D.slate+"0a",borderRight:"1px solid "+D.lnF}}>
                    <span style={{fontSize:14,fontWeight:700,color:D.tx}}>{t("TOTAL EMPLOYER COST","雇主總成本")}</span>
                  </td>
                  {data.map(d => (
                    <td key={d.c.id} style={{padding:"12px 12px",textAlign:"center",borderLeft:"1px solid "+D.lnF}}>
                      <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Mono',monospace",color:D.ink}}>{fmt(d.total,usdt)}</div>
                      <div style={{fontSize:12,color:D.copper,fontWeight:500}}>{d.tc.multi||"—"}× {t("of base","底薪")}</div>
                    </td>
                  ))}
                </tr>
                <tr style={{borderTop:"1px solid "+D.lnF}}>
                  <td style={{position:"sticky",left:0,zIndex:2,padding:"10px 16px",background:D.surface,borderRight:"1px solid "+D.lnF}}>
                    <span style={{fontSize:12,color:D.tx3}}>{t("ER Statutory Detail","雇主法定提撥")}</span>
                  </td>
                  {data.map(d => (
                    <td key={d.c.id} style={{padding:"10px 12px",textAlign:"center",borderLeft:"1px solid "+D.lnF}}>
                      <div style={{fontSize:12,color:D.clay}}>{d.tc.erL||"—"}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── DETAIL CHIPS ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(sel.length,3)+",1fr)",gap:12}}>
          {data.map(d => (
            <Card key={d.c.id} glow>
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <span style={{fontSize:18}}>{d.c.flag}</span>
                  <span style={{fontSize:14,fontWeight:600,color:D.tx}}>{t(d.c.n,d.c.zh)}</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:D.sage+"0c",color:D.sage}}>{d.tc.bN} {d.tc.bonus}%</span>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:D.copper+"0c",color:D.copper}}>{d.tc.tN} {d.tc.token}%</span>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:D.clay+"0c",color:D.clay}}>{d.tc.erL}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>)}
    </div>);
  };

  const Salary=()=>{
    const sel=selC.map(id=>COUNTRIES.find(c=>c.id===id)).filter(Boolean);const bC=[D.slate,D.sage,D.copper,D.clay,D.wine,"#6b6b8a"];
    return(<div>
      <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginBottom:20}}>{t("Salary Matrix","薪資矩陣")}</div>
      <JobSel/><WorldMap selected={selC} onSelect={togC} t={t}/>
      <Card glow style={{marginTop:12}}><div style={{padding:18}}>{sel.map((c,ci)=>(<div key={c.id} style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:18}}>{c.flag}</span><span style={{fontSize:15,color:D.tx,fontWeight:500}}>{t(c.n,c.zh)}</span></div>
        <div style={{display:"flex",gap:4}}>{lvls.map((l,li)=>{const v=gS(c.id,selFam,selSub,track,li);const mx=Math.max(...sel.map(x=>gS(x.id,selFam,selSub,track,lvls.length-1)));return(<div key={l.id} style={{flex:1}}><div style={{fontSize:11,color:LV[li],fontWeight:500,fontFamily:"'DM Mono',monospace",marginBottom:3,textAlign:"center"}}>{l.id.toUpperCase()}</div><div style={{height:34,borderRadius:5,background:`${bC[ci]}06`,position:"relative",overflow:"hidden"}}><div style={{width:`${(v/(mx*1.1))*100}%`,height:"100%",background:`${bC[ci]}20`,borderRadius:4,transition:"width 0.7s"}}/><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:13,fontWeight:500,fontFamily:"'DM Mono',monospace",color:bC[ci]}}>{fmt(v,usdt)}</span></div></div>)})}</div>
      </div>))}</div></Card>
    </div>);
  };

  // ═══════ LABOR ═══════
  const Labor=()=>{
    const sel=selC.map(id=>COUNTRIES.find(c=>c.id===id)).filter(Boolean);
    const sections = [
      { title: t("Leave Entitlements","假別制度"), rows: [
        {k:"ph",kz:null,e:"Public Holidays",z:"國定假日",num:true},
        {k:"al",kz:"alZ",e:"Annual Leave",z:"特休/年假"},
        {k:"sick",kz:"sickZ",e:"Sick Leave",z:"病假"},
        {k:"mar",kz:"marZ",e:"Marriage Leave",z:"婚假"},
        {k:"mat",kz:"matZ",e:"Maternity Leave",z:"產假"},
        {k:"pat",kz:"patZ",e:"Paternity Leave",z:"陪產假"},
        {k:"bvt",kz:"bvtZ",e:"Bereavement Leave",z:"喪假"},
      ]},
      { title: t("Employment Terms","僱傭條件"), rows: [
        {k:"prob",kz:"probZ",e:"Probation Period",z:"試用期"},
        {k:"notice",kz:"noticeZ",e:"Notice Period",z:"預告期"},
        {k:"sev",kz:"sevZ",e:"Severance Pay",z:"資遣費"},
        {k:"th13",kz:"th13Z",e:"13th Month Pay",z:"第13個月薪"},
      ]},
      { title: t("Working Conditions","工作條件"), rows: [
        {k:"wkhr",kz:null,e:"Work Hours/Week",z:"每週工時"},
        {k:"ot",kz:"otZ",e:"Overtime Premium",z:"加班費"},
        {k:"minw",kz:"minwZ",e:"Minimum Wage",z:"最低工資"},
      ]},
      { title: t("Social Security & Pension","社會保險與退休金"), rows: [
        {k:"erSS",kz:"erSSZ",e:"Employer SS Rate",z:"雇主社保費率"},
        {k:"eeSS",kz:"eeSSZ",e:"Employee SS Rate",z:"員工社保費率"},
        {k:"pen",kz:"penZ",e:"Pension System",z:"退休金制度"},
      ]},
      { title: t("Termination Protection","解僱保護"), rows: [
        {k:"term",kz:"termZ",e:"Termination Rules",z:"解僱規定"},
        {k:"unfair",kz:"unfairZ",e:"Unfair Dismissal Protection",z:"不當解僱保護"},
      ]},
    ];
    const getVal = (c, r) => {
      if(!c || !c.labor) return "-";
      if(r.num) return c.labor[r.k] ?? 0;
      if(lang==="zh" && r.kz) return c.labor[r.kz] || c.labor[r.k] || "-";
      return c.labor[r.k] || "-";
    };
    const maxPH = sel.length ? Math.max(...sel.map(c => c.labor?.ph ?? 0)) : 0;
    const minPH = sel.length ? Math.min(...sel.map(c => c.labor?.ph ?? 99)) : 0;
    let rowIdx = 0;
    return(
      <div>
        <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginBottom:6}}>{t("Labor Law Comparison","勞動法規對比")}</div>
        <div style={{fontSize:14,color:D.tx3,marginBottom:20}}>{t("20 categories across 5 dimensions","5大維度共20項類別")}</div>
        <WorldMap selected={selC} onSelect={togC} t={t}/>
        <Card glow style={{marginTop:12}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",padding:"14px 18px",fontSize:13,color:D.tx3,fontWeight:500,fontFamily:"'DM Mono',monospace",position:"sticky",left:0,background:D.surface,zIndex:2,borderBottom:"1px solid "+D.ln,minWidth:150}}>
                    {t("Category","類別")}
                  </th>
                  {sel.map(c => (
                    <th key={c.id} style={{textAlign:"center",padding:"14px 12px",borderBottom:"1px solid "+D.ln,minWidth:135}}>
                      <div style={{fontSize:22}}>{c.flag}</div>
                      <div style={{fontSize:13,fontWeight:500,color:D.tx,marginTop:2}}>{t(c.n,c.zh)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((sec, si) => [
                  <tr key={"sec-"+si} style={{borderTop: si===0 ? "none" : "2px solid "+D.ln}}>
                    <td colSpan={sel.length+1} style={{padding:"10px 16px 6px",fontSize:13,fontWeight:600,color:D.slate,fontFamily:"'DM Mono',monospace",letterSpacing:1.5,background:D.slate+"05"}}>
                      {sec.title.toUpperCase()}
                    </td>
                  </tr>,
                  ...sec.rows.map((r, ri) => {
                    rowIdx++;
                    return (
                      <tr key={r.k} style={{borderTop: "1px solid "+D.lnF}}>
                        <td style={{padding:"11px 18px",fontSize:14,color:D.tx,fontWeight:500,position:"sticky",left:0,background:rowIdx%2 ? D.slate+"03" : D.surface,zIndex:1,borderRight:"1px solid "+D.lnF}}>
                          {t(r.e,r.z)}
                        </td>
                        {sel.map(c => {
                          const v = getVal(c, r);
                          const isN = r.num;
                          let color = D.tx2;
                          if(r.k==="ph" && typeof v==="number"){
                            if(v===maxPH) color=D.sage;
                            if(v===minPH) color=D.wine;
                          }
                          return (
                            <td key={c.id} style={{textAlign:"center",padding:"11px 12px",fontSize:isN?15:10.5,fontFamily:isN?"'DM Mono',monospace":"inherit",fontWeight:isN?500:400,color:color,verticalAlign:"top"}}>
                              {isN ? (v + " " + t("d","天")) : String(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ])}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };


  // ═══════ CALENDAR ═══════
  // ═══════ HOLIDAY DATABASE (2026) ═══════
  // ═══════ HOLIDAY DATABASE (2025-2027) ═══════
  const HOLIDAYS_DB = {
    2025: {
      us:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:20,n:"MLK Day",z:"馬丁路德金日",t:"R"},{m:2,d:17,n:"Presidents' Day",z:"總統日",t:"R"},{m:5,d:26,n:"Memorial Day",z:"陣亡將士紀念日",t:"R"},{m:6,d:19,n:"Juneteenth",z:"六月節",t:"R"},{m:7,d:4,n:"Independence Day",z:"獨立日",t:"R"},{m:9,d:1,n:"Labor Day",z:"勞動節",t:"R"},{m:10,d:13,n:"Columbus Day",z:"哥倫布日",t:"R"},{m:11,d:11,n:"Veterans Day",z:"退伍軍人節",t:"R"},{m:11,d:27,n:"Thanksgiving",z:"感恩節",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"}],
      gb:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:4,d:18,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:4,d:21,n:"Easter Monday",z:"復活節",t:"R"},{m:5,d:5,n:"Early May",z:"五月初銀行假",t:"R"},{m:5,d:26,n:"Spring Bank",z:"春季銀行假",t:"R"},{m:8,d:25,n:"Summer Bank",z:"夏季銀行假",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"},{m:12,d:26,n:"Boxing Day",z:"節禮日",t:"R"}],
      ch:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:2,n:"Berchtoldstag",z:"聖伯托日",t:"R"},{m:4,d:18,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:4,d:21,n:"Easter Monday",z:"復活節",t:"R"},{m:5,d:29,n:"Ascension",z:"耶穌升天",t:"R"},{m:6,d:9,n:"Whit Monday",z:"聖靈降臨",t:"R"},{m:8,d:1,n:"National Day",z:"國慶",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"},{m:12,d:26,n:"St. Stephen's",z:"聖史蒂芬日",t:"R"}],
      mt:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:10,n:"St. Paul's",z:"聖保羅船難",t:"R"},{m:3,d:19,n:"St. Joseph",z:"聖若瑟",t:"R"},{m:3,d:31,n:"Freedom Day",z:"自由日",t:"R"},{m:4,d:18,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:5,d:1,n:"Workers' Day",z:"勞動節",t:"R"},{m:6,d:7,n:"Sette Giugno",z:"六七紀念",t:"R"},{m:6,d:29,n:"St. Peter & Paul",z:"聖伯多祿聖保祿",t:"R"},{m:8,d:15,n:"Assumption",z:"聖母升天",t:"R"},{m:9,d:8,n:"Victory Day",z:"勝利日",t:"R"},{m:9,d:21,n:"Independence",z:"獨立日",t:"R"},{m:12,d:8,n:"Immaculate",z:"聖母無原罪",t:"R"},{m:12,d:13,n:"Republic Day",z:"共和日",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"}],
      ae:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:27,n:"Isra Mi'raj",z:"登霄節",t:"R"},{m:3,d:30,n:"Eid al-Fitr 1",z:"開齋節1",t:"R"},{m:3,d:31,n:"Eid al-Fitr 2",z:"開齋節2",t:"R"},{m:4,d:1,n:"Eid al-Fitr 3",z:"開齋節3",t:"R"},{m:6,d:5,n:"Arafat Day",z:"阿拉法日",t:"R"},{m:6,d:6,n:"Eid al-Adha 1",z:"宰牲節1",t:"R"},{m:6,d:7,n:"Eid al-Adha 2",z:"宰牲節2",t:"R"},{m:6,d:8,n:"Eid al-Adha 3",z:"宰牲節3",t:"R"},{m:6,d:26,n:"Hijri New Year",z:"伊斯蘭新年",t:"R"},{m:9,d:4,n:"Prophet Birthday",z:"聖紀節",t:"R"},{m:11,d:30,n:"Commemoration",z:"紀念日",t:"R"},{m:12,d:2,n:"National Day",z:"國慶日",t:"R"},{m:12,d:3,n:"National Day 2",z:"國慶翌日",t:"R"}],
      sg:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:29,n:"CNY Day 1",z:"農曆新年初一",t:"R"},{m:1,d:30,n:"CNY Day 2",z:"農曆新年初二",t:"R"},{m:3,d:31,n:"Hari Raya Puasa",z:"開齋節",t:"R"},{m:4,d:18,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:5,d:12,n:"Vesak Day",z:"衛塞節",t:"R"},{m:6,d:7,n:"Hari Raya Haji",z:"哈芝節",t:"R"},{m:8,d:9,n:"National Day",z:"國慶日",t:"R"},{m:10,d:20,n:"Deepavali",z:"屠妖節",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"}],
      hk:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:29,n:"CNY 1",z:"年初一",t:"R"},{m:1,d:30,n:"CNY 2",z:"年初二",t:"R"},{m:1,d:31,n:"CNY 3",z:"年初三",t:"R"},{m:4,d:4,n:"Ching Ming",z:"清明",t:"R"},{m:4,d:18,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:4,d:21,n:"Easter Mon",z:"復活節",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:5,d:5,n:"Buddha Birthday",z:"佛誕",t:"R"},{m:5,d:31,n:"Dragon Boat",z:"端午",t:"R"},{m:7,d:1,n:"HKSAR Day",z:"回歸日",t:"R"},{m:10,d:7,n:"Mid-Autumn+1",z:"中秋翌日",t:"R"},{m:10,d:1,n:"National Day",z:"國慶",t:"R"},{m:10,d:29,n:"Chung Yeung",z:"重陽",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"},{m:12,d:26,n:"Boxing Day",z:"聖誕翌日",t:"R"}],
      tw:[{m:1,d:1,n:"Republic Day",z:"元旦",t:"R"},{m:1,d:28,n:"CNY Eve",z:"除夕",t:"R"},{m:1,d:29,n:"CNY 1",z:"春節初一",t:"R"},{m:1,d:30,n:"CNY 2",z:"春節初二",t:"R"},{m:1,d:31,n:"CNY 3",z:"春節初三",t:"R"},{m:2,d:28,n:"228 Peace",z:"228和平紀念",t:"R"},{m:4,d:4,n:"Children/Tomb Sweeping",z:"兒童節/清明",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:5,d:31,n:"Dragon Boat",z:"端午",t:"R"},{m:10,d:6,n:"Mid-Autumn",z:"中秋",t:"R"},{m:10,d:10,n:"National Day",z:"國慶",t:"R"}],
      jp:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:2,n:"New Year 2",z:"元旦假期",t:"R"},{m:1,d:3,n:"New Year 3",z:"元旦假期",t:"R"},{m:1,d:13,n:"Coming of Age",z:"成人の日",t:"R"},{m:2,d:11,n:"Foundation Day",z:"建國紀念",t:"R"},{m:2,d:23,n:"Emperor Birthday",z:"天皇誕生日",t:"R"},{m:3,d:20,n:"Vernal Equinox",z:"春分",t:"R"},{m:4,d:29,n:"Showa Day",z:"昭和の日",t:"R"},{m:5,d:3,n:"Constitution Day",z:"憲法紀念",t:"R"},{m:5,d:4,n:"Greenery Day",z:"綠の日",t:"R"},{m:5,d:5,n:"Children's Day",z:"子供の日",t:"R"},{m:5,d:6,n:"Substitute",z:"補假",t:"R"},{m:7,d:21,n:"Marine Day",z:"海の日",t:"R"},{m:8,d:11,n:"Mountain Day",z:"山の日",t:"R"},{m:9,d:15,n:"Respect Aged",z:"敬老の日",t:"R"},{m:9,d:23,n:"Autumnal Equinox",z:"秋分",t:"R"},{m:10,d:13,n:"Sports Day",z:"體育の日",t:"R"},{m:11,d:3,n:"Culture Day",z:"文化の日",t:"R"},{m:11,d:24,n:"Labour Thanks (obs)",z:"勤勞感謝（補假）",t:"R"}],
      kr:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:28,n:"Seollal Eve",z:"春節前夕",t:"R"},{m:1,d:29,n:"Seollal",z:"春節",t:"R"},{m:1,d:30,n:"Seollal+1",z:"春節翌日",t:"R"},{m:3,d:1,n:"Independence Mvmt",z:"三一節",t:"R"},{m:5,d:5,n:"Children's Day",z:"兒童節",t:"R"},{m:5,d:5,n:"Buddha Birthday",z:"佛誕",t:"R"},{m:6,d:6,n:"Memorial Day",z:"顯忠日",t:"R"},{m:8,d:15,n:"Liberation",z:"光復節",t:"R"},{m:10,d:5,n:"Chuseok Eve",z:"中秋前夕",t:"R"},{m:10,d:6,n:"Chuseok",z:"中秋",t:"R"},{m:10,d:7,n:"Chuseok+1",z:"中秋翌日",t:"R"},{m:10,d:3,n:"Foundation",z:"開天節",t:"R"},{m:10,d:9,n:"Hangul Day",z:"韓文日",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"}],
      ph:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:29,n:"Chinese NY",z:"農曆新年",t:"R"},{m:2,d:25,n:"EDSA",z:"EDSA革命",t:"R"},{m:4,d:17,n:"Maundy Thu",z:"聖週四",t:"R"},{m:4,d:18,n:"Good Friday",z:"受難日",t:"R"},{m:4,d:19,n:"Black Saturday",z:"黑色星期六",t:"R"},{m:4,d:9,n:"Araw ng Kagitingan",z:"英勇日",t:"R"},{m:5,d:1,n:"Labor Day",z:"勞動節",t:"R"},{m:3,d:31,n:"Eid al-Fitr",z:"開齋節",t:"R"},{m:6,d:7,n:"Eid al-Adha",z:"宰牲節",t:"R"},{m:6,d:12,n:"Independence",z:"獨立日",t:"R"},{m:8,d:21,n:"Ninoy Aquino",z:"乃乃基諾",t:"R"},{m:8,d:25,n:"Heroes Day",z:"英雄日",t:"R"},{m:11,d:30,n:"Bonifacio",z:"博尼法西奧",t:"R"},{m:12,d:8,n:"Immaculate",z:"聖母無原罪",t:"R"},{m:12,d:24,n:"Christmas Eve",z:"平安夜",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"},{m:12,d:30,n:"Rizal Day",z:"黎刹日",t:"R"}],
      my:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:29,n:"Thaipusam",z:"大寶森節",t:"R"},{m:3,d:27,n:"Nuzul Al-Quran",z:"可蘭經降世",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:3,d:31,n:"Hari Raya 1",z:"開齋節1",t:"R"},{m:4,d:1,n:"Hari Raya 2",z:"開齋節2",t:"R"},{m:6,d:2,n:"Agong Birthday",z:"元首誕辰",t:"R"},{m:6,d:7,n:"Hari Raya Haji 1",z:"哈芝節1",t:"R"},{m:6,d:8,n:"Hari Raya Haji 2",z:"哈芝節2",t:"R"},{m:9,d:16,n:"Malaysia Day",z:"馬來西亞日",t:"R"},{m:9,d:5,n:"Mawlid",z:"聖紀節",t:"R"},{m:10,d:20,n:"Deepavali",z:"屠妖節",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"}],
    },
    2026: {
      us: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:1,d:19,n:"Martin Luther King Jr. Day",z:"馬丁路德金日",t:"R"},
        {m:2,d:16,n:"Presidents' Day",z:"總統日",t:"R"},
        {m:5,d:25,n:"Memorial Day",z:"陣亡將士紀念日",t:"R"},
        {m:6,d:19,n:"Juneteenth",z:"六月節",t:"R"},
        {m:7,d:3,n:"Independence Day (obs)",z:"獨立日（7/4補假）",t:"O"},
        {m:9,d:7,n:"Labor Day",z:"勞動節",t:"R"},
        {m:10,d:12,n:"Columbus Day",z:"哥倫布日",t:"R"},
        {m:11,d:11,n:"Veterans Day",z:"退伍軍人節",t:"R"},
        {m:11,d:26,n:"Thanksgiving",z:"感恩節",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"}
      ],
      gb: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"B"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"B"},
        {m:4,d:6,n:"Easter Monday",z:"復活節",t:"B"},
        {m:5,d:4,n:"Early May Bank Holiday",z:"五月初銀行假",t:"B"},
        {m:5,d:25,n:"Spring Bank Holiday",z:"春季銀行假",t:"B"},
        {m:8,d:31,n:"Summer Bank Holiday",z:"夏季銀行假",t:"B"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"B"},
        {m:12,d:28,n:"Boxing Day (obs)",z:"節禮日（12/26補假）",t:"O"}
      ],
      ch: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:1,d:2,n:"Berchtoldstag",z:"聖伯托日",t:"R"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"R"},
        {m:4,d:6,n:"Easter Monday",z:"復活節",t:"R"},
        {m:5,d:14,n:"Ascension Day",z:"耶穌升天日",t:"R"},
        {m:5,d:25,n:"Whit Monday",z:"聖靈降臨節",t:"R"},
        {m:8,d:1,n:"Swiss National Day",z:"瑞士國慶",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"},
        {m:12,d:26,n:"St. Stephen's Day",z:"聖史蒂芬日",t:"R"}
      ],
      mt: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:2,d:10,n:"St. Paul's Shipwreck",z:"聖保羅船難",t:"R"},
        {m:3,d:19,n:"St. Joseph's Day",z:"聖若瑟日",t:"R"},
        {m:3,d:31,n:"Freedom Day",z:"自由日",t:"R"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"R"},
        {m:5,d:1,n:"Workers' Day",z:"勞動節",t:"R"},
        {m:6,d:7,n:"Sette Giugno",z:"六七紀念日",t:"R"},
        {m:6,d:29,n:"St. Peter & St. Paul",z:"聖伯多祿聖保祿",t:"R"},
        {m:8,d:15,n:"Assumption of Mary",z:"聖母升天",t:"R"},
        {m:9,d:8,n:"Victory Day",z:"勝利日",t:"R"},
        {m:9,d:21,n:"Independence Day",z:"獨立日",t:"R"},
        {m:12,d:8,n:"Immaculate Conception",z:"聖母無原罪",t:"R"},
        {m:12,d:13,n:"Republic Day",z:"共和日",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"}
      ],
      ae: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:3,d:19,n:"Eid al-Fitr Day 1",z:"開齋節第1天",t:"R"},
        {m:3,d:20,n:"Eid al-Fitr Day 2",z:"開齋節第2天",t:"R"},
        {m:3,d:21,n:"Eid al-Fitr Day 3",z:"開齋節第3天",t:"R"},
        {m:5,d:26,n:"Arafat Day",z:"阿拉法日",t:"R"},
        {m:5,d:27,n:"Eid al-Adha Day 1",z:"宰牲節第1天",t:"R"},
        {m:5,d:28,n:"Eid al-Adha Day 2",z:"宰牲節第2天",t:"R"},
        {m:5,d:29,n:"Eid al-Adha Day 3",z:"宰牲節第3天",t:"R"},
        {m:6,d:16,n:"Hijri New Year",z:"伊斯蘭新年",t:"R"},
        {m:8,d:25,n:"Prophet's Birthday",z:"聖紀節",t:"R"},
        {m:12,d:1,n:"Commemoration Day",z:"紀念日",t:"R"},
        {m:12,d:2,n:"National Day",z:"國慶日",t:"R"},
        {m:12,d:3,n:"National Day Holiday",z:"國慶翌日",t:"R"}
      ],
      sg: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:2,d:17,n:"Chinese New Year Day 1",z:"農曆新年初一",t:"R"},
        {m:2,d:18,n:"Chinese New Year Day 2",z:"農曆新年初二",t:"R"},
        {m:3,d:21,n:"Hari Raya Puasa",z:"開齋節",t:"R"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"R"},
        {m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},
        {m:5,d:27,n:"Hari Raya Haji",z:"哈芝節",t:"R"},
        {m:6,d:1,n:"Vesak Day (obs)",z:"衛塞節（5/31補假）",t:"O"},
        {m:8,d:10,n:"National Day (obs)",z:"國慶日（8/9補假）",t:"O"},
        {m:11,d:9,n:"Deepavali (obs)",z:"屠妖節（11/8補假）",t:"O"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"}
      ],
      hk: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:2,d:17,n:"Lunar New Year Day 1",z:"年初一",t:"R"},
        {m:2,d:18,n:"Lunar New Year Day 2",z:"年初二",t:"R"},
        {m:2,d:19,n:"Lunar New Year Day 3",z:"年初三",t:"R"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"R"},
        {m:4,d:4,n:"Day after Good Friday",z:"耶穌受難翌日",t:"R"},
        {m:4,d:6,n:"Ching Ming (obs)",z:"清明節（4/5補假）",t:"O"},
        {m:4,d:7,n:"Easter Monday (obs)",z:"復活節（補假）",t:"O"},
        {m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},
        {m:5,d:25,n:"Buddha's Birthday (obs)",z:"佛誕（5/24補假）",t:"O"},
        {m:6,d:19,n:"Dragon Boat Festival",z:"端午節",t:"R"},
        {m:7,d:1,n:"HKSAR Establishment Day",z:"香港特區成立紀念日",t:"R"},
        {m:9,d:26,n:"Day after Mid-Autumn",z:"中秋節翌日",t:"R"},
        {m:10,d:1,n:"National Day",z:"國慶日",t:"R"},
        {m:10,d:18,n:"Chung Yeung Festival",z:"重陽節",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"},
        {m:12,d:26,n:"Day after Christmas",z:"聖誕翌日",t:"R"}
      ],
      tw: [
        {m:1,d:1,n:"Republic Day",z:"元旦",t:"R"},
        {m:2,d:15,n:"Little New Year's Eve",z:"小年夜（2026新制）",t:"R"},
        {m:2,d:16,n:"Chinese New Year's Eve",z:"除夕",t:"R"},
        {m:2,d:17,n:"Spring Festival Day 1",z:"春節初一",t:"R"},
        {m:2,d:18,n:"Spring Festival Day 2",z:"春節初二",t:"R"},
        {m:2,d:19,n:"Spring Festival Day 3",z:"春節初三",t:"R"},
        {m:2,d:20,n:"Little NY obs",z:"小年夜逢例假補假",t:"O"},
        {m:2,d:27,n:"228 Peace Memorial (obs)",z:"228和平紀念日（2/28補假）",t:"O"},
        {m:4,d:3,n:"Children's Day (obs)",z:"兒童節（4/4補假）",t:"O"},
        {m:4,d:5,n:"Tomb Sweeping Day",z:"清明節",t:"R"},
        {m:5,d:1,n:"Labour Day",z:"勞動節（2026升格法定）",t:"R"},
        {m:6,d:19,n:"Dragon Boat Festival",z:"端午節",t:"R"},
        {m:9,d:25,n:"Mid-Autumn Festival",z:"中秋節",t:"R"},
        {m:9,d:28,n:"Confucius' Birthday",z:"孔子誕辰紀念日（2025新制）",t:"R"},
        {m:10,d:9,n:"National Day (obs)",z:"國慶日（10/10補假）",t:"O"},
        {m:10,d:26,n:"Retrocession Day (obs)",z:"台灣光復節（10/25補假）",t:"O"},
        {m:12,d:25,n:"Constitution Day",z:"行憲紀念日（2025新制）",t:"R"}
      ],
      jp: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:1,d:2,n:"New Year Holiday",z:"元旦假期",t:"R"},
        {m:1,d:3,n:"New Year Holiday",z:"元旦假期",t:"R"},
        {m:1,d:12,n:"Coming of Age Day",z:"成人の日",t:"R"},
        {m:2,d:11,n:"National Foundation Day",z:"建國紀念日",t:"R"},
        {m:2,d:23,n:"Emperor's Birthday",z:"天皇誕生日",t:"R"},
        {m:3,d:20,n:"Vernal Equinox Day",z:"春分の日",t:"R"},
        {m:4,d:29,n:"Showa Day",z:"昭和の日",t:"R"},
        {m:5,d:3,n:"Constitution Memorial Day",z:"憲法紀念日",t:"R"},
        {m:5,d:4,n:"Greenery Day",z:"綠の日",t:"R"},
        {m:5,d:5,n:"Children's Day",z:"子供の日",t:"R"},
        {m:7,d:20,n:"Marine Day",z:"海の日",t:"R"},
        {m:8,d:11,n:"Mountain Day",z:"山の日",t:"R"},
        {m:9,d:21,n:"Respect for the Aged Day",z:"敬老の日",t:"R"},
        {m:9,d:23,n:"Autumnal Equinox Day",z:"秋分の日",t:"R"},
        {m:10,d:12,n:"Sports Day",z:"體育の日",t:"R"},
        {m:11,d:3,n:"Culture Day",z:"文化の日",t:"R"},
        {m:11,d:23,n:"Labour Thanksgiving Day",z:"勤勞感謝の日",t:"R"}
      ],
      kr: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:2,d:16,n:"Seollal Eve",z:"春節前夕",t:"R"},
        {m:2,d:17,n:"Seollal (Lunar NY)",z:"春節",t:"R"},
        {m:2,d:18,n:"Seollal Day 2",z:"春節翌日",t:"R"},
        {m:3,d:1,n:"Independence Movement Day",z:"三一節",t:"R"},
        {m:5,d:5,n:"Children's Day",z:"兒童節",t:"R"},
        {m:5,d:24,n:"Buddha's Birthday",z:"佛誕",t:"R"},
        {m:6,d:6,n:"Memorial Day",z:"顯忠日",t:"R"},
        {m:8,d:15,n:"Liberation Day",z:"光復節",t:"R"},
        {m:9,d:24,n:"Chuseok Eve",z:"中秋前夕",t:"R"},
        {m:9,d:25,n:"Chuseok",z:"中秋節",t:"R"},
        {m:9,d:26,n:"Chuseok Day 2",z:"中秋翌日",t:"R"},
        {m:10,d:3,n:"National Foundation Day",z:"開天節",t:"R"},
        {m:10,d:9,n:"Hangul Day",z:"韓文日",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"}
      ],
      ph: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:2,d:17,n:"Chinese New Year",z:"農曆新年",t:"S"},
        {m:3,d:20,n:"Eid al-Fitr (est)",z:"開齋節（預估）",t:"R"},
        {m:4,d:2,n:"Maundy Thursday",z:"聖週四",t:"R"},
        {m:4,d:3,n:"Good Friday",z:"耶穌受難日",t:"R"},
        {m:4,d:4,n:"Black Saturday",z:"黑色星期六",t:"S"},
        {m:4,d:9,n:"Araw ng Kagitingan",z:"英勇日",t:"R"},
        {m:5,d:1,n:"Labor Day",z:"勞動節",t:"R"},
        {m:5,d:27,n:"Eid al-Adha (est)",z:"宰牲節（預估）",t:"R"},
        {m:6,d:12,n:"Independence Day",z:"獨立日",t:"R"},
        {m:8,d:21,n:"Ninoy Aquino Day",z:"乃乃基諾日",t:"S"},
        {m:8,d:31,n:"National Heroes Day",z:"國家英雄日",t:"R"},
        {m:11,d:1,n:"All Saints' Day",z:"萬聖節",t:"S"},
        {m:11,d:2,n:"All Souls' Day",z:"追思節（2026新增）",t:"S"},
        {m:11,d:30,n:"Bonifacio Day",z:"博尼法西奧日",t:"R"},
        {m:12,d:8,n:"Immaculate Conception",z:"聖母無原罪",t:"S"},
        {m:12,d:24,n:"Christmas Eve",z:"平安夜",t:"S"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"},
        {m:12,d:30,n:"Rizal Day",z:"黎刹日",t:"R"},
        {m:12,d:31,n:"Last Day of the Year",z:"除夕",t:"S"}
      ],
      my: [
        {m:1,d:1,n:"New Year's Day",z:"元旦",t:"R"},
        {m:1,d:14,n:"Thaipusam",z:"大寶森節",t:"R"},
        {m:2,d:17,n:"Nuzul Al-Quran",z:"可蘭經降世日",t:"R"},
        {m:3,d:21,n:"Hari Raya Aidilfitri 1",z:"開齋節第1天",t:"R"},
        {m:3,d:22,n:"Hari Raya Aidilfitri 2",z:"開齋節第2天",t:"R"},
        {m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},
        {m:5,d:27,n:"Hari Raya Haji 1",z:"哈芝節第1天",t:"R"},
        {m:5,d:28,n:"Hari Raya Haji 2",z:"哈芝節第2天",t:"R"},
        {m:6,d:1,n:"Yang di-Pertuan Agong Birthday",z:"最高元首誕辰",t:"R"},
        {m:8,d:25,n:"Mawlid (Prophet Birthday)",z:"聖紀節",t:"R"},
        {m:9,d:16,n:"Malaysia Day",z:"馬來西亞日",t:"R"},
        {m:11,d:8,n:"Deepavali",z:"屠妖節",t:"R"},
        {m:12,d:25,n:"Christmas Day",z:"聖誕節",t:"R"}
      ]
    },
    2027: {
      us:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:18,n:"MLK Day",z:"馬丁路德金日",t:"R"},{m:2,d:15,n:"Presidents' Day",z:"總統日",t:"R"},{m:5,d:31,n:"Memorial Day",z:"陣亡將士紀念日",t:"R"},{m:6,d:18,n:"Juneteenth (obs)",z:"六月節（補假）",t:"R"},{m:7,d:5,n:"Independence Day (obs)",z:"獨立日（補假）",t:"R"},{m:9,d:6,n:"Labor Day",z:"勞動節",t:"R"},{m:10,d:11,n:"Columbus Day",z:"哥倫布日",t:"R"},{m:11,d:11,n:"Veterans Day",z:"退伍軍人節",t:"R"},{m:11,d:25,n:"Thanksgiving",z:"感恩節",t:"R"},{m:12,d:24,n:"Christmas (obs)",z:"聖誕節（補假）",t:"R"}],
      gb:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:3,d:26,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:3,d:29,n:"Easter Monday",z:"復活節",t:"R"},{m:5,d:3,n:"Early May",z:"五月初銀行假",t:"R"},{m:5,d:31,n:"Spring Bank",z:"春季銀行假",t:"R"},{m:8,d:30,n:"Summer Bank",z:"夏季銀行假",t:"R"},{m:12,d:27,n:"Christmas (obs)",z:"聖誕節（補假）",t:"R"},{m:12,d:28,n:"Boxing Day (obs)",z:"節禮日（補假）",t:"R"}],
      ch:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:2,n:"Berchtoldstag",z:"聖伯托日",t:"R"},{m:3,d:26,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:3,d:29,n:"Easter Monday",z:"復活節",t:"R"},{m:5,d:6,n:"Ascension",z:"耶穌升天",t:"R"},{m:5,d:17,n:"Whit Monday",z:"聖靈降臨",t:"R"},{m:8,d:2,n:"National Day (obs)",z:"國慶（補假）",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"},{m:12,d:26,n:"St. Stephen's",z:"聖史蒂芬日",t:"R"}],
      mt:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:10,n:"St. Paul's",z:"聖保羅船難",t:"R"},{m:3,d:19,n:"St. Joseph",z:"聖若瑟",t:"R"},{m:3,d:26,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:3,d:31,n:"Freedom Day",z:"自由日",t:"R"},{m:5,d:1,n:"Workers' Day",z:"勞動節",t:"R"},{m:6,d:7,n:"Sette Giugno",z:"六七紀念",t:"R"},{m:6,d:29,n:"St. Peter & Paul",z:"聖伯多祿聖保祿",t:"R"},{m:8,d:15,n:"Assumption",z:"聖母升天",t:"R"},{m:9,d:8,n:"Victory Day",z:"勝利日",t:"R"},{m:9,d:21,n:"Independence",z:"獨立日",t:"R"},{m:12,d:8,n:"Immaculate",z:"聖母無原罪",t:"R"},{m:12,d:13,n:"Republic Day",z:"共和日",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"}],
      ae:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:3,d:9,n:"Eid al-Fitr 1",z:"開齋節1",t:"R"},{m:3,d:10,n:"Eid al-Fitr 2",z:"開齋節2",t:"R"},{m:3,d:11,n:"Eid al-Fitr 3",z:"開齋節3",t:"R"},{m:5,d:15,n:"Arafat Day",z:"阿拉法日",t:"R"},{m:5,d:16,n:"Eid al-Adha 1",z:"宰牲節1",t:"R"},{m:5,d:17,n:"Eid al-Adha 2",z:"宰牲節2",t:"R"},{m:5,d:18,n:"Eid al-Adha 3",z:"宰牲節3",t:"R"},{m:6,d:6,n:"Hijri New Year",z:"伊斯蘭新年",t:"R"},{m:8,d:15,n:"Prophet Birthday",z:"聖紀節",t:"R"},{m:11,d:30,n:"Commemoration",z:"紀念日",t:"R"},{m:12,d:2,n:"National Day",z:"國慶日",t:"R"},{m:12,d:3,n:"National Day 2",z:"國慶翌日",t:"R"}],
      sg:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:6,n:"CNY Day 1",z:"農曆新年初一",t:"R"},{m:2,d:8,n:"CNY Day 2 (obs)",z:"農曆新年初二（補假）",t:"R"},{m:3,d:10,n:"Hari Raya Puasa",z:"開齋節",t:"R"},{m:3,d:26,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:5,d:17,n:"Hari Raya Haji",z:"哈芝節",t:"R"},{m:5,d:20,n:"Vesak Day",z:"衛塞節",t:"R"},{m:8,d:9,n:"National Day",z:"國慶日",t:"R"},{m:10,d:28,n:"Deepavali",z:"屠妖節",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕節",t:"R"}],
      hk:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:6,n:"CNY 1",z:"年初一",t:"R"},{m:2,d:8,n:"CNY 2 (obs)",z:"年初二（補假）",t:"R"},{m:2,d:9,n:"CNY 3 (obs)",z:"年初三（補假）",t:"R"},{m:3,d:26,n:"Good Friday",z:"耶穌受難日",t:"R"},{m:3,d:29,n:"Easter Mon",z:"復活節",t:"R"},{m:4,d:5,n:"Ching Ming",z:"清明",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:5,d:13,n:"Buddha Birthday",z:"佛誕",t:"R"},{m:6,d:9,n:"Dragon Boat",z:"端午",t:"R"},{m:7,d:1,n:"HKSAR Day",z:"回歸日",t:"R"},{m:10,d:1,n:"National Day",z:"國慶",t:"R"},{m:10,d:16,n:"Mid-Autumn+1",z:"中秋翌日",t:"R"},{m:10,d:7,n:"Chung Yeung",z:"重陽",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"},{m:12,d:27,n:"Boxing Day (obs)",z:"聖誕翌日（補假）",t:"R"}],
      tw:[{m:1,d:1,n:"Republic Day",z:"元旦",t:"R"},{m:2,d:5,n:"CNY Eve",z:"除夕",t:"R"},{m:2,d:6,n:"CNY 1",z:"春節初一",t:"R"},{m:2,d:7,n:"CNY 2",z:"春節初二",t:"R"},{m:2,d:8,n:"CNY 3",z:"春節初三",t:"R"},{m:2,d:28,n:"228 Peace",z:"228和平紀念",t:"R"},{m:4,d:4,n:"Children/Tomb Sweep",z:"兒童節/清明",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:6,d:9,n:"Dragon Boat",z:"端午",t:"R"},{m:10,d:16,n:"Mid-Autumn",z:"中秋",t:"R"},{m:10,d:10,n:"National Day",z:"國慶",t:"R"}],
      jp:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:2,n:"New Year 2",z:"元旦假期",t:"R"},{m:1,d:3,n:"New Year 3",z:"元旦假期",t:"R"},{m:1,d:11,n:"Coming of Age",z:"成人の日",t:"R"},{m:2,d:11,n:"Foundation Day",z:"建國紀念",t:"R"},{m:2,d:23,n:"Emperor Birthday",z:"天皇誕生日",t:"R"},{m:3,d:21,n:"Vernal Equinox",z:"春分",t:"R"},{m:4,d:29,n:"Showa Day",z:"昭和の日",t:"R"},{m:5,d:3,n:"Constitution Day",z:"憲法紀念",t:"R"},{m:5,d:4,n:"Greenery Day",z:"綠の日",t:"R"},{m:5,d:5,n:"Children's Day",z:"子供の日",t:"R"},{m:7,d:19,n:"Marine Day",z:"海の日",t:"R"},{m:8,d:11,n:"Mountain Day",z:"山の日",t:"R"},{m:9,d:20,n:"Respect Aged",z:"敬老の日",t:"R"},{m:9,d:23,n:"Autumnal Equinox",z:"秋分",t:"R"},{m:10,d:11,n:"Sports Day",z:"體育の日",t:"R"},{m:11,d:3,n:"Culture Day",z:"文化の日",t:"R"},{m:11,d:23,n:"Labour Thanks",z:"勤勞感謝",t:"R"}],
      kr:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:5,n:"Seollal Eve",z:"春節前夕",t:"R"},{m:2,d:6,n:"Seollal",z:"春節",t:"R"},{m:2,d:8,n:"Seollal+1 (obs)",z:"春節翌日（補假）",t:"R"},{m:3,d:1,n:"Independence Mvmt",z:"三一節",t:"R"},{m:5,d:5,n:"Children's Day",z:"兒童節",t:"R"},{m:5,d:13,n:"Buddha Birthday",z:"佛誕",t:"R"},{m:6,d:6,n:"Memorial Day",z:"顯忠日",t:"R"},{m:8,d:15,n:"Liberation",z:"光復節",t:"R"},{m:10,d:14,n:"Chuseok Eve",z:"中秋前夕",t:"R"},{m:10,d:15,n:"Chuseok",z:"中秋",t:"R"},{m:10,d:16,n:"Chuseok+1",z:"中秋翌日",t:"R"},{m:10,d:3,n:"Foundation",z:"開天節",t:"R"},{m:10,d:9,n:"Hangul Day",z:"韓文日",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"}],
      ph:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:2,d:6,n:"Chinese NY",z:"農曆新年",t:"R"},{m:2,d:25,n:"EDSA",z:"EDSA革命",t:"R"},{m:3,d:25,n:"Maundy Thu",z:"聖週四",t:"R"},{m:3,d:26,n:"Good Friday",z:"受難日",t:"R"},{m:3,d:27,n:"Black Saturday",z:"黑色星期六",t:"R"},{m:4,d:9,n:"Araw ng Kagitingan",z:"英勇日",t:"R"},{m:5,d:1,n:"Labor Day",z:"勞動節",t:"R"},{m:3,d:10,n:"Eid al-Fitr",z:"開齋節",t:"R"},{m:5,d:16,n:"Eid al-Adha",z:"宰牲節",t:"R"},{m:6,d:12,n:"Independence",z:"獨立日",t:"R"},{m:8,d:21,n:"Ninoy Aquino",z:"乃乃基諾",t:"R"},{m:8,d:30,n:"Heroes Day",z:"英雄日",t:"R"},{m:11,d:30,n:"Bonifacio",z:"博尼法西奧",t:"R"},{m:12,d:8,n:"Immaculate",z:"聖母無原罪",t:"R"},{m:12,d:24,n:"Christmas Eve",z:"平安夜",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"},{m:12,d:30,n:"Rizal Day",z:"黎刹日",t:"R"}],
      my:[{m:1,d:1,n:"New Year",z:"元旦",t:"R"},{m:1,d:14,n:"Thaipusam",z:"大寶森節",t:"R"},{m:3,d:6,n:"Nuzul Al-Quran",z:"可蘭經降世",t:"R"},{m:5,d:1,n:"Labour Day",z:"勞動節",t:"R"},{m:3,d:10,n:"Hari Raya 1",z:"開齋節1",t:"R"},{m:3,d:11,n:"Hari Raya 2",z:"開齋節2",t:"R"},{m:6,d:7,n:"Agong Birthday",z:"元首誕辰",t:"R"},{m:5,d:17,n:"Haji 1",z:"哈芝節1",t:"R"},{m:5,d:18,n:"Haji 2",z:"哈芝節2",t:"R"},{m:9,d:16,n:"Malaysia Day",z:"馬來西亞日",t:"R"},{m:8,d:15,n:"Mawlid",z:"聖紀節",t:"R"},{m:10,d:28,n:"Deepavali",z:"屠妖節",t:"R"},{m:12,d:25,n:"Christmas",z:"聖誕",t:"R"}],
    },
  };

  const WEEKENDS = {
    ae:[0,6],us:[0,6],gb:[0,6],ch:[0,6],mt:[0,6],sg:[0,6],hk:[0,6],tw:[0,6],jp:[0,6],kr:[0,6],ph:[0,6],my:[0,6],
  };


  const Calendar=()=>{
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(2026);
    const [compCountry, setCompCountry] = useState("us"); // for year-comparison mode
    const sel = selC.map(id=>COUNTRIES.find(c=>c.id===id)).filter(Boolean);
    const ranked = [...COUNTRIES].sort((a,b)=>b.labor.ph-a.labor.ph);
    const availYears = [2025, 2026, 2027];
    const holDB = HOLIDAYS_DB[calYear] || {};

    const months = [
      {e:"January",z:"一月"},{e:"February",z:"二月"},{e:"March",z:"三月"},
      {e:"April",z:"四月"},{e:"May",z:"五月"},{e:"June",z:"六月"},
      {e:"July",z:"七月"},{e:"August",z:"八月"},{e:"September",z:"九月"},
      {e:"October",z:"十月"},{e:"November",z:"十一月"},{e:"December",z:"十二月"}
    ];
    const dayLabels = lang==="zh" ? ["一","二","三","四","五","六","日"] : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const rawDow = new Date(calYear, calMonth, 1).getDay();
    const firstDow = rawDow === 0 ? 6 : rawDow - 1;
    const days = [];
    for(let i=0; i<firstDow; i++) days.push(null);
    for(let d=1; d<=daysInMonth; d++) days.push(d);

    // Holiday helpers - use dynamic year
    const getHolidays = (cid, m, yr) => ((HOLIDAYS_DB[yr||calYear]||{})[cid]||[]).filter(h => h.m === m+1);
    const isHoliday = (cid, day) => (holDB[cid]||[]).some(h => h.m === calMonth+1 && h.d === day);
    const getHolidayName = (cid, day) => {
      const h = (holDB[cid]||[]).find(h => h.m === calMonth+1 && h.d === day);
      return h ? (lang==="zh" ? h.z : h.n) : null;
    };
    const getHolidayType = (cid, day) => {
      const h = (holDB[cid]||[]).find(h => h.m === calMonth+1 && h.d === day);
      return h ? (h.t || "R") : null;
    };
    const isWeekend = (cid, day) => {
      const dow = new Date(calYear, calMonth, day).getDay();
      return (WEEKENDS[cid]||[0,6]).includes(dow);
    };
    const getWorkDays = (cid, yr) => {
      const y = yr || calYear;
      const dim = new Date(y, calMonth + 1, 0).getDate();
      const hdb = (HOLIDAYS_DB[y]||{})[cid]||[];
      let count = 0;
      for(let d=1; d<=dim; d++){
        const dow = new Date(y, calMonth, d).getDay();
        const wknd = (WEEKENDS[cid]||[0,6]).includes(dow);
        const hol = hdb.some(h => h.m === calMonth+1 && h.d === d);
        if(!wknd && !hol) count++;
      }
      return count;
    };
    const getAnnualHolidays = (cid, yr) => ((HOLIDAYS_DB[yr]||{})[cid]||[]).length;
    const getAnnualWorkDays = (cid, yr) => {
      const hdb = (HOLIDAYS_DB[yr]||{})[cid]||[];
      let count = 0;
      for(let m=0;m<12;m++){
        const dim = new Date(yr, m+1, 0).getDate();
        for(let d=1;d<=dim;d++){
          const dow = new Date(yr,m,d).getDay();
          const wknd = (WEEKENDS[cid]||[0,6]).includes(dow);
          const hol = hdb.some(h => h.m===m+1 && h.d===d);
          if(!wknd && !hol) count++;
        }
      }
      return count;
    };

    return(
      <div>
        <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginBottom:6}}>{t("Attendance & Holiday Calendar","考勤與假日行事曆")}</div>
        <div style={{fontSize:14,color:D.tx3,marginBottom:20}}>{t("Cross-border working day analysis with public holiday overlay","跨境工作日分析與國定假日疊加對比")}</div>

        {/* Country selector */}
        <WorldMap selected={selC} onSelect={togC} t={t}/>

        {/* Year + Month selector */}
        <Card glow style={{marginBottom:14}}>
          <div style={{padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Tag>{t("YEAR","年份")}</Tag>
                <div style={{display:"flex",gap:3}}>
                  {availYears.map(yr=>{
                    const label = yr < 2026 ? t("Past","歷史") : yr === 2026 ? t("Confirmed","已確認") : t("Estimated","預估");
                    const labelColor = yr < 2026 ? D.tx4 : yr === 2026 ? D.sage : D.copper;
                    return (<button key={yr} onClick={()=>setCalYear(yr)} style={{
                    background:calYear===yr?D.ink:"transparent",
                    border:"1px solid "+(calYear===yr?D.ink:D.ln),
                    color:calYear===yr?"#fff":D.tx3,padding:"5px 16px",borderRadius:5,cursor:"pointer",
                    fontSize:15,fontWeight:calYear===yr?700:400,fontFamily:"'DM Mono',monospace",
                    position:"relative",
                  }}><div>{yr}</div><div style={{fontSize:9,marginTop:2,color:calYear===yr?"rgba(255,255,255,0.7)":labelColor}}>{label}</div></button>);
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setCalMonth(p=>Math.max(0,p-1))} style={{background:"none",border:"1px solid "+D.ln,color:D.tx3,padding:"3px 10px",borderRadius:4,cursor:"pointer",fontSize:14}}>←</button>
                <button onClick={()=>setCalMonth(p=>Math.min(11,p+1))} style={{background:"none",border:"1px solid "+D.ln,color:D.tx3,padding:"3px 10px",borderRadius:4,cursor:"pointer",fontSize:14}}>→</button>
              </div>
            </div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
              {months.map((m,i)=>(<button key={i} onClick={()=>setCalMonth(i)} style={{
                background:calMonth===i?D.slate+"12":"transparent",
                border:"1px solid "+(calMonth===i?D.slate+"30":"transparent"),
                color:calMonth===i?D.slate:D.tx4,padding:"5px 12px",borderRadius:5,cursor:"pointer",
                fontSize:13,fontWeight:calMonth===i?600:400,fontFamily:"'DM Mono','Noto Sans TC',monospace",
              }}>{t(m.e,m.z)}</button>))}
            </div>
            {calYear===2027 && <div style={{marginTop:8,padding:"8px 12px",background:D.copper+"08",borderRadius:5,fontSize:12,color:D.copper}}>
              ⚠️ {t("2027 dates are astronomical estimates. Islamic holidays depend on moon sighting; lunar calendar holidays and make-up days await government announcements.","2027年日期為天文預估。伊斯蘭節日依月亮觀測確認；農曆節日補假規則待各國政府公告。")}
            </div>}
          </div>
        </Card>

        {/* Monthly Stats Summary */}
        {calView!=="yearcomp" && sel.length > 0 && (
          <Card glow style={{marginBottom:14}}>
            <div style={{padding:"14px 16px"}}>
              <Tag color={D.sage}>{t("MONTHLY SUMMARY","月度摘要")} · {t(months[calMonth].e,months[calMonth].z)} {calYear}</Tag>
              <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(sel.length,6)+", 1fr)",gap:10,marginTop:10}}>
                {sel.map(c => {
                  const hols = getHolidays(c.id, calMonth);
                  const workDays = getWorkDays(c.id);
                  return (
                    <div key={c.id} style={{background:D.lnF,borderRadius:6,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                        <span style={{fontSize:16}}>{c.flag}</span>
                        <span style={{fontSize:13,fontWeight:500,color:D.tx}}>{t(c.n,c.zh)}</span>
                      </div>
                      <div style={{display:"flex",gap:12}}>
                        <div><div style={{fontSize:11,color:D.tx4}}>{t("Work Days","工作日")}</div><div style={{fontSize:22,fontWeight:500,fontFamily:"'DM Mono',monospace",color:D.sage}}>{workDays}</div></div>
                        <div><div style={{fontSize:11,color:D.tx4}}>{t("Holidays","假日")}</div><div style={{fontSize:22,fontWeight:500,fontFamily:"'DM Mono',monospace",color:D.copper}}>{hols.length}</div></div>
                        <div><div style={{fontSize:11,color:D.tx4}}>{t("Total Days","總天數")}</div><div style={{fontSize:22,fontWeight:500,fontFamily:"'DM Mono',monospace",color:D.tx3}}>{daysInMonth}</div></div>
                      </div>
                      {hols.length>0 && <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}>
                        {hols.map((h,i)=>(<span key={i} style={{fontSize:11,padding:"2px 7px",background:D.copper+"0c",color:D.copper,borderRadius:3}}>{h.d}{t("th","日")} {lang==="zh"?h.z:h.n}</span>))}
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* View Toggle */}
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {[{id:"sheet",e:"Attendance Sheet",z:"考勤總表"},{id:"calendar",e:"Calendar",z:"月曆"},{id:"yearcomp",e:"Year Compare",z:"跨年對比"}].map(v=>(
            <button key={v.id} onClick={()=>setCalView(v.id)} style={{
              background:calView===v.id?D.slate+"12":"transparent",
              border:"1px solid "+(calView===v.id?D.slate+"30":"transparent"),
              color:calView===v.id?D.slate:D.tx4,padding:"7px 18px",borderRadius:6,cursor:"pointer",
              fontSize:14,fontWeight:calView===v.id?600:400,fontFamily:"'DM Mono','Noto Sans TC',monospace",
            }}>{t(v.e,v.z)}</button>
          ))}
        </div>


        {/* ═══ GRID VIEW (existing) ═══ */}
        {calView==="calendar" && (
        <Card glow>
          <div style={{padding:"14px 16px 0"}}>
            {/* Header row with day labels */}
            <div style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:0,marginBottom:2}}>
              <div style={{fontSize:12,color:D.tx4,fontWeight:500,padding:"6px 0"}}>{t("Country","國家")}</div>
              {dayLabels.map((dl,i)=>(<div key={i} style={{textAlign:"center",fontSize:12,color:[5,6].includes(i)?D.wine:D.tx4,fontWeight:500,fontFamily:"'DM Mono',monospace",padding:"6px 0"}}>{dl}</div>))}
            </div>

            {/* Each country as a row */}
            {sel.map((c,ci) => {
              const hols = getHolidays(c.id, calMonth);
              return (
                <div key={c.id} style={{borderTop:"1px solid "+D.ln,paddingTop:10,paddingBottom:10,marginBottom:ci<sel.length-1?0:10}}>
                  {/* Country label + stats */}
                  <div style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:0,marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:16}}>{c.flag}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:D.tx}}>{t(c.n,c.zh)}</div>
                        <div style={{fontSize:11,color:D.sage,fontFamily:"'DM Mono',monospace"}}>{getWorkDays(c.id)}{t(" work days"," 工作日")}</div>
                      </div>
                    </div>
                    {hols.length > 0 && <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                      {hols.map((h,i)=>(<span key={i} style={{fontSize:11,padding:"2px 8px",background:D.copper+"0c",color:D.copper,borderRadius:3}}>{h.d}{t("th","日")} {lang==="zh"?h.z:h.n}</span>))}
                    </div>}
                  </div>

                  {/* Calendar grid */}
                  <div style={{display:"grid",gridTemplateColumns:"140px repeat(7,1fr)",gap:0}}>
                    <div/>
                    {/* Pad first week */}
                    {days.map((day,i) => {
                      if(i < 7) {
                        // First row only
                      }
                      return null;
                    })}
                  </div>
                  <div style={{marginLeft:140}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                      {days.map((day,i) => {
                        if(day===null) return <div key={"e"+i}/>;
                        const hol = isHoliday(c.id, day);
                        const wknd = isWeekend(c.id, day);
                        const holName = getHolidayName(c.id, day);
                        return (
                          <div key={i} title={holName||""} style={{
                            textAlign:"center",padding:"5px 2px",borderRadius:4,
                            background: hol ? "#fceedd" : wknd ? "#e6e4e0" : "transparent",
                            border: hol ? "1px solid #e8a84040" : "1px solid transparent",
                            cursor: holName ? "help" : "default",
                          }}>
                            <div style={{fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:hol?700:400,color:hol?"#b06800":wknd?D.tx3:D.tx2}}>{day}</div>
                            {hol && <div style={{width:5,height:5,borderRadius:"50%",background:D.copper,margin:"2px auto 0",opacity:0.7}}/>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        )}

        {/* ═══ MATRIX VIEW ═══ */}
        {calView==="sheet" && sel.length > 0 && (
        <Card glow>
          <div style={{overflow:"auto",maxHeight:"70vh"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{position:"sticky",top:0,zIndex:6,background:D.surface,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                  <th style={{position:"sticky",left:0,zIndex:7,background:D.surface,padding:"12px 12px",textAlign:"left",borderBottom:"2px solid "+D.ln,fontSize:13,color:D.tx4,fontFamily:"'DM Mono',monospace",width:70}}>{t("Date","日期")}</th>
                  <th style={{position:"sticky",left:70,zIndex:7,background:D.surface,padding:"12px 6px",textAlign:"center",borderBottom:"2px solid "+D.ln,fontSize:13,color:D.tx4,fontFamily:"'DM Mono',monospace",width:40}}>{t("Day","週")}</th>
                  {sel.map(c=>(<th key={c.id} style={{padding:"10px 8px",textAlign:"center",borderBottom:"2px solid "+D.ln,minWidth:150,background:D.surface}}><span style={{fontSize:18}}>{c.flag}</span><div style={{fontSize:14,fontWeight:600,color:D.tx,marginTop:2}}>{t(c.n,c.zh)}</div></th>))}
                </tr>
              </thead>
              <tbody>
                {Array.from({length:daysInMonth},(_,di)=>{
                  const day = di+1;
                  const date = new Date(calYear, calMonth, day);
                  const dow = date.getDay();
                  const monIdx = dow === 0 ? 6 : dow - 1; // Convert to Mon=0
                  const dowLabel = dayLabels[monIdx];
                  const isSun = dow === 0;
                  const isSat = dow === 6;
                  const isFri = dow === 5;
                  const anyHoliday = sel.some(c => isHoliday(c.id, day));
                  const allWeekend = sel.every(c => isWeekend(c.id, day));
                  const weekStart = dow === 1; // Monday = new week

                  return (
                    <tr key={day} style={{
                      borderTop: weekStart && day>1 ? "3px solid "+D.slate+"20" : "1px solid "+D.lnF,
                    }}>
                      <td style={{
                        position:"sticky",left:0,zIndex:2,
                        padding:"7px 12px",
                        background: anyHoliday ? "#fceedd" : allWeekend ? "#e6e4e0" : D.surface,
                        fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:600,
                        color: anyHoliday ? "#b06800" : isSun||isSat ? D.tx3 : D.tx,
                        borderRight:"1px solid "+D.lnF,
                      }}>
                        {(calMonth+1)+"/"+day}
                      </td>
                      <td style={{
                        position:"sticky",left:70,zIndex:2,
                        padding:"7px 6px",textAlign:"center",
                        background: anyHoliday ? "#fceedd" : allWeekend ? "#e6e4e0" : D.surface,
                        fontSize:13,fontWeight:500,
                        color: isSun||isSat ? D.tx3 : D.tx4,
                        fontFamily:"'DM Mono',monospace",
                        borderRight:"1px solid "+D.ln,
                      }}>
                        {dowLabel}
                      </td>
                      {sel.map(c => {
                        const hol = isHoliday(c.id, day);
                        const wknd = isWeekend(c.id, day);
                        const holName = getHolidayName(c.id, day);
                        const holType = getHolidayType(c.id, day);
                        const typeLabel = holType==="S" ? {en:"Special",zh:"特別假",color:"#8a65a0"} : holType==="O" ? {en:"Observed",zh:"補假",color:"#5a8a6a"} : holType==="B" ? {en:"Bank Hol",zh:"銀行假",color:D.slate} : {en:"Regular",zh:"法定假",color:"#b06800"};
                        return (
                          <td key={c.id} style={{
                            padding:"6px 8px",textAlign:"left",
                            background: hol ? (holType==="S"?"#8a65a010":"#fceedd") : wknd ? "#e6e4e0" : "transparent",
                            borderLeft: "1px solid " + (hol ? (holType==="S"?"#8a65a020":"#e8a84020") : D.lnF),
                          }}>
                            {hol ? (
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                                  <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:typeLabel.color+"18",color:typeLabel.color,fontWeight:600,fontFamily:"'DM Mono',monospace",letterSpacing:0.5}}>{lang==="zh"?typeLabel.zh:typeLabel.en}</span>
                                </div>
                                <div style={{fontSize:12,fontWeight:500,color:typeLabel.color}}>{holName}</div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr style={{borderTop:"3px solid "+D.ln,background:D.slate+"06"}}>
                  <td colSpan={2} style={{position:"sticky",left:0,zIndex:2,padding:"12px 12px",fontSize:14,fontWeight:700,color:D.tx,background:D.slate+"0a",borderRight:"1px solid "+D.ln}}>
                    {t("WORK DAYS","工作日合計")}
                  </td>
                  {sel.map(c=>(<td key={c.id} style={{padding:"12px 8px",textAlign:"center",fontSize:24,fontWeight:600,fontFamily:"'DM Mono',monospace",color:D.sage,borderLeft:"1px solid "+D.lnF,background:D.sage+"08"}}>{getWorkDays(c.id)}</td>))}
                </tr>
                <tr style={{borderTop:"1px solid "+D.lnF}}>
                  <td colSpan={2} style={{position:"sticky",left:0,zIndex:2,padding:"10px 12px",fontSize:13,fontWeight:600,color:D.tx3,background:D.surface,borderRight:"1px solid "+D.ln}}>
                    {t("HOLIDAYS","假日合計")}
                  </td>
                  {sel.map(c=>(<td key={c.id} style={{padding:"10px 8px",textAlign:"center",fontSize:20,fontWeight:600,fontFamily:"'DM Mono',monospace",color:D.copper,borderLeft:"1px solid "+D.lnF}}>{getHolidays(c.id,calMonth).length}</td>))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        )}


        {/* ═══ YEAR COMPARISON VIEW ═══ */}
        {calView==="yearcomp" && (
          <div>
            {/* Country selector for comparison */}
            <Card glow style={{marginBottom:14}}>
              <div style={{padding:"12px 16px"}}>
                <Tag>{t("SELECT COUNTRY TO COMPARE ACROSS YEARS","選擇國家進行跨年比較")}</Tag>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
                  {COUNTRIES.map(c=>(<button key={c.id} onClick={()=>setCompCountry(c.id)} style={{
                    background:compCountry===c.id?D.slate+"12":"transparent",
                    border:"1px solid "+(compCountry===c.id?D.slate+"30":"transparent"),
                    color:compCountry===c.id?D.slate:D.tx4,padding:"5px 12px",borderRadius:5,cursor:"pointer",
                    fontSize:13,fontWeight:compCountry===c.id?600:400,
                  }}>{c.flag} {t(c.n,c.zh)}</button>))}
                </div>
              </div>
            </Card>

            {/* Annual summary cards */}
            <Card glow style={{marginBottom:14}}>
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <span style={{fontSize:22}}>{COUNTRIES.find(c=>c.id===compCountry)?.flag}</span>
                  <div style={{fontSize:18,fontWeight:600,color:D.tx}}>{t(COUNTRIES.find(c=>c.id===compCountry)?.n||"",COUNTRIES.find(c=>c.id===compCountry)?.zh||"")}</div>
                  <Tag color={D.tx4}>{t("ANNUAL OVERVIEW","年度總覽")}</Tag>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {availYears.map(yr => (
                    <div key={yr} style={{background:yr===calYear?D.slate+"08":D.lnF,borderRadius:8,padding:"14px 16px",border:yr===calYear?"2px solid "+D.slate+"30":"2px solid transparent"}}>
                      <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Mono',monospace",color:D.tx,marginBottom:8}}>{yr}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div><div style={{fontSize:11,color:D.tx4}}>{t("Holidays","假日")}</div><div style={{fontSize:24,fontWeight:600,fontFamily:"'DM Mono',monospace",color:D.copper}}>{getAnnualHolidays(compCountry,yr)}</div></div>
                        <div><div style={{fontSize:11,color:D.tx4}}>{t("Work Days","工作日")}</div><div style={{fontSize:24,fontWeight:600,fontFamily:"'DM Mono',monospace",color:D.sage}}>{getAnnualWorkDays(compCountry,yr)}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Month-by-month comparison table */}
            <Card glow style={{marginBottom:14}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      <th style={{position:"sticky",left:0,zIndex:3,background:D.surface,padding:"12px 14px",textAlign:"left",borderBottom:"2px solid "+D.ln,fontSize:13,color:D.tx4,fontFamily:"'DM Mono',monospace"}}>{t("Month","月份")}</th>
                      {availYears.map(yr=>(
                        <th key={yr} colSpan={2} style={{padding:"12px 8px",textAlign:"center",borderBottom:"2px solid "+D.ln,fontSize:16,fontWeight:700,fontFamily:"'DM Mono',monospace",color:yr===calYear?D.slate:D.tx3,borderLeft:"2px solid "+D.ln}}>
                          {yr}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th style={{position:"sticky",left:0,zIndex:3,background:D.surface,padding:"6px 14px",borderBottom:"1px solid "+D.ln}}/>
                      {availYears.map(yr=>[
                        <th key={yr+"h"} style={{padding:"6px 8px",textAlign:"center",borderBottom:"1px solid "+D.ln,fontSize:11,color:D.copper,borderLeft:"2px solid "+D.ln}}>{t("Holidays","假日")}</th>,
                        <th key={yr+"w"} style={{padding:"6px 8px",textAlign:"center",borderBottom:"1px solid "+D.ln,fontSize:11,color:D.sage}}>{t("Work Days","工作日")}</th>,
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((m,mi)=>(
                      <tr key={mi} style={{borderTop:"1px solid "+D.lnF,background:mi===calMonth?D.slate+"06":"transparent"}}>
                        <td style={{position:"sticky",left:0,zIndex:2,padding:"10px 14px",background:mi===calMonth?D.slate+"0a":D.surface,fontWeight:600,fontSize:14,color:mi===calMonth?D.slate:D.tx,borderRight:"1px solid "+D.lnF}}>
                          {t(m.e,m.z)}
                        </td>
                        {availYears.map(yr=>{
                          const hols = getHolidays(compCountry, mi, yr);
                          const dim = new Date(yr,mi+1,0).getDate();
                          const hdb = (HOLIDAYS_DB[yr]||{})[compCountry]||[];
                          let wd = 0;
                          for(let d=1;d<=dim;d++){
                            const dow=new Date(yr,mi,d).getDay();
                            const wk=(WEEKENDS[compCountry]||[0,6]).includes(dow);
                            const hl=hdb.some(h=>h.m===mi+1&&h.d===d);
                            if(!wk&&!hl) wd++;
                          }
                          return [
                            <td key={yr+"h"} style={{padding:"10px 8px",textAlign:"center",borderLeft:"2px solid "+D.ln,fontSize:hols.length>0?16:14,fontWeight:hols.length>0?700:400,fontFamily:"'DM Mono',monospace",color:hols.length>0?D.copper:D.tx5}}>
                              {hols.length||"—"}
                            </td>,
                            <td key={yr+"w"} style={{padding:"10px 8px",textAlign:"center",fontSize:14,fontFamily:"'DM Mono',monospace",color:D.sage}}>
                              {wd}
                            </td>,
                          ];
                        })}
                      </tr>
                    ))}
                    <tr style={{borderTop:"3px solid "+D.ln,background:D.slate+"06"}}>
                      <td style={{position:"sticky",left:0,zIndex:2,padding:"12px 14px",fontWeight:700,fontSize:14,color:D.tx,background:D.slate+"0a",borderRight:"1px solid "+D.ln}}>
                        {t("ANNUAL TOTAL","年度合計")}
                      </td>
                      {availYears.map(yr=>[
                        <td key={yr+"th"} style={{padding:"12px 8px",textAlign:"center",borderLeft:"2px solid "+D.ln,fontSize:20,fontWeight:700,fontFamily:"'DM Mono',monospace",color:D.copper}}>{getAnnualHolidays(compCountry,yr)}</td>,
                        <td key={yr+"tw"} style={{padding:"12px 8px",textAlign:"center",fontSize:20,fontWeight:700,fontFamily:"'DM Mono',monospace",color:D.sage}}>{getAnnualWorkDays(compCountry,yr)}</td>,
                      ])}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Holiday detail comparison per month */}
            <Card glow style={{marginBottom:14}}>
              <div style={{padding:"14px 16px"}}>
                <Tag color={D.copper}>{t("HOLIDAY DETAIL","假日明細")} · {t(months[calMonth].e,months[calMonth].z)}</Tag>
                <div style={{display:"grid",gridTemplateColumns:"repeat("+availYears.length+",1fr)",gap:12,marginTop:10}}>
                  {availYears.map((yr,yi) => {
                    const mHols = getHolidays(compCountry, calMonth, yr);
                    return (
                      <div key={yr} style={{background:yr===calYear?D.copper+"08":D.lnF,borderRadius:6,padding:"10px 12px",border:yr===calYear?"1px solid "+D.copper+"25":"1px solid transparent"}}>
                        <div style={{fontSize:16,fontWeight:700,fontFamily:"'DM Mono',monospace",color:D.tx,marginBottom:8}}>{yr} · {t(months[calMonth].e,months[calMonth].z)}</div>
                        {mHols.length===0 ? (
                          <div style={{fontSize:13,color:D.tx4,padding:"8px 0"}}>{t("No holidays","無假日")}</div>
                        ) : mHols.sort((a,b)=>a.d-b.d).map((h,i)=>{
                          const typeColor = h.t==="S"?"#8a65a0":h.t==="O"?"#5a8a6a":h.t==="B"?D.slate:"#b06800";
                          const typeLabel = h.t==="S"?(lang==="zh"?"特別假":"Special"):h.t==="O"?(lang==="zh"?"補假":"Obs"):h.t==="B"?(lang==="zh"?"銀行假":"Bank"):(lang==="zh"?"法定":"Reg");
                          return (
                            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:i<mHols.length-1?"1px solid "+D.lnF:"none"}}>
                              <span style={{fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:600,color:typeColor,width:28}}>{h.d}{t("th","日")}</span>
                              <span style={{fontSize:9,padding:"1px 4px",borderRadius:2,background:typeColor+"15",color:typeColor,fontWeight:600}}>{typeLabel}</span>
                              <span style={{fontSize:13,color:D.tx2}}>{lang==="zh"?h.z:h.n}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Cross-border overlap analysis */}
        {calView!=="yearcomp" && sel.length >= 2 && (
          <Card glow style={{marginTop:14}}>
            <div style={{padding:"14px 16px"}}>
              <Tag color={D.slate}>{t("CROSS-BORDER HOLIDAY OVERLAP","跨境假日重疊分析")} · {t(months[calMonth].e,months[calMonth].z)}</Tag>
              <div style={{marginTop:10}}>
                {(() => {
                  const allDays = {};
                  sel.forEach(c => {
                    getHolidays(c.id, calMonth).forEach(h => {
                      const key = h.d;
                      if(!allDays[key]) allDays[key] = [];
                      allDays[key].push({cid:c.id, flag:c.flag, name:lang==="zh"?h.z:h.n});
                    });
                  });
                  const sorted = Object.entries(allDays).sort((a,b)=>Number(a[0])-Number(b[0]));
                  if(sorted.length===0) return <div style={{fontSize:13,color:D.tx4,padding:"10px 0"}}>{t("No public holidays this month for selected countries","所選國家本月無國定假日")}</div>;
                  return sorted.map(([day, countries]) => (
                    <div key={day} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid "+D.lnF}}>
                      <span style={{fontSize:16,fontFamily:"'DM Mono',monospace",fontWeight:600,color:countries.length>=2?D.sage:D.tx3,width:50}}>{t(months[calMonth].e.substring(0,3),months[calMonth].z)} {day}</span>
                      <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
                        {countries.map((c,i)=>(<span key={i} style={{fontSize:12,padding:"3px 8px",borderRadius:4,background:countries.length>=2?D.sage+"0c":D.slate+"08",color:countries.length>=2?D.sage:D.tx2}}>{c.flag} {c.name}</span>))}
                      </div>
                      {countries.length>=2 && <span style={{fontSize:11,color:D.sage,fontWeight:600,fontFamily:"'DM Mono',monospace"}}>{countries.length}{t(" countries off"," 國放假")}</span>}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </Card>
        )}

        {/* Global Ranking */}
        {calView!=="yearcomp" && (
        <Card glow style={{marginTop:14}}>
          <div style={{padding:"14px 16px"}}>
            <Tag>{t("ANNUAL HOLIDAY RANKING","年度假日天數排名")}</Tag>
            <div style={{marginTop:10}}>{ranked.map((c,i)=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 2px",borderBottom:i<ranked.length-1?"1px solid "+D.lnF:"none",background:selC.includes(c.id)?D.copper+"06":"transparent",borderRadius:4}}>
              <span style={{fontSize:13,color:i<3?D.copper:D.tx5,fontFamily:"'DM Mono',monospace",width:22,textAlign:"right",fontWeight:500}}>{i+1}</span>
              <span style={{fontSize:18}}>{c.flag}</span>
              <span style={{fontSize:14,color:D.tx,fontWeight:500,flex:1}}>{t(c.n,c.zh)}</span>
              <span style={{fontSize:18,fontFamily:"'DM Mono',monospace",fontWeight:500,color:D.copper}}>{c.labor.ph}</span>
              <div style={{width:50}}><HBar value={c.labor.ph} max={20} color={selC.includes(c.id)?D.copper:D.tx5}/></div>
            </div>))}</div>
          </div>
        </Card>
        )}

        {/* Disclaimer */}
        <div style={{marginTop:14,padding:"10px 14px",borderRadius:6,background:D.lnF,fontSize:12,color:D.tx4,lineHeight:1.7}}>
          {t("⚠️ 2025 & 2026: Based on official government gazette. 2027: Estimated — fixed-date holidays are confirmed; lunar calendar holidays (CNY, Chuseok, Dragon Boat, Mid-Autumn) are astronomically calculated; Islamic holidays (Eid al-Fitr, Eid al-Adha, Hijri New Year, Mawlid) are estimates subject to moon sighting and may shift ±1-2 days. Substitute holiday (補假) arrangements for 2027 are not yet announced.",
             "⚠️ 2025、2026：依據各國政府公報。2027：預估日期——固定日期節日已確認；農曆節日（春節、端午、中秋）依天文推算；伊斯蘭節日（開齋節、宰牲節、伊斯蘭新年、聖紀節）為預估，須依月亮觀測確認，可能偏差1-2天。2027年各國補假安排尚未公告。")}
        </div>
      </div>
    );
  };


  // ═══════ REGULATION (REBUILT) ═══════
  const REG_TIMELINE = [
    // 🟢 N=New  🟡 A=Amended  🔴 V=Revoked  ⚪ P=Proposed
    {cid:"hk",date:"2026-02",type:"A",en:"VATP Licensing: 6 platforms approved",zh:"VATP牌照：6家平台獲批",impact:"high"},
    {cid:"kr",date:"2026-01",type:"A",en:"Crypto CGT deferred to 2027",zh:"加密資產資本利得稅延至2027年",impact:"high"},
    {cid:"us",date:"2026-01",type:"P",en:"FIT21 Stablecoin Act advancing in Congress",zh:"FIT21穩定幣法案在國會推進中",impact:"med"},
    {cid:"gb",date:"2026-01",type:"P",en:"FCA comprehensive crypto regime draft",zh:"FCA綜合加密貨幣監管框架草案",impact:"med"},
    {cid:"jp",date:"2025-12",type:"A",en:"Push for flat 20% crypto tax rate",zh:"推動加密貨幣統一20%稅率",impact:"high"},
    {cid:"sg",date:"2025-12",type:"N",en:"MAS stablecoin reserve requirements enacted",zh:"MAS穩定幣準備金要求生效",impact:"high"},
    {cid:"ae",date:"2025-11",type:"A",en:"VARA enhanced custody segregation rules",zh:"VARA強化託管隔離規定",impact:"med"},
    {cid:"tw",date:"2025-11",type:"P",en:"Virtual Asset Service Provider Act under review",zh:"虛擬資產服務商法案審議中",impact:"med"},
    {cid:"ch",date:"2025-10",type:"A",en:"FINMA expanded DLT trading facilities",zh:"FINMA擴大DLT交易設施",impact:"low"},
    {cid:"my",date:"2025-10",type:"A",en:"SC enhanced digital asset cybersecurity standards",zh:"SC強化數位資產網路安全標準",impact:"low"},
    {cid:"ph",date:"2025-09",type:"N",en:"BSP mandated custodial insurance for VASPs",zh:"BSP要求VASP託管保險",impact:"med"},
    {cid:"mt",date:"2025-08",type:"A",en:"VFA framework aligning with EU MiCA",zh:"VFA框架對齊歐盟MiCA",impact:"med"},
    {cid:"sg",date:"2025-06",type:"N",en:"MAS Payment Services Act licensing wave",zh:"MAS支付服務法牌照發放潮",impact:"high"},
    {cid:"hk",date:"2025-06",type:"N",en:"SFC: Type 1 & 7 licenses for crypto",zh:"SFC：加密貨幣第1及7類牌照",impact:"high"},
    {cid:"ae",date:"2025-03",type:"N",en:"VARA full regulatory framework launched",zh:"VARA完整監管框架啟動",impact:"high"},
    {cid:"us",date:"2024-06",type:"A",en:"SEC Spot ETH ETF approved",zh:"SEC批准現貨以太幣ETF",impact:"high"},
    {cid:"us",date:"2024-01",type:"N",en:"SEC Spot BTC ETF approved",zh:"SEC批准現貨比特幣ETF",impact:"high"},
    {cid:"jp",date:"2023-06",type:"N",en:"Revised Payment Services Act for stablecoins",zh:"修訂支付服務法納入穩定幣",impact:"high"},
    {cid:"kr",date:"2023-07",type:"N",en:"Virtual Asset Users Protection Act passed",zh:"虛擬資產用戶保護法通過",impact:"high"},
    {cid:"mt",date:"2018-11",type:"N",en:"VFA Act - world's first comprehensive framework",zh:"VFA法案——全球首個綜合框架",impact:"high"},
  ];

  const REG_FRAMEWORK = {
    us:{authority:"SEC / CFTC / FinCEN",authZ:"SEC / CFTC / FinCEN",license:"MSB + state licenses",licZ:"MSB + 各州牌照",tax:"Capital gains (short/long term)",taxZ:"資本利得稅（短/長期）",stablecoin:"Legislation pending",stableZ:"立法中",defi:"Enforcement-based",defiZ:"依執法案例",custody:"State-regulated",custZ:"各州監管"},
    gb:{authority:"FCA",authZ:"FCA金融行為監管局",license:"Crypto Asset Registration",licZ:"加密資產註冊制",tax:"Capital Gains Tax 10-20%",taxZ:"資本利得稅10-20%",stablecoin:"Under FCA oversight",stableZ:"FCA監管中",defi:"Consultation phase",defiZ:"諮詢階段",custody:"FCA registered",custZ:"FCA註冊"},
    ch:{authority:"FINMA",authZ:"FINMA瑞士金融市場監管局",license:"Banking / DLT Trading Facility",licZ:"銀行/DLT交易設施牌照",tax:"Wealth tax (no CGT for individuals)",taxZ:"財富稅（個人無資本利得稅）",stablecoin:"Regulated as deposits",stableZ:"作為存款監管",defi:"Technology-neutral",defiZ:"技術中立原則",custody:"FINMA supervised",custZ:"FINMA監管"},
    mt:{authority:"MFSA",authZ:"MFSA馬爾他金融服務局",license:"VFA Class 1-4",licZ:"VFA第1-4類牌照",tax:"0-35% (depends on structure)",taxZ:"0-35%（依結構）",stablecoin:"E-money token regime",stableZ:"電子貨幣代幣制度",defi:"Under VFA framework",defiZ:"VFA框架下",custody:"VFA Class 3",custZ:"VFA第3類"},
    ae:{authority:"VARA (Dubai) / ADGM / SCA",authZ:"VARA(杜拜)/ADGM/SCA",license:"VASP license by activity",licZ:"依業務類型VASP牌照",tax:"0% (no income/CGT)",taxZ:"0%（無所得/資本利得稅）",stablecoin:"VARA regulated",stableZ:"VARA監管",defi:"Activity-based regulation",defiZ:"依業務活動監管",custody:"Segregation required",custZ:"強制資產隔離"},
    sg:{authority:"MAS",authZ:"MAS新加坡金融管理局",license:"Major/Standard Payment Institution",licZ:"主要/標準支付機構牌照",tax:"No CGT (trading income taxable)",taxZ:"無資本利得稅（交易收入需課稅）",stablecoin:"MAS regulated stablecoin framework",stableZ:"MAS穩定幣監管框架",defi:"Activity-based",defiZ:"依業務活動",custody:"MAS licensed",custZ:"MAS牌照"},
    hk:{authority:"SFC / HKMA",authZ:"SFC證監會/HKMA金管局",license:"Type 1 & 7 (VATP) / AMLO",licZ:"第1及7類（VATP）/AMLO",tax:"No CGT",taxZ:"無資本利得稅",stablecoin:"HKMA stablecoin bill",stableZ:"HKMA穩定幣條例草案",defi:"Under consultation",defiZ:"諮詢中",custody:"Licensed custody",custZ:"持牌託管"},
    tw:{authority:"FSC",authZ:"FSC金管會",license:"VASP registration (pending Act)",licZ:"VASP登記制（法案審議中）",tax:"Under review",taxZ:"研議中",stablecoin:"Not yet regulated",stableZ:"尚未監管",defi:"Not addressed",defiZ:"尚未處理",custody:"Industry self-regulation",custZ:"業界自律"},
    jp:{authority:"FSA / JFSA",authZ:"FSA金融廳",license:"CESRBA registration",licZ:"CESRBA註冊",tax:"Misc. income up to 55%",taxZ:"雜項所得最高55%",stablecoin:"PSA regulated",stableZ:"支付服務法監管",defi:"Self-regulation (JVCEA)",defiZ:"自律（JVCEA）",custody:"Cold wallet mandate",custZ:"冷錢包強制"},
    kr:{authority:"FSC / FSS",authZ:"FSC金融委/FSS金融監院",license:"VASP reporting",licZ:"VASP申報制",tax:"CGT deferred to 2027",taxZ:"資本利得稅延至2027",stablecoin:"Under review",stableZ:"研議中",defi:"Not specifically addressed",defiZ:"未專門處理",custody:"ISMS certification",custZ:"ISMS認證"},
    ph:{authority:"BSP / SEC",authZ:"BSP中央銀行/SEC證管會",license:"VASP registration with BSP",licZ:"BSP VASP登記",tax:"Subject to income tax rules",taxZ:"適用所得稅規定",stablecoin:"BSP regulated",stableZ:"BSP監管",defi:"Not specifically regulated",defiZ:"未專門監管",custody:"BSP custodial requirements",custZ:"BSP託管要求"},
    my:{authority:"SC Malaysia",authZ:"SC馬來西亞證券委員會",license:"DAX operator / IEO platform",licZ:"DAX營運商/IEO平台",tax:"No CGT (trading income taxable)",taxZ:"無資本利得稅（交易收入課稅）",stablecoin:"Not specifically regulated",stableZ:"未專門監管",defi:"Under SC oversight",defiZ:"SC監管下",custody:"SC regulated",custZ:"SC監管"},
  };

  const Reg=()=>{
    const [regView, setRegView] = useState("timeline"); // timeline, framework, ai
    const [regCountry, setRegCountry] = useState(null);
    const [articles, setArticles] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeArticle, setActiveArticle] = useState(null);
    const todayStr = new Date().toISOString().slice(0,10);
    const thisMonth = new Date().toISOString().slice(0,7);

    // Auto-load articles on mount
    useEffect(() => {
      if(regView !== "ai") return;
      (async () => {
        try {
          const cached = await window.storage.get("reg-articles-v2");
          if(cached) {
            const data = JSON.parse(cached.value);
            setArticles(data);
            if(data.some(a => a.date === todayStr)) return; // already have today's
          }
        } catch(e) {}
        // Auto-generate today's articles
        await generateDailyArticles();
      })();
    }, [regView]);

    const generateDailyArticles = async () => {
      setAiLoading(true);
      const isZh = lang === "zh";
      const topCountries = ["us","sg","ae","hk","jp","tw"];
      const newArticles = [...articles.filter(a => a.date !== todayStr)]; // keep old, remove today's stale

      for(const cid of topCountries) {
        const cc = COUNTRIES.find(c=>c.id===cid);
        if(!cc) continue;

        // CRYPTO article
        const cryptoPrompt = isZh
          ? `你是加密貨幣法規記者。搜尋${cc.zh}最新的加密貨幣監管新聞（2025-2026年）。用繁體中文寫一篇300字以內的新聞稿。格式：第一行是新聞標題（不要加任何前綴符號），空一行後是正文。正文需包含：具體監管機構名稱、法規變動內容、生效日期、對交易所的影響。語氣專業但易讀。`
          : `You are a crypto regulation journalist. Search for the latest crypto regulation news for ${cc.n} (2025-2026). Write a news article under 300 words. Format: first line is the headline (no prefix symbols), then a blank line, then the body. Include: specific regulatory body names, what changed, effective dates, impact on exchanges. Professional but readable tone.`;

        // HR article
        const hrPrompt = isZh
          ? `你是跨境人力資源分析師。搜尋${cc.zh}最新的勞動法規或人力資源政策變動（2025-2026年），特別是影響科技業/金融業的政策。用繁體中文寫一篇300字以內的分析稿。格式：第一行是標題（不要加任何前綴符號），空一行後是正文。正文需包含：政策名稱、主管機關、對薪酬福利的影響、企業應對建議。`
          : `You are a cross-border HR analyst. Search for the latest labor law or HR policy changes in ${cc.n} (2025-2026), especially those affecting tech/finance sectors. Write an analysis under 300 words. Format: first line is the headline (no prefix symbols), then a blank line, then the body. Include: policy name, governing body, impact on compensation & benefits, recommended actions for employers.`;

        for(const [cat, prompt] of [["crypto", cryptoPrompt], ["hr", hrPrompt]]) {
          try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method:"POST", headers:{"Content-Type":"application/json"},
              body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
                messages:[{role:"user",content:prompt}],
                tools:[{type:"web_search_20250305",name:"web_search"}]
              })
            });
            const data = await res.json();
            const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
            const firstLine = text.split("\n").find(l=>l.trim());
            const body = text.split("\n").slice(text.split("\n").findIndex(l=>l.trim())+1).join("\n").trim();
            newArticles.push({
              id: cid+"-"+cat+"-"+todayStr,
              category: cat,
              country: cid,
              title: (firstLine||"").replace(/^[#*]+\s*/,""),
              body: body || text,
              date: todayStr,
              time: "08:00",
              lang: lang,
            });
          } catch(e) { /* skip failed */ }
        }
      }
      setArticles(newArticles);
      try { await window.storage.set("reg-articles-v2", JSON.stringify(newArticles)); } catch(e) {}
      setAiLoading(false);
    };

    const regCount = COUNTRIES.filter(c=>c.rs==="regulated").length;
    const evoCount = COUNTRIES.filter(c=>c.rs==="evolving").length;
    const filtered = regCountry ? REG_TIMELINE.filter(r=>r.cid===regCountry) : REG_TIMELINE;
    const typeMap = {N:{en:"NEW",zh:"新增",color:"#2d8a4e",bg:"#2d8a4e12"},A:{en:"AMENDED",zh:"修正",color:"#b08600",bg:"#b0860012"},V:{en:"REVOKED",zh:"廢止",color:"#9e3b3b",bg:"#9e3b3b12"},P:{en:"PROPOSED",zh:"草案",color:D.slate,bg:D.slate+"0a"}};
    const impactMap = {high:{en:"High Impact",zh:"高影響",color:"#c04040"},med:{en:"Medium",zh:"中影響",color:"#b08600"},low:{en:"Low",zh:"低影響",color:D.tx4}};

    return(<div>
      <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginBottom:6}}>{t("Crypto Regulation Intelligence","加密貨幣法規情報")}</div>
      <div style={{fontSize:14,color:D.tx3,marginBottom:20}}>{t("Timeline, regulatory framework analysis, and AI-powered real-time monitoring","時間軸、監管框架分析與AI即時監控")}</div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:12,marginBottom:14}}>
        {[
          {n:regCount, l:t("Regulated","已監管"), c:D.sage},
          {n:evoCount, l:t("Evolving","演進中"), c:D.copper},
          {n:REG_TIMELINE.filter(r=>r.type==="N").length, l:t("New Laws","新法規"), c:"#2d8a4e"},
          {n:REG_TIMELINE.filter(r=>r.type==="A").length, l:t("Amendments","修正案"), c:"#b08600"},
        ].map((s,i)=>(
          <Card key={i}><div style={{padding:16,textAlign:"center"}}><div style={{fontSize:32,fontWeight:500,fontFamily:"'DM Mono',monospace",color:s.c}}>{s.n}</div><div style={{fontSize:12,color:D.tx3,marginTop:4}}>{s.l}</div></div></Card>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {[{id:"timeline",e:"Timeline",z:"時間軸"},{id:"framework",e:"Framework",z:"監管框架"},{id:"ai",e:"Daily News",z:"法規日報"}].map(v=>(
          <button key={v.id} onClick={()=>setRegView(v.id)} style={{
            background:regView===v.id?D.slate+"12":"transparent",
            border:"1px solid "+(regView===v.id?D.slate+"30":"transparent"),
            color:regView===v.id?D.slate:D.tx4,padding:"7px 18px",borderRadius:6,cursor:"pointer",
            fontSize:14,fontWeight:regView===v.id?600:400,fontFamily:"'DM Mono','Noto Sans TC',monospace",
          }}>{t(v.e,v.z)}</button>
        ))}
      </div>

      {/* ═══ TIMELINE VIEW ═══ */}
      {regView==="timeline" && (<div>
        {/* Country filter */}
        <Card glow style={{marginBottom:14}}><div style={{padding:"10px 16px",display:"flex",gap:4,flexWrap:"wrap"}}>
          <button onClick={()=>setRegCountry(null)} style={{background:!regCountry?D.slate+"12":"transparent",border:"1px solid "+(!regCountry?D.slate+"30":"transparent"),color:!regCountry?D.slate:D.tx4,padding:"4px 12px",borderRadius:5,cursor:"pointer",fontSize:13,fontWeight:!regCountry?600:400}}>{t("All Countries","全部國家")}</button>
          {COUNTRIES.map(c=>(<button key={c.id} onClick={()=>setRegCountry(c.id)} style={{background:regCountry===c.id?D.slate+"12":"transparent",border:"1px solid "+(regCountry===c.id?D.slate+"30":"transparent"),color:regCountry===c.id?D.slate:D.tx4,padding:"4px 10px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:regCountry===c.id?600:400}}>{c.flag} {c.id.toUpperCase()}</button>))}
        </div></Card>

        {/* Timeline */}
        <Card glow><div style={{padding:"16px 20px"}}>
          {filtered.map((ev,i)=>{
            const cc = COUNTRIES.find(c=>c.id===ev.cid);
            const tp = typeMap[ev.type]||typeMap.P;
            const imp = impactMap[ev.impact]||impactMap.low;
            return (
              <div key={i} style={{display:"flex",gap:16,padding:"14px 0",borderBottom:i<filtered.length-1?"1px solid "+D.lnF:"none",position:"relative"}}>
                {/* Timeline line */}
                <div style={{width:80,flexShrink:0,textAlign:"right"}}>
                  <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:600,color:D.tx}}>{ev.date}</div>
                  <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:imp.color+"14",color:imp.color,fontWeight:500}}>{lang==="zh"?imp.zh:imp.en}</span>
                </div>
                {/* Dot */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:4}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:tp.color,border:"2px solid "+D.surface,boxShadow:"0 0 0 2px "+tp.color+"30"}}/>
                  {i<filtered.length-1 && <div style={{width:2,flex:1,background:D.ln,marginTop:4}}/>}
                </div>
                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:tp.bg,color:tp.color,fontWeight:700,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>{lang==="zh"?tp.zh:tp.en}</span>
                    {cc && <span style={{fontSize:14}}>{cc.flag}</span>}
                    {cc && <span style={{fontSize:13,fontWeight:500,color:D.tx}}>{t(cc.n,cc.zh)}</span>}
                  </div>
                  <div style={{fontSize:14,color:D.tx2,lineHeight:1.6}}>{lang==="zh"?ev.zh:ev.en}</div>
                </div>
              </div>
            );
          })}
        </div></Card>
      </div>)}

      {/* ═══ FRAMEWORK VIEW ═══ */}
      {regView==="framework" && (
        <Card glow><div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{position:"sticky",left:0,zIndex:3,background:D.surface,padding:"12px 14px",textAlign:"left",borderBottom:"2px solid "+D.ln,fontSize:12,color:D.tx4,fontFamily:"'DM Mono',monospace",minWidth:140}}>{t("Dimension","維度")}</th>
                {COUNTRIES.map(c=>(<th key={c.id} style={{padding:"10px 8px",textAlign:"center",borderBottom:"2px solid "+D.ln,minWidth:130}}>
                  <div style={{fontSize:16}}>{c.flag}</div>
                  <div style={{fontSize:12,fontWeight:600,color:D.tx,marginTop:2}}>{t(c.n,c.zh)}</div>
                  <Dot s={c.rs} lang={lang}/>
                </th>))}
              </tr>
            </thead>
            <tbody>
              {[
                {k:"authority",kz:"authZ",e:"Regulatory Authority",z:"監管機構"},
                {k:"license",kz:"licZ",e:"License Type",z:"牌照類型"},
                {k:"tax",kz:"taxZ",e:"Tax Treatment",z:"稅務處理"},
                {k:"stablecoin",kz:"stableZ",e:"Stablecoin Rules",z:"穩定幣規定"},
                {k:"defi",kz:"defiZ",e:"DeFi Regulation",z:"DeFi監管"},
                {k:"custody",kz:"custZ",e:"Custody Rules",z:"託管規定"},
              ].map((row,ri)=>(
                <tr key={row.k} style={{borderTop:"1px solid "+D.lnF}}>
                  <td style={{position:"sticky",left:0,zIndex:2,padding:"12px 14px",fontSize:13,fontWeight:600,color:D.tx,background:ri%2?D.slate+"03":D.surface,borderRight:"1px solid "+D.lnF}}>
                    {t(row.e,row.z)}
                  </td>
                  {COUNTRIES.map(c=>{
                    const fw = REG_FRAMEWORK[c.id]||{};
                    const val = lang==="zh" ? (fw[row.kz]||fw[row.k]||"—") : (fw[row.k]||"—");
                    return (<td key={c.id} style={{padding:"10px 8px",fontSize:12,color:D.tx2,textAlign:"center",verticalAlign:"top",borderLeft:"1px solid "+D.lnF,lineHeight:1.5}}>
                      {val}
                    </td>);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div></Card>
      )}

      {/* ═══ REGULATION DAILY NEWS ═══ */}
      {regView==="ai" && (<div>
        {/* Loading state */}
        {aiLoading && (
          <Card glow style={{marginBottom:14}}>
            <div style={{padding:"24px 20px",textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>📡</div>
              <div style={{fontSize:15,fontWeight:600,color:D.tx}}>{t("Generating today's briefings...","正在生成今日簡報...")}</div>
              <div style={{fontSize:13,color:D.tx3,marginTop:4}}>{t("AI is searching the web and writing articles for 6 countries × 2 categories","AI正在搜尋並撰寫6國×2類別的文章")}</div>
              <div style={{width:200,height:4,background:D.lnF,borderRadius:4,margin:"16px auto 0",overflow:"hidden"}}>
                <div style={{width:"60%",height:"100%",background:D.sage,borderRadius:4,animation:"pulse 1.5s ease infinite"}}/>
              </div>
            </div>
          </Card>
        )}

        {/* Category tabs */}
        {!aiLoading && articles.length > 0 && (() => {
          const catFilter = regCountry; // reuse regCountry as category filter
          const todayArticles = articles.filter(a => a.date === todayStr);
          const olderArticles = articles.filter(a => a.date !== todayStr && a.date.startsWith(thisMonth));
          const cryptoToday = todayArticles.filter(a => a.category === "crypto");
          const hrToday = todayArticles.filter(a => a.category === "hr");
          const cryptoOlder = olderArticles.filter(a => a.category === "crypto");
          const hrOlder = olderArticles.filter(a => a.category === "hr");

          if(activeArticle) {
            const art = articles.find(a => a.id === activeArticle);
            if(!art) return null;
            const cc = COUNTRIES.find(c => c.id === art.country);
            return (
              <div>
                <button onClick={() => setActiveArticle(null)} style={{background:"none",border:"1px solid "+D.ln,color:D.tx3,padding:"6px 16px",borderRadius:5,cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"'DM Mono',monospace",marginBottom:16}}>← {t("Back to list","返回列表")}</button>
                <Card accent={art.category==="crypto"?D.sage:D.copper} glow>
                  <div style={{padding:"28px 32px"}}>
                    {/* Article header */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                      <span style={{fontSize:10,padding:"3px 10px",borderRadius:4,fontWeight:700,fontFamily:"'DM Mono',monospace",letterSpacing:1,
                        background:art.category==="crypto"?D.sage+"14":D.copper+"14",
                        color:art.category==="crypto"?D.sage:D.copper,
                      }}>{art.category==="crypto" ? t("CRYPTO REGULATION","加密貨幣法規") : t("HR & LABOR","人力資源")}</span>
                      {cc && <span style={{fontSize:16}}>{cc.flag}</span>}
                      {cc && <span style={{fontSize:13,color:D.tx3}}>{t(cc.n,cc.zh)}</span>}
                      <span style={{fontSize:12,color:D.tx4,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{art.date} {art.time}</span>
                    </div>
                    {/* Title */}
                    <h2 style={{fontSize:24,fontWeight:700,color:D.tx,lineHeight:1.4,marginBottom:20,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}>{art.title}</h2>
                    {/* Divider */}
                    <div style={{width:48,height:3,background:art.category==="crypto"?D.sage:D.copper,borderRadius:2,marginBottom:20,opacity:0.4}}/>
                    {/* Body - render paragraphs */}
                    {art.body.split("\n").map((p,i) => {
                      const trimmed = p.trim();
                      if(!trimmed) return <div key={i} style={{height:14}}/>;
                      if(trimmed.startsWith("•")||trimmed.startsWith("-")||trimmed.startsWith("·")) {
                        return <div key={i} style={{display:"flex",gap:8,padding:"5px 0",marginLeft:4}}>
                          <span style={{color:art.category==="crypto"?D.sage:D.copper,flexShrink:0,fontSize:16}}>▸</span>
                          <span style={{fontSize:15,color:D.tx2,lineHeight:1.8}}>{trimmed.replace(/^[•\-·]\s*/,"")}</span>
                        </div>;
                      }
                      if(trimmed.includes("**")) {
                        const parts = trimmed.split(/\*\*(.+?)\*\*/g);
                        return <p key={i} style={{fontSize:15,color:D.tx2,lineHeight:1.9,margin:"0 0 8px"}}>{parts.map((s,j) => j%2===1 ? <strong key={j} style={{color:D.tx,fontWeight:600}}>{s}</strong> : s)}</p>;
                      }
                      return <p key={i} style={{fontSize:15,color:D.tx2,lineHeight:1.9,margin:"0 0 8px"}}>{trimmed}</p>;
                    })}
                    {/* Footer */}
                    <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid "+D.lnF,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,color:D.tx5}}>{t("Generated by AI + Web Search. For reference only.","由AI+網路搜尋生成，僅供參考。")}</span>
                      <span style={{fontSize:10,color:D.tx5,fontFamily:"'DM Mono',monospace"}}>Payband Daily</span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          }

          // Article list card renderer
          const ArticleCard = ({art, featured}) => {
            const cc = COUNTRIES.find(c=>c.id===art.country);
            return (
              <div onClick={()=>setActiveArticle(art.id)} style={{
                padding: featured ? "16px 18px" : "12px 14px",
                borderBottom:"1px solid "+D.lnF, cursor:"pointer",
                background:"transparent",
                transition:"background 0.15s",
              }} onMouseEnter={e=>e.currentTarget.style.background=D.slate+"04"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,fontWeight:600,fontFamily:"'DM Mono',monospace",
                    background:art.category==="crypto"?D.sage+"14":D.copper+"14",
                    color:art.category==="crypto"?D.sage:D.copper,
                  }}>{art.category==="crypto" ? "CRYPTO" : "HR"}</span>
                  {cc && <span style={{fontSize:13}}>{cc.flag}</span>}
                  {cc && <span style={{fontSize:12,color:D.tx4}}>{t(cc.n,cc.zh)}</span>}
                  <span style={{fontSize:11,color:D.tx5,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{art.time}</span>
                </div>
                <div style={{fontSize:featured?16:14,fontWeight:600,color:D.tx,lineHeight:1.4,marginBottom:4}}>{art.title}</div>
                <div style={{fontSize:13,color:D.tx3,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{art.body.split("\n").find(l=>l.trim())||""}</div>
              </div>
            );
          };

          return (<div>
            {/* TODAY */}
            {todayArticles.length > 0 && (
              <Card glow style={{marginBottom:14}}>
                <div style={{padding:"14px 18px 0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:4,height:20,borderRadius:2,background:D.sage}}/>
                      <span style={{fontSize:18,fontWeight:700,color:D.tx}}>{t("Today's Briefing","今日簡報")}</span>
                    </div>
                    <span style={{fontSize:12,color:D.tx4,fontFamily:"'DM Mono',monospace"}}>{todayStr} 08:00 {t("auto-generated","自動生成")}</span>
                  </div>
                  <div style={{fontSize:12,color:D.tx4,marginBottom:10}}>{todayArticles.length} {t("articles","篇文章")} · {new Set(todayArticles.map(a=>a.country)).size} {t("countries","國")}</div>
                </div>

                {/* Crypto section */}
                {cryptoToday.length > 0 && (
                  <div>
                    <div style={{padding:"8px 18px",background:D.sage+"06",fontSize:12,fontWeight:600,color:D.sage,fontFamily:"'DM Mono',monospace",letterSpacing:1.5,borderTop:"1px solid "+D.lnF}}>
                      🔗 {t("CRYPTO REGULATION","加密貨幣法規")}
                    </div>
                    {cryptoToday.map(a => <ArticleCard key={a.id} art={a} featured/>)}
                  </div>
                )}

                {/* HR section */}
                {hrToday.length > 0 && (
                  <div>
                    <div style={{padding:"8px 18px",background:D.copper+"06",fontSize:12,fontWeight:600,color:D.copper,fontFamily:"'DM Mono',monospace",letterSpacing:1.5,borderTop:"1px solid "+D.ln}}>
                      👔 {t("HR & LABOR LAW","人力資源與勞動法規")}
                    </div>
                    {hrToday.map(a => <ArticleCard key={a.id} art={a} featured/>)}
                  </div>
                )}
              </Card>
            )}

            {/* THIS MONTH (older) */}
            {olderArticles.length > 0 && (
              <Card glow style={{marginBottom:14}}>
                <div style={{padding:"14px 18px 0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:4,height:20,borderRadius:2,background:D.tx4}}/>
                    <span style={{fontSize:16,fontWeight:600,color:D.tx3}}>{t("Earlier This Month","本月稍早")}</span>
                  </div>
                </div>
                {olderArticles.slice(0,20).map(a => <ArticleCard key={a.id} art={a}/>)}
              </Card>
            )}

            {/* No articles */}
            {todayArticles.length === 0 && !aiLoading && (
              <Card glow><div style={{padding:"40px 20px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>📰</div>
                <div style={{fontSize:16,color:D.tx3,marginBottom:12}}>{t("No articles yet today","今日尚無文章")}</div>
                <button onClick={generateDailyArticles} style={{background:D.ink,color:"#fff",border:"none",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Mono',monospace"}}>{t("Generate Now","立即生成")}</button>
              </div></Card>
            )}
          </div>);
        })()}
      </div>)}

    </div>);
  };


  // ═══════ COUNTRIES ═══════
  const Ctrs=()=>(<div>
    <div style={{fontSize:28,fontWeight:500,color:D.tx,fontFamily:"'DM Mono','Noto Sans TC',monospace",marginBottom:20}}>{t("Country Profiles","國家檔案")}</div>
    <Card glow style={{marginBottom:12}}><div style={{padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{color:D.tx4}}>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("Search...","搜尋...")} style={{background:"transparent",border:"none",color:D.tx,flex:1,fontSize:15,outline:"none",fontWeight:500,fontFamily:"'DM Mono','Noto Sans TC',monospace"}}/></div></Card>
    {detail?<CDetail c={detail}/>:(<div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12}}>
      {COUNTRIES.filter(c=>c.n.toLowerCase().includes(search.toLowerCase())||c.zh.includes(search)).map((c,i)=>{const tc=TC[c.id];return(<Card key={c.id} accent={D.slate} onClick={()=>setDetail(c)} style={{opacity:ready?1:0,transition:`all 0.3s ease ${i*0.03}s`}}>
        <div style={{padding:"16px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:28}}>{c.flag}</span><div><div style={{fontSize:16,fontWeight:500,color:D.tx}}>{t(c.n,c.zh)}</div><Dot s={c.rs} lang={lang}/></div></div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[{l:t("Mid SWE","中級工程"),v:fmt(gS(c.id,"eng","be","ic",2),usdt),c:D.slate},{l:t("Holidays","假日"),v:`${c.labor.ph}d`,c:D.sage},{l:t("Comp","成本"),v:`${tc?.multi||"—"}×`,c:D.copper}].map((s,si)=>(
              <div key={si} style={{background:`${s.c}06`,borderRadius:4,padding:"8px 10px"}}><div style={{fontSize:11,color:D.tx4,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{s.l}</div><div style={{fontSize:16,fontWeight:500,fontFamily:"'DM Mono',monospace",color:s.c,marginTop:1}}>{s.v}</div></div>
            ))}
          </div>
        </div>
      </Card>)})}
    </div>)}
  </div>);

  const CDetail=({c})=>{const tc=TC[c.id];return(<div>
    <button onClick={()=>setDetail(null)} style={{background:"none",border:`1px solid ${D.ln}`,color:D.tx3,padding:"5px 14px",borderRadius:4,cursor:"pointer",fontSize:13,fontWeight:500,marginBottom:12,fontFamily:"'DM Mono',monospace"}}>← {t("Back","返回")}</button>
    <Card accent={D.slate} glow><div style={{padding:24}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}><span style={{fontSize:48}}>{c.flag}</span><div><div style={{fontSize:28,fontWeight:500,color:D.tx}}>{t(c.n,c.zh)}</div><Dot s={c.rs} lang={lang}/></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:10,marginBottom:20}}>
        {[{l:t("Exchanges","交易所"),v:c.xc,c:D.sage},{l:t("Tax","稅率"),v:c.tax,c:D.clay},{l:t("Comp Multi","薪酬倍數"),v:`${tc?.multi||"—"}×`,c:D.copper},{l:t("ER Cost","雇主提撥"),v:tc?.erL||"—",c:D.slate,sm:true}].map((item,i)=>(<div key={i} style={{background:`${item.c}06`,borderRadius:6,padding:12,borderLeft:`3px solid ${item.c}30`}}><Tag color={D.tx4}>{item.l}</Tag><div style={{marginTop:4,fontSize:item.sm?11:18,fontWeight:500,fontFamily:"'DM Mono',monospace",color:item.c}}>{item.v}</div></div>))}
      </div>
      <Tag color={D.sage}>{t("Labor Law","勞動法規")}</Tag>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6,marginTop:8,marginBottom:16}}>
        {[{l:t("Holidays","假日"),v:`${c.labor.ph}d`},{l:t("Annual","特休"),v:lang==="zh"?c.labor.alZ:c.labor.al},{l:t("Maternity","產假"),v:lang==="zh"?c.labor.matZ:c.labor.mat},{l:t("Severance","資遣費"),v:lang==="zh"?c.labor.sevZ:c.labor.sev},{l:t("Sick","病假"),v:lang==="zh"?c.labor.sickZ:c.labor.sick},{l:t("Marriage","婚假"),v:lang==="zh"?c.labor.marZ:c.labor.mar},{l:t("Notice","預告"),v:lang==="zh"?c.labor.noticeZ:c.labor.notice},{l:t("13th Mo","13月薪"),v:lang==="zh"?c.labor.th13Z:c.labor.th13}].map((item,i)=>(<div key={i} style={{background:D.lnF,borderRadius:4,padding:"8px 10px"}}><div style={{fontSize:11,color:D.tx4,fontWeight:500,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{item.l}</div><div style={{fontSize:13,color:D.tx2,fontWeight:500,lineHeight:1.4}}>{item.v}</div></div>))}
      </div>
      <Tag color={D.slate}>{t("Salary Grid · IC","薪資 · IC軌")}</Tag>
      <div style={{overflow:"auto",borderRadius:6,border:`1px solid ${D.lnF}`,marginTop:6}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:`${D.slate}04`}}><th style={{textAlign:"left",padding:"8px 12px",fontSize:12,color:D.tx3,fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t("Role","職位")}</th>{JLVL.ic.map((l,i)=><th key={l.id} style={{textAlign:"center",padding:"6px 4px",fontSize:11,color:LV[i],fontWeight:500,fontFamily:"'DM Mono',monospace"}}>{t(l.l,l.zh)}</th>)}</tr></thead>
        <tbody>{FAMS.map(fm=>fm.subs.map((sf,si)=>(<tr key={sf.id} style={{borderTop:si===0?`1.5px solid ${D.ln}`:`1px solid ${D.lnF}`}}><td style={{padding:"4px 10px",fontSize:13,color:si===0?D.tx:D.tx3,fontWeight:si===0?600:400}}>{si===0&&<span style={{fontSize:11,color:D.slate,fontFamily:"'DM Mono',monospace",marginRight:3}}>{fm.tag}</span>}{t(sf.l,sf.zh)}</td>{JLVL.ic.map((l,li)=><td key={l.id} style={{textAlign:"center",padding:"4px 4px",fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:500,color:D.slate}}>{fmt(gS(c.id,fm.id,sf.id,"ic",li),usdt)}</td>)}</tr>)))}</tbody></table>
      </div>
    </div></Card>
  </div>)};

  return(<div style={{minHeight:"100vh",color:D.tx,position:"relative",fontFamily:"'DM Mono','Noto Sans TC',monospace",fontSize:16}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+TC:wght@300;400;500;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}::selection{background:${D.slate}18}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px}input::placeholder{color:${D.tx4}}table tr:hover{background:${D.slate}03!important}button{font-family:inherit}
    `}</style>
    <BG/><div style={{position:"relative",zIndex:1}}><Header/><main style={{maxWidth:1360,margin:"0 auto",padding:"20px 32px 48px"}}>
      {tab==="home"&&<Home/>}{tab==="salary"&&<Salary/>}{tab==="totalcomp"&&<TotalComp/>}{tab==="labor"&&<Labor/>}{tab==="calendar"&&<Calendar/>}{tab==="regulation"&&<Reg/>}{tab==="countries"&&<Ctrs/>}
    </main>
    <footer style={{borderTop:`1px solid ${D.ln}`,padding:"14px 32px",textAlign:"center"}}><span style={{fontSize:13,color:D.tx4}}>Payband v1.1 · {t("Mock data · API pending","模擬數據 · API待接")} · Ellen Chuang</span></footer>
    </div>
  </div>);
}
