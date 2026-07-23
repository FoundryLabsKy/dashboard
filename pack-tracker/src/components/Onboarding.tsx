import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const PACK_SIZES = [20, 25] as const;

const COMMON_CURRENCIES = ["USD", "EUR", "GBP", "KYD", "CAD", "AUD", "JPY", "CHF"];

const slide = {
  initial: { opacity: 0, x: 56 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -56 },
  transition: { type: "spring" as const, stiffness: 380, damping: 34 },
};

export default function Onboarding() {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState("");
  const [packSize, setPackSize] = useState<number>(20);
  const [customSize, setCustomSize] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  const resolvedSize = useCustom ? Number(customSize) : packSize;
  const canContinue =
    step === 0
      ? brand.trim().length > 0
      : step === 1
        ? Number.isFinite(resolvedSize) && resolvedSize > 0
        : step === 2
          ? Number(price) > 0
          : currency.trim().length === 3;

  const finish = () => {
    updateSettings({
      brand: brand.trim(),
      packSize: resolvedSize,
      price: Number(price),
      currency: currency.trim().toUpperCase(),
      onboarded: true,
    });
  };

  const next = () => (step === 3 ? finish() : setStep((s) => s + 1));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-fill">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            />
          </div>
        ))}
      </div>

      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (canContinue) next();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div key="brand" {...slide} className="flex flex-1 flex-col justify-center">
              <h1 className="text-[28px] font-bold tracking-tight">What do you smoke?</h1>
              <p className="mt-2 text-[17px] text-label-secondary">
                Your usual brand. You can change it anytime.
              </p>
              <input
                autoFocus
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Marlboro Red"
                aria-label="Preferred brand"
                className="mt-8 h-[52px] rounded-[14px] bg-fill px-4 text-[17px] outline-none placeholder:text-label-tertiary focus:ring-2 focus:ring-accent/60"
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="size" {...slide} className="flex flex-1 flex-col justify-center">
              <h1 className="text-[28px] font-bold tracking-tight">Pack size?</h1>
              <p className="mt-2 text-[17px] text-label-secondary">
                Cigarettes per pack — used to count automatically.
              </p>
              <div className="mt-8 flex gap-3">
                {PACK_SIZES.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setUseCustom(false);
                      setPackSize(s);
                    }}
                    className={`h-[52px] flex-1 rounded-[14px] text-[17px] font-semibold transition-colors ${
                      !useCustom && packSize === s
                        ? "bg-accent text-white"
                        : "bg-fill text-label"
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setUseCustom(true)}
                  className={`h-[52px] flex-1 rounded-[14px] text-[17px] font-semibold transition-colors ${
                    useCustom ? "bg-accent text-white" : "bg-fill text-label"
                  }`}
                >
                  Custom
                </motion.button>
              </div>
              {useCustom && (
                <motion.input
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  autoFocus
                  inputMode="numeric"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 10"
                  aria-label="Custom pack size"
                  className="mt-3 h-[52px] rounded-[14px] bg-fill px-4 text-[17px] outline-none placeholder:text-label-tertiary focus:ring-2 focus:ring-accent/60"
                />
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="price" {...slide} className="flex flex-1 flex-col justify-center">
              <h1 className="text-[28px] font-bold tracking-tight">Typical price?</h1>
              <p className="mt-2 text-[17px] text-label-secondary">
                What a pack usually costs you.
              </p>
              <input
                autoFocus
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="9.50"
                aria-label="Typical price"
                className="mt-8 h-[52px] rounded-[14px] bg-fill px-4 text-[17px] outline-none placeholder:text-label-tertiary focus:ring-2 focus:ring-accent/60"
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="currency" {...slide} className="flex flex-1 flex-col justify-center">
              <h1 className="text-[28px] font-bold tracking-tight">Currency?</h1>
              <p className="mt-2 text-[17px] text-label-secondary">
                Pick one or type a 3-letter code.
              </p>
              <div className="mt-8 grid grid-cols-4 gap-2.5">
                {COMMON_CURRENCIES.map((c) => (
                  <motion.button
                    key={c}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCurrency(c)}
                    className={`h-11 rounded-[12px] text-[15px] font-semibold transition-colors ${
                      currency === c ? "bg-accent text-white" : "bg-fill text-label"
                    }`}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
              <input
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3))
                }
                aria-label="Currency code"
                className="mt-3 h-[52px] rounded-[14px] bg-fill px-4 text-[17px] tracking-[0.08em] outline-none focus:ring-2 focus:ring-accent/60"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          disabled={!canContinue}
          className="h-[52px] w-full rounded-[16px] bg-accent text-[17px] font-semibold text-white disabled:opacity-40"
        >
          {step === 3 ? "Done" : "Continue"}
        </motion.button>
      </form>
    </div>
  );
}
