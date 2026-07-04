"use client";

import { Archive, Copy, Pencil, Radio, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { CalendarEntry } from "@/data/calendar-entries";
import { EventTagPills } from "@/components/admin/calendar/EventPlatformUi";
import { EventHealthPanel } from "@/components/admin/calendar/EventHealthPanel";
import { formatAdminDate } from "@/lib/admin/calendar-dashboard";
import { formatLocationStack, getMapLinks } from "@/lib/calendar/platform";
import { formatTypeDetailsSummary } from "@/data/event-type-details";

export function AdminCalendarDetailPanel({
  entry,
  onClose,
  onEdit,
  onDuplicate,
  onPublish,
  onArchive,
}: {
  entry: CalendarEntry | null;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onArchive: () => void;
}) {
  return (
    <AnimatePresence>
      {entry ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[82] bg-black/50 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
            aria-label="Close event details"
          />
          <motion.aside
            animate={{ x: 0 }}
            className="fixed inset-y-0 right-0 z-[83] flex w-full max-w-lg flex-col border-l border-white/10 bg-[#0a0a0a] shadow-2xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <PanelContent
              entry={entry}
              onArchive={onArchive}
              onClose={onClose}
              onDuplicate={onDuplicate}
              onEdit={onEdit}
              onPublish={onPublish}
            />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PanelContent({
  entry,
  onClose,
  onEdit,
  onDuplicate,
  onPublish,
  onArchive,
}: {
  entry: CalendarEntry;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onArchive: () => void;
}) {
  const ops = entry.operations;
  const location = formatLocationStack(entry);
  const maps = getMapLinks(entry);
  const readOnly = entry.source === "static";

  return (
    <>
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
        <div className="min-w-0 pr-4">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">Event Details</p>
          <h2 className="font-display mt-1 text-2xl uppercase leading-tight text-white">{entry.title.replace("Juego Todo: ", "")}</h2>
        </div>
        <button className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white" onClick={onClose} type="button">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className={`overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br ${ops.media.posterTone} p-5`}>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-400">Event Poster</p>
          <p className="font-display mt-6 text-3xl uppercase text-white">{location.line4}</p>
        </div>

        <div className="mt-4">
          <EventTagPills compact entry={entry} />
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-300">
          {entry.summary || formatTypeDetailsSummary(entry.eventType, entry.typeDetails) || "No description yet."}
        </p>

        <Section title="Schedule">
          <DetailRow label="Date" value={formatAdminDate(entry.date)} />
          {entry.bouts.length > 0 ? <DetailRow label="Fight Card" value={entry.bouts.join(" · ")} /> : null}
        </Section>

        <Section title="Location">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">{location.line1}</p>
          <p className="mt-1 text-sm text-zinc-300">{location.line4}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MapLink href={maps.googleMaps} label="Google Maps" />
            <MapLink href={maps.openMaps} label="Open Maps" />
          </div>
        </Section>

        <Section title="Tickets & Participants">
          <DetailRow label="Ticket Sales" value={`${ops.ticketsSold.toLocaleString()} sold`} />
          <DetailRow label="Registered" value={`${ops.capacity.registered} / ${ops.capacity.maximum || "—"}`} />
        </Section>

        <Section title="Officials">
          <DetailRow label="Assigned" value={String(ops.officials.referees + ops.officials.judges + ops.officials.doctors)} />
          <DetailRow label="Broadcast" value={ops.broadcastPartner || "TBA"} />
        </Section>

        {ops.sponsors.length > 0 ? (
          <Section title="Sponsors">
            <p className="text-sm text-zinc-300">{ops.sponsors.join(", ")}</p>
          </Section>
        ) : null}

        <div className="mt-5">
          <EventHealthPanel entry={entry} />
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton icon={Pencil} label="Edit" onClick={onEdit} primary />
          <ActionButton disabled={readOnly} icon={Copy} label="Duplicate" onClick={onDuplicate} />
          <ActionButton disabled={readOnly} icon={Radio} label="Publish" onClick={onPublish} />
          <ActionButton disabled={readOnly} icon={Archive} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-white/5 pt-5">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}

function MapLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="rounded-full border border-white/10 px-3 py-2 text-center text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300 hover:text-white" href={href} rel="noreferrer" target="_blank">
      {label}
    </a>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  primary = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Pencil;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
        primary ? "bg-[#FF1010] text-white hover:bg-[#ff2828]" : "border border-white/10 text-zinc-300 hover:text-white"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
