import type { Metadata } from "next";
import { Suspense } from "react";
import { RefereeLicenseApplicationPage } from "@/components/profile/RefereeLicenseApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Referee License Application",
  description: "Submit your official Juego Todo Grand Council referee license application for admin approval.",
};

export default function RefereeLicenseApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/referee", "Referee License Application")} />
      <Suspense fallback={null}>
        <RefereeLicenseApplicationPage />
      </Suspense>
    </>
  );
}
