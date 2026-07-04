"use client";

import { Building2, GraduationCap, Trophy, Users } from "lucide-react";
import type { EventCategory } from "@/data/event-categories";
import { eventCategoryLabels } from "@/data/event-categories";

const categoryIcons: Record<EventCategory, typeof Trophy> = {
  competitions: Trophy,
  community: Users,
  education: GraduationCap,
  administration: Building2,
};

export function AdminCalendarCategoryNav({
  category,
  onChange,
}: {
  category: EventCategory;
  onChange: (category: EventCategory) => void;
}) {
  const categories: EventCategory[] = ["competitions", "education", "community", "administration"];

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {categories.map((item) => {
          const Icon = categoryIcons[item];
          const active = category === item;
          return (
            <button
              className={`rounded-[1.15rem] border px-4 py-4 text-left transition ${
                active
                  ? "border-[#FF1010]/40 bg-[#FF1010]/10 shadow-[0_0_24px_rgba(255,16,16,0.12)]"
                  : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30"
              }`}
              key={item}
              onClick={() => onChange(item)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${active ? "bg-[#FF1010]/20 text-red-100" : "bg-white/5 text-zinc-400"}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className={`text-[0.62rem] font-black uppercase tracking-[0.14em] ${active ? "text-white" : "text-zinc-400"}`}>
                    {eventCategoryLabels[item]}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
    </div>
  );
}
