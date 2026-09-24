import { socialLinks } from "@/data/site";
import type { UserProfile } from "@/lib/auth/types";

const ONBOARDING_KEY_PREFIX = "juego-todo.onboarding.";

/** Social platforms that unlock the follow milestone (any one click counts). */
export const onboardingSocialPlatforms = ["facebook", "instagram"] as const;
export type OnboardingSocialPlatform = (typeof onboardingSocialPlatforms)[number];

export type OnboardingState = {
  socialClicks: Partial<Record<OnboardingSocialPlatform, string>>;
  rewardCode: string | null;
  rewardIssuedAt: string | null;
  rewardRedeemedAt: string | null;
  dismissedAt: string | null;
};

export type OnboardingChecklistItem = {
  id: "photo" | "social" | "reward";
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

/** Facebook + Instagram only (any click unlocks follow milestone). */
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

/** Complete when the member opens Facebook or Instagram. */
export function hasCompletedSocialFollows(state: OnboardingState) {
  return onboardingSocialPlatforms.some((platform) => Boolean(state.socialClicks[platform]));
}

function generateRewardCode(userId: string) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const userBit = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "JT";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JT10-${userBit}${stamp}${random}`;
}

function maybeIssueReward(userId: string, state: OnboardingState, photoDone: boolean): OnboardingState {
  if (state.rewardCode || !photoDone || !hasCompletedSocialFollows(state)) {
    return state;
  }

  const rewardCode = generateRewardCode(userId);
  const next: OnboardingState = {
    ...state,
    rewardCode,
    rewardIssuedAt: new Date().toISOString(),
  };

  void fetch("/api/member/promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: rewardCode }),
  }).catch(() => undefined);

  try {
    window.localStorage.setItem("juego-todo.checkout.welcome-promo", rewardCode);
  } catch {
    // Ignore storage failures; code is still on the onboarding record.
  }

  return next;
}

export function markOnboardingSocialClick(userId: string, platform: OnboardingSocialPlatform, photoDone = false) {
  const state = readState(userId);
  let next: OnboardingState = {
    ...state,
    socialClicks: {
      ...state.socialClicks,
      [platform]: state.socialClicks[platform] ?? new Date().toISOString(),
    },
  };

  next = maybeIssueReward(userId, next, photoDone);
  writeState(userId, next);
  return next;
}

/** Call when portrait changes so the auto voucher can issue without another social click. */
export function syncOnboardingProgress(userId: string, photoDone: boolean) {
  const state = readState(userId);
  const next = maybeIssueReward(userId, state, photoDone);
  if (next !== state) {
    writeState(userId, next);
  }
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
      id: "social",
      label: "Follow Juego Todo",
      detail: "Open Facebook or Instagram",
      complete: socialDone,
    },
    {
      id: "reward",
      label: "10% off automatic voucher",
      detail: rewardReady
        ? state.rewardRedeemedAt
          ? "Already used on an order"
          : "Auto-applied at checkout — or copy your code"
        : "Unlocks after photo + social",
      complete: rewardReady,
    },
  ];
}

export function shouldShowOnboarding(userId: string, items: OnboardingChecklistItem[]) {
  const state = getOnboardingState(userId);
  if (state.dismissedAt && state.rewardCode) {
    return false;
  }
  const unfinished = items.some((item) => !item.complete);
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
  } else {
    return { invalid: true as const, reason: "Welcome codes must be validated at checkout." };
  }

  return {
    invalid: false as const,
    discountPercent: 10,
    label: "Welcome reward — 10% off (one-time)",
    code: normalized,
  };
}

export function getAutoWelcomePromoCode(userId: string) {
  const state = getOnboardingState(userId);
  if (!state.rewardCode || state.rewardRedeemedAt) {
    return null;
  }
  return state.rewardCode;
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
  try {
    window.localStorage.removeItem("juego-todo.checkout.welcome-promo");
  } catch {
    // ignore
  }
  return next;
}
