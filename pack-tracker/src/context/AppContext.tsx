import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings, Purchase } from "../lib/types";
import {
  eraseAll,
  loadPurchases,
  loadSettings,
  newId,
  savePurchases,
  saveSettings,
} from "../lib/storage";

interface AppContextValue {
  settings: AppSettings;
  purchases: Purchase[];
  updateSettings: (patch: Partial<AppSettings>) => void;
  logPack: () => Purchase;
  updatePurchase: (id: string, patch: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  eraseEverything: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [purchases, setPurchases] = useState<Purchase[]>(loadPurchases);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const logPack = useCallback((): Purchase => {
    const purchase: Purchase = {
      id: newId(),
      timestamp: Date.now(),
      brand: settings.brand,
      packSize: settings.packSize,
      price: settings.price,
    };
    setPurchases((prev) => {
      const next = [...prev, purchase];
      savePurchases(next);
      return next;
    });
    return purchase;
  }, [settings]);

  const updatePurchase = useCallback((id: string, patch: Partial<Purchase>) => {
    setPurchases((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
      savePurchases(next);
      return next;
    });
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setPurchases((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePurchases(next);
      return next;
    });
  }, []);

  const eraseEverything = useCallback(() => {
    eraseAll();
    setPurchases([]);
    setSettings(loadSettings());
  }, []);

  const value = useMemo(
    () => ({
      settings,
      purchases,
      updateSettings,
      logPack,
      updatePurchase,
      deletePurchase,
      eraseEverything,
    }),
    [settings, purchases, updateSettings, logPack, updatePurchase, deletePurchase, eraseEverything],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
