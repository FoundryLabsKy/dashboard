import type { Company, CompanyFile, NewCompany } from "@/lib/types";
import type { CompanyRepo } from "./types";
import { getSupabase } from "@/lib/supabaseClient";

const BUCKET = "company-files";

export const supabaseRepo: CompanyRepo = {
  mode: "supabase",

  async listCompanies() {
    const { data, error } = await getSupabase()
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Company[];
  },

  async createCompany(input: NewCompany) {
    const { data, error } = await getSupabase()
      .from("companies")
      .insert({
        name: input.name,
        industry: input.industry?.trim() || null,
        contact: input.contact?.trim() || null,
        website: input.website?.trim() || null,
        notes: input.notes ?? "",
      })
      .select()
      .single();
    if (error) throw error;
    return data as Company;
  },

  async updateCompany(id: string, patch: Partial<Company>) {
    const safePatch = { ...patch };
    delete safePatch.id;
    delete safePatch.created_at;
    const { data, error } = await getSupabase()
      .from("companies")
      .update(safePatch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Company;
  },

  async deleteCompany(id: string) {
    const supabase = getSupabase();
    const { data: files } = await supabase
      .from("files")
      .select("storage_path")
      .eq("company_id", id);
    if (files?.length) {
      await supabase.storage.from(BUCKET).remove(files.map((f) => f.storage_path));
    }
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) throw error;
  },

  async listFiles(companyId: string) {
    const { data, error } = await getSupabase()
      .from("files")
      .select("*")
      .eq("company_id", companyId)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CompanyFile[];
  },

  async uploadFile(companyId: string, file: File) {
    const supabase = getSupabase();
    const path = `${companyId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase
      .from("files")
      .insert({
        company_id: companyId,
        filename: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CompanyFile;
  },

  async deleteFile(file: CompanyFile) {
    const supabase = getSupabase();
    await supabase.storage.from(BUCKET).remove([file.storage_path]);
    const { error } = await supabase.from("files").delete().eq("id", file.id);
    if (error) throw error;
  },

  async getFileUrl(file: CompanyFile) {
    const { data } = getSupabase()
      .storage.from(BUCKET)
      .getPublicUrl(file.storage_path);
    return data.publicUrl;
  },
};
