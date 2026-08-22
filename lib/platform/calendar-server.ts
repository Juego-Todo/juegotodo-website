import type { CalendarEntry } from "@/data/calendar-entries";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type CalendarEventRow = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  published: boolean;
  operational_status: string;
  payload: CalendarEntry;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: CalendarEventRow): CalendarEntry {
  const payload = row.payload as CalendarEntry;
  return {
    ...payload,
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.event_date,
    published: row.published,
    operationalStatus: row.operational_status as CalendarEntry["operationalStatus"],
    source: "admin",
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export async function fetchPublishedCalendarEventsFromDb(): Promise<CalendarEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("calendar_events")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CalendarEventRow[]).map(rowToEntry);
}

export async function fetchAllCalendarEventsFromDb(includeDrafts: boolean): Promise<CalendarEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service.from("calendar_events").select("*").order("event_date", { ascending: true });
  if (!includeDrafts) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as CalendarEventRow[]).map(rowToEntry);
}

export async function upsertCalendarEvent(entry: CalendarEntry, createdBy?: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Calendar sync requires Supabase.");

  const row = {
    slug: entry.slug,
    title: entry.title,
    event_date: entry.date,
    published: entry.published ?? false,
    operational_status: entry.operationalStatus ?? "draft",
    payload: entry,
    created_by: createdBy ?? null,
  };

  const { data, error } = await service
    .from("calendar_events")
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to save calendar event.");
  return rowToEntry(data as unknown as CalendarEventRow);
}

export async function deleteCalendarEventBySlug(slug: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Calendar sync requires Supabase.");
  const { error } = await service.from("calendar_events").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
