const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE = process.env.ANALYTICS_TABLE || "drift-analytics";
const PASSWORD = process.env.ANALYTICS_PASSWORD || "drift2026";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TTL_SECONDS = 90 * 24 * 60 * 60;

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || "GET";

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  if (method === "POST") {
    return handlePost(event);
  }

  return handleGet(event);
};

async function handlePost(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const required = ["sessionId", "pilotName", "difficulty", "score", "timeSurvived"];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null) {
      return json(400, { error: `missing field: ${k}` });
    }
  }

  const timestamp =
    typeof body.timestamp === "number" ? body.timestamp : Date.now();
  const ttl = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  const item = {
    sessionId: String(body.sessionId),
    timestamp,
    pilotName: String(body.pilotName || "unknown"),
    difficulty: String(body.difficulty),
    score: Number(body.score) || 0,
    timeSurvived: Number(body.timeSurvived) || 0,
    appVersion: body.appVersion ? String(body.appVersion) : undefined,
    orb: body.orb ? String(body.orb) : undefined,
    deathCause: body.deathCause ? String(body.deathCause) : "unknown",
    phaseReached: Number(body.phaseReached) || 1,
    planetsDestroyed: Number(body.planetsDestroyed) || 0,
    planetsPassed: Number(body.planetsPassed) || 0,
    powerupsUsed: Number(body.powerupsUsed) || 0,
    burstCount: Number(body.burstCount) || 0,
    longestStreak: Number(body.longestStreak) || 0,
    crystalsEarned: Number(body.crystalsEarned) || 0,
    ttl,
  };
  for (const k of Object.keys(item)) {
    if (item[k] === undefined) delete item[k];
  }

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));

  return json(200, { ok: true });
}

async function handleGet(event) {
  const supplied =
    event.queryStringParameters?.password ||
    (event.headers?.authorization || event.headers?.Authorization || "").replace(
      /^Bearer\s+/i,
      ""
    );

  if (supplied !== PASSWORD) {
    return {
      statusCode: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "text/html; charset=utf-8" },
      body: passwordFormHtml(),
    };
  }

  const items = await scanAll();
  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "text/html; charset=utf-8" },
    body: dashboardHtml(items),
  };
}

async function scanAll() {
  const items = [];
  let ExclusiveStartKey;
  // Pull up to 500 items (prompt: last 500). Scan is sufficient for a small
  // analytics table; we sort newest-first client-side after collecting.
  while (items.length < 500) {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        Limit: 200,
        ExclusiveStartKey,
      })
    );
    if (res.Items) items.push(...res.Items);
    ExclusiveStartKey = res.LastEvaluatedKey;
    if (!ExclusiveStartKey) break;
  }
  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return items.slice(0, 500);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function passwordFormHtml() {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Drift Analytics</title>
<style>
  body { background:#00000a; color:#cfefff; font-family:-apple-system,system-ui,sans-serif;
    display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
  form { background:#0a0a1a; padding:32px; border:1px solid #0ff3; border-radius:10px;
    box-shadow:0 0 24px #0ff2; }
  h1 { color:#6ff; margin:0 0 16px; font-size:20px; letter-spacing:2px; }
  input { background:#000; color:#cfefff; border:1px solid #0ff5; padding:10px;
    border-radius:6px; font-size:14px; width:240px; }
  button { background:#0ff; color:#001; border:0; padding:10px 20px; border-radius:6px;
    font-weight:600; margin-left:8px; cursor:pointer; }
</style></head>
<body>
<form method="GET">
  <h1>DRIFT ANALYTICS</h1>
  <input type="password" name="password" placeholder="password" autofocus />
  <button type="submit">Enter</button>
</form>
</body></html>`;
}

function percent(num, den) {
  if (!den) return "0%";
  return ((num / den) * 100).toFixed(1) + "%";
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dashboardHtml(items) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const last7 = items.filter((i) => (i.timestamp || 0) >= sevenDaysAgo);

  const totalRuns = last7.length;
  const avgScore = Math.round(avg(last7.map((i) => i.score || 0)));
  const avgTime = Math.round(avg(last7.map((i) => i.timeSurvived || 0)));

  // Per difficulty
  const byDiff = {};
  for (const it of items) {
    const d = it.difficulty || "UNKNOWN";
    if (!byDiff[d]) byDiff[d] = { runs: 0, scoreSum: 0, timeSum: 0 };
    byDiff[d].runs++;
    byDiff[d].scoreSum += it.score || 0;
    byDiff[d].timeSum += it.timeSurvived || 0;
  }

  // Death causes
  const deathCounts = {};
  for (const it of items) {
    const c = it.deathCause || "unknown";
    deathCounts[c] = (deathCounts[c] || 0) + 1;
  }
  const deathTotal = items.length;

  // Orb popularity
  const orbCounts = {};
  for (const it of items) {
    const o = it.orb || "cyan";
    orbCounts[o] = (orbCounts[o] || 0) + 1;
  }

  // Phase survival
  const phaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const it of items) {
    const p = Number(it.phaseReached) || 1;
    for (let ph = 1; ph <= p; ph++) phaseCounts[ph] = (phaseCounts[ph] || 0) + 1;
  }

  // Per pilot × difficulty — one bucket per (pilotName, difficulty) pair so
  // each pilot gets a row per difficulty they've played.
  const pilotDiff = {};
  for (const it of items) {
    const name = it.pilotName || "unknown";
    const difficulty = it.difficulty || "UNKNOWN";
    const key = name + "|" + difficulty;
    if (!pilotDiff[key]) {
      pilotDiff[key] = { name, difficulty, runs: 0, scoreSum: 0, timeSum: 0, best: 0, deaths: {}, items: [] };
    }
    const p = pilotDiff[key];
    p.runs++;
    p.scoreSum += it.score || 0;
    p.timeSum  += it.timeSurvived || 0;
    if ((it.score || 0) > p.best) p.best = it.score || 0;
    const dc = it.deathCause || "unknown";
    p.deaths[dc] = (p.deaths[dc] || 0) + 1;
    p.items.push(it);
  }
  // Each pilot's highest best-score across all difficulties — used as the
  // primary sort key so top players stay at the top and their own rows stay
  // grouped together.
  const pilotMaxBest = {};
  for (const k of Object.keys(pilotDiff)) {
    const p = pilotDiff[k];
    pilotMaxBest[p.name] = Math.max(pilotMaxBest[p.name] || 0, p.best);
  }
  const DIFF_ORDER = { NORMAL: 0, HARD: 1, EXTREME: 2 };
  const pilotRows = Object.values(pilotDiff)
    .map((p) => {
      const topDeath = Object.entries(p.deaths).sort((a, b) => b[1] - a[1])[0];
      return {
        name: p.name,
        difficulty: p.difficulty,
        runs: p.runs,
        avgScore: Math.round(p.scoreSum / p.runs),
        avgTime: p.timeSum / p.runs,
        best: p.best,
        topDeath: topDeath ? topDeath[0] : "—",
        items: p.items.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
      };
    })
    .sort((a, b) => {
      // Sort by the pilot's overall best (desc) so top players rank highest.
      const ab = pilotMaxBest[a.name] || 0;
      const bb = pilotMaxBest[b.name] || 0;
      if (bb !== ab) return bb - ab;
      // Same pilot: order difficulties NORMAL → HARD → EXTREME.
      if (a.name === b.name) {
        return (DIFF_ORDER[a.difficulty] ?? 99) - (DIFF_ORDER[b.difficulty] ?? 99);
      }
      // Different pilots tied on overall best: alphabetical by name.
      return a.name.localeCompare(b.name);
    });

  const deathRows = Object.entries(deathCounts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([c, n]) =>
        `<tr><td>${escapeHtml(c)}</td><td>${n}</td><td>${percent(n, deathTotal)}</td></tr>`
    )
    .join("");

  const orbRows = Object.entries(orbCounts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([o, n]) =>
        `<tr><td>${escapeHtml(o)}</td><td>${n}</td><td>${percent(n, deathTotal)}</td></tr>`
    )
    .join("");

  const diffRows = Object.entries(byDiff)
    .map(
      ([d, s]) =>
        `<tr><td>${escapeHtml(d)}</td><td>${s.runs}</td><td>${Math.round(
          s.scoreSum / s.runs
        )}</td><td>${fmtTime(s.timeSum / s.runs)}</td></tr>`
    )
    .join("");

  const phaseBars = [1, 2, 3, 4]
    .map((ph) => {
      const n = phaseCounts[ph] || 0;
      const pct = percent(n, deathTotal);
      const pctNum = deathTotal ? (n / deathTotal) * 100 : 0;
      return `<div class="phase-row">
        <div class="phase-label">Phase ${ph}</div>
        <div class="phase-bar"><div class="phase-fill" style="width:${pctNum.toFixed(
          1
        )}%"></div></div>
        <div class="phase-count">${n} (${pct})</div>
      </div>`;
    })
    .join("");

  const pilotsTable = pilotRows
    .map(
      (p, i) =>
        `<tr data-pilot-idx="${i}" class="pilot-row"><td>${escapeHtml(
          p.name
        )}</td><td>${escapeHtml(p.difficulty)}</td><td>${p.runs}</td><td>${
          p.avgScore
        }</td><td>${fmtTime(p.avgTime)}</td><td>${p.best}</td><td>${escapeHtml(p.topDeath)}</td></tr>`
    )
    .join("");

  const pilotDetails = pilotRows
    .map((p, i) => {
      const rows = p.items
        .slice(0, 50)
        .map((it) => {
          const dt = new Date(it.timestamp || 0).toISOString().replace("T", " ").slice(0, 19);
          return `<tr><td>${dt}</td><td>${escapeHtml(it.difficulty)}</td><td>${
            it.score || 0
          }</td><td>${fmtTime(it.timeSurvived)}</td><td>${escapeHtml(
            it.deathCause || "unknown"
          )}</td><td>${escapeHtml(it.orb || "")}</td><td>${
            it.phaseReached || 1
          }</td></tr>`;
        })
        .join("");
      return `<div class="pilot-detail" id="pilot-${i}" style="display:none">
        <h3>${escapeHtml(p.name)} · ${escapeHtml(p.difficulty)} &mdash; runs</h3>
        <table><thead><tr><th>Time</th><th>Difficulty</th><th>Score</th><th>Survived</th><th>Death</th><th>Orb</th><th>Phase</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </div>`;
    })
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Drift Analytics</title>
<meta http-equiv="refresh" content="60">
<style>
  body { background:#00000a; color:#cfefff; font-family:-apple-system,system-ui,sans-serif;
    margin:0; padding:24px; }
  h1 { color:#6ff; letter-spacing:4px; margin:0 0 8px; }
  .subtitle { color:#789; margin-bottom:24px; font-size:12px; }
  .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
  .stat { background:#0a0a1a; border:1px solid #0ff3; border-radius:10px; padding:16px; }
  .stat .label { color:#789; font-size:11px; text-transform:uppercase; letter-spacing:2px; }
  .stat .value { color:#6ff; font-size:28px; font-weight:600; margin-top:4px; }
  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
  .panel { background:#0a0a1a; border:1px solid #0ff3; border-radius:10px; padding:16px; }
  .panel h2 { color:#6ff; font-size:13px; letter-spacing:2px; margin:0 0 12px; text-transform:uppercase; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th, td { text-align:left; padding:6px 8px; border-bottom:1px solid #0ff2; }
  th { color:#789; text-transform:uppercase; letter-spacing:1px; font-size:10px; }
  .phase-row { display:grid; grid-template-columns:100px 1fr 120px; align-items:center;
    gap:12px; margin-bottom:8px; }
  .phase-bar { background:#000; border:1px solid #0ff3; border-radius:6px; height:14px; overflow:hidden; }
  .phase-fill { background:linear-gradient(90deg,#0ff,#6ff); height:100%; }
  .phase-count { color:#6ff; font-size:12px; }
  .pilot-row { cursor:pointer; }
  .pilot-row:hover { background:#0ff2; }
  .pilot-detail { background:#0a0a1a; border:1px solid #0ff3; border-radius:10px;
    padding:16px; margin-top:16px; }
  .pilot-detail h3 { color:#6ff; margin:0 0 12px; font-size:14px; letter-spacing:2px; }
  @media (max-width: 900px) {
    .stats-row, .grid { grid-template-columns:1fr; }
  }
</style></head>
<body>
<h1>DRIFT ANALYTICS</h1>
<div class="subtitle">Auto-refresh 60s · Last 500 runs · Last 7 days for overview</div>

<div class="stats-row">
  <div class="stat"><div class="label">Total Runs (7d)</div><div class="value">${totalRuns}</div></div>
  <div class="stat"><div class="label">Avg Score (7d)</div><div class="value">${avgScore}</div></div>
  <div class="stat"><div class="label">Avg Time (7d)</div><div class="value">${fmtTime(avgTime)}</div></div>
</div>

<div class="grid">
  <div class="panel"><h2>By Difficulty</h2>
    <table><thead><tr><th>Diff</th><th>Runs</th><th>Avg Score</th><th>Avg Time</th></tr></thead>
    <tbody>${diffRows || '<tr><td colspan="4">No data</td></tr>'}</tbody></table>
  </div>
  <div class="panel"><h2>Death Causes</h2>
    <table><thead><tr><th>Cause</th><th>Count</th><th>%</th></tr></thead>
    <tbody>${deathRows || '<tr><td colspan="3">No data</td></tr>'}</tbody></table>
  </div>
  <div class="panel"><h2>Orb Popularity</h2>
    <table><thead><tr><th>Orb</th><th>Count</th><th>%</th></tr></thead>
    <tbody>${orbRows || '<tr><td colspan="3">No data</td></tr>'}</tbody></table>
  </div>
</div>

<div class="panel"><h2>Phase Survival</h2>
${phaseBars}
</div>

<div class="panel" style="margin-top:16px"><h2>Pilots</h2>
<table><thead><tr><th>Pilot</th><th>Difficulty</th><th>Runs</th><th>Avg Score</th><th>Avg Time</th><th>Best Score</th><th>Most Dies By</th></tr></thead>
<tbody>${pilotsTable || '<tr><td colspan="7">No data</td></tr>'}</tbody></table>
</div>

${pilotDetails}

<script>
  document.querySelectorAll('.pilot-row').forEach(row => {
    row.addEventListener('click', () => {
      const idx = row.getAttribute('data-pilot-idx');
      document.querySelectorAll('.pilot-detail').forEach(d => d.style.display = 'none');
      const el = document.getElementById('pilot-' + idx);
      if (el) { el.style.display = 'block'; el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
</script>
</body></html>`;
}
