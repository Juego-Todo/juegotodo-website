import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchSupabaseWithTimeout } from "@/lib/supabase/fetch";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isSupabaseConfigured() || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchSupabaseWithTimeout,
    },
  });
}
