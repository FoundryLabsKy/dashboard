import type { Metadata } from "next";
import Link from "next/link";
import { ADD_ONS, CARE, FAQS, STANDARD } from "@/lib/site";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { IconCheck } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest website pricing for Cayman businesses: $450 to build your site, then $30 a month for hosting, your domain, and maintenance. No contracts, cancel anytime.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line pt-[4.5rem]">
        <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="kicker">Pricing</p>
          <h1 className="mx-auto mt-5 max-w-3xl font-editorial text-[clamp(2rem,7.5vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-graphite">
            One website.
            <span className="italic text-rust"> One simple price.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-graphite-soft">
            We build your website for a one-time fee, then look after everything —
            hosting, your domain, and updates — for a low flat monthly rate. No
            contracts, cancel anytime.
          </p>
        </div>
      </section>

      {/* The two-part offer */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
          {/* Build */}
          <div className="bg-paper-raised p-9 sm:p-10">
            <div className="flex items-baseline justify-between">
              <p className="kicker text-graphite-muted">{STANDARD.name}</p>
              <span className="font-mono text-[11px] uppercase tracking-wide text-graphite-faint">
                Step one
              </span>
            </div>
            <p className="mt-6 font-editorial text-6xl font-semibold text-graphite">
              <span className="align-top text-2xl text-graphite-muted">$</span>
              {STANDARD.price}
            </p>
            <p className="mt-2 text-sm text-graphite-muted">
              one-time — {STANDARD.tagline.toLowerCase()}
            </p>
            <div className="hr-forge my-7" />
            <ul className="flex flex-col gap-3">
              {STANDARD.includes.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.95rem] text-graphite-soft">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Care */}
          <div className="border-t border-line bg-paper-sunken p-9 sm:p-10 md:border-l md:border-t-0">
            <div className="flex items-baseline justify-between">
              <p className="kicker text-graphite-muted">{CARE.name}</p>
              <span className="font-mono text-[11px] uppercase tracking-wide text-graphite-faint">
                Step two
              </span>
            </div>
            <p className="mt-6 font-editorial text-6xl font-semibold text-graphite">
              <span className="align-top text-2xl text-graphite-muted">$</span>
              {CARE.price}
              <span className="ml-1 align-baseline text-xl font-medium text-graphite-muted">
                /mo
              </span>
            </p>
            <p className="mt-2 text-sm text-graphite-muted">{CARE.tagline}</p>
            <div className="hr-forge my-7" />
            <ul className="flex flex-col gap-3">
              {CARE.includes.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.95rem] text-graphite-soft">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forge-blue" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 text-center">
          <p className="text-sm text-graphite-muted">
            Prices in dollars. Every quote is confirmed in writing before we begin.
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center px-7 py-3.5 text-sm font-semibold"
          >
            Get started for $450
          </Link>
        </div>
      </section>

      {/* Add-ons */}
      <section className="border-y border-line bg-paper-sunken">
        <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="kicker">Optional add-ons</p>
              <h2 className="mt-4 font-editorial text-3xl font-semibold leading-tight tracking-tight text-graphite">
                Add more when you’re ready.
              </h2>
              <p className="mt-4 max-w-xs text-graphite-soft">
                Start with the essentials and grow over time. Everything is quoted
                up front — mix in only what you need.
              </p>
            </div>
            <ul className="border-t border-line">
              {ADD_ONS.map((addon) => (
                <li
                  key={addon.name}
                  className="flex flex-col gap-1 border-b border-line py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <div>
                    <span className="font-editorial text-lg font-semibold text-graphite">
                      {addon.name}
                    </span>
                    <p className="mt-0.5 max-w-md text-sm text-graphite-muted">
                      {addon.note}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-rust">
                    {addon.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Something bigger */}
      <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-editorial text-2xl font-semibold text-graphite">
              Something bigger in mind?
            </h2>
            <p className="mt-2 text-graphite-soft">
              A larger site, an online store, a booking system, or a fully custom
              build — tell us what you’re picturing and we’ll put together a plan and
              a price just for you.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-ghost inline-flex shrink-0 items-center px-6 py-3 text-sm font-semibold"
          >
            Let’s talk
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-paper-sunken">
        <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8">
          <h2 className="font-editorial text-4xl font-semibold tracking-tight text-graphite">
            Questions, answered.
          </h2>
          <div className="mt-10">
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8">
        <span className="forge-tick" />
        <h2 className="mt-5 font-editorial text-3xl font-semibold text-graphite">
          Ready to get online?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-graphite-soft">
          Tell us about your business and we’ll have your website live in about a
          week.
        </p>
        <Link
          href="/contact"
          className="btn-primary mt-8 inline-flex items-center px-7 py-3.5 text-sm font-semibold"
        >
          Get your free quote
        </Link>
      </section>
    </>
  );
}
