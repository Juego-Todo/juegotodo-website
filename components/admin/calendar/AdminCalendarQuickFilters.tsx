"use client";

import { BackButton } from "@/components/BackButton";
import { X } from "lucide-react";
import type { LocationContext } from "@/lib/admin/calendar-dashboard";

function parentLocationContext(context: LocationContext): LocationContext {
  if (context.venue) {
    return {
      country: context.country,
      region: context.region,
      city: context.city,
    };
  }

  if (context.city) {
    return {
      country: context.country,
      region: context.region,
    };
  }

  if (context.region) {
    return { country: context.country };
  }

  if (context.country) {
    return {};
  }

  return {};
}

function currentLocationLabel(context: LocationContext) {
  return context.venue ?? context.city ?? context.region ?? context.country ?? "All Locations";
}

export function AdminCalendarLocationBreadcrumb({
  context,
  onChange,
}: {
  context: LocationContext;
  onChange: (context: LocationContext) => void;
}) {
  const hasContext = Boolean(context.country || context.region || context.city || context.venue);

  if (!hasContext) {
    return (
      <p className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600">
        Browse all locations · select an event to drill into region, city, or venue
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <BackButton
        label="Back"
        onClick={() => onChange(parentLocationContext(context))}
      />
      <span className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-500">
        {currentLocationLabel(context)}
      </span>
      <button
        className="inline-flex items-center gap-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-500 hover:text-white"
        onClick={() => onChange({})}
        type="button"
      >
        <X size={12} aria-hidden />
        Clear
      </button>
    </div>
  );
}
