import type { AdminMemberRecord, AdminProDisplayStatus } from "@/lib/admin/member-directory";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";
import { resolveProTimer } from "@/lib/pro/timer";

export type MembershipFilter = "all" | "pro" | "free" | "expired" | "pending" | "expiring";
export type AccountFilter = "all" | "fan" | "staff" | "admin";
export type CredentialsFilter = "all" | "licensed" | "none" | "pending";
export type RoleFilter = "all" | UserTypeTagId | "admin_role";
export type JoinedFilter = "all" | "today" | "7d" | "30d";
export type QuickView = "all" | "pro" | "staff" | "leadership" | "licensed" | "pending";
export type MemberSort =
  | "joined_desc"
  | "joined_asc"
  | "name_asc"
  | "name_desc"
  | "pro_first"
  | "expiring";

export type MemberDirectoryFilters = {
  membership: MembershipFilter;
  account: AccountFilter;
  credentials: CredentialsFilter;
  role: RoleFilter;
  joined: JoinedFilter;
};

export const defaultMemberFilters: MemberDirectoryFilters = {
  membership: "all",
  account: "all",
  credentials: "all",
  role: "all",
  joined: "all",
};

const STAFF_TAGS = new Set<UserTypeTagId>(["staff", "admin", "grand_council_member"]);
const LEADERSHIP_TAGS = new Set<UserTypeTagId>(["admin", "grand_council_member", "staff"]);
const CREDENTIAL_TAGS = new Set<UserTypeTagId>([
  "fighter",
  "coach",
  "grandmaster",
  "referee",
  "judge",
  "adviser",
  "gym_owner",
  "regular_member",
]);

export function memberDisplayName(member: AdminMemberRecord) {
  const parts = [member.firstName, member.lastName].filter((part) => part && part !== "—");
  return parts.join(" ") || member.fullName || member.email;
}

export function isStaffAccount(member: AdminMemberRecord) {
  return member.role === "admin" || member.tags.some((tag) => STAFF_TAGS.has(tag));
}

export function isLicensed(member: AdminMemberRecord) {
  return member.licenseStatus === "Approved" || member.tags.some((tag) => CREDENTIAL_TAGS.has(tag));
}

export function isPendingCredential(member: AdminMemberRecord) {
  const status = (member.licenseStatus ?? "").toLowerCase();
  return status.includes("pending") || status.includes("more info") || status.includes("needs");
}

export function isLeadership(member: AdminMemberRecord) {
  return member.role === "admin" || member.tags.some((tag) => LEADERSHIP_TAGS.has(tag));
}

export function orgRoleTags(member: AdminMemberRecord): UserTypeTagId[] {
  return member.tags.filter((tag) => tag !== "admin");
}

export function credentialLabels(member: AdminMemberRecord): string[] {
  const fromTags = member.tags
    .filter((tag) => CREDENTIAL_TAGS.has(tag))
    .map((tag) => userTypeTags[tag].label);
  if (fromTags.length > 0) return fromTags;
  if (member.licenseStatus === "Approved") return ["Licensed"];
  return [];
}

export function membershipBucket(member: AdminMemberRecord): MembershipFilter {
  if (member.proEntitled && member.proStatus === "active") return "pro";
  if (member.proStatus === "expired") return "expired";
  if (member.proStatus === "pending") return "pending";
  if (member.proEntitled) return "pro";
  return "free";
}

export function computeMemberStats(members: AdminMemberRecord[]) {
  const now = new Date();
  let pro = 0;
  let staff = 0;
  let licensed = 0;
  let pending = 0;
  let leadership = 0;
  let expiring = 0;
  let fans = 0;

  for (const member of members) {
    if (member.proEntitled) pro += 1;
    if (isStaffAccount(member)) staff += 1;
    else fans += 1;
    if (isLicensed(member)) licensed += 1;
    if (isPendingCredential(member)) pending += 1;
    if (isLeadership(member)) leadership += 1;
    if (member.proEntitled && member.proExpiresAt) {
      if (resolveProTimer(member.proExpiresAt, now).inReminderWindow) expiring += 1;
    }
  }

  return {
    total: members.length,
    pro,
    staff,
    fans,
    licensed,
    pending,
    leadership,
    expiring,
  };
}

function matchesJoined(createdAt: string, filter: JoinedFilter, now: Date) {
  if (filter === "all") return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (filter === "today") {
    return created >= start;
  }
  const days = filter === "7d" ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return created >= cutoff;
}

export function filterMembers(
  members: AdminMemberRecord[],
  input: {
    search: string;
    filters: MemberDirectoryFilters;
    quickView: QuickView;
  },
) {
  const query = input.search.trim().toLowerCase();
  const now = new Date();

  return members.filter((member) => {
    if (input.quickView === "pro" && !member.proEntitled) return false;
    if (input.quickView === "staff" && !isStaffAccount(member)) return false;
    if (input.quickView === "leadership" && !isLeadership(member)) return false;
    if (input.quickView === "licensed" && !isLicensed(member)) return false;
    if (input.quickView === "pending" && !isPendingCredential(member)) return false;

    const { membership, account, credentials, role, joined } = input.filters;

    if (membership === "pro" && !(member.proEntitled && member.proStatus === "active")) return false;
    if (membership === "free" && member.proEntitled) return false;
    if (membership === "expired" && member.proStatus !== "expired") return false;
    if (membership === "pending" && member.proStatus !== "pending") return false;
    if (membership === "expiring") {
      if (!member.proEntitled || !member.proExpiresAt) return false;
      if (!resolveProTimer(member.proExpiresAt, now).inReminderWindow) return false;
    }

    if (account === "admin" && member.role !== "admin") return false;
    if (account === "staff" && !isStaffAccount(member)) return false;
    if (account === "fan" && isStaffAccount(member)) return false;

    if (credentials === "licensed" && !isLicensed(member)) return false;
    if (credentials === "none" && (isLicensed(member) || isPendingCredential(member))) return false;
    if (credentials === "pending" && !isPendingCredential(member)) return false;

    if (role === "admin_role" && member.role !== "admin") return false;
    if (role !== "all" && role !== "admin_role" && !member.tags.includes(role)) return false;

    if (!matchesJoined(member.createdAt, joined, now)) return false;

    if (!query) return true;

    const haystack = [
      member.firstName,
      member.lastName,
      member.fullName,
      member.username,
      member.email,
      member.city,
      member.gym,
      member.proMembershipId ?? "",
      member.accountTypeLabel,
      member.licenseStatus ?? "",
      member.tags.map((tag) => userTypeTags[tag].label).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function sortMembers(members: AdminMemberRecord[], sort: MemberSort) {
  const list = [...members];
  const now = new Date();

  list.sort((a, b) => {
    switch (sort) {
      case "name_asc":
        return memberDisplayName(a).localeCompare(memberDisplayName(b));
      case "name_desc":
        return memberDisplayName(b).localeCompare(memberDisplayName(a));
      case "joined_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "pro_first":
        if (a.proEntitled !== b.proEntitled) return a.proEntitled ? -1 : 1;
        return memberDisplayName(a).localeCompare(memberDisplayName(b));
      case "expiring": {
        const aMs = a.proExpiresAt ? new Date(a.proExpiresAt).getTime() - now.getTime() : Number.POSITIVE_INFINITY;
        const bMs = b.proExpiresAt ? new Date(b.proExpiresAt).getTime() - now.getTime() : Number.POSITIVE_INFINITY;
        return aMs - bMs;
      }
      case "joined_desc":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return list;
}

export function activeFilterChips(filters: MemberDirectoryFilters): Array<{ key: keyof MemberDirectoryFilters; label: string }> {
  const chips: Array<{ key: keyof MemberDirectoryFilters; label: string }> = [];
  if (filters.membership !== "all") {
    const labels: Record<Exclude<MembershipFilter, "all">, string> = {
      pro: "Pro",
      free: "Free",
      expired: "Expired Pro",
      pending: "Pending Pro",
      expiring: "Expiring Pro",
    };
    chips.push({ key: "membership", label: `Membership: ${labels[filters.membership]}` });
  }
  if (filters.account !== "all") {
    chips.push({ key: "account", label: `Account: ${filters.account}` });
  }
  if (filters.credentials !== "all") {
    const labels: Record<Exclude<CredentialsFilter, "all">, string> = {
      licensed: "Licensed",
      none: "No credentials",
      pending: "Pending credentials",
    };
    chips.push({ key: "credentials", label: `Credentials: ${labels[filters.credentials]}` });
  }
  if (filters.role !== "all") {
    const label =
      filters.role === "admin_role" ? "Admin" : userTypeTags[filters.role as UserTypeTagId]?.label ?? filters.role;
    chips.push({ key: "role", label: `Role: ${label}` });
  }
  if (filters.joined !== "all") {
    const labels: Record<Exclude<JoinedFilter, "all">, string> = {
      today: "Joined today",
      "7d": "Joined last 7 days",
      "30d": "Joined last 30 days",
    };
    chips.push({ key: "joined", label: labels[filters.joined] });
  }
  return chips;
}

export function proStatusCaption(status: AdminProDisplayStatus, entitled: boolean) {
  if (entitled && status === "active") return "Active";
  if (entitled && status === "cancelled") return "Until expiry";
  if (status === "pending") return "Pending";
  if (status === "expired") return "Expired";
  if (status === "past_due") return "Past due";
  if (status === "cancelled") return "Cancelled";
  return "Free";
}
