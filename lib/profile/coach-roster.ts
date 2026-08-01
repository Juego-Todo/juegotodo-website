/**
 * Coach–fighter roster links (LocalStorage MVP).
 * A Supabase `coach_fighter_links` table replaces this later; the API surface
 * is kept small so the swap is a drop-in.
 */

const COACH_ROSTER_KEY = "juego-todo.coach.roster";

export type CoachRosterEntry = {
  id: string;
  fighterName: string;
  addedAt: string;
};

type CoachRosterRecord = {
  coachName: string;
  fighters: CoachRosterEntry[];
};

type CoachRosterStore = Record<string, CoachRosterRecord>;

function readStore(): CoachRosterStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(COACH_ROSTER_KEY);
    return raw ? (JSON.parse(raw) as CoachRosterStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CoachRosterStore) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(COACH_ROSTER_KEY, JSON.stringify(store));
}

export function getCoachRoster(coachId: string): CoachRosterEntry[] {
  return readStore()[coachId]?.fighters ?? [];
}

export function linkFighterToCoach(
  coachId: string,
  coachName: string,
  fighterName: string,
): CoachRosterEntry[] {
  const trimmed = fighterName.trim();
  if (!trimmed) {
    return getCoachRoster(coachId);
  }

  const store = readStore();
  const record = store[coachId] ?? { coachName, fighters: [] };
  const exists = record.fighters.some(
    (entry) => entry.fighterName.toLowerCase() === trimmed.toLowerCase(),
  );

  if (!exists) {
    record.fighters.push({
      id: crypto.randomUUID(),
      fighterName: trimmed,
      addedAt: new Date().toISOString(),
    });
  }

  store[coachId] = { ...record, coachName };
  writeStore(store);
  return store[coachId].fighters;
}

export function unlinkFighterFromCoach(coachId: string, entryId: string): CoachRosterEntry[] {
  const store = readStore();
  const record = store[coachId];
  if (!record) {
    return [];
  }

  record.fighters = record.fighters.filter((entry) => entry.id !== entryId);
  writeStore(store);
  return record.fighters;
}

/** Reverse lookup: which coach has this fighter on their roster (matched by name). */
export function getFighterCoach(fighterName: string): { coachId: string; coachName: string } | null {
  const trimmed = fighterName.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const store = readStore();
  for (const [coachId, record] of Object.entries(store)) {
    if (record.fighters.some((entry) => entry.fighterName.toLowerCase() === trimmed)) {
      return { coachId, coachName: record.coachName };
    }
  }
  return null;
}
