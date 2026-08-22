import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type OfficialAssignmentRecord = {
  id: string;
  officialUserId: string;
  role: string;
  eventTitle: string;
  status: string;
  notes: string;
  createdAt: string;
};

export async function listOfficialAssignments(userId?: string): Promise<OfficialAssignmentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service
    .from("official_assignments")
    .select("id, official_user_id, role, event_title, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (userId) query = query.eq("official_user_id", userId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    officialUserId: row.official_user_id,
    role: row.role,
    eventTitle: row.event_title,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

export async function createOfficialAssignment(input: {
  officialUserId: string;
  role: string;
  eventTitle: string;
  notes?: string;
  calendarEventId?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Official assignments require Supabase.");

  const { data, error } = await service
    .from("official_assignments")
    .insert({
      official_user_id: input.officialUserId,
      role: input.role,
      event_title: input.eventTitle.trim(),
      notes: input.notes?.trim() ?? "",
      calendar_event_id: input.calendarEventId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOfficialAssignmentStatus(id: string, status: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Official assignments require Supabase.");
  const { error } = await service.from("official_assignments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}
