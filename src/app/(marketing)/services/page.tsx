import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { PROCESS, SERVICES } from "@/lib/site";
import {
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
      <section className="border-b border-line pt-[4.5rem]">
        <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
          <p className="kicker">Services</p>
          <h1 className="mt-5 max-w-3xl font-editorial text-[clamp(2rem,7.5vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-graphite">
            One team for your whole
            <span className="italic text-rust"> online presence.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-graphite-soft">
            You run the business. We handle the website, the hosting, the domain, the
            email, and every update in between — so you never have to think about the
            technical side again.
          </p>
        </div>
      </section>

      {/* Detailed services — alternating editorial rows */}
      <section className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        {SERVICES.map((service, i) => {
          const Icon = SERVICE_ICONS[service.key];
          return (
            <div
              key={service.key}
              className="grid gap-6 border-b border-line py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-12"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-graphite-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-rust">
                    <Icon className="h-7 w-7" />
                  </span>
                </div>
                <h2 className="mt-4 font-editorial text-3xl font-semibold tracking-tight text-graphite">
                  {service.title}
                </h2>
                <p className="mt-3 max-w-sm text-graphite-soft">{service.blurb}</p>
              </div>
              <ul className="grid content-start gap-3 sm:grid-cols-1 md:pt-1">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 border-t border-line pt-3 text-[0.95rem] text-graphite-soft first:border-t-0 first:pt-0"
                  >
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Process — dark forge band */}
      <section className="mt-4 bg-graphite text-paper">
        <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-rust-tint">
              How it works
            </p>
            <h2 className="mt-4 font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-paper">
              A simple, five-step way of working.
            </h2>
            <p className="mt-5 text-paper/70">
              No drawn-out timelines or agency runaround. Here’s exactly how a project
              goes from idea to live.
            </p>
          </div>
          <ol className="mt-14 flex flex-col">
            {PROCESS.map((step) => (
              <li
                key={step.step}
                className="grid gap-3 border-t border-white/12 py-7 sm:grid-cols-[auto_1fr] sm:gap-10"
              >
                <span className="font-editorial text-2xl font-semibold text-rust-tint">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-editorial text-xl font-semibold text-paper">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-[0.95rem] leading-relaxed text-paper/70">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-editorial text-3xl font-semibold text-graphite">
              Not sure which service you need?
            </h2>
            <p className="mt-2 max-w-md text-graphite-soft">
              Tell us what you’re trying to do and we’ll point you the right way —
              free, no obligation.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-primary inline-flex shrink-0 items-center px-6 py-3.5 text-sm font-semibold"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
