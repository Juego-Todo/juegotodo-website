import {
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationInput,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
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
    applicationProgram: (row.application_program || payload.applicationProgram || "jt1_member") as LicenseApplication["applicationProgram"],
    restrictionCode: (row.restriction_code || payload.restrictionCode || "JT1") as LicenseApplication["restrictionCode"],
    fullName: row.full_name || payload.fullName || "",
    idNumber: row.id_number || payload.idNumber || "",
    submittedAt: row.submitted_at || payload.submittedAt,
    reviewedAt: row.reviewed_at ?? payload.reviewedAt ?? null,
  });
}

function toLicenseApplicationRow(application: LicenseApplication) {
  return {
    id: application.id,
    user_id: application.userId,
    user_email: application.userEmail,
    status: application.status,
    application_program: application.applicationProgram,
    restriction_code: application.restrictionCode,
    full_name: application.fullName,
    id_number: application.idNumber,
    submitted_at: application.submittedAt,
    reviewed_at: application.reviewedAt,
    payload: application,
  };
}

export async function fetchAllLicenseApplicationsSupabase(): Promise<LicenseApplication[]> {
  const response = await fetch("/api/admin/licenses", {
    method: "GET",
    cache: "no-store",
  });

  if (response.ok) {
    const payload = (await response.json()) as { applications?: LicenseApplication[] };
    return payload.applications ?? [];
  }

  if (response.status !== 503) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to load license applications.");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("license_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapLicenseApplication);
}

export async function fetchLicenseApplicationByUserIdSupabase(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("license_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapLicenseApplication(data) : null;
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
  const supabase = createSupabaseBrowserClient();
  const row = toLicenseApplicationRow(application);
  const { data, error } = await supabase
    .from("license_applications")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapLicenseApplication(data);
}

export async function reviewLicenseApplicationSupabase(
  applicationId: string,
  application: LicenseApplication,
) {
  const supabase = createSupabaseBrowserClient();
  const row = toLicenseApplicationRow(application);
  const { id: _id, ...updateRow } = row;
  const { data, error } = await supabase
    .from("license_applications")
    .update(updateRow)
    .eq("id", applicationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapLicenseApplication(data);
}

export async function deleteLicenseApplicationsByUserIdSupabase(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("license_applications").delete().eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchPendingLicenseApplicationCountSupabase() {
  const applications = await fetchAllLicenseApplicationsSupabase();
  return applications.filter((application) => application.status === "pending").length;
}
