import type { Metadata } from "next";
import { Suspense } from "react";
import { FighterLicenseApplicationPage } from "@/components/profile/FighterLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("fighter");

export default function FighterLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/fighter", "Fighter License Application")} />
      <Suspense fallback={null}>
        <FighterLicenseApplicationPage />
      </Suspense>
    </>
  );
}
