import { demoAthleteProfiles, type AthleteCredentialProfile } from "@/data/profile-credentials";
import {
  profileRoles,
  type ProfileRoleId,
  type VerificationId,
  verificationLabels,
} from "@/data/profile-roles";
import type { UserProfile } from "@/lib/auth/types";
import type { MembershipTier, UserCommerceData } from "@/lib/commerce/types";
import { getEnrichedFighter } from "@/lib/fighters/profile";

export type ProfileIdentity = {
  roles: ProfileRoleId[];
  verifications: VerificationId[];
  memberId: string;
  isFighter: boolean;
  isCoach: boolean;
  isOfficial: boolean;
  athlete?: AthleteCredentialProfile;
  profileCompletion: number;
  recentActivity: { label: string; date: string }[];
};

function slugifyName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function buildMemberId(userId: string) {
  const suffix = userId.replace(/-/g, "").slice(0, 5).toUpperCase();
  return `JTGC-26-${suffix.padEnd(5, "0").slice(0, 5)}`;
}

export function resolveProfileRoles(user: UserProfile): ProfileRoleId[] {
  const roles = new Set<ProfileRoleId>(["fan"]);

  switch (user.accountType) {
    case "athlete":
      roles.add("fighter");
      break;
    case "coach":
      roles.add("coach");
      break;
    case "gym_owner":
      roles.add("gym_owner");
      break;
    case "partner":
      roles.add("sponsor");
      break;
    default:
      break;
  }

  if (user.email.toLowerCase().includes("kiran") || user.fullName.toLowerCase().includes("kiran")) {
    roles.add("fighter");
    roles.add("coach");
    roles.add("grand_council");
  }

  if (user.role === "admin" || user.email.toLowerCase() === "admin@juegotodo.com") {
    roles.add("administrator");
    roles.add("grand_council");
  }

  if (user.gym.toLowerCase().includes("official") || user.accountType === "coach") {
    roles.add("event_official");
  }

  return [...roles];
}

export function resolveVerifications(roles: ProfileRoleId[]): VerificationId[] {
  const verifications: VerificationId[] = [];
  if (roles.includes("fighter")) verifications.push("verified_athlete");
  if (roles.includes("coach")) verifications.push("verified_coach");
  if (roles.includes("referee")) verifications.push("verified_referee");
  if (roles.includes("gym_owner")) verifications.push("verified_gym");
  if (roles.includes("event_official") || roles.includes("judge")) verifications.push("verified_official");
  return verifications;
}

function mergeAthleteProfile(user: UserProfile, base: AthleteCredentialProfile): AthleteCredentialProfile {
  const slug = slugifyName(user.fullName);
  const linked = getEnrichedFighter(slug);

  if (!linked) {
    return {
      ...base,
      team: user.gym || base.team,
      gym: user.gym || base.gym,
      region: user.city || base.region,
    };
  }

  return {
    ...base,
    slug: linked.slug,
    rank: linked.rank.includes("#") ? linked.rank : base.rank,
    division: linked.division || base.division,
    record: linked.record,
    team: linked.team ?? linked.gym ?? user.gym ?? base.team,
    gym: linked.gym ?? user.gym ?? base.gym,
    region: linked.region ?? user.city ?? base.region,
    country: linked.country ?? base.country,
    winStreak: linked.winStreak ?? base.winStreak,
    fightHistory: linked.fightHistory?.length ? linked.fightHistory : base.fightHistory,
    statistics: linked.statistics ?? base.statistics,
  };
}

export function resolveAthleteProfile(user: UserProfile, roles: ProfileRoleId[]): AthleteCredentialProfile | undefined {
  if (!roles.includes("fighter") && user.accountType !== "athlete") {
    return undefined;
  }

  const nameKey = slugifyName(user.fullName);
  const base =
    demoAthleteProfiles[nameKey] ??
    (user.fullName.toLowerCase().includes("kiran") ? demoAthleteProfiles["kiran-aames"] : demoAthleteProfiles.default);

  return mergeAthleteProfile(user, base);
}

export function calculateProfileCompletion(
  user: UserProfile,
  userData: UserCommerceData,
  athlete?: AthleteCredentialProfile,
): number {
  const checks = [
    Boolean(user.fullName.trim()),
    Boolean(user.username?.trim()),
    Boolean(user.email.trim()),
    Boolean(userData.phone.trim()),
    Boolean(user.city.trim()),
    Boolean(user.gym.trim()),
    Boolean(user.bio.trim()),
    Boolean(userData.country.trim()),
    userData.addresses.length > 0,
    Boolean(athlete),
    (athlete?.fightHistory.length ?? 0) > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function buildProfileIdentity(user: UserProfile, userData: UserCommerceData): ProfileIdentity {
  const roles = resolveProfileRoles(user);
  const verifications = resolveVerifications(roles);
  const athlete = resolveAthleteProfile(user, roles);

  return {
    roles,
    verifications,
    memberId: buildMemberId(user.id),
    isFighter: roles.includes("fighter"),
    isCoach: roles.includes("coach"),
    isOfficial: roles.some((role) =>
      ["referee", "judge", "event_official", "grand_council", "administrator"].includes(role),
    ),
    athlete,
    profileCompletion: calculateProfileCompletion(user, userData, athlete),
    recentActivity: [
      { label: "Profile updated", date: "2 days ago" },
      { label: "Uploaded new fight footage", date: "1 week ago" },
      ...(userData.notifications[0]
        ? [{ label: userData.notifications[0].title, date: "Recently" }]
        : [{ label: "Joined JTGC platform", date: new Date(user.createdAt).toLocaleDateString() }]),
    ],
  };
}

export function getRoleMeta(roleId: ProfileRoleId) {
  return profileRoles[roleId];
}

export function getVerificationLabel(id: VerificationId) {
  return verificationLabels[id];
}

export function getJtgcTierLabel(tier: MembershipTier) {
  switch (tier) {
    case "free":
      return "Fan Tier";
    case "pro":
      return "Athlete Tier";
    case "elite":
      return "Professional Tier";
    default:
      return "Fan Tier";
  }
}

export function getPrimaryStatLabel(identity: ProfileIdentity, orderCount: number) {
  if (identity.isFighter && identity.athlete) {
    return { label: "Matches", value: `${identity.athlete.matchCount}` };
  }
  return { label: "Orders", value: `${orderCount}` };
}
