import type { Metadata } from "next";
import { Suspense } from "react";
import { GrandCouncilMemberApplicationPage } from "@/components/profile/GrandCouncilMemberApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("grand-council-member");

export default function GrandCouncilMemberApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={resolveBreadcrumbs("/register-for-license/grand-council-member", "Grand Council Member Application")}
      />
      <Suspense fallback={null}>
        <GrandCouncilMemberApplicationPage />
      </Suspense>
    </>
  );
}
