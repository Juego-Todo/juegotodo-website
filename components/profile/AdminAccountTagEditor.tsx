"use client";

import { UserTypeBadge } from "@/components/profile/UserTypeBadge";
import {
  assignableUserTypeTags,
  normalizeAssignedTags,
  saveAdminAssignedTags,
} from "@/lib/profile/account-tags";
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
  const [tags, setTags] = useState<UserTypeTagId[]>(() => normalizeAssignedTags(initialTags));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const tagSyncKey = `${userId}:${normalizeAssignedTags(initialTags).join(",")}`;
  const [lastTagSyncKey, setLastTagSyncKey] = useState(tagSyncKey);

  if (tagSyncKey !== lastTagSyncKey) {
    setLastTagSyncKey(tagSyncKey);
    setTags(normalizeAssignedTags(initialTags));
    setError("");
  }

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/admin/members/${userId}/tags`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { tags?: UserTypeTagId[] };
        if (!cancelled) {
          setTags(normalizeAssignedTags(payload.tags));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggle(tagId: UserTypeTagId) {
    const previous = tags;
    const next = previous.includes(tagId)
      ? previous.filter((entry) => entry !== tagId)
      : [...previous, tagId];

    setTags(next);
    setSaving(true);
    setError("");

    try {
      const saved = await saveAdminAssignedTags(userId, next);
      setTags(saved);
      onChange?.(saved);
    } catch (caught) {
      setTags(previous);
      setError(caught instanceof Error ? caught.message : "Unable to save tags.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-4 border-t border-white/10 pt-4"}>
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Account Type Tags</p>
      <p className="mt-1 text-xs text-zinc-500">
        Assign tags to unlock the right portal tools for this member. Changes save to their account.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tagId) => (
          <UserTypeBadge key={tagId} tagId={tagId} />
        ))}
        {tags.length === 0 ? <span className="text-xs text-zinc-500">No tags assigned</span> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {assignableUserTypeTags.map((tagId) => {
          const active = tags.includes(tagId);
          return (
            <button
              className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] transition disabled:opacity-50 ${
                active
                  ? "border-[#FF1010] bg-[#FF1010]/20 text-white"
                  : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
              disabled={saving}
              key={tagId}
              onClick={() => void handleToggle(tagId)}
              type="button"
            >
              {active ? "Remove" : "Add"} {tagId.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      {saving ? <p className="mt-2 text-xs text-zinc-500">Saving…</p> : null}
    </div>
  );
}
