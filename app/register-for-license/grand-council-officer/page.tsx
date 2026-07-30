import type { Metadata } from "next";
import { Suspense } from "react";
import { GrandCouncilOfficerApplicationPage } from "@/components/profile/GrandCouncilOfficerApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("grand-council-officer");

export default function GrandCouncilOfficerApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={resolveBreadcrumbs("/register-for-license/grand-council-officer", "Grand Council Officer Application")}
      />
      <Suspense fallback={null}>
        <GrandCouncilOfficerApplicationPage />
      </Suspense>
    </>
  );
}
