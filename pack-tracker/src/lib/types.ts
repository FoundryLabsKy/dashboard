export interface Purchase {
  id: string;
  /** Unix epoch milliseconds of the purchase. */
  timestamp: number;
  brand: string;
  packSize: number;
  price: number;
}

export interface AppSettings {
  brand: string;
  packSize: number;
  price: number;
  currency: string;
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  brand: "",
  packSize: 20,
  price: 0,
  currency: "USD",
  onboarded: false,
};
