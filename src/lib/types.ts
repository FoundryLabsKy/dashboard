export interface Company {
  id: string;
  name: string;
  industry: string | null;
  contact: string | null;
  website: string | null;
  preview_url: string | null;
  pitch_url: string | null;
  notes: string;
  potential_domains: string[];
  built: boolean;
  sold: boolean;
  archived: boolean;
  final_domain: string | null;
  final_url: string | null;
  sale_price: number | null;
  monthly_fee: number | null;
  created_at: string;
}

export interface CompanyFile {
  id: string;
  company_id: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
}

export interface NewCompany {
  name: string;
  industry?: string;
  contact?: string;
  website?: string;
  notes?: string;
}

export interface SoldInfo {
  sale_price: number;
  monthly_fee: number;
  final_domain: string;
  final_url: string;
}

export type Stage = "todo" | "built" | "sold" | "archived";

export type SortKey = "newest" | "oldest" | "alpha" | "sold";

export function deriveStage(c: Company): Stage {
  if (c.archived) return "archived";
  if (c.sold) return "sold";
  if (c.built) return "built";
  return "todo";
}

export const STAGE_LABELS: Record<Stage, string> = {
  todo: "To Build",
  built: "Ready to Pitch",
  sold: "Sold",
  archived: "Archived",
};
