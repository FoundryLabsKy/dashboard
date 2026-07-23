# Pack Tracker

A private cigarette purchase tracker with exactly one job: log the moment you
buy a pack. Everything else — money, packs, cigarettes, forecasts — is
calculated automatically.

## The one-button philosophy

> If I have to think about logging it, I won't use it.

There are no forms, no typing, no daily check-ins. The home screen is a single
button: **Buy New Pack**. Tap it, confirm, done. Date, time, brand, pack size
and price are recorded instantly from your settings. Pack Tracker is a neutral
record of spending and consumption — it never guilts or shames you.

## Screenshots

_Add your own — run the app and take them. Every screen supports light and
dark mode._

| Home | Stats | Timeline |
| ---- | ----- | -------- |
|      |       |          |

## Features

- **One-tap logging** — a confirmation sheet, a spring animation, and you're
  back to your day
- **Statistics** — total / monthly / yearly spend, weekly and monthly
  averages, pack counts, longest gap between packs, average days per pack,
  automatic cigarette counts, and a yearly spending forecast from your last
  30 days
- **Timeline** — purchase history grouped by day; tap any entry to edit or
  delete accidental logs
- **Settings** — change brand, pack size, price, or currency anytime; export
  everything as JSON; erase all data with one confirmation
- **Apple-quality UI** — iOS-style tab bar, system font stack, full light and
  dark mode, spring physics everywhere, translucent blurred materials

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- Framer Motion (all animations)
- Vitest + React Testing Library

## Install & run

```bash
npm install
npm run dev
```

Then open the printed local URL. To run the tests:

```bash
npm test
```

## Privacy

All data lives in your browser's `localStorage`. There are no accounts, no
cloud, no backend, and no analytics — nothing ever leaves your device. The
JSON export in Settings is the only way data gets out, and you trigger it.

## License

MIT — see [LICENSE](LICENSE).
