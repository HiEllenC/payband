// Netlify Function: proxy for Anthropic AI Daily News
// Keeps the API key server-side, away from the browser bundle.

// Simple in-process rate limit: max 10 calls per 60s window across all users.
// Not a hard guarantee (serverless = multiple instances), but adds friction.
const _calls = [];
function isRateLimited() {
  const now = Date.now();
  const window = 60_000;
  while (_calls.length && _calls[0] < now - window) _calls.shift();
  if (_calls.length >= 10) return true;
  _calls.push(now);
  return false;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (isRateLimited()) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  // Origin check: restrict to allowed origins in production
  const allowedOrigins = process.env.PAYBAND_ALLOWED_ORIGINS;
  if (allowedOrigins) {
    const origin = req.headers.get("origin") || "";
    const allowed = allowedOrigins.split(",").map(o => o.trim());
    if (!allowed.some(o => origin === o || origin.startsWith(o))) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json" },
      });
    }
  }

  const { prompt, lang } = body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
    return new Response(JSON.stringify({ error: "Invalid prompt" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream request failed" }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/ai-news" };
