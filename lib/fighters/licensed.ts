import {
  isFighterLicenseApplication,
  type LicenseApplication,
} from "@/data/license-applications";
import { resolveFighterUserIdBySlug } from "@/lib/fighters/fighter-slug-server";
import { buildFighterFromLicense } from "@/lib/fighters/from-license";
import type { EnrichedFighterProfile } from "@/lib/fighters/profile";
import {
  mapPublicFighterLicense,
  PUBLIC_FIGHTER_LICENSE_COLUMNS,
} from "@/lib/fighters/public-license";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

async function loadProfileFighterSlugs(
  serviceClient: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  userIds: string[],
) {
  if (userIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await serviceClient.from("profiles").select("id, fighter_slug").in("id", userIds);

  if (error) {
    throw new Error(error.message);
  }

  const slugByUserId = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.fighter_slug?.trim()) {
      slugByUserId.set(row.id, row.fighter_slug.trim());
    }
  }
  return slugByUserId;
}

export async function fetchApprovedFighterLicensesServer(): Promise<LicenseApplication[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return [];
  }

  const { data, error } = await serviceClient
    .from("license_applications")
    .select(PUBLIC_FIGHTER_LICENSE_COLUMNS)
    .eq("status", "approved")
    .or("application_program.eq.fighter_license,restriction_code.eq.JT11")
    .order("reviewed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const slugByUserId = await loadProfileFighterSlugs(
    serviceClient,
    [...new Set(rows.map((row) => row.user_id))],
  );

  const byUserId = new Map<string, LicenseApplication>();
  for (const row of rows) {
    const application = mapPublicFighterLicense(row, slugByUserId.get(row.user_id));
    if (!application || !slugByUserId.has(row.user_id)) {
      continue;
    }
    if (!byUserId.has(row.user_id)) {
      byUserId.set(row.user_id, application);
    }
  }

  return [...byUserId.values()];
}

export function mapApprovedLicensesToFighters(applications: LicenseApplication[]): EnrichedFighterProfile[] {
  const fighters = applications
    .map((application) => buildFighterFromLicense(application))
    .filter((fighter): fighter is EnrichedFighterProfile => Boolean(fighter));

  const bySlug = new Map<string, EnrichedFighterProfile>();
  for (const fighter of fighters) {
    if (!bySlug.has(fighter.slug)) {
      bySlug.set(fighter.slug, fighter);
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLicensedEnrichedFightersServer(): Promise<EnrichedFighterProfile[]> {
  const applications = await fetchApprovedFighterLicensesServer();
  return mapApprovedLicensesToFighters(applications);
}

export async function getLicensedFighterBySlugServer(slug: string): Promise<EnrichedFighterProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return null;
  }

  const userId = await resolveFighterUserIdBySlug(serviceClient, slug);
  if (!userId) {
    return null;
  }

  const { data, error } = await serviceClient
    .from("license_applications")
    .select(PUBLIC_FIGHTER_LICENSE_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "approved")
    .or("application_program.eq.fighter_license,restriction_code.eq.JT11")
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("fighter_slug")
    .eq("id", userId)
    .maybeSingle();

  const application = mapPublicFighterLicense(data, profile?.fighter_slug ?? slug);
  return application ? buildFighterFromLicense(application) : null;
}

/** Client-side loader for Search Fighter — approved licenses only. */
export async function fetchLicensedEnrichedFightersClient(): Promise<EnrichedFighterProfile[]> {
  const response = await fetch("/api/fighters/licensed", { cache: "no-store" });

  if (response.ok) {
    const payload = (await response.json()) as { fighters?: EnrichedFighterProfile[] };
    return payload.fighters ?? [];
  }

  // Local/demo fallback: read approved fighter licenses from browser storage.
  if (typeof window !== "undefined") {
    const { getAllLicenseApplications } = await import("@/lib/licenses/storage");
    return mapApprovedLicensesToFighters(
      getAllLicenseApplications().filter(
        (application) => isFighterLicenseApplication(application) && application.status === "approved",
      ),
    );
  }

  return [];
}
