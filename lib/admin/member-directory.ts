import { licenseApplicationStatusLabels, type LicenseApplication } from "@/data/license-applications";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";
import { adminFetch } from "@/lib/auth/admin-fetch";
import {
  adminDeleteStoredUser,
  adminResetStoredUserPassword,
  adminUpdateStoredUser,
  getAllStoredUsers,
  provisionLeadershipStaffAccounts,
} from "@/lib/auth/storage";
import {
  accountTypeLabels,
  type AccountType,
  type AdminUserUpdateInput,
  type UserProfile,
  type UserRole,
} from "@/lib/auth/types";
import {
  deleteUserCommerceData,
  getUserCommerceData,
  saveUserCommerceData,
} from "@/lib/commerce/storage";
import type { Order, UserCommerceData } from "@/lib/commerce/types";
import { deleteLicenseApplicationsByUserId, fetchLicenseApplicationByUserId } from "@/lib/licenses/storage";
import { resolveProAccessState, type ProAccessRecord } from "@/lib/pro/access";
import { clearAdminAssignedTags, getAdminAssignedTags } from "@/lib/profile/account-tags";

export type AdminProDisplayStatus =
  | "none"
  | "inactive"
  | "active"
  | "expired"
  | "cancelled"
  | "past_due"
  | "pending";

export type AdminMemberRecord = {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  nationality: string;
  civilStatus: string;
  accountType: AccountType;
  accountTypeLabel: string;
  role: UserRole;
  city: string;
  gym: string;
  country: string;
  membershipTier: string;
  bio: string;
  memberSince: string;
  orders: number;
  lifetimeSpent: number;
  tags: UserTypeTagId[];
  licenseStatus: string | null;
  fullName: string;
  createdAt: string;
  /** JuegoTodo Pro entitlement (separate from shop membership_tier). */
  proStatus: AdminProDisplayStatus;
  proEntitled: boolean;
  proMembershipId: string | null;
  proExpiresAt: string | null;
  proPaymentStatus: string | null;
};

export type AdminProMembershipSummary = {
  userId: string;
  status: string;
  expiresAt: string | null;
  membershipId: string | null;
  paymentStatus: string | null;
  entitled: boolean;
  displayStatus: AdminProDisplayStatus;
};

const DIRECTORY_TAG_PRIORITY: UserTypeTagId[] = [
  "fighter",
  "coach",
  "grandmaster",
  "gym_owner",
  "media",
  "referee",
  "judge",
  "adviser",
  "staff",
  "grand_council_member",
  "admin",
];

function resolveDirectoryAccountLabel(accountType: AccountType, tags: UserTypeTagId[]) {
  const primaryTag = DIRECTORY_TAG_PRIORITY.find((tagId) => tags.includes(tagId));
  if (primaryTag) {
    return userTypeTags[primaryTag].label;
  }
  return accountTypeLabels[accountType];
}

function splitFullName(fullName: string) {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "—" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim() || "—",
  };
}

function formatDate(value: string) {
  if (!value.trim()) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayValue(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function buildAdminMemberRecord(
  user: UserProfile,
  commerce: UserCommerceData,
  license: LicenseApplication | null,
  orders: Order[],
  pro?: AdminProMembershipSummary | null,
): AdminMemberRecord {
  const userOrders = orders.filter((order) => order.userId === user.id);
  const { firstName: splitFirst, lastName: splitLast } = splitFullName(user.fullName);
  const licenseFirst = license?.firstName?.trim();
  const licenseLast = license?.lastName?.trim();
  const tags = getAdminAssignedTags(user.id, user.assignedTags);

  const proAccess = resolveProAccessState(
    pro
      ? ({
          status: pro.status,
          expires_at: pro.expiresAt,
        } satisfies ProAccessRecord)
      : null,
  );

  return {
    userId: user.id,
    firstName: licenseFirst || splitFirst || "—",
    lastName: licenseLast || splitLast || "—",
    username: displayValue(user.username),
    email: user.email,
    phone: displayValue(commerce.phone || license?.mobileNumber),
    dateOfBirth: formatDate(license?.dateOfBirth ?? user.dateOfBirth ?? ""),
    gender: displayValue(license?.gender || user.gender),
    bloodType: displayValue(license?.bloodType),
    nationality: displayValue(license?.nationality || commerce.country),
    civilStatus: displayValue(license?.civilStatus),
    accountType: user.accountType,
    accountTypeLabel: resolveDirectoryAccountLabel(user.accountType, tags),
    role: user.role,
    city: displayValue(user.city || license?.addressCity),
    gym: displayValue(
      user.gym || license?.backgroundAnswers?.fightTeam || license?.backgroundAnswers?.affiliatedGym,
    ),
    country: displayValue(commerce.country || license?.addressCountry),
    membershipTier: commerce.membershipTier,
    bio: displayValue(user.bio),
    memberSince: formatDate(user.createdAt),
    orders: userOrders.length,
    lifetimeSpent: userOrders.reduce((sum, order) => sum + order.total, 0),
    tags,
    licenseStatus: license ? licenseApplicationStatusLabels[license.status] : null,
    fullName: user.fullName,
    createdAt: user.createdAt,
    proStatus: pro?.displayStatus ?? proAccess.displayStatus,
    proEntitled: pro?.entitled ?? proAccess.entitled,
    proMembershipId: pro?.membershipId ?? null,
    proExpiresAt: pro?.expiresAt ?? null,
    proPaymentStatus: pro?.paymentStatus ?? null,
  };
}

async function fetchProMembershipMap(): Promise<{
  map: Map<string, AdminProMembershipSummary>;
  error: string | null;
}> {
  const map = new Map<string, AdminProMembershipSummary>();

  try {
    const response = await adminFetch("/api/admin/pro");
    if (!response.ok) {
      let message = "Unable to load Pro membership data.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) message = payload.error;
      } catch {
        // keep default message
      }
      if (response.status === 401 || response.status === 403) {
        message = "Unable to load Pro membership data. Admin authentication failed.";
      }
      return { map, error: message };
    }

    const payload = (await response.json()) as {
      memberships?: Array<{
        user_id: string;
        status: string;
        expires_at: string | null;
        membership_id: string | null;
        payment_status: string | null;
        entitled: boolean;
        displayStatus: AdminProDisplayStatus;
      }>;
    };

    for (const row of payload.memberships ?? []) {
      map.set(row.user_id, {
        userId: row.user_id,
        status: row.status,
        expiresAt: row.expires_at,
        membershipId: row.membership_id,
        paymentStatus: row.payment_status,
        entitled: row.entitled,
        displayStatus: row.displayStatus,
      });
    }

    return { map, error: null };
  } catch {
    return { map, error: "Unable to load Pro membership data." };
  }
}

export type FetchAdminMemberRecordsResult = {
  records: AdminMemberRecord[];
  proLoadError: string | null;
};

export async function fetchAdminMemberRecords(orders: Order[]): Promise<FetchAdminMemberRecordsResult> {
  const [users, proResult] = await Promise.all([getAllStoredUsers(), fetchProMembershipMap()]);
  const records = await Promise.all(
    users.map(async (user) => {
      const commerce = await getUserCommerceData(user.id);
      const license = await fetchLicenseApplicationByUserId(user.id);
      return buildAdminMemberRecord(user, commerce, license, orders, proResult.map.get(user.id) ?? null);
    }),
  );

  return {
    records: records.sort((a, b) => a.firstName.localeCompare(b.firstName)),
    proLoadError: proResult.error,
  };
}

export async function adminUpdateMemberProfile(userId: string, input: AdminUserUpdateInput) {
  const profile = await adminUpdateStoredUser(userId, input);

  if (input.phone !== undefined || input.country !== undefined) {
    const commerce = await getUserCommerceData(userId);
    await saveUserCommerceData(userId, {
      ...commerce,
      phone: input.phone?.trim() ?? commerce.phone,
      country: input.country?.trim() || commerce.country,
    });
  }

  return profile;
}

export async function adminResetMemberPassword(userId: string, password: string) {
  await adminResetStoredUserPassword(userId, password);
}

export async function adminDeleteMemberAccount(userId: string) {
  await deleteUserCommerceData(userId);
  deleteLicenseApplicationsByUserId(userId);
  clearAdminAssignedTags(userId);
  await adminDeleteStoredUser(userId);
}

export async function provisionLeadershipStaffMembers() {
  return provisionLeadershipStaffAccounts();
}
