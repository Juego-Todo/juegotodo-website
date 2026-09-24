"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  Gift,
  TicketPercent,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { UserProfile } from "@/lib/auth/types";
import {
  buildOnboardingChecklist,
  dismissOnboarding,
  getOnboardingSocialLinks,
  getOnboardingState,
  isProfilePhotoComplete,
  markOnboardingSocialClick,
  shouldShowOnboarding,
  syncOnboardingProgress,
  type OnboardingSocialPlatform,
  type OnboardingState,
} from "@/lib/profile/onboarding";

export function ProfileOnboardingChecklist({
  user,
  portraitImage,
}: {
  user: UserProfile;
  portraitImage?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
}) {
  const [state, setState] = useState<OnboardingState>(() => getOnboardingState(user.id));
  const [copied, setCopied] = useState(false);
  const [trackedUserId, setTrackedUserId] = useState(user.id);
  const photoDone = isProfilePhotoComplete(portraitImage);

  if (user.id !== trackedUserId) {
    setTrackedUserId(user.id);
    setState(getOnboardingState(user.id));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(syncOnboardingProgress(user.id, photoDone));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user.id, photoDone]);

  const items = buildOnboardingChecklist({
    user,
    portraitImage,
    state,
  });
  const shouldShow = shouldShowOnboarding(user.id, items);

  if (!shouldShow) {
    return null;
  }

  const socialLinks = getOnboardingSocialLinks();
  const doneCount = items.filter((item) => item.complete).length;
  const progress = Math.round((doneCount / items.length) * 100);
  const allDone = doneCount === items.length;
  const socialDone = items.find((item) => item.id === "social")?.complete ?? false;
  const photoItem = items.find((item) => item.id === "photo");
  const socialItem = items.find((item) => item.id === "social");
  const rewardItem = items.find((item) => item.id === "reward");

  function handleDismiss() {
    setState(dismissOnboarding(user.id));
  }

  function handleSocialClick(platform: OnboardingSocialPlatform) {
    setState(markOnboardingSocialClick(user.id, platform, photoDone));
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

  return (
    <AnimatePresence>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808]"
        exit={{ opacity: 0, y: -10 }}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,16,16,0.18),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(255,207,106,0.08),transparent_40%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF1010]/60 to-transparent"
          aria-hidden
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#FF1010]">
                First-time rewards
              </p>
              <h2 className="font-display mt-2 text-2xl uppercase leading-none tracking-wide text-white sm:text-3xl">
                {allDone ? "Reward unlocked" : "Complete your setup"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                {allDone
                  ? "Your welcome voucher is ready — copy the code or head to the shop."
                  : "Finish two quick steps to unlock an automatic 10% shop voucher."}
              </p>
            </div>

            <div className="flex shrink-0 items-start gap-3">
              <div className="hidden text-right sm:block">
                <p className="font-display text-3xl leading-none text-white">{doneCount}</p>
                <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  of {items.length} done
                </p>
              </div>
              <button
                aria-label="Dismiss checklist"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-white/25 hover:text-white"
                onClick={handleDismiss}
                type="button"
              >
                <X size={15} aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
              <span>Progress</span>
              <span className="tabular-nums text-zinc-300">{progress}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#990000] via-[#FF1010] to-[#FFCF6A]"
                initial={false}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <ol className="relative mt-6 grid gap-0 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
            <MilestoneStep
              complete={Boolean(photoItem?.complete)}
              detail={photoItem?.complete ? "Looking sharp" : "Upload from your avatar above"}
              icon={photoItem?.complete ? Check : Camera}
              index={1}
              title={photoItem?.label ?? "Add a profile picture"}
            />

            <StepConnector complete={Boolean(photoItem?.complete)} />

            <MilestoneStep
              complete={Boolean(socialItem?.complete)}
              detail={socialDone ? "Thanks for following" : "Open Facebook or Instagram"}
              icon={socialItem?.complete ? Check : ExternalLink}
              index={2}
              title={socialItem?.label ?? "Follow Juego Todo"}
            >
              {!socialDone ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const platform = link.icon as OnboardingSocialPlatform;
                    const brandClass =
                      platform === "facebook"
                        ? "border-[#1877F2]/50 bg-[#1877F2] text-white hover:bg-[#166FE5] hover:border-[#1877F2]"
                        : "border-transparent bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:brightness-110";
                    return (
                      <a
                        className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[0.65rem] font-black uppercase tracking-[0.14em] transition ${brandClass}`}
                        href={link.href}
                        key={link.href}
                        onClick={() => handleSocialClick(platform)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                        <ExternalLink size={12} aria-hidden />
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </MilestoneStep>

            <StepConnector complete={Boolean(socialItem?.complete && photoItem?.complete)} />

            <MilestoneStep
              complete={Boolean(rewardItem?.complete)}
              detail={rewardItem?.detail ?? "Unlocks after photo + social"}
              highlight
              icon={rewardItem?.complete ? TicketPercent : Gift}
              index={3}
              title={rewardItem?.label ?? "10% off voucher"}
            >
              {state.rewardCode ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 overflow-hidden rounded-2xl border border-[#FFCF6A]/35 bg-gradient-to-br from-[#FFCF6A]/15 via-black/40 to-[#FF1010]/10 p-3"
                  initial={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-2xl uppercase leading-none text-[#FFCF6A]">10% Off</p>
                      <p className="mt-1.5 truncate font-mono text-xs font-bold tracking-[0.14em] text-white">
                        {state.rewardCode}
                      </p>
                    </div>
                    {!state.rewardRedeemedAt ? (
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <button
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#FFCF6A] px-3 text-[0.58rem] font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#ffe09a]"
                          onClick={() => void handleCopyCode()}
                          type="button"
                        >
                          <Copy size={12} aria-hidden />
                          {copied ? "Copied" : "Copy"}
                        </button>
                        <Link
                          className="text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#FF1010] transition hover:text-[#ff3a3a]"
                          href="/shop"
                        >
                          Shop now →
                        </Link>
                      </div>
                    ) : (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[0.55rem] font-black uppercase tracking-[0.12em] text-emerald-300">
                        Used
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </MilestoneStep>
          </ol>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

function StepConnector({ complete }: { complete: boolean }) {
  return (
    <>
      <li className="flex items-center py-1 sm:hidden" aria-hidden>
        <div className="mx-auto h-6 w-px bg-gradient-to-b from-white/20 to-white/5" />
      </li>
      <li className="hidden items-center px-1 sm:flex" aria-hidden>
        <div
          className={`h-px w-6 lg:w-10 ${
            complete
              ? "bg-gradient-to-r from-emerald-400/70 to-[#FFCF6A]/50"
              : "bg-gradient-to-r from-white/15 to-white/5"
          }`}
        />
      </li>
    </>
  );
}

function MilestoneStep({
  index,
  title,
  detail,
  icon: Icon,
  complete,
  highlight = false,
  children,
}: {
  index: number;
  title: string;
  detail: string;
  icon: typeof Camera;
  complete: boolean;
  highlight?: boolean;
  children?: ReactNode;
}) {
  return (
    <motion.li
      animate={{ opacity: 1, y: 0 }}
      className={`relative list-none rounded-2xl border p-4 transition sm:p-5 ${
        complete
          ? highlight
            ? "border-[#FFCF6A]/35 bg-gradient-to-b from-[#FFCF6A]/12 to-transparent"
            : "border-emerald-400/25 bg-emerald-500/[0.07]"
          : highlight
            ? "border-white/8 bg-white/[0.02] opacity-80"
            : "border-white/10 bg-black/40"
      }`}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <div className="flex items-start gap-3">
        <span
          className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            complete
              ? highlight
                ? "bg-[#FFCF6A] text-black shadow-[0_0_24px_rgba(255,207,106,0.25)]"
                : "bg-emerald-400 text-black"
              : highlight
                ? "border border-white/10 bg-white/5 text-zinc-500"
                : "border border-[#FF1010]/35 bg-[#FF1010]/12 text-[#FF1010]"
          }`}
        >
          <Icon size={18} strokeWidth={complete ? 2.75 : 2} aria-hidden />
          <span className="absolute -left-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-black/40 bg-black px-1 text-[0.55rem] font-black text-zinc-300">
            {index}
          </span>
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tracking-wide text-white sm:text-[0.95rem]">{title}</p>
            {complete ? (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] ${
                  highlight
                    ? "bg-[#FFCF6A]/20 text-[#FFCF6A]"
                    : "bg-emerald-400/15 text-emerald-300"
                }`}
              >
                Done
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-[0.8rem]">{detail}</p>
          {children}
        </div>
      </div>
    </motion.li>
  );
}
