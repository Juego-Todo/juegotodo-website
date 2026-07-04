"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CalendarEntry, CalendarEntryInput } from "@/data/calendar-entries";
import {
  defaultEventTypeForCategory,
  filterEntriesByCategory,
  getCategoryStats,
  type EventCategory,
} from "@/data/event-categories";
import { AdminCalendarAgendaView, AdminCalendarYearView } from "@/components/admin/calendar/AdminCalendarAgendaYearViews";
import { AdminCalendarAnalyticsView } from "@/components/admin/calendar/AdminCalendarAnalyticsView";
import { AdminCalendarCategoryNav } from "@/components/admin/calendar/AdminCalendarCategoryNav";
import { AdminCalendarDetailPanel } from "@/components/admin/calendar/AdminCalendarDetailPanel";
import { AdminCalendarFilterDrawer } from "@/components/admin/calendar/AdminCalendarFilterDrawer";
import { AdminCalendarEventWizard } from "@/components/admin/calendar/AdminCalendarEventWizard";
import { AdminCalendarHeader } from "@/components/admin/calendar/AdminCalendarHeader";
import { AdminCalendarListView } from "@/components/admin/calendar/AdminCalendarListView";
import { AdminCalendarMonthView } from "@/components/admin/calendar/AdminCalendarMonthView";
import { AdminCalendarTimelineView } from "@/components/admin/calendar/AdminCalendarTimelineView";
import { useAuth } from "@/lib/auth/context";
import {
  applyLocationContext,
  countActiveFilters,
  defaultCalendarFilters,
  filterCalendarEntries,
  getFilterOptions,
  type AdminCalendarView,
  type LocationContext,
} from "@/lib/admin/calendar-dashboard";
import {
  createCalendarEntry,
  duplicateCalendarEntry,
  exportCalendarEntries,
  getAllCalendarEntries,
  getCalendarDashboardStats,
  importCalendarEntries,
  rescheduleCalendarEntry,
  updateCalendarEntry,
  updateCalendarOperationalStatus,
} from "@/lib/calendar/storage";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

export function AdminCalendarDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState(() => getAllCalendarEntries(true));
  const [loaded, setLoaded] = useState(true);
  const [category, setCategory] = useState<EventCategory>("competitions");
  const [view, setView] = useState<AdminCalendarView>("timeline");
  const [filters, setFilters] = useState(defaultCalendarFilters());
  const [draftFilters, setDraftFilters] = useState(defaultCalendarFilters());
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [locationContext, setLocationContext] = useState<LocationContext>({});
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [formPreset, setFormPreset] = useState<Partial<CalendarEntryInput> | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const displayView: AdminCalendarView = isMobile ? "agenda" : view;

  const refreshEntries = useCallback(() => {
    setEntries(getAllCalendarEntries(true));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const searchedEntries = useMemo(() => filterCalendarEntries(entries, filters), [entries, filters]);

  const filteredEntries = useMemo(() => {
    const inCategory = filterEntriesByCategory(searchedEntries, category);
    return applyLocationContext(inCategory, locationContext);
  }, [searchedEntries, category, locationContext]);

  const categoryStats = useMemo(() => getCategoryStats(category, searchedEntries), [category, searchedEntries]);
  const analyticsStats = useMemo(() => getCalendarDashboardStats(filteredEntries), [filteredEntries]);
  const filterOptions = useMemo(() => getFilterOptions(filterEntriesByCategory(searchedEntries, category)), [searchedEntries, category]);
  const activeFilterCount = countActiveFilters(filters);

  function showToast(message: string) {
    setToast(message);
  }

  function handleCategoryChange(next: EventCategory) {
    setCategory(next);
    setSelectedEntry(null);
  }

  function openCreate(preset?: Partial<CalendarEntryInput>) {
    setEditingEntry(null);
    setFormPreset(preset ?? { eventType: defaultEventTypeForCategory(category) });
    setFormOpen(true);
  }

  function openEdit(entry: CalendarEntry) {
    if (entry.source === "static") {
      showToast("Seeded events are read-only. Duplicate to create an editable copy.");
      return;
    }
    setEditingEntry(entry);
    setFormPreset(undefined);
    setFormOpen(true);
  }

  function handleSelectEntry(entry: CalendarEntry) {
    setSelectedEntry(entry);
    setLocationContext({
      country: entry.location.country || "Philippines",
      region: entry.location.region || entry.region,
      city: entry.location.city || entry.city,
      venue: entry.location.venue || entry.venue,
    });
  }

  async function handleSubmit(payload: CalendarEntryInput, editingId: string | null) {
    if (editingId) {
      updateCalendarEntry(editingId, payload);
      showToast("Event updated.");
    } else {
      createCalendarEntry(payload, user?.id);
      showToast("Event created.");
    }
    refreshEntries();
  }

  function handleExport() {
    const blob = new Blob([exportCalendarEntries()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "juego-todo-calendar-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Calendar exported.");
  }

  function handleImport() {
    const raw = window.prompt("Paste calendar JSON export:");
    if (!raw) return;
    try {
      importCalendarEntries(raw, user?.id);
      refreshEntries();
      showToast("Schedule imported.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Import failed.");
    }
  }

  function handlePublishChanges() {
    const drafts = entries.filter((entry) => entry.operationalStatus === "draft" && entry.source === "admin");
    drafts.forEach((entry) => updateCalendarOperationalStatus(entry.id, "published"));
    refreshEntries();
    showToast(drafts.length > 0 ? `${drafts.length} draft events published.` : "All visible changes are already published.");
  }

  function handleReschedule(entryId: string, date: Date) {
    try {
      rescheduleCalendarEntry(entryId, date.toISOString());
      refreshEntries();
      showToast("Event rescheduled.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to reschedule seeded events.");
    }
  }

  function openFilterDrawer() {
    setDraftFilters(filters);
    setFilterDrawerOpen(true);
  }

  return (
    <div className="relative space-y-5 pb-10">
      <AdminCalendarHeader
        activeFilterCount={activeFilterCount}
        category={category}
        onCreate={() => openCreate()}
        onExport={handleExport}
        onImport={handleImport}
        onOpenFilters={openFilterDrawer}
        onPublish={handlePublishChanges}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        onViewChange={setView}
        search={filters.search}
        stats={categoryStats}
        view={displayView}
      />

      <AdminCalendarCategoryNav category={category} onChange={handleCategoryChange} />

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          key={`${category}-${displayView}`}
          transition={{ duration: 0.2 }}
        >
          {!loaded ? (
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-6 py-16 text-center text-zinc-400">Loading events...</div>
          ) : displayView === "calendar" ? (
            <AdminCalendarMonthView
              activeMonth={activeMonth}
              entries={filteredEntries}
              onMonthChange={setActiveMonth}
              onReschedule={handleReschedule}
              onSelectEntry={handleSelectEntry}
              selectedEntryId={selectedEntry?.id ?? null}
            />
          ) : displayView === "timeline" ? (
            <AdminCalendarTimelineView entries={filteredEntries} onSelectEntry={handleSelectEntry} selectedEntryId={selectedEntry?.id ?? null} />
          ) : displayView === "agenda" ? (
            <AdminCalendarAgendaView entries={filteredEntries} onSelectEntry={handleSelectEntry} selectedEntryId={selectedEntry?.id ?? null} />
          ) : displayView === "year" ? (
            <AdminCalendarYearView entries={filteredEntries} onSelectEntry={handleSelectEntry} selectedEntryId={selectedEntry?.id ?? null} />
          ) : displayView === "analytics" ? (
            <AdminCalendarAnalyticsView entries={filteredEntries} stats={analyticsStats} />
          ) : (
            <AdminCalendarListView
              entries={filteredEntries}
              onArchive={(entry) => {
                updateCalendarOperationalStatus(entry.id, "archived");
                refreshEntries();
                showToast("Event archived.");
              }}
              onDuplicate={(entry) => {
                duplicateCalendarEntry(entry.id, user?.id);
                refreshEntries();
                showToast("Event duplicated as draft.");
              }}
              onEdit={openEdit}
              onPublish={(entry) => {
                updateCalendarOperationalStatus(entry.id, "published");
                refreshEntries();
                showToast("Event published.");
              }}
              onSelectEntry={handleSelectEntry}
              selectedEntryId={selectedEntry?.id ?? null}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AdminCalendarFilterDrawer
        draft={draftFilters}
        onApply={() => {
          setFilters(draftFilters);
          setFilterDrawerOpen(false);
        }}
        onClear={() => setDraftFilters(defaultCalendarFilters())}
        onClose={() => setFilterDrawerOpen(false)}
        onDraftChange={setDraftFilters}
        open={filterDrawerOpen}
        options={filterOptions}
      />

      <AdminCalendarDetailPanel
        entry={selectedEntry}
        onArchive={() => {
          if (!selectedEntry) return;
          updateCalendarOperationalStatus(selectedEntry.id, "archived");
          refreshEntries();
          setSelectedEntry(null);
          showToast("Event archived.");
        }}
        onClose={() => setSelectedEntry(null)}
        onDuplicate={() => {
          if (!selectedEntry) return;
          duplicateCalendarEntry(selectedEntry.id, user?.id);
          refreshEntries();
          showToast("Event duplicated as draft.");
        }}
        onEdit={() => selectedEntry && openEdit(selectedEntry)}
        onPublish={() => {
          if (!selectedEntry) return;
          updateCalendarOperationalStatus(selectedEntry.id, "published");
          refreshEntries();
          showToast("Event published.");
        }}
      />

      <AdminCalendarEventWizard
        category={category}
        editingEntry={editingEntry}
        onClose={() => {
          setFormOpen(false);
          setEditingEntry(null);
          setFormPreset(undefined);
        }}
        onSubmit={handleSubmit}
        open={formOpen}
        preset={formPreset}
      />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-white/10 bg-black/85 px-5 py-3 text-sm text-white backdrop-blur">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
