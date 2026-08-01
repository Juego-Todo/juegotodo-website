import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Authenticated fetch for /api/admin/* routes from the profile portal.
 * Cookie sessions are unreliable there, so we attach the browser access token.
 */
export async function adminFetch(input: string, init: RequestInit = {}) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}
