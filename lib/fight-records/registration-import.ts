import fs from "node:fs";
import path from "node:path";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  cleanText,
  isMinorDob,
  normalizeGym,
  normalizePersonName,
  parseFlexibleDate,
  slugifyFighter,
  titleCaseName,
} from "@/lib/fight-records/normalize";
import { provisionFighterClaimAccount } from "@/lib/fight-records/provision-claim-account";

export type RegistrationFighterRow = {
  email?: string;
  legalName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName?: string;
  alias?: string;
  dateOfBirth?: string;
  age?: string;
  gender?: string;
  address?: string;
  nationality?: string;
  contactNumber?: string;
  facebook?: string;
  weightClass?: string;
  walkingWeight?: string;
  height?: string;
  fightExperience?: string;
  record?: string;
  gym?: string;
  coach?: string;
  stance?: string;
  martialArtsSystem?: string;
  active?: string;
  timestamp?: string;
};

export type RegistrationImportFile = {
  source?: string;
  count?: number;
  fighters: RegistrationFighterRow[];
};

const SKIP_EMAILS = new Set([
  "marketing.juegotodocorp@gmail.com",
  "pearl.ugbmmacorp@gmail.com",
  "prcapague@gmail.com",
  "juegotodophofficial@gmail.com",
]);

const REGISTRATION_PATH = path.join(process.cwd(), "data", "imports", "jt-fighter-reg-extracted.json");

function isTrialRow(row: RegistrationFighterRow) {
  const blob = [row.displayName, row.alias, row.gym, row.legalName, row.firstName, row.lastName]
    .map((value) => cleanText(value).toUpperCase())
    .join(" ");
  return blob.includes("TRIAL");
}

function nicknameFromAlias(alias: string, displayName: string) {
  const cleaned = cleanText(alias);
  if (!cleaned) return "";
  if (cleaned.toLowerCase() === displayName.toLowerCase()) return "";
  return cleaned.replace(/^"+|"+$/g, "").trim();
}

export function loadRegistrationImportFile(filePath = REGISTRATION_PATH): RegistrationImportFile {
  if (!fs.existsSync(filePath)) {
    throw new Error("Registration extract not found. Upload JT fighter registration CSV first.");
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as RegistrationImportFile;
  if (!parsed || !Array.isArray(parsed.fighters)) {
    throw new Error("Invalid registration extract JSON.");
  }
  return parsed;
}

export function prepareRegistrationFighters(rows: RegistrationFighterRow[]) {
  const prepared: Array<{
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    nickname: string;
    gym: string;
    hometown: string;
    height: string;
    weightClass: string;
    photoSourceUrl: string;
    dateOfBirth: string | null;
    normalizedName: string;
    record: string;
    gender: string;
  }> = [];

  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  for (const row of rows) {
    if (isTrialRow(row)) continue;
    const email = cleanText(row.email).toLowerCase();
    if (email && SKIP_EMAILS.has(email)) continue;

    let firstName = titleCaseName(cleanText(row.firstName));
    let lastName = titleCaseName(cleanText(row.lastName));
    const middleName = titleCaseName(cleanText(row.middleName));
    if (!firstName && !lastName) {
      const display = cleanText(row.displayName) || cleanText(row.alias);
      const parts = display.split(/\s+/).filter(Boolean);
      firstName = titleCaseName(parts[0] || "Fighter");
      lastName = titleCaseName(parts.slice(1).join(" ") || "Athlete");
    }

    const displayName =
      cleanText(row.displayName) ||
      [firstName, middleName, lastName].filter(Boolean).join(" ") ||
      cleanText(row.alias) ||
      "Fighter";

    const normalizedName = normalizePersonName(firstName, lastName) || normalizePersonName(displayName, "");
    const nameKey = `${normalizedName}||${normalizeGym(row.gym || "")}`;
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);

    if (email) {
      if (seenEmails.has(email)) continue;
      seenEmails.add(email);
    }

    const dateOfBirth = parseFlexibleDate(row.dateOfBirth || null);
    const weightClass = cleanText(row.weightClass) || cleanText(row.walkingWeight);
    const hometown = cleanText(row.address).split(",")[0]?.trim() || cleanText(row.nationality);

    prepared.push({
      email,
      firstName,
      lastName,
      displayName: titleCaseName(displayName),
      nickname: nicknameFromAlias(row.alias || "", displayName),
      gym: cleanText(row.gym),
      hometown,
      height: cleanText(row.height),
      weightClass,
      photoSourceUrl: cleanText(row.facebook),
      dateOfBirth,
      normalizedName,
      record: cleanText(row.record),
      gender: cleanText(row.gender),
    });
  }

  return prepared;
}

export async function previewRegistrationImport(filePath?: string) {
  const file = loadRegistrationImportFile(filePath);
  const fighters = prepareRegistrationFighters(file.fighters);
  return {
    source: file.source || "jt-fighter-reg-extracted.json",
    totalRows: file.fighters.length,
    importable: fighters.length,
    withEmail: fighters.filter((row) => Boolean(row.email)).length,
    sample: fighters.slice(0, 12).map((row) => ({
      displayName: row.displayName,
      alias: row.nickname,
      email: row.email,
      gym: row.gym,
      record: row.record,
      dateOfBirth: row.dateOfBirth,
    })),
  };
}

async function uniqueFighterSlug(
  client: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  displayName: string,
  normalizedName: string,
) {
  const baseSlug = slugifyFighter(displayName) || slugifyFighter(normalizedName) || "fighter";
  let slug = baseSlug;
  let suffix = 2;
  while (suffix < 100) {
    const { data } = await client.from("fighters").select("id, normalized_name").eq("slug", slug).maybeSingle();
    if (!data || data.normalized_name === normalizedName) return slug;
    slug = `${baseSlug.slice(0, 70)}-${suffix}`;
    suffix += 1;
  }
  return `${baseSlug.slice(0, 60)}-${Date.now().toString(36)}`;
}

export async function applyRegistrationImport(input?: {
  filePath?: string;
  createAccounts?: boolean;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const client = createSupabaseServiceClient();
  if (!client) {
    throw new Error("Supabase service role is required.");
  }

  const createAccounts = input?.createAccounts !== false;
  const fighters = prepareRegistrationFighters(loadRegistrationImportFile(input?.filePath).fighters);

  let created = 0;
  let updated = 0;
  let accountsCreated = 0;
  let accountsExisting = 0;
  const errors: string[] = [];

  for (const fighter of fighters) {
    try {
      const { data: existingByName } = await client
        .from("fighters")
        .select("id, slug")
        .eq("normalized_name", fighter.normalizedName)
        .eq("gym", fighter.gym)
        .maybeSingle();

      let slug = existingByName?.slug || (await uniqueFighterSlug(client, fighter.displayName, fighter.normalizedName));
      let fighterId = existingByName?.id ?? "";

      const payload = {
        slug,
        first_name: fighter.firstName,
        last_name: fighter.lastName,
        display_name: fighter.displayName,
        nickname: fighter.nickname,
        gym: fighter.gym,
        hometown: fighter.hometown,
        height: fighter.height,
        weight_class: fighter.weightClass,
        photo_source_url: fighter.photoSourceUrl,
        date_of_birth: fighter.dateOfBirth,
        normalized_name: fighter.normalizedName,
        public_visibility: true,
      };

      if (existingByName) {
        const { error } = await client.from("fighters").update(payload).eq("id", existingByName.id);
        if (error) throw new Error(error.message);
        updated += 1;
      } else {
        const { data: inserted, error } = await client
          .from("fighters")
          .insert({
            ...payload,
            claim_status: "unclaimed",
          })
          .select("id, slug")
          .single();
        if (error) throw new Error(error.message);
        fighterId = inserted.id;
        slug = inserted.slug;
        created += 1;
      }

      if (createAccounts && fighter.email) {
        const provision = await provisionFighterClaimAccount(client, {
          email: fighter.email,
          fighterSlug: slug,
          fighterName: fighter.displayName,
          fighterDateOfBirth: fighter.dateOfBirth,
          isMinor: isMinorDob(fighter.dateOfBirth),
        });
        if (provision.created) accountsCreated += 1;
        else accountsExisting += 1;

        if (provision.userId) {
          const { data: profile } = await client
            .from("profiles")
            .select("fighter_slug")
            .eq("id", provision.userId)
            .maybeSingle();
          if (!profile?.fighter_slug) {
            await client.from("profiles").update({ fighter_slug: slug }).eq("id", provision.userId);
          }
        }
      }

      void fighterId;
    } catch (caught) {
      errors.push(
        `${fighter.displayName}${fighter.email ? ` <${fighter.email}>` : ""}: ${
          caught instanceof Error ? caught.message : "import failed"
        }`,
      );
    }
  }

  return {
    importable: fighters.length,
    created,
    updated,
    accountsCreated,
    accountsExisting,
    errors: errors.slice(0, 30),
    errorCount: errors.length,
  };
}
