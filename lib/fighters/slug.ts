import type { LicenseApplication } from "@/data/license-applications";

export function slugifyFighterName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Preferred public slug base from a license (before uniqueness suffix). */
export function buildFighterSlugFromLicense(application: Pick<LicenseApplication, "fullName" | "firstName" | "lastName" | "id" | "fighterSlug" | "backgroundAnswers" | "userId">) {
  if (application.fighterSlug?.trim()) {
    return slugifyFighterName(application.fighterSlug);
  }

  const nickname = application.backgroundAnswers?.nickname?.trim();
  const first = application.firstName?.trim() || application.fullName.split(/\s+/)[0] || "";
  const last = application.lastName?.trim() || application.fullName.split(/\s+/).slice(-1)[0] || "";
  const base = nickname
    ? slugifyFighterName(`${first}-${nickname}-${last}`)
    : slugifyFighterName(application.fullName || `${first}-${last}`);

  if (base) {
    return base;
  }

  const fallbackId = application.userId?.slice(0, 8) || application.id.slice(0, 8);
  return `fighter-${fallbackId}`;
}

/** Name-derived base only — ignores an existing fighterSlug so collisions can be re-suffixed. */
export function buildBaseFighterSlugFromLicense(
  application: Pick<LicenseApplication, "fullName" | "firstName" | "lastName" | "id" | "backgroundAnswers" | "userId">,
) {
  return buildFighterSlugFromLicense({ ...application, fighterSlug: undefined });
}

export function buildFighterInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "JT";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
