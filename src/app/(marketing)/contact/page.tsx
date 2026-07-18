import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { ContactForm } from "@/components/site/ContactForm";
import { IconClock, IconMail, IconPin, IconWhatsApp } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get a free, no-obligation quote for your website. Message Foundry Labs in Grand Cayman by email or WhatsApp — we usually reply within one working day.",
};

export default function ContactPage() {
  return (
    <section className="pt-[4.5rem]">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {/* Left: intro + direct contact */}
        <div>
          <p className="kicker">Contact</p>
          <h1 className="mt-5 font-editorial text-[clamp(2rem,7.5vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-graphite">
            Let’s get you a
            <span className="italic text-rust"> free quote.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-graphite-soft">
            Fill in the form and we’ll come back with a clear, flat price — usually
            within one working day. Prefer to talk? Reach us directly below.
          </p>

          <div className="mt-12 flex flex-col divide-y divide-line border-y border-line">
            <a
              href={`mailto:${SITE.email}`}
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-paper-sunken/60"
            >
              <IconMail className="h-5 w-5 shrink-0 text-rust" />
              <span>
                <span className="block text-sm font-semibold text-graphite">Email</span>
                <span className="block text-sm text-graphite-muted">{SITE.email}</span>
              </span>
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`}
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-paper-sunken/60"
            >
              <IconWhatsApp className="h-5 w-5 shrink-0 text-rust" />
              <span>
                <span className="block text-sm font-semibold text-graphite">WhatsApp</span>
                <span className="block text-sm text-graphite-muted">
                  Message us for a quick reply
                </span>
              </span>
            </a>
            <div className="flex items-center gap-4 py-4">
              <IconPin className="h-5 w-5 shrink-0 text-rust" />
              <span>
                <span className="block text-sm font-semibold text-graphite">Based in</span>
                <span className="block text-sm text-graphite-muted">{SITE.location}</span>
              </span>
            </div>
            <div className="flex items-center gap-4 py-4">
              <IconClock className="h-5 w-5 shrink-0 text-rust" />
              <span>
                <span className="block text-sm font-semibold text-graphite">Hours</span>
                <span className="block text-sm text-graphite-muted">
                  Mon–Fri, 9am–5pm · replies within a day
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="site-card bg-paper-raised p-7 sm:p-9">
          <h2 className="font-editorial text-2xl font-semibold text-graphite">
            Tell us about your project
          </h2>
          <p className="mt-1.5 text-sm text-graphite-muted">
            No obligation — just a friendly quote.
          </p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
