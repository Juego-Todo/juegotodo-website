import { licenseApplicationStatusLabels, type LicenseApplication } from "@/data/license-applications";
import type { UserTypeTagId } from "@/data/user-type-tags";
import {
  adminDeleteStoredUser,
  adminResetStoredUserPassword,
  adminUpdateStoredUser,
  getAllStoredUsers,
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
import { deleteLicenseApplicationsByUserId, getLicenseApplicationByUserId } from "@/lib/licenses/storage";
import { clearAdminAssignedTags, getAdminAssignedTags } from "@/lib/profile/account-tags";

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
};

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
): AdminMemberRecord {
  const userOrders = orders.filter((order) => order.userId === user.id);
  const { firstName: splitFirst, lastName: splitLast } = splitFullName(user.fullName);
  const licenseFirst = license?.firstName?.trim();
  const licenseLast = license?.lastName?.trim();

  return {
    userId: user.id,
    firstName: licenseFirst || splitFirst || "—",
    lastName: licenseLast || splitLast || "—",
    username: displayValue(user.username),
    email: user.email,
    phone: displayValue(commerce.phone || license?.mobileNumber),
    dateOfBirth: formatDate(license?.dateOfBirth ?? ""),
    gender: displayValue(license?.gender),
    bloodType: displayValue(license?.bloodType),
    nationality: displayValue(license?.nationality || commerce.country),
    civilStatus: displayValue(license?.civilStatus),
    accountType: user.accountType,
    accountTypeLabel: accountTypeLabels[user.accountType],
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
    tags: getAdminAssignedTags(user.id),
    licenseStatus: license ? licenseApplicationStatusLabels[license.status] : null,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
}

export async function fetchAdminMemberRecords(orders: Order[]): Promise<AdminMemberRecord[]> {
  const users = await getAllStoredUsers();
  const records = await Promise.all(
    users.map(async (user) => {
      const commerce = await getUserCommerceData(user.id);
      const license = getLicenseApplicationByUserId(user.id);
      return buildAdminMemberRecord(user, commerce, license, orders);
    }),
  );

  return records.sort((a, b) => a.firstName.localeCompare(b.firstName));
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
