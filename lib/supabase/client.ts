import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchSupabaseWithTimeout } from "@/lib/supabase/fetch";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      global: {
        fetch: fetchSupabaseWithTimeout,
      },
    });
  }

  return browserClient;
}

export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient();
}
