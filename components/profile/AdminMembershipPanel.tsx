"use client";

import { useSearchParams } from "next/navigation";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import { AdminMembershipApplicationsPanel } from "@/components/membership/AdminMembershipApplicationsPanel";
import { LicenseApprovalPanel } from "@/components/profile/LicenseApprovalPanel";

/**
 * Licenses tab opens approvals by default.
 * `?view=applications` opens the membership application queue.
 * Legacy `?view=members` bookmarks still resolve the directory.
 */
export function AdminMembershipPanel() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "members") {
    return <AdminMemberDirectoryPanel embedded />;
  }

  if (view === "applications") {
    return <AdminMembershipApplicationsPanel embedded />;
  }

  return <LicenseApprovalPanel embedded />;
}
