# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Each version header links to its GitHub release; see the release notes for full
detail beyond the summaries here.

## v1.9.0 — Orb rework complete (single-rank / active-budget skill trees) + Ascension

**Headline: all five original orbs (Drifter, Phantom, Inferno, Warp, Bulwark) are
now reworked to the single-rank / active-budget model, and the first-death "rainbow
orb" run is replaced by Ascension.** Every node is unlocked once with crystals, then
toggled active/inactive within a limited active-point budget — so build choice, not
grind, defines a run. This completes the migration of the original five to the same
model Roamer and Phantasm pioneered.

### Ascension — replaces the rainbow-orb run
- The old first-death "rainbow orb" run is gone. On the **first death** of a save,
  a cutscene now plays and the run resumes as **Ascension**: a one-shot, fully-
  powered **Phantasm** run (all three Phantasm paths active, budget ignored) that
  continues from the death frame. Career stats and the leaderboard are skipped; a
  fixed crystal reward is granted at run end. Phantasm stays locked afterward — it's
  a one-time taste. During Ascension the progression clock advances at 2×.

### Phantom (cosmic) — full rework (headline)
- Rebuilt as a single-rank / active-budget tree: 3 paths — **DUSK**
  (ghost duration & uptime), **WRAITH** (offense during ghost), **VEIL**
  (phasing & safety) — **18 nodes, 69,000 💎 / 57 active points** to fully
  unlock. New branching activate/deactivate tree UI with horizontal scroll.
- New/reworked mechanics: **Eternal Veil** keystone (+1s to every ghost
  duration — Phantom's no-upgrade ghost durations now match every other orb, so
  its length comes from the tree, not a baked-in baseline), **Endless Dusk**
  (auto-ghost on a cycle), **Nightfall**
  (gaining ghost shaves the burst cooldown), **Phantom Blade** reworked into
  a 2-second sweep, **Hollow Edge** homing blade, **Soul Reaver**, **Reaping
  Storm** capstone (a ghost-kill counter that unleashes chaining EMP bursts
  with a lightning-arc visual), the **Spectral Drift / Veilwalk / Eclipse**
  clone/decoy entities, and **Umbral Step** (one cheat-death emergency ghost).
- Ghost-duration cap pinned to 10s with every ghost-extension source clamped
  to it. One-time migration refunds legacy Phantom investments at the old
  rates (schema-versioned and safe across PGS cloud-merge).

### Inferno (solar) — Halo / Firebrand / burn-zone tuning
- **Halo** now also has a **10% chance on any nova-related kill to fire a
  half-size nova at the body** (6s cooldown) — it inherits the old
  "Firebrand-on-any-destroy" proc, on top of its faster Supernova rings.
- **Firebrand** reworked: instead of 10% on *any* destroy, it's now **20% on a
  burn-zone kill**, and **each burn zone can proc it at most once**. Its global
  6s cooldown is gone (the per-zone cap is the limiter).
- **Ember Spread**'s spread zones are now flagged so they **can't re-trigger
  Firebrand**, closing the burn-kill → Firebrand → spread-zone → burn-kill loop.
- **Burn-zone visuals now match the hitbox** — the flame is drawn at the true
  kill radius (**55px with Cinder, 40px without**) instead of overshooting it by
  ~1.7×, so what you see is what kills. Wildfire's description names the 40px
  default size.

### Inferno (solar) — full rework
- Rebuilt as a single-rank / active-budget tree (base 20 / cap 25): 3 paths —
  **PYRE** (stack nova waves), **CORONA** (wider novas + cast cadence), **INFERNO**
  (spreading firefield) — **18 nodes, 78,000 💎 / 57 active points** to fully
  unlock, with the same branching activate/deactivate UI.
- Inferno's baked-in nova advantage is **gone** — its novas now fire at the same
  base wave count as any other orb; the wave/size edge comes entirely from the tree.
- New/reworked mechanics: **Pyre** (+2 waves to every nova), **Corona** (+20%
  nova radius + −0.5% burst CD per nova kill), **Solar Wind** (slower waves — a
  longer-lasting barrage that keeps sweeping up planets that scroll in),
  **Wildfire** (nova kills leave burn zones), **Ember Spread**, **Backdraft** (5+
  overlapping burn zones detonate into half-novas as they expire), **Stellar
  Collapse** capstone (every 20 nova kills → an orbiting fireball that incinerates
  on contact, then launches at a planet and detonates a full nova), **Sun Forge**
  (auto-supernova every 30s), and **Critical Mass** (every 20 nova kills → a free
  fully-loaded nova + guaranteed burn zones). Bottom-left COLLAPSE / MASS counters
  for the two kill-counter capstones.
- **Burn zones redrawn as actual fire** — flickering flame tongues, glowing core,
  and rising embers, replacing the old "orbiting dots" look.
- Balance guards: per-cast **wave cap (12)**, **burn-zone cap (12)**, and an **8s
  burst-CD floor** so per-kill cooldown refunds can't collapse the burst. One-time
  schema-versioned migration refunds legacy Inferno investments at the old rates;
  rainbow runs no longer auto-fire Sun Forge.

### Warp (nebula) — full rework
- Rebuilt as a single-rank / active-budget tree (base 20 / cap 25): 3 paths —
  **BLUESHIFT** (peak velocity), **CONTINUUM** (hyperspeed duration & uptime),
  **SINGULARITY** (stack cap & payoff) — with the same branching activate/deactivate UI.
- New/reworked mechanics: **Overdrive** (+2 stack cap), **Continuum** (each stack
  gained while warping extends the timer), **Slipstream** (destroy → +2 stacks),
  **Warp Harmonic** (+3 stacks on a hyperspeed combo), **Critical Velocity** (max-stack
  kills detonate novas), **Infinite Gate**, **Lightspeed** & **Lingering Horizon**
  capstones (no-decay top speed + periodic max-cap growth / auto full-stack), and
  **Singularity** — a 20s charge where the **next hyperspeed (from any source) snaps
  to MAX stacks** and, when it ends, tears a **RIFT** at the top of the screen that
  drags in and devours nearby planets for 3s. Max stack-cap ceiling raised 8 → 10.
- A left-side **RIFT** cooldown ring shows Singularity's charged-vs-charging state.
  One-time schema-versioned migration refunds legacy Warp investments.

### Bulwark (asteroid) — full rework (5th and final original orb)
- Rebuilt as a single-rank / active-budget tree (base 20 / cap 25): 3 paths —
  **RAMPART** (shield hits & duration), **OVERLOAD** (EMP width & chains),
  **COLLAPSE** (gravity pull & absorption) — with the branching activate/deactivate UI.
- New/reworked mechanics: **Bastion** (+2 hit cap, pickups refill to full),
  **Second Wall** (auto full-cap shield after 1.5s shieldless), **Capacitor** (auto-EMP
  every 5s while shielded), **Aegis** capstone (screen-clearing EMP every 30s, with a
  cooldown ring), **Overload / Conduction / Phalanx** (wider, deeper, forking EMP
  chains), **Gravity Well** (pull bodies into the hull while shielded), **Tidal Force**,
  **Salvage**, **Bastion II**, **Accretion** (a recurring 2s window that crushes pulled
  bodies into shield stacks — each absorb counts as a kill and extends the shield), and
  **Dead Star** — every **30 shield-stacks lost**, the field IMPLODES into a 10-hit
  **golden shield** (you're invulnerable through the collapse) whose EMP bursts read
  gold, are 50% larger, and **chain indefinitely** (each hop 20% smaller). Bottom-left
  **DEAD STAR n/30** counter tracks progress. One-time schema-versioned migration
  refunds legacy Bulwark investments.

### Fixes
- **Dead Star golden shield** no longer desyncs: a regular shield pickup or expiry
  could leave the gold visual on screen while real protection was gone, so a hit
  killed the player through a visible shield. The golden shield is now an authoritative
  10-hit consumable kept in lockstep with its visual; pickups can't stomp it and
  Accretion can't infinitely upkeep it.
- **Black-screen blocker** investigated and traced to a dev clock-fast-forward cheat
  (not the shipped build) — the apocalypse fires at 600 progression-seconds, which a
  time-dilation cheat reached instantly, clearing the field. Confirmed `TIME_DILATION = 1`
  in production.
- **Infinite combo-duration bug**: the Dead Star golden shield held `activeEffects.shield`
  at a perpetual proxy, which leaked through `syncComboDurations` (Wraith → ghost →
  Spectral Rush → hyperspeed) and through shield-dependent combo deps (Pulsar, Fortress),
  making those combos last forever. Combo syncing/expiry now ignores the golden-shield proxy.
- Ascension run no longer black-screens; the apocalypse "sun closing in" clears active
  skill visuals on trigger for a clean cinematic.

### Drifter (cyan)
- Active-point budget tightened to **base 20 / cap 25** (was 25/30) — the
  original-orb reworks run leaner than Roamer/Phantasm's 25/30.
- **Steady Hands** now procs every **500 points** earned (was 1,000), shaving
  10% off the live burst cooldown each time.
- Player-facing skill descriptions reworded.

### Roamer (drifterV2) — Pressure path buff
- **Threshold 50 → Threshold 40** and **Threshold 75 → Threshold 60** (their
  effects now trigger at the lower Pressure levels), and **Crescendo** now
  fires at **Pressure ≥ 70** (was > 80). Names, descriptions, on-screen flash
  cues, and the ascending pressure tones updated to match.
- **Pressure scroll-speed re-tuned to a smooth +0.3%/pt ramp** (was +0.5%/pt):
  the multiplier now scales linearly with the live counter — 1.0× at 0, ~1.15×
  at 50, **1.3× cap at 100** — and eases back toward normal as Pressure decays
  instead of pinning to the cap by counter 60. (Score-per-kill was already
  +1%/pt no-cap, scaling with the live counter; left unchanged.)

### Roamer (drifterV2) — Heartbeat reworked
- **Heartbeat** no longer tracks no-pickup *time* / auto-fires Fortress. It now
  counts powerups that **scroll off-screen uncollected** (a "skip"): each skip
  adds a stack (cap 3) and grabbing any powerup resets the streak. At **3 skips
  in a row** it opens a **5s window where every powerup — single or pair — is
  pulled strongly toward you**, mirroring the Drifter's Butterfly Effect (proc
  flash + heartbeat thump, pulsing cyan rings on the pulled powerups). HUD shows
  `♥ MAGNET` while the window is open.

### Trails
- **Phantasm's unlocked "Spectral Wisps" trail now actually renders** — it was
  missing an emission branch entirely (equipping it showed no trail). Added an
  improved take on Phantom's SPECTER'S VEIL: denser, longer-lived violet wisps,
  an occasional bright spark highlight, and faint orb-shaped afterimages that
  trail behind (more frequent + brighter during Eternal Phantom). Picker preview
  added too.
- **Roamer's Prismatic Pulse trail glow dialled back** — the wide additive halo
  on the orbiting particles was blending into the player orb, making it hard to
  tell trail from orb. Pulled the glow tighter and dimmer (in-game + preview).
- Generalized the active-budget engine into a reusable orb-keyed module
  (`ActiveBudget`) so each future orb rework registers a config instead of
  copy-pasting the system.
- Per-orb save-schema versioning + shape-based cloud-merge guards so a
  reworked orb's legacy save can't resurrect old nodes for free on PGS sync.

## v1.8.2 — Polish

### Improvements
- Skill tree button positions now stable (grid layout, no more shuffle on rank changes)
- Analytics dashboard persists login across page refreshes
- Rainbow runs no longer leak kill stats to Bulwark counter
- Code navigation improved (section banners added)
- Cached frequently-accessed DOM elements
- HTML escaping for leaderboard usernames (defensive)

### Documentation
- Reconciled leaderboard TTL claims in README with code

## v1.8.0 — Rainbow Awakening

### New
- First-death intro cutscene with cosmic dialogue and reverse-death animation
- Rainbow Orb one-time run with all capstones active simultaneously
- Game speed reaches max at 1 minute (was 2 minutes)
- Tutorial now explains walls + shield/ghost interactions
- Tutorial now explains gravity distance scaling

### Bulwark Balance
- GRAVITY WELL nerfed: 0.1/0.2/0.5 force per rank (was higher)
- BASTION II overhauled: chance per body destroyed during shield to grant +1.0s duration (5s CD, 2x base cap), per-rank 2/4/6/8/10%
- Cascade kills (EMP, Phalanx hops, Chain Reaction 2) now correctly trigger Bastion II and Salvage
- SALVAGE nerfed: -0.1/-0.2/-0.3% burst CD per kill (rebalanced for cascade kills counting)
- AEGIS cooldown increased: 60s (was 45s)

## v1.7.0 — Banner Ads

### New
- Banner advertisements on death screen (Google AdMob)
- Drift remains free; ads support continued development

### Backend
- Updated privacy policy with AdMob disclosure
- Patched AdMob plugin for Capacitor 8 layout compatibility

## v1.6.6.4 — Cloud Save & UI Fixes

### Fixes
- Stats tracking (totals, personal bests, per-orb breakdown, difficulty completions) now syncs via Google Play Games cloud save
- Cosmetic trail unlocks now sync via cloud save
- Reinstalling no longer resets stats progress for signed-in players
- Merge logic preserves highest values (kills/time/scores never regress on sync)
- Main menu DRIFT title now respects display cutout (camera punch hole / notch) on supported devices

## v1.6.6.3 — Hotfix

### Fixes
- Powerup combo banner no longer persists through death screen (especially after apocalypse cutscene)
- Death screen now properly scrollable — all milestone banners and leaderboard entries accessible
- Leaderboard displays full top 10 via outer scroll instead of cramped inner scroll
- Reserved layout space for future ad placement

## v1.6.6.2 — Hotfix

### Balance
- SALVAGE nerfed: -0.1/-0.2/-0.5% burst CD per shield kill (was -0.25/-0.5/-1.0%)
- PHALANX adjusted: 20% radius decay per hop (was 10% retention buff in v1.6.6.1)

## v1.6.6.1 — Hotfix

### Fixes
- Phalanx radius decay was inverted in v1.6.6 — chain rings shrunk too fast. Now 10% decay per hop (90% retention) for actual buff over pre-v1.6.6 behavior.

## v1.6.6 — Balance Pass + Black Hole Capstone

### New
- Bulwark BLACK HOLE capstone — doubles Gravity Well force and radius (requires Gravity Well rank 3)

### Bulwark Balance
- AEGIS now refreshes shield duration when triggered while shield is already active
- SALVAGE reworked: kills during active shield reduce burst cooldown by 0.25/0.50/1.00% per rank
- BASTION II buffed: +1s shield duration on cap overflow, percentages increased to 2/4/6/8/10%
- PHALANX buffed: chain ring radius decay 80% → 50% per hop

### Warp Balance
- MOMENTUM restored to -0.1/-0.2/-0.3% per kill
- THRUST buffed to +20/+30/+40% peak coefficient
- INFINITE GATE cooldown reduced 25s → 20s
- WARP HARMONIC cooldown reduced 30s → 20s
- LINGERING HORIZON cycle restored to 90s
- SLIPSTREAM cooldown reduced 20s → 15s

### Phantom Balance
- SHADOW REGEN fix: now uses max of default reset vs additive stack (was silently a nerf in common pickup scenarios)

### Economy
- Orb unlock costs reduced significantly: 10k / 20k / 40k / 80k crystals (was 20k / 40k / 100k / 150k)

### Fixes
- Hyperspeed banner now correctly positioned below timer on devices with display cutouts

## v1.6.5.1 — Hotfix

### Fixes
- Top HUD elements no longer appear on main menu
- Switched to fully immersive mode (system bars hidden during gameplay, swipe-to-reveal)
- Fixed black band at bottom of screen by overriding Capacitor SystemBars listener
- Top HUD now respects display cutout (camera punch hole / notch) on devices with cutouts
- Combo bar has 12px breathing room from screen bottom edge

## [1.6.5] - 2026-04-29

### Polish & Game Feel
- Screen shake redesign with wall-clock decay and intensity tiers
- Hitstop primitive on player death, EMP shield breaks, AEGIS, SUN FORGE,
  CRITICAL MASS, and large nova kills
- Death particles use the equipped orb's color and are sized as debris
  rather than orb-sized boulders
- Bug fix: settings → restart now properly resumes gameplay music

### Stats & Unlockable Trails
- Persistent stats tracking: total kills, bodies passed, crystals, runs,
  longest streak, time survived, plus per-orb breakdowns
- Stats screen accessible from Settings
- 5 cosmetic unlock trails — one per orb — with adaptive responses to
  game state. Unlock thresholds: Drifter / Phantom 1 000 kills,
  Bulwark 2 000, Inferno / Warp 3 000

### End-of-Run Dopamine
- Animated crystal counter on the death screen
- Milestone banners for trail unlocks, difficulty first-clears, and
  all-time milestones
- BEST tags on personal-best stats in the run summary

### Wall Mechanics
- Shield active + wall hit: bounce + EMP burst, consumes 1 stack
  (instead of dying)
- Ghost active + wall hit: bounce, no death, no duration consumed
- Hyperspeed alone (without shield/ghost) at a wall is still lethal —
  walls remain a real risk during offensive Warp play

### Powerup Rebalance
- Powerups now scale at 0.65 × body speed (was 0.85 ×) so they're
  consistently catchable at higher difficulties
- Per-difficulty minimum spawn spacing replaces the static 1500 ms
  guard: NORMAL 2000 ms, HARD 2500 ms, EXTREME 3000 ms,
  IMPOSSIBLE 4000 ms
- The 2-min powerup-frequency ramp now applies to the floor (up to
  −25 % by 12 min) so long runs gradually loosen scarcity
- Powerup density now genuinely scales with difficulty

### Balance — Warp
- LINGERING HORIZON cooldown 90 s → 120 s
- BREAKAWAY +25 / 50 / 75 % → +15 / 30 / 45 %
- WARP HARMONIC cooldown 20 s → 30 s
- MOMENTUM −0.1 / 0.2 / 0.3 % → −0.05 / 0.1 / 0.2 % per kill
- SUPERLUMINAL refactored: was a hard override to 10 stacks, now an
  additive +2 on top of the base + Overdrive (max possible 8)
- OVERDRIVE max ranks 3 → 2 (caps 5 / 6 instead of 5 / 6 / 7), with a
  per-node cost override so the path's total cost matches the original
- SUPERLUMINAL gating: now unlocks when ANY single Warp path is fully
  maxed (was: Overdrive at rank ≥ 2)
- Capstone cycle constants centralised — single source of truth shared
  by the auto-fire tick and the HUD progress rings (fixes the v1.7.0
  Lingering Horizon UI ring lagging the actual cooldown)

### Balance — Drifter
- DEAD CENTER + DOUBLE OR NOTHING anti-synergy fixed: DOUBLE OR
  NOTHING now also rolls after DEAD CENTER's player-picked effect
  resolves, so investing in both no longer wastes the T3 ranks
- ORACLE EDGE additive (+1.5 pp / rank) → multiplicative
  (× 1.10 / rank), closing the cross-difficulty gap

### Balance — Phantom
- GHOSTLIGHT proc chance 40 / 60 / 80 % → 20 / 40 / 60 %
- GHOSTLIGHT radius now scales 90 / 120 / 150 px per rank
- GHOSTLIGHT kill check uses body-edge instead of body-center

### Local Leaderboard
- Fixed duplicate scores bug on PGS sync relaunch

### HUD Restructure
- Top-center: compressed score + streak inline, timer + state below,
  hyperspeed banner cleanly under the timer
- Bottom-center: prominent active combo bar, single bar at a time
- Bottom-left: capstone cooldown circles, horizontal stack, only shown
  when on cooldown
- Bottom-right: BURST readiness circle, same size as capstone circles,
  bright gold + glow when ready
- Subtle audio cue when burst becomes ready (reuses the existing
  `mirror` SFX buffer at low volume)
- ATTRACT / REPEL hint labels lifted noticeably above the bottom UI
  row, faded styling preserved
- Trail unlock thresholds doubled: Drifter / Phantom 1 000,
  Bulwark 2 000, Inferno / Warp 3 000
- Canvas stretches full viewport (eliminates the body-bg gap that
  appeared on Capacitor edge-to-edge builds where
  `window.innerHeight < 100dvh`)

## [1.6.4] - 2026-04-27

### Added
- **First-time tutorial** — a forced 13-step guided sequence on first
  launch teaches attract / repel, all four base powerups, pair combos,
  the burst gesture (both halves at once), the streak / combo meter,
  and the wall-death warning. Persistent `drift_tutorial_completed`
  flag in `localStorage` (synced into the PGS cloud-save snapshot)
  ensures the tutorial fires exactly once per pilot. Never replays;
  the guide overlay stays available from the main menu for refreshers
- **Frame-rate setting** — selectable 60 / 120 / Adaptive in the
  settings menu. Defaults to 60 fps for battery savings; persists
  across sessions. The render loop respects the cap during gameplay
  and drops to 30 fps on static menus (see battery fixes below)

### Changed
- **Burst cooldown unified to 30 s** for every orb (was 20 s default).
  Per-orb burst-CD reduction mechanics (Restless Orb, Coronal Hold,
  Momentum) all key off the same single base now
- **Speed cap reached at 2:00** (was 3:00) on Normal / Hard / Extreme
  — the early game feels snappier without changing the cap value
- **Pricing pass 3** — node costs reduced again on top of the v1.6.3
  pass: another −50 / −45 / −40 / −35 / −30 % across Drifter / Phantom /
  Inferno / Warp / Bulwark. Capstones unchanged (the v1.6.3 capstone
  scale of −30 / −25 / −20 / −15 / −10 % stays as-is so capstones
  remain aspirational)
- **Phantom balance**:
  - Twilight Echo refresh window 1 s → 2 s
  - Shadow Regen 10 / 15 / 20 % → 15 / 20 / 25 %
- **Drifter balance**:
  - Loaded Dice 2 / 5 / 10 % → 10 / 20 / 30 % chance; internal
    cooldown after a successful reset 15 s → 20 s
  - Restless Orb −5 / −10 / −15 % → −10 / −20 / −30 %
- **Inferno balance**:
  - Critical Mass 20 s → 30 s internal cooldown
  - Cinder burn duration 2 s → 3 s, brighter visuals
  - Second Flame 5 s → 10 s cooldown
  - Coronal Hold −0.05 / −0.10 / −0.50 % → −0.25 / −0.50 / −1 % per
    nova kill
- **Warp balance + rework**:
  - **Smooth Entry → Momentum** (rebrand + complete rework). The old
    natural-pickup destroy-radius mechanic is gone; Momentum now
    reduces burst cooldown by −0.1 / −0.2 / −0.3 % per kill made while
    hyperspeed is active. Source-agnostic — barrier kills, EMP, nova,
    ghost-combo kills, and manual contact during a ghost combo all
    count
  - Slipstream cooldown 15 s → 20 s
  - Infinite Gate cooldown 15 s → 25 s
  - Overdrive max ranks 2 → 3 (stack cap +1 / +2 / +3 at ranks 1/2/3,
    Warp baseline 4)
  - SUPERLUMINAL max stack cap 8 → 10
  - LINGERING HORIZON: 90 s gameplay-driven full-stack auto-fire (was
    a 2 s post-hyperspeed forward-barrier echo)
- **Hardware acceleration explicit** — `android:hardwareAccelerated="true"`
  declared on the AndroidManifest application element rather than
  relying on the framework default
- **Viewport meta** — `viewport-fit=cover` added to the viewport meta
  tag so `env(safe-area-inset-*)` resolves correctly on edge-to-edge
  Android targets

### Fixed
- **SHOP button hidden behind Android gesture nav bar** (S23 Ultra and
  similar gesture-navigation devices) — fixed with `viewport-fit=cover`
  + CSS `env(safe-area-inset-*)` padding across the menu chrome and
  Android-side edge-to-edge wiring
  (`WindowCompat.setDecorFitsSystemWindows(getWindow(), false)` in
  `MainActivity`). All bottom-anchored UI now respects gesture-nav
  insets
- **Battery drain on STATIC menus** — phones were overheating and
  burning ~10 % battery in 10–15 minutes on the skill-tree menu.
  Multiple causes triaged and fixed:
  - Pixi stage was rendering at full FPS while a fullscreen overlay
    covered the canvas; render gate added so the Pixi loop short-
    circuits when an overlay is up
  - `backdrop-filter: blur(...)` was being composited every frame on
    six fullscreen overlays — removed everywhere the cost wasn't
    paying for itself
  - `orbPreviewLoop` was running continuously even when the preview
    pane was hidden; now gated on visibility
  - No FPS cap existed; added a cap with menu reduction (30 fps in
    static menus, 60 / 120 / uncapped during gameplay per the new
    frame-rate setting)
  - Lifecycle handlers added: `visibilitychange` plus the Capacitor
    `App` plugin's pause / resume events stop the render loop and
    duck music when the app is backgrounded or a modal opens from a
    menu
- **Ghostlight visual no-op** — the function existed but didn't render
  anything in v1.6.3. Now properly clones the EMP burst structure with
  purple coloring: lightning bolts, expanding ring, and centre flash
- **Tree UI "LOCKED" state misleading** — when a prereq node was
  refunded but the dependent node still had ranks, the dependent node
  showed LOCKED (looked like nothing was owned). New **FROZEN** state
  introduced (CSS `.tree-node.frozen`) for owned-but-prereq-missing
  nodes, with a "PREREQ MISSING" upgrade button so the player
  understands the path back. `.frozen` is defined after `.partial` so
  the orange frozen tint wins over the partial-rank tint
- **Pixi / Canvas parity audit** — stale render gates discovered while
  fixing the battery drain were removed; all new visuals (Ghostlight
  rework, FROZEN node tint) render identically on the Pixi path and
  the Canvas 2D fallback

## [1.6.3] - 2026-04-25

### Added
- **Per-orb skill trees**. Each orb has a three-path tree (T1 / T2 / T3)
  plus 2-3 capstones. Tree state persists in `localStorage` and syncs
  to the PGS cloud-save snapshot. ~30 nodes + 11 capstones across the
  five orbs. Trees unlock for a flat per-orb crystal cost
  (3k / 6k / 9k / 12k / 15k from Drifter to Bulwark) instead of the
  earlier difficulty-gated unlock model
- **IMPOSSIBLE difficulty** — unlocked by beating EXTREME's apocalypse.
  Speed cap reached at 1:00 (vs 3:00 on N/H/E), then ramps +10 %/min
  speed and +1 max body every 2 minutes post-cap. 1.5× crystal payout.
  Backend score-allowlist updated to accept the new difficulty
- **Difficulty ramp adjustment** — speed cap on Normal/Hard/Extreme
  pushed from 2:00 to 3:00 with no post-cap growth. Impossible owns the
  endurance test now
- **DRIFTRESET cheat** for full progress wipe (dev only — typed in the
  pilot-name field; not exposed in any public UI). Wipes crystals,
  unlocked orbs, beat-difficulty flags, tree state, and tree unlocks
- **Styled confirm modal** replaces `window.confirm` for tree-respec,
  DRIFTRESET, and shop confirmation so dialogs stay in the game's
  visual language
- **Visual pass** for the tree mechanics: HUD capstone countdown rings
  (SHROUD / NIGHT SHADE / SUN FORGE / AEGIS / LINGERING HORIZON), Cinder
  burn zones, Phantom Blade spinning-blade visual, Beyond afterimage,
  Afterburn discs, hyperspeed stack escalation (gold→orange→red→white,
  "WARP CORE" label past cap), Salvage crystal sparkle, Twilight Echo
  ring + text, Gravity Well attract lines, Smooth Entry ring, Butterfly
  Effect split, destroy-to-powerup proc cues
- **Main menu UI rework** — per-orb EQUIP / UPGRADE buttons replace the
  bottom-of-menu SKILL TREES button; the tree overlay tab picker is
  gone (each orb has its own tree screen). Tooltip orb-name audit:
  Cyan/Cosmic/Solar/Nebula references replaced with Drifter / Phantom /
  Inferno / Warp / Bulwark display names

### Changed
- **Hyperspeed architectural rewrite** — single shared `hyperspeedEndTime`
  drives all hyperspeed timing. Each pickup increments
  `hyperSpeedStacks` (capped) and resets the shared end time. Stacks
  affect peak multiplier; duration is shared. Removes the old
  per-pickup independent timers and the cascade-of-overlapping-stacks
  bookkeeping that came with them. Stack cap default 4 → up to 8 with
  Overdrive 2 + SUPERLUMINAL
- **Pricing overhaul (pass 2)**. Node costs scaled down per orb:
  Drifter −65 % (`ORB_COST_SCALE` 0.35), Phantom −60 %, Inferno −55 %,
  Warp −50 %, Bulwark −45 %. Capstones get a separate, less-aggressive
  scale (`ORB_CAPSTONE_COST_SCALE` 0.70 / 0.75 / 0.80 / 0.85 / 0.90)
  so a player can fill out the nodes cheaply but capstones remain
  long-term goals. Drifter T1 R1 went 7 000 → 2 500; Drifter capstone
  went 14 000 → 19 500 — nodes ~30 % cheaper overall, capstones
  intentionally rose
- **Tree unlock costs reduced** — 5k/11k/18k/26k/35k → 3k/6k/9k/12k/15k.
  Cheap to enter (1-3 runs each)
- **Drifter node reworks**:
  - Loaded Dice → "Each burst has a chance to instantly reset burst
    cooldown" (2 / 5 / 10 %, 15 s internal cooldown). Was a combo-bias
    reroll that became redundant once DEAD CENTER let players pick the
    combo manually
  - Fortune Favors → adds 10 s cooldown to the second-pickup proc only;
    the longest-expired-type bias still rolls every spawn (no cooldown)
  - Butterfly Effect (capstone) → 10 s cooldown after a successful
    proc, plus a top-of-screen split visual + chime when the duplicate
    spawns. Was a 1 s deferred mirror-pickup with no cooldown
- **Phantom node reworks**:
  - Phantom Blade — tick-based 160 px destroy zone every 3/2/1 s
    (was permanent aura)
  - Eternal Ember, Twilight Echo, Soulbound, Beyond, Shadow Regen, Razor
    Veil — new rank scaling and procs to match shipped capstones
  - Beyond duration buffed 0.33/0.66/1 s → 0.5/1/1.5 s
  - Ghostlight buffed 30/50/70 % → 40/60/80 % chance, radius 90 →
    120 px. Now explicitly triggers from Razor Veil and Phantom Blade
    kills (matches existing source-flag wiring)
- **Inferno node reworks** — Solar Flare, Cinder, Firebrand,
  Combustion, Conflagration, Second Flame, Coronal Hold (now reduces
  burst cooldown on nova kills), Critical Mass, SUN FORGE (15 s → 45 s
  cycle to match the buffed nova power). Cinder burn zones are
  world-static (no scroll) and last 2 s with 60 px lethal radius
- **Warp node reworks**:
  - Smooth Entry → "destroy radius around player on natural pickup
    activation" 80 / 140 / 200 px (was a wider forward barrier)
  - Slipstream — 15 s cooldown
  - Warp Harmonic — 20 s cooldown, +1/+2/+3 free stacks
  - Reservoir, Overdrive, Infinite Gate, SUPERLUMINAL — rewired around
    the shared-timer architecture
  - LINGERING HORIZON (capstone) → "Every 90 s, full-stacked hyperspeed
    auto-fires" with HUD countdown ring (was a 2 s post-hyperspeed
    forward barrier echo)
- **Bulwark node reworks** — Salvage 1/2/3 % → 2/5/10 %, Bastion II
  1/2/4/6/8 % per destroy with EMP-source exclusion guard
- **Backend allowlists** updated for IMPOSSIBLE — Lambda's score
  validation accepts the new difficulty in the score-submit and
  leaderboard-fetch paths

### Fixed
- **Impossible visibility refresh** — calling `refreshImpossibleVisibility`
  is hooked into the boot path and the PGS sync handler in addition to
  the main-menu path, so the IMPOSSIBLE button + leaderboard tab appear
  immediately on app launch (was previously hidden until the user
  finished a run or opened the upgrade tab)
- Square visual bug at the player during hyperspeed — old fillRect halo
  + rank-scaled aura collapsed to a circular geometry; aura radius is
  now constant regardless of Smooth Entry rank
- Diff selector overflow + leaderboard warning copy
- Text overflow fixes across the tree node tooltips
- Pixi / Canvas 2D parity for new visuals — every new draw lives on
  the Canvas 2D overlay above the Pixi stage so it renders identically
  in both modes

## [1.6.2] - 2026-04-23

### Added
- Google Play Games Services cloud save (optional, opt-in). Custom Capacitor
  plugin in Kotlin bridges the PGS v2 Snapshots API. First-launch sign-in
  prompt + settings toggle. Single snapshot `drift_save_v1` bundles
  `crystals`, `activeOrb`, `unlockedOrbs`, and per-difficulty scores. Merge
  rule is max-per-field (crystals, scores top-5/difficulty, unlocked orbs as
  set union; `activeOrb` stays local). Writes are 2 s debounced; local save
  paths are untouched when the user is signed out
- Privacy policy expanded with a dedicated PGS cloud-save section. New Terms
  of Service page at the repo root (GitHub Pages)
- `scripts/sync-version.js` version-sync script with `build.gradle` as source
  of truth. `npm run sync` / `npm run sync:check` prevent `GAME_VERSION` drift

### Changed
- Orb costs reduced: Phantom 50k→20k, Inferno 100k→40k, Warp 250k→100k,
  Fortress 350k→150k. Total unlock 750k → 310k (~41 % of old grind)
- Difficulty rebalance: post-cap speed ramp softened from +0.25/min to
  +0.10/min. Max body count ramp delayed from 2:00 to 3:00, increments per
  90 s instead of 60 s. Minimum 80 px spawn distance (horizontal + vertical
  AABB) prevents unfair clumping
- Toothed planet silhouette — `ext` formula changed from `sin(a)` to
  `(0.75 + 0.25 * |sin(a)|)` so all 8 blades stay long at horizontal angles.
  Collision math updated to match
- Heart top vessel trimmed: aorta width 13 → 9, tip extent reduced so the
  vessel stays inside the body radius

### Fixed
- DPR atlas pipeline across the render stack (`starAtlases`, `ringsCanvas`,
  `glowCanvas`, `getBgVignetteCanvas`, `getShieldRingCanvas`,
  `buildEyeVeinSprite`, `buildSkullFaceSprite`, `buildMirrorBodySprite`,
  `buildScreamingStaticSprite`, `buildHeartStaticSprite`, `pixiPlayerCanvas`,
  per-body `_offscreenCanvas`) — all offscreen canvases now DPR-scaled via
  an `atlasScale()` helper (capped at 2×). Crisp on 2×–3× DPR devices
- Cracked-planet draw cost: `buildCrackedSprite(b)` produces a deterministic
  static bake from `b.crackSeed` with cached gradients; ~40 per-frame strokes
  under `shadowBlur` eliminated (shadowBlur is expensive on Android WebView).
  Charge-up visual preserved via an alpha ramp. Cost went from ~50–150×
  heart/screaming to roughly equivalent

### Removed
- Adreno defensive workarounds from v1.5.x: bundle splits re-enabled (smaller
  per-device Play Store downloads), `largeHeap` removed from the manifest,
  WebView `setOffscreenPreRaster` removed. The PixiJS migration in v1.6.0
  already fixed the underlying Adreno mutex crash class

## [1.6.1] - 2026-04-22

### Added
- Frame-rate decoupled physics — dt-scaled variable timestep against a
  120 fps baseline. 29 Category A sites multiplied by `dtScale`, frame-count
  spawn cadences converted to ms timestamps, `decay()` helper for exponential
  drag patterns. Fixes the "game plays easier on 60 fps devices" bug; gameplay
  now feels identical at 30/60/120 Hz and under Android low-power throttling
- Internal QA sandbox — dev-only diagnostic mode with scroll pauseable,
  manual body/powerup spawning, god mode, and live FPS observation.
  Not exposed to players
- Heartbeat SFX synced to systole peaks on the heart planet

### Changed
- Body size tuning — phase 2+ minimum radii raised. Skull grows to 30 px to
  reinforce its bone-hazard identity
- Heart visual rework — anatomical silhouette with chamber structure,
  coronary arteries, and muscle fibre striations (was a stylised blob)
- Tentacle perf + polish — single quadratic Bézier per arm (was 10 discrete
  segments), 3 suckers (was 5), visible tip indicator orbs. ~6× draw-call
  reduction per tentacle
- Apocalypse audio pitched up (80→160 Hz, 120→240, 180→360) and routed
  through a `DynamicsCompressor` for mobile-speaker audibility

### Fixed
- Mirror planet input replay now horizontal-only (was applying to the vertical
  axis too, stopping bodies mid-scroll). Reflection dot colour now matches the
  equipped orb

## [1.6.0] - 2026-04-21

### Added
- Full PixiJS (WebGL) renderer migration: all 12 body types, player + trail, pickup/death/shard/crack/destroy particles,
  powerups, pair tethers, nebula, background imagery, star field, and screen overlays now draw via GPU-accelerated
  sprite batching on a dedicated `#pixiCanvas`. `#c` is empty in the normal render path; the Canvas 2D pipeline stays
  in the source as a fallback for WebViews where WebGL or the PIXI CDN load fails
- Screen shake is now applied as a single transform on the PixiJS stage root instead of per-layer shifts, so shakes
  stay pixel-perfect across every element that used to have its own offset
- Loading screen warms the PixiJS texture cache during preload: the atlases, per-body sprites, powerup halos, and
  overlay canvases are uploaded to the GPU before the first real frame so there's no first-spawn hitch
- Body preview developer tool — dev-only diagnostic page rendering
  every body type at rest with labels for rapid visual QA over the PixiJS sprite outputs
- Tappable pilot name on the main menu for quick name changes without going through the pause menu
- `TIME_DILATION` dev cheat constant for rapidly exercising late-phase gameplay and the apocalypse sequence during testing
- Gameplay FPS counter (top-right, mirrored from pause-button visibility via `MutationObserver`)

### Changed
- Powerup pickup burst now centres on the player instead of the pickup position
- Menu rendering worker removed — orb preview rendering consolidated back to the main thread now that PixiJS handles
  the heavy per-frame work; the `OffscreenCanvas` worker prototype from the v1.5.6 series is no longer needed

### Fixed
- Desktop browser (GitHub Pages) layout: `#pixiCanvas` was styled `position: fixed` with `width/height: 100%`, which
  made it fill the full viewport even though its backing buffer was capped at the phone-shaped `430×932` desktop
  playfield — the whole render stack got CSS-stretched across widescreen monitors. Changed to `position: absolute`
  so it's contained by `#gameWrapper` (itself `position: fixed`, so Capacitor/full-viewport behaviour is unchanged)
- Adreno GPU mutex crashes on certain Qualcomm devices eliminated: the Canvas 2D workload was exercising a driver
  path that deadlocked under sustained load; the WebGL renderer routes all draws through a single GL command stream
  that the driver handles cleanly
- Late-phase / apocalypse-phase gameplay now sustains 110–120 FPS on the test device, up from ~50–60 FPS on the
  Canvas 2D path

### Removed
- `OffscreenCanvas` menu worker prototype (superseded by the main-thread PixiJS renderer)
- Per-frame procedural Canvas 2D draw calls for bodies, player, particles, powerups, overlays — `#c` is empty in
  normal rendering; retained as the fallback surface only

## [1.5.6] - 2026-04-20

### Changed
- Android: WebView offscreen pre-rasterization enabled and `largeHeap` declared on the manifest so sustained runs
  have more JS-heap headroom before the pressure watchdog starts evicting caches

## [1.5.5] - 2026-04-20

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
- Added Sentry fire-test diagnostic to verify error reporting wiring on any build

### Known issues
- Qualcomm Adreno GPU driver crashes on a small number of devices still being monitored;
  configChanges fix from v1.5.4 is the current mitigation
- Progression state (crystals, orbs) remains localStorage-only; cloud save via Google Play Games
  planned before production release

## [1.5.4] - 2026-04-20

_Collects the changes that shipped across the rapid-iteration v1.5.1 → v1.5.4 series (loading screen, analytics
dashboard, draw-call optimizations, powerup rebalancing, stability hardening) in a single entry._

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

[1.6.5.1]: https://github.com/selimcelem/drift/releases/tag/v1.6.5.1
[1.6.5]: https://github.com/selimcelem/drift/releases/tag/v1.6.5
[1.6.4]: https://github.com/selimcelem/drift/releases/tag/v1.6.4
[1.6.3]: https://github.com/selimcelem/drift/releases/tag/v1.6.3
[1.6.2]: https://github.com/selimcelem/drift/releases/tag/v1.6.2
[1.6.1]: https://github.com/selimcelem/drift/releases/tag/v1.6.1
[1.6.0]: https://github.com/selimcelem/drift/releases/tag/v1.6.0
[1.5.6]: https://github.com/selimcelem/drift/releases/tag/v1.5.6
[1.5.5]: https://github.com/selimcelem/drift/releases/tag/v1.5.5
[1.5.4]: https://github.com/selimcelem/drift/releases/tag/v1.5.4
[1.5.0]: https://github.com/selimcelem/drift/releases/tag/v1.5.0
[1.4.0]: https://github.com/selimcelem/drift/releases/tag/v1.4.0
[1.3.0]: https://github.com/selimcelem/drift/releases/tag/v1.3.0
[1.2.0]: https://github.com/selimcelem/drift/releases/tag/v1.2.0
[1.1.0]: https://github.com/selimcelem/drift/releases/tag/v1.1.0
[1.0.0]: https://github.com/selimcelem/drift/releases/tag/v1.0.0
