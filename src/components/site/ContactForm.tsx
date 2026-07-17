"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { IconArrowRight, IconCheck } from "./SiteIcons";

const SERVICES = [
  "A new website",
  "Redesign my existing site",
  "Hosting & maintenance",
  "Online store or bookings",
  "Domain & business email",
  "Not sure yet",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none";
const labelClass = "block text-sm font-medium text-ink";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const business = String(data.get("business") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = `Website enquiry — ${business || name || "New enquiry"}`;
    const body = [
      `Name: ${name}`,
      `Business: ${business}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Interested in: ${service}`,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="glass p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Your name
          </label>
          <input id="name" name="name" required className={inputClass} placeholder="Jane Ebanks" />
        </div>
        <div>
          <label htmlFor="business" className={labelClass}>
            Business name
          </label>
          <input
            id="business"
            name="business"
            className={inputClass}
            placeholder="Salt & Reef"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="you@business.ky"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-faint">(optional)</span>
          </label>
          <input id="phone" name="phone" className={inputClass} placeholder="+1 (345) …" />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="service" className={labelClass}>
          What can we help with?
        </label>
        <select id="service" name="service" className={inputClass} defaultValue={SERVICES[0]}>
          {SERVICES.map((s) => (
            <option key={s} value={s} className="bg-void-raised">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="message" className={labelClass}>
          Tell us a little about it
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="What does your business do, and what would you like your website to achieve?"
        />
      </div>

      <button
        type="submit"
        className="ember-glow mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3.5 text-sm font-semibold text-void transition-opacity hover:opacity-90 sm:w-auto"
      >
        Send enquiry
        <IconArrowRight className="h-4 w-4" />
      </button>

      {sent && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-stage-sold">
          <IconCheck className="h-4 w-4" />
          Opening your email app — if nothing happens, write to {SITE.email}.
        </p>
      )}
    </form>
  );
}
