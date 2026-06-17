"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";

type SaveEntityButtonProps = {
  type: "fighter" | "event" | "team";
  slug: string;
  label?: string;
};

export function SaveEntityButton({ type, slug, label }: SaveEntityButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { userData, toggleSavedFighter, toggleSavedEvent, toggleSavedTeam } = useCommerce();

  const saved =
    type === "fighter"
      ? userData.savedFighters.includes(slug)
      : type === "team"
        ? userData.savedTeams.includes(slug)
        : userData.savedEvents.includes(slug);

  function handleClick() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (type === "fighter") {
      toggleSavedFighter(slug);
    } else if (type === "team") {
      toggleSavedTeam(slug);
    } else {
      toggleSavedEvent(slug);
    }
  }

  const defaultLabel =
    type === "fighter" ? "Save Fighter" : type === "team" ? "Save Team" : "Save Event";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
        saved
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-white/15 text-zinc-300 hover:border-red-500/40 hover:text-white"
      }`}
      onClick={handleClick}
      type="button"
    >
      <Star className="mr-2" fill={saved ? "currentColor" : "none"} size={14} aria-hidden />
      {label ?? (saved ? "Saved" : defaultLabel)}
    </button>
  );
}
