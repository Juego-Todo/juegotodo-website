import { Calendar } from "lucide-react";
import Link from "next/link";
import { CALENDAR_PATH } from "@/lib/navigation/calendar";

type SeeCalendarButtonProps = {
  className?: string;
  fullWidth?: boolean;
  label?: string;
  variant?: "hero" | "card";
};

export function SeeCalendarButton({
  className = "",
  fullWidth = false,
  label = "See Calendar",
  variant = "hero",
}: SeeCalendarButtonProps) {
  const variantClass =
    variant === "card"
      ? "mt-4 rounded-full bg-[#FF1010] px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2828] sm:mt-5"
      : "rounded-full border border-white/20 bg-black/55 px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-white/15 sm:text-sm";

  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 ${fullWidth ? "w-full" : ""} ${variantClass} ${className}`}
      href={CALENDAR_PATH}
    >
      <Calendar size={variant === "card" ? 13 : 16} aria-hidden />
      {label}
    </Link>
  );
}

export { CALENDAR_PATH };
