import type { CalendarEventType, EventEntryType } from "@/data/calendar-entries";
import { getEventCategory } from "@/data/event-categories";
import { fighterWeightDivisionOptions } from "@/data/license-applications";

export type EventTypeCategory = "fight" | "seminar" | "license" | "meeting";

export type FightEventDetails = {
  gender: "male" | "female" | "mixed" | "open";
  ageCategory: "youth" | "junior" | "senior" | "masters" | "open";
  rounds: "3" | "5" | "7" | "10" | "12";
  weightDivision: string;
  additionalDivisions: string;
  gabRequired: boolean;
};

export type SeminarEventDetails = {
  skillLevel: "beginner" | "intermediate" | "advanced" | "all_levels";
  pricing: "free" | "paid";
  instructor: string;
  certificateOffered: boolean;
  maxParticipants: number;
};

export type LicenseExamEventDetails = {
  licenseType: string;
  passMark: number;
  maxApplicants: number;
  examiner: string;
};

export type MeetingEventDetails = {
  format: "in_person" | "virtual" | "hybrid";
  agenda: string;
  quorumRequired: boolean;
};

export type EventTypeDetails = {
  fight?: FightEventDetails;
  seminar?: SeminarEventDetails;
  license?: LicenseExamEventDetails;
  meeting?: MeetingEventDetails;
};

const fightEventTypes: CalendarEventType[] = ["juego_todo_event", "amateur_tournament", "international_event"];

const seminarEventTypes: CalendarEventType[] = ["seminar", "training_camp"];
const licenseEventTypes: CalendarEventType[] = ["license_examination"];

export const fightGenderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "mixed", label: "Mixed" },
  { value: "open", label: "Open" },
] as const;

export const fightAgeCategoryOptions = [
  { value: "youth", label: "Youth" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "masters", label: "Masters" },
  { value: "open", label: "Open" },
] as const;

export const fightRoundOptions = ["3", "5", "7", "10", "12"] as const;

export const seminarSkillLevelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
] as const;

export const seminarPricingOptions = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
] as const;

export const licenseTypeOptions = [
  "Fighter",
  "Referee",
  "Judge",
  "Coach",
  "Trainer",
  "Senior Coach",
  "Club Owner",
  "Adviser",
];

export const meetingFormatOptions = [
  { value: "in_person", label: "In Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export function getEventTypeCategory(eventType: CalendarEventType): EventTypeCategory {
  const category = getEventCategory(eventType);
  if (category === "competitions") return "fight";
  if (category === "education") return eventType === "license_examination" ? "license" : "seminar";
  if (category === "administration") return "meeting";
  return "meeting";
}

export function defaultFightEventDetails(): FightEventDetails {
  return {
    gender: "open",
    ageCategory: "open",
    rounds: "3",
    weightDivision: "Open Weight",
    additionalDivisions: "",
    gabRequired: false,
  };
}

export function defaultSeminarEventDetails(): SeminarEventDetails {
  return {
    skillLevel: "beginner",
    pricing: "free",
    instructor: "",
    certificateOffered: true,
    maxParticipants: 40,
  };
}

export function defaultLicenseExamEventDetails(): LicenseExamEventDetails {
  return {
    licenseType: "Fighter",
    passMark: 75,
    maxApplicants: 50,
    examiner: "",
  };
}

export function defaultMeetingEventDetails(): MeetingEventDetails {
  return {
    format: "in_person",
    agenda: "",
    quorumRequired: false,
  };
}

export function defaultTypeDetails(eventType: CalendarEventType): EventTypeDetails {
  const category = getEventTypeCategory(eventType);
  if (category === "fight") return { fight: defaultFightEventDetails() };
  if (category === "seminar") return { seminar: defaultSeminarEventDetails() };
  if (category === "license") return { license: defaultLicenseExamEventDetails() };
  return { meeting: defaultMeetingEventDetails() };
}

export function mergeTypeDetails(eventType: CalendarEventType, details?: EventTypeDetails): EventTypeDetails {
  const defaults = defaultTypeDetails(eventType);
  const category = getEventTypeCategory(eventType);
  if (category === "fight") return { fight: { ...defaults.fight!, ...details?.fight } };
  if (category === "seminar") return { seminar: { ...defaults.seminar!, ...details?.seminar } };
  if (category === "license") return { license: { ...defaults.license!, ...details?.license } };
  return { meeting: { ...defaults.meeting!, ...details?.meeting } };
}

export function entryTypeFromSeminarPricing(pricing: SeminarEventDetails["pricing"]): EventEntryType {
  return pricing === "paid" ? "ticketed" : "free_admission";
}

export function parseAdditionalDivisions(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function formatTypeDetailsSummary(eventType: CalendarEventType, details?: EventTypeDetails) {
  const merged = mergeTypeDetails(eventType, details);
  const category = getEventTypeCategory(eventType);

  if (category === "fight" && merged.fight) {
    const parts = [
      merged.fight.weightDivision,
      fightGenderOptions.find((option) => option.value === merged.fight!.gender)?.label,
      fightAgeCategoryOptions.find((option) => option.value === merged.fight!.ageCategory)?.label,
      `${merged.fight.rounds} Rounds`,
    ];
    const extra = parseAdditionalDivisions(merged.fight.additionalDivisions);
    if (extra.length > 0) parts.push(`${extra.length} extra divisions`);
    return parts.filter(Boolean).join(" · ");
  }

  if (category === "seminar" && merged.seminar) {
    const level = seminarSkillLevelOptions.find((option) => option.value === merged.seminar!.skillLevel)?.label;
    const pricing = merged.seminar.pricing === "paid" ? "Paid" : "Free";
    const parts = [level, pricing];
    if (merged.seminar.instructor) parts.push(`Instructor: ${merged.seminar.instructor}`);
    if (merged.seminar.certificateOffered) parts.push("Certificate");
    return parts.filter(Boolean).join(" · ");
  }

  if (category === "license" && merged.license) {
    return `${merged.license.licenseType} · Pass ${merged.license.passMark}% · Max ${merged.license.maxApplicants} applicants`;
  }

  if (category === "meeting" && merged.meeting) {
    const format = meetingFormatOptions.find((option) => option.value === merged.meeting!.format)?.label;
    return [format, merged.meeting.agenda].filter(Boolean).join(" · ");
  }

  return "";
}

export { fighterWeightDivisionOptions };
