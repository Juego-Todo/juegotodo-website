"use client";

import { Command, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileSectionId } from "@/components/profile/ProfileSidebarNav";
import {
  buildCommandActions,
  type CommandAction,
  type WorkspaceTabId,
} from "@/lib/profile/mission-control";
import type { ProfileRoleModule } from "@/lib/profile/role-modules";

export function ProfileCommandPalette({
  open,
  onClose,
  role,
  isAdmin,
  onNavigateSection,
  onNavigateTab,
}: {
  open: boolean;
  onClose: () => void;
  role: ProfileRoleModule;
  isAdmin: boolean;
  onNavigateSection: (section: ProfileSectionId) => void;
  onNavigateTab: (tab: WorkspaceTabId) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const actions = useMemo(() => buildCommandActions(role, isAdmin), [role, isAdmin]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return actions;
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(normalized) ||
        action.keywords.some((keyword) => keyword.includes(normalized)),
    );
  }, [actions, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function runAction(action: CommandAction) {
    onClose();
    if (action.href) {
      router.push(action.href);
      return;
    }
    if (action.tab) {
      onNavigateTab(action.tab);
    }
    if (action.section) {
      onNavigateSection(action.section);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm">
      <button aria-label="Close command palette" className="absolute inset-0" onClick={onClose} type="button" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0d0d0d] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="text-zinc-500" size={18} aria-hidden />
          <input
            autoFocus
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            value={query}
          />
          <kbd className="hidden rounded border border-white/10 px-2 py-1 text-[0.58rem] text-zinc-500 sm:inline">
            Esc
          </kbd>
        </div>
        <ul className="max-h-[24rem] overflow-y-auto p-2">
          {filtered.map((action) => (
            <li key={action.id}>
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-white/5 hover:text-white"
                onClick={() => runAction(action)}
                type="button"
              >
                <Command size={14} className="text-zinc-500" aria-hidden />
                {action.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-zinc-500">No commands found.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

export function ProfileCommandPaletteHotkey({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);

  return null;
}
