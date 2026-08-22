import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CompetitionEntryRecord = {
  id: string;
  userId: string;
  eventTitle: string;
  division: string;
  status: string;
  notes: string;
  createdAt: string;
};

export async function listCompetitionEntries(userId?: string): Promise<CompetitionEntryRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service
    .from("competition_entries")
    .select("id, user_id, event_title, division, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    eventTitle: row.event_title,
    division: row.division,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

export async function createCompetitionEntry(input: {
  userId: string;
  eventTitle: string;
  division: string;
  notes?: string;
  calendarEventId?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Competition entries require Supabase.");

  const { data, error } = await service
    .from("competition_entries")
    .insert({
      user_id: input.userId,
      event_title: input.eventTitle.trim(),
      division: input.division.trim(),
      notes: input.notes?.trim() ?? "",
      calendar_event_id: input.calendarEventId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    userId: data.user_id,
    eventTitle: data.event_title,
    division: data.division,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
  } satisfies CompetitionEntryRecord;
}

export async function updateCompetitionEntryStatus(id: string, status: string, reviewedBy?: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Competition entries require Supabase.");

  const { error } = await service
    .from("competition_entries")
    .update({ status, reviewed_by: reviewedBy ?? null })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
