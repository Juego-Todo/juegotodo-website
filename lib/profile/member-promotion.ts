import type { LicenseRestrictionCode } from "@/data/license-applications";
import { resolveLicenseTag, userTypeTags, type UserTypeTagId } from "@/data/user-type-tags";
import { getAdminAssignedTags, saveAdminAssignedTags } from "@/lib/profile/account-tags";

export type MemberPromotionResult = {
  tagId: UserTypeTagId;
  tagLabel: string;
  tags: UserTypeTagId[];
  alreadyAssigned: boolean;
};

/**
 * On license approval, persist the matching role tag to the member's account
 * through the admin tags API (Supabase profiles.assigned_tags + account_type),
 * so the fan account is upgraded to the licensed role everywhere — not just in
 * the reviewing admin's localStorage.
 */
export async function promoteMemberRoleFromLicense(
  userId: string,
  restrictionCode: LicenseRestrictionCode,
  existingTags?: UserTypeTagId[],
): Promise<MemberPromotionResult | null> {
  const tagId = resolveLicenseTag(restrictionCode);
  if (!tagId) {
    return null;
  }

  const tagLabel = userTypeTags[tagId].label;
  const current = existingTags ?? getAdminAssignedTags(userId);
  if (current.includes(tagId)) {
    return { tagId, tagLabel, tags: current, alreadyAssigned: true };
  }

  const tags = await saveAdminAssignedTags(userId, [...current, tagId]);
  return { tagId, tagLabel, tags, alreadyAssigned: false };
}
