import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import type { LicenseApplicationRow, Json } from "@/lib/supabase/types";

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

/** Authenticated applicant upsert for their own license application (non-membership role licenses). */
export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = (await request.json()) as { application?: LicenseApplication };
    if (!body.application?.id || !body.application.fullName) {
      return NextResponse.json({ error: "Application payload is required." }, { status: 400 });
    }

    const application = normalizeLicenseApplication({
      ...body.application,
      userId: auth.user.id,
      userEmail: auth.user.email ?? body.application.userEmail,
      status: "pending",
    });

    // Block JT1/local membership through the legacy path — membership portal owns that lifecycle.
    if (application.applicationProgram === "jt1_member" || application.restrictionCode === "JT1") {
      return NextResponse.json(
        {
          error: "Local membership applications must be submitted through the Membership Portal.",
          redirectTo: "/membership/apply/local-membership",
        },
        { status: 400 },
      );
    }

    const { data: existingRow } = await auth.supabase
      .from("license_applications")
      .select("id, user_id, application_program, restriction_code")
      .eq("id", application.id)
      .maybeSingle();

    if (existingRow) {
      if (existingRow.user_id !== auth.user.id) {
        return NextResponse.json({ error: "License application not found." }, { status: 404 });
      }
      if (
        existingRow.application_program === "jt1_member" ||
        existingRow.restriction_code === "JT1" ||
        (existingRow.application_program &&
          existingRow.application_program !== application.applicationProgram)
      ) {
        return NextResponse.json(
          { error: "Cannot overwrite a different license or membership application." },
          { status: 409 },
        );
      }
    }

    const row = {
      id: application.id,
      user_id: auth.user.id,
      user_email: application.userEmail,
      status: application.status,
      application_status: "SUBMITTED",
      application_program: application.applicationProgram,
      restriction_code: application.restrictionCode,
      full_name: application.fullName,
      id_number: application.idNumber,
      submitted_at: application.submittedAt,
      reviewed_at: application.reviewedAt,
      payload: application as unknown as Json,
    };

    const { data, error } = await auth.supabase
      .from("license_applications")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await auth.supabase.from("notifications").insert({
      user_id: auth.user.id,
      title: "License Application Submitted",
      body: `Your ${application.restrictionCode} license application was received and is pending review.`,
      read: false,
    });

    return NextResponse.json({ application: mapLicenseApplication(data as LicenseApplicationRow) });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save license application." },
      { status: 500 },
    );
  }
}
