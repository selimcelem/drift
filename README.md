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

## Screenshots

_coming soon_

<!--
![Title screen](docs/screenshot-title.png)
![In game](docs/screenshot-play.png)
![Death screen](docs/screenshot-death.png)
-->

## License

MIT. Do whatever you want with it.
