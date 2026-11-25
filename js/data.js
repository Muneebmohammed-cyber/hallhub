// Static reference data: districts, categories, traditions, and demo seed vendors.

export const DISTRICTS = [
  { id: 'tvm', en: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം', towns: ['Thiruvananthapuram City', 'Neyyattinkara', 'Attingal', 'Varkala', 'Nedumangad', 'Kovalam'] },
  { id: 'klm', en: 'Kollam', ml: 'കൊല്ലം', towns: ['Kollam City', 'Karunagappally', 'Punalur', 'Kottarakkara', 'Paravur'] },
  { id: 'pta', en: 'Pathanamthitta', ml: 'പത്തനംതിട്ട', towns: ['Pathanamthitta', 'Thiruvalla', 'Adoor', 'Ranni', 'Konni'] },
  { id: 'alp', en: 'Alappuzha', ml: 'ആലപ്പുഴ', towns: ['Alappuzha', 'Cherthala', 'Kayamkulam', 'Mavelikkara', 'Kuttanad', 'Haripad'] },
  { id: 'ktm', en: 'Kottayam', ml: 'കോട്ടയം', towns: ['Kottayam', 'Changanassery', 'Pala', 'Ettumanoor', 'Kumarakom', 'Vaikom'] },
  { id: 'idk', en: 'Idukki', ml: 'ഇടുക്കി', towns: ['Thodupuzha', 'Munnar', 'Kattappana', 'Adimali', 'Kumily'] },
  { id: 'ekm', en: 'Ernakulam', ml: 'എറണാകുളം', towns: ['Kochi', 'Aluva', 'Kakkanad', 'Perumbavoor', 'Muvattupuzha', 'Angamaly', 'Fort Kochi'] },
  { id: 'tsr', en: 'Thrissur', ml: 'തൃശ്ശൂർ', towns: ['Thrissur', 'Guruvayur', 'Chalakudy', 'Kodungallur', 'Irinjalakuda', 'Kunnamkulam'] },
  { id: 'pkd', en: 'Palakkad', ml: 'പാലക്കാട്', towns: ['Palakkad', 'Ottapalam', 'Shoranur', 'Mannarkkad', 'Chittur', 'Pattambi'] },
  { id: 'mlp', en: 'Malappuram', ml: 'മലപ്പുറം', towns: ['Malappuram', 'Manjeri', 'Tirur', 'Perinthalmanna', 'Kottakkal', 'Nilambur', 'Ponnani'] },
  { id: 'kkd', en: 'Kozhikode', ml: 'കോഴിക്കോട്', towns: ['Kozhikode', 'Vadakara', 'Koyilandy', 'Feroke', 'Thamarassery'] },
  { id: 'wyd', en: 'Wayanad', ml: 'വയനാട്', towns: ['Kalpetta', 'Sulthan Bathery', 'Mananthavady', 'Vythiri'] },
  { id: 'knr', en: 'Kannur', ml: 'കണ്ണൂർ', towns: ['Kannur', 'Thalassery', 'Payyanur', 'Taliparamba', 'Mattannur'] },
  { id: 'ksd', en: 'Kasaragod', ml: 'കാസർഗോഡ്', towns: ['Kasaragod', 'Kanhangad', 'Nileshwaram', 'Bekal', 'Uppala'] },
];

export const CATEGORY_GROUPS = [
  { id: 'venues', en: 'Halls & Venues', ml: 'ഹാളുകളും വേദികളും' },
  { id: 'wedding', en: 'Wedding Services', ml: 'വിവാഹ സേവനങ്ങൾ' },
  { id: 'kerala', en: 'Kerala Traditions', ml: 'കേരള പാരമ്പര്യം' },
  { id: 'event', en: 'Event Services', ml: 'ഇവന്റ് സേവനങ്ങൾ' },
  { id: 'extra', en: 'Additional Services', ml: 'മറ്റ് സേവനങ്ങൾ' },
];

const c = (id, en, group, icon) => ({ id, en, group, icon });
export const CATEGORIES = [
  c('auditorium', 'Auditoriums', 'venues', '🏛️'),
  c('convention', 'Convention Centres', 'venues', '🏟️'),
  c('community-hall', 'Community & Parish Halls', 'venues', '🏠'),
  c('resort', 'Resort & Lawn Venues', 'venues', '🏝️'),
  c('backwater', 'Backwater Venues', 'venues', '🌴'),
  c('houseboat', 'Houseboat Venues', 'venues', '🛶'),
  c('photography', 'Wedding Photographers', 'wedding', '📷'),
  c('cinematography', 'Cinematographers', 'wedding', '🎬'),
  c('planner', 'Wedding Planners', 'wedding', '📋'),
  c('decor', 'Wedding Decorators', 'wedding', '🌸'),
  c('mandapam', 'Stage & Mandapam Decor', 'wedding', '🛕'),
  c('bridal-makeup', 'Bridal Makeup Artists', 'wedding', '💄'),
  c('boutique', 'Bridal Wear & Boutiques', 'wedding', '👗'),
  c('invitations', 'Invitation Designers', 'wedding', '💌'),
  c('dj', 'Entertainment & DJs', 'wedding', '🎧'),
  c('catering', 'Wedding Catering', 'wedding', '🍽️'),
  c('mehendi', 'Mehendi Artists', 'wedding', '🌿'),
  c('cake', 'Wedding Cakes', 'wedding', '🎂'),
  c('chenda', 'Chenda Melam', 'kerala', '🥁'),
  c('panchavadyam', 'Panchavadyam', 'kerala', '🎺'),
  c('sadya', 'Traditional Kerala Sadya', 'kerala', '🍛'),
  c('trad-decor', 'Traditional Kerala Decor', 'kerala', '🪔'),
  c('event-mgmt', 'Event Management', 'event', '🎪'),
  c('sound-light', 'Sound & Lighting', 'event', '💡'),
  c('anchor', 'Anchors & Emcees', 'event', '🎤'),
  c('rentals', 'Furniture & Equipment Rentals', 'event', '🪑'),
  c('flowers', 'Flower Decorators', 'event', '💐'),
  c('car-rental', 'Wedding Car Rentals', 'extra', '🚗'),
  c('guest-transport', 'Guest Transportation', 'extra', '🚌'),
  c('accommodation', 'Accommodation', 'extra', '🏨'),
  c('return-gifts', 'Return Gifts', 'extra', '🎁'),
];
export const VENUE_CATS = CATEGORIES.filter((x) => x.group === 'venues').map((x) => x.id);
export const isVenue = (v) => VENUE_CATS.includes(v?.category);

// Booking slots. A full-day booking takes both halves, so it is stored as two half-day slots.
export const SLOTS = [
  { id: 'morning', en: 'Morning', ml: 'രാവിലെ', time: '7 am – 3 pm' },
  { id: 'evening', en: 'Evening', ml: 'വൈകുന്നേരം', time: '4 pm – 11 pm' },
  { id: 'full', en: 'Full day', ml: 'മുഴുവൻ ദിവസം', time: '7 am – 11 pm' },
];
export const slotById = (id) => SLOTS.find((s) => s.id === id);
export const halvesOf = (slot) => (slot === 'full' ? ['morning', 'evening'] : [slot]);
export function slotFree(taken, slot) { return halvesOf(slot).every((h) => !taken.includes(h)); }

export const AC_TYPES = ['Fully air-conditioned', 'AC hall, non-AC dining', 'Non-AC'];
export const CATERING_RULES = ['Outside caterers allowed', 'In-house catering only', 'In-house or outside'];
export const AMENITIES = ['Stage', 'Bridal room', 'Groom room', 'Dining hall', 'Sadya kitchen', 'Generator backup', 'Lift', 'Wheelchair access', 'Sound system', 'Projector & screen', 'Prayer room', 'Valet parking', 'Guest rooms', 'Lawn / open area', 'CCTV & security'];

export const EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Birthday', 'Housewarming', 'Corporate Event', 'Conference', 'Other'];
export const TRADITIONS = ['Hindu', 'Muslim', 'Christian', 'Traditional Kerala', 'Destination', 'Interfaith', 'Not specified'];

export const catById = (id) => CATEGORIES.find((x) => x.id === id);
export const districtById = (id) => DISTRICTS.find((x) => x.id === id);

// ---------------- Demo seed data (fictional, clearly marked) ----------------
// Venues: [name, type, district, town, seating, dining, parking, acIdx, cateringIdx, morning, evening, full, rating, reviews, featured]
const VENUES = [
  ['Sree Lakshmi Auditorium', 'auditorium', 'tvm', 'Neyyattinkara', 1200, 600, 150, 0, 0, 65000, 55000, 105000, 4.7, 142, true],
  ['Capital Convention Centre', 'convention', 'tvm', 'Thiruvananthapuram City', 2500, 1200, 400, 0, 2, 180000, 160000, 300000, 4.8, 96, true],
  ['Ashtamudi Lakeview Hall', 'auditorium', 'klm', 'Kollam City', 900, 450, 120, 1, 0, 45000, 40000, 75000, 4.5, 88, false],
  ['St. Mary’s Parish Hall', 'community-hall', 'klm', 'Kottarakkara', 600, 300, 60, 2, 0, 18000, 15000, 30000, 4.4, 51, false],
  ['Pamba Valley Auditorium', 'auditorium', 'pta', 'Thiruvalla', 1000, 500, 140, 0, 0, 55000, 48000, 90000, 4.6, 73, false],
  ['Kayal Convention Centre', 'convention', 'alp', 'Alappuzha', 1800, 900, 250, 0, 2, 120000, 100000, 200000, 4.7, 110, true],
  ['Vembanad Houseboat Weddings', 'houseboat', 'alp', 'Kuttanad', 80, 60, 20, 0, 1, 90000, 90000, 150000, 4.9, 42, true],
  ['Nila Community Hall', 'community-hall', 'alp', 'Cherthala', 500, 250, 50, 2, 0, 15000, 12000, 25000, 4.3, 39, false],
  ['Kumarakom Lakeside Resort', 'backwater', 'ktm', 'Kumarakom', 400, 400, 100, 0, 1, 200000, 220000, 380000, 4.8, 55, true],
  ['Meenachil Auditorium', 'auditorium', 'ktm', 'Pala', 1100, 550, 160, 1, 0, 50000, 45000, 85000, 4.6, 91, false],
  ['Hilltop Mist Resort', 'resort', 'idk', 'Munnar', 300, 300, 80, 2, 1, 150000, 170000, 280000, 4.7, 47, false],
  ['Thodupuzha Town Hall', 'community-hall', 'idk', 'Thodupuzha', 700, 350, 70, 2, 0, 20000, 18000, 35000, 4.2, 33, false],
  ['Grand Pearl Convention Centre', 'convention', 'ekm', 'Kakkanad', 3000, 1500, 500, 0, 2, 220000, 200000, 380000, 4.8, 133, true],
  ['Periyar Riverside Auditorium', 'auditorium', 'ekm', 'Aluva', 1400, 700, 200, 0, 0, 80000, 70000, 135000, 4.6, 118, false],
  ['Fort Heritage Courtyard', 'resort', 'ekm', 'Fort Kochi', 350, 300, 40, 1, 1, 120000, 140000, 230000, 4.7, 64, false],
  ['Vadakkumnathan Auditorium', 'auditorium', 'tsr', 'Thrissur', 1500, 750, 220, 0, 0, 75000, 65000, 125000, 4.7, 156, true],
  ['Guruvayur Kalyana Mandapam', 'auditorium', 'tsr', 'Guruvayur', 1000, 500, 150, 1, 2, 40000, 35000, 65000, 4.8, 201, true],
  ['Chalakudy Community Centre', 'community-hall', 'tsr', 'Chalakudy', 650, 320, 80, 2, 0, 16000, 14000, 26000, 4.3, 44, false],
  ['Malampuzha Garden Venue', 'resort', 'pkd', 'Palakkad', 800, 500, 200, 2, 0, 60000, 70000, 115000, 4.5, 37, false],
  ['Ottapalam Grand Auditorium', 'auditorium', 'pkd', 'Ottapalam', 1200, 600, 180, 1, 0, 48000, 42000, 80000, 4.5, 62, false],
  ['Malabar Palace Auditorium', 'auditorium', 'mlp', 'Manjeri', 2000, 1000, 300, 0, 0, 90000, 85000, 160000, 4.8, 174, true],
  ['Kottakkal Convention Centre', 'convention', 'mlp', 'Kottakkal', 2200, 1100, 280, 0, 2, 110000, 100000, 190000, 4.7, 98, false],
  ['Tirur Town Auditorium', 'auditorium', 'mlp', 'Tirur', 1300, 650, 160, 1, 0, 55000, 50000, 95000, 4.5, 80, false],
  ['Calicut Trade Centre', 'convention', 'kkd', 'Kozhikode', 2800, 1400, 450, 0, 2, 200000, 180000, 340000, 4.8, 121, true],
  ['Beach Road Auditorium', 'auditorium', 'kkd', 'Kozhikode', 1200, 600, 150, 0, 0, 70000, 65000, 120000, 4.6, 102, false],
  ['Vythiri Woods Resort', 'resort', 'wyd', 'Vythiri', 250, 250, 60, 2, 1, 130000, 150000, 250000, 4.7, 29, false],
  ['Kalpetta Municipal Hall', 'community-hall', 'wyd', 'Kalpetta', 600, 300, 50, 2, 0, 14000, 12000, 24000, 4.2, 26, false],
  ['Thalassery Heritage Auditorium', 'auditorium', 'knr', 'Thalassery', 1100, 550, 140, 1, 0, 52000, 46000, 88000, 4.6, 77, false],
  ['Kannur Convention Centre', 'convention', 'knr', 'Kannur', 1800, 900, 260, 0, 2, 95000, 85000, 165000, 4.7, 69, false],
  ['Bekal Fort View Venue', 'resort', 'ksd', 'Bekal', 500, 400, 120, 1, 1, 90000, 110000, 180000, 4.6, 33, false],
  ['Kanhangad Auditorium', 'auditorium', 'ksd', 'Kanhangad', 1000, 500, 130, 1, 0, 42000, 38000, 72000, 4.4, 41, false],
];

// Add-on services: [name, category, district, town, startPrice, unit, rating, reviews]
const SERVICES = [
  ['Kayal Frames Studio', 'photography', 'alp', 'Alappuzha', 45000, '', 4.8, 126],
  ['Mizhi Wedding Stories', 'cinematography', 'ekm', 'Kochi', 85000, '', 4.9, 98],
  ['Thalam Chenda Sangham', 'chenda', 'tsr', 'Thrissur', 18000, '', 4.9, 61],
  ['Annapoorna Sadya Caterers', 'sadya', 'ktm', 'Kottayam', 350, ' per plate', 4.7, 210],
  ['Malabar Biriyani House Catering', 'catering', 'mlp', 'Manjeri', 450, ' per plate', 4.8, 167],
  ['Swarna Bridal Studio', 'bridal-makeup', 'tvm', 'Thiruvananthapuram City', 25000, '', 4.8, 152],
  ['Kalyanamandapam Stage Works', 'mandapam', 'tsr', 'Guruvayur', 45000, '', 4.7, 81],
  ['Mylanchi Mehendi Arts', 'mehendi', 'mlp', 'Kottakkal', 6000, '', 4.9, 93],
];

const PALETTES = [
  ['#7a1f2b', '#c9a35b'], ['#5b1520', '#e2c58b'], ['#8c3b2e', '#d9b36c'], ['#3f2a1d', '#c9a35b'],
  ['#6d2338', '#f0d9a7'], ['#2f4a3a', '#c9a35b'], ['#7a4a1f', '#f3e2b8'], ['#4a1a2c', '#d6b16a'],
];

const POLICY = 'Slot held for 48 hours after the quotation. Booking confirmed on 25% advance. Date change allowed once, up to 60 days before the event. Advance is non-refundable within 30 days of the event. Electricity beyond the slot and cleaning charges as per actuals.';

function base(i, id, name, category, district, town) {
  const d = districtById(district);
  return {
    id, ownerId: id, isDemo: true, businessName: name, ownerName: 'Demo Owner',
    phone: '+91 90000 0' + String(1000 + i), whatsapp: '919000001' + String(100 + i), email: `demo${i}@example.com`,
    category, district, town, address: `${town}, ${d.en}, Kerala`,
    serviceDistricts: [district], policies: POLICY, traditions: ['Hindu', 'Muslim', 'Christian', 'Traditional Kerala'],
    palette: PALETTES[i % PALETTES.length], portfolio: [], status: 'approved', verified: i % 4 !== 3,
    views: 200 + ((i * 137) % 900), createdAt: Date.now() - i * 86400000 * 2, offer: '',
  };
}

export function buildSeedVendors() {
  const venues = VENUES.map(([name, cat, district, town, seating, dining, parking, ac, catering, m, e, f, rating, reviews, featured], i) => {
    const id = i === 0 ? 'demo_vendor' : `demo_v${String(i).padStart(2, '0')}`;
    const am = AMENITIES.filter((_, k) => (k + i) % 3 !== 0 || k < 4);
    return {
      ...base(i, id, name, cat, district, town),
      description: `${name} is a ${catById(cat).en.toLowerCase().replace(/s$/, '')} in ${town}, ${districtById(district).en}, with seating for ${seating} guests and a ${dining}-seat dining hall. Hosts Hindu, Muslim, Christian and traditional Kerala weddings, receptions and functions. (Demo listing for testing.)`,
      seating, dining, parking, rooms: 2 + (i % 4), ac: AC_TYPES[ac], catering: CATERING_RULES[catering], amenities: am,
      slotPrices: { morning: m, evening: e, full: f }, startingPrice: Math.min(m, e), priceUnit: ' per slot',
      rating, reviewCount: reviews, featured, offer: i % 6 === 0 ? 'Weekday bookings 15% off' : '',
    };
  });
  const services = SERVICES.map(([name, cat, district, town, price, unit, rating, reviews], j) => {
    const i = VENUES.length + j;
    return {
      ...base(i, `demo_s${String(j).padStart(2, '0')}`, name, cat, district, town),
      description: `${name} offers ${catById(cat).en.toLowerCase()} in ${town} and nearby districts. (Demo listing for testing.)`,
      startingPrice: price, priceUnit: unit, rating, reviewCount: reviews, featured: false,
      packages: [
        { id: 'p1', name: 'Essential', price, unit, inclusions: ['Core service for the main event', 'Standard setup'] },
        { id: 'p2', name: 'Signature', price: Math.round(price * 1.7), unit, inclusions: ['Everything in Essential', 'Extended hours', 'Premium materials'] },
      ],
    };
  });
  return [...venues, ...services];
}

// A few booked slots so the availability calendar shows something in demo mode.
export function buildSeedBookings() {
  const out = []; const d0 = new Date();
  [['demo_vendor', 3, 'morning'], ['demo_vendor', 3, 'evening'], ['demo_vendor', 10, 'morning'], ['demo_vendor', 17, 'evening'],
    ['demo_v12', 5, 'morning'], ['demo_v15', 6, 'morning'], ['demo_v15', 6, 'evening'], ['demo_v20', 8, 'evening']].forEach(([v, days, slot]) => {
    const d = new Date(d0.getTime() + days * 86400000).toISOString().slice(0, 10);
    out.push({ id: `${v}_${d}_${slot}`, venueId: v, date: d, half: slot, source: 'manual', note: 'Offline booking (demo)' });
  });
  return out;
}

export const SEED_REVIEWS = [
  { name: 'Anjali & Rahul', district: 'Kottayam', text: 'We checked which auditoriums were free on our date in one search, instead of calling ten halls.', rating: 5 },
  { name: 'Fathima N.', district: 'Malappuram', text: 'Comparing hall rent, dining capacity and parking side by side made the choice easy.', rating: 5 },
  { name: 'Joseph & Mariya', district: 'Ernakulam', text: 'Negotiated the evening slot price in the app, and everything stayed in writing.', rating: 4 },
];
