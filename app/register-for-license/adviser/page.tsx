import type { Metadata } from "next";
import { Suspense } from "react";
import { AdviserLicenseApplicationPage } from "@/components/profile/AdviserLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Adviser License Application",
  description: "Submit your official Juego Todo Grand Council adviser license application for admin approval.",
};

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
