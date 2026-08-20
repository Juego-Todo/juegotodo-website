import type { Metadata } from "next";
import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { AdminMembershipApplicationDetail } from "@/components/membership/AdminMembershipApplicationDetail";
import { buildAdminMetadata } from "@/lib/seo/admin-meta";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { applicationId } = await params;
  return buildAdminMetadata("Review Membership Application", `/admin/membership-applications/${applicationId}`);
}

export default async function AdminMembershipApplicationDetailRoute({ params }: PageProps) {
  const { applicationId } = await params;
  return (
    <AdminPortalShell
      backHref="/admin/membership-applications"
      backLabel="Back to Queue"
      loadingLabel="Loading membership application..."
      loginNext={`/admin/membership-applications/${applicationId}`}
    >
      <AdminMembershipApplicationDetail applicationId={applicationId} />
    </AdminPortalShell>
  );
}
