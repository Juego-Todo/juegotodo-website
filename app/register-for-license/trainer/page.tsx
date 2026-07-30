import type { Metadata } from "next";
import { Suspense } from "react";
import { TrainerLicenseApplicationPage } from "@/components/profile/TrainerLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata("trainer");

export default function TrainerLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/trainer", "Trainer License Application")} />
      <Suspense fallback={null}>
        <TrainerLicenseApplicationPage />
      </Suspense>
    </>
  );
}
