import type { UserTypeTagId } from "@/data/user-type-tags";
import type { WorkspaceTabId } from "@/lib/profile/mission-control";
import type { ProfileRoleKind } from "@/lib/profile/role-modules";

/**
 * The portal experience decides which profile workspace a member sees.
 * Derived from admin-assigned tags (synced from license approvals) plus the
 * admin flag, so all identity layers resolve to a single dashboard layout.
 */
export type PortalExperience = "admin" | "fighter" | "coach" | "official" | "fan";

export const portalExperienceLabels: Record<PortalExperience, string> = {
  admin: "Admin",
  fighter: "Fighter",
  coach: "Coach",
  official: "Official",
  fan: "Fan",
};

/** Fan-first workspace: events, tickets, orders, and profile settings. */
export const fanWorkspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Home" },
  { id: "activity", label: "Activity" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
];

/** Coach workspace: roster overview plus the standard member tools. */
export const coachWorkspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "documents", label: "Documents" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

const coachTagIds: UserTypeTagId[] = ["coach", "grandmaster"];

const officialTagIds: UserTypeTagId[] = [
  "referee",
  "judge",
  "staff",
  "adviser",
  "grand_council_member",
  "gym_owner",
  "media",
];

const roleKindToExperience: Record<ProfileRoleKind, PortalExperience> = {
  admin: "admin",
  community: "fan",
  fighter: "fighter",
  coach: "coach",
  grandmaster: "coach",
  referee: "official",
  judge: "official",
  club_owner: "official",
  grand_council: "official",
  adviser: "official",
  staff: "official",
};

export function resolvePortalExperience(input: {
  tagIds: UserTypeTagId[];
  isAdmin: boolean;
  roleKind?: ProfileRoleKind | null;
}): PortalExperience {
  const { tagIds, isAdmin, roleKind } = input;

  if (roleKind) {
    return roleKindToExperience[roleKind];
  }
  if (isAdmin || tagIds.includes("admin")) {
    return "admin";
  }
  if (tagIds.includes("fighter")) {
    return "fighter";
  }
  if (coachTagIds.some((tagId) => tagIds.includes(tagId))) {
    return "coach";
  }
  if (officialTagIds.some((tagId) => tagIds.includes(tagId))) {
    return "official";
  }
  return "fan";
}
