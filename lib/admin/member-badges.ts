import type { AdminMemberRecord } from "@/lib/admin/member-directory";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";

/** Tags that represent licensed credentials, not table Roles. */
export const CREDENTIAL_TAG_IDS = new Set<UserTypeTagId>([
  "fighter",
  "coach",
  "grandmaster",
  "referee",
  "judge",
  "adviser",
  "gym_owner",
  "regular_member",
]);

const STAFF_ACCOUNT_TAGS = new Set<UserTypeTagId>(["staff", "admin", "grand_council_member"]);

/** Tags that only reinforce Account / System Access — omit from Roles when redundant. */
const ACCOUNT_REDUNDANT_TAGS = new Set<UserTypeTagId>(["staff", "admin", "regular_member"]);

/** Display priority for organizational roles (lower index = higher priority). */
const ROLE_DISPLAY_PRIORITY: UserTypeTagId[] = [
  "grand_council_member",
  "gym_owner",
  "media",
  "grandmaster",
  "coach",
  "fighter",
  "referee",
  "judge",
  "adviser",
  "staff",
  "admin",
  "regular_member",
];

export type MemberAccountKind = "fan" | "staff";
export type MemberSystemAccess = "user" | "admin";

export type MemberBadgeVariant = "account" | "permission" | "role" | "credential" | "leadership" | "status";

export type MemberDisplayBadge = {
  id: string;
  label: string;
  fullLabel: string;
  variant: MemberBadgeVariant;
};

const COMPACT_ROLE_LABELS: Partial<Record<UserTypeTagId, string>> = {
  grand_council_member: "Grand Council",
  gym_owner: "Club Owner",
  grandmaster: "Grandmaster",
  regular_member: "Member",
  media: "Media",
  coach: "Coach",
  fighter: "Fighter",
  referee: "Referee",
  judge: "Judge",
  adviser: "Adviser",
  staff: "Staff",
  admin: "Admin",
};

const COMPACT_CREDENTIAL_LABELS: Partial<Record<UserTypeTagId, string>> = {
  fighter: "Fighter",
  coach: "Coach",
  grandmaster: "Grandmaster",
  referee: "Referee",
  judge: "Judge",
  adviser: "Adviser",
  gym_owner: "Club Owner",
  regular_member: "Member",
};

export function memberAccountKind(member: AdminMemberRecord): MemberAccountKind {
  const isStaff =
    member.role === "admin" || member.tags.some((tag) => STAFF_ACCOUNT_TAGS.has(tag));
  return isStaff ? "staff" : "fan";
}

export function memberSystemAccess(member: AdminMemberRecord): MemberSystemAccess {
  return member.role === "admin" ? "admin" : "user";
}

function sortByRolePriority(tags: UserTypeTagId[]) {
  return [...tags].sort((a, b) => {
    const ai = ROLE_DISPLAY_PRIORITY.indexOf(a);
    const bi = ROLE_DISPLAY_PRIORITY.indexOf(b);
    const aRank = ai === -1 ? ROLE_DISPLAY_PRIORITY.length : ai;
    const bRank = bi === -1 ? ROLE_DISPLAY_PRIORITY.length : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });
}

/**
 * Organizational / authority roles for the Roles column.
 * Excludes credentials and account/system duplicates (Staff, Admin tag, Regular Member).
 */
export function memberOrganizationalRoleTags(member: AdminMemberRecord): UserTypeTagId[] {
  const tags = member.tags.filter((tag) => {
    if (CREDENTIAL_TAG_IDS.has(tag)) return false;
    if (ACCOUNT_REDUNDANT_TAGS.has(tag)) return false;
    return true;
  });
  return sortByRolePriority(tags);
}

export function memberCredentialTags(member: AdminMemberRecord): UserTypeTagId[] {
  const tags = member.tags.filter((tag) => CREDENTIAL_TAG_IDS.has(tag) && tag !== "regular_member");
  return sortByRolePriority(tags);
}

export function resolveAccountBadge(member: AdminMemberRecord): MemberDisplayBadge {
  const kind = memberAccountKind(member);
  return {
    id: `account-${kind}`,
    label: kind === "staff" ? "Staff" : "Fan",
    fullLabel: kind === "staff" ? "Staff account" : "Fan account",
    variant: "account",
  };
}

export function resolveSystemAccessBadge(member: AdminMemberRecord): MemberDisplayBadge {
  const access = memberSystemAccess(member);
  return {
    id: `access-${access}`,
    label: access === "admin" ? "Admin" : "User",
    fullLabel: access === "admin" ? "Admin system access" : "User system access",
    variant: access === "admin" ? "permission" : "account",
  };
}

export function resolveRoleBadges(member: AdminMemberRecord): MemberDisplayBadge[] {
  const badges: MemberDisplayBadge[] = [];

  if (memberSystemAccess(member) === "admin") {
    badges.push({
      id: "permission-admin",
      label: "Admin",
      fullLabel: "Admin",
      variant: "permission",
    });
  }

  for (const tagId of memberOrganizationalRoleTags(member)) {
    const full = userTypeTags[tagId]?.label ?? tagId;
    const compact = COMPACT_ROLE_LABELS[tagId] ?? full;
    badges.push({
      id: `role-${tagId}`,
      label: compact,
      fullLabel: full,
      variant: tagId === "grand_council_member" ? "leadership" : "role",
    });
  }

  return badges;
}

export function resolveCredentialBadges(member: AdminMemberRecord): MemberDisplayBadge[] {
  const tags = memberCredentialTags(member);
  if (tags.length > 0) {
    return tags.map((tagId) => {
      const full = userTypeTags[tagId]?.label ?? tagId;
      return {
        id: `credential-${tagId}`,
        label: COMPACT_CREDENTIAL_LABELS[tagId] ?? full,
        fullLabel: `${full} License`,
        variant: "credential" as const,
      };
    });
  }

  if (member.licenseStatus === "Approved") {
    return [
      {
        id: "credential-licensed",
        label: "Licensed",
        fullLabel: "Licensed",
        variant: "credential",
      },
    ];
  }

  return [];
}

export function compactBadgeList<T>(items: T[], limit = 2): { visible: T[]; hidden: T[]; hiddenCount: number } {
  if (items.length <= limit) {
    return { visible: items, hidden: [], hiddenCount: 0 };
  }
  const visible = items.slice(0, limit);
  const hidden = items.slice(limit);
  return { visible, hidden, hiddenCount: hidden.length };
}
