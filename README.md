# Drift

A gravity surfing endless runner. You're a speck of light falling through the cosmos. Stars, planets and black holes scroll past — and instead of dodging them with thrusters like every other space game, you *use their gravity*. Pull yourself toward the nearest body. Push yourself away. Thread the needle. Don't get absorbed.

One canvas. One HTML file. No frameworks. It ships as an Android app via Capacitor.

## How to play

Two inputs. That's it.

- **Left side / ←  / A** — attract toward the nearest celestial body
- **Right side / → / D** — repel away from the nearest celestial body

The physics only cares about the *closest* body to you at any given moment. A soft ring highlights which one is currently pulling the strings. A dashed line appears when you're actively attracting or repelling so you can see exactly what's about to happen.

Survive. Your score is the number of bodies you've drifted past. Speed ramps up for the first ~200 points and then caps — after that it's pure precision.

### Things that will kill you
- Touching any star, planet, or black hole
- Flying off the edge of the screen

### Things that won't
- The first ~1.5 seconds after spawning (grace period — the player glows while invulnerable)

Top 5 scores are kept locally in `localStorage` and shown on the death screen.

## Features

- **Orb system with crystal progression** — five unlockable orbs (Cyan/Drifter, Cosmic/Phantom, Solar/Inferno, Nebula/Warp, Asteroid/Fortress), each with its own passive bonus and a unique burst ability. Runs earn 💎 Drift Crystals (score × difficulty multiplier, persisted in `localStorage`) that are spent in the shop to unlock new orbs
- **Burst mechanic** — press both sides at once to fire the equipped orb's signature burst ability on a 20-second cooldown. Every orb's burst resolves differently (instant powerup grant, chain destruction, shield refresh, stacked hyperspeed, etc.)
- **9 progressive planet types** — the pool rotates every 2 minutes through four phases: classic stars/planets/black holes → toothed + eye + cracked → tentacle + screaming + void → heart + mirror + skull. Several types carry dynamic hitboxes that match their animation (toothed spike tips, extending tentacles, pulsing hearts)
- **Apocalypse sequence** — survive 10 minutes and the world stops spawning, the player is pulled to the centre, and a giant sun descends for a cinematic end-of-run death
- **Phase-based music + backgrounds** — four gameplay tracks crossfade between phases so the soundtrack evolves with the threat level, and NASA space imagery is parallax-scrolled in sync with the current phase's mood
- **Tutorial/guide** — a six-page in-game guide (controls, powerups, scoring, burst, timer, orbs) accessible from the main menu
- **Combo system** — 9 powerup combinations (Supernova, Warp Time, Phantom Blast, Pulsar, Spectral Rush, Juggernaut, Wraith, Eternal Phantom, Fortress Shield), each with its own mechanics and visual identity
- **Pair spawning** — 1 in 5 powerup spawns is a tethered pair connected by a cosmic energy beam; grabbing either one triggers the matching combo instantly
- **Stacking hyperspeed** — pick up hyperspeed up to four times for a 4x speed run, with step-down expiry, gold/orange/red/white stack tints, and a blinking stack counter
- **Streak + time-bonus scoring** — destroy a planet via Nova, Hyperspeed barrier, or Phantom Blast and your next destroy is worth more (streak × 4 flat, cap 8); survive longer and a time bonus adds a score-proportional payout every 30 seconds
- **Run timer with danger zones** — HUD timer progresses white → orange → red, with visible danger-zone effects after the 3-minute mark
- **Real-time timer refactor** — every game timer is driven by wall-clock milliseconds instead of frame counters, so gameplay feels identical at 30, 60, and 120 Hz
- **Run summary on death** — full breakdown of planets passed, planets destroyed, longest streak, powerups used, and points from each source
- **Dynamic space background** — real NASA space imagery (nebulae, dying stars, galaxies, supernovae) parallax-scrolls behind the playfield, blended into the cosmos with a screen composite so only the coloured light shows
- **3 difficulties** — Normal, Hard, Extreme — with progressively faster scroll, more bodies, and more frequent powerup drops
- **Local + global leaderboards** — top 5 per difficulty stored locally; global top 10 served from a serverless AWS backend
- **Play In-App Updates** — the Android build uses Google Play's flexible in-app update flow to keep testers current without forcing them out of a run

## Tech stack

- **Vanilla HTML5 Canvas + JS** — the entire game is one `www/index.html`. No build step, no bundler, no framework. Just a `requestAnimationFrame` loop and some trig.
- **Capacitor 8** — wraps the web app into a native Android shell
- **Gradle / Android SDK** — for producing the APK/AAB

No React. No TypeScript. No asset pipeline. If you want to tweak the game, open `www/index.html` in a browser and hit refresh.

## Running it

### In a browser (fastest iteration loop)
```bash
# any static server will do
npx serve www
# or just open www/index.html directly
```

### On Android
You need the Android SDK and a JDK installed.

```bash
npm install
npx cap sync android
npx cap open android        # opens Android Studio
# or, from the command line:
cd android && ./gradlew assembleDebug
# APK lands in android/app/build/outputs/apk/debug/
```

To produce a release build, sign it with your own keystore — see the [Capacitor docs on Android deployment](https://capacitorjs.com/docs/android/deploying-to-google-play).

### Tweaking the game

All the knobs live at the top of the `<script>` block in `www/index.html`:

```js
const PLAYER_R = 6;
const GRACE_FRAMES = 90;
const BODY_SPACING = 290;
const FORCE = 0.18;
const SPEED_MIN = 1.2;
const SPEED_MAX = 3.2;
const SPEED_SCORE_CAP = 200;
```

Want heavier gravity? Bump `FORCE`. Want a more forgiving ramp? Raise `SPEED_SCORE_CAP`. Want bodies closer together? Lower `BODY_SPACING`.

## Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐     ┌──────────────┐
│              │     │                   │     │                  │     │              │
│  Game        │────▶│  API Gateway      │────▶│  Lambda          │────▶│  DynamoDB    │
│  (Canvas)    │     │  (HTTP API)       │     │  (Node.js 20)    │     │  (on-demand) │
│              │     │                   │     │                  │     │              │
└──────────────┘     └───────────────────┘     └──────────────────┘     └──────────────┘
                            CORS *                POST /score           drift-leaderboard
                                                  GET /leaderboard      TTL: 30d top 10 / 7d rest
```

The leaderboard is capped at the top 10 scores per difficulty via DynamoDB TTL tiers: every submission promotes the current top 10 to a 30-day TTL and lets everything else fall out on a 7-day TTL. No explicit deletes — the table self-prunes as entries age past their tier.

## Online leaderboard

The game has a serverless AWS backend for global leaderboards. Two endpoints:

- **POST /score** — submit a score with `{username, score, difficulty}`. Validated server-side (alphanumeric username, score < 10000, difficulty must be NORMAL/HARD/EXTREME). Scores expire after 90 days via DynamoDB TTL.
- **GET /leaderboard?difficulty=NORMAL** — returns the top 10 scores for a difficulty tier, sorted descending.

All infrastructure is defined as Terraform in `/infrastructure`. No hardcoded account IDs — everything is parameterized.

## CI/CD

Infrastructure deploys automatically via GitHub Actions when files under `infrastructure/` change on `main`.

Authentication uses **OIDC federation** — GitHub Actions assumes an IAM role via OpenID Connect. No long-lived AWS credentials are stored anywhere. The trust policy is locked to `repo:selimcelem/drift:ref:refs/heads/main` so only pushes to main on this repo can deploy.

Pipeline: `terraform init` → `plan` → `apply -auto-approve`

## Screenshots

_coming soon_

<!--
![Title screen](docs/screenshot-title.png)
![In game](docs/screenshot-play.png)
![Death screen](docs/screenshot-death.png)
-->

## License

Copyright (c) 2026 Selim Celem. Source available for portfolio and educational viewing only. No permission is granted to redistribute, resell, or commercially use this software without explicit written permission.
