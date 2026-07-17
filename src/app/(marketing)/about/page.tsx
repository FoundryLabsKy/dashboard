import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconPin,
  IconShield,
  IconSpark,
} from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Foundry Labs is a Grand Cayman web studio on a mission to give small local businesses the kind of website usually reserved for big brands — crafted locally, priced fairly.",
};

const VALUES = [
  {
    icon: IconSpark,
    title: "Craft over templates",
    body: "Every site is designed and built by hand. We sweat the details most people never notice — because they're what make a small business look serious.",
  },
  {
    icon: IconBolt,
    title: "Fast, always",
    body: "Fast to launch, fast to load, fast to reach. We use modern tooling so your site is live in days and loads instantly on any phone.",
  },
  {
    icon: IconShield,
    title: "Fair and transparent",
    body: "Flat prices, no lock-in, and you own everything. We’d rather earn your business every month than trap you in a contract.",
  },
  {
    icon: IconPin,
    title: "Genuinely local",
    body: "We live and work in Grand Cayman. You get a real person who knows the island, not an overseas ticket queue in another time zone.",
  },
];

const COMPARISON = [
  "A design built around your brand, not a stock template",
  "Hosting, security, and backups handled for you",
  "A local team you can actually reach on WhatsApp",
  "Unlimited small edits without hourly invoices",
  "Pricing built for island small businesses",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[110px]"
          aria-hidden
        />
        <div className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              <IconPin className="h-3.5 w-3.5 text-ember" />
              {SITE.location}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Big-brand websites for the businesses that{" "}
              <span className="text-gradient-ember">make the island tick.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Foundry Labs was born from a simple frustration: the café down the road,
              the dive shop on the dock, the family law practice in town — all doing
              brilliant work, all stuck with a website that didn’t show it. The good
              agencies were too expensive, and the cheap builders looked cheap.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              So we built a studio to close that gap — pairing genuinely custom design
              with modern engineering and fully managed hosting, at a price a small
              Cayman business can actually say yes to.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
            What we believe
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The principles behind every project.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {VALUES.map((value, i) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.title} delay={0.05 * i}>
                <div className="glass h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember/12 text-ember">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <div className="glass grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Why businesses choose Foundry Labs
            </h2>
            <p className="mt-4 text-muted">
              We sit in the sweet spot between a DIY website builder and a pricey
              agency — the quality of the latter, closer to the price of the former.
            </p>
            <Link
              href="/contact"
              className="ember-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              Start a conversation
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-col gap-3.5">
              {COMPARISON.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
