import { motion, useAnimationControls } from "framer-motion";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { computeStats } from "../lib/stats";
import { formatMoney, lastPackLabel } from "../lib/format";
import Sheet from "./Sheet";

export default function Home() {
  const { settings, purchases, logPack } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
  const buttonControls = useAnimationControls();

  const stats = computeStats(purchases);

  const confirm = () => {
    logPack();
    setConfirmOpen(false);
    setJustLogged(true);
    void (async () => {
      await buttonControls.start({
        scale: 1.06,
        transition: { type: "spring", stiffness: 600, damping: 20 },
      });
      await buttonControls.start({
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 14 },
      });
      setJustLogged(false);
    })();
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(3.5rem,env(safe-area-inset-top))] pb-32">
      <header className="text-center">
        <p className="text-[13px] font-semibold tracking-[0.06em] text-label-secondary uppercase">
          Current brand
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight">{settings.brand}</h1>
        <p className="mt-2 text-[17px] text-label-secondary">
          {lastPackLabel(stats.daysSinceLastPack)}
        </p>
      </header>

      <div className="flex flex-1 items-center justify-center py-10">
        <motion.button
          type="button"
          animate={buttonControls}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={() => setConfirmOpen(true)}
          className="relative flex h-56 w-56 items-center justify-center rounded-full bg-accent text-white shadow-[0_18px_50px_-12px_rgba(0,122,255,0.55)]"
        >
          <span className="flex flex-col items-center gap-1">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[19px] font-semibold">Buy New Pack</span>
          </span>
          {justLogged && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-accent"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.35 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              aria-hidden
            />
          )}
        </motion.button>
      </div>

      <p className="pb-2 text-center text-[13px] text-label-tertiary">
        One tap logs the date, time, brand and price.
      </p>

      <Sheet open={confirmOpen} onClose={() => setConfirmOpen(false)} label="Confirm purchase">
        <div className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-fill sm:hidden" aria-hidden />
        <h2 className="text-center text-[20px] font-semibold tracking-tight">
          Did you buy another pack?
        </h2>
        <p className="mt-1.5 text-center text-[15px] text-label-secondary">
          {settings.brand} · {formatMoney(settings.price, settings.currency)}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={confirm}
            className="h-[52px] w-full rounded-[16px] bg-accent text-[17px] font-semibold text-white"
          >
            Yes
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setConfirmOpen(false)}
            className="h-[52px] w-full rounded-[16px] bg-fill text-[17px] font-semibold text-accent"
          >
            Cancel
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}
