# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.2.0] - 2026-04-15

### Added
- Smart combo pickup logic: same-type priority, recency-based pairing, random tiebreak for simultaneous pair spawns

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
