# LOCKED — Design Tokens

Single source of truth: the `html{}` rule in the `CSS` array in `index.html` (search for `"html{color-scheme"`), plus the JS aliases directly below the `CSS` array's dependencies (search for `WAVE 1 DESIGN TOKENS`). Style profiles override tokens via `html[data-style-profile='<id>']` (legacy theme classes kept in sync by `applyTheme()`).

## Color roles (CSS variables)

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-bg` | #000000 | #F2F2F7 | Canvas |
| `--color-surface` | #0D0D0F | #F2F2F7 | Raised surface / sheet bodies |
| `--color-card` | #1C1C1E | #FFFFFF | Content cards (always solid) |
| `--color-border` | rgba(255,255,255,.09) | rgba(60,60,67,.12) | Hairline separators |
| `--color-text` | #F5F5F7 | #1C1C1E | Primary label |
| `--color-text-muted` | #A1A1AA | #6E6E73 | Secondary label |
| `--color-text-tertiary` | #8E8E93 | #86868B | Tertiary label / placeholders |
| `--color-text-subtle` | #2C2C2E | #E5E5EA | (misnamed: a FILL, not text — rename pending) |
| `--color-fill1/2/3` | #111113/#18181B/#2A2A2F | #E4E6E9/#F0F2F5/#D4D8DF | Neutral fills (ex-hardcoded grays) |
| `--color-accent` | #F97316 | #F97316 | THE accent. Action + progress only |
| `--color-accent-deep` | #C2410C | #C2410C | CTA fills/gradient start (white text ≥4.8:1) |
| `--color-accent-text` | #FB923C | #C2410C | Accent used AS text (auto-remapped by a serialized-attr rule) |
| `--color-accent-rgb` | 249,115,22 | 249,115,22 | For rgba() composition (focus rings, glows) |
| `--color-success` | #22C55E | #15803D | Status: success |
| `--color-warning` | #F59E0B | #B45309 | Status: warning (also legacy warm-up/carbs — split pending) |
| `--color-error` | #EF4444 | #DC2626 | Status: error/destructive |
| `--color-info` | #3B82F6 | #2563EB | Status: info |
| `--color-feature` | #8B5CF6 | #6D28D9 | Legacy violet (scheduled for retirement → accent/neutral) |
| `--color-macro-protein/-carbs/-fat` | #3B82F6/#F59E0B/#EC4899 | darkened | Nutrition macro coding |
| `--color-positive-alt` | #10B981 | #047857 | Legacy emerald (Smart Nutrition) |
| `--glass-bar` | rgba(0,0,0,.78) | rgba(242,242,247,.85) | Nav/header glass material |
| `--color-shadow/-light` | per profile | per profile | Elevation |

## JS aliases (inline-style consumption)

`BG SURF CARD BORD OR ORD ORD2 ORTX TX MU TX3 SU GR RE BLU WA VI PRO CAR FAT EMD SHADOW GLASSBAR` → each holds `var(--...)`.
`*_H` twins (`OR_H`, `VI_H`, …) hold raw hex and exist **only** for alpha-suffix concatenation (`VI_H+"22"`); never use them for plain colors.

## Scales

- Spacing `SP` = {xs:4, s:8, m:12, l:16, xl:20, xxl:24, xxxl:32} — 8pt grid, 4 for fine gaps.
- Radius `RAD` = {s:8, m:12, l:16, xl:20, sheet:24, pill:999} — nest concentrically: inner = outer − padding.
- Type `TYPE` = iOS text styles: largeTitle 34, title1 28, title2 22, title3 20, headline/body 17, callout 16, subhead 15, footnote 13, caption1 12, caption2 11.
- Springs `SPRING` = press {0.18,1}, reflow {0.3,1}, snap {0.35,1}, sheet {0.45,1} (response s, damping ratio).

## Style profiles

`html[data-style-profile]` ∈ dark (default) | slate | navy | midnight | light. Applied pre-paint by the head bootstrap (reads `lk_theme`), kept in sync by `applyTheme()`. Legacy classes (`light-mode`, `theme-*`) remain as a compatibility alias in every rule.

## Rules for new code

1. Components consume tokens only — no raw hex, no raw shadows, no literal font sizes.
2. Accent is a role: derive hover/pressed/disabled/focus/progress from `--color-accent`/`--color-accent-rgb`, never define parallel oranges.
3. Contrast floors hold per profile: 4.5:1 body, 3:1 large text — new profile values must be checked at the worst point.
4. Structure (spacing, targets, type scale, radii, motion) is profile-independent; profiles change color and material weight only.
