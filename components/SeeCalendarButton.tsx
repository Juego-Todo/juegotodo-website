"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export const CALENDAR_PATH = "/calendar";

type SeeCalendarButtonProps = {
  className?: string;
  fullWidth?: boolean;
  variant?: "hero" | "card";
};

export function SeeCalendarButton({
  className = "",
  fullWidth = false,
  variant = "hero",
}: SeeCalendarButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  function handleClick() {
    if (user) {
      router.push(CALENDAR_PATH);
      return;
    }

    router.push(`/login?next=${encodeURIComponent(CALENDAR_PATH)}`);
  }

  const variantClass =
    variant === "card"
      ? "mt-4 rounded-full bg-[#FF1010] px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828] sm:mt-5"
      : "rounded-full border border-white/20 bg-black/55 px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-white/15 sm:text-sm";

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 ${fullWidth ? "w-full" : ""} ${variantClass} ${className}`}
      onClick={handleClick}
      type="button"
    >
      <Calendar size={variant === "card" ? 13 : 16} aria-hidden />
      See Calendar
    </button>
  );
}
