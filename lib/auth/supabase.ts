import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { resolveRoleForEmail } from "@/lib/auth/platform-owners";
import { deriveUsernameSeed, normalizeUsername, validateUsername } from "@/lib/auth/username";
import { mapProfileRow, upsertProfileFromRegisterInputClient } from "@/lib/auth/profile-sync";
import { withTimeout } from "@/lib/auth/timeout";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";
import {
  migrateAccountType,
  type AdminUserUpdateInput,
  type ProfileUpdateInput,
  type RegisterInput,
  type UserProfile,
} from "@/lib/auth/types";

import type { User } from "@supabase/supabase-js";

function mapProfile(row: ProfileRow): UserProfile {
  return mapProfileRow(row);
}

function buildProfileFromAuthUser(user: User, fallbackEmail = ""): UserProfile {
  const email = user.email?.trim().toLowerCase() ?? fallbackEmail;
  const fullName = user.user_metadata?.full_name ?? "";

  return {
    id: user.id,
    email,
    fullName,
    username: user.user_metadata?.username?.trim() || deriveUsernameSeed(email, fullName),
    accountType: migrateAccountType(
      typeof user.user_metadata?.account_type === "string" ? user.user_metadata.account_type : "fan",
    ),
    role: resolveRoleForEmail(email),
    gender: typeof user.user_metadata?.gender === "string" ? user.user_metadata.gender : "",
    dateOfBirth: typeof user.user_metadata?.date_of_birth === "string" ? user.user_metadata.date_of_birth : "",
    gym: "",
    city: typeof user.user_metadata?.city === "string" ? user.user_metadata.city : "",
    bio: "",
    createdAt: user.created_at,
  };
}

async function syncRegistrationProfile(input: RegisterInput) {
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 8000);
  let response: Response;

  try {
    response = await fetch("/api/auth/sync-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(abortTimer);
  }

  if (response.ok) {
    return;
  }

  if (response.status === 503) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 6000, "Session verification timed out.");

    if (!user) {
      throw new Error("Authentication required to save registration profile.");
    }

    await withTimeout(
      upsertProfileFromRegisterInputClient(user.id, user.email ?? input.email, input),
      8000,
      "Profile synchronization timed out.",
    );
    return;
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(payload?.error ?? "Unable to save registration profile.");
}

async function ensureSupabaseProfileRow() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await withTimeout(supabase.auth.getUser(), 8000, "Session check timed out.");

  if (!user) {
    return;
  }

  const { data: profile, error } = await withTimeout(
    Promise.resolve(
      supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle(),
    ),
    8000,
    "Profile check timed out.",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (profile) {
    return;
  }

  try {
    const { upsertProfileFromAuthUser } = await import("@/lib/auth/profile-sync");
    await withTimeout(
      upsertProfileFromAuthUser(user),
      6000,
      "Profile sync timed out.",
    );
    return;
  } catch {
    // Fall back to the server sync route when direct client upsert is unavailable.
  }

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 5000);

  try {
    const syncResponse = await fetch("/api/auth/sync-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (syncResponse.ok) {
      return;
    }
  } catch {
    // Ignore sync route failures during login.
  } finally {
    clearTimeout(abortTimer);
  }
}

export async function getSupabaseSessionUser(): Promise<UserProfile | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await withTimeout(supabase.auth.getUser(), 8000, "Session restore timed out.");

    if (authError || !user) {
      return null;
    }

    const { data: profile, error } = await withTimeout(
      Promise.resolve(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
      ),
      8000,
      "Profile load timed out.",
    );

    if (error) {
      return buildProfileFromAuthUser(user);
    }

    if (!profile) {
      try {
        await ensureSupabaseProfileRow();
      } catch {
        // Profile sync can fail when server-side Supabase is unreachable locally.
      }

      const { data: refreshedProfile, error: refreshError } = await withTimeout(
        Promise.resolve(
          supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle(),
        ),
        8000,
        "Profile refresh timed out.",
      );

      if (refreshError || !refreshedProfile) {
        return buildProfileFromAuthUser(user);
      }

      return mapProfile(refreshedProfile);
    }

    return mapProfile(profile);
  } catch {
    return null;
  }
}

export async function getAllStoredUsersSupabase(): Promise<UserProfile[]> {
  const response = await fetch("/api/admin/members", {
    method: "GET",
    cache: "no-store",
  });

  if (response.ok) {
    const payload = (await response.json()) as { members?: UserProfile[] };
    return payload.members ?? [];
  }

  if (response.status !== 503) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to load member directory.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProfile);
}

export async function registerSupabaseUser(input: RegisterInput): Promise<UserProfile> {
  const supabase = createSupabaseBrowserClient();
  const email = input.email.trim().toLowerCase();
  const username = validateUsername(input.username);
  const fullName = buildFullName(input);
  const dateOfBirth = validateDateOfBirth(input.dateOfBirth);

  const { data, error } = await withTimeout(
    supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: fullName,
          username,
          gender: input.gender.trim(),
          date_of_birth: dateOfBirth,
          account_type: input.accountType,
          city: input.city?.trim() ?? "",
          phone: input.phone?.trim() ?? "",
          country: input.country?.trim() ?? "Philippines",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/profile")}`,
      },
    }),
    15000,
    "Account creation timed out. Check your connection and try again.",
  );

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("database error saving new user")) {
      throw new Error(
        "Account setup failed in the database. Ask an admin to run the latest Supabase migrations, then try again.",
      );
    }
    if (message.includes("already registered") || message.includes("already exists")) {
      throw new Error("An account with this email already exists. Sign in or reset your password.");
    }
    if (message.includes("fetch")) {
      throw new Error("Unable to reach the authentication service. Check your connection and try again.");
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Unable to create account.");
  }

  if (data.session) {
    // Registration succeeded. Profile synchronization must never hold the UI
    // hostage; the database trigger and this background repair cover it.
    void syncRegistrationProfile(input).catch(() => undefined);
    return buildProfileFromAuthUser(data.user, email);
  }

  throw new Error("Account created. Check your email to confirm your account before logging in.");
}

export async function loginSupabaseUser(email: string, password: string): Promise<UserProfile> {
  const supabase = createSupabaseBrowserClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    }),
    12000,
    "Sign in timed out. Check your connection and try again.",
  );

  if (error) {
    if (error.message.toLowerCase().includes("fetch")) {
      throw new Error("Unable to reach the authentication service. Check your connection and try again.");
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Unable to load profile.");
  }

  const profile = buildProfileFromAuthUser(data.user, normalizedEmail);

  // Sync the profile in the background so login never stalls on database setup.
  void ensureSupabaseProfileRow().catch(() => undefined);

  return profile;
}

export async function logoutSupabaseUser() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSupabaseProfile(userId: string, input: ProfileUpdateInput): Promise<UserProfile> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim(),
      account_type: input.accountType,
      gym: input.gym.trim(),
      city: input.city.trim(),
      bio: input.bio.trim(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

export async function adminUpdateSupabaseUser(userId: string, input: AdminUserUpdateInput): Promise<UserProfile> {
  const response = await fetch(`/api/admin/members/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as { member?: UserProfile; error?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to update member profile.");
  }

  if (!payload?.member) {
    throw new Error("Unable to update member profile.");
  }

  return payload.member;
}

export async function adminResetSupabaseUserPassword(userId: string, password: string) {
  const response = await fetch(`/api/admin/members/${encodeURIComponent(userId)}/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to reset password.");
  }
}

export async function adminDeleteSupabaseUser(userId: string) {
  const response = await fetch(`/api/admin/members/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to delete member account.");
  }
}

export async function requestSupabasePasswordReset(email: string) {
  const supabase = createSupabaseBrowserClient();
  const normalizedEmail = email.trim().toLowerCase();
  const nextPath = encodeURIComponent("/login?mode=reset");
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/auth/callback?next=${nextPath}`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSupabasePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(error.message);
  }
}

export async function checkUsernameAvailabilitySupabase(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  const supabase = createSupabaseBrowserClient();

  try {
    const { data, error } = await withTimeout(
      Promise.resolve(
        supabase.rpc("is_username_available", {
          check_username: normalized,
        }),
      ),
      6000,
      "Username check timed out.",
    );

    if (!error) {
      return Boolean(data);
    }
  } catch {
    // Fall back to the server route, which can use the service role.
  }

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 6000);
  let response: Response;

  try {
    response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(normalized)}`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(abortTimer);
  }

  const payload = (await response.json().catch(() => null)) as {
    available?: boolean;
    message?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? "Unable to check username.");
  }

  return Boolean(payload?.available);
}

export function subscribeSupabaseAuth(onChange: (user: UserProfile | null) => void) {
  try {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        onChange(null);
        return;
      }

      // Publish the authenticated identity immediately. Fetching the profile is
      // an enhancement and must not make a successful login appear to fail.
      onChange(buildProfileFromAuthUser(user));

      void withTimeout(getSupabaseSessionUser(), 8000, "Profile refresh timed out.")
        .then((profile) => {
          if (profile) {
            onChange(profile);
          }
        })
        .catch(() => undefined);
    });

    return () => subscription.unsubscribe();
  } catch {
    return () => undefined;
  }
}
