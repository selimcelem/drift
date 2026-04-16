# Drift — Portfolio

**Current version:** v1.4.0

## What it is

A gravity-surfing endless runner built as a single HTML5 Canvas game, shipped as an Android app via Capacitor, with an AWS serverless leaderboard backend and fully automated infrastructure deployment.

## Highlights

- **Three music tracks with crossfade looping** — menu, gameplay, and death-screen tracks decoded once into `AudioBuffer`s and seamlessly crossfaded at loop points so the transitions are inaudible
- **Real space imagery as parallax scenery** — NASA nebula, dying-star, galaxy, and supernova photos scroll behind the playfield using a `screen` composite blend so only the coloured light shows through
- **Play In-App Updates API integration** — the Android build uses Google Play's flexible in-app update flow so testers never have to leave the game to pick up a new build

## Tech stack

| Layer | Tech |
|-------|------|
| Game | Vanilla HTML5 Canvas + JS — single file, no frameworks, no build step |
| Mobile | Capacitor 8 wrapping the web app into a native Android shell |
| Backend | AWS API Gateway (HTTP API) → Lambda (Node.js 20) → DynamoDB |
| Infrastructure | Terraform with S3 remote state |
| CI/CD | GitHub Actions with OIDC federation — no long-lived AWS credentials |

## Architecture decisions

**Single HTML file game** — The entire game is one `index.html`. No bundler, no asset pipeline, no framework. This keeps iteration fast (refresh the browser), deployment trivial (copy one file), and the mental model simple. The tradeoff is no module system, but at ~1800 lines that's manageable.

**HTTP API over REST API** — API Gateway's HTTP API is cheaper (~70% less), faster (lower latency), and simpler for this use case. REST API features like request validation, WAF integration, and usage plans aren't needed for a game leaderboard.

**PAY_PER_REQUEST billing** — The leaderboard has unpredictable traffic patterns. Provisioned capacity would either waste money during quiet periods or throttle during spikes. On-demand scales to zero cost when nobody's playing.

**OIDC over long-lived keys** — GitHub Actions authenticates to AWS via OpenID Connect federation. No AWS access keys stored as secrets, no rotation needed, no risk of key leakage. The trust policy is locked to a specific repo and branch.

**90-day TTL on scores** — DynamoDB TTL automatically cleans up old entries. Keeps the leaderboard fresh and prevents unbounded table growth without needing a cleanup job.

## What I built vs. what tools helped

The game mechanics, physics model, and visual design are my work — gravity surfing, the attract/repel two-button control scheme, procedural audio, powerup system, and all the Canvas rendering. The AWS architecture (API Gateway + Lambda + DynamoDB, OIDC auth, Terraform IaC) was designed by me based on what the project actually needs.

Claude Code was used as an implementation accelerator — turning design decisions into working code faster than typing it all out manually. The architectural choices, game design, and infrastructure decisions are mine; the tool helped me ship them.

## AWS cost estimate

**Free tier (first 12 months):**
- DynamoDB: 25GB storage, 25 read/write capacity units — the leaderboard won't come close
- Lambda: 1M requests/month free
- API Gateway: 1M HTTP API calls/month free

**Beyond free tier:**
- DynamoDB on-demand: $1.25 per million writes, $0.25 per million reads
- Lambda: $0.20 per million requests + $0.0000166667/GB-second
- API Gateway: $1.00 per million requests

At 10,000 daily active players submitting ~3 scores each: ~$1-2/month total.

## Links

- **Live demo:** [selimcelem.github.io/drift](https://selimcelem.github.io/drift)
- **Source:** [github.com/selimcelem/drift](https://github.com/selimcelem/drift)
