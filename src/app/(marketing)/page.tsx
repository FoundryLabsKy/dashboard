import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { CARE, GUARANTEES, PROCESS, SERVICES, SHOWCASE, SITE, STANDARD } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { BrowserFrame } from "@/components/site/BrowserFrame";
import {
  IconArrowRight,
  IconBolt,
  IconCart,
  IconChart,
  IconCheck,
  IconClock,
  IconGlobe,
  IconPalette,
  IconPin,
  IconServer,
  IconShield,
  IconSpark,
  IconWrench,
} from "@/components/site/SiteIcons";

const SERVICE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  design: IconPalette,
  hosting: IconServer,
  domains: IconGlobe,
  care: IconWrench,
  commerce: IconCart,
  seo: IconChart,
};

const TRUST_WORDS = [
  "Restaurants",
  "Law firms",
  "Dive shops",
  "Realtors",
  "Cafés",
  "Contractors",
  "Salons",
  "Charters",
  "Clinics",
  "Boutiques",
];

const HERO_STATS = [
  { value: "7-day", label: "average launch" },
  { value: "$450", label: "flat build price" },
  { value: "$30/mo", label: "hosted & maintained" },
];

export default function HomePage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]"
          aria-hidden
        />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                <IconPin className="h-3.5 w-3.5 text-ember" />
                Web studio · Grand Cayman
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Websites that make local businesses look{" "}
                <span className="text-gradient-ember">world-class.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Foundry Labs designs, builds, and hosts fast, modern websites for
                small businesses across the {SITE.islands}. Beautifully made, fully
                managed, and priced better than anyone on the island.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="ember-glow inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-semibold text-void transition-opacity hover:opacity-90"
                >
                  Get a free quote
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-white/25 hover:bg-white/[0.08]"
                >
                  See pricing
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-bold text-ink">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-xs leading-snug text-faint">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Hero visual */}
          <Reveal delay={0.1} y={24} className="relative">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-ember/10 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <BrowserFrame
                url="saltandreef.ky"
                accent="#f59e5b"
                hue="from-amber-500/25"
                label="Salt & Reef"
                kind="Seafront restaurant"
                hideCaption
              />
              <div className="glass ember-glow absolute -bottom-5 -left-5 flex items-center gap-2.5 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stage-sold/15 text-stage-sold">
                  <IconBolt className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">Deployed live</p>
                  <p className="font-mono text-[10px] text-faint">Built in 6 days</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Trust marquee */}
        <div className="relative border-y border-white/8 py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
          <div className="flex overflow-hidden">
            <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
              {[...TRUST_WORDS, ...TRUST_WORDS].map((word, i) => (
                <span
                  key={i}
                  className="flex items-center gap-10 font-mono text-sm uppercase tracking-[0.2em] text-faint"
                >
                  {word}
                  <span className="h-1 w-1 rounded-full bg-ember/60" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Guarantees ───────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((g, i) => {
            const Icon = [IconClock, IconShield, IconSpark, IconPin][i];
            return (
              <Reveal key={g.title} delay={0.05 * i}>
                <div className="glass h-full p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/12 text-ember">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                    {g.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{g.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────── Services ───────────────────────── */}
      <section id="services" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
            What we do
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Everything your business needs to be online — under one roof.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.key];
            return (
              <Reveal key={service.key} delay={0.04 * i}>
                <div className="card-lift glass h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember/12 text-ember">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {service.blurb}
                  </p>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-ink/90">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────── Showcase ───────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
            The look
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Designs tailored to your trade — not a template everyone else has.
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            A taste of the styles we build for Cayman businesses. Every site is
            custom-designed around your brand, your photos, and your customers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SHOWCASE.map((item, i) => (
            <Reveal key={item.name} delay={0.06 * i} y={20}>
              <BrowserFrame
                url={item.url}
                accent={item.accent}
                hue={item.hue}
                label={item.name}
                kind={item.kind}
              />
            </Reveal>
          ))}
        </div>
        <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          Illustrative concepts · Your site is designed from scratch
        </p>
      </section>

      {/* ───────────────────────── Process ───────────────────────── */}
      <section className="relative overflow-hidden py-20">
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-stage-built/[0.06] blur-[120px]"
          aria-hidden
        />
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              From first chat to live in a week.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {PROCESS.map((step, i) => (
              <Reveal key={step.step} delay={0.05 * i}>
                <div className="glass relative h-full p-5">
                  <span className="font-mono text-sm text-ember">{step.step}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Pricing preview ───────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
                Honest pricing
              </p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                One flat build price. One low monthly fee.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ember transition-opacity hover:opacity-80"
            >
              Full pricing & add-ons
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Build */}
          <Reveal>
            <div className="glass ember-glow flex h-full flex-col border-ember/40 p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">
                {STANDARD.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-base text-faint">$</span>
                <span className="font-display text-5xl font-bold text-ink">
                  {STANDARD.price}
                </span>
                <span className="ml-2 text-sm text-muted">{STANDARD.cadence}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A complete custom website — designed, built, and launched for you in
                about a week.
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {STANDARD.includes.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink/90">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Care */}
          <Reveal delay={0.08}>
            <div className="glass flex h-full flex-col p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stage-built">
                {CARE.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-base text-faint">$</span>
                <span className="font-display text-5xl font-bold text-ink">
                  {CARE.price}
                </span>
                <span className="ml-2 text-sm text-muted">{CARE.cadence}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                We host it, secure it, and keep it updated — your domain and edits
                included. Cancel anytime.
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {CARE.includes.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink/90">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-stage-built" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-6 text-center text-sm text-faint">
            Want business email, online booking, or a shop? Add them on whenever
            you’re ready.
          </p>
        </Reveal>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-8 pt-10 sm:px-8">
        <Reveal>
          <div className="glass relative overflow-hidden px-8 py-16 text-center sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ember/15 via-transparent to-stage-built/10"
              aria-hidden
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Let’s build something your customers will remember.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Tell us about your business and we’ll send back a clear, flat quote
                — usually within one working day. No pressure, no jargon.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="ember-glow inline-flex items-center gap-2 rounded-xl bg-ember px-6 py-3.5 text-sm font-semibold text-void transition-opacity hover:opacity-90"
                >
                  Get your free quote
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-white/25 hover:bg-white/[0.08]"
                >
                  {SITE.email}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
