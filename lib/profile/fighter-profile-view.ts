import type { FighterFightResult } from "@/data/fighter-details";
import type { AthleteCredentialProfile } from "@/data/profile-credentials";
import { events, fighters } from "@/data/site";
import type { LicenseApplication } from "@/data/license-applications";
import type { ProfileIdentity } from "@/lib/profile/identity";
import type { UserProfile } from "@/lib/auth/types";
import type { MemberRecord } from "@/lib/profile/member-record";

export type ChampionshipTitle = {
  label: string;
  tier: "national" | "regional" | "former" | "license";
};

export type AccoladeCard = {
  icon: string;
  title: string;
  subtitle: string;
  tier: "gold" | "silver" | "bronze";
};

export type GalleryPhoto = {
  id: string;
  label: string;
  category: string;
  image: string;
  tone: string;
};

export type WeightCutTracker = {
  currentKg: number;
  targetKg: number;
  progressPercent: number;
};

export type RankMovement = {
  current: number;
  previous: number;
  periodLabel: string;
};

export type FightTimelineEntry = FighterFightResult & {
  posterTone: string;
  eventSlug?: string;
  round?: string;
  finishType?: string;
};

export type UpcomingFight = {
  event: string;
  opponent: string;
  opponentRecord: string;
  opponentRank: number;
  opponentHeight: string;
  opponentReach: string;
  date: string;
  dateLabel: string;
  daysRemaining: number;
  venue: string;
  posterTone: string;
};

export type FightCampChecklistItem = {
  label: string;
  status: "complete" | "pending" | "upcoming";
  dueLabel: string;
};

export type FightCampStaff = {
  role: string;
  name: string;
};

export type FightCamp = {
  daysRemaining: number;
  campWeek: number;
  totalWeeks: number;
  checklist: FightCampChecklistItem[];
  staff: FightCampStaff[];
};

export type CareerProgressTier = {
  label: string;
  percent: number;
};

export type CareerStoryStep = {
  label: string;
  detail: string;
  state: "complete" | "current" | "upcoming";
};

export type TaleOfTheTapeEntry = {
  label: string;
  value: string;
};

export type FighterRanking = {
  national: string;
  regional: string;
  international: string;
};

export type SignatureStyle = {
  primaryStyle: string;
  secondaryStyle: string;
  favoriteWeapon: string;
  stance: string;
  finishPreference: string;
};

export type CareerSnapshotStat = {
  label: string;
  value: string;
};

export type CareerHonor = {
  label: string;
};

export type RelatedFighter = {
  name: string;
  slug?: string;
  record: string;
  division: string;
};

export type FighterInformation = {
  coach: string;
  gym: string;
  team: string;
  country: string;
  region: string;
  debut: string;
  license: string;
  licenseStatus: string;
};

export type TaleOfTheTapeRow = {
  label: string;
  you: string;
  opponent: string;
};

export type FighterDashboardMode = "career" | "fight_camp";

export type FighterProfileView = {
  athlete: AthleteCredentialProfile;
  displayName: string;
  licenseCode: string;
  countryFlag: string;
  countryLabel: string;
  age: number;
  coach: string;
  championships: ChampionshipTitle[];
  accolades: AccoladeCard[];
  gallery: GalleryPhoto[];
  weightCut: WeightCutTracker;
  rankMovement: RankMovement;
  fightTimeline: FightTimelineEntry[];
  koRate: number;
  portraitInitials: string;
  portraitImage?: string;
  actionBackground: string;
  upcomingFight: UpcomingFight | null;
  fightCamp: FightCamp | null;
  mode: FighterDashboardMode;
  careerProgress: CareerProgressTier[];
  careerStory: CareerStoryStep[];
  taleOfTheTape: TaleOfTheTapeEntry[];
  medicalExpiryDays: number;
  biography: string;
  rankings: FighterRanking;
  signatureStyle: SignatureStyle;
  careerSnapshot: CareerSnapshotStat[];
  fighterInformation: FighterInformation;
  careerHonors: CareerHonor[];
  relatedFighters: RelatedFighter[];
  winRate: number;
  finishRate: number;
  avgFightTime: string;
};

const countryFlags: Record<string, string> = {
  Philippines: "🇵🇭",
  "Metro Manila": "🇵🇭",
};

const galleryAssets = [
  "/juego-todo-event-background.png",
  "/hero-background.png",
  "/partners-hero-background.png",
  "/weight-divisions-section.png",
  "/shop-hero-banner.png",
  "/juego-todo-event-background.png",
];

const galleryCategories = ["Fight Photo", "Walkout", "Faceoff", "Weigh-in", "Training", "Victory"];

function parseRankNumber(rank: string) {
  const match = rank.match(/#(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 12;
}

function parseWeightKg(weight: string) {
  const match = weight.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 70;
}

function parsePhysicalValue(value: string) {
  return value.replace(/\s+/g, "");
}

function matchEventPoster(eventName: string) {
  const normalized = eventName.toLowerCase();
  const matched =
    events.find((event) => normalized.includes(event.slug.replace(/-/g, " "))) ??
    events.find((event) => normalized.includes(event.title.toLowerCase().replace("juego todo: ", ""))) ??
    events.find((event) => {
      const tokens = event.slug.split("-").filter((token) => token.length > 2);
      return tokens.some((token) => normalized.includes(token));
    });

  return {
    posterTone: matched?.posterTone ?? "from-red-950 via-black to-zinc-950",
    eventSlug: matched?.slug,
  };
}

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function parseFightMethod(method: string) {
  const roundMatch = method.match(/R(\d+)/i);
  const finishType = method.replace(/\s*R\d+/i, "").trim() || method;
  return {
    round: roundMatch ? `Round ${roundMatch[1]}` : undefined,
    finishType,
  };
}

function enrichAccolades(athlete: AthleteCredentialProfile): AccoladeCard[] {
  return [
    { icon: "🏆", title: "Regional Champion", subtitle: "2026 JT Regional Series", tier: "gold" },
    { icon: "🌙", title: "Fight of the Night", subtitle: "UGB46 Proclamation Anniversary", tier: "silver" },
    { icon: "⚡", title: "Fastest KO", subtitle: "Round 1 · 2:14", tier: "bronze" },
    { icon: "💰", title: "Performance Bonus", subtitle: `${athlete.wins} career wins`, tier: "silver" },
  ];
}

function enrichGallery(athlete: AthleteCredentialProfile): GalleryPhoto[] {
  const tones = [
    "from-red-950/80 via-black/60 to-transparent",
    "from-black/70 via-red-950/50 to-transparent",
    "from-zinc-950/80 via-black/50 to-transparent",
    "from-red-900/70 via-black/60 to-transparent",
    "from-black/80 via-zinc-900/40 to-transparent",
    "from-red-950/70 via-yellow-950/20 to-transparent",
  ];

  return galleryCategories.map((category, index) => ({
    id: category.toLowerCase().replace(/\s+/g, "-"),
    label: `${athlete.division}`,
    category,
    image: galleryAssets[index] ?? galleryAssets[0]!,
    tone: tones[index] ?? tones[0]!,
  }));
}

function enrichChampionships(athlete: AthleteCredentialProfile, licenseCode: string): ChampionshipTitle[] {
  const titles: ChampionshipTitle[] = [
    { label: "National Champion", tier: "national" },
    { label: "Regional Champion", tier: "regional" },
    { label: `${licenseCode} License`, tier: "license" },
  ];

  for (const achievement of athlete.achievements) {
    const lower = achievement.toLowerCase();
    if (lower.includes("champion") && !titles.some((title) => title.label.includes(achievement))) {
      titles.unshift({
        label: achievement.replace(/^\d{4}\s*/, ""),
        tier: lower.includes("regional") ? "regional" : lower.includes("former") ? "former" : "national",
      });
    }
  }

  return titles.slice(0, 4);
}

function buildUpcomingFight(athlete: AthleteCredentialProfile): UpcomingFight | null {
  const demo = athlete.upcomingFight;
  if (!demo) {
    return null;
  }

  const fightDate = new Date(demo.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  fightDate.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil((fightDate.getTime() - today.getTime()) / 86_400_000));
  const poster = matchEventPoster(demo.event);

  return {
    ...demo,
    daysRemaining: demo.forceCampMode ? 24 : daysRemaining,
    dateLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(fightDate),
    posterTone: poster.posterTone,
  };
}

function buildFightCamp(upcoming: UpcomingFight | null, view: { coach: string; gym: string }): FightCamp | null {
  if (!upcoming || upcoming.daysRemaining > 30) {
    return null;
  }

  return {
    daysRemaining: upcoming.daysRemaining,
    campWeek: 4,
    totalWeeks: 8,
    checklist: [
      { label: "Medical", status: "complete", dueLabel: "✓ Cleared" },
      { label: "Fight Contract", status: "complete", dueLabel: "✓ Signed" },
      { label: "Walkout Music", status: "pending", dueLabel: "Pending" },
      { label: "Poster Shoot", status: "upcoming", dueLabel: "Tomorrow" },
      { label: "Open Workouts", status: "upcoming", dueLabel: "3 Days" },
      { label: "Official Weigh-in", status: "upcoming", dueLabel: "Friday" },
      { label: "Fight Night", status: "upcoming", dueLabel: upcoming.dateLabel },
    ],
    staff: [
      { role: "Coach", name: view.coach },
      { role: "Nutritionist", name: "Maria Santos" },
      { role: "Strength Coach", name: "Jon Reyes" },
      { role: "Physio", name: "Dr. Ana Lim" },
      { role: "Gym", name: view.gym },
    ],
  };
}

function buildCareerProgress(athlete: AthleteCredentialProfile): CareerProgressTier[] {
  return [
    { label: "Amateur", percent: 100 },
    { label: "Professional", percent: 82 },
    { label: "Regional", percent: 100 },
    { label: "National", percent: 68 },
    { label: "International", percent: 24 },
  ].slice(0, 5);
}

function buildBiography(input: {
  displayName: string;
  athlete: AthleteCredentialProfile;
  coach: string;
  nationalRank: number;
}) {
  const { displayName, athlete, coach, nationalRank } = input;
  const record = athlete.record.replace(/-0$/, "");
  const customBio = athlete.biography?.trim();

  if (customBio) {
    return customBio;
  }

  return `${displayName} is a licensed professional Juego Todo fighter representing ${athlete.gym}. Competing in the ${athlete.division} division, they have built a ${record} professional record and are currently ranked #${nationalRank} nationally. Known for ${athlete.physical.fightStyle.toLowerCase()} and disciplined approach under ${coach}, they have earned recognition as a Regional Champion and National Finalist.`;
}

function buildCareerHonors(athlete: AthleteCredentialProfile): CareerHonor[] {
  return [
    { label: "National Champion" },
    { label: "Regional Champion" },
    { label: "Fight of the Night ×2" },
    { label: "Performance Bonus ×4" },
    { label: "Fastest KO" },
    ...athlete.achievements.slice(0, 2).map((achievement) => ({ label: achievement })),
  ].slice(0, 6);
}

function buildRelatedFighters(athlete: AthleteCredentialProfile): RelatedFighter[] {
  const opponents = athlete.fightHistory.map((fight) => fight.opponent);
  const fromRoster = fighters
    .filter(
      (fighter) =>
        fighter.division === athlete.division ||
        opponents.some((name) => fighter.name.includes(name.split(" ")[0] ?? "")),
    )
    .slice(0, 4);

  if (fromRoster.length >= 3) {
    return fromRoster.map((fighter) => ({
      name: fighter.name,
      slug: fighter.slug,
      record: fighter.record,
      division: fighter.division,
    }));
  }

  return [
    { name: "Carlos Soriano", record: "11-3", division: athlete.division },
    { name: "Kenji Sato", record: "9-2", division: athlete.division },
    { name: "Miguel Reyes", slug: "miguel-lakan-reyes", record: "8-1", division: "Welterweight" },
    { name: "John Cruz", record: "10-4", division: athlete.division },
  ];
}

function buildPublicTaleOfTheTape(athlete: AthleteCredentialProfile, age: number): TaleOfTheTapeEntry[] {
  return [
    { label: "Height", value: athlete.physical.height.replace(" ", "") },
    { label: "Reach", value: athlete.physical.reach.replace(" ", "") },
    { label: "Weight Class", value: athlete.division },
    { label: "Stance", value: athlete.physical.stance },
    { label: "Age", value: `${age}` },
  ];
}

function buildCareerSnapshot(athlete: AthleteCredentialProfile): CareerSnapshotStat[] {
  return [
    { label: "Professional Fights", value: `${athlete.matchCount}` },
    { label: "Wins", value: `${athlete.wins}` },
    { label: "Losses", value: `${athlete.losses}` },
    { label: "KO Wins", value: `${athlete.koWins}` },
    { label: "Submission Wins", value: `${athlete.submissionWins}` },
    { label: "Decision Wins", value: `${athlete.decisionWins}` },
  ];
}

function buildCareerStory(athlete: AthleteCredentialProfile, rank: number, streak: number): CareerStoryStep[] {
  return [
    { label: "Joined JT", detail: "Platform member", state: "complete" },
    { label: "First Fight", detail: "Official debut", state: "complete" },
    { label: "First Win", detail: "Sanctioned victory", state: "complete" },
    { label: "Regional Champion", detail: "Title earned", state: "complete" },
    { label: `${streak} Fight Win Streak`, detail: "Active momentum", state: "current" },
    { label: `National Top ${rank}`, detail: `#${rank} ranking`, state: "current" },
  ];
}

export function buildFighterProfileView(input: {
  user: UserProfile;
  identity: ProfileIdentity;
  athlete: AthleteCredentialProfile;
  memberRecord: MemberRecord;
  licenseApplication: LicenseApplication | null;
  userPortrait?: string | null;
}): FighterProfileView {
  const { user, athlete, licenseApplication, userPortrait } = input;
  const answers = licenseApplication?.backgroundAnswers ?? {};
  const currentRank = parseRankNumber(athlete.rank);
  const previousRank = athlete.rankMovement?.previous ?? Math.min(currentRank + 2, 99);
  const targetWeight = parseWeightKg(athlete.physical.weight);
  const currentWeight = athlete.weightCut?.currentKg ?? targetWeight + 4;
  const weightToLose = Math.max(currentWeight - targetWeight, 0);
  const progressPercent =
    athlete.weightCut?.progressPercent ??
    (weightToLose > 0 ? Math.round(((weightToLose - (currentWeight - targetWeight)) / weightToLose) * 100) : 100);

  const licenseCode = licenseApplication?.restrictionCode ?? "JT11";
  const upcomingFight = buildUpcomingFight(athlete);
  const coach = athlete.coach ?? answers.coachName ?? "Head Coach";

  const fightTimeline: FightTimelineEntry[] = athlete.fightHistory.map((fight) => {
    const poster = matchEventPoster(fight.event);
    const parsed = parseFightMethod(fight.method);
    return { ...fight, ...poster, ...parsed };
  });

  const koRate = athlete.wins > 0 ? Math.round((athlete.koWins / athlete.wins) * 100) : athlete.finishRate;
  const fightCamp = buildFightCamp(upcomingFight, { coach, gym: athlete.gym });
  const age = athlete.age ?? 28;
  const licenseStatus = athlete.status;

  return {
    athlete,
    displayName: user.fullName,
    licenseCode,
    countryFlag: countryFlags[athlete.country] ?? "🇵🇭",
    countryLabel: athlete.country,
    age,
    coach,
    championships: enrichChampionships(athlete, licenseCode),
    accolades: enrichAccolades(athlete),
    gallery: enrichGallery(athlete),
    weightCut: {
      currentKg: currentWeight,
      targetKg: targetWeight,
      progressPercent: Math.min(95, Math.max(20, progressPercent || 82)),
    },
    rankMovement: athlete.rankMovement ?? {
      current: currentRank,
      previous: previousRank,
      periodLabel: "Last Month",
    },
    fightTimeline,
    koRate,
    portraitInitials: buildInitials(user.fullName),
    portraitImage: userPortrait ?? athlete.portraitImage,
    actionBackground: athlete.actionBackground ?? "/juego-todo-event-background.png",
    upcomingFight,
    fightCamp,
    mode: fightCamp ? "fight_camp" : "career",
    careerProgress: buildCareerProgress(athlete),
    careerStory: buildCareerStory(athlete, currentRank, athlete.winStreak ?? 0),
    taleOfTheTape: buildPublicTaleOfTheTape(athlete, age),
    medicalExpiryDays: 94,
    biography: buildBiography({ displayName: user.fullName, athlete, coach, nationalRank: currentRank }),
    rankings: {
      national: `#${currentRank}`,
      regional: "#2",
      international: "#145",
    },
    signatureStyle: {
      primaryStyle: "Juego Todo",
      secondaryStyle: athlete.physical.fightStyle.split("/")[1]?.trim() ?? "Boxing",
      favoriteWeapon: athlete.physical.weaponSpecialty,
      stance: athlete.physical.stance,
      finishPreference: athlete.koWins >= athlete.submissionWins ? "KO/TKO" : "Submission",
    },
    careerSnapshot: buildCareerSnapshot(athlete),
    fighterInformation: {
      coach,
      gym: athlete.gym,
      team: athlete.team,
      country: athlete.country,
      region: athlete.region,
      debut: athlete.debut ?? "2023",
      license: licenseCode,
      licenseStatus,
    },
    careerHonors: buildCareerHonors(athlete),
    relatedFighters: buildRelatedFighters(athlete),
    winRate: athlete.winRate,
    finishRate: athlete.finishRate,
    avgFightTime: athlete.statistics.avgFightTime,
  };
}

export function shouldShowFighterProfile(roleKind: string, athlete?: AthleteCredentialProfile) {
  return roleKind === "fighter" && Boolean(athlete);
}
