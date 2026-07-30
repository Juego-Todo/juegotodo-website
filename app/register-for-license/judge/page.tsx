import type { Metadata } from "next";
import { Suspense } from "react";
import { JudgeLicenseApplicationPage } from "@/components/profile/JudgeLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("judge");

export default function JudgeLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/judge", "Judge License Application")} />
      <Suspense fallback={null}>
        <JudgeLicenseApplicationPage />
      </Suspense>
    </>
  );
}
