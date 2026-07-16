import { isSupabaseConfigured } from "@/lib/env";
import type { CompanyRepo } from "./types";
import { localRepo } from "./localRepo";
import { supabaseRepo } from "./supabaseRepo";

export function getRepo(): CompanyRepo {
  return isSupabaseConfigured() ? supabaseRepo : localRepo;
}

export type { CompanyRepo };
