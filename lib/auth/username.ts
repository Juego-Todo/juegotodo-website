import { getUsernameProfanityError } from "@/lib/auth/username-profanity";

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function validateUsername(value: string) {
  const username = normalizeUsername(value);

  if (username.length < 6 || username.length > 20) {
    throw new Error("Username must be 6–20 characters.");
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new Error("Username can only use letters, numbers, and underscores.");
  }

  const profanityError = getUsernameProfanityError(username);
  if (profanityError) {
    throw new Error(profanityError);
  }

  return username;
}

export function getUsernameValidationError(value: string) {
  try {
    validateUsername(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid username.";
  }
}

export function deriveUsernameSeed(email: string, fullName?: string) {
  const fromEmail = email.split("@")[0]?.replace(/[^a-z0-9_]/gi, "").toLowerCase() ?? "";
  if (fromEmail.length >= 3) {
    return fromEmail.slice(0, 20);
  }

  const fromName = (fullName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);

  return fromName.length >= 3 ? fromName : "jt_member";
}

export function formatUsername(value: string) {
  const username = normalizeUsername(value);
  return username ? `@${username}` : "@member";
}
