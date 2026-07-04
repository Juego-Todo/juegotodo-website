import type { Metadata } from "next";
import { Suspense } from "react";
import { SeniorCoachLicenseApplicationPage } from "@/components/profile/SeniorCoachLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Senior Coach License Application",
  description: "Submit your official Juego Todo Grand Council senior coach license application for admin approval.",
};

export default function SeniorCoachLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/senior-coach", "Senior Coach License Application")} />
      <Suspense fallback={null}>
        <SeniorCoachLicenseApplicationPage />
      </Suspense>
    </>
  );
}
