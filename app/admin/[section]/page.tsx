import { AdminPortalSectionPage } from "@/components/admin/AdminPortalSectionPage";

export default async function AdminPortalSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <AdminPortalSectionPage section={section} />;
}
