import type { Company } from "./types";

export interface Kpis {
  totalIdeas: number;
  websitesBuilt: number;
  readyToPitch: number;
  inTalks: number;
  soldCount: number;
  mrr: number;
  totalRevenue: number;
  activeClients: number;
  avgSalePrice: number;
}

export function computeKpis(companies: Company[]): Kpis {
  const active = companies.filter((c) => !c.archived);
  const sold = active.filter((c) => c.sold);
  const totalRevenue = sold.reduce((sum, c) => sum + (c.sale_price ?? 0), 0);
  return {
    totalIdeas: active.length,
    websitesBuilt: active.filter((c) => c.built || c.sold).length,
    readyToPitch: active.filter((c) => c.built && !c.in_talks && !c.sold).length,
    inTalks: active.filter((c) => c.in_talks && !c.sold).length,
    soldCount: sold.length,
    mrr: sold.reduce((sum, c) => sum + (c.monthly_fee ?? 0), 0),
    totalRevenue,
    activeClients: sold.length,
    avgSalePrice: sold.length ? totalRevenue / sold.length : 0,
  };
}
