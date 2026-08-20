import type { Metadata } from "next";
import { MembershipApplicationStatusPage } from "@/components/membership/MembershipApplicationStatusPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { applicationId } = await params;
  return buildPageMetadata({
    title: "Membership Application Status",
    description: "View the status of your Juego Todo membership application.",
    path: `/membership/application/${applicationId}`,
    noIndex: true,
  });
}

export default async function MembershipApplicationStatusRoute({ params }: PageProps) {
  const { applicationId } = await params;
  return <MembershipApplicationStatusPage applicationId={applicationId} />;
}
