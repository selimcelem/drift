# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## v1.5.5 — 2026-04-20

### Features
- Resume Run: pause or force-close the game at any point, reopen later, and RESUME RUN restores
  your exact state (score, difficulty, orb, time survived, phase). Persists indefinitely until
  death or a new run. No minimum survival time required.

### Fixes
- Fixed main menu overflow when RESUME RUN is present on mid-height devices (~760-820px viewports);
  LEADERBOARD and action buttons now fit cleanly
- Fixed layout shifts caused by safe-area handling on notched and gesture-nav devices;
  all HUD elements (score, timer, burst meter, hints, settings, pause) now respect safe-area insets
- Fixed crystal counter position — moved from awkward center-right to proper top-right anchor,
  mirroring the settings gear
- Fixed resume-state corruption crash loop: if the saved state blob ever becomes malformed,
  the key is evicted cleanly instead of crashing the app on every launch
- Fixed version label drift between GAME_VERSION and gradle versionName (now both 1.5.5)

### Infrastructure
- Analytics dashboard authentication moved from query-string password to Authorization header
  with inline login page (password no longer logged in URL bars, browser history, proxy logs)

### Developer
- Added on-screen debug overlay (DEBUG_RESUME flag, currently off) for on-device resume-state
  diagnostics without chrome://inspect tethering
- Added Sentry fire-test cheat (pilot name "SENTRY") to verify error reporting wiring on any build

### Known issues
- Qualcomm Adreno GPU driver crashes on a small number of devices still being monitored;
  configChanges fix from v1.5.4 is the current mitigation
- Progression state (crystals, orbs) remains localStorage-only; cloud save via Google Play Games
  planned before production release

## [Unreleased]

### Added
- Loading screen with animated drifting star field, progress bar, percentage readout, and TAP TO START gesture gate before the AudioContext is resumed
- Asset preloader: all music tracks, SFX buffers, background images, planet sprites, and gradient cache entries loaded in parallel with per-task progress reporting and a 15s stall timeout
- Gradient cache warmup during preload (void/heart/scream bases at sizes 20/25/30/35/40, shield and ghost player auras, orb aura/core per orb colour) so the first few frames don't build them under load
- JIT warmup during the loading screen — 3-second hidden game simulation primes hot paths so the first real frame doesn't hitch
- Resume after crash: game state snapshotted to `localStorage` every 5 s during gameplay; RESUME button on the main menu plays a 3-2-1 countdown before restoring difficulty, orb, score, and elapsed time
- Version display on the main menu under the "GRAVITY SURFING" subtitle
- Analytics dashboard at `/analytics` endpoint (password protected)
- Analytics dashboard now shows a per-pilot difficulty breakdown alongside the existing overview panels
- Average survival time shown in MM:SS format on the analytics dashboard (overview and per-pilot rows)
- Per-run tracking: death cause, phase reached, orb used, score, time survived, powerups, burst count, longest streak
- Anonymous session IDs for player tracking without login
- Pilot name linked to analytics for per-player stats
- DynamoDB `drift-analytics` table with 90-day TTL
- Dynamic body-spacing scaler — spawn gap now scales inversely with `effectiveMaxBodies()` so screen density stays roughly constant as the body cap ramps up through phases
- Post-3-minute speed scaling: +0.25 per minute after the normal speed cap is reached
- Mirror planet movement now replays delayed player input (500ms lookback) instead of mirroring live — makes the mirror's motion readable and reactable
- Deep memory cleanup every 60 s of gameplay: releases off-screen body sprite canvases, clears the gradient + vignette caches, and nulls music buffers that aren't the current or next phase track
- Aggressive draw-call optimizations: 160-call star field reduced to 4 via pre-baked atlases; planet sprite pre-rendering for eye/skull/mirror/screaming/heart (one `drawImage` replacing many fills/strokes per frame); tentacle bodies rendered via a cached `Path2D`; pickup particles batched by colour × life bucket; destroy-effect and crack-fragment draws batched

### Changed
- Supernova (nova+nova combo) ring count now varies by orb: 4 blasts on non-Inferno orbs, 6 blasts on Inferno (solar). Single-nova pickup still fires 3 for non-Inferno, 6 for Inferno — combo still feels rewarding without over-clearing the screen
- Powerup frequency scaled per difficulty: Normal 2.0 (generous), Hard 1.7 (moderate), Extreme 1.44 (unchanged)
- Pair spawn chance now per-difficulty: Normal 16 %, Hard 13 %, Extreme 10 % (replaces the flat 10 % rate)
- Orb unlock prices doubled: Cosmic 10k→20k, Solar 20k→40k, Nebula 40k→80k, Asteroid 80k→160k
- Further orb price rebalance: Cosmic 50k, Solar 120k (later 100k), Nebula 250k, Asteroid 350k (down from 500k)
- Asteroid orb shield behaviour: +2 hits per pickup (cap 4); burst activates an instant 4-hit fortress; fortress-pair combo sets 4 hits directly
- Time bonus reduced to score × 0.03 per 30 s interval (capped at 20 intervals / 10 min)
- Shield duration reduced: 8s → 6s default, 10s → 6s on Asteroid orb
- Fortress Shield combo duration now a flat 8 s for all orbs via dedicated `FORTRESS_SHIELD_DURATION_MS`
- Ghost durations reduced: default 5s → 4s, Cosmic 8s → 6s; Eternal Phantom default 8s → 6s, Cosmic 12s → 8s
- Hyperspeed combo duration 5s → 3.5s (Spectral Rush / Warp Time / Juggernaut hyperspeed phase)
- Juggernaut post-landing shield: 6s default, 8s on Asteroid (fortress-tier reward)
- Phase thresholds moved earlier to the 2/4/6/8 minute marks
- Streak scoring cap lowered to 8 (× 4 flat = max 32 points per destroy)
- Supernova (nova+nova combo) always fires a fresh chain on re-activation — consecutive pickups each spawn a full supernova instead of the second being suppressed
- Top 10 leaderboard scores now permanent (no TTL expiry)
- Scores dropping below top 10 get 7-day TTL as before
- `minSdkVersion` bumped to 26 — every supported device now ships with an auto-updating Chromium WebView, eliminating pre-Chromium crash paths
- Android bundle splits disabled (language/density/abi) to fix Play Store install crashes on some devices
- `noCompress` added for mp3/jpg/png/html/js so Play Store asset delivery doesn't corrupt binary assets

### Fixed
- Adreno GPU driver crash: `configChanges` flags on the activity prevent Android from tearing down and recreating the WebView surface during orientation / size events
- Resize handler now debounced 150 ms so a stream of orientation/size events coalesces into a single rebuild instead of thrashing the GPU surface and gradient/atlas caches
- Delta-time clamping in the game loop (`dt = min(elapsed, 32 ms)`) keeps physics sane after the app is backgrounded and resumed; the first frame after resume skips `update()` entirely so a huge stale interval can never feed into the simulation
- `visibilitychange` handler invalidates the frame-time baseline on hide and reseeds `performance.now()` on show — paired with the dt clamp above
- Phase reset on Drift Again now uses an explicit `forcePhase1` flag so stale elapsed time can never spawn wrong-phase planets during the reset window
- WebView freeze after ~2-3 minutes on Android: heap-pressure watchdog (now every 180 frames, 100 MB threshold) wipes effect arrays and the gradient cache; tightened orb-trail particle cap (60 → 30) with 3-frame emission throttle and 600ms max particle life; bounded gradient cache (cleared at >200 entries); vignette gradient pre-rendered to an offscreen canvas cached per size-bucket instead of rebuilt every frame
- Game loop hardened: per-stage and top-level try/catch with `finally { requestAnimationFrame(loop); }` so an unexpected throw can never stall the rAF chain

## [1.5.0] - 2026-04-19

### Added
- Orb system: 5 unlockable orbs (Cyan/Drifter, Cosmic/Phantom, Solar/Inferno, Nebula/Warp, Asteroid/Fortress) each with unique bonuses and burst effects
- Crystal currency: earned per run based on score × difficulty multiplier, stored in localStorage
- Burst mechanic: press both sides simultaneously for orb-specific ability, 20 second cooldown
- 9 progressive planet types unlocking over time: toothed, eye, cracked, tentacle, screaming, void, heart, mirror, skull
- Dynamic hitboxes matching visuals on toothed (rotating spikes), tentacle (extending/retracting), heart (pulsing expansion)
- Apocalypse sequence at 10 minutes: bodies clear, player pulled to center, giant sun descends, cinematic death
- Phase-based music crossfade: 4 tracks (gameplay.mp3 to gameplay4.mp3) fade between phases
- Phase-based background imagery: NASA space images spawn matching current phase atmosphere
- Tutorial/guide accessible from main menu: 6 pages covering controls, powerups, scoring, burst, timer, orbs
- Leaderboard button on main menu
- Run timer with color progression (white→orange→red) and danger zone effects after 3 minutes
- Time bonus scoring: survive longer for bonus points (score × 0.03 per 30s interval, cap 20 intervals)
- Soft boundary forces: gentle push away from screen edges
- Center-seeking passive gravity replacing upward drift
- EMP chain reaction on shield kills: expanding electric dome with lightning arcs, one chain level deep
- Distinct visual destruction effects per powerup type (nova fragments, shield scan lines, hyperspeed impact, ghost wisps)

### Changed
- All frame-based timers refactored to real-time milliseconds (frame-rate independent on all devices)
- Streak scoring: streak × 4 flat formula, cap 8, replacing streak² exponential
- Dynamic canvas fills full screen on any device (removed fixed 400×700)
- Body spawn system: 3-zone horizontal distribution, dynamic vertical spacing
- Center-seeking gravity replaces passive upward drift
- Difficulty rebalanced: Normal 2.5/Hard 3.5/Extreme 4.0 max speeds, body counts scale from 2 min
- Phase thresholds: new planet types appear at 2/4/6/8 minutes
- Powerup scroll speed capped at 85% of game speed
- Shield EMP visual: electric dome with lightning bolts replacing nova-style ring

### Fixed
- Dynamic canvas filling full screen on all Android devices (Samsung S20, Pixel 8)
- Status bar transparent/dark on all Android versions
- Phase reset: Drift Again now correctly starts at phase 1
- WebView crash: removed ctx.clip() operations from complex planet draw functions
- Mirror planet tracking position instead of copying player input
- Asteroid orb shield stacking (0→2→4, never 3)
- Ghost passthrough sound restored after crunchy explosion overhaul
- Synthesized shield destroy sound playing alongside MP3 file

## [1.4.0] - 2026-04-16

### Added
- Dynamic background with real NASA space images (nebula, dying star, galaxy, supernova) parallax scrolling at 15% planet speed
- Screen blend mode on background images for natural space glow effect
- Time-based background spawning: first at 45 seconds, then every 60-90 seconds, hyperspeed also triggers spawn
- Stacking hyperspeed system up to 4x speed with step-down expiry, color tints gold/orange/red/white, blinking stack counter
- Play In-App Updates API replacing GitHub banner for Play Store testers
- Distinct visual effects per destroy type: nova fragments+shockwave, shield laser scan lines, hyperspeed impact streak, ghost wisps
- Real audio files for shield, nova and hyperspeed barrier destruction sounds
- Small phone menu scaling fix for screens narrower than 400px (Samsung A series)
- Edge-to-edge display fix for modern Android phones (Pixel 8, Samsung S24)

### Changed
- Background images use screen blend mode so dark pixels are transparent, only colored light shows
- Nova destroy volume reduced to prevent overpowering other sounds
- All shield kills (including wraith) now use shield destroy audio file
- Ghost passthrough sound restored to soft ethereal whomp
- Background object size tuned per image type
- Galaxy image uses stronger vignette fade for better blending

### Fixed
- Circular outline visible on background images — removed clip mask, vignette now fully opaque at edges
- Ghost passthrough sound was overwritten by crunchy explosion sounds
- Synthesized shield destroy sound was playing alongside new MP3 file
- Touch event passive flag warning on Android
- webContentsDebuggingEnabled set back to false for release builds

## [1.3.0] - 2026-04-16

### Added
- Three separate music tracks: menu, gameplay, death screen
- Stacking hyperspeed system up to 4x speed with step-down expiry, color tints, blinking stack counter
- Planet destruction visual effects: flash, ring pulse, debris particles per destruction type
- Death orb shatter animation with polygon shards
- Retro button click sounds throughout all menus

### Changed
- Music system supports crossfade looping for all three tracks
- Hyperspeed stacks scale landing pull strength
- Nova and Supernova destruction sounds enhanced

### Fixed
- Pause and settings music toggle bug
- Combo duration sync on component pickup
- Android crash resilience: error handlers, audio recovery, memory pressure relief, back button

## [1.2.0] - 2026-04-15

### Added
- Smart combo pickup logic: same-type priority, recency-based pairing, random tiebreak for simultaneous pair spawns
- Settings menu with separate Music and SFX toggles (gear icon top-left, also in pause menu)
- Combo activate sound — unique two-tone chime per combo type
- Shield break sound — crack and thump when shield absorbs a hit
- Update available banner on main menu when new version detected on GitHub

### Changed
- Pulsar auto-nova timer no longer resets when shield is picked up while Pulsar is active
- Warp Time auto-nova timer no longer resets when hyperspeed is picked up while Warp Time is active
- Game speed now scales on time survived instead of score
- Streak scoring cap lowered to 12 (max 144 pts per destroy)
- Nova spawn rerolls to non-nova type when nova effect already active
- Supernova wave radius reduced to prevent full screen clear
- Hyperspeed landing window extended to 3 seconds, stronger pull toward spawn position
- Difficulty rebalanced for longer runs and broader audience
- Local highscores keep top 5 per difficulty
- Background music replaced with chiptune-style track 150 BPM arpeggiated melody bass harmony drums
- All SFX rewritten with higher quality synthesis and proper ADSR envelopes
- Hyperspeed sustained tone changed to low bass rumble
- Milestone score chimes removed
- Hyperspeed volume reduced

### Fixed
- Memory leaks: particle cap enforced, nova timeout cleanup, nova ring pruning
- Performance: offscreen nebula canvas, cached planet gradients, simplified background
- Crash during hyperspeed combos at high scores: re-entry guard prevents combo stacking, NaN guards on physics
- Wraith destroy-on-contact works correctly after Ghost+Ghost chain
- Vertical drift off-screen during long combos

## [1.1.0] - 2026-04-14

### Added
- Combo system: 9 powerup combinations with unique mechanics (Supernova, Warp Time, Phantom Blast, Pulsar, Spectral Rush, Juggernaut, Wraith, Eternal Phantom, Fortress Shield)
- Pair spawning: 1 in 5 powerup spawns as a deliberate tethered pair, picking up either gives both and activates combo
- Combo label display on powerup timer bar
- Quadratic streak scoring system (destroy streak² points capped at 12, pass = 1 point)
- Live streak counter display during gameplay
- Run summary on death screen (planets passed, destroyed, streak, powerups, total breakdown)
- Leaderboard difficulty tabs on death screen for both local and global
- Repel target locking for duration of press

### Changed
- Difficulty rebalanced for broader audience and longer runs
- Hyperspeed reworked: always meaningful speed spike regardless of current game speed, 6s duration, landing sequence pulls player back to spawn position
- Supernova radius tuned to not clear entire screen
- Game speed now scales on time survived not score
- Streak scoring cap at 12 (max 144 pts per destroy)
- Nova spawn blocked when nova-type effect already active, rerolls to other powerup type
- Local highscores keep top 5 per difficulty instead of top 5 globally
- Score validation limit raised to 99999

### Fixed
- Wraith combo destroy-on-contact now works correctly after Ghost+Ghost chain
- Vertical drift during long combos pulls player back to safe zone
- Upward drift off-screen during extended combos
- Leaderboard difficulty tabs not filtering local scores correctly
- www folder gitignore causing game files to not be tracked
- Dead zone fix — when repelling with planet directly above, horizontal nudge ensures escape in correct direction based on relative position

## [1.0.0] - 2026-04-10

### Added
- Initial game — HTML5 canvas gravity surfing endless runner
- Left/right controls attract and repel from nearest celestial body
- 3 celestial body types: stars, planets, black holes
- 3 difficulty modes: Normal, Hard, Extreme with scaling speed and body density
- Player responsiveness scales with game speed
- Grace period with shield visual on spawn
- 4 powerups: Shield (15s, breaks on collision), Nova (triple expanding blast), Hyperspeed (speed spike with destruction barrier), Ghost (8s phase-through)
- Powerups participate in gravity system as attract/repel targets
- Online global leaderboard per difficulty (AWS API Gateway + Lambda + DynamoDB, 90-day TTL)
- Username prompt on first launch, changeable from pause menu
- Local highscores per difficulty stored in localStorage
- Procedural Web Audio sound effects for all game events
- Generative ambient background music
- Mute button with localStorage persistence
- Pause menu with Resume, Restart, Change Name, Main Menu, Quit
- Death explosion particle system
- Player trail and velocity streak
- Background nebula and star field
- App icon and Android launcher icons

### Changed
- Slowmo powerup replaced with Hyperspeed
- Nova blast radius increased to 320px, triple wave
- Ghost duration extended to 8 seconds
- Shield duration extended to 15 seconds, breaks on first collision

### Fixed
- Ghost button invisible click area during gameplay
- Attract/repel audio cutout after multiple restarts (frame counter vs audio clock)
- Ghost powerup visual feedback (persistent aura rings, timer bar, purple trail)
- CORS headers on Lambda functions and API Gateway
- Leaderboard fetch delayed 1s post-death to include current score

### Infrastructure
- AWS backend: API Gateway HTTP API + Lambda (Node.js 20) + DynamoDB
- Terraform IaC in /infrastructure
- GitHub Actions OIDC CI/CD (no long-lived credentials)
- Capacitor Android wrapper
- GitHub Pages live demo
- Source-available license
