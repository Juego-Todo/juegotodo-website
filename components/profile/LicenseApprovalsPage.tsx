"use client";

import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { LicenseApprovalPanel } from "@/components/profile/LicenseApprovalPanel";

export function LicenseApprovalsPage() {
  return (
    <AdminPortalShell loadingLabel="Loading approvals..." loginNext="/admin/license-approvals">
      <LicenseApprovalPanel />
    </AdminPortalShell>
  );
}
