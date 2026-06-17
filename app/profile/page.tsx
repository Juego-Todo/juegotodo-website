import { Suspense } from "react";
import type { Metadata } from "next";
import { UserProfilePage } from "@/components/UserProfilePage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Manage your Juego Todo profile, orders, wishlist, saved fighters, and membership.",
};

export default function ProfilePage() {
  return (
    <>
      <BreadcrumbJsonLd items={resolveBreadcrumbs("/profile", "Your Profile")} />
      <Suspense>
        <UserProfilePage />
      </Suspense>
    </>
  );
}
