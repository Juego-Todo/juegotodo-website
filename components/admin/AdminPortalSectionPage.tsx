"use client";

import { notFound, useRouter } from "next/navigation";
import { AdminCalendarPanel } from "@/components/admin/AdminCalendarPanel";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import {
  AdminPortalHeader,
  AdminPortalPlaceholder,
  AdminPortalShell,
} from "@/components/admin/AdminPortalShell";
import { AdminStoreOrdersPanel } from "@/components/admin/AdminStoreOrdersPanel";
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
    <ProfileSettingsPanel
      accountTypeLabel={accountTypeLabel}
      onLogout={() => {
        void logout().then(() => {
          router.push("/login");
        });
      }}
    />
  );
}

function SectionContent({ sectionId }: { sectionId: AdminPortalSectionId }) {
  switch (sectionId) {
    case "members":
      return <AdminMemberDirectoryPanel />;
    case "calendar":
    case "events":
    case "competitions":
      return <AdminCalendarPanel />;
    case "store-orders":
      return <AdminStoreOrdersPanel />;
    case "settings":
      return <AdminSettingsContent />;
    default: {
      const config = resolveAdminPortalSection(sectionId);
      if (!config) {
        return null;
      }

      return (
        <div className="space-y-6">
          <AdminPortalHeader description={config.description} tag={config.tag} title={config.title} />
          {config.placeholder ? <AdminPortalPlaceholder message={config.placeholder} /> : null}
        </div>
      );
    }
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
