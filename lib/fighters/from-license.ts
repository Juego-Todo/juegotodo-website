import {
  formatFighterRecord,
  getLicenseFightTeam,
  isFighterLicenseApplication,
  type LicenseApplication,
} from "@/data/license-applications";
import { parseRecord } from "@/data/fighter-details";
import { getEnrichedFighter, type EnrichedFighterProfile } from "@/lib/fighters/profile";
import { buildFighterInitials, buildFighterSlugFromLicense } from "@/lib/fighters/slug";

function resolvePublicRecord(application: LicenseApplication) {
  const answers = application.backgroundAnswers ?? {};
  const candidates = [
    answers.professionalRecord,
    answers.amateurRecord,
    answers.fightRecord,
  ]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);

  for (const candidate of candidates) {
    if (/^\d+\s*-\s*\d+/.test(candidate)) {
      return candidate.replace(/\s+/g, "");
    }
  }

  return formatFighterRecord(answers) || "0-0";
}

/** Build a public LATAYANOLOGY profile from an approved fighter license. */
export function buildFighterFromLicense(application: LicenseApplication): EnrichedFighterProfile | null {
  if (!isFighterLicenseApplication(application) || application.status !== "approved") {
    return null;
  }

  const answers = application.backgroundAnswers ?? {};
  const slug = buildFighterSlugFromLicense(application);
  const name = application.fullName.trim() || `${application.firstName} ${application.lastName}`.trim();
  const nickname = answers.nickname?.trim() || "JT Fighter";
  const division = answers.weightDivision?.trim() || answers.weightClass?.trim() || "Open";
  const gym =
    answers.gym?.trim() ||
    getLicenseFightTeam(application) ||
    answers.affiliatedGym?.trim() ||
    "Independent";
  const record = resolvePublicRecord(application);
  const recordMatch = record.match(/(\d+)\s*-\s*(\d+)/);
  const parsed = parseRecord(recordMatch ? `${recordMatch[1]}-${recordMatch[2]}` : "0-0");
  const style = answers.primaryDiscipline?.trim() || answers.stance?.trim() || "Juego Todo";
  const country = application.nationality?.trim() || "Philippines";
  const region = application.addressCity?.trim() || application.addressProvince?.trim() || country;
  const highlight =
    answers.notableAchievements?.trim() ||
    `${name} is a licensed JTGC ${division} fighter representing ${gym}.`;

  const fromStatic = getEnrichedFighter(slug);

  return {
    slug,
    name: fromStatic?.name || name,
    nickname: fromStatic?.nickname || nickname,
    style: fromStatic?.style || style,
    gym: fromStatic?.gym || gym,
    record: fromStatic?.record || record,
    rank: fromStatic?.rank || "NR",
    division: fromStatic?.division || division,
    highlight: fromStatic?.highlight || highlight,
    initials: fromStatic?.initials || buildFighterInitials(name),
    nationality: fromStatic?.nationality || country,
    team: fromStatic?.team || gym,
    teamShort: fromStatic?.teamShort || gym,
    lastFight: fromStatic?.lastFight || "Licensed JTGC fighter",
    winStreak: fromStatic?.winStreak ?? 0,
    wins: fromStatic?.wins ?? parsed.wins,
    losses: fromStatic?.losses ?? parsed.losses,
    country: fromStatic?.country || country,
    region: fromStatic?.region || region,
    rankNumber: fromStatic?.rankNumber ?? 99,
    recentResults: fromStatic?.recentResults ?? [],
    statistics: fromStatic?.statistics,
    fightHistory: fromStatic?.fightHistory ?? [],
    teamSlug: fromStatic?.teamSlug,
    imageSrc: fromStatic?.imageSrc || application.uploads?.profilePhoto || undefined,
    imageAlt: fromStatic?.imageAlt || `${name} licensed Juego Todo fighter`,
  };
}

export function ensureApprovedFighterSlug(application: LicenseApplication): LicenseApplication {
  if (!isFighterLicenseApplication(application)) {
    return application;
  }

  const fighterSlug = buildFighterSlugFromLicense(application);
  if (application.fighterSlug === fighterSlug) {
    return application;
  }

  return {
    ...application,
    fighterSlug,
  };
}
