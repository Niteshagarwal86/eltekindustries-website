// SVG product illustrations. These are placeholders for real factory photos:
// each product carries an "ELTEK" print the way real conduit carries brand print.
// Regenerated on every build into dist/assets/img/products/.

const PRINT = '#1E2530';
const ORANGE = '#FF6B1A';

const defs = `
<defs>
  <linearGradient id="pvcV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9aa2ac"/><stop offset=".18" stop-color="#e9ecf0"/>
    <stop offset=".42" stop-color="#cfd4da"/><stop offset=".85" stop-color="#9ba3ad"/><stop offset="1" stop-color="#7b838e"/>
  </linearGradient>
  <linearGradient id="pvcH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#9aa2ac"/><stop offset=".2" stop-color="#e9ecf0"/>
    <stop offset=".45" stop-color="#cfd4da"/><stop offset=".85" stop-color="#9ba3ad"/><stop offset="1" stop-color="#7b838e"/>
  </linearGradient>
  <linearGradient id="whiteV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f7f8fa"/><stop offset=".5" stop-color="#eceff3"/><stop offset="1" stop-color="#cfd5dc"/>
  </linearGradient>
  <radialGradient id="plate" cx=".38" cy=".32" r=".8">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef1f4"/><stop offset="1" stop-color="#c9cfd6"/>
  </radialGradient>
  <radialGradient id="greyPlate" cx=".38" cy=".32" r=".8">
    <stop offset="0" stop-color="#e8ebef"/><stop offset=".6" stop-color="#c3c9d0"/><stop offset="1" stop-color="#99a1ab"/>
  </radialGradient>
  <linearGradient id="bore" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2a3038"/><stop offset="1" stop-color="#4a525c"/>
  </linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0B1F3A" flood-opacity=".22"/>
  </filter>
</defs>`;

const bolt = (x, y, s = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M6 0 0 9h5l-2 7 8-10H6l2-6z" fill="${ORANGE}"/>`;

// A pipe lying along the x axis, centred on (0,0), length L, radius r. Rotate with a wrapper <g>.
function pipe(L, r, label, wall = 0.22) {
  const x0 = -L / 2, x1 = L / 2;
  return `
  <ellipse cx="${x1}" cy="0" rx="${r * 0.32}" ry="${r}" fill="#8f97a1"/>
  <rect x="${x0}" y="${-r}" width="${L}" height="${2 * r}" fill="url(#pvcV)"/>
  <ellipse cx="${x0}" cy="0" rx="${r * 0.32}" ry="${r}" fill="#dfe3e8" stroke="#8f97a1" stroke-width="1.5"/>
  <ellipse cx="${x0}" cy="0" rx="${r * 0.32 * (1 - wall)}" ry="${r * (1 - wall)}" fill="url(#bore)"/>
  ${label ? `<g font-family="Montserrat, Arial, sans-serif" font-weight="800" fill="${PRINT}" fill-opacity=".78">
    <text x="${x0 + r * 0.9}" y="${r * 0.18}" font-size="${r * 0.5}" letter-spacing="1">ELTEK</text>
    ${bolt(x0 + r * 2.75, -r * 0.3, r / 28)}
    <text x="${x0 + r * 3.4}" y="${r * 0.16}" font-size="${r * 0.32}" font-weight="600" letter-spacing=".5">${label}</text>
  </g>` : ''}`;
}

function sizeTag(text, x = 24, y = 24) {
  const w = 18 + text.length * 8.2;
  return `<g transform="translate(${x} ${y})">
    <rect width="${w}" height="30" rx="15" fill="#0B1F3A"/>
    <text x="${w / 2}" y="20" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">${text}</text>
  </g>`;
}

const wrap = (body, title, vb = '0 0 600 420') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}" role="img" aria-labelledby="t"><title id="t">${title}</title>${defs}${body}</svg>\n`;

// ---------- Individual products ----------

function conduitPipe() {
  return wrap(`
  <g filter="url(#shadow)">
    <g transform="translate(290 135) rotate(-14)">${pipe(430, 28, 'RIGID PVC CONDUIT · 20 MM')}</g>
    <g transform="translate(300 215) rotate(-14)">${pipe(470, 40, 'RIGID PVC CONDUIT · IS 9537 · 32 MM')}</g>
    <g transform="translate(318 300) rotate(-14)">${pipe(440, 34, 'RIGID PVC CONDUIT · IS 9537 · 25 MM')}</g>
  </g>
  ${sizeTag('20 – 50 mm', 24, 370)}`, 'Illustration of Eltek PVC conduit pipes');
}

function casingCapping() {
  // Extruded U-channel (casing) with snap-on capping, drawn as a simple oblique projection.
  const ox = 125, oy = 300, vx = 320, vy = -135;
  const P = (x, y) => `${ox + x},${oy + y}`;
  const Pv = (x, y) => `${ox + x + vx},${oy + y + vy}`;
  const quad = (a, b, fill, extra = '') =>
    `<polygon points="${P(...a)} ${P(...b)} ${Pv(...b)} ${Pv(...a)}" fill="${fill}" ${extra}/>`;
  const cy = -62; // capping lift
  return wrap(`
  <g filter="url(#shadow)">
    <!-- casing (U channel) -->
    ${quad([14, 52], [118, 52], '#c9ced5')}
    ${quad([14, 0], [14, 52], '#b3b9c1')}
    ${quad([0, 0], [14, 0], '#f3f5f7')}
    ${quad([118, 0], [132, 0], '#f3f5f7')}
    ${quad([132, 0], [132, 66], '#dde1e6')}
    <g transform="matrix(${vx / Math.hypot(vx, vy)} ${vy / Math.hypot(vx, vy)} 0 1 ${ox + 132} ${oy})">
      <text x="34" y="41" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="800" fill="${PRINT}" fill-opacity=".72" letter-spacing="1">ELTEK</text>
      ${bolt(112, 21, 1.15)}
      <text x="134" y="40" font-family="Montserrat, Arial, sans-serif" font-size="14" font-weight="600" fill="${PRINT}" fill-opacity=".6">PVC CASING 25×16</text>
    </g>
    <polygon points="${P(0, 0)} ${P(14, 0)} ${P(14, 52)} ${P(118, 52)} ${P(118, 0)} ${P(132, 0)} ${P(132, 66)} ${P(0, 66)}" fill="#eef0f3" stroke="#9aa2ac" stroke-width="1.5"/>
    <!-- capping -->
    ${quad([-4, cy], [136, cy], '#ffffff')}
    ${quad([136, cy], [136, cy + 12], '#d6dbe1')}
    <polygon points="${P(-4, cy)} ${P(136, cy)} ${P(136, cy + 12)} ${P(120, cy + 12)} ${P(120, cy + 30)} ${P(114, cy + 30)} ${P(114, cy + 12)} ${P(18, cy + 12)} ${P(18, cy + 30)} ${P(12, cy + 30)} ${P(12, cy + 12)} ${P(-4, cy + 12)}" fill="#f7f8fa" stroke="#9aa2ac" stroke-width="1.5"/>
  </g>
  <g font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" fill="#8a929c">
    <path d="M${ox - 30} ${oy + cy + 6}h22M${ox - 30} ${oy + 33}h22" stroke="#FF6B1A" stroke-width="2"/>
    <text x="${ox - 34}" y="${oy + cy + 10}" text-anchor="end">Capping</text>
    <text x="${ox - 34}" y="${oy + 37}" text-anchor="end">Casing</text>
  </g>
  ${sizeTag('20×12 – 50×50 mm', 24, 370)}`, 'Illustration of Eltek PVC casing and capping channel');
}

function bendPaths(d, w) {
  return `
  <path d="${d}" fill="none" stroke="#7d858f" stroke-width="${w}" stroke-linecap="butt"/>
  <path d="${d}" fill="none" stroke="#a8afb7" stroke-width="${w * 0.84}"/>
  <path d="${d}" fill="none" stroke="#c7ccd2" stroke-width="${w * 0.6}"/>
  <path d="${d}" fill="none" stroke="#e3e6ea" stroke-width="${w * 0.3}"/>`;
}

function bend() {
  const d = 'M190 360 L190 250 A140 140 0 0 1 330 110 L440 110';
  return wrap(`
  <g filter="url(#shadow)">
    ${bendPaths(d, 70)}
    ${bendPaths('M190 362 L190 305', 84)}
    ${bendPaths('M385 110 L442 110', 84)}
    <ellipse cx="190" cy="362" rx="42" ry="13" fill="#dfe3e8" stroke="#8f97a1" stroke-width="1.5"/>
    <ellipse cx="190" cy="362" rx="33" ry="9.5" fill="url(#bore)"/>
    <ellipse cx="442" cy="110" rx="13" ry="42" fill="#dfe3e8" stroke="#8f97a1" stroke-width="1.5"/>
    <ellipse cx="442" cy="110" rx="9.5" ry="33" fill="url(#bore)"/>
    <path id="bendText" d="M206 290 L206 252 A124 124 0 0 1 330 128" fill="none"/>
    <text font-family="Montserrat, Arial, sans-serif" font-size="19" font-weight="800" fill="${PRINT}" fill-opacity=".75" letter-spacing="2">
      <textPath href="#bendText" xlink:href="#bendText" startOffset="18%">ELTEK · PVC BEND</textPath>
    </text>
  </g>
  ${sizeTag('20 – 50 mm', 24, 370)}`, 'Illustration of an Eltek 90 degree PVC bend');
}

function ribbed(d, w) {
  return `
  <path d="${d}" fill="none" stroke="#2d333b" stroke-width="${w}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#59616b" stroke-width="${w * 0.78}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#8a929b" stroke-width="${w * 0.78}" stroke-dasharray="3.5 4.5"/>
  <path d="${d}" fill="none" stroke="#b9bfc6" stroke-width="${w * 0.22}" stroke-dasharray="3.5 4.5" opacity=".7" transform="translate(-2 -3)"/>`;
}

function flexiblePipe() {
  const rings = [150, 124, 98].map((r) => ribbed(`M${300 - r} 210 a${r} ${r * 0.62} 0 1 0 ${2 * r} 0 a${r} ${r * 0.62} 0 1 0 ${-2 * r} 0`, 26)).join('');
  return wrap(`
  <g filter="url(#shadow)">
    ${rings}
    ${ribbed('M450 210 C 470 300, 520 330, 560 340', 26)}
    <ellipse cx="562" cy="341" rx="9" ry="13" fill="#20252c"/>
    <g transform="translate(232 180)">
      <rect width="136" height="62" rx="10" fill="#fff" stroke="#0B1F3A" stroke-width="2"/>
      <rect width="136" height="20" rx="10" fill="#0B1F3A"/><rect y="10" width="136" height="10" fill="#0B1F3A"/>
      <text x="68" y="15" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="800" fill="#fff" letter-spacing="1.5">ELTEK</text>
      ${bolt(104, 4, 0.75)}
      <text x="68" y="38" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="700" fill="${PRINT}">CORRUGATED</text>
      <text x="68" y="53" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="700" fill="${PRINT}">FLEXIBLE · 25 MM</text>
    </g>
  </g>
  ${sizeTag('20 – 50 mm', 24, 370)}`, 'Illustration of an Eltek corrugated flexible pipe coil');
}

function junctionBoxGroup() {
  const spout = (rot) => `<g transform="rotate(${rot} 0 0)">
    <rect x="-34" y="-150" width="68" height="70" rx="4" fill="url(#pvcH)" stroke="#7d858f" stroke-width="1.5"/>
    <ellipse cx="0" cy="-150" rx="34" ry="9" fill="#dfe3e8" stroke="#7d858f" stroke-width="1.5"/>
    <ellipse cx="0" cy="-150" rx="25" ry="6" fill="url(#bore)"/></g>`;
  return `
  ${[0, 90, 180, 270].map(spout).join('')}
  <circle r="104" fill="url(#greyPlate)" stroke="#7d858f" stroke-width="2"/>
  <circle r="88" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>
  ${[[-60, -60], [60, -60], [-60, 60], [60, 60]].map(([x, y]) => `<circle cx="${x * 0.82}" cy="${y * 0.82}" r="7" fill="#8a929c"/><path d="M${x * 0.82 - 4} ${y * 0.82}h8" stroke="#3a4048" stroke-width="2"/>`).join('')}
  <text y="8" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="800" fill="${PRINT}" fill-opacity=".62" letter-spacing="2">ELTEK</text>
  ${bolt(48, -22, 1.2)}
  <text y="32" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="12" font-weight="700" fill="${PRINT}" fill-opacity=".5">4-WAY JUNCTION BOX</text>`;
}

function saddleGroup() {
  return `
  <g transform="translate(0 0)">${pipe(380, 34, '')}</g>
  <g>
    <rect x="-36" y="-92" width="72" height="184" rx="12" fill="url(#whiteV)" stroke="#8f97a1" stroke-width="1.5"/>
    <rect x="-26" y="-40" width="52" height="80" rx="20" fill="url(#pvcH)" opacity=".55"/>
    <circle cx="0" cy="-68" r="9" fill="#8a929c"/><circle cx="0" cy="-68" r="4" fill="#2a3038"/>
    <circle cx="0" cy="68" r="9" fill="#8a929c"/><circle cx="0" cy="68" r="4" fill="#2a3038"/>
    <text x="0" y="5" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="13" font-weight="800" fill="${PRINT}" fill-opacity=".7" letter-spacing="1" transform="rotate(-90)">ELTEK</text>
  </g>`;
}

function plateGroup(r, kind) {
  const isFan = kind === 'fan';
  return `
  <circle r="${r}" fill="url(#plate)" stroke="#9aa2ac" stroke-width="2"/>
  <circle r="${r * 0.86}" fill="none" stroke="#c4cad1" stroke-width="2"/>
  ${isFan ? `<circle r="${r * 0.3}" fill="none" stroke="#c4cad1" stroke-width="2"/>
    <circle r="${r * 0.13}" fill="url(#bore)"/>
    ${[0, 120, 240].map((a) => `<rect x="-6" y="${-r * 0.7}" width="12" height="26" rx="6" fill="#8a929c" transform="rotate(${a})"/>`).join('')}`
    : `<circle r="${r * 0.12}" fill="url(#bore)"/>
    <circle cx="${-r * 0.55}" r="6" fill="#8a929c"/><circle cx="${r * 0.55}" r="6" fill="#8a929c"/>`}
  <path id="arc-${kind}" d="M${-r * 0.66} 0 A${r * 0.66} ${r * 0.66} 0 0 1 ${r * 0.66} 0" fill="none"/>
  <text font-family="Montserrat, Arial, sans-serif" font-size="${r * 0.17}" font-weight="800" fill="${PRINT}" fill-opacity=".55" letter-spacing="3">
    <textPath href="#arc-${kind}" xlink:href="#arc-${kind}" startOffset="50%" text-anchor="middle">ELTEK</textPath>
  </text>`;
}

function surfaceBoxGroup() {
  return `
  <polygon points="-150,-70 110,-70 170,-120 -90,-120" fill="#ffffff" stroke="#9aa2ac" stroke-width="1.5"/>
  <polygon points="-132,-74 98,-74 146,-114 -84,-114" fill="#dfe3e8"/>
  <polygon points="110,-70 170,-120 170,10 110,60" fill="#d4d9df" stroke="#9aa2ac" stroke-width="1.5"/>
  <rect x="-150" y="-70" width="260" height="130" fill="url(#whiteV)" stroke="#9aa2ac" stroke-width="1.5"/>
  <circle cx="-110" cy="-94" r="9" fill="#bfc5cc"/><circle cx="118" cy="-94" r="9" fill="#bfc5cc"/>
  ${[-70, 0, 70].map((x) => `<circle cx="${x}" cy="30" r="13" fill="none" stroke="#c4cad1" stroke-width="3"/>`).join('')}
  <text x="-20" y="-14" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="28" font-weight="800" fill="${PRINT}" fill-opacity=".6" letter-spacing="2">ELTEK</text>
  ${bolt(38, -38, 1.1)}`;
}

const center = (inner, s = 1, x = 300, y = 200) => `<g filter="url(#shadow)" transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;

const junctionBox = () => wrap(center(junctionBoxGroup(), 1.12) + sizeTag('20 / 25 mm entries', 24, 370), 'Illustration of an Eltek PVC junction box');
const saddle = () => wrap(center(`<g transform="rotate(-10)">${saddleGroup()}</g>`, 1.1) + sizeTag('20 – 50 mm', 24, 370), 'Illustration of an Eltek PVC saddle fixing a conduit pipe');
const roundSheet = () => wrap(center(plateGroup(150, 'round')) + sizeTag('Round sheet', 24, 370), 'Illustration of an Eltek PVC round sheet');
const fanSheet = () => wrap(center(plateGroup(160, 'fan')) + sizeTag('Fan sheet', 24, 370), 'Illustration of an Eltek PVC fan sheet');
const surfaceBox = () => wrap(center(surfaceBoxGroup(), 1.1, 290, 230) + sizeTag('Surface box', 24, 370), 'Illustration of an Eltek PVC surface box');

function accessories() {
  return wrap(`
  ${center(plateGroup(120, 'fan'), 0.95, 420, 150)}
  ${center(surfaceBoxGroup(), 0.62, 410, 320)}
  ${center(junctionBoxGroup(), 0.72, 170, 210)}
  ${sizeTag('Full accessory range', 24, 370)}`, 'Illustration of Eltek PVC accessories: junction box, fan sheet and surface box');
}

module.exports = {
  'conduit-pipe': conduitPipe,
  'casing-capping': casingCapping,
  bend,
  'flexible-pipe': flexiblePipe,
  accessories,
  'junction-box': junctionBox,
  saddle,
  'round-sheet': roundSheet,
  'fan-sheet': fanSheet,
  'surface-box': surfaceBox,
};
