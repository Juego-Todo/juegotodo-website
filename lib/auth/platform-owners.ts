import type { UserRole } from "@/lib/auth/types";

/** Emails with automatic Owner Access — highest platform admin tier. */
const PLATFORM_OWNER_EMAILS = new Set([
  "admin@juegotodo.com",
  "kiran.aames@gmail.com",
]);

export function isPlatformOwnerEmail(email: string): boolean {
  return PLATFORM_OWNER_EMAILS.has(email.trim().toLowerCase());
}

export function resolveRoleForEmail(email: string): UserRole {
  return isPlatformOwnerEmail(email) ? "admin" : "user";
}
