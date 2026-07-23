import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { exportJSON } from "../lib/storage";
import Sheet from "./Sheet";

export default function Settings() {
  const { settings, purchases, updateSettings, eraseEverything } = useApp();
  const [brand, setBrand] = useState(settings.brand);
  const [packSize, setPackSize] = useState(String(settings.packSize));
  const [price, setPrice] = useState(String(settings.price));
  const [currency, setCurrency] = useState(settings.currency);
  const [confirmErase, setConfirmErase] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBrand(settings.brand);
    setPackSize(String(settings.packSize));
    setPrice(String(settings.price));
    setCurrency(settings.currency);
  }, [settings]);

  const dirty =
    brand !== settings.brand ||
    packSize !== String(settings.packSize) ||
    price !== String(settings.price) ||
    currency !== settings.currency;

  const valid =
    brand.trim().length > 0 &&
    Number(packSize) > 0 &&
    Number(price) > 0 &&
    currency.trim().length === 3;

  const save = () => {
    updateSettings({
      brand: brand.trim(),
      packSize: Number(packSize),
      price: Number(price),
      currency: currency.trim().toUpperCase(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const download = () => {
    const blob = new Blob([exportJSON(settings, purchases)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pack-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const field =
    "h-[52px] w-full rounded-[14px] bg-fill px-4 text-[17px] outline-none";
  const label =
    "mb-1.5 block px-1 text-[13px] font-semibold tracking-[0.04em] text-label-secondary uppercase";

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-[max(3.5rem,env(safe-area-inset-top))] pb-32">
      <h1 className="px-4 text-[34px] font-bold tracking-tight">Settings</h1>

      <div className="mt-4 space-y-3 rounded-[16px] bg-card p-4">
        <label className="block">
          <span className={label}>Brand</span>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand" className={field} />
        </label>
        <label className="block">
          <span className={label}>Pack size</span>
          <input
            inputMode="numeric"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value.replace(/\D/g, ""))}
            aria-label="Pack size"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Typical price</span>
          <input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
            aria-label="Typical price"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Currency</span>
          <input
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3))
            }
            aria-label="Currency"
            className={field}
          />
        </label>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={!dirty || !valid}
          className="h-[52px] w-full rounded-[14px] bg-accent text-[17px] font-semibold text-white disabled:bg-fill disabled:text-label-secondary"
        >
          {saved ? "Saved" : "Save Changes"}
        </motion.button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[16px] bg-card">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={download}
          className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-[17px] text-accent"
        >
          Export data as JSON
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4.5 20h15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setConfirmErase(true)}
          className="relative flex min-h-[52px] w-full items-center px-4 text-left text-[17px] text-destructive before:absolute before:top-0 before:right-0 before:left-4 before:h-px before:bg-separator"
        >
          Erase All Data
        </motion.button>
      </div>

      <p className="mt-6 px-1 text-center text-[13px] text-label-tertiary">
        Everything stays on this device. No account, no cloud, no tracking.
      </p>

      <Sheet open={confirmErase} onClose={() => setConfirmErase(false)} label="Erase all data">
        <h2 className="text-center text-[20px] font-semibold tracking-tight">Erase all data?</h2>
        <p className="mt-1.5 text-center text-[15px] text-label-secondary">
          This deletes every purchase and your settings. It can't be undone.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              eraseEverything();
              setConfirmErase(false);
            }}
            className="h-[52px] w-full rounded-[14px] bg-destructive text-[17px] font-semibold text-white"
          >
            Erase Everything
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmErase(false)}
            className="h-[52px] w-full rounded-[14px] bg-fill text-[17px] font-semibold text-accent"
          >
            Cancel
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}
