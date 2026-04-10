// Exports icon.svg into Android mipmap PNGs and a 512x512 Play Store PNG.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'icon.svg');
const svg = fs.readFileSync(svgPath);

const densities = [
  { folder: 'mipmap-mdpi',    base: 48,  fg: 108 },
  { folder: 'mipmap-hdpi',    base: 72,  fg: 162 },
  { folder: 'mipmap-xhdpi',   base: 96,  fg: 216 },
  { folder: 'mipmap-xxhdpi',  base: 144, fg: 324 },
  { folder: 'mipmap-xxxhdpi', base: 192, fg: 432 },
];

const resDir = 'android/app/src/main/res';
const targets = [];
for (const d of densities) {
  const dir = `${resDir}/${d.folder}`;
  targets.push({ out: `${dir}/ic_launcher.png`,            size: d.base });
  targets.push({ out: `${dir}/ic_launcher_round.png`,      size: d.base });
  targets.push({ out: `${dir}/ic_launcher_foreground.png`, size: d.fg   });
}
targets.push({ out: 'icon-512.png', size: 512 });

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
