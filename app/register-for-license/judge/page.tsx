import type { Metadata } from "next";
import { Suspense } from "react";
import { JudgeLicenseApplicationPage } from "@/components/profile/JudgeLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Judge License Application",
  description: "Submit your official Juego Todo Grand Council judge license application for admin approval.",
};

export default function JudgeLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/judge", "Judge License Application")} />
      <Suspense fallback={null}>
        <JudgeLicenseApplicationPage />
      </Suspense>
    </>
  );
}
