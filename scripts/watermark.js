#!/usr/bin/env node
// Watermark real product photos.
//   1. Shoot products, drop the photos into src/images/raw/
//   2. npm run watermark
//   3. Output: src/images/products/<same-name>.webp (max 1600 px wide, subtle "ELTEK" stamp bottom-right)
// Name a photo after a product slug (conduit-pipe.jpg, casing-capping.jpg, bend.jpg, flexible-pipe.jpg,
// accessories.jpg, junction-box.jpg, saddle.jpg, round-sheet.jpg, fan-sheet.jpg, surface-box.jpg)
// and the next `npm run build` uses it instead of the illustration.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'src', 'images', 'raw');
const OUT = path.join(ROOT, 'src', 'images', 'products');
const MAX_WIDTH = 1600;
const OPACITY = 0.55;

const markPath = fs.readFileSync(path.join(ROOT, 'src', 'images', 'brand', 'eltek-mark.svg'), 'utf8').match(/<path[\s\S]*?\/>/)[0];

function stamp(width) {
  const h = Math.round(Math.max(36, width * 0.045));
  const w = Math.round(h * 3.9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 390 100">
    <rect x="0" y="0" width="390" height="100" rx="20" fill="#0B1F3A" fill-opacity="${OPACITY * 0.6}"/>
    <g transform="translate(14 10) scale(${80 / 1242})">${markPath.replace('fill="currentColor"', `fill="#FFFFFF" fill-opacity="${OPACITY + 0.3}"`)}</g>
    <text x="112" y="68" font-family="Montserrat, Arial, sans-serif" font-size="54" font-weight="800" letter-spacing="5" fill="#FFFFFF" fill-opacity="${OPACITY + 0.3}">ELTEK</text>
    <path transform="translate(346 30) scale(2.4)" d="M6 0 0 9h5l-2 7 8-10H6l2-6z" fill="#FF6B1A" fill-opacity="${OPACITY + 0.35}"/>
  </svg>`;
  return { buf: Buffer.from(svg), w, h };
}

async function run() {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(RAW).filter((f) => /\.(jpe?g|png|webp|tiff?|heic)$/i.test(f));
  if (!files.length) {
    console.log('No photos found in src/images/raw/ — add some and run again.');
    return;
  }
  for (const f of files) {
    const name = path.basename(f, path.extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const img = sharp(path.join(RAW, f)).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
    const { data, info } = await img.toBuffer({ resolveWithObject: true });
    const s = stamp(info.width);
    const margin = Math.round(info.width * 0.025);
    await sharp(data)
      .composite([{ input: s.buf, left: info.width - s.w - margin, top: info.height - s.h - margin }])
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${name}.webp`));
    console.log(`✓ ${f} → src/images/products/${name}.webp (${info.width}×${info.height})`);
  }
  console.log('\nDone. Run `npm run build` to use the new photos on the site.');
}

run().catch((e) => { console.error(e); process.exit(1); });
