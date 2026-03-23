// ═══════ SALARY UTILITIES ═══════
import { FB, CM, SM } from "../data/jobs.js";

// gS: Get Salary P50 (in USD K)
export function gS(cid, fam, sub, track, lvl) {
  const base = (FB[fam]?.[track]?.[lvl]) || 0;
  const cm = CM[cid] || 1;
  const sm = SM[sub] || 1;
  return Math.round(base * cm * sm);
}

// gBand: Get salary band {p25, p50, p75}
export function gBand(cid, fam, sub, track, lvl) {
  const p50 = gS(cid, fam, sub, track, lvl);
  return { p25: Math.round(p50 * 0.85), p50, p75: Math.round(p50 * 1.20) };
}

// compaRatio: actual / p50
export function compaRatio(actual, p50) {
  if (!p50) return null;
  return Math.round((actual / p50) * 100);
}

// fmt: Format salary value
// v = value (USD K), usdt = show USDT symbol
export function fmt(v, usdt) {
  return usdt ? `₮${v}K` : `$${v}K`;
}
