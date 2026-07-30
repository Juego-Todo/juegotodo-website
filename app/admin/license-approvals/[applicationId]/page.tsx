import type { Metadata } from "next";
import { LicenseApplicationReviewPage } from "@/components/profile/LicenseApplicationReviewPage";
import { buildAdminMetadata } from "@/lib/seo/admin-meta";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { applicationId } = await params;
  return buildAdminMetadata("Review License Application", `/admin/license-approvals/${applicationId}`);
}

export default async function LicenseApplicationReviewRoute({ params }: PageProps) {
  const { applicationId } = await params;
  return <LicenseApplicationReviewPage applicationId={applicationId} />;
}
