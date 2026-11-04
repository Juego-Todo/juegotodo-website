import {
  emptyLicenseUploads,
  isFighterLicenseApplication,
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationStatus,
  type LicenseBackgroundAnswers,
} from "@/data/license-applications";
import type { Json, LicenseApplicationRow } from "@/lib/supabase/types";

/** Columns safe to load for public fighter pages and /api/fighters/licensed. */
export const PUBLIC_FIGHTER_LICENSE_COLUMNS =
  "id, user_id, status, application_program, restriction_code, full_name, reviewed_at, submitted_at, payload" as const;

const PUBLIC_BACKGROUND_KEYS = [
  "nickname",
  "weightDivision",
  "weightClass",
  "gym",
  "affiliatedGym",
  "fightTeam",
  "professionalRecord",
  "amateurRecord",
  "fightRecord",
  "primaryDiscipline",
  "stance",
  "notableAchievements",
] as const satisfies ReadonlyArray<keyof LicenseBackgroundAnswers>;

type PublicLicenseRow = Pick<
  LicenseApplicationRow,
  | "id"
  | "user_id"
  | "status"
  | "application_program"
  | "restriction_code"
  | "full_name"
  | "reviewed_at"
  | "submitted_at"
  | "payload"
>;

function pickPublicBackgroundAnswers(value: unknown): LicenseBackgroundAnswers {
  if (!value || typeof value !== "object") {
    return {};
  }

  const source = value as Record<string, unknown>;
  const answers: LicenseBackgroundAnswers = {};
  for (const key of PUBLIC_BACKGROUND_KEYS) {
    const entry = source[key];
    if (typeof entry === "string" && entry.trim()) {
      answers[key] = entry;
    }
  }
  return answers;
}

function pickPublicPayload(payload: Json | null | undefined): Partial<LicenseApplication> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const source = payload as Record<string, unknown>;
  const uploads =
    source.uploads && typeof source.uploads === "object" && !Array.isArray(source.uploads)
      ? (source.uploads as Record<string, unknown>)
      : null;

  return {
    firstName: typeof source.firstName === "string" ? source.firstName : "",
    middleName: typeof source.middleName === "string" ? source.middleName : "",
    lastName: typeof source.lastName === "string" ? source.lastName : "",
    suffix: typeof source.suffix === "string" ? source.suffix : "",
    nationality: typeof source.nationality === "string" ? source.nationality : "Filipino",
    fighterSlug: typeof source.fighterSlug === "string" ? source.fighterSlug : undefined,
    backgroundAnswers: pickPublicBackgroundAnswers(source.backgroundAnswers),
    uploads: {
      ...emptyLicenseUploads,
      profilePhoto: typeof uploads?.profilePhoto === "string" ? uploads.profilePhoto : "",
    },
  };
}

/** Map a license row to a public-safe application (no DOB, address, phone, email, or private docs). */
export function mapPublicFighterLicense(
  row: PublicLicenseRow,
  fighterSlug?: string | null,
): LicenseApplication | null {
  const publicPayload = pickPublicPayload(row.payload);

  const application = normalizeLicenseApplication({
    firstName: publicPayload.firstName ?? "",
    middleName: publicPayload.middleName ?? "",
    lastName: publicPayload.lastName ?? "",
    suffix: publicPayload.suffix ?? "",
    gender: "",
    title: "",
    dateOfBirth: "",
    nationality: publicPayload.nationality ?? "Filipino",
    bloodType: "",
    civilStatus: "",
    contactEmail: "",
    mobileNumber: "",
    addressCountry: "",
    addressProvince: "",
    addressCity: "",
    addressBarangay: "",
    addressZip: "",
    applicationProgram: (row.application_program || "jt1_member") as LicenseApplication["applicationProgram"],
    restrictionCode: (row.restriction_code || "JT1") as LicenseApplication["restrictionCode"],
    backgroundAnswers: publicPayload.backgroundAnswers ?? {},
    restrictions: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactAddress: "",
    emergencyContactPhone: "",
    uploads: publicPayload.uploads ?? emptyLicenseUploads,
    id: row.id,
    userId: row.user_id,
    userEmail: "",
    fullName: row.full_name || "",
    positionTitle: "",
    fightTeam: "",
    status: row.status as LicenseApplicationStatus,
    idNumber: "",
    issuedDate: null,
    expiryDate: null,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewNotes: "",
    fighterSlug: fighterSlug || publicPayload.fighterSlug,
  });

  if (!isFighterLicenseApplication(application) || application.status !== "approved") {
    return null;
  }

  return application;
}
