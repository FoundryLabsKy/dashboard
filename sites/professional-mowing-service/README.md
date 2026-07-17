# Professional Mowing Service — Grand Cayman

Single-file website build (`index.html`) for Professional Mowing Service,
a landscaping and lawn care company in Grand Cayman. Refresh of their
existing site, built to be uploaded as-is via the dashboard's
**Upload HTML** flow (single-file builds become the preview automatically).

- Pages (hash-routed in one file): Home `#/`, Services `#/services`,
  Portfolio `#/portfolio`, Our Story `#/story`, Contact & Quote `#/contact`
- Primary actions: "Get a Free Quote" plus tap-to-call `+1 345-946-5085`
  (sticky mobile action bar with both)
- All imagery is hand-drawn SVG placeholder art. Swap-in points for real
  job photos are marked with `PLACEHOLDER` comments in the HTML; gallery
  frames take two same-size `<img>` tags (before/after) per card.
- Testimonials are sample copy for layout — replace with real customer
  reviews before launch.
- The quote form is static (shows a confirmation panel). Wire it to a
  form service or email backend before launch; see the comment above the
  submit handler.
