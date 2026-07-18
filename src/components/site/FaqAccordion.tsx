"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Faq = { q: string; a: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="border-t border-line">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-editorial text-lg font-semibold text-graphite sm:text-xl">
                  {faq.q}
                </span>
                <span
                  className="relative mt-1 h-4 w-4 shrink-0 text-rust"
                  aria-hidden
                >
                  <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-current" />
                  <motion.span
                    animate={{ rotate: isOpen ? 0 : 90 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-current"
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-[0.95rem] leading-relaxed text-graphite-soft">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
