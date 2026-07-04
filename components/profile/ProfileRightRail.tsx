"use client";

import {
  AdminPermissionsPanel,
  MemberActivityPanel,
  MembershipTimelinePanel,
  RequirementsPanel,
  VerificationPanel,
} from "@/components/profile/MemberPortalPanels";
import type { MemberRecord } from "@/lib/profile/member-record";
import type { ProfileRoleKind } from "@/lib/profile/role-modules";

function resolveRailModules(kind: ProfileRoleKind): Array<"requirements" | "verification" | "timeline" | "activity" | "permissions"> {
  switch (kind) {
    case "admin":
      return ["permissions", "activity", "timeline"];
    case "community":
      return ["requirements", "verification", "timeline", "activity"];
    case "fighter":
    case "coach":
    case "referee":
    case "judge":
      return ["verification", "timeline", "activity"];
    default:
      return ["verification", "timeline", "activity"];
  }
}

export function ProfileRightRail({ memberRecord }: { memberRecord: MemberRecord }) {
  const modules = resolveRailModules(memberRecord.roleModule.kind);

  return (
    <aside className="space-y-4">
      {modules.includes("requirements") ? (
        <RequirementsPanel percent={memberRecord.requirementsPercent} requirements={memberRecord.requirements} />
      ) : null}
      {modules.includes("verification") ? <VerificationPanel items={memberRecord.verifications} /> : null}
      {modules.includes("timeline") ? <MembershipTimelinePanel timeline={memberRecord.timeline} /> : null}
      {modules.includes("activity") ? <MemberActivityPanel activity={memberRecord.activity} /> : null}
      {modules.includes("permissions") ? (
        <AdminPermissionsPanel permissions={memberRecord.adminPermissions} />
      ) : null}
    </aside>
  );
}
