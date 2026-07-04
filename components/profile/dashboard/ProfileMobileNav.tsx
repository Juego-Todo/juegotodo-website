"use client";

import { Activity, CreditCard, LayoutDashboard, Settings, Trophy } from "lucide-react";
import type { MobileTabId } from "@/lib/profile/mission-control";

const icons: Record<MobileTabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  career: Trophy,
  credential: CreditCard,
  activity: Activity,
  settings: Settings,
};

export function ProfileMobileNav({
  active,
  onChange,
  fighterMode = false,
  adminMode = false,
  hideCredentials = false,
}: {
  active: MobileTabId;
  onChange: (tab: MobileTabId) => void;
  fighterMode?: boolean;
  adminMode?: boolean;
  hideCredentials?: boolean;
}) {
  const baseTabs: MobileTabId[] = fighterMode
    ? ["dashboard", "career", "credential", "settings"]
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
          career: "Career",
          credential: "Credential",
          activity: "Administration",
          settings: "Settings",
        }
      : {
          dashboard: "Home",
          career: "Career",
          credential: "Credential",
          activity: "Activity",
          settings: "Settings",
        };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {tabs.map((tab) => {
          const Icon = icons[tab];
          const selected = active === tab;
          return (
            <button
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-14 min-w-[4.2rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 transition ${
                selected ? "text-[#FF1010]" : "text-zinc-500"
              }`}
              key={tab}
              onClick={() => onChange(tab)}
              type="button"
            >
              <Icon size={18} aria-hidden />
              <span className="text-[0.52rem] font-black uppercase tracking-[0.12em]">{labels[tab]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
