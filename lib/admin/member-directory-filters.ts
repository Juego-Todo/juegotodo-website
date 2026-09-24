import type { AdminMemberRecord, AdminProDisplayStatus } from "@/lib/admin/member-directory";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";
import { isPlatformOwnerEmail } from "@/lib/auth/platform-owners";
import { memberCredentialTags, memberOrganizationalRoleTags } from "@/lib/admin/member-badges";
import { hasUnlimitedPlan, resolveMemberPlanKind } from "@/lib/pro/plan";
import { resolveProTimer } from "@/lib/pro/timer";

export type MembershipFilter =
  | "all"
  | "unlimited"
  | "pro"
  | "free"
  | "expired"
  | "pending"
  | "expiring";
export type AccountFilter = "all" | "fan" | "staff" | "admin";
export type CredentialsFilter = "all" | "licensed" | "none" | "pending";
export type RoleFilter = "all" | UserTypeTagId | "admin_role";
export type JoinedFilter = "all" | "today" | "7d" | "30d" | "90d";
export type QuickView = "all" | "team" | "fans" | "pro" | "unlimited" | "licensed";
export type MemberSortColumn =
  | "firstName"
  | "lastName"
  | "username"
  | "name"
  | "account"
  | "plan"
  | "credentials"
  | "roles"
  | "joined"
  | "expiry";
export type MemberSortDirection = "asc" | "desc";

export type MemberSort = {
  column: MemberSortColumn;
  direction: MemberSortDirection;
};

export type MemberSortPreset =
  | "joined_desc"
  | "joined_asc"
  | "name_asc"
  | "name_desc"
  | "expiry"
  | "credentials";

export const MEMBER_SORT_PRESETS: Array<{ id: MemberSortPreset; label: string; sort: MemberSort }> = [
  { id: "joined_desc", label: "Recently joined", sort: { column: "joined", direction: "desc" } },
  { id: "joined_asc", label: "Oldest joined", sort: { column: "joined", direction: "asc" } },
  { id: "name_asc", label: "First name A–Z", sort: { column: "firstName", direction: "asc" } },
  { id: "name_desc", label: "First name Z–A", sort: { column: "firstName", direction: "desc" } },
  { id: "expiry", label: "Membership expiry", sort: { column: "expiry", direction: "asc" } },
  { id: "credentials", label: "Credential status", sort: { column: "credentials", direction: "asc" } },
];

export function resolveMemberSortPreset(sort: MemberSort): MemberSortPreset {
  const match = MEMBER_SORT_PRESETS.find(
    (preset) => preset.sort.column === sort.column && preset.sort.direction === sort.direction,
  );
  return match?.id ?? "joined_desc";
}

export const defaultMemberSort: MemberSort = {
  column: "joined",
  direction: "desc",
};

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

export function memberHasUnlimitedPlan(member: AdminMemberRecord) {
  return hasUnlimitedPlan({
    email: member.email,
    role: member.role,
    tags: member.tags,
  });
}

export function memberPlanKind(member: AdminMemberRecord) {
  return resolveMemberPlanKind({
    unlimited: memberHasUnlimitedPlan(member),
    proEntitled: member.proEntitled,
    proStatus: member.proStatus,
  });
}

export function isStaffAccount(member: AdminMemberRecord) {
  return member.role === "admin" || member.tags.some((tag) => STAFF_TAGS.has(tag));
}

/** Owner, Admin, Staff, and Grand Council — the internal Team. */
export function isTeamMember(member: AdminMemberRecord) {
  if (isPlatformOwnerEmail(member.email)) return true;
  if (member.role === "admin") return true;
  return member.tags.some(
    (tag) => tag === "staff" || tag === "admin" || tag === "grand_council_member",
  );
}

export function isFanAccount(member: AdminMemberRecord) {
  return !isTeamMember(member);
}

export function isLicensed(member: AdminMemberRecord) {
  return member.licenseStatus === "Approved" || member.tags.some((tag) => CREDENTIAL_TAGS.has(tag));
}

export function isPendingCredential(member: AdminMemberRecord) {
  const status = (member.licenseStatus ?? "").toLowerCase();
  return status.includes("pending") || status.includes("more info") || status.includes("needs");
}

export function isLeadership(member: AdminMemberRecord) {
  return isTeamMember(member);
}

export function orgRoleTags(member: AdminMemberRecord): UserTypeTagId[] {
  return memberOrganizationalRoleTags(member);
}

export function credentialLabels(member: AdminMemberRecord): string[] {
  const fromTags = memberCredentialTags(member).map((tag) => userTypeTags[tag].label);
  if (fromTags.length > 0) return fromTags;
  if (member.licenseStatus === "Approved") return ["Licensed"];
  return [];
}

export function membershipBucket(member: AdminMemberRecord): MembershipFilter {
  if (memberHasUnlimitedPlan(member)) return "unlimited";
  if (member.proEntitled && member.proStatus === "active") return "pro";
  if (member.proStatus === "expired") return "expired";
  if (member.proStatus === "pending") return "pending";
  if (member.proEntitled) return "pro";
  return "free";
}

export function computeMemberStats(members: AdminMemberRecord[]) {
  const now = new Date();
  let pro = 0;
  let unlimited = 0;
  let team = 0;
  let licensed = 0;
  let pending = 0;
  let expiring = 0;
  let fans = 0;

  for (const member of members) {
    if (memberHasUnlimitedPlan(member)) unlimited += 1;
    else if (member.proEntitled) pro += 1;
    if (isTeamMember(member)) team += 1;
    else fans += 1;
    if (isLicensed(member)) licensed += 1;
    if (isPendingCredential(member)) pending += 1;
    if (!memberHasUnlimitedPlan(member) && member.proEntitled && member.proExpiresAt) {
      if (resolveProTimer(member.proExpiresAt, now).inReminderWindow) expiring += 1;
    }
  }

  return {
    total: members.length,
    pro,
    unlimited,
    team,
    /** @deprecated alias for team — kept for older call sites */
    staff: team,
    fans,
    licensed,
    pending,
    leadership: team,
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
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
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
    if (input.quickView === "pro" && !(member.proEntitled && !memberHasUnlimitedPlan(member))) return false;
    if (input.quickView === "unlimited" && !memberHasUnlimitedPlan(member)) return false;
    if (input.quickView === "team" && !isTeamMember(member)) return false;
    if (input.quickView === "fans" && !isFanAccount(member)) return false;
    if (input.quickView === "licensed" && !isLicensed(member)) return false;

    const { membership, account, credentials, role, joined } = input.filters;

    if (membership === "unlimited" && !memberHasUnlimitedPlan(member)) return false;
    if (membership === "pro") {
      if (memberHasUnlimitedPlan(member) || !(member.proEntitled && member.proStatus === "active")) {
        return false;
      }
    }
    if (membership === "free") {
      if (member.proEntitled || memberHasUnlimitedPlan(member)) return false;
    }
    if (membership === "expired" && (memberHasUnlimitedPlan(member) || member.proStatus !== "expired")) {
      return false;
    }
    if (membership === "pending" && (memberHasUnlimitedPlan(member) || member.proStatus !== "pending")) {
      return false;
    }
    if (membership === "expiring") {
      if (memberHasUnlimitedPlan(member) || !member.proEntitled || !member.proExpiresAt) return false;
      if (!resolveProTimer(member.proExpiresAt, now).inReminderWindow) return false;
    }

    if (account === "admin" && member.role !== "admin") return false;
    if (account === "staff" && !isTeamMember(member)) return false;
    if (account === "fan" && !isFanAccount(member)) return false;

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

function planSortRank(member: AdminMemberRecord) {
  const kind = memberPlanKind(member);
  switch (kind) {
    case "unlimited":
      return 0;
    case "pro":
      return 1;
    case "pending":
      return 2;
    case "cancelled":
      return 3;
    case "expired":
      return 4;
    case "free":
    default:
      return 5;
  }
}

function accountSortKey(member: AdminMemberRecord) {
  const teamRank = isTeamMember(member) ? 0 : 1;
  const roleRank = member.role === "admin" ? 0 : 1;
  return `${teamRank}:${roleRank}:${memberDisplayName(member)}`;
}

function credentialsSortKey(member: AdminMemberRecord) {
  const labels = credentialLabels(member);
  if (labels.length > 0) return `0:${labels.join(",")}`;
  if (isPendingCredential(member)) return `1:pending`;
  return `2:none`;
}

function rolesSortKey(member: AdminMemberRecord) {
  const roles = orgRoleTags(member)
    .map((tag) => userTypeTags[tag]?.label ?? tag)
    .join(",");
  const admin = member.role === "admin" || member.tags.includes("admin") ? "admin" : "";
  return `${admin}:${roles}` || "zzz";
}

function namePart(value: string) {
  return value === "—" || !value.trim() ? "" : value.trim().toLowerCase();
}

export function toggleMemberSort(current: MemberSort, column: MemberSortColumn): MemberSort {
  if (current.column === column) {
    return {
      column,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return {
    column,
    direction: column === "joined" || column === "plan" || column === "expiry" ? "desc" : "asc",
  };
}

export function sortMembers(members: AdminMemberRecord[], sort: MemberSort) {
  const list = [...members];
  const direction = sort.direction === "asc" ? 1 : -1;

  list.sort((a, b) => {
    let cmp = 0;
    switch (sort.column) {
      case "firstName":
        cmp = namePart(a.firstName).localeCompare(namePart(b.firstName));
        if (cmp === 0) cmp = namePart(a.lastName).localeCompare(namePart(b.lastName));
        break;
      case "lastName":
        cmp = namePart(a.lastName).localeCompare(namePart(b.lastName));
        if (cmp === 0) cmp = namePart(a.firstName).localeCompare(namePart(b.firstName));
        break;
      case "username":
        cmp = namePart(a.username).localeCompare(namePart(b.username));
        break;
      case "name":
        cmp = memberDisplayName(a).localeCompare(memberDisplayName(b));
        break;
      case "account":
        cmp = accountSortKey(a).localeCompare(accountSortKey(b));
        break;
      case "plan":
        cmp = planSortRank(a) - planSortRank(b);
        if (cmp === 0) {
          const aExpiry = a.proExpiresAt ? new Date(a.proExpiresAt).getTime() : Number.POSITIVE_INFINITY;
          const bExpiry = b.proExpiresAt ? new Date(b.proExpiresAt).getTime() : Number.POSITIVE_INFINITY;
          cmp = aExpiry - bExpiry;
        }
        break;
      case "expiry": {
        const aMs = a.proExpiresAt ? new Date(a.proExpiresAt).getTime() : Number.POSITIVE_INFINITY;
        const bMs = b.proExpiresAt ? new Date(b.proExpiresAt).getTime() : Number.POSITIVE_INFINITY;
        cmp = aMs - bMs;
        break;
      }
      case "credentials":
        cmp = credentialsSortKey(a).localeCompare(credentialsSortKey(b));
        break;
      case "roles":
        cmp = rolesSortKey(a).localeCompare(rolesSortKey(b));
        break;
      case "joined":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0) {
      cmp = memberDisplayName(a).localeCompare(memberDisplayName(b));
    }
    return cmp * direction;
  });

  return list;
}

export function activeFilterChips(filters: MemberDirectoryFilters): Array<{ key: keyof MemberDirectoryFilters; label: string }> {
  const chips: Array<{ key: keyof MemberDirectoryFilters; label: string }> = [];
  if (filters.membership !== "all") {
    const labels: Record<Exclude<MembershipFilter, "all">, string> = {
      unlimited: "Unlimited",
      pro: "Pro",
      free: "Free",
      expired: "Expired Pro",
      pending: "Pending Pro",
      expiring: "Expiring Pro",
    };
    chips.push({ key: "membership", label: `Plan: ${labels[filters.membership]}` });
  }
  if (filters.account !== "all") {
    const labels: Record<Exclude<AccountFilter, "all">, string> = {
      fan: "Fan",
      staff: "Team",
      admin: "Admin",
    };
    chips.push({ key: "account", label: `Account: ${labels[filters.account]}` });
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
      "90d": "Joined last 90 days",
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

export function planCaption(member: AdminMemberRecord) {
  const kind = memberPlanKind(member);
  if (kind === "unlimited") return "Unlimited";
  if (kind === "pro") return "Pro · Active";
  if (kind === "cancelled") return "Pro · Until expiry";
  if (kind === "pending") return "Pro · Pending";
  if (kind === "expired") return "Pro · Expired";
  return "Free";
}
