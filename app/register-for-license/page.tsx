import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForLicensePage } from "@/components/profile/RegisterForLicensePage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Register for a License",
  description: "Submit your official Juego Todo membership license application for admin approval.",
};

export default function RegisterForLicenseRoutePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/register-for-license", "Register for a License")} />
      <Suspense fallback={null}>
        <RegisterForLicensePage />
      </Suspense>
    </>
  );
}
