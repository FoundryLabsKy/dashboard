import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";
import { LogoMark } from "./Wordmark";
import { IconMail, IconPin, IconWhatsApp } from "./SiteIcons";

const SERVICE_LINKS = [
  { href: "/services", label: "Website design" },
  { href: "/services", label: "Hosting & care" },
  { href: "/services", label: "Domains & email" },
  { href: "/services", label: "Online stores" },
];

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-line bg-paper-sunken">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-editorial text-xl font-semibold text-graphite">
                Foundry Labs
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-graphite-muted">
              We design, build, and host websites for small businesses across the{" "}
              {SITE.islands} — crafted locally, priced fairly.
            </p>
          </div>

          <nav aria-label="Company">
            <p className="kicker">Company</p>
            <ul className="mt-5 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="link-forge text-[0.95rem] text-graphite-soft hover:text-graphite"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <p className="kicker">Services</p>
            <ul className="mt-5 flex flex-col gap-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="link-forge text-[0.95rem] text-graphite-soft hover:text-graphite"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="kicker">Get in touch</p>
            <ul className="mt-5 flex flex-col gap-4">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="group inline-flex items-center gap-3 text-[0.95rem] text-graphite-soft hover:text-graphite"
                >
                  <IconMail className="h-4 w-4 text-rust" />
                  <span className="link-forge">{SITE.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-3 text-[0.95rem] text-graphite-soft hover:text-graphite"
                >
                  <IconWhatsApp className="h-4 w-4 text-rust" />
                  <span className="link-forge">WhatsApp us</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-[0.95rem] text-graphite-muted">
                <IconPin className="h-4 w-4 text-rust" />
                {SITE.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-graphite-muted">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-graphite-faint">
            Forged in Grand Cayman
          </p>
        </div>
      </div>
    </footer>
  );
}
