# BULWARK REWORK — DESIGN PROPOSAL v3.1 (no implementation)

> Status: **proposal only**, no Bulwark code changed. The 5th and final original-orb rework.
> Same framework as Drifter/Phantom/Inferno/Warp: single-rank + ActiveBudget, costOverride/pointCost,
> capstones folded into paths, per-orb schema migration, shape-based mergeTrees guard, `_asteroid_`
> flash system, branching tree UI. Grounded in the current `www/index.html`.
>
> **v3.1 change:** Dead Star trigger **10 → 20 cumulative shield stacks lost** — at 10 the 1.6s invulnerable
> board-pulling cinematic fired too often; 20 makes it an earned marquee moment. Inter-implode floor recalculated
> to **≥30 incoming hits** (golden-shield lockout ≥10 + recharge ≥20). Golden shield stays 10 hits; crush still
> excluded from the counter. See [§5](#5-collapse-gravity), [§8](#8-balance-landmines).
>
> **v3 changes (prior pass — user answers finalized):**
> - **Dead Star scoring/counter:** crushed bodies **DO** count toward score **and** Salvage's shave, but **NOT**
>   toward the next implode's stack-loss counter (anti-chain). [§5](#5-collapse-gravity), [§8](#8-balance-landmines), [§10](#10-defined-terms).
> - **Dead Star visual choreography** specified (4 phases: rim sweep inward → planets dragged → crush/morph → golden shield forms),
>   with screenshake + full-animation invulnerability — the marquee Collapse payoff. [§5](#5-collapse-gravity).
> - **Salvage 50% floor:** the burst-CD shave can never reduce the live cooldown by more than **50% total** at any moment
>   (prevents EMP-cascade over-shave). Stated in the node + [§8](#8-balance-landmines).
>
> **v2 changes (prior pass):**
> - **§11 RAINBOW section deleted.** The rainbow run was removed and replaced by the Ascension
>   (Phantasm) run, so asteroid is **no longer the rainbow engine**. The reworked `asteroid.rankOf`
>   needs **no** rainbow short-circuit, there is **no** rainbow capstone-set decision, and **no** rainbow
>   shield-cap alignment. This significantly simplifies the rework.
> - **RAMPART:** Counterweight rejected → **Reactive Plating** (20% chance to not lose a shield stack on hit);
>   Second Wall reworked (auto 2-stack shield after 1.5s shieldless, 20s CD); Aegis reworked (screen-clearing
>   EMP every 60s, reusing the existing shield-EMP — no fortress auto-fire, no new shockwave).
> - **OVERLOAD:** Capacitor 4s→5s; Conduction rejected → (+20% primary radius, +2 chain depth);
>   Phalanx changed to **fork + +3 depth** (bounded, not uncapped); **EMP kills now FEED Bastion II**
>   (the `source:'emp'` exclusion is removed — see [§8](#8-balance-landmines) for why the CD+cap suffice).
> - **COLLAPSE:** Salvage → −0.5%/kill and **EMP kills count**; Bastion II → 20% / 3s CD (still 2× cap);
>   Accretion reworked (3s absorb-window → pulled bodies become shield stacks); Black Hole **completely
>   redesigned** into **DEAD STAR** (shield-loss-triggered implode → golden shield).

## Table of Contents
- [0. Code-Grounded Facts](#0-code-grounded-facts)
- [1. Current Bulwark Inventory](#1-current-bulwark-inventory)
- [2. Proposed Path Identities](#2-proposed-path-identities)
- [3. RAMPART (Fortification)](#3-rampart-fortification)
- [4. OVERLOAD (Devastation)](#4-overload-devastation)
- [5. COLLAPSE (Gravity)](#5-collapse-gravity)
- [6. Skill Consolidation Plan](#6-skill-consolidation-plan)
- [7. Renamed / Repositioned + Dead Star prereq refactor](#7-renamed--repositioned--dead-star-prereq-refactor)
- [8. Balance Landmines](#8-balance-landmines)
- [9. Auto-Fire HUD Ring Preservation](#9-auto-fire-hud-ring-preservation)
- [10. Defined Terms](#10-defined-terms)
- [11. Cross-Orb Concerns](#11-cross-orb-concerns)
- [12. Cost Sanity Check](#12-cost-sanity-check)
- [13. Flash Text Feedback Plan](#13-flash-text-feedback-plan)
- [14. Open Design Questions](#14-open-design-questions)
- [15. Implementation Notes](#15-implementation-notes)

---

## 0. Code-Grounded Facts

**Tree (`TREE_DEFS.asteroid`):** fortification[`kineticWard` +10%/rank dur, `kineticWard2` +0.5s/rank, `bastion` +1 hit cap/rank], devastation[`chainReaction` +10%/rank EMP radius, `chainReaction2` +1 hop/rank (base depth 1), `detonation` +30%/rank secondary], opportunism[`salvage` −0.1/0.2/0.3%/kill, `bastion2` 2/4/6/8/10% → +1s shield (5s CD), `gravityWell` 0.1/0.2/0.5 pull]. Capstones: `phalanx`, `aegis`, `blackHole`.

**Shield:** `SHIELD_DURATION_MS_ASTEROID = 6000`; `SHIELD_DURATION()` = `round(6000×(1+0.10·kineticWard) + 500·kineticWard2)`; `FORTRESS_SHIELD_DURATION_MS = 8000`; `SHIELD_HITS_MAX_ASTEROID = 4`; `shieldHitsCap() = 4 + rankOf('bastion')`. Shield is a **timed effect** (`activeEffects.shield`/`shieldEndTime`) **and** a hit pool (`shieldHits`); it ends when duration expires **or** hits hit 0. Pickup on asteroid = `+2` hits capped.

**EMP:** `EMP_RINGS_CAP = 6`, `EMP_MAX_RADIUS = 180`, `EMP_EXPAND_PX_PER_SEC = 420`. Fires when a shield destroys a body on contact. Primary `180×(1+0.10·chainReaction)`; secondary `120×(1+0.30·detonation)`; depth `maxDepth = phalanx ? 999 : 1 + chainReaction2`; phalanx decay `0.8^(depth−2)`. **EMP kills route `checkDestroyProc(b,'emp')`; today `source:'emp'` excludes Bastion II** (the old anti-loop guard — being removed in v2).

**Gravity Well / Black Hole:** per-frame while shield active, bodies pull toward player; `force = [0.1,0.2,0.5][rank-1]`, `×2` if Black Hole. Three `gravityWell rank===3` gate sites: `capstonePrereqMet` (`opportunism[2]>=3`), `drawGravityWellLines` (`gwRank>=3`), physics (`gwRankApplied>=3`). (The rainbow gravity hardcode that used to live here was **removed** with the rainbow feature.)

**Bastion II:** `bastion2Proc` blocks if `bastion2BonusMs + 1000 > SHIELD_DURATION()` (→ ≤ 2× base per instance), 5s CD, resets per fresh shield.

**Aegis:** `AEGIS_CYCLE_MS = 60000`; today auto-fires `shield_shield` (fortress) every 60s; HUD ring `#capCdAegis` (label "AEGIS", cyan), updater present. **`shakeCapstone('aegis') = addShake(11)`.**

**Economy:** asteroid still in `ORIGINAL_5_ORBS` (flat T1 1k/T2 2k/T3 3k, capstone 5k). No `ORB_BEHAVIOR.asteroid`, no `_asteroid_` flash, no `ASTEROID_*` constants, no migration. `ORB_DEFS.asteroid` desc "Durable shields. Shields spawn more often.", `bias:'shield'`.

**RAINBOW: GONE.** The rainbow run is removed; `rainbowRunActive`/`RAINBOW_*`/the asteroid override no longer exist. Asteroid is a normal player-chosen orb only.

---

## 1. Current Bulwark Inventory

| Node (key) | Path | Max | Effect at max | Disposition |
|---|---|---|---|---|
| Kinetic Ward (`kineticWard`) | Fort | 3 | +30% shield duration | Reuse (merge +2s) |
| Kinetic Ward II (`kineticWard2`) | Fort | 4 | +2s shield | Merge into Kinetic Ward |
| Bastion (`bastion`) | Fort | 3 | hit cap +3 | **→ keystone** (+2) |
| Chain Reaction (`chainReaction`) | Dev | 3 | EMP radius +30% | **→ keystone** (radius+depth) |
| Chain Reaction II (`chainReaction2`) | Dev | 3 | depth +3 | Reuse (support, +1) |
| Detonation (`detonation`) | Dev | 3 | secondary +90% | Reuse (+60%) |
| Salvage (`salvage`) | Opp | 3 | −0.3%/kill burst CD | Reuse (→ −0.5%, +EMP kills) |
| Bastion II (`bastion2`) | Opp | 5 | 10% → +1s shield | Reuse (→ 20% / 3s) |
| Gravity Well (`gravityWell`) | Opp | 3 | pull 0.5 | **→ keystone** |
| PHALANX | cap | — | uncapped chain | → Dev capstone (fork + depth, bounded) |
| AEGIS | cap | — | fortress / 60s | → Fort capstone (screen-clear EMP / 60s) |
| BLACK HOLE | cap | — | gravity ×2 | **→ DEAD STAR** (implode → golden shield) |

---

## 2. Proposed Path Identities

> Palette dodges all claimed orbs (Roamer amber/teal/red · Phantasm violet/cyan/pink · Drifter cyan/amber/magenta · Phantom indigo/magenta/lavender · Inferno fire · Warp azure/ice-blue/cobalt-violet). Bulwark anchor grey `168,162,158`. Triad uses unclaimed families: steel, electric-lime, bronze-gold.

### FORTIFICATION → **RAMPART** — color **steel `170,185,205`**
*"Nothing gets through. You are the wall, and the wall repairs itself."*
- Stack hit-cap, duration, damage-negation, and self-repair into near-unbreakable shield uptime; periodic screen-clear EMP.
- **Keystone (Bastion):** *Your shield holds +2 more hits (4 → 6), and every shield you grab refills it to full. You stop being a target and become a fortress.*

### DEVASTATION → **OVERLOAD** — color **electric lime `175,225,85`**
*"Your shield doesn't just block — it discharges, and the discharge spreads."*
- Turn shield-kills into chaining, forking EMP cascades; proactive auto-pulses.
- **Keystone (Overload):** *Every body your shield shatters detonates a wider EMP that leaps to one more target. The wall fights back.*

### OPPORTUNISM → **COLLAPSE** — color **bronze-gold `200,150,70`**
*"Bend the battlefield, then collapse it into a golden core."*
- Pull bodies into kill/absorb range; convert defense into board control; the capstone is a defensive implosion that crushes the screen into a golden shield.
- **Keystone (Gravity Well):** *While shielded, space bends toward you and bodies drift into your hull. Defense becomes a tractor beam.*

---

## 3. RAMPART (Fortification)

| Node | Type | Pts | Crystals | Effect (single-rank) | Disp. | Notes |
|---|---|---|---|---|---|---|
| **Bastion** (`bastion`) | Keystone | 5 | 7,000 | Shield hit cap **+2 (4→6)**; shield pickups **refill to full cap**. | Redesign | The wall identity. **Passive — no flash.** |
| **Kinetic Ward** (`kineticWard`) | T1 | 2 | 3,000 | Shield duration **+30% and +2s**. | Reuse (merge kw2) | **Passive.** |
| **Reinforce** (`reinforce`) | T1 | 2 | 3,000 | Shield hit cap **+1** (→7 with Bastion). | New | **Passive.** |
| **Reactive Plating** (`reactivePlating`) | T1 | 2 | 3,000 | When your shield is hit, **20% chance to NOT lose a shield stack** (the EMP blast still fires as normal). | New (replaces rejected Counterweight) | Active proc → flash "REACTIVE PLATING" (throttled). Pure damage-negation — useful on its own. |
| **Second Wall** (`secondWall`) | T2 | 3 | 5,500 | When you have **no shield active for >1.5s**, instantly gain a **2-stack** shield. **20s cooldown.** | New (changed) | Active → flash "SECOND WALL". The 1.5s gap + 20s CD prevent permanent shield. |
| **Aegis** (`aegis`) | Capstone | 5 | 9,000 | Every **60s**, your shield emits the existing shield-EMP **scaled to clear the whole screen** (the EMP that normally fires when a shield takes a hit). No fortress auto-fire, no new shockwave. | Reuse (changed) | **Keeps `#capCdAegis` ring.** Active → flash "AEGIS". |

**Totals:** 19 pts · 30,500 crystals · 6 nodes. **Keystone:** hit-cap is *the* tank lever. **Capstone:** a guaranteed 60s screen-wipe via the orb's own signature EMP — endgame board-control without inventing a new effect.

> **Reactive Plating rationale:** the rejected Counterweight ("shove bodies") was pointless because a shield-hit already fires an EMP that kills the contacting body — there's nothing to shove. Damage-negation (keep the stack) is a real defensive payoff that compounds with the wall identity.

---

## 4. OVERLOAD (Devastation)

| Node | Type | Pts | Crystals | Effect (single-rank) | Disp. | Notes |
|---|---|---|---|---|---|---|
| **Overload** (`chainReaction`) | Keystone | 5 | 7,000 | EMP blast radius **+30%**, and every shield-kill EMP **chains +1 hop** (base depth 1 → 2). | Redesign | Cascade identity from activation. **Passive.** |
| **Chain Reaction** (`chainReaction2`) | T1 | 2 | 3,000 | Chain depth **+1** more. | Reuse | **Passive.** |
| **Detonation** (`detonation`) | T1 | 2 | 3,000 | Secondary EMP radius **+60%**. | Reuse | **Passive.** |
| **Capacitor** (`capacitor`) | T1 | 2 | 3,000 | While shielded, auto-fire an **EMP pulse every 5s** from the player (no contact-kill needed). | New (5s, was 4s) | Active → flash "CAPACITOR" (throttle ≥1/5s). Respects `EMP_RINGS_CAP`. |
| **Conduction** (`conduction`) | T2 | 3 | 5,500 | EMP primary radius **+20%**, and chain depth **+2 more**. | New (changed) | **Passive.** (Replaces the rejected "free hop", which was redundant with Capacitor + chain nodes.) |
| **Phalanx** (`phalanx`) | Capstone | 5 | 9,000 | Chains can **FORK** (each killing hop has a chance to split into a second chain) **and chain depth +3 more**. Strong but **bounded** (not uncapped). | Reuse (changed) | No ring (state-driven). Active → flash "PHALANX" on a fork (throttled). |

**Totals:** 19 pts · 30,500 crystals · 6 nodes. **Keystone:** Overload converts the passive shield-kill EMP into a true cascade. **Capstone:** forking + deep chains nuke the board, but bounded so Chain Reaction / Conduction stay meaningful (the old uncapped Phalanx made depth nodes pointless).

**Max chain depth at full Devastation investment:** base 1 + Overload 1 + Chain Reaction 1 + Conduction 2 + Phalanx 3 = **depth 8**, plus forking. Bounded and `EMP_RINGS_CAP`-limited.

> **LOOP-GUARD CHANGE (v2): EMP kills now FEED Bastion II** — the `source:'emp'` exclusion is removed. This is required to make Collapse's Bastion II viable alongside the EMP-heavy Devastation play. **Why it's safe:** Bastion II is gated by (a) a **3s cooldown** (≤1 proc per 3s no matter how many EMP kills land) and (b) a **per-instance cap** of `bonus ≤ base SHIELD_DURATION()` (total ≤ 2× base). So a full EMP cascade can extend the *current* shield by at most +1s per 3s up to 2× base, then it's hard-blocked until a fresh shield resets the cap. The shield still **expires on its duration timer** — see [§8](#8-balance-landmines).

---

## 5. COLLAPSE (Gravity)

| Node | Type | Pts | Crystals | Effect (single-rank) | Disp. | Notes |
|---|---|---|---|---|---|---|
| **Gravity Well** (`gravityWell`) | Keystone | 5 | 7,000 | While shielded, bodies are **pulled toward you** (force 0.5). | Redesign | The pull is the path. **Passive field — no flash.** |
| **Salvage** (`salvage`) | T1 | 2 | 3,000 | Kills during shield shave **−0.5%** burst CD each — **EMP kills count too**. The shave can reduce your burst cooldown by **at most 50% total** at any moment (it won't refresh burst to near-zero during big cascades). | Reuse (changed) | **Passive.** Was −0.3%, contact-only, no floor. |
| **Bastion II** (`bastion2`) | T1 | 2 | 3,000 | On body destroyed during shield, **20%** chance **+1s** shield duration. **3s CD.** Capped at 2× base. | Reuse (changed) | Active → flash. Was 10% / 5s CD. |
| **Accretion** (`accretion`) | T1 | 2 | 3,000 | While shielded, **every 3s a 3-second absorb window opens**: bodies the well pulls into shield contact are **absorbed into shield stacks** (+1 hit each, capped at your hit cap) instead of destroyed. Outside the window, pulled bodies behave as normal shield contact (destroy + EMP). | New (changed) | Active → flash "ACCRETION" on window open (throttled). +1 stack per absorbed body, **clamped to `shieldHitsCap()`**. |
| **Tidal Force** (`tidalForce`) | T2 | 3 | 5,500 | Pull strength **+50%**, ramping stronger the closer a body gets. | New | **Passive** field modifier. |
| **Dead Star** (`blackHole`) | Capstone | 5 | 9,000 | **Every 20 cumulative shield stacks you lose, IMPLODE:** a reversed-EMP rim sweeps from the screen edges **inward**, physically **dragging every on-screen planet toward you**, crushing them into a **GOLDEN SHIELD** (10 hits). You are **invulnerable** for the whole animation. Crushed planets **count toward score & Salvage** but **NOT** toward the next implode's counter. While the golden shield is up, **shield-stacks-lost aren't counted** (lockout). | **Complete redesign** (was Black Hole gravity ×2) | No ring (state-triggered). Active → flash "DEAD STAR". Key `blackHole` kept for migration; display "DEAD STAR". A 20-stack-loss trigger keeps it a marquee payoff, not routine. See visual choreography below. |

**Totals:** 19 pts · 30,500 crystals · 6 nodes. **Keystone:** the pull defines the path. **Capstone:** Dead Star is endgame-defining — a defensive panic-button that converts accumulated damage into a screen-clear + a powerful golden shield, gated so it can't loop (see [§8](#8-balance-landmines)).

> **Note:** Dead Star **no longer touches gravity force** (the old ×2). Gravity scaling now comes only from Gravity Well (keystone) + Tidal Force. See the [§7 prereq refactor](#7-renamed--repositioned--dead-star-prereq-refactor).

### Dead Star — visual choreography (the marquee Collapse payoff)

The implode is a one-shot ~1.6s sequence; the player orb is **invulnerable from the first frame to the last**. Four phases (timings are targets for the implementation prompt):

1. **RIM SWEEP INWARD (0–0.5s).** A bright golden/violet reversed-EMP ring spawns at the **screen edges** and contracts inward toward the player orb (the opposite of a normal EMP that expands outward). Light screenshake builds as it closes. The world dims slightly behind it.
2. **PLANETS DRAGGED (0.3–1.0s, overlaps).** As the rim passes each on-screen planet, that planet is **caught and dragged inward along with the rim** toward the player (accelerating, with a short motion-trail), so the rim visibly *hauls the board in* rather than just passing through it.
3. **CRUSH / MORPH (0.9–1.3s).** Planets reaching the orb **compress and morph** into the forming shield — each one flashes and folds into a golden shard at the rim radius (count toward score + Salvage as they're consumed). Peak screenshake + a short hitstop on the collapse beat.
4. **GOLDEN SHIELD FORMS (1.3–1.6s).** The shards coalesce into the **GOLDEN SHIELD**: the standard shield visual but **gold-tinted, thicker rim, glowing**, settling around the orb. Invulnerability ends as the shield finalizes. The golden shield then takes 10 hits, **cracking and dimming** as it nears 10, before shattering.

Screenshake throughout (building → peak at crush), one hitstop at the crush beat. Reuses the EMP-ring renderer (reversed/contracting) + the gravity-pull body loop (screen-wide, animation-window only) + a new gold shield render variant — no wholly new particle systems required.

---

## 6. Skill Consolidation Plan

| Original | New disposition | Reasoning |
|---|---|---|
| `kineticWard` / `kineticWard2` | Merge → Kinetic Ward T1 (+30% & +2s) | Two duration nodes were redundant; frees a slot for Reactive Plating. |
| `bastion` | **Keystone** Bastion (+2 + refill) | Hit-cap = tank identity. |
| `chainReaction` | **Keystone** Overload (radius + depth) | Biggest EMP lever. |
| `chainReaction2` / `detonation` | T1 supports (depth +1 / secondary +60%) | Kept. |
| `salvage` | T1 (−0.5%/kill, +EMP kills) | Buffed + EMP-inclusive. |
| `bastion2` | T1 (20% / 3s, 2× cap) | Buffed; now EMP-fed. |
| `gravityWell` | **Keystone** Gravity Well | The pull = the path. |
| `phalanx` | Dev capstone (fork + depth, bounded) | Bounded so depth nodes matter. |
| `aegis` | Fort capstone (screen-clear EMP / 60s) | Reuses the shield-EMP; no new effect. |
| `blackHole` | **Dead Star** (implode → golden shield) | Complete redesign; key kept for migration. |

**New node keys:** `reinforce`, `reactivePlating`, `secondWall` (Fort); `capacitor`, `conduction` (Dev); `accretion`, `tidalForce` (Collapse).

---

## 7. Renamed / Repositioned + Dead Star prereq refactor

- Keystones keep existing keys (`bastion`, `chainReaction`, `gravityWell`); `chainReaction2` becomes the depth support. Capstone keys kept (`aegis`, `phalanx`, `blackHole`) for clean migration; `blackHole` displays "DEAD STAR".
- **Three `gravityWell rank===3` sites → keystone-owned** (single-rank): `capstonePrereqMet` (`opportunism[2]>=3` → `rankOf('gravityWell')>=1`), `drawGravityWellLines` (`gwRank>=3` → `>=1`), physics (`gwRankApplied>=3` → `>=1`). **Plus:** since **Dead Star no longer doubles gravity**, the physics/visual `×2 if blackHole` multipliers are **removed**; gravity scaling is keystone (0.5) × Tidal Force (1.5). The `blackHole` capstone node is now read for the **implode** logic, not the gravity force.
- **No name collisions:** Reactive Plating, Second Wall, Capacitor, Conduction, Accretion, Tidal Force, Overload, Dead Star don't collide with COMBO_DEFS (SUPERNOVA/WARP TIME/PHANTOM BLAST/PULSAR/SPECTRAL RUSH/JUGGERNAUT/WRAITH/ETERNAL PHANTOM/FORTRESS SHIELD) or other trees. **"Golden Aegis" was avoided** for the capstone (Aegis is the Fortification capstone) — hence **Dead Star**.

---

## 8. Balance Landmines

Bulwark's classic risk is **permanent/infinite shield**. With rainbow gone, the only interactions are within the asteroid tree itself.

1. **Bastion II fed by EMP kills (v2/v3) — bounded; proof still holds.** Removing the `source:'emp'` exclusion lets EMP cascades (and Dead Star's crushed bodies) proc Bastion II, but the two gates are unchanged: **3s CD** (≤1 proc/3s regardless of kill volume) **+ per-instance cap** (`bonus ≤ base SHIELD_DURATION()`, total ≤ **2× base**). So the *current* shield extends by at most +1s/3s up to 2× base, then hard-blocks until a fresh shield resets `bastion2BonusMs`. **The shield still ends on its duration timer** (capped at 2× base) — no infinite shield. The v3 changes (Salvage floor, Dead Star scoring) don't touch Bastion II's CD or cap, so the proof is intact. Re-validate `EMP_RINGS_CAP = 6` holds with forking Phalanx (oldest ring dropped on overflow; depth decay `0.8^(depth-2)` bounds ring count).
2. **Salvage 50% floor (v3) — bounded.** Salvage now counts EMP kills and shaves −0.5%/kill with no per-kill CD, so a 30-kill cascade would otherwise shave −15% and a huge Phalanx fork could approach 100% (near-instant burst refresh). The floor caps the **total live shave at 50%**: `burstCooldownEnd` may never be pulled closer than `burstStart + 0.5 × BURST_COOLDOWN_MS` by Salvage. Implementation: clamp `burstCooldownEnd = max(burstCooldownEnd - shave, burstStart + 0.5×BURST_COOLDOWN_MS)` (track the cooldown's start so the floor is measured from a full cooldown). Burst stays a meaningful resource even during a board-wide cascade.
3. **Accretion — bounded.** Absorb grants **+1 stack per body, clamped to `shieldHitsCap()`** (≤7), and only during the 3s windows. It refills *hits*, not *duration* — so the shield's (≤2× base) duration timer still ends it. No permanent shield. (Verify at implementation that duration-expiry ends the shield even with hits remaining — Bulwark's shield must not become hit-only.)
4. **Second Wall — bounded.** Only fires after **1.5s with no shield**, **20s CD**, grants a small 2-stack shield. Cannot chain into permanent shield.
5. **Aegis — bounded.** A 60s screen-clear EMP; no shield grant, no loop. Reuses `spawnEmpRing` at a screen-covering radius; one ring/60s — negligible perf.
6. **Dead Star implode — provably cannot chain infinitely (v3.1, trigger = 20 stacks lost).** Two independent gates combine:
   - **(a) Counter-exclusion:** the implode is charged by **shield stacks LOST**. The bodies the implode **crushes do NOT add to the next implode's counter** — they feed score & Salvage only. So an implode can never "pay for itself": clearing the board doesn't refund any progress toward the next one.
   - **(b) Lockout while golden:** while the golden shield (10 hits) is active, **stack-loss isn't counted at all**.
   - **Combined:** to fire implode N+1 the player must (1) take **≥10 hits to break the current golden shield** (lockout means none of those count), then (2) take **≥20 more hits while a normal shield is up** to re-charge the now-20-stack counter — a hard **≥30 incoming-hits floor between implodes**, none of it suppliable by the implode's own crush. (Raising the trigger 10→20 only lengthens leg (2), so the floor grows from ≥20 to ≥30 — the proof strengthens.) Invulnerability covers only the ~1.6s **animation**, not the golden shield's lifetime. **No infinite chain, no infinite invuln.**
7. **Performance:** gravity pull reuses the existing per-frame `updateBodies` loop (no new loops; larger reach only). Dead Star's screen-pull runs for the animation window only, batched via `shakeMassDestroy`. EMP rings stay `EMP_RINGS_CAP`-bounded.

**Full-investment interaction:** a wall that rarely breaks (Bastion/Reinforce cap 7 + Kinetic Ward duration + Reactive Plating negation + Second Wall + Bastion II ≤2× dur), discharging forking EMP cascades (Overload + Conduction + Phalanx + Capacitor), pulling/absorbing bodies (Gravity Well + Tidal + Accretion), and panic-imploding into a golden shield (Dead Star). Strong and build-defining, but every loop is CD- or cap-bounded.

---

## 9. Auto-Fire HUD Ring Preservation

- **Aegis** (Fort capstone, 60s) → **keep `#capCdAegis`** ring (label "AEGIS", cyan), updater unchanged; gate becomes `activeOrb === 'asteroid' && rankOf('aegis')`.
- **Capacitor** (5s) → too fast for a ring; **flash only**, throttled.
- **Second Wall, Reactive Plating, Bastion II, Accretion, Phalanx, Dead Star** → proc/state-triggered, **no rings**; flash only.
- No rings cut; one ring preserved.

---

## 10. Defined Terms
- **Shield hit / stack** — one unit of `shieldHits`. Consumed by body-bounce, EMP-kill-while-shielded decrement, crack-fragment hit. At 0 → `shieldBroken`. *"Shield stacks lost"* (Dead Star counter) counts each such decrement on a **normal** shield, and only while **not** locked out by an active golden shield.
- **Shield instance** — from a fresh shield gain until expiry/break; `bastion2BonusMs` resets per instance.
- **EMP chain hop** — a secondary EMP ring spawned at `depth+1` from a killing ring. **Fork** (Phalanx) — a killing hop spawning a *second* parallel chain.
- **Gravity well pull** — per-frame attraction of bodies toward the player while a shield is active (scaled by Gravity Well + Tidal Force).
- **Shield-stack absorb** (Accretion) — during a 3s window, a body pulled into shield contact is converted to **+1 shield hit** (capped at `shieldHitsCap()`) instead of being destroyed.
- **Implode** (Dead Star) — a one-shot ~1.6s event: reversed inward EMP rim that drags every on-screen planet to the orb + brief full-animation invulnerability, resolving into a 10-hit **golden shield**. Triggered per 20 shield-stacks lost; **crushed planets count toward score + Salvage but NOT toward the next implode's counter**; counting is locked out while the golden shield is active.

---

## 11. Cross-Orb Concerns

- **Rainbow is removed** — asteroid is a normal player-chosen orb. `asteroid.rankOf` is the standard reworked pattern (active-budget gated, no special-casing). No rainbow capstone-set, no shield-cap alignment, no forced `activeOrb='asteroid'`.
- **Shared destroy hook:** Salvage / Bastion II / Accretion fire from `checkDestroyProc` gated on `activeOrb === 'asteroid'`; EMP/gravity/implode kills route their own source tags and won't trigger other orbs' procs.
- **No shared node keys** with other orbs. The Ascension (Phantasm) run uses `activeOrb='phantomV2'` and never touches asteroid.

---

## 12. Cost Sanity Check

Per path (locked costs): keystone 7,000 + 3×T1 (3,000) + 1×T2 (5,500) + capstone 9,000 = **30,500**; **19 pts**. The v2 node changes are all same-tier swaps (no tier/count changes), so the total is **unchanged**.

| Orb | Total | Pts to unlock all 3 | Base/Cap |
|---|---|---|---|
| Drifter | 58,500 | 57 | 20/25 |
| Phantom | 69,000 | 57 | 20/25 |
| Inferno | 78,000 | 57 | 20/25 |
| Warp | 82,500 | 57 | 20/25 |
| **Bulwark (A)** | **91,500** | **57** | **20/25** |

**Option A (recommended): 91,500** — respects locked per-node costs; clearly the premium/highest orb (~3,500 over the ~88,000 estimate, which was approximate). Option B (88,500): capstones 9,000→8,000. Option C (84,000): supports 4×T1. **Recommend A.**

---

## 13. Flash Text Feedback Plan

New `_asteroid_addFlash/_asteroid_flash/_asteroid_drawFlashes`, mirroring `_nebula_*` (gate `activeOrb === 'asteroid'`).

| Trigger | Flash | Color | Throttle |
|---|---|---|---|
| Reactive Plating negates a hit | "REACTIVE PLATING" | steel `170,185,205` | ≥600ms |
| Second Wall auto-shield | "SECOND WALL" | steel | on proc (20s CD) |
| Aegis screen-clear EMP | "AEGIS" | steel | on fire (+ HUD ring) |
| Capacitor auto-EMP | "CAPACITOR" | lime `175,225,85` | ≥1/5s |
| Phalanx fork | "PHALANX" | lime | ≥800ms |
| Bastion II proc | "BASTION II" | bronze `200,150,70` | on proc (3s CD) |
| Accretion window opens | "ACCRETION" | bronze | on window open (≥3s) |
| Dead Star implode | "DEAD STAR" | gold `230,190,90` | on proc (per-implode) |

Passive stats (Bastion, Reinforce, Kinetic Ward, Overload, Chain Reaction, Detonation, Conduction, Gravity Well, Salvage, Tidal Force) — **no flash**.

---

## 14. Open Design Questions

**Resolved by v2:** ~~rainbow rankOf short-circuit~~ (rainbow removed), ~~rainbow capstone set~~ (gone), ~~rainbow shield-cap alignment~~ (gone), ~~Counterweight~~ (→ Reactive Plating), ~~Phalanx uncapped~~ (→ bounded fork+depth), ~~Bastion II EMP exclusion~~ (removed, CD+cap suffice), ~~Black Hole effect~~ (→ Dead Star implode).

**Resolved by v3 (user answers):**
- ~~Dead Star crush-scoring~~ → crushed bodies **count toward score + Salvage**, **NOT** toward the next implode's counter ([§5](#5-collapse-gravity), [§8](#8-balance-landmines)).
- ~~Dead Star counter scope / anti-chain~~ → counter-exclusion + golden-shield lockout = no infinite chain (proven in [§8](#8-balance-landmines)). Counter is **cumulative across the run, reset only when an implode fires**.
- ~~Dead Star visual~~ → 4-phase choreography (rim sweep → drag → crush/morph → golden shield) + screenshake + full-animation invuln ([§5](#5-collapse-gravity)).
- ~~Salvage over-shave~~ → **50% total floor** on the burst-CD shave ([§5](#5-collapse-gravity) node, [§8](#8-balance-landmines)).

**Still open (minor tuning — none block implementation):**
1. **Dead Star name** — "DEAD STAR" used; alternatives: Event Horizon, Implosion, Last Light, Collapse Core.
2. **Aegis EMP** — purely clears the screen (proposed), or also grant/refresh a shield?
3. **Reactive Plating %** — 20% negation, or scale it?
4. **Accretion cap** — only the hit-cap clamp (proposed), or also a per-window cap (e.g. ≤3/window)?
5. **Dead Star golden shield hits** — fixed 10 (proposed), or scale with Bastion/Reinforce hit cap?
6. **Phalanx fork chance** — ~25%/killing-hop proposed, bounded by `EMP_RINGS_CAP`.
7. **Collapse color** — bronze-gold `200,150,70` (mild Roamer-amber overlap) vs a cooler alternative.
8. **Path name** — keep "COLLAPSE" (fits the implosion capstone), or rename to "GRAVITY"?

---

## 15. Implementation Notes

- **Tree/budget:** single-rank `TREE_DEFS.asteroid` (3 paths × {keystone + 4 supports + capstone}, costOverride/pointCost, `capstones:[]`); `ActiveBudget.register('asteroid', { base:20, expandMax:5, expandCost:2000, bonusKey:'drift_asteroid_budget_bonus', keystones: ASTEROID_KEYSTONES, prereqs: ASTEROID_PREREQS })`. `ASTEROID_KEYSTONES = { fortification:'bastion', devastation:'chainReaction', opportunism:'gravityWell' }`, plus `ASTEROID_PREREQS / ASTEROID_TREE_LAYOUTS / ASTEROID_PATH_COLORS`.
- **ORB_BEHAVIOR.asteroid:** `rankOf` (standard active-budget gate — **no rainbow short-circuit needed**), `pathPrereqMet`, `respec*`, `renderTreeOverlay/renderTreeDetail` (clone `_nebula_*`/`_solar_*`). `OrbHooks.on('afterLoadTreeState', () => { maybeMigrateAsteroid(); ActiveBudget.restoreActivePoints('asteroid'); })`.
- **Economy:** remove `'asteroid'` from `ORIGINAL_5_ORBS`; `ORB_COST_SCALE.asteroid = 1.0`.
- **Dead Star 3-site refactor:** prereq/visual/physics `gravityWell rank===3` → `rankOf('gravityWell')>=1`; **remove the `×2 if blackHole` gravity multipliers** (Dead Star no longer scales gravity). Read `rankOf('blackHole')` for the implode trigger instead.
- **shieldHitsCap()** rewrite: `4 + (rankOf('bastion')?2:0) + (rankOf('reinforce')?1:0)`.
- **New mechanics:** Reactive Plating (20% on shield-hit: skip the `shieldHits--`, still `spawnEmpRing`); Second Wall (1.5s-no-shield → 2-stack shield, 20s CD); Capacitor (5s auto `spawnEmpRing` while shielded); Conduction (radius/depth modifiers); Accretion (3s windows; pulled-contact bodies → `shieldHits = min(cap, +1)`); Tidal Force (force ×1.5 + proximity ramp); Aegis (60s → screen-radius `spawnEmpRing`); **Dead Star** (track cumulative `shieldStacksLost`; at ≥10 and not locked out → implode: invuln window + inward reversed-EMP visual + screen pull + spawn golden shield = new shield variant with `golden:true`, 10 hits, crack/dim render; lockout `shieldStacksLost` counting while golden active). New state: `asteroidCapacitorNextPulse`, `secondWallNextArm`, `accretionWindowState`, `shieldStacksLostCount`, `goldenShieldActive` — all pause-delta-shifted.
- **Loop guards:** **remove** the EMP `source:'emp'` exclusion from Bastion II (v2). Keep Bastion II's 3s CD + 2× cap.
- **Flash/HUD:** `_asteroid_*` flash system + `OrbHooks.on('onRender', …)`; preserve `#capCdAegis`.
- **Migration:** `ASTEROID_SCHEMA_VERSION = 2` (`drift_asteroid_schema_version`), `_asteroidLooksLegacy(raw)` (detect `Array.isArray(raw.fortification) && len 3` or `raw.capstones.{phalanx|aegis|blackHole}`), `maybeMigrateAsteroid()` refunding legacy multi-rank at old flat rates (T1 1k/T2 2k/T3 3k/rank, capstone 5k) → `freshOrbTreeState('asteroid')` + version stamp; extend `mergeTrees` shape guard with `else if (orb==='asteroid')`.
- **Cross-orb:** no rainbow anything; new procs gate on `activeOrb === 'asteroid'`; EMP/gravity/implode kills route `checkDestroyProc` with source tags.
