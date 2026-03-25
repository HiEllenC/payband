import { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import { COUNTRIES } from "../data/countries.js";
import { HOLIDAYS_DB, WEEKENDS } from "../data/holidays.js";

const D = {
  tx: "#1c1c1f",
  tx2: "#4a4a52",
  tx3: "#7d7d88",
  tx4: "#a8a8b4",
  tx5: "#c8c8d0",
  lnF: "rgba(0,0,0,0.03)",
  ln: "rgba(0,0,0,0.06)",
  ink: "#2d3142",
  slate: "#546378",
  sage: "#5f7a61",
  copper: "#96714a",
  wine: "#8a5565",
  surface: "#faf9f7",
};

const Tag = ({ children, color = D.tx3 }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
    {children}
  </span>
);

const HBar = ({ value, max = 100, color = D.slate, h = 4 }) => (
  <div style={{ width: "100%", height: h, background: `${color}08`, borderRadius: 99, overflow: "hidden" }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, opacity: 0.35, borderRadius: 99, transition: "width 0.8s cubic-bezier(.22,1,.36,1)" }} />
  </div>
);

// ═══════ CALENDAR MODULE ═══════
export default function Calendar({ selC, togC, calView, setCalView, lang, t }) {
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(2026);
  const [compCountry, setCompCountry] = useState("us");
  const sel = selC.map(id => COUNTRIES.find(c => c.id === id)).filter(Boolean);
  const ranked = [...COUNTRIES].sort((a, b) => b.labor.ph - a.labor.ph);
  const availYears = [2025, 2026, 2027];
  const holDB = HOLIDAYS_DB[calYear] || {};

  const months = [
    { e: "January", z: "一月" }, { e: "February", z: "二月" }, { e: "March", z: "三月" },
    { e: "April", z: "四月" }, { e: "May", z: "五月" }, { e: "June", z: "六月" },
    { e: "July", z: "七月" }, { e: "August", z: "八月" }, { e: "September", z: "九月" },
    { e: "October", z: "十月" }, { e: "November", z: "十一月" }, { e: "December", z: "十二月" },
  ];
  const dayLabels = lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const rawDow = new Date(calYear, calMonth, 1).getDay();
  const firstDow = rawDow === 0 ? 6 : rawDow - 1;
  const days = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getHolidays = (cid, m, yr) => ((HOLIDAYS_DB[yr || calYear] || {})[cid] || []).filter(h => h.m === m + 1);
  const isHoliday = (cid, day) => (holDB[cid] || []).some(h => h.m === calMonth + 1 && h.d === day);
  const getHolidayName = (cid, day) => {
    const h = (holDB[cid] || []).find(h => h.m === calMonth + 1 && h.d === day);
    return h ? (lang === "zh" ? h.z : h.n) : null;
  };
  const getHolidayType = (cid, day) => {
    const h = (holDB[cid] || []).find(h => h.m === calMonth + 1 && h.d === day);
    return h ? (h.t || "R") : null;
  };
  const isWeekend = (cid, day) => {
    const dow = new Date(calYear, calMonth, day).getDay();
    return (WEEKENDS[cid] || [0, 6]).includes(dow);
  };
  const getWorkDays = (cid, yr) => {
    const y = yr || calYear;
    const dim = new Date(y, calMonth + 1, 0).getDate();
    const hdb = (HOLIDAYS_DB[y] || {})[cid] || [];
    let count = 0;
    for (let d = 1; d <= dim; d++) {
      const dow = new Date(y, calMonth, d).getDay();
      const wknd = (WEEKENDS[cid] || [0, 6]).includes(dow);
      const hol = hdb.some(h => h.m === calMonth + 1 && h.d === d);
      if (!wknd && !hol) count++;
    }
    return count;
  };
  const getAnnualHolidays = (cid, yr) => ((HOLIDAYS_DB[yr] || {})[cid] || []).length;
  // Memoize annual work-day calculations — avoids re-creating 365+ Date objects per render
  const annualWorkDaysCache = useMemo(() => {
    const cache = {};
    for (const yr of availYears) {
      for (const c of COUNTRIES) {
        const hdb = (HOLIDAYS_DB[yr] || {})[c.id] || [];
        const holSet = new Set(hdb.map(h => `${h.m}-${h.d}`));
        let count = 0;
        for (let m = 0; m < 12; m++) {
          const dim = new Date(yr, m + 1, 0).getDate();
          for (let d = 1; d <= dim; d++) {
            const dow = new Date(yr, m, d).getDay();
            const wknd = (WEEKENDS[c.id] || [0, 6]).includes(dow);
            if (!wknd && !holSet.has(`${m + 1}-${d}`)) count++;
          }
        }
        cache[`${c.id}-${yr}`] = count;
      }
    }
    return cache;
  }, []); // availYears and COUNTRIES are module-level constants
  const getAnnualWorkDays = (cid, yr) => {
    return annualWorkDaysCache[`${cid}-${yr}`] ?? 0;
  };

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 500, color: D.tx, fontFamily: "'DM Mono','Noto Sans TC',monospace", marginBottom: 6 }}>
        {t("Attendance & Holiday Calendar", "考勤與假日行事曆")}
      </div>
      <div style={{ fontSize: 14, color: D.tx3, marginBottom: 14 }}>
        {t("Cross-border working day analysis with public holiday overlay", "跨境工作日分析與國定假日疊加對比")}
      </div>

      {/* Guide cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 16 }}>
        {[
          { icon: "📋", title: t("Attendance Sheet","考勤總表"),   desc: t("Matrix view — all countries vs all dates. Quickly spot overlapping holidays when scheduling cross-border meetings.","矩陣視圖，一眼看出哪天哪國放假，安排跨國會議必備。") },
          { icon: "📅", title: t("Monthly Calendar","月曆模式"),   desc: t("Month-by-month calendar per country. Shows holiday chips and type badges for each day.","每月日曆逐日顯示假日名稱與類型，直覺好懂。") },
          { icon: "📊", title: t("Year Comparison","跨年對比"),     desc: t("Select one country — compare total working days and holidays across 2025, 2026, 2027.","選定單一國家，比較三個年度的總工作日與假日差異。") },
          { icon: "🏷️", title: t("Holiday Types","假日類型說明"), desc: t("R=Regular (200% pay in PH) · S=Special Non-Working (130% PH) · O=Observed substitute · B=UK Bank Holiday","R=法定假・S=特別非工作日（菲律賓130%）・O=補假・B=英國銀行假日") },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{icon} <span style={{ fontSize: 12, fontWeight: 600, color: "#2d3142", fontFamily: "'DM Mono','Noto Sans TC',monospace" }}>{title}</span></div>
            <div style={{ fontSize: 11, color: "#7d7d88", lineHeight: 1.55 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Country selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {COUNTRIES.map(c => {
          const active = selC.includes(c.id);
          return (
            <button key={c.id} onClick={() => togC(c.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px", borderRadius: 7, cursor: "pointer",
              border: active ? "1.5px solid #546378" : "1.5px solid rgba(0,0,0,0.08)",
              background: active ? "#546378" : "#faf9f7",
              color: active ? "#fff" : "#4a4a52",
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: "'DM Mono','Noto Sans TC',monospace",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              {t(c.n, c.zh)}
            </button>
          );
        })}
      </div>

      {/* Year + Month selector */}
      <Card glow style={{ marginBottom: 14 }}>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Tag>{t("YEAR", "年份")}</Tag>
              <div style={{ display: "flex", gap: 3 }}>
                {availYears.map(yr => {
                  const label = yr < 2026 ? t("Past", "歷史") : yr === 2026 ? t("Confirmed", "已確認") : t("Estimated", "預估");
                  const labelColor = yr < 2026 ? D.tx4 : yr === 2026 ? D.sage : D.copper;
                  return (
                    <button key={yr} onClick={() => setCalYear(yr)} style={{
                      background: calYear === yr ? D.ink : "transparent",
                      border: "1px solid " + (calYear === yr ? D.ink : D.ln),
                      color: calYear === yr ? "#fff" : D.tx3, padding: "5px 16px", borderRadius: 5, cursor: "pointer",
                      fontSize: 15, fontWeight: calYear === yr ? 700 : 400, fontFamily: "'DM Mono',monospace", position: "relative",
                    }}>
                      <div>{yr}</div>
                      <div style={{ fontSize: 9, marginTop: 2, color: calYear === yr ? "rgba(255,255,255,0.7)" : labelColor }}>{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setCalMonth(p => Math.max(0, p - 1))} style={{ background: "none", border: "1px solid " + D.ln, color: D.tx3, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>←</button>
              <button onClick={() => setCalMonth(p => Math.min(11, p + 1))} style={{ background: "none", border: "1px solid " + D.ln, color: D.tx3, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>→</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {months.map((m, i) => (
              <button key={i} onClick={() => setCalMonth(i)} style={{
                background: calMonth === i ? D.slate + "12" : "transparent",
                border: "1px solid " + (calMonth === i ? D.slate + "30" : "transparent"),
                color: calMonth === i ? D.slate : D.tx4, padding: "5px 12px", borderRadius: 5, cursor: "pointer",
                fontSize: 13, fontWeight: calMonth === i ? 600 : 400, fontFamily: "'DM Mono','Noto Sans TC',monospace",
              }}>
                {t(m.e, m.z)}
              </button>
            ))}
          </div>
          {calYear === 2027 && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: D.copper + "08", borderRadius: 5, fontSize: 12, color: D.copper }}>
              ⚠️ {t("2027 dates are astronomical estimates. Islamic holidays depend on moon sighting; lunar calendar holidays and make-up days await government announcements.", "2027年日期為天文預估。伊斯蘭節日依月亮觀測確認；農曆節日補假規則待各國政府公告。")}
            </div>
          )}
        </div>
      </Card>

      {/* Monthly Stats Summary */}
      {calView !== "yearcomp" && sel.length > 0 && (
        <Card glow style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <Tag color={D.sage}>{t("MONTHLY SUMMARY", "月度摘要")} · {t(months[calMonth].e, months[calMonth].z)} {calYear}</Tag>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(sel.length, 6) + ", 1fr)", gap: 10, marginTop: 10 }}>
              {sel.map(c => {
                const hols = getHolidays(c.id, calMonth);
                const workDays = getWorkDays(c.id);
                return (
                  <div key={c.id} style={{ background: D.lnF, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{c.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: D.tx }}>{t(c.n, c.zh)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div><div style={{ fontSize: 11, color: D.tx4 }}>{t("Work Days", "工作日")}</div><div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: D.sage }}>{workDays}</div></div>
                      <div><div style={{ fontSize: 11, color: D.tx4 }}>{t("Holidays", "假日")}</div><div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: D.copper }}>{hols.length}</div></div>
                      <div><div style={{ fontSize: 11, color: D.tx4 }}>{t("Total Days", "總天數")}</div><div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: D.tx3 }}>{daysInMonth}</div></div>
                    </div>
                    {hols.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {hols.map((h, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "2px 7px", background: D.copper + "0c", color: D.copper, borderRadius: 3 }}>
                            {h.d}{t("th", "日")} {lang === "zh" ? h.z : h.n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[{ id: "sheet", e: "Attendance Sheet", z: "考勤總表" }, { id: "calendar", e: "Calendar", z: "月曆" }, { id: "yearcomp", e: "Year Compare", z: "跨年對比" }].map(v => (
          <button key={v.id} onClick={() => setCalView(v.id)} style={{
            background: calView === v.id ? D.slate + "12" : "transparent",
            border: "1px solid " + (calView === v.id ? D.slate + "30" : "transparent"),
            color: calView === v.id ? D.slate : D.tx4, padding: "7px 18px", borderRadius: 6, cursor: "pointer",
            fontSize: 14, fontWeight: calView === v.id ? 600 : 400, fontFamily: "'DM Mono','Noto Sans TC',monospace",
          }}>
            {t(v.e, v.z)}
          </button>
        ))}
      </div>

      {/* CALENDAR GRID VIEW */}
      {calView === "calendar" && (
        <Card glow>
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px repeat(7,1fr)", gap: 0, marginBottom: 2 }}>
              <div style={{ fontSize: 12, color: D.tx4, fontWeight: 500, padding: "6px 0" }}>{t("Country", "國家")}</div>
              {dayLabels.map((dl, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 12, color: [5, 6].includes(i) ? D.wine : D.tx4, fontWeight: 500, fontFamily: "'DM Mono',monospace", padding: "6px 0" }}>{dl}</div>
              ))}
            </div>
            {sel.map((c, ci) => {
              const hols = getHolidays(c.id, calMonth);
              return (
                <div key={c.id} style={{ borderTop: "1px solid " + D.ln, paddingTop: 10, paddingBottom: 10, marginBottom: ci < sel.length - 1 ? 0 : 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 0, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: D.tx }}>{t(c.n, c.zh)}</div>
                        <div style={{ fontSize: 11, color: D.sage, fontFamily: "'DM Mono',monospace" }}>{getWorkDays(c.id)}{t(" work days", " 工作日")}</div>
                      </div>
                    </div>
                    {hols.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                        {hols.map((h, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "2px 8px", background: D.copper + "0c", color: D.copper, borderRadius: 3 }}>
                            {h.d}{t("th", "日")} {lang === "zh" ? h.z : h.n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: 140 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                      {days.map((day, i) => {
                        if (day === null) return <div key={"e" + i} />;
                        const hol = isHoliday(c.id, day);
                        const wknd = isWeekend(c.id, day);
                        const holName = getHolidayName(c.id, day);
                        return (
                          <div key={i} title={holName || ""} style={{
                            textAlign: "center", padding: "5px 2px", borderRadius: 4,
                            background: hol ? "#fceedd" : wknd ? "#e6e4e0" : "transparent",
                            border: hol ? "1px solid #e8a84040" : "1px solid transparent",
                            cursor: holName ? "help" : "default",
                          }}>
                            <div style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", fontWeight: hol ? 700 : 400, color: hol ? "#b06800" : wknd ? D.tx3 : D.tx2 }}>{day}</div>
                            {hol && <div style={{ width: 5, height: 5, borderRadius: "50%", background: D.copper, margin: "2px auto 0", opacity: 0.7 }} />}
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

      {/* MATRIX / ATTENDANCE SHEET VIEW */}
      {calView === "sheet" && sel.length > 0 && (
        <Card glow>
          <div style={{ overflow: "auto", maxHeight: "70vh" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, zIndex: 6, background: D.surface, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <th style={{ position: "sticky", left: 0, zIndex: 7, background: D.surface, padding: "12px 12px", textAlign: "left", borderBottom: "2px solid " + D.ln, fontSize: 13, color: D.tx4, fontFamily: "'DM Mono',monospace", width: 70 }}>{t("Date", "日期")}</th>
                  <th style={{ position: "sticky", left: 70, zIndex: 7, background: D.surface, padding: "12px 6px", textAlign: "center", borderBottom: "2px solid " + D.ln, fontSize: 13, color: D.tx4, fontFamily: "'DM Mono',monospace", width: 40 }}>{t("Day", "週")}</th>
                  {sel.map(c => (
                    <th key={c.id} style={{ padding: "10px 8px", textAlign: "center", borderBottom: "2px solid " + D.ln, minWidth: 150, background: D.surface }}>
                      <span style={{ fontSize: 18 }}>{c.flag}</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: D.tx, marginTop: 2 }}>{t(c.n, c.zh)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: daysInMonth }, (_, di) => {
                  const day = di + 1;
                  const date = new Date(calYear, calMonth, day);
                  const dow = date.getDay();
                  const monIdx = dow === 0 ? 6 : dow - 1;
                  const dowLabel = dayLabels[monIdx];
                  const isSun = dow === 0;
                  const isSat = dow === 6;
                  const anyHoliday = sel.some(c => isHoliday(c.id, day));
                  const allWeekend = sel.every(c => isWeekend(c.id, day));
                  const weekStart = dow === 1;
                  return (
                    <tr key={day} style={{ borderTop: weekStart && day > 1 ? "3px solid " + D.slate + "20" : "1px solid " + D.lnF }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "7px 12px", background: anyHoliday ? "#fceedd" : allWeekend ? "#e6e4e0" : D.surface, fontSize: 14, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: anyHoliday ? "#b06800" : isSun || isSat ? D.tx3 : D.tx, borderRight: "1px solid " + D.lnF }}>
                        {(calMonth + 1) + "/" + day}
                      </td>
                      <td style={{ position: "sticky", left: 70, zIndex: 2, padding: "7px 6px", textAlign: "center", background: anyHoliday ? "#fceedd" : allWeekend ? "#e6e4e0" : D.surface, fontSize: 13, fontWeight: 500, color: isSun || isSat ? D.tx3 : D.tx4, fontFamily: "'DM Mono',monospace", borderRight: "1px solid " + D.ln }}>
                        {dowLabel}
                      </td>
                      {sel.map(c => {
                        const hol = isHoliday(c.id, day);
                        const wknd = isWeekend(c.id, day);
                        const holName = getHolidayName(c.id, day);
                        const holType = getHolidayType(c.id, day);
                        const typeLabel = holType === "S" ? { en: "Special", zh: "特別假", color: "#8a65a0" } : holType === "O" ? { en: "Observed", zh: "補假", color: "#5a8a6a" } : holType === "B" ? { en: "Bank Hol", zh: "銀行假", color: D.slate } : { en: "Regular", zh: "法定假", color: "#b06800" };
                        return (
                          <td key={c.id} style={{ padding: "6px 8px", textAlign: "left", background: hol ? (holType === "S" ? "#8a65a010" : "#fceedd") : wknd ? "#e6e4e0" : "transparent", borderLeft: "1px solid " + (hol ? (holType === "S" ? "#8a65a020" : "#e8a84020") : D.lnF) }}>
                            {hol ? (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: typeLabel.color + "18", color: typeLabel.color, fontWeight: 600, fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>
                                    {lang === "zh" ? typeLabel.zh : typeLabel.en}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 500, color: typeLabel.color }}>{holName}</div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr style={{ borderTop: "3px solid " + D.ln, background: D.slate + "06" }}>
                  <td colSpan={2} style={{ position: "sticky", left: 0, zIndex: 2, padding: "12px 12px", fontSize: 14, fontWeight: 700, color: D.tx, background: D.slate + "0a", borderRight: "1px solid " + D.ln }}>
                    {t("WORK DAYS", "工作日合計")}
                  </td>
                  {sel.map(c => (
                    <td key={c.id} style={{ padding: "12px 8px", textAlign: "center", fontSize: 24, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.sage, borderLeft: "1px solid " + D.lnF, background: D.sage + "08" }}>
                      {getWorkDays(c.id)}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderTop: "1px solid " + D.lnF }}>
                  <td colSpan={2} style={{ position: "sticky", left: 0, zIndex: 2, padding: "10px 12px", fontSize: 13, fontWeight: 600, color: D.tx3, background: D.surface, borderRight: "1px solid " + D.ln }}>
                    {t("HOLIDAYS", "假日合計")}
                  </td>
                  {sel.map(c => (
                    <td key={c.id} style={{ padding: "10px 8px", textAlign: "center", fontSize: 20, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.copper, borderLeft: "1px solid " + D.lnF }}>
                      {getHolidays(c.id, calMonth).length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* YEAR COMPARISON VIEW */}
      {calView === "yearcomp" && (
        <div>
          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "12px 16px" }}>
              <Tag>{t("SELECT COUNTRY TO COMPARE ACROSS YEARS", "選擇國家進行跨年比較")}</Tag>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                {COUNTRIES.map(c => (
                  <button key={c.id} onClick={() => setCompCountry(c.id)} style={{
                    background: compCountry === c.id ? D.slate + "12" : "transparent",
                    border: "1px solid " + (compCountry === c.id ? D.slate + "30" : "transparent"),
                    color: compCountry === c.id ? D.slate : D.tx4, padding: "5px 12px", borderRadius: 5, cursor: "pointer",
                    fontSize: 13, fontWeight: compCountry === c.id ? 600 : 400,
                  }}>
                    {c.flag} {t(c.n, c.zh)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>{COUNTRIES.find(c => c.id === compCountry)?.flag}</span>
                <div style={{ fontSize: 18, fontWeight: 600, color: D.tx }}>{t(COUNTRIES.find(c => c.id === compCountry)?.n || "", COUNTRIES.find(c => c.id === compCountry)?.zh || "")}</div>
                <Tag color={D.tx4}>{t("ANNUAL OVERVIEW", "年度總覽")}</Tag>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {availYears.map(yr => (
                  <div key={yr} style={{ background: yr === calYear ? D.slate + "08" : D.lnF, borderRadius: 8, padding: "14px 16px", border: yr === calYear ? "2px solid " + D.slate + "30" : "2px solid transparent" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.tx, marginBottom: 8 }}>{yr}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div><div style={{ fontSize: 11, color: D.tx4 }}>{t("Holidays", "假日")}</div><div style={{ fontSize: 24, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.copper }}>{getAnnualHolidays(compCountry, yr)}</div></div>
                      <div><div style={{ fontSize: 11, color: D.tx4 }}>{t("Work Days", "工作日")}</div><div style={{ fontSize: 24, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: D.sage }}>{getAnnualWorkDays(compCountry, yr)}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ position: "sticky", left: 0, zIndex: 3, background: D.surface, padding: "12px 14px", textAlign: "left", borderBottom: "2px solid " + D.ln, fontSize: 13, color: D.tx4, fontFamily: "'DM Mono',monospace" }}>{t("Month", "月份")}</th>
                    {availYears.map(yr => (
                      <th key={yr} colSpan={2} style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid " + D.ln, fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: yr === calYear ? D.slate : D.tx3, borderLeft: "2px solid " + D.ln }}>
                        {yr}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th style={{ position: "sticky", left: 0, zIndex: 3, background: D.surface, padding: "6px 14px", borderBottom: "1px solid " + D.ln }} />
                    {availYears.map(yr => [
                      <th key={yr + "h"} style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid " + D.ln, fontSize: 11, color: D.copper, borderLeft: "2px solid " + D.ln }}>{t("Holidays", "假日")}</th>,
                      <th key={yr + "w"} style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid " + D.ln, fontSize: 11, color: D.sage }}>{t("Work Days", "工作日")}</th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {months.map((m, mi) => (
                    <tr key={mi} style={{ borderTop: "1px solid " + D.lnF, background: mi === calMonth ? D.slate + "06" : "transparent" }}>
                      <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "10px 14px", background: mi === calMonth ? D.slate + "0a" : D.surface, fontWeight: 600, fontSize: 14, color: mi === calMonth ? D.slate : D.tx, borderRight: "1px solid " + D.lnF }}>
                        {t(m.e, m.z)}
                      </td>
                      {availYears.map(yr => {
                        const hols = getHolidays(compCountry, mi, yr);
                        const dim = new Date(yr, mi + 1, 0).getDate();
                        const hdb = (HOLIDAYS_DB[yr] || {})[compCountry] || [];
                        let wd = 0;
                        for (let d = 1; d <= dim; d++) {
                          const dow = new Date(yr, mi, d).getDay();
                          const wk = (WEEKENDS[compCountry] || [0, 6]).includes(dow);
                          const hl = hdb.some(h => h.m === mi + 1 && h.d === d);
                          if (!wk && !hl) wd++;
                        }
                        return [
                          <td key={yr + "h"} style={{ padding: "10px 8px", textAlign: "center", borderLeft: "2px solid " + D.ln, fontSize: hols.length > 0 ? 16 : 14, fontWeight: hols.length > 0 ? 700 : 400, fontFamily: "'DM Mono',monospace", color: hols.length > 0 ? D.copper : D.tx5 }}>
                            {hols.length || "—"}
                          </td>,
                          <td key={yr + "w"} style={{ padding: "10px 8px", textAlign: "center", fontSize: 14, fontFamily: "'DM Mono',monospace", color: D.sage }}>
                            {wd}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                  <tr style={{ borderTop: "3px solid " + D.ln, background: D.slate + "06" }}>
                    <td style={{ position: "sticky", left: 0, zIndex: 2, padding: "12px 14px", fontWeight: 700, fontSize: 14, color: D.tx, background: D.slate + "0a", borderRight: "1px solid " + D.ln }}>
                      {t("ANNUAL TOTAL", "年度合計")}
                    </td>
                    {availYears.map(yr => [
                      <td key={yr + "th"} style={{ padding: "12px 8px", textAlign: "center", borderLeft: "2px solid " + D.ln, fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.copper }}>{getAnnualHolidays(compCountry, yr)}</td>,
                      <td key={yr + "tw"} style={{ padding: "12px 8px", textAlign: "center", fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.sage }}>{getAnnualWorkDays(compCountry, yr)}</td>,
                    ])}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card glow style={{ marginBottom: 14 }}>
            <div style={{ padding: "14px 16px" }}>
              <Tag color={D.copper}>{t("HOLIDAY DETAIL", "假日明細")} · {t(months[calMonth].e, months[calMonth].z)}</Tag>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(" + availYears.length + ",1fr)", gap: 12, marginTop: 10 }}>
                {availYears.map((yr) => {
                  const mHols = getHolidays(compCountry, calMonth, yr);
                  return (
                    <div key={yr} style={{ background: yr === calYear ? D.copper + "08" : D.lnF, borderRadius: 6, padding: "10px 12px", border: yr === calYear ? "1px solid " + D.copper + "25" : "1px solid transparent" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: D.tx, marginBottom: 8 }}>{yr} · {t(months[calMonth].e, months[calMonth].z)}</div>
                      {mHols.length === 0 ? (
                        <div style={{ fontSize: 13, color: D.tx4, padding: "8px 0" }}>{t("No holidays", "無假日")}</div>
                      ) : mHols.sort((a, b) => a.d - b.d).map((h, i) => {
                        const typeColor = h.t === "S" ? "#8a65a0" : h.t === "O" ? "#5a8a6a" : h.t === "B" ? D.slate : "#b06800";
                        const typeLabel = h.t === "S" ? (lang === "zh" ? "特別假" : "Special") : h.t === "O" ? (lang === "zh" ? "補假" : "Obs") : h.t === "B" ? (lang === "zh" ? "銀行假" : "Bank") : (lang === "zh" ? "法定" : "Reg");
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: i < mHols.length - 1 ? "1px solid " + D.lnF : "none" }}>
                            <span style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: typeColor, width: 28 }}>{h.d}{t("th", "日")}</span>
                            <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 2, background: typeColor + "15", color: typeColor, fontWeight: 600 }}>{typeLabel}</span>
                            <span style={{ fontSize: 13, color: D.tx2 }}>{lang === "zh" ? h.z : h.n}</span>
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
      {calView !== "yearcomp" && sel.length >= 2 && (
        <Card glow style={{ marginTop: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <Tag color={D.slate}>{t("CROSS-BORDER HOLIDAY OVERLAP", "跨境假日重疊分析")} · {t(months[calMonth].e, months[calMonth].z)}</Tag>
            <div style={{ marginTop: 10 }}>
              {(() => {
                const allDays = {};
                sel.forEach(c => {
                  getHolidays(c.id, calMonth).forEach(h => {
                    const key = h.d;
                    if (!allDays[key]) allDays[key] = [];
                    allDays[key].push({ cid: c.id, flag: c.flag, name: lang === "zh" ? h.z : h.n });
                  });
                });
                const sorted = Object.entries(allDays).sort((a, b) => Number(a[0]) - Number(b[0]));
                if (sorted.length === 0) return <div style={{ fontSize: 13, color: D.tx4, padding: "10px 0" }}>{t("No public holidays this month for selected countries", "所選國家本月無國定假日")}</div>;
                return sorted.map(([day, countries]) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid " + D.lnF }}>
                    <span style={{ fontSize: 16, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: countries.length >= 2 ? D.sage : D.tx3, width: 50 }}>
                      {t(months[calMonth].e.substring(0, 3), months[calMonth].z)} {day}
                    </span>
                    <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
                      {countries.map((c, i) => (
                        <span key={i} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: countries.length >= 2 ? D.sage + "0c" : D.slate + "08", color: countries.length >= 2 ? D.sage : D.tx2 }}>
                          {c.flag} {c.name}
                        </span>
                      ))}
                    </div>
                    {countries.length >= 2 && <span style={{ fontSize: 11, color: D.sage, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{countries.length}{t(" countries off", " 國放假")}</span>}
                  </div>
                ));
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Global Ranking */}
      {calView !== "yearcomp" && (
        <Card glow style={{ marginTop: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <Tag>{t("ANNUAL HOLIDAY RANKING", "年度假日天數排名")}</Tag>
            <div style={{ marginTop: 10 }}>
              {ranked.map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 2px", borderBottom: i < ranked.length - 1 ? "1px solid " + D.lnF : "none", background: selC.includes(c.id) ? D.copper + "06" : "transparent", borderRadius: 4 }}>
                  <span style={{ fontSize: 13, color: i < 3 ? D.copper : D.tx5, fontFamily: "'DM Mono',monospace", width: 22, textAlign: "right", fontWeight: 500 }}>{i + 1}</span>
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  <span style={{ fontSize: 14, color: D.tx, fontWeight: 500, flex: 1 }}>{t(c.n, c.zh)}</span>
                  <span style={{ fontSize: 18, fontFamily: "'DM Mono',monospace", fontWeight: 500, color: D.copper }}>{c.labor.ph}</span>
                  <div style={{ width: 50 }}><HBar value={c.labor.ph} max={20} color={selC.includes(c.id) ? D.copper : D.tx5} /></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, background: D.lnF, fontSize: 12, color: D.tx4, lineHeight: 1.7 }}>
        {t(
          "⚠️ 2025 & 2026: Based on official government gazette. 2027: Estimated — fixed-date holidays are confirmed; lunar calendar holidays (CNY, Chuseok, Dragon Boat, Mid-Autumn) are astronomically calculated; Islamic holidays (Eid al-Fitr, Eid al-Adha, Hijri New Year, Mawlid) are estimates subject to moon sighting and may shift ±1-2 days. Substitute holiday (補假) arrangements for 2027 are not yet announced.",
          "⚠️ 2025、2026：依據各國政府公報。2027：預估日期——固定日期節日已確認；農曆節日（春節、端午、中秋）依天文推算；伊斯蘭節日（開齋節、宰牲節、伊斯蘭新年、聖紀節）為預估，須依月亮觀測確認，可能偏差1-2天。2027年各國補假安排尚未公告。"
        )}
      </div>
    </div>
  );
}
