import type { Metadata } from "next";
import { Suspense } from "react";
import { CoachLicenseApplicationPage } from "@/components/profile/CoachLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("coach");

export default function CoachLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/coach", "Coach License Application")} />
      <Suspense fallback={null}>
        <CoachLicenseApplicationPage />
      </Suspense>
    </>
  );
}
