import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminCreateOrRepairMember } from "@/lib/admin/create-member";
import type { Database } from "@/lib/supabase/types";

type ServiceClient = SupabaseClient<Database>;

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
  // Auth profiles require a DOB; use a safe provisional value when Latayanology has none.
  return isMinor ? "1985-01-01" : "1995-01-01";
}

export type ProvisionFighterClaimAccountResult = {
  email: string;
  userId: string;
  created: boolean;
  temporaryPassword: string | null;
  fullName: string;
};

/**
 * Ensures a website login exists for the claim-invite email.
 * New accounts get fighter (or regular_member for guardian) tags and a one-time password.
 */
export async function provisionFighterClaimAccount(
  client: ServiceClient,
  input: {
    email: string;
    fighterName: string;
    fighterDateOfBirth?: string | null;
    isMinor: boolean;
  },
): Promise<ProvisionFighterClaimAccountResult> {
  const email = input.email.trim().toLowerCase();
  const { data: existing } = await client.from("profiles").select("id, email, full_name").ilike("email", email).maybeSingle();

  if (existing) {
    return {
      email,
      userId: existing.id,
      created: false,
      temporaryPassword: null,
      fullName: existing.full_name?.trim() || input.fighterName,
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
  };
}
