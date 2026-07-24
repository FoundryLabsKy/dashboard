// LOCKED Phase 5 automated pass: profiles x pages, widths, a11y modes, tap targets, contrast.
const { chromium } = require('playwright-core');
const fs = require('fs');
const CDN = '/tmp/claude-0/-home-user-dashboard/dd66806a-dc71-579c-b790-f0410aa11703/scratchpad/cdn/';
const OUT = '/tmp/claude-0/-home-user-dashboard/dd66806a-dc71-579c-b790-f0410aa11703/scratchpad/loop/';
fs.mkdirSync(OUT, { recursive: true });
const PAGES = ['home', 'train', 'fuel', 'coach', 'profile'];
const PROFILES = ['dark', 'slate', 'navy', 'midnight', 'light'];
const WIDTHS = [320, 390, 430, 768, 1280];

function lum(r, g, b) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }

async function boot(ctx, profile, opts = {}) {
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => { const m = e.message; if (!m.includes('subscription')) p.errs.push(m.slice(0, 100)); });
  await p.route('**{unpkg.com,cdn.jsdelivr.net,fonts.googleapis.com,fonts.gstatic.com}**', async route => {
    const url = route.request().url();
    const f = ['react.production.min.js', 'react-dom.production.min.js', 'supabase.min.js', 'babel.min.js'].find(k => url.includes(k));
    if (f) return route.fulfill({ body: fs.readFileSync(CDN + f, 'utf8'), contentType: 'application/javascript' });
    if (url.includes('fonts.googleapis.com')) return route.fulfill({ body: '', contentType: 'text/css' });
    return route.abort();
  });
  await p.route('**lockedapi.cescocugliari.workers.dev**', r => r.fulfill({ body: '{}', contentType: 'application/json' }));
  await p.route('**supabase.co**', r => r.fulfill({ body: '{}', contentType: 'application/json' }));
  await p.addInitScript(pf => {
    localStorage.setItem('lk_guestMode', '1');
    localStorage.setItem('lk_tutorialSeen', 'true');
    localStorage.setItem('lk_profile', JSON.stringify({ displayName: 'Athlete', username: 'athlete', useKg: true, createdAt: '1/1/2026' }));
    localStorage.setItem('lk_theme', JSON.stringify(pf));
  }, profile);
  if (opts.media) await p.emulateMedia(opts.media);
  await p.goto('http://localhost:8901/', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3200);
  return p;
}
async function goTab(p, tab) {
  await p.evaluate(t => { const b = [...document.querySelectorAll('nav button')].find(x => x.textContent.toLowerCase().includes(t)); b && b.click(); }, tab);
  await p.waitForTimeout(1000);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const report = { profiles: {}, widths: {}, a11y: {}, tapTargets: {}, contrast: {}, dynamicType: {}, errs: {} };

  // 1) all profiles x all pages (screenshots + attr + errors)
  for (const prof of PROFILES) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const p = await boot(ctx, prof);
    const attr = await p.evaluate(() => document.documentElement.getAttribute('data-style-profile'));
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    for (const page of PAGES) {
      await goTab(p, page);
      await p.screenshot({ path: OUT + `p-${prof}-${page}.png` });
    }
    report.profiles[prof] = { attr, bg, ok: attr === prof };
    report.errs[prof] = p.errs.slice(0, 3);

    // tap-target scan on this profile (home only for non-dark)
    const pagesToScan = prof === 'dark' ? PAGES : ['home'];
    let worst = [];
    for (const page of pagesToScan) {
      await goTab(p, page);
      const small = await p.evaluate(pg => {
        const out = [];
        document.querySelectorAll('button,[role=button],a,input,select').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return; // hidden
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') return;
          const isBtn = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
          const effH = isBtn ? Math.max(r.height, 44) : r.height;
          const effW = isBtn ? Math.max(r.width, 44) : r.width;
          if (effH < 43.5 || effW < 43.5) {
            const pad = Math.max(0, (44 - r.height) / 2);
            out.push({ pg, t: (el.textContent || el.placeholder || el.ariaLabel || '?').trim().slice(0, 22), w: Math.round(r.width), h: Math.round(r.height) });
          }
        });
        return out;
      }, page);
      worst = worst.concat(small);
    }
    if (prof === 'dark') report.tapTargets = { count: worst.length, sample: worst.slice(0, 25) };

    // contrast scan (per profile, home + fuel)
    let fails = [];
    for (const page of prof === 'dark' ? ['home', 'fuel'] : ['home']) {
      await goTab(p, page);
      const f = await p.evaluate(pg => {
        function parse(c) { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : null; }
        function lum(r, g, bb) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); }
        function effBg(el) {
          let n = el;
          while (n && n !== document.documentElement) {
            const cs2 = getComputedStyle(n);
            if (cs2.backgroundImage && cs2.backgroundImage !== 'none') return null; // gradient: unknown, skip
            const p = parse(cs2.backgroundColor);
            if (p && p.length >= 3 && (p.length === 3 || p[3] > 0.85)) return p;
            n = n.parentElement;
          }
          return parse(getComputedStyle(document.body).backgroundColor) || [0, 0, 0];
        }
        const out = []; const seen = new Set();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node, i = 0;
        while ((node = walker.nextNode()) && i < 600) {
          const t = node.textContent.trim();
          if (!t || t.length < 2) continue;
          if (/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s\uFE0F\u200D]+$/u.test(t)) continue;
          const el = node.parentElement;
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight * 3) continue;
          i++;
          const cs = getComputedStyle(el);
          const fg = parse(cs.color); if (!fg) continue;
          if (fg.length === 4 && fg[3] < 0.5) continue;
          const bgc = effBg(el); if (!bgc) continue;
          const L1 = lum(fg[0], fg[1], fg[2]), L2 = lum(bgc[0], bgc[1], bgc[2]);
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const px = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
          const isLarge = px >= 24 || (px >= 18.66 && bold);
          const floor = isLarge ? 3 : 4.5;
          const key = t.slice(0, 16) + cs.color;
          if (ratio < floor && !seen.has(key)) { seen.add(key); out.push({ pg, t: t.slice(0, 20), r: Math.round(ratio * 100) / 100, px: Math.round(px), floor }); }
        }
        return out;
      }, page);
      fails = fails.concat(f);
    }
    report.contrast[prof] = { fails: fails.length, sample: fails.slice(0, 12) };
    await ctx.close();
  }

  // 2) widths sweep (dark, home+fuel)
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block' });
    const p = await boot(ctx, 'dark');
    const hscroll = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    await p.screenshot({ path: OUT + `w-${w}-home.png` });
    await goTab(p, 'fuel');
    const hscroll2 = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    report.widths[w] = { hscrollHome: hscroll, hscrollFuel: hscroll2 };
    await ctx.close();
  }

  // 3) a11y modes
  for (const [name, media] of [['reduced-motion', { reducedMotion: 'reduce' }], ['dark-scheme', { colorScheme: 'dark' }]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const p = await boot(ctx, 'dark', { media });
    await p.screenshot({ path: OUT + `a11y-${name}.png` });
    report.a11y[name] = { errs: p.errs.slice(0, 2) };
    await ctx.close();
  }

  // 4) dynamic type 310%
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const p = await boot(ctx, 'dark');
    await p.evaluate(() => { document.documentElement.style.fontSize = '310%'; });
    await p.waitForTimeout(900);
    const hscroll = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    await p.screenshot({ path: OUT + 'dt-310-home.png' });
    report.dynamicType = { hscroll310: hscroll };
    await ctx.close();
  }

  fs.writeFileSync(OUT + 'report.json', JSON.stringify(report, null, 1));
  console.log(JSON.stringify({
    profiles: Object.fromEntries(Object.entries(report.profiles).map(([k, v]) => [k, v.ok])),
    contrastFails: Object.fromEntries(Object.entries(report.contrast).map(([k, v]) => [k, v.fails])),
    tapTargetCount: report.tapTargets.count,
    widths: report.widths,
    dynamicType: report.dynamicType,
    errs: report.errs,
  }, null, 1));
  await b.close();
})();
