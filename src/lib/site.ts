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

// One simple model: a one-time build price, then a flat monthly fee that
// bundles hosting, the domain, and ongoing maintenance. Prices in dollars.
export const STANDARD = {
  name: "Your website",
  price: "450",
  cadence: "one-time",
  tagline:
    "A beautiful, custom-built website that makes your business look established from the very first tap.",
  includes: [
    "Custom design built around your brand",
    "Mobile-first and lightning fast",
    "Contact form & click-to-call",
    "Google Maps, hours & directions",
    "Photo gallery & services section",
    "Social media links",
    "Set up to be found on Google",
    "Live in about 7 days",
  ],
};

export const CARE = {
  name: "Hosting, domain & care",
  price: "30",
  cadence: "per month",
  tagline: "We keep it online, secure, and up to date — you never touch a thing.",
  includes: [
    "Fast, secure managed hosting",
    "Your domain name included",
    "SSL certificate & daily backups",
    "24/7 uptime monitoring",
    "Unlimited small edits & updates",
    "A real person on WhatsApp",
    "Cancel anytime — no contracts",
  ],
};

export type AddOn = { name: string; price: string; note: string };

export const ADD_ONS: AddOn[] = [
  {
    name: "Business email",
    price: "$8/mo per inbox",
    note: "A professional you@yourbusiness.ky address on your own domain.",
  },
  {
    name: "Extra pages",
    price: "from $60 each",
    note: "Grow beyond the standard site with menus, team, or service pages.",
  },
  {
    name: "Online booking",
    price: "from $150",
    note: "Let customers reserve tables, rooms, or appointments online.",
  },
  {
    name: "Online store & payments",
    price: "from $250",
    note: "Sell products with a secure card checkout and order management.",
  },
  {
    name: "Google Business & local SEO",
    price: "from $120",
    note: "Show up on Google Maps and in local search results.",
  },
  {
    name: "Copywriting",
    price: "from $40/page",
    note: "We write clear, persuasive words so you don't have to.",
  },
  {
    name: "Logo & brand kit",
    price: "from $250",
    note: "A polished logo, colours, and fonts to tie everything together.",
  },
  {
    name: "On-site photography",
    price: "from $150",
    note: "Professional photos of your space, team, and products.",
  },
  {
    name: "WhatsApp chat button",
    price: "$30 one-time",
    note: "A tap-to-chat button so customers reach you instantly.",
  },
  {
    name: "Extra domain",
    price: "from $40/yr",
    note: "Register an additional .ky or .com and point it to your site.",
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
    q: "How much does a website cost?",
    a: "It's simple: $450 to design and build your website, then $30 a month for hosting, your domain, and maintenance. One clear price up front — no hourly billing, no surprises.",
  },
  {
    q: "What does the $30 a month cover?",
    a: "Everything to keep your site online and looked after: fast secure hosting, your domain name, SSL, daily backups, uptime monitoring, and unlimited small edits whenever you need them. Cancel anytime.",
  },
  {
    q: "How long does it take?",
    a: "Most sites launch within about 7 days of you approving the design. We'll always confirm the timeline before we start.",
  },
  {
    q: "Do I own my website and domain?",
    a: "Yes. Your domain is registered in your name and your content is yours. You can take your site elsewhere at any time — we'd rather earn your business every month than trap you.",
  },
  {
    q: "What if I need changes after launch?",
    a: "Just message us. Small edits — new hours, a fresh photo, a promo — are included in your monthly fee and usually done the same day.",
  },
  {
    q: "Can I add more later, like email or a shop?",
    a: "Absolutely. Business email, online booking, an online store, and more are available as simple add-ons whenever you're ready. Start small and grow when it suits you.",
  },
];
