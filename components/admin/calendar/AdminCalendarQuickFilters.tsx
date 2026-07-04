"use client";

import { ChevronRight, X } from "lucide-react";
import type { LocationContext } from "@/lib/admin/calendar-dashboard";

export function AdminCalendarLocationBreadcrumb({
  context,
  onChange,
}: {
  context: LocationContext;
  onChange: (context: LocationContext) => void;
}) {
  const segments = [
    { key: "country" as const, label: context.country ?? "National", value: context.country },
    context.region ? { key: "region" as const, label: context.region, value: context.region } : null,
    context.city ? { key: "city" as const, label: context.city, value: context.city } : null,
    context.venue ? { key: "venue" as const, label: context.venue, value: context.venue } : null,
  ].filter(Boolean) as Array<{ key: keyof LocationContext; label: string; value: string }>;

  const hasContext = Boolean(context.country || context.region || context.city || context.venue);

  if (!hasContext) {
    return (
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">
        Browse all locations · select an event to drill into region, city, or venue
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">Context</span>
      {segments.map((segment, index) => (
        <div className="flex items-center gap-2" key={segment.key}>
          {index > 0 ? <ChevronRight className="h-3 w-3 text-zinc-600" /> : null}
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-300 hover:text-white"
            onClick={() => {
              const next: LocationContext = {};
              if (segment.key === "country") {
                next.country = segment.value;
              } else if (segment.key === "region") {
                next.country = context.country;
                next.region = segment.value;
              } else if (segment.key === "city") {
                next.country = context.country;
                next.region = context.region;
                next.city = segment.value;
              } else if (segment.key === "venue") {
                next.country = context.country;
                next.region = context.region;
                next.city = context.city;
                next.venue = segment.value;
              }
              onChange(next);
            }}
            type="button"
          >
            {segment.label}
          </button>
        </div>
      ))}
      <button className="inline-flex items-center gap-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500 hover:text-white" onClick={() => onChange({})} type="button">
        <X size={12} /> Clear
      </button>
    </div>
  );
}
