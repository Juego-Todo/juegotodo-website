import type { ProfileUpdateInput, RegisterInput, StoredUser, UserProfile, UserRole } from "@/lib/auth/types";
import { migrateAccountType } from "@/lib/auth/types";
import { testLoginAccount, testLoginStoredUser } from "@/data/test-account";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getSupabaseSessionUser,
  loginSupabaseUser,
  logoutSupabaseUser,
  registerSupabaseUser,
  requestSupabasePasswordReset,
  subscribeSupabaseAuth,
  updateSupabasePassword,
  updateSupabaseProfile,
} from "@/lib/auth/supabase";

const USERS_KEY = "juego-todo.users";
const SESSION_KEY = "juego-todo.session";
const REMEMBER_EMAIL_KEY = "juego-todo.remember-email";
const RESET_EMAIL_KEY = "juego-todo.reset-email";

function resolveRole(email: string): UserRole {
  return email.toLowerCase() === "admin@juegotodo.com" ? "admin" : "user";
}

function ensureLocalTestAccount(users: StoredUser[]) {
  const hasTestAccount = users.some((entry) => entry.email === testLoginAccount.email);
  if (hasTestAccount) {
    return users.map((entry) =>
      entry.email === testLoginAccount.email
        ? {
            ...entry,
            password: testLoginAccount.password,
            fullName: testLoginAccount.fullName,
            accountType: migrateAccountType(entry.accountType),
            role: entry.role ?? "user",
          }
        : entry,
    );
  }

  return [...users, testLoginStoredUser];
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    const users = Array.isArray(parsed)
      ? parsed.map((user) => ({
          ...user,
          accountType: migrateAccountType(user.accountType),
          role: user.role ?? resolveRole(user.email),
        }))
      : [];

    const seededUsers = ensureLocalTestAccount(users);
    if (seededUsers.length !== users.length || JSON.stringify(seededUsers) !== JSON.stringify(users)) {
      writeUsers(seededUsers);
    }

    return seededUsers;
  } catch {
    const seededUsers = ensureLocalTestAccount([]);
    writeUsers(seededUsers);
    return seededUsers;
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

function getStoredSessionUserLocal(): UserProfile | null {
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

function registerStoredUserLocal(input: RegisterInput): UserProfile {
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
    role: resolveRole(email),
    gym: "",
    city: "",
    bio: "",
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, user]);
  window.localStorage.setItem(SESSION_KEY, user.id);

  return toProfile(user);
}

function loginStoredUserLocal(email: string, password: string): UserProfile {
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

function logoutStoredUserLocal() {
  window.localStorage.removeItem(SESSION_KEY);
}

function updateStoredProfileLocal(userId: string, input: ProfileUpdateInput): UserProfile {
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

function updateStoredPasswordLocal(email: string, password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const index = users.findIndex((entry) => entry.email === normalizedEmail);

  if (index === -1) {
    throw new Error("Unable to reset password for this account.");
  }

  users[index] = {
    ...users[index],
    password,
  };
  writeUsers(users);
  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
}

function requestPasswordResetLocal(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const accountExists = readUsers().some((entry) => entry.email === normalizedEmail);

  if (accountExists) {
    window.sessionStorage.setItem(RESET_EMAIL_KEY, normalizedEmail);
  }

  return accountExists;
}

export function getPendingPasswordResetEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(RESET_EMAIL_KEY) ?? "";
}

export function clearPendingPasswordResetEmail() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
}

export async function requestPasswordReset(email: string) {
  if (isSupabaseConfigured()) {
    await requestSupabasePasswordReset(email);
    return { delivery: "email" as const };
  }

  requestPasswordResetLocal(email);
  return { delivery: "demo" as const };
}

export async function updateStoredPassword(email: string, password: string) {
  if (isSupabaseConfigured()) {
    await updateSupabasePassword(password);
    return;
  }

  updateStoredPasswordLocal(email, password);
}

export function usesSupabaseBackend() {
  return isSupabaseConfigured();
}

export async function getStoredSessionUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    return getSupabaseSessionUser();
  }
  return getStoredSessionUserLocal();
}

export async function registerStoredUser(input: RegisterInput): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return registerSupabaseUser(input);
  }
  return registerStoredUserLocal(input);
}

export async function loginStoredUser(email: string, password: string): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return loginSupabaseUser(email, password);
  }
  return loginStoredUserLocal(email, password);
}

export async function logoutStoredUser() {
  if (isSupabaseConfigured()) {
    await logoutSupabaseUser();
    return;
  }
  logoutStoredUserLocal();
}

export async function updateStoredProfile(userId: string, input: ProfileUpdateInput): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return updateSupabaseProfile(userId, input);
  }
  return updateStoredProfileLocal(userId, input);
}

export function subscribeAuthChanges(onChange: (user: UserProfile | null) => void) {
  if (!isSupabaseConfigured()) {
    return () => undefined;
  }
  return subscribeSupabaseAuth(onChange);
}

export function getRememberedEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

export function setRememberedEmail(email: string) {
  window.localStorage.setItem(REMEMBER_EMAIL_KEY, normalizeEmail(email));
}

export function clearRememberedEmail() {
  window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
}

export { migrateAccountType } from "@/lib/auth/types";
