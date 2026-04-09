// Exports icon.svg into Android mipmap PNGs and a 512x512 Play Store PNG.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'icon.svg');
const svg = fs.readFileSync(svgPath);

const targets = [
  { out: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',    size: 48  },
  { out: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',    size: 72  },
  { out: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',   size: 96  },
  { out: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',  size: 144 },
  { out: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  { out: 'icon-512.png',                                            size: 512 },
];

(async () => {
  for (const t of targets) {
    const outPath = path.join(root, t.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(svg, { density: Math.max(72, Math.round(t.size * 1.5)) })
      .resize(t.size, t.size)
      .png()
      .toFile(outPath);
    console.log(`wrote ${t.out} (${t.size}x${t.size})`);
  }
})().catch(e => { console.error(e); process.exit(1); });
