import { useState, useMemo } from "react";
import { COUNTRIES } from "../data/countries.js";

const FONT = "'DM Mono','Noto Sans TC',monospace";
const W = 900, H = 440;

// Plate Carrée projection: [lon, lat] → "x,y" string for SVG path
const xy = (lon, lat) =>
  `${((lon + 180) / 360 * W).toFixed(1)},${((90 - lat) / 180 * H).toFixed(1)}`;
const makePath = (coords) =>
  "M" + coords.map(([lo, la]) => xy(lo, la)).join("L") + "Z";

// ── Continent outlines from real geographic coordinates ──────────────────────
// Each array is [lon, lat] pairs tracing the coastline clockwise
const LANDMASSES = [
  // North America
  [[-168,71],[-161,61],[-141,60],[-131,58],[-126,50],[-124,37],[-118,34],
   [-110,24],[-84,10],[-77,8],[-80,10],[-87,16],[-90,21],[-87,22],[-80,26],
   [-80,32],[-75,35],[-75,47],[-60,47],[-54,47],[-57,51],[-66,63],[-65,73],
   [-79,73],[-95,73],[-120,72],[-142,70],[-157,62]],
  // South America
  [[-78,12],[-60,11],[-52,4],[-35,-5],[-35,-8],[-48,-28],[-52,-33],
   [-58,-52],[-68,-54],[-71,-56],[-75,-52],[-77,-40],[-77,-28],[-78,-2]],
  // Greenland
  [[-55,83],[-17,77],[-12,65],[-45,60],[-57,61],[-68,76]],
  // Iceland
  [[-14,63],[-22,66],[-24,65],[-22,64],[-15,63]],
  // British Isles
  [[-5,50],[-3,58],[2,51],[-3,51]],
  // Europe + Scandinavia
  [[-9,37],[-9,44],[3,47],[10,57],[5,58],[6,62],[15,69],[18,70],[28,71],
   [32,65],[40,55],[40,46],[28,37],[23,37],[14,38],[8,44],[-1,43]],
  // Russia + Central Asia (simplified)
  [[38,50],[38,68],[70,73],[100,73],[140,73],[163,66],[163,50],
   [140,45],[100,45],[70,45]],
  // Africa
  [[-6,36],[10,37],[15,33],[34,31],[43,12],[40,-10],[35,-26],[32,-30],
   [20,-34],[17,-34],[16,-29],[12,-17],[10,-6],[2,4],[-2,5],[-17,14],[-13,28]],
  // Arabian Peninsula
  [[35,29],[48,30],[57,25],[58,18],[50,12],[43,12],[37,22]],
  // South Asia (India + Pakistan)
  [[62,22],[72,20],[77,8],[80,9],[85,14],[92,22],[90,26],[80,28],[74,34],[62,26]],
  // East / Central Asia (China + Mongolia)
  [[73,38],[87,49],[120,50],[140,45],[134,35],[122,30],[120,22],[110,18],
   [105,21],[100,22],[80,28],[74,34]],
  // Japan (Honshu)
  [[131,31],[130,34],[135,35],[140,37],[141,40],[145,44],[143,44],[141,41],[135,34],[133,33]],
  // SE Asia mainland + Malay Peninsula
  [[98,25],[110,21],[119,22],[122,22],[115,14],[104,1],[98,3],[98,10],[100,13]],
  // SE Asia islands (Borneo + Sumatra simplified)
  [[100,1],[106,1],[114,2],[118,4],[120,5],[117,1],[115,-4],[113,-8],
   [106,-6],[105,-2],[103,-1]],
  // Philippines (simplified)
  [[118,18],[122,18],[126,8],[124,6],[120,10],[117,12]],
  // Australia
  [[114,-22],[114,-34],[122,-34],[130,-32],[140,-35],[148,-38],
   [152,-24],[148,-20],[136,-12],[130,-12],[122,-20]],
  // New Zealand
  [[171,-34],[170,-40],[172,-44],[173,-41],[173,-37]],
  // Madagascar
  [[44,-26],[50,-25],[50,-16],[44,-12],[44,-16]],
];

// Pre-compute paths at module load
const LAND_PATHS = LANDMASSES.map(makePath);

// ── Design tokens ────────────────────────────────────────────────────────────
const D = {
  // Static map (hero) — warm light palette matching page
  ocean:      "#e8e5df",          // warm beige (matches page bg)
  land:       "#d0cbc3",          // warm tan landmass
  landStroke: "#c4bfb7",          // subtle land border
  dot:        "#546378",          // slate (site primary)
  dotLabel:   "rgba(84,99,120,0.65)",
  dotPulse:   "#5f7a61",          // sage accent for pulse dots
  grid:       "rgba(84,99,120,0.06)",
  // Interactive map (other modules) — dark palette
  selected:   "#7ab8d9",
  selRing:    "rgba(122,184,217,0.22)",
  hov:        "#d4956a",
  hovRing:    "rgba(212,149,106,0.20)",
  neutral:    "#4a6478",
  dotStroke:  "rgba(255,255,255,0.18)",
  gridDark:   "rgba(255,255,255,0.07)",
  ocean_dark: "#18263a",
  land_dark:  "#2c3e52",
  landStroke_dark: "#38516a",
  hudText:    "rgba(180,200,218,0.55)",
  hudSub:     "rgba(140,165,188,0.35)",
  pillBg:     "rgba(122,184,217,0.12)",
  pillBdr:    "rgba(122,184,217,0.25)",
  pillText:   "#7ab8d9",
  pillX:      "rgba(122,184,217,0.45)",
  bottom:     "rgba(15,22,33,0.92)",
};

// ── Country capital positions [lat, lon] ─────────────────────────────────────
const CAPS = {
  us: [-77.0,  38.9], gb: [-0.1,  51.5], ch: [ 7.4,  46.9],
  mt: [14.5,  35.9], ae: [54.4,  24.5], sg: [103.8,  1.3],
  hk: [114.2,  22.3], tw: [121.5, 25.0], jp: [139.7, 35.7],
  kr: [127.0,  37.6], ph: [121.0, 14.6], my: [101.7,  3.1],
};

// Minor nudges for East Asia cluster legibility
const NUDGE = {
  hk: [-10, 5], tw: [8, -5], ph: [-5, 10],
  sg: [4, 10], my: [-10, 1], kr: [-5, -6],
};

// Which side the label appears on
const ANCHOR = {
  us:"left", gb:"left",  ch:"right", mt:"right",
  ae:"right",sg:"right", hk:"left",  tw:"right",
  jp:"right",kr:"left",  ph:"left",  my:"left",
};

const CODE = {
  us:"US",gb:"UK",ch:"CH",mt:"MT",ae:"AE",sg:"SG",
  hk:"HK",tw:"TW",jp:"JP",kr:"KR",ph:"PH",my:"MY",
};

function markerPos(id) {
  const [lon, lat] = CAPS[id];
  const [dx, dy] = NUDGE[id] ?? [0, 0];
  return [
    (lon + 180) / 360 * W + dx,
    (90 - lat) / 180 * H + dy,
  ];
}

// All country pairs for connection lines
const IDS = Object.keys(CAPS);
const CONNECTIONS = [];
for (let i = 0; i < IDS.length; i++)
  for (let j = i + 1; j < IDS.length; j++)
    CONNECTIONS.push([IDS[i], IDS[j]]);

// ── Static decorative map (hero section) ─────────────────────────────────────
function WorldMapStatic() {
  // Pre-compute positions
  const pos = {};
  IDS.forEach(id => { pos[id] = markerPos(id); });

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid #c8c3bb",
      boxShadow: "0 2px 12px #c4bfb8",
      background: D.ocean,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        {/* Background */}
        <rect width={W} height={H} fill={D.ocean} />

        {/* Graticule */}
        <g stroke="#ccc8c0" strokeWidth="0.5">
          {[-60,-30,0,30,60].map(lat => {
            const y = (90 - lat) / 180 * H;
            return <line key={lat} x1="0" y1={y} x2={W} y2={y} />;
          })}
          {[-120,-60,0,60,120].map(lon => {
            const x = (lon + 180) / 360 * W;
            return <line key={lon} x1={x} y1="0" x2={x} y2={H} />;
          })}
        </g>

        {/* Landmasses */}
        {LAND_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill={D.land} stroke={D.landStroke}
            strokeWidth="0.6" strokeLinejoin="round" />
        ))}

        {/* Connection lines between all countries */}
        <g stroke="#a8a29a" strokeWidth="0.5">
          {CONNECTIONS.map(([a, b]) => {
            const [ax, ay] = pos[a];
            const [bx, by] = pos[b];
            return <line key={`${a}-${b}`} x1={ax} y1={ay} x2={bx} y2={by} />;
          })}
        </g>

        {/* Country dots */}
        {IDS.map(id => {
          const [cx, cy] = pos[id];
          return (
            <g key={id}>
              <circle cx={cx} cy={cy} r="5" fill={D.dot} stroke="#e8e5df" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Interactive map (used in other modules) ───────────────────────────────────
export default function WorldMap({ selected, onSelect, countries = COUNTRIES, t: tr, static: isStatic }) {
  const [hov, setHov] = useState(null);
  const [tip, setTip] = useState(null);

  const cMap = useMemo(() => Object.fromEntries(countries.map(c => [c.id, c])), [countries]);

  if (isStatic) return <WorldMapStatic />;

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(56,81,106,0.6)",
      boxShadow: "0 4px 32px rgba(0,0,0,0.28)",
      background: D.ocean_dark,
    }}>
      {/* ── SVG Map ── */}
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Ocean */}
          <rect width={W} height={H} fill={D.ocean_dark} />

          {/* Graticule */}
          <g stroke={D.gridDark} strokeWidth="0.5">
            {[-60,-30,0,30,60].map(lat => {
              const y = (90 - lat) / 180 * H;
              return <line key={lat} x1="0" y1={y} x2={W} y2={y} />;
            })}
            {[-120,-60,0,60,120].map(lon => {
              const x = (lon + 180) / 360 * W;
              return <line key={lon} x1={x} y1="0" x2={x} y2={H} />;
            })}
          </g>

          {/* Equator label */}
          <text x="6" y={(90 / 180) * H - 3}
            fontSize="7" fill="rgba(255,255,255,0.15)" fontFamily={FONT}>0°</text>

          {/* Landmasses */}
          {LAND_PATHS.map((d, i) => (
            <path key={i} d={d}
              fill={D.land_dark} stroke={D.landStroke_dark}
              strokeWidth="0.5" strokeLinejoin="round" />
          ))}

          {/* Country markers */}
          {Object.keys(CAPS).map(id => {
            const [cx, cy] = markerPos(id);
            const c = cMap[id];
            if (!c) return null;
            const sel  = selected.includes(id);
            const isH  = hov === id;
            const color = sel ? D.selected : isH ? D.hov : D.neutral;
            const anch  = ANCHOR[id] === "right";
            const lx    = anch ? cx + 11 : cx - 11;
            const label = CODE[id];

            return (
              <g key={id}
                onClick={() => onSelect(id)}
                onMouseEnter={() => { setHov(id); setTip({ id, cx, cy }); }}
                onMouseLeave={() => { setHov(null); setTip(null); }}
                style={{ cursor: "pointer" }}
              >
                {/* Glow ring */}
                {(sel || isH) && (
                  <circle cx={cx} cy={cy}
                    r={sel ? 13 : 10}
                    fill={sel ? D.selRing : D.hovRing}
                    stroke={sel ? "rgba(84,99,120,0.25)" : "rgba(150,113,74,0.2)"}
                    strokeWidth="1"
                  />
                )}
                {/* Dot */}
                <circle cx={cx} cy={cy}
                  r={sel ? 5.5 : isH ? 5 : 4}
                  fill={color}
                  stroke={D.dotStroke}
                  strokeWidth={sel ? 1.5 : 1}
                />
                {/* Code label */}
                <text
                  x={lx} y={cy + 4}
                  textAnchor={anch ? "start" : "end"}
                  fontSize={sel || isH ? "9.5" : "8.5"}
                  fontFamily={FONT}
                  fontWeight={sel ? "700" : isH ? "600" : "400"}
                  fill={sel ? D.selected : isH ? D.hov : "rgba(50,50,60,0.45)"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {tip && (() => {
            const c = cMap[tip.id];
            if (!c) return null;
            const sel = selected.includes(tip.id);
            const { cx, cy } = tip;
            const flipX = cx > W * 0.72;
            const flipY = cy < 70;
            const tx = flipX ? cx - 8 : cx + 8;
            const ty = flipY ? cy + 28 : cy - 28;
            const name = tr ? tr(c.n, c.zh) : c.n;
            const boxW = Math.max(name.length * 6.5 + 28, 80);
            const boxX = flipX ? tx - boxW : tx;
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect x={boxX} y={ty - 14} width={boxW} height={22}
                  rx="5" fill="rgba(38,44,58,0.90)" />
                <text
                  x={boxX + boxW / 2} y={ty + 2}
                  textAnchor="middle" fontSize="10.5" fontFamily={FONT} fill="#fff">
                  {name}{"  "}{sel ? "✓" : "+"}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Top HUD */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", pointerEvents: "none",
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2,
            color: D.hudText, fontFamily: FONT, textTransform: "uppercase" }}>
            {selected.length}/6 {tr ? tr("selected", "已選擇") : "selected"}
          </span>
          <span style={{ fontSize: 10, color: D.hudSub, fontFamily: FONT }}>
            {tr ? tr("Click to compare", "點選比較") : "Click to compare"}
          </span>
        </div>
      </div>

      {/* ── Selected tag pills ── */}
      {selected.length > 0 && (
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 12px",
          borderTop: `1px solid rgba(56,81,106,0.5)`,
          background: D.bottom,
        }}>
          {selected.map(id => {
            const c = cMap[id];
            if (!c) return null;
            return (
              <div key={id} onClick={() => onSelect(id)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "3px 9px 3px 8px", borderRadius: 20,
                background: D.pillBg,
                border: `1px solid ${D.pillBdr}`,
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <span style={{ fontSize: 11, fontWeight: 500,
                  color: D.pillText, fontFamily: FONT }}>
                  {tr ? tr(c.n, c.zh) : c.n}
                </span>
                <span style={{ fontSize: 11, color: D.pillX, marginLeft: 1 }}>×</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
