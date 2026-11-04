# Alaman Ulak

Bilingual federation website and management dashboard for Alaman Ulak. Built with Next.js, Prisma and Postgres (Neon); deployed on Render.

## Run locally

Requires Node.js 20.9 or newer.

Copy `.env.example` to `.env` and put a Neon connection string in `DATABASE_URL` (a separate Neon branch for development keeps the live data safe). Then:

```bash
cd alaman-ulak
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The public site starts in Kyrgyz; use the language switch to open the Russian version. Demo content is fictional and can be replaced in the admin dashboard.

On the first visit to `/admin`, create the federation's one admin account. Use a unique password with at least 12 characters. The account is created only once; no demo credentials are shipped. In production, set `ADMIN_SETUP_KEY` before first setup and enter that key on the setup screen. First-admin setup is disabled in production when this key is missing.

After signing in at `/admin`, the admin sees the normal site with their avatar in the header (or inside the burger menu on smaller screens). The site and the admin follow the device's light/dark setting; there is no switch. The avatar opens the management settings at `/admin/settings`; the admin's name and photo are set in the Profile section there. The Profile section also changes the sign-in username and password: the current password confirms the change, a new password needs at least 12 characters, and the admin stays signed in on that device.

News articles and tournaments each have their own page (`/ky/news/<id>`, `/ky/calendar/<id>`): the cards on the homepage, the news page and the tournaments page open it. A tournament's page shows its photo, place and dates, the time left with "add to calendar", the prizes or winners, and the detailed information written in the admin (Tournaments: photo and «Толук маалымат»; each line break starts a new paragraph). A tournament without its own photo uses one of the site's ulak tartysh photos. Tournament cards are ordered by date: upcoming ones nearest first, finished ones most recent first.

The rules page shows each rule as a felt card with its symbol, number and title; tapping it turns the card over to show the rule's text (rules have no pages of their own). The title and text come from the admin's Rules section.

The footer lists the address, phone and email on the left and the federation's WhatsApp, Instagram and Facebook on the right. Those three are set in the admin settings (Contacts); each shows only once it is filled in, and the WhatsApp number needs its country code (+996) so the chat link works.

Photos are uploaded from the admin forms (pick or drag a photo; Media and the federation's photo archive take several at once). The admin's browser shrinks large photos to at most 2000px, and they are stored in the database (`UploadedImage`) and served at `/api/images/<id>`, because the host's disk does not survive deploys.

## Admin content

The dashboard manages bilingual site headings and contact details, news, tournaments (each with three prize places: the prize on offer and, once it ends, the winning team), clubs and players, rules, and horse categories and listings. Both language versions are required for publishable content. The horse bazaar shows each listing as a card: its main photo (with a small mark if it has a video), the breed, name, age, region and price, and a button that opens the horse's own page (`/ky/horses/<id>`): its YouTube video (uploaded to the federation's channel, the link pasted in the listing) and all its photos (the main one plus any extra photos added in the admin), the details, and the seller's phone and WhatsApp as large buttons, then Telegram and Instagram. Listings without seller contacts offer the federation's own contacts instead. The site does not process payments.

The bazaar and the media page share one search panel: a switch between two kinds (horses / equipment, videos / photos), a keyword search that runs when its search button or Enter is pressed, and a filter pop-up (horses: breed, region, price; equipment: type, condition, region, price; media: section, year). On phones the search is full-width, with the two kinds as text links and the filter on a line above it. Equipment has no admin yet: the bazaar shows demo items (`src/lib/demo-equipment.ts`), which open with their details and the federation's contacts. The bazaar, media and players lists come in a new random order for each visit (a seed kept in a browser-session cookie, `src/lib/shuffle.ts`), the same from page to page within it. The media page shows 20 at a time and 12 more as you scroll; until the admin adds media it shows demo videos and photos. The demo photos are from Wikimedia Commons, credited in `public/images/media/CREDITS.md` and `public/images/equipment/CREDITS.md`.

## Deployment

`render.yaml` is a Render Blueprint: one web service in Frankfurt that rebuilds on every push to `main`, applies pending database migrations (`prisma migrate deploy`) and starts the site. `DATABASE_URL` is entered in the Render dashboard; `ADMIN_SETUP_KEY` is generated by Render. `npm run db:import -- <file>` copies a JSON export of the old SQLite data into an empty database once.

Demo horse photos are bundled locally; staff can replace them with HTTPS image URLs or app asset paths.
