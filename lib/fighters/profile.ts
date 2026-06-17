import { fighterDatabase, fighters, type Fighter, type FighterProfile } from "@/data/site";
import { fighterDetailExtras, parseRecord, type FighterDetailExtras } from "@/data/fighter-details";
import { teams } from "@/data/teams";

export type EnrichedFighterProfile = Fighter &
  Partial<FighterProfile> &
  Partial<FighterDetailExtras> & {
    wins: number;
    losses: number;
    country: string;
    teamSlug?: string;
  };

function buildEnrichedFighter(base: Fighter | FighterProfile): EnrichedFighterProfile | undefined {
  const slug = base.slug;
  const rosterEntry = fighters.find((entry) => entry.slug === slug);
  const profile = fighterDatabase.find((entry) => entry.slug === slug);
  const extras = fighterDetailExtras[slug];
  const record = rosterEntry?.record ?? profile?.record ?? "0-0";
  const parsed = parseRecord(record);
  const teamName = profile?.team ?? rosterEntry?.gym ?? "";
  const team = teams.find(
    (entry) => entry.name === teamName || entry.roster.some((fighter) => fighter.slug === slug),
  );

  return {
    slug,
    name: rosterEntry?.name ?? profile?.name ?? "",
    nickname: rosterEntry?.nickname ?? profile?.nickname ?? "",
    style: rosterEntry?.style ?? profile?.style ?? "",
    gym: rosterEntry?.gym ?? teamName,
    record,
    rank: rosterEntry?.rank ?? profile?.rank ?? "NR",
    division: rosterEntry?.division ?? profile?.division ?? "",
    highlight: rosterEntry?.highlight ?? `${rosterEntry?.name ?? profile?.name ?? "Fighter"} competes in the JTGC roster.`,
    ...profile,
    ...extras,
    wins: parsed.wins,
    losses: parsed.losses,
    country: profile?.nationality ?? "Philippines",
    region: extras?.region ?? "Philippines",
    rankNumber:
      extras?.rankNumber ??
      (() => {
        const rankValue = rosterEntry?.rank ?? profile?.rank ?? "";
        if (rankValue.toLowerCase().includes("champion")) {
          return 0;
        }
        const match = rankValue.match(/#(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 99;
      })(),
    teamSlug: team?.slug,
  };
}

export function getEnrichedFighter(slug: string): EnrichedFighterProfile | undefined {
  const rosterEntry = fighters.find((entry) => entry.slug === slug);
  const profile = fighterDatabase.find((entry) => entry.slug === slug);
  const source = rosterEntry ?? profile;

  if (!source) {
    return undefined;
  }

  return buildEnrichedFighter(source);
}

export function getAllEnrichedFighters(): EnrichedFighterProfile[] {
  const slugs = new Set([...fighters.map((entry) => entry.slug), ...fighterDatabase.map((entry) => entry.slug)]);

  return [...slugs]
    .map((slug) => getEnrichedFighter(slug))
    .filter((fighter): fighter is EnrichedFighterProfile => Boolean(fighter));
}

export function getAllFighterSlugs(): string[] {
  return [...new Set([...fighters.map((entry) => entry.slug), ...fighterDatabase.map((entry) => entry.slug)])];
}
