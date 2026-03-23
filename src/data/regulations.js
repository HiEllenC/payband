// ═══════ REGULATION DATA ═══════
export const REG_TIMELINE = [
  // N=New  A=Amended  V=Revoked  P=Proposed
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

export const REG_FRAMEWORK = {
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
