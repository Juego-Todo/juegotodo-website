"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Lock,
  Share2,
  Sparkles,
  TicketPercent,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { UserProfile } from "@/lib/auth/types";
import {
  buildOnboardingChecklist,
  dismissOnboarding,
  getOnboardingSocialLinks,
  getOnboardingState,
  markOnboardingSocialClick,
  shouldShowOnboarding,
  type OnboardingChecklistItem,
  type OnboardingSocialPlatform,
  type OnboardingState,
} from "@/lib/profile/onboarding";

const itemIcons: Record<OnboardingChecklistItem["id"], typeof Camera> = {
  photo: Camera,
  details: UserRound,
  social: Share2,
  reward: Gift,
};

export function ProfileOnboardingChecklist({
  user,
  portraitImage,
  dateOfBirth,
  phone,
}: {
  user: UserProfile;
  portraitImage?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
}) {
  const titleId = useId();
  const [state, setState] = useState<OnboardingState>(() => getOnboardingState(user.id));
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = buildOnboardingChecklist({
    user,
    portraitImage,
    dateOfBirth,
    phone,
    state,
  });
  const shouldShow = shouldShowOnboarding(user.id, items);

  useEffect(() => {
    setState(getOnboardingState(user.id));
  }, [user.id, portraitImage, dateOfBirth, phone, user.city, user.username]);

  useEffect(() => {
    if (shouldShow) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // handleDismiss is stable enough for this effect's purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id]);

  const socialLinks = getOnboardingSocialLinks();
  const doneCount = items.filter((item) => item.complete).length;
  const progress = Math.round((doneCount / items.length) * 100);
  const socialDone = socialLinks.every((link) =>
    Boolean(state.socialClicks[link.icon as OnboardingSocialPlatform]),
  );
  const rewardUnlocked = Boolean(state.rewardCode) && !state.rewardRedeemedAt;

  function handleDismiss() {
    setState(dismissOnboarding(user.id));
    setOpen(false);
  }

  function handleSocialClick(platform: OnboardingSocialPlatform) {
    setState(markOnboardingSocialClick(user.id, platform));
  }

  async function handleCopyCode() {
    if (!state.rewardCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(state.rewardCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="presentation"
        >
          <button
            aria-label="Close rewards checklist"
            className="absolute inset-0 cursor-default"
            onClick={handleDismiss}
            type="button"
          />

          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-labelledby={titleId}
            aria-modal="true"
            className="relative z-[1] w-full max-w-md overflow-hidden rounded-[1.5rem] border border-[#FF1010]/30 bg-gradient-to-b from-[#1a0808] via-[#0d0d0d] to-black p-4 shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:max-w-lg sm:rounded-[1.75rem] sm:p-5"
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            role="dialog"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#FF1010]/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 left-8 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl"
              aria-hidden
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">
                    <Sparkles size={11} aria-hidden />
                    Rewards unlock
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl" id={titleId}>
                    First-time checklist
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
                    Finish steps to claim your welcome discount.
                  </p>
                </div>
                <button
                  aria-label="Dismiss checklist"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition hover:border-white/30 hover:text-white"
                  onClick={handleDismiss}
                  type="button"
                >
                  <X size={15} aria-hidden />
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.7rem] font-medium text-zinc-300 sm:text-xs">
                    {doneCount === items.length
                      ? "All rewards unlocked"
                      : `${doneCount} of ${items.length} milestones`}
                  </p>
                  <p className="text-[0.7rem] font-black tabular-nums text-amber-200 sm:text-xs">{progress}%</p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#FF1010] via-[#ff4d4d] to-amber-300"
                    initial={false}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {items.map((item, index) => {
                  const Icon = itemIcons[item.id];
                  return (
                    <motion.li
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition ${
                        item.complete
                          ? "border-emerald-400/25 bg-emerald-500/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                      initial={{ opacity: 0, y: 8 }}
                      key={item.id}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          item.complete
                            ? "bg-emerald-400 text-black"
                            : "border border-white/10 bg-black/40 text-zinc-400"
                        }`}
                      >
                        {item.complete ? (
                          <Check size={13} strokeWidth={2.75} aria-hidden />
                        ) : (
                          <Icon size={13} aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm font-semibold ${item.complete ? "text-emerald-100" : "text-white"}`}
                          >
                            {item.label}
                          </p>
                          {item.complete ? (
                            <span className="shrink-0 text-[0.55rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                              Done
                            </span>
                          ) : item.href ? (
                            <Link
                              className="shrink-0 text-[0.55rem] font-black uppercase tracking-[0.12em] text-[#FF1010] transition hover:text-[#ff3a3a]"
                              href={item.href}
                              onClick={handleDismiss}
                            >
                              Settings
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-3 rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-black/20 to-[#FF1010]/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200">
                    Follow & unlock 10% off
                  </p>
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-amber-100">
                    {socialDone ? "Unlocked" : `${Object.keys(state.socialClicks).length}/4`}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {socialLinks.map((link) => {
                    const platform = link.icon as OnboardingSocialPlatform;
                    const clicked = Boolean(state.socialClicks[platform]);
                    return (
                      <a
                        className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2 text-[0.7rem] font-bold transition sm:text-xs ${
                          clicked
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                            : "border-white/15 bg-black/40 text-zinc-100 hover:border-amber-300/40 hover:text-amber-100"
                        }`}
                        href={link.href}
                        key={link.href}
                        onClick={() => handleSocialClick(platform)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                        {clicked ? <Check size={12} aria-hidden /> : <ExternalLink size={11} aria-hidden />}
                      </a>
                    );
                  })}
                </div>

                {state.rewardCode ? (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mt-2 overflow-hidden rounded-xl border border-dashed border-amber-300/50 bg-gradient-to-r from-[#2a1208] via-[#1a0a0a] to-[#2a1208] px-3 py-2.5"
                    initial={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 to-[#FF1010]"
                      aria-hidden
                    />
                    <div className="flex items-center justify-between gap-2 pl-1">
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-[0.55rem] font-black uppercase tracking-[0.16em] text-amber-200">
                          <TicketPercent size={12} aria-hidden />
                          {state.rewardRedeemedAt ? "Redeemed" : "Welcome voucher"}
                        </p>
                        <p className="font-display mt-0.5 text-2xl uppercase leading-none text-white">10% Off</p>
                        <p className="mt-0.5 truncate font-mono text-xs font-bold tracking-[0.12em] text-amber-100">
                          {state.rewardCode}
                        </p>
                      </div>
                      {!state.rewardRedeemedAt ? (
                        <button
                          className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-[0.58rem] font-black uppercase tracking-[0.12em] text-black transition hover:bg-amber-100"
                          onClick={() => void handleCopyCode()}
                          type="button"
                        >
                          <Copy size={11} aria-hidden />
                          {copied ? "Copied" : "Copy"}
                        </button>
                      ) : null}
                    </div>
                    {rewardUnlocked ? (
                      <p className="mt-1 pl-1 text-[0.55rem] font-black uppercase tracking-[0.14em] text-emerald-300">
                        Ready to shop
                      </p>
                    ) : null}
                  </motion.div>
                ) : (
                  <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-dashed border-white/15 bg-black/40 px-3 py-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500">
                      <Lock size={14} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-lg uppercase leading-none text-zinc-500">10% Off</p>
                      <p className="mt-0.5 text-[0.7rem] leading-4 text-zinc-500">
                        Visit every social to unlock your shop code.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/15 text-[0.65rem] font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/30 hover:text-white"
                onClick={handleDismiss}
                type="button"
              >
                Continue to profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
