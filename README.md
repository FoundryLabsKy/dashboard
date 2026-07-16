# Foundry Dashboard

The internal operating system for Foundry Labs: track every company through the
build pipeline (Idea → To-Do → Built → Pitched → Sold → Hosting), preview
websites, store files, and watch recurring revenue grow.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and
Supabase. This is an internal tool with **no authentication** by design —
anyone with the URL has access.

## Pages

- **Dashboard** — KPIs (ideas, built, ready to pitch, sold, MRR, revenue closed) and every active company with its pipeline stage. Search, sort, floating Add Company.
- **To-Do** — rapid idea capture. Checking an item marks it Built and moves it on.
- **Built** — finished sites ready to pitch, with previews, domains, and a Mark Sold flow.
- **Company page** — website preview (paste a hosted URL or upload single-file HTML), autosaving notes, potential domains, file storage, and the big Sold toggle.
- **Income** — revenue KPIs and the active client table (sale price, monthly fee, final domain).
- **Archived** — restore or permanently delete parked companies.

## Running locally

```bash
npm install
npm run dev
```

With no environment variables set, the app runs in **demo mode**: data lives in
the browser (localStorage + IndexedDB), seeded with example companies. Perfect
for trying the workflow — but data never leaves that browser.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `companies` and `files` tables, a public `company-files` storage bucket, and permissive anon policies (internal tool — lock down before exposing publicly).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Restart the dev server. The demo-mode badge disappears and all data reads/writes go to Supabase. (Demo-mode data is not migrated.)

## Hosting

Every push to `main` builds a static export and deploys it to **GitHub Pages**
automatically (`.github/workflows/deploy-pages.yml`). The Supabase credentials
live in `.env.production` (public client values by design), so the deployed
site is cloud-synced with zero configuration.

The app also works on Vercel unchanged: import the repo, no settings needed.

## Development notes

- `npm run typecheck` / `npm run lint` / `npm run build`
- Pipeline stage is derived (`deriveStage` in `src/lib/types.ts`) from the `built`, `sold`, and `archived` flags — never stored — so KPIs can't drift.
- The data layer is a single `CompanyRepo` interface (`src/lib/repo/`) with two implementations: `supabaseRepo` and `localRepo` (demo). Everything above it is mode-agnostic.
- Website previews are iframes. External sites often block embedding (X-Frame-Options); the UI always offers "Open in new tab". Uploaded single-file HTML always previews.
- Single-user assumption: last write wins; there is no live sync between browsers.
