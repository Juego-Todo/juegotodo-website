import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { AdminMembershipApplicationsPanel } from "@/components/membership/AdminMembershipApplicationsPanel";
import { buildAdminMetadata } from "@/lib/seo/admin-meta";

export const metadata: Metadata = buildAdminMetadata(
  "Membership Applications",
  "/admin/membership-applications",
);

export default function AdminMembershipApplicationsRoute() {
  return (
    <AdminPortalShell
      backHref="/profile"
      backLabel="Back to Profile"
      loadingLabel="Loading membership applications..."
      loginNext="/admin/membership-applications"
    >
      <AdminMembershipApplicationsPanel />
    </AdminPortalShell>
  );
}
