// functions/api/analytics.js
// Cloudflare Pages Function — secure server-side bridge to the GA4 Data API.
//
// Required environment variables (set in Cloudflare Pages → Settings → Environment variables):
//   GA_CLIENT_EMAIL   - the "client_email" field from your GCP service-account JSON key
//   GA_PRIVATE_KEY_B64- the "private_key" field from that JSON, base64-encoded (see setup guide)
//   GA_PROPERTY_ID    - your GA4 numeric property ID, e.g. "properties/123456789"
//
// Endpoints exposed to the frontend:
//   GET /api/analytics?action=realtime
//   GET /api/analytics?action=summary&days=7|28|90

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA_HOST = "https://analyticsdata.googleapis.com/v1beta";

// ---- tiny in-memory token cache (best-effort; survives only within a warm isolate) ----
let cachedToken = { value: null, expiresAt: 0 };

function base64UrlEncode(bytes) {
  let str = typeof bytes === "string" ? bytes : btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToBase64Url(str) {
  return base64UrlEncode(btoa(unescape(encodeURIComponent(str))));
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importPrivateKey(pem) {
  const keyData = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken.value && cachedToken.expiresAt - 60 > now) {
    return cachedToken.value;
  }

  const privatePem = atob(env.GA_PRIVATE_KEY_B64);
  const key = await importPrivateKey(privatePem);

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: env.GA_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${strToBase64Url(JSON.stringify(header))}.${strToBase64Url(JSON.stringify(claims))}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in };
  return cachedToken.value;
}

async function gaFetch(env, path, body) {
  const token = await getAccessToken(env);
  const resp = await fetch(`${GA_HOST}/${env.GA_PROPERTY_ID}:${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GA4 API error (${path}): ${resp.status} ${text}`);
  }
  return resp.json();
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function rangeFor(days) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const prevEnd = new Date(start);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (days - 1));

  return {
    current: { startDate: fmtDate(start), endDate: fmtDate(end) },
    previous: { startDate: fmtDate(prevStart), endDate: fmtDate(prevEnd) },
  };
}

function metricVal(row, idx) {
  return Number(row?.metricValues?.[idx]?.value ?? 0);
}

async function handleRealtime(env) {
  const data = await gaFetch(env, "runRealtimeReport", {
    metrics: [{ name: "activeUsers" }],
  });
  const activeUsers = metricVal(data.rows?.[0], 0);
  return { activeUsers };
}

async function handleSummary(env, days) {
  const { current, previous } = rangeFor(days);

  const [totals, trend, devices, pages, sources, countries] = await Promise.all([
    gaFetch(env, "runReport", {
      dateRanges: [
        { ...current, name: "current" },
        { ...previous, name: "previous" },
      ],
      dimensions: [{ name: "dateRange" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
      ],
    }),
    gaFetch(env, "runReport", {
      dateRanges: [current],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    gaFetch(env, "runReport", {
      dateRanges: [current],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
    }),
    gaFetch(env, "runReport", {
      dateRanges: [current],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 6,
    }),
    gaFetch(env, "runReport", {
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    gaFetch(env, "runReport", {
      dateRanges: [current],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 4,
    }),
  ]);

  // ---- totals + deltas ----
  const rowsByRange = {};
  for (const row of totals.rows || []) {
    rowsByRange[row.dimensionValues[0].value] = row;
  }
  const curRow = rowsByRange.current;
  const prevRow = rowsByRange.previous;
  const pct = (curV, prevV) => (prevV > 0 ? ((curV - prevV) / prevV) * 100 : 0);

  const metricsOut = {};
  ["totalUsers", "sessions", "screenPageViews", "engagementRate"].forEach((name, i) => {
    const curV = metricVal(curRow, i);
    const prevV = metricVal(prevRow, i);
    metricsOut[name] = { value: curV, deltaPct: pct(curV, prevV) };
  });

  // ---- trend ----
  const trendOut = (trend.rows || []).map((r) => ({
    date: r.dimensionValues[0].value, // YYYYMMDD
    users: metricVal(r, 0),
    sessions: metricVal(r, 1),
  }));

  // ---- devices ----
  const deviceOut = {};
  for (const r of devices.rows || []) {
    deviceOut[r.dimensionValues[0].value] = metricVal(r, 0);
  }

  // ---- top pages ----
  const pagesOut = (pages.rows || []).map((r) => ({
    page: r.dimensionValues[0].value,
    views: metricVal(r, 0),
  }));

  // ---- traffic sources ----
  const totalSessions = (sources.rows || []).reduce((s, r) => s + metricVal(r, 0), 0) || 1;
  const sourcesOut = (sources.rows || []).map((r) => ({
    channel: r.dimensionValues[0].value,
    pct: Math.round((metricVal(r, 0) / totalSessions) * 1000) / 10,
  }));

  // ---- countries ----
  const totalCountryUsers = (countries.rows || []).reduce((s, r) => s + metricVal(r, 0), 0) || 1;
  const countriesOut = (countries.rows || []).map((r) => ({
    country: r.dimensionValues[0].value,
    pct: Math.round((metricVal(r, 0) / totalCountryUsers) * 1000) / 10,
  }));

  return {
    metrics: metricsOut,
    trend: trendOut,
    devices: deviceOut,
    pages: pagesOut,
    sources: sourcesOut,
    countries: countriesOut,
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "summary";

  try {
    if (!env.GA_CLIENT_EMAIL || !env.GA_PRIVATE_KEY_B64 || !env.GA_PROPERTY_ID) {
      return new Response(
        JSON.stringify({ error: "Backend not configured. Set GA_CLIENT_EMAIL, GA_PRIVATE_KEY_B64, GA_PROPERTY_ID." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let payload;
    if (action === "realtime") {
      payload = await handleRealtime(env);
    } else {
      const days = Number(url.searchParams.get("days") || 7);
      payload = await handleSummary(env, days);
    }

    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
