import { LicenseApplicationReviewPage } from "@/components/profile/LicenseApplicationReviewPage";

export default async function LicenseApplicationReviewRoute({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return <LicenseApplicationReviewPage applicationId={applicationId} />;
}
