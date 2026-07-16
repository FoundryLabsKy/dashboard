import type { Company, SortKey } from "./types";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alpha", label: "A to Z" },
  { value: "sold", label: "Sold first" },
];

export function sortCompanies(companies: Company[], key: SortKey): Company[] {
  const sorted = [...companies];
  switch (key) {
    case "newest":
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case "oldest":
      return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    case "alpha":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "sold":
      return sorted.sort(
        (a, b) =>
          Number(b.sold) - Number(a.sold) || b.created_at.localeCompare(a.created_at)
      );
  }
}

export function searchCompanies(companies: Company[], query: string): Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return companies;
  return companies.filter((c) =>
    [c.name, c.industry, c.website, c.notes, ...c.potential_domains]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q))
  );
}
