# HallHub — Book Auditoriums & Wedding Halls in Kerala (Phase 1 MVP)

A mobile-first app you can install on a phone (PWA) for finding and booking **auditoriums, convention centres, community halls and wedding venues** across all 14 districts of Kerala. Photographers, sadya caterers, decorators and other services are listed as add-ons.
Three roles: **customer**, **venue owner / vendor**, **admin**. Malayalam / English. Firebase backend (Auth + Firestore).

## What works in Phase 1
- **Search by date and slot:** pick a district, date, slot (morning 7 am–3 pm, evening 4 pm–11 pm, or full day) and guest count. You only see halls that are free and big enough.
- **Filters:** venue type, town, AC or non-AC, catering rule (outside caterers allowed or in-house only), parking, price per slot, rating, verified only. Sort by popularity, rating, price or capacity.
- **Venue page:** seating, dining and parking capacity, AC, catering rule, bridal rooms, facilities, hall rent per slot, a live availability calendar, Google Maps link, WhatsApp and call buttons, booking policies.
- **Booking request → quotation → negotiation → confirmation:** the venue sends a quotation (pre-filled with the slot rent and a 25% advance). The customer accepts, asks for a lower price, or declines, and every version is kept.
- **No double bookings:** when a customer accepts, the slot is locked in the database (one record per venue, date and half-day, which can be created but never overwritten). If two people try to take the same slot, the second gets "this slot was just booked".
- **Venue owner calendar:** month view of booked slots. Owners can block slots they booked offline (phone, walk-in) so customers can't request them.
- **Venue owner dashboard:** enquiries, revision requests, confirmed bookings, money booked this month, upcoming events, profile views. Venue editor for capacity, AC, catering, facilities, slot prices, offers and photos.
- **Customers:** My Events with a countdown and money committed against budget, side-by-side quotation comparison, saved venues, bookings list.
- **Admin:** stats, verification queue, verify, feature or suspend listings, customers, all enquiries, duplicate-phone check, load or hide demo data.
- **Real halls, Chavakkad – Ponnani highway:** 23 real auditoriums and halls along NH66 and the Guruvayur–Ponnani road (Blangad, Chavakkad, Edakkazhiyur, Vadakkekad, Punnayur, Andathode, Punnayurkulam, Perumbadappu, Ayiroor, Veliancode, Eramangalam, Maranchery, Athani, Ponnani). They're stored as **unclaimed listings** with only the name, type, locality and Google Maps place ID (Google's terms allow keeping place IDs, but not ratings, reviews or phone numbers). Each one links to its Google Maps page. Owners tap **Claim this listing**, and admin confirms by phone and approves. The owner's full listing then replaces the unclaimed one. Unclaimed halls drop out of date searches (their availability is unknown), and a note shows how many were left out.
- **Demo data:** 31 sample auditoriums and halls in all 14 districts plus 8 add-on services, all labelled **Demo**.

Planned for Phase 2: Razorpay advance payment, in-app chat, reviews, booking cancellation and refunds, push and WhatsApp alerts.

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
7. In **Admin → Dashboard**, click **Load demo venues** to add the sample listings and a few booked slots, and **Load real halls** to add the 23 Chavakkad – Ponnani halls.

## Images
To stay on the free plan (Firebase Storage now needs the paid Blaze plan), images are compressed in the browser and saved inside Firestore documents: up to 6 photos per venue and 3 reference images per enquiry. When you move to Blaze, switch to Firebase Storage.

## Files
- `index.html`, `css/app.css` — app shell and maroon, gold and ivory theme
- `js/app.js` — screens and routing for all three roles
- `js/store.js` — data and sign-in layer (Firebase or demo)
- `js/data.js` — districts, towns, venue types, slots, facilities, demo venues
- `js/i18n.js` — English and Malayalam text
- `firestore.rules` — role-based security rules
