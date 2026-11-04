import { isMinorDob } from "@/lib/fight-records/normalize";

export type PublicFighter = {
  id: string;
  slug: string;
  displayName: string;
  nickname: string;
  gym: string;
  hometown: string | null;
  height: string;
  weightClass: string;
  photoUrl: string;
  isMinor: boolean;
  claimStatus: string;
  userId: string | null;
  wins: number;
  losses: number;
  draws: number;
};

export type PublicBoutHistoryItem = {
  boutId: string;
  eventId: string;
  eventName: string;
  eventDate: string | null;
  boutOrder: number;
  boutLabel: string;
  category: string;
  division: string;
  method: string;
  round: string;
  timeRemaining: string;
  result: string;
  corner: string;
  opponent: {
    id: string;
    slug: string;
    displayName: string;
  } | null;
};

export type PublicEventSummary = {
  id: string;
  name: string;
  eventDate: string | null;
  venue: string;
  series: string;
};

export type PublicEventParticipant = {
  corner: string;
  result: string;
  fighter: {
    id: string;
    slug: string;
    displayName: string;
    nickname: string;
    gym: string;
  } | null;
};

export type PublicEventBout = {
  id: string;
  boutOrder: number;
  boutLabel: string;
  category: string;
  division: string;
  weightClass: string;
  format: string;
  method: string;
  round: string;
  timeRemaining: string;
  participants: PublicEventParticipant[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readEmbeddedFighter(value: unknown): PublicEventParticipant["fighter"] {
  const row = asRecord(Array.isArray(value) ? value[0] : value);
  if (!row) return null;
  const id = String(row.id ?? "");
  const slug = String(row.slug ?? "");
  if (!id || !slug) return null;
  return {
    id,
    slug,
    displayName: String(row.display_name ?? ""),
    nickname: String(row.nickname ?? ""),
    gym: String(row.gym ?? ""),
  };
}

/** Public event card. Fighter embeds keep display fields only. */
export function toPublicEventCard(
  event: {
    id: string;
    name: string;
    event_date: string | null;
    venue?: string | null;
    series?: string | null;
  },
  bouts: unknown,
): { event: PublicEventSummary; bouts: PublicEventBout[] } {
  const publicBouts = asArray(bouts)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row?.id) return null;
      const participants = asArray(row.bout_participants)
        .map((participant) => {
          const part = asRecord(participant);
          if (!part) return null;
          return {
            corner: String(part.corner ?? ""),
            result: String(part.result ?? ""),
            fighter: readEmbeddedFighter(part.fighters),
          } satisfies PublicEventParticipant;
        })
        .filter((participant): participant is PublicEventParticipant => Boolean(participant))
        .sort((a, b) => a.corner.localeCompare(b.corner));

      return {
        id: String(row.id),
        boutOrder: Number(row.bout_order ?? 0),
        boutLabel: String(row.bout_label ?? ""),
        category: String(row.category ?? ""),
        division: String(row.division ?? ""),
        weightClass: String(row.weight_class ?? ""),
        format: String(row.format ?? ""),
        method: String(row.method ?? ""),
        round: String(row.round ?? ""),
        timeRemaining: String(row.time_remaining ?? ""),
        participants,
      } satisfies PublicEventBout;
    })
    .filter((bout): bout is PublicEventBout => Boolean(bout))
    .sort((a, b) => a.boutOrder - b.boutOrder);

  return {
    event: {
      id: event.id,
      name: event.name,
      eventDate: event.event_date,
      venue: event.venue ?? "",
      series: event.series ?? "",
    },
    bouts: publicBouts,
  };
}

/** Strip private fields for public payloads. */
export function toPublicFighter(row: {
  id: string;
  slug: string;
  display_name: string;
  nickname: string;
  gym: string;
  hometown: string;
  height: string;
  weight_class: string;
  photo_url: string;
  date_of_birth?: string | null;
  is_minor?: boolean | null;
  claim_status: string;
  user_id: string | null;
  wins?: number;
  losses?: number;
  draws?: number;
}): PublicFighter {
  const minor = row.is_minor ?? isMinorDob(row.date_of_birth ?? null);
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    nickname: row.nickname,
    gym: row.gym,
    hometown: minor ? null : row.hometown || null,
    height: row.height,
    weightClass: row.weight_class,
    photoUrl: row.photo_url,
    isMinor: Boolean(minor),
    claimStatus: row.claim_status,
    userId: row.user_id,
    wins: Number(row.wins ?? 0),
    losses: Number(row.losses ?? 0),
    draws: Number(row.draws ?? 0),
  };
}
