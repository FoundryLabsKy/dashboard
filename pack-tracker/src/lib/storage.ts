import { DEFAULT_SETTINGS, type AppSettings, type Purchase } from "./types";

const PURCHASES_KEY = "pack-tracker.purchases";
const SETTINGS_KEY = "pack-tracker.settings";

export function loadPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Purchase =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Purchase).id === "string" &&
        typeof (p as Purchase).timestamp === "number" &&
        typeof (p as Purchase).brand === "string" &&
        typeof (p as Purchase).packSize === "number" &&
        typeof (p as Purchase).price === "number",
    );
  } catch {
    return [];
  }
}

export function savePurchases(purchases: Purchase[]): void {
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function eraseAll(): void {
  localStorage.removeItem(PURCHASES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

export function exportJSON(settings: AppSettings, purchases: Purchase[]): string {
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), settings, purchases },
    null,
    2,
  );
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
