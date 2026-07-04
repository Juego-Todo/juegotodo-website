import type { Metadata } from "next";
import { Suspense } from "react";
import { FighterLicenseApplicationPage } from "@/components/profile/FighterLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Fighter License Application",
  description: "Submit your official Juego Todo Grand Council fighter license application for admin approval.",
};

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
