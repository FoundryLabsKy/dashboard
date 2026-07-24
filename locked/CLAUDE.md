# LOCKED

Fitness PWA: workout, nutrition and progress tracking with an AI coach.
Tagline: "Track. Train. Dominate."

## Architecture

- **Frontend**: `index.html` is the entire app. One large React SPA written as an inline `<script type="text/babel">` block. It is the editable source and runs Babel in the browser for local dev. NEVER edit `dist/` by hand.
- **Build**: `npm run build` runs `build.mjs`, which precompiles the JSX and writes `dist/index.html` (no Babel runtime, CDN deps pinned with SRI). Deploy `dist/` to Netlify.
- **Backend**: `worker.js` is a single Cloudflare Worker (`lockedapi`). It proxies ALL third-party APIs so no keys ever ship in the client:
  - Groq (AI coach, meal analysis, physique analysis, voice, receipt parsing, store search)
  - YouTube Data API (`/yt-search`)
  - AscendAPI exercise DB (`/exercise-detail/:id`)
  - USDA food data
  - Supabase REST with the service role key (user sync, subscriptions)
- **Auth**: Supabase, ES256 JWTs. Worker verifies via JWKS fetched from `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`. Web Crypto params matter: `verify` needs `{ name: "ECDSA", hash: { name: "SHA-256" } }`, `importKey` needs `{ name: "ECDSA", namedCurve: "P-256" }` with no hash field. This was a past 401 bug, do not regress it.
- **Storage**: Cloudflare KV (`BETADATA` binding) for beta data, caches, deploy version, rate-limit counters. Supabase Postgres for user data.
- **Offline**: `sw.js` service worker, network-first, never caches API traffic. App auto-unregisters SW and clears caches on new deploy versions.

## Key files

- `index.html` - editable app source (edit this, then build)
- `index.original.html`, `index_archive.html` - historical backups, do not edit
- `worker.js` - Cloudflare Worker API
- `wrangler.toml` - Worker config. KV id and all secrets are placeholders, secrets are set with `wrangler secret put`, never committed
- `build.mjs` - JSX precompile step
- `admin/dashboard.html` - LOCAL ONLY admin tool. It takes the Supabase service_role key pasted at runtime. `build.mjs` deliberately never copies `admin/` into `dist/`. Never deploy it publicly.
- `supabase-security-fix.sql` - security hardening already written, applied via Supabase SQL editor
- `DEPLOY.md` - deploy and security runbook
- `LOCKED_Encyclopedia_v6.1_Updates_2026-07-06.docx` - changelog since v6.0
- `skills-lock.json` - pinned Claude Code skills

## Security rules (non-negotiable)

1. No API keys in the client, ever. Anything needing a key goes through the Worker.
2. The Supabase anon key in `index.html` is public by design and safe. The service_role key must only exist as a Worker secret and pasted at runtime in the local admin dashboard.
3. Admin routes (`/beta-data`, `/beta-status`, `/beta-clear/*`, `/beta-lock/*`, `/beta-unlock/*`) require `Authorization: Bearer <ADMIN_SECRET>`.
4. Anonymous AI endpoints have per-IP daily rate limits in KV. Keep them.
5. CORS is an allowlist via the `ALLOWED_ORIGINS` secret plus localhost.

## Workflow

- Edit `index.html`, test locally (Babel in browser), then `npm run build` before any deploy.
- Deploy Worker: `npx wrangler deploy`. Deploy frontend: push `dist/` contents to Netlify.
- Verify steps after deploy are in `DEPLOY.md`.

## Style

- Code style follows the existing files: plain `var`-heavy ES5-ish JS in worker.js and sw.js, functional React components in the app.
- Keep the single-file frontend structure unless explicitly asked to split it.
