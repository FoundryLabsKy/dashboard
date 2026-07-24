# LOCKED — Deploy & security-fix runbook

Everything in the codebase is fixed and verified. The steps below are the
actions that need **your** credentials (Cloudflare login, Supabase dashboard)
and **new API keys** — I can't do these for you. Do them in order.

## 1. Rotate the two exposed API keys (do this first)

The old keys were shipped in the client and are burned. Generate new ones:

- **YouTube Data API key** — Google Cloud Console → APIs & Services →
  Credentials → delete `AIza…DANIg`, create a new key, restrict it to the
  YouTube Data API v3.
- **RapidAPI (AscendAPI) key** — RapidAPI dashboard → regenerate the app key
  that started `ad14b10…`.

The client no longer holds either key; both are now proxied through the Worker.

## 2. Set the Worker secrets

```bash
cd /Users/kingcesco/Locked
npx wrangler login                      # opens browser once

# Fill in your BETADATA KV id in wrangler.toml first:
npx wrangler kv namespace list          # copy the id → wrangler.toml

npx wrangler secret put YT_KEY          # paste NEW YouTube key
npx wrangler secret put ASCEND_KEY      # paste NEW RapidAPI key
npx wrangler secret put ADMIN_SECRET    # any long random string you pick
# These likely already exist on the deployed worker — only set if missing:
# SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_KEY, USDA_KEY, ALLOWED_ORIGINS
```

`ADMIN_SECRET` is what now protects the beta admin/data routes. Keep it in your
password manager — you pass it as `Authorization: Bearer <ADMIN_SECRET>` when
calling `/beta-data`, `/beta-status`, `/beta-clear/*`, `/beta-lock/*`,
`/beta-unlock/*`. Your `admin/dashboard.html` will need this header added.

## 3. Deploy the Worker

```bash
npx wrangler deploy
```

(Or, if you deploy via the Cloudflare dashboard: open the `lockedapi` Worker,
paste the new `worker.js`, and add the three secrets under Settings → Variables.)

### Verify after deploy
```bash
# Admin route should now be locked (expect 401):
curl -s -o /dev/null -w "%{http_code}\n" https://lockedapi.cescocugliari.workers.dev/beta-data
# → 401

# With the secret it should return data (expect 200):
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://lockedapi.cescocugliari.workers.dev/beta-data
# → 200

# YouTube proxy should resolve a video id:
curl -s -X POST https://lockedapi.cescocugliari.workers.dev/yt-search \
  -H "Content-Type: application/json" -d '{"name":"barbell bench press","exId":0}'
# → {"videoId":"..."}
```

## 4. Apply the Supabase security fixes

Open Supabase → SQL Editor, paste and run **`supabase-security-fix.sql`**.
Then in Auth → Providers → Email, enable **Leaked password protection**.

Re-run the advisor afterward (should come back clean):
```
get_advisors(security)  → expect no ERROR-level findings
```

## 5. Deploy the frontend (precompiled build)

```bash
npm run build          # writes dist/index.html (no in-browser Babel)
# deploy the contents of dist/ to Netlify
```

`dist/index.html` is the production build: JSX precompiled, Babel runtime
removed, CDN deps pinned with SRI. `index.html` at the repo root stays the
editable source (still uses in-browser Babel for quick local edits) — always
edit the source, then `npm run build` before deploying.

## What was fixed in code (already done)

- **Removed** hardcoded YouTube + RapidAPI keys from `index.html`; both now
  proxy through the Worker (`/yt-search`, `/exercise-detail/:id`).
- **worker.js**: added the two proxy routes; `ADMIN_SECRET` gate on all
  beta admin/data routes; per-IP daily rate limits on every anonymous AI
  endpoint (coach, meal, receipt, physique, voice, store-search).
- **CDN** scripts pinned to exact versions with SRI `integrity` hashes.
- **Build step** (`build.mjs`) precompiles JSX so users no longer download and
  run 2.8 MB of Babel on every load.
- **git** initialised with a baseline commit.
- **supabase-security-fix.sql** written for step 4.
