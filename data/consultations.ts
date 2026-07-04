export type ConsultationService = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  duration: string;
  price: number;
  audience: string;
  highlights: string[];
  idealFor: string[];
  includes: string[];
  process: string[];
  outcomes: string[];
};

export type ConsultationSlot = {
  id: string;
  date: string;
  time: string;
  consultant: string;
  format: "Video Call" | "In Person — Manila HQ";
};

export const consultationServices: ConsultationService[] = [
  {
    slug: "personal-consultation",
    name: "Personal Consultation",
    description:
      "Private guidance for career, wealth, relationships, health, and life transitions.",
    longDescription:
      "A personal Feng Shui and destiny advisory session designed to bring clarity to important life decisions. The session reviews your present concerns, energetic patterns, timing influences, and practical next steps so you can move with more confidence.",
    duration: "60 min",
    price: 4500,
    audience: "Private Clients",
    highlights: ["Career and wealth clarity", "Relationship and family guidance", "Personal timing recommendations"],
    idealFor: ["Major life transitions", "Career or business uncertainty", "Relationship and family concerns", "Health and wellness direction"],
    includes: ["Pre-session intake review", "Personal energy and timing discussion", "Priority recommendations", "Post-session summary notes"],
    process: ["Submit your intake details", "Choose a private consultation slot", "Attend your advisory session", "Receive action steps after the call"],
    outcomes: ["Clearer decision-making", "Practical next steps", "Better timing awareness", "A refined personal direction"],
  },
  {
    slug: "business-feng-shui",
    name: "Business Feng Shui",
    description:
      "Strategic spatial and timing recommendations for leaders, teams, and enterprises.",
    longDescription:
      "A focused business advisory for offices, retail spaces, leadership teams, and founders who want their environment to support growth, productivity, harmony, and stronger decision timing.",
    duration: "75 min",
    price: 8500,
    audience: "Leaders",
    highlights: ["Office and leadership energy review", "Growth and prosperity recommendations", "Timing guidance for launches and decisions"],
    idealFor: ["Business owners", "Executives and founders", "Retail and office spaces", "Teams preparing launches or expansion"],
    includes: ["Business intake review", "Priority space assessment", "Leadership and timing notes", "Strategic recommendation summary"],
    process: ["Share business goals and space context", "Book a strategy slot", "Review spatial and timing priorities", "Implement the recommended adjustments"],
    outcomes: ["More intentional business environment", "Improved team flow", "Clearer timing for key moves", "Practical prosperity-focused recommendations"],
  },
  {
    slug: "home-audit",
    name: "Home Audit",
    description:
      "Create a refined sanctuary with energy flow, harmony, and prosperity at its center.",
    longDescription:
      "A residential Feng Shui review for homeowners, families, and property owners who want to improve the energy of their home through room use, layout, entrances, sleeping directions, and meaningful placement changes.",
    duration: "90 min",
    price: 12000,
    audience: "Homes",
    highlights: ["Entrance and room flow review", "Bedroom and workspace recommendations", "Harmony and prosperity enhancements"],
    idealFor: ["New homes or renovations", "Families seeking harmony", "Bedrooms and home offices", "Homes that feel stagnant or stressful"],
    includes: ["Floor plan or photo review", "Room-by-room priorities", "Placement recommendations", "Follow-up implementation checklist"],
    process: ["Submit floor plan and photos", "Choose an audit schedule", "Review the property together", "Apply the priority adjustments"],
    outcomes: ["Better flow at home", "More restful spaces", "Clear room priorities", "A practical home Feng Shui plan"],
  },
  {
    slug: "bazi-reading",
    name: "BaZi Reading",
    description:
      "Decode your elemental profile and uncover patterns behind opportunity and timing.",
    longDescription:
      "A BaZi reading interprets your birth chart through the Five Elements to reveal personality patterns, strengths, timing cycles, relationship dynamics, career potential, and periods of opportunity.",
    duration: "60 min",
    price: 6500,
    audience: "Destiny",
    highlights: ["Five Elements profile", "Career and relationship tendencies", "Luck cycle and timing insights"],
    idealFor: ["Self-discovery", "Career direction", "Relationship understanding", "Timing major decisions"],
    includes: ["Birth detail review", "Elemental profile reading", "Current cycle interpretation", "Personal recommendation notes"],
    process: ["Submit birth date, time, and place", "Choose your reading schedule", "Review your BaZi chart", "Receive practical timing guidance"],
    outcomes: ["Stronger self-awareness", "Better timing insight", "Clearer strengths and challenges", "Personalized life pattern guidance"],
  },
  {
    slug: "destiny-analysis",
    name: "Destiny Analysis",
    description:
      "A deeper lens into purpose, potential, compatibility, and long-term direction.",
    longDescription:
      "A broader destiny session combining personal patterns, timing, relationship compatibility, and life direction. It is designed for clients who want a more comprehensive view of where energy, opportunity, and personal purpose intersect.",
    duration: "75 min",
    price: 7800,
    audience: "Purpose",
    highlights: ["Purpose and potential review", "Compatibility insights", "Long-term direction planning"],
    idealFor: ["Life planning", "Compatibility questions", "Career and purpose reflection", "Long-term personal direction"],
    includes: ["Personal destiny profile", "Compatibility and timing discussion", "Opportunity and challenge mapping", "Written key takeaways"],
    process: ["Submit personal details and questions", "Book your analysis session", "Review life patterns and timing", "Prioritize next steps"],
    outcomes: ["Clearer long-term direction", "Relationship and compatibility awareness", "Better understanding of personal cycles", "Focused next actions"],
  },
  {
    slug: "date-selection",
    name: "Date Selection",
    description:
      "Choose auspicious dates for launches, moves, contracts, weddings, and milestones.",
    longDescription:
      "A date selection service for important personal and business moments. The review identifies supportive timing windows and avoids dates that may create unnecessary friction for your goal.",
    duration: "30 min",
    price: 3800,
    audience: "Timing",
    highlights: ["Auspicious date recommendations", "Purpose-specific timing", "Avoidance of conflicting dates"],
    idealFor: ["Business launches", "Contract signing", "Moving homes", "Weddings and milestones"],
    includes: ["Goal and timing intake", "Recommended date windows", "Dates to avoid", "Short timing rationale"],
    process: ["Share the event purpose and target month", "Submit relevant birth details if needed", "Receive recommended dates", "Confirm the final timing plan"],
    outcomes: ["Better launch timing", "Reduced uncertainty", "Clear date options", "More intentional milestone planning"],
  },
  {
    slug: "annual-forecast",
    name: "Annual Forecast",
    description:
      "Navigate the year ahead with elegant, practical insight for every life area.",
    longDescription:
      "A year-ahead advisory session that highlights opportunities, caution periods, themes, and practical recommendations for career, wealth, relationships, health, and home energy.",
    duration: "60 min",
    price: 6200,
    audience: "Year Ahead",
    highlights: ["Annual opportunity map", "Caution periods", "Practical monthly priorities"],
    idealFor: ["New year planning", "Business and career strategy", "Family planning", "Personal timing awareness"],
    includes: ["Yearly energy overview", "Life area priorities", "Monthly timing themes", "Recommended focus actions"],
    process: ["Submit your planning priorities", "Book a forecast session", "Review the year ahead", "Use the forecast as a planning guide"],
    outcomes: ["More confident yearly planning", "Clearer monthly priorities", "Awareness of opportunity windows", "Practical guidance for each life area"],
  },
];

const SLOT_TIMES = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"] as const;
const CONSULTANTS = [
  "Senior Feng Shui Advisor",
  "BaZi Consultant",
  "Home Audit Specialist",
  "Business Advisory Lead",
] as const;

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isWeekday(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function buildConsultationCalendar(
  startDate = new Date(),
  dayCount = 28,
  bookedSlotIds: Set<string> = new Set(),
): ConsultationSlot[] {
  const slots: ConsultationSlot[] = [];
  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = addDays(normalizedStart, offset);
    if (!isWeekday(date)) {
      continue;
    }

    const dateKey = toDateKey(date);

    SLOT_TIMES.forEach((time, index) => {
      const id = `${dateKey}-${time.replace(/\s|:/g, "").toLowerCase()}`;
      const seed = dateKey.split("-").join("") + index;
      const reserved = seededUnit(Number(seed)) < 0.22 || bookedSlotIds.has(id);

      if (reserved) {
        return;
      }

      slots.push({
        id,
        date: dateKey,
        time,
        consultant: CONSULTANTS[index % CONSULTANTS.length],
        format: index % 3 === 0 ? "In Person — Manila HQ" : "Video Call",
      });
    });
  }

  return slots;
}

export function groupSlotsByDate(slots: ConsultationSlot[]) {
  return slots.reduce<Record<string, ConsultationSlot[]>>((groups, slot) => {
    if (!groups[slot.date]) {
      groups[slot.date] = [];
    }
    groups[slot.date].push(slot);
    return groups;
  }, {});
}

export function getConsultationService(slug: string) {
  return consultationServices.find((service) => service.slug === slug);
}

export function formatConsultationDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}
