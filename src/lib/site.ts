// Central content for the public Foundry Labs marketing site.
// Editing copy, pricing, and navigation here keeps the page components clean.

export const SITE = {
  name: "Foundry Labs",
  legalName: "Foundry Labs KY",
  domain: "foundrylabs.ky",
  email: "hello@foundrylabs.ky",
  phone: "+1 (345) 000-0000",
  whatsapp: "+13450000000",
  location: "George Town, Grand Cayman",
  islands: "Cayman Islands",
  tagline: "Websites, forged in Cayman.",
} as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export type Service = {
  key: string;
  title: string;
  blurb: string;
  points: string[];
};

export const SERVICES: Service[] = [
  {
    key: "design",
    title: "Website design & build",
    blurb:
      "Custom, hand-crafted sites that make a two-person shop look like a national brand. No cookie-cutter templates.",
    points: [
      "Bespoke design tuned to your brand",
      "Mobile-first and lightning fast",
      "Copywriting and stock imagery included",
    ],
  },
  {
    key: "hosting",
    title: "Hosting & maintenance",
    blurb:
      "We host, monitor, back up, and update everything for one flat monthly fee. You never touch a server.",
    points: [
      "Global CDN with 24/7 uptime monitoring",
      "Automatic backups and security patches",
      "SSL and daily health checks included",
    ],
  },
  {
    key: "domains",
    title: "Domains & business email",
    blurb:
      "Grab the perfect .ky or .com address and matching inbox. We handle the setup — you keep the keys.",
    points: [
      "Domain registration & DNS managed for you",
      "Professional you@yourbusiness.ky email",
      "You always own your domain outright",
    ],
  },
  {
    key: "care",
    title: "Care & content updates",
    blurb:
      "New hours, a fresh menu, a seasonal promo? Send us a message and we make the change — usually same day.",
    points: [
      "Unlimited small edits on every plan",
      "Same-day turnaround on most requests",
      "A real person on WhatsApp, not a ticket queue",
    ],
  },
  {
    key: "commerce",
    title: "Online store & bookings",
    blurb:
      "Take payments, reservations, and orders online with a checkout that feels effortless on any device.",
    points: [
      "Secure card payments and invoicing",
      "Appointment and table booking flows",
      "Inventory, delivery, and pickup options",
    ],
  },
  {
    key: "seo",
    title: "Local SEO & analytics",
    blurb:
      "Show up when islanders and visitors search. We wire in Google Business, maps, and clear traffic reports.",
    points: [
      "Google Business Profile optimization",
      "On-page SEO for Cayman search terms",
      "Plain-English monthly traffic reports",
    ],
  },
];

export type Plan = {
  key: string;
  name: string;
  tagline: string;
  build: string;
  monthly: string;
  featured?: boolean;
  features: string[];
};

// Prices are in Cayman Islands dollars (CI$) and shown as starting points.
export const PLANS: Plan[] = [
  {
    key: "launch",
    name: "Launch",
    tagline: "A sharp single-page presence to get found fast.",
    build: "450",
    monthly: "25",
    features: [
      "One-page website",
      "Mobile-first responsive design",
      "Contact form & click-to-call",
      "Google Maps & business hours",
      "Hosting, SSL & backups included",
      "Live in 7 days",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "A complete multi-page site for a growing business.",
    build: "850",
    monthly: "45",
    featured: true,
    features: [
      "Up to 6 custom pages",
      "Everything in Launch",
      "Photo gallery & services pages",
      "Local SEO & Google Business setup",
      "Business email address",
      "Unlimited small edits",
    ],
  },
  {
    key: "commerce",
    name: "Commerce",
    tagline: "Sell products or take bookings online.",
    build: "1,600",
    monthly: "75",
    features: [
      "Everything in Growth",
      "Online store or booking system",
      "Secure card payments",
      "Inventory & order management",
      "Delivery / pickup options",
      "Priority same-day support",
    ],
  },
];

export const PROCESS = [
  {
    step: "01",
    title: "Free consult",
    body: "A relaxed 20-minute chat — in person, by phone, or on WhatsApp. We learn your business and quote a flat price on the spot.",
  },
  {
    step: "02",
    title: "Design",
    body: "We craft a design concept around your brand and send it over. You give notes; we refine until it feels right.",
  },
  {
    step: "03",
    title: "Build",
    body: "We write every line, wire up your forms, store, and email, and load in your content, photos, and copy.",
  },
  {
    step: "04",
    title: "Launch",
    body: "We connect your domain and go live — most sites within 7 days of approval. We test everything on real devices.",
  },
  {
    step: "05",
    title: "We run it",
    body: "You focus on the business. We host, monitor, back up, and update your site for one flat monthly fee, forever.",
  },
];

export const GUARANTEES = [
  {
    title: "Live in 7 days",
    body: "Most sites go from kickoff to launch inside a week — not months.",
  },
  {
    title: "You own everything",
    body: "Your domain, your content, your site. No hostage situations, ever.",
  },
  {
    title: "No lock-in",
    body: "Flat monthly fee, cancel anytime. No contracts, no surprise invoices.",
  },
  {
    title: "Cayman-based",
    body: "A real local team you can meet — not an overseas call centre.",
  },
];

export const SHOWCASE = [
  {
    name: "Salt & Reef",
    kind: "Seafront restaurant",
    url: "saltandreef.ky",
    accent: "#f59e5b",
    hue: "from-amber-500/25",
  },
  {
    name: "Ridley & Co.",
    kind: "Law & advisory",
    url: "ridleyco.ky",
    accent: "#5b9df5",
    hue: "from-sky-500/25",
  },
  {
    name: "Bluewater Divers",
    kind: "Dive & watersports",
    url: "bluewaterdivers.ky",
    accent: "#3ecf8e",
    hue: "from-emerald-500/25",
  },
];

export const FAQS = [
  {
    q: "How much does a website really cost?",
    a: "Most small-business sites start at CI$450 to build plus a low flat monthly fee that covers hosting, security, backups, and edits. You get one clear quote up front — no hourly billing, no surprises.",
  },
  {
    q: "How long does it take?",
    a: "Most sites launch within 7 days of you approving the design. Larger stores or booking systems can take a little longer, and we'll always tell you the timeline before we start.",
  },
  {
    q: "Do I own my website and domain?",
    a: "Completely. Your domain is registered in your name, your content is yours, and you can take your site elsewhere at any time. We believe in earning your business every month, not trapping you.",
  },
  {
    q: "I already have a website — can you take it over?",
    a: "Usually, yes. We can move your existing site onto our managed hosting, or rebuild it fresh if it's dated. Either way, we handle the migration so there's no downtime.",
  },
  {
    q: "What if I need changes after launch?",
    a: "Just message us. Small edits — new hours, a menu update, a promo banner — are included on every plan and usually done the same day.",
  },
  {
    q: "Why are you cheaper than everyone else?",
    a: "We're a lean, local team with modern tooling and no bloated overhead. We pass those savings straight to you, and we make it up by keeping clients happy for the long haul.",
  },
];
