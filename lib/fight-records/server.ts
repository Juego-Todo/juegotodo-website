import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  toPublicEventCard,
  toPublicFighter,
  type PublicBoutHistoryItem,
  type PublicEventSummary,
  type PublicFighter,
} from "@/lib/fight-records/public";
import { slugifyFighter } from "@/lib/fight-records/normalize";
import type { ImportPreview } from "@/lib/fight-records/import-types";

function service() {
  if (!isSupabaseConfigured()) return null;
  return createSupabaseServiceClient();
}

function ilikeTerm(value: string) {
  return value.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

export async function listPublicFighters(filters?: {
  q?: string;
  gym?: string;
  division?: string;
  category?: string;
}): Promise<PublicFighter[]> {
  const client = service();
  if (!client) return [];

  let query = client
    .from("fighters_public")
    .select("id, slug, display_name, nickname, gym, hometown, height, weight_class, photo_url, is_minor, claim_status, user_id, public_visibility")
    .eq("public_visibility", true)
    .order("display_name");

  const gym = filters?.gym ? ilikeTerm(filters.gym) : "";
  const division = filters?.division ? ilikeTerm(filters.division) : "";
  const q = filters?.q ? ilikeTerm(filters.q) : "";
  if (gym) query = query.ilike("gym", `%${gym}%`);
  if (division) query = query.ilike("weight_class", `%${division}%`);
  if (q) query = query.or(`display_name.ilike.%${q}%,nickname.ilike.%${q}%,gym.ilike.%${q}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  let rows = data;
  const category = filters?.category?.trim().toLowerCase() ?? "";
  if (category) {
    const { data: categoryBouts } = await client.from("bouts").select("id").eq("category", category);
    const boutIds = (categoryBouts ?? []).map((bout) => bout.id);
    if (boutIds.length === 0) return [];
    const { data: participants } = await client
      .from("bout_participants")
      .select("fighter_id")
      .in("bout_id", boutIds);
    const allowed = new Set((participants ?? []).map((row) => row.fighter_id));
    rows = rows.filter((row) => allowed.has(row.id));
  }

  const { data: records } = await client.from("fighter_records").select("*");
  const byId = new Map((records ?? []).map((row) => [row.fighter_id, row]));

  return rows.map((row) => {
    const record = byId.get(row.id);
    return toPublicFighter({
      ...row,
      wins: record?.wins,
      losses: record?.losses,
      draws: record?.draws,
    });
  });
}

export async function getPublicFighterBySlug(slug: string): Promise<{
  fighter: PublicFighter;
  history: PublicBoutHistoryItem[];
} | null> {
  const client = service();
  if (!client) return null;

  const { data: fighter } = await client.from("fighters_public").select("*").eq("slug", slug).maybeSingle();
  if (!fighter || !fighter.public_visibility) return null;

  const { data: record } = await client.from("fighter_records").select("*").eq("fighter_id", fighter.id).maybeSingle();
  const { data: participation } = await client
    .from("bout_participants")
    .select("*, bouts(*, events(*)), fighters:fighter_id(id, slug, display_name)")
    .eq("fighter_id", fighter.id);

  // Fetch opponents per bout
  const boutIds = (participation ?? []).map((row) => row.bout_id);
  const { data: allParticipants } = boutIds.length
    ? await client
        .from("bout_participants")
        .select("bout_id, corner, result, fighter_id, fighters:fighter_id(id, slug, display_name)")
        .in("bout_id", boutIds)
    : { data: [] as Array<Record<string, unknown>> };

  const byBout = new Map<string, Array<Record<string, unknown>>>();
  for (const row of allParticipants ?? []) {
    const list = byBout.get(String(row.bout_id)) ?? [];
    list.push(row);
    byBout.set(String(row.bout_id), list);
  }

  const history: PublicBoutHistoryItem[] = (participation ?? [])
    .map((row) => {
      const bout = row.bouts as {
        id: string;
        event_id: string;
        bout_order: number;
        bout_label: string;
        category: string;
        division: string;
        method: string;
        round: string;
        time_remaining: string;
        events: { id: string; name: string; event_date: string | null };
      } | null;
      if (!bout) return null;
      const peers = byBout.get(row.bout_id) ?? [];
      const opponent = peers.find((peer) => peer.fighter_id !== fighter.id);
      const opponentFighter = opponent?.fighters as { id: string; slug: string; display_name: string } | undefined;
      return {
        boutId: bout.id,
        eventId: bout.events?.id || bout.event_id,
        eventName: bout.events?.name || "",
        eventDate: bout.events?.event_date ?? null,
        boutOrder: bout.bout_order,
        boutLabel: bout.bout_label,
        category: bout.category,
        division: bout.division,
        method: bout.method,
        round: bout.round,
        timeRemaining: bout.time_remaining,
        result: row.result,
        corner: row.corner,
        opponent: opponentFighter
          ? { id: opponentFighter.id, slug: opponentFighter.slug, displayName: opponentFighter.display_name }
          : null,
      } satisfies PublicBoutHistoryItem;
    })
    .filter((row): row is PublicBoutHistoryItem => Boolean(row))
    .sort((a, b) => String(b.eventDate || "").localeCompare(String(a.eventDate || "")));

  return {
    fighter: toPublicFighter({
      ...fighter,
      wins: record?.wins,
      losses: record?.losses,
      draws: record?.draws,
    }),
    history,
  };
}

export async function listPublicEvents(): Promise<PublicEventSummary[]> {
  const client = service();
  if (!client) return [];
  const { data, error } = await client
    .from("events")
    .select("id, name, event_date, venue, series")
    .order("event_date", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    eventDate: row.event_date,
    venue: row.venue,
    series: row.series,
  }));
}

export async function getPublicEventById(eventId: string) {
  const client = service();
  if (!client) return null;
  const { data: event } = await client.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!event) return null;
  const { data: bouts } = await client
    .from("bouts")
    .select("*, bout_participants(*, fighters:fighter_id(id, slug, display_name, nickname, gym))")
    .eq("event_id", eventId)
    .order("bout_order");
  return toPublicEventCard(
    {
      id: event.id,
      name: event.name,
      event_date: event.event_date,
      venue: event.venue,
      series: event.series,
    },
    bouts ?? [],
  );
}

export async function applyImportPreview(preview: ImportPreview, batchId: string) {
  const client = service();
  if (!client) throw new Error("Supabase service role required for import.");

  const fighterIdByKey = new Map<string, string>();

  for (const candidate of preview.fighters) {
    const fighter = candidate.fighter;
    const baseSlug = slugifyFighter(fighter.displayName) || `fighter-${batchId.slice(0, 6)}`;
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const { data: existingSlug } = await client.from("fighters").select("id").eq("slug", slug).maybeSingle();
      if (!existingSlug) break;
      slug = `${baseSlug.slice(0, 70)}-${suffix}`;
      suffix += 1;
    }

    const { data: existing } = await client
      .from("fighters")
      .select("id")
      .eq("normalized_name", fighter.normalizedName)
      .eq("gym", fighter.gym)
      .maybeSingle();

    if (existing) {
      fighterIdByKey.set(candidate.key, existing.id);
      await client
        .from("fighters")
        .update({
          nickname: fighter.nickname,
          hometown: fighter.hometown,
          height: fighter.height,
          weight_class: fighter.weightClass,
          photo_source_url: fighter.photoSourceUrl,
          date_of_birth: fighter.dateOfBirth,
          normalized_name: fighter.normalizedName,
        })
        .eq("id", existing.id);
      continue;
    }

    if (candidate.ambiguousMatches.length > 0) {
      await client.from("fighter_match_reviews").upsert(
        {
          import_batch_id: batchId,
          candidate_normalized_name: fighter.normalizedName,
          candidate_first_name: fighter.firstName,
          candidate_last_name: fighter.lastName,
          candidate_gym: fighter.gym,
          status: "pending",
          payload: candidate as never,
        },
        { onConflict: "id" },
      );
    }

    const { data: inserted, error } = await client
      .from("fighters")
      .insert({
        slug,
        first_name: fighter.firstName,
        last_name: fighter.lastName,
        display_name: fighter.displayName,
        nickname: fighter.nickname,
        gym: fighter.gym,
        hometown: fighter.hometown,
        height: fighter.height,
        weight_class: fighter.weightClass,
        photo_source_url: fighter.photoSourceUrl,
        date_of_birth: fighter.dateOfBirth,
        normalized_name: fighter.normalizedName,
        claim_status: "unclaimed",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    fighterIdByKey.set(candidate.key, inserted.id);
  }

  for (const event of preview.events) {
    const { data: eventRow, error: eventError } = await client
      .from("events")
      .upsert(
        {
          name: event.name,
          event_date: event.eventDate,
          venue: event.venue,
          series: event.series,
          source_key: event.sourceKey,
        },
        { onConflict: "source_key" },
      )
      .select("id")
      .single();
    if (eventError) throw new Error(eventError.message);

    for (const bout of event.bouts) {
      const { data: boutRow, error: boutError } = await client
        .from("bouts")
        .upsert(
          {
            event_id: eventRow.id,
            bout_order: bout.boutOrder,
            bout_label: bout.boutLabel,
            category: bout.category || "",
            division: bout.division,
            weight_class: bout.weightClass,
            format: bout.format,
            method: bout.method,
            round: bout.round,
            time_remaining: bout.timeRemaining,
            referee: bout.referee,
            source_key: bout.sourceKey,
          },
          { onConflict: "source_key" },
        )
        .select("id")
        .single();
      if (boutError) throw new Error(boutError.message);

      for (const participant of bout.participants) {
        const key = `${participant.fighter.normalizedName}||${participant.fighter.normalizedGym}`;
        const fighterId = fighterIdByKey.get(key);
        if (!fighterId) continue;
        await client.from("bout_participants").upsert(
          {
            bout_id: boutRow.id,
            fighter_id: fighterId,
            corner: participant.corner,
            result: participant.result || "",
            record_at_time: participant.recordAtTime,
          },
          { onConflict: "bout_id,corner" },
        );
      }
    }
  }

  for (const summary of preview.summaries) {
    await client.from("sheet_record_snapshots").insert({
      import_batch_id: batchId,
      event_source_key: summary.eventSourceKey,
      fighter_first_name: summary.firstName,
      fighter_last_name: summary.lastName,
      corner: summary.corner,
      wins: summary.wins,
      losses: summary.losses,
      draws: summary.draws,
    });
  }

  return { ok: true, batchId, fighters: fighterIdByKey.size, events: preview.events.length };
}
