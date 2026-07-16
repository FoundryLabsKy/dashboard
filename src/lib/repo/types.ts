import type { Company, CompanyFile, NewCompany } from "@/lib/types";

export interface CompanyRepo {
  mode: "supabase" | "demo";
  listCompanies(): Promise<Company[]>;
  createCompany(input: NewCompany): Promise<Company>;
  updateCompany(id: string, patch: Partial<Company>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  listFiles(companyId: string): Promise<CompanyFile[]>;
  uploadFile(companyId: string, file: File): Promise<CompanyFile>;
  deleteFile(file: CompanyFile): Promise<void>;
  getFileUrl(file: CompanyFile): Promise<string>;
}
