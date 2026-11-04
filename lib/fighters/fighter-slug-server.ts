import { slugifyFighterName } from "@/lib/fighters/slug";
import type { createSupabaseServiceClient } from "@/lib/supabase/service";

type ServiceClient = NonNullable<ReturnType<typeof createSupabaseServiceClient>>;

/** Allocate a unique profiles.fighter_slug, appending -2, -3, … on collisions. */
export async function allocateUniqueFighterSlug(
  serviceClient: ServiceClient,
  preferredSlug: string,
  userId: string,
): Promise<string> {
  const base = slugifyFighterName(preferredSlug) || `fighter-${userId.slice(0, 8)}`;
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("fighter_slug", candidate)
      .neq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${base.slice(0, 70)}-${suffix}`;
    suffix += 1;
  }
}

export async function setProfileFighterSlug(
  serviceClient: ServiceClient,
  userId: string,
  fighterSlug: string,
) {
  const { error } = await serviceClient
    .from("profiles")
    .update({ fighter_slug: fighterSlug })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function resolveFighterUserIdBySlug(
  serviceClient: ServiceClient,
  slug: string,
): Promise<string | null> {
  const normalized = slugifyFighterName(slug);
  if (!normalized) {
    return null;
  }

  const { data, error } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("fighter_slug", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
