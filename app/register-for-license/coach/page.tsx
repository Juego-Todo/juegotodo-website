import type { Metadata } from "next";
import { Suspense } from "react";
import { CoachLicenseApplicationPage } from "@/components/profile/CoachLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Coach License Application",
  description: "Submit your official Juego Todo Grand Council coach license application for admin approval.",
};

export default function CoachLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/coach", "Coach License Application")} />
      <Suspense fallback={null}>
        <CoachLicenseApplicationPage />
      </Suspense>
    </>
  );
}
