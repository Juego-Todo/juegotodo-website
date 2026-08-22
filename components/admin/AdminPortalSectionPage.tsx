"use client";

import { notFound, useRouter } from "next/navigation";
import { AdminCalendarPanel } from "@/components/admin/AdminCalendarPanel";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import { AdminPortalHeader, AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { AdminStoreOrdersPanel } from "@/components/admin/AdminStoreOrdersPanel";
import { AdminAnnouncementsPanel } from "@/components/admin/platform/AdminAnnouncementsPanel";
import { AdminCompetitionsPanel } from "@/components/admin/platform/AdminCompetitionsPanel";
import { AdminCouncilPanel } from "@/components/admin/platform/AdminCouncilPanel";
import { AdminDocumentsPanel } from "@/components/admin/platform/AdminDocumentsPanel";
import { AdminOfficialsPanel } from "@/components/admin/platform/AdminOfficialsPanel";
import { AdminReportsPanel } from "@/components/admin/platform/AdminReportsPanel";
import { ProfileSettingsPanel } from "@/components/profile/ProfileSettingsPanel";
import { resolveAdminPortalSection, type AdminPortalSectionId } from "@/data/admin-portal-sections";
import { resolveAccountTypeLabel, resolveUserTypeTagIds } from "@/data/user-type-tags";
import { useAuth } from "@/lib/auth/context";
import { getAdminAssignedTags } from "@/lib/profile/account-tags";

function AdminSettingsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const tags = getAdminAssignedTags(user.id, user.assignedTags);
  const tagIds = resolveUserTypeTagIds(user, null, tags);
  const accountTypeLabel = resolveAccountTypeLabel(user, tagIds);

  return (
    <div className="space-y-6">
      <AdminPortalHeader
        description="Manage your profile details and session preferences."
        tag="Account"
        title="Settings"
      />
      <ProfileSettingsPanel
        accountTypeLabel={accountTypeLabel}
        onLogout={() => {
          void logout().then(() => {
            router.push("/login");
          });
        }}
      />
    </div>
  );
}

function SectionContent({ sectionId }: { sectionId: AdminPortalSectionId }) {
  switch (sectionId) {
    case "members":
      return <AdminMemberDirectoryPanel />;
    case "calendar":
    case "events":
      return <AdminCalendarPanel />;
    case "competitions":
      return <AdminCompetitionsPanel />;
    case "documents":
      return <AdminDocumentsPanel />;
    case "officials":
      return <AdminOfficialsPanel />;
    case "grand-council":
      return <AdminCouncilPanel />;
    case "reports":
      return <AdminReportsPanel />;
    case "announcements":
      return <AdminAnnouncementsPanel />;
    case "store-orders":
      return <AdminStoreOrdersPanel />;
    case "settings":
      return <AdminSettingsContent />;
    default:
      return null;
  }
}

export function AdminPortalSectionPage({ section }: { section: string }) {
  const config = resolveAdminPortalSection(section);

  if (!config) {
    notFound();
  }

  return (
    <AdminPortalShell backHref="/admin" backLabel="Back to Admin Console" loginNext={`/admin/${section}`}>
      <SectionContent sectionId={config.id} />
    </AdminPortalShell>
  );
}
