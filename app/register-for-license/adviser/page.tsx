import type { Metadata } from "next";
import { Suspense } from "react";
import { AdviserLicenseApplicationPage } from "@/components/profile/AdviserLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("adviser");

export default function AdviserLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/adviser", "Adviser License Application")} />
      <Suspense fallback={null}>
        <AdviserLicenseApplicationPage />
      </Suspense>
    </>
  );
}
