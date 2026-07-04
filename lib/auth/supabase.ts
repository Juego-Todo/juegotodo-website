import { deriveUsernameSeed, validateUsername } from "@/lib/auth/username";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";
import { migrateAccountType, type ProfileUpdateInput, type RegisterInput, type UserProfile } from "@/lib/auth/types";

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    username: row.username?.trim() || deriveUsernameSeed(row.email, row.full_name),
    accountType: migrateAccountType(row.account_type),
    role: row.role === "admin" ? "admin" : "user",
    gym: row.gym,
    city: row.city,
    bio: row.bio,
    createdAt: row.created_at,
  };
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
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? "",
      username:
        user.user_metadata?.username?.trim() ||
        deriveUsernameSeed(user.email ?? "", user.user_metadata?.full_name ?? ""),
      accountType: "fan",
      role: user.email?.toLowerCase() === "admin@juegotodo.com" ? "admin" : "user",
      gym: "",
      city: "",
      bio: "",
      createdAt: user.created_at,
    };
  }

  return mapProfile(profile);
}

export async function registerSupabaseUser(input: RegisterInput): Promise<UserProfile> {
  const supabase = createSupabaseBrowserClient();
  const email = input.email.trim().toLowerCase();
  const username = validateUsername(input.username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        username,
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
    await supabase
      .from("profiles")
      .update({
        username,
        gym: input.gym?.trim() ?? "",
        city: input.city?.trim() ?? "",
        bio: input.bio?.trim() ?? "",
      })
      .eq("id", data.user.id);
    const profile = await getSupabaseSessionUser();
    if (profile) {
      return profile;
    }
  }

  return {
    id: data.user.id,
    email,
    fullName: input.fullName.trim(),
    username,
    accountType: input.accountType,
    role: email === "admin@juegotodo.com" ? "admin" : "user",
    gym: input.gym?.trim() ?? "",
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
