import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { resolveRoleForEmail } from "@/lib/auth/platform-owners";
import { deriveUsernameSeed, normalizeUsername, validateUsername } from "@/lib/auth/username";
import type { RegisterInput, UserProfile } from "@/lib/auth/types";
import { migrateAccountType } from "@/lib/auth/types";
import type { ProfileRow } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    username: row.username?.trim() || deriveUsernameSeed(row.email, row.full_name),
    accountType: migrateAccountType(row.account_type),
    role: row.role === "admin" ? "admin" : "user",
    gender: row.gender ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    gym: row.gym,
    city: row.city,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

export function buildProfileUpsertFromRegisterInput(userId: string, email: string, input: RegisterInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const username = validateUsername(input.username);
  const fullName = buildFullName(input);
  const dateOfBirth = validateDateOfBirth(input.dateOfBirth);

  return {
    id: userId,
    email: normalizedEmail,
    full_name: fullName,
    username,
    account_type: input.accountType,
    role: resolveRoleForEmail(normalizedEmail),
    gender: input.gender.trim(),
    date_of_birth: dateOfBirth,
    city: input.city?.trim() ?? "",
    bio: input.bio?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    country: input.country?.trim() || "Philippines",
  };
}

export function buildProfileUpsertFromAuthUser(user: User) {
  const metadata = user.user_metadata ?? {};
  const email = user.email?.trim().toLowerCase() ?? "";
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const usernameRaw = typeof metadata.username === "string" ? metadata.username.trim() : "";
  let username = deriveUsernameSeed(email, fullName);

  if (usernameRaw) {
    try {
      username = validateUsername(usernameRaw);
    } catch {
      username = normalizeUsername(usernameRaw) || username;
    }
  }

  return {
    id: user.id,
    email,
    full_name: fullName,
    username,
    account_type: typeof metadata.account_type === "string" ? metadata.account_type : "fan",
    role: resolveRoleForEmail(email),
    gender: typeof metadata.gender === "string" ? metadata.gender : "",
    date_of_birth: typeof metadata.date_of_birth === "string" ? metadata.date_of_birth : "",
    city: typeof metadata.city === "string" ? metadata.city : "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    country: typeof metadata.country === "string" && metadata.country.trim() ? metadata.country : "Philippines",
  };
}

export async function upsertProfileFromAuthUser(user: User) {
  const { createSupabaseServiceClient } = await import("@/lib/supabase/service");
  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    return;
  }

  const payload = buildProfileUpsertFromAuthUser(user);
  await serviceClient.from("profiles").upsert(payload, { onConflict: "id" });
}
