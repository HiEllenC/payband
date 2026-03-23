// ═══════ SALARY UTILITIES ═══════
import { FB, CM, SM } from "../data/jobs.js";

// gS: Get Salary (in USD K)
// cid = country id, fam = family id, sub = subfunction id, track = "ic"|"mgmt", lvl = level index (0-4)
export function gS(cid, fam, sub, track, lvl) {
  const base = (FB[fam]?.[track]?.[lvl]) || 0;
  const cm = CM[cid] || 1;
  const sm = SM[sub] || 1;
  return Math.round(base * cm * sm);
}

// fmt: Format salary value
// v = value (USD K), usdt = show USDT symbol
export function fmt(v, usdt) {
  return usdt ? `₮${v}K` : `$${v}K`;
}
