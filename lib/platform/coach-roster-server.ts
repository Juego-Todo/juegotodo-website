import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CoachRosterLink = {
  id: string;
  coachUserId: string;
  fighterName: string;
  fighterSlug: string;
  status: string;
  notes: string;
  createdAt: string;
};

export async function listCoachRoster(coachUserId: string): Promise<CoachRosterLink[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("coach_roster_links")
    .select("*")
    .eq("coach_user_id", coachUserId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

function mapRow(row: {
  id: string;
  coach_user_id: string;
  fighter_name: string;
  fighter_slug: string;
  status: string;
  notes: string;
  created_at: string;
}): CoachRosterLink {
  return {
    id: row.id,
    coachUserId: row.coach_user_id,
    fighterName: row.fighter_name,
    fighterSlug: row.fighter_slug,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function upsertCoachRosterLink(input: {
  coachUserId: string;
  fighterName: string;
  fighterSlug: string;
  notes?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Coach roster requires Supabase.");

  const { data, error } = await service
    .from("coach_roster_links")
    .upsert(
      {
        coach_user_id: input.coachUserId,
        fighter_name: input.fighterName.trim(),
        fighter_slug: input.fighterSlug.trim(),
        notes: input.notes?.trim() ?? "",
        status: "active",
      },
      { onConflict: "coach_user_id,fighter_slug" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function removeCoachRosterLink(id: string, coachUserId: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Coach roster requires Supabase.");
  const { error } = await service
    .from("coach_roster_links")
    .delete()
    .eq("id", id)
    .eq("coach_user_id", coachUserId);
  if (error) throw new Error(error.message);
}
