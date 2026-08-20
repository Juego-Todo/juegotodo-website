import type { Metadata } from "next";
import { MembershipApplicationsPage } from "@/components/membership/MembershipApplicationsPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "My Membership Applications",
  description: "Track your Juego Todo membership applications and review status updates.",
  path: "/membership/applications",
  noIndex: true,
});

export default function MembershipApplicationsRoute() {
  return <MembershipApplicationsPage />;
}
