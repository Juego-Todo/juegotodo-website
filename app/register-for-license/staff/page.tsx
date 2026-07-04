import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffLicenseApplicationPage } from "@/components/profile/StaffLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Staff License Application",
  description: "Submit your official Juego Todo Grand Council staff license application for admin approval.",
};

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
