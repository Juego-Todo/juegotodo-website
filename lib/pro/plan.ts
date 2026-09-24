import { isPlatformOwnerEmail } from "@/lib/auth/platform-owners";
import type { UserTypeTagId } from "@/data/user-type-tags";

const UNLIMITED_TAGS = new Set<UserTypeTagId>(["staff", "admin"]);

type UnlimitedAccountLike = {
  email?: string | null;
  role?: string | null;
  assignedTags?: string[] | null;
  tags?: string[] | null;
};

/**
 * Staff, admin, and platform-owner accounts receive an Unlimited plan
 * (no Pro checkout required; License Center unlocked).
 */
export function hasUnlimitedPlan(account: UnlimitedAccountLike | null | undefined): boolean {
  if (!account) return false;

  if (account.role === "admin") {
    return true;
  }

  if (isPlatformOwnerEmail(account.email ?? "")) {
    return true;
  }

  const tags = account.tags ?? account.assignedTags ?? [];
  return tags.some((tag) => UNLIMITED_TAGS.has(tag as UserTypeTagId));
}

export type MemberPlanKind = "unlimited" | "pro" | "free" | "expired" | "pending" | "cancelled";

export function resolveMemberPlanKind(input: {
  unlimited?: boolean;
  proEntitled?: boolean;
  proStatus?: string | null;
}): MemberPlanKind {
  if (input.unlimited) return "unlimited";
  if (input.proStatus === "pending") return "pending";
  if (input.proStatus === "expired") return "expired";
  if (input.proEntitled && input.proStatus === "cancelled") return "cancelled";
  if (input.proEntitled) return "pro";
  return "free";
}
