import type { Metadata } from "next";
import { Suspense } from "react";
import { TrainerLicenseApplicationPage } from "@/components/profile/TrainerLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Trainer License Application",
  description: "Submit your official Juego Todo Grand Council trainer license application for admin approval.",
};

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
