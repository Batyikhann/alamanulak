# Alaman Ulak

Bilingual federation website and management dashboard for Alaman Ulak. The first version uses Next.js, SQLite, and Prisma.

## Run locally

Requires Node.js 20.9 or newer.

```bash
cd alaman-ulak
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The public site starts in Kyrgyz; use the language switch to open the Russian version. Demo content is fictional and can be replaced in the admin dashboard.

On the first visit to `/admin`, create the federation's one admin account. Use a unique password with at least 12 characters. The account is created only once; no demo credentials are shipped. In production, set `ADMIN_SETUP_KEY` before first setup and enter that key on the setup screen. First-admin setup is disabled in production when this key is missing.

## Admin content

The dashboard manages bilingual site headings and contact details, news, tournaments and results, clubs and players, rules, horse categories and listings, and incoming inquiries. Both language versions are required for publishable content. Traders contact the federation through the inquiry form; the site does not process payments.

The SQLite database is local at `prisma/dev.db`. Keep it on persistent storage when deploying, or migrate to a managed database before using the site for production data. Demo horse photos are bundled locally; staff can replace them with HTTPS image URLs or app asset paths.
