// English / Malayalam UI strings.
const STR = {
  en: {
    home: 'Home', explore: 'Explore', events: 'My Events', bookings: 'Bookings', profile: 'Profile',
    dashboard: 'Dashboard', enquiries: 'Enquiries', services: 'Services',
    tagline: 'Plan your Kerala celebration with trusted local vendors',
    searchPh: 'Search photographers, sadya, venues…',
    allDistricts: 'All districts', featured: 'Featured vendors', categories: 'Browse by category',
    recent: 'Recently added', destinations: 'Trending wedding destinations', reviewsTitle: 'What couples say',
    startingAt: 'Starting at', verified: 'Verified', viewAll: 'View all',
    sendEnquiry: 'Send enquiry', requestQuote: 'Request a quotation', whatsapp: 'WhatsApp',
    packages: 'Packages', policies: 'Booking policies', about: 'About', serviceAreas: 'Service areas',
    login: 'Sign in', logout: 'Sign out', language: 'Language',
    noResults: 'No vendors match these filters yet.',
    status_enquiry: 'Enquiry sent', status_quoted: 'Quotation received', status_negotiation: 'Negotiation',
    status_confirmed: 'Booking confirmed', status_declined: 'Declined', status_closed: 'Closed',
    accept: 'Accept & confirm booking', requestRevision: 'Request a revised price', decline: 'Decline',
    compare: 'Compare quotations', createEvent: 'Create event', save: 'Save', cancel: 'Cancel',
    search: 'Search', welcome: 'Welcome', demoBanner: 'Demo mode — data is stored on this device only. Vendors marked “Demo” are sample data.',
  },
  ml: {
    home: 'ഹോം', explore: 'തിരയുക', events: 'എന്റെ ചടങ്ങുകൾ', bookings: 'ബുക്കിംഗുകൾ', profile: 'പ്രൊഫൈൽ',
    dashboard: 'ഡാഷ്ബോർഡ്', enquiries: 'അന്വേഷണങ്ങൾ', services: 'സേവനങ്ങൾ',
    tagline: 'വിശ്വസ്തരായ പ്രാദേശിക വെണ്ടർമാരോടൊപ്പം നിങ്ങളുടെ ആഘോഷം പ്ലാൻ ചെയ്യൂ',
    searchPh: 'ഫോട്ടോഗ്രാഫർ, സദ്യ, ഓഡിറ്റോറിയം…',
    allDistricts: 'എല്ലാ ജില്ലകളും', featured: 'പ്രധാന വെണ്ടർമാർ', categories: 'വിഭാഗങ്ങൾ',
    recent: 'പുതുതായി ചേർന്നവർ', destinations: 'ജനപ്രിയ വിവാഹ കേന്ദ്രങ്ങൾ', reviewsTitle: 'ഉപഭോക്താക്കൾ പറയുന്നത്',
    startingAt: 'ആരംഭ വില', verified: 'പരിശോധിച്ചത്', viewAll: 'എല്ലാം കാണുക',
    sendEnquiry: 'അന്വേഷണം അയയ്ക്കുക', requestQuote: 'ക്വട്ടേഷൻ ആവശ്യപ്പെടുക', whatsapp: 'വാട്സ്ആപ്പ്',
    packages: 'പാക്കേജുകൾ', policies: 'ബുക്കിംഗ് നിബന്ധനകൾ', about: 'വിവരങ്ങൾ', serviceAreas: 'സേവന മേഖലകൾ',
    login: 'സൈൻ ഇൻ', logout: 'സൈൻ ഔട്ട്', language: 'ഭാഷ',
    noResults: 'ഈ ഫിൽട്ടറുകൾക്ക് ചേരുന്ന വെണ്ടർമാർ ഇല്ല.',
    status_enquiry: 'അന്വേഷണം അയച്ചു', status_quoted: 'ക്വട്ടേഷൻ ലഭിച്ചു', status_negotiation: 'ചർച്ചയിൽ',
    status_confirmed: 'ബുക്കിംഗ് ഉറപ്പായി', status_declined: 'നിരസിച്ചു', status_closed: 'അവസാനിച്ചു',
    accept: 'സ്വീകരിച്ച് ബുക്കിംഗ് ഉറപ്പാക്കുക', requestRevision: 'പുതുക്കിയ വില ആവശ്യപ്പെടുക', decline: 'നിരസിക്കുക',
    compare: 'ക്വട്ടേഷനുകൾ താരതമ്യം ചെയ്യുക', createEvent: 'ചടങ്ങ് ചേർക്കുക', save: 'സേവ് ചെയ്യുക', cancel: 'റദ്ദാക്കുക',
    search: 'തിരയുക', welcome: 'സ്വാഗതം', demoBanner: 'ഡെമോ മോഡ് — വിവരങ്ങൾ ഈ ഉപകരണത്തിൽ മാത്രം. “Demo” എന്ന് അടയാളപ്പെടുത്തിയവ സാമ്പിൾ ഡാറ്റയാണ്.',
  },
};

let lang = localStorage.getItem('mg_lang') || 'en';
export const getLang = () => lang;
export const setLang = (l) => { lang = l; localStorage.setItem('mg_lang', l); document.documentElement.lang = l; };
export const t = (k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;
export const nameOf = (obj) => (lang === 'ml' && obj.ml) ? obj.ml : obj.en;
