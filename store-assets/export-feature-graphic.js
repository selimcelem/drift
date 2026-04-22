const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svg = fs.readFileSync(path.join(__dirname, 'feature-graphic.svg'));

sharp(svg, { density: 150 })
  .resize(1024, 500)
  .png()
  .toFile(path.join(__dirname, 'feature-graphic.png'))
  .then(() => console.log('wrote feature-graphic.png (1024x500)'))
  .catch(e => { console.error(e); process.exit(1); });
