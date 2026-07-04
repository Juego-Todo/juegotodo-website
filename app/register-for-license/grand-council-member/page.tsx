import type { Metadata } from "next";
import { Suspense } from "react";
import { GrandCouncilMemberApplicationPage } from "@/components/profile/GrandCouncilMemberApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Grand Council Member Application",
  description: "Submit your official Juego Todo Grand Council Member appointment application for admin approval.",
};

export default function GrandCouncilMemberApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={resolveBreadcrumbs("/register-for-license/grand-council-member", "Grand Council Member Application")}
      />
      <Suspense fallback={null}>
        <GrandCouncilMemberApplicationPage />
      </Suspense>
    </>
  );
}
