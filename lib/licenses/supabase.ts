import {
  normalizeLicenseApplication,
  resolveApplicationProgram,
  type LicenseApplication,
  type LicenseApplicationProgram,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import { adminFetch } from "@/lib/auth/admin-fetch";
import { membershipFetch } from "@/lib/membership/client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LicenseApplicationRow } from "@/lib/supabase/types";

function mapLicenseApplication(row: LicenseApplicationRow): LicenseApplication {
  const payload = (row.payload ?? {}) as LicenseApplication;

  return normalizeLicenseApplication({
    ...payload,
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    status: row.status as LicenseApplicationStatus,
    applicationProgram: (row.application_program ||
      payload.applicationProgram ||
      "jt1_member") as LicenseApplication["applicationProgram"],
    restrictionCode: (row.restriction_code ||
      payload.restrictionCode ||
      "JT1") as LicenseApplication["restrictionCode"],
    fullName: row.full_name || payload.fullName || "",
    idNumber: row.id_number || payload.idNumber || "",
    submittedAt: row.submitted_at || payload.submittedAt,
    reviewedAt: row.reviewed_at ?? payload.reviewedAt ?? null,
  });
}

function isMembershipApplication(application: LicenseApplication) {
  return (
    resolveApplicationProgram(application) === "jt1_member" || application.restrictionCode === "JT1"
  );
}

/** Prefer approved role license, then pending role, never a JT1 membership draft for classic profile card. */
function pickPrimaryRoleLicense(applications: LicenseApplication[]): LicenseApplication | null {
  const roleApps = applications.filter((application) => !isMembershipApplication(application));
  if (roleApps.length === 0) {
    return null;
  }

  const approved = roleApps.find((application) => application.status === "approved");
  if (approved) {
    return approved;
  }

  const inReview = roleApps.find(
    (application) => application.status === "pending" || application.status === "needs_info",
  );
  if (inReview) {
    return inReview;
  }

  return roleApps[0] ?? null;
}

export async function fetchAllLicenseApplicationsSupabase(): Promise<LicenseApplication[]> {
  const response = await adminFetch("/api/admin/licenses");
  const payload = (await response.json()) as { applications?: LicenseApplication[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to load license applications.");
  }

  return (payload.applications ?? []).map((application) => normalizeLicenseApplication(application));
}

export async function fetchLicenseApplicationsByUserIdSupabase(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("license_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapLicenseApplication(row as LicenseApplicationRow));
}

/** Profile / directory: primary non-membership role credential for this user. */
export async function fetchLicenseApplicationByUserIdSupabase(userId: string) {
  const applications = await fetchLicenseApplicationsByUserIdSupabase(userId);
  return pickPrimaryRoleLicense(applications);
}

export async function fetchLicenseApplicationByUserAndProgramSupabase(
  userId: string,
  program: LicenseApplicationProgram,
) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("license_applications")
    .select("*")
    .eq("user_id", userId)
    .eq("application_program", program)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapLicenseApplication(data as LicenseApplicationRow) : null;
}

export async function fetchLicenseApplicationByIdSupabase(applicationId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("license_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapLicenseApplication(data) : null;
}

export async function saveLicenseApplicationSupabase(application: LicenseApplication) {
  const response = await membershipFetch("/api/licenses", {
    method: "POST",
    body: JSON.stringify({ application }),
  });
  const payload = (await response.json()) as {
    application?: LicenseApplication;
    error?: string;
    redirectTo?: string;
  };

  if (!response.ok) {
    const error = new Error(payload.error || "Unable to save license application.") as Error & {
      redirectTo?: string;
    };
    if (payload.redirectTo) {
      error.redirectTo = payload.redirectTo;
    }
    throw error;
  }

  if (!payload.application) {
    throw new Error("Unable to save license application.");
  }

  return normalizeLicenseApplication(payload.application);
}

export async function reviewLicenseApplicationSupabase(
  applicationId: string,
  application: LicenseApplication,
) {
  const response = await adminFetch("/api/admin/licenses", {
    method: "PATCH",
    body: JSON.stringify({
      applicationId,
      status: application.status,
      reviewNotes: application.reviewNotes ?? "",
    }),
  });
  const payload = (await response.json()) as { application?: LicenseApplication; error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to review license application.");
  }

  if (!payload.application) {
    throw new Error("Unable to review license application.");
  }

  return normalizeLicenseApplication(payload.application);
}

export async function deleteLicenseApplicationsByUserIdSupabase(userId: string) {
  const response = await adminFetch(`/api/admin/licenses?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to delete license applications.");
  }
}

export async function fetchPendingLicenseApplicationCountSupabase() {
  const applications = await fetchAllLicenseApplicationsSupabase();
  return applications.filter((application) => application.status === "pending").length;
}
