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
  { id: 'wedding', en: 'Wedding Vendors', ml: 'വിവാഹ സേവനങ്ങൾ' },
  { id: 'kerala', en: 'Kerala Traditions', ml: 'കേരള പാരമ്പര്യം' },
  { id: 'event', en: 'Event Vendors', ml: 'ഇവന്റ് സേവനങ്ങൾ' },
  { id: 'extra', en: 'Additional Services', ml: 'മറ്റ് സേവനങ്ങൾ' },
];

const c = (id, en, group, icon) => ({ id, en, group, icon });
export const CATEGORIES = [
  c('photography', 'Wedding Photographers', 'wedding', '📷'),
  c('cinematography', 'Cinematographers', 'wedding', '🎬'),
  c('prewedding', 'Pre-wedding Photography', 'wedding', '🌅'),
  c('planner', 'Wedding Planners', 'wedding', '📋'),
  c('decor', 'Wedding Decorators', 'wedding', '🌸'),
  c('mandapam', 'Stage & Mandapam Decor', 'wedding', '🛕'),
  c('bridal-makeup', 'Bridal Makeup Artists', 'wedding', '💄'),
  c('groom-styling', 'Groom Makeup & Styling', 'wedding', '🤵'),
  c('boutique', 'Bridal Wear & Boutiques', 'wedding', '👗'),
  c('invitations', 'Invitation Designers', 'wedding', '💌'),
  c('jewellery', 'Wedding Jewellery', 'wedding', '💍'),
  c('dj', 'Entertainment & DJs', 'wedding', '🎧'),
  c('catering', 'Wedding Catering', 'wedding', '🍽️'),
  c('venue', 'Venues & Auditoriums', 'wedding', '🏛️'),
  c('resort', 'Resorts & Destination Venues', 'wedding', '🏝️'),
  c('mehendi', 'Mehendi Artists', 'wedding', '🌿'),
  c('bridal-transport', 'Bridal Transportation', 'wedding', '🚘'),
  c('cake', 'Wedding Cakes', 'wedding', '🎂'),
  c('chenda', 'Chenda Melam', 'kerala', '🥁'),
  c('panchavadyam', 'Panchavadyam', 'kerala', '🎺'),
  c('sadya', 'Traditional Kerala Sadya', 'kerala', '🍛'),
  c('elephant', 'Wedding Elephants (where legally permitted)', 'kerala', '🐘'),
  c('trad-decor', 'Traditional Kerala Decor', 'kerala', '🪔'),
  c('houseboat', 'Houseboat Wedding Venues', 'kerala', '🛶'),
  c('backwater', 'Backwater Wedding Venues', 'kerala', '🌴'),
  c('birthday', 'Birthday Party Planners', 'event', '🎈'),
  c('balloon', 'Balloon Decorators', 'event', '🎈'),
  c('event-mgmt', 'Event Management', 'event', '🎪'),
  c('corporate', 'Corporate Event Planners', 'event', '🏢'),
  c('sound-light', 'Sound & Lighting', 'event', '💡'),
  c('band', 'Live Bands & Musicians', 'event', '🎸'),
  c('anchor', 'Anchors & Emcees', 'event', '🎤'),
  c('magician', 'Magicians & Entertainers', 'event', '🎩'),
  c('rentals', 'Furniture & Equipment Rentals', 'event', '🪑'),
  c('tent', 'Tent & Stage Rentals', 'event', '⛺'),
  c('flowers', 'Flower Decorators', 'event', '💐'),
  c('event-catering', 'Event Catering', 'event', '🥘'),
  c('photobooth', 'Photobooths', 'event', '📸'),
  c('car-rental', 'Wedding Car Rentals', 'extra', '🚗'),
  c('guest-transport', 'Guest Transportation', 'extra', '🚌'),
  c('accommodation', 'Accommodation', 'extra', '🏨'),
  c('return-gifts', 'Return Gifts', 'extra', '🎁'),
  c('printing', 'Invitation Printing', 'extra', '🖨️'),
  c('digital-invite', 'Digital Invitations', 'extra', '📱'),
];

export const EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Birthday', 'Housewarming', 'Corporate Event', 'Other'];
export const TRADITIONS = ['Hindu', 'Muslim', 'Christian', 'Traditional Kerala', 'Destination', 'Interfaith', 'Not specified'];

export const catById = (id) => CATEGORIES.find((x) => x.id === id);
export const districtById = (id) => DISTRICTS.find((x) => x.id === id);

// ---------------- Demo seed data (clearly marked) ----------------
// [name, category, district, town, startPrice, rating, reviews, featured]
const SEED = [
  ['Kayal Frames Studio', 'photography', 'alp', 'Alappuzha', 45000, 4.8, 126, true],
  ['Mizhi Wedding Stories', 'cinematography', 'ekm', 'Kochi', 85000, 4.9, 98, true],
  ['Ponnonam Photography', 'photography', 'tsr', 'Thrissur', 35000, 4.6, 74, false],
  ['Malabar Lens Co.', 'photography', 'kkd', 'Kozhikode', 40000, 4.7, 88, false],
  ['Thalam Chenda Sangham', 'chenda', 'tsr', 'Thrissur', 18000, 4.9, 61, true],
  ['Panchari Panchavadyam Troupe', 'panchavadyam', 'pkd', 'Ottapalam', 25000, 4.8, 39, false],
  ['Annapoorna Sadya Caterers', 'sadya', 'ktm', 'Kottayam', 350, 4.7, 210, true],
  ['Malabar Biriyani House Catering', 'catering', 'mlp', 'Manjeri', 450, 4.8, 167, true],
  ['Vembanad Houseboat Weddings', 'houseboat', 'alp', 'Kuttanad', 150000, 4.9, 42, true],
  ['Kumarakom Lakeside Resort', 'backwater', 'ktm', 'Kumarakom', 300000, 4.8, 55, false],
  ['Grand Pearl Convention Centre', 'venue', 'ekm', 'Kakkanad', 120000, 4.5, 133, false],
  ['Hilltop Mist Resort', 'resort', 'idk', 'Munnar', 250000, 4.7, 47, true],
  ['Swarna Bridal Studio', 'bridal-makeup', 'tvm', 'Thiruvananthapuram City', 25000, 4.8, 152, true],
  ['Mylanchi Mehendi Arts', 'mehendi', 'mlp', 'Kottakkal', 6000, 4.9, 93, false],
  ['Nilavilakku Decor & Events', 'trad-decor', 'klm', 'Kollam City', 60000, 4.6, 58, false],
  ['Kalyanamandapam Stage Works', 'mandapam', 'tsr', 'Guruvayur', 45000, 4.7, 81, false],
  ['Rose Garden Flower Decor', 'flowers', 'kkd', 'Kozhikode', 30000, 4.5, 64, false],
  ['Beat Factory DJs', 'dj', 'ekm', 'Kochi', 35000, 4.4, 70, false],
  ['Wayanad Woods Events', 'event-mgmt', 'wyd', 'Kalpetta', 80000, 4.6, 29, false],
  ['Balloon Bliss Kannur', 'balloon', 'knr', 'Kannur', 8000, 4.7, 112, false],
  ['Chakka Cakes', 'cake', 'pta', 'Thiruvalla', 4500, 4.8, 76, false],
  ['Royal Ride Wedding Cars', 'car-rental', 'kkd', 'Kozhikode', 12000, 4.5, 45, false],
  ['Bekal Fort View Venue', 'venue', 'ksd', 'Bekal', 90000, 4.6, 33, false],
  ['Thoovanam Invitations', 'invitations', 'ktm', 'Changanassery', 60, 4.7, 88, false],
  ['Kasavu Couture', 'boutique', 'tsr', 'Thrissur', 18000, 4.8, 104, false],
  ['Sutradhar Emcee Services', 'anchor', 'ekm', 'Aluva', 15000, 4.6, 51, false],
  ['Ganesh Guruvayur Elephant Hire (Licensed)', 'elephant', 'tsr', 'Guruvayur', 40000, 4.3, 18, false],
  ['Corporate Connect Events', 'corporate', 'tvm', 'Thiruvananthapuram City', 150000, 4.5, 27, false],
];

const PALETTES = [
  ['#7a1f2b', '#c9a35b'], ['#5b1520', '#e2c58b'], ['#8c3b2e', '#d9b36c'], ['#3f2a1d', '#c9a35b'],
  ['#6d2338', '#f0d9a7'], ['#2f4a3a', '#c9a35b'], ['#7a4a1f', '#f3e2b8'], ['#4a1a2c', '#d6b16a'],
];

function packagesFor(cat, base) {
  const unit = ['sadya', 'catering', 'event-catering'].includes(cat) ? ' per plate'
    : cat === 'invitations' ? ' per card' : '';
  return [
    { id: 'p1', name: 'Essential', price: base, unit, inclusions: ['Core service for the main event', 'Standard setup', 'Coordinator on the day'] },
    { id: 'p2', name: 'Signature', price: Math.round(base * 1.7), unit, inclusions: ['Everything in Essential', 'Extended hours', 'Premium materials', 'Pre-event consultation'] },
    { id: 'p3', name: 'Grand', price: Math.round(base * 2.8), unit, inclusions: ['Everything in Signature', 'Multi-day coverage', 'Dedicated team lead', 'Custom add-ons'] },
  ];
}

export function buildSeedVendors() {
  return SEED.map(([name, category, district, town, price, rating, reviews, featured], i) => {
    const d = districtById(district);
    const cat = catById(category);
    const id = i === 0 ? 'demo_vendor' : `demo_${String(i).padStart(2, '0')}`;
    return {
      id,
      ownerId: id,
      isDemo: true,
      businessName: name,
      ownerName: 'Demo Owner',
      phone: '+91 90000 0' + String(1000 + i),
      whatsapp: '919000001' + String(100 + i),
      email: `demo${i}@example.com`,
      category,
      district,
      town,
      serviceDistricts: [district, DISTRICTS[(DISTRICTS.indexOf(d) + 1) % 14].id],
      address: `${town}, ${d.en}, Kerala`,
      description: `${name} is a ${cat.en.toLowerCase()} business based in ${town}, serving ${d.en} and nearby districts. Experienced with Hindu, Muslim, Christian and traditional Kerala ceremonies. (Demo listing for testing.)`,
      startingPrice: price,
      priceUnit: packagesFor(category, price)[0].unit,
      rating,
      reviewCount: reviews,
      packages: packagesFor(category, price),
      policies: 'Booking confirmed on 30% advance. Free date change up to 60 days before the event. Advance is non-refundable within 30 days of the event.',
      traditions: ['Hindu', 'Muslim', 'Christian', 'Traditional Kerala'],
      palette: PALETTES[i % PALETTES.length],
      portfolio: [],
      status: 'approved',
      verified: i % 3 !== 2,
      featured,
      offer: i % 5 === 0 ? '10% off on weekday bookings' : (i % 7 === 3 ? 'Free pre-event consultation' : ''),
      blockedDates: [],
      views: 200 + ((i * 137) % 900),
      createdAt: Date.now() - i * 86400000 * 3,
    };
  });
}

export const SEED_REVIEWS = [
  { name: 'Anjali & Rahul', district: 'Kottayam', text: 'Found our sadya caterer and photographer in one evening. Comparing quotes side by side saved us so many calls.', rating: 5 },
  { name: 'Fathima N.', district: 'Malappuram', text: 'The mehendi artist was wonderful, and the quotation clearly listed what was and wasn’t included.', rating: 5 },
  { name: 'Joseph & Mariya', district: 'Ernakulam', text: 'Booked a backwater venue for our reception. Negotiating inside the app kept everything in writing.', rating: 4 },
];
