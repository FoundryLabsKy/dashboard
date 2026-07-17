import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { IconClock, IconMail, IconPin, IconWhatsApp } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get a free, no-obligation quote for your website. Message Foundry Labs in Grand Cayman by email or WhatsApp — we usually reply within one working day.",
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[110px]"
        aria-hidden
      />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        {/* Left: intro + direct contact */}
        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ember">
              Contact
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Let’s get you a{" "}
              <span className="text-gradient-ember">free quote.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Fill in the form and we’ll come back with a clear, flat price — usually
              within one working day. Prefer to talk? Reach us directly below.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-col gap-3">
              <a
                href={`mailto:${SITE.email}`}
                className="glass glass-hover flex items-center gap-4 p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <IconMail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">Email</span>
                  <span className="block text-sm text-muted">{SITE.email}</span>
                </span>
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`}
                className="glass glass-hover flex items-center gap-4 p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <IconWhatsApp className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">WhatsApp</span>
                  <span className="block text-sm text-muted">
                    Message us for a quick reply
                  </span>
                </span>
              </a>
              <div className="glass flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <IconPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">Based in</span>
                  <span className="block text-sm text-muted">{SITE.location}</span>
                </span>
              </div>
              <div className="glass flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <IconClock className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">Hours</span>
                  <span className="block text-sm text-muted">
                    Mon–Fri, 9am–5pm · replies within a day
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right: form */}
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
