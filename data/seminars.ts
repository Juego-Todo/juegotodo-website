export type SeminarTopic = {
  slug: string;
  name: string;
  description: string;
  rulesFocus: string;
  audience: "First Timers" | "All Levels" | "Coaches";
};

export type ScheduledSeminar = {
  slug: string;
  title: string;
  topicSlugs: string[];
  date: string;
  time: string;
  venue: string;
  city: string;
  format: "In Person" | "Hybrid";
  pricing: {
    type: "free" | "paid";
    amount?: string;
    note: string;
  };
  capacity: number;
  spotsLeft: number;
  level: string;
  rulesFocus: string;
  summary: string;
  highlights: string[];
  tone: string;
};

export const seminarTopics: SeminarTopic[] = [
  {
    slug: "disarming",
    name: "Disarming",
    description: "Stick disarms, weapon retention, and safe re-entry under JT weapon rounds.",
    rulesFocus: "Doble Baston and Solo Baston allowed actions, fouls, and control standards.",
    audience: "First Timers",
  },
  {
    slug: "striking",
    name: "Striking",
    description: "Filipino boxing, elbows, and empty-hand entries for Mano y Mano rounds.",
    rulesFocus: "Panuntukan scoring, protected targets, and Round 3 striking limits.",
    audience: "First Timers",
  },
  {
    slug: "legs",
    name: "Legs",
    description: "Kicking range, sweeps, and low-line attacks from Sikaran and transition work.",
    rulesFocus: "Legal leg targets, youth head rules, and round-based restrictions.",
    audience: "First Timers",
  },
  {
    slug: "grappling",
    name: "Grappling",
    description: "Clinch, takedowns, rides, and pins from Dumog and Buno systems.",
    rulesFocus: "Mano y Mano grappling parameters, safety stops, and restart procedures.",
    audience: "All Levels",
  },
  {
    slug: "weapon-transitions",
    name: "Weapon Transitions",
    description: "Progression from two sticks to one stick to empty hand across three rounds.",
    rulesFocus: "Official round structure, equipment checks, and corner transitions.",
    audience: "All Levels",
  },
  {
    slug: "rules-briefing",
    name: "Rules Briefing",
    description: "Free introduction to Juego Todo divisions, gear, and competition flow.",
    rulesFocus: "Official, Professional, Amateur, Kids, and Minors rule differences.",
    audience: "First Timers",
  },
];

export const scheduledSeminars: ScheduledSeminar[] = [
  {
    slug: "intro-rules-clinic-manila",
    title: "First Timer Rules & Safety Clinic",
    topicSlugs: ["rules-briefing", "disarming"],
    date: "2026-06-14T09:00:00+08:00",
    time: "9:00 AM – 12:00 PM",
    venue: "Mandirigma Lab Manila",
    city: "Metro Manila",
    format: "In Person",
    pricing: { type: "free", note: "Free registration — limited seats" },
    capacity: 40,
    spotsLeft: 18,
    level: "First Timers Welcome",
    rulesFocus: "Official Rules overview with intro disarming fundamentals.",
    summary:
      "A free onboarding session for athletes, parents, and coaches entering Juego Todo for the first time.",
    highlights: [
      "Walkthrough of the 3-round JT format",
      "Required gear and check-in expectations",
      "Intro disarming drills with safety coaching",
      "Q&A with certified JT seminar staff",
    ],
    tone: "from-red-900 via-zinc-950 to-black",
  },
  {
    slug: "striking-legs-intensive-cebu",
    title: "Striking & Legs Intensive",
    topicSlugs: ["striking", "legs"],
    date: "2026-07-05T13:00:00+08:00",
    time: "1:00 PM – 5:00 PM",
    venue: "Cebu Blade Athletics",
    city: "Cebu City",
    format: "In Person",
    pricing: { type: "paid", amount: "₱1,500", note: "Paid seminar — pay on registration confirmation" },
    capacity: 30,
    spotsLeft: 12,
    level: "Beginner to Intermediate",
    rulesFocus: "Panuntukan and Sikaran applications under Amateur and Professional rules.",
    summary:
      "Focused striking and kicking seminar for athletes preparing for Mano y Mano and transition rounds.",
    highlights: [
      "Filipino boxing entries and elbow lines",
      "Low-line kicks, sweeps, and balance control",
      "Scoring targets by division",
      "Partner drills with JT corner procedures",
    ],
    tone: "from-zinc-950 via-red-950 to-black",
  },
  {
    slug: "disarming-masterclass-quezon",
    title: "Disarming Masterclass",
    topicSlugs: ["disarming", "weapon-transitions"],
    date: "2026-07-19T10:00:00+08:00",
    time: "10:00 AM – 4:00 PM",
    venue: "Quezon Combat Project",
    city: "Quezon City",
    format: "In Person",
    pricing: { type: "paid", amount: "₱2,200", note: "Paid seminar — includes equipment review" },
    capacity: 24,
    spotsLeft: 9,
    level: "Intermediate",
    rulesFocus: "Weapon round fouls, stick control, and transition timing.",
    summary:
      "Deep dive on disarms and weapon-to-empty-hand transitions aligned with competition rounds.",
    highlights: [
      "Doble Baston and Solo Baston disarm chains",
      "Weapon retention under pressure",
      "Round change drills and corner checks",
      "Filmed breakdown for athlete review",
    ],
    tone: "from-red-800 via-black to-zinc-900",
  },
  {
    slug: "grappling-under-jt-rules-manila",
    title: "Grappling Under JT Rules",
    topicSlugs: ["grappling", "striking"],
    date: "2026-08-02T09:00:00+08:00",
    time: "9:00 AM – 1:00 PM",
    venue: "Lakbay Grappling Club",
    city: "Metro Manila",
    format: "Hybrid",
    pricing: { type: "paid", amount: "₱1,800", note: "Paid seminar — hybrid stream access included" },
    capacity: 35,
    spotsLeft: 21,
    level: "All Levels",
    rulesFocus: "Mano y Mano clinch, takedown, and submission limits by division.",
    summary:
      "Learn legal grappling entries, rides, and pins without violating JT safety parameters.",
    highlights: [
      "Clinch entries from striking exchanges",
      "Legal takedowns and ride control",
      "Restart and stoppage standards",
      "Hybrid option for remote coaches",
    ],
    tone: "from-black via-zinc-900 to-red-950",
  },
  {
    slug: "free-youth-rules-clinic",
    title: "Youth Rules & Parent Briefing",
    topicSlugs: ["rules-briefing", "legs"],
    date: "2026-08-16T08:00:00+08:00",
    time: "8:00 AM – 11:00 AM",
    venue: "Juego Todo Training Center",
    city: "Pasig City",
    format: "In Person",
    pricing: { type: "free", note: "Free for youth athletes and one parent/guardian" },
    capacity: 50,
    spotsLeft: 32,
    level: "Kids & Minors",
    rulesFocus: "Kids Official Rules and Minors Guidelines with protective equipment focus.",
    summary:
      "Free clinic for young athletes and parents entering JT youth divisions for the first time.",
    highlights: [
      "Kids and Minors rule differences explained",
      "Protective gear fitting guidance",
      "Intro leg-line and footwork drills",
      "Parent-coach communication framework",
    ],
    tone: "from-red-950 via-zinc-950 to-yellow-900",
  },
  {
    slug: "coach-certification-weekend",
    title: "Coach Certification Weekend",
    topicSlugs: ["weapon-transitions", "rules-briefing", "grappling"],
    date: "2026-09-06T08:00:00+08:00",
    time: "Sat–Sun, 8:00 AM – 5:00 PM",
    venue: "Mall of Asia Arena Training Annex",
    city: "Pasay City",
    format: "In Person",
    pricing: { type: "paid", amount: "₱6,500", note: "Paid certification track — assessment included" },
    capacity: 20,
    spotsLeft: 6,
    level: "Coaches & Officials",
    rulesFocus: "Full JT ruleset enforcement, scoring, and event-week operations.",
    summary:
      "Weekend certification for gym leaders and corner coaches responsible for JT athletes.",
    highlights: [
      "Full rules library walkthrough",
      "Scoring, fouls, and compliance penalties",
      "Event-week athlete management",
      "Certification assessment on Sunday",
    ],
    tone: "from-zinc-900 via-red-900 to-black",
  },
];

export const seminarPrograms = [
  {
    title: "Weapon Foundations",
    focus: "Arnis / Eskrima / Kali",
    duration: "1 Day Intensive",
    level: "Beginner to Intermediate",
    description:
      "Stick angles, disarms, footwork, and safe partner drills built for gyms and school programs.",
  },
  {
    title: "Transition Combat Lab",
    focus: "Weapon To Empty Hand",
    duration: "2 Day Camp",
    level: "Intermediate to Advanced",
    description:
      "Round-based progression from Doble Baston to Solo Baston to Mano y Mano under Juego Todo rules.",
  },
  {
    title: "Coach Certification Track",
    focus: "Officials & Gym Leaders",
    duration: "Weekend + Assessment",
    level: "Certified Coaches",
    description:
      "Safety standards, scoring systems, athlete management, and event-week procedures for partner gyms.",
  },
  {
    title: "Youth Development Clinic",
    focus: "Kids & Minors Divisions",
    duration: "Half Day Session",
    level: "Youth Programs",
    description:
      "Age-appropriate drills, protective equipment guidance, and parent-coach communication frameworks.",
  },
];

export function getScheduledSeminar(slug: string) {
  return scheduledSeminars.find((seminar) => seminar.slug === slug);
}

export function getSeminarTopic(slug: string) {
  return seminarTopics.find((topic) => topic.slug === slug);
}

export function formatSeminarDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatSeminarMonth(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function groupSeminarsByMonth(seminars: ScheduledSeminar[]) {
  const sorted = [...seminars].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return sorted.reduce<Record<string, ScheduledSeminar[]>>((groups, seminar) => {
    const key = formatSeminarMonth(seminar.date);
    groups[key] = groups[key] ? [...groups[key], seminar] : [seminar];
    return groups;
  }, {});
}
