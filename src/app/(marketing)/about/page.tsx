import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { IconCheck } from "@/components/site/SiteIcons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Foundry Labs is a Grand Cayman web studio on a mission to give small local businesses the kind of website usually reserved for big brands — crafted locally, priced fairly.",
};

const VALUES = [
  {
    title: "Craft over templates",
    body: "Every site is designed and built by hand. We sweat the details most people never notice — because they're what make a small business look serious.",
  },
  {
    title: "Fast, always",
    body: "Fast to launch, fast to load, fast to reach. Modern tooling means your site is live in days and loads instantly on any phone.",
  },
  {
    title: "Fair and transparent",
    body: "Flat prices, no lock-in, and you own everything. We'd rather earn your business every month than trap you in a contract.",
  },
  {
    title: "Genuinely local",
    body: "We live and work in Grand Cayman. You get a real person who knows the island — not an overseas ticket queue in another time zone.",
  },
];

const COMPARISON = [
  "A design built around your brand, not a stock template",
  "Hosting, security, and backups handled for you",
  "A local team you can actually reach on WhatsApp",
  "Unlimited small edits without hourly invoices",
  "Pricing built for island small businesses",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line pt-[4.5rem]">
        <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
          <p className="kicker">About — {SITE.location}</p>
          <h1 className="mt-5 max-w-3xl font-editorial text-[clamp(2rem,7.5vw,3.75rem)] font-semibold leading-[1.03] tracking-[-0.01em] text-graphite">
            Big-brand websites for the businesses that
            <span className="italic text-rust"> make the island tick.</span>
          </h1>
        </div>
      </section>

      {/* Story — editorial two column */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[0.5fr_1fr]">
          <p className="kicker md:pt-2">Our story</p>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-graphite-soft">
            <p>
              Foundry Labs was born from a simple frustration: the café down the road,
              the dive shop on the dock, the family law practice in town — all doing
              brilliant work, all stuck with a website that didn’t show it.
            </p>
            <p>
              The good agencies were too expensive, and the cheap builders looked
              cheap. So we built a studio to close that gap — pairing genuinely custom
              design with modern engineering and fully managed hosting, at a price a
              small Cayman business can actually say yes to.
            </p>
          </div>
        </div>
      </section>

      {/* Values — sunken band, two columns of rows */}
      <section className="border-y border-line bg-paper-sunken">
        <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
          <p className="kicker">What we believe</p>
          <h2 className="mt-4 max-w-xl font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-graphite">
            The principles behind every project.
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {VALUES.map((value, i) => (
              <div key={value.title}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-graphite-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="forge-tick" />
                </div>
                <h3 className="mt-4 font-editorial text-xl font-semibold text-graphite">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-graphite-soft">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-graphite">
              Why businesses choose Foundry Labs
            </h2>
            <p className="mt-5 max-w-md text-graphite-soft">
              We sit in the sweet spot between a DIY website builder and a pricey
              agency — the quality of the latter, closer to the price of the former.
            </p>
            <Link
              href="/contact"
              className="btn-primary mt-8 inline-flex items-center px-6 py-3 text-sm font-semibold"
            >
              Start a conversation
            </Link>
          </div>
          <ul className="border-t border-line">
            {COMPARISON.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-b border-line py-4 text-graphite-soft"
              >
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rust" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
