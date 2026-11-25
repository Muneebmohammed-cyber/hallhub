// Covers and line icons. Pure SVG, no external images.

const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// Neutral, architectural line drawings on tonal grounds.
const TONES = [
  { a: '#ECE8E1', b: '#DCD5CA', ink: '#7D7366', glow: '#FFFFFF' }, // stone
  { a: '#E4E7E1', b: '#CDD3CA', ink: '#68735F', glow: '#FFFFFF' }, // sage
  { a: '#262A31', b: '#363C46', ink: '#C8B68E', glow: '#C8B68E' }, // graphite
  { a: '#EFE8DD', b: '#E2D6C3', ink: '#957C5C', glow: '#FFFFFF' }, // sand
  { a: '#1D2129', b: '#2C323D', ink: '#B9A57C', glow: '#B9A57C' }, // night
];
const L = (d, ink, w = 1.4, o = 1) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
const arch = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h}`;

const SCENES = {
  auditorium(r, t) {
    let d = ''; const n = 7, w = 30, gap = 12, x0 = 200 - (n * w + (n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) d += L(arch(x0 + i * (w + gap), 66, w, 100), t.ink, 1.3, i === 3 ? 1 : 0.75);
    return d + L(`M${x0 - 20} 166 H${400 - x0 + 20}`, t.ink, 1.4) + L(`M${x0 - 20} 58 H${400 - x0 + 20}`, t.ink, 1, 0.6) + L(`M${x0 - 34} 176 H${400 - x0 + 34}`, t.ink, 1, 0.4);
  },
  convention(r, t) {
    let d = ''; for (let i = 0; i <= 12; i++) d += L(`M${80 + i * 20} 70 V166`, t.ink, 1, 0.55);
    for (let j = 0; j <= 4; j++) d += L(`M80 ${70 + j * 24} H320`, t.ink, 1, 0.55);
    return d + L('M60 70 L340 54', t.ink, 1.6) + L('M50 166 H350', t.ink, 1.4) + L('M176 166 V132 H224 V166', t.ink, 1.4);
  },
  'community-hall'(r, t) {
    let d = L(arch(170, 74, 60, 92), t.ink, 1.5) + L(arch(180, 84, 40, 82), t.ink, 1, 0.5);
    for (const x of [110, 136, 248, 274]) d += L(arch(x, 104, 16, 40), t.ink, 1.1, 0.7);
    return d + L('M96 166 H304', t.ink, 1.4) + L('M96 64 L200 40 L304 64', t.ink, 1.2, 0.8);
  },
  resort(r, t) {
    return `<circle cx="282" cy="72" r="22" fill="none" stroke="${t.ink}" stroke-width="1.2" opacity=".7"/>` + L('M30 150 Q200 128 370 150', t.ink, 1.3) +
      L('M130 150 V112 M270 150 V112 M118 112 H282', t.ink, 1.3) + L('M126 112 L200 86 L274 112', t.ink, 1.2) + L('M30 166 H370', t.ink, 1, 0.5);
  },
  backwater(r, t) {
    let d = `<circle cx="200" cy="96" r="26" fill="none" stroke="${t.ink}" stroke-width="1.2" opacity=".8"/>` + L('M20 128 H380', t.ink, 1.4);
    for (let i = 0; i < 6; i++) { const x = 60 + r() * 220; d += L(`M${x.toFixed(0)} ${140 + i * 8} h${(40 + r() * 80).toFixed(0)}`, t.ink, 1, 0.35 + r() * 0.3); }
    return d;
  },
  houseboat(r, t) {
    let d = L('M20 132 H380', t.ink, 1.2, 0.6) + L('M110 128 Q200 146 290 128', t.ink, 1.5) + L('M128 126 Q200 82 272 126', t.ink, 1.3);
    for (let i = 0; i < 5; i++) { const x = 70 + r() * 230; d += L(`M${x.toFixed(0)} ${146 + i * 7} h${(30 + r() * 60).toFixed(0)}`, t.ink, 1, 0.3 + r() * 0.3); }
    return d;
  },
  service(r, t) {
    let d = ''; for (let i = 0; i < 4; i++) d += `<circle cx="200" cy="104" r="${18 + i * 16}" fill="none" stroke="${t.ink}" stroke-width="1.1" opacity="${(0.85 - i * 0.18).toFixed(2)}"/>`;
    return d + L('M120 166 H280', t.ink, 1.2, 0.6);
  },
};

export function coverSVG(v) {
  const seed = hash(v.id || v.businessName);
  const r = rng(seed);
  const tn = TONES[seed % TONES.length];
  const kind = SCENES[v.category] ? v.category : 'service';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tn.a}"/><stop offset="1" stop-color="${tn.b}"/></linearGradient>
    <radialGradient id="g" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${tn.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${tn.glow}" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="200" fill="url(#s)"/><rect width="400" height="200" fill="url(#g)"/>${SCENES[kind](r, tn)}</svg>`;
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
