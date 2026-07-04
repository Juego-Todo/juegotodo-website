"use client";

import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";

export function UserTypeBadge({ tagId, compact = false }: { tagId: UserTypeTagId; compact?: boolean }) {
  const tag = userTypeTags[tagId];
  const Icon = tag.icon;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border ${
        compact ? "px-2 py-1 text-[0.625rem] tracking-[0.1em]" : "px-2.5 py-1 text-[0.62rem] tracking-[0.14em]"
      } font-bold uppercase ${tag.borderColor} ${tag.backgroundColor} ${tag.color}`}
    >
      <Icon aria-hidden size={compact ? 11 : 12} />
      <span className="truncate">{tag.label}</span>
    </span>
  );
}
