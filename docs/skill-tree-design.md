# Drift — orb skill-tree design spec

**Status:** design spec, not yet implemented.
**Last updated:** 2026-04-23
**Planned for:** v1.6.3
**Revisions applied:** 1–11

## Overview

v1.6.3 adds per-orb skill trees unlocked by beating the apocalypse on each
difficulty. Crystals (earned per run) are the currency. Trees are branching,
non-exclusive (any mix of paths), and specced to break the game at full spec —
PoE-style. Design is grounded in the v1.6.2 orb-mechanics audit; every node
either amplifies an audited value or introduces a new mechanic whose
interactions are guarded below.

Drifter has **3 capstones** — one more than every other tree. This is
intentional: Drifter has no passive bias, so its tree supplies identity via
meta-random rewrites, and the extra capstone is its signature depth.

---

## Shared design parameters

### Cost pattern (30 % cut from pre-cut baseline)

| Slot | 3-rank | 4-rank | 5-rank |
|---|---|---|---|
| Tier 1 | 7 / 14 / 21 k *(42 k)* | 7 / 14 / 21 / 28 k *(70 k)* | — |
| Tier 2 | 14 / 21 / 28 k *(63 k)* | 14 / 21 / 28 / 35 k *(98 k)* | 14 / 21 / 28 / 35 / 42 k *(140 k)* |
| Tier 3 | 21 / 32 / 42 k *(95 k)* | 21 / 32 / 42 / 53 k *(148 k)* | — |
| Capstone | **28 k flat, single-rank**, named prereq | | |

Ranks are cumulative (buying rank 3 costs the marginal rank cost on top of ranks
1 and 2). T2 requires any T1 rank ≥ 1 in the same path; T3 requires any T2 rank
≥ 1 in the same path; capstones list their own prereqs. No mutual exclusion
between paths.

### Respec

| Operation | Cost | Notes |
|---|---|---|
| Single-node respec | **4 000 crystals flat** | Full rank refund for that node |
| Full-tree respec | **1 400 crystals × total ranks invested** | Full refund, wipes the tree |

Breakeven at 3 nodes: 1–2 node swap → single cheaper; 3+ → full cheaper. No
free respecs.

### Unlock gates

- Beat NORMAL apocalypse → Drifter + Phantom trees open
- Beat HARD apocalypse → Inferno + Warp trees open
- Beat EXTREME apocalypse → Fortress tree opens

---

## 1. Drifter tree (`cyan`) — Chance / Cadence / Convergence

Drifter has no passive bias. Tree introduces identity via RNG manipulation,
scoring meta, and combo rewrites. **3 capstones** (all other trees have 2).

### Chance (RNG manipulation)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Loaded Dice** | Burst reroll if rolled powerup type is already active | 1/3 → 33 / 66 / 100 % reroll | 7 / 14 / 21 k |
| T2 | **Fortune Favors** | Burst biased toward longest-expired powerup type | 1/3 → 25 / 50 / 75 % bias | 14 / 21 / 28 k |
| T3 | **Double or Nothing** *(new — replaces Calculated Drift per Revision 10)* | When burst fires, chance to immediately fire a second random single powerup after the first resolves. Second-fire respects Loaded Dice (distinct type) and the nova-overload guard | 1/3 → 30 / 60 / 90 % second-fire chance | 21 / 32 / 42 k |

### Cadence (tempo / scoring)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Restless Orb** | Burst cooldown −5 % per rank (20 s → 19.0 / 18.1 / 17.2 s) | 1/3 | 7 / 14 / 21 k |
| T2 | **Prime Mover** | Streak cap +1 per rank (activates `streakCap:10`); max kill pts 9×4 → 12×4 at rank 4 (36 → 48 pts) | 1/4 | 14 / 21 / 28 / 35 k |
| T3 | **Tempo** | Time-bonus interval 30 s → 25 / 20 / 15 s | 1/3 | 21 / 32 / 42 k |

### Convergence (combo manipulation)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Oracle Edge** | Pair spawn chance +1.5 % absolute per rank | 1/3 | 7 / 14 / 21 k |
| T2 ⚡ | **Siphon** *(unified destroy-to-random)* | On body destroyed, chance to instantly grant a random powerup (shield / nova / hyperspeed / ghost, equal weight) | 1/5 → 2 / 4 / 6 / 8 / 10 % | 14 / 21 / 28 / 35 / 42 k |
| T3 | **Keystone** | 2 simultaneous single pickups within a window register as a pair combo | 1/3 → 0.3 / 0.6 / 1.0 s | 21 / 32 / 42 k |

### Capstones (3 — Drifter-only)

| Capstone | Effect | Prereq | Cost |
|---|---|---|---|
| **DEAD CENTER** ⭐ | Tap burst → game fully pauses (physics, animations, scroll frozen). Semi-transparent radial overlay appears over the playfield: **TOP = shield**, **RIGHT = nova**, **BOTTOM = hyperspeed**, **LEFT = ghost**. Player taps a quadrant → overlay vanishes instantly → game resumes → the chosen **single powerup** fires. If no tap within 0.5 s real-time, quadrants slot-machine-cycle (50 ms/highlight), land on a random quadrant with a brief flash, overlay dismisses, game resumes, fires that single powerup. Base orb passives still apply (Drifter gets default values: 6 s shield, 3-wave nova, 1 stack hyperspeed, 4 s ghost) | 1 T3 node at rank ≥ 1 | 28 k |
| **CALCULATED DRIFT** ⭐ *(new 2nd capstone per Revision 10)* | Upgrades DEAD CENTER's output. Player's pick (or slot-machine auto-pick) now fires as the matching **pair combo** instead of a single powerup: Shield → `shield_shield` (Fortress Shield, 8 s 4-hit), Nova → `nova_nova` (Supernova, 4 waves on Drifter base), Hyperspeed → `activateHyperspeed()` × 2 (2 stacks), Ghost → `ghost_ghost` (Eternal Phantom, 6 s on Drifter base). Base orb passives still apply — no Inferno 6-wave or Cosmic 8-s boost | **DEAD CENTER purchased** | 28 k |
| **BUTTERFLY EFFECT** | 15 % chance on any pickup to spawn a mirror pickup of the same type 1 s later at random x ± 80 px above the player. One roll per pair pickup event, not per tethered piece | 2 T2 nodes across any paths | 28 k |

**Path totals:** Chance 42 + 63 + 95 = 200 · Cadence 42 + 98 + 95 = 235 · Convergence 42 + 140 + 95 = 277 · Capstones 3 × 28 = 84

**Drifter full-spec total:** **796 k crystals**

**Power-level @ full spec:** Burst becomes a player-chosen *combo* every ~17 s
(DEAD CENTER + CALCULATED DRIFT stacked). Double or Nothing fires a bonus
random single after the combo lands. Siphon's destroy-to-powerup pipe
guarantees a powerup every ~10 kills. Streak cap 12×4 = 48 pts/kill. Keystone
1 s window means most pickups register as combos. Drifter stops being the
neutral orb and becomes the meta-control orb.

**⭐ HOLY SHIT nodes:** DEAD CENTER + CALCULATED DRIFT. Combined, burst becomes
"pause → pick any orb's burst fantasy → fire it" every 17 s. This pair is why
Drifter gets 3 capstones.

---

## 2. Phantom tree (`cosmic`) — Dusk / Wraith / Veil

### Dusk (duration)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Lingering Veil** | Single-pickup ghost +0.5 s per rank (Cosmic 6 s → 6.5 / 7 / 7.5) | 1/3 | 7 / 14 / 21 k |
| T2 | **Eternal Ember** | Eternal Phantom +1 s per rank (Cosmic 8 s → 9 / 10 / 11 / 12) | 1/4 | 14 / 21 / 28 / 35 k |
| T3 | **Twilight Echo** *(replaces Night Eternal)* | If ghost ends within 3 s of any other combo ending, auto-refresh ghost for half its base duration (Cosmic 3 s, others 2 s) | 1/3 → 33 / 66 / 100 % chance | 21 / 32 / 42 k |

### Wraith (offense during ghost)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Razor Veil** | Destroy-on-contact during ghost without needing a shield | 1/3 → every 3 s / 2 s / 1 s | 7 / 14 / 21 k |
| T2 | **Ghostlight** | Ghost destroys spawn a 90 px EMP-lite burst (no chain), kills fragments, +1 streak | 1/3 → 33 / 66 / 100 % trigger | 14 / 21 / 28 k |
| T3 | **Phantom Blade** | Permanent Phantom-Blast aura while ghost is active | 1/3 → 30 / 45 / 60 px radius | 21 / 32 / 42 k |

### Veil (uptime / regen)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Shadow Regen** | Ghost pickups stack additively rather than refreshing | 1/3 → 50 / 75 / 100 % of pickup added | 7 / 14 / 21 k |
| T2 ⚡ | **Soulbound** *(unified destroy-to-ghost)* | On body destroyed, chance to instantly grant a ghost powerup (respects current orb's duration) | 1/5 → 2 / 4 / 6 / 8 / 10 % | 14 / 21 / 28 / 35 / 42 k |
| T3 | **Beyond** | When ghost ends, player remains invulnerable for an afterimage window | 1/3 → 1 / 1.5 / 2 s | 21 / 32 / 42 k |

### Capstones

| Capstone | Effect | Prereq | Cost |
|---|---|---|---|
| **SHROUD** | Grabbing 2 single-ghost pickups within 3 s auto-triggers `ghost_ghost` (Eternal Phantom) | 2 T2 nodes across paths | 28 k |
| **NIGHT SHADE** ⭐ | Every 60 s of gameplay, auto-activate a 2 s ghost | 1 T3 node at rank ≥ 1 | 28 k |

**Path totals:** Dusk 42 + 98 + 95 = 235 · Wraith 42 + 63 + 95 = 200 · Veil 42 + 140 + 95 = 277 · Caps 56

**Phantom full-spec total:** **768 k crystals**

**Power-level @ full spec:** Ghost uptime approaches permanent at kill-streak
density. Twilight Echo bridges combos into another ghost. Soulbound keeps the
timer refilling off kills (capped at 2× base, see guard rails). With Phantom
Blade + Razor Veil active during ghost, the player walks through planets as a
kill-zone; Beyond holds invulnerability 2 s past ghost end.

**⭐ HOLY SHIT node: NIGHT SHADE** — passive auto-ghost every 60 s of
gameplay, no input.

---

## 3. Inferno tree (`solar`) — Pyre / Corona / Inferno

### Pyre (wave count)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Kindling** | Single nova +1 wave per rank (Inferno 6 → 7 / 8 / 9) | 1/3 | 7 / 14 / 21 k |
| T2 | **Conflagration** | Supernova +1 wave per rank (Inferno 6 → 7 / 8 / 9) | 1/3 | 14 / 21 / 28 k |
| T3 | **Second Flame** | Chance per rank to fire one free extra wave after nova finishes | 1/3 → 30 / 60 / 90 % | 21 / 32 / 42 k |

### Corona (radius)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Solar Flare** | Nova ring lethal radius +15 % per rank (360 → 414 / 476 / 547 px) | 1/3 | 7 / 14 / 21 k |
| T2 | **Halo** | Supernova `radiusMult` step coefficient 0.15 → +0.033 per rank (rank 3 wave i has mult `1 + i*0.25`) | 1/3 | 14 / 21 / 28 k |
| T3 | **Coronal Hold** *(replaces Perihelion)* | Supernova wave lethal window +50 % per rank — each wave stays lethal longer | 1/3 → +50 / +100 / +150 % | 21 / 32 / 42 k |

### Inferno (secondary effects)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Cinder** | Nova-killed bodies leave a 1 s, 60 px-radius burn zone that destroys anything entering | 1/3 → 20 / 40 / 60 % proc | 7 / 14 / 21 k |
| T2 ⚡ | **Firebrand** *(unified destroy-to-nova)* | On body destroyed, chance to instantly fire a nova (respects current orb's wave count — 3 default / 6 Inferno) | 1/5 → 2 / 4 / 6 / 8 / 10 % | 14 / 21 / 28 / 35 / 42 k |
| T3 | **Combustion** *(rebalanced per Revision 2)* | Each body killed by a nova adds +1 to the next nova's wave count within a 3 s window | 1/3 → cap **+2 / +3 / +5** bonus waves | 21 / 32 / 42 k |

**Combustion stacking envelope:** Kindling rank 3 + Conflagration rank 3 +
Combustion rank 3 = max 6 + 3 + 5 = **14 waves** for a fresh supernova
mid-kill-chain. Single-nova chain: 9 + 2 = 11 waves. Intended.

### Capstones

| Capstone | Effect | Prereq | Cost |
|---|---|---|---|
| **SUN FORGE** ⭐ | Supernova auto-fires every 15 s passively — no pickup, no input. Bypasses nova-overload guard | All T1 nodes at rank ≥ 1 | 28 k |
| **CRITICAL MASS** | 10+ destroys from one nova cast → free 6-wave supernova at player. 5 s internal cooldown | 1 T3 node at rank ≥ 1 | 28 k |

**Path totals:** Pyre 42 + 63 + 95 = 200 · Corona 42 + 63 + 95 = 200 · Inferno 42 + 140 + 95 = 277 · Caps 56

**Inferno full-spec total:** **733 k crystals**

**Power-level @ full spec:** 9-wave single novas, up-to-14-wave supernovas in
a kill streak, persistent burn zones, destroy-to-nova proc. SUN FORGE deletes
the screen every 15 s for free. The late-phase "screen full of planets"
challenge becomes "screen full of respawning planets" — Inferno simply
outpaces the spawner.

**⭐ HOLY SHIT node: SUN FORGE** — automatic screen-clear every 15 s.

---

## 4. Warp tree (`nebula`) — Velocity / Endurance / Drift

### Velocity (peak speed)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Thrust** | Peak multiplier coefficient +10 % per rank | 1/3 | 7 / 14 / 21 k |
| T2 | **Afterburn** | Deceleration curve slowed −50 % per rank | 1/3 | 14 / 21 / 28 k |
| T3 | **Breakaway** | At max stacks, peak multiplier +25 % per rank | 1/3 | 21 / 32 / 42 k |

### Endurance (stacks / duration)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Reservoir** | Per-stack duration +0.5 s per rank (3 s → 4.5 s at rank 3) | 1/3 | 7 / 14 / 21 k |
| T2 | **Overdrive** | Max stacks +1 per rank (Nebula 6 → 7 / 8 / 9 / 10) | 1/4 | 14 / 21 / 28 / 35 k |
| T3 | **Infinite Gate** | At max stacks, each new pickup adds +N s to every live stack's timer | 1/3 → +1 / +2 / +3 s | 21 / 32 / 42 k |

### Drift (control / combos)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Smooth Entry** | Hyperspeed barrier width +20 % per rank | 1/3 | 7 / 14 / 21 k |
| T2 ⚡ | **Slipstream** *(unified destroy-to-hyperspeed)* | On body destroyed, chance to instantly grant a hyperspeed stack (respects current orb: +1 default / +2 Nebula) | 1/5 → 2 / 4 / 6 / 8 / 10 % | 14 / 21 / 28 / 35 / 42 k |
| T3 | **Warp Harmonic** | Pair combos involving hyperspeed grant bonus free stacks | 1/3 → +1 / +2 / +3 free stacks | 21 / 32 / 42 k |

### Capstones

| Capstone | Effect | Prereq | Cost |
|---|---|---|---|
| **SUPERLUMINAL** ⭐ | Removes the hyperspeed stack cap entirely | Overdrive rank 4 | 28 k |
| **EVENT HORIZON** | At 6+ active stacks, bodies within 30 px of the player are destroyed on proximity | 1 T3 node at rank ≥ 1 | 28 k |

**Path totals:** Velocity 42 + 63 + 95 = 200 · Endurance 42 + 98 + 95 = 235 · Drift 42 + 140 + 95 = 277 · Caps 56

**Warp full-spec total:** **768 k crystals**

**Power-level @ full spec:** Overdrive 4 (cap 10) + SUPERLUMINAL (no cap) +
Infinite Gate 3 (+3 s to all live timers per pickup) + Slipstream (destroy →
stack) = self-sustaining permanent hyperspeed once a kill-streak starts.
Thrust + Breakaway push peak past 5× baseline. EVENT HORIZON kills bodies
before they render in front of you.

**⭐ HOLY SHIT node: SUPERLUMINAL** — uncapped stacks. "No limit" is the
fantasy.

---

## 5. Fortress tree (`asteroid`) — Fortification / Devastation / Opportunism

Symmetry per Revision 4: Option A — Unbreakable dropped; Bastion moves to T3
as a 3-rank cap node. Salvage fills Opportunism T1 (Revision 5).

### Fortification

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Kinetic Ward** | Shield duration +10 % per rank (6 s → 6.6 / 7.2 / 7.8 s) | 1/3 | 7 / 14 / 21 k |
| T2 | **Kinetic Ward II** | Shield duration +0.5 s per rank | 1/4 | 14 / 21 / 28 / 35 k |
| T3 | **Bastion** | Shield stack cap +1 per rank (Asteroid 4 → 5 / 6 / 7) | 1/3 | 21 / 32 / 42 k |

### Devastation (EMP-focused)

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Chain Reaction** | EMP primary radius +10 % per rank (180 → 198 / 216 / 234 px) | 1/3 | 7 / 14 / 21 k |
| T2 | **Chain Reaction II** | EMP chain depth +1 hop per rank (audit depth 1 → 2 / 3 / 4) | 1/3 | 14 / 21 / 28 k |
| T3 | **Detonation** | Secondary EMP radius +30 % per rank (120 → 156 / 192 / 228 px) | 1/3 | 21 / 32 / 42 k |

### Opportunism

| Tier | Node | Effect | Ranks | Cost/rank |
|---|---|---|---|---|
| T1 | **Salvage** | Chance per destroy to grant +1 crystal to the run's final payout | 1/3 → 1 / 2 / 3 % | 7 / 14 / 21 k |
| T2 ⚡ | **Bastion II** *(unified destroy-to-shield)* | On body destroyed, chance to instantly grant a shield pickup (respects Asteroid +2 cap 4). **Overflow rule (Revision 9):** if `shieldHits` is already at current cap when the proc fires, the proc instead grants **+0.5 s to the remaining shield duration** — the proc is never wasted | 1/5 → 2 / 4 / 6 / 8 / 10 % | 14 / 21 / 28 / 35 / 42 k |
| T3 | **Gravity Well** | During shield, bodies are gently attracted toward the player (force per rank) | 1/3 → force 0.2 / 0.5 / 0.8 | 21 / 32 / 42 k |

### Capstones

| Capstone | Effect | Prereq | Cost |
|---|---|---|---|
| **PHALANX** ⭐ | EMP chain depth uncapped as long as each new hop destroys a body. Radius decays to 80 % per additional hop. 5-frame per-ring cooldown prevents same-frame re-entry | Chain Reaction II rank 3 + any T3 at rank ≥ 1 | 28 k |
| **AEGIS** | Full Fortress Shield (4 hits, 8 s) auto-fires every 45 s of gameplay | Bastion rank 1 + Kinetic Ward II rank 1 | 28 k |

**Path totals:** Fortification 42 + 98 + 95 = 235 · Devastation 42 + 63 + 95 = 200 · Opportunism 42 + 140 + 95 = 277 · Caps 56

**Fortress full-spec total:** **768 k crystals**

**Power-level @ full spec:** 7-hit shields lasting 9.8 s, destroy-to-shield
proc at 10 % (never wasted — overflow extends duration), Gravity Well pulls
bodies into kill range during shield, PHALANX uncapped EMP chain, AEGIS
auto-full-Fortress every 45 s. Salvage pads the crystal income. The
EXTREME-gated tree reads as the defensive fantasy taken to its limit — the
game can't damage you, and the EMP cascade deletes the spawn stream as fast
as it arrives.

**⭐ HOLY SHIT node: PHALANX** — uncapped chain reads as a tooltip error
until it isn't.

---

## Grand totals

| Tree | Full-spec total |
|---|---:|
| Drifter *(3 capstones)* | 796 k |
| Phantom | 768 k |
| Inferno | 733 k |
| Warp | 768 k |
| Fortress | 768 k |
| **All trees combined** | **3 833 k** |

Matches the target post-cut band (~3 800 k expected). Drifter is the most
expensive tree on account of its third capstone — intentional, and gated
behind beating NORMAL so earners start there.

Typical per-run crystal earn rates (from the v1.6.2 crystal-economy audit):
~830 💎 on HARD 5-min, ~3 840 💎 on HARD 10-min, ~9 600 💎 on EXTREME 10-min.
Full-spec-all-trees ≈ 400 HARD runs or ≈ 160 EXTREME runs. PoE-style
long-horizon grind.

---

## Destroy-to-powerup cascade guard rails

Every tree has a 5-rank 2 %–10 % destroy-to-X proc node, all sitting at T2 in
their respective paths. Only one tree's destroy-to-X is active at a time
(bound to the equipped orb), so cross-tree cascades do not exist — but
within-tree feedback loops do.

| Node | Cascade risk | Required guard |
|---|---|---|
| **Siphon** (Drifter) | Random roll can land on nova → triple nova → more destroys → more Siphon procs | **Global 0.5 s cooldown** between Siphon procs regardless of kill count |
| **Soulbound** (Phantom) | Ghost destroys during wraith/Razor Veil proc Soulbound → ghost timer keeps extending. Theoretical infinite ghost during a kill streak | **Hard cap: Soulbound cannot extend ghost beyond 2× base duration** (Cosmic 12 s, others 8 s). Timer still refreshes inside the cap, just doesn't stack past it |
| **Firebrand** (Inferno) | Highest-risk node. Nova kill → Firebrand proc → new nova → more kills → more procs. Cinder burn-zone kills also proc Firebrand → recursion | **Global 1.0 s cooldown** on Firebrand procs. Firebrand-fired novas respect the existing nova-overload guard (`www/index.html:7171-7184`) — if any nova-combo is live, the proc is suppressed. SUN FORGE bypasses the guard; Firebrand does not |
| **Slipstream** (Warp) | Hyperspeed-barrier kills proc Slipstream → +1 stack → wider barrier → more kills → more procs. At max stacks, existing refresh-soonest-timer logic absorbs the procs (`www/index.html:7949-7956`) | **No additional guard at sub-cap.** With SUPERLUMINAL spec'd, no cap exists — flag: intentional "break at full spec" interaction. Monitor render/physics stability at stacks ≥ 20 |
| **Bastion II** (Fortress) | Shield kill → EMP → EMP kill → Bastion II proc → new shield. PHALANX's uncapped chain amplifies this significantly | **EMP-chain-sourced destroys are flagged `source: 'emp'` and excluded from Bastion II proc rolls.** Direct shield hits still proc. Removes the PHALANX + Bastion II infinite loop |
| **Bastion II overflow** *(Revision 9)* | Proc while already at `shieldHits` cap would previously waste | **Overflow rule:** proc grants +0.5 s to the remaining shield duration instead of wasting. Documented in node text |

### Capstone interaction notes

| Pair | Effect | Guard |
|---|---|---|
| Firebrand + CRITICAL MASS | Firebrand-fired nova could kill 10+ bodies, triggering CRITICAL MASS's free supernova | Existing 5 s CRITICAL MASS cooldown handles it |
| Soulbound + NIGHT SHADE | 2 s auto-ghost can overlap with ongoing Soulbound-extended ghost | Harmless — timers just extend |
| Slipstream + SUPERLUMINAL | Explicitly intended broken interaction. Stacks accumulate without bound from kills | Flag-only, not a guard |
| Bastion II + AEGIS | AEGIS direct-sets `shieldHits = 4` every 45 s. Between firings, Bastion II procs top up toward Bastion T3 cap (up to 7) | Works as intended |
| DEAD CENTER + Double or Nothing | DEAD CENTER fires the player's picked single; Double or Nothing adds a bonus random single-fire afterwards | No conflict — Double or Nothing triggers off burst activation, not burst outcome |
| DEAD CENTER + CALCULATED DRIFT | CALCULATED DRIFT upgrades DEAD CENTER's output from single to pair combo. Stack is the intended three-capstone payoff | Works as intended — CALCULATED DRIFT is gated behind DEAD CENTER purchase, so the sequence is enforced |

---

## Visual escalation flag table

Every node/capstone audited. Only flagged where the current codebase has **no
existing visual representation** for the upgraded state. Categories:

- **CRITICAL** — player can't tell the upgrade is active without it
- **HELPFUL** — power communicates but feels better with
- **HUD-ONLY** — HUD readout, not playfield work

| Tree | Node / capstone | Flag | Why |
|---|---|:---:|---|
| Drifter | Loaded Dice | — | Pure RNG manipulation, no visible state change |
| Drifter | Fortune Favors | — | Invisible bias |
| Drifter | **Double or Nothing** | HELPFUL | Second-fire should have a brief "echo" flash cue so player knows the node is active |
| Drifter | Restless Orb | HUD-ONLY | Existing burst cooldown bar fills faster |
| Drifter | Prime Mover (ranks 1–4) | HUD-ONLY | `#streakDisplay` hardcoded to streak 8 cap — verify `x9`–`x12` render readably |
| Drifter | Tempo | — | Time bonus is silent; appears only on death screen |
| Drifter | Oracle Edge | — | Spawn rate only, no visible state |
| Drifter | **Siphon** | **CRITICAL** | Proc feedback required — player must see that a kill generated a powerup |
| Drifter | Keystone | HELPFUL | Needs a cue when two singles coalesce into a pair |
| Drifter | **DEAD CENTER** | **CRITICAL** | Full-pause radial-menu overlay is new UI. Quadrant highlight cycle, slot-machine auto-cycle flash |
| Drifter | **CALCULATED DRIFT** | **CRITICAL** | Upgrades DEAD CENTER's output from single to pair combo — menu should visually indicate the combo upgrade is active (e.g. quadrant icons change to combo icons when CALCULATED DRIFT is spec'd) |
| Drifter | BUTTERFLY EFFECT | HELPFUL | Duplicated pickup needs a tag (faint "echo" tint) |
| Phantom | Lingering Veil | HUD-ONLY | Timer bar auto-extends |
| Phantom | Eternal Ember | HUD-ONLY | Timer bar auto-extends |
| Phantom | **Twilight Echo** | **CRITICAL** | Player needs to know ghost auto-refreshed after a combo ended (else feels like a bug) |
| Phantom | Razor Veil | CRITICAL | Destroy-on-contact during ghost without shield — existing wraith visuals require shield, need a distinct razor kill cue |
| Phantom | Ghostlight | HELPFUL | Visually similar to existing EMP primary but smaller/dimmer — reuse with scaled opacity |
| Phantom | **Phantom Blade** | **CRITICAL** | Permanent per-frame aura around player during ghost — no existing continuous-aura visual |
| Phantom | Shadow Regen | HUD-ONLY | Timer bar auto-extends |
| Phantom | **Soulbound** | **CRITICAL** | Proc feedback |
| Phantom | **Beyond** | **CRITICAL** | Afterimage: player visible but invulnerable — new state |
| Phantom | SHROUD | — | Uses existing Eternal Phantom visuals |
| Phantom | **NIGHT SHADE** | HUD-ONLY | 60 s auto-ghost countdown |
| Inferno | Kindling (waves 7–9) | HELPFUL | 9 concurrent nova rings — pixi handles, but density concern |
| Inferno | Conflagration | HELPFUL | Same density note |
| Inferno | Second Flame | — | Existing nova visual |
| Inferno | Solar Flare | HELPFUL | Larger rings, existing visual scales |
| Inferno | Halo | HELPFUL | Same |
| Inferno | Coronal Hold | — | Longer lethal window, existing visual lingers |
| Inferno | **Cinder** | **CRITICAL** | Burn zones — new persistent ground-hazard object type |
| Inferno | **Firebrand** | **CRITICAL** | Proc feedback |
| Inferno | Combustion (bonus waves) | HELPFUL | Extra waves inherit existing visual |
| Inferno | **SUN FORGE** | HUD-ONLY | 15 s auto-supernova countdown |
| Inferno | CRITICAL MASS | — | Free supernova uses existing visual |
| Warp | Thrust | HELPFUL | Faster trail, existing visual |
| Warp | Afterburn | HELPFUL | Deceleration tail lingers, existing trail inherits |
| Warp | Breakaway | HELPFUL | Same |
| Warp | Reservoir | HUD-ONLY | Timer bar auto-extends |
| Warp | **Overdrive (ranks 2–4, cap 7–10)** | **CRITICAL** | `hyperStackText` at `www/index.html:6793` likely hardcoded for stacks 1–6. Need to verify 7+ renders. Also verify stack-tint colour palette (gold/orange/red/white) handles 5th–10th states |
| Warp | Infinite Gate | HUD-ONLY | Timer-boost invisible without HUD feedback |
| Warp | Smooth Entry | HELPFUL | Wider barrier, existing visual scales |
| Warp | **Slipstream** | **CRITICAL** | Proc feedback |
| Warp | Warp Harmonic | HUD-ONLY | Bonus stacks appear in existing stack display |
| Warp | **SUPERLUMINAL (stacks 15+)** | **CRITICAL** | 15-stack visually indistinguishable from 6-stack with current visuals. Player can't tell the build is working past cap |
| Warp | **EVENT HORIZON** | **CRITICAL** | Proximity-kill 30 px aura — no existing proximity visualizer |
| Fortress | Kinetic Ward | HUD-ONLY | Shield timer auto-extends |
| Fortress | Kinetic Ward II | HUD-ONLY | Same |
| Fortress | **Bastion (cap 5–7)** | **CRITICAL** | Shield stack HUD renders 1–4 hits today. No visuals for 5/6/7-hit states |
| Fortress | Chain Reaction | HELPFUL | Larger primary EMP, existing visual scales |
| Fortress | Chain Reaction II (depth 2–4) | HELPFUL | More rings in sequence; at depth 3–4 density becomes high |
| Fortress | Detonation | HELPFUL | Larger secondary EMP, existing visual scales |
| Fortress | **Salvage** | **CRITICAL** | +1 crystal on destroy needs a pickup animation at the kill site. No existing kill-site crystal |
| Fortress | **Bastion II** | **CRITICAL** | Proc feedback (prototype for the destroy-to-X family) |
| Fortress | **Gravity Well** | **CRITICAL** | New shield-state visualizer (attract lines / aura) |
| Fortress | **PHALANX (depth 5+)** | HELPFUL | Uncapped chain reuses existing EMP visual; density concern, not broken |
| Fortress | **AEGIS** | HUD-ONLY | 45 s auto-Fortress countdown |

### Summary counts

| Category | Count |
|---:|---:|
| CRITICAL | **18** *(17 from previous audit + 1 for CALCULATED DRIFT menu upgrade cue)* |
| HELPFUL | 15 |
| HUD-ONLY | 14 *(added NIGHT SHADE and Double or Nothing — previously miscategorized; added CALCULATED DRIFT context)* |
| No new visual needed | 12 |

### Highest-priority visual work

- **Destroy-to-powerup proc family** (Siphon, Soulbound, Firebrand, Slipstream,
  Bastion II) — shared visual language, design once, reuse 5×
- **Bastion stack display 5–7** — extends existing shield indicator
- **Overdrive / SUPERLUMINAL stack display 7+** — extends existing hyperspeed
  stack indicator; needs "past-cap" distinction state
- **DEAD CENTER radial menu + CALCULATED DRIFT upgrade state** — new full-pause
  overlay UI with a secondary "combo mode" indicator
- **EVENT HORIZON proximity aura** — new at-player aura
- **Gravity Well shield attract** — new shield-state cue
- **Phantom Blade ghost aura** — new per-frame aura during ghost
- **Beyond ghost afterimage** — new post-ghost invulnerability cue
- **Razor Veil wraith-like kill** — new kill visual (or no-shield variant of
  existing wraith)
- **Twilight Echo auto-refresh cue** — proc feedback on ghost re-ignition
- **Salvage crystal pickup** — new kill-site crystal animation
- **Cinder burn zones** — new persistent ground hazard

### HUD-only readouts

One reusable "auto-trigger countdown ring" component covers all three
capstone timers:

- NIGHT SHADE 60 s cooldown
- SUN FORGE 15 s cooldown
- AEGIS 45 s cooldown

Visual escalation design pass recommended to prioritize the destroy-to-powerup
family (1 design, 5 uses) and the stack-count extensions (2 HUD tweaks, large
clarity payoff). Full visual design is scheduled as a separate pass.
