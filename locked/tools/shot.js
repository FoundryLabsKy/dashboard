// Screenshot harness for LOCKED: serves dist/ (or source) with CDN deps stubbed from disk.
// Usage: node shot.js <outPrefix> [profile] [screenTab]
const { chromium } = require('playwright-core');
const fs = require('fs');
const CDN = '/tmp/claude-0/-home-user-dashboard/dd66806a-dc71-579c-b790-f0410aa11703/scratchpad/cdn/';
const FILES = {
  'react.production.min.js': 'react.production.min.js',
  'react-dom.production.min.js': 'react-dom.production.min.js',
  'supabase.min.js': 'supabase.min.js',
  'babel.min.js': 'babel.min.js',
};
(async () => {
  const [out, profile = 'dark', tab = ''] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 140)));
  await p.route('**{unpkg.com,cdn.jsdelivr.net,fonts.googleapis.com,fonts.gstatic.com}**', async route => {
    const url = route.request().url();
    const hit = Object.keys(FILES).find(k => url.includes(k));
    if (hit) return route.fulfill({ body: fs.readFileSync(CDN + FILES[hit], 'utf8'), contentType: 'application/javascript' });
    if (url.includes('fonts.googleapis.com')) return route.fulfill({ body: '/*stub*/', contentType: 'text/css' });
    return route.abort();
  });
  await p.route('**lockedapi.cescocugliari.workers.dev**', r => r.fulfill({ body: '{}', contentType: 'application/json' }));
  await p.route('**supabase.co**', r => r.fulfill({ body: '{}', contentType: 'application/json' }));
  await p.addInitScript(pf => {
    localStorage.setItem('lk_guestMode', '1');
    if (!localStorage.getItem('lk_profile')) localStorage.setItem('lk_profile', JSON.stringify({displayName:'Athlete',username:'athlete',useKg:true,createdAt:'1/1/2026'}));
    localStorage.setItem('lk_tutorialSeen', 'true');
    localStorage.setItem('lk_theme', JSON.stringify(pf));
  }, profile);
  await p.goto('http://localhost:8901/', { waitUntil: 'load', timeout: 60000 }).catch(e => errs.push('nav:' + e.message.slice(0, 80)));
  await p.waitForTimeout(3500);
  // enter guest mode if the auth shell is showing
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /continue without account/i.test(x.textContent)); if (b) b.click(); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /continue as guest/i.test(x.textContent)); if (b) b.click(); });
  await p.waitForTimeout(6000);
  if (tab) {
    await p.evaluate(t => { const btns = [...document.querySelectorAll('nav button')]; const b = btns.find(x => x.textContent.toLowerCase().includes(t)); if (b) b.click(); }, tab);
    await p.waitForTimeout(1500);
  }
  if (process.env.ROOTSCALE) await p.evaluate(s => { document.documentElement.style.fontSize = s; }, process.env.ROOTSCALE);
  if (process.env.ROOTSCALE) await p.waitForTimeout(800);
  await p.screenshot({ path: out });
  console.log(JSON.stringify({
    profile: await p.evaluate(() => document.documentElement.getAttribute('data-style-profile')),
    bodyBg: await p.evaluate(() => getComputedStyle(document.body).backgroundColor),
    hasNav: await p.evaluate(() => !!document.querySelector('nav')),
    errs: errs.slice(0, 4),
  }));
  await b.close();
})();
