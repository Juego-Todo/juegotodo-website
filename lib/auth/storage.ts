import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import type {
  AdminUserUpdateInput,
  ProfileUpdateInput,
  RegisterInput,
  StoredUser,
  UserProfile,
  UserRole,
} from "@/lib/auth/types";
import { migrateAccountType } from "@/lib/auth/types";
import { deriveUsernameSeed, normalizeUsername, validateUsername } from "@/lib/auth/username";
import { legacyTestLoginEmails, testLoginAccount, testLoginStoredUser } from "@/data/test-account";
import { initializeNewUserCommerceData } from "@/lib/commerce/storage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { withTimeout } from "@/lib/auth/timeout";
import { resolveRoleForEmail } from "@/lib/auth/platform-owners";
import {
  adminDeleteSupabaseUser,
  adminResetSupabaseUserPassword,
  adminUpdateSupabaseUser,
  checkUsernameAvailabilitySupabase,
  getAllStoredUsersSupabase,
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
const LEGACY_REMEMBER_PASSWORD_KEY = "juego-todo.remember-password";
const RESET_EMAIL_KEY = "juego-todo.reset-email";

function resolveRole(email: string): UserRole {
  return resolveRoleForEmail(email);
}

function isLocalAuthEnabled() {
  return process.env.NODE_ENV !== "production";
}

function assertAuthBackendAvailable() {
  if (!isSupabaseConfigured() && !isLocalAuthEnabled()) {
    throw new Error("Authentication is not configured. Please contact the site administrator.");
  }
}

function ensureLocalTestAccount(users: StoredUser[]) {
  const legacyEmails = new Set<string>(legacyTestLoginEmails);
  const filteredUsers = users.filter((entry) => !legacyEmails.has(entry.email));

  if (!isLocalAuthEnabled()) {
    return filteredUsers;
  }

  const existingIndex = filteredUsers.findIndex((entry) => entry.email === testLoginAccount.email);

  if (existingIndex >= 0) {
    filteredUsers[existingIndex] = {
      ...filteredUsers[existingIndex],
      password: testLoginAccount.password,
      fullName: testLoginAccount.fullName,
      username: filteredUsers[existingIndex].username || "testuser",
      accountType: migrateAccountType(filteredUsers[existingIndex].accountType),
      role: "admin",
    };
    return filteredUsers;
  }

  return [...filteredUsers, testLoginStoredUser];
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
          username: user.username?.trim() || deriveUsernameSeed(user.email, user.fullName),
          accountType: migrateAccountType(user.accountType),
          role: user.role ?? resolveRole(user.email),
          gender: user.gender ?? "",
          dateOfBirth: user.dateOfBirth ?? "",
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
  const username = validateUsername(input.username);
  const users = readUsers();

  if (users.some((entry) => entry.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  if (users.some((entry) => entry.username === username)) {
    throw new Error("That username is already taken.");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (!input.firstName.trim()) {
    throw new Error("First name is required.");
  }

  if (!input.lastName.trim()) {
    throw new Error("Last name is required.");
  }

  if (!input.gender.trim()) {
    throw new Error("Please select a gender.");
  }

  const dateOfBirth = validateDateOfBirth(input.dateOfBirth);

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    password: input.password,
    fullName: buildFullName(input),
    username,
    accountType: input.accountType,
    role: resolveRole(email),
    gender: input.gender.trim(),
    dateOfBirth,
    gym: "",
    city: input.city?.trim() ?? "",
    bio: input.bio?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, user]);
  initializeNewUserCommerceData(user.id, {
    phone: input.phone,
    country: input.country,
  });
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

function adminUpdateStoredUserLocal(userId: string, input: AdminUserUpdateInput): UserProfile {
  const users = readUsers();
  const index = users.findIndex((entry) => entry.id === userId);

  if (index === -1) {
    throw new Error("Account not found.");
  }

  const email = normalizeEmail(input.email);
  const username = validateUsername(input.username);

  if (users.some((entry, entryIndex) => entryIndex !== index && entry.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  if (users.some((entry, entryIndex) => entryIndex !== index && entry.username === username)) {
    throw new Error("That username is already taken.");
  }

  users[index] = {
    ...users[index],
    fullName: input.fullName.trim(),
    username,
    email,
    accountType: input.accountType,
    role: input.role,
    gym: input.gym.trim(),
    city: input.city.trim(),
    bio: input.bio.trim(),
  };

  writeUsers(users);
  return toProfile(users[index]);
}

function adminResetStoredUserPasswordLocal(userId: string, password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const users = readUsers();
  const index = users.findIndex((entry) => entry.id === userId);

  if (index === -1) {
    throw new Error("Account not found.");
  }

  users[index] = {
    ...users[index],
    password,
  };
  writeUsers(users);
}

function adminDeleteStoredUserLocal(userId: string) {
  const users = readUsers();
  const nextUsers = users.filter((entry) => entry.id !== userId);

  if (nextUsers.length === users.length) {
    throw new Error("Account not found.");
  }

  writeUsers(nextUsers);

  if (window.localStorage.getItem(SESSION_KEY) === userId) {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function getAllStoredUsersLocal(): UserProfile[] {
  return readUsers().map(toProfile);
}

export async function getAllStoredUsers(): Promise<UserProfile[]> {
  if (isSupabaseConfigured()) {
    return (await getAllStoredUsersSupabase()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  assertAuthBackendAvailable();
  return getAllStoredUsersLocal();
}

export async function adminUpdateStoredUser(userId: string, input: AdminUserUpdateInput): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return adminUpdateSupabaseUser(userId, input);
  }
  assertAuthBackendAvailable();
  return adminUpdateStoredUserLocal(userId, input);
}

export async function adminResetStoredUserPassword(userId: string, password: string) {
  if (isSupabaseConfigured()) {
    await adminResetSupabaseUserPassword(userId, password);
    return;
  }
  assertAuthBackendAvailable();
  adminResetStoredUserPasswordLocal(userId, password);
}

export async function adminDeleteStoredUser(userId: string) {
  if (isSupabaseConfigured()) {
    await adminDeleteSupabaseUser(userId);
    return;
  }
  assertAuthBackendAvailable();
  adminDeleteStoredUserLocal(userId);
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
    await withTimeout(
      requestSupabasePasswordReset(email),
      12000,
      "Password reset request timed out. Check your connection and try again.",
    );
    return { delivery: "email" as const };
  }

  assertAuthBackendAvailable();
  requestPasswordResetLocal(email);
  return { delivery: "demo" as const };
}

export async function updateStoredPassword(email: string, password: string) {
  if (isSupabaseConfigured()) {
    await withTimeout(
      updateSupabasePassword(password),
      12000,
      "Password update timed out. Check your connection and try again.",
    );
    return;
  }

  assertAuthBackendAvailable();
  updateStoredPasswordLocal(email, password);
}

export function usesSupabaseBackend() {
  return isSupabaseConfigured();
}

export function isUsernameAvailableLocal(username: string) {
  const normalized = normalizeUsername(username);
  return !readUsers().some((entry) => entry.username === normalized);
}

export async function checkUsernameAvailability(username: string) {
  const validationError = (() => {
    try {
      validateUsername(username);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid username.";
    }
  })();

  if (validationError) {
    return {
      available: false,
      username: normalizeUsername(username),
      message: validationError,
    };
  }

  const normalized = validateUsername(username);

  if (isSupabaseConfigured()) {
    const available = await withTimeout(
      checkUsernameAvailabilitySupabase(normalized),
      15000,
      "Username check timed out. Check your connection and try again.",
    );
    return {
      available,
      username: normalized,
      message: available ? "Username is available." : "That username is already taken.",
    };
  }

  assertAuthBackendAvailable();
  const available = isUsernameAvailableLocal(normalized);
  return {
    available,
    username: normalized,
    message: available ? "Username is available." : "That username is already taken.",
  };
}

export async function getStoredSessionUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const profile = await withTimeout(
        getSupabaseSessionUser(),
        8000,
        "Session restore timed out.",
      );

      if (profile) {
        return profile;
      }
    } catch {
      // Fall through to local auth in development when Supabase is unreachable.
    }

    if (isLocalAuthEnabled()) {
      return getStoredSessionUserLocal();
    }

    return null;
  }

  if (!isLocalAuthEnabled()) {
    return null;
  }
  return getStoredSessionUserLocal();
}

export async function registerStoredUser(input: RegisterInput): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return withTimeout(
      registerSupabaseUser(input),
      20000,
      "Account creation timed out. Check your connection and try again.",
    );
  }
  assertAuthBackendAvailable();
  return registerStoredUserLocal(input);
}

export async function loginStoredUser(email: string, password: string): Promise<UserProfile> {
  if (!isSupabaseConfigured()) {
    assertAuthBackendAvailable();
    return loginStoredUserLocal(email, password);
  }

  return withTimeout(
    loginSupabaseUser(email, password),
    15000,
    "Sign in timed out. Check your connection and try again.",
  );
}

export async function logoutStoredUser() {
  if (isSupabaseConfigured()) {
    await withTimeout(logoutSupabaseUser(), 8000, "Sign out timed out. Please try again.");
    return;
  }

  assertAuthBackendAvailable();
  logoutStoredUserLocal();
}

export async function updateStoredProfile(userId: string, input: ProfileUpdateInput): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return withTimeout(
      updateSupabaseProfile(userId, input),
      12000,
      "Profile update timed out. Check your connection and try again.",
    );
  }
  assertAuthBackendAvailable();
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

  return window.localStorage.getItem(REMEMBER_EMAIL_KEY)?.trim() ?? "";
}

export function migrateLegacyRememberedCredentials() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LEGACY_REMEMBER_PASSWORD_KEY);
  }
}

export function setRememberedEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REMEMBER_EMAIL_KEY, normalizeEmail(email));
}

export function clearRememberedEmail() {
  clearRememberedCredentials();
}

export function clearRememberedCredentials() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  window.localStorage.removeItem(LEGACY_REMEMBER_PASSWORD_KEY);
}

export { migrateAccountType } from "@/lib/auth/types";
