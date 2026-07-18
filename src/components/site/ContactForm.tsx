"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { IconCheck } from "./SiteIcons";

const SERVICES = [
  "A new website",
  "Redesign my existing site",
  "Hosting & maintenance",
  "Online store or bookings",
  "Domain & business email",
  "Not sure yet",
];

type Errors = Partial<Record<"name" | "email", string>>;

const fieldClass =
  "mt-2 w-full rounded-md border bg-paper-raised px-3.5 py-2.5 text-[0.95rem] text-graphite placeholder:text-graphite-faint transition-colors focus:outline-none";
const labelClass = "block text-sm font-medium text-graphite";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const check = (field: "name" | "email", value: string): string | undefined => {
    if (field === "name" && !value.trim()) return "Please tell us your name.";
    if (field === "email") {
      if (!value.trim()) return "We need an email to reply to.";
      if (!validEmail(value)) return "That email doesn't look right.";
    }
    return undefined;
  };

  const onBlur = (field: "name" | "email") => (e: React.FocusEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, [field]: check(field, e.target.value) }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const nameErr = check("name", name);
    const emailErr = check("email", email);
    if (nameErr || emailErr) {
      setErrors({ name: nameErr, email: emailErr });
      return;
    }

    const business = String(data.get("business") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = `Website enquiry — ${business || name.trim()}`;
    const body = [
      `Name: ${name.trim()}`,
      `Business: ${business}`,
      `Email: ${email.trim()}`,
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          onBlur={onBlur("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`${fieldClass} ${
            errors.name ? "border-err" : "border-line focus:border-rust"
          }`}
          placeholder="Jane Ebanks"
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-err">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="business" className={labelClass}>
          Business name <span className="text-graphite-faint">(optional)</span>
        </label>
        <input
          id="business"
          name="business"
          autoComplete="organization"
          className={`${fieldClass} border-line focus:border-rust`}
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
          autoComplete="email"
          onBlur={onBlur("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${fieldClass} ${
            errors.email ? "border-err" : "border-line focus:border-rust"
          }`}
          placeholder="you@business.ky"
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-err">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="text-graphite-faint">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={`${fieldClass} border-line focus:border-rust`}
          placeholder="+1 (345) …"
        />
      </div>

      <div>
        <label htmlFor="service" className={labelClass}>
          What can we help with?
        </label>
        <select
          id="service"
          name="service"
          defaultValue={SERVICES[0]}
          className={`${fieldClass} border-line focus:border-rust`}
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Tell us a little about it <span className="text-graphite-faint">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={`${fieldClass} resize-none border-line focus:border-rust`}
          placeholder="What does your business do, and what would you like your website to achieve?"
        />
      </div>

      <button
        type="submit"
        className="btn-primary mt-1 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
      >
        Send enquiry
      </button>

      {sent && (
        <p className="inline-flex items-center gap-2 text-sm text-ok">
          <IconCheck className="h-4 w-4" />
          Opening your email app — if nothing happens, write to {SITE.email}.
        </p>
      )}
    </form>
  );
}
