import type { Metadata } from "next";
import { MembershipLanding } from "@/components/membership/MembershipLanding";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Membership Portal",
  description:
    "Apply for Juego Todo local membership, submit required documents and payment proof, and track your application status.",
  path: "/membership",
  keywords: ["membership", "local membership", "JT1", "Juego Todo"],
});

export default function MembershipPage() {
  return <MembershipLanding />;
}
