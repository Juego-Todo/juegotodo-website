import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAdminMetadata } from "@/lib/seo/admin-meta";

export const metadata: Metadata = buildAdminMetadata(
  "License Approvals",
  "/admin/license-approvals",
);

export default function LicenseApprovalsRoute() {
  redirect("/profile?tab=licenses&view=approvals");
}
