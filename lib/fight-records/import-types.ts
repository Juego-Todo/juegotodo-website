export type ImportedCorner = "blue" | "red";

export type ImportedFighterDraft = {
  firstName: string;
  lastName: string;
  displayName: string;
  nickname: string;
  gym: string;
  hometown: string;
  height: string;
  weightClass: string;
  photoSourceUrl: string;
  dateOfBirth: string | null;
  normalizedName: string;
  normalizedGym: string;
};

export type ImportedParticipantDraft = {
  corner: ImportedCorner;
  fighter: ImportedFighterDraft;
  result: "win" | "loss" | "draw" | "no_contest" | "";
  recordAtTime: string;
};

export type ImportedBoutDraft = {
  boutOrder: number;
  boutLabel: string;
  category: "minor" | "female" | "amateur" | "pro" | "";
  division: string;
  weightClass: string;
  format: string;
  method: string;
  round: string;
  timeRemaining: string;
  referee: string;
  sourceKey: string;
  participants: ImportedParticipantDraft[];
};

export type ImportedEventDraft = {
  name: string;
  eventDate: string | null;
  venue: string;
  series: string;
  sourceKey: string;
  sheetName: string;
  bouts: ImportedBoutDraft[];
};

export type SheetSummaryRow = {
  eventSourceKey: string;
  firstName: string;
  lastName: string;
  corner: string;
  wins: number;
  losses: number;
  draws: number;
  normalizedName: string;
};

export type FighterMatchCandidate = {
  key: string;
  fighter: ImportedFighterDraft;
  occurrences: number;
  ambiguousMatches: Array<{ slug: string; displayName: string; gym: string }>;
};

export type RecordMismatch = {
  eventSourceKey: string;
  fighterName: string;
  corner: string;
  sheet: { wins: number; losses: number; draws: number };
  computed: { wins: number; losses: number; draws: number };
};

export type ImportPreview = {
  events: ImportedEventDraft[];
  fighters: FighterMatchCandidate[];
  summaries: SheetSummaryRow[];
  mismatches: RecordMismatch[];
  reviewQueue: FighterMatchCandidate[];
  totals: {
    events: number;
    bouts: number;
    participants: number;
    uniqueFighters: number;
  };
};
