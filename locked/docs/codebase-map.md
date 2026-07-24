# LOCKED — Codebase Map

All line references are `index.html` (14,661 lines) unless prefixed with another filename. This file is the single source for the frontend: a pre-React vanilla-JS auth/sync/paywall shell (lines 66–1057) followed by one giant `<script type="text/babel">` block (L1061–14652) containing the entire React app in ES5-style JSX.

---

## 1. Stack

| Layer | What it is | Where |
|---|---|---|
| Framework | React 18.3.1 UMD + ReactDOM from unpkg, SRI-pinned; JSX compiled **in-browser** by `@babel/standalone` 7.25.6 in dev | CDN tags L58–61; JSX block opens L1061 |
| Language style | ES5-in-JSX throughout: `var`, `function(){}`, no arrows, no modules, no imports | e.g. L2325, L8142, L14389 |
| State/data | React `useState` + `localStorage` via `ld()/sd()` helpers (keys prefixed `lk_`) | L1316–1317 |
| Auth/sync | Vanilla-JS IIFE before React: Supabase (supabase-js 2.45.4, L61) auth overlay, bidirectional cloud sync over `SYNC_KEYS` (L122–142), paywall/trial gating; exposed to React via `window.LOCKED` bridge (session, `can()`, `paywall()`, `toast()`, `forceSync()`, `onReady()`) | IIFE L66; bridge L1012–1045 |
| Backend | Single Cloudflare Worker `lockedapi.cescocugliari.workers.dev` (`worker.js`): main AI proxy `POST /` (Groq), plus `/analyze-meal`, `/parse-receipt`, `/analyze-physique`, `/voice`, `/store-search`, `/yt-search`, beta-* and user/* routes; ES256 JWT verify against Supabase JWKS, CORS allowlist | `worker.js` L1–120 + `ROUTE:` markers; base URL constant `WORKER_API` at L2237 |
| Styling | 100% inline React `style={{}}` objects + one master stylesheet built as a JS string array `CSS` (L1112–1311), injected as `<style>{CSS}</style>` in 5 places (L7494, L7538, L7558, L7579, L14588). No CSS classes in JSX, no CSS-in-JS lib. Theming = CSS custom properties + brittle `[style*='...']!important` attribute-selector patches (L1173–1219, 1280–1309) | §3 |
| Animation | ~45 `@keyframes` in the `CSS` array (L1122–1161, 1214–1217) referenced by name from inline styles; inline `transition:` strings; JS `setTimeout`/`setInterval` for toasts, timers, typewriters; zero animation libraries | §4 |
| Routing | No router/hash/history. One state string: `var [screen,setScreen]=useState('home')` (L14396) + `go(scr)` (L14561) prop-drilled everywhere; `renderTab()` is the route table (L14569–14584); sub-screens are per-component `view`/`tab` state machines with early returns | §2 |
| Build | `build.mjs` (`npm run build`): finds the single text/babel block, transpiles once with `@babel/core` + `@babel/preset-react` (classic runtime), strips the Babel CDN tag, writes `dist/index.html`, copies `manifest.json`/`sw.js`/`icon.svg`. Excludes `admin/` (service-role key). Zero runtime deps in `package.json` | `build.mjs` L1–71 |
| PWA/deploy | `sw.js`: single cache `locked-v1`, network-first/cache-fallback for same-origin + unpkg/jsdelivr/Google-Fonts GETs only; Worker/Supabase never intercepted. Deploy-version check in the head unregisters SW + purges caches + hard-reloads on mismatch (L36–47). `manifest.json`: standalone, portrait, `#080809` theme/background, single maskable SVG icon. Deploy targets per Worker CORS defaults: Netlify (+ localhost regex) | `sw.js` L1–56; `manifest.json` |

---

## 2. Pages / routes

### Top-level route table — `App` (L14389), `renderTab()` (L14569–14584)

`screen` values → components (each wrapped in `<ScreenBoundary key={screen}>` L14583, **except `fuel`, which early-returns unwrapped at L14578 — inconsistency worth fixing**):

```
App (L14389)  — global state, workout lifecycle, Supabase profile sync (L14407–14428)
├─ Onboarding gate (L14563): no displayName/username → Onboarding (L7355)
│    └─ 4-step machine (step state L7356): splash+beta code → name → units → AI coach chat
│       parsing ###PROGRAM_START### JSON (early returns L7492/7536/7556/7577)
├─ 'home' | 'workout' → HomeScreen (L5408)
│    ├─ Weekly Recap full-screen sub-view (showRecap, L5453)
│    ├─ WorkoutDetail push (selectedWorkout, L5449 → L4789)
│    ├─ Block layout via getHomeLayout() (L5342/5507): BLOCKS map L5508–5587
│    │  ids: stats/insight/quick/feed/start/supps/cycle/progress/recap/calendar/recent
│    ├─ ProactiveTipCard (L5007), DynamicFeed (L5176), QuickActionsRow (L5372)
│    ├─ SuppReminderCard (L11232), CycleReminderCard (L11596, perfTracking-gated)
│    └─ go('progress') → ProgressPage (Nav highlights 'home', L14626)
├─ 'train' → TrainHub (L4346)
│    ├─ tab state: splits | history | library (bar L4401–4405)
│    ├─ view state: main|create|edit|library|aibuilder → SplitBuilder (L2644),
│    │  ExLib (L2351), AISplitBuilder (L4007); WorkoutDetail via selectedWorkout (L4360)
│    ├─ day-picker bottom sheet (dayModal L4364, sheet L4366–4373)
│    ├─ AdaptiveTrainingCard (L4290; Pill L4311, Section L4318)
│    └─ onStart → App.startWorkout (L14525); onCardio → 'cardio'
├─ (workout active) → WorkoutLog (L2972) — permanently mounted, display-toggled
│    (L14615–14619) so timers survive tab switches; floating "in progress" bar
│    when browsing elsewhere (L14605–14613)
│    ├─ internal view: log | add (ExLib) | replace (ReplacePanel L2607) — L3451–3452
│    ├─ NumPad (L2918), PlateCalc (L14058), ExerciseDetailModal (L2266)
│    └─ onFinish → 'review' → Review wizard (L4515: summary→reflect→AI)
├─ 'cardio' → CardioLog (L14228; picker vs form on `type` state L14292)
├─ 'fuel' → FuelTab (L8142)
│    ├─ view state: main | profile (FuelProfileSetup L7856) | shop (→ ShoppingBudgetTab) — L8221–8222
│    ├─ two-level tab UI (L8273–8295): Log chips → ListTab (L8706), SearchTab (L8950,
│    │  + ManualEntry L8839, MY STORE view L9123, USDA key view L9155), PhotoTab (L9272),
│    │  SupplementsTab (L11270), CycleTab (L11636, perfTracking-gated);
│    │  Meals pair → MealPlanFuelTab (L8310), RecipesTab (L9374, RCard L9440)
│    └─ cards: MacroRing (L7842), WaterCard (L8022), SmartNutritionCard (L8067),
│       RefeedCard (L13550), WeightLogCard (L13572)
├─ 'shopping' → ShoppingBudgetTab (L11118) — shell w/ 4 sub-tabs (state L11119)
│    ├─ ShoppingTab (L9909), PantryTab (L10262), MyStoresTab (L9803), BudgetTab (L10351)
│    └─ MealPlannerTab (L10838) also lives in this cluster
├─ 'coach' → CoachScreen (L12100)
│    ├─ coachTab: chat | plan | check-in | instructions (control L12810–12815)
│    ├─ chat parses ###PROGRAM/RECIPE/GOAL/FOOD/PLAN/INSTRUCTIONS/SHOPPING_ADD###
│    │  markers into action cards; shopping-approval modal L13200–13248
│    └─ check-in → FeedbackScreen (L13255; RatingRow L13294)
├─ 'profile' → ProfileScreen (L6577) → go('settings')
├─ 'settings' → SettingsScreen (L7028; settingsView 'layout' → LayoutEditor L6956)
├─ 'progress' → ProgressPage (L6090)
│    ├─ tab: overview | goals (GoalsTab L5619) | calendar | photos (ProgressPhotos
│    │  L6671, lightbox L6829) | prs (PRHub L6347, early return L6166)
├─ 'betaAdmin' → BetaAdminPanel (L13419; sub-tabs codes/activity/ai/feedback L13424)
├─ 'review' → Review (L4515); Nav hidden (showNav L14567)
└─ global chrome: Nav (L2325, 5 tabs home/train/fuel/coach/profile, L2327–2331),
   VoiceButtonWrap (L13679 → VoiceButton L13694, mounted L14628),
   TutorialOverlay (L13869), resume-workout dialog (L14591–14602),
   toasts (L14630–14641), ErrorBoundary (L1359) / ScreenBoundary (L1384)
```

Nav active-tab remapping (L14626): workout→train, settings/betaAdmin→profile, progress→home.

Pre-React layer: auth overlay `buildOverlay` (L658) hides `#root`; `_authMode` login/signup/confirm mini-router (L821–828); paywall sheet `showPaywall` (L527) via `window.LOCKED.paywall()`; trial banner (L501); vanilla toast (L994). Deep link: `?reset=1` password-reset (L348). Hard reloads act as navigation: deploy mismatch (L36–47), guest entry (L111), sync-pulled data (L463–467), cycle-logging toggle (L7245), danger-zone reset (L7329).

---

## 3. Design-token state

### What exists
- **14 CSS custom properties, colors only** — no spacing/radius/type/motion/z-index tokens. Dark defaults in `html{}` rule of the CSS array (L1115): `--color-bg #000`, `--color-surface #0D0D0F`, `--color-card #1C1C1E`, `--color-border rgba(255,255,255,0.09)`, `--color-text #F5F5F7`, `--color-text-muted #A1A1AA`, `--color-text-subtle #2C2C2E`, `--color-accent #F97316`, `--color-accent-dark #7C3A0E`, `--color-success #22C55E`, `--color-error #EF4444`, `--color-info #3B82F6`, `--color-shadow`, `--color-shadow-light`.
- **JS aliases** consumed by inline styles everywhere: `BG/SURF/CARD/BORD/OR/ORD/TX/MU/SU/GR/RE/BLU/SHADOW = "var(--color-*)"` (L1103–1110); raw-hex twins `OR_H/ORD_H/GR_H/RE_H/BLU_H` (L1109) exist solely for **alpha-by-string-concat** (`OR_H+"18"`, `RE_H+"40"`) — the app's de-facto opacity system (suffixes 08–99 used dozens of times per screen).
- **Theme mechanism (works today):** `THEMES` registry L1320–1326 (dark/slate/navy/midnight/light, accent never varies); `applyTheme()` L1334–1343 swaps `<html>` classes (`light-mode` L1116, `theme-slate` L1279, `theme-navy` L1290, `theme-midnight` L1301 — overriding only the 9 neutral tokens); persisted as `lk_theme` (L1342 via `sd`), cloud-synced (`SYNC_KEYS` L139); `setTheme/toggleTheme` dispatch window `theme-changed` (L1348/1353) that ProfileScreen listens to (L6581).
- **Dead code:** `CSS_THEME` template literal (L1068–1100) is never injected — its content is duplicated inside the CSS array at L1115–1116.
- **Second, mismatched token object:** pre-React shell `var T` (L73–84) — slate-blue neutrals (`#0F172A/#1E293B/#334155`) that do **not** match the app palette, plus its own font constants re-declared per builder (L531–532, 633, 687–688, 768–769, 795–796).

### What's hardcoded
- **636 six-digit hex occurrences on 420 lines** (excludes `#fff` and rgba literals). Top values: `#8B5CF6` violet ×78, `#3B82F6` blue ×70 (token exists, unused), `#EA580C` orange-600 ×65 (fixed end-stop of the signature CTA gradient `linear-gradient(135deg,OR_H,#EA580C)`), `#F59E0B` amber ×59, `#EF4444` ×46, `#22C55E` ×41, `#F97316` ×33, `#10B981` ×20, `#EC4899` pink ×17 — i.e. **the entire semantic/category vocabulary (macros P/C/F = blue/amber/pink, AI = violet, stats, badges, gradients) has no tokens**. Legacy grays (`#F5F5F5/#9CA3AF/#111113/#18181B/#080809`) predate the token layer and are re-colored per theme via `[style*='color:#F5F5F5']{...!important}` patch selectors (L1181–1183 etc.).
- **Typography untokenized:** 242 `fontFamily` occurrences, 237 hardcoding `'Barlow Condensed'` inline (e.g. L2275, L2311); body 'DM Sans' set globally (L1118/1120), headings rule L1171; Google Fonts import L1113. Changing the display face = ~240 edits.
- **Domain color data:** muscle-group colors in `GROUPS` (L1647–1943), `GOAL_TYPES` (L5603), `COMPOUND_CATEGORIES` (L11493), `dayColors` (L8508, L10949), `mealColors` (L8788), `STORE_PALETTE` (L9783), `LOCKED_VISION` accents (L5062), plate colors `pColor()` (L14106–14123).
- Focus rings and glow keyframes hardcode `rgba(249,115,22,…)` instead of the accent var (L1166–1167, L1141–1142, L1156).

### Where the single source of truth should go
The `html{}` token rule inside the `CSS` array (L1115) is the only place variables are actually applied — extend it (semantic accents, radii, spacing, type, easing as `--ease-*`/`--dur-*`), keep the JS aliases at L1103–1110 as the JSX-facing API (add `VIOLET/AMBER/PINK/EMERALD` + a real alpha helper), delete dead `CSS_THEME` (L1068), and fold the shell's `T` object (L73) into the same values. Per-theme overrides stay as the class blocks at L1116/1279/1290/1301.

---

## 4. Motion inventory

### 4.1 Keyframes registry (all in the `CSS` array)
General: `fadeUp` L1122, `pulse` L1123, `slideUp` L1124, `slideDownBanner` L1125, `slideFromTop` L1126, `shimmer` L1127, `scalePopOut` L1155, `glowPulse` L1156, `checkPulse` L1157, `jiggle` L1158, `partialsFlash` L1159 (flashes hardcoded `#8B5CF6`), `spin` L1160, `progressArc` L1161, `overlayIn`/`pillIn`/`cardRise`/`dotSpring` L1214–1217. Tutorial/lock set: `tutFadeIn/tutFadeUp` L1128–1129, `tutIconIn` L1130, `tutPulseGlow` L1131, `tutGridMove` L1132, `tutCursor` L1133, `tutCircleDraw/tutCheckDraw` L1134–1135, `lockBodyIn` L1136, `lockShackleRotate/Open` L1137–1138, `lockRingExpand/2` L1139–1140, `lockFinalGlow` L1141, `tutButtonGlow` L1142, particle burst `tutP1–tutP12` L1143–1154.

**Reduced motion:** global kill switch L1162 (`prefers-reduced-motion` → 0.01ms everything).

### 4.2 Global CSS transitions (apply to every touchable — flagged)
- L1163 — `button,a,[role=button]`: `transform .3s cubic-bezier(0.34,1.3,0.64,1)` (overshoot "spring") + box-shadow/bg/color/border/opacity. **Fixed-duration overshoot curve on every button in the app.**
- L1164–1165 — hover lift `translateY(-1px)`; `:active scale(0.97)` at fast `.08s`. Nav overrides: hover lift disabled, `nav button:active scale(0.92)` (L1220–1221).
- L1166–1167 — focus rings, inset orange shadow (hardcoded rgba).
- L1168 — **blanket rule**: any element whose inline style contains `background` gets `0.24s ease` transitions on background/box-shadow/transform/color (theme cross-fade; also means arbitrary elements animate on every state change). Same idea for `[style*='border:1px']` L1172.
- L1118 — body theme cross-fade `0.3s`; L1210–1211 grid-button `all 0.2s` + `:active scale(0.96)`; L1212–1213 forces 44×44 touch targets.

Distinct easing curves in the file (23 `cubic-bezier` uses): `(0.32,0.72,0,1)` iOS-sheet ×7; `(0.25,1,0.5,1)` ×7 (tutorial cluster); `(0.34,1.3,0.64,1)` overshoot ×4 incl. global L1163; `(0.22,1,0.36,1)` ×4; `(0.16,1,0.3,1)` ×1 (paywall L546); `(0.25,0.46,0.45,0.94)` ×1 (L13831). No JS spring physics anywhere.

### 4.3 Sheet/modal entrances (`slideUp .5s cubic-bezier(0.32,0.72,0,1)` + `overlayIn .3s` backdrop)
ExerciseDetailModal L2271/2273 · Add-Block sheet L3966–3967 · day-picker L4366–4367 · PlateCalc L14135–14136 · cardio custom-activity modal L14375–14376 · swap modal etc. Rest-timer settings drop from top `slideFromTop 0.32s (0.22,1,0.36,1)` L3468. Vanilla paywall: `translateY(100%)` + `transform 0.38s (0.16,1,0.3,1)` L546, triggered one rAF after append L626; auth overlay fade `opacity 0.3s` L668 + timed removal L651.

### 4.4 Staggered entrances
ExLib sub-muscle rows `fadeUp .3s i*.05s` L2561; group grid `i*.04s` L2590; recovery pills `pillIn .45s (0.34,1.3,0.64,1) i*.05s` L4312; AdaptiveTrainingCard `cardRise .5s` L4329; Weekly Recap stats `fadeUp .4s i*.08s` L5471; Home stats `i*.06s` L5512; wiggle-mode cards stagger `animationDelay (ri%8*40)ms` L3602/3649/3759; tutorial bullets `tutFadeUp i*.06s` L14031; Nav pill `pillIn .35s` on activation L2339.

### 4.5 Workout-screen motion
Completed-set `scalePopOut 0.3s` keyed to state L3893 (trigger + 400ms clear L3252); PR banner `scalePopOut + glowPulse` L3492 (toast cleared 3500ms L3273); rest banner `slideDownBanner` L3498; SVG rest ring `stroke-dashoffset 0.45s linear` (red ≤10s) L3503; sticky header padding `0.2s` L3557; tools menu `fadeIn 0.15s` L3574; swipe reveals `opacity .15s` + `transform .2s` snap-back (L3703–3704, 3838–3841, 3890–3893); done checkboxes `background .15s` L3849/3900; superset done fades L3707–3728; partials flash L3912–3913; drag ghost = state-driven `translateY` with `willChange`, no transition (L3457, SplitBuilder pill L2804).

### 4.6 Loading indicators
Three-dot staggered `pulse 1.4s i*0.2s`: auth submit L865–867, AI chat L4266, Review AI L4646, onboarding L7612, recipes L9517/9553, coach chat L13185. `pulse` as spinner: goal analysis L5897, cycle overview L12004; true `spin`: physique analysis L14867→L6867, voice processing L13833. Plan-generation ellipses `pulse 1.2s` L8629/8676/10149/11066. LoadingSpinner dot L2121.

### 4.7 Progress bars & rings (width/offset transitions)
Water L8056 · macros L8255 · budget L10653 (gradient swaps green→amber→red) · goal cards `width .3s` L6050 · goal ring `stroke-dashoffset .5s` L5854 · plan bars `width .5s` L12907/12931/12967, mini `width .3s` L13007 · tutorial progress `0.45s (0.25,1,0.5,1)` L14013.

### 4.8 Hand-built toggle switches (track `background .2s`, knob `left .2s`)
Partial reps L7219–7220 · voice L7232–7233 · cycle logging L7245–7246 · supplement reminder L11439–11440.

### 4.9 JS-timer "animations" (state flips, no CSS keyframes)
Toast auto-dismisses: vanilla 3500+300ms L1006; save-confirm resets 1500–3000ms at L9111, L9473, L12141, L12148 (pattern repeats L12532/12550/12587/12625/12641), L13280, L14104, L14547, L14574; QuickActions flash 1800ms L5381; voice toast imperative DOM fade L13634 (target div L14630). Keyboard-avoidance scrolls: 100ms + `scrollIntoView smooth` L8867/9183/9204, chat scroll hacks L4279/L13191. Fake latency: cardio save 300ms L14264. Clocks: workout elapsed 500ms L3135, rest countdown 500ms L3171, rest re-trigger 50ms L3196. Edge auto-scroll 16ms intervals during drags L2762, L3438–3447. Tutorial typewriters: 110ms letters L13909, 34ms chars L13918, 240–280ms exit sequencing L13923–13935. Non-visual: beta sync 60s poll L1558, store-search debounce 500ms L9931, staggered `window.open` 350ms L10031.

### 4.10 Tutorial/lock finale set
Intro `tutFadeIn` L13952, grid `tutGridMove 12s` L13954, glow orb L13956, per-letter reveal L13960, CTA `tutButtonGlow` L13965; done-phase particles L13976, padlock `lockShackleRotate` L13982 (3D, transformOrigin 80px 52px), rings L13993–13995, body L13996, text cascade L14003–14005; step icon `tutIconIn` L14020, caret `tutCursor` L14026, dot pager stretch L14046, NEXT button recolor L14051.

### 4.11 Misc flagged touchables with fixed curves
VoiceButton corner snap `transform 0.35s (0.22,1,0.36,1)` L13831 + press scale L13835; cardio tiles `border/transform .15s` with JS press handlers L14303–14306 (mouse-only, no touch twin); RatingRow emoji pop `font-size .18s (0.34,1.3,0.64,1)` L13307; check-in toast `slideFromTop .32s` L13325; segmented controls `all 0.18s` (L2339 nav pill, L8280, L12813, L703–704 vanilla auth); floating workout bar dot `pulse 2s` L14608; in-progress bar taps everywhere inherit the global L1163 overshoot.

---

## 5. Gesture & drag inventory

### 5.1 Exercise-reorder drag #1 — SplitBuilder (L2644)
- **Arm:** `sbLongStart` (L2672) — 350ms `setTimeout` long-press on a 3-line grab handle (`onTouchStart` attached at exercise rows L2856 and note-block rows L2873, `touchAction:'none'`); a temporary **passive** document `touchmove` (L2683) cancels if the finger moves >10px (scroll intent); `navigator.vibrate(30)` on activation (L2718 area).
- **Drag:** `handleMove` (L2692) — document `touchmove` (**passive:false + preventDefault**), tracks clientY, hit-tests `[data-sbrow]`/`[data-sbday]` via `getBoundingClientRect`; floating pill follows finger via inline `translateY(dragY-24px)` per-event, no rAF (L2804); non-dragged rows run `jiggle 0.7s infinite` (L2855/2872).
- **Drop:** `touchend` → `sbDragEnd` splices the array (L2725–2749). Edge auto-scroll: 16ms interval `window.scrollBy` in 100px zones (L2762).
- Related tap: day-name tap-to-rename inline input (L2826–2831).

### 5.2 Exercise-reorder drag #2 — WorkoutLog wiggle mode (L3307–3447)
- **Arm:** `onLongPressStart` (L3322) — 350ms hold on the handle (attached L3614 block / L3666 superset / L3776 exercise, paired `onTouchEnd={onLongPressCancel}`); passive tracker cancels at >10px (L3328–3335); enters **wiggle mode only** — deliberately does *not* start the drag, to dodge an iOS Safari phantom `touchend` when the held card is DOM-swapped for a ghost (comment L3342–3344); `vibrate(30)` L3347.
- **Drag:** `startWiggleDrag` (L3382) — touching any wiggling compact card (L3602/3649/3759) begins the real drag: document `touchmove` (passive:false) + `touchend`, `dragY` state drives a fixed ghost card (L3457), hit-tests `[data-exrow]` (L3396–3405), `vibrate(20)`; `onDragEnd` splices rows + detaches (L3356); unmount cleanup L3427–3435; 16ms edge auto-scroll L3438–3447.
- **Exit:** tap blank space in the list container exits wiggle mode (L3592); `onContextMenu` suppressed on card headers (L3773).

### 5.3 Swipe-to-delete (WorkoutLog)
- Normal/unilateral set rows: `onTouchStartSet/MoveSet/EndSet` (L3288–3305) — leftward-only (dx clamped ≤0), aborts if vertical dy>15, engages at dx<−10, **deletes at dx<−80**; attached at L3834–3836 and L3886–3888; red gradient reveal + snap-back transitions (L3890–3893).
- Superset pairs: inline `onTouchStart/Move/End` with `ssSwipe` state (L3699–3701); dx<−80 removes set from both paired exercises.

### 5.4 Mic/voice floating control — VoiceButton (L13694), gated by VoiceButtonWrap (L13679)
- Mounted globally at L14628 (`fixed`, zIndex 500) when nav visible + profile exists; enabled via `lk_voiceEnabled` toggle in Settings (L7232) syncing through `lockedVoiceToggle` + `storage` window events (L13683–13684).
- **Drag:** `onPointerDown` (L13822, attached as both `onMouseDown` + `onTouchStart` L13835) stores offsets in `dragRef`; window-level `mousemove/touchmove/mouseup/touchend` (L13810–13813, touchmove passive:false + preventDefault L13791); **6px threshold** separates tap from drag (L13789); FAB moves via `translate3d` (L13831), clamped 4px inside viewport (L13795–13796).
- **Release:** moved → `snapToNearest` of 4 corners, persisted `lk_voiceBtnCorner` (L13775–13782), animated by the 0.35s snap transition (L13831); not moved → `toggleRec()` (L13808). `onMouseUp/onTouchEnd` while recording stops recording (L13835). Recording halo `pulse` L13839; processing `spin` ring L13833.
- **Action flow:** MediaRecorder → POST `/voice` (L13733) → bottom-sheet confirm modal (tap-outside-to-close, L13843–13844) → `executeVoiceAction` (L13636) writes other tabs' localStorage stores and dispatches `lockedFuelUpdate` (L13650/13659; FuelTab listens L8183–8187); feedback via `showVoiceToast` (L13634 → div L14630).

### 5.5 Other gestures & taps
- Tutorial swipe: touchstart/touchend delta >50px → next/prev step (L13937–13943, root L14011); dot pager `jumpTo` L14045.
- Tap-outside-to-close backdrops: paywall L620, guest modal L785, lightbox L6830 (stopPropagation islands L6835/6855/6859/6876/6923), voice sheet L13843, PlateCalc L14135, day-picker/ConvertToSplit/etc. via backdrop `onClick`.
- Haptics: `vibrate(30)` set-complete L3250, `[100,50,100]` all-time PR L3271, 30/20ms in both drags (L3347/3414, L2718).
- PlateCalc plate tap-to-remove `undoLast()` L14171.
- JS press-scale (mouse-only, no touch handlers): cardio tiles L14304–14306, TRACK DISTANCE toggle L14380, modal CREATE/CANCEL L14381–14382.
- Camera/library pickers via hidden `<input capture="environment">`: ProgressPhotos L6754/6764, PhotoTab L9344–9345, BudgetTab receipts L10409.
- Keyboard: Enter-to-send/submit at L7625, L9183, L10143, L10301, L10744, L12855, L13191.
- Home-block reordering is **not** drag-based: LayoutEditor ▲/▼ buttons `move(id,±1)` (L6997–6998).
- Global CSS suppresses selection/callout app-wide (`user-select:none`, `-webkit-touch-callout:none` L1118).

---

## 6. Scroll containers

The app scrolls the **document body** by default (phone column `maxWidth:420`, `overflowX:hidden` shell L14603; screens clear the fixed nav with `paddingBottom:80–160`, e.g. L5491, 6175, 14293). Scrollbars hidden globally (`::-webkit-scrollbar{display:none}` L1119). Explicit containers:

| Container | Style | Line |
|---|---|---|
| Paywall sheet `#lk-pw-sheet` | `overflow-y:auto; max-height:92vh` | 547 |
| Auth overlay `#locked-auth-overlay` | full-screen `overflow-y:auto` | 667 |
| ExerciseDetailModal body | `overflowY:auto; flex:1` | 2278 |
| AISplitBuilder chat root / message list | `100dvh` + `overflow:hidden` shell; list `flex:1; overflowY:auto` (auto-scroll effect L4022–4024) | 4235 / 4245 |
| TrainHub day-picker sheet body | `overflowY:auto` in `maxHeight:75vh` sheet | 4373 |
| TrainHub recent-workouts chip row | horizontal `overflowX:auto` | 4419 |
| ConvertToSplitModal sheets (new/existing) | `overflowY:auto; maxHeight:80vh` | 4735 / 4758 |
| ProgressPage tab pill row | horizontal `overflowX:auto` | 6207 |
| ProgressPhotos lightbox | fixed inset-0 `overflowY:auto`, sticky top bar L6836 | 6832 |
| Fuel Log sub-tab chip row | horizontal `overflowX:auto` | 8284 |
| MealPlan swap sheet | `maxHeight:80vh; overflowY:auto` | 8667 |
| ShoppingTab suggestions dropdown | absolute, `maxHeight:350; overflowY:auto` | 10145 |
| CycleTab preset-compound browser | `maxHeight:220; overflowY:auto` | 11965 |
| Coach chat message list | `overflowY:auto; height:calc(100vh−220px)` (auto-scroll effect L12115) | 13058 |
| Coach shopping-approval modal | `maxHeight:80vh; overflowY:auto` | 13202 |
| WeightLogCard history | `maxHeight:150; overflowY:auto` | 13606 |
| PlateCalc sheet / chip row / barbell strip | `maxHeight:90vh overflowY:auto` / `overflowX:auto` ×2 | 14136 / 14143 / 14167 |
| TutorialOverlay root | `overflow:hidden` (scroll deliberately locked) | 14011 |

Sticky headers inside body scroll: WorkoutLog L3557, WorkoutDetail L4853/4910, onboarding chat L7580. Onboarding chat list auto-scrolls without its own overflow (L7373–7375, L7590). Keyboard-avoidance scroll hacks: L8867, 9183, 9204, 4279, 13191. Drag edge auto-scroll uses `window.scrollBy` (L2762, L3438–3447).

---

## 7. Risks & constraints for a visual overhaul

1. **One 14,661-line file, ~900KB JSX block.** No modules; components reference top-level globals (`OR_H`, `D`, `GROUPS`, `ld/sd`). Any refactor tooling must operate on a single text/babel block; `build.mjs` **hard-fails or ships uncompiled code if a second `text/babel` script is added** (single-block assumption, build.mjs step 2).
2. **Dual UI layers with divergent styling.** The vanilla auth/paywall/toast shell (L66–1057) uses its own mismatched palette `T` (L73–84, slate-blue) and innerHTML string styles — a reskin must be applied twice or the shell unified first.
3. **Attribute-selector theming is load-bearing and brittle.** Themes patch *serialized inline-style strings* (`[style*='color:#F5F5F5']!important`, L1173–1219, 1280–1309; "DESIGN V2" retrofit L1224–1276). Any change to inline style ordering/values silently breaks light/slate/navy/midnight theming. Migrating those literals to the CSS variables is a prerequisite for safe restyling.
4. **Token coverage gap.** Only 14 neutral color vars; the semantic palette (violet/blue/amber/pink/emerald/orange-600, ~350 of 636 hex literals), all typography (237 inline 'Barlow Condensed'), radii, spacing, easings, and z-index ladder (60/100/300/400/500/998/1000/2000/10000/99999 — L14588 area, L527, L13831, L13869) are untokenized. A style-profile pass must introduce tokens before any palette swap is tractable.
5. **Blanket motion rules create side effects.** L1163 puts an overshoot transform transition on every button; L1168 transitions *any* element with an inline background — new components inherit motion whether wanted or not, and perf on long lists is sensitive to it. Respect the existing `prefers-reduced-motion` kill switch (L1162).
6. **Gesture code is DOM-coupled.** Both reorder drags hit-test `[data-sbrow]`/`[data-exrow]` attributes and depend on exact DOM structure (plus the iOS phantom-touchend workaround comment L3342–3344). Changing card markup can silently break drag/drop and the wiggle-mode exit tap (L3592).
7. **WorkoutLog must stay mounted.** It's display-toggled, not unmounted (L14615–14619), so its timestamp-based timers survive; a routing/layout rewrite that unmounts it breaks active workouts. Same for the resume-dialog/localStorage session restore (L14441–14445, keys `activeWorkout*`).
8. **SW + deploy versioning.** `sw.js` caches same-origin + CDN GETs network-first; stale-build protection lives in the page head (L36–47) comparing the Worker `/app-version` — a redesign that changes the head bootstrap must preserve this or users pin old caches. Users may also need the Settings "Force Refresh" (L7312–7315).
9. **In-browser Babel in dev.** Source `index.html` compiles JSX on every load (~2.8MB Babel); prod is `dist/index.html` via `npm run build`. Test both: classic-runtime pragma means no automatic-runtime JSX features; comments are stripped in prod.
10. **`fuel` route bypasses ScreenBoundary** (early return L14578) — one screen lacks its error boundary; trivially fixable but easy to replicate by pattern-copying.
11. **PWA chrome is dark-hardcoded.** `#080809` in head `<style>` L1055, meta theme-color L9, and `manifest.json` theme/background — a light-first redesign must update all three plus the maskable SVG icon (no raster fallbacks; older iOS needs `apple-touch-icon`).
12. **Cross-component wiring is window-event based** (`theme-changed` L1348, `lockedVoiceToggle` L7058, `lockedFuelUpdate` L8183, `storage`) and `window.LOCKED` bridge calls — no context/provider layer; restyled components must keep dispatching/listening to these.
