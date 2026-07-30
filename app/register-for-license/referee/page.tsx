import type { Metadata } from "next";
import { Suspense } from "react";
import { RefereeLicenseApplicationPage } from "@/components/profile/RefereeLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("referee");

export default function RefereeLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/referee", "Referee License Application")} />
      <Suspense fallback={null}>
        <RefereeLicenseApplicationPage />
      </Suspense>
    </>
  );
}
