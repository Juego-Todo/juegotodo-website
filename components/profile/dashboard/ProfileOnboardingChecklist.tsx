"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Sparkles,
  TicketPercent,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    setState(syncOnboardingProgress(user.id, photoDone));
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
        className="relative overflow-hidden rounded-[1.35rem] border border-[#FF1010]/25 bg-gradient-to-br from-[#1a0808] via-[#0d0d0d] to-black p-4 sm:p-5"
        exit={{ opacity: 0, y: -8 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#FF1010]/15 blur-3xl" aria-hidden />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#FF1010]">
              <Sparkles size={11} aria-hidden />
              First-time rewards
            </p>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {doneCount === items.length
                ? "Checklist complete — your 10% voucher is ready"
                : `${doneCount} of ${items.length} milestones`}
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

        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-[#FF1010] via-[#ff4d4d] to-amber-300"
            initial={false}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>

        <div className="relative mt-4 grid gap-3 lg:grid-cols-3">
          {/* Photo — lives next to where avatar changes happen */}
          <div
            className={`rounded-xl border p-3 ${
              photoItem?.complete
                ? "border-emerald-400/25 bg-emerald-500/10"
                : "border-white/10 bg-black/35"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  photoItem?.complete
                    ? "bg-emerald-400 text-black"
                    : "border border-[#FF1010]/35 bg-[#FF1010]/15 text-[#FF1010]"
                }`}
              >
                {photoItem?.complete ? <Check size={14} strokeWidth={2.75} aria-hidden /> : <Camera size={14} aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{photoItem?.label}</p>
                <p className="text-[0.7rem] text-zinc-400">
                  {photoItem?.complete ? "Done — looking sharp" : "Use the avatar above to upload"}
                </p>
              </div>
            </div>
          </div>

          {/* Social — click Facebook or Instagram */}
          <div
            className={`rounded-xl border p-3 ${
              socialItem?.complete
                ? "border-emerald-400/25 bg-emerald-500/10"
                : "border-white/10 bg-black/35"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  socialItem?.complete
                    ? "bg-emerald-400 text-black"
                    : "border border-amber-400/35 bg-amber-500/15 text-amber-200"
                }`}
              >
                {socialItem?.complete ? <Check size={14} strokeWidth={2.75} aria-hidden /> : <ExternalLink size={14} aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{socialItem?.label}</p>
                <p className="text-[0.7rem] text-zinc-400">
                  {socialDone ? "Done — thanks for following" : "Tap Facebook or Instagram"}
                </p>
              </div>
            </div>
            {!socialDone ? (
              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                {socialLinks.map((link) => {
                  const platform = link.icon as OnboardingSocialPlatform;
                  return (
                    <a
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-2 text-[0.7rem] font-bold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
                      href={link.href}
                      key={link.href}
                      onClick={() => handleSocialClick(platform)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                      <ExternalLink size={11} aria-hidden />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Reward — automatic voucher */}
          <div
            className={`rounded-xl border p-3 ${
              rewardItem?.complete
                ? "border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-black/20 to-[#FF1010]/10"
                : "border-white/10 bg-black/35"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  rewardItem?.complete
                    ? "bg-amber-300 text-black"
                    : "border border-white/10 bg-white/5 text-zinc-500"
                }`}
              >
                {rewardItem?.complete ? <TicketPercent size={14} aria-hidden /> : <Gift size={14} aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{rewardItem?.label}</p>
                <p className="text-[0.7rem] text-zinc-400">{rewardItem?.detail}</p>
              </div>
            </div>

            {state.rewardCode ? (
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-dashed border-amber-300/40 bg-black/40 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="font-display text-lg uppercase leading-none text-white">10% Off</p>
                  <p className="mt-0.5 truncate font-mono text-[0.7rem] font-bold tracking-[0.1em] text-amber-100">
                    {state.rewardCode}
                  </p>
                </div>
                {!state.rewardRedeemedAt ? (
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <button
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white px-2.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-black transition hover:bg-amber-100"
                      onClick={() => void handleCopyCode()}
                      type="button"
                    >
                      <Copy size={11} aria-hidden />
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <Link
                      className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-[#FF1010] hover:text-[#ff3a3a]"
                      href="/shop"
                    >
                      Shop now →
                    </Link>
                  </div>
                ) : (
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-emerald-300">
                    Used
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
