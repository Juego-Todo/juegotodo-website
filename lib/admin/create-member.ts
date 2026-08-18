import type { SupabaseClient } from "@supabase/supabase-js";
import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { mapProfileRow } from "@/lib/auth/profile-sync";
import { deriveUsernameSeed, normalizeUsername, validateUsername } from "@/lib/auth/username";
import type { AdminCreateMemberInput, UserProfile } from "@/lib/auth/types";
import { migrateAccountType } from "@/lib/auth/types";
import {
  normalizeAssignedTags,
  resolveAccountTypeFromAssignedTags,
} from "@/lib/profile/account-tags";
import type { Database } from "@/lib/supabase/types";

type ServiceClient = SupabaseClient<Database>;

function uniqueUsernameFallback(email: string, fullName: string, userId: string) {
  const seed = deriveUsernameSeed(email, fullName).replace(/[^a-z0-9_]/g, "").slice(0, 11);
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `${seed || "jtmember"}_${suffix}`.slice(0, 20);
}

async function resolveUniqueUsername(
  serviceClient: ServiceClient,
  requested: string,
  email: string,
  fullName: string,
  userId: string,
) {
  let username = requested;
  try {
    username = validateUsername(requested);
  } catch {
    username = uniqueUsernameFallback(email, fullName, userId);
  }

  const { data: taken } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .maybeSingle();

  if (taken) {
    return uniqueUsernameFallback(email, fullName, userId);
  }

  return username;
}

export async function adminCreateOrRepairMember(
  serviceClient: ServiceClient,
  input: AdminCreateMemberInput,
): Promise<{ member: UserProfile; created: boolean }> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const password = input.password;

  if (!email || !firstName || !lastName) {
    throw new Error("First name, last name, and email are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const dateOfBirth = validateDateOfBirth(input.dateOfBirth);
  const fullName = buildFullName({
    firstName,
    middleName: input.middleName,
    lastName,
  });
  const assignedTags = normalizeAssignedTags(input.assignedTags ?? ["staff", "admin"]);
  const accountType =
    input.accountType ??
    (assignedTags.length > 0 ? resolveAccountTypeFromAssignedTags(assignedTags) : "partner");
  const role = input.role === "user" ? "user" : "admin";
  const mustChangePassword = input.mustChangePassword !== false;
  const requestedUsername = normalizeUsername(input.username || deriveUsernameSeed(email, fullName));

  const { data: existingProfile } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existingProfile?.id ?? "";
  let created = !userId;

  if (!userId) {
    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        gender: input.gender?.trim() ?? "",
        date_of_birth: dateOfBirth,
        account_type: migrateAccountType(accountType),
        city: input.city?.trim() ?? "",
        country: input.country?.trim() || "Philippines",
        must_change_password: mustChangePassword,
      },
    });

    if (error || !data.user) {
      const message = error?.message.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        const { data: listed } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const match = listed.users.find((user) => user.email?.toLowerCase() === email);
        if (!match) {
          throw new Error(error?.message ?? "Unable to create account.");
        }
        userId = match.id;
        created = false;
      } else {
        throw new Error(error?.message ?? "Unable to create account.");
      }
    } else {
      userId = data.user.id;
    }
  }

  const username = await resolveUniqueUsername(serviceClient, requestedUsername, email, fullName, userId);

  const { error: updateAuthError } = await serviceClient.auth.admin.updateUserById(userId, {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username,
      gender: input.gender?.trim() ?? "",
      date_of_birth: dateOfBirth,
      account_type: migrateAccountType(accountType),
      city: input.city?.trim() ?? "",
      country: input.country?.trim() || "Philippines",
      must_change_password: mustChangePassword,
    },
  });

  if (updateAuthError) {
    throw new Error(updateAuthError.message);
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        username,
        account_type: migrateAccountType(accountType),
        role,
        gender: input.gender?.trim() ?? "",
        date_of_birth: dateOfBirth,
        city: input.city?.trim() ?? "",
        country: input.country?.trim() || "Philippines",
        assigned_tags: assignedTags,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Unable to save member profile.");
  }

  return {
    member: {
      ...mapProfileRow(profile),
      mustChangePassword,
    },
    created,
  };
}
