"use client";

import { notFound } from "next/navigation";
import { AdminCalendarPanel } from "@/components/admin/AdminCalendarPanel";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import {
  AdminPortalHeader,
  AdminPortalPlaceholder,
  AdminPortalShell,
} from "@/components/admin/AdminPortalShell";
import { AdminStoreOrdersPanel } from "@/components/admin/AdminStoreOrdersPanel";
import { resolveAdminPortalSection, type AdminPortalSectionId } from "@/data/admin-portal-sections";

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
    <AdminPortalShell loginNext={`/admin/${section}`}>
      <SectionContent sectionId={config.id} />
    </AdminPortalShell>
  );
}
