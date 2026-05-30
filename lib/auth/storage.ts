import type { ProfileUpdateInput, RegisterInput, StoredUser, UserProfile } from "@/lib/auth/types";

const USERS_KEY = "juego-todo.users";
const SESSION_KEY = "juego-todo.session";

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toProfile(user: StoredUser): UserProfile {
  const { password: _password, ...profile } = user;
  return profile;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStoredSessionUser(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    return null;
  }

  const user = readUsers().find((entry) => entry.id === sessionId);
  return user ? toProfile(user) : null;
}

export function registerStoredUser(input: RegisterInput): UserProfile {
  const email = normalizeEmail(input.email);
  const users = readUsers();

  if (users.some((entry) => entry.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    password: input.password,
    fullName: input.fullName.trim(),
    accountType: input.accountType,
    gym: "",
    city: "",
    bio: "",
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, user]);
  window.localStorage.setItem(SESSION_KEY, user.id);

  return toProfile(user);
}

export function loginStoredUser(email: string, password: string): UserProfile {
  const normalizedEmail = normalizeEmail(email);
  const user = readUsers().find(
    (entry) => entry.email === normalizedEmail && entry.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  window.localStorage.setItem(SESSION_KEY, user.id);
  return toProfile(user);
}

export function logoutStoredUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function updateStoredProfile(userId: string, input: ProfileUpdateInput): UserProfile {
  const users = readUsers();
  const index = users.findIndex((entry) => entry.id === userId);

  if (index === -1) {
    throw new Error("Account not found.");
  }

  const updated: StoredUser = {
    ...users[index],
    fullName: input.fullName.trim(),
    accountType: input.accountType,
    gym: input.gym.trim(),
    city: input.city.trim(),
    bio: input.bio.trim(),
  };

  users[index] = updated;
  writeUsers(users);

  return toProfile(updated);
}
