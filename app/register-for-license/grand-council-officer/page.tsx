import type { Metadata } from "next";
import { Suspense } from "react";
import { GrandCouncilOfficerApplicationPage } from "@/components/profile/GrandCouncilOfficerApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Grand Council Officer Application",
  description: "Submit your official Juego Todo Grand Council Officer appointment application for admin approval.",
};

export default function GrandCouncilOfficerApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={resolveBreadcrumbs("/register-for-license/grand-council-officer", "Grand Council Officer Application")}
      />
      <Suspense fallback={null}>
        <GrandCouncilOfficerApplicationPage />
      </Suspense>
    </>
  );
}
