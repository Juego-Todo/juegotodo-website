import type { Metadata } from "next";
import { Suspense } from "react";
import { SeniorCoachLicenseApplicationPage } from "@/components/profile/SeniorCoachLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("senior-coach");

export default function SeniorCoachLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/senior-coach", "Senior Coach License Application")} />
      <Suspense fallback={null}>
        <SeniorCoachLicenseApplicationPage />
      </Suspense>
    </>
  );
}
