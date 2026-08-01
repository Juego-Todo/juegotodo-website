import {
  isFighterLicenseApplication,
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import { buildFighterFromLicense } from "@/lib/fighters/from-license";
import type { EnrichedFighterProfile } from "@/lib/fighters/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { LicenseApplicationRow } from "@/lib/supabase/types";

function mapLicenseApplication(row: LicenseApplicationRow): LicenseApplication {
  const payload = (row.payload ?? {}) as LicenseApplication;

  return normalizeLicenseApplication({
    ...payload,
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    status: row.status as LicenseApplicationStatus,
    applicationProgram: (row.application_program ||
      payload.applicationProgram ||
      "jt1_member") as LicenseApplication["applicationProgram"],
    restrictionCode: (row.restriction_code ||
      payload.restrictionCode ||
      "JT1") as LicenseApplication["restrictionCode"],
    fullName: row.full_name || payload.fullName || "",
    idNumber: row.id_number || payload.idNumber || "",
    submittedAt: row.submitted_at || payload.submittedAt,
    reviewedAt: row.reviewed_at ?? payload.reviewedAt ?? null,
    fighterSlug: payload.fighterSlug,
  });
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
    .select("*")
    .eq("status", "approved")
    .or("application_program.eq.fighter_license,restriction_code.eq.JT11")
    .order("reviewed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map(mapLicenseApplication)
    .filter((application) => isFighterLicenseApplication(application) && application.status === "approved");
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
  const fighters = await getLicensedEnrichedFightersServer();
  return fighters.find((fighter) => fighter.slug === slug) ?? null;
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
