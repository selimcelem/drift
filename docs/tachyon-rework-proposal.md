# TACHYON — ENHANCED WARP — DESIGN BRAINSTORM

> Status: **Brainstorm-stage proposal, not approved spec.** Captured 2026-05-29. To be iterated on before implementation.
>
> Tachyon is the ascended version of **Warp** (`nebula`), unlocked through **Sirius** at **5,000 Warp kills**
> (`ENHANCED_UNLOCK.tachyon = { base: 'nebula', threshold: 5000, tease: true }`). It is currently a tease
> placeholder — building it flips `tease → false` and adds the `ORB_DEFS` / `TREE_DEFS` / trail entries.
>
> **Architectural rules (same as Roamer / Phantasm / Helios):** enhanced orb, unique custom palette + theme,
> 3 trees with capstones on round-ring cooldowns, custom Drift-Crystal unlock cost, custom unlocked-trail.
> This doc generates **6 candidate trees**; the actual orb ships **3** (see [§8](#8-honest-top-3--build-first)).
>
> **Heads-up — already stubbed in code:** an *approved* Sirius unlock script for Tachyon already exists
> (`ORB_UNLOCK_SCRIPTS.tachyon`). It is reproduced verbatim in [§11](#11-sirius-unlock-conversation) — keep it;
> a variant is offered for comparison only.

---

## 1. Premise

Warp *uses* speed — high-momentum dodge/control with bursts of velocity, and hyperspeed-as-shield. Tachyon
*transcends* it: it stops treating speed as a buff and starts treating **time and reference-frame as the
resource the player manipulates**. Every concept below tries to invent a new *verb* — not "more speed" or
"bigger nova," but a genuinely new interaction that still reads as "faster than light."

The input model is unchanged: **left = attract toward nearest body, right = repel, both = burst.** Every
mechanic must work within that two-button, ~60-second-run grammar.

---

## 2. IDEA 1 — "RELATIVITY" (Time Dilation)

1. **Tree name:** Relativity
2. **Core verb — buy slowness by going fast.** A *Dilation* meter fills only while you hold high velocity.
   Spend it to slow the entire world — scroll, bodies, spawns drop to ~35% — while your attract/repel response
   stays full-speed. You thread impossible gaps in self-made bullet-time. The literal physics gag: *speed buys
   you time.*
3. **vs. Warp:** Warp makes *you* faster. Relativity makes *the world* slower relative to you — the opposite
   frame of reference. A precision/control verb, not a velocity burst.
4. **Capstone — "EVENT HORIZON":** at full meter, trigger a **hard stop** — the world freezes for 1.5s. But
   the freeze also freezes *your* momentum, so unfreezing launches you along your pre-frozen vector. You must
   aim the trajectory *before* the snap. Mistime it → you fire into a body. Round-ring shows the meter; the
   decision is "freeze now and commit my exit line, or wait for a cleaner angle?"
5. **Hyperspeed integration:** a hyperspeed pickup no longer speeds you up — it **inverts into stored time**,
   dumping its duration straight into the Dilation meter. Stacking hyperspeed = banking dilation seconds.
   (Warp spent time to go fast; Tachyon banks it to go slow.)
6. **Visual identity:** violet-white core, chromatic-aberration ring that blooms on activation; the world
   desaturates with motion-blur streaks while the player stays crisp and bright. Signature moment: the freeze
   "snap" with a blue-shift flash.
7. **Reference point:** Max Payne / SUPERHOT bullet-time, adapted so the payoff is *reaction headroom for tap
   input*, not aim-time DPS.

---

## 3. IDEA 2 — "CAUSALITY" (Delayed Action Cascade)

1. **Tree name:** Causality
2. **Core verb — play one second in the past and present at once.** Every tap is recorded and **re-fires as a
   phantom echo ~1s later.** When several echoes resolve on the same body simultaneously, they *collapse* it
   (destroy). You're not dodging — you're scheduling detonations.
3. **vs. Warp:** Warp is immediate momentum. Causality is deferred — you plan chained collapses, building a
   snowball instead of reacting.
4. **Capstone — "GRANDFATHER PARADOX":** press both to **collapse the whole queue instantly** — every pending
   echo fires *now* in one wave. But it empties the queue and **locks input-recording for 2s** (you coast
   blind, no echoes building). Rhythm: fill the queue → pick the moment → pay the blackout.
5. **Hyperspeed integration:** hyperspeed **lengthens the queue and the echo delay** — a longer "light cone"
   of stored actions = a bigger collapse wave. Stacks deepen the cascade.
6. **Visual identity:** electric teal with faint time-offset ghost copies of the player; collapse = a
   synchronized white shockwave rippling through every echo position at once.
7. **Reference point:** Hades II delayed-detonation cast synergies + Braid's action-record; adapted as a
   "schedule-now / detonate-later" loop sized to the 60-second arc.

---

## 4. IDEA 3 — "VELOCITY STACK" (Momentum Bank → Lightspeed Lance)

1. **Tree name:** Velocity Stack (capstone "Terminal Velocity")
2. **Core verb — hoard speed, spend it as an execute.** Momentum **never decays** as long as you avoid hard
   reversals; sustained speed fills a *Lance* charge. At full charge your burst fires you as an **FTL lance** —
   a straight-line blink across the screen that vaporizes every body on the chord and drops you out the far
   edge with momentum intact. The verb: keep a "speed combo" alive to earn a screen-crossing kill.
3. **vs. Warp:** Warp's hyperspeed is a *timed* speed/shield buff. Here speed is a **hoarded resource spent as
   a positional teleport-kill.** It punishes the stop-start dodge style and rewards committed flow.
4. **Capstone — "TERMINAL VELOCITY":** holding a charged Lance keeps charging *past* 100% into overdrive —
   each tier widens the beam and adds a perpendicular second lance — but in overdrive **your turn radius locks**
   (you can't brake). Over-charge greed = flying off the wall. Round-ring shows overdrive decay.
5. **Hyperspeed integration:** hyperspeed pickups become **afterburner fuel** — no timer, they instantly add
   Lance charge tiers and raise the no-decay speed floor. (Keeps the `bias: 'hyperspeed'` identity, reskinned.)
6. **Visual identity:** blue-shift → white-hot **Cherenkov glow** scaling with banked speed; the lance is a
   brilliant beam-streak with a sonic-boom cone and screen-stretch. Signature: the FTL blink with a doppler
   shift (redshift behind, blueshift ahead).
7. **Reference point:** PoE Berserker rage-upkeep + RoR2 Captain orbital line-strike + Hollow Knight
   Quick-Slash flow — "don't break your rhythm" *is* your DPS.

---

## 5. IDEA 4 — "SUPERPOSITION" (Light-Cone Splitting)

1. **Tree name:** Superposition
2. **Core verb — steer a cloud of selves, then collapse them.** Tachyon splits into 2–3 quantum copies that
   share your input but trail at offset phases/velocities, fanning out. Bodies are destroyed where copies
   **converge**. You manage a probability cloud and choose *when* to collapse it back to one — collapsing on a
   clustered target = multi-destroy.
3. **vs. Warp:** Warp is one fast point. Superposition is a managed *spread* — spatial coverage and convergence
   timing replace raw momentum.
4. **Capstone — "WAVEFUNCTION COLLAPSE":** snap all copies instantly to the real player's position; every body
   on a copy-to-center line gets cut. But you're locked to a single copy (no spread) for 1.5s after. Collapse
   at max spread = max kill; collapse early = wasted. Round-ring = re-split cooldown.
5. **Hyperspeed integration:** hyperspeed **widens the spread angle and adds a copy per stack** (cap-gated) —
   a stacked Warp-core makes a wider fan = more convergence kills.
6. **Visual identity:** prismatic RGB split — red/green/blue copies separate like glitch aberration and
   recombine to white on collapse. Signature: the glitch-merge to a single bright point.
7. **Reference point:** RoR2 Mercenary afterimages + Trickster clones; adapted so one shared tap steers all
   copies via fixed phase offsets (no extra inputs).

---

## 6. IDEA 5 — "FRAME REWIND" (Sands-of-Time / Save-State)

1. **Tree name:** Frame Rewind
2. **Core verb — place a checkpoint, recall to it.** Tachyon records a few seconds of state. Drop a *marker*,
   then snap back to it (position + momentum) on demand — and on lethal contact, spend a rewind to **undo the
   last ~1.5s** instead of dying. Spatial undo as a *movement tool*, not only a death-save.
3. **vs. Warp:** Warp has no safety net. Tachyon-Rewind's identity is **fearless commitment** — it green-lights
   aggressive lines Warp could never risk because mistakes are erasable.
4. **Capstone — "CLOSED TIMELIKE CURVE":** recalling replays a **half-speed ghost of the bodies' recent
   positions for 2s** (the world re-runs slowly around you) → a guaranteed clean window. But each use
   **shortens your next rewind buffer** (diminishing returns), so offense spends your death-save. Risk-reward:
   burn rewinds for kills vs. keep them for survival. Round-ring = buffer recharge.
5. **Hyperspeed integration:** hyperspeed **lengthens the recorded buffer** (more seconds of "past") and speeds
   recharge — a Warp-core literally buys you more history to fall back on.
6. **Visual identity:** silver/white film-scrub aesthetic; rewinds render as a **VHS reverse-scrub** with a
   ghost trail collapsing backward. *(Code synergy: reuse the v2.0.0 second-death reverse-glitch engine — it's
   already a pure function of `t`, so `t:1→0` replay is free.)*
7. **Reference point:** Prince of Persia: Sands of Time + Braid; the drift adaptation cleverly reuses existing
   time-reversal tech (the way Helios reused `convergeReform`).

---

## 7. IDEA 6 — "SINGULARITY" (Gravity Inversion — *you* are the well)

1. **Tree name:** Singularity
2. **Core verb — invert drift's core law.** Instead of *you* being pulled toward bodies, **you become the
   gravity well** and drag bodies toward *you*. Attract = pull them in; repel = blast them out. Bodies that
   collide while orbiting you **annihilate each other.** You curate a death-orbit and slam bodies together.
   (Relativistic mass → micro-black-hole.)
3. **vs. Warp:** A total inversion of the control fantasy. Warp moves the player through a static field;
   Singularity holds station and **moves the world.** The boldest, most genuinely "ascended" reframe in the list.
4. **Capstone — "SCHWARZSCHILD":** charge mass by holding bodies in orbit; at critical mass, burst-release
   collapses into an **event-horizon implosion** annihilating everything on screen. But over-hold past critical
   and the well destabilizes — **you** get spaghettified (death) unless you vent (repel) in time. Pure
   brinkmanship on an instability ring.
5. **Hyperspeed integration:** hyperspeed **grows your gravitational radius and capture speed** — a Warp-core
   makes you a hungrier well that captures bodies from farther out.
6. **Visual identity:** jet-black core, violet accretion disk, gravitational-lensing ring warping the
   starfield; captured bodies stretch into spaghettified streaks. Signature: implosion-to-white event-horizon
   flash.
7. **Reference point:** Vampire Survivors orbital/Black-Hole scaling; adapted so the *same two taps* mean
   pull-world / push-world instead of pull-self / push-self — zero new buttons, fully inverted meaning.

---

## 8. Honest top 3 + build-first

Tachyon ships **3 trees**, so the brainstorm's job is to pick the 3 that (a) are mechanically distinct from
each other, (b) cohere into one "ascended Warp," and (c) are actually buildable. Genuine picks — not diplomatic:

1. **Velocity Stack / Lightspeed Lance** — dead-center "ascended Warp." It evolves the *existing* momentum +
   hyperspeed kit into hoard-and-execute, and the hyperspeed-as-fuel reskin is the cleanest swap in the list.
   This is the orb's spine.
2. **Relativity / Time Dilation** — the cleanest brand-new verb (world-slow), huge skill-expression ceiling,
   and it **pairs beautifully with #1**: you go fast (Velocity Stack) to bank slowness (Relativity). "Speed
   buys time" is the orb's thesis statement.
3. **Singularity / Gravity Inversion** — the bold swing. Inverting drift's core law is exactly the kind of
   transcendent move that makes an ascended orb feel like more than a stat bump. Highest risk, highest
   "holy shit" ceiling.

**Cut, and why (honestly):** *Causality* and *Superposition* are gorgeous but both risk being **hard to read on
a small tap screen** — deferred echoes and a steered probability-cloud can feel floaty/uncontrollable, and
Causality's "set-up-then-detonate" overlaps Roamer's thread-laser feel. *Frame Rewind* is the sentimental
favorite (and the code-reuse is elegant) but a **death-undo undercuts drift's lethal tension and muddies
leaderboard integrity** — hold it as the strongest bench alternate if Singularity proves too expensive.

### If forced to build ONE today: **Velocity Stack / Lightspeed Lance.**
Lowest design risk (extends a proven verb), the hyperspeed-as-fuel swap is trivial conceptually, "Terminal
Velocity" is a tight timing ring in the Helios mold, and it reads instantly as *"this is Warp, ascended."*
Build it first to lock the orb's identity, then expand outward into Relativity and Singularity.

---

## 9. Whole-orb palette / theme

**Theme:** *Faster-than-light — Cherenkov radiation + relativistic doppler.* (Cherenkov glow is literally the
blue light of particles outrunning light-in-medium — perfect.)

| Role | Suggested RGB | Note |
|---|---|---|
| **Primary core** | `150,210,255` | luminous blue-white — blue-shifted *past* Warp's `96,165,250` |
| **Secondary / UV shimmer** | `200,150,255` | violet-white edge, distinct from Phantom's `192,132,252` |
| **Doppler accents** | redshift `255,90,90` / blueshift `90,180,255` | motion-direction tints on trails & the lance |

Particle behavior: crisp constant-thickness streaks (matches the v2.0.0 additive recipe), elongating with
velocity; faint chromatic split on fast moves. **Signature visual moment:** the doppler "boom" — red bleeds
off the tail, blue races off the nose, white core in between.

---

## 10. Unlock cost (Drift Crystals)

Helios was **27,000**. Tachyon sits behind a **steeper 5,000-kill gate** (Helios was 4,000) and is the senior
enhanced orb, so set the crystal cost a touch above Helios to mark seniority without being punishing on top of
the longer grind:

- **Proposed: 30,000 💎** (round, ~+11% over Helios).
- *If the kill-gate should carry more of the weight,* hold it at **27,000** to match Helios and let the 5,000
  kills be the real wall. Lean **30,000**.

---

## 11. Sirius unlock conversation

**An "approved" script already exists in code** (`ORB_UNLOCK_SCRIPTS.tachyon`) — and it's genuinely good; the
time-paradox punchline ("it already arrived, before I even knew") is exactly the gag the theme wants:

```
Sirius: Fast, {player}. So fast you nearly tore the light in two.
Sirius: Beyond mere Warp there lies a paradox — and I'll drag it through.
Sirius: I bend the hour! I fold the now! Behold what time can do—
Sirius: ...ah. It already arrived. In your shop. Before I even knew.
Sirius: Tachyon got there yesterday. Go check your shop. ...Today.
```

**Recommendation: keep it.** It already matches the Roamer/Phantasm/Helios meter and pattern (4–5 lines,
`{player}` token, the "...check your shop" deflation beat). Variant below leans harder on the causality gag —
offered for comparison only; ship the existing one and bench this:

```
Sirius: Five thousand warps, {player} — you've thinned the veil of now.
Sirius: So I'll outrun causation, chase the photon, and somehow—
Sirius: SUMMON a thing that moves before the spell is cast—
Sirius: ...it's already sold to you. The future beat my past.
Sirius: Tachyon's in your shop since Tuesday. Don't ask how. Just go — fast.
```

---

## 12. Unlocked trail

Warp's base trail is "Lightspeed," so Tachyon's unlocked trail has to out-class it:

- **Name: "Cherenkov Wake"**
- **Description:** *"A cone of blue-white Cherenkov light dragged behind you faster than it should travel —
  redshift smeared off the tail, blueshift flaring off the nose, with brief doppler-split afterimages that
  catch up a half-beat late."*
- Alternates if a shorter label is wanted: **"Lightcone"** or **"Blueshift."** Lean **Cherenkov Wake** — most
  on-theme and reads as a clear tier above "Lightspeed."

---

## 13. Summary of concrete proposals

- **Build order:** Velocity Stack → Relativity → Singularity.
- **Palette:** blue-white Cherenkov core `150,210,255`, violet-white secondary `200,150,255`, doppler accents.
- **Unlock:** **30,000 💎** (5,000-kill gate already in code).
- **Sirius script:** keep the existing approved `ORB_UNLOCK_SCRIPTS.tachyon`; variant benched.
- **Trail:** **"Cherenkov Wake."**

> Next step when moving from brainstorm to spec: write up the chosen 3 trees node-by-node (tiers, costs,
> point-costs, capstone timings) in the style of `docs/warp-rework-proposal.md`.
