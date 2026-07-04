const DOB_KEY_PREFIX = "juego-todo.profile.dob.";

export function getProfileDateOfBirth(userId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(`${DOB_KEY_PREFIX}${userId}`);
}

export function saveProfileDateOfBirth(userId: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${DOB_KEY_PREFIX}${userId}`;
  if (value?.trim()) {
    window.localStorage.setItem(key, value.trim());
  } else {
    window.localStorage.removeItem(key);
  }
}

export function resolveProfileDateOfBirth(userId: string, licenseDateOfBirth?: string | null) {
  const saved = getProfileDateOfBirth(userId);
  if (saved?.trim()) {
    return saved;
  }

  return licenseDateOfBirth?.trim() || "";
}
