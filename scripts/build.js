#!/usr/bin/env node
// Static site build for eltekindustries.in
//   - renders src/pages/**.html through src/layouts/base.html (+ shared partials)
//   - generates one page per product from data/products.json + src/templates/product.html
//   - turns photos (if present) into responsive WebP, otherwise uses SVG illustrations
//   - writes sitemap.xml, robots.txt, favicons and the Open Graph image
// Tailwind runs afterwards (see package.json "build").

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { icon } = require('./lib/icons');
const productArt = require('./lib/product-art');
const sceneArt = require('./lib/scene-art');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const IMG_OUT = path.join(DIST, 'assets', 'img');

const site = readJSON('data/site.json');
const products = readJSON('data/products.json');
site.phoneDisplay = site.phoneDisplay.replace(/ /g, '&nbsp;'); // keep the number on one line
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const YEAR = new Date().getFullYear();
const PHOTO_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function readJSON(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function write(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const findPhoto = (dir, name) => {
  for (const ext of PHOTO_EXT) {
    const f = path.join(SRC, 'images', dir, name + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
};
const waLink = (text = site.whatsappDefaultText) => site.whatsappBase + encodeURIComponent(text);
const fullAddress = () => {
  const a = site.address;
  return `${site.name}, ${a.line1}, ${a.line2}, ${a.region} – ${a.postalCode}, ${a.country}`;
};

// Responsive WebP from a photo. Returns { srcset, src, width, height }.
const photoCache = new Map();
async function processPhoto(file, outDir, widths = [480, 960, 1600]) {
  if (photoCache.has(file)) return photoCache.get(file);
  const base = path.basename(file, path.extname(file));
  const meta = await sharp(file).metadata();
  const usable = widths.filter((w) => w < meta.width).concat(Math.min(meta.width, widths[widths.length - 1]));
  const uniq = [...new Set(usable)];
  const set = [];
  for (const w of uniq) {
    const rel = `/assets/img/${outDir}/${base}-${w}.webp`;
    await sharp(file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(DIST, rel));
    set.push(`${rel} ${w}w`);
  }
  const largest = uniq[uniq.length - 1];
  const res = {
    srcset: set.join(', '),
    src: set[set.length - 1].split(' ')[0],
    width: largest,
    height: Math.round((meta.height / meta.width) * largest),
  };
  photoCache.set(file, res);
  return res;
}

function imgTag({ src, srcset, sizes, width, height, alt, cls = '', eager = false, extra = '' }) {
  return `<img src="${src}"${srcset ? ` srcset="${srcset}" sizes="${sizes || '100vw'}"` : ''} width="${width}" height="${height}" alt="${esc(alt)}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${extra}>`;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
const assetIndex = { scenes: {}, products: {}, gallery: [] };

async function buildAssets() {
  for (const d of ['products', 'scenes', 'stock', 'gallery', 'brand']) fs.mkdirSync(path.join(IMG_OUT, d), { recursive: true });

  // Product images: real (watermarked) photos win over illustrations
  for (const [key, fn] of Object.entries(productArt)) {
    write(path.join(IMG_OUT, 'products', `${key}.svg`), fn());
    const photo = findPhoto('products', key);
    assetIndex.products[key] = photo
      ? { ...(await processPhoto(photo, 'products', [400, 800, 1200])), photo: true }
      : { src: `/assets/img/products/${key}.svg`, width: 600, height: 420, photo: false };
  }

  // Scenes: stock photo if dropped into src/images/stock/<name>.jpg, else illustration
  const sceneNames = { home: 'home', factory: 'factory', 'about-hero': 'factory', residential: 'home', industrial: 'factory' };
  for (const [name, fallback] of Object.entries(sceneNames)) {
    const photo = findPhoto('stock', name);
    if (photo) {
      assetIndex.scenes[name] = { ...(await processPhoto(photo, 'stock')), photo: true };
    } else {
      const svgPath = path.join(IMG_OUT, 'scenes', `${fallback}.svg`);
      if (!fs.existsSync(svgPath)) write(svgPath, sceneArt.scenes[fallback]());
      assetIndex.scenes[name] = { src: `/assets/img/scenes/${fallback}.svg`, width: 1200, height: 900, photo: false };
    }
  }

  // Manufacturing gallery
  const galleryDir = path.join(SRC, 'images', 'gallery');
  const galleryFiles = fs.readdirSync(galleryDir).filter((f) => PHOTO_EXT.includes(path.extname(f).toLowerCase())).sort();
  if (galleryFiles.length) {
    for (const f of galleryFiles) {
      const res = await processPhoto(path.join(galleryDir, f), 'gallery', [480, 960, 1600]);
      const caption = path.basename(f, path.extname(f)).replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ');
      assetIndex.gallery.push({ ...res, caption: (caption.charAt(0).toUpperCase() + caption.slice(1)).replace(/\b(pvc|isi|iso)\b/gi, (m) => m.toUpperCase()) });
    }
  } else {
    const tiles = [
      ['PVC compound mixing', 900, 1100, '#1b3a66'], ['Conduit extrusion line', 900, 640, '#24466f'],
      ['In-house testing lab', 900, 760, '#183459'], ['Bend forming', 900, 1000, '#204067'],
      ['Finished stock', 900, 640, '#1a3760'], ['Packing & dispatch', 900, 820, '#21416a'],
    ];
    tiles.forEach(([label, w, h, hue], i) => {
      const rel = `/assets/img/gallery/placeholder-${i + 1}.svg`;
      write(path.join(DIST, rel), sceneArt.galleryTile(label, w, h, hue));
      assetIndex.gallery.push({ src: rel, width: w, height: h, caption: label, placeholder: true });
    });
  }


  await buildBrandAssets();

  // Certificates / downloadable documents (src/docs → /assets/docs)
  const docsDir = path.join(SRC, 'docs');
  if (fs.existsSync(docsDir)) {
    const outDocs = path.join(DIST, 'assets', 'docs');
    fs.mkdirSync(outDocs, { recursive: true });
    for (const f of fs.readdirSync(docsDir)) fs.copyFileSync(path.join(docsDir, f), path.join(outDocs, f));
  }

  // JS
  write(path.join(DIST, 'assets', 'js', 'main.js'), fs.readFileSync(path.join(SRC, 'js', 'main.js'), 'utf8'));
}

async function buildBrandAssets() {
  const markSvg = fs.readFileSync(path.join(SRC, 'images', 'brand', 'eltek-mark.svg'), 'utf8');
  const markPath = markSvg.match(/<path[\s\S]*?\/>/)[0];
  const coloredMark = (fill) => markSvg.replace('fill="currentColor"', `fill="${fill}"`);
  write(path.join(IMG_OUT, 'brand', 'eltek-mark.svg'), coloredMark('#0B1F3A'));
  write(path.join(IMG_OUT, 'brand', 'eltek-mark-white.svg'), coloredMark('#FFFFFF'));

  // Full logo lockup (mark + wordmark) as a standalone SVG for print/email use
  const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" role="img" aria-label="Eltek Industries">
  <g transform="translate(10 10) scale(${220 / 1242})">${markPath.replace('fill="currentColor"', 'fill="#0B1F3A"')}</g>
  <text x="270" y="140" font-family="Montserrat, Arial, sans-serif" font-size="128" font-weight="800" fill="#0B1F3A" letter-spacing="4">ELTEK</text>
  <path transform="translate(340 30) scale(3.4)" d="M6 0 0 9h5l-2 7 8-10H6l2-6z" fill="#FF6B1A"/>
  <text x="276" y="205" font-family="Montserrat, Arial, sans-serif" font-size="44" font-weight="700" fill="#4a5568" letter-spacing="17">INDUSTRIES</text></svg>\n`;
  write(path.join(IMG_OUT, 'brand', 'eltek-logo.svg'), lockup);

  // Favicons: navy rounded tile with the white mark
  const tile = (size, pad = 0.16, radius = 0.22) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * radius}" fill="#0B1F3A"/>
    <g transform="translate(${size * pad} ${size * pad}) scale(${(size * (1 - 2 * pad)) / 1242})">${markPath.replace('fill="currentColor"', 'fill="#FFFFFF"')}</g>
    <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.07}" fill="#FF6B1A"/></svg>`;
  write(path.join(DIST, 'favicon.svg'), tile(64));
  const png = (size, pad, radius) => sharp(Buffer.from(tile(size, pad, radius))).resize(size, size).png().toBuffer();
  const p32 = await png(32, 0.12);
  fs.writeFileSync(path.join(DIST, 'favicon.ico'), pngToIco(p32, 32));
  fs.writeFileSync(path.join(DIST, 'apple-touch-icon.png'), await png(180, 0.16, 0));
  fs.writeFileSync(path.join(DIST, 'icon-192.png'), await png(192, 0.16));
  fs.writeFileSync(path.join(DIST, 'icon-512.png'), await png(512, 0.2, 0));
  write(path.join(DIST, 'site.webmanifest'), JSON.stringify({
    name: site.name, short_name: site.shortName, start_url: '/', display: 'standalone',
    background_color: '#FFFFFF', theme_color: '#0B1F3A',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
  }, null, 2));

  // Open Graph image 1200×630
  const conduit = productArt['conduit-pipe']().replace(/<\?xml[^>]*>/, '').replace('<svg ', '<svg x="600" y="110" width="580" height="406" ');
  const og = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630">
    <defs><radialGradient id="ogbg" cx=".85" cy=".1" r="1"><stop offset="0" stop-color="#1b3a66"/><stop offset=".6" stop-color="#0B1F3A"/><stop offset="1" stop-color="#081629"/></radialGradient></defs>
    <rect width="1200" height="630" fill="url(#ogbg)"/>
    <g fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="2"><path d="M0 120h300l40 40h200l40-40h620M0 520h200l40-40h300M900 630V480l40-40V300"/></g>
    <rect x="600" y="140" width="560" height="380" rx="28" fill="#E6EAF0"/>
    ${conduit}
    <g transform="translate(70 80) scale(${110 / 1242})">${markPath.replace('fill="currentColor"', 'fill="#FFFFFF"')}</g>
    <text x="200" y="152" font-family="Montserrat, Arial, sans-serif" font-size="58" font-weight="800" fill="#fff" letter-spacing="3">ELTEK</text>
    <text x="203" y="186" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#cbd5e1" letter-spacing="9">INDUSTRIES</text>
    <text x="70" y="300" font-family="Montserrat, Arial, sans-serif" font-size="46" font-weight="800" fill="#fff">PVC Conduit Systems</text>
    <text x="70" y="358" font-family="Montserrat, Arial, sans-serif" font-size="46" font-weight="800" fill="#FF6B1A">for Homes &amp; Industry</text>
    <text x="70" y="420" font-family="Inter, Arial, sans-serif" font-size="24" fill="#cbd5e1">ISI marked (IS 9537) · ISO 9001:2015</text>
    <text x="70" y="456" font-family="Inter, Arial, sans-serif" font-size="24" fill="#cbd5e1">SIDCUL Pantnagar, Uttarakhand</text>
    <rect x="70" y="510" width="300" height="56" rx="14" fill="#FF6B1A"/>
    <text x="220" y="546" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="800" fill="#0B1F3A">eltekindustries.in</text>
  </svg>`;
  await sharp(Buffer.from(og)).png().toFile(path.join(IMG_OUT, 'og-image.png'));
}

// Wrap a single PNG in an ICO container (supported by all modern browsers)
function pngToIco(pngBuf, size) {
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); entry.writeUInt8(size, 1); entry.writeUInt8(0, 2); entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6); entry.writeUInt32LE(pngBuf.length, 8); entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuf]);
}

// ---------------------------------------------------------------------------
// Helpers callable from templates as {{@name arg1 "arg two"}}
// ---------------------------------------------------------------------------
const productImg = (key, cls = '', eager = false, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw') => {
  const a = assetIndex.products[key];
  const name = bySlug[key]?.name || key.replace(/-/g, ' ');
  const alt = a.photo ? `Eltek ${name}` : `Illustration of Eltek ${name}`;
  return imgTag({ ...a, sizes, alt, cls, eager });
};

const sceneImg = (name, alt, cls = '', eager = false, sizes = '(min-width: 1024px) 50vw, 100vw') =>
  imgTag({ ...assetIndex.scenes[name], alt, cls, eager: eager === true || eager === 'eager', sizes });

const sizeChips = (p, max = 5) =>
  p.sizes.slice(0, max).map((s) => `<li class="chip">${esc(s.size)}</li>`).join('');

const MARK_PATH = fs.readFileSync(path.join(SRC, 'images', 'brand', 'eltek-mark.svg'), 'utf8').match(/<path[\s\S]*?\/>/)[0];

const helpers = {
  icon: (name, cls) => icon(name, cls),
  logoMark: (cls = 'h-10 w-10') => `<svg class="${cls}" viewBox="0 0 1230 1242" aria-hidden="true" focusable="false">${MARK_PATH}</svg>`,
  year: () => String(YEAR),
  wa: (text) => esc(waLink(text)),
  fullAddress: () => esc(fullAddress()),
  productImg: (key, cls, eager) => productImg(key, cls, eager === 'eager'),
  scene: (name, alt, cls, eager, sizes) => sceneImg(name, alt, cls, eager, sizes),

  productGrid: (ctx, variant = 'home') => products.map((p, i) => `
    <article class="card card-hover group relative flex flex-col overflow-hidden" data-reveal style="--d:${i * 70}ms">
      <div class="bg-sunken bg-circuit p-4">
        ${productImg(p.slug, 'mx-auto aspect-[10/7] w-full object-contain transition duration-500 group-hover:scale-[1.04]')}
      </div>
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-extrabold leading-snug sm:text-xl"><a href="/products/${p.slug}/" class="after:absolute after:inset-0 focus-visible:outline-none">${esc(p.name)}</a></h3>
          ${p.isi ? '<span class="badge-cert shrink-0 !px-2 !py-0.5 !text-xs">ISI</span>' : ''}
        </div>
        <p class="mt-2 text-sm leading-relaxed text-muted">${esc(p.short)}</p>
        <ul class="mt-4 flex flex-wrap gap-1.5" aria-label="Available sizes">${sizeChips(p)}</ul>
        <span class="mt-auto inline-flex items-center gap-1.5 pt-5 font-heading text-sm font-bold text-accent">View Sizes ${icon('arrow', 'h-4 w-4 transition group-hover:translate-x-1')}</span>
      </div>
    </article>`).join(''),

  sizeMatrix: () => products.map((p) => `<tr class="border-b border-line last:border-0"><th scope="row" class="px-4 py-3 font-heading font-bold"><a class="inline-flex min-h-[44px] items-center hover:text-accent" href="/products/${p.slug}/">${esc(p.name)}</a></th><td class="px-4 py-3"><ul class="flex flex-wrap gap-1.5">${sizeChips(p, 10)}</ul></td></tr>`).join(''),
  mapQuery: () => encodeURIComponent(site.mapQuery),
  formAction: () => (site.formspreeId && site.formspreeId !== 'FORMSPREE_ID' ? `https://formspree.io/f/${site.formspreeId}` : '/'),
  stateOptions: () => ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep', 'Puducherry']
    .map((st) => `<option>${esc(st)}</option>`).join(''),
  productNavLinks: () => products.map((p) => `<li><a class="hover:text-white" href="/products/${p.slug}/">${esc(p.name)}</a></li>`).join(''),
  productMenuLinks: () => products.map((p) => `<li><a class="flex items-center gap-3 rounded-xl p-2 hover:bg-sunken" href="/products/${p.slug}/"><span class="grid h-11 w-14 shrink-0 place-items-center rounded-lg bg-sunken">${imgTag({ ...assetIndex.products[p.slug], alt: '', cls: 'h-10 w-14 object-contain' })}</span><span class="text-sm font-semibold">${esc(p.name)}</span></a></li>`).join(''),
  mobileProductLinks: () => products.map((p) => `<li><a class="block py-2 text-lg text-white/85 hover:text-white" href="/products/${p.slug}/">${esc(p.name)}</a></li>`).join(''),

  productOptions: () => {
    const opts = [];
    for (const p of products) {
      if (p.slug === 'accessories') p.sizes.forEach((s) => opts.push(s.size));
      else opts.push(p.name);
    }
    return opts.concat(['Multiple products / full range']).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  },

  stats: (ctx, theme = 'dark') => site.stats.map((s, i) => {
    let value = s.value;
    if (value === 'auto') value = String(products.reduce((n, p) => n + p.sizes.length, 0));
    const numeric = /^\d+$/.test(value);
    return `<div class="text-center" data-reveal style="--d:${i * 90}ms">
      <p class="font-heading text-4xl font-extrabold sm:text-5xl ${theme === 'dark' ? 'text-white' : 'text-ink'}">
        <span ${numeric ? `data-count="${value}"` : ''}>${numeric ? '0' : esc(value)}</span><span class="text-orange">${esc(s.suffix)}</span>
      </p>
      <p class="mt-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-muted'}">${esc(s.label)}</p>
    </div>`;
  }).join(''),

  gallery: () => assetIndex.gallery.map((g, i) => `
    <figure class="group relative overflow-hidden rounded-2xl bg-navy shadow-soft" data-reveal style="--d:${(i % 3) * 80}ms">
      <button type="button" class="block w-full text-left" data-lightbox="${g.src}" data-caption="${esc(g.caption)}" aria-label="Enlarge: ${esc(g.caption)}">
        ${imgTag({ ...g, sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', alt: g.placeholder ? `Placeholder for factory photo: ${g.caption}` : g.caption, cls: 'w-full transition duration-500 group-hover:scale-[1.03]' })}
      </button>
      ${g.placeholder ? '' : `<figcaption class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-4 pt-10 text-sm font-semibold text-white">${esc(g.caption)}</figcaption>`}
    </figure>`).join(''),



  // ---------------- Product-page helpers (use ctx.product) ----------------
  productFeatures: (ctx) => ctx.product.features.map((f, i) => `
    <li class="flex gap-3 rounded-2xl border border-line bg-surface p-4" data-reveal style="--d:${i * 60}ms">
      <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange/15 text-accent">${icon('check', 'h-4 w-4')}</span>
      <span class="font-medium">${esc(f)}</span></li>`).join(''),

  sizeTable: (ctx) => {
    const p = ctx.product;
    const rows = p.sizes.map((s) => `
      <tr>
        <td data-label="${esc(p.sizeLabel)}" class="font-heading font-bold">${esc(s.size)}</td>
        <td data-label="Typical use">${esc(s.use)}</td>
        <td data-label="Packing" class="text-muted">${esc(s.pack)}</td>
        <td data-label="Enquire"><a class="link whitespace-nowrap text-sm" href="/contact/?product=${encodeURIComponent(p.slug === 'accessories' ? s.size : `${p.name} ${s.size}`)}#quote">Get price</a></td>
      </tr>`).join('');
    return `<table class="size-table">
      <caption class="sr-only">${esc(p.name)} — available sizes</caption>
      <thead><tr><th scope="col" class="rounded-tl-xl">${esc(p.sizeLabel)}</th><th scope="col">Typical use (guide)</th><th scope="col">Packing</th><th scope="col" class="rounded-tr-xl"><span class="sr-only">Enquire</span></th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  },

  accessoryTiles: (ctx) => ctx.product.slug !== 'accessories' ? '' : `
    <section class="section !pt-0" aria-labelledby="range-h"><div class="container-site">
      <h2 id="range-h" class="h-section">The accessory range</h2>
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      ${ctx.product.sizes.map((s, i) => `<figure class="card overflow-hidden" data-reveal style="--d:${i * 60}ms">
        <div class="bg-sunken bg-circuit p-3">${productImg(s.illustration, 'mx-auto aspect-[10/7] w-full object-contain')}</div>
        <figcaption class="p-4"><p class="font-heading font-bold">${esc(s.size)}</p><p class="mt-1 text-sm text-muted">${esc(s.use)}</p></figcaption></figure>`).join('')}
      </div></div></section>`,

  appList: (ctx, kind) => ctx.product.applications[kind].map((a) => `<li class="flex gap-2.5"><span class="mt-1 text-accent">${icon('check', 'h-4 w-4')}</span><span>${esc(a)}</span></li>`).join(''),

  relatedProducts: (ctx) => ctx.product.related.map((slug, i) => {
    const r = bySlug[slug];
    return `<a href="/products/${slug}/" class="card card-hover group flex items-center gap-4 p-4" data-reveal style="--d:${i * 70}ms">
      <span class="grid h-20 w-28 shrink-0 place-items-center rounded-xl bg-sunken">${productImg(slug, 'h-20 w-28 object-contain')}</span>
      <span><span class="block font-heading font-bold">${esc(r.name)}</span><span class="mt-1 block text-sm text-muted">${esc(r.sizes.length)} options</span></span>
      <span class="ml-auto text-accent">${icon('arrow', 'h-5 w-5 transition group-hover:translate-x-1')}</span></a>`;
  }).join(''),

  productHero: (ctx) => productImg(ctx.product.slug, 'mx-auto aspect-[10/7] w-full object-contain', true, '(min-width: 1024px) 45vw, 100vw'),
  productWa: (ctx) => esc(waLink(`${site.whatsappDefaultText}${ctx.product.name}`)),
  productQuote: (ctx) => `/contact/?product=${encodeURIComponent(ctx.product.name)}#quote`,
  isiBadge: (ctx) => ctx.product.isi ? `<span class="badge-cert">${icon('shield', 'h-4 w-4')} ISI marked · IS 9537</span>` : '',

  // ---------------- Catalogue ----------------
  catalogue: () => products.map((p, i) => `
    <section class="${i ? 'print-break' : ''} border-t border-line py-10">
      <div class="grid items-center gap-8 md:grid-cols-[1fr_1.3fr]">
        <div class="rounded-2xl bg-sunken p-4">${productImg(p.slug, 'mx-auto w-full max-w-md object-contain', false)}</div>
        <div>
          <h2 class="font-heading text-2xl font-extrabold">${esc(p.name)} ${p.isi ? '<span class="badge-cert ml-2 align-middle !text-xs">ISI · IS 9537</span>' : ''}</h2>
          <p class="mt-2 text-muted">${esc(p.intro)}</p>
          <ul class="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">${p.features.map((f) => `<li class="flex gap-2"><span class="text-accent">${icon('check', 'h-4 w-4')}</span>${esc(f)}</li>`).join('')}</ul>
        </div>
      </div>
      <table class="mt-6 w-full border-collapse text-left text-sm">
        <thead><tr class="bg-navy text-white"><th class="px-3 py-2">${esc(p.sizeLabel)}</th><th class="px-3 py-2">Typical use</th><th class="px-3 py-2">Packing</th></tr></thead>
        <tbody>${p.sizes.map((s) => `<tr class="border-b border-line"><td class="px-3 py-2 font-semibold">${esc(s.size)}</td><td class="px-3 py-2">${esc(s.use)}</td><td class="px-3 py-2 text-muted">${esc(s.pack)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="mt-3 text-sm text-muted">Colours: ${esc(p.colours)}</p>
    </section>`).join(''),
};

// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------
const RAW_KEYS = new Set(['schema', 'waDefault']);
function getPath(obj, p) { return p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }

function parseArgs(str) {
  const out = []; const re = /"([^"]*)"|(\S+)/g; let m;
  while ((m = re.exec(str))) out.push(m[1] !== undefined ? m[1] : m[2]);
  return out;
}

function render(tpl, ctx, file) {
  let out = tpl;
  for (let i = 0; i < 6 && /\{\{>/.test(out); i++) {
    out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => fs.readFileSync(path.join(SRC, 'partials', `${name}.html`), 'utf8'));
  }
  out = out.replace(/\{\{@(\w+)([^}]*)\}\}/g, (_, name, args) => {
    const fn = helpers[name];
    if (!fn) throw new Error(`${file}: unknown helper @${name}`);
    const a = parseArgs(args.trim());
    // Helpers that need page context take ctx first
    const ctxHelpers = ['productGrid', 'stats', 'productFeatures', 'sizeTable', 'accessoryTiles', 'appList', 'relatedProducts', 'productHero', 'productWa', 'productQuote', 'isiBadge'];
    return ctxHelpers.includes(name) ? fn(ctx, ...a) : fn(...a);
  });
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = getPath(ctx, key);
    if (v === undefined) throw new Error(`${file}: undefined template value {{ ${key} }}`);
    const str = typeof v === 'string' ? v : JSON.stringify(v);
    // Values are HTML-escaped unless they are pre-built HTML (see RAW_KEYS)
    return RAW_KEYS.has(key) || key.startsWith('nav.') ? str : esc(str).replace(/&amp;nbsp;/g, '&nbsp;');
  });
  return out;
}

function parseFrontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------
function orgSchema() {
  const a = site.address;
  const postal = { '@type': 'PostalAddress', streetAddress: `${a.line1}, ${a.line2}`, addressLocality: a.locality, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.countryCode };
  return [
    {
      '@type': 'Organization', '@id': `${site.url}/#org`, name: site.name, url: site.url,
      logo: `${site.url}/assets/img/brand/eltek-logo.svg`, email: site.email, telephone: site.phoneTel,
      founder: { '@type': 'Person', name: site.founder.replace(/^Mr\.\s*/, '') },
      address: postal,
      contactPoint: { '@type': 'ContactPoint', telephone: site.phoneTel, contactType: 'sales', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
    },
    {
      '@type': 'LocalBusiness', '@id': `${site.url}/#business`, name: site.name, url: site.url,
      image: `${site.url}/assets/img/og-image.png`, telephone: site.phoneTel, email: site.email, address: postal,
      parentOrganization: { '@id': `${site.url}/#org` },
      description: 'Manufacturer of ISI-marked PVC electrical conduit pipes, casing & capping, bends, corrugated flexible pipes and accessories at SIDCUL Pantnagar, Uttarakhand.',
      areaServed: 'IN',
    },
  ];
}

function pageSchema(page, product) {
  const graph = orgSchema();
  if (page.path !== '/') {
    const crumbs = [{ name: 'Home', url: `${site.url}/` }];
    if (product) crumbs.push({ name: 'Products', url: `${site.url}/products/` });
    crumbs.push({ name: page.crumb || page.title.split('|')[0].trim(), url: page.url });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) });
  }
  if (product) {
    graph.push({
      '@type': 'Product', name: product.name, description: product.intro,
      image: `${site.url}${assetIndex.products[product.slug].src}`,
      brand: { '@type': 'Brand', name: 'Eltek' },
      manufacturer: { '@id': `${site.url}/#org` },
      category: 'Electrical conduit and fittings',
      additionalProperty: product.sizes.map((s) => ({ '@type': 'PropertyValue', name: product.sizeLabel, value: s.size })),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const builtPages = [];

function outputFor(urlPath) {
  if (urlPath.endsWith('.html')) return path.join(DIST, urlPath);
  return path.join(DIST, urlPath, 'index.html');
}

function navState(urlPath) {
  const sec = urlPath === '/' ? 'home' : urlPath.split('/')[1];
  const s = {};
  for (const k of ['home', 'products', 'applications', 'quality', 'about', 'dealer', 'contact']) s[k] = sec === k ? 'aria-current="page"' : '';
  return s;
}

function renderPage({ body, meta, urlPath, product, file }) {
  let layout = fs.readFileSync(path.join(SRC, 'layouts', 'base.html'), 'utf8');
  // Print layout (catalogue): same <head>, no header / footer / action bar
  if (meta.layout === 'print') layout = layout.replace(/<!--site-chrome-->[\s\S]*?<!--\/site-chrome-->/g, '');
  const page = {
    title: meta.title, description: meta.description, path: urlPath, crumb: meta.crumb,
    url: `${site.url}${urlPath === '/index.html' ? '/' : urlPath}`,
    ogImage: `${site.url}/assets/img/og-image.png`, ogType: urlPath === '/' ? 'website' : 'article',
    robots: meta.robots || 'index, follow',
  };
  const ctx = { site, page, product, nav: navState(urlPath), waDefault: esc(waLink()), schema: '' };
  if (product) ctx.p = { ...product, waText: esc(waLink(`${site.whatsappDefaultText}${product.name}`)) };
  const content = render(body, ctx, file);
  ctx.schema = pageSchema(page, product);
  const html = render(layout.replace('{{content}}', '\u0000CONTENT\u0000'), { ...ctx, content: '' }, file).replace('\u0000CONTENT\u0000', content);
  write(outputFor(urlPath), html);
  if (meta.sitemap !== 'false') builtPages.push({ loc: page.url, priority: urlPath === '/' ? '1.0' : product ? '0.8' : '0.7' });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}

async function main() {
  const t0 = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  await buildAssets();

  const pagesDir = path.join(SRC, 'pages');
  for (const file of walk(pagesDir).filter((f) => f.endsWith('.html'))) {
    const rel = path.relative(pagesDir, file).replace(/\\/g, '/');
    let urlPath;
    if (rel === 'index.html') urlPath = '/';
    else if (rel === '404.html' || rel === 'catalogue.html') urlPath = `/${rel}`;
    else if (rel.endsWith('/index.html')) urlPath = `/${rel.replace(/index\.html$/, '')}`;
    else urlPath = `/${rel.replace(/\.html$/, '')}/`;
    const { meta, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'));
    renderPage({ body, meta, urlPath, file: rel });
  }

  const productTpl = parseFrontMatter(fs.readFileSync(path.join(SRC, 'templates', 'product.html'), 'utf8'));
  for (const p of products) {
    renderPage({
      body: productTpl.body,
      meta: { title: p.seoTitle, description: p.seoDescription, crumb: p.name },
      urlPath: `/products/${p.slug}/`, product: p, file: `product:${p.slug}`,
    });
  }

  // SEO files
  const today = new Date().toISOString().slice(0, 10);
  write(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${builtPages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
  write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  // Host config: long cache for hashed-free static assets is risky, keep it modest
  write(path.join(DIST, '_headers'), `/assets/*\n  Cache-Control: public, max-age=604800\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
  write(path.join(DIST, 'CNAME'), 'eltekindustries.in\n');

  console.log(`Built ${builtPages.length} pages in ${Date.now() - t0} ms → dist/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
