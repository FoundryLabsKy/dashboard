# LOCKED — Motion System

Authority: Apple spec §6 (docs/apple-design-emulation-spec.md). This file documents how it's implemented here so future work stays consistent.

## Spring presets

`SPRING` (defined with the design tokens in index.html):

| Preset | Response (s) | Damping | Use |
|---|---|---|---|
| press | 0.18 | 1.0 | Button press scale |
| reflow | 0.30 | 1.0 | Siblings flowing around a drag |
| snap | 0.35 | 1.0 | Drag-release snap to position |
| sheet | 0.45 | 1.0 | Sheet present/dismiss |

Damping stays 1.0 (no bounce) unless a bounce is a deliberate, argued accent.

## The spring step (rAF, semi-implicit Euler)

```js
var omega=2*Math.PI/response, k=omega*omega, c=2*damping*omega;
v += (-k*(x-target) - c*v) * dt;   // dt clamped to <= 0.064s
x += v*dt;
// rest when |v| and |x-target| are tiny -> snap exactly to target
```

Rules the implementation must keep:
1. **Interruptible**: pointerdown stops the spring; state (posRef) always mirrors the rendered transform, so a mid-flight grab is exact.
2. **Velocity-seeded**: gesture velocity (px/s, smoothed 0.75/0.25 across move samples) is passed straight into the spring as `v`.
3. **DOM-driven**: during drag/spring, write `style.transform` on a ref directly (no per-frame React renders); sync React state once at rest.

## Projection (release intent)

```js
projected = x + (v/1000) * (rate/(1-rate));   // rate 0.998 standard, 0.99 paging
```
Destinations (snap corner, sheet dismiss, swipe-delete commit) are chosen from the **projected** point, never the raw release point.

## Rubber band (boundaries)

```js
give = (1 - (1/((over*0.55/dim)+1))) * dim;   // over = distance past the boundary
```
Applied during drag at any hard boundary; the return uses a critically damped spring seeded with current velocity. Never hard-stop (§11 #13).

## Haptics (navigator.vibrate, degrade silently)

- 10ms on drag lift/engage
- 8ms on settle into place
- Boundary-cross ticks in reorder: 10ms when the target slot changes
- Never on plain taps (§11 #11)

## Current status

- Voice FAB, both reorder surfaces (real-card lift, flowing siblings, velocity-seeded settle), swipe-to-delete (projection threshold), and 4 sheets (useSheetDrag pull-to-dismiss) all run on the spring/projection model — done and touch-test verified.
- Global button motion: `transform .15s ease-out` + app-wide touch-down :active response; a per-button JS spring press remains an optional refinement.
- Known deviation: reorder entry stays two-phase (long-press → wiggle → drag) because of the iOS phantom-touchend constraint — see docs/final-report.md.
