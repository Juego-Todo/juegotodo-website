import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffLicenseApplicationPage } from "@/components/profile/StaffLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("staff");

export default function StaffLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/staff", "Staff License Application")} />
      <Suspense fallback={null}>
        <StaffLicenseApplicationPage />
      </Suspense>
    </>
  );
}
