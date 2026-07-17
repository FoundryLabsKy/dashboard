import type { Company, CompanyFile, NewCompany } from "@/lib/types";
import type { CompanyRepo } from "./types";
import { deleteBlob, getBlob, putBlob } from "./idb";

const COMPANIES_KEY = "foundry:companies";
const FILES_KEY = "foundry:files";
const SEEDED_KEY = "foundry:seeded";
const SETTINGS_KEY = "foundry:settings";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function seedCompanies(): Company[] {
  const base = {
    contact: null,
    preview_url: null,
    pitch_url: null,
    in_talks: false,
    talking_points: [],
    final_domain: null,
    final_url: null,
    sale_price: null,
    monthly_fee: null,
    built: false,
    sold: false,
    archived: false,
  };
  return [
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Elite Marble & Granite",
      industry: "Stone & Surfaces",
      website: "https://elitemarblegranite.ky",
      notes:
        "Flagship client. Full redesign shipped and sold; hosting under monthly management.",
      potential_domains: ["elitemarble.ky", "elitegranite.com"],
      built: true,
      sold: true,
      final_domain: "elitemarble.ky",
      final_url: "https://elitemarble.ky",
      sale_price: 3500,
      monthly_fee: 30,
      created_at: daysAgo(90),
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Cayman Craft Market",
      industry: "Retail & Artisans",
      website: "https://caymancraftmarket.com",
      notes:
        "Waterfront artisan market. New site is built with live open/closed status. Ready to pitch to the co-op board.",
      potential_domains: ["craftmarket.ky", "caymancraftmarket.com"],
      built: true,
      created_at: daysAgo(45),
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Larry's Hardware & Home Centre",
      industry: "Hardware & Building Supplies",
      website: "https://larryshardware.ky",
      notes: "Brochure-style rebuild complete. Larry prefers a phone call over email.",
      potential_domains: ["larrys.ky", "larryshardware.com"],
      built: true,
      created_at: daysAgo(30),
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Coral Reef Dive Shop",
      industry: "Tourism & Watersports",
      website: "https://coralreefdivers.example.com",
      notes: "Current site is a dated template. Strong photo library to work with.",
      potential_domains: ["coralreefdive.ky"],
      created_at: daysAgo(12),
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Island Fresh Grocers",
      industry: "Grocery",
      website: null,
      notes: "No web presence at all. Weekly specials page could be the hook.",
      potential_domains: [],
      created_at: daysAgo(5),
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: "Sunset Charters",
      industry: "Boat Charters",
      website: "https://sunsetcharters.example.com",
      notes: "Owner moved off-island; parked for now.",
      potential_domains: ["sunsetcharters.ky"],
      built: true,
      archived: true,
      created_at: daysAgo(120),
    },
  ];
}

function loadCompanies(): Company[] {
  if (!localStorage.getItem(SEEDED_KEY)) {
    const seeded = seedCompanies();
    writeJson(COMPANIES_KEY, seeded);
    localStorage.setItem(SEEDED_KEY, "1");
    return seeded;
  }
  return readJson<Company[]>(COMPANIES_KEY, []);
}

const objectUrls = new Map<string, string>();

export const localRepo: CompanyRepo = {
  mode: "demo",

  async listCompanies() {
    return loadCompanies();
  },

  async createCompany(input: NewCompany) {
    const companies = loadCompanies();
    const company: Company = {
      id: crypto.randomUUID(),
      name: input.name,
      industry: input.industry?.trim() || null,
      contact: input.contact?.trim() || null,
      website: input.website?.trim() || null,
      preview_url: null,
      pitch_url: null,
      notes: input.notes ?? "",
      potential_domains: [],
      in_talks: false,
      talking_points: [],
      built: false,
      sold: false,
      archived: false,
      final_domain: null,
      final_url: null,
      sale_price: null,
      monthly_fee: null,
      created_at: new Date().toISOString(),
    };
    writeJson(COMPANIES_KEY, [company, ...companies]);
    return company;
  },

  async updateCompany(id: string, patch: Partial<Company>) {
    const companies = loadCompanies();
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Company not found");
    const updated = { ...companies[index], ...patch, id };
    companies[index] = updated;
    writeJson(COMPANIES_KEY, companies);
    return updated;
  },

  async deleteCompany(id: string) {
    writeJson(
      COMPANIES_KEY,
      loadCompanies().filter((c) => c.id !== id)
    );
    const files = readJson<CompanyFile[]>(FILES_KEY, []);
    const doomed = files.filter((f) => f.company_id === id);
    await Promise.all(doomed.map((f) => deleteBlob(f.storage_path).catch(() => undefined)));
    writeJson(
      FILES_KEY,
      files.filter((f) => f.company_id !== id)
    );
  },

  async listFiles(companyId: string) {
    return readJson<CompanyFile[]>(FILES_KEY, []).filter(
      (f) => f.company_id === companyId
    );
  },

  async uploadFile(companyId: string, file: File, kind?: "pitch") {
    const id = crypto.randomUUID();
    const record: CompanyFile = {
      id,
      company_id: companyId,
      filename: file.name,
      storage_path: kind === "pitch" ? `pitch-${id}` : id,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_at: new Date().toISOString(),
    };
    await putBlob(record.storage_path, file);
    writeJson(FILES_KEY, [...readJson<CompanyFile[]>(FILES_KEY, []), record]);
    return record;
  },

  async deleteFile(file: CompanyFile) {
    await deleteBlob(file.storage_path).catch(() => undefined);
    const url = objectUrls.get(file.storage_path);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.delete(file.storage_path);
    }
    writeJson(
      FILES_KEY,
      readJson<CompanyFile[]>(FILES_KEY, []).filter((f) => f.id !== file.id)
    );
  },

  async getFileUrl(file: CompanyFile) {
    const cached = objectUrls.get(file.storage_path);
    if (cached) return cached;
    const blob = await getBlob(file.storage_path);
    if (!blob) throw new Error("File data not found");
    const url = URL.createObjectURL(blob);
    objectUrls.set(file.storage_path, url);
    return url;
  },

  async getSetting(key: string) {
    const settings = readJson<Record<string, string>>(SETTINGS_KEY, {});
    return settings[key] ?? null;
  },

  async setSetting(key: string, value: string | null) {
    const settings = readJson<Record<string, string>>(SETTINGS_KEY, {});
    if (value === null) delete settings[key];
    else settings[key] = value;
    writeJson(SETTINGS_KEY, settings);
  },
};
