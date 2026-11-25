import { db, auth } from './store.js';
import { DEMO_MODE } from './config.js';
import { DISTRICTS, CATEGORIES, CATEGORY_GROUPS, EVENT_TYPES, TRADITIONS, SEED_REVIEWS, catById, districtById, buildSeedVendors, buildSeedBookings, buildRealHalls, CORRIDORS, isVenue, SLOTS, slotById, halvesOf, slotFree, AC_TYPES, CATERING_RULES, AMENITIES } from './data.js';
import { t, getLang, setLang, nameOf } from './i18n.js';
import { coverURL, icon } from './art.js';
const NAV_ICON = { home: 'home', explore: 'search', events: 'events', bookings: 'bookings', profile: 'profile', dashboard: 'dashboard', enquiries: 'enquiries', calendar: 'calendar', services: 'services', venue: 'venue', venues: 'venues', Customers: 'customers' };

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const today = () => new Date().toISOString().slice(0, 10);
const distName = (id) => { const d = districtById(id); return d ? nameOf(d) : ''; };
const catName = (id) => catById(id)?.en || id;
function toast(msg) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }
const go = (h) => { location.hash = h; };
const formData = (form) => Object.fromEntries(new FormData(form).entries());

async function compressImage(file, max = 900, q = 0.72) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  URL.revokeObjectURL(url);
  return cv.toDataURL('image/jpeg', q);
}

// ---------- session ----------
const S = { user: null, profile: null, vendor: null, ready: false };
const role = () => S.profile?.role || 'guest';

async function loadSession(u) {
  S.user = u; S.profile = null; S.vendor = null;
  if (u) {
    let p = await db.get('users', u.uid);
    if (!p) {
      p = { name: u.name || '', phone: u.phone || '', email: u.email || '', role: 'customer', lang: getLang(), favourites: [], createdAt: Date.now() };
      await db.set('users', u.uid, p); p.id = u.uid;
    }
    S.profile = p;
    if (p.role === 'vendor') S.vendor = await db.get('vendors', u.uid);
  }
  S.ready = true;
  render();
}

// ---------- shell ----------
const NAV = {
  guest: [['#/', 'home', '🏠'], ['#/explore', 'explore', '🔍'], ['#/events', 'events', '💍'], ['#/bookings', 'bookings', '📒'], ['#/profile', 'profile', '👤']],
  customer: [['#/', 'home', '🏠'], ['#/explore', 'explore', '🔍'], ['#/events', 'events', '💍'], ['#/bookings', 'bookings', '📒'], ['#/profile', 'profile', '👤']],
  vendor: [['#/vendor', 'dashboard', '📊'], ['#/vendor/enquiries', 'enquiries', '✉️'], ['#/vendor/calendar', 'calendar', '📅'], ['#/vendor/services', 'services', '🧾'], ['#/profile', 'profile', '👤']],
  admin: [['#/admin', 'dashboard', '📊'], ['#/admin/vendors', 'venues', '🏛️'], ['#/admin/customers', 'Customers', '👥'], ['#/admin/enquiries', 'enquiries', '✉️'], ['#/profile', 'profile', '👤']],
};

function shell(inner) {
  let nav = NAV[role()] || NAV.guest;
  if (role() === 'vendor' && isVenue(S.vendor)) nav = nav.map((n) => (n[1] === 'services' ? [n[0], 'venue', '🏛️'] : n));
  const path = location.hash.split('?')[0] || '#/';
  const active = (h) => (h === '#/' ? path === '#/' || path === '' : path === h || (path.startsWith(h + '/') && !nav.some(([x]) => x !== h && path.startsWith(x) && x.length > h.length)));
  return `
  ${DEMO_MODE ? `<div class="demo-banner">${t('demoBanner')}</div>` : ''}
  <header class="topbar"><div class="wrap">
    <a class="brand" href="#/">Hall<span>Hub</span></a>
    <div class="row">
      <button class="lang-toggle" data-act="lang">${getLang() === 'en' ? 'മലയാളം' : 'English'}</button>
      ${S.user ? '' : `<a class="btn sm" href="#/login">${t('login')}</a>`}
    </div>
  </div></header>
  <main id="view">${inner}</main>
  <nav class="bottomnav">${nav.map(([h, k, ic]) => `<a href="${h}" class="${active(h) ? 'on' : ''}"><span class="ic">${icon(NAV_ICON[k] || 'home')}</span>${t(k)}</a>`).join('')}</nav>`;
}

// ---------- shared components ----------
function coverStyle(v) {
  if (v.portfolio?.[0]) return `background-image:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.45)),url('${v.portfolio[0]}')`;
  return `background-image:${coverURL(v)}`;
}
// ---------- slots & calendar ----------
const slotName = (id) => { const x = slotById(id); return x ? nameOf(x) : id; };
const slotLabel = (id) => { const x = slotById(id); return x ? `${nameOf(x)} (${x.time})` : id; };
function takenMap(rows) { const m = {}; rows.forEach((r) => { (m[r.date] = m[r.date] || []).push(r.half); }); return m; }
async function venueSlots(venueId) { return db.list('slots', ['venueId', venueId]); }
function calendarHTML(ym, taken, { selected = '', pickable = true } = {}) {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1); const days = new Date(y, m, 0).getDate();
  const lead = (first.getDay() + 6) % 7; const tdy = today();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<div></div>');
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const tk = taken[ds] || []; const past = ds < tdy;
    const cls = past ? 'past' : tk.length >= 2 ? 'd-full' : tk.length === 1 ? 'd-half' : 'd-free';
    const dots = `<i class="${tk.includes('morning') ? 'x' : ''}"></i><i class="${tk.includes('evening') ? 'x' : ''}"></i>`;
    cells.push(`<button type="button" class="day ${cls} ${ds === selected ? 'sel' : ''}" ${past || !pickable ? 'disabled' : ''} data-day="${ds}">${d}<span>${past ? '' : dots}</span></button>`);
  }
  const title = first.toLocaleDateString(getLang() === 'ml' ? 'ml-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  return `<div class="cal"><div class="row between cal-head"><button type="button" class="btn sm ghost" data-cal="-1">‹</button><b>${title}</b><button type="button" class="btn sm ghost" data-cal="1">›</button></div>
    <div class="cal-grid">${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((x) => `<div class="dow">${x}</div>`).join('')}${cells.join('')}</div>
    <div class="row wrap-x small muted cal-key"><span><i class="k k-free"></i>${t('available')}</span><span><i class="k k-half"></i>Half booked</span><span><i class="k k-full"></i>${t('booked')}</span><span>Dots: morning · evening</span></div></div>`;
}
const addMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
function venueFacts(v) {
  return `<div class="facts"><div><b>${(v.seating || 0).toLocaleString('en-IN')}</b><span>${t('seating')}</span></div><div><b>${(v.dining || 0).toLocaleString('en-IN')}</b><span>${t('dining')}</span></div><div><b>${v.parking || 0}</b><span>${t('parking')}</span></div></div>`;
}

const unclaimed = (v) => v?.isReal && !v.claimed;
function vendorCard(v, avail) {
  const cat = catById(v.category);
  return `<a class="vcard" href="#/v/${v.id}">
    <div class="cover" style="${coverStyle(v)}">${v.portfolio?.[0] ? '' : `<div class="pattern"></div><div class="glyph">${cat?.icon || '✨'}</div>`}
      <div class="row wrap-x">${v.verified ? `<span class="badge">✔ ${t('verified')}</span>` : ''}${v.featured ? '<span class="badge gold">★ Featured</span>' : ''}${v.isDemo ? '<span class="badge demo">Demo</span>' : ''}${unclaimed(v) ? '<span class="badge">📍 Not on HallHub yet</span>' : ''}</div>
    </div>
    <div class="vbody">
      <div class="vname">${esc(v.businessName)}</div>
      <div class="vmeta">${esc(catName(v.category))} · ${esc(v.town)}, ${esc(distName(v.district))}</div>
      ${unclaimed(v) ? `<div class="small muted">${esc(v.address)}</div><div class="small muted">Capacity, rent and free dates not listed yet</div>` : isVenue(v) ? `${venueFacts(v)}<div class="small muted">${esc(v.ac || '')} · ${esc(v.catering || '')}</div>` : `<div class="small muted">${esc((v.description || '').slice(0, 90))}…</div>`}
      ${avail ? `<div class="small" style="font-weight:700;color:${avail.ok ? 'var(--ok)' : 'var(--bad)'}">${avail.ok ? '✔ ' + t('available') : '✕ ' + t('booked')} · ${esc(avail.label)}</div>` : ''}
      <div class="row between" style="margin-top:auto;padding-top:6px">
        ${v.startingPrice ? `<span class="small">${t('startingAt')} <span class="price">${money(v.startingPrice)}</span>${esc(v.priceUnit || '')}</span>` : '<span class="small muted">Price on request</span>'}
        ${v.reviewCount ? `<span class="stars">★ ${Number(v.rating || 0).toFixed(1)} <span class="muted small">(${v.reviewCount})</span></span>` : ''}
      </div>
      ${v.offer ? `<div class="small" style="color:var(--ok);font-weight:600">🎁 ${esc(v.offer)}</div>` : ''}
    </div></a>`;
}
const STEPS = ['enquiry', 'quoted', 'negotiation', 'confirmed'];
const STEP_LABELS = ['Enquiry sent', 'Quotation received', 'Negotiation', 'Booking confirmed', 'Advance paid', 'Event completed', 'Review pending'];
function statusBadge(s) {
  const cls = { confirmed: 'ok', declined: 'bad', closed: 'bad', negotiation: 'warn', quoted: 'gold', enquiry: '' }[s] ?? '';
  return `<span class="badge ${cls}" style="border:1px solid var(--line)">${t('status_' + s)}</span>`;
}
function timeline(status) {
  const idx = status === 'confirmed' ? 3 : status === 'negotiation' ? 2 : status === 'quoted' ? 1 : 0;
  return `<div class="timeline">${STEP_LABELS.map((l, i) => `<div class="${i <= idx && !['declined', 'closed'].includes(status) ? 'on' : ''}" title="${l}"></div>`).join('')}</div>
  <div class="small muted">${STEP_LABELS[idx]} · next: ${STEP_LABELS[idx + 1] || '—'}${idx >= 3 ? ' (online advance payment arrives in Phase 2)' : ''}</div>`;
}
function needLogin() {
  return `<div class="wrap"><div class="card login-box center stack"><h2>Sign in to continue</h2><p class="muted">Your events, enquiries and quotations are saved to your account.</p><a class="btn block" href="#/login?next=${encodeURIComponent(location.hash)}">${t('login')}</a></div></div>`;
}

// ---------- vendor cache ----------
let vendorCache = null;
async function approvedVendors(force) {
  if (!vendorCache || force) vendorCache = await db.list('vendors', ['status', 'approved']);
  return vendorCache;
}

// =====================================================================
// CUSTOMER VIEWS
// =====================================================================
const DESTINATIONS = [
  ['Kumarakom backwaters', 'ktm', '', '', 'backwater'], ['Munnar hills', 'idk', '', '', 'resort'],
  ['Alappuzha houseboats', 'alp', '', '', 'houseboat'], ['Kovalam beach', 'tvm', '', '', 'resort'],
  ['Bekal fort', 'ksd', '', '', 'convention'], ['Wayanad forests', 'wyd', '', '', 'resort'],
];

async function viewHome() {
  const vs = await approvedVendors();
  const venues = vs.filter(isVenue);
  const featured = venues.filter((v) => v.featured).slice(0, 8);
  const recent = [...venues].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const offers = venues.filter((v) => v.offer).slice(0, 4);
  const services = vs.filter((v) => !isVenue(v)).slice(0, 8);
  const corridor = vs.filter((v) => v.corridor === 'chavakkad-ponnani');
  const types = CATEGORIES.filter((c) => c.group === 'venues');
  return {
    html: `
    <section class="hero" style="background-image:${coverURL({ id: 'hero-3', category: 'auditorium' })}"><div class="wrap">
      <p class="lede-top">${S.profile?.name ? t('welcome') + ', ' + esc(S.profile.name) : 'All 14 districts, one calendar'}</p>
      <h1>${t('tagline')}</h1>
      <p>See which halls are free on your date — morning, evening or full day — across all 14 districts.</p>
      <form class="search" id="homeSearch">
        <select name="district"><option value="">${t('allDistricts')}</option>${DISTRICTS.map((d) => `<option value="${d.id}">${nameOf(d)}</option>`).join('')}</select>
        <input type="date" name="date" min="${today()}" aria-label="${t('date')}">
        <select name="slot">${SLOTS.map((x) => `<option value="${x.id}">${nameOf(x)}</option>`).join('')}</select>
        <input type="number" name="guests" min="1" placeholder="${t('guests')}">
        <button class="btn">${t('checkAvail')}</button>
      </form>
    </div></section>
    <div class="wrap">
      <section class="section">
        <div class="section-head"><h2>${t('venues')}</h2></div>
        <div class="cat-grid">${types.map((c) => `<a class="cat" href="#/explore?cat=${c.id}" style="background-image:${coverURL({ id: 'cat-' + c.id, category: c.id })}">${esc(c.en)}</a>`).join('')}</div>
      </section>
      ${corridor.length ? `<section class="section"><div class="section-head"><h2>Chavakkad – Ponnani highway</h2><a href="#/explore?corridor=chavakkad-ponnani">${t('viewAll')} (${corridor.length})</a></div>
        <p class="small muted" style="margin:-4px 0 10px">Real auditoriums along NH66 and the Guruvayur–Ponnani road, from Blangad to Ponnani.</p>
        <div class="grid">${corridor.slice(0, 4).map((v) => vendorCard(v)).join('')}</div></section>` : ''}
      <section class="section"><div class="section-head"><h2>${t('featured')}</h2><a href="#/explore?sort=popular">${t('viewAll')}</a></div>
        <div class="grid">${featured.map((v) => vendorCard(v)).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>${t('destinations')}</h2></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${DESTINATIONS.map(([n, d, a, b, kind]) => `<a class="dest" href="#/explore?district=${d}" style="background-image:${coverURL({ id: 'dest-' + n, category: kind })}"><b>${n}</b><span class="small">${distName(d)}</span></a>`).join('')}</div></section>
      ${offers.length ? `<section class="section"><div class="section-head"><h2>Special offers</h2></div><div class="grid">${offers.map((v) => vendorCard(v)).join('')}</div></section>` : ''}
      <section class="section"><div class="section-head"><h2>${t('recent')}</h2></div><div class="grid">${recent.map((v) => vendorCard(v)).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>${t('addons')}</h2><a href="#/explore?kind=services">${t('viewAll')}</a></div>
        <div class="chips">${CATEGORIES.filter((c) => c.group !== 'venues').map((c) => `<a class="chip" href="#/explore?cat=${c.id}">${c.icon} ${esc(c.en)}</a>`).join('')}</div>
        <div class="grid" style="margin-top:10px">${services.slice(0, 4).map((v) => vendorCard(v)).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>${t('reviewsTitle')}</h2></div>
        <div class="grid">${SEED_REVIEWS.map((r) => `<div class="card"><div class="stars">${'★'.repeat(r.rating)}</div><p style="font-family:var(--serif);font-size:1.15rem;margin:.4em 0">“${esc(r.text)}”</p><div class="small muted">${esc(r.name)} · ${esc(r.district)} <span class="badge demo">Demo</span></div></div>`).join('')}</div></section>
      <section class="section card center stack"><h2>Own an auditorium or hall?</h2><p class="muted">List it free, manage your booking calendar and send quotations from one dashboard.</p><a class="btn gold" href="#/vendor/register">List your venue</a></section>
    </div>`,
    mount() {
      $('#homeSearch').onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); go('#/explore?' + new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString()); };
    },
  };
}

async function viewExplore(params) {
  const vs = await approvedVendors();
  const p = Object.fromEntries(params);
  const services = p.kind === 'services' || (p.cat && !isVenue({ category: p.cat }));
  const sel = (name, opts, cur, all) => `<select name="${name}"><option value="">${all}</option>${opts.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const towns = p.district ? districtById(p.district)?.towns || [] : [];
  const q = (p.q || '').toLowerCase().trim();
  const slot = p.slot || 'full';
  const dayRows = p.date ? await db.list('slots', ['date', p.date]) : [];
  const venueTaken = (id) => dayRows.filter((r) => r.venueId === id).map((r) => r.half);
  let rows = vs.filter((v) => {
    if (services ? isVenue(v) : !isVenue(v)) return false;
    if (q && !(`${v.businessName} ${catName(v.category)} ${v.town} ${v.description}`.toLowerCase().includes(q))) return false;
    if (p.cat && v.category !== p.cat) return false;
    if (p.corridor && v.corridor !== p.corridor) return false;
    if (unclaimed(v) && (p.guests || p.ac || p.catering || p.parking || p.max || p.rating)) return false;
    if (unclaimed(v) && p.date) return false;
    if (p.district && v.district !== p.district && !(v.serviceDistricts || []).includes(p.district)) return false;
    if (p.town && v.town !== p.town) return false;
    if (p.max && Number(v.startingPrice) > Number(p.max)) return false;
    if (p.rating && Number(v.rating) < Number(p.rating)) return false;
    if (p.verified && !v.verified) return false;
    if (p.guests && isVenue(v) && Number(v.seating) < Number(p.guests)) return false;
    if (p.ac && v.ac !== p.ac) return false;
    if (p.catering && v.catering !== p.catering && v.catering !== 'In-house or outside') return false;
    if (p.parking && Number(v.parking || 0) < Number(p.parking)) return false;
    if (p.date && !isVenue(v) && (v.blockedDates || []).includes(p.date)) return false;
    if (p.date && isVenue(v) && p.onlyFree !== '0' && !slotFree(venueTaken(v.id), slot)) return false;
    return true;
  });
  const priceOf = (v) => (isVenue(v) && v.slotPrices ? v.slotPrices[slot] || v.startingPrice : v.startingPrice);
  const sorts = { popular: (a, b) => (b.reviewCount + b.views / 10) - (a.reviewCount + a.views / 10), price_asc: (a, b) => priceOf(a) - priceOf(b), price_desc: (a, b) => priceOf(b) - priceOf(a), rating: (a, b) => b.rating - a.rating, capacity: (a, b) => (b.seating || 0) - (a.seating || 0) };
  rows.sort(sorts[p.sort] || ((a, b) => (b.featured - a.featured) || (b.rating - a.rating)));
  const cats = CATEGORIES.filter((c) => (services ? c.group !== 'venues' : c.group === 'venues'));
  const hiddenUnknown = p.date && !services ? vs.filter((v) => unclaimed(v) && (!p.district || v.district === p.district) && (!p.corridor || v.corridor === p.corridor) && (!p.town || v.town === p.town)).length : 0;
  const card = (v) => vendorCard(v, p.date && isVenue(v) ? { ok: slotFree(venueTaken(v.id), slot), label: `${fmtDate(p.date)} · ${slotName(slot)} · ${money(priceOf(v))}` } : null);
  return {
    html: `<div class="wrap" style="padding-top:16px">
      <div class="tabs"><a class="chip ${services ? '' : 'on'}" href="#/explore">${t('venues')}</a><a class="chip ${services ? 'on' : ''}" href="#/explore?kind=services">Other services</a></div>
      <h1>${p.corridor ? esc(CORRIDORS[p.corridor]) : p.cat ? esc(catName(p.cat)) : services ? 'Event services' : 'Auditoriums & halls'}</h1>
      <form id="flt" class="filters">
        ${services ? '<input type="hidden" name="kind" value="services">' : ''}${p.corridor ? `<input type="hidden" name="corridor" value="${esc(p.corridor)}">` : ''}
        <input name="q" placeholder="${t('searchPh')}" value="${esc(p.q || '')}" class="full">
        ${sel('cat', cats.map((c) => [c.id, c.en]), p.cat, services ? 'All services' : 'All venue types')}
        ${sel('district', DISTRICTS.map((d) => [d.id, nameOf(d)]), p.district, t('allDistricts'))}
        ${sel('town', towns.map((x) => [x, x]), p.town, 'All towns')}
        <input type="date" name="date" min="${today()}" value="${esc(p.date || '')}" title="${t('date')}">
        ${services ? '' : `<select name="slot">${SLOTS.map((x) => `<option value="${x.id}" ${x.id === slot ? 'selected' : ''}>${nameOf(x)}</option>`).join('')}</select>
        <input type="number" name="guests" min="1" placeholder="${t('guests')}" value="${esc(p.guests || '')}">
        ${sel('ac', AC_TYPES.map((x) => [x, x]), p.ac, 'AC or non-AC')}
        ${sel('catering', [['Outside caterers allowed', 'Outside caterers allowed'], ['In-house catering only', 'In-house catering']], p.catering, 'Any catering rule')}
        ${sel('parking', [['50', '50+ cars'], ['150', '150+ cars'], ['300', '300+ cars']], p.parking, 'Any parking')}`}
        ${sel('max', services ? [['10000', 'Under ₹10,000'], ['50000', 'Under ₹50,000']] : [['25000', 'Under ₹25,000 / slot'], ['50000', 'Under ₹50,000 / slot'], ['100000', 'Under ₹1 lakh / slot'], ['200000', 'Under ₹2 lakh / slot']], p.max, 'Any price')}
        ${sel('rating', [['4.5', '4.5★ & up'], ['4', '4★ & up']], p.rating, 'Any rating')}
        ${sel('sort', [['popular', 'Most popular'], ['rating', 'Top rated'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ...(services ? [] : [['capacity', 'Largest capacity']])], p.sort, 'Recommended')}
        <label class="row" style="margin:0;font-weight:600;color:var(--ink)"><input type="checkbox" name="verified" value="1" ${p.verified ? 'checked' : ''} style="width:auto"> Verified only</label>
      </form>
      <p class="muted small">${rows.length} ${services ? 'service' : 'venue'}${rows.length === 1 ? '' : 's'}${p.date && !services ? ` free on ${fmtDate(p.date)} · ${slotLabel(slot)}` : ''}</p>
      <div class="grid">${rows.map(card).join('') || `<div class="empty full">${t('noResults')}${p.date ? ' Try another date or slot.' : ''}</div>`}</div>
      ${hiddenUnknown ? `<div class="card small muted" style="margin-top:14px">${hiddenUnknown} more hall${hiddenUnknown === 1 ? '' : 's'} in this area haven't joined HallHub yet, so their availability is unknown. <a href="#/explore?${new URLSearchParams(Object.entries(p).filter(([k]) => !['date', 'slot', 'guests'].includes(k))).toString()}">Show them</a></div>` : ''}
    </div>`,
    mount() {
      const f = $('#flt');
      const apply = () => { const d = formData(f); if (d.district !== (p.district || '')) d.town = ''; go('#/explore?' + new URLSearchParams(Object.entries(d).filter(([, v]) => v)).toString()); };
      f.onchange = apply; f.onsubmit = (e) => { e.preventDefault(); apply(); };
    },
  };
}

async function viewVendor(id) {
  const v = await db.get('vendors', id);
  if (!v || (v.status !== 'approved' && role() !== 'admin' && S.user?.uid !== v.ownerId)) return { html: `<div class="wrap empty">Vendor not found.</div>` };
  if (unclaimed(v)) {
    return {
      html: `<div class="cover venue-hero" style="${coverStyle(v)}"><div class="pattern"></div><div class="glyph" style="font-size:3.4rem">${catById(v.category)?.icon || '🏛️'}</div><div class="row wrap-x"><span class="badge">📍 Not on HallHub yet</span></div></div>
      <div class="wrap stack" style="padding-top:16px">
        <div><h1 style="margin:0">${esc(v.businessName)}</h1><div class="muted">${esc(catName(v.category))} · ${esc(v.town)}, ${esc(distName(v.district))}</div></div>
        <div class="card stack"><p style="margin:0">${esc(v.description)}</p>
          <div class="row wrap-x"><a class="btn" target="_blank" rel="noopener" href="${esc(v.mapsUrl)}">Open in Google Maps</a><a class="btn ghost" href="#/explore?corridor=${esc(v.corridor || '')}&district=${v.district}">Similar halls nearby</a></div>
          <p class="small muted" style="margin:0">Google Maps shows the hall's phone number, photos and reviews.</p></div>
        <div class="card"><h3>Address</h3><p class="small" style="margin:0">${esc(v.address)}</p></div>
        <div class="card stack" style="background:#fdf6e6;border-color:var(--gold-soft)"><h3 style="margin:0">Own or manage this hall?</h3>
          <p class="small" style="margin:0">Claim it for free to add your capacity, rent per slot and photos, manage your booking calendar and get booking requests.</p>
          <a class="btn gold" href="#/vendor/register?claim=${id}">Claim this listing</a></div>
        ${role() === 'admin' ? `<p class="small muted">Place ID: ${esc(v.placeId)}</p>` : ''}
      </div>`,
    };
  }
  if (S.user && S.user.uid !== v.ownerId) db.update('vendors', id, { views: (v.views || 0) + 1 }).catch(() => {});
  const fav = (S.profile?.favourites || []).includes(id);
  const venue = isVenue(v);
  const taken = venue ? takenMap(await venueSlots(id)) : {};
  let ym = today().slice(0, 7); let pickDate = ''; let pickSlot = '';
  const wa = v.whatsapp ? `https://wa.me/${v.whatsapp}?text=${encodeURIComponent(`Hi ${v.businessName}, I found you on HallHub and would like to enquire about your services.`)}` : '';
  return {
    html: `
    <div class="cover venue-hero" style="${coverStyle(v)}">${v.portfolio?.[0] ? '' : `<div class="pattern"></div><div class="glyph" style="font-size:3.4rem">${catById(v.category)?.icon || '✨'}</div>`}
      <div class="row wrap-x">${v.verified ? `<span class="badge">✔ ${t('verified')}</span>` : '<span class="badge warn">Not yet verified</span>'}${v.isDemo ? '<span class="badge demo">Demo data</span>' : ''}${v.status !== 'approved' ? `<span class="badge bad">${esc(v.status)}</span>` : ''}</div></div>
    <div class="wrap stack" style="padding-top:16px">
      <div class="row between" style="align-items:flex-start">
        <div><h1 style="margin:0">${esc(v.businessName)}</h1>
        <div class="muted">${esc(catName(v.category))} · ${esc(v.town)}, ${esc(distName(v.district))}</div>
        <div class="stars" style="margin-top:4px">★ ${Number(v.rating || 0).toFixed(1)} <span class="muted small">· ${v.reviewCount || 0} reviews</span></div></div>
        <button class="btn ghost sm" data-act="fav" data-id="${id}">${fav ? '♥ Saved' : '♡ Save'}</button>
      </div>
      <div class="card row between wrap-x"><div><div class="small muted">${t('startingAt')}</div><div class="price" style="font-size:1.4rem">${money(v.startingPrice)}<span class="small muted">${esc(v.priceUnit || '')}</span></div></div>
        <div class="row wrap-x"><a class="btn" href="${venue ? '#cal' : '#/enquire/' + id}" ${venue ? 'data-act="toCal"' : ''}>${venue ? t('checkAvail') : t('requestQuote')}</a>${wa ? `<a class="btn green" target="_blank" rel="noopener" href="${wa}">${t('whatsapp')}</a>` : ''}${v.phone ? `<a class="btn ghost" href="tel:${esc(v.phone.replace(/\s/g, ''))}">Call</a>` : ''}</div></div>
      ${v.offer ? `<div class="card" style="background:#eef7f0;border-color:#cfe6d6">🎁 <b>Offer:</b> ${esc(v.offer)}</div>` : ''}
      <div class="card"><h3>${t('about')}</h3><p style="margin:0">${esc(v.description)}</p>
        ${v.traditions?.length ? `<p class="small muted" style="margin:.6em 0 0">Experienced with: ${v.traditions.map(esc).join(', ')} ceremonies</p>` : ''}</div>
      ${venue ? `<div class="card stack"><h3 style="margin:0">Capacity & facilities</h3>${venueFacts(v).replace('class="facts"', 'class="facts big"')}
        <table class="cmp"><tr><td>Hall type</td><td>${esc(catName(v.category))}</td></tr><tr><td>Air-conditioning</td><td>${esc(v.ac)}</td></tr><tr><td>Catering</td><td>${esc(v.catering)}</td></tr><tr><td>Bridal / green rooms</td><td>${v.rooms || 0}</td></tr></table>
        <div class="amen">${(v.amenities || []).map((a) => `<span>✓ ${esc(a)}</span>`).join('')}</div></div>
      <div class="card"><h3>Hall rent</h3><table class="cmp">${SLOTS.map((x) => `<tr><td>${nameOf(x)} <span class="small muted">${x.time}</span></td><td class="price">${v.slotPrices?.[x.id] ? money(v.slotPrices[x.id]) : '—'}</td></tr>`).join('')}</table>
        <p class="small muted" style="margin:.6em 0 0">Rent for the hall only. Catering, decoration and electricity beyond the slot are quoted separately.</p></div>
      <div class="card stack" id="cal"><h3 style="margin:0">${t('checkAvail')}</h3><div id="calBox"></div><div id="slotBox"></div></div>` : ''}
      ${venue ? '' : `<div><h2>${t('packages')}</h2><div class="grid">${(v.packages || []).map((k) => `<div class="pkg"><div class="row between"><h3 style="margin:0">${esc(k.name)}</h3><span class="price">${money(k.price)}<span class="small muted">${esc(k.unit || '')}</span></span></div><ul>${(k.inclusions || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><a class="btn sm ghost" style="margin-top:10px" href="#/enquire/${id}?pkg=${k.id}">Enquire for this package</a></div>`).join('') || '<p class="muted">No packages yet — request a custom quotation.</p>'}</div></div>`}
      ${v.portfolio?.length ? `<div><h2>Portfolio</h2><div class="gallery">${v.portfolio.map((src) => `<img src="${src}" alt="Portfolio">`).join('')}</div></div>` : ''}
      ${v.videos?.length ? `<div class="card"><h3>Videos</h3>${v.videos.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join('<br>')}</div>` : ''}
      ${venue ? `<div class="card"><h3>Address</h3><p class="small" style="margin:0">${esc(v.address)}</p><a class="small" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.businessName + ' ' + v.address)}">Open in Google Maps →</a></div>` : ''}
      <div class="card" ${venue ? 'style="display:none"' : ''}><h3>${t('serviceAreas')}</h3><div class="row wrap-x">${(v.serviceDistricts || [v.district]).map((d) => `<span class="chip">${esc(distName(d))}</span>`).join('')}</div></div>
      ${venue ? '' : `<div class="card"><h3>Availability</h3><p class="small muted" style="margin:0">${(v.blockedDates || []).filter((d) => d >= today()).length ? 'Already booked on: ' + v.blockedDates.filter((d) => d >= today()).sort().map(fmtDate).join(', ') : 'No dates blocked yet — include your date in the enquiry to confirm.'}</p></div>`}
      <div class="card"><h3>${t('policies')}</h3><p style="margin:0" class="small">${esc(v.policies || 'Ask the vendor about booking and cancellation terms.')}</p></div>
      <div class="card"><h3>Customer reviews</h3><p class="small muted" style="margin:0">Verified reviews from completed bookings arrive in Phase 2.</p></div>
      <div style="height:20px"></div>
    </div>`,
    mount() {
      if (!venue) return;
      const draw = () => {
        $('#calBox').innerHTML = calendarHTML(ym, taken, { selected: pickDate });
        const tk = taken[pickDate] || [];
        $('#slotBox').innerHTML = pickDate ? `<div class="stack"><b>${fmtDate(pickDate)}</b><div class="slot-pick">${SLOTS.map((x) => { const ok = slotFree(tk, x.id); return `<button type="button" class="slot-opt ${pickSlot === x.id ? 'on' : ''}" data-slot="${x.id}" ${ok ? '' : 'disabled'}><b>${nameOf(x)}</b><span class="small muted">${x.time}</span><br><span class="price">${ok ? money(v.slotPrices?.[x.id]) : t('booked')}</span></button>`; }).join('')}</div>
          ${pickSlot ? `<a class="btn block" href="#/enquire/${id}?date=${pickDate}&slot=${pickSlot}">${t('bookSlot')} · ${slotName(pickSlot)}</a>` : '<p class="small muted" style="margin:0">Choose a slot.</p>'}</div>` : '<p class="small muted" style="margin:0">Tap a date to see free slots.</p>';
      };
      draw();
      $('#cal').onclick = (e) => {
        const c = e.target.closest('[data-cal]'); if (c) { ym = addMonth(ym, Number(c.dataset.cal)); return draw(); }
        const d = e.target.closest('[data-day]'); if (d) { pickDate = d.dataset.day; pickSlot = ''; return draw(); }
        const sl = e.target.closest('[data-slot]'); if (sl) { pickSlot = sl.dataset.slot; draw(); }
      };
      const tc = $('[data-act=toCal]'); if (tc) tc.onclick = (e) => { e.preventDefault(); $('#cal').scrollIntoView({ behavior: 'smooth' }); };
    },
  };
}

async function viewEnquire(vendorId, params) {
  if (!S.user) return { html: needLogin() };
  const v = await db.get('vendors', vendorId);
  if (!v) return { html: '<div class="wrap empty">Vendor not found.</div>' };
  const events = await db.list('events', ['ownerId', S.user.uid]);
  const pkg = params.get('pkg') || '';
  const venue = isVenue(v);
  const taken = venue ? takenMap(await venueSlots(vendorId)) : {};
  const pDate = params.get('date') || ''; const pSlot = params.get('slot') || 'full';
  return {
    html: `<div class="wrap" style="padding-top:16px"><div class="card stack">
      <h2>${venue ? 'Request to book' : t('requestQuote')}</h2><p class="muted small" style="margin:0">to <b>${esc(v.businessName)}</b> · ${esc(catName(v.category))}</p>
      <form id="enq" class="form-grid">
        <div class="full"><label>Event</label><select name="eventId"><option value="">➕ New event</option>${events.map((e) => `<option value="${e.id}">${esc(e.name)} · ${fmtDate(e.date)}</option>`).join('')}</select></div>
        <div><label>Event type</label><select name="eventType">${EVENT_TYPES.map((x) => `<option>${x}</option>`).join('')}</select></div>
        <div><label>Tradition / cultural requirements</label><select name="tradition">${TRADITIONS.map((x) => `<option>${x}</option>`).join('')}</select></div>
        <div><label>Event date</label><input type="date" name="date" required min="${today()}" value="${esc(pDate)}"></div>
        ${venue ? `<div><label>${t('slot')}</label><select name="slot">${SLOTS.map((x) => `<option value="${x.id}" ${x.id === pSlot ? 'selected' : ''}>${nameOf(x)} · ${x.time} · ${money(v.slotPrices?.[x.id])}</option>`).join('')}</select></div>` : ''}
        <div><label>Guests (approx.)</label><input type="number" name="guests" min="1" placeholder="300"></div>
        ${venue ? '<div class="full" id="availMsg"></div>' : ''}
        ${venue ? '' : `<div><label>District</label><select name="district" required>${DISTRICTS.map((d) => `<option value="${d.id}" ${d.id === v.district ? 'selected' : ''}>${nameOf(d)}</option>`).join('')}</select></div>
        <div><label>Venue / location</label><input name="location" required placeholder="Auditorium name, town"></div>
        <div><label>Package</label><select name="packageId"><option value="">Custom quotation</option>${(v.packages || []).map((k) => `<option value="${k.id}" ${k.id === pkg ? 'selected' : ''}>${esc(k.name)} · ${money(k.price)}${esc(k.unit || '')}</option>`).join('')}</select></div>`}
        <div><label>Your budget (₹)</label><input type="number" name="budget" min="0" placeholder="Optional"></div>
        <div class="full"><label>Requirements</label><textarea name="requirements" required placeholder="${venue ? 'Function timings, dining arrangement, own caterer or in-house, decoration, extra rooms…' : 'Timings, style, number of hours, special requests…'}"></textarea></div>
        <div class="full"><label>Reference images (up to 3)</label><input type="file" id="refImgs" accept="image/*" multiple><div class="thumbs" id="refThumbs" style="margin-top:6px"></div></div>
        <div class="full"><button class="btn block" id="enqBtn">${t('sendEnquiry')}</button></div>
      </form></div></div>`,
    mount() {
      let imgs = [];
      $('#refImgs').onchange = async (e) => { imgs = []; for (const f of [...e.target.files].slice(0, 3)) imgs.push(await compressImage(f, 600, 0.65)); $('#refThumbs').innerHTML = imgs.map((s) => `<img src="${s}">`).join(''); };
      const checkAvail = () => {
        if (!venue) return true;
        const d = $('#enq [name=date]').value; const sl = $('#enq [name=slot]').value; const box = $('#availMsg');
        if (!d) { box.innerHTML = ''; return true; }
        const ok = slotFree(taken[d] || [], sl);
        const g = Number($('#enq [name=guests]').value || 0);
        box.innerHTML = `<div class="msg" style="background:${ok ? '#e3f1e8' : '#f8e1df'}">${ok ? `✔ ${slotLabel(sl)} on ${fmtDate(d)} is free · hall rent ${money(v.slotPrices?.[sl])}` : `✕ ${slotLabel(sl)} on ${fmtDate(d)} is already booked. Pick another slot or date.`}${g > v.seating ? `<br>⚠ ${g} guests is more than the ${v.seating}-seat capacity.` : ''}</div>`;
        return ok;
      };
      if (venue) { ['date', 'slot', 'guests'].forEach((n) => { $(`#enq [name=${n}]`).addEventListener('input', checkAvail); }); checkAvail(); }
      const evSel = $('#enq [name=eventId]');
      evSel.onchange = () => { const e = events.find((x) => x.id === evSel.value); if (e) { $('#enq [name=date]').value = e.date || ''; $('#enq [name=eventType]').value = e.type; $('#enq [name=tradition]').value = e.tradition || 'Not specified'; if (!venue && e.district) $('#enq [name=district]').value = e.district; if (!venue && e.venue) $('#enq [name=location]').value = e.venue; checkAvail(); } };
      $('#enq').onsubmit = async (e) => {
        e.preventDefault();
        if (!checkAvail()) return toast('That slot is already booked');
        $('#enqBtn').disabled = true;
        try {
          const f = formData(e.target);
          if (venue) { f.district = v.district; f.location = `${v.businessName}, ${v.town}`; f.packageId = f.slot; }
          let eventId = f.eventId;
          if (!eventId) eventId = await db.add('events', { ownerId: S.user.uid, name: `${f.eventType} · ${fmtDate(f.date)}`, type: f.eventType, tradition: f.tradition, date: f.date, district: f.district, venue: f.location, guests: Number(f.guests) || 0, budget: 0 });
          const k = (v.packages || []).find((x) => x.id === f.packageId);
          const id = await db.add('enquiries', {
            customerId: S.user.uid, customerName: S.profile.name || 'Customer', customerPhone: S.profile.phone || '',
            vendorId: v.id, vendorOwnerId: v.ownerId, vendorName: v.businessName, category: v.category,
            eventId, eventType: f.eventType, tradition: f.tradition, date: f.date, district: f.district, location: f.location,
            guests: Number(f.guests) || 0, packageId: f.packageId || '', packageName: venue ? `Hall rent · ${slotLabel(f.slot)}` : (k ? k.name : 'Custom quotation'), slot: venue ? f.slot : '', isVenue: venue, listPrice: venue ? Number(v.slotPrices?.[f.slot] || 0) : (k ? k.price : 0), budget: Number(f.budget) || 0,
            requirements: f.requirements, images: imgs, status: 'enquiry', messages: [],
          });
          toast('Enquiry sent'); go('#/enquiry/' + id);
        } catch (err) { toast(err.message); $('#enqBtn').disabled = false; }
      };
    },
  };
}

function quoteBlock(q, opts = {}) {
  const extras = Number(q.additional || 0);
  return `<div class="quote stack">
    <div class="row between"><h3 style="margin:0">${esc(q.packageName)} <span class="small muted">v${q.version}</span></h3>
      <span class="badge ${q.status === 'accepted' ? 'ok' : q.status === 'revision_requested' ? 'warn' : q.status === 'superseded' ? '' : 'gold'}">${esc({ sent: 'Awaiting your response', revision_requested: 'Revision requested', accepted: 'Accepted', superseded: 'Replaced by revision', declined: 'Declined' }[q.status] || q.status)}</span></div>
    <p class="small" style="margin:0">${esc(q.details)}</p>
    <table>
      <tr><td>Inclusions</td><td>${(q.inclusions || []).map(esc).join('<br>') || '—'}</td></tr>
      <tr><td>Exclusions</td><td>${(q.exclusions || []).map(esc).join('<br>') || '—'}</td></tr>
      <tr><td>Package price</td><td>${money(q.total)}</td></tr>
      <tr><td>Additional charges</td><td>${money(extras)}${q.additionalNote ? ' · ' + esc(q.additionalNote) : ''}</td></tr>
      <tr><td><b>Grand total</b></td><td><b>${money(Number(q.total) + extras)}</b></td></tr>
      <tr><td>Advance to book</td><td>${money(q.advance)}</td></tr>
      <tr><td>Remaining balance</td><td>${money(Number(q.total) + extras - Number(q.advance))}</td></tr>
      <tr><td>Valid until</td><td>${fmtDate(q.validUntil)}${q.validUntil && q.validUntil < today() ? ' <span class="badge bad">Expired</span>' : ''}</td></tr>
    </table>
    ${q.customerNote ? `<div class="msg"><b>Your revision request:</b> ${esc(q.customerNote)}${q.targetPrice ? ' · target ' + money(q.targetPrice) : ''}</div>` : ''}
    ${opts.actions || ''}
  </div>`;
}

async function viewEnquiry(id) {
  if (!S.user) return { html: needLogin() };
  const e = await db.get('enquiries', id);
  if (!e) return { html: '<div class="wrap empty">Enquiry not found.</div>' };
  const isVendor = S.user.uid === e.vendorOwnerId;
  const isAdmin = role() === 'admin';
  const field = isVendor ? 'vendorOwnerId' : 'customerId';
  const qs = isAdmin ? (await db.list('quotations', ['enquiryId', id])) : (await db.list('quotations', [field, S.user.uid])).filter((q) => q.enquiryId === id);
  qs.sort((a, b) => b.version - a.version);
  const latest = qs[0];
  const open = !['confirmed', 'declined', 'closed'].includes(e.status);
  const slotRows = e.isVenue ? (await venueSlots(e.vendorId)).filter((r) => r.date === e.date) : [];
  const slotTakenByOther = e.isVenue && open && !slotFree(slotRows.filter((r) => r.enquiryId !== id).map((r) => r.half), e.slot);
  const customerActions = !isVendor && latest && latest.status === 'sent' && open ? `
    <div class="row wrap-x"><button class="btn green" data-act="accept" data-q="${latest.id}">${t('accept')}</button>
    <button class="btn ghost" data-act="showRevise">${t('requestRevision')}</button>
    <button class="btn ghost sm" data-act="closeEnq" style="color:var(--bad);border-color:var(--bad)">${t('decline')}</button></div>
    <form id="revise" class="stack" style="display:none"><label>What would you like changed?</label><textarea name="note" required placeholder="e.g. Can you include a second photographer and reduce the price?"></textarea>
    <label>Target price (₹, optional)</label><input type="number" name="target" min="0"><button class="btn">Send revision request</button></form>` : '';
  const vendorCanQuote = isVendor && open && (!latest || latest.status === 'revision_requested' || e.status === 'enquiry');
  return {
    html: `<div class="wrap stack" style="padding-top:16px">
      <a href="${isVendor ? '#/vendor/enquiries' : isAdmin ? '#/admin/enquiries' : '#/bookings'}" class="small">← Back</a>
      <div class="card stack">
        <div class="row between wrap-x"><h2 style="margin:0">${esc(isVendor ? e.customerName : e.vendorName)}</h2>${statusBadge(e.status)}</div>
        ${timeline(e.status)}
        <table class="cmp"><tr><td>Event</td><td>${esc(e.eventType)} · ${esc(e.tradition)}</td></tr><tr><td>Date</td><td>${fmtDate(e.date)}${e.slot ? ' · ' + esc(slotLabel(e.slot)) : ''}</td></tr>
        <tr><td>Location</td><td>${esc(e.location)}, ${esc(distName(e.district))}</td></tr><tr><td>Guests</td><td>${e.guests || '—'}</td></tr>
        <tr><td>Package</td><td>${esc(e.packageName)}</td></tr><tr><td>Budget</td><td>${e.budget ? money(e.budget) : '—'}</td></tr>
        ${isVendor || isAdmin ? `<tr><td>Customer phone</td><td>${esc(e.customerPhone || '—')}</td></tr>` : ''}</table>
        ${slotTakenByOther ? `<div class="msg" style="background:#f8e1df">✕ This slot has since been booked or blocked. ${isVendor ? 'Decline, or suggest another date in your message.' : 'Ask the venue for another date or slot.'}</div>` : ''}
        <div class="msg"><b>Requirements:</b> ${esc(e.requirements)}</div>
        ${e.images?.length ? `<div class="thumbs">${e.images.map((s) => `<img src="${s}">`).join('')}</div>` : ''}
      </div>
      ${e.messages?.length ? `<div class="card stack"><h3>Negotiation log</h3>${e.messages.map((m) => `<div class="msg"><b>${m.from === 'vendor' ? esc(e.vendorName) : esc(e.customerName)}:</b> ${esc(m.text)} <span class="small muted">· ${new Date(m.at).toLocaleString('en-IN')}</span></div>`).join('')}</div>` : ''}
      ${vendorCanQuote ? `<div class="card stack"><h3>${latest ? 'Send revised quotation' : 'Send quotation'}</h3>
        <form id="qform" class="form-grid">
          <div><label>Package name</label><input name="packageName" required value="${esc(latest?.packageName || e.packageName)}"></div>
          <div><label>Package price (₹)</label><input type="number" name="total" required min="0" value="${latest ? (latest.targetPrice || latest.total) : (e.listPrice || '')}"></div>
          <div><label>Additional charges (₹)</label><input type="number" name="additional" min="0" value="${latest?.additional || 0}"></div>
          <div><label>Additional charges note</label><input name="additionalNote" value="${esc(latest?.additionalNote || '')}" placeholder="Travel, GST…"></div>
          <div><label>Advance payment (₹)</label><input type="number" name="advance" required min="0" value="${latest?.advance || (e.listPrice ? Math.round(e.listPrice * 0.25) : '')}"></div>
          <div><label>Valid until</label><input type="date" name="validUntil" required min="${today()}" value="${latest?.validUntil && latest.validUntil >= today() ? latest.validUntil : ''}"></div>
          <div class="full"><label>Service details</label><textarea name="details" required>${esc(latest?.details || '')}</textarea></div>
          <div><label>Inclusions (one per line)</label><textarea name="inclusions">${esc((latest?.inclusions || []).join('\n'))}</textarea></div>
          <div><label>Exclusions (one per line)</label><textarea name="exclusions">${esc((latest?.exclusions || []).join('\n'))}</textarea></div>
          <div class="full"><label>Message to customer (optional)</label><input name="message"></div>
          <div class="full row"><button class="btn">Send quotation</button>${e.status === 'enquiry' ? '<button type="button" class="btn ghost" data-act="vendorDecline">Decline enquiry</button>' : ''}</div>
        </form></div>` : ''}
      ${qs.length ? `<h2>Quotations</h2>${quoteBlock(latest, { actions: customerActions })}${qs.slice(1).map((q) => quoteBlock(q)).join('')}` : `<div class="card muted">${isVendor ? 'Send your quotation above.' : 'Waiting for the vendor to send a quotation.'}</div>`}
      ${!isVendor && e.eventId ? `<a class="btn ghost" href="#/compare/${e.eventId}">${t('compare')} for this event</a>` : ''}
      <div style="height:20px"></div></div>`,
    mount() {
      const qf = $('#qform');
      if (qf) qf.onsubmit = async (ev) => {
        ev.preventDefault();
        const f = formData(qf);
        if (Number(f.advance) > Number(f.total) + Number(f.additional || 0)) return toast('Advance cannot exceed the total');
        if (latest && latest.status !== 'superseded') await db.update('quotations', latest.id, { status: 'superseded' });
        await db.add('quotations', {
          enquiryId: id, vendorId: e.vendorId, vendorOwnerId: e.vendorOwnerId, customerId: e.customerId, eventId: e.eventId || '', vendorName: e.vendorName, category: e.category,
          packageName: f.packageName, details: f.details, inclusions: f.inclusions.split('\n').map((x) => x.trim()).filter(Boolean), exclusions: f.exclusions.split('\n').map((x) => x.trim()).filter(Boolean),
          total: Number(f.total), additional: Number(f.additional || 0), additionalNote: f.additionalNote, advance: Number(f.advance), validUntil: f.validUntil, version: (latest?.version || 0) + 1, status: 'sent',
        });
        const messages = [...(e.messages || [])]; if (f.message) messages.push({ from: 'vendor', text: f.message, at: Date.now() });
        await db.update('enquiries', id, { status: 'quoted', messages, lastQuoteTotal: Number(f.total) + Number(f.additional || 0) });
        toast('Quotation sent'); render();
      };
      const rv = $('#revise');
      if (rv) rv.onsubmit = async (ev) => {
        ev.preventDefault(); const f = formData(rv);
        await db.update('quotations', latest.id, { status: 'revision_requested', customerNote: f.note, targetPrice: Number(f.target) || 0 });
        await db.update('enquiries', id, { status: 'negotiation', messages: [...(e.messages || []), { from: 'customer', text: f.note + (f.target ? ` (target ${money(f.target)})` : ''), at: Date.now() }] });
        toast('Revision requested'); render();
      };
      $('#view').onclick = async (ev) => {
        const b = ev.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'showRevise') rv.style.display = 'block';
        if (b.dataset.act === 'accept') {
          if (latest.validUntil && latest.validUntil < today()) return toast('This quotation has expired. Request a revision instead.');
          if (e.isVenue) {
            try { await db.createMany('slots', halvesOf(e.slot).map((h) => [`${e.vendorId}_${e.date}_${h}`, { venueId: e.vendorId, date: e.date, half: h, enquiryId: id, customerId: e.customerId, source: 'booking' }])); }
            catch (err) { return toast(err.message === 'ALREADY_TAKEN' ? 'Sorry — this slot was just booked by someone else.' : err.message); }
          }
          await db.update('quotations', latest.id, { status: 'accepted' });
          await db.update('enquiries', id, { status: 'confirmed', acceptedQuoteId: latest.id, finalAmount: Number(latest.total) + Number(latest.additional || 0), advanceDue: Number(latest.advance), confirmedAt: Date.now() });
          toast('Booking confirmed 🎉'); render();
        }
        if (b.dataset.act === 'closeEnq' && confirm('Decline this quotation and close the enquiry?')) { await db.update('enquiries', id, { status: 'closed' }); await db.update('quotations', latest.id, { status: 'declined' }); render(); }
        if (b.dataset.act === 'vendorDecline' && confirm('Decline this enquiry?')) { await db.update('enquiries', id, { status: 'declined' }); render(); }
      };
    },
  };
}

async function viewBookings() {
  if (!S.user) return { html: needLogin() };
  const es = (await db.list('enquiries', ['customerId', S.user.uid])).sort((a, b) => b.createdAt - a.createdAt);
  const confirmed = es.filter((e) => e.status === 'confirmed');
  const active = es.filter((e) => ['enquiry', 'quoted', 'negotiation'].includes(e.status));
  const row = (e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${esc(e.vendorName)}</b><div class="small muted">${esc(catName(e.category))} · ${fmtDate(e.date)}${e.slot ? ' · ' + esc(slotName(e.slot)) : ''}${e.finalAmount ? ' · ' + money(e.finalAmount) : e.lastQuoteTotal ? ' · quote ' + money(e.lastQuoteTotal) : ''}</div></div>${statusBadge(e.status)}</a>`;
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>${t('bookings')}</h1>
      <div class="card"><h3>Confirmed bookings</h3>${confirmed.map(row).join('') || '<p class="muted small">No confirmed bookings yet.</p>'}
      ${confirmed.length ? `<p class="small muted">Advance due: <b>${money(confirmed.reduce((s, e) => s + (e.advanceDue || 0), 0))}</b> — pay the vendor directly for now; online payment arrives in Phase 2.</p>` : ''}</div>
      <div class="card"><h3>Active enquiries</h3>${active.map(row).join('') || `<p class="muted small">No open enquiries. <a href="#/explore">Find vendors</a></p>`}</div>
      ${es.length > confirmed.length + active.length ? `<div class="card"><h3>Closed</h3>${es.filter((e) => !confirmed.includes(e) && !active.includes(e)).map(row).join('')}</div>` : ''}
    </div>`,
  };
}

async function viewEvents() {
  if (!S.user) return { html: needLogin() };
  const [evs, es] = await Promise.all([db.list('events', ['ownerId', S.user.uid]), db.list('enquiries', ['customerId', S.user.uid])]);
  evs.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const favIds = S.profile.favourites || [];
  const vs = favIds.length ? await approvedVendors() : [];
  const favs = vs.filter((v) => favIds.includes(v.id));
  return {
    html: `<div class="wrap stack" style="padding-top:16px">
      <div class="row between"><h1 style="margin:0">${t('events')}</h1><button class="btn sm" data-act="newEvent">+ ${t('createEvent')}</button></div>
      <form id="evForm" class="card form-grid" style="display:none">
        <div class="full"><label>Event name</label><input name="name" required placeholder="Our wedding"></div>
        <div><label>Type</label><select name="type">${EVENT_TYPES.map((x) => `<option>${x}</option>`).join('')}</select></div>
        <div><label>Tradition</label><select name="tradition">${TRADITIONS.map((x) => `<option>${x}</option>`).join('')}</select></div>
        <div><label>Date</label><input type="date" name="date" required></div>
        <div><label>District</label><select name="district">${DISTRICTS.map((d) => `<option value="${d.id}">${nameOf(d)}</option>`).join('')}</select></div>
        <div><label>Venue</label><input name="venue"></div>
        <div><label>Overall budget (₹)</label><input type="number" name="budget" min="0"></div>
        <div class="full"><button class="btn">${t('save')}</button></div>
      </form>
      ${evs.map((ev) => {
        const mine = es.filter((e) => e.eventId === ev.id);
        const committed = mine.filter((e) => e.status === 'confirmed').reduce((s, e) => s + (e.finalAmount || 0), 0);
        const days = ev.date ? Math.ceil((new Date(ev.date) - new Date(today())) / 86400000) : null;
        return `<div class="card stack"><div class="row between wrap-x"><div><h3 style="margin:0">${esc(ev.name)}</h3><div class="small muted">${esc(ev.type)} · ${esc(ev.tradition || '')} · ${fmtDate(ev.date)} · ${esc(distName(ev.district))}${ev.venue ? ' · ' + esc(ev.venue) : ''}</div></div>
          ${days !== null && days >= 0 ? `<span class="badge gold">${days} days to go</span>` : ''}</div>
          <div class="stat-grid"><div class="stat"><b>${mine.length}</b><span>Vendors enquired</span></div><div class="stat"><b>${mine.filter((e) => e.status === 'confirmed').length}</b><span>Booked</span></div>
          <div class="stat"><b>${money(committed)}</b><span>Committed${ev.budget ? ' of ' + money(ev.budget) : ''}</span></div></div>
          <div class="row wrap-x"><a class="btn sm" href="#/compare/${ev.id}">${t('compare')}</a><a class="btn sm ghost" href="#/explore">Add vendors</a></div></div>`;
      }).join('') || '<div class="card muted">No events yet. Create one, or send an enquiry and we’ll create it for you.</div>'}
      ${favs.length ? `<h2>Saved vendors</h2><div class="grid">${favs.map((v) => vendorCard(v)).join('')}</div>` : ''}
      <p class="small muted">Full budget tracking, checklist and family sharing arrive in Phase 3.</p>
    </div>`,
    mount() {
      const f = $('#evForm');
      $('#view').onclick = (e) => { if (e.target.closest('[data-act=newEvent]')) f.style.display = f.style.display === 'none' ? 'grid' : 'none'; };
      f.onsubmit = async (e) => { e.preventDefault(); const d = formData(f); await db.add('events', { ...d, budget: Number(d.budget) || 0, ownerId: S.user.uid }); toast('Event created'); render(); };
    },
  };
}

async function viewCompare(eventId) {
  if (!S.user) return { html: needLogin() };
  const ev = await db.get('events', eventId);
  const es = (await db.list('enquiries', ['customerId', S.user.uid])).filter((e) => e.eventId === eventId);
  const qs = (await db.list('quotations', ['customerId', S.user.uid])).filter((q) => q.eventId === eventId);
  const latestFor = (eid) => qs.filter((q) => q.enquiryId === eid).sort((a, b) => b.version - a.version)[0];
  const cats = [...new Set(es.map((e) => e.category))];
  const tables = cats.map((cat) => {
    const all = es.filter((e) => e.category === cat).map((e) => ({ e, q: latestFor(e.id) }));
    const cols = all.filter((x) => x.q);
    const waiting = all.filter((x) => !x.q).map(({ e }) => `<a href="#/enquiry/${e.id}">${esc(e.vendorName)}</a>`).join(', ');
    const waitNote = waiting ? `<p class="small muted" style="margin:.6em 0 0">Awaiting quotation from: ${waiting}</p>` : '';
    if (!cols.length) return `<div class="card"><h3>${esc(catName(cat))}</h3><p class="muted small">No quotations received yet.</p>${waitNote}</div>`;
    const grand = (q) => Number(q.total) + Number(q.additional || 0);
    const best = Math.min(...cols.map((x) => grand(x.q)));
    const r = (label, fn) => `<tr><td class="muted small">${label}</td>${cols.map(fn).join('')}</tr>`;
    return `<div class="card"><h3>${esc(catName(cat))}</h3><div class="cmp-wrap"><table class="cmp">
      <tr><th></th>${cols.map(({ e }) => `<th><a href="#/enquiry/${e.id}">${esc(e.vendorName)}</a></th>`).join('')}</tr>
      ${r('Status', ({ e }) => `<td>${statusBadge(e.status)}</td>`)}
      ${r('Package', ({ q }) => `<td>${esc(q.packageName)} (v${q.version})</td>`)}
      ${r('Grand total', ({ q }) => `<td><b>${money(grand(q))}</b>${grand(q) === best && cols.length > 1 ? ' <span class="badge ok">Lowest</span>' : ''}</td>`)}
      ${r('Advance', ({ q }) => `<td>${money(q.advance)}</td>`)}
      ${r('Inclusions', ({ q }) => `<td class="small">${(q.inclusions || []).map(esc).join('<br>')}</td>`)}
      ${r('Exclusions', ({ q }) => `<td class="small">${(q.exclusions || []).map(esc).join('<br>') || '—'}</td>`)}
      ${r('Valid until', ({ q }) => `<td>${fmtDate(q.validUntil)}</td>`)}
    </table></div>${waitNote}</div>`;
  }).join('');
  return { html: `<div class="wrap stack" style="padding-top:16px"><a href="#/events" class="small">← ${t('events')}</a><h1>${t('compare')}</h1><p class="muted">${esc(ev?.name || '')}</p>${tables || '<div class="card muted">Send enquiries for this event to compare quotations here.</div>'}</div>` };
}

// ---------- login & profile ----------
async function viewLogin(params) {
  const next = params.get('next') || '';
  if (S.user) { go(next ? decodeURIComponent(next).replace(/^#/, '#') : '#/'); return { html: '' }; }
  return {
    html: `<div class="wrap"><div class="card login-box stack">
      <h2 class="center">${t('login')}</h2><p class="muted center small" style="margin:0">Customers and vendors use the same sign-in.</p>
      ${DEMO_MODE ? `<div class="stack"><button class="btn block" data-demo="customer">Continue as demo Customer</button><button class="btn block gold" data-demo="vendor">Continue as demo Vendor</button><button class="btn block ghost" data-demo="admin">Continue as demo Admin</button>
        <p class="small muted center">Phone OTP and Google sign-in turn on once the Firebase config is added.</p></div>` : `
      <form id="otpForm" class="stack"><label>Mobile number</label><div class="row"><input value="+91" style="width:70px" disabled><input name="phone" inputmode="numeric" maxlength="10" required placeholder="98XXXXXXXX"></div>
        <button class="btn block" id="sendOtp">Send OTP</button></form>
      <form id="codeForm" class="stack" style="display:none"><label>Enter the 6-digit OTP</label><input name="code" inputmode="numeric" maxlength="6" required><button class="btn block">Verify & continue</button></form>
      <div class="divider">or</div><button class="btn ghost block" data-act="google">Continue with Google</button>`}
    </div></div>`,
    mount() {
      const done = () => setTimeout(() => go(next ? decodeURIComponent(next) : '#/'), 300);
      $$('[data-demo]').forEach((b) => (b.onclick = async () => { await auth.demo(b.dataset.demo); go(b.dataset.demo === 'vendor' ? '#/vendor' : b.dataset.demo === 'admin' ? '#/admin' : (next ? decodeURIComponent(next) : '#/')); }));
      const g = $('[data-act=google]'); if (g) g.onclick = async () => { try { await auth.google(); done(); } catch (e) { toast(e.message); } };
      const of = $('#otpForm');
      if (of) {
        of.onsubmit = async (e) => { e.preventDefault(); const p = formData(of).phone.replace(/\D/g, ''); if (p.length !== 10) return toast('Enter a 10-digit mobile number'); try { await auth.sendOtp('+91' + p, 'sendOtp'); of.style.display = 'none'; $('#codeForm').style.display = 'block'; toast('OTP sent'); } catch (err) { toast(err.message); } };
        $('#codeForm').onsubmit = async (e) => { e.preventDefault(); try { await auth.verifyOtp(formData(e.target).code); done(); } catch (err) { toast('Wrong or expired OTP'); } };
      }
    },
  };
}

async function viewProfile() {
  if (!S.user) return { html: needLogin() };
  const p = S.profile;
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>${t('profile')}</h1>
      <form id="pf" class="card form-grid">
        <div><label>Name</label><input name="name" value="${esc(p.name)}" required></div>
        <div><label>Mobile</label><input name="phone" value="${esc(p.phone)}"></div>
        <div><label>Email</label><input name="email" type="email" value="${esc(p.email || '')}"></div>
        <div><label>${t('language')}</label><select name="lang"><option value="en" ${getLang() === 'en' ? 'selected' : ''}>English</option><option value="ml" ${getLang() === 'ml' ? 'selected' : ''}>മലയാളം</option></select></div>
        <div class="full"><button class="btn">${t('save')}</button></div>
      </form>
      <div class="card row between wrap-x"><div><b>Account type:</b> ${esc(p.role)}${S.vendor ? ` · ${esc(S.vendor.businessName)} (${esc(S.vendor.status)})` : ''}</div>
        ${p.role === 'customer' ? '<a class="btn sm gold" href="#/vendor/register">Register as a vendor</a>' : ''}${p.role === 'vendor' ? `<a class="btn sm ghost" href="#/v/${S.user.uid}">View public profile</a>` : ''}</div>
      <button class="btn ghost" data-act="logout">${t('logout')}</button>
      ${DEMO_MODE ? '<button class="btn ghost sm" data-act="resetDemo">Reset demo data</button>' : ''}
    </div>`,
    mount() {
      $('#pf').onsubmit = async (e) => { e.preventDefault(); const f = formData(e.target); setLang(f.lang); await db.update('users', S.user.uid, { name: f.name, phone: f.phone, email: f.email, lang: f.lang }); Object.assign(S.profile, f); toast('Saved'); render(); };
      $('#view').onclick = async (e) => {
        const a = e.target.closest('[data-act]')?.dataset.act;
        if (a === 'logout') { await auth.signOut(); go('#/'); }
        if (a === 'resetDemo' && confirm('Reset all demo data on this device?')) { await db.reset(); localStorage.removeItem('mg_demo_uid'); location.hash = '#/'; location.reload(); }
      };
    },
  };
}

// =====================================================================
// VENDOR VIEWS
// =====================================================================
async function viewVendorRegister(params = new URLSearchParams()) {
  if (!S.user) return { html: needLogin() };
  if (S.vendor) { go('#/vendor'); return { html: '' }; }
  const p = S.profile;
  const claimId = params.get('claim') || '';
  const claim = claimId ? await db.get('vendors', claimId) : null;
  return {
    html: `<div class="wrap" style="padding-top:16px"><div class="card stack"><h2>List your venue or service</h2><p class="muted small" style="margin:0">Your listing goes live after our team verifies it. Verified listings get a badge. Hall owners add capacity and slot prices on the next screen.</p>
      <form id="vr" class="form-grid">
        ${claim ? `<div class="full msg">You're claiming <b>${esc(claim.businessName)}</b>, ${esc(claim.town)}. Our team will call you to confirm you own or manage it before the listing switches to your account.</div>` : ''}
        <div><label>Business name</label><input name="businessName" required value="${esc(claim?.businessName || '')}"></div>
        <div><label>Owner name</label><input name="ownerName" required value="${esc(p.name)}"></div>
        <div><label>Mobile number</label><input name="phone" required value="${esc(p.phone)}"></div>
        <div><label>WhatsApp number (with 91)</label><input name="whatsapp" placeholder="9198XXXXXXXX"></div>
        <div><label>Email</label><input name="email" type="email" value="${esc(p.email || '')}"></div>
        <div><label>Business category</label><select name="category" required>${CATEGORY_GROUPS.map((g) => `<optgroup label="${g.en}">${CATEGORIES.filter((c) => c.group === g.id).map((c) => `<option value="${c.id}" ${claim?.category === c.id ? 'selected' : ''}>${esc(c.en)}</option>`).join('')}</optgroup>`).join('')}</select></div>
        <div><label>District</label><select name="district" id="vrD" required>${DISTRICTS.map((d) => `<option value="${d.id}" ${claim?.district === d.id ? 'selected' : ''}>${d.en}</option>`).join('')}</select></div>
        <div><label>Town</label><select name="town" id="vrT"></select></div>
        <div class="full"><label>Business address</label><input name="address" required value="${esc(claim?.address || '')}"></div>
        <div class="full"><label>Service districts</label><div class="row wrap-x">${DISTRICTS.map((d) => `<label class="chip" style="margin:0"><input type="checkbox" name="sd" value="${d.id}" style="width:auto"> ${d.en}</label>`).join('')}</div></div>
        <div><label>GST number (optional)</label><input name="gst"></div>
        <div><label>Business registration no. (optional)</label><input name="regNo"></div>
        <div class="full"><label>About your business</label><textarea name="description" required></textarea></div>
        <div class="full"><label>Portfolio images (up to 6)</label><input type="file" id="pfImgs" accept="image/*" multiple><div class="thumbs" id="pfThumbs" style="margin-top:6px"></div></div>
        <div class="full"><button class="btn block" id="vrBtn">Submit for verification</button></div>
      </form></div></div>`,
    mount() {
      const fillTowns = () => { $('#vrT').innerHTML = districtById($('#vrD').value).towns.map((x) => `<option ${claim?.town === x ? 'selected' : ''}>${x}</option>`).join(''); };
      $('#vrD').onchange = fillTowns; fillTowns();
      let imgs = [];
      $('#pfImgs').onchange = async (e) => { imgs = []; for (const f of [...e.target.files].slice(0, 6)) imgs.push(await compressImage(f)); $('#pfThumbs').innerHTML = imgs.map((s) => `<img src="${s}">`).join(''); };
      $('#vr').onsubmit = async (e) => {
        e.preventDefault(); $('#vrBtn').disabled = true;
        const fd = new FormData(e.target); const f = Object.fromEntries(fd.entries());
        const sd = fd.getAll('sd'); if (!sd.includes(f.district)) sd.unshift(f.district);
        try {
          await db.set('vendors', S.user.uid, {
            ownerId: S.user.uid, isDemo: false, businessName: f.businessName, ownerName: f.ownerName, phone: f.phone, whatsapp: f.whatsapp.replace(/\D/g, ''), email: f.email,
            category: f.category, district: f.district, town: f.town, serviceDistricts: sd, address: f.address, gst: f.gst, regNo: f.regNo, description: f.description,
            portfolio: imgs, packages: [], startingPrice: 0, priceUnit: '', rating: 0, reviewCount: 0, policies: '', traditions: [], offer: '', blockedDates: [],
            status: 'pending', verified: false, featured: false, views: 0, createdAt: Date.now(),
            claimOf: claim ? claimId : '', corridor: claim?.corridor || '', placeId: claim?.placeId || '', mapsUrl: claim?.mapsUrl || '',
          });
          await db.update('users', S.user.uid, { role: 'vendor' });
          toast('Submitted for verification'); await loadSession(S.user); go('#/vendor/services');
        } catch (err) { toast(err.message); $('#vrBtn').disabled = false; }
      };
    },
  };
}

async function vendorData() {
  const es = (await db.list('enquiries', ['vendorOwnerId', S.user.uid])).sort((a, b) => b.createdAt - a.createdAt);
  return es;
}

async function viewVendorDash() {
  if (role() !== 'vendor') return { html: needLogin() };
  const v = S.vendor; const es = await vendorData();
  const month = today().slice(0, 7);
  const conf = es.filter((e) => e.status === 'confirmed');
  const rev = conf.filter((e) => new Date(e.confirmedAt || e.createdAt).toISOString().slice(0, 7) === month).reduce((s, e) => s + (e.finalAmount || 0), 0);
  const upcoming = conf.filter((e) => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  const stat = (n, l) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`;
  return {
    html: `<div class="wrap stack" style="padding-top:16px">
      <div><h1 style="margin:0">${esc(v.businessName)}</h1><div class="row wrap-x small">${v.status === 'approved' ? '<span class="badge ok">Live</span>' : `<span class="badge warn">${v.status === 'pending' ? 'Awaiting admin verification' : esc(v.status)}</span>`}${v.verified ? `<span class="badge">✔ ${t('verified')}</span>` : ''}${v.isDemo ? '<span class="badge demo">Demo</span>' : ''}</div></div>
      ${isVenue(v) ? (!v.slotPrices?.full ? '<div class="card" style="background:#fbeed6">Add your capacity and slot prices so customers can find and book your hall. <a href="#/vendor/services">Add venue details →</a></div>' : '') : (!v.packages?.length ? '<div class="card" style="background:#fbeed6">Add at least one package so customers can see your prices. <a href="#/vendor/services">Add packages →</a></div>' : '')}
      <div class="stat-grid">${stat(es.length, 'Total enquiries')}${stat(es.filter((e) => e.status === 'enquiry').length, 'New enquiries')}${stat(es.filter((e) => e.status === 'negotiation').length, 'Revision requests')}${stat(es.filter((e) => e.status === 'quoted').length, 'Quotes awaiting reply')}${stat(conf.length, 'Confirmed bookings')}${stat(money(rev), 'Booked this month')}${stat(v.views || 0, 'Profile views')}${stat('★ ' + Number(v.rating || 0).toFixed(1), (v.reviewCount || 0) + ' reviews')}</div>
      <div class="card"><h3>Needs your action</h3>${es.filter((e) => ['enquiry', 'negotiation'].includes(e.status)).slice(0, 6).map((e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${esc(e.customerName)}</b><div class="small muted">${esc(e.eventType)} · ${fmtDate(e.date)}${e.slot ? ' · ' + esc(slotName(e.slot)) : ''} · ${e.guests || '—'} guests</div></div>${statusBadge(e.status)}</a>`).join('') || '<p class="muted small">All caught up.</p>'}</div>
      <div class="card"><h3>Upcoming events</h3>${upcoming.slice(0, 5).map((e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${fmtDate(e.date)}</b>${e.slot ? ' · ' + esc(slotName(e.slot)) : ''} · ${esc(e.customerName)}<div class="small muted">${esc(e.eventType)} · ${e.guests || '—'} guests</div></div><span class="price">${money(e.finalAmount)}</span></a>`).join('') || '<p class="muted small">No upcoming bookings.</p>'}</div>
    </div>`,
  };
}

async function viewVendorEnquiries(onlyConfirmed) {
  if (role() !== 'vendor') return { html: needLogin() };
  const all = await vendorData();
  const es = onlyConfirmed ? all.filter((e) => e.status === 'confirmed') : all;
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>${onlyConfirmed ? t('bookings') : t('enquiries')}</h1>
      <div class="card">${es.map((e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${esc(e.customerName)}</b><div class="small muted">${esc(e.eventType)} · ${esc(e.tradition)} · ${fmtDate(e.date)} · ${esc(e.packageName)}${e.guests ? ' · ' + e.guests + ' guests' : ''}${e.finalAmount ? ' · ' + money(e.finalAmount) + ' (advance ' + money(e.advanceDue) + ')' : ''}</div></div>${statusBadge(e.status)}</a>`).join('') || '<p class="muted">Nothing here yet.</p>'}</div>
      ${onlyConfirmed ? '<p class="small muted">Advance payment tracking through Razorpay arrives in Phase 2.</p>' : ''}</div>`,
  };
}

async function viewVendorCalendar() {
  if (role() !== 'vendor') return { html: needLogin() };
  const v = S.vendor;
  if (!isVenue(v)) return viewVendorEnquiries(true);
  let rows = await venueSlots(S.user.uid);
  const es = (await vendorData()).filter((e) => e.status === 'confirmed');
  let ym = today().slice(0, 7); let pick = today();
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>${t('calendar')}</h1>
      <p class="small muted" style="margin:0">Confirmed HallHub bookings fill in automatically. Block slots you booked offline (phone, walk-in) so customers can't request them.</p>
      <div class="card" id="vcal"></div><div class="card stack" id="dayBox"></div>
      <div class="card"><h3>Upcoming bookings</h3>${es.filter((e) => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).map((e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${fmtDate(e.date)}</b> · ${esc(slotName(e.slot))}<div class="small muted">${esc(e.customerName)} · ${esc(e.eventType)} · ${e.guests || '—'} guests</div></div><span class="price">${money(e.finalAmount)}</span></a>`).join('') || '<p class="muted small">No upcoming bookings yet.</p>'}</div>
    </div>`,
    mount() {
      const draw = () => {
        $('#vcal').innerHTML = calendarHTML(ym, takenMap(rows), { selected: pick });
        const day = rows.filter((r) => r.date === pick);
        $('#dayBox').innerHTML = `<h3 style="margin:0">${fmtDate(pick)}</h3>${['morning', 'evening'].map((h) => {
          const r = day.find((x) => x.half === h); const b = r && r.enquiryId ? es.find((e) => e.id === r.enquiryId) : null;
          return `<div class="list-item"><div><b>${slotLabel(h)}</b><div class="small muted">${!r ? t('available') : b ? `Booked · ${esc(b.customerName)} · ${money(b.finalAmount)}` : r.enquiryId ? 'Booked via HallHub' : 'Blocked — ' + esc(r.note || 'offline booking')}</div></div>
            ${!r ? `<button class="btn sm ghost" data-block="${h}">Block</button>` : r.source === 'manual' ? `<button class="btn sm ghost" data-unblock="${r.id}">Unblock</button>` : b ? `<a class="btn sm ghost" href="#/enquiry/${b.id}">View</a>` : ''}</div>`;
        }).join('')}`;
      };
      draw();
      $('#view').onclick = async (e) => {
        const c = e.target.closest('[data-cal]'); if (c) { ym = addMonth(ym, Number(c.dataset.cal)); return draw(); }
        const d = e.target.closest('[data-day]'); if (d) { pick = d.dataset.day; return draw(); }
        const bl = e.target.closest('[data-block]');
        if (bl) {
          const note = prompt('Note for this block (e.g. customer name)', 'Offline booking') ?? 'Offline booking';
          try { await db.createMany('slots', [[`${S.user.uid}_${pick}_${bl.dataset.block}`, { venueId: S.user.uid, date: pick, half: bl.dataset.block, source: 'manual', note }]]); } catch (err) { toast(err.message === 'ALREADY_TAKEN' ? 'Already booked' : err.message); }
          rows = await venueSlots(S.user.uid); return draw();
        }
        const ub = e.target.closest('[data-unblock]');
        if (ub) { await db.remove('slots', ub.dataset.unblock); rows = await venueSlots(S.user.uid); draw(); }
      };
    },
  };
}

async function viewVendorServices() {
  if (role() !== 'vendor') return { html: needLogin() };
  const v = S.vendor; const venue = isVenue(v);
  const pkgRow = (k = { id: 'p' + Date.now(), name: '', price: '', unit: '', inclusions: [] }) => `<div class="pkg form-grid" data-pkg="${k.id}">
    <div><label>Package name</label><input data-f="name" value="${esc(k.name)}" required></div><div><label>Price (₹)</label><input type="number" data-f="price" value="${esc(k.price)}" required min="0"></div>
    <div><label>Unit (optional)</label><input data-f="unit" value="${esc(k.unit)}" placeholder=" per plate"></div>
    <div class="full"><label>Inclusions (one per line)</label><textarea data-f="inclusions">${esc((k.inclusions || []).join('\n'))}</textarea></div>
    <div class="full"><button type="button" class="btn sm ghost" data-act="rmPkg">Remove package</button></div></div>`;
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>${venue ? t('venue') : t('services')}</h1>
      <form id="svc" class="stack">
        ${venue ? `<div class="card form-grid"><h3 class="full" style="margin:0">Capacity & hall rent</h3>
          <div><label>Hall type</label><select name="category">${CATEGORIES.filter((c) => c.group === 'venues').map((c) => `<option value="${c.id}" ${c.id === v.category ? 'selected' : ''}>${esc(c.en)}</option>`).join('')}</select></div>
          <div><label>Seating capacity</label><input type="number" name="seating" min="1" required value="${v.seating || ''}"></div>
          <div><label>Dining capacity (per sitting)</label><input type="number" name="dining" min="0" value="${v.dining || ''}"></div>
          <div><label>Car parking</label><input type="number" name="parking" min="0" value="${v.parking || ''}"></div>
          <div><label>Bridal / green rooms</label><input type="number" name="rooms" min="0" value="${v.rooms || ''}"></div>
          <div><label>Air-conditioning</label><select name="ac">${AC_TYPES.map((x) => `<option ${x === v.ac ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div><label>Catering</label><select name="catering">${CATERING_RULES.map((x) => `<option ${x === v.catering ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          ${SLOTS.map((x) => `<div><label>${x.en} rent (₹) · ${x.time}</label><input type="number" name="price_${x.id}" min="0" required value="${v.slotPrices?.[x.id] || ''}"></div>`).join('')}
          <div class="full"><label>Facilities</label><div class="row wrap-x">${AMENITIES.map((a) => `<label class="chip" style="margin:0"><input type="checkbox" name="amen" value="${a}" ${(v.amenities || []).includes(a) ? 'checked' : ''} style="width:auto"> ${a}</label>`).join('')}</div></div>
        </div>` : `<div class="card stack"><div class="row between"><h3 style="margin:0">${t('packages')}</h3><button type="button" class="btn sm" data-act="addPkg">+ Add package</button></div><div id="pkgs" class="stack">${(v.packages || []).map(pkgRow).join('')}</div></div>`}
        <div class="card form-grid">
          <div class="full"><label>About your business</label><textarea name="description">${esc(v.description)}</textarea></div>
          <div class="full"><label>Booking & cancellation policy</label><textarea name="policies">${esc(v.policies)}</textarea></div>
          <div><label>Promotional offer</label><input name="offer" value="${esc(v.offer || '')}" placeholder="10% off weekday bookings"></div>
          <div><label>Video links (comma separated)</label><input name="videos" value="${esc((v.videos || []).join(', '))}" placeholder="YouTube / Instagram links"></div>
          <div class="full"><label>Ceremonies you are experienced with</label><div class="row wrap-x">${TRADITIONS.slice(0, 6).map((x) => `<label class="chip" style="margin:0"><input type="checkbox" name="trad" value="${x}" ${(v.traditions || []).includes(x) ? 'checked' : ''} style="width:auto"> ${x}</label>`).join('')}</div></div>
          ${venue ? '<p class="full small muted" style="margin:0">Manage booked and blocked dates in the Calendar tab.</p>' : `<div class="full"><label>Dates already booked (blocked from search) — one per line, YYYY-MM-DD</label><textarea name="blocked">${esc((v.blockedDates || []).join('\n'))}</textarea></div>`}
        </div>
        <div class="card stack"><h3 style="margin:0">Portfolio (up to 6 images)</h3><div class="gallery" id="gal">${(v.portfolio || []).map((s, i) => `<div style="position:relative"><img src="${s}"><button type="button" class="badge bad" style="position:absolute;top:4px;right:4px;border:0;cursor:pointer" data-act="rmImg" data-i="${i}">✕</button></div>`).join('')}</div><input type="file" id="addImgs" accept="image/*" multiple></div>
        <button class="btn block">${t('save')}</button>
      </form></div>`,
    mount() {
      let portfolio = [...(v.portfolio || [])];
      const drawGal = () => { $('#gal').innerHTML = portfolio.map((s, i) => `<div style="position:relative"><img src="${s}"><button type="button" class="badge bad" style="position:absolute;top:4px;right:4px;border:0;cursor:pointer" data-act="rmImg" data-i="${i}">✕</button></div>`).join(''); };
      $('#addImgs').onchange = async (e) => { for (const f of [...e.target.files]) { if (portfolio.length >= 6) break; portfolio.push(await compressImage(f)); } drawGal(); };
      $('#svc').onclick = (e) => {
        const a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'addPkg') $('#pkgs').insertAdjacentHTML('beforeend', pkgRow());
        if (a.dataset.act === 'rmPkg') a.closest('[data-pkg]').remove();
        if (a.dataset.act === 'rmImg') { portfolio.splice(Number(a.dataset.i), 1); drawGal(); }
      };
      $('#svc').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const packages = $$('[data-pkg]').map((el) => ({ id: el.dataset.pkg, name: $('[data-f=name]', el).value.trim(), price: Number($('[data-f=price]', el).value), unit: $('[data-f=unit]', el).value, inclusions: $('[data-f=inclusions]', el).value.split('\n').map((x) => x.trim()).filter(Boolean) })).filter((k) => k.name);
        const prices = packages.map((k) => k.price).filter((n) => n > 0);
        const cheapest = packages.find((k) => k.price === Math.min(...prices));
        const blocked = venue ? [] : fd.get('blocked').split('\n').map((x) => x.trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x));
        const slotPrices = venue ? Object.fromEntries(SLOTS.map((x) => [x.id, Number(fd.get('price_' + x.id)) || 0])) : null;
        const venuePatch = venue ? { category: fd.get('category'), seating: Number(fd.get('seating')), dining: Number(fd.get('dining')) || 0, parking: Number(fd.get('parking')) || 0, rooms: Number(fd.get('rooms')) || 0, ac: fd.get('ac'), catering: fd.get('catering'), amenities: fd.getAll('amen'), slotPrices, startingPrice: Math.min(...[slotPrices.morning, slotPrices.evening, slotPrices.full].filter((n) => n > 0).concat([]).slice(0, 3), ...([slotPrices.morning, slotPrices.evening, slotPrices.full].some((n) => n > 0) ? [] : [0])), priceUnit: ' per slot' } : {};
        const patch = { packages, startingPrice: prices.length ? Math.min(...prices) : 0, priceUnit: cheapest?.unit || '', ...venuePatch, description: fd.get('description'), policies: fd.get('policies'), offer: fd.get('offer'), videos: fd.get('videos').split(',').map((x) => x.trim()).filter(Boolean), traditions: fd.getAll('trad'), blockedDates: blocked, portfolio };
        try { await db.update('vendors', S.user.uid, patch); Object.assign(S.vendor, patch); vendorCache = null; toast('Saved'); } catch (err) { toast(err.message.includes('size') ? 'Images too large — remove one and try again' : err.message); }
      };
    },
  };
}

// =====================================================================
// ADMIN VIEWS
// =====================================================================
async function viewAdmin(tab) {
  if (role() !== 'admin') return { html: needLogin() };
  const [vs, us, es] = await Promise.all([db.list('vendors'), db.list('users'), db.list('enquiries')]);
  const pending = vs.filter((v) => v.status === 'pending');
  const conf = es.filter((e) => e.status === 'confirmed');
  const stat = (n, l) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`;
  const vRow = (v) => `<div class="list-item"><div><a href="#/v/${v.id}"><b>${esc(v.businessName)}</b></a> ${v.isDemo ? '<span class="badge demo">Demo</span>' : ''}<div class="small muted">${esc(catName(v.category))} · ${esc(v.town)}, ${esc(distName(v.district))}${v.phone ? ' · ' + esc(v.phone) : ''}${v.gst ? ' · GST ' + esc(v.gst) : ''}${v.isReal ? ' · real listing (unclaimed)' : ''}</div>
      ${v.claimOf ? `<div class="small" style="color:var(--warn);font-weight:600">Claim of: ${esc(vs.find((x) => x.id === v.claimOf)?.businessName || v.claimOf)} — call the owner to confirm before approving</div>` : ''}
      <div class="row wrap-x small" style="margin-top:4px"><span class="badge ${v.status === 'approved' ? 'ok' : v.status === 'pending' ? 'warn' : 'bad'}">${esc(v.status)}</span>${v.verified ? '<span class="badge">✔ verified</span>' : ''}${v.featured ? '<span class="badge gold">featured</span>' : ''}</div></div>
    <div class="row wrap-x" style="justify-content:flex-end">
      ${v.status === 'pending' ? `<button class="btn sm green" data-act="approve" data-id="${v.id}">Approve & verify</button><button class="btn sm ghost" data-act="reject" data-id="${v.id}">Reject</button>` : ''}
      ${v.status === 'approved' ? `<button class="btn sm ghost" data-act="toggle" data-f="verified" data-id="${v.id}">${v.verified ? 'Unverify' : 'Verify'}</button><button class="btn sm ghost" data-act="toggle" data-f="featured" data-id="${v.id}">${v.featured ? 'Unfeature' : 'Feature'}</button><button class="btn sm ghost" style="color:var(--bad);border-color:var(--bad)" data-act="suspend" data-id="${v.id}">Suspend</button>` : ''}
      ${['suspended', 'rejected', 'archived'].includes(v.status) ? `<button class="btn sm ghost" data-act="restore" data-id="${v.id}">Restore</button>` : ''}
    </div></div>`;
  let body = '';
  if (!tab) {
    body = `<div class="stat-grid">${stat(us.filter((u) => u.role === 'customer').length, 'Customers')}${stat(vs.filter((v) => v.status === 'approved').length, 'Live vendors')}${stat(pending.length, 'Awaiting verification')}${stat(es.length, 'Enquiries')}${stat(conf.length, 'Confirmed bookings')}${stat(money(conf.reduce((s, e) => s + (e.finalAmount || 0), 0)), 'Booking value')}</div>
      <div class="card"><h3>Verification queue</h3>${pending.map(vRow).join('') || '<p class="muted small">No vendors waiting.</p>'}</div>
      <div class="card stack"><h3 style="margin:0">Demo data</h3><p class="small muted" style="margin:0">${vs.filter((v) => v.isDemo).length} demo vendors loaded. Demo vendors are labelled “Demo” everywhere in the app.</p>
        <div class="row wrap-x"><button class="btn sm" data-act="seed">Load demo venues</button><button class="btn sm ghost" data-act="unseed">Hide demo venues</button></div></div>
      <div class="card stack"><h3 style="margin:0">Real halls</h3><p class="small muted" style="margin:0">${vs.filter((v) => v.isReal).length} real halls loaded (Chavakkad – Ponnani highway), ${vs.filter((v) => v.isReal && v.claimed).length} claimed by owners. Only name, type, locality and Google Maps place ID are stored.</p>
        <div class="row wrap-x"><button class="btn sm" data-act="loadReal">Load real halls</button></div></div>
      <div class="card"><h3>Possible duplicates</h3>${dupes(vs) || '<p class="muted small">No vendors share a phone number.</p>'}</div>
      <p class="small muted">Commission, subscriptions, coupons, banners and payment tracking arrive in Phases 2–3.</p>`;
  } else if (tab === 'vendors') {
    body = `<div class="card">${vs.sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1)).map(vRow).join('') || '<p class="muted">No vendors.</p>'}</div>`;
  } else if (tab === 'customers') {
    body = `<div class="card">${us.map((u) => `<div class="list-item"><div><b>${esc(u.name || 'Unnamed')}</b><div class="small muted">${esc(u.phone || u.email || '')} · ${esc(u.role)}</div></div><span class="small muted">${es.filter((e) => e.customerId === u.id).length} enquiries</span></div>`).join('')}</div>`;
  } else if (tab === 'enquiries') {
    body = `<div class="card">${es.sort((a, b) => b.createdAt - a.createdAt).map((e) => `<a class="list-item" href="#/enquiry/${e.id}" style="color:var(--ink)"><div><b>${esc(e.customerName)} → ${esc(e.vendorName)}</b><div class="small muted">${esc(e.eventType)} · ${fmtDate(e.date)}${e.finalAmount ? ' · ' + money(e.finalAmount) : ''}</div></div>${statusBadge(e.status)}</a>`).join('') || '<p class="muted">No enquiries yet.</p>'}</div>`;
  }
  return {
    html: `<div class="wrap stack" style="padding-top:16px"><h1>Admin${tab ? ' · ' + tab[0].toUpperCase() + tab.slice(1) : ''}</h1>${body}</div>`,
    mount() {
      $('#view').onclick = async (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const id = b.dataset.id; const v = vs.find((x) => x.id === id);
        const a = b.dataset.act;
        if (a === 'approve') { await db.update('vendors', id, { status: 'approved', verified: true, verifiedAt: Date.now() }); if (v.claimOf) await db.update('vendors', v.claimOf, { status: 'claimed', claimed: true, claimedBy: id }); }
        if (a === 'reject') await db.update('vendors', id, { status: 'rejected' });
        if (a === 'suspend' && confirm('Suspend this vendor? Their listing will be hidden.')) await db.update('vendors', id, { status: 'suspended' });
        if (a === 'restore') await db.update('vendors', id, { status: 'approved' });
        if (a === 'toggle') await db.update('vendors', id, { [b.dataset.f]: !v[b.dataset.f] });
        if (a === 'seed') { b.disabled = true; for (const s of buildSeedVendors()) { const { id: sid, ...rest } = s; await db.set('vendors', sid, rest); } for (const k of buildSeedBookings()) { const { id: kid, ...rest } = k; await db.set('slots', kid, rest).catch(() => {}); } toast('Demo venues loaded'); }
        if (a === 'loadReal') { b.disabled = true; const have = new Set(vs.map((x) => x.id)); for (const r of buildRealHalls()) { if (have.has(r.id)) continue; const { id: rid, ...rest } = r; await db.set('vendors', rid, rest); } toast('Real halls loaded'); }
        if (a === 'unseed') { for (const s of vs.filter((x) => x.isDemo)) await db.update('vendors', s.id, { status: 'archived' }); toast('Demo vendors hidden'); }
        vendorCache = null; render();
      };
    },
  };
}
function dupes(vs) {
  const by = {}; vs.forEach((v) => { const k = (v.phone || '').replace(/\D/g, ''); if (k) (by[k] = by[k] || []).push(v); });
  return Object.values(by).filter((g) => g.length > 1).map((g) => `<div class="list-item"><div class="small">${g.map((v) => esc(v.businessName)).join(' · ')}</div><span class="badge warn">same phone</span></div>`).join('');
}

// =====================================================================
// ROUTER
// =====================================================================
async function route() {
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const params = new URLSearchParams(qs || '');
  const parts = path.split('/').filter(Boolean);
  const r = role();
  if (!parts.length) {
    if (r === 'vendor') return S.vendor ? viewVendorDash() : viewVendorRegister();
    if (r === 'admin') return viewAdmin();
    return viewHome();
  }
  switch (parts[0]) {
    case 'explore': return viewExplore(params);
    case 'v': return viewVendor(parts[1]);
    case 'enquire': return viewEnquire(parts[1], params);
    case 'enquiry': return viewEnquiry(parts[1]);
    case 'bookings': return viewBookings();
    case 'events': return viewEvents();
    case 'compare': return viewCompare(parts[1]);
    case 'login': return viewLogin(params);
    case 'profile': return viewProfile();
    case 'vendor':
      if (parts[1] === 'register') return viewVendorRegister(params);
      if (r !== 'vendor' || !S.vendor) { if (S.user && r !== 'admin') return viewVendorRegister(); return { html: needLogin() }; }
      if (parts[1] === 'enquiries') return viewVendorEnquiries(false);
      if (parts[1] === 'bookings') return viewVendorEnquiries(true);
      if (parts[1] === 'services') return viewVendorServices();
      if (parts[1] === 'calendar') return viewVendorCalendar();
      return viewVendorDash();
    case 'admin': return viewAdmin(parts[1]);
    default: return { html: '<div class="wrap empty">Page not found.</div>' };
  }
}

let renderId = 0;
async function render() {
  if (!S.ready) return;
  const my = ++renderId;
  const app = $('#app');
  try {
    const v = await route();
    if (my !== renderId) return;
    app.innerHTML = shell(v.html);
    $('[data-act=lang]').onclick = async () => { setLang(getLang() === 'en' ? 'ml' : 'en'); if (S.user) db.update('users', S.user.uid, { lang: getLang() }).catch(() => {}); render(); };
    document.addEventListener('click', favHandler);
    v.mount && v.mount();
    if (!location.hash.includes('?') || !location.hash.startsWith('#/explore')) window.scrollTo(0, 0);
  } catch (err) {
    console.error(err);
    app.innerHTML = shell(`<div class="wrap empty">Something went wrong: ${esc(err.message)}</div>`);
  }
}
async function favHandler(e) {
  const b = e.target.closest('[data-act=fav]'); if (!b) return;
  e.stopImmediatePropagation();
  if (!S.user) return go('#/login?next=' + encodeURIComponent(location.hash));
  const id = b.dataset.id; const list = new Set(S.profile.favourites || []);
  list.has(id) ? list.delete(id) : list.add(id);
  S.profile.favourites = [...list];
  await db.update('users', S.user.uid, { favourites: S.profile.favourites });
  b.textContent = list.has(id) ? '♥ Saved' : '♡ Save';
}

setLang(getLang());
window.addEventListener('hashchange', render);
auth.onChange((u) => loadSession(u));
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
