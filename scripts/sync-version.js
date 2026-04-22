// Single source of truth for the app version: android/app/build.gradle.
// This script reads versionName from build.gradle and propagates it to:
//   - www/index.html   (const GAME_VERSION = '...')
//   - package.json     ("version": "...")
//
// Intended release workflow:
//   1. Edit android/app/build.gradle — bump versionCode AND versionName
//   2. npm run sync         (runs this script; propagates versionName)
//   3. npx cap sync         (propagates www/ + capacitor plugins to android/)
//   4. Build AAB from Android Studio or gradle
//
// Pass --check to verify all three files already agree without writing. Exits
// non-zero on mismatch. Useful for pre-commit or CI.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
const indexPath = path.join(root, 'www', 'index.html');
const pkgPath = path.join(root, 'package.json');

const checkOnly = process.argv.includes('--check');

function readVersionNameFromGradle(src) {
  // Matches: versionName "1.2.3"  (double-quoted, whitespace-tolerant)
  const m = src.match(/^\s*versionName\s+"([^"]+)"/m);
  if (!m) throw new Error('versionName not found in android/app/build.gradle');
  return m[1];
}

function readGameVersionFromIndex(src) {
  const m = src.match(/const\s+GAME_VERSION\s*=\s*'([^']+)'/);
  if (!m) throw new Error("GAME_VERSION literal not found in www/index.html");
  return m[1];
}

function readPackageVersion(pkgJsonStr) {
  const pkg = JSON.parse(pkgJsonStr);
  return pkg.version;
}

function main() {
  const gradleSrc = fs.readFileSync(gradlePath, 'utf8');
  const sourceVersion = readVersionNameFromGradle(gradleSrc);

  const indexSrc = fs.readFileSync(indexPath, 'utf8');
  const currentGameVer = readGameVersionFromIndex(indexSrc);

  const pkgSrc = fs.readFileSync(pkgPath, 'utf8');
  const currentPkgVer = readPackageVersion(pkgSrc);

  const mismatches = [];
  if (currentGameVer !== sourceVersion) mismatches.push(['www/index.html GAME_VERSION', currentGameVer, sourceVersion]);
  if (currentPkgVer !== sourceVersion) mismatches.push(['package.json version', currentPkgVer, sourceVersion]);

  if (checkOnly) {
    if (mismatches.length === 0) {
      console.log(`[sync-version] OK — all at ${sourceVersion}`);
      process.exit(0);
    }
    console.error('[sync-version] MISMATCH (source: android/app/build.gradle versionName = ' + sourceVersion + ')');
    for (const [label, have, want] of mismatches) {
      console.error(`  ${label}: ${have} (should be ${want})`);
    }
    process.exit(1);
  }

  if (mismatches.length === 0) {
    console.log(`[sync-version] already in sync at ${sourceVersion}`);
    return;
  }

  if (currentGameVer !== sourceVersion) {
    const next = indexSrc.replace(
      /const\s+GAME_VERSION\s*=\s*'[^']+'/,
      `const GAME_VERSION = '${sourceVersion}'`
    );
    fs.writeFileSync(indexPath, next);
    console.log(`[sync-version] www/index.html: ${currentGameVer} -> ${sourceVersion}`);
  }
  if (currentPkgVer !== sourceVersion) {
    // Preserve JSON formatting (indentation, trailing newline) by string-replacing
    // only the version field rather than round-tripping through JSON.stringify.
    const next = pkgSrc.replace(
      /("version"\s*:\s*")[^"]+(")/,
      `$1${sourceVersion}$2`
    );
    fs.writeFileSync(pkgPath, next);
    console.log(`[sync-version] package.json: ${currentPkgVer} -> ${sourceVersion}`);
  }
}

try { main(); } catch (err) {
  console.error('[sync-version] FAILED:', err.message);
  process.exit(1);
}
