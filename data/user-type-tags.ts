import {
  Crown,
  Gavel,
  Megaphone,
  Shield,
  Sparkles,
  Swords,
  Flag,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { LicenseApplication, LicenseRestrictionCode } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import { accountTypeLabels } from "@/lib/auth/types";
import { resolveProfileRoles } from "@/lib/profile/identity";

export type UserTypeTagId =
  | "regular_member"
  | "grand_council_member"
  | "admin"
  | "media"
  | "fighter"
  | "referee"
  | "judge"
  | "coach"
  | "grandmaster"
  | "staff"
  | "gym_owner"
  | "adviser";

export type UserTypeTag = {
  id: UserTypeTagId;
  label: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
  icon: LucideIcon;
};

export const userTypeTags: Record<UserTypeTagId, UserTypeTag> = {
  regular_member: {
    id: "regular_member",
    label: "Regular Member",
    color: "text-zinc-200",
    borderColor: "border-zinc-400/40",
    backgroundColor: "bg-zinc-500/15",
    icon: UserRound,
  },
  grand_council_member: {
    id: "grand_council_member",
    label: "Grand Council Member",
    color: "text-violet-200",
    borderColor: "border-violet-500/50",
    backgroundColor: "bg-violet-600/20",
    icon: Crown,
  },
  admin: {
    id: "admin",
    label: "Admin",
    color: "text-white",
    borderColor: "border-white/50",
    backgroundColor: "bg-white/10",
    icon: Shield,
  },
  media: {
    id: "media",
    label: "Media",
    color: "text-cyan-200",
    borderColor: "border-cyan-500/50",
    backgroundColor: "bg-cyan-600/15",
    icon: Megaphone,
  },
  fighter: {
    id: "fighter",
    label: "Fighter",
    color: "text-red-200",
    borderColor: "border-red-500/50",
    backgroundColor: "bg-red-600/20",
    icon: Swords,
  },
  referee: {
    id: "referee",
    label: "Referee",
    color: "text-amber-200",
    borderColor: "border-amber-400/50",
    backgroundColor: "bg-amber-500/15",
    icon: Flag,
  },
  judge: {
    id: "judge",
    label: "Judge",
    color: "text-yellow-200",
    borderColor: "border-yellow-400/50",
    backgroundColor: "bg-yellow-500/15",
    icon: Gavel,
  },
  coach: {
    id: "coach",
    label: "Coach",
    color: "text-sky-200",
    borderColor: "border-sky-500/50",
    backgroundColor: "bg-sky-600/20",
    icon: Users,
  },
  grandmaster: {
    id: "grandmaster",
    label: "Grandmaster",
    color: "text-yellow-100",
    borderColor: "border-yellow-400/50",
    backgroundColor: "bg-yellow-500/15",
    icon: Sparkles,
  },
  staff: {
    id: "staff",
    label: "Staff",
    color: "text-orange-200",
    borderColor: "border-orange-400/50",
    backgroundColor: "bg-orange-500/15",
    icon: Shield,
  },
  gym_owner: {
    id: "gym_owner",
    label: "Gym Owner",
    color: "text-emerald-200",
    borderColor: "border-emerald-500/50",
    backgroundColor: "bg-emerald-600/15",
    icon: Crown,
  },
  adviser: {
    id: "adviser",
    label: "Adviser",
    color: "text-orange-200",
    borderColor: "border-orange-400/50",
    backgroundColor: "bg-orange-500/15",
    icon: Shield,
  },
};

const licenseTagMap: Partial<Record<LicenseRestrictionCode, UserTypeTagId>> = {
  JT1: "grandmaster",
  JT2: "grand_council_member",
  JT3: "grand_council_member",
  JT4: "gym_owner",
  JT5: "grand_council_member",
  JT6: "adviser",
  JT7: "coach",
  JT8: "referee",
  JT9: "judge",
  JT10: "coach",
  JT11: "fighter",
  JT12: "staff",
};

const accountTypeTagMap: Partial<Record<UserProfile["accountType"], UserTypeTagId>> = {
  athlete: "fighter",
  coach: "coach",
  gym_owner: "gym_owner",
  partner: "media",
};

const accountTypePriority: UserTypeTagId[] = [
  "admin",
  "grand_council_member",
  "grandmaster",
  "fighter",
  "coach",
  "referee",
  "judge",
  "adviser",
  "staff",
  "gym_owner",
  "media",
  "regular_member",
];

export function resolveUserTypeTagIds(
  user: UserProfile,
  licenseApplication?: LicenseApplication | null,
  adminAssignedTags: UserTypeTagId[] = [],
): UserTypeTagId[] {
  const tags = new Set<UserTypeTagId>();
  const roles = resolveProfileRoles(user);

  adminAssignedTags.forEach((tag) => tags.add(tag));

  if (user.role === "admin" || roles.includes("administrator")) {
    tags.add("admin");
  }
  if (roles.includes("grand_council")) {
    tags.add("grand_council_member");
  }
  if (roles.includes("media") || user.accountType === "partner") {
    tags.add("media");
  }
  if (roles.includes("fighter") || user.accountType === "athlete") {
    tags.add("fighter");
  }
  if (roles.includes("referee")) {
    tags.add("referee");
  }
  if (roles.includes("judge")) {
    tags.add("judge");
  }
  if (roles.includes("coach") || user.accountType === "coach") {
    tags.add("coach");
  }
  if (roles.includes("gym_owner") || user.accountType === "gym_owner") {
    tags.add("gym_owner");
  }

  const accountTag = accountTypeTagMap[user.accountType];
  if (accountTag) {
    tags.add(accountTag);
  }

  if (licenseApplication?.status === "approved") {
    const licenseTag = licenseTagMap[licenseApplication.restrictionCode];
    if (licenseTag) {
      tags.add(licenseTag);
    }
  }

  tags.delete("regular_member");

  if (tags.size === 0) {
    tags.add("regular_member");
  }

  return [...tags];
}

export function resolveAccountTypeLabel(user: UserProfile, tagIds: UserTypeTagId[]) {
  const primaryTag =
    accountTypePriority.find((tagId) => tagIds.includes(tagId) && tagId !== "regular_member") ??
    (tagIds.includes("regular_member") ? "regular_member" : null);

  if (primaryTag) {
    return userTypeTags[primaryTag].label;
  }

  return accountTypeLabels[user.accountType] ?? "Regular Member";
}

export function resolveLicenseTag(restrictionCode: LicenseRestrictionCode): UserTypeTagId | null {
  return licenseTagMap[restrictionCode] ?? null;
}
