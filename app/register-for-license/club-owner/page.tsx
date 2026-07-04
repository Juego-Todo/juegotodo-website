import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubOwnerApplicationPage } from "@/components/profile/ClubOwnerApplicationPage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Club Owner Application",
  description: "Submit your official Juego Todo affiliated club owner registration application for admin approval.",
};

export default function ClubOwnerApplicationRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license/club-owner", "Club Owner Application")} />
      <Suspense fallback={null}>
        <ClubOwnerApplicationPage />
      </Suspense>
    </>
  );
}
