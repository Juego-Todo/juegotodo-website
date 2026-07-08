import { NextResponse } from "next/server";
import { isServerAdminUser } from "@/lib/auth/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { LicenseApplicationRow } from "@/lib/supabase/types";
import {
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";

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

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    return NextResponse.json({ error: adminError.message }, { status: 500 });
  }

  if (!isServerAdminUser(user.email, adminProfile)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const serviceClient = createSupabaseServiceClient();
  const queryClient = serviceClient ?? supabase;

  const { data, error } = await queryClient
    .from("license_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    applications: (data ?? []).map(mapLicenseApplication),
  });
}
