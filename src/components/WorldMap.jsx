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
  // North America — mainland
  [
    [-168,71],[-166,68],[-163,60],[-162,59],[-158,57],[-152,57],[-148,61],
    [-146,60],[-142,59],[-138,58],[-134,57],[-130,54],[-128,52],[-126,50],
    [-124,48],[-124,46],[-124,40],[-122,37],[-120,35],[-118,34],[-117,32],
    [-117,29],[-114,29],[-110,24],[-106,20],[-104,19],[-98,18],[-92,16],
    [-88,16],[-84,10],[-80,8],[-78,8],[-78,10],[-84,11],[-86,15],
    [-88,16],[-90,21],[-88,22],[-86,21],[-84,23],[-82,24],[-80,25],
    [-81,29],[-80,31],[-78,33],[-76,35],[-76,38],[-74,40],[-72,41],
    [-70,42],[-70,44],[-68,44],[-67,46],[-66,44],[-64,45],[-62,46],
    [-60,47],[-55,47],[-54,47],[-56,51],[-58,51],[-60,52],[-64,55],
    [-66,59],[-66,63],[-65,73],[-70,73],[-80,73],[-90,73],
    [-100,73],[-110,73],[-120,72],[-130,71],[-142,70],[-150,68],
    [-157,62],[-160,63],[-164,66],[-168,71],
  ],
  // Greenland
  [
    [-18,76],[-15,77],[-16,80],[-22,83],[-35,83],[-45,83],[-52,83],
    [-55,82],[-58,80],[-60,76],[-62,74],[-66,68],[-68,66],[-66,65],
    [-52,67],[-46,68],[-44,68],[-44,66],[-46,64],[-47,62],[-45,60],
    [-46,60],[-52,62],[-58,63],[-60,65],[-60,68],[-56,72],[-52,73],
    [-46,73],[-42,74],[-36,74],[-30,74],[-24,73],[-18,76],
  ],
  // Iceland
  [[-24,63],[-22,63],[-18,63],[-13,64],[-13,65],[-16,66],[-22,66],[-24,65],[-24,63]],
  // Great Britain
  [
    [-5,50],[-4,50],[-3,50],[-2,51],[-1,51],[0,51],[1,51],[1,52],
    [0,53],[-1,54],[-2,55],[-2,56],[-3,56],[-4,56],[-4,57],[-2,57],
    [-2,58],[-4,58],[-5,58],[-6,57],[-5,56],[-3,55],[-2,54],
    [-1,53],[0,52],[0,51],[-1,51],[-2,51],[-4,51],[-5,50],
  ],
  // Ireland
  [[-6,51],[-8,51],[-10,52],[-10,53],[-8,55],[-6,55],[-6,53],[-8,53],[-6,52],[-6,51]],
  // Europe mainland (Iberian + France + Benelux)
  [
    [-9,37],[-9,38],[-9,39],[-9,41],[-8,44],[-4,44],[-2,44],
    [0,44],[2,43],[3,43],[4,43],[5,43],[6,43],[8,44],
    [10,44],[12,44],[13,44],[14,44],[15,38],[16,38],[16,40],
    [18,40],[20,40],[22,39],[24,37],[24,38],[25,38],[26,40],
    [26,42],[28,42],[28,44],[26,46],[24,47],[22,47],[20,48],
    [18,50],[16,50],[14,51],[12,54],[10,55],[8,56],[6,58],
    [5,58],[5,62],[6,62],[8,63],[10,63],[12,65],[14,68],
    [16,69],[18,70],[20,70],[25,71],[28,71],[30,70],[28,68],
    [26,65],[26,62],[28,60],[28,56],[24,57],[20,57],[18,57],
    [16,57],[14,56],[12,56],[10,55],[8,55],[6,54],[5,54],
    [4,52],[3,51],[2,51],[1,51],[0,50],[-1,48],[-2,47],
    [-2,44],[-4,44],[-4,43],[-2,43],[0,43],[3,43],
    [5,44],[-2,44],[-4,44],[-9,44],[-9,41],[-9,38],[-9,37],
  ],
  // Iberian Peninsula detail
  [
    [-9,37],[-7,37],[-5,36],[-2,36],[-2,37],[0,38],[0,40],
    [-1,41],[-2,42],[-4,44],[-8,44],[-9,43],[-9,41],[-9,39],[-9,37],
  ],
  // Italian Peninsula
  [
    [7,44],[8,44],[10,44],[12,44],[14,44],[16,41],[16,38],[15,37],
    [14,37],[13,37],[16,38],[16,41],[14,42],[12,44],[10,44],[8,44],[7,44],
  ],
  // Sicily
  [[12,37],[14,38],[15,37],[15,38],[13,38],[12,37]],
  // Russia + Siberia
  [
    [28,56],[32,56],[36,56],[38,56],[38,50],[40,46],[44,46],
    [48,46],[50,44],[54,42],[58,42],[60,42],[64,42],[68,40],
    [70,42],[70,44],[72,46],[76,46],[80,46],[84,50],[88,50],
    [92,52],[96,54],[100,54],[104,52],[108,50],[112,52],[116,52],
    [120,52],[124,52],[128,50],[132,46],[134,46],[136,46],[140,46],
    [142,48],[144,50],[148,52],[150,54],[156,60],[160,60],[163,60],
    [166,66],[166,68],[163,68],[160,68],[155,68],[148,72],[140,73],
    [130,73],[120,73],[110,73],[100,73],[90,73],[80,73],[70,73],
    [60,73],[55,73],[50,73],[44,68],[40,68],[36,68],[32,65],
    [30,62],[28,60],[28,56],
  ],
  // Africa
  [
    [-6,36],[-4,36],[-2,35],[0,35],[4,37],[8,37],[10,37],
    [12,37],[14,36],[16,34],[20,32],[24,31],[28,30],[30,30],
    [32,31],[34,30],[36,26],[38,22],[40,20],[42,16],[44,12],
    [46,12],[48,12],[50,12],[52,12],[54,12],[52,14],[50,16],
    [44,12],[42,12],[42,10],[40,14],[38,12],[38,8],[40,4],
    [42,2],[42,0],[40,-2],[40,-8],[38,-10],[36,-14],[34,-18],
    [34,-22],[32,-26],[32,-30],[30,-32],[28,-33],[26,-34],
    [22,-34],[20,-34],[18,-34],[17,-32],[17,-28],[16,-24],
    [14,-18],[13,-12],[12,-6],[10,-2],[8,4],[6,4],[4,5],
    [2,6],[0,5],[-2,5],[-4,6],[-6,5],[-8,5],[-10,6],
    [-12,6],[-14,10],[-16,12],[-17,14],[-16,18],[-16,22],
    [-14,26],[-13,28],[-8,34],[-6,36],
  ],
  // Arabian Peninsula
  [
    [34,30],[36,26],[38,22],[40,20],[42,16],[44,12],[46,14],
    [48,18],[50,20],[52,22],[54,24],[56,24],[58,22],[58,18],
    [56,16],[52,14],[50,16],[48,18],[44,12],[42,16],[40,20],
    [38,22],[36,26],[34,30],
  ],
  // South Asia (Indian Subcontinent)
  [
    [60,24],[62,24],[66,24],[68,24],[70,22],[72,22],[72,20],
    [74,20],[76,20],[76,16],[78,12],[78,8],[80,8],[80,10],
    [80,14],[82,14],[82,10],[80,8],[78,8],[77,8],[78,10],
    [80,12],[82,14],[86,18],[88,22],[88,24],[90,24],[90,26],
    [88,26],[88,24],[86,22],[84,20],[82,18],[80,14],[78,16],
    [78,22],[76,24],[74,26],[72,28],[70,28],[68,28],[66,28],
    [64,30],[62,32],[64,34],[66,35],[68,36],[72,34],[74,34],
    [76,32],[78,32],[78,30],[76,28],[78,30],[80,30],[80,34],
    [76,34],[72,34],[68,36],[64,34],[62,30],[60,28],[60,24],
  ],
  // East/Central Asia (China + Mongolia)
  [
    [72,40],[74,40],[76,40],[78,36],[80,34],[80,32],[78,30],
    [78,32],[80,34],[84,40],[88,44],[92,50],[96,52],[100,52],
    [104,50],[108,50],[112,52],[116,50],[120,52],[122,52],
    [124,50],[126,46],[128,44],[130,42],[132,44],[134,44],
    [136,44],[138,38],[136,36],[132,34],[130,34],[128,36],
    [126,36],[124,32],[122,30],[120,28],[118,24],[116,22],
    [114,22],[112,20],[110,20],[108,18],[106,20],[104,20],
    [102,22],[100,22],[100,24],[98,24],[96,26],[94,28],
    [92,28],[90,26],[88,26],[88,28],[90,32],[88,34],[86,34],
    [84,38],[80,38],[78,38],[76,36],[74,36],[72,38],[72,40],
  ],
  // Korean Peninsula
  [
    [126,34],[126,36],[126,38],[128,38],[128,40],[130,40],
    [130,38],[128,36],[128,34],[126,34],
  ],
  // Hokkaido
  [
    [140,44],[141,43],[142,44],[143,44],[144,44],[145,44],
    [144,43],[142,43],[141,44],[140,44],
  ],
  // Honshu (Japan main)
  [
    [130,31],[131,31],[132,33],[133,33],[134,34],[135,34],
    [136,34],[136,35],[138,35],[138,36],[140,36],[140,37],
    [141,38],[141,40],[141,41],[141,42],[140,42],[140,40],
    [140,38],[140,36],[138,36],[136,35],[135,35],[135,34],
    [133,34],[132,33],[131,32],[130,31],
  ],
  // Kyushu
  [[129,31],[130,31],[131,32],[130,33],[129,33],[129,31]],
  // Taiwan
  [[120,22],[121,22],[122,24],[121,25],[120,25],[120,22]],
  // SE Asia mainland + Malay Peninsula
  [
    [98,25],[100,22],[102,20],[104,18],[104,16],[102,14],
    [102,12],[104,10],[104,8],[104,6],[104,4],[104,2],
    [103,2],[103,1],[104,1],[106,1],[106,-1],[104,-2],
    [104,1],[103,2],[103,4],[103,6],[103,8],[104,10],
    [102,12],[100,14],[100,18],[98,20],[98,22],[98,25],
  ],
  // Sumatra
  [
    [95,5],[96,4],[98,4],[100,2],[102,2],[104,0],[106,-2],
    [106,-4],[104,-4],[102,-4],[100,-2],[98,0],[96,2],[95,4],[95,5],
  ],
  // Java
  [
    [105,-6],[106,-6],[108,-6],[110,-7],[112,-7],[114,-8],
    [112,-8],[110,-8],[108,-7],[106,-7],[105,-6],
  ],
  // Borneo
  [
    [108,2],[110,2],[112,4],[114,4],[116,5],[118,4],[118,2],
    [118,0],[116,-2],[114,-4],[112,-4],[110,-2],[108,0],[108,2],
  ],
  // Philippines (Luzon + Mindanao simplified)
  [
    [118,16],[120,16],[122,16],[122,14],[124,12],[124,8],
    [122,6],[120,8],[118,10],[118,14],[118,16],
  ],
  // Australia
  [
    [114,-22],[114,-26],[114,-30],[116,-32],[118,-34],[122,-34],
    [124,-34],[126,-34],[128,-34],[130,-32],[132,-32],[134,-32],
    [136,-36],[138,-36],[140,-36],[142,-38],[144,-38],[146,-38],
    [148,-38],[150,-36],[152,-30],[152,-24],[150,-22],[148,-20],
    [146,-18],[144,-14],[140,-14],[136,-12],[134,-12],[132,-14],
    [130,-12],[128,-14],[126,-16],[124,-18],[122,-20],[120,-20],
    [118,-20],[116,-20],[114,-22],
  ],
  // New Zealand (North Island)
  [[172,-34],[174,-36],[176,-37],[178,-38],[176,-40],[174,-40],[172,-38],[172,-34]],
  // New Zealand (South Island)
  [[168,-44],[170,-44],[172,-44],[174,-44],[172,-46],[170,-46],[168,-44]],
  // Madagascar
  [
    [44,-12],[46,-14],[48,-16],[50,-18],[50,-22],[48,-24],
    [46,-24],[44,-22],[44,-18],[44,-14],[44,-12],
  ],
  // Cuba
  [[-74,20],[-76,22],[-82,22],[-84,22],[-82,20],[-78,20],[-74,20]],
  // Sri Lanka
  [[80,6],[81,7],[82,8],[81,9],[80,8],[80,6]],
];

// Pre-compute paths at module load
const LAND_PATHS = LANDMASSES.map(makePath);

// ── 12 Payband countries highlight shapes ────────────────────────────────────
const PAYBAND_HIGHLIGHTS = [
  // USA (lower 48)
  [[-124,49],[-96,49],[-68,47],[-70,43],[-76,35],[-80,32],[-82,29],
   [-88,30],[-91,29],[-97,26],[-116,32],[-124,37],[-124,49]],
  // United Kingdom
  [[-6,50],[-4,50],[-2,51],[1,51],[0,53],[-2,55],[-4,58],[-5,58],
   [-4,56],[-2,54],[-1,53],[0,52],[0,51],[-2,51],[-4,51],[-6,50]],
  // Switzerland (enlarged 4× for visibility)
  [[5,45],[11,45],[11,48],[5,48]],
  // UAE
  [[51,22],[55,24],[58,23],[56,20],[54,20],[52,21],[51,22]],
  // Taiwan
  [[120,22],[121,22],[122,24],[121,25],[120,25],[120,22]],
  // Japan — Honshu
  [[130,31],[133,33],[135,34],[138,35],[140,36],[141,40],[141,43],
   [140,42],[138,36],[136,35],[133,34],[131,32],[130,31]],
  // Japan — Hokkaido
  [[140,44],[142,44],[144,44],[145,44],[144,43],[142,43],[140,44]],
  // Japan — Kyushu
  [[129,31],[131,31],[132,32],[130,33],[129,33],[129,31]],
  // Korea
  [[126,34],[128,34],[130,36],[130,38],[128,40],[126,38],[126,34]],
  // Philippines (Luzon)
  [[118,14],[120,16],[122,16],[124,12],[122,8],[120,8],[118,10],[118,14]],
  // Malaysia — Peninsula
  [[100,6],[104,6],[104,2],[103,1],[100,4],[100,6]],
  // Malaysia — Borneo (Sabah/Sarawak)
  [[108,2],[114,4],[118,5],[117,2],[114,0],[110,1],[108,2]],
];

// Tiny countries shown as visible circles (lon, lat)
const PAYBAND_TINY = [
  [55.3, 25.3],   // UAE capital dot (supplement)
  [103.8, 1.3],   // Singapore
  [114.2, 22.3],  // Hong Kong
  [14.5, 35.9],   // Malta
];

// Country metadata for interactive hero map
const PAYBAND_COUNTRIES = [
  { id:"us", en:"United States", zh:"美國",    indices:[0] },
  { id:"gb", en:"United Kingdom", zh:"英國",   indices:[1] },
  { id:"ch", en:"Switzerland",   zh:"瑞士",    indices:[2] },
  { id:"ae", en:"UAE",           zh:"阿聯酋",   indices:[3] },
  { id:"tw", en:"Taiwan",        zh:"台灣",    indices:[4] },
  { id:"jp", en:"Japan",         zh:"日本",    indices:[5,6,7] },
  { id:"kr", en:"South Korea",   zh:"韓國",    indices:[8] },
  { id:"ph", en:"Philippines",   zh:"菲律賓",   indices:[9] },
  { id:"my", en:"Malaysia",      zh:"馬來西亞", indices:[10,11] },
];
// SG, HK, MT, CH are too small — shown as circles
const PAYBAND_CIRCLES = [
  { id:"sg", en:"Singapore", zh:"新加坡", lon:103.8, lat:1.3 },
  { id:"hk", en:"Hong Kong", zh:"香港",   lon:114.2, lat:22.3 },
  { id:"mt", en:"Malta",     zh:"馬爾他", lon:14.5,  lat:35.9 },
];

const HIGHLIGHT_PATHS = PAYBAND_HIGHLIGHTS.map(makePath);

// Label positions (lon, lat) for each of the 12 countries
const HERO_LABELS = {
  us: { lon: -98,   lat: 38,   code: "US" },
  gb: { lon:  -2,   lat: 53,   code: "UK" },
  ch: { lon:   8,   lat: 46.5, code: "CH" },
  ae: { lon:  54,   lat: 24,   code: "AE" },
  tw: { lon: 121,   lat: 23.5, code: "TW" },
  jp: { lon: 136,   lat: 36,   code: "JP" },
  kr: { lon: 128,   lat: 37,   code: "KR" },
  ph: { lon: 122,   lat: 12,   code: "PH" },
  my: { lon: 109,   lat:  3,   code: "MY" },
  sg: { lon: 106.5, lat:  1.3, code: "SG" },
  hk: { lon: 116.5, lat: 22.3, code: "HK" },
  mt: { lon:  16.5, lat: 35.9, code: "MT" },
};

// ── Design tokens ────────────────────────────────────────────────────────────
const D = {
  // Hero map — muted tones, blends with page bg #f4f6f8
  ocean:      "#edf2f7",   // barely different from page bg
  land:       "#d0d8e6",   // cool grey landmasses
  landStroke: "#c2cad8",   // subtle border
  pbDefault:  "#9ab4cc",   // 12 countries — soft blue-grey at rest
  pbHov:      "#5d84a8",   // 12 countries — medium blue on hover (not harsh)
  pbStroke:   "#82a0bc",   // border at rest
  pbHovStroke:"#4a6f92",   // border on hover
  label:      "#2d5a80",   // tooltip text
  dot:        "#1a56db",          // slate primary blue
  dotLabel:   "rgba(26,86,219,0.65)",
  dotPulse:   "#f59e0b",          // copper amber accent
  grid:       "rgba(26,86,219,0.06)",
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

const IDS = Object.keys(CAPS);

// ── Hero interactive map ──────────────────────────────────────────────────────
// Crop polar dead-zones: show lat 65°N → 50°S only
const HERO_TOP    = (90 - 72)  / 180 * H;   // y ≈  44
const HERO_BOTTOM = (90 - (-50)) / 180 * H; // y ≈ 344
const HERO_VH     = HERO_BOTTOM - HERO_TOP; // ≈ 283

export function WorldMapHero({ lang = "zh", fill = false }) {
  const [hov, setHov] = useState(null);

  const circleXY = (lon, lat) => [
    (lon + 180) / 360 * W,
    (90 - lat) / 180 * H,
  ];

  // Hover tooltip: find center of hovered country's shape(s)
  const tooltipPos = (id) => {
    const circ = PAYBAND_CIRCLES.find(c => c.id === id);
    if (circ) {
      const [cx, cy] = circleXY(circ.lon, circ.lat);
      return [cx, cy - 14];
    }
    const pc = PAYBAND_COUNTRIES.find(c => c.id === id);
    if (!pc) return [0, 0];
    const allCoords = pc.indices.flatMap(i => PAYBAND_HIGHLIGHTS[i]);
    const lons = allCoords.map(([lo]) => lo);
    const lats = allCoords.map(([, la]) => la);
    const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    return [(midLon + 180) / 360 * W, (90 - midLat) / 180 * H - 12];
  };

  return (
    <div style={fill ? { position: "absolute", inset: 0 } : { width: "100%" }}>
      <svg
        viewBox={`0 ${HERO_TOP} ${W} ${HERO_VH}`}
        preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
        style={fill ? { width: "100%", height: "100%", display: "block" } : { width: "100%", display: "block" }}
      >
        {/* Transparent ocean */}
        <rect x="0" y={HERO_TOP} width={W} height={HERO_VH} fill="transparent" />

        {/* Subtle graticule */}
        <g stroke="rgba(84,99,120,0.06)" strokeWidth="0.5">
          {[-30, 0, 30].map(lat => {
            const y = (90 - lat) / 180 * H;
            if (y < HERO_TOP || y > HERO_BOTTOM) return null;
            return <line key={lat} x1="0" y1={y} x2={W} y2={y} />;
          })}
          {[-120, -60, 0, 60, 120].map(lon => {
            const x = (lon + 180) / 360 * W;
            return <line key={lon} x1={x} y1={HERO_TOP} x2={x} y2={HERO_BOTTOM} />;
          })}
        </g>

        {/* All landmasses — muted grey */}
        {LAND_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill={D.land} stroke={D.landStroke}
            strokeWidth="0.5" strokeLinejoin="round" />
        ))}

        {/* 12 Payband countries — grouped, interactive */}
        {PAYBAND_COUNTRIES.map(c => {
          const isH = hov === c.id;
          return (
            <g key={c.id}
              onMouseEnter={() => setHov(c.id)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: "pointer" }}
            >
              {c.indices.map(i => (
                <path key={i} d={HIGHLIGHT_PATHS[i]}
                  fill={isH ? D.pbHov : D.pbDefault}
                  stroke={isH ? D.pbHovStroke : D.pbStroke}
                  strokeWidth="0.7" strokeLinejoin="round"
                  style={{ transition: "fill 0.15s ease, stroke 0.15s ease" }}
                />
              ))}
            </g>
          );
        })}

        {/* Tiny countries (SG, HK, MT) — interactive circles */}
        {PAYBAND_CIRCLES.map(c => {
          const isH = hov === c.id;
          const [cx, cy] = circleXY(c.lon, c.lat);
          return (
            <circle key={c.id}
              cx={cx} cy={cy}
              r={isH ? 6 : 5}
              fill={isH ? D.pbHov : D.pbDefault}
              stroke={isH ? D.pbHovStroke : D.pbStroke}
              strokeWidth="1"
              onMouseEnter={() => setHov(c.id)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
            />
          );
        })}

        {/* Country code labels — always visible, brighten on hover */}
        {Object.entries(HERO_LABELS).map(([id, { lon, lat, code }]) => {
          const isH = hov === id;
          const cx = (lon + 180) / 360 * W;
          const cy = (90 - lat) / 180 * H;
          return (
            <text key={`lbl-${id}`}
              x={cx} y={cy}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isH ? "10" : "8.5"}
              fontFamily={FONT} fontWeight={isH ? "700" : "600"}
              fill={isH ? "#fff" : "#6b8fad"}
              style={{ pointerEvents: "none", userSelect: "none", transition: "all 0.15s ease" }}
            >
              {code}
            </text>
          );
        })}

        {/* Hover label */}
        {hov && (() => {
          const all = [...PAYBAND_COUNTRIES, ...PAYBAND_CIRCLES];
          const country = all.find(c => c.id === hov);
          if (!country) return null;
          const name = lang === "zh" ? country.zh : country.en;
          const [lx, ly] = tooltipPos(hov);
          const boxW = name.length * 8 + 22;
          const bx = Math.min(Math.max(lx - boxW / 2, 4), W - boxW - 4);
          return (
            <g style={{ pointerEvents: "none" }}>
              <rect x={bx} y={ly - 15}
                width={boxW} height={22} rx="5" fill="rgba(26,86,219,0.82)" />
              <text
                x={lx} y={ly}
                textAnchor="middle" fontSize="10.5" fontFamily={FONT}
                fill="#fff" fontWeight="500"
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {name}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Static decorative map (hero section) ─────────────────────────────────────

function WorldMapStatic() {
  const pos = {};
  IDS.forEach(id => { pos[id] = markerPos(id); });

  return (
    <div style={{
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid rgba(26,86,219,0.12)",
      boxShadow: "0 2px 12px rgba(26,86,219,0.08)",
      background: D.ocean,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        {/* Ocean background */}
        <rect width={W} height={H} fill={D.ocean} />

        {/* Subtle graticule — only 3 parallels + equator */}
        <g stroke="rgba(84,99,120,0.07)" strokeWidth="0.5">
          {[-30, 0, 30].map(lat => {
            const y = (90 - lat) / 180 * H;
            return <line key={lat} x1="0" y1={y} x2={W} y2={y} />;
          })}
          {[-120, -60, 0, 60, 120].map(lon => {
            const x = (lon + 180) / 360 * W;
            return <line key={lon} x1={x} y1="0" x2={x} y2={H} />;
          })}
        </g>

        {/* All landmasses — neutral grey */}
        {LAND_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill={D.land} stroke={D.landStroke}
            strokeWidth="0.5" strokeLinejoin="round" />
        ))}

        {/* 12 Payband countries — primary blue highlight */}
        {HIGHLIGHT_PATHS.map((d, i) => (
          <path key={`h${i}`} d={d}
            fill={D.highlight} stroke={D.highlightStroke}
            strokeWidth="0.6" strokeLinejoin="round" opacity="0.85" />
        ))}

        {/* Tiny countries (SG, HK, MT) as visible circles */}
        {PAYBAND_TINY.map(([lon, lat], i) => {
          const cx = (lon + 180) / 360 * W;
          const cy = (90 - lat) / 180 * H;
          return <circle key={`t${i}`} cx={cx} cy={cy} r="5" fill={D.highlight} opacity="0.85" />;
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
