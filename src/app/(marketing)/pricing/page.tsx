import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, PLANS } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { IconArrowRight, IconCheck } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, flat-rate website pricing for Cayman businesses. Build from CI$450 plus a low monthly fee for hosting, security, backups, and unlimited edits. No contracts.",
};

const ADD_ONS = [
  { name: "Custom domain (.ky / .com)", price: "from CI$40/yr" },
  { name: "Professional business email", price: "CI$8/mo per inbox" },
  { name: "Extra pages", price: "CI$60 each" },
  { name: "Copywriting", price: "from CI$120" },
  { name: "Logo & brand kit", price: "from CI$250" },
  { name: "Product photography", price: "on request" },
];

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
              Straight prices.{" "}
              <span className="text-gradient-ember">No surprises.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              A one-time build price plus a low flat monthly fee that covers hosting,
              security, backups, and edits. That’s it. Cancel anytime — you always
              keep your domain.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.key} delay={0.05 * i}>
              <div
                className={`glass relative flex h-full flex-col p-8 ${
                  plan.featured ? "border-ember/40 ember-glow" : ""
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-ember px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-void">
                    Most popular
                  </span>
                )}
                <h2 className="font-display text-2xl font-semibold text-ink">
                  {plan.name}
                </h2>
                <p className="mt-2 min-h-10 text-sm text-muted">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-sm text-faint">CI$</span>
                  <span className="font-display text-5xl font-bold text-ink">
                    {plan.build}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">one-time build</p>
                <p className="mt-3 inline-flex w-fit rounded-lg bg-white/[0.05] px-3 py-1.5 text-sm text-ink">
                  + CI${plan.monthly}/mo hosting &amp; care
                </p>

                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-ink/90">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-opacity ${
                    plan.featured
                      ? "ember-glow bg-ember text-void hover:opacity-90"
                      : "border border-white/12 bg-white/[0.04] text-ink hover:bg-white/[0.08]"
                  }`}
                >
                  Choose {plan.name}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-faint">
            All prices in Cayman Islands dollars (CI$) and shown as starting points.
            Every quote is fixed in writing before we begin.
          </p>
        </Reveal>
      </section>

      {/* Add-ons */}
      <section className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Optional add-ons
          </h2>
          <p className="mt-3 text-muted">
            Mix in only what you need. Everything is quoted up front.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {ADD_ONS.map((addon, i) => (
            <Reveal key={addon.name} delay={0.03 * i}>
              <div className="glass flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-sm text-ink">{addon.name}</span>
                <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-ember">
                  {addon.price}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
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
            Ready for a real quote?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Tell us about your business and we’ll send back an exact price — usually
            within one working day.
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
