import type { Metadata } from "next";
import { AdminPortalSectionPage } from "@/components/admin/AdminPortalSectionPage";
import { buildAdminMetadata } from "@/lib/seo/admin-meta";

type PageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  const label = section.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return buildAdminMetadata(`Admin — ${label}`, `/admin/${section}`);
}

export default async function AdminPortalSectionRoute({ params }: PageProps) {
  const { section } = await params;
  return <AdminPortalSectionPage section={section} />;
}
