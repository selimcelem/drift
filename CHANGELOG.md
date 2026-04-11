# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Quadratic streak scoring system (destroy streak² points, pass = 1 point)
- Live streak counter display during gameplay
- Run summary on death screen (planets passed, destroyed, streak, powerups, total breakdown)
- Leaderboard difficulty tabs on death screen for both local and global
- Repel target locking — target body is locked for the duration of a repel press, preventing mid-repel direction switching

### Fixed
- Local highscores eviction bug — scores now kept top 5 per difficulty instead of top 5 globally
- Leaderboard difficulty tabs not filtering local scores correctly
- www folder gitignore causing game files to not be tracked

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
