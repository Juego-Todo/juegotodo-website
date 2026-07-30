import { Suspense } from "react";
import type { Metadata } from "next";
import { UserProfilePage } from "@/components/UserProfilePage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your Profile",
  description: "Manage your Juego Todo profile, orders, wishlist, saved fighters, and membership.",
  path: "/profile",
  noIndex: true,
});

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
