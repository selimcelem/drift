# WARP REWORK — DESIGN PROPOSAL v3 (no implementation)

> Status: **proposal only**, no code changed. Numbers are iterable. Grounded in the
> current `www/index.html` as of this branch. Line numbers are approximate anchors.
>
> **v3 changes (this pass):**
> - **Breakaway rebalanced down** from ×1.45 → **×1.11 (+11%)**, derived from the actual
>   `computeHyperspeedPeakMult` formula so a fully-upgraded **Blueshift (Velocity)** tree only
>   *matches* a fully-upgraded **Singularity (Cap)** tree at the **~3-minute** mark, not earlier
>   (see [§3](#3-velocity-path--blueshift), the new [Part-1 crossover math in §9](#9-balance-landmines)).
> - **Lightspeed cap-growth slowed** from +1 cap / 60s → **+1 cap / 90s** (matches Lingering Horizon).
> - **Two cap-growth capstones stacking is explicitly ALLOWED** (Lightspeed + Lingering Horizon = +2 cap / 90s),
>   **not gated** — the shared `NEBULA_MAX_CAP_CEILING` is the only bound. [§9](#9-balance-landmines)'s realistic
>   ceiling recalculated for both running together.
> - **Presentation requirements baked in:** flash text for every *active-trigger* skill (passives don't flash);
>   keystone lore flavor lines for Blueshift / Continuum / Overdrive; screenshake/hitstop spec per new trigger;
>   `RIFT.mp3` wired to the Singularity rift. See [§3](#3-velocity-path--blueshift)–[§5](#5-cap-path--singularity), [§14](#14-flash-text-feedback-plan), [§16](#16-implementation-notes), and the new [§17](#17-presentation-screenshake--hitstop--audio).
> - **All node descriptions rewritten player-facing** with proc chances / activation requirements / cooldowns stated inline.
>
> **v2 changes (prior pass):** added the mechanics analysis confirming **stack cap is the
> dominant velocity lever** (peak scales *linearly* with stacks); reworked Reentry,
> Infinite Gate, Critical Velocity, and Singularity; both Lightspeed and Lingering
> Horizon now **grow max cap over time** (gated by a new hard ceiling); Bow Shock gains
> a barrier-visual no-clip requirement; Slipstream's stack-vs-refresh behavior defined.

## Table of Contents
- [0. Code-Grounded Facts](#0-code-grounded-facts)
- [1. Current Warp Inventory](#1-current-warp-inventory)
- [2. Proposed Path Identities](#2-proposed-path-identities)
- [3. VELOCITY path — BLUESHIFT](#3-velocity-path--blueshift)
- [4. DURATION path — CONTINUUM](#4-duration-path--continuum)
- [5. CAP path — SINGULARITY](#5-cap-path--singularity)
- [6. Skill Consolidation Plan](#6-skill-consolidation-plan)
- [7. Renamed / Repositioned Nodes](#7-renamed--repositioned-nodes)
- [8. Baseline Advantage Removal](#8-baseline-advantage-removal)
- [9. Balance Landmines](#9-balance-landmines)
- [10. Auto-Fire HUD Ring Preservation](#10-auto-fire-hud-ring-preservation)
- [11. Defined Terms](#11-defined-terms)
- [12. Cross-Tree and Cross-Orb Concerns](#12-cross-tree-and-cross-orb-concerns)
- [13. Cost Sanity Check](#13-cost-sanity-check)
- [14. Flash Text Feedback Plan](#14-flash-text-feedback-plan)
- [15. Open Design Questions for User](#15-open-design-questions-for-user)
- [16. Implementation Notes](#16-implementation-notes)
- [17. Presentation: Screenshake / Hitstop / Audio](#17-presentation-screenshake--hitstop--audio)

---

## 0. Code-Grounded Facts

**Hyperspeed model (single shared timer, v1.6.3 architecture):**
- `HYPERSPEED_DURATION_MS = 3000` (3s base). `HYPERSPEED_DURATION()` adds `+500ms × rankOf('reservoir')` for nebula only (line ~14953).
- One shared `hyperspeedEndTime`. Each `activateHyperspeed()` increments `hyperSpeedStacks` (capped at `HYPERSPEED_MAX_STACKS()`) and pushes the timer to `now + duration` (never shrinks). All stacks clear at once on expiry (line ~21807–21837).
- **Peak velocity multiplier** (`computeHyperspeedPeakMult`, line ~20438): `basePeak = max(3.5·thrustMult·s, (6.0·thrustMult·s)/normSpd)` where `s` = stacks. `thrustMult = 1 + [0.20,0.30,0.40][thrustRank-1]` (nebula only). Breakaway multiplies `basePeak ×(1 + [0.15,0.30,0.45][rank-1])` **when `s ≥ cap`**. Scroll during hyperspeed = `normalScrollSpeed() × hyperspeedCurrentMult` (line 16931).
- **Deceleration:** `hyperspeedCurrentMult` ramps linearly from `peakMult → 1×` across the shared-timer duration (line ~21818). So "velocity" is a *spike that decays*, not a flat boost.
- **Hyperspeed barrier** (line ~22441): active only while `activeEffects.hyperspeed > 0 && hyperspeedCurrentMult > 1.05`. Fixed **60px** half-width, 360° kill of bodies + crack fragments, calls `checkDestroyProc(b,'nova')`. Player invuln during hyperspeed: `hyperInvuln = activeEffects.hyperspeed > 0 && hyperSpeedStacks >= 1` (line ~21007).

**Stack cap (the advantage to remove):**
- `HYPERSPEED_MAX_STACKS_DEFAULT = 2`, `HYPERSPEED_MAX_STACKS_NEBULA = 4` (line 14943–14944).
- `_HYPERSPEED_MAX_STACKS_default()`: base = 4 if `nebula||rainbow` else 2; nebula adds `+rankOf('overdrive')` and `+2` if `hasCapstone('superluminal')`. Caps today: base 4 → up to 8 (4 + Overdrive 2 + Superluminal 2).
- `drifterV2` has its OWN override (`ORB_BEHAVIOR.drifterV2.hyperspeedMaxStacks`, line 9937): default base + Breaking Point bonus, hard max 10. **Independent of nebula.**

**Second built-in advantage ("stacks faster"):** natural hyperspeed pickup runs `activateHyperspeed('natural')` then, **for nebula/rainbow, a SECOND `activateHyperspeed('natural')`** (`rawActivate`, line 20147–20150) → **+2 stacks per pickup**. ORB_DEFS desc (line 4990): *"Hyperspeed stacks faster. Higher cap."* confirms both.

**Burst (the keeper):** nebula burst = two `activateHyperspeed()` calls (line 21278–21282). Not a real `hyperspeed_hyperspeed` COMBO_DEFS entry (same-type pairs fall through `comboKey` to the raw fallback); it's literally two stacks. **Retain as-is.**

**Spawn bias:** `bias: 'hyperspeed'` (ORB_DEFS). Used to 2× weight pair combos containing the bias type (line ~18972) and bias single spawns. **Universal per-orb identity** — Inferno kept `'nova'`, Phantom `'ghost'`, etc.

**Current capstones:**
- `superluminal` — "+2 stack cap (stacks with Overdrive)." Passive. **In `RAINBOW_CAPSTONES`** (line 13588: `{'superluminal','aegis'}`).
- `eventHorizon` (display **LINGERING HORIZON**) — every `LINGERING_HORIZON_CYCLE_MS` (90s) auto full-stack hyperspeed (`tickCapstoneTimers`, line ~13386). Jumps stacks to `cap-1` then one `activateHyperspeed('lingeringHorizon')`. **Has a HUD cooldown ring** (`#capCdEventHorizon`, label "HORIZON", line 3099; wired in the cap-cd updater line ~27366 via `lingeringHorizonNextFireTime` / `lingeringHorizonLastFireTime`).

**Multi-rank node values (current, at max rank):** see [§1](#1-current-warp-inventory).

**Other Warp nodes' real values/cooldowns (code, not desc):**
- `slipstream`: chances `[1,2,3,4,6]%` by rank; **15s CD** in code (`slipstreamNextProcTime = now + 15000`, line ~13245) despite "20s" in desc; grants a hyperspeed stack on destroy (2 for nebula/rainbow).
- `infiniteGate`: gates at **`hyperSpeedStacks >= 5`**, **20s CD**, `+[0.5,1,1.5]s` to shared timer on a **natural** pickup (line ~20477). (Stale code comment says "7+ / 10s" — actual is 5+/20s.)
- `warpHarmonic`: on `nova_hyperspeed | hyperspeed_ghost | hyperspeed_shield` combos, `+rank` free stacks, **20s CD** (line ~20090).
- `afterburn`: launches `rank` landing discs on hyperspeed end (`scheduleAfterburnDiscs`, line ~20290; disc kill loop line ~22491).
- `smoothEntry` (display **Momentum**): −`[0.1,0.2,0.3]%` of burst base per body destroyed during active hyperspeed (in `checkDestroyProc`, line ~13432).

**Architecture status:** nebula is **pre-rework** — NO `ActiveBudget.register('nebula',…)`, NO `ORB_BEHAVIOR.nebula`, NO `_nebula_` flash system, NO schema-version/migration, NOT in the `mergeTrees` shape guard (only cyan/cosmic/solar guarded, line 14267–14276). Reworked orbs (cyan/cosmic/solar/drifterV2) all follow: `ActiveBudget.register` + `ORB_BEHAVIOR.<orb>.{rankOf,pathPrereqMet,respecNode,respecTree,fullTreeRespecCost}` + `<ORB>_KEYSTONES/_PREREQS/_PATH_COLORS/_TREE_LAYOUTS` + `maybeMigrate<Orb>()` on `afterLoadTreeState` + `_<orb>_addFlash/_flash/_drawFlashes`.

**ActiveBudget config reference (solar, line 7503):** `{ base: 20, expandMax: 5, expandCost: 2000, bonusKey: 'drift_solar_budget_bonus', keystones, prereqs }`.

---

## 1. Current Warp Inventory

| Node (key) | Path | Tier | Max rank | Effect at max | Impact | Disposition |
|---|---|---|---|---|---|---|
| Thrust (`thrust`) | Velocity | 1 | 3 | +40% peak velocity coefficient | Core speed scaler | **Redesign → keystone Blueshift** |
| Afterburn (`afterburn`) | Velocity | 2 | 3 | 3 forward discs on hyperspeed end | Detonation tail | **Reuse** (Velocity T2) |
| Breakaway (`breakaway`) | Velocity | 3 | 3 | +45% peak at max stacks | At-cap payoff | **Reuse** (Velocity support) |
| Reservoir (`reservoir`) | Endurance | 1 | 3 | +1.5s duration (3→4.5s) | Uptime | **Redesign → keystone Continuum** |
| Overdrive (`overdrive`) | Endurance | 2 | 2 | +2 stack cap | Cap | **Redesign → keystone Overdrive (Cap path)** |
| Infinite Gate (`infiniteGate`) | Endurance | 3 | 3 | +1.5s timer at 5+ stacks (20s CD) | Uptime extend | **Reuse, re-gated** (Duration T2 — now triggers at *max* stacks, not literal 5+) |
| Momentum (`smoothEntry`) | Drift | 1 | 3 | −0.3% burst CD per hyperspeed kill | Burst loop | **Reuse → Velocity (Ramjet)** |
| Slipstream (`slipstream`) | Drift | 2 | 5 | 6% per destroy → +1 stack (15s CD) | Stack generation | **Reuse** (Duration support) |
| Warp Harmonic (`warpHarmonic`) | Drift | 3 | 3 | +3 free stacks on hyperspeed combo (20s CD) | Stack generation | **Reuse** (Cap support) |
| SUPERLUMINAL (`superluminal`) | capstone | — | — | +2 stack cap | Cap | **Demote → Cap support** |
| LINGERING HORIZON (`eventHorizon`) | capstone | — | — | 90s auto full-stack hyperspeed | Uptime | **Reuse → Duration capstone** |

The existing tree already clusters cleanly into the user's three levers: VELOCITY (Thrust/Breakaway/Afterburn), DURATION (Reservoir/Infinite Gate/Lingering Horizon/Slipstream), CAP (Overdrive/Superluminal/Warp Harmonic). The DRIFT path dissolves; its three nodes redistribute.

---

## 2. Proposed Path Identities

> Palette must dodge: Roamer amber/teal/red · Phantasm violet/cyan/pink · Drifter cyan/amber/magenta · Phantom indigo/magenta/lavender · Inferno fire. Warp's anchor is azure `96,165,250`. The triad below stays in the blue family but separates by **saturation/lightness** so the three read distinctly. (Collision risk flagged in [§15](#15-open-design-questions-for-user).)

### VELOCITY → **BLUESHIFT** — color `74,150,255` (saturated azure)
> *"You don't last longer or hold more — you go faster than anything on the screen."*
- **Playstyle:** spike the peak multiplier as high as possible; weaponize the barrier and the speed itself; kill on entry, detonate on exit.
- **Keystone (Blueshift):** *Hyperspeed peak velocity is sharply higher (+40% to the speed coefficient). The faster you tear through space, the more the screen blueshifts around you.*

### DURATION → **CONTINUUM** — color `150,205,255` (pale ice-blue)
> *"Once you're in warp, you stay there."*
- **Playstyle:** maximize hyperspeed uptime; chain pickups/kills to keep the shared timer alive; near-permanent (but gated) warp field.
- **Keystone (Continuum):** *Hyperspeed lasts +1.5s, and every stack gained while already hyperspeeding extends the shared timer (up to a hard ceiling). Warp becomes a state you live in, not a burst you trigger.*

### CAP → **SINGULARITY** — color `120,90,225` (cobalt-violet)
> *"Every stack is mass. Hold enough and space bends."*
- **Playstyle:** push the stack cap and reliably reach it; high stacks aren't just raw speed — they unlock a gravity-well payoff.
- **Keystone (Overdrive):** *Hyperspeed stack cap +2 (from the new generic baseline of 2 → 4). The ceiling on everything hyperspeed does is yours to raise.*

---

## 3. VELOCITY path — BLUESHIFT

| Node | Type | Active | Crystals | Player-facing description | Disposition | Notes |
|---|---|---|---|---|---|---|
| **Blueshift** | Keystone | 5 | 6,500 | *KEYSTONE.* "Your hyperspeed tears **+40% faster** through space. Space doesn't get out of your way — you blueshift it." | Redesign of `thrust` | thrustMult `1.40`; scales the `3.5/6.0` peak terms. **Passive — no flash.** |
| **Ramjet** | Support T1 | 2 | 2,500 | "Every planet you destroy *while in hyperspeed* shaves **0.3%** off your burst cooldown." | Reuse `smoothEntry` | Self-contained; rewards killing while fast. **Passive per-kill stat — no flash.** |
| **Breakaway** | Support T1 | 2 | 2,500 | "**At max hyperspeed stacks**, your peak speed is boosted a further **+11%**." | Reuse `breakaway` | **v3:** coefficient cut ×1.45 → **×1.11**. **Multiplicative** with Blueshift: `basePeak × 1.40 (Blueshift) × 1.11 (Breakaway) = ×1.554` at max stacks. Tuned so Velocity only *matches* Cap at ~3 min — see the [Part-1 crossover math in §9](#9-balance-landmines). **Passive (conditional) — no flash.** |
| **Bow Shock** | Support T2 | 3 | 5,000 | "Your hyperspeed barrier reaches **30px farther** (60 → 90px), shredding planets from a wider berth." | **New** | Modest, deliberately *not* full-screen (see [§9](#9-balance-landmines)). **Must not clip the barrier visual:** the PIXI barrier renders into a fixed **200×200** offscreen canvas (`PIXI_HYPER_BARRIER_SIZE`, line 3594) centered on the player; a 90px barrier + its `halfW×1.5` glow (135px) overflows that box. Bow Shock must drive a **shared `halfW`** read by both the kill loop (line ~22453) and `drawHyperspeedBarrier` (hardcoded `halfW=60`, line 27507) **and grow the offscreen canvas** to fit. See [§16](#16-implementation-notes)/[§17](#17-presentation-screenshake--hitstop--audio). **Passive width — no flash** (but its widened kills shake; see §17). |
| **Afterburn** | Support T1 | 2 | 2,500 | "When hyperspeed ends, you launch **3 forward discs** that fly out, expand, and destroy what they hit." | Reuse `afterburn` | Exit payoff; already implemented + pause-safe. **Active trigger → flashes "AFTERBURN" (Blueshift color) on hyperspeed end.** |
| **Lightspeed** | Capstone | 5 | 8,500 | *CAPSTONE.* "**While at max stacks your top speed never decays** — you hold peak velocity (and a lethal barrier) for the entire hyperspeed instead of slowing down. **And every 90s, your max stack cap rises by +1** (up to the cap ceiling). Light has no brakes." | **New** | Endgame-defining. **v3:** cap-growth slowed **+1/60s → +1/90s** (matches Lingering Horizon). Both effects gated (max-stacks / finite timer / cap ceiling). **Active triggers → flash "LIGHTSPEED" (engage) and "MAX CAP +1" (on each +1).** |

**Path totals:** 19 active points · 27,500 crystals · 6 nodes.
**Keystone justification:** Blueshift is the single biggest lever on what hyperspeed *feels* like — raw speed — so it gates the path. **Capstone justification:** Lightspeed removes the decay that defines baseline hyperspeed, the dramatic "I am now a screen-clearing beam" moment, comparable to Stellar Collapse / Eclipse in scope.

---

## 4. DURATION path — CONTINUUM

| Node | Type | Active | Crystals | Player-facing description | Disposition | Notes |
|---|---|---|---|---|---|---|
| **Continuum** | Keystone | 5 | 6,500 | *KEYSTONE.* "Hyperspeed lasts **+1.5s** longer, and **every stack you gain while already in warp extends it another +0.5s** (up to +3s per warp). Once you're in the continuum, you stay there." | Redesign of `reservoir` | +1.5s base (3 → 4.5s); extend-on-stack capped at **+3s/instance** (anti-runaway gate). **Active trigger → flashes "CONTINUUM" on each extend (≥400ms throttle).** |
| **Slipstream** | Support T1 | 2 | 2,500 | "**6% chance** whenever you destroy a planet to gain a hyperspeed stack (or, if already maxed, refresh your warp timer). **15s cooldown.**" | Reuse `slipstream` | **Stack-vs-refresh, defined:** it calls `activateHyperspeed()`, which (a) increments stacks **only if below cap**, and (b) **always** pushes `hyperspeedEndTime` to `now + duration`. So **below cap → +1 stack *and* timer refresh**; **at max stacks → pure timer refresh**. **Active trigger → flashes "SLIPSTREAM" on proc (15s CD).** |
| **Drag Coefficient** | Support T1 | 2 | 2,500 | "Your hyperspeed speed bleeds off **30% slower**, so you stay fast deeper into each warp." | **New** | Pure duration-of-*speed* value. **Passive ramp modifier — no flash.** |
| **Reentry** | Support T1 | 2 | 2,500 | "When hyperspeed ends, you **drop out with a fresh shield** to cover the vulnerable exit." | **Redesign (was: post-hyperspeed invuln grace)** | +1 shield hit, standard non-fortress duration. Changed because Warp is already invuln *during* hyperspeed. See [§16](#16-implementation-notes) for shield-system interaction. **Active trigger → flashes "REENTRY" on hyperspeed end.** |
| **Infinite Gate** | Support T2 | 3 | 5,000 | "**At max stacks**, picking up another hyperspeed orb extends your warp timer **+1.5s**. **20s cooldown.**" | Reuse `infiniteGate` (**re-gated**) | Was gated at literal `>=5` stacks; now gates at **`== cap`** (max stacks), so it scales with the now-variable cap. Natural-pickup-only, 20s CD retained, counts against Continuum's +3s/instance ceiling. **Active trigger → flashes "INFINITE GATE" on proc (20s CD).** |
| **Lingering Horizon** | Capstone | 5 | 8,500 | *CAPSTONE.* "**Every 90s** you automatically snap to **full-stack hyperspeed**, and **your max stack cap rises by +1** (up to the cap ceiling). The horizon never quite arrives — you just keep falling toward it." | Reuse `eventHorizon` | Endgame uptime engine; **keeps its existing HUD ring** ([§10](#10-auto-fire-hud-ring-preservation)). **v3:** its +1/90s cap growth and Lightspeed's (now also +1/90s) **stack freely** — running both = +2 cap / 90s, intended and ungated (only the ceiling bounds it; see [§9](#9-balance-landmines)). **Active trigger → flashes "LINGERING HORIZON" on fire + HUD ring.** |

**Path totals:** 19 active points · 27,500 crystals · 6 nodes.
**Keystone justification:** Continuum changes the fundamental cadence (warp as a sustained state). **Capstone justification:** Lingering Horizon is a periodic free full-power hyperspeed — already the strongest uptime tool, fits the path perfectly, and is the only timed auto-fire (HUD ring).

---

## 5. CAP path — SINGULARITY

| Node | Type | Active | Crystals | Player-facing description | Disposition | Notes |
|---|---|---|---|---|---|---|
| **Overdrive** | Keystone | 5 | 6,500 | *KEYSTONE.* "Your hyperspeed holds **+2 more stacks** (2 → 4). Every stack is mass — give yourself room to hold more of it." | Redesign of `overdrive` | Restores the *old* Warp baseline of 4 — but now a chosen keystone, not free. **Passive cap — no flash.** |
| **Superluminal** | Support T1 | 2 | 2,500 | "Hyperspeed stack cap **+1** (→ 5)." | Demote `superluminal` (was capstone) | Stacks additively with Overdrive. **Passive cap — no flash.** |
| **Warp Harmonic** | Support T1 | 2 | 2,500 | "When you land a **hyperspeed combo**, gain **+3 free stacks** instantly. **20s cooldown.**" | Reuse `warpHarmonic` | Fires on `nova_hyperspeed`/`hyperspeed_ghost`/`hyperspeed_shield`; helps you *reach* the higher cap. **Active trigger → flashes "WARP HARMONIC" on proc (20s CD).** |
| **Critical Velocity** | Support T1 | 2 | 2,500 | "**At max stacks**, every planet you destroy has a **10% chance** to detonate a **nova blast** at the kill. **15s cooldown.**" | **Redesign (was: max-stack invuln)** | Old version was redundant — the player is *already* fully invuln during hyperspeed. New offense payoff for holding the cap; mirrors the Firebrand/Halo proc-nova pattern. **Active trigger → flashes "CRITICAL VELOCITY" on proc (15s CD).** |
| **Resonant Mass** | Support T2 | 3 | 5,000 | "Every hyperspeed stack **beyond the 2nd** adds **+8% peak speed** — a raised cap turns straight into velocity, even without the Blueshift tree." | **New** | Self-contained reason to raise the cap. Multiplicative on `basePeak` (see [§9](#9-balance-landmines)). **Passive — no flash.** |
| **Singularity** | Capstone | 5 | 8,500 | *CAPSTONE.* "**On reaching max stacks, a 20% chance to tear open a RIFT** in space at your position. It hangs for **2.5s**, dragging in nearby planets and destroying them on contact. Fires **once per hyperspeed**, **20s cooldown**. Hold enough mass and space simply gives way." | **Redesign (was: sustained gravity-well disc)** | Endgame-defining: a space-tearing event with a bespoke vertical-tear visual distinct from Bulwark's Black Hole. Probabilistic + per-instance + 20s CD gating. **Uses the new `RIFT.mp3`** ([§17](#17-presentation-screenshake--hitstop--audio)). **Active trigger → flashes "SINGULARITY" once per instance (20s CD).** |

**Path totals:** 19 active points · 27,500 crystals · 6 nodes.
**Keystone justification:** Overdrive is literally the cap lever; nothing else in the path matters without it. **Capstone justification:** Singularity gives the cap a *reason to exist beyond speed* — a gravity-well kill burst gated to max-stack moments, distinct from Bulwark's shield-bound Gravity Well/Black Hole.

---

## 6. Skill Consolidation Plan

| Original | Original effect | New disposition | Reasoning |
|---|---|---|---|
| `thrust` (T1×3) | +40% peak coeff | → **Blueshift keystone** (single-rank 40%) | Biggest velocity lever ⇒ the Velocity identity. |
| `breakaway` (T3×3) | +45% at max stacks | → **Velocity T1 support** (45%) | At-cap payoff; supports, doesn't define. |
| `afterburn` (T2×3) | 3 discs on end | → **Velocity T2 support** (3 discs) | Already a discrete, implemented effect. |
| `reservoir` (T1×3) | +1.5s duration | → **Continuum keystone** (+1.5s + extend-on-stack) | Promote: duration is a whole identity now. |
| `infiniteGate` (T3×3) | +1.5s at 5+ (20s CD) | → **Duration T2 support** (1.5s) | Already gated; fits uptime. |
| `slipstream` (T2×5) | 6%/destroy → stack | → **Duration T1 support** (6%) | Stack-on-kill = uptime fuel; collapse 5 ranks → 6%. |
| `overdrive` (T2×2) | +2 cap | → **Overdrive keystone** (+2) | The cap lever ⇒ the Cap identity. |
| `superluminal` (capstone) | +2 cap | → **Cap T1 support** (+1) | Capstone slot freed; demote to a +1 support so caps don't balloon (see [§9](#9-balance-landmines)). |
| `warpHarmonic` (T3×3) | +3 free stacks (20s CD) | → **Cap T1 support** (+3) | Stack generation = reach the cap. |
| `smoothEntry`/Momentum (T1×3) | −0.3% burst CD/kill | → **Velocity T1 (Ramjet)** (−0.3%) | Speed-build burst loop. |
| `eventHorizon`/Lingering Horizon (capstone) | 90s auto full-stack | → **Duration capstone** (+ **+1 max cap / 90s**, v2) | Uptime engine; keeps HUD ring; now also grows the cap (ceiling-clamped). Stacks freely with Lightspeed's +1/90s (v3). |
| **DRIFT path** | — | **Dissolved** | Its 3 nodes redistribute to Velocity/Duration/Cap. |

**New nodes (7):** Bow Shock (V), Lightspeed (V cap), Drag Coefficient (D), Reentry (D — shield-on-end, v2), Critical Velocity (C — proc-nova, v2), Resonant Mass (C), Singularity (C cap — RIFT, v2). All defined above.

---

## 7. Renamed / Repositioned Nodes

| Old key / name | New key / name | Why |
|---|---|---|
| `eventHorizon` "LINGERING HORIZON" | keep behavior; **rename key → `lingeringHorizon`** (display "LINGERING HORIZON") | "Event Horizon" wording is freed for the Singularity flavor; key rename is safe because migration **resets** the tree (no in-place upgrade). HUD ring `data-cap` + id must update in lockstep ([§10](#10-auto-fire-hud-ring-preservation)). |
| `smoothEntry` (display "Momentum") | display **"Ramjet"**; **keep key `smoothEntry`** | Key is referenced in `checkDestroyProc`; reset migration means we *could* rename, but keeping the key minimizes churn. Display rename only. |
| `superluminal` capstone | `superluminal` **support** | Structural demotion; same key, new tier/cost/value. |
| `overdrive` T2 support | `overdrive` **keystone** | Structural promotion; same key. |
| `reservoir` T1 | `reservoir`→ **`continuum`** keystone (or keep `reservoir` key, display "Continuum") | Recommend keeping key `reservoir`, display "Continuum", to reduce churn. |

> No collisions with other orbs' node keys (verified: `overdrive/superluminal/thrust/breakaway/afterburn/reservoir/infiniteGate/slipstream/warpHarmonic/smoothEntry/eventHorizon` are nebula-only). New names (Blueshift/Bow Shock/Lightspeed/Continuum/Drag Coefficient/Reentry/Singularity/Critical Velocity/Resonant Mass) don't collide with COMBO_DEFS or other trees.

---

## 8. Baseline Advantage Removal

Warp's unupgraded state must equal a generic orb. Remove **both** built-in advantages:

1. **Stack cap 4 → 2.** In `_HYPERSPEED_MAX_STACKS_default()` (line 14945): drop the nebula base-of-4 special case so nebula uses `HYPERSPEED_MAX_STACKS_DEFAULT = 2`. The `+rankOf('overdrive')` / `+superluminal` additions then build *up from 2* via the tree (Overdrive +2 → 4, +Superluminal +1 → 5; +Resonant Mass is speed, not cap). **Decision:** keep `HYPERSPEED_MAX_STACKS_NEBULA` constant deleted or set = 2.
2. **+2 stacks per pickup → +1.** In `rawActivate` (line 20150): delete the nebula/rainbow second `activateHyperspeed('natural')` so a natural pickup grants **+1 stack**, like every other orb.

**Retained baseline (confirmed):** the nebula burst's **two** `activateHyperspeed()` calls (line 21278–21282) stay — "burst = 2× hyperspeed."

**Spawn bias `'hyperspeed'`:** **recommend KEEP.** It's the universal per-orb identity weighting (Inferno kept `'nova'`, etc.), not a Warp-specific power advantage. Flagged in [§15](#15-open-design-questions-for-user) in case you want Warp fully bias-neutral.

**Reservoir/HYPERSPEED_DURATION:** baseline duration stays 3s; the `+500ms × reservoir` becomes the Continuum keystone's +1.5s (single-rank). No baseline duration advantage exists to remove.

**Net unupgraded Warp = generic orb:** cap 2, +1/pickup, 3s duration, 60px barrier only while hyperspeeding, burst = 2 stacks.

---

## 9. Balance Landmines

**Cap is the dominant velocity lever (Part-1 finding).** `basePeak` scales **linearly with stack count** (`3.5·thrustMult·s`), so raising the cap (and filling it) is mathematically the strongest way to increase scroll velocity: cap 2 → 5 is `×2.5` peak (+150%), beating the **rebalanced** Blueshift×Breakaway combined (`×1.554`, +55%; was `×2.03` at the old ×1.45 Breakaway). This makes the **two cap-growth capstones a real runaway risk**: Lightspeed (now **+1 cap / 90s**, v3) and Lingering Horizon (+1 cap / 90s) both push the *strongest* stat, and `hyperspeedCurrentMult` has **no upper clamp in code** — so unbounded cap growth = unbounded scroll-speed spike.

### Part-1: Breakaway crossover derivation (the ~3-minute design target)

**Goal:** a fully-upgraded **Blueshift (Velocity)** tree should only *match* the scroll speed of a fully-upgraded **Singularity (Cap)** tree **after ~3 minutes** — the Cap tree is faster early, the Velocity tree catches up as Lightspeed's cap bonuses accrue.

**The formula (verbatim from `computeHyperspeedPeakMult`, line ~20440):**
```
basePeak = max(3.5·thrustMult·s, (6.0·thrustMult·s)/normSpd)
         = thrustMult · s · C,   where C = max(3.5, 6.0/normSpd)   ← common to both trees
peak     = basePeak · (Breakaway factor at max stacks) · (Resonant Mass factor)
```
Because `C` factors out of *both* trees identically (same `normSpd`, same term-selection), **the crossover is independent of `normSpd`** — it cancels.

**Cap (Singularity) tree, fixed:**
- Cap = base 2 + Overdrive (+2) + Superluminal (+1) = **5** (no time growth — Singularity is the RIFT, not a cap-grower).
- `thrustMult = 1.0` (no Blueshift). Resonant Mass at 5 stacks = `1 + 0.08·(5−2) = ×1.24`.
- **Cap peak = C · 1.0 · 5 · 1.24 = 6.20·C.**

**Velocity (Blueshift) tree, time-dependent:**
- `thrustMult = 1.40` (Blueshift). No Cap-path nodes, so its cap starts at **base 2** and grows only via **Lightspeed (+1 / 90s)**.
- Breakaway factor at max stacks = `(1 + B)`, solving for `B`. (Resonant Mass is Cap-path; the pure Velocity build has none.)
- **Velocity peak = C · 1.40 · sᵥ · (1 + B)**, where `sᵥ` = current cap (= filled stacks at max).

**Lightspeed cap timeline (v3, +1/90s from base 2):**
| Time | sᵥ (Velocity cap) |
|---|---|
| 0–90s | 2 |
| 90–180s | 3 |
| **180s (3 min)** | **4** |
| 270s | 5 (then strictly exceeds Cap) |

**Set the crossover at the 3-minute mark (sᵥ = 4):**
```
Velocity peak (sᵥ=4) = Cap peak
C · 1.40 · 4 · (1 + B) = 6.20·C
5.60 · (1 + B)        = 6.20
(1 + B)               = 1.107
B                     = 0.107  ≈ +11%
```
→ **Breakaway = ×1.11 (+11%)**, down from the old ×1.45. `5.60 × 1.11 = 6.216 ≈ 6.20` → Velocity hits **100.3%** of Cap exactly at the 3-minute mark, then pulls ahead at sᵥ=5 (270s).

**Crossover band check (discrete stacks).** The match must land at sᵥ=4 (3 min), *not* sᵥ=3 (90s):
- **at sᵥ=3 (90s):** `1.40·3·(1+B) < 6.20` ⟹ `(1+B) < 1.476` ⟹ `B < 0.476` ✓ (0.11 ≪ 0.476 → still behind at 90s)
- **at sᵥ=4 (180s):** `1.40·4·(1+B) ≥ 6.20` ⟹ `(1+B) ≥ 1.107` ⟹ `B ≥ 0.107` ✓ (0.11 ≥ 0.107 → matches at 180s)

Any `B ∈ [0.107, 0.476)` lands the discrete crossover at exactly 3 min; **0.11** sits at the bottom of that band so the match is a near-exact tie rather than an early overshoot. **The old ×1.45 (B=0.45) matched Cap at sᵥ=3 ≈ 90s** (`1.40·3·1.45 = 6.09 ≈ 6.20`) — i.e. ~2 minutes too early, confirming the prior coefficient was too strong.

**Sanity table (× C, the common factor):**
| Time | Velocity cap sᵥ | Velocity peak (×1.40×1.11) | Cap peak (fixed) | Faster |
|---|---|---|---|---|
| 0–90s | 2 | 3.11·C | 6.20·C | **Cap** |
| 90–180s | 3 | 4.66·C | 6.20·C | **Cap** |
| **180s** | **4** | **6.22·C** | **6.20·C** | **≈ tie (match)** |
| 270s+ | 5 | 7.77·C | 6.20·C | **Velocity** |

→ **Recommended Breakaway coefficient: `0.11` (×1.11), single-rank.** (The exact solve is 0.107; round to 0.11 for a clean near-exact 3-min tie.)

**The known risk: permanent / runaway max-speed hyperspeed.** At full cross-path investment the danger sources are: Continuum (extend-on-stack) + Infinite Gate (+1.5s) + Slipstream/Warp Harmonic (stacks on kill/combo → each refreshes timer) + Lingering Horizon (auto full-stack every 90s) + Lightspeed (no decay at max stacks) + **the two capstones now raising the cap over time**. Stacked, these could sustain max-stack, no-decay hyperspeed at an ever-growing cap — a performance and difficulty problem (very high scroll × many bodies).

**Gates proposed (all explicit, all in this design):**
1. **Per-instance duration ceiling.** Continuum's extend-on-stack caps at **+3s per hyperspeed instance** (tracked from the instance's start). Infinite Gate's +1.5s and Slipstream/Harmonic refreshes count against the same ceiling. Once the instance hits `start + base + 3s`, further stacks raise *peak/cap* but cannot push the timer. → hyperspeed always ends; the player must re-trigger.
2. **Lightspeed is not "no timer," it's "no decay."** It freezes `hyperspeedCurrentMult` at peak *until the (finite, ceiling-capped) shared timer expires*. It cannot extend the timer.
3. **Stack-generation cooldowns retained:** Slipstream 15s CD, Warp Harmonic 20s CD, Infinite Gate 20s CD, Lingering Horizon 90s CD — already in code; keep.
4. **Hard cap ceiling (NEW — required by the cap-growth capstones):** introduce a `NEBULA_MAX_CAP_CEILING` (recommend **8**, the historical pre-rework Warp max). **Every** cap source clamps to it: tree (base 2 + Overdrive 2 + Superluminal 1 = 5) + Lightspeed/Lingering-Horizon time increments. Mirrors Roamer's `DRIFTERV2_BREAKING_POINT_MAX_TOTAL_STACKS` clamp. Without this, time-based +1s are unbounded (see realistic ceiling below).
5. **Cap-increment scope decision (see [§15](#15-open-design-questions-for-user)):** both +1/90s increments (Lightspeed and Lingering Horizon) accrue **only while the owning capstone is active**, clamp to the ceiling, and reset on run start. Recommend they are **per-run** (not persisted) so each run re-climbs. **They stack with each other (Part-2): if both capstones are owned, +2 cap / 90s — intended, ungated, ceiling-bounded.**
6. **Singularity re-arm gate:** RIFT is 20% on reaching max stacks, **once per hyperspeed instance, 20s CD** — three independent gates; cannot chain every frame at max stacks.
7. **Critical Velocity is gated:** 10% per kill, **15s CD**, and only while at max stacks — same envelope as Firebrand/Halo proc-novas; not a per-kill nova spam.
8. **Bow Shock kept modest (60→90px), not full-screen.** History (code comment, line ~22447): an earlier "Smooth Entry barrier expansion (80/140/200px)" let Warp sweep the whole screen and was reverted. We do **not** reintroduce large barrier scaling; 90px is a deliberate cap.
9. **Performance:** Afterburn discs and barrier already use survivor-pattern body loops; the Singularity RIFT should reuse the existing per-frame body loop with a hard pull-radius and the standard `shakeMassDestroy` batching (no per-body shake). Scroll-speed itself is unchanged math; new per-frame costs are the RIFT loop (gated ≤2.5s, once per instance, 20s CD) and Critical Velocity's proc-nova (10%/kill, 15s CD).

**Realistic ceiling if a player runs BOTH cap-growth capstones (the VERIFY check — v3, stacking is ALLOWED, not gated):**

Running Lightspeed (Velocity capstone) **+** Lingering Horizon (Duration capstone) is **intended and permitted**. Both now grow the cap at **+1 / 90s**, so together they add **+2 cap / 90s**. The *only* bound is the shared `NEBULA_MAX_CAP_CEILING` — the two are **not** gated against each other.

- **Without a ceiling (why one is mandatory):** base 2 + (if also Cap path) Overdrive 2 + Superluminal 1 = 5; then **+2/90s** accrues. Over a 10-min run that's `+2 × (600/90) ≈ +13 → cap ~18` (or ~15 from a base-2 no-Cap-path build). Peak at 18 stacks ≈ `3.5×18 = 63×` scroll (more with Blueshift/Breakaway/Resonant Mass) — unplayable and a perf hazard. A player reaches this **without even taking the Cap path** (just the two capstones, 10 pts), so the growth is not confined to the Cap build.
- **With `NEBULA_MAX_CAP_CEILING = 8`:**
  - **No Cap path** (just both capstones, base 2): cap climbs `2 → 8` at +2/90s = **+6 in ~4.5 min**, then **clamps at 8**.
  - **With Cap path too** (base 5): cap climbs `5 → 8` at +2/90s = **+3 in ~135s (~2.25 min)**, then **clamps at 8**.
  - Peak at the clamped 8 stacks ≈ `3.5×8 = 28×` base, **×1.554** (Blueshift 1.40 × Breakaway 1.11, the rebalanced coefficient) ≈ **~43×** worst case, held flat by Lightspeed for the (≤ base+3s) timer. High and build-defining, but **bounded, always terminating, and re-climbed each run**.

> **Design note (Part-2):** the two cap-growth capstones stacking to +2 cap/90s is **explicitly intended and allowed** — we do **not** add a "only one cap-grower active" gate. The ceiling (8) is the sole bound, so the realistic worst case is the clamped ~43× above, *not* the unbounded ~63×. This is the ceiling the eventual implementation must hold.

**Interaction at full investment (intended ceiling):** cap **≤ 8** (ceiling-clamped), peak ≈ `3.5×1.40 (Blueshift) ×1.11 (Breakaway, multiplicative) ×(1 + 6×0.08 Resonant Mass at 8 stacks if Cap path) ≈ 3.5×8×1.554×1.48 ≈ ~64×` for the all-three-paths case, or **~43×** for the two-capstones-only case — held flat by Lightspeed for up to base+3s, re-entered every 90s by Lingering Horizon. Strong, build-defining, but **always terminating** and **ceiling-bounded**.

---

## 10. Auto-Fire HUD Ring Preservation

- **Only one timed auto-fire** in the new tree: **Lingering Horizon** (Duration capstone, 90s). Its HUD ring already exists: `#capCdEventHorizon` (label "HORIZON", line 3099), driven by `lingeringHorizonNextFireTime` / `lingeringHorizonLastFireTime` in the cap-cd updater (line ~27366) and `capCdLastFired.eventHorizon` (line 27298).
- **Action:** if the capstone key is renamed `eventHorizon → lingeringHorizon`, update the HUD `id`, `data-cap`, `capCdLastFired` key, and the updater's `hasCapstone('…')` check together. **Simplest path: keep the key `eventHorizon`** and only change the *display name/tree position* — zero HUD wiring churn. (Recommended; noted in [§7](#7-renamed--repositioned-nodes).)
- **Lightspeed, Singularity (RIFT), Critical Velocity** are **state-triggered** (max stacks), not timed auto-fires → **no HUD rings**; they use flash text ([§14](#14-flash-text-feedback-plan)).
- **Lightspeed's +1-cap-per-90s** (v3, was 60s) is an internal timer but a minor stat tick, not an ability fire → **flash only ("MAX CAP +1"), no ring.** Lingering Horizon's +1-cap rides on its existing 90s auto-fire (and ring). The two timers run independently (no shared/gated timer) — both fire on their own 90s cadence.
- No HUD rings are cut.

---

## 11. Defined Terms

- **Hyperspeed stack** — one increment of `hyperSpeedStacks`, capped at `HYPERSPEED_MAX_STACKS()`. **Sources:** natural pickup (`rawActivate`, +1 after rework), Warp burst (×2), `nova_hyperspeed`/`hyperspeed_ghost`/`hyperspeed_shield` combos (each calls `activateHyperspeed` via their combo path), Slipstream (on kill), Warp Harmonic (on combo), Lingering Horizon (jump to cap-1 then +1), Siphon (cyan, cross-orb), DEAD CENTER pick (cyan), rainbow-run equivalents. **"At max stacks"** ⇒ `hyperSpeedStacks >= HYPERSPEED_MAX_STACKS()`.
- **Peak velocity multiplier** — `hyperspeedPeakMult` from `computeHyperspeedPeakMult(stacks, peakScale)`. Scroll speed during hyperspeed = `normalScrollSpeed() × hyperspeedCurrentMult`, which **decays** peak→1× over the timer (unless Lightspeed holds it).
- **Hyperspeed duration / shared timer** — `hyperspeedEndTime`; `activeEffects.hyperspeed = hyperspeedEndTime - now`. All stacks clear together at expiry.
- **Barrier** — the 360° kill field active only while `hyperspeed > 0 && hyperspeedCurrentMult > 1.05`; 60px half-width baseline (Bow Shock → 90px). The **visual** is `drawHyperspeedBarrier` (hardcoded `halfW=60`, glow to `halfW×1.5`), composited in PIXI into the fixed 200×200 `PIXI_HYPER_BARRIER_SIZE` canvas. Distinct from the player **invuln** flag (`hyperInvuln`).
- **Max stacks / cap** — `HYPERSPEED_MAX_STACKS()`. After rework this is **variable** (tree + time-growth capstones) and clamped to **`NEBULA_MAX_CAP_CEILING`** (recommend 8). "At max stacks" ⇒ `hyperSpeedStacks >= HYPERSPEED_MAX_STACKS()`.
- **RIFT (Singularity)** — a NEW vertical "tear in space" visual (jagged crack/opening, *not* a disc) spawned at the player on reaching max stacks; persists 2.5s, pulls bodies in, destroys on contact. Gated 20% / once-per-instance / 20s CD.

---

## 12. Cross-Tree and Cross-Orb Concerns

- **`HYPERSPEED_MAX_STACKS()` dispatch:** `drifterV2` has its own `ORB_BEHAVIOR.drifterV2.hyperspeedMaxStacks` override (Breaking Point cap bonus, hard max 10) — **independent of nebula's path**. Removing the nebula baseline-4 does **not** touch Roamer. Verify: the `_HYPERSPEED_MAX_STACKS_default()` nebula branch is only consulted when `activeOrb==='nebula' || rainbowRunActive`; Roamer never reaches it.
- **Roamer hyperspeed mechanics:** Roamer uses hyperspeed for Breaking Point (full hyperspeed on Personal Apocalypse) and has no dependency on nebula's tree nodes. No shared node keys. Safe.
- **Rainbow run:** today rainbow uses the nebula cap path (`activeOrb==='nebula' || rainbowRunActive`) and `superluminal ∈ RAINBOW_CAPSTONES`. After rework, **rainbow's hyperspeed cap must be defined independently** of the nebula tree (which is now player-chosen). **Recommendation:** give rainbow a fixed cap (e.g., 4 or 5) in `_HYPERSPEED_MAX_STACKS_default()` rather than reading nebula nodes, and **remove `superluminal` from `RAINBOW_CAPSTONES`** (or replace with the new keystone). Flagged in [§15](#15-open-design-questions-for-user).
- **`checkDestroyProc` shared hook:** Ramjet (`smoothEntry`) and Slipstream both fire from `checkDestroyProc`; both already gate on `activeOrb==='nebula' || rainbowRunActive` and the active-effect/stack conditions. After moving to single-rank, the `rankOf()` dispatch via `ORB_BEHAVIOR.nebula.rankOf` (new) returns 1 only when active — same chokepoint as other reworked orbs. No accidental cross-orb procs.
- **Combos that grant hyperspeed** (`nova_hyperspeed`, `hyperspeed_ghost`, `hyperspeed_shield`, Spectral Rush `peakScale`) are global COMBO_DEFS behavior — unchanged, available to all orbs. Warp Harmonic only *adds* on top for nebula.
- **Afterburn discs / barrier kills** call `checkDestroyProc(b,'nova')` → could feed *other orbs'* nova-sourced procs during rainbow only (intended for rainbow's all-orbs design). Single-orb nebula is unaffected.

---

## 13. Cost Sanity Check

Per path: keystone 6,500 + capstone 8,500 + (3× T1 @2,500) + (1× T2 @5,000) = **27,500 crystals**, **19 active points** (5+5 + 3×2 + 1×3).

| Orb | Total crystals | Active pts to unlock all 3 paths | Base/Cap |
|---|---|---|---|
| Drifter | 58,500 | ~57 | 20/25 |
| Phantom | 69,000 | 57 | 20/25 |
| Inferno | 78,000 | 57 | 20/25 |
| **Warp (proposed)** | **82,500** | **57** | **20/25** |
| Bulwark | (highest, TBD) | — | — |

**Fits the constraint triangle:** Warp slots just above Inferno (82,500 > 78,000), 57 unlock points (matches the other reworks), base 20 / cap 25 (5 expand points @2,000). With cap 25 you can fully run **one path + most of a second**, forcing build choice. **No conflict — recommend as-is (Option A).**

- **Option B (exactly 80,000):** make one support per path a T1 instead of the T2 on one path, or shave a keystone to 6,000. Adds asymmetry; not recommended.
- **Option C (mirror Inferno's 78,000):** drop each capstone to 8,000 → 81,000, or each path to 26,000 → 78,000 (ties Inferno, violates "slightly above"). Not recommended.

**Recommendation: Option A (82,500).**

---

## 14. Flash Text Feedback Plan

New `_nebula_addFlash(text,color,ms)` / `_nebula_flash(key,text,color,minMs)` / `_nebula_drawFlashes()`, mirroring `_solar_*` (gate by `activeOrb==='nebula'`, throttle via `_nebula_flashGates`).

**Policy (Part-3):**
- **Every *active-trigger* skill** (a discrete proc, auto-fire, on-end event, or threshold event) gets a flashing **skill-name** text, **colored by its path** (Blueshift `74,150,255` / Continuum `150,205,255` / Singularity `120,90,225`) — same `_solar_/_cosmic_/_cyan_` flash system the prior reworks use.
- **Passive stat nodes do NOT flash** (always-on modifiers, not events): Blueshift, Ramjet, Breakaway, Bow Shock, Drag Coefficient, Overdrive, Superluminal, Resonant Mass.
- **High-frequency procs are throttled** exactly like the prior reworks (e.g. Continuum's per-stack extend → min 400ms gate; Critical Velocity / Slipstream / Infinite Gate / Warp Harmonic ride their own cooldowns so the flash can't spam).

| Trigger | Flash | Path color | Throttle |
|---|---|---|---|
| Lightspeed engages (enter max-stack no-decay) | "LIGHTSPEED" | Blueshift `74,150,255` | once per hyperspeed instance |
| Lightspeed cap-up (+1 / 90s, v3) | "MAX CAP +1" | Blueshift | on increment (≤1/90s) |
| Afterburn discs launch | "AFTERBURN" | Blueshift | on hyperspeed end |
| Ramjet | — | — | **no flash** (passive per-kill stat) |
| Continuum timer extended (stack while warping) | "CONTINUUM" | `150,205,255` | min 400ms |
| Infinite Gate +time | "INFINITE GATE" | `150,205,255` | on proc (20s CD) |
| Slipstream grants a stack / refresh | "SLIPSTREAM" | `150,205,255` | on proc (15s CD) |
| Reentry shield on hyperspeed end | "REENTRY" | `150,205,255` | on hyperspeed end |
| Lingering Horizon auto-fire (+ cap-up) | "LINGERING HORIZON" | `150,205,255` | on fire (+ HUD ring) |
| Warp Harmonic free stacks | "WARP HARMONIC" | Singularity `120,90,225` | on proc (20s CD) |
| Critical Velocity proc-nova | "CRITICAL VELOCITY" | `120,90,225` | on proc (15s CD) |
| Singularity RIFT tears open | "SINGULARITY" | `120,90,225` | once per instance (20s CD) |

Passive stat nodes (Blueshift, Breakaway, Bow Shock, Drag Coefficient, Overdrive, Superluminal, Resonant Mass) get **no** flash (always-on modifiers, not discrete events). Reentry now flashes since it's a discrete on-end event.

---

## 15. Open Design Questions for User

_Resolved by the v2 changes:_ ~~Singularity gravity-well vs implosion~~ (now the RIFT), ~~Critical Velocity invuln redundancy~~ (now a proc-nova), ~~Lightspeed direction~~ (no-decay confirmed + cap growth added), ~~Reentry keep/cut~~ (changed to a shield grant).

**Still open / newly raised:**

1. **Hard cap ceiling value.** Recommend **`NEBULA_MAX_CAP_CEILING = 8`** (historical Warp max). Confirm 8, or pick another (7? 6?). This is now load-bearing because two capstones grow the cap over time ([§9](#9-balance-landmines)).
2. **Cap-increment scope.** Should Lightspeed's and Lingering Horizon's +1/90s be **per-run** (reset each run, recommended) or **persisted**? And accrue **only while the capstone is active** (recommended)? Persisted growth would be a permanent power creep across runs.
3. **Cap-growth cadence.** ~~+1/60s (Lightspeed) and +1/90s (Lingering Horizon)~~ **Resolved (v3/Part-2):** Lightspeed slowed to **+1/90s** (matches Lingering Horizon); both now +1/90s. Stacking the two = +2/90s, **intended and ungated** (ceiling-bounded only). Still open *only* if play-testing shows the ceiling is reached too fast.
4. **RIFT art direction.** Confirm the vertical "tear in space" visual (jagged crack) over a disc/portal — and width/height + whether it scrolls with the world or stays anchored to the player for its 2.5s.
5. **Reentry shield tier.** +1 **non-fortress** shield hit + standard duration (recommended, doesn't stomp asteroid/fortress) — or a full fresh shield? Should it stack if a shield is already up?
6. **Critical Velocity nova size.** "default nova blast" = a single standard nova ring (`pushNovaRingCapped`, no supernova)? Confirm size/`sizeMult`.
7. **Palette collision risk.** Triad (azure / ice-blue / cobalt-violet) is all blue-family; cobalt-violet leans toward Phantom's indigo. Acceptable, or push the Cap path to a non-blue (e.g., emerald `60,220,150`)?
8. **Spawn bias `'hyperspeed'`:** keep (orb identity, recommended) or strip for a fully neutral baseline?
9. **Rainbow run cap:** fix at 4 or 5 independent of the nebula tree, and remove `superluminal` from `RAINBOW_CAPSTONES` (or swap to the new keystone)?
10. **Continuum extend-on-stack ceiling:** +3s/instance — right, higher, or lower?
11. **Bow Shock barrier 90px + canvas resize:** comfortable, or keep barrier fixed at 60px and replace Bow Shock with another velocity effect?

---

## 16. Implementation Notes (for the eventual coding prompt)

**Constants / baseline removal:**
- `HYPERSPEED_MAX_STACKS_NEBULA` → delete or set 2; rewrite `_HYPERSPEED_MAX_STACKS_default()` so nebula = `min(NEBULA_MAX_CAP_CEILING, 2 + rankOf('overdrive')×2 + rankOf('superluminal')×1 + lightspeedCapBonus + lingeringHorizonCapBonus)` (single-rank values + the new time-growth bonuses). Add `const NEBULA_MAX_CAP_CEILING = 8` (recommend). Decide rainbow's fixed cap separately.
- **Cap-growth state (NEW):** `lightspeedCapBonus` / `lingeringHorizonCapBonus` counters incremented on their timers (**both now 90s** — v3 slowed Lightspeed 60s → 90s) while the owning capstone is active. **They are independent and STACK** (Part-2): when both capstones are owned the combined cap grows +2/90s — **do NOT add a gate that limits the two together**; the *only* bound is `min(…, NEBULA_MAX_CAP_CEILING)` applied to the *summed* total. Each clamped so the total never exceeds the ceiling; **reset to 0 in `resetGame`** (per-run). Pause-delta-shift their next-increment timestamps. Lightspeed's increment flashes "MAX CAP +1"; Lingering Horizon's rides its 90s auto-fire (+ HUD ring).
- `rawActivate` (line ~20150): remove the nebula/rainbow second `activateHyperspeed('natural')`.
- `HYPERSPEED_DURATION()`: replace `+500×rankOf('reservoir')` with Continuum keystone's `+1500` (single-rank) + the extend-on-stack logic + per-instance ceiling tracking (new state: `hyperspeedInstanceStart`, `hyperspeedExtendBudgetMs`).
- `computeHyperspeedPeakMult`: Blueshift = `thrustMult 1.40`; **Breakaway `×1.11` at max stacks (v3 — rebalanced from ×1.45; single-rank coefficient `0.11`, derived in [§9](#9-balance-landmines)/Part-1)**; add Resonant Mass `×(1 + 0.08×max(0, stacks-2))`. Replace the code's multi-rank `[0.15,0.30,0.45]` Breakaway table with the single-rank `0.11`.
- Deceleration (line ~21818): Drag Coefficient slows the ramp; **Lightspeed** freezes `hyperspeedCurrentMult = hyperspeedPeakMult` while `stacks >= cap`, AND owns the **+1/90s** (v3, was 60s) `lightspeedCapBonus` increment.
- **Barrier width + no-clip (Bow Shock):** introduce a shared `hyperBarrierHalfW()` = `60 + (rankOf('bowShock') ? 30 : 0)` and have **both** the kill loop (line ~22453, currently `barrierHalfW = 60`) and `drawHyperspeedBarrier` (line 27507, hardcoded `const halfW = 60`) read it. **Grow the PIXI offscreen canvas** `PIXI_HYPER_BARRIER_SIZE` (line 3594, currently 200) to fit the widest case: 90px barrier + `halfW×1.5` glow (135px radius) + the 30px `barrierY` bias + margin → **bump to ~320** (or size dynamically from `hyperBarrierHalfW()`). Without this the widened barrier clips at the 200px box edge — the exact "invisible bounding box" cut-off seen before. Re-center math at line ~18554 (`translate(cx - player.x, cy - player.y + 30)`) still holds; just the canvas dimensions change.

**Tree + budget:**
- Replace `TREE_DEFS.nebula` with single-rank schema (3 paths × {keystone, 4 supports, capstone}, capstones folded into `paths`, `costOverride`/`pointCost` per node), mirroring `TREE_DEFS.solar`.
- `ActiveBudget.register('nebula', { base:20, expandMax:5, expandCost:2000, bonusKey:'drift_nebula_budget_bonus', keystones: NEBULA_KEYSTONES, prereqs: NEBULA_PREREQS })`.
- Add `ORB_BEHAVIOR.nebula.{rankOf,pathPrereqMet,respecNode,respecTree,fullTreeRespecCost}` (copy solar pattern); `OrbHooks.on('afterLoadTreeState', () => { maybeMigrateNebula(); ActiveBudget.restoreActivePoints('nebula'); })`.
- Add `NEBULA_KEYSTONES` (`blueshift→blueshift`, `continuum→reservoir`-or-`continuum`, `singularity→overdrive`), `NEBULA_PREREQS` (each support `{prereq:[keystone]}`, capstone too), `NEBULA_PATH_COLORS` (the triad), `NEBULA_TREE_LAYOUTS` (keystone y50, supports y140/225, capstone y320 capstone:true).

**Migration / merge:**
- `NEBULA_SCHEMA_VERSION = 2`, `_nebulaLooksLegacy(raw)` (detect old shape: `Array.isArray(raw.velocity) && length 3`, or `raw.capstones.superluminal/eventHorizon` present), `maybeMigrateNebula()` refunding old multi-rank investments at flat per-tier rates (mirror `maybeMigrateSolar`), then `orbTrees.nebula = freshOrbTreeState('nebula')`, set `localStorage drift_nebula_schema_version`.
- Extend `mergeTrees` shape guard (line ~14267): add `else if (orb === 'nebula') { if (_nebulaLooksLegacy(aOrb)) aOrb=null; if (_nebulaLooksLegacy(bOrb)) bOrb=null; }`.

**Flash / HUD:**
- Add `_nebula_flashes/_nebula_flashGates/_nebula_addFlash/_nebula_flash/_nebula_drawFlashes` + `OrbHooks.on('onRender', ()=>{ if(activeOrb==='nebula') _nebula_drawFlashes(); })`.
- Preserve `#capCdEventHorizon` ring (keep capstone key `eventHorizon` to avoid HUD rewiring; display "LINGERING HORIZON").

**New entities/systems:**
- **Singularity RIFT** — new visual + system: a vertical "tear in space" (jagged crack/opening) spawned at the player on reaching max stacks (20% / once-per-instance / 20s CD). New render (not a disc — a vertical rift) + a per-frame pull-and-destroy loop within a bounded radius for 2.5s, pause-delta safe, reuse `shakeMassDestroy` batching. New state: `nebulaRift = { startTime, x, y }`, `nebulaRiftNextArm`. **Audio: wire the new `RIFT.mp3`** — register it in `SFX_BUFFER_URLS`/`sfxBuffers`/`sfxLoading` as `rift: './assets/SFX/RIFT.mp3'` (same pattern as the v3 `lotd` entry already added for the Phantasm capstone) and play it on rift open via `SFX.playSfxBuffer('rift', <vol>)`. **Screenshake/hitstop:** see [§17](#17-presentation-screenshake--hitstop--audio). (Wiring happens at Warp-implementation time, not now — the file already exists at `www/assets/SFX/RIFT.mp3`.)
- **Critical Velocity proc-nova** — at max stacks, 10%/kill (15s CD) fire a **default nova** at the kill site. Mirror the Firebrand/Halo pattern (`pushNovaRingCapped` + flash + `lastCriticalVelocityProc` cooldown). Gate on `activeOrb==='nebula'||rainbow` + `stacks>=cap`.
- **Reentry shield grant** — on hyperspeed end (the `hyperSpeedStacks→0` block, line ~21824), grant **+1 shield hit** + a standard (non-fortress) shield duration, like a `rawActivate('shield')` of +1 (respect the `shieldHits = min(2, +1)` non-asteroid rule; reset `bastion2BonusMs`). **Interaction check:** ensure it doesn't stomp an active fortress/asteroid shield — only top up to the non-fortress cap, don't downgrade `fortressShield`.
- **Infinite Gate re-gate** — change the gate from `hyperSpeedStacks >= 5` (line ~20477) to `hyperSpeedStacks >= HYPERSPEED_MAX_STACKS()` (max stacks), keeping natural-only + 20s CD + the per-instance duration ceiling from Continuum.

**Cross-orb verification points:** `drifterV2.hyperspeedMaxStacks` untouched; rainbow cap decoupled from nebula tree; `RAINBOW_CAPSTONES` superluminal handling; `checkDestroyProc` nebula gates still `activeOrb==='nebula'||rainbowRunActive`.

---

## 17. Presentation: Screenshake / Hitstop / Audio

> **Part-3 requirement:** every new visual and triggered skill needs screenshake and/or hitstop **scaled to impact**, matching how the prior reworks tuned these. Use the existing helpers: `addShake(n)`, `triggerHitstop(ms)` (self-collapses within ~200ms so multi-kill sweeps read as ONE freeze), `shakeMassDestroy(killCount)` (batched, **never per-body** shake), `shakeKill(b)`, and the `shakeCapstone(key)` switch (line ~14697). Reference magnitudes already in code: capstone tier `sunForge`/`criticalMass` = `addShake(9)`, `aegis` = `11`, `lingeringHorizon` = `7`; nova hitstop = `triggerHitstop(30)` at ≥4 kills; LOTD capstone = `triggerHitstop(80) + addShake(18)`.

| Trigger | Hitstop | Shake | Notes |
|---|---|---|---|
| **Singularity RIFT opens** (capstone, 20%/instance) | `triggerHitstop(70)` on tear-open | `addShake(12)` via `shakeCapstone('singularity')` (add a case) | Biggest moment in the Cap path — space-tearing. Pulls + kills over 2.5s use **`shakeMassDestroy(killCount)` batched** (no per-body shake). Plays `RIFT.mp3`. |
| **Critical Velocity nova proc** (10%/kill at max, 15s CD) | none (or `triggerHitstop(20)` only on a multi-kill ring) | `shakeMassDestroy(killCount)` from the nova-ring sweep | Mirror the Firebrand/Halo proc-nova feel — the standard nova ring already shakes via its sweep; don't add a second source. |
| **Lightspeed engages** (enter max-stack no-decay) | `triggerHitstop(40)` once per instance | `addShake(8)` once per instance | The "I am now a beam" moment — punchy but not capstone-huge; gate to once per hyperspeed instance so it doesn't re-fire each frame at max stacks. |
| **Lightspeed / Lingering Horizon auto-hyperspeed trigger** | Lingering Horizon keeps existing feel (`shakeCapstone('eventHorizon'/'lingeringHorizon')` = `addShake(7)`) | as left column | Lightspeed's +1-cap tick is a minor stat event → **no shake**, flash only. |
| **Bow Shock widened barrier kills** | (none new) | `shakeMassDestroy(killCount)` — already how barrier kills shake | Widening the barrier just feeds more kills into the existing batched shake; **no per-kill shake added**. The visual must not clip (canvas resize, see [§16](#16-implementation-notes)). |
| **Afterburn discs land** (hyperspeed end) | existing | existing disc-kill shake | Already implemented; unchanged. Flash "AFTERBURN". |
| **Continuum / Infinite Gate / Slipstream / Warp Harmonic procs** | none | none | Stack/timer events — feedback is **flash text only** (their cooldowns already throttle); no shake to avoid a jittery warp loop. |

**Audio (Part-3):**
- **`RIFT.mp3`** (`www/assets/SFX/RIFT.mp3`, already present) → the **Singularity** rift open. Register `rift: './assets/SFX/RIFT.mp3'` in `SFX_BUFFER_URLS`/`sfxBuffers`/`sfxLoading` (same 3-spot pattern), play via `SFX.playSfxBuffer('rift', <vol>)` on tear-open. **Wiring deferred to Warp-implementation time** — noted here so it isn't missed.
- **`LOTD.mp3`** — **already wired (Part-0, this branch)**: it replaced the Phantasm *Lord of the Dead* capstone arming cue (was `SCREAM.mp3`), played at low volume `0.18`. Not part of Warp; listed here only for cross-reference of the loader pattern the RIFT wiring should copy.

**Flash text** — see [§14](#14-flash-text-feedback-plan): every active-trigger skill flashes its name in its path color; passive stat nodes never flash; high-frequency procs throttled.

**Keystone lore flavor (Part-3)** — baked into the player-facing keystone descriptions in [§3](#3-velocity-path--blueshift)–[§5](#5-cap-path--singularity), matching the reworked-orb style (e.g. Corona's *"The sun does not cool — it only reaches farther."*):
- **Blueshift:** *"Space doesn't get out of your way — you blueshift it."*
- **Continuum:** *"Once you're in the continuum, you stay there."*
- **Overdrive:** *"Every stack is mass — give yourself room to hold more of it."*
