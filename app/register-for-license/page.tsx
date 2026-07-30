import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForLicensePage } from "@/components/profile/RegisterForLicensePage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildLicenseMetadata } from "@/lib/seo/license-meta";

export const metadata: Metadata = buildLicenseMetadata();

export default function RegisterForLicenseRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license", "Register for a License")} />
      <Suspense fallback={null}>
        <RegisterForLicensePage />
      </Suspense>
    </>
  );
}
