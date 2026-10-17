// Scene illustrations used when no stock/real photo is present in src/images/stock/.
// Drop a photo named <scene>.jpg into src/images/stock/ and the build uses it instead.

const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t" preserveAspectRatio="xMidYMid slice"><title id="t">${title}</title>${body}</svg>\n`;

// Grey PVC conduit drawn as layered strokes along a path
const conduit = (d, w = 18, op = 1) => `<g fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">
  <path d="${d}" stroke="#7d858f" stroke-width="${w}"/>
  <path d="${d}" stroke="#b9c0c8" stroke-width="${w * 0.72}"/>
  <path d="${d}" stroke="#e4e7eb" stroke-width="${w * 0.25}" transform="translate(-1 -2)"/></g>`;

function home() {
  return svg(1200, 900, 'Illustration of a modern living room with neat, concealed PVC conduit wiring', `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ef"/><stop offset="1" stop-color="#f1e8dc"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99a6b"/><stop offset="1" stop-color="#a87a4f"/></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f5"/><stop offset="1" stop-color="#fbe3c9"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".2" r=".6"><stop offset="0" stop-color="#ffd8a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd8a8" stop-opacity="0"/></radialGradient>
    <pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#d9c7b4"/><path d="M0 0h60M0 15h60M30 0v15M0 15v15M60 15v15" stroke="#c4ae97" stroke-width="2"/></pattern>
    <clipPath id="cut"><path d="M560 70 L1150 70 L1150 520 L940 520 L900 470 L860 540 L800 480 L740 560 L680 500 L620 560 L560 500 Z"/></clipPath>
  </defs>
  <rect width="1200" height="900" fill="url(#wall)"/>
  <rect y="0" width="1200" height="40" fill="#efe5d8"/>
  <!-- window -->
  <rect x="70" y="140" width="380" height="430" rx="10" fill="#e9dccb"/>
  <rect x="88" y="158" width="344" height="394" rx="6" fill="url(#sky)"/>
  <path d="M88 470 q80 -60 160 -20 t184 -30 V552 H88z" fill="#a9cfa0" opacity=".8"/>
  <path d="M260 158v394M88 355h344" stroke="#e9dccb" stroke-width="12"/>
  <path d="M60 130 q30 230 0 460" fill="none" stroke="#e8b48a" stroke-width="28" opacity=".7"/>
  <!-- wall cut-away showing conduit behind plaster -->
  <g clip-path="url(#cut)">
    <rect x="540" y="60" width="640" height="520" fill="url(#brick)"/>
    ${conduit('M640 600 V330 Q640 300 670 300 H860 Q890 300 890 270 V60', 22)}
    ${conduit('M1060 560 V420 Q1060 390 1030 390 H900 Q890 390 890 380 V300', 22)}
    <g fill="#d8dce1" stroke="#7d858f" stroke-width="2"><rect x="866" y="276" width="48" height="48" rx="6"/></g>
    <circle cx="890" cy="300" r="7" fill="#7d858f"/>
  </g>
  <path d="M560 70 L1150 70 L1150 520 L940 520 L900 470 L860 540 L800 480 L740 560 L680 500 L620 560 L560 500 Z" fill="none" stroke="#e7d9c6" stroke-width="10" stroke-linejoin="round"/>
  <!-- switchboard + socket -->
  <g transform="translate(418 -60)"><rect x="602" y="600" width="78" height="110" rx="10" fill="#fff" stroke="#d6cbbd" stroke-width="3"/>
    <rect x="618" y="616" width="18" height="30" rx="4" fill="#eceff3" stroke="#c9ced5"/><rect x="646" y="616" width="18" height="30" rx="4" fill="#eceff3" stroke="#c9ced5"/>
    <circle cx="641" cy="680" r="13" fill="#eceff3" stroke="#c9ced5"/><circle cx="636" cy="678" r="2.5" fill="#9aa2ac"/><circle cx="646" cy="678" r="2.5" fill="#9aa2ac"/><circle cx="641" cy="687" r="2.5" fill="#9aa2ac"/>
    <circle cx="672" cy="612" r="3" fill="#FF6B1A"/></g>
  <!-- pendant lamp -->
  <path d="M890 40 V160" stroke="#3b3b3b" stroke-width="3"/>
  <ellipse cx="890" cy="300" rx="260" ry="200" fill="url(#glow)" opacity=".55"/>
  <path d="M840 200 Q890 140 940 200 Z" fill="#1E2530"/><ellipse cx="890" cy="202" rx="52" ry="8" fill="#ffcf8a"/>
  <!-- floor & rug -->
  <rect y="760" width="1200" height="140" fill="url(#floor)"/>
  <path d="M0 760h1200" stroke="#8a6440" stroke-width="4"/>
  <ellipse cx="560" cy="840" rx="380" ry="42" fill="#efe1cf" opacity=".9"/>
  <!-- sofa -->
  <g>
    <rect x="200" y="610" width="560" height="120" rx="34" fill="#47607e"/>
    <rect x="230" y="560" width="500" height="110" rx="30" fill="#5a7596"/>
    <rect x="180" y="630" width="80" height="120" rx="30" fill="#3f5674"/><rect x="700" y="630" width="80" height="120" rx="30" fill="#3f5674"/>
    <rect x="260" y="590" width="120" height="70" rx="18" fill="#FF6B1A" opacity=".9"/><rect x="570" y="590" width="120" height="70" rx="18" fill="#e6eaf0"/>
    <path d="M230 750v22M730 750v22" stroke="#2c2c2c" stroke-width="8" stroke-linecap="round"/>
  </g>
  <!-- side table + plant -->
  <rect x="830" y="660" width="110" height="100" rx="10" fill="#c4935f"/>
  <path d="M885 660 q-50-80 -10 -150 q20 70 10 150 q10-90 60-120 q-10 80 -60 120" fill="#4f8a5b"/>
  <rect x="860" y="620" width="50" height="44" rx="8" fill="#e6eaf0"/>
  <!-- shelf -->
  <g transform="translate(0 80)"><rect x="980" y="600" width="150" height="80" rx="8" fill="#d8c3a8"/>
  <rect x="1000" y="560" width="22" height="40" fill="#1F8A4C" opacity=".75"/><rect x="1026" y="570" width="18" height="30" fill="#0B1F3A" opacity=".7"/><circle cx="1090" cy="582" r="18" fill="#FF6B1A" opacity=".7"/></g>
  `);
}

function factory() {
  const trusses = Array.from({ length: 7 }, (_, i) => {
    const x = 60 + i * 180;
    return `<path d="M${x} 40 L${x + 90} 150 L${x + 180} 40" fill="none" stroke="#2b4a78" stroke-width="5"/>`;
  }).join('');
  const lamps = [220, 520, 820, 1100].map((x) => `
    <path d="M${x} 150V200" stroke="#3a5684" stroke-width="3"/>
    <path d="M${x - 40} 230 L${x - 22} 200 H${x + 22} L${x + 40} 230Z" fill="#35517d"/>
    <path d="M${x - 40} 230 L${x - 160} 760 H${x + 160} L${x + 40} 230Z" fill="#ffd9a8" opacity=".06"/>
    <ellipse cx="${x}" cy="231" rx="38" ry="6" fill="#ffe3b8"/>`).join('');
  const machine = (x, w, h, accent) => `
    <g transform="translate(${x} ${760 - h})">
      <rect width="${w}" height="${h}" rx="10" fill="#1d3557"/>
      <rect x="10" y="10" width="${w - 20}" height="${h * 0.38}" rx="6" fill="#26456f"/>
      <rect x="20" y="22" width="${w * 0.35}" height="${h * 0.18}" rx="4" fill="#8fd1ff" opacity=".35"/>
      <circle cx="${w - 34}" cy="${h * 0.22}" r="8" fill="${accent}"/><circle cx="${w - 60}" cy="${h * 0.22}" r="8" fill="#1F8A4C"/>
      <rect x="0" y="${h - 16}" width="${w}" height="16" fill="#FF6B1A" opacity=".85"/>
      <path d="M0 ${h - 16} l16 16 M24 ${h - 16} l16 16 M48 ${h - 16} l16 16 M72 ${h - 16} l16 16" stroke="#0B1F3A" stroke-width="7"/>
    </g>`;
  return svg(1200, 900, 'Illustration of a factory interior with overhead PVC conduit runs feeding machines and panels', `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2445"/><stop offset=".75" stop-color="#0B1F3A"/><stop offset="1" stop-color="#081629"/></linearGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2635"/><stop offset="1" stop-color="#111923"/></linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <!-- back wall windows -->
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${80 + i * 185}" y="260" width="140" height="190" rx="4" fill="#16345d"/><path d="M${150 + i * 185} 260v190M${80 + i * 185} 355h140" stroke="#0e2747" stroke-width="6"/>`).join('')}
  ${trusses}
  <path d="M0 40H1200M0 150H1200" stroke="#2b4a78" stroke-width="7"/>
  ${lamps}
  <!-- overhead conduit runs -->
  ${conduit('M0 182 H1200', 16)}
  ${conduit('M0 206 H1200', 16)}
  ${conduit('M300 206 V470', 14)}${conduit('M700 182 V420', 14)}${conduit('M1000 206 V470', 14)}
  ${[300, 700, 1000].map((x, i) => `<rect x="${x - 18}" y="${i === 1 ? 164 : 188}" width="36" height="36" rx="5" fill="#d8dce1" stroke="#7d858f" stroke-width="2"/>`).join('')}
  <!-- electrical panel -->
  <g transform="translate(560 420)"><rect width="200" height="300" rx="8" fill="#c7cdd5"/><rect x="12" y="12" width="176" height="276" rx="4" fill="#dfe3e8"/>
    ${[0, 1, 2, 3].map((r) => `<rect x="28" y="${36 + r * 56}" width="144" height="34" rx="4" fill="#1E2530"/>${[0, 1, 2, 3, 4, 5].map((c) => `<rect x="${36 + c * 22}" y="${42 + r * 56}" width="14" height="22" rx="2" fill="${c === 0 ? '#FF6B1A' : '#f1f3f6'}"/>`).join('')}`).join('')}
    <path d="M100 0 V-40" stroke="#b9c0c8" stroke-width="12"/></g>
  <!-- flexible pipe drops to machines -->
  <g fill="none" stroke-linecap="round">
    <path d="M300 470 C300 520, 230 520, 230 560" stroke="#2d333b" stroke-width="14"/><path d="M300 470 C300 520, 230 520, 230 560" stroke="#7d858f" stroke-width="10" stroke-dasharray="3 3"/>
    <path d="M1000 470 C1000 520, 960 530, 960 580" stroke="#2d333b" stroke-width="14"/><path d="M1000 470 C1000 520, 960 530, 960 580" stroke="#7d858f" stroke-width="10" stroke-dasharray="3 3"/>
  </g>
  <rect y="760" width="1200" height="140" fill="url(#fl)"/>
  <path d="M0 800 H1200" stroke="#FFCC33" stroke-width="5" stroke-dasharray="40 26" opacity=".6"/>
  ${machine(90, 300, 200, '#FF6B1A')}
  ${machine(840, 280, 180, '#FFCC33')}
  <!-- conduit bundle on the floor (stock) -->
  ${[0, 1, 2].map((r) => Array.from({ length: 6 - r }, (_, i) => `<circle cx="${430 + i * 22 + r * 11}" cy="${750 - r * 19}" r="11" fill="#c9ced5" stroke="#7d858f" stroke-width="2"/><circle cx="${430 + i * 22 + r * 11}" cy="${750 - r * 19}" r="6" fill="#2a3038"/>`).join('')).join('')}
  `);
}

function galleryTile(label, w, h, hue) {
  return svg(w, h, `Placeholder for a factory photo: ${label}`, `
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="#0B1F3A"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"><path d="M0 ${h * 0.3}h${w * 0.4}l30 30h${w * 0.3}l30-30h${w}M${w * 0.2} ${h}v-${h * 0.3}l20-20v-${h * 0.2}M${w * 0.75} 0v${h * 0.35}l-20 20v${h * 0.2}"/></g>
  <g transform="translate(${w / 2} ${h / 2 - 20})" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linejoin="round">
    <rect x="-34" y="-24" width="68" height="50" rx="8"/><circle r="13" cy="1"/><path d="M-14 -24l6-10h16l6 10"/>
  </g>
  <text x="${w / 2}" y="${h / 2 + 40}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#fff">${label}</text>
  <text x="${w / 2}" y="${h / 2 + 66}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="14" fill="#fff" fill-opacity=".7">[Replace with a real factory photo]</text>`);
}


module.exports = {
  scenes: { home, factory },
  galleryTile,
};
