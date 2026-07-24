# LOCKED — Apple Design Upgrade: Final Report

Scope: the master prompt (Phases 0–6) against `docs/apple-design-emulation-spec.md` and `docs/locked-brand-identity.md`. ~40 commits on `main`. Deliverables: this report, `docs/design-audit.md` (133 findings), `docs/design-tokens.md`, `docs/motion.md`, `docs/codebase-map.md`, and the screenshot sets under the session test harness (`tools/`).

## What changed

**Foundation (Wave 1).** Full semantic token layer (color roles incl. status/macros/accent-text/accent-rgb/fills/glass, spacing, radius, type, spring presets) with per-profile overrides; ~430 hardcoded chromatic hexes + legacy grays migrated onto it. Style profiles ride `html[data-style-profile]`, applied pre-paint (no flash), with the legacy theme classes kept as aliases. Dead/broken global CSS repaired: the 44pt safety net that never matched, the blanket rule that eased drag ghosts 240ms behind the finger, the overshoot curve on every button, 2.55:1 placeholders, iOS sticky-hover; `prefers-reduced-transparency` solid fallbacks added.

**Type & layout (Wave 2).** One family (system stack) — Barlow Condensed (237 sites) and DM Sans removed along with the render-blocking Google Fonts import and 265 tracking overrides. Body floor 17px. All 1,555 font sizes converted to rem (verified reflow at 200% and 310% root scale); 213 sub-11px sizes raised to the Caption-2 floor. 1,599 spacing values snapped to the 4pt grid. Auth/paywall shell moved from cold slate-blue to the app's warm dark tokens.

**Materials (Wave 3).** One glass material (`--glass-bar`) on all 10 nav/control bars with the full web recipe (blur+saturate, specular top highlight, faint shadow), themed per profile; one scrim recipe (dim, no blur) so glass never stacks; text no longer sits on tinted glass; decorative blur removed where nothing scrolls beneath.

**Motion & gestures (Waves 4–5).** A critically-damped rAF spring drives: the voice FAB (projection-chosen corner, velocity-seeded snap, rubber-band clamp, exact mid-flight re-grab, touchcancel), both reorder surfaces (real card lifts in place at 1.05× with shadow+haptic, 1:1 document-space tracking, siblings flow one slot on retargetable transforms, static-snapshot hit-testing, boundary haptic ticks, velocity-seeded settle, Escape/touchcancel cancel — pill/ghost/spacer deleted), swipe-to-delete (projected-momentum threshold, rubber-band right pull, threshold haptic, stale-closure fix), and sheets (shared `useSheetDrag`: 1:1 grabber tracking, dismissal by projected position past 45% of height, wired to 4 sheets incl. a new grabber on the exercise-detail sheet). App-wide touch-down `:active` response. Edge auto-scroll: rAF, 150ms dwell, proximity ramp, live retarget. Verified by CDP touch simulation (drag tracked 1:1; sibling flowed −50.3px; order committed; styles torn down clean) and a FAB flick test (velocity projection crossed the screen; measured spring settle).

**Brand & product (Wave 6 + §13).**
- Gaming layer behind a Settings toggle (`lk_gamingLayer`, default off, cloud-synced): streak pill, streak card, badge grid out of the default views; streak-guilt copy neutralized.
- Single accent: violet retired (72 alias + 7 var sites), coach/refeed/goal/log CTAs on the signature orange, water tappables neutral.
- §13A kg/lbs: canonical-kg storage, display-only toggle (verified 100 kg ↔ 220.5 lb, storage untouched), per-exercise unit overrides respected, one-time synced migration; fixed lb-mode volume totals being inflated 2.2×.
- All 14 `alert()`s → in-app toasts with specific sentence-case copy; Discard demoted (Finish is the sole dominant CTA); nav highlights Cardio→Train, Shopping→Fuel; Profile decluttered (unit/theme moved to Settings); coach empty state → starter prompt chips; 12 exclamation strings calmed.
- Cloud sync hardened (smallest-first fault-isolated chunks; partial failures surface as errors) + admin `/sync-status` diagnostic on the Worker — this found and explained the calendar/coach-memory migration gap (cloud stale since June 19 due to the Worker JWT bug).

## Phase 5 results (final loop)

- 5 style profiles × 5 pages: profile applies everywhere, zero JS errors.
- Widths 320/390/430/768/1280: no horizontal scroll. Dynamic Type at 310%: reflows, no truncation-induced overflow.
- Tap targets: 0 elements under 44pt effective hit area (pseudo-element extension per §7 + input min-height).
- Contrast: 0 failures in slate/navy/midnight/light; 1 residual in dark (a 12px "Suggest" label on the Smart Nutrition chip, 2.54:1 — Medium, open).
- Reduced-motion and reduced-transparency render with solid fallbacks.

## Deliberately left alone / open questions

1. **Two-phase reorder entry** (long-press → wiggle → drag) kept: iOS Safari fires a phantom `touchend` when the pressed card's DOM swaps, which is why the codebase split the gesture. Everything after entry is spec-true. A same-touch morph is possible but untestable without a device — flagged as the one deliberate §13B deviation.
2. **Fuel information density**: Water/Weight cards kept (tappables neutralized, actions orange); the full collapse into a single summary card remains a design decision worth a device pass.
3. Tutorial swipe still evaluates at touch-end (once-per-user surface; Structural).
4. SF Symbols: the app keeps its own consistent stroke-icon set (`Ic`/`D`) — §9 satisfied in spirit, not literally.
5. §13C full bug/security sweep: partially done opportunistically (sync chunk-abort bug, lb-volume math, guest `subscription` setter error logged, "999 days since last session" sentinel leak, superset internal-order flip on drag). A dedicated pass remains.
6. Web-platform limits: real Liquid Glass refraction (approximated per the spec's own recipe), system haptic semantics (approximated with `navigator.vibrate` weights), edge-swipe back navigation (not implemented).

## Known-remaining findings (from 133): 1 Medium (contrast residual above), plus the items listed as open. All 22 Criticals and all 42 Highs are resolved or superseded by structural rebuilds.
