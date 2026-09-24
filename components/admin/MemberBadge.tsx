"use client";

import { Crown, Shield } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { MemberBadgeVariant, MemberDisplayBadge } from "@/lib/admin/member-badges";
import { compactBadgeList } from "@/lib/admin/member-badges";

const VARIANT_CLASS: Record<MemberBadgeVariant, string> = {
  account: "border-white/10 bg-white/[0.04] text-zinc-400",
  permission: "border-[#FFCF6A]/30 bg-[#FFCF6A]/10 text-[#FFCF6A]",
  role: "border-white/12 bg-white/[0.05] text-zinc-300",
  leadership: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  credential: "border-white/10 bg-black/40 text-zinc-300",
  status: "border-white/10 bg-white/[0.04] text-zinc-400",
};

function BadgeIcon({ variant }: { variant: MemberBadgeVariant }) {
  if (variant === "permission") {
    return <Shield size={10} strokeWidth={2.25} aria-hidden />;
  }
  if (variant === "leadership") {
    return <Crown size={10} strokeWidth={2.25} aria-hidden />;
  }
  return null;
}

export function MemberBadge({
  label,
  fullLabel,
  variant = "role",
  title,
}: {
  label: string;
  fullLabel?: string;
  variant?: MemberBadgeVariant;
  title?: string;
}) {
  return (
    <span
      className={`inline-flex h-5 max-w-full items-center gap-1 rounded-md border px-1.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] ${VARIANT_CLASS[variant]}`}
      title={title ?? fullLabel ?? label}
    >
      <BadgeIcon variant={variant} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function OverflowPopover({
  label,
  items,
  title,
}: {
  label: string;
  items: MemberDisplayBadge[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        aria-controls={listId}
        aria-expanded={open}
        aria-label={`Show ${items.length} more: ${items.map((item) => item.fullLabel).join(", ")}`}
        className="inline-flex h-5 items-center rounded-md border border-white/12 bg-white/[0.04] px-1.5 text-[0.625rem] font-medium text-zinc-400 transition hover:border-white/25 hover:text-zinc-200"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        title={items.map((item) => item.fullLabel).join(", ")}
        type="button"
      >
        {label}
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-30 mt-1 min-w-[10rem] rounded-lg border border-white/10 bg-[#111] p-2 shadow-xl"
          id={listId}
          role="list"
        >
          <p className="mb-1.5 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {title}
          </p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <MemberBadge fullLabel={item.fullLabel} label={item.fullLabel} variant={item.variant} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MemberBadgeList({
  badges,
  limit = 2,
  empty = "—",
  overflowTitle = "All",
}: {
  badges: MemberDisplayBadge[];
  limit?: number;
  empty?: ReactNode;
  overflowTitle?: string;
}) {
  if (badges.length === 0) {
    return <span className="text-xs text-zinc-600">{empty}</span>;
  }

  const { visible, hidden, hiddenCount } = compactBadgeList(badges, limit);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((badge) => (
        <MemberBadge
          fullLabel={badge.fullLabel}
          key={badge.id}
          label={badge.label}
          variant={badge.variant}
        />
      ))}
      {hiddenCount > 0 ? (
        <OverflowPopover
          items={[...visible, ...hidden]}
          label={`+${hiddenCount}`}
          title={overflowTitle}
        />
      ) : null}
    </div>
  );
}
