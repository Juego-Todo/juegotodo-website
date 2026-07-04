"use client";

import {
  categoryQuickFilters,
  type EventCategory,
} from "@/data/event-categories";

export function AdminCalendarCategoryQuickFilters({
  category,
  active,
  onToggle,
  onClear,
}: {
  category: EventCategory;
  active: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const chips = categoryQuickFilters[category];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`rounded-full border px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition ${
          active.length === 0 ? "border-[#FF1010]/40 bg-[#FF1010]/15 text-white" : "border-white/10 text-zinc-400 hover:text-white"
        }`}
        onClick={onClear}
        type="button"
      >
        All
      </button>
      {chips.map((chip) => {
        const selected = active.includes(chip.id);
        return (
          <button
            className={`rounded-full border px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.12em] transition ${
              selected ? "border-[#FF1010]/40 bg-[#FF1010]/15 text-white" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
            key={chip.id}
            onClick={() => onToggle(chip.id)}
            type="button"
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
