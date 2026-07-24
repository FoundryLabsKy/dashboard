/* Module-level JWKS cache: survives across requests within a Worker isolate.
   Avoids one extra Supabase round-trip on every authenticated request. */
var _jwksCache = null;
var _jwksCachedAt = 0;
var JWKS_TTL_MS = 10 * 60 * 1000;

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var path = url.pathname.replace(/\/+$/, "") || "/";

    /* ---- CORS: allow multiple origins via comma-separated ALLOWED_ORIGINS secret ----
       e.g. wrangler secret put ALLOWED_ORIGINS
            → https://locked-app.netlify.app,https://dashboard.yourdomain.com
       Falls back to "*" if not set (dev mode).                               */
    var reqOrigin = request.headers.get("Origin") || "";
    var defaultOrigins = "https://polite-gaufre-9f970e.netlify.app,https://inspiring-frangollo-306a23.netlify.app,https://app.netlify.com";
    var allowedList = (env.ALLOWED_ORIGINS || defaultOrigins).split(",").map(function(s){ return s.trim(); }).filter(Boolean);
    var isAllowed = allowedList.indexOf(reqOrigin) !== -1 ||
                    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(reqOrigin);
    var corsOrigin = isAllowed ? reqOrigin : allowedList[0];

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Vary": "Origin",
        }
      });
    }

    var H = { "Content-Type": "application/json", "Access-Control-Allow-Origin": corsOrigin, "Vary": "Origin" };

    /* ================================================================
       SUPABASE & AUTH HELPERS
       Env vars required (set via `wrangler secret put`):
         SUPABASE_URL          — https://xxxxxxxx.supabase.co
         SUPABASE_SERVICE_KEY  — service_role key (never expose to frontend)
         GROQ_KEY              — Groq API key for AI completions
         ALLOWED_ORIGINS       — comma-separated allowed origins
       ================================================================ */

    /* ---- Supabase REST call with service role key ---- */
    async function sbAPI(path, method, body, prefer) {
      var baseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
      var defaultPrefer = method === "POST" ? "return=representation"
        : method === "PATCH" ? "return=representation" : "";
      var res = await fetch(baseUrl + "/rest/v1" + path, {
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.SUPABASE_SERVICE_KEY || "",
          "Authorization": "Bearer " + (env.SUPABASE_SERVICE_KEY || ""),
          "Prefer": prefer || defaultPrefer,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        var errText = await res.text();
        throw new Error("Supabase " + method + " " + path + " failed: " + errText);
      }
      var ct = res.headers.get("content-type") || "";
      return ct.includes("json") ? res.json() : res.text();
    }

    /* ---- Base64url → binary string ---- */
    function b64uDec(s) {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return atob(s);
    }

    /* ---- Verify ES256 JWT via Supabase JWKS ---- */
    async function verifyJWT(request) {
      var authHeader = request.headers.get("Authorization") || "";
      var token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
      if (!token) return null;
      try {
        var parts = token.split('.');
        if (parts.length !== 3) return null;

        var header  = JSON.parse(b64uDec(parts[0]));
        var payload = JSON.parse(b64uDec(parts[1]));

        if (payload.exp && Date.now() / 1000 > payload.exp) return null;

        var baseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");

        /* Reject tokens minted by any other issuer before touching JWKS. */
        if (payload.iss && payload.iss !== baseUrl + "/auth/v1") return null;

        var jwks = _jwksCache;
        if (!jwks || Date.now() - _jwksCachedAt > JWKS_TTL_MS) {
          var jwksRes = await fetch(baseUrl + "/auth/v1/.well-known/jwks.json");
          if (!jwksRes.ok) return null;
          jwks = await jwksRes.json();
          _jwksCache = jwks;
          _jwksCachedAt = Date.now();
        }

        var jwk = null;
        for (var k = 0; k < jwks.keys.length; k++) {
          if (jwks.keys[k].kid === header.kid) { jwk = jwks.keys[k]; break; }
        }
        /* kid miss on a cached key set → Supabase may have rotated keys.
           Refetch once and retry the lookup before rejecting. */
        if (!jwk && _jwksCache) {
          var freshRes = await fetch(baseUrl + "/auth/v1/.well-known/jwks.json");
          if (freshRes.ok) {
            jwks = await freshRes.json();
            _jwksCache = jwks;
            _jwksCachedAt = Date.now();
            for (var k2 = 0; k2 < jwks.keys.length; k2++) {
              if (jwks.keys[k2].kid === header.kid) { jwk = jwks.keys[k2]; break; }
            }
          }
        }
        if (!jwk) return null;

        /* namedCurve in importKey, hash in verify — this is the correct split */
        var pubKey = await crypto.subtle.importKey(
          "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]
        );

        var sigBytes = Uint8Array.from(b64uDec(parts[2]), function(c) { return c.charCodeAt(0); });

        var ok = await crypto.subtle.verify(
          { name: "ECDSA", hash: { name: "SHA-256" } },
          pubKey,
          sigBytes,
          new TextEncoder().encode(parts[0] + '.' + parts[1])
        );

        if (!ok) return null;
        return { id: payload.sub, email: payload.email, role: payload.role };
      } catch(e) { return null; }
    }

    /* ---- Get user profile + computed subscription status ---- */
    async function getSubStatus(userId) {
      try {
        var rows = await sbAPI(
          "/profiles?id=eq." + userId +
          "&select=subscription_status,trial_ends_at,current_plan,plan_expires_at",
          "GET"
        );
        if (!rows || rows.length === 0) return { status: "expired", isPro: false };
        var p = rows[0];
        var now = Date.now();

        if (p.subscription_status === "active") {
          var expiry = p.plan_expires_at ? new Date(p.plan_expires_at).getTime() : Infinity;
          if (expiry > now) return { status: "active", isPro: true, plan: p.current_plan };
          await sbAPI("/profiles?id=eq." + userId, "PATCH", { subscription_status: "expired" });
          return { status: "expired", isPro: false };
        }

        if (p.subscription_status === "trial") {
          var trialEnd = new Date(p.trial_ends_at).getTime();
          if (trialEnd > now) {
            var daysLeft = Math.ceil((trialEnd - now) / 86400000);
            return { status: "trial", isPro: true, daysLeft: daysLeft, trialEndsAt: p.trial_ends_at };
          }
          await sbAPI("/profiles?id=eq." + userId, "PATCH", { subscription_status: "expired" });
          return { status: "expired", isPro: false };
        }

        return { status: p.subscription_status || "expired", isPro: false };
      } catch(e) {
        return { status: "unknown", isPro: false, error: e.message };
      }
    }

    /* ---- Check + increment a daily usage counter ---- */
    async function checkDailyLimit(userId, field, limit) {
      var today = new Date().toISOString().split("T")[0];
      try {
        var rows = await sbAPI(
          "/usage_daily?user_id=eq." + userId + "&date=eq." + today + "&select=id," + field,
          "GET"
        );
        var current = (rows && rows[0] && rows[0][field]) || 0;
        if (current >= limit) return { allowed: false, used: current, limit: limit };

        if (rows && rows[0]) {
          var patch = {}; patch[field] = current + 1;
          await sbAPI("/usage_daily?user_id=eq." + userId + "&date=eq." + today, "PATCH", patch);
        } else {
          var insert = { user_id: userId, date: today }; insert[field] = 1;
          await sbAPI("/usage_daily", "POST", insert);
        }
        return { allowed: true, used: current + 1, limit: limit };
      } catch(e) {
        return { allowed: true, used: 0, limit: limit, error: e.message };
      }
    }

    /* ---- Check + increment a monthly usage counter ---- */
    async function checkMonthlyLimit(userId, field, limit) {
      var now = new Date();
      var month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
      try {
        var rows = await sbAPI(
          "/usage_monthly?user_id=eq." + userId + "&month=eq." + month + "&select=id," + field,
          "GET"
        );
        var current = (rows && rows[0] && rows[0][field]) || 0;
        if (current >= limit) return { allowed: false, used: current, limit: limit };

        if (rows && rows[0]) {
          var patch = {}; patch[field] = current + 1;
          await sbAPI("/usage_monthly?user_id=eq." + userId + "&month=eq." + month, "PATCH", patch);
        } else {
          var insert = { user_id: userId, month: month }; insert[field] = 1;
          await sbAPI("/usage_monthly", "POST", insert);
        }
        return { allowed: true, used: current + 1, limit: limit };
      } catch(e) {
        return { allowed: true, used: 0, limit: limit, error: e.message };
      }
    }

    /* ---- Valid beta IDs ---- */
    var BETA_IDS = ["joshbeta", "summerbeta", "romanbeta", "cescobeta", "publicbeta", "olibeta", "kendallbeta"];

    /* ---- IDs that can never be locked ---- */
    var UNLOCKABLE = ["publicbeta"];

    /* ============================================================
       HELPER: Admin gate for beta ops/data routes.
       Requires `Authorization: Bearer <ADMIN_SECRET>`.
       Returns a Response (to short-circuit) when unauthorized, else null.
       If ADMIN_SECRET is unset, routes stay open (dev) — set it in prod.
       ============================================================ */
    function requireAdmin(request) {
      var secret = env.ADMIN_SECRET || "";
      if (!secret) return null; /* not configured → allow (dev mode) */
      var tok = (request.headers.get("Authorization") || "").replace("Bearer ", "").trim();
      if (tok !== secret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });
      }
      return null;
    }

    /* ============================================================
       HELPER: Best-effort per-IP daily rate limit for anonymous
       (no-JWT) AI calls, so exposed endpoints can't be drained by
       an unauthenticated caller. Backed by KV; fails open if KV
       is unavailable so real users are never hard-blocked by infra.
       ============================================================ */
    async function anonRateLimit(request, bucket, limit) {
      if (!env.BETADATA) return { allowed: true };
      var ip = request.headers.get("CF-Connecting-IP") || "unknown";
      var today = new Date().toISOString().split("T")[0];
      var key = "rl:" + bucket + ":" + ip + ":" + today;
      try {
        var n = parseInt((await env.BETADATA.get(key)) || "0", 10);
        if (n >= limit) return { allowed: false, used: n, limit: limit };
        await env.BETADATA.put(key, String(n + 1), { expirationTtl: 86400 });
        return { allowed: true, used: n + 1, limit: limit };
      } catch (e) {
        return { allowed: true };
      }
    }

    /* ============================================================
       HELPER: Strip markdown from conversational AI responses.
       ============================================================ */
    function cleanResponse(text) {
      if (!text) return text;
      var t = text.trim();

      if (
        t.startsWith("{") || t.startsWith("[") ||
        t.includes("###RECIPE_START###") ||
        t.includes("###SHOPPING_ADD###") ||
        t.includes("###WORKOUT_START###") ||
        t.includes("###FOOD_START###") ||
        t.includes("###PLAN_START###") ||
        t.includes("###GOAL_START###") ||
        t.includes("###PROGRAM_START###")
      ) return text;

      return text
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*([^*\n]+)\*\*/g, "$1")
        .replace(/\*([^*\n]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/^[-*+]\s+/gm, "• ")
        .replace(/^(\d+)\.\s+/gm, "$1. ")
        .replace(/^---+$/gm, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    /* ============================================================
       HELPER: Call Groq — shared across all routes
       ============================================================ */
    async function groq(messages, opts) {
      opts = opts || {};
      var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (env.GROQ_KEY || ""),
        },
        body: JSON.stringify({
          model: opts.model || "llama-3.3-70b-versatile",
          max_tokens: opts.max_tokens || 1200,
          temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
          messages: messages,
        })
      });
      var data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    }

    /* ============================================================
       ROUTE: POST /yt-search — proxy YouTube form-video search.
       Keeps the YouTube API key server-side. Body: { name, exId }.
       Caches resolved video IDs in KV for 30 days.
       ============================================================ */
    if (path === "/yt-search" && request.method === "POST") {
      try {
        var ytBody = await request.json();
        var exName = (ytBody.name || "").trim();
        var exId = ytBody.exId || 0;
        if (!exName) return new Response(JSON.stringify({ videoId: null }), { headers: H });
        if (!env.YT_KEY) return new Response(JSON.stringify({ videoId: null }), { headers: H });

        var ytCacheKey = "yt:" + exName.toLowerCase().replace(/\s+/g, "-");
        if (env.BETADATA) {
          try {
            var ytCached = await env.BETADATA.get(ytCacheKey);
            if (ytCached) return new Response(JSON.stringify({ videoId: ytCached, cached: true }), { headers: H });
          } catch (e) {}
        }

        var creators = ["Jeff Nippard", "TNF", "Cbum", "Jacob Oestreicher"];
        var creator = creators[exId % creators.length];

        async function ytQuery(q) {
          var u = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +
            encodeURIComponent(q) + "&type=video&maxResults=1&videoEmbeddable=true&key=" + env.YT_KEY;
          var r = await fetch(u);
          var d = await r.json();
          return (d.items && d.items[0] && d.items[0].id && d.items[0].id.videoId) || null;
        }

        var videoId = await ytQuery(exName + " " + creator + " form");
        if (!videoId) videoId = await ytQuery(exName + " proper form tutorial");

        if (videoId && env.BETADATA) {
          try { await env.BETADATA.put(ytCacheKey, videoId, { expirationTtl: 2592000 }); } catch (e) {}
        }
        return new Response(JSON.stringify({ videoId: videoId }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ videoId: null, error: err.message }), { headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /exercise-detail/:id — proxy AscendAPI (RapidAPI).
       Keeps the RapidAPI key server-side. Caches details 30 days.
       ============================================================ */
    if (path.indexOf("/exercise-detail/") === 0 && request.method === "GET") {
      try {
        var exDetailId = path.replace("/exercise-detail/", "").trim();
        if (!exDetailId) return new Response(JSON.stringify({ error: "No exercise id" }), { status: 400, headers: H });
        if (!env.ASCEND_KEY) return new Response(JSON.stringify({ error: "Exercise DB not configured" }), { status: 503, headers: H });

        var exCacheKey = "exdetail:" + exDetailId;
        if (env.BETADATA) {
          try {
            var exCached = await env.BETADATA.get(exCacheKey, { type: "json" });
            if (exCached) return new Response(JSON.stringify(exCached), { headers: H });
          } catch (e) {}
        }

        var ascendHost = env.ASCEND_HOST || "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com";
        var exRes = await fetch("https://" + ascendHost + "/api/v1/exercises/" + encodeURIComponent(exDetailId), {
          headers: { "x-rapidapi-key": env.ASCEND_KEY, "x-rapidapi-host": ascendHost }
        });
        var exData = await exRes.json();
        if (env.BETADATA) {
          try { await env.BETADATA.put(exCacheKey, JSON.stringify(exData), { expirationTtl: 2592000 }); } catch (e) {}
        }
        return new Response(JSON.stringify(exData), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /store-search
       ============================================================ */
    if (path === "/store-search" && request.method === "POST") {
      try {
        var ssRL = await anonRateLimit(request, "storesearch", 200);
        if (!ssRL.allowed) return new Response(JSON.stringify({ products: [] }), { headers: H });
        var ssBody = await request.json();
        var query = (ssBody.query || "").trim();
        var storeDomain = (ssBody.storeDomain || "").trim();

        if (query.length < 2) {
          return new Response(JSON.stringify({ products: [] }), { headers: H });
        }

        if (!storeDomain) {
          var rawUrl = ssBody.searchUrl || ssBody.storeUrl || "";
          var domainMatch = rawUrl.match(/https?:\/\/([^\/]+)/);
          if (domainMatch) storeDomain = domainMatch[1];
        }

        if (!storeDomain) {
          return new Response(JSON.stringify({ products: [] }), { headers: H });
        }

        var cacheKey = "search:" + storeDomain + ":" + query.toLowerCase().replace(/\s+/g, "-");
        if (env.BETADATA) {
          try {
            var cached = await env.BETADATA.get(cacheKey, { type: "json" });
            if (cached && cached.products && cached.products.length > 0) {
              return new Response(JSON.stringify({ products: cached.products, cached: true }), { headers: H });
            }
          } catch(e) {}
        }

        var storeDesc = (ssBody.storeDescription || "").trim();
        var aiText = await groq([
          {
            role: "system",
            content: "You are a grocery product expert. Given a store and search query, suggest real products that store would likely carry. Include brand names, varieties, and sizes. Rules: 1) Return 8-12 products sorted by relevance. 2) Include exact matches first, then related alternatives. 3) Use realistic brand names and product sizes. 4) Estimate typical prices. Return ONLY a JSON array: [{\"name\":\"Brand Product Name Size\",\"price\":\"$X.XX\"}]. No explanation, no markdown, raw JSON array only."
          },
          {
            role: "user",
            content: "Store: " + storeDomain + (storeDesc ? " (" + storeDesc + ")" : "") + "\nSearch: \"" + query + "\"\n\nSuggest products this store would carry."
          }
        ], { max_tokens: 600, temperature: 0.4 });

        var aiProducts = [];
        try {
          var aiMatch = aiText.match(/\[[\s\S]*?\]/);
          if (aiMatch) {
            aiProducts = JSON.parse(aiMatch[0]).map(function(p) {
              if (typeof p === "string") return { name: p, price: null };
              return { name: p.name || String(p), price: p.price || null };
            }).filter(function(p) { return p.name && p.name.length > 1; });
          }
        } catch(e) {}

        if (aiProducts.length > 0) {
          var result = { products: aiProducts.slice(0, 12) };
          if (env.BETADATA) {
            try { await env.BETADATA.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 }); } catch(e) {}
          }
          return new Response(JSON.stringify(result), { headers: H });
        }

        return new Response(JSON.stringify({ products: [] }), { headers: H });

      } catch (err) {
        return new Response(JSON.stringify({ products: [], error: err.message }), { headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /beta-validate
       ============================================================ */
    if (path === "/beta-validate" && request.method === "POST") {
      try {
        var body = await request.json();
        var code = (body.code || "").toLowerCase().trim();
        if (!code || BETA_IDS.indexOf(code) === -1) {
          return new Response(JSON.stringify({ valid: false, locked: false }), { headers: H });
        }
        var lockData = await env.BETADATA.get("lock:" + code, { type: "json" });
        var isLocked = lockData && lockData.locked === true;
        return new Response(JSON.stringify({ valid: true, locked: isLocked }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-lock/:betaId
       ============================================================ */
    if (path.indexOf("/beta-lock/") === 0 && request.method === "GET") {
      try {
        var lockDenied = requireAdmin(request); if (lockDenied) return lockDenied;
        var lockId = path.replace("/beta-lock/", "").toLowerCase().trim();
        if (BETA_IDS.indexOf(lockId) === -1) {
          return new Response(JSON.stringify({ error: "Unknown beta user" }), { status: 404, headers: H });
        }
        if (UNLOCKABLE.indexOf(lockId) >= 0) {
          return new Response(JSON.stringify({ error: "This code cannot be locked" }), { status: 403, headers: H });
        }
        await env.BETADATA.put("lock:" + lockId, JSON.stringify({ locked: true, lockedAt: new Date().toISOString() }));
        return new Response(JSON.stringify({ ok: true, locked: lockId }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-unlock/:betaId
       ============================================================ */
    if (path.indexOf("/beta-unlock/") === 0 && request.method === "GET") {
      try {
        var unlockDenied = requireAdmin(request); if (unlockDenied) return unlockDenied;
        var unlockId = path.replace("/beta-unlock/", "").toLowerCase().trim();
        if (BETA_IDS.indexOf(unlockId) === -1) {
          return new Response(JSON.stringify({ error: "Unknown beta user" }), { status: 404, headers: H });
        }
        await env.BETADATA.delete("lock:" + unlockId);
        return new Response(JSON.stringify({ ok: true, unlocked: unlockId }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /app-version
       ============================================================ */
    if (path === "/app-version" && request.method === "GET") {
      try {
        var vd = await env.BETADATA.get("app:version", { type: "json" });
        if (!vd) vd = { version: "initial", deployedAt: new Date().toISOString() };
        return new Response(JSON.stringify(vd), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /deploy-notify
       ============================================================ */
    if (path === "/deploy-notify" && request.method === "POST") {
      try {
        var hookSecret = env.DEPLOY_HOOK_SECRET || "";
        var hookToken = (request.headers.get("Authorization") || "").replace("Bearer ", "").trim();
        if (hookSecret && hookToken !== hookSecret) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });
        }
        var dnBody = {};
        try { dnBody = await request.json(); } catch(e) {}
        var newVer = {
          version: dnBody.id || dnBody.deploy_id || ("deploy-" + Date.now()),
          deployedAt: new Date().toISOString(),
          context: dnBody.context || dnBody.branch || "production",
          url: dnBody.ssl_url || dnBody.url || ""
        };
        await env.BETADATA.put("app:version", JSON.stringify(newVer));
        return new Response(JSON.stringify({ ok: true, version: newVer.version }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-status
       ============================================================ */
    /* ============================================================
       ROUTE: GET /sync-status  (admin)
       Returns, per user, which sync keys exist in cloud storage and
       when each was last updated — values are never returned. Used to
       diagnose device-migration gaps (e.g. calendar/coach memory).
       ============================================================ */
    if (path === "/sync-status" && request.method === "GET") {
      try {
        var ssDenied = requireAdmin(request); if (ssDenied) return ssDenied;
        var ssRows = await sbAPI("/user_data?select=user_id,key,updated_at&order=user_id,key", "GET");
        var ssOut = {};
        (ssRows || []).forEach(function(r) {
          if (!ssOut[r.user_id]) ssOut[r.user_id] = {};
          ssOut[r.user_id][r.key] = r.updated_at;
        });
        return new Response(JSON.stringify({ users: ssOut }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    if (path === "/beta-status" && request.method === "GET") {
      try {
        var statusDenied = requireAdmin(request); if (statusDenied) return statusDenied;
        var statuses = {};
        for (var s = 0; s < BETA_IDS.length; s++) {
          var sid = BETA_IDS[s];
          var sLock = await env.BETADATA.get("lock:" + sid, { type: "json" });
          statuses[sid] = {
            locked: sLock ? sLock.locked === true : false,
            lockedAt: sLock ? sLock.lockedAt || null : null,
            unlockable: UNLOCKABLE.indexOf(sid) >= 0
          };
        }
        return new Response(JSON.stringify(statuses, null, 2), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /beta-sync
       ============================================================ */
    if (path === "/beta-sync" && request.method === "POST") {
      try {
        var body = await request.json();
        var betaId = (body.betaId || "").toLowerCase().trim();
        var storeId = betaId;
        if (betaId === "publicbeta") {
          /* Sanitize the user-supplied username before it becomes a KV key:
             lowercase, [a-z0-9_-] only, max 32 chars. Prevents key injection
             and trivially overwriting another public tester's namespace with
             crafted values like "../" or another user's raw key. */
          var rawName = String(body.data && body.data.username || "");
          var safeName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
          storeId = "publicbeta_" + (safeName || Date.now());
        }
        if (!betaId || BETA_IDS.indexOf(betaId) === -1) {
          return new Response(JSON.stringify({ error: "Invalid beta ID" }), { status: 403, headers: H });
        }
        var existing = await env.BETADATA.get("user:" + storeId, { type: "json" });
        if (!existing) existing = { syncs: [] };
        var syncData = {
          ts: new Date().toISOString(),
          activity: body.data && body.data.activity || [],
          aiLogs: body.data && body.data.aiLogs || [],
          feedback: body.data && body.data.feedback || [],
          weightLog: body.data && body.data.weightLog || [],
          workouts: body.data && body.data.workouts || [],
        };
        if (body.data && body.data.progressPhotos) {
          syncData.progressPhotos = body.data.progressPhotos;
        }
        existing.syncs.push(syncData);
        await env.BETADATA.put("user:" + storeId, JSON.stringify(existing), { expirationTtl: 60 * 60 * 24 * 90 });
        var index = await env.BETADATA.get("index", { type: "json" }) || {};
        index[storeId] = new Date().toISOString();
        await env.BETADATA.put("index", JSON.stringify(index));
        return new Response(JSON.stringify({ ok: true, betaId: storeId }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-data
       ============================================================ */
    if (path === "/beta-data" && request.method === "GET") {
      try {
        var betaDataDenied = requireAdmin(request); if (betaDataDenied) return betaDataDenied;
        var all = {};
        for (var i = 0; i < BETA_IDS.length; i++) {
          var id = BETA_IDS[i];
          var userData = await env.BETADATA.get("user:" + id, { type: "json" });
          all[id] = userData || { syncs: [] };
        }
        var keys = await env.BETADATA.list({ prefix: "user:publicbeta_" });
        if (keys && keys.keys) {
          for (var k = 0; k < keys.keys.length; k++) {
            var pubKey = keys.keys[k].name.replace("user:", "");
            var pubData = await env.BETADATA.get(keys.keys[k].name, { type: "json" });
            all[pubKey] = pubData || { syncs: [] };
          }
        }
        var index = await env.BETADATA.get("index", { type: "json" }) || {};
        return new Response(JSON.stringify({ users: all, lastSyncs: index }, null, 2), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-data/:betaId
       ============================================================ */
    if (path.indexOf("/beta-data/") === 0 && request.method === "GET") {
      try {
        var betaUserDenied = requireAdmin(request); if (betaUserDenied) return betaUserDenied;
        var userId = path.replace("/beta-data/", "").toLowerCase().trim();
        var userData = await env.BETADATA.get("user:" + userId, { type: "json" });
        if (!userData) {
          return new Response(JSON.stringify({ error: "No data found for " + userId }), { status: 404, headers: H });
        }
        return new Response(JSON.stringify(userData, null, 2), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /beta-clear/:betaId
       ============================================================ */
    if (path.indexOf("/beta-clear/") === 0 && request.method === "GET") {
      try {
        var clearDenied = requireAdmin(request); if (clearDenied) return clearDenied;
        var clearId = path.replace("/beta-clear/", "").toLowerCase().trim();
        await env.BETADATA.delete("user:" + clearId);
        return new Response(JSON.stringify({ ok: true, cleared: clearId }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /analyze-meal — Hybrid AI parse + USDA lookup
       ============================================================ */
    if (path === "/analyze-meal" && request.method === "POST") {
      try {
        var amAuthHeader = request.headers.get("Authorization") || "";
        var amUser = null;
        if (amAuthHeader) {
          amUser = await verifyJWT(request);
          if (amUser) {
            var amSub = await getSubStatus(amUser.id);
            if (!amSub.isPro) {
              var amGate = await checkDailyLimit(amUser.id, "meal_analyses", 5);
              if (!amGate.allowed) {
                return new Response(JSON.stringify({
                  error: "Daily meal analysis limit reached (5/day). Upgrade to Pro for unlimited.",
                  gated: true
                }), { status: 429, headers: H });
              }
            }
          }
        }
        /* Anonymous (no valid JWT) callers get a per-IP daily cap so the
           endpoint can't be drained without an account. */
        if (!amUser) {
          var amAnon = await anonRateLimit(request, "meal", 30);
          if (!amAnon.allowed) return new Response(JSON.stringify({ error: "Daily limit reached. Sign in for more." }), { status: 429, headers: H });
        }

        var amBody = await request.json();
        var desc = (amBody.description || "").trim();
        var b64Raw = amBody.base64 || "";
        if (!desc && !b64Raw) return new Response(JSON.stringify({ error: "No description or image" }), { status: 400, headers: H });

        var mealDesc = desc;
        if (b64Raw) {
          var b64Data = b64Raw.includes(",") ? b64Raw.split(",")[1] : b64Raw;
          var mime = b64Raw.startsWith("data:") ? b64Raw.split(";")[0].replace("data:", "") : "image/jpeg";
          var visionOut = await groq([{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: "data:" + mime + ";base64," + b64Data } },
              { type: "text", text: "List every food item visible in this photo with estimated weight in grams. Return ONLY a JSON array: [{\"food\":\"simple name\",\"grams\":number}]. Be specific (e.g. 'cooked white rice' not 'rice'). Estimate grams visually." + (desc ? " User says: " + desc : "") }
            ]
          }], { model: "llama-3.2-11b-vision-preview", max_tokens: 400, temperature: 0 });
          try {
            var vs = visionOut.indexOf("["), ve = visionOut.lastIndexOf("]");
            var vItems = JSON.parse(vs >= 0 && ve > vs ? visionOut.slice(vs, ve+1) : visionOut);
            mealDesc = vItems.map(function(v) { return v.grams + "g " + v.food; }).join(", ");
          } catch(e) { mealDesc = desc || "meal from photo"; }
        }

        var parseOut = await groq([
          { role: "system", content: "Convert a meal description into individual food items with weights in grams. Return ONLY a JSON array: [{\"food\":\"simple search term\",\"grams\":number}]. Conversions: 1 large egg=50g, 1 cup cooked rice=195g, 1 cup oats=80g, 1 cup milk=240g, 1 tbsp=15g, 1 tsp=5g, 1 oz=28g, 1 slice bread=30g, 1 medium banana=120g, 1 medium apple=180g, 1 chicken breast=180g, 1 cup cooked pasta=140g. Use 100g if quantity unclear. Keep food names simple (e.g. 'chicken breast' not 'grilled herb chicken')." },
          { role: "user", content: mealDesc }
        ], { max_tokens: 500, temperature: 0 });

        var foodItems = [];
        try {
          var ps = parseOut.indexOf("["), pe = parseOut.lastIndexOf("]");
          foodItems = JSON.parse(ps >= 0 && pe > ps ? parseOut.slice(ps, pe+1) : parseOut);
        } catch(e) { foodItems = []; }

        var USDA_KEY = (env.USDA_KEY) || "DEMO_KEY";
        var usdaResults = await Promise.all(
          foodItems.slice(0, 8).map(async function(item) {
            try {
              var uRes = await fetch(
                "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + encodeURIComponent(item.food) +
                "&api_key=" + USDA_KEY + "&dataType=Foundation,SR%20Legacy&pageSize=1&sortBy=score&sortOrder=desc"
              );
              var uData = await uRes.json();
              if (!uData.foods || uData.foods.length === 0) return null;
              var f = uData.foods[0];
              var n = {};
              (f.foodNutrients || []).forEach(function(x) {
                if (x.nutrientId === 1008) n.cal = x.value || 0;
                if (x.nutrientId === 1003) n.pro = x.value || 0;
                if (x.nutrientId === 1005) n.carb = x.value || 0;
                if (x.nutrientId === 1004) n.fat = x.value || 0;
              });
              if (!n.cal) return null;
              var factor = (item.grams || 100) / 100;
              return {
                name: (item.grams || 100) + "g " + item.food,
                cal: Math.round(n.cal * factor),
                pro: Math.round(n.pro * factor * 10) / 10,
                carb: Math.round(n.carb * factor * 10) / 10,
                fat: Math.round(n.fat * factor * 10) / 10
              };
            } catch(e) { return null; }
          })
        );

        var results = usdaResults.filter(Boolean);

        var hitCount = results.length;
        var missCount = foodItems.length - hitCount;
        if (missCount > 0 && hitCount < foodItems.length) {
          var missedNames = foodItems.slice(0, 8).filter(function(_, i) { return !usdaResults[i]; })
            .map(function(it) { return (it.grams || 100) + "g " + it.food; });
          if (missedNames.length > 0) {
            var fillOut = await groq([
              { role: "system", content: "Return ONLY a JSON array. Each: {\"name\":string,\"cal\":number,\"pro\":number,\"carb\":number,\"fat\":number}. Use real USDA values. Values are TOTAL for the gram amount in the name." },
              { role: "user", content: "Estimate macros for: " + missedNames.join(", ") }
            ], { max_tokens: 400, temperature: 0 });
            try {
              var fs = fillOut.indexOf("["), fe = fillOut.lastIndexOf("]");
              var filled = JSON.parse(fs >= 0 && fe > fs ? fillOut.slice(fs, fe+1) : fillOut);
              results = results.concat(filled.filter(function(r) { return r.cal > 0; }));
            } catch(e) {}
          }
        }

        if (results.length === 0) {
          var fbOut = await groq([
            { role: "system", content: "Nutrition expert. Use USDA food database values. Return ONLY valid JSON array. Each: {\"name\":string,\"cal\":number,\"pro\":number,\"carb\":number,\"fat\":number}. Values are TOTAL for the portion described, not per 100g." },
            { role: "user", content: "Estimate macros: " + mealDesc }
          ], { max_tokens: 600, temperature: 0 });
          return new Response(JSON.stringify({ content: [{ type: "text", text: fbOut }] }), { headers: H });
        }

        return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(results) }] }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /parse-receipt — Vision model reads receipt image
       ============================================================ */
    if (path === "/parse-receipt" && request.method === "POST") {
      try {
        var prRL = await anonRateLimit(request, "receipt", 40);
        if (!prRL.allowed) return new Response(JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }), { status: 429, headers: H });
        var prBody = await request.json();
        var rawB64 = prBody.base64 || "";
        var b64Data = rawB64.includes(",") ? rawB64.split(",")[1] : rawB64;
        var mime = rawB64.startsWith("data:") ? rawB64.split(";")[0].replace("data:", "") : "image/jpeg";

        var vText = await groq([{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: "data:" + mime + ";base64," + b64Data } },
            { type: "text", text: "Parse this grocery receipt. Extract every purchased item with its price and quantity. Return ONLY raw JSON, no markdown, no explanation: {\"store\":\"Store Name\",\"items\":[{\"name\":\"item name\",\"price\":1.99,\"qty\":1}],\"total\":108.61}. Use the exact store name shown on the receipt. Include every line item." }
          ]
        }], { model: "llama-3.2-11b-vision-preview", max_tokens: 800, temperature: 0 });

        return new Response(JSON.stringify({ content: [{ type: "text", text: vText }] }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /analyze-physique — Vision AI physique assessment
       ============================================================ */
    if (path === "/analyze-physique" && request.method === "POST") {
      try {
        var apRL = await anonRateLimit(request, "physique", 40);
        if (!apRL.allowed) return new Response(JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }), { status: 429, headers: H });
        var apBody = await request.json();
        var rawB64 = apBody.base64 || "";
        if (!rawB64) return new Response(JSON.stringify({ error: "No image" }), { status: 400, headers: H });

        var b64Data = rawB64.includes(",") ? rawB64.split(",")[1] : rawB64;
        var mime = rawB64.startsWith("data:") ? rawB64.split(";")[0].replace("data:", "") : "image/jpeg";

        var profile = apBody.profile || {};
        var profileCtx = "";
        if (profile.goal) profileCtx += " User goal: " + profile.goal + ".";
        if (profile.weight) profileCtx += " Weight: " + profile.weight + ".";

        var vText = await groq([{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: "data:" + mime + ";base64," + b64Data } },
            { type: "text", text: "You are a knowledgeable, honest fitness coach reviewing a progress photo." + profileCtx + " Give a constructive, specific physique assessment. Return ONLY valid JSON, no markdown: {\"summary\":\"1-2 sentence overall assessment\",\"observations\":[\"specific observation 1\",\"specific observation 2\",\"specific observation 3\"],\"bodyComposition\":\"body composition description and rough bf% range if visible\",\"strengths\":[\"strength 1\",\"strength 2\"],\"focus\":\"the single most impactful area to develop\",\"qualifier\":\"brief note about how lighting/pose/angle affect this reading\"}" }
          ]
        }], { model: "llama-3.2-11b-vision-preview", max_tokens: 600, temperature: 0.3 });

        return new Response(JSON.stringify({ content: [{ type: "text", text: vText }] }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /voice — Whisper transcription + intent parsing
       ============================================================ */
    if (path === "/voice" && request.method === "POST") {
      try {
        var voiceRL = await anonRateLimit(request, "voice", 100);
        if (!voiceRL.allowed) return new Response(JSON.stringify({ error: "Daily voice limit reached.", action: "unknown", data: {} }), { status: 429, headers: H });
        var vForm = await request.formData();
        var audioFile = vForm.get("audio");
        if (!audioFile) {
          return new Response(JSON.stringify({ error: "No audio" }), { headers: H });
        }

        var wForm = new FormData();
        wForm.append("file", audioFile, audioFile.name || "voice.webm");
        wForm.append("model", "whisper-large-v3-turbo");
        var wRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": "Bearer " + (env.GROQ_KEY || "") },
          body: wForm
        });
        var wData = await wRes.json();
        var transcription = (wData.text || "").trim();
        if (!transcription) {
          return new Response(JSON.stringify({ transcription: "", action: "unknown", data: {} }), { headers: H });
        }

        var iText = await groq([
          {
            role: "system",
            content: "Parse voice commands for a fitness/grocery app. Return ONLY valid JSON (no explanation, no markdown):\n{\"action\":\"log_meal|add_shopping|log_purchase|log_water|log_workout|unknown\",\"data\":{...}}\n\nSchemas:\n- log_meal: {slot:\"breakfast|lunch|dinner|snacks\",name:\"Food Name\",calories:N,protein:N,carbs:N,fat:N}\n- add_shopping: {items:[{name:\"item\",quantity:N,unit:\"qty\"}]}\n- log_purchase: {store:\"Store\",amount:N,note:\"desc\"}\n- log_water: {glasses:N}\n- log_workout: {name:\"Workout\",exercises:[{name:\"Ex\",sets:N,reps:N,weight:N}],sets:N,volume:N}\n- unknown: {}\n\nExamples: \"chicken rice for lunch\"→log_meal slot:lunch | \"add milk eggs bread\"→add_shopping | \"spent 50 at Walmart\"→log_purchase | \"drank 3 glasses\"→log_water | \"chest day bench press 4 sets\"→log_workout. Use realistic calories/macros for food items."
          },
          { role: "user", content: transcription }
        ], { model: "llama-3.1-8b-instant", max_tokens: 400, temperature: 0 });

        var parsed = { action: "unknown", data: {} };
        try {
          var jMatch = iText.match(/\{[\s\S]*\}/);
          if (jMatch) parsed = JSON.parse(jMatch[0]);
        } catch(e) {}

        return new Response(JSON.stringify({
          transcription: transcription,
          action: parsed.action || "unknown",
          data: parsed.data || {}
        }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message, action: "unknown", data: {} }), { headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /user/check
       ============================================================ */
    if (path === "/user/check" && request.method === "GET") {
      try {
        var user = await verifyJWT(request);
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

        var sub = await getSubStatus(user.id);
        var today = new Date().toISOString().split("T")[0];
        var usageRows = await sbAPI(
          "/usage_daily?user_id=eq." + user.id + "&date=eq." + today +
          "&select=coach_chats,meal_analyses",
          "GET"
        ).catch(function() { return []; });
        var usage = (usageRows && usageRows[0]) || { coach_chats: 0, meal_analyses: 0 };

        var now = new Date();
        var month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
        var mUsageRows = await sbAPI(
          "/usage_monthly?user_id=eq." + user.id + "&month=eq." + month +
          "&select=splits_generated",
          "GET"
        ).catch(function() { return []; });
        var mUsage = (mUsageRows && mUsageRows[0]) || { splits_generated: 0 };

        return new Response(JSON.stringify({
          userId: user.id,
          email: user.email,
          subscription: sub,
          usage: {
            coachChatsToday: usage.coach_chats,
            mealAnalisesToday: usage.meal_analyses,
            splitsThisMonth: mUsage.splits_generated
          },
          limits: {
            coachChatsPerDay: sub.isPro ? null : 10,
            mealAnalisesPerDay: sub.isPro ? null : 5,
            splitsPerMonth: sub.isPro ? null : 1
          }
        }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST /user/sync
       ============================================================ */
    if (path === "/user/sync" && request.method === "POST") {
      try {
        var user = await verifyJWT(request);
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

        var syncBody = await request.json();
        var data = syncBody.data || {};
        var keys = Object.keys(data);
        if (keys.length === 0) return new Response(JSON.stringify({ ok: true, synced: 0 }), { headers: H });

        if (keys.length > 20) {
          return new Response(JSON.stringify({ error: "Too many keys (max 20)" }), { status: 400, headers: H });
        }
        var payloadSize = JSON.stringify(data).length;
        if (payloadSize > 524288) {
          return new Response(JSON.stringify({ error: "Payload too large (max 512 KB)" }), { status: 413, headers: H });
        }

        var upserts = keys.map(function(k) {
          return sbAPI(
            "/user_data",
            "POST",
            { user_id: user.id, key: k, value: data[k] },
            "resolution=merge-duplicates,return=minimal"
          ).catch(function(e) {
            console.warn("upsert failed for key", k, e.message);
          });
        });

        await Promise.allSettled(upserts);
        return new Response(JSON.stringify({ ok: true, synced: keys.length }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: GET /user/data
       ============================================================ */
    if (path === "/user/data" && request.method === "GET") {
      try {
        var user = await verifyJWT(request);
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

        var rows = await sbAPI(
          "/user_data?user_id=eq." + user.id + "&select=key,value,updated_at",
          "GET"
        );
        var out = {};
        (rows || []).forEach(function(r) { out[r.key] = { value: r.value, updatedAt: r.updated_at }; });
        return new Response(JSON.stringify({ data: out }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: DELETE /user/delete
       ============================================================ */
    if (path === "/user/delete" && request.method === "DELETE") {
      try {
        var user = await verifyJWT(request);
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

        await sbAPI("/user_data?user_id=eq." + user.id, "DELETE").catch(function(){});
        await sbAPI("/usage_daily?user_id=eq." + user.id, "DELETE").catch(function(){});
        await sbAPI("/usage_monthly?user_id=eq." + user.id, "DELETE").catch(function(){});

        var baseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
        var delRes = await fetch(baseUrl + "/auth/v1/admin/users/" + user.id, {
          method: "DELETE",
          headers: {
            "apikey": env.SUPABASE_SERVICE_KEY || "",
            "Authorization": "Bearer " + (env.SUPABASE_SERVICE_KEY || "")
          }
        });
        if (!delRes.ok) {
          var delErr = await delRes.text();
          throw new Error("Auth delete failed: " + delErr);
        }
        return new Response(JSON.stringify({ ok: true }), { headers: H });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: H });
      }
    }

    /* ============================================================
       ROUTE: POST / — Main AI proxy (coach, meal plans, workouts, etc.)
       ============================================================ */
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      var body = await request.json();

      var authHeader = request.headers.get("Authorization") || "";
      var gateUser = null;
      if (authHeader) {
        gateUser = await verifyJWT(request);
        if (gateUser) {
          var sub = await getSubStatus(gateUser.id);
          if (!sub.isPro) {
            var gate = await checkDailyLimit(gateUser.id, "coach_chats", 10);
            if (!gate.allowed) {
              return new Response(JSON.stringify({
                content: [{ type: "text", text: "You've used your 10 daily AI chats. Upgrade to Pro for unlimited coaching." }],
                gated: true,
                limit: { used: gate.used, max: gate.limit }
              }), { headers: H });
            }
          }
        }
      }
      /* Anonymous callers (guests / no valid JWT) get a per-IP daily cap
         so the main AI proxy can't be abused as a free LLM gateway. */
      if (!gateUser) {
        var mainAnon = await anonRateLimit(request, "coach", 40);
        if (!mainAnon.allowed) {
          return new Response(JSON.stringify({
            content: [{ type: "text", text: "Daily AI limit reached. Create an account for more." }],
            gated: true
          }), { status: 429, headers: H });
        }
      }

      var messages = [];

      if (body.system) {
        messages.push({ role: "system", content: body.system });
      }

      if (body.messages) {
        body.messages.forEach(function(m) {
          messages.push({ role: m.role, content: m.content });
        });
      }

      var systemText = body.system || "";
      var firstUserMsg = (body.messages && body.messages[0] && body.messages[0].content) || "";
      var isStructured = (
        systemText.includes("Return ONLY a JSON") ||
        systemText.includes("Return ONLY valid JSON") ||
        systemText.includes("Return ONLY raw JSON") ||
        systemText.includes("raw JSON array only") ||
        systemText.includes("No explanation, no markdown, raw JSON") ||
        firstUserMsg.includes("Return ONLY a JSON") ||
        firstUserMsg.includes("Return ONLY valid JSON")
      );

      var maxTokens = Math.min(body.max_tokens || (isStructured ? 3500 : 1200), 4000);
      var temperature = isStructured ? 0.3 : 0.75;

      var text = await groq(messages, { max_tokens: maxTokens, temperature: temperature });
      text = cleanResponse(text);

      return new Response(JSON.stringify({
        content: [{ type: "text", text: text }]
      }), { headers: H });

    } catch (err) {
      return new Response(JSON.stringify({
        content: [{ type: "text", text: "Something went wrong. Please try again." }],
        error: err.message
      }), { status: 500, headers: H });
    }
  }
};
