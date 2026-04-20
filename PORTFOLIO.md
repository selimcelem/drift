# Drift — Portfolio

**Current version:** v1.5.5

## What it is

A gravity-surfing endless runner built as a single HTML5 Canvas game, shipped as an Android app via Capacitor, with an AWS serverless leaderboard backend and fully automated infrastructure deployment.

## Highlights

- **Real-time timer refactor** — every gameplay timer (powerup durations, cooldowns, combos, spawn cadences, phase thresholds) was migrated from frame-count state to wall-clock milliseconds, giving the game frame-rate-independent behaviour across 30/60/120 Hz devices and making Android low-power throttling a non-issue
- **Progressive difficulty system with phase-based content** — the game is carved into four two-minute phases that gate spawn pools, soundtrack, and background imagery, culminating in a scripted 10-minute "apocalypse" sequence. Phase selection has a reset-guard so a fresh run always starts in phase 1 regardless of prior wall-clock elapsed time
- **Complex canvas animations with dynamic hitboxes** — nine custom planet types (toothed, eye, cracked, tentacle, screaming, void, heart, mirror, skull), each procedurally drawn with pulsing/rotating/extending geometry, and several with hitboxes that follow the animation (spike tips, tentacle line-segments, pulsing-heart radius). All rendered with WebView-safe canvas operations (no `clip()`, bounded gradients, guarded degenerate paths) to avoid Android native crashes
- **Audio crossfading system** — four gameplay music tracks crossfade between phases, alongside menu/death tracks. All audio is decoded once into `AudioBuffer`s and crossfaded at loop points so transitions are inaudible
- **Orb + crystal progression** — five unlockable orbs, each with a unique passive bonus and a distinct burst ability triggered by pressing both controls simultaneously; runs earn crystal currency (score × difficulty multiplier) persisted in `localStorage` to drive the shop
- **Real space imagery as parallax scenery** — NASA nebula, dying-star, galaxy, and supernova photos scroll behind the playfield using a `screen` composite blend so only the coloured light shows through
- **Play In-App Updates API integration** — the Android build uses Google Play's flexible in-app update flow so testers never have to leave the game to pick up a new build
- **Custom analytics pipeline** — a separate API Gateway → Lambda → DynamoDB path records per-run telemetry (score, time survived, death cause, phase reached, orb, powerups, burst count, streak, crystals) fire-and-forget from the game on death. Anonymous `crypto.randomUUID` session IDs persisted in `localStorage` link runs from the same install without a login; the player's pilot name is attached so the dashboard can surface per-player stats
- **Real-time analytics dashboard** — a password-protected `GET /analytics` endpoint returns a self-contained HTML page (dark theme, inline CSS) with overview stats, by-difficulty/death-cause/orb-popularity panels, phase-survival progress bars, average survival time rendered as MM:SS, and a per-pilot table with click-to-expand run history and per-difficulty breakdowns. Auto-refreshes every 60 seconds. Entirely server-rendered — no SPA, no external assets
- **Asset preloader with TAP TO START gesture gate** — boot renders a loading screen before any AudioContext work happens, fires parallel loads for all music/SFX buffers, background imagery, planet sprites, and gradient warmup, and reports per-task progress on a bar. A final TAP TO START button satisfies the browser's audio-gesture requirement, solving the "suspended AudioContext" pitfall on Android WebView and Safari without the usual first-click-anywhere hack. Includes a 15s stall timeout so one bad asset never blocks boot
- **WebView freeze mitigation on long runs** — a set of targeted fixes tracking down a ~3-minute ANR on Android: a heap-pressure watchdog sampling `performance.memory.usedJSHeapSize` every 3s and pre-emptively wiping effect arrays + gradient cache over 100 MB; bounded effect caps (nova/emp rings, trail particles, destroy/crack effects) with a per-frame `cleanupEffects()` pass; orb-trail emission throttled to every 3rd frame; the vignette gradient pre-rendered to a cached offscreen canvas per size-bucket instead of rebuilt every frame; gradient cache itself bounded and cleared at >200 entries. The game loop is wrapped in nested try/catch with a `finally { requestAnimationFrame(loop); }` so even an unexpected throw can't stall the frame chain
- **Adreno GPU driver crash diagnosis and mitigation** — identified an Android-specific crash path where WebView surface recreation during orientation / size config changes was taking out the Adreno GL driver on certain Qualcomm devices. Fix: declared `configChanges="orientation|screenSize|keyboardHidden|screenLayout|uiMode"` (plus extras) on the main activity so Android hands the event to the activity instead of recreating it; debounced the `window.resize` listener to 150 ms so a flurry of events coalesces into one atlas/gradient rebuild; added `dt` clamping (≤ 32 ms) and a `visibilitychange`-driven frame-time reset so a resumed app can never feed a stale multi-second delta into physics
- **Draw-call optimization, 538 → 229 peak (57 % reduction)** — a pass over the render pipeline to collapse per-entity canvas work. Background stars baked into four full-screen atlas canvases (160 fills → 4 `drawImage`s). Per-planet static geometry pre-rendered once at spawn into offscreen canvases for eye/skull/mirror/screaming/heart types (dozens of strokes/fills per frame → one `drawImage`). Tentacle bodies rewritten around a cached `Path2D` rather than rebuilding paths every frame. Pickup particles batched by colour × life-bucket (up to 40 particles collapse to ≤ 16 bucket fills). Destroy-effect and crack-fragment draws batched similarly
- **Resume-after-crash persistence system** — Android WebView still occasionally gets killed mid-run (backgrounding, OOM, driver reset). Gameplay state is snapshotted to `localStorage` every 5 s of play (same key overwritten, never accumulates), guarded by an age ceiling (30 min) and a minimum-survived floor (30 s) on the read side so stale or trivial runs don't clutter the menu. On next boot the main menu surfaces a gold RESUME button with the saved difficulty / elapsed / score. Clicking it runs a full-screen 3-2-1 countdown, then calls `resetGame()` and overwrites the restored fields (difficulty, orb, score, `runStartTime = now - survived*1000`, grace window) before flipping state to `'playing'`. Saved state is cleared on death, manual main-menu return, restart, and a fresh ENTER THE VOID, so resume never replays a finished run

## Tech stack

| Layer | Tech |
|-------|------|
| Game | Vanilla HTML5 Canvas + JS — single file, no frameworks, no build step |
| Mobile | Capacitor 8 wrapping the web app into a native Android shell |
| Backend | AWS API Gateway (HTTP API) → Lambda (Node.js 20) → DynamoDB |
| Infrastructure | Terraform with S3 remote state |
| CI/CD | GitHub Actions with OIDC federation — no long-lived AWS credentials |

## Architecture decisions

**Single HTML file game** — The entire game is one `index.html`. No bundler, no asset pipeline, no framework. This keeps iteration fast (refresh the browser), deployment trivial (copy one file), and the mental model simple. The tradeoff is no module system, but at ~1800 lines that's manageable.

**HTTP API over REST API** — API Gateway's HTTP API is cheaper (~70% less), faster (lower latency), and simpler for this use case. REST API features like request validation, WAF integration, and usage plans aren't needed for a game leaderboard.

**PAY_PER_REQUEST billing** — The leaderboard has unpredictable traffic patterns. Provisioned capacity would either waste money during quiet periods or throttle during spikes. On-demand scales to zero cost when nobody's playing.

**OIDC over long-lived keys** — GitHub Actions authenticates to AWS via OpenID Connect federation. No AWS access keys stored as secrets, no rotation needed, no risk of key leakage. The trust policy is locked to a specific repo and branch.

**Tiered DynamoDB TTL** — the leaderboard uses TTL as its retention policy instead of a cleanup job: every submission strips the `ttl` attribute from the current top 10 per difficulty (they persist indefinitely) and sets a 7-day TTL on positions 11+. Scores that fall out of the top 10 pick up a fresh 7-day window on the next submission. The analytics table uses a flat 90-day TTL for the same "no cleanup cron" reason.

## What I built vs. what tools helped

The game mechanics, physics model, and visual design are my work — gravity surfing, the attract/repel two-button control scheme, procedural audio, powerup system, and all the Canvas rendering. The AWS architecture (API Gateway + Lambda + DynamoDB, OIDC auth, Terraform IaC) was designed by me based on what the project actually needs.

Claude Code was used as an implementation accelerator — turning design decisions into working code faster than typing it all out manually. The architectural choices, game design, and infrastructure decisions are mine; the tool helped me ship them.

## AWS cost estimate

**Free tier (first 12 months):**
- DynamoDB: 25GB storage, 25 read/write capacity units — the leaderboard won't come close
- Lambda: 1M requests/month free
- API Gateway: 1M HTTP API calls/month free

**Beyond free tier:**
- DynamoDB on-demand: $1.25 per million writes, $0.25 per million reads
- Lambda: $0.20 per million requests + $0.0000166667/GB-second
- API Gateway: $1.00 per million requests

At 10,000 daily active players submitting ~3 scores each: ~$1-2/month total.

## Links

- **Live demo:** [selimcelem.github.io/drift](https://selimcelem.github.io/drift)
- **Source:** [github.com/selimcelem/drift](https://github.com/selimcelem/drift)
