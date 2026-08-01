"use client";

import { useSearchParams } from "next/navigation";
import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import { LicenseApprovalPanel } from "@/components/profile/LicenseApprovalPanel";

/**
 * Licenses tab opens approvals directly.
 * Legacy `?view=members` bookmarks still resolve the directory (Members is now its own tab).
 */
export function AdminMembershipPanel() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "members") {
    return <AdminMemberDirectoryPanel />;
  }

  return <LicenseApprovalPanel />;
}
