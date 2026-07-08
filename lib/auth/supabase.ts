import { buildFullName, validateDateOfBirth } from "@/lib/auth/name";
import { resolveRoleForEmail } from "@/lib/auth/platform-owners";
import { deriveUsernameSeed, normalizeUsername, validateUsername } from "@/lib/auth/username";
import { mapProfileRow, upsertProfileFromRegisterInputClient } from "@/lib/auth/profile-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";
import {
  migrateAccountType,
  type AdminUserUpdateInput,
  type ProfileUpdateInput,
  type RegisterInput,
  type UserProfile,
} from "@/lib/auth/types";

function mapProfile(row: ProfileRow): UserProfile {
  return mapProfileRow(row);
}

async function syncRegistrationProfile(input: RegisterInput) {
  const response = await fetch("/api/auth/sync-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (response.ok) {
    return;
  }

  if (response.status === 503) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to save registration profile.");
    }

    await upsertProfileFromRegisterInputClient(user.id, user.email ?? input.email, input);
    return;
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(payload?.error ?? "Unable to save registration profile.");
}

async function ensureSupabaseProfileRow() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (profile) {
    return;
  }

  const syncResponse = await fetch("/api/auth/sync-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (syncResponse.ok) {
    return;
  }

  const { upsertProfileFromAuthUser } = await import("@/lib/auth/profile-sync");
  await upsertProfileFromAuthUser(user);
}

export async function getSupabaseSessionUser(): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    await ensureSupabaseProfileRow();

    const { data: refreshedProfile, error: refreshError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (refreshError) {
      throw new Error(refreshError.message);
    }

    if (refreshedProfile) {
      return mapProfile(refreshedProfile);
    }

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? "",
      username:
        user.user_metadata?.username?.trim() ||
        deriveUsernameSeed(user.email ?? "", user.user_metadata?.full_name ?? ""),
      accountType: "fan",
      role: user.email?.toLowerCase() === "admin@juegotodo.com" ? "admin" : "user",
      gender: "",
      dateOfBirth: "",
      gym: "",
      city: "",
      bio: "",
      createdAt: user.created_at,
    };
  }

  return mapProfile(profile);
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

  const { data, error } = await supabase.auth.signUp({
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
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Unable to create account.");
  }

  if (data.session) {
    await syncRegistrationProfile(input);
    const profile = await getSupabaseSessionUser();
    if (profile) {
      return profile;
    }
  }

  return {
    id: data.user.id,
    email,
    fullName,
    username,
    accountType: input.accountType,
    role: resolveRoleForEmail(email),
    gender: input.gender.trim(),
    dateOfBirth,
    gym: "",
    city: input.city?.trim() ?? "",
    bio: input.bio?.trim() ?? "",
    createdAt: data.user.created_at,
  };
}

export async function loginSupabaseUser(email: string, password: string): Promise<UserProfile> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const profile = await getSupabaseSessionUser();
  if (!profile) {
    throw new Error("Unable to load profile.");
  }

  return profile;
}

export async function logoutSupabaseUser() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
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
  const supabase = createSupabaseBrowserClient();
  const email = input.email.trim().toLowerCase();
  const username = validateUsername(input.username);
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim(),
      username,
      email,
      account_type: input.accountType,
      role: input.role,
      gym: input.gym.trim(),
      city: input.city.trim(),
      bio: input.bio.trim(),
      phone: input.phone?.trim() ?? "",
      country: input.country?.trim() || "Philippines",
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
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
  const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(normalized)}`);

  const payload = (await response.json()) as {
    available?: boolean;
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? payload.message ?? "Unable to check username.");
  }

  return Boolean(payload.available);
}

export function subscribeSupabaseAuth(onChange: (user: UserProfile | null) => void) {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async () => {
    const profile = await getSupabaseSessionUser();
    onChange(profile);
  });

  return () => subscription.unsubscribe();
}
