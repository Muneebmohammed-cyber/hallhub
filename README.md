# Farshad Ku — Book Auditoriums & Wedding Halls in Kerala (Phase 1 MVP)

A mobile-first app you can install on a phone (PWA) for finding and booking **auditoriums, convention centres, community halls and wedding venues** across all 14 districts of Kerala. Photographers, sadya caterers, decorators and other services are listed as add-ons.
Three roles: **customer**, **venue owner / vendor**, **admin**. Malayalam / English. Firebase backend (Auth + Firestore).

## What works in Phase 1
- **Search by date and slot:** pick a district, date, slot (morning 7 am–3 pm, evening 4 pm–11 pm, or full day) and guest count. You only see halls that are free and big enough.
- **Filters:** venue type, town, AC or non-AC, catering rule (outside caterers allowed or in-house only), parking, price per slot, rating, verified only. Sort by popularity, rating, price or capacity.
- **Venue page:** seating, dining and parking capacity, AC, catering rule, bridal rooms, facilities, hall rent per slot, a live availability calendar, Google Maps link, WhatsApp and call buttons, booking policies.
- **Booking protection (Kerala pain points):**
  - **Booking code + public check page.** Every confirmed booking, including the owner's phone bookings, gets a code like HH-4F9K2A. Anyone can check it at #/verify before paying, which helps against fake payment links and QR codes.
  - **Digital booking agreement:** hall, parties, date and slot, agreed total, advance and balance, overtime, cleaning and generator charges, what's included, the refund schedule, and monsoon terms. Print, save as PDF or share.
  - **Date transfer.** A family that can't use its date offers it to other families. It shows on the hall's calendar and under "Dates released by other families" on the home screen. When another family requests it, the owner releases the original booking with one tap and quotes the new family. This is for halls that refund the advance only when someone else takes the date.
  - **Monsoon readiness.** Owners say whether the hall or its approach road floods and state a rain policy. Halls show "Monsoon-ready". Bookings in June–September get a monsoon plan with backup halls free that day.
  - **Scam warning** on booking screens: pay only inside Farshad Ku or at the hall's counter.
- **Plan my event:** enter event, district, guests, budget, a preferred date and how flexible you are. A grid shows every hall that fits and which nearby dates are free, sorted by real total cost, with "in budget" flags.
- **True total cost on every hall page:** rent + food for your guests + overtime electricity + cleaning + generator + GST + decoration, with a per-guest figure and a checklist of questions to ask before paying.
- **Compare up to 3 halls side by side** (free on your date, estimated total, capacity, parking, AC, catering rules, extra charges, cancellation terms) and **ask family on WhatsApp** with one tap.
- **Busy-date heatmap:** dates when many halls in the district are already booked are marked, so customers book early.
- **Plan B halls:** when a date is taken, similar halls free that day are suggested right away.
- **Date alerts:** "Tell me if it frees up" on a booked date. If it gets cancelled, the customer sees a "Good news" card on the home screen.
- **Clear cancellation terms** on every hall (free / partly refundable / non-refundable), set by the owner.
- **Digital invitation** for an event, with the venue's exact Google Maps location, to share on WhatsApp or print.
- **Booking request → quotation → negotiation → confirmation:** the venue sends a quotation (pre-filled with the slot rent and a 25% advance). The customer accepts, asks for a lower price, or declines, and every version is kept.
- **No double bookings:** when a customer accepts, the slot is locked in the database (one record per venue, date and half-day, which can be created but never overwritten). If two people try to take the same slot, the second gets "this slot was just booked".
- **Owner register (replaces the paper booking diary):**
  - Add phone and walk-in bookings with customer, mobile, event, guests, rent, extra charges and advance. The slot is blocked for Farshad Ku customers straight away.
  - Confirmed Farshad Ku bookings appear in the register automatically.
  - Record each payment (cash, UPI, bank transfer, cheque) and see the balance per booking.
  - Print a receipt for every payment or save it as PDF, and send it, a booking confirmation or a payment reminder on WhatsApp.
  - Cancel a booking to free the slot.
  - Reports: bookings, booking value, money collected, hall occupancy, pending dues, 12-month trend, and breakdowns by event, slot and source. Export everything as CSV for Excel.
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
