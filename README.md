# Mangalyam — Kerala Wedding & Event Vendor Marketplace (Phase 1 MVP)

A mobile-first, installable web app (PWA) connecting customers in Kerala with wedding and event vendors.
Three roles: **customer**, **vendor**, **admin**. Malayalam / English. Firebase backend (Auth + Firestore).

## What works in Phase 1
- **Sign-in:** mobile number + OTP, Google, and demo accounts (demo mode only)
- **Customers:** home page with search by service and district, 44 categories in 4 groups (including Kerala traditions: chenda melam, panchavadyam, sadya, houseboat and backwater venues), trending destinations, offers
- **Explore:** filter by category, district, town, starting price, package budget, rating, verified only and availability date; sort by popularity, rating or price
- **Vendor profiles:** packages and inclusions, portfolio, service areas, policies, booked dates, WhatsApp and call buttons, save to favourites
- **Enquiries:** event type, tradition, date, venue, guests, package or custom quote, requirements, up to 3 reference images
- **Quotations and negotiation:** vendor sends a quotation (package, details, inclusions, exclusions, price, extra charges, advance, balance, validity) → customer accepts, asks for a revised price (with a note and target price), or declines → vendor sends a new version. Every version and message is kept.
- **Compare quotations** side by side for each event, grouped by category, with the lowest price marked
- **My Events:** multiple events, countdown, vendors enquired or booked, amount committed against budget
- **Vendor dashboard:** registration form (GST and registration details optional), stats, packages, portfolio, offers, booked dates, enquiries and bookings
- **Admin:** stats, verification queue (approve and verify / reject), verify, feature or suspend vendors, customers, all enquiries, duplicate-phone check, load or hide demo vendors
- **Demo data:** 28 sample vendors across all 14 districts, labelled **Demo** everywhere

Planned for Phase 2 (not built yet): Razorpay advance payment, in-app chat, reviews, full availability calendar, push notifications. Phase 3: budget and checklist tools, subscriptions, commissions, coupons, recommendations, analytics.

## Demo mode
While `js/config.js` has no `apiKey`, the app runs in **demo mode**: all data is saved in the browser and you sign in with the demo Customer, Vendor or Admin buttons. Use this to try the whole flow before connecting Firebase.

## Connect Firebase (about 15 minutes)
1. Go to <https://console.firebase.google.com> → **Add project** → name it `mangalyam` (Analytics optional).
2. **Build → Authentication → Get started.** Turn on **Phone** and **Google**.
   - Under **Settings → Authorized domains**, add `muneebmohammed-cyber.github.io`.
   - Phone sign-in sends real SMS, and the free Spark plan sends only a small number each day. For testing, add **test phone numbers** (e.g. `+91 9999999999` with code `123456`) under Phone → *Phone numbers for testing*.
3. **Build → Firestore Database → Create database** → production mode → region `asia-south1` (Mumbai).
4. Open the **Rules** tab, paste in everything from `firestore.rules`, and click **Publish**.
5. **Project settings → Your apps → Web (</>)** → register the app → copy the `firebaseConfig` values into `js/config.js` and push.
6. **Make yourself admin:** sign in once in the app, then in Firestore open `users/<your uid>` and change `role` to `admin`. Reload the app.
7. In **Admin → Dashboard**, click **Load demo vendors** to add the sample listings.

## Images
To stay on the free plan (Firebase Storage now needs the paid Blaze plan), images are compressed in the browser and saved inside Firestore documents: up to 6 portfolio images per vendor and 3 reference images per enquiry. When you move to Blaze, switch to Firebase Storage.

## Files
- `index.html`, `css/app.css` — app shell and maroon, gold and ivory theme
- `js/app.js` — screens and routing for all three roles
- `js/store.js` — data and sign-in layer (Firebase or demo)
- `js/data.js` — districts, towns, categories, traditions, demo vendors
- `js/i18n.js` — English and Malayalam text
- `firestore.rules` — role-based security rules
