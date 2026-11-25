// Illustrated covers and line icons. Pure SVG, no external images.
// Each venue type gets its own scene; a seed from the listing id varies sky, lights and details.

const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

const SKIES = [
  ['#0F2A24', '#1F4A3F', '#C9A24E'], // backwater dusk
  ['#152238', '#2C3F5E', '#D9B566'], // monsoon night
  ['#2A1A2E', '#5B3448', '#E2B866'], // reception evening
  ['#10261F', '#2E5B4B', '#E9CF8F'], // early morning muhurtham
];

function stars(r, n, w, h) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h * 0.45).toFixed(1)}" r="${(r() * 0.9 + 0.3).toFixed(2)}" fill="#F6EBC8" opacity="${(r() * 0.6 + 0.2).toFixed(2)}"/>`;
  return s;
}
function lights(r, x0, x1, y, sag) {
  let s = `<path d="M${x0} ${y} Q${(x0 + x1) / 2} ${y + sag} ${x1} ${y}" stroke="#E7D3A1" stroke-width=".6" fill="none" opacity=".55"/>`;
  for (let i = 1; i < 14; i++) {
    const t = i / 14; const x = x0 + (x1 - x0) * t; const yy = y + sag * 4 * t * (1 - t) * 0.5 * 2;
    s += `<circle cx="${x.toFixed(1)}" cy="${(yy + 1.5).toFixed(1)}" r="1.4" fill="#FFE3A3"/><circle cx="${x.toFixed(1)}" cy="${(yy + 1.5).toFixed(1)}" r="4" fill="#FFE3A3" opacity=".18"/>`;
  }
  return s;
}
// Kerala sloped roof (with the small gable "mukhappu")
const keralaRoof = (x, y, w, h, c) => `<path d="M${x - 10} ${y + h} L${x + w * 0.18} ${y} L${x + w * 0.82} ${y} L${x + w + 10} ${y + h} Z" fill="${c}"/><path d="M${x + w * 0.42} ${y} L${x + w * 0.5} ${y - h * 0.55} L${x + w * 0.58} ${y} Z" fill="${c}"/>`;
const palm = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><path d="M0 0 Q4 -40 2 -78"/><path d="M2 -78 Q-22 -86 -38 -68M2 -78 Q-14 -96 -30 -100M2 -78 Q14 -98 34 -96M2 -78 Q26 -84 40 -64M2 -78 Q4 -100 8 -110"/></g>`;
const water = (y, w, r) => { let s = `<rect x="0" y="${y}" width="${w}" height="60" fill="#0B1F1B" opacity=".55"/>`; for (let i = 0; i < 9; i++) { const yy = y + 6 + i * 6; const x = r() * w * 0.7; s += `<path d="M${x.toFixed(0)} ${yy} h${(30 + r() * 60).toFixed(0)}" stroke="#E7D3A1" stroke-width=".7" opacity="${(0.15 + r() * 0.3).toFixed(2)}"/>`; } return s; };

const SCENES = {
  auditorium(r, W, H, brass) {
    const x = 70, y = 70, w = 260, h = 82;
    let arches = '';
    for (let i = 0; i < 7; i++) { const ax = x + 14 + i * 34; arches += `<path d="M${ax} ${y + h} V${y + 34} a12 12 0 0 1 24 0 V${y + h}" fill="#FFDFA0" opacity="${i === 3 ? 0.95 : 0.55 + r() * 0.3}"/>`; }
    return `${keralaRoof(x, y - 22, w, 24, '#0A1B17')}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#132E27"/>${arches}
      <rect x="${x + 112}" y="${y + 18}" width="36" height="${h - 18}" rx="18" fill="#FFE9B8"/><rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="6" fill="${brass}" opacity=".7"/>
      <rect x="${x - 20}" y="${y + h + 6}" width="${w + 40}" height="4" fill="${brass}" opacity=".35"/>${lights(r, x - 8, x + w + 8, y - 4, 16)}`;
  },
  convention(r, W, H, brass) {
    const x = 50, y = 62, w = 300, h = 92;
    let grid = '';
    for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) grid += `<rect x="${x + 8 + i * 24}" y="${y + 10 + j * 20}" width="18" height="14" fill="#FFE3A8" opacity="${(0.25 + r() * 0.7).toFixed(2)}"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#10261F"/>${grid}<path d="M${x - 14} ${y + 2} L${x + w + 14} ${y - 10} L${x + w + 14} ${y - 4} L${x - 14} ${y + 8} Z" fill="${brass}"/>
      <rect x="${x + 120}" y="${y + h - 30}" width="60" height="30" fill="#FFF1CC"/><rect x="0" y="${y + h}" width="${W}" height="4" fill="${brass}" opacity=".5"/>${palm(30, y + h, 0.7, '#0A1B17')}${palm(372, y + h, 0.8, '#0A1B17')}`;
  },
  'community-hall'(r, W, H, brass) {
    const x = 110, y = 86, w = 180, h = 66;
    let win = '';
    for (let i = 0; i < 5; i++) win += `<rect x="${x + 16 + i * 32}" y="${y + 20}" width="16" height="26" rx="8" fill="#FFDFA0" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
    return `${keralaRoof(x, y - 30, w, 32, '#0A1B17')}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#183A31"/>${win}<rect x="${x + 76}" y="${y + 30}" width="28" height="36" fill="#FFE9B8"/>
      <rect x="${x - 30}" y="${y + h}" width="${w + 60}" height="5" fill="${brass}" opacity=".55"/>${palm(64, y + h, 0.9, '#0A1B17')}${palm(340, y + h, 0.75, '#0A1B17')}`;
  },
  resort(r, W, H, brass) {
    return `<ellipse cx="200" cy="168" rx="240" ry="34" fill="#1F4A3F"/>${keralaRoof(150, 96, 100, 18, '#0A1B17')}<rect x="156" y="114" width="88" height="36" fill="#173A31"/>
      <rect x="172" y="120" width="20" height="30" fill="#FFE3A8"/><rect x="208" y="120" width="20" height="30" fill="#FFE3A8" opacity=".7"/>${palm(70, 160, 1.1, '#0A1B17')}${palm(110, 165, 0.8, '#0A1B17')}${palm(320, 162, 1.2, '#0A1B17')}${lights(r, 90, 310, 92, 22)}`;
  },
  backwater(r, W, H, brass) {
    return `${keralaRoof(240, 104, 110, 18, '#0A1B17')}<rect x="246" y="122" width="98" height="26" fill="#173A31"/><rect x="262" y="128" width="64" height="14" fill="#FFE3A8" opacity=".85"/>
      ${palm(60, 150, 1.15, '#0A1B17')}${palm(110, 150, 0.85, '#0A1B17')}${palm(200, 150, 1, '#0A1B17')}${water(148, W, r)}
      <rect x="262" y="152" width="64" height="10" fill="#FFE3A8" opacity=".18"/>`;
  },
  houseboat(r, W, H, brass) {
    return `${palm(40, 140, 1, '#0A1B17')}${palm(360, 140, 0.9, '#0A1B17')}${water(140, W, r)}
      <path d="M90 142 Q200 160 312 142 L300 132 Q200 146 102 132 Z" fill="#0A1B17"/>
      <path d="M118 132 Q200 92 284 132 Z" fill="#2B4B3E"/><path d="M118 132 Q200 92 284 132" stroke="${brass}" stroke-width="1.2" fill="none"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${140 + i * 26}" y="118" width="14" height="10" rx="2" fill="#FFE3A8" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`).join('')}`;
  },
  service(r, W, H, brass) {
    // brass nilavilakku lamp
    const flames = [-34, -17, 0, 17, 34].map((dx) => `<path d="M${200 + dx} 62 q-5 -10 0 -20 q5 10 0 20Z" fill="#FFD78A"/><circle cx="${200 + dx}" cy="52" r="12" fill="#FFD78A" opacity=".18"/>`).join('');
    return `${flames}<path d="M160 64 Q200 82 240 64 Z" fill="${brass}"/><rect x="196" y="72" width="8" height="70" fill="${brass}"/><ellipse cx="200" cy="104" rx="18" ry="4" fill="${brass}"/>
      <path d="M176 150 Q200 132 224 150 Z" fill="${brass}"/><rect x="168" y="150" width="64" height="6" rx="3" fill="${brass}"/>`;
  },
};

export function coverSVG(v) {
  const seed = hash(v.id || v.businessName);
  const r = rng(seed);
  const [a, b, glow] = SKIES[seed % SKIES.length];
  const W = 400, H = 200;
  const kind = SCENES[v.category] ? v.category : (['venue'].includes(v.category) ? 'auditorium' : 'service');
  const moonX = 40 + r() * 320;
  const body = SCENES[kind](r, W, H, '#C9A24E');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".75" stop-color="${b}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="g" cx=".5" cy=".9" r=".7"><stop offset="0" stop-color="${glow}" stop-opacity=".45"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/><rect width="${W}" height="${H}" fill="url(#g)"/>${stars(r, 26, W, H)}
    <circle cx="${moonX.toFixed(0)}" cy="34" r="9" fill="#F6EBC8" opacity=".85"/><circle cx="${(moonX + 4).toFixed(0)}" cy="31" r="8" fill="${a}" opacity=".9"/>
    ${body}<rect y="${H - 22}" width="${W}" height="22" fill="#081814" opacity=".5"/></svg>`;
}
export const coverURL = (v) => `url('data:image/svg+xml;utf8,${encodeURIComponent(coverSVG(v)).replace(/'/g, '%27')}')`;

// ---------- line icons (24px, 1.6 stroke) ----------
const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  events: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9.5 15 2 2 3.5-3.5"/>',
  bookings: '<path d="M6 3.5h9l3.5 3.5V20.5H6z"/><path d="M15 3.5V7h3.5M9 12h6M9 15.5h6"/>',
  profile: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>',
  dashboard: '<rect x="3.5" y="3.5" width="7" height="9" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/>',
  enquiries: '<path d="M4 5.5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r=".9" fill="currentColor"/><circle cx="12" cy="14" r=".9" fill="currentColor"/><circle cx="15.5" cy="14" r=".9" fill="currentColor"/>',
  venue: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 9.5v10M19 9.5v10M9 19.5v-6a3 3 0 0 1 6 0v6M3 19.5h18"/>',
  services: '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  venues: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 9.5v10M19 9.5v10M9 19.5v-6a3 3 0 0 1 6 0v6M3 19.5h18"/>',
  customers: '<circle cx="9" cy="9" r="3.5"/><path d="M2.5 19.5c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17" cy="8" r="2.8"/><path d="M16.5 13.2c2.6.2 4.3 1.9 5 4.8"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  seat: '<path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><path d="M4 11h16v4H4zM6 15v5M18 15v5"/>',
  dine: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2.5 5-2.5 8H17v10"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 16v3h3v-3M17 16v3h3v-3M4 12h16"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
};
export const icon = (name, size = 22) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.home}</svg>`;
