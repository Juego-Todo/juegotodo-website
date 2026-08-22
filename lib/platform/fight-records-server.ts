import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type FightRecordEntry = {
  id: string;
  fighterSlug: string;
  opponentName: string;
  eventTitle: string;
  eventDate: string | null;
  result: string;
  method: string;
  round: string;
};

export async function listFightRecords(fighterSlug: string): Promise<FightRecordEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("fight_records")
    .select("id, fighter_slug, opponent_name, event_title, event_date, result, method, round")
    .eq("fighter_slug", fighterSlug)
    .order("event_date", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    fighterSlug: row.fighter_slug,
    opponentName: row.opponent_name,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    result: row.result,
    method: row.method,
    round: row.round,
  }));
}

export async function upsertFightRecord(input: {
  fighterSlug: string;
  opponentName: string;
  eventTitle: string;
  eventDate?: string | null;
  result: string;
  method?: string;
  round?: string;
  fighterUserId?: string | null;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Fight records require Supabase.");

  const { error } = await service.from("fight_records").insert({
    fighter_slug: input.fighterSlug,
    fighter_user_id: input.fighterUserId ?? null,
    opponent_name: input.opponentName.trim(),
    event_title: input.eventTitle.trim(),
    event_date: input.eventDate ?? null,
    result: input.result.trim(),
    method: input.method?.trim() ?? "",
    round: input.round?.trim() ?? "",
  });

  if (error) throw new Error(error.message);
}
