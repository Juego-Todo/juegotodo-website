import { socialLinks } from "@/data/site";
import type { UserProfile } from "@/lib/auth/types";

const ONBOARDING_KEY_PREFIX = "juego-todo.onboarding.";

/** Distinct social platforms required for the welcome reward. */
export const onboardingSocialPlatforms = ["facebook", "instagram", "tiktok", "youtube"] as const;
export type OnboardingSocialPlatform = (typeof onboardingSocialPlatforms)[number];

export type OnboardingState = {
  socialClicks: Partial<Record<OnboardingSocialPlatform, string>>;
  rewardCode: string | null;
  rewardIssuedAt: string | null;
  rewardRedeemedAt: string | null;
  dismissedAt: string | null;
};

export type OnboardingChecklistItem = {
  id: "photo" | "details" | "social" | "reward";
  label: string;
  detail: string;
  complete: boolean;
  href?: string;
};

function storageKey(userId: string) {
  return `${ONBOARDING_KEY_PREFIX}${userId}`;
}

function defaultState(): OnboardingState {
  return {
    socialClicks: {},
    rewardCode: null,
    rewardIssuedAt: null,
    rewardRedeemedAt: null,
    dismissedAt: null,
  };
}

function readState(userId: string): OnboardingState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) {
      return defaultState();
    }
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<OnboardingState>) };
  } catch {
    return defaultState();
  }
}

function writeState(userId: string, state: OnboardingState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export function getOnboardingState(userId: string) {
  return readState(userId);
}

/** One link per required platform (skips duplicate Facebook PH). */
export function getOnboardingSocialLinks() {
  const seen = new Set<OnboardingSocialPlatform>();
  return socialLinks.filter((link) => {
    if (!onboardingSocialPlatforms.includes(link.icon as OnboardingSocialPlatform)) {
      return false;
    }
    const platform = link.icon as OnboardingSocialPlatform;
    if (seen.has(platform)) {
      return false;
    }
    seen.add(platform);
    return true;
  });
}

export function hasCompletedSocialFollows(state: OnboardingState) {
  return onboardingSocialPlatforms.every((platform) => Boolean(state.socialClicks[platform]));
}

function generateRewardCode(userId: string) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const userBit = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "JT";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JT10-${userBit}${stamp}${random}`;
}

export function markOnboardingSocialClick(userId: string, platform: OnboardingSocialPlatform) {
  const state = readState(userId);
  const next: OnboardingState = {
    ...state,
    socialClicks: {
      ...state.socialClicks,
      [platform]: state.socialClicks[platform] ?? new Date().toISOString(),
    },
  };

  if (hasCompletedSocialFollows(next) && !next.rewardCode) {
    next.rewardCode = generateRewardCode(userId);
    next.rewardIssuedAt = new Date().toISOString();
  }

  writeState(userId, next);
  return next;
}

export function dismissOnboarding(userId: string) {
  const state = readState(userId);
  const next = { ...state, dismissedAt: new Date().toISOString() };
  writeState(userId, next);
  return next;
}

export function isProfilePhotoComplete(portraitImage?: string | null) {
  return Boolean(portraitImage?.trim());
}

export function isProfileDetailsComplete(
  user: UserProfile,
  dateOfBirth?: string | null,
  phone?: string | null,
) {
  return Boolean(
    user.fullName.trim() &&
      user.username.trim() &&
      (dateOfBirth?.trim() || user.dateOfBirth?.trim()) &&
      (user.city.trim() || phone?.trim()),
  );
}

export function buildOnboardingChecklist(input: {
  user: UserProfile;
  portraitImage?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  state?: OnboardingState;
}): OnboardingChecklistItem[] {
  const state = input.state ?? getOnboardingState(input.user.id);
  const photoDone = isProfilePhotoComplete(input.portraitImage);
  const detailsDone = isProfileDetailsComplete(input.user, input.dateOfBirth, input.phone);
  const socialDone = hasCompletedSocialFollows(state);
  const rewardReady = Boolean(state.rewardCode);

  return [
    {
      id: "photo",
      label: "Add a profile picture",
      detail: "Tap your avatar to upload a photo",
      complete: photoDone,
    },
    {
      id: "details",
      label: "Complete your details",
      detail: "Add city and confirm DOB in Settings",
      complete: detailsDone,
      href: "/profile?tab=settings",
    },
    {
      id: "social",
      label: "Follow Juego Todo socials",
      detail: "Open each official link below",
      complete: socialDone,
    },
    {
      id: "reward",
      label: "Claim your 10% shop code",
      detail: socialDone
        ? state.rewardRedeemedAt
          ? "Code already used on an order"
          : "One-time code unlocked — copy it for checkout"
        : "Unlocks after all social links",
      complete: rewardReady,
    },
  ];
}

export function shouldShowOnboarding(userId: string, items: OnboardingChecklistItem[]) {
  const state = getOnboardingState(userId);
  if (state.dismissedAt) {
    return false;
  }
  const unfinished = items.some((item) => item.id !== "reward" && !item.complete);
  const unusedReward = Boolean(state.rewardCode && !state.rewardRedeemedAt);
  return unfinished || unusedReward;
}

const WELCOME_CODE_PATTERN = /^JT10-[A-Z0-9]{8,20}$/;

/** Validate a welcome reward code for checkout (one-time, user-bound). */
export function resolveWelcomePromo(code: string, userId?: string | null) {
  const normalized = code.trim().toUpperCase();
  if (!normalized || !WELCOME_CODE_PATTERN.test(normalized)) {
    return null;
  }

  // Browser: bind to the signed-in member and block re-use.
  if (typeof window !== "undefined") {
    if (!userId) {
      return { invalid: true as const, reason: "Sign in to use your welcome code." };
    }
    const state = getOnboardingState(userId);
    if (!state.rewardCode || state.rewardCode.toUpperCase() !== normalized) {
      return { invalid: true as const, reason: "This welcome code is not linked to your account." };
    }
    if (state.rewardRedeemedAt) {
      return { invalid: true as const, reason: "This welcome code has already been used." };
    }
  }

  return {
    invalid: false as const,
    discountPercent: 10,
    label: "Welcome reward — 10% off (one-time)",
    code: normalized,
  };
}

export function redeemWelcomePromo(userId: string, code: string) {
  const state = readState(userId);
  if (!state.rewardCode || state.rewardCode.toUpperCase() !== code.trim().toUpperCase()) {
    return state;
  }
  if (state.rewardRedeemedAt) {
    return state;
  }
  const next = { ...state, rewardRedeemedAt: new Date().toISOString() };
  writeState(userId, next);
  return next;
}
