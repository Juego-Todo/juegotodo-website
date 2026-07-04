"use client";

import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import { assignableUserTypeTags, toggleAdminAssignedTag } from "@/lib/profile/account-tags";
import type { UserTypeTagId } from "@/data/user-type-tags";
import { useEffect, useState } from "react";

export function AdminAccountTagEditor({
  userId,
  initialTags,
  onChange,
  compact = false,
}: {
  userId: string;
  initialTags: UserTypeTagId[];
  onChange?: (tags: UserTypeTagId[]) => void;
  compact?: boolean;
}) {
  const [tags, setTags] = useState<UserTypeTagId[]>(initialTags);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags, userId]);

  function handleToggle(tagId: UserTypeTagId) {
    const next = toggleAdminAssignedTag(userId, tagId);
    setTags(next);
    onChange?.(next);
  }

  return (
    <div className={compact ? "" : "mt-4 border-t border-white/10 pt-4"}>
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Account Type Tags</p>
      <p className="mt-1 text-xs text-zinc-500">Assign tags to unlock identity panel tools for this account.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tagId) => (
          <UserTypeBadge key={tagId} tagId={tagId} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {assignableUserTypeTags.map((tagId) => {
          const active = tags.includes(tagId);
          return (
            <button
              className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
                active
                  ? "border-[#FF1010] bg-[#FF1010]/20 text-white"
                  : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
              key={tagId}
              onClick={() => handleToggle(tagId)}
              type="button"
            >
              {active ? "Remove" : "Add"} {tagId.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
