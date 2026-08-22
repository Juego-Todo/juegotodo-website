import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Authenticated fetch for platform member APIs (cookie + bearer fallback). */
export async function platformFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

export function isSupabaseUnavailableResponse(status: number) {
  return status === 503;
}
