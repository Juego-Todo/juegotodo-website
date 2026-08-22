import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PlatformReportSnapshot = {
  inquiriesNew: number;
  licensePending: number;
  membershipApplications: number;
  ordersPending: number;
  competitionEntriesPending: number;
  documentsPending: number;
  publishedEvents: number;
  publishedAnnouncements: number;
};

export async function fetchPlatformReportSnapshot(): Promise<PlatformReportSnapshot> {
  const empty: PlatformReportSnapshot = {
    inquiriesNew: 0,
    licensePending: 0,
    membershipApplications: 0,
    ordersPending: 0,
    competitionEntriesPending: 0,
    documentsPending: 0,
    publishedEvents: 0,
    publishedAnnouncements: 0,
  };

  if (!isSupabaseConfigured()) return empty;
  const service = createSupabaseServiceClient();
  if (!service) return empty;

  const [
    inquiries,
    licenses,
    membership,
    orders,
    entries,
    documents,
    events,
    announcements,
  ] = await Promise.all([
    service.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    service.from("license_applications").select("id", { count: "exact", head: true }).in("status", ["pending", "needs_info"]),
    service.from("license_applications").select("id", { count: "exact", head: true }).neq("application_status", "COMPLETED"),
    service.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
    service.from("competition_entries").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    service.from("member_documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
    service.from("calendar_events").select("id", { count: "exact", head: true }).eq("published", true),
    service.from("announcements").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  return {
    inquiriesNew: inquiries.count ?? 0,
    licensePending: licenses.count ?? 0,
    membershipApplications: membership.count ?? 0,
    ordersPending: orders.count ?? 0,
    competitionEntriesPending: entries.count ?? 0,
    documentsPending: documents.count ?? 0,
    publishedEvents: events.count ?? 0,
    publishedAnnouncements: announcements.count ?? 0,
  };
}
