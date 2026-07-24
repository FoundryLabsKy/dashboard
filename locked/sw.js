/* LOCKED service worker — conservative network-first strategy.
   The app head registers /sw.js and, on every load, compares the deploy
   version from the Worker; on a new deploy it unregisters this SW and
   clears all caches before hard-reloading. So this cache can never pin
   users to a stale build — it only serves as an offline fallback.

   Strategy:
   • HTML/navigation: network first, cache fallback (offline support).
   • Same-origin static + pinned CDN libs: network first, cache fallback.
   • Everything else (worker API, Supabase, Groq): network only, never cached. */

var CACHE = "locked-v1";

var CACHEABLE_HOSTS = [
  self.location.host,
  "unpkg.com",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (CACHEABLE_HOSTS.indexOf(url.host) === -1) return; /* API traffic: untouched */

  e.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          /* offline navigation with no cache → fall back to cached shell */
          if (req.mode === "navigate") return caches.match("/");
          return Response.error();
        });
      })
  );
});
