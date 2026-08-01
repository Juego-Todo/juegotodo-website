import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";
import { adminFetch } from "@/lib/auth/admin-fetch";
import type { AccountType } from "@/lib/auth/types";

const ASSIGNED_TAGS_PREFIX = "juego-todo.profile.assigned-tags.";

/** Highest-priority assigned tag wins when mapping to account_type. */
const TAG_ACCOUNT_TYPE_PRIORITY: UserTypeTagId[] = [
  "fighter",
  "coach",
  "grandmaster",
  "gym_owner",
  "media",
  "referee",
  "judge",
  "adviser",
  "staff",
  "grand_council_member",
];

const TAG_TO_ACCOUNT_TYPE: Partial<Record<UserTypeTagId, AccountType>> = {
  fighter: "athlete",
  coach: "coach",
  grandmaster: "coach",
  gym_owner: "gym_owner",
  media: "partner",
  referee: "coach",
  judge: "coach",
  adviser: "coach",
  staff: "coach",
  grand_council_member: "coach",
};

function assignedTagsKey(userId: string) {
  return `${ASSIGNED_TAGS_PREFIX}${userId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function isAssignableUserTypeTag(tagId: string): tagId is UserTypeTagId {
  return tagId in userTypeTags && tagId !== "regular_member";
}

export function normalizeAssignedTags(tags: unknown): UserTypeTagId[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  return [...new Set(tags.filter(isAssignableUserTypeTag))];
}

/** Map admin-assigned tags to the profiles.account_type enum used across the app. */
export function resolveAccountTypeFromAssignedTags(tags: UserTypeTagId[]): AccountType {
  const normalized = normalizeAssignedTags(tags);
  for (const tagId of TAG_ACCOUNT_TYPE_PRIORITY) {
    if (!normalized.includes(tagId)) {
      continue;
    }
    const accountType = TAG_TO_ACCOUNT_TYPE[tagId];
    if (accountType) {
      return accountType;
    }
  }
  return "fan";
}

/** Prefer server tags from the profile; fall back to local cache for offline/local auth. */
export function getAdminAssignedTags(userId: string, serverTags?: UserTypeTagId[] | null): UserTypeTagId[] {
  if (serverTags && serverTags.length > 0) {
    return normalizeAssignedTags(serverTags);
  }
  if (serverTags && serverTags.length === 0) {
    // Explicit empty server list wins over stale localStorage.
    return [];
  }
  return normalizeAssignedTags(readJson<UserTypeTagId[]>(assignedTagsKey(userId), []));
}

export function setAdminAssignedTagsLocal(userId: string, tags: UserTypeTagId[]) {
  const unique = normalizeAssignedTags(tags);
  writeJson(assignedTagsKey(userId), unique);
  return unique;
}

/** @deprecated Prefer setAdminAssignedTagsLocal or the admin tags API. */
export function setAdminAssignedTags(userId: string, tags: UserTypeTagId[]) {
  return setAdminAssignedTagsLocal(userId, tags);
}

export function addAdminAssignedTag(userId: string, tagId: UserTypeTagId) {
  if (!isAssignableUserTypeTag(tagId)) {
    return getAdminAssignedTags(userId);
  }

  const next = new Set(getAdminAssignedTags(userId));
  next.add(tagId);
  return setAdminAssignedTagsLocal(userId, [...next]);
}

export function removeAdminAssignedTag(userId: string, tagId: UserTypeTagId) {
  return setAdminAssignedTagsLocal(
    userId,
    getAdminAssignedTags(userId).filter((entry) => entry !== tagId),
  );
}

export function clearAdminAssignedTags(userId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(assignedTagsKey(userId));
}

export function toggleAdminAssignedTag(userId: string, tagId: UserTypeTagId) {
  const current = getAdminAssignedTags(userId);
  if (current.includes(tagId)) {
    return removeAdminAssignedTag(userId, tagId);
  }
  return addAdminAssignedTag(userId, tagId);
}

export async function saveAdminAssignedTags(userId: string, tags: UserTypeTagId[]) {
  const unique = normalizeAssignedTags(tags);
  setAdminAssignedTagsLocal(userId, unique);

  const response = await adminFetch(`/api/admin/members/${userId}/tags`, {
    method: "PUT",
    body: JSON.stringify({ tags: unique }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to save account tags.");
  }

  const payload = (await response.json()) as { tags?: UserTypeTagId[] };
  const saved = normalizeAssignedTags(payload.tags ?? unique);
  setAdminAssignedTagsLocal(userId, saved);
  return saved;
}

export async function toggleAdminAssignedTagRemote(
  userId: string,
  tagId: UserTypeTagId,
  currentTags: UserTypeTagId[],
) {
  const next = currentTags.includes(tagId)
    ? currentTags.filter((entry) => entry !== tagId)
    : [...currentTags, tagId];
  return saveAdminAssignedTags(userId, next);
}

export const assignableUserTypeTags = Object.keys(userTypeTags).filter(
  (tagId): tagId is UserTypeTagId => tagId !== "regular_member",
) as UserTypeTagId[];
