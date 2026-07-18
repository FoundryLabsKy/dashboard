import type { Metadata } from "next";
import Link from "next/link";
import { ADD_ONS, CARE, FAQS, STANDARD } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { IconArrowRight, IconCheck, IconServer, IconSpark } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest website pricing for Cayman businesses: $450 to build your site, then $30 a month for hosting, your domain, and maintenance. No contracts, cancel anytime.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[110px]"
          aria-hidden
        />
        <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
              Pricing
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              One website.{" "}
              <span className="text-gradient-ember">One simple price.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              We build your website for a one-time fee, then look after everything —
              hosting, your domain, and updates — for a low flat monthly rate.
              That’s it. No contracts, cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The offer: build + care */}
      <section className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Website build */}
          <Reveal>
            <div className="glass ember-glow relative flex h-full flex-col border-ember/40 p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember">
                <IconSpark className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
                {STANDARD.name}
              </h2>
              <p className="mt-2 min-h-12 text-sm text-muted">{STANDARD.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-lg text-faint">$</span>
                <span className="font-display text-5xl font-bold text-ink">
                  {STANDARD.price}
                </span>
                <span className="ml-2 text-sm text-muted">{STANDARD.cadence}</span>
              </div>
              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {STANDARD.includes.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink/90">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Care plan */}
          <Reveal delay={0.08}>
            <div className="glass relative flex h-full flex-col p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stage-built/12 text-stage-built">
                <IconServer className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
                {CARE.name}
              </h2>
              <p className="mt-2 min-h-12 text-sm text-muted">{CARE.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-lg text-faint">$</span>
                <span className="font-display text-5xl font-bold text-ink">
                  {CARE.price}
                </span>
                <span className="ml-2 text-sm text-muted">{CARE.cadence}</span>
              </div>
              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {CARE.includes.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink/90">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-stage-built" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-faint">
              Prices in dollars. Every quote is confirmed in writing before we begin.
            </p>
            <Link
              href="/contact"
              className="ember-glow inline-flex items-center gap-2 rounded-xl bg-ember px-6 py-3.5 text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              Get started for $450
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Add-ons */}
      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Optional add-ons
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Start with the essentials and add more whenever you’re ready. Everything
            is quoted up front — mix in only what you need.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {ADD_ONS.map((addon, i) => (
            <Reveal key={addon.name} delay={0.03 * (i % 2)}>
              <div className="glass h-full p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-base font-semibold text-ink">
                    {addon.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-ember">
                    {addon.price}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{addon.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Something bigger */}
      <section className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 px-8 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                Something bigger in mind?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                A larger site, an online store, a booking system, or a fully custom
                build — tell us what you’re picturing and we’ll put together a plan
                and a price just for you.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-white/25 hover:bg-white/[0.08]"
            >
              Let’s talk
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Questions, answered.
          </h2>
        </Reveal>
        <div className="mt-10">
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-3xl px-5 pb-8 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink">
            Ready to get online?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Tell us about your business and we’ll have your website live in about a
            week.
          </p>
          <Link
            href="/contact"
            className="ember-glow mt-7 inline-flex items-center gap-2 rounded-xl bg-ember px-6 py-3.5 text-sm font-semibold text-void transition-opacity hover:opacity-90"
          >
            Get your free quote
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
