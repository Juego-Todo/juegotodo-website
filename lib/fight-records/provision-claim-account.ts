import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminCreateOrRepairMember } from "@/lib/admin/create-member";
import type { Database } from "@/lib/supabase/types";

type ServiceClient = SupabaseClient<Database>;

/** Detectable placeholder mailbox used until a real email is known. */
export const FIGHTER_PLACEHOLDER_EMAIL_DOMAIN = "pending.latayanology.local";

export function isPlaceholderFighterEmail(email: string | null | undefined) {
  const value = (email ?? "").trim().toLowerCase();
  return value.endsWith(`@${FIGHTER_PLACEHOLDER_EMAIL_DOMAIN}`);
}

export function buildPlaceholderFighterEmail(slug: string) {
  const safe = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = randomBytes(3).toString("hex");
  return `${safe || "fighter"}.${suffix}@${FIGHTER_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function splitFighterName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "Fighter", lastName: "Athlete" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Athlete" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function generateTempPassword() {
  return `JT-${randomBytes(9).toString("base64url")}`;
}

function provisionalDateOfBirth(dateOfBirth: string | null | undefined, isMinor: boolean) {
  const trimmed = dateOfBirth?.trim() ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return isMinor ? "1985-01-01" : "1995-01-01";
}

export type ProvisionFighterClaimAccountResult = {
  email: string;
  userId: string;
  created: boolean;
  temporaryPassword: string | null;
  fullName: string;
  isPlaceholder: boolean;
};

/**
 * Ensures a website login exists for the claim-invite email.
 * Pass an empty email (or omit) to create a placeholder mailbox until a real email is known.
 */
export async function provisionFighterClaimAccount(
  client: ServiceClient,
  input: {
    email?: string | null;
    fighterSlug: string;
    fighterName: string;
    fighterDateOfBirth?: string | null;
    isMinor: boolean;
  },
): Promise<ProvisionFighterClaimAccountResult> {
  const requested = (input.email ?? "").trim().toLowerCase();
  const email = requested || buildPlaceholderFighterEmail(input.fighterSlug);
  const isPlaceholder = isPlaceholderFighterEmail(email);

  const { data: existing } = await client.from("profiles").select("id, email, full_name").ilike("email", email).maybeSingle();

  if (existing) {
    return {
      email,
      userId: existing.id,
      created: false,
      temporaryPassword: null,
      fullName: existing.full_name?.trim() || input.fighterName,
      isPlaceholder: isPlaceholderFighterEmail(existing.email),
    };
  }

  const { firstName, lastName } = splitFighterName(input.fighterName);
  const temporaryPassword = generateTempPassword();
  const dateOfBirth = provisionalDateOfBirth(input.fighterDateOfBirth, input.isMinor);

  const result = await adminCreateOrRepairMember(client, {
    firstName: input.isMinor ? "Guardian" : firstName,
    lastName: input.isMinor ? lastName || "Account" : lastName,
    email,
    password: temporaryPassword,
    dateOfBirth,
    accountType: input.isMinor ? "fan" : "athlete",
    role: "user",
    assignedTags: input.isMinor ? ["regular_member"] : ["fighter", "regular_member"],
    mustChangePassword: true,
    country: "Philippines",
  });

  return {
    email,
    userId: result.member.id,
    created: result.created,
    temporaryPassword: result.created ? temporaryPassword : null,
    fullName: result.member.fullName,
    isPlaceholder,
  };
}

/**
 * Replace a placeholder (or prior) invite email with a real mailbox and refresh credentials.
 */
export async function assignRealEmailToFighterClaimAccount(
  client: ServiceClient,
  input: {
    userId: string;
    newEmail: string;
  },
): Promise<{ email: string; temporaryPassword: string }> {
  const email = input.newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required.");
  }
  if (isPlaceholderFighterEmail(email)) {
    throw new Error("Enter a real email address, not a placeholder.");
  }

  const { data: taken } = await client
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .neq("id", input.userId)
    .maybeSingle();
  if (taken) {
    throw new Error("Another member already uses that email.");
  }

  const temporaryPassword = generateTempPassword();
  const { error: authError } = await client.auth.admin.updateUserById(input.userId, {
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      must_change_password: true,
    },
  });
  if (authError) throw new Error(authError.message);

  const { error: profileError } = await client.from("profiles").update({ email }).eq("id", input.userId);
  if (profileError) throw new Error(profileError.message);

  return { email, temporaryPassword };
}
