import type { Metadata } from "next";
import { AdminDashboard } from "@/components/commerce/AdminDashboard";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin",
  description: "Juego Todo admin dashboard.",
  path: "/admin",
  noIndex: true,
});

export default function AdminRoute() {
  return <AdminDashboard />;
}
