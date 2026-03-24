/**
 * Labor Law Extractor
 * Fetches official government pages → Claude API → structured JSON
 *
 * Usage:
 *   node scripts/labor-sync/extract.js [country_id]
 *   node scripts/labor-sync/extract.js sg
 *   node scripts/labor-sync/extract.js          ← runs all Tier 1
 *
 * Requires:
 *   ANTHROPIC_API_KEY env var
 *   npm install @anthropic-ai/sdk node-fetch
 */

import Anthropic from "@anthropic-ai/sdk";
import { SOURCES } from "./sources.js";
import { existingData } from "./existing-data.js";
import { diffLaborData, formatDiffReport } from "./diff.js";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── FETCH PAGE CONTENT ──────────────────────────────────────────────────────
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LaborLawBot/1.0; research)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // Strip HTML tags, collapse whitespace — keep text content only
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000); // Cap at 12k chars per page
  } catch (e) {
    console.warn(`  ⚠ Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

// ─── CLAUDE EXTRACTION PROMPT ────────────────────────────────────────────────
const SCHEMA = `{
  "ph":      number,       // public holidays per year
  "al":      string,       // annual leave entitlement (English)
  "alZ":     string,       // annual leave (Traditional Chinese)
  "ad":      number,       // minimum annual leave days
  "mat":     string,       // maternity leave (English)
  "matZ":    string,       // maternity leave (Traditional Chinese)
  "pat":     string,       // paternity leave (English)
  "patZ":    string,       // paternity leave (Traditional Chinese)
  "sev":     string,       // severance pay formula (English)
  "sevZ":    string,       // severance pay formula (Traditional Chinese)
  "mar":     string,       // marriage leave (English)
  "marZ":    string,       // marriage leave (Traditional Chinese)
  "sick":    string,       // sick leave (English)
  "sickZ":   string,       // sick leave (Traditional Chinese)
  "notice":  string,       // notice period (English)
  "noticeZ": string,       // notice period (Traditional Chinese)
  "th13":    string,       // 13th month pay (English)
  "th13Z":   string,       // 13th month pay (Traditional Chinese)
  "prob":    string,       // probation period (English)
  "probZ":   string,       // probation period (Traditional Chinese)
  "bvt":     string,       // bereavement leave (English)
  "bvtZ":    string,       // bereavement leave (Traditional Chinese)
  "wkhr":    string,       // weekly work hours
  "ot":      string,       // overtime premium (English)
  "otZ":     string,       // overtime premium (Traditional Chinese)
  "minw":    string,       // minimum wage (English)
  "minwZ":   string,       // minimum wage (Traditional Chinese)
  "erSS":    string,       // employer social security rate (English)
  "erSSZ":   string,       // employer social security rate (Traditional Chinese)
  "eeSS":    string,       // employee social security rate (English)
  "eeSSZ":   string,       // employee social security rate (Traditional Chinese)
  "pen":     string,       // pension system (English)
  "penZ":    string,       // pension system (Traditional Chinese)
  "term":    string,       // termination rules (English)
  "termZ":   string,       // termination rules (Traditional Chinese)
  "unfair":  string,       // unfair dismissal protection (English)
  "unfairZ": string,       // unfair dismissal protection (Traditional Chinese)
  "_confidence": number,   // 0.0-1.0 overall extraction confidence
  "_sources": string[],    // which URLs contained which data
  "_notes": string         // anything ambiguous or worth flagging
}`;

async function extractWithClaude(country, pageTexts) {
  const combined = pageTexts
    .filter(Boolean)
    .map((t, i) => `--- Source ${i + 1} ---\n${t}`)
    .join("\n\n");

  const prompt = `You are an expert labor law analyst specializing in ${country.name} employment regulations.

Extract the following labor law data from the official government source content below.
Return ONLY a valid JSON object matching the schema exactly.
For fields you cannot find, use null.
Keep values concise (under 40 chars for string fields).
For Traditional Chinese fields (suffix Z), translate accurately — use 繁體中文.
Set _confidence to your overall confidence (0.0–1.0) that this data is accurate and current.

SCHEMA:
${SCHEMA}

OFFICIAL SOURCE CONTENT:
${combined}

Return only the JSON object, no markdown fences.`;

  const msg = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from response if it included extra text
    const match = text.match(/\{[\s\S]+\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Claude returned non-JSON response");
  }
}

// ─── PROCESS ONE COUNTRY ─────────────────────────────────────────────────────
async function processCountry(source) {
  console.log(`\n🔍 Processing ${source.name} (${source.id})...`);

  const pageTexts = [];
  for (const url of source.urls) {
    console.log(`  Fetching: ${url}`);
    const text = await fetchPage(url);
    if (text) {
      console.log(`  ✓ ${text.length} chars`);
      pageTexts.push(text);
    }
  }

  if (pageTexts.length === 0) {
    console.log(`  ✗ No content fetched for ${source.name}`);
    return null;
  }

  console.log(`  Sending to Claude (${pageTexts.length} pages)...`);
  const extracted = await extractWithClaude(source, pageTexts);

  console.log(`  ✓ Confidence: ${(extracted._confidence * 100).toFixed(0)}%`);

  // Compare with existing data
  const existing = existingData[source.id];
  if (existing) {
    const diff = diffLaborData(existing, extracted, source.id);
    if (diff.length > 0) {
      console.log(`  📝 ${diff.length} field(s) changed`);
      extracted._diff = diff;
    } else {
      console.log(`  ✓ No changes detected`);
    }
  }

  return { id: source.id, name: source.name, data: extracted };
}

// ─── SAVE RESULTS ────────────────────────────────────────────────────────────
function saveResults(results) {
  const outDir = path.resolve("scripts/labor-sync/output");
  fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 10);

  // Save full JSON
  const jsonPath = path.join(outDir, `labor-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved: ${jsonPath}`);

  // Save diff report
  const report = formatDiffReport(results, timestamp);
  const reportPath = path.join(outDir, `diff-${timestamp}.md`);
  fs.writeFileSync(reportPath, report);
  console.log(`📋 Report: ${reportPath}`);

  // Print summary
  const withChanges = results.filter(r => r?.data?._diff?.length > 0);
  const highConf = results.filter(r => (r?.data?._confidence ?? 0) >= 0.8);

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done. ${results.filter(Boolean).length}/${results.length} countries processed`);
  console.log(`🔵 High confidence (≥80%): ${highConf.length}`);
  console.log(`🟡 Changes detected: ${withChanges.length}`);
  if (withChanges.length > 0) {
    console.log(`\nCountries with changes:`);
    withChanges.forEach(r => {
      console.log(`  • ${r.name}: ${r.data._diff.length} fields`);
      r.data._diff.forEach(d =>
        console.log(`    ${d.field}: "${d.old}" → "${d.new}"`)
      );
    });
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  const targetId = process.argv[2];
  let targets;

  if (targetId) {
    targets = SOURCES.filter(s => s.id === targetId);
    if (targets.length === 0) {
      console.error(`❌ Unknown country: ${targetId}`);
      process.exit(1);
    }
  } else {
    // Default: run Tier 1 (English sites, higher confidence)
    targets = SOURCES.filter(s => s.tier === 1);
    console.log(`Running Tier 1 countries: ${targets.map(s => s.id).join(", ")}`);
  }

  const results = [];
  for (const source of targets) {
    const result = await processCountry(source);
    results.push(result);
    // Rate limit — be polite to government servers
    await new Promise(r => setTimeout(r, 2000));
  }

  saveResults(results.filter(Boolean));
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
