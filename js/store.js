// Data + auth layer. Same API for Firebase (live) and demo (localStorage) backends.
// db.get(col, id) · db.list(col, [field, value]?) · db.add(col, data) · db.set(col, id, data) · db.update(col, id, patch)
// auth.onChange(cb) · auth.google() · auth.sendOtp(phone, buttonId) · auth.verifyOtp(code) · auth.demo(role) · auth.signOut()
import { firebaseConfig, DEMO_MODE } from './config.js';
import { buildSeedVendors, buildSeedBookings, buildRealHalls, buildSeedRegister } from './data.js';

export let db, auth;

if (DEMO_MODE) {
  const KEY = 'hh_demo_db_v8';
  const load = () => JSON.parse(localStorage.getItem(KEY) || 'null');
  const persist = (s) => localStorage.setItem(KEY, JSON.stringify(s));
  let state = load();
  if (!state) {
    state = { users: {}, vendors: {}, enquiries: {}, quotations: {}, events: {}, slots: {}, register: {}, verifications: {}, transfers: {} };
    buildSeedVendors().forEach((v) => { state.vendors[v.id] = v; });
    buildRealHalls().forEach((v) => { state.vendors[v.id] = v; });
    buildSeedBookings().forEach((b) => { state.slots[b.id] = b; });
    const sr = buildSeedRegister(); sr.register.forEach((r) => { state.register[r.id] = r; const code = 'FK-' + r.id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase(); state.verifications[code] = { id: code, code, venueId: r.venueId, venueName: 'Sree Lakshmi Auditorium', date: r.date, slot: r.slot, customerInitials: r.customerName.split(' ').map((w) => w[0] + '.').join(' '), status: 'confirmed', source: 'register' }; }); sr.slots.forEach((b) => { state.slots[b.id] = b; });
    state.users.demo_customer = { id: 'demo_customer', name: 'Demo Customer', phone: '+91 90000 00001', role: 'customer', isDemo: true };
    state.users.demo_vendor = { id: 'demo_vendor', name: 'Demo Vendor', phone: '+91 90000 01000', role: 'vendor', isDemo: true };
    state.users.demo_admin = { id: 'demo_admin', name: 'Demo Admin', role: 'admin', isDemo: true };
    persist(state);
  }
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  db = {
    async get(col, id) { const r = state[col]?.[id]; return r ? clone(r) : null; },
    async list(col, where) {
      let rows = Object.values(state[col] || {});
      if (where) rows = rows.filter((r) => r[where[0]] === where[1]);
      return clone(rows);
    },
    async add(col, data) { const id = uid(); state[col][id] = { ...data, id, createdAt: Date.now() }; persist(state); return id; },
    async set(col, id, data) { state[col][id] = { ...data, id }; persist(state); return id; },
    async update(col, id, patch) { state[col][id] = { ...state[col][id], ...patch, updatedAt: Date.now() }; persist(state); },
    async remove(col, id) { delete state[col][id]; persist(state); },
    // Create several docs at once; fails (writing nothing) if any already exists — used to block double bookings.
    async createMany(col, docs) {
      if (docs.some(([id]) => state[col][id])) throw new Error('ALREADY_TAKEN');
      docs.forEach(([id, data]) => { state[col][id] = { ...data, id, createdAt: Date.now() }; }); persist(state);
    },
    async reset() { localStorage.removeItem(KEY); },
  };
  let listener = () => {};
  const current = () => localStorage.getItem('hh_demo_uid');
  auth = {
    onChange(cb) { listener = cb; cb(current() ? { uid: current() } : null); },
    async demo(role) { localStorage.setItem('hh_demo_uid', 'demo_' + role); listener({ uid: 'demo_' + role }); },
    async google() { throw new Error('Google sign-in needs Firebase. Use a demo account in demo mode.'); },
    async sendOtp() { throw new Error('OTP needs Firebase. Use a demo account in demo mode.'); },
    async verifyOtp() {},
    async signOut() { localStorage.removeItem('hh_demo_uid'); listener(null); },
  };
} else {
  const V = '10.12.2';
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const fa = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
  const fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
  const app = initializeApp(firebaseConfig);
  const A = fa.getAuth(app);
  const F = fs.getFirestore(app);
  let confirmation = null;
  db = {
    async get(col, id) { const s = await fs.getDoc(fs.doc(F, col, id)); return s.exists() ? { ...s.data(), id: s.id } : null; },
    async list(col, where) {
      const q = where ? fs.query(fs.collection(F, col), fs.where(where[0], '==', where[1])) : fs.collection(F, col);
      const s = await fs.getDocs(q);
      return s.docs.map((d) => ({ ...d.data(), id: d.id }));
    },
    async add(col, data) { const r = await fs.addDoc(fs.collection(F, col), { ...data, createdAt: Date.now() }); return r.id; },
    async set(col, id, data) { await fs.setDoc(fs.doc(F, col, id), data); return id; },
    async update(col, id, patch) { await fs.updateDoc(fs.doc(F, col, id), { ...patch, updatedAt: Date.now() }); },
    async remove(col, id) { await fs.deleteDoc(fs.doc(F, col, id)); },
    // Atomic: security rules only allow *creating* slot docs, so if any slot already exists the whole batch is rejected.
    async createMany(col, docs) {
      const b = fs.writeBatch(F);
      docs.forEach(([id, data]) => b.set(fs.doc(F, col, id), { ...data, createdAt: Date.now() }));
      try { await b.commit(); } catch (e) { throw new Error(e.code === 'permission-denied' ? 'ALREADY_TAKEN' : e.message); }
    },
    async reset() {},
  };
  auth = {
    onChange(cb) { fa.onAuthStateChanged(A, (u) => cb(u ? { uid: u.uid, phone: u.phoneNumber, name: u.displayName, email: u.email } : null)); },
    async google() { await fa.signInWithPopup(A, new fa.GoogleAuthProvider()); },
    async sendOtp(phone, buttonId) {
      if (!window._rc) window._rc = new fa.RecaptchaVerifier(A, buttonId, { size: 'invisible' });
      confirmation = await fa.signInWithPhoneNumber(A, phone, window._rc);
    },
    async verifyOtp(code) { await confirmation.confirm(code); },
    async demo() { throw new Error('Demo accounts are only available in demo mode.'); },
    async signOut() { await fa.signOut(A); },
  };
}
