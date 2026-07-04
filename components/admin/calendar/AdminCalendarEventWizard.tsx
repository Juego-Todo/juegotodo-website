"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calendarEventTypeLabels,
  calendarOperationalStatusLabels,
  defaultEventLocation,
  defaultEventOwnership,
  defaultCalendarOperations,
  eventEntryTypeLabels,
  eventLevelLabels,
  eventVisibilityLabels,
  slugifyCalendarEntry,
  type CalendarEntry,
  type CalendarEntryInput,
  type CalendarEventType,
  type EventTypeDetails,
} from "@/data/calendar-entries";
import { EventTagPills } from "@/components/admin/calendar/EventPlatformUi";
import { EventTypeSpecificFields } from "@/components/admin/calendar/EventTypeSpecificFields";
import { categoryEventTypes, type EventCategory } from "@/data/event-categories";
import { formatAdminDate } from "@/lib/admin/calendar-dashboard";
import {
  defaultTypeDetails,
  entryTypeFromSeminarPricing,
  formatTypeDetailsSummary,
  getEventTypeCategory,
  mergeTypeDetails,
  parseAdditionalDivisions,
} from "@/data/event-type-details";
import { normalizeCalendarEntry } from "@/lib/calendar/storage";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-red-500/40 focus:ring-4";

const steps = ["Event Details", "Venue & Access", "Review & Publish"];

type WizardForm = CalendarEntryInput & {
  eventDate: string;
  eventTime: string;
  typeDetails: EventTypeDetails;
};

function applyTypeSpecificFields(
  form: WizardForm,
  eventType: CalendarEventType,
  typeDetails?: EventTypeDetails,
): WizardForm {
  const merged = mergeTypeDetails(eventType, typeDetails ?? form.typeDetails);
  const next: WizardForm = {
    ...form,
    eventType,
    typeDetails: merged,
    isChampionship: eventType === "juego_todo_event" ? form.isChampionship : false,
  };

  if (merged.fight) {
    next.weightDivision = merged.fight.weightDivision;
    next.divisions = parseAdditionalDivisions(merged.fight.additionalDivisions);
    next.sanctionStatus =
      merged.fight.gabRequired || form.isChampionship ? "gab_sanctioned" : "jt_sanctioned";
  }

  if (merged.seminar) {
    next.entryType = entryTypeFromSeminarPricing(merged.seminar.pricing);
    next.operations = {
      ...next.operations,
      capacity: {
        maximum: merged.seminar.maxParticipants,
        registered: next.operations?.capacity?.registered ?? 0,
        checkedIn: 0,
        waitlist: 0,
      },
    };
  }

  if (merged.license) {
    next.operations = {
      ...next.operations,
      capacity: {
        maximum: merged.license.maxApplicants,
        registered: next.operations?.capacity?.registered ?? 0,
        checkedIn: 0,
        waitlist: 0,
      },
    };
  }

  return next;
}

const emptyForm = (): WizardForm => ({
  slug: "",
  kind: "event",
  eventType: "juego_todo_event",
  operationalStatus: "draft",
  workflowStage: "draft",
  visibility: "public",
  entryType: "free_admission",
  ticketStatus: "coming_soon",
  eventLevel: "national",
  sanctionStatus: "jt_sanctioned",
  title: "",
  date: "",
  eventDate: "",
  eventTime: "18:00",
  venue: "",
  city: "",
  region: "National",
  organizer: "Juego Todo PH",
  weightDivision: "Open",
  location: defaultEventLocation(),
  ownership: defaultEventOwnership(),
  status: "Draft",
  summary: "",
  mainEvent: "",
  bouts: [],
  divisions: [],
  published: false,
  operations: {},
  typeDetails: defaultTypeDetails("juego_todo_event"),
});

function splitDateTime(iso: string) {
  if (!iso) return { eventDate: "", eventTime: "18:00" };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { eventDate: "", eventTime: "18:00" };
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return {
    eventDate: local.toISOString().slice(0, 10),
    eventTime: local.toISOString().slice(11, 16),
  };
}

function combineDateTime(eventDate: string, eventTime: string) {
  if (!eventDate) return "";
  const time = eventTime || "18:00";
  return new Date(`${eventDate}T${time}`).toISOString();
}

function toForm(entry: CalendarEntry): WizardForm {
  const { eventDate, eventTime } = splitDateTime(entry.date);
  return {
    slug: entry.slug,
    kind: entry.kind,
    eventType: entry.eventType,
    operationalStatus: entry.operationalStatus,
    workflowStage: entry.workflowStage,
    visibility: entry.visibility,
    entryType: entry.entryType,
    ticketStatus: entry.ticketStatus,
    eventLevel: entry.eventLevel,
    sanctionStatus: entry.sanctionStatus,
    title: entry.title,
    date: entry.date,
    eventDate,
    eventTime,
    venue: entry.venue,
    city: entry.city,
    region: entry.region,
    organizer: entry.organizer,
    weightDivision: entry.weightDivision,
    location: entry.location,
    ownership: entry.ownership,
    schedule: entry.schedule,
    status: entry.status,
    summary: entry.summary,
    mainEvent: entry.mainEvent ?? "",
    bouts: entry.bouts,
    divisions: entry.divisions,
    registrationDeadline: entry.registrationDeadline,
    isChampionship: entry.isChampionship,
    isLive: entry.isLive,
    published: entry.published,
    operations: entry.operations,
    typeDetails: mergeTypeDetails(entry.eventType, entry.typeDetails),
  };
}

function toPayload(form: WizardForm): CalendarEntryInput {
  const synced = applyTypeSpecificFields(form, form.eventType ?? "juego_todo_event", form.typeDetails);
  const { eventDate, eventTime, typeDetails: _typeDetails, ...rest } = synced;
  return {
    ...rest,
    slug: slugifyCalendarEntry(form.title),
    date: combineDateTime(eventDate, eventTime),
    mainEvent: "",
    typeDetails: synced.typeDetails,
    location: { ...defaultEventLocation(), ...synced.location, venue: synced.venue, city: synced.city },
  };
}

export function AdminCalendarEventWizard({
  open,
  editingEntry,
  preset,
  category = "competitions",
  onClose,
  onSubmit,
}: {
  open: boolean;
  editingEntry: CalendarEntry | null;
  preset?: Partial<CalendarEntryInput>;
  category?: EventCategory;
  onClose: () => void;
  onSubmit: (payload: CalendarEntryInput, editingId: string | null) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(emptyForm());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const wizardSyncKey = open ? `${editingEntry?.id ?? "new"}:${category}` : "closed";
  const [lastWizardSyncKey, setLastWizardSyncKey] = useState("");

  if (wizardSyncKey !== lastWizardSyncKey) {
    setLastWizardSyncKey(wizardSyncKey);
    if (open) {
      setStep(0);
      const base = editingEntry ? toForm(editingEntry) : { ...emptyForm(), ...preset };
      const eventType = base.eventType ?? "juego_todo_event";
      setForm(applyTypeSpecificFields(base, eventType, base.typeDetails ?? defaultTypeDetails(eventType)));
      setError("");
    }
  }

  const categoryEventTypeOptions = useMemo(
    () => categoryEventTypes[category].map((type) => [type, calendarEventTypeLabels[type]] as [string, string]),
    [category],
  );

  const previewEntry = useMemo(() => {
    const payload = toPayload(form);
    return normalizeCalendarEntry({
      id: "preview",
      slug: slugifyCalendarEntry(form.title || "preview"),
      kind: "event",
      title: payload.title || "Untitled Event",
      summary: payload.summary ?? "",
      date: payload.date || new Date().toISOString(),
      city: payload.city ?? "",
      venue: payload.venue ?? "",
      region: payload.region ?? "",
      organizer: payload.organizer ?? "",
      weightDivision: payload.weightDivision ?? "Open",
      eventType: payload.eventType ?? "juego_todo_event",
      operationalStatus: payload.operationalStatus ?? "draft",
      visibility: payload.visibility ?? "public",
      entryType: payload.entryType ?? "free_admission",
      ticketStatus: payload.ticketStatus ?? "available",
      eventLevel: payload.eventLevel ?? "national",
      sanctionStatus: payload.sanctionStatus ?? "jt_sanctioned",
      bouts: payload.bouts ?? [],
      divisions: payload.divisions ?? [],
      typeDetails: payload.typeDetails,
      location: payload.location ?? defaultEventLocation(),
      ownership: { ...defaultEventOwnership(), ...payload.ownership },
      operations: { ...defaultCalendarOperations(), ...payload.operations },
      source: "admin",
    } as CalendarEntry);
  }, [form]);

  if (!open) return null;

  function validateStep(currentStep: number) {
    if (currentStep === 0) {
      if (!form.title.trim()) return "Event name is required.";
      if (!form.eventDate) return "Event date is required.";
      if (!form.eventTime) return "Event time is required.";
    }
    if (currentStep === 1) {
      if (!form.city.trim()) return "City is required.";
      if (!form.venue.trim()) return "Venue is required.";
    }
    return "";
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function handleSubmit(publish = false) {
    const message = validateStep(0) || validateStep(1);
    if (message) {
      setError(message);
      return;
    }

    setBusy(true);
    setError("");
    const payload: CalendarEntryInput = {
      ...toPayload(form),
      operationalStatus: publish ? "published" : form.operationalStatus ?? "draft",
      workflowStage: publish ? "published" : "draft",
      published: publish,
    };

    try {
      await onSubmit(payload, editingEntry?.id ?? null);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" onClick={onClose} type="button" aria-label="Close wizard" />
      <div className="fixed inset-x-4 top-[8vh] z-[81] mx-auto flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Event Creation</p>
            <h2 className="font-display text-2xl uppercase text-white">{editingEntry ? "Edit Event" : "Create Event"}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Step {step + 1} of {steps.length}: {steps[step]}
            </p>
          </div>
          <button className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-3 sm:px-6">
          <div className="flex gap-2">
            {steps.map((label, index) => (
              <button
                className={`flex-1 rounded-full px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.12em] ${
                  index === step ? "bg-[#FF1010] text-white" : index < step ? "bg-white/10 text-zinc-300" : "text-zinc-500"
                }`}
                key={label}
                onClick={() => {
                  if (index <= step) {
                    setError("");
                    setStep(index);
                  }
                }}
                type="button"
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

          {step === 0 ? (
            <div className="space-y-4">
              <Field label="Event Name" onChange={(value) => setForm((c) => ({ ...c, title: value }))} required value={form.title} />
              <SelectField
                label="Event Type"
                onChange={(value) => {
                  const eventType = value as CalendarEventType;
                  setForm((current) => applyTypeSpecificFields(current, eventType, defaultTypeDetails(eventType)));
                }}
                options={categoryEventTypeOptions}
                value={form.eventType ?? "juego_todo_event"}
              />
              <EventTypeSpecificFields
                eventType={form.eventType ?? "juego_todo_event"}
                onChange={(details) =>
                  setForm((current) => applyTypeSpecificFields(current, current.eventType ?? "juego_todo_event", details))
                }
                typeDetails={form.typeDetails}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Summary" onChange={(value) => setForm((c) => ({ ...c, summary: value }))} value={form.summary} />
                <Field label="Date" onChange={(value) => setForm((c) => ({ ...c, eventDate: value }))} required type="date" value={form.eventDate} />
                <Field label="Time" onChange={(value) => setForm((c) => ({ ...c, eventTime: value }))} required type="time" value={form.eventTime} />
                <SelectField label="Event Level" onChange={(value) => setForm((c) => ({ ...c, eventLevel: value as CalendarEntryInput["eventLevel"] }))} options={Object.entries(eventLevelLabels)} value={form.eventLevel ?? "national"} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country" onChange={(value) => setForm((c) => ({ ...c, location: { ...defaultEventLocation(), ...c.location, country: value } }))} value={form.location?.country ?? "Philippines"} />
              <Field label="Region" onChange={(value) => setForm((c) => ({ ...c, region: value, location: { ...defaultEventLocation(), ...c.location, region: value } }))} value={form.region ?? ""} />
              <Field label="Province" onChange={(value) => setForm((c) => ({ ...c, location: { ...defaultEventLocation(), ...c.location, province: value } }))} value={form.location?.province ?? ""} />
              <Field label="City" onChange={(value) => setForm((c) => ({ ...c, city: value, location: { ...defaultEventLocation(), ...c.location, city: value } }))} required value={form.city} />
              <Field label="Venue" onChange={(value) => setForm((c) => ({ ...c, venue: value, location: { ...defaultEventLocation(), ...c.location, venue: value } }))} required value={form.venue} />
              <Field label="Venue Address" onChange={(value) => setForm((c) => ({ ...c, location: { ...defaultEventLocation(), ...c.location, venueAddress: value } }))} value={form.location?.venueAddress ?? ""} />
              <SelectField label="Visibility" onChange={(value) => setForm((c) => ({ ...c, visibility: value as CalendarEntryInput["visibility"] }))} options={Object.entries(eventVisibilityLabels)} value={form.visibility ?? "public"} />
              {getEventTypeCategory(form.eventType ?? "juego_todo_event") !== "seminar" ? (
                <SelectField label="Entry Type" onChange={(value) => setForm((c) => ({ ...c, entryType: value as CalendarEntryInput["entryType"] }))} options={Object.entries(eventEntryTypeLabels)} value={form.entryType ?? "free_admission"} />
              ) : (
                <Field label="Entry Type" onChange={() => undefined} readOnly value={form.entryType === "ticketed" ? "Paid (Ticketed)" : "Free Admission"} />
              )}
              {getEventTypeCategory(form.eventType ?? "juego_todo_event") === "seminar" ||
              getEventTypeCategory(form.eventType ?? "juego_todo_event") === "license" ? null : (
                <Field label="Maximum Capacity" onChange={(value) => setForm((c) => ({ ...c, operations: { ...c.operations, capacity: { maximum: Number(value) || 0, registered: c.operations?.capacity?.registered ?? 0, checkedIn: 0, waitlist: 0 } } }))} type="number" value={String(form.operations?.capacity?.maximum ?? 0)} />
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                <p className="font-display text-2xl uppercase text-white">{form.title || "Untitled Event"}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  {form.eventDate && form.eventTime
                    ? formatAdminDate(combineDateTime(form.eventDate, form.eventTime))
                    : "Date TBA"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{form.venue} · {form.city}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {formatTypeDetailsSummary(form.eventType ?? "juego_todo_event", form.typeDetails)}
                </p>
                <div className="mt-4">
                  <EventTagPills entry={previewEntry} />
                </div>
              </div>
              <SelectField label="Save As" onChange={(value) => setForm((c) => ({ ...c, operationalStatus: value as CalendarEntryInput["operationalStatus"] }))} options={Object.entries(calendarOperationalStatusLabels)} value={form.operationalStatus ?? "draft"} />
              <p className="text-sm text-zinc-400">
                Save as draft to keep planning internal, or publish to add the event to the public calendar and member schedule.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 sm:px-6">
          <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 disabled:opacity-40" disabled={step === 0} onClick={() => { setError(""); setStep((current) => current - 1); }} type="button">
            <ChevronLeft size={14} /> Back
          </button>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <button className="inline-flex items-center gap-2 rounded-full bg-[#FF1010] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white" onClick={goNext} type="button">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <>
                <button className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 disabled:opacity-60" disabled={busy} onClick={() => void handleSubmit(false)} type="button">
                  Save Draft
                </button>
                <button className="rounded-full bg-[#FF1010] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60" disabled={busy} onClick={() => void handleSubmit(true)} type="button">
                  Publish Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={`block text-xs font-black uppercase tracking-[0.14em] text-zinc-500 ${className}`}>
      {label}
      <input
        className={`${fieldClassName} ${readOnly ? "cursor-not-allowed opacity-70" : ""}`}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
      {label}
      <select className={fieldClassName} onChange={(e) => onChange(e.target.value)} value={value}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

export function AdminCalendarFab({ onAction }: { onAction: (preset: Partial<CalendarEntryInput>) => void }) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "Juego Todo Event", preset: { eventType: "juego_todo_event" as const } },
    { label: "National Championship", preset: { eventType: "juego_todo_event" as const, isChampionship: true, eventLevel: "national" as const } },
    { label: "Regional Event", preset: { eventType: "juego_todo_event" as const, eventLevel: "regional" as const } },
    { label: "Seminar", preset: { eventType: "seminar" as const } },
    { label: "License Exam", preset: { eventType: "license_examination" as const, kind: "competition" as const } },
    { label: "Grand Council Meeting", preset: { eventType: "grand_council_meeting" as const } },
  ];
  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open ? (
        <div className="mb-3 space-y-2">
          {actions.map((action) => (
            <button className="block w-full rounded-full border border-white/10 bg-black/85 px-4 py-2 text-left text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-200 backdrop-blur" key={action.label} onClick={() => { onAction(action.preset); setOpen(false); }} type="button">
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      <button className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FF1010] text-white shadow-[0_0_30px_rgba(255,16,16,0.45)]" onClick={() => setOpen((c) => !c)} type="button">+</button>
    </div>
  );
}
