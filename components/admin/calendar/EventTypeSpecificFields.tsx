"use client";

import type { CalendarEventType } from "@/data/calendar-entries";
import {
  fightAgeCategoryOptions,
  fightGenderOptions,
  fightRoundOptions,
  fighterWeightDivisionOptions,
  getEventTypeCategory,
  licenseTypeOptions,
  meetingFormatOptions,
  seminarPricingOptions,
  seminarSkillLevelOptions,
  type EventTypeDetails,
  type FightEventDetails,
  type LicenseExamEventDetails,
  type MeetingEventDetails,
  type SeminarEventDetails,
  mergeTypeDetails,
} from "@/data/event-type-details";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4";

const categoryTitles: Record<ReturnType<typeof getEventTypeCategory>, string> = {
  fight: "Fight Event Details",
  seminar: "Seminar Details",
  license: "License Examination Details",
  meeting: "Meeting Details",
};

const categoryDescriptions: Record<ReturnType<typeof getEventTypeCategory>, string> = {
  fight: "Configure weight divisions, gender categories, rounds, and sanction requirements for this Juego Todo sanctioned fight.",
  seminar: "Set skill level, pricing, instructor, and certificate options for this seminar.",
  license: "Define license type, passing requirements, and examiner details.",
  meeting: "Add format and agenda details for this official meeting or activity.",
};

export function EventTypeSpecificFields({
  eventType,
  typeDetails,
  onChange,
}: {
  eventType: CalendarEventType;
  typeDetails: EventTypeDetails;
  onChange: (details: EventTypeDetails) => void;
}) {
  const category = getEventTypeCategory(eventType);
  const merged = mergeTypeDetails(eventType, typeDetails);

  function updateFight(patch: Partial<FightEventDetails>) {
    onChange(mergeTypeDetails(eventType, { ...typeDetails, fight: { ...typeDetails.fight, ...patch } as FightEventDetails }));
  }

  function updateSeminar(patch: Partial<SeminarEventDetails>) {
    onChange(mergeTypeDetails(eventType, { ...typeDetails, seminar: { ...typeDetails.seminar, ...patch } as SeminarEventDetails }));
  }

  function updateLicense(patch: Partial<LicenseExamEventDetails>) {
    onChange(mergeTypeDetails(eventType, { ...typeDetails, license: { ...typeDetails.license, ...patch } as LicenseExamEventDetails }));
  }

  function updateMeeting(patch: Partial<MeetingEventDetails>) {
    onChange(mergeTypeDetails(eventType, { ...typeDetails, meeting: { ...typeDetails.meeting, ...patch } as MeetingEventDetails }));
  }

  const fight = merged.fight;
  const seminar = merged.seminar;
  const license = merged.license;
  const meeting = merged.meeting;

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 sm:p-5">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#FF1010]">{categoryTitles[category]}</p>
      <p className="mt-2 text-sm text-zinc-400">{categoryDescriptions[category]}</p>

      {category === "fight" && fight ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Weight Division"
            onChange={(value) => updateFight({ weightDivision: value })}
            options={fighterWeightDivisionOptions.map((option) => [option, option])}
            value={fight.weightDivision}
          />
          <SelectField
            label="Gender Category"
            onChange={(value) => updateFight({ gender: value as FightEventDetails["gender"] })}
            options={fightGenderOptions.map((option) => [option.value, option.label])}
            value={fight.gender}
          />
          <SelectField
            label="Age Category"
            onChange={(value) => updateFight({ ageCategory: value as FightEventDetails["ageCategory"] })}
            options={fightAgeCategoryOptions.map((option) => [option.value, option.label])}
            value={fight.ageCategory}
          />
          <SelectField
            label="Rounds"
            onChange={(value) => updateFight({ rounds: value as FightEventDetails["rounds"] })}
            options={fightRoundOptions.map((option) => [option, `${option} Rounds`])}
            value={fight.rounds}
          />
          <Field
            className="sm:col-span-2"
            label="Additional Weight Divisions"
            onChange={(value) => updateFight({ additionalDivisions: value })}
            placeholder="Featherweight, Lightweight, Welterweight"
            value={fight.additionalDivisions}
          />
          <CheckboxField
            checked={fight.gabRequired}
            label="GAB Sanction Required"
            onChange={(checked) => updateFight({ gabRequired: checked })}
          />
        </div>
      ) : null}

      {category === "seminar" && seminar ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Skill Level"
            onChange={(value) => updateSeminar({ skillLevel: value as SeminarEventDetails["skillLevel"] })}
            options={seminarSkillLevelOptions.map((option) => [option.value, option.label])}
            value={seminar.skillLevel}
          />
          <SelectField
            label="Pricing"
            onChange={(value) => updateSeminar({ pricing: value as SeminarEventDetails["pricing"] })}
            options={seminarPricingOptions.map((option) => [option.value, option.label])}
            value={seminar.pricing}
          />
          <Field label="Instructor / Speaker" onChange={(value) => updateSeminar({ instructor: value })} value={seminar.instructor} />
          <Field
            label="Max Participants"
            onChange={(value) => updateSeminar({ maxParticipants: Number(value) || 0 })}
            type="number"
            value={String(seminar.maxParticipants)}
          />
          <CheckboxField
            checked={seminar.certificateOffered}
            label="Certificate Offered"
            onChange={(checked) => updateSeminar({ certificateOffered: checked })}
          />
        </div>
      ) : null}

      {category === "license" && license ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="License Type"
            onChange={(value) => updateLicense({ licenseType: value })}
            options={licenseTypeOptions.map((option) => [option, option])}
            value={license.licenseType}
          />
          <Field label="Examiner" onChange={(value) => updateLicense({ examiner: value })} value={license.examiner} />
          <Field
            label="Pass Mark (%)"
            onChange={(value) => updateLicense({ passMark: Number(value) || 0 })}
            type="number"
            value={String(license.passMark)}
          />
          <Field
            label="Maximum Applicants"
            onChange={(value) => updateLicense({ maxApplicants: Number(value) || 0 })}
            type="number"
            value={String(license.maxApplicants)}
          />
        </div>
      ) : null}

      {category === "meeting" && meeting ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Format"
            onChange={(value) => updateMeeting({ format: value as MeetingEventDetails["format"] })}
            options={meetingFormatOptions.map((option) => [option.value, option.label])}
            value={meeting.format}
          />
          <CheckboxField
            checked={meeting.quorumRequired}
            label="Quorum Required"
            onChange={(checked) => updateMeeting({ quorumRequired: checked })}
          />
          <Field className="sm:col-span-2" label="Agenda / Topic" onChange={(value) => updateMeeting({ agenda: value })} value={meeting.agenda} />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-black uppercase tracking-[0.14em] text-zinc-500 ${className}`}>
      {label}
      <input
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
      {label}
      <select className={fieldClassName} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200">
      <input checked={checked} className="h-4 w-4 rounded border-white/20 bg-black/40" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">{label}</span>
    </label>
  );
}
