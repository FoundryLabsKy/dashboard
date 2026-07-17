import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { PROCESS, SERVICES } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import {
  IconArrowRight,
  IconCart,
  IconChart,
  IconCheck,
  IconGlobe,
  IconPalette,
  IconServer,
  IconWrench,
} from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website design, managed hosting, domains and email, ongoing care, online stores, and local SEO — everything a Cayman business needs to be online, handled by Foundry Labs.",
};

const SERVICE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  design: IconPalette,
  hosting: IconServer,
  domains: IconGlobe,
  care: IconWrench,
  commerce: IconCart,
  seo: IconChart,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[110px]"
          aria-hidden
        />
        <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-24">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
              Services
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              One team for your whole{" "}
              <span className="text-gradient-ember">online presence.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              You run the business. We handle the website, the hosting, the domain,
              the email, and every update in between — so you never have to think
              about the technical side again.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Detailed services */}
      <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-4">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.key];
            return (
              <Reveal key={service.key} delay={0.03 * i}>
                <div className="glass grid gap-6 p-8 md:grid-cols-[auto_1fr_1fr] md:items-start">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/12 text-ember">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      {service.title}
                    </h2>
                    <p className="mt-2 max-w-md text-muted">{service.blurb}</p>
                  </div>
                  <ul className="flex flex-col gap-3 md:pt-1">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-ink/90">
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

      {/* Process */}
      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            A simple, five-step way of working.
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            No drawn-out timelines or agency runaround. Here’s exactly how a project
            goes from idea to live.
          </p>
        </Reveal>
        <ol className="mt-10 flex flex-col gap-4">
          {PROCESS.map((step, i) => (
            <Reveal key={step.step} delay={0.04 * i}>
              <li className="glass flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ember/25 font-mono text-sm text-ember">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-6 px-8 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Not sure which service you need?
              </h2>
              <p className="mt-2 max-w-md text-muted">
                Tell us what you’re trying to do and we’ll point you the right way —
                free, no obligation.
              </p>
            </div>
            <Link
              href="/contact"
              className="ember-glow inline-flex shrink-0 items-center gap-2 rounded-xl bg-ember px-6 py-3.5 text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              Talk to us
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
