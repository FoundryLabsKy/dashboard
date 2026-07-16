"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Company, NewCompany, SoldInfo } from "@/lib/types";
import { getRepo, type CompanyRepo } from "@/lib/repo";
import { useToast } from "@/components/ui/Toast";

interface CompaniesContextValue {
  companies: Company[];
  loading: boolean;
  mode: CompanyRepo["mode"];
  repo: CompanyRepo;
  addCompany: (input: NewCompany) => Promise<Company | null>;
  updateCompany: (id: string, patch: Partial<Company>) => Promise<void>;
  markSold: (id: string, info: SoldInfo) => Promise<void>;
  unmarkSold: (id: string) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextValue | null>(null);

export function useCompanies(): CompaniesContextValue {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error("useCompanies must be used within DataProvider");
  return ctx;
}

export function useCompany(id: string): Company | undefined {
  return useCompanies().companies.find((c) => c.id === id);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // getRepo() only reads env vars; browser storage is touched exclusively
  // inside repo method calls, which happen in effects and handlers.
  const repo = useMemo(() => getRepo(), []);

  useEffect(() => {
    let cancelled = false;
    repo
      .listCompanies()
      .then((data) => {
        if (!cancelled) setCompanies(data);
      })
      .catch(() => {
        if (!cancelled) toast("Could not load companies. Check your connection.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repo, toast]);

  const addCompany = useCallback(
    async (input: NewCompany) => {
      try {
        const company = await repo.createCompany(input);
        setCompanies((prev) => [company, ...prev]);
        return company;
      } catch {
        toast(`Could not add ${input.name}. Try again.`, "error");
        return null;
      }
    },
    [repo, toast]
  );

  const updateCompany = useCallback(
    async (id: string, patch: Partial<Company>) => {
      let previous: Company | undefined;
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          previous = c;
          return { ...c, ...patch };
        })
      );
      try {
        await repo.updateCompany(id, patch);
      } catch {
        if (previous) {
          const restore = previous;
          setCompanies((prev) => prev.map((c) => (c.id === id ? restore : c)));
        }
        toast("Change could not be saved. Try again.", "error");
      }
    },
    [repo, toast]
  );

  const markSold = useCallback(
    (id: string, info: SoldInfo) =>
      updateCompany(id, {
        sold: true,
        built: true,
        sale_price: info.sale_price,
        monthly_fee: info.monthly_fee,
        final_domain: info.final_domain,
        final_url: info.final_url,
      }),
    [updateCompany]
  );

  const unmarkSold = useCallback(
    (id: string) =>
      updateCompany(id, {
        sold: false,
        sale_price: null,
        monthly_fee: null,
        final_domain: null,
        final_url: null,
      }),
    [updateCompany]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      const previous = companies;
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      try {
        await repo.deleteCompany(id);
      } catch {
        setCompanies(previous);
        toast("Could not delete the company. Try again.", "error");
      }
    },
    [repo, companies, toast]
  );

  const value = useMemo<CompaniesContextValue>(
    () => ({
      companies,
      loading,
      mode: repo.mode,
      repo,
      addCompany,
      updateCompany,
      markSold,
      unmarkSold,
      deleteCompany,
    }),
    [repo, companies, loading, addCompany, updateCompany, markSold, unmarkSold, deleteCompany]
  );

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>;
}
