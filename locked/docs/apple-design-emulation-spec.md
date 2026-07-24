# Apple Design Emulation Spec

Purpose: give a build agent everything needed to make an app that looks, moves, and feels like a first-party Apple app (iOS 26 / Liquid Glass era). Follow this document exactly. When a choice is not covered here, default to what Apple's own apps do, and prefer restraint.

---

## 1. Philosophy (governs every decision)

Apple's current HIG rests on three principles:

- **Hierarchy**: establish a clear visual structure where controls elevate and distinguish the content beneath them. On every screen ask: what is the user trying to achieve, and how can the UI recede so content shines?
- **Harmony**: align with the concentric design of the hardware and software. Corner radii of UI elements nest concentrically with the device corners and with their parent containers.
- **Consistency**: adopt platform conventions. Never reinvent standard elements (back button, search, share). Familiar patterns reduce cognitive load.

The older foundations still apply underneath:

- **Clarity**: every element immediately understandable, legible text, precise icons.
- **Deference**: the interface defers to content. Chrome recedes; content leads.
- **Depth**: layers, translucency, and realistic motion convey hierarchy and spatial relationships.

Fluid-interface goal (WWDC 2018): the interface should behave the way people think, not the way machines think. It must be **responsive, interruptible, and redirectable**. When the slightest thing feels wrong the illusion shatters.

---

## 2. Layout and spacing

- Spacing on an **8pt grid** (4pt allowed for fine-grained gaps).
- **Minimum tap target: 44 x 44 pt.** No exceptions for interactive elements.
- Standard screen margins: 16pt (compact), 20pt on larger phones.
- Generous whitespace. If a screen feels crowded, remove elements before shrinking spacing.
- **Concentric corner radii**: inner radius = outer radius minus the padding between them. Cards inside cards, buttons inside sheets, all nest. Never mix radii arbitrarily.
- Group related actions. Merge similar actions in toolbars and tab bars rather than adding more buttons.
- One primary action per screen, visually dominant. Secondary actions recede.

---

## 3. Typography

- **One family: SF Pro** (system font). Weight creates hierarchy, never a second display font.
- SF is a variable font with automatic optical sizing: below 20pt the system uses Text-style proportions (wider letter spacing, slightly heavier strokes), 20pt and above uses Display proportions (tighter spacing). Tracking is automatic per size. Do not override tracking or leading except in exceptional cases, and if you must, make it size specific.
- **Body text floor: 17pt.** Never smaller for primary reading content.
- iOS text styles to use (default Large size):
  - Large Title 34pt bold
  - Title 1 28pt / Title 2 22pt / Title 3 20pt
  - Headline 17pt semibold
  - Body 17pt regular
  - Callout 16pt
  - Subheadline 15pt
  - Footnote 13pt
  - Caption 1 12pt / Caption 2 11pt
- Support **Dynamic Type**: 7 standard sizes plus 5 accessibility sizes (body can scale to roughly 310%). Layouts must reflow, not truncate.
- SF Pro Rounded only for soft, friendly moments (timers, fitness). SF Mono for code and tabular data. New York (serif) only for reading-focused content.

---

## 4. Color

- Design with **semantic roles, not raw hex**: label, secondaryLabel, systemBackground, secondarySystemBackground, separator, systemBlue, etc. This makes light mode, dark mode, and increased-contrast modes work for free.
- **One accent color** (default systemBlue) used consistently to indicate interactivity. Do not scatter multiple accents.
- Color communicates: interactivity, status, hierarchy. Never decoration alone.
- Test every screen in light and dark mode. Contrast: 4.5:1 body text, 3:1 large text (18pt+), and check the worst point when text sits over gradients or images.
- Never hardcode "Apple system colors" as fixed hex; they are adaptive per mode.

---

## 5. Materials and Liquid Glass

Liquid Glass is a dynamic material, not a skin. It is translucent, refracts and reflects the content behind it, has specular highlights that respond to motion, and adapts to light and dark content.

Rules:

1. **Glass lives on the navigation and control layer only**: tab bars, toolbars, nav bars, floating controls. It is a thin overlay floating above content.
2. **Never glass on glass.** Do not stack translucent layers.
3. **Content never gets the glass treatment.** Content is the solid, primary layer beneath.
4. **Text never sits directly on glass.** Type sits on a stabilized solid or denser layer so legibility never depends on the background. Background-dependent text is a bug, not a style.
5. **Tint sparingly.** Colored glass draws focus to the single most important control. Do not tint every element.
6. Do not put custom backgrounds behind system controls or navigation elements; they interfere with the material.
7. Use scroll edge effects: as content scrolls under a glass bar, the bar maintains separation (soft fade/blur at the edge).
8. Respect Reduce Transparency and Reduce Motion settings with solid fallbacks.
9. Keep glass panels away from busy, high-frequency backgrounds; if unavoidable, increase the material thickness/frost.

If building for web: true Liquid Glass cannot be fully replicated in CSS. Approximate with `backdrop-filter: blur() saturate()`, a subtle inner top highlight (1px light border or gradient), a faint outer shadow, and slightly translucent background color. Skip refraction/lensing tricks (SVG filter hacks are heavy and break in Safari). Prioritize legibility over effect.

---

## 6. Motion physics (the core of the Apple feel)

### Springs, never duration curves, for anything touchable

- Fixed-duration ease curves cannot respond to new input. Springs can: new input just changes the target and motion stays continuous. Use springs for every user-driven transition.
- Two designer parameters (WWDC 2018 model):
  - **Damping ratio**: 1.0 = critically damped, smooth settle, no bounce. Below 1.0 overshoots; lower = bouncier.
  - **Response** (seconds): how quickly the value approaches the target. Lower = snappier. This is not a duration; a spring has no fixed duration.
- Modern SwiftUI model (WWDC 2023, used across all Apple frameworks): **duration + bounce**. `.spring(duration:bounce:)`. Bounce 0 = no overshoot.
- **Default most UI to damping 1.0 (bounce 0).** Bounce is a rare, deliberate accent, not the norm.
- A spring starts fast and spends most of its time settling. That fast start is why it feels responsive.

### Reference values (starting points, tune by eye)

| Interaction | Response | Damping |
|---|---|---|
| Button press scale-down | 0.15 to 0.2 | 1.0 |
| Sheet present/dismiss | 0.4 to 0.5 | 1.0 |
| Drag release snap-to-position | 0.3 to 0.4 | 0.8 to 1.0 |
| Playful element (small bounce) | 0.4 | 0.6 to 0.7 |
| Icon/grid reflow around a drag | 0.3 | 1.0 |

### Non-negotiable motion rules

1. **Respond on touch down, not on release.** Highlight/scale a button the instant it is pressed. Any lag destroys the feeling of directness.
2. **Interruptible**: a new touch during any animation immediately takes over. Never block input while animating.
3. **Redirectable**: mid-animation, a new target retargets the same spring; motion continues from the current value.
4. **Velocity inheritance**: animations start with the user's release velocity, never from zero.
5. **1:1 tracking**: during a drag, content follows the finger exactly.

### Scroll and momentum

- Deceleration is exponential decay. iOS default rate: **0.998** (loses 0.2% of velocity per millisecond). "Fast" rate for paging: 0.99.
- **Projection** (where content lands after release):
  `projectedDistance = (initialVelocity / 1000) * (decelerationRate / (1 - decelerationRate))`
  Use projection to decide intent: e.g., a sheet dismisses if the projected position passes the halfway point, combining position and velocity. Closer to the threshold requires less velocity.
- **Rubber banding** at boundaries (content resists, never hard-stops):
  `offset = (1 - (1 / ((distancePulled * c / dimension) + 1))) * dimension` with constant `c ≈ 0.55` and `dimension` = view size on that axis. The bounce back uses a critically damped spring seeded with current velocity.
- Momentum clamps to zero on tiny/slow swipes (roughly under 10px or very short duration) so taps do not fling.

### Home-screen-style drag and reorder (apply to any grid/list reorder)

1. Long press: item scales up slightly (about 1.05 to 1.1x), gains a soft shadow, and lifts above siblings. Play a light haptic on lift.
2. Edit mode signals editability (Apple uses jiggle; a subtle continuous wobble of about 1 to 2 degrees at slightly randomized phase per item so they do not wobble in sync).
3. While dragging: item tracks the finger 1:1. Siblings do not snap; they **flow** out of the way with springs (response ~0.3, damping 1.0), each animating from its current position.
4. Hovering near container edges auto-scrolls/pages after a short dwell.
5. On release: item springs into its slot inheriting release velocity; a soft settle, no bounce or minimal bounce.

---

## 7. Gestures

- Hit areas at least 44pt even if the visual is smaller (invisible padding).
- Buttons: highlight on touch down; dragging off cancels (fade back); dragging back on re-highlights; only fire on touch up inside.
- Swipe gestures follow the finger the whole way (interactive transitions), never tap-triggered canned animations. Back-swipe from left edge is sacred.
- Multiple gestures layer: users can act "at the speed of thought", e.g., catching a moving element mid-flight.
- Every gesture needs a visible, continuous response tied to finger position (causality: the user must feel they are moving the thing).

---

## 8. Haptics

- Use system semantics, sparingly. Good haptics are felt, not noticed. Never decoration, never on every tap.
- Mapping:
  - **Impact** (light / medium / heavy / soft / rigid): physical events, e.g., an element snapping into place, lift on drag, collision. Match intensity to the visual weight of the element.
  - **Selection**: value actively changing, e.g., ticking through a picker, crossing a reorder boundary.
  - **Notification** (success / warning / error): outcome of a task.
- Call prepare() before triggering for minimal latency.
- Pair haptic + animation + (optional) sound at the same instant. Respect the system setting; users who disable haptics get none.
- Test on device; the simulator produces no haptics.

---

## 9. Iconography

- **SF Symbols only** (or icons drawn to match them): consistent stroke weight, aligned to text baseline, weight matched to the adjacent text weight.
- Symbols scale with Dynamic Type. Use monochrome or hierarchical rendering by default; multicolor only when meaningful.
- App icon: single centered glyph, simple silhouette, no text, designed on Apple's grid, and provide the layered version for the current icon appearance modes (light/dark/tinted).

---

## 10. Component conventions

- **Navigation**: tab bar (3 to 5 items) for top-level sections; navigation stack with large title collapsing to inline on scroll; back always top-left plus edge swipe.
- **Sheets**: partial-height detents for quick tasks, grabber visible, pull-to-dismiss with projection-based dismissal.
- **Search**: system search bar placement (often bottom-aligned in iOS 26 apps for reachability).
- **Context menus**: long press reveals a menu with a preview; the pressed element lifts with a spring.
- **Lists**: inset grouped style, swipe actions for common operations, pull-to-refresh.
- **Empty states**: an invitation to act, one clear action. Errors say what happened and how to fix it, no apology, no vagueness.
- Copy: sentence case, plain verbs, active voice. A button says what it does ("Save changes", not "Submit"). Same word for the same action everywhere.

---

## 11. Hard don'ts (violating any of these breaks the Apple feel)

1. No fixed-duration ease-in-out on touchable elements.
2. No animation that blocks or ignores input.
3. No response on touch-up only; touch-down must react.
4. No glass everywhere. If everything is glass, nothing has focus and the UI reads as a blurry mess.
5. No text directly on translucent/glass surfaces without a stabilizing layer.
6. No glass stacked on glass.
7. No custom chrome replacing standard patterns (back button, share, search) without an overwhelming reason.
8. No second typeface for headlines. Weight and size carry hierarchy.
9. No tap targets under 44pt.
10. No hiding essential actions in overflow menus (a widely criticized iOS 26 misstep; only nonessential actions belong there).
11. No haptic on every interaction.
12. No ignoring Reduce Motion / Reduce Transparency / Dynamic Type.
13. No hard stops at scroll boundaries; always rubber band.
14. No colored decoration without meaning; color signals interactivity or status.
15. No crowding: when in doubt, remove.

---

## 12. Build QA checklist

- [ ] Every animation interruptible and velocity-seeded
- [ ] Buttons react on touch down within one frame
- [ ] Drag release uses projection to choose the destination
- [ ] Scroll decelerates exponentially and rubber-bands at edges
- [ ] Springs default to zero bounce; bounce only where deliberate
- [ ] Text passes contrast in light and dark mode, over the worst background point
- [ ] All 12 Dynamic Type sizes reflow without truncation
- [ ] 44pt targets verified on every interactive element
- [ ] Glass only on nav/control layer, with solid fallback when transparency is reduced
- [ ] One accent color, semantic color roles throughout
- [ ] Haptics: lift, snap, selection ticks, success/error only
- [ ] Screens reviewed against: "does the UI recede and the content lead?"

---

## 13. Build Task Addendum (do these on the existing codebase)

### A. Fix the kg / lbs toggle so it actually converts

Current bug: switching units only swaps the label, the number stays the same. That misrepresents the weight.

Requirements:

1. **Store one canonical unit internally. Always kilograms.** Every weight saved to the database is kg, no exceptions. The unit toggle is display-only.
2. Conversion constants:
   - 1 kg = 2.20462 lbs
   - 1 lb = 0.45359237 kg
3. When the user toggles units, convert every displayed weight through the canonical kg value. Example: 100 kg displays as 220.5 lbs, and toggling back shows exactly 100 kg again.
4. **Never round-trip convert the stored value.** Converting kg to lbs to kg repeatedly causes drift. Always convert fresh from the stored kg number for display.
5. When the user logs a weight while in lbs mode, convert the input to kg before saving. If they type 225 lbs, store 102.06 kg, display 225 lbs.
6. Display rounding: 1 decimal place max, strip trailing zeros (220.5, not 220.46200). Keep full precision in storage.
7. The toggle applies app-wide instantly: history, charts, PRs, totals, everything recalculates from stored kg.
8. Unit preference persists across sessions.
9. Edge cases to handle: zero and empty weights, bodyweight-only exercises (no unit shown), imported or legacy data that may have been saved in lbs (migrate it to kg once, flag it so migration never runs twice).

### B. Rework exercise drag-to-reorder

Rebuild reordering to match Section 6 of this spec exactly:

- Long press lifts the exercise card: scale ~1.05, soft shadow, light impact haptic.
- Card tracks the finger 1:1 while dragging.
- Other cards flow out of the way with springs (response ~0.3, damping 1.0), animating from their current positions, never snapping.
- Selection haptic tick each time the drag crosses a reorder boundary.
- On release the card springs into its slot inheriting release velocity, settles with no bounce.
- Reorder must be interruptible: grabbing a card mid-settle takes over immediately.
- Persist the new order immediately on drop.

### C. Full code audit, then fix everything found

Go through the entire codebase and fix, not just report:

**Bugs and logic errors**
- Broken or dead code paths, unhandled nulls/undefined, off-by-one errors
- State bugs: stale state after edits or deletes, race conditions on rapid taps
- Math errors anywhere weights, volumes, totals, or PRs are calculated
- UI bugs: layout breaks at large Dynamic Type sizes, dark mode issues, keyboard covering inputs

**Security**
- No API keys, secrets, or tokens hardcoded in the client code or committed to the repo. Move to environment/config, rotate anything exposed
- Validate and sanitize all user input before storage or queries (injection protection)
- Auth checks on every data read/write, not just in the UI
- No sensitive data logged to console or analytics

**Cloud / backend**
- Database rules: users can only read and write their own data. Test that user A cannot query user B's workouts
- Handle network failure gracefully everywhere: offline logging should queue and sync, never silently lose a set
- No unbounded queries (paginate history)
- Check for duplicate writes on double-tap of save buttons (debounce or idempotent writes)
- Error states surface a clear message and a retry, per Section 10

**Deliverable**: a short changelog listing every bug found, its severity, and the fix applied. Then confirm the app builds and all flows work end to end: log a workout in lbs, toggle to kg, reorder exercises, kill the network mid-save, reopen the app.
