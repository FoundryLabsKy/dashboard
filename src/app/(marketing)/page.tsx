import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { CARE, PROCESS, SERVICES, SHOWCASE, SITE, STANDARD } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { SpecimenCard } from "@/components/site/SpecimenCard";
import {
  IconCart,
  IconChart,
  IconCheck,
  IconGlobe,
  IconPalette,
  IconServer,
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

const TRADES = "Restaurants · Law firms · Dive shops · Realtors · Salons · Contractors";

const FIGURES = [
  { value: "$450", label: "flat one-time build" },
  { value: "$30/mo", label: "hosting, domain & care" },
  { value: "~7 days", label: "from kickoff to live" },
];

export default function HomePage() {
  return (
    <>
      {/* ─────────────── Hero ─────────────── */}
      <section className="relative overflow-hidden pt-[4.5rem]">
        <div
          className="blueprint pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-40 [mask-image:linear-gradient(to_left,#000,transparent)]"
          aria-hidden
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Reveal>
              <p className="kicker">Web studio — Grand Cayman</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-editorial text-[clamp(2.1rem,8vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-graphite [text-wrap:balance]">
                Websites that make small businesses look
                <span className="italic text-rust"> quietly serious.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-graphite-soft">
                We design, build, and host beautiful websites for local businesses
                across the {SITE.islands} — one honest price, fully looked after,
                and better value than anyone on the island.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/contact"
                  className="btn-primary inline-flex items-center px-6 py-3 text-sm font-semibold"
                >
                  Get a free quote
                </Link>
                <Link
                  href="/pricing"
                  className="link-forge text-sm font-semibold text-graphite"
                >
                  See how pricing works
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-12">
                <div className="hr-forge max-w-md" />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite-muted">
                  {TRADES}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Signature visual: a framed specimen, slightly tilted like a print sample */}
          <Reveal delay={0.12} y={24}>
            <div className="relative mx-auto w-full max-w-sm lg:mr-0">
              <div
                className="absolute -inset-x-3 -bottom-3 -top-2 -z-10 rounded-xl bg-paper-sunken"
                style={{ transform: "rotate(-2deg)" }}
                aria-hidden
              />
              <SpecimenCard
                name="Salt & Reef"
                kind="Seafront restaurant & bar · George Town"
                url="saltandreef.ky"
                accent="#9c3d22"
                index={1}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── Positioning + figures (sunken band) ─────────────── */}
      <section className="border-y border-line bg-paper-sunken">
        <div className="mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8">
          <p className="mx-auto max-w-3xl font-editorial text-2xl font-medium leading-[1.35] text-graphite sm:text-[2rem]">
            The café down the road and the dive shop on the dock do brilliant work.
            We make sure their website says so — without the agency price tag.
          </p>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {FIGURES.map((f) => (
              <div key={f.label} className="bg-paper-sunken px-6 py-8">
                <dt className="font-editorial text-4xl font-semibold text-graphite">
                  {f.value}
                </dt>
                <dd className="mt-2 text-sm text-graphite-muted">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─────────────── Services (editorial list, not cards) ─────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="kicker">What we do</p>
            <h2 className="mt-4 font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-graphite">
              Your whole online presence, under one roof.
            </h2>
            <p className="mt-5 max-w-sm text-graphite-soft">
              You run the business. We handle the design, the build, the hosting,
              the domain, and every update in between.
            </p>
            <Link
              href="/services"
              className="link-forge mt-6 inline-block text-sm font-semibold text-rust"
            >
              All services in detail →
            </Link>
          </div>

          <ul className="border-t border-line">
            {SERVICES.map((service, i) => {
              const Icon = SERVICE_ICONS[service.key];
              return (
                <li
                  key={service.key}
                  className="flex gap-5 border-b border-line py-7 sm:gap-7"
                >
                  <span className="font-mono text-sm text-graphite-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 text-rust">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-editorial text-xl font-semibold text-graphite">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-[0.95rem] leading-relaxed text-graphite-soft">
                      {service.blurb}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─────────────── Selected work (specimens) ─────────────── */}
      <section className="border-t border-line bg-paper-sunken">
        <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">The look</p>
              <h2 className="mt-4 max-w-xl font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-graphite">
                Designed for your trade — never a template.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-graphite-muted">
              A taste of the styles we build. Every site is designed from scratch
              around your brand, photos, and customers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE.map((item, i) => (
              <div key={item.name} className={i === 1 ? "lg:-translate-y-6" : ""}>
                <SpecimenCard
                  name={item.name}
                  kind={item.kind}
                  url={item.url}
                  accent={item.accent}
                  index={i + 1}
                />
              </div>
            ))}
          </div>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite-faint">
            Illustrative concepts — your site is built bespoke
          </p>
        </div>
      </section>

      {/* ─────────────── How it works (dark forge band) ─────────────── */}
      <section className="bg-graphite text-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-rust-tint">
              How it works
            </p>
            <h2 className="mt-4 font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-paper">
              From first chat to live in about a week.
            </h2>
          </div>

          <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((step) => (
              <li key={step.step} className="relative">
                <span className="font-editorial text-2xl font-semibold text-rust-tint">
                  {step.step}
                </span>
                <div className="mt-3 h-px w-full bg-white/15" />
                <h3 className="mt-4 font-editorial text-lg font-semibold text-paper">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────── Pricing ─────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="kicker">Honest pricing</p>
            <h2 className="mt-4 font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-graphite sm:text-5xl">
              One build price. One low monthly fee.
            </h2>
            <p className="mt-6 max-w-md text-graphite-soft">
              No tiers, no hourly billing, no surprises. We build your website, then
              keep it online and cared for — cancel any time.
            </p>
            <Link
              href="/pricing"
              className="link-forge mt-6 inline-block text-sm font-semibold text-rust"
            >
              Full pricing & add-ons →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="site-card p-7">
              <p className="kicker text-graphite-muted">{STANDARD.name}</p>
              <p className="mt-4 font-editorial text-5xl font-semibold text-graphite">
                <span className="align-top text-2xl text-graphite-muted">$</span>
                {STANDARD.price}
              </p>
              <p className="mt-1 text-sm text-graphite-muted">one-time build</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {STANDARD.includes.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-graphite-soft">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-card bg-paper-sunken p-7">
              <p className="kicker text-graphite-muted">{CARE.name}</p>
              <p className="mt-4 font-editorial text-5xl font-semibold text-graphite">
                <span className="align-top text-2xl text-graphite-muted">$</span>
                {CARE.price}
              </p>
              <p className="mt-1 text-sm text-graphite-muted">per month</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {CARE.includes.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-graphite-soft">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-forge-blue" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Closing CTA (rust band) ─────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-16 text-center sm:px-16"
            style={{ backgroundColor: "var(--color-graphite)" }}
          >
            <span className="forge-tick mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl font-editorial text-4xl font-semibold leading-[1.08] text-paper sm:text-5xl">
              Let’s build something worth pointing people to.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-paper/70">
              Tell us about your business and we’ll send back a clear, flat quote —
              usually within one working day.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Link
                href="/contact"
                className="btn-primary inline-flex items-center px-6 py-3 text-sm font-semibold"
              >
                Get your free quote
              </Link>
              <a
                href={`mailto:${SITE.email}`}
                className="link-forge text-sm font-semibold text-paper"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
