import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { IconMail, IconPin, IconWhatsApp } from "./SiteIcons";

const SERVICE_LINKS = [
  { href: "/services", label: "Website design" },
  { href: "/services", label: "Hosting & care" },
  { href: "/services", label: "Domains & email" },
  { href: "/services", label: "Online stores" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/8">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              We design, build, and host beautiful websites for small businesses
              across the {SITE.islands} — for less than you’d expect.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              Company
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              Services
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              Get in touch
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-ink"
                >
                  <IconMail className="h-4 w-4 text-ember" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-ink"
                >
                  <IconWhatsApp className="h-4 w-4 text-ember" />
                  Message us on WhatsApp
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-sm text-muted">
                <IconPin className="h-4 w-4 text-ember" />
                {SITE.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Forged in Grand Cayman
          </p>
        </div>
      </div>
    </footer>
  );
}
