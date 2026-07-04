import type { UserTypeTagId } from "@/data/user-type-tags";
import { userTypeTags } from "@/data/user-type-tags";

const ASSIGNED_TAGS_PREFIX = "juego-todo.profile.assigned-tags.";

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
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function isAssignableUserTypeTag(tagId: string): tagId is UserTypeTagId {
  return tagId in userTypeTags && tagId !== "regular_member";
}

export function getAdminAssignedTags(userId: string): UserTypeTagId[] {
  const tags = readJson<UserTypeTagId[]>(assignedTagsKey(userId), []);
  return tags.filter(isAssignableUserTypeTag);
}

export function setAdminAssignedTags(userId: string, tags: UserTypeTagId[]) {
  const unique = [...new Set(tags.filter(isAssignableUserTypeTag))];
  writeJson(assignedTagsKey(userId), unique);
}

export function addAdminAssignedTag(userId: string, tagId: UserTypeTagId) {
  if (!isAssignableUserTypeTag(tagId)) {
    return getAdminAssignedTags(userId);
  }

  const next = new Set(getAdminAssignedTags(userId));
  next.add(tagId);
  setAdminAssignedTags(userId, [...next]);
  return [...next];
}

export function removeAdminAssignedTag(userId: string, tagId: UserTypeTagId) {
  setAdminAssignedTags(
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
    removeAdminAssignedTag(userId, tagId);
    return current.filter((entry) => entry !== tagId);
  }

  return addAdminAssignedTag(userId, tagId);
}

export const assignableUserTypeTags = Object.keys(userTypeTags).filter(
  (tagId): tagId is UserTypeTagId => tagId !== "regular_member",
) as UserTypeTagId[];
