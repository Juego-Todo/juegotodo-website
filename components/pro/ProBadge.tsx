"use client";

type ProBadgeVariant = "default" | "locked" | "active";

const STYLES: Record<ProBadgeVariant, string> = {
  default: "border-[#FFCF6A]/35 bg-[#FFCF6A]/12 text-[#FFCF6A]",
  locked: "border-white/15 bg-white/5 text-zinc-400",
  active: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
};

export function ProBadge({
  label = "PRO",
  variant = "default",
  className = "",
}: {
  label?: string;
  variant?: ProBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] ${STYLES[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
