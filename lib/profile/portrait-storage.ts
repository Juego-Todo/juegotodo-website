const PORTRAIT_KEY_PREFIX = "juego-todo.profile.portrait.";

export function getProfilePortrait(userId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(`${PORTRAIT_KEY_PREFIX}${userId}`);
}

export function saveProfilePortrait(userId: string, dataUrl: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${PORTRAIT_KEY_PREFIX}${userId}`;
  if (dataUrl) {
    window.localStorage.setItem(key, dataUrl);
  } else {
    window.localStorage.removeItem(key);
  }
}

export function resolveProfilePortrait(
  userId: string,
  options?: {
    licensePhoto?: string | null;
    demoPortrait?: string | null;
  },
): string | undefined {
  const saved = getProfilePortrait(userId);
  if (saved?.trim()) {
    return saved;
  }

  if (options?.licensePhoto?.trim()) {
    return options.licensePhoto;
  }

  if (options?.demoPortrait?.trim()) {
    return options.demoPortrait;
  }

  return undefined;
}
