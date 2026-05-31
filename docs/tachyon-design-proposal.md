# Tachyon — Design of Record (as-implemented)

> **What this is:** a description of the Tachyon orb **as it actually exists in `www/index.html` right
> now** (the TACHYONTEST playtest build). It is NOT aspirational design and NOT an earlier proposal —
> where code and prior design disagreed, the code wins and is documented here. Line refs are
> approximate anchors at authoring time; re-grep the named symbol if they drift. Tachyon "never
> existed" before this build, so this replaces the deleted `tachyon-rework-proposal.md` (there was no
> rework — it's a brand-new enhanced orb).
>
> **Status:** playtest-only. TACHYONTEST-gated, `tease` still true, not wired to real progression.
> CONVERGENCE is a **placeholder pending redesign** (see §6.3 and §9).

---

## 1. Identity & fantasy

Tachyon is the **enhanced version of Warp** (`nebula`) — the same relationship as Roamer→Drifter,
Phantasm→Phantom, Helios→Inferno. It keeps Warp's speed/FTL/hyperspeed family but plays differently:
**"you, multiplied across time."** Hyperspeed is no longer just a speed buff — going fast **sheds
copies of you**: PAST selves that faithfully replay your recent movement and state, and DIVERGENCE
escort-clones that fly in formation. Speed *generates* the echoes; the echoes do the work.

- `ORB_DEFS.tachyon` (`:8474`): `color: TACHYON_CORE` = `'120,220,255'` (cherenkov blue-white),
  `cost: 6000`, `streakCap: 8`, `trail: 'nebula'`, `bias: 'hyperspeed'`.
- `TACHYON_PATH_COLORS` (`:8459`): recurrence `120,220,255`, divergence `170,150,255`,
  convergence `210,180,255`.
- Tree shell `TREE_DEFS.tachyon` (`:8480`), budget base 25 / cap 30 via
  `ActiveBudget.register('tachyon', …)`, custom branching tree UI cloned from nebula, flash helpers
  cloned from Helios. Tree unlock cost 30,000 (`TREE_UNLOCK_COSTS.tachyon`).

**HARD RULE (in force):** the player still dies on body contact. Echoes/escorts **never** touch-kill
on the player's behalf — they kill only via triggered detonations/strikes at non-player positions.
The player's own collision check is untouched.

---

## 2. Core systems

### 2.1 Position+state history ring buffer
- `TACHYON_HISTORY_LEN = 128` (`:8464`) — ~2.1s @60fps.
- Three parallel ring arrays: `_tachyonHistX`, `_tachyonHistY` (`Float32Array`), and
  **`_tachyonHistBar` (`Uint8Array`)** — the per-sample **barrier bit** (`:8748–8750`).
- Written once per physics frame in the tachyon `onUpdate` handler, gated `activeOrb === 'tachyon'`
  (`:9082–9085`). The bit is set when `hyperNow && hyperspeedCurrentMult > 1.05` (`:9081`) — i.e. the
  player had an active hyperspeed barrier at that sample.
- **Pause-safe by construction:** `onUpdate` only emits inside the playing/devmode physics gate, so
  the buffer never advances while paused/dead. Reset (`head=0; filled=0`) in `onResetGame` (`:9157+`).

### 2.2 Shared echo cap (30) + draw-call reasoning
- `TACHYON_ECHO_CAP = 30` (`:8465`), hard, oldest-shift on overflow (`_tachyonPush`, `:8757`).
- **Worst case at 20× with full Divergence:** a 20-echo burst-shed + up to 4 escorts + up to 4
  Quantum-Tunnel escort-past echoes ≈ **28 ≤ 30**.
- **Render cost:** every echo/escort is ONE additive blob (2 arc fills) + at most one cheap
  translucent barrier ring stroke — **no per-echo trails, no per-echo PIXI offscreen**. 30 echoes ≈
  ~90 draw ops/frame, far under the ~538-draw-call volume this project's historical crashes were
  traced to. 30 is the defended ceiling; beyond it the oldest echo is dropped.

### 2.3 Hyperspeed cap: base 8 → up to 20
- `TACHYON_BASE_MAX_STACKS = 8`, `TACHYON_MAX_STACKS_CEILING = 20` (`:8480–8481`).
- `ORB_BEHAVIOR.tachyon.hyperspeedMaxStacks = () => min(20, 8 + _tachyonCapBonus)` (`:8482`).
- `_tachyonCapBonus` is **per-run** (reset in `onResetGame`), raised by the two kill-milestone
  capstones (Eternal Wake +1/100 past-echo kills, All Timelines +1/200 escort kills — see §6).
- So Tachyon starts at cap 8 and climbs toward 20 over a run as those capstones rack up kills.

---

## 3. The burst = the echo-shed

`ORB_BEHAVIOR.tachyon.executeBurst` (`:9180+`), cooldown 18,000ms (`burstCooldown`, `:8488`):
1. Slams hyperspeed to the **current** max cap (8 early → up to 20 late):
   `while (hyperSpeedStacks < cap) activateHyperspeed()` (guarded ≤30 iterations).
2. Queues a shed of **N past-echoes where N = current stacks** via `_tachyonShedQuota` (only if
   Recurrence is owned). 1×→1 echo, 8×→8, 20×→20.
3. `runBurstCount++`, `addShake(9)`, `triggerHitstop(60)`, flash `'TEMPORAL FRACTURE'`. Grants **no
   invuln** beyond the normal hyperspeed barrier — the hitbox stays mortal.

**Shed release & re-trigger:** the quota drains ~160ms per echo in `onUpdate` (`_tachyonShedAt`), so
the N-echo wave spreads over the hyperspeed duration rather than all at once. The shed **also
re-triggers on any rise in `hyperSpeedStacks`** (pickup / combo / reactivation), scaled to current
stacks (`:9090–9093` region). **There is no off-screen orb salvo** — the old `_tachyonSpawnFuture`
fan was deleted entirely (0 refs).

---

## 4. RECURRENCE tree (past-echoes) — as implemented

**Verb:** past selves retrace your recent movement+state and detonate. The one tree that "reads"
clearly in playtest. Past-echoes spawn via `_tachyonSpawnPast` (`:8796+`), copying the last
96 samples (1.6s) — or 108 (1.8s) with Long Memory — including the per-sample barrier bit.

**Replay + faithful barrier (`_tachyonTickEchoes`, `kind:'past'`, ~`:9020–9035`):** the echo advances
one sample/frame; where the recorded sample had the barrier bit set, the echo re-creates a **40px
moving kill-zone at that past position** (throttled to one kill-tick / 40ms). On reaching the end of
its path it detonates a nova (medium with Wake Damage). **Hard-rule bound:** the replayed barrier is
always at the echo's *past position*, never centered on the live player — it clears the lane
behind/around the replay, never wraps the player's hitbox. Volume is bounded by the 30-echo cap and
the per-echo kill throttle. (Flagged as a playtest watch-item — see §9.)

| Node (key) | Type | Pts/💎 | As-implemented effect |
|---|---|---|---|
| **Recurrence** (`tachyon_recurrence`) | KEYSTONE | 5 / 7,500 | While hyperspeeding, shed a past-echo every **1.8s** that replays your last **1.6s** of movement+state (incl. barrier) then detonates a nova. |
| Afterself (`tachyon_afterself`) | T1 | 2 / 2,500 | Shed timer **1.8s → 1.3s**. |
| Rewind Cadence (`tachyon_rewindCadence`) | T1 | 2 / 2,500 | Already-shed past-echoes finish their full replay even after hyperspeed ends — never vanish early. |
| Wake Damage (`tachyon_wakeDamage`) | T1 | 2 / 2,500 | Past-echoes detonate into **MEDIUM** novas (radiusMult +0.3) instead of small. |
| Long Memory (`tachyon_longMemory`) | T2 | 3 / 5,000 | Replay window **1.6s → 1.8s** (96 → 108 samples). |
| Slipstream Echo (`tachyon_photonDebt`) | T1 | 2 / 2,500 | Each past-echo kill shaves **0.5%** off burst cooldown, **1s** internal CD. **No stack grant.** |
| **Eternal Wake** (`tachyon_eternalWake`) | CAPSTONE | 5 / 10,000 | Every **100 kills by past-echoes**, **+1 max hyperspeed cap** for the run (toward 20). Kill-milestone, not time/stack-gated. |

> Note the key `tachyon_photonDebt` is the old name retained for stability; it displays as
> "Slipstream Echo" and no longer grants hyperspeed stacks (the old runaway loop is gone).

---

## 5. DIVERGENCE tree (escort V-formation) — as implemented

**Verb:** persistent escort-clones fly in a **V beside you** while hyperspeeding and fire forward
muzzle-strikes. Escorts are summoned/maintained in `onUpdate` (`:9095+` region), lag-follow their slot
(smoothed ~0.5s settle), record their own short trail (for Quantum Tunnel), and **have no contact
hitbox** — they kill only via `_tachyonEscortStrike` (a short-range forward radius kill, ~26px,
~600ms cadence, attributed as an escort kill). Escorts vanish when hyperspeed ends (unless Causal
Lead converts them to streaks). V-formation offsets `_tachyonEscortOffset` (`:8835+`): slot 0/1 =
base pair L/R; slot 2 = left-and-back (Forked Path); slot 3 = right-and-back (Wide Formation).

**Visuals (`_tachyonDrawEchoes`):** escorts render MORE blurred/distorted than the player — a doubled
offset blob (motion smear) + a faint, more-transparent barrier ring. Past-echoes render as a blob +
(when replaying the barrier) a faint cherenkov ring.

| Node (key) | Type | Pts/💎 | As-implemented effect |
|---|---|---|---|
| **Divergence** (`tachyon_divergence`) | KEYSTONE | 5 / 7,500 | While hyperspeeding, **2 escort-clones** fly the V (L+R), lag-follow/blur/transparent barrier, fire forward strikes ~600ms. No contact hitbox. |
| Forked Path (`tachyon_forkedPath`) | T1 | 2 / 2,500 | **+1 escort** (slot 2, left-and-back of the V). |
| Causal Lead (`tachyon_causalLead`) | T1 | 2 / 2,500 | **REPLACED effect:** when hyperspeed **ENDS**, escorts become **streaks** — fly to the top of the screen at hyperspeed, destroying everything in their path, then vanish (`kind:'streak'`). |
| Wide Formation (`tachyon_manyWorlds`) | T1 | 2 / 2,500 | **+1 escort** (slot 3, right-and-back — mirror of Forked Path). |
| Probability Split (`tachyon_probabilitySplit`) | T2 | 3 / 5,000 | When an escort strike hits a body, detonate a **small nova** (≈0.45 size), **1s CD per escort**. |
| Quantum Tunnel (`tachyon_quantumTunnel`) | T1 | 2 / 2,500 | **~10% per body** an escort destroys → spawn a **PAST-echo of that escort** (`kind:'escortPast'`, replays the escort's own trail+strikes). **Max 1 per escort** (`spawnedQ` flag). |
| **All Timelines** (`tachyon_allTimelines`) | CAPSTONE | 5 / 10,000 | Every **200 kills by escort-clones**, **+1 max hyperspeed cap** (toward 20). Same cap-rise plumbing as Eternal Wake. |

> Keys `tachyon_manyWorlds` (Wide Formation) and `tachyon_photonDebt` (Slipstream Echo) keep their
> old keys for save stability; display names and effects are the current ones above.

---

## 6. CONVERGENCE tree — **PLACEHOLDER / PENDING REDESIGN**

> ⚠️ **Not final.** This tree is currently the **lance** (line-strike) implementation from the prior
> pass and is slated for a separate redesign. Documented here as-is so the record is accurate — do not
> treat it as the intended final Convergence.

**Verb (current):** collapse the alive swarm into an aimed **lance** — a line-strike, not a radial
nova. Geometry (`:8830+`): origin = player; direction = player→`closestBody` (straight up if no
target); the segment rakes **forward through the target to the screen edge** and **never kills behind
the player**; kill test = point-to-segment distance ≤ `halfW + b.radius` (`_tachyonPointSegDist` /
`_tachyonLanceKill`). `halfW` = 14, +8 Implosion, +4 Synchrony. Default lance has a 220ms charge
windup; Lockstep makes it instant. Gather pulls escorts into the consumed swarm.

| Node (key) | Type | Pts/💎 | As-implemented effect |
|---|---|---|---|
| **Convergence** (`tachyon_convergence`) | KEYSTONE | 5 / 7,500 | When ≥3 echoes are alive (non-escort unless Gather), collapse them into a lance to `closestBody` every ~2.5s; burst also forces a collapse. |
| Implosion (`tachyon_implosion`) | T1 | 2 / 2,500 | Lance halfW +8 (wider). |
| Lockstep (`tachyon_lockstep`) | T1 | 2 / 2,500 | Lance fires **instantly** (removes the 220ms windup). |
| Synchrony (`tachyon_synchrony`) | T1 | 2 / 2,500 | Lance halfW +4 / full-screen reach. |
| Gather (`tachyon_gather`) | T2 | 3 / 5,000 | Convergence also consumes escort-clones into the lance. |
| Resonant Collapse (`tachyon_overcharge`) | T1 | 2 / 2,500 | A lance killing ≥3 bodies refunds echo charge, 1.5s CD. **No stack grant.** |
| **Syzygy** (`tachyon_syzygy`) | CAPSTONE | 5 / 10,000 | Gated `hyperSpeedStacks ≥ 5`, ~20s CD: fire a **4-lance starburst** fanning across the densest cluster (`_heliosDensestPoint`). |

> Syzygy is still the only Tachyon capstone on the old high-stack/cooldown model; Eternal Wake and
> All Timelines were converted to kill-milestones. Reconciling Syzygy is part of the Convergence
> redesign.

---

## 7. High-cap visuals (12×–20×)

Cheap extension of the **existing** additive hyperspeed FX — no new render tech, no fill/shadowBlur:
- `_tachyonHyperTierColor` (`:9347+`) extends the cherenkov ramp past 8×: **9–11** deeper cherenkov
  violet `[220,130,255]`, **12–14** hot magenta-white `[240,160,255]`, **15–20** white-hot
  `[255,235,255]`. Used by the shared `hyperTierColor` when `activeOrb === 'tachyon'`.
- `_tachyonHyperIntensityBoost` nudges the capped 0..1 streak/tunnel intensity up at 12×+ (bounded
  **+40%**), wired into `hyperIntensity01`.
- **Full bespoke visuals remain deferred** (silhouette art, twin vanishing points, white-out, glitch
  shader) — echoes/escorts are still placeholder additive blobs and detonations use the shared
  nova-ring pool.

---

## 8. Status flags

- **Access:** TACHYONTEST pilot-name cheat only (mirrors DEVMODE/TREETEST) — unlocks + reveals +
  equips Tachyon, grants crystals, enables the tree. Temporary; remove before ship (as HELIOSTEST was).
- **Real progression untouched:** `ENHANCED_UNLOCK.tachyon` still `{ base:'nebula', threshold:5000,
  tease:true }`. The Sirius unlock script and the unlock/reveal flow are intact and unused by the
  playtest.
- **Not wired to real unlock/progression**, and **save-migration work is still pending** for an
  eventual ship (the orb tree state would need the same load/migrate plumbing the other enhanced orbs
  have before it can ship on real saves).

---

## 9. OPEN / PENDING

- **Convergence redesign (primary).** The lance is a placeholder; the whole tree (incl. reconciling
  Syzygy's high-stack gate vs the new kill-milestone capstone model) is to be reworked separately.
- **Deferred bespoke visual pass.** Echo/escort silhouette art, twin vanishing points, convergence
  white-out, glitch distortion, and bespoke audio are all still to do; current visuals are the cheap
  additive-blob placeholder.
- **Hard-rule watch-items (revisit after playtest):**
  - *Replayed-barrier volume vs auto-survival* — many past-echoes each replaying a 40px barrier could,
    at high cap + dense board, approach "the lane is always cleared for me." It is bounded today (past
    positions only, 30-echo cap, 40ms kill throttle) and the player's own hitbox stays mortal, but
    confirm in playtest that it doesn't trivialize survival; tighten the per-echo barrier radius /
    throttle if it does.
  - *Escort streak (Causal Lead)* clears a 30px path on hyperspeed end — verify it reads as a
    triggered burst, not a passive shield.
  - *Shared 30-cap contention* — burst-shed, escorts, and escort-past echoes share one pool; if a
    mixed Recurrence+Divergence build feels starved, consider a separate escort sub-cap.
- **Echo charge** (`_tachyon_echoCharge`) is still tracked/fed but only consumed by Convergence's
  Resonant Collapse refund — its broader role is undefined pending the Convergence redesign.
