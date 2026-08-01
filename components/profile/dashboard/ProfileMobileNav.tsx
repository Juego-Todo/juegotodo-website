"use client";

import { Activity, CalendarDays, CreditCard, LayoutDashboard, Search, Settings, Trophy } from "lucide-react";
import type { MobileTabId } from "@/lib/profile/mission-control";

const defaultIcons: Record<MobileTabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  career: Trophy,
  credential: CreditCard,
  activity: Activity,
  settings: Settings,
};

const fanIcons: Record<MobileTabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  career: CalendarDays,
  credential: CreditCard,
  activity: Search,
  settings: Settings,
};

export function ProfileMobileNav({
  active,
  onChange,
  fighterMode = false,
  adminMode = false,
  fanMode = false,
  coachMode = false,
  hideCredentials = false,
}: {
  active: MobileTabId;
  onChange: (tab: MobileTabId) => void;
  fighterMode?: boolean;
  adminMode?: boolean;
  fanMode?: boolean;
  coachMode?: boolean;
  hideCredentials?: boolean;
}) {
  const baseTabs: MobileTabId[] = fighterMode
    ? ["dashboard", "career", "credential", "settings"]
    : fanMode
      ? ["dashboard", "career", "activity", "settings"]
      : ["dashboard", "career", "credential", "activity", "settings"];
  const tabs = hideCredentials ? baseTabs.filter((tab) => tab !== "credential") : baseTabs;

  const labels: Record<MobileTabId, string> = fighterMode
    ? {
        dashboard: "Profile",
        career: "Dashboard",
        credential: "Credential",
        activity: "Activity",
        settings: "Settings",
      }
    : adminMode
      ? {
          dashboard: "Home",
          career: "Shop",
          credential: "Credential",
          activity: "Licenses",
          settings: "Settings",
        }
      : fanMode
        ? {
            dashboard: "Home",
            career: "Calendar",
            credential: "Credential",
            activity: "Latayanology",
            settings: "Settings",
          }
        : coachMode
          ? {
              dashboard: "Home",
              career: "Roster",
              credential: "Credential",
              activity: "Activity",
              settings: "Settings",
            }
          : {
              dashboard: "Home",
              career: "Career",
              credential: "Credential",
              activity: "Activity",
              settings: "Settings",
            };

  const icons = fanMode ? fanIcons : defaultIcons;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
        {tabs.map((tab) => {
          const Icon = icons[tab];
          const selected = active === tab;
          return (
            <button
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition ${
                selected ? "text-[#FF1010]" : "text-zinc-500"
              }`}
              key={tab}
              onClick={() => onChange(tab)}
              type="button"
            >
              <Icon size={18} aria-hidden />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.08em]">{labels[tab]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
