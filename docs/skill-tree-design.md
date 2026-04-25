# Drift — orb skill-tree spec

**Status:** shipped in v1.6.3.
**Last updated:** 2026-04-25.
**Source of truth:** `TREE_DEFS` in `www/index.html` (~line 4334). Tree
unlock costs at `TREE_UNLOCK_COSTS` (~line 4542); cost scaling at
`ORB_COST_SCALE` and `ORB_CAPSTONE_COST_SCALE` (~line 4685). Behaviour
notes below summarise current implementation; consult the code for
exact constants and proc gates.

## Overview

Each orb has a three-path tree (T1 / T2 / T3 + capstones). Trees are
purchased once with a flat per-orb crystal cost, then individual nodes
and capstones are spent on as the player accumulates crystals. Paths
are non-exclusive — any mix of paths in a tree is legal.

**Drifter has 3 capstones**; the other four orbs have 2. This is
intentional — Drifter has no passive bias, so its tree supplies
identity through meta-random rewrites and gets the extra capstone as
its signature depth.

## Costs

### Tree unlock (flat per-orb)

| Orb | Tree unlock |
|---|---:|
| Drifter (cyan) | 3 000 💎 |
| Phantom (cosmic) | 6 000 💎 |
| Inferno (solar) | 9 000 💎 |
| Warp (nebula) | 12 000 💎 |
| Bulwark (asteroid) | 15 000 💎 |

Trees are no longer gated behind beating each apocalypse difficulty —
just save up crystals and buy in. The progressive cost mirrors the
orb-unlock progression so a player working through the orbs hits each
tree as a natural next step.

### Per-rank node cost

Base cost table is shared across orbs, then multiplied by per-orb scale
and rounded to nearest 500.

| Tier | Base R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|
| T1 | 7 000 | 14 000 | 21 000 | 28 000 | — |
| T2 | 14 000 | 21 000 | 28 000 | 35 000 | 42 000 |
| T3 | 21 000 | 32 000 | 42 000 | 53 000 | — |

**Per-orb scale (`ORB_COST_SCALE`)**: Drifter 0.35, Phantom 0.40,
Inferno 0.45, Warp 0.50, Bulwark 0.55. Drifter is the cheapest tree
(it's the entry orb); Bulwark is the most expensive (defensive endgame
fantasy).

Sample resolved costs (Drifter at 0.35):

| Tier | R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|
| T1 | 2 500 | 5 000 | 7 500 | 10 000 | — |
| T2 | 5 000 | 7 500 | 10 000 | 12 500 | 14 500 |
| T3 | 7 500 | 11 000 | 14 500 | 18 500 | — |

### Capstone cost (separate scale)

Capstones use `ORB_CAPSTONE_COST_SCALE` (less aggressive discount) so
nodes feel cheap but capstones remain aspirational.

| Orb | Scale | Capstone cost |
|---|---:|---:|
| Drifter (cyan) | 0.70 | 19 500 💎 |
| Phantom (cosmic) | 0.75 | 21 000 💎 |
| Inferno (solar) | 0.80 | 22 500 💎 |
| Warp (nebula) | 0.85 | 24 000 💎 |
| Bulwark (asteroid) | 0.90 | 25 000 💎 |

Base capstone cost is 28 000.

### Respec

| Operation | Cost |
|---|---:|
| Single-node respec | 4 000 💎 (full rank refund) |
| Full-tree respec | 1 400 💎 × total ranks invested (full refund, wipes tree) |

Crossover at three nodes — single-node respec wins for 1-2 swaps; full
respec wins for 3+. Capstones can be respec'd individually for the
single-node fee.

### Path prerequisites

Within a path: T2 requires its T1 at rank ≥ 1; T3 requires its T2 at
rank ≥ 1. No mutual exclusion between paths — any combination of paths
in the same tree is legal. Capstones each list their own prereq
(usually "any T2 node ≥ 1" or "specific node ≥ 1").

---

## Difficulty

The trees apply across all four difficulties:

- NORMAL / HARD / EXTREME — speed cap reached at 3:00, no post-cap
  growth.
- IMPOSSIBLE (unlocked by beating EXTREME's apocalypse) — speed cap at
  1:00, then +10%/min speed and +1 max body every 2 minutes post-cap.
  Crystals scale 1.5×, leaderboard backend has a separate stricter
  allowlist for the new difficulty.

---

## 1. Drifter (`cyan`) — Chance / Cadence / Convergence

Drifter has no passive bias. Tree introduces identity via RNG control,
scoring meta, and combo rewrites. Three capstones.

### Chance

| Tier | Node | Effect (current rank scaling) |
|---|---|---|
| T1 | Loaded Dice | Each burst has a chance to instantly reset burst cooldown. **2 / 5 / 10 %** chance, 15 s internal cooldown. Failed rolls don't stamp the cooldown |
| T2 | Fortune Favors | Natural single-pickup spawns biased toward your longest-expired type (**25 / 50 / 75 %** bias) AND chance to spawn a second extra pickup at offset (**10 / 20 / 30 %** with 10 s cooldown on the extra) |
| T3 | Double or Nothing | After burst fires, chance to immediately fire a second random single powerup of a different type. **30 / 60 / 90 %** chance |

### Cadence

| Tier | Node | Effect |
|---|---|---|
| T1 | Restless Orb | Burst cooldown −5 % per rank (20 s → 19 / 18 / 17 s) |
| T2 | Prime Mover | Streak cap +1 per rank (8 → 9 / 10 / 11 / 12); max pts/kill from 32 → 48 at rank 4 |
| T3 | Tempo | Time-bonus interval shrinks 30 s → 25 / 20 / 15 s |

### Convergence

| Tier | Node | Effect |
|---|---|---|
| T1 | Oracle Edge | Pair spawn chance +1.5pp per rank (Drifter only) |
| T2 ⚡ | Siphon | On body destroyed, chance to grant a random powerup (1.5 s global cooldown). **2 / 4 / 6 / 8 / 10 %** |
| T3 | Keystone | Pair combos have a chance to also grant a random bonus single of a different type. **10 / 20 / 30 %** |

### Capstones

| Capstone | Effect |
|---|---|
| **DEAD CENTER** | Tap burst → game pauses, semi-transparent radial overlay appears (TOP shield / RIGHT nova / BOTTOM hyperspeed / LEFT ghost). Tap a quadrant to fire that single powerup. No tap within 0.5 s → slot-machine auto-pick. Pause-delta shifts every timer so cooldowns don't drift |
| **CALCULATED DRIFT** | Upgrades DEAD CENTER's output: pick fires as the matching pair combo (Shield → Fortress Shield, Nova → Supernova, Hyperspeed → 2 stacks, Ghost → Eternal Phantom). Prereq: DEAD CENTER purchased |
| **BUTTERFLY EFFECT** | 15 % chance on any pickup grab to spawn a duplicate at the top of the screen. Brief animated split visual + chime; 10 s cooldown on successful procs |

---

## 2. Phantom (`cosmic`) — Dusk / Wraith / Veil

### Dusk

| Tier | Node | Effect |
|---|---|---|
| T1 | Lingering Veil | Single-pickup ghost +0.5 s per rank (Phantom baseline 5 s) |
| T2 | Eternal Ember | Eternal Phantom +0.5 / 1 / 1.5 / 2 s (Phantom baseline 7 s) |
| T3 | Twilight Echo | If ghost ends within 1 s of any combo ending, auto-refresh ghost for half base duration. **10 / 25 / 40 %** chance, 15 s cooldown |

### Wraith

| Tier | Node | Effect |
|---|---|---|
| T1 | Razor Veil | Destroy-on-contact during ghost without needing a shield. Rearm every **3 / 2 / 1** s |
| T2 | Ghostlight | All ghost-flavored kills (ghost aura, Razor Veil, Phantom Blade) have a chance to spawn a 120 px EMP-lite burst (no chain, clears crack fragments, +1 streak). **40 / 60 / 80 %** trigger |
| T3 | Phantom Blade | During ghost or Eternal Phantom, periodically spawn spinning blade visuals that destroy bodies within 160 px. Tick every **3 / 2 / 1** s |

### Veil

| Tier | Node | Effect |
|---|---|---|
| T1 | Shadow Regen | Ghost pickups stack additively at **10 / 15 / 20 %** of pickup duration. Cap: 2× base ghost duration |
| T2 ⚡ | Soulbound | On body destroyed, chance to extend ghost by +1 s. 5 s cooldown. Cap: 2× base. **2 / 4 / 6 / 8 / 10 %** |
| T3 | Beyond | When ghost ends, remain invulnerable for an afterimage window. **0.5 / 1 / 1.5** s |

### Capstones

| Capstone | Effect |
|---|---|
| **SHROUD** | Every 30 s, the next single pickup fires as a ghost pair combo (Eternal Phantom or matching ghost combo). Natural combos take priority |
| **NIGHT SHADE** | Every 20 s of gameplay, auto-activate a 3 s ghost. HUD ring countdown |

---

## 3. Inferno (`solar`) — Pyre / Corona / Inferno

### Pyre

| Tier | Node | Effect |
|---|---|---|
| T1 | Kindling | Single nova +1 wave per rank (Inferno baseline 4 → 7 at rank 3) |
| T2 | Conflagration | Supernova +1 / +2 waves at ranks 1/2. 15 s cooldown between applications |
| T3 | Second Flame | Chance per nova cast to fire one free bonus wave at the end. **20 / 30 / 40 %** with 5 s cooldown |

### Corona

| Tier | Node | Effect |
|---|---|---|
| T1 | Solar Flare | Nova ring lethal radius +**10 / 20 / 30 %** (360 px baseline) |
| T2 | Halo | Supernova radiusMult step coefficient 0.10 → 0.133 / 0.167 / 0.20 |
| T3 | Coronal Hold | Each nova kill reduces burst cooldown by **0.05 / 0.10 / 0.50 %** of base |

### Inferno

| Tier | Node | Effect |
|---|---|---|
| T1 | Cinder | Nova-killed bodies leave a 2 s, 60 px burn zone at the kill position (world-static, no scroll). **10 / 20 / 30 %** proc |
| T2 ⚡ | Firebrand | On body destroyed, chance to fire a single half-size nova ring at the body position (3 s cooldown). **2 / 4 / 6 / 8 / 10 %** |
| T3 | Combustion | Each nova cast adds +1 to a bonus-wave counter; counter consumed by the next nova within 2 s. 15 s cooldown. Cap **+1 / +2 / +3** waves |

### Capstones

| Capstone | Effect |
|---|---|
| **SUN FORGE** | Supernova auto-fires every 45 s. HUD ring countdown |
| **CRITICAL MASS** | 10+ destroys from one nova cast triggers a free 6-wave nova at the player. 20 s internal cooldown; kill counter paused during cooldown |

---

## 4. Warp (`nebula`) — Velocity / Endurance / Drift

**v1.6.3 architectural rewrite:** all hyperspeed activity now runs off a
single shared `hyperspeedEndTime`. Each pickup increments
`hyperSpeedStacks` (capped) and resets the shared timer. On expiry, all
stacks clear at once. Stacks affect peak multiplier; duration is
shared.

### Velocity

| Tier | Node | Effect |
|---|---|---|
| T1 | Thrust | Hyperspeed peak multiplier coefficient +10 % per rank |
| T2 | Afterburn | When hyperspeed ends, launch forward barrier discs (1/2/3 at ranks 1/2/3) that travel up, expand, and destroy bodies in their path |
| T3 | Breakaway | At max stacks, peak multiplier +25 % per rank |

### Endurance

| Tier | Node | Effect |
|---|---|---|
| T1 | Reservoir | Hyperspeed shared duration +0.5 s per rank (3 s baseline → up to 4.5 s) |
| T2 | Overdrive | Hyperspeed stack cap +1 / +2 at ranks 1/2 (Warp baseline 4 → 6) |
| T3 | Infinite Gate | At 5+ stacks, natural pickup extends shared timer +**0.5 / 1 / 1.5** s. 15 s cooldown |

### Drift

| Tier | Node | Effect |
|---|---|---|
| T1 | Smooth Entry | Each natural hyperspeed pickup destroys bodies in a radius around the player on activation. **80 / 140 / 200** px |
| T2 ⚡ | Slipstream | On body destroyed, chance to grant a hyperspeed stack (15 s cooldown). **1 / 2 / 3 / 4 / 6 %** |
| T3 | Warp Harmonic | Hyperspeed pair combos grant +1 / +2 / +3 free stacks. 20 s cooldown |

### Capstones

| Capstone | Effect |
|---|---|
| **SUPERLUMINAL** | Raises hyperspeed stack cap to 8 (with Overdrive 2). Stack escalation visuals: gold/orange/red/white tint progression, "WARP CORE" label past cap |
| **LINGERING HORIZON** | Every 90 s of gameplay, automatically grant a fully-stacked hyperspeed activation. Auto-fire uses a non-natural source flag so it doesn't re-trigger Smooth Entry / Infinite Gate. HUD ring countdown |

(Smooth Entry, SUPERLUMINAL, and LINGERING HORIZON are reworks — earlier
specs had them as "wider barrier", "uncapped stacks", and "2 s
post-hyperspeed echo" respectively.)

---

## 5. Bulwark (`asteroid`) — Fortification / Devastation / Opportunism

### Fortification

| Tier | Node | Effect |
|---|---|---|
| T1 | Kinetic Ward | Shield duration +10 % per rank (6 s baseline) |
| T2 | Kinetic Ward II | Shield duration +0.5 s per rank (1/4 ranks) |
| T3 | Bastion | Shield stack cap +1 per rank (Bulwark baseline 4 → 7) |

### Devastation

| Tier | Node | Effect |
|---|---|---|
| T1 | Chain Reaction | EMP primary radius +10 % per rank (180 px baseline) |
| T2 | Chain Reaction II | EMP chain depth +1 hop per rank (baseline depth 1 → 4) |
| T3 | Detonation | Secondary EMP radius +30 % per rank (120 px baseline) |

### Opportunism

| Tier | Node | Effect |
|---|---|---|
| T1 | Salvage | Chance per destroy to grant +1 crystal to the run payout (cyan kill-site sparkle visual). **2 / 5 / 10 %** |
| T2 ⚡ | Bastion II | On body destroyed, chance to grant a shield pickup. Overflow at cap → +0.5 s duration instead of wasted. EMP-chain-source destroys excluded (anti-loop). **1 / 2 / 4 / 6 / 8 %** |
| T3 | Gravity Well | During shield, bodies are gently attracted toward the player. Force **0.2 / 0.5 / 0.8** with attract-line visuals |

### Capstones

| Capstone | Effect |
|---|---|
| **PHALANX** | EMP chain depth uncapped if each hop destroys a body. Radius decays 80 % per hop. 5-frame per-ring cooldown prevents same-frame re-entry |
| **AEGIS** | Full Fortress Shield (4 hits, 8 s) auto-fires every 45 s. HUD ring countdown |

---

## Destroy-to-powerup cascade guard rails

Every tree has a 5-rank 2 %–10 % destroy-to-X proc node, all sitting at
T2 in their respective paths. Only one tree's destroy-to-X is active at
a time (bound to the equipped orb), so cross-tree cascades do not
exist. Each has an internal cooldown to prevent within-tree feedback
loops.

| Node | Cooldown / guard |
|---|---|
| Siphon (Drifter) | 1.5 s global cooldown |
| Soulbound (Phantom) | 5 s cooldown; +1 s extension capped at 2× base ghost duration |
| Firebrand (Inferno) | 3 s cooldown; respects nova-overload guard so it can't fire while a nova-flavored combo is live (SUN FORGE bypasses; Firebrand does not) |
| Slipstream (Warp) | 15 s cooldown |
| Bastion II (Bulwark) | EMP-chain-source destroys flagged `source: 'emp'` and excluded from the proc roll (breaks the PHALANX + Bastion II infinite loop). Overflow at shield cap converts proc to +0.5 s duration |

---

## Visual pass status (v1.6.3)

The visual escalation pass shipped alongside the mechanic reworks. Each
capstone or node that needed a CRITICAL or HELPFUL visual cue per the
original spec now has one in code:

- **Capstone HUD countdown rings** — SHROUD, NIGHT SHADE, SUN FORGE,
  AEGIS, LINGERING HORIZON. One reusable `<div class="cap-cd">`
  conic-gradient ring, per-orb visibility gated, primed/firing flash
  states.
- **Destroy-to-powerup proc family** — Siphon, Soulbound, Firebrand,
  Slipstream, Bastion II share a kill-site cue language.
- **Burn zones** (Cinder) — persistent ground-hazard with smouldering
  ember particles, fade in last 200 ms.
- **Phantom Blade** — spinning purple-diamond visual on each tick kill.
- **Beyond afterimage** — purple ghost-duplicate orb 40-60 px behind
  the player's movement direction, fades 50 % → 0 % over the rank-set
  duration.
- **Afterburn discs** — charge-up, launch, expanding kill ring, SFX
  whoosh.
- **Stack escalation** — hyperspeed HUD reads gold/orange/red/white
  with thicker outlines past 7 stacks, "WARP CORE" pulsing label at 8.
- **Salvage sparkle** — small cyan crystal at kill site that drifts up
  and fades.
- **Twilight Echo cue** — purple expanding ring + "ECHO" text float
  above player on auto-refresh.
- **Gravity Well lines** — thin shield-cyan lines from each nearby
  body to the player while shield is active.
- **Smooth Entry ring** — brief 200 ms ring expanding to the rank's
  full radius on natural pickup activation.
- **Butterfly Effect split** — expanding ring + particle burst at the
  duplicate's spawn point at the top of the screen, soft mirror chime.
- **Styled confirm modal** — replaces `window.confirm` for
  reset-tree / DRIFTRESET / shop-purchase prompts so the dialog stays
  in the game's visual language.

PixiJS / Canvas 2D parity: every visual lives on the Canvas 2D overlay
(`#c`) on top of the Pixi stage so it renders identically in both
modes. Pixi-only paths skip the canvas draws cleanly.
