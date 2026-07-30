import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubOwnerApplicationPage } from "@/components/profile/ClubOwnerApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("club-owner");

export default function ClubOwnerApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/club-owner", "Club Owner Application")} />
      <Suspense fallback={null}>
        <ClubOwnerApplicationPage />
      </Suspense>
    </>
  );
}
