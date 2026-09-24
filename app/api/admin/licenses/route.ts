import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import {
  normalizeLicenseApplication,
  type LicenseApplication,
  type LicenseApplicationStatus,
} from "@/data/license-applications";
import { resolveLicenseTag } from "@/data/user-type-tags";
import { ensureApprovedFighterSlug } from "@/lib/fighters/from-license";
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
    payload: application as unknown as Json,
  };
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next.toISOString();
}

function resolveLifecycleStatus(status: LicenseApplicationStatus) {
  if (status === "approved") {
    return "APPROVED";
  }
  if (status === "rejected") {
    return "REJECTED";
  }
  if (status === "needs_info") {
    return "ACTION_REQUIRED";
  }
  return "SUBMITTED";
}

function isMembershipRow(application: LicenseApplication) {
  return application.applicationProgram === "jt1_member" || application.restrictionCode === "JT1";
}

/** Admin list of role license applications (excludes JT1 membership portal apps). */
export async function GET(request: Request) {
  const auth = await requireAdminServiceClient(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { data, error } = await auth.serviceClient
    .from("license_applications")
    .select("*")
    .neq("application_program", "jt1_member")
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    applications: (data ?? []).map((row) => mapLicenseApplication(row as LicenseApplicationRow)),
  });
}

/** Admin review / status transition for a role license application. */
export async function PATCH(request: Request) {
  const auth = await requireAdminServiceClient(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = (await request.json()) as {
      applicationId?: string;
      status?: LicenseApplicationStatus;
      reviewNotes?: string;
    };

    if (!body.applicationId || !body.status) {
      return NextResponse.json({ error: "applicationId and status are required." }, { status: 400 });
    }

    const { data: currentRow, error: fetchError } = await auth.serviceClient
      .from("license_applications")
      .select("*")
      .eq("id", body.applicationId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!currentRow) {
      return NextResponse.json({ error: "License application not found." }, { status: 404 });
    }

    const current = mapLicenseApplication(currentRow as LicenseApplicationRow);
    if (isMembershipRow(current)) {
      return NextResponse.json(
        {
          error: "Local membership applications must be reviewed in the Membership Portal admin.",
          redirectTo: "/admin/membership-applications",
        },
        { status: 400 },
      );
    }

    const reviewedAt = new Date().toISOString();
    let updated: LicenseApplication = {
      ...current,
      status: body.status,
      reviewNotes: body.reviewNotes ?? "",
      reviewedAt,
      issuedDate: body.status === "approved" ? reviewedAt : current.issuedDate,
      expiryDate: body.status === "approved" ? addYears(new Date(reviewedAt), 1) : current.expiryDate,
    };

    if (body.status === "approved") {
      updated = ensureApprovedFighterSlug(updated);
    }

    const row = toLicenseApplicationRow(updated);
    const { id: _id, ...updateRow } = row;
    const lifecycleStatus = resolveLifecycleStatus(body.status);
    const { data, error } = await auth.serviceClient
      .from("license_applications")
      .update({
        ...updateRow,
        application_status: lifecycleStatus,
        ...(body.status === "approved" ? { approved_at: reviewedAt } : {}),
        ...(body.status === "rejected" ? { rejected_at: reviewedAt } : {}),
      })
      .eq("id", body.applicationId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.status === "approved") {
      const licenseTag = resolveLicenseTag(current.restrictionCode);
      if (licenseTag) {
        const { data: profile } = await auth.serviceClient
          .from("profiles")
          .select("assigned_tags")
          .eq("id", current.userId)
          .maybeSingle();

        const existingTags = Array.isArray(profile?.assigned_tags)
          ? (profile.assigned_tags as string[])
          : [];
        if (!existingTags.includes(licenseTag)) {
          await auth.serviceClient
            .from("profiles")
            .update({ assigned_tags: [...existingTags, licenseTag] })
            .eq("id", current.userId);
        }
      }
    }

    await auth.serviceClient.from("notifications").insert({
      user_id: current.userId,
      title: body.status === "approved" ? "License Approved" : "License Update",
      body:
        body.status === "approved"
          ? "Your license application was approved."
          : body.status === "needs_info"
            ? body.reviewNotes || "Additional information is required for your license application."
            : body.reviewNotes || `Your license application status is now ${body.status}.`,
      read: false,
    });

    return NextResponse.json({ application: mapLicenseApplication(data as LicenseApplicationRow) });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to review license application." },
      { status: 500 },
    );
  }
}

/** Admin delete of all license applications for a user. */
export async function DELETE(request: Request) {
  const auth = await requireAdminServiceClient(request);
  if ("response" in auth) {
    return auth.response;
  }

  const userId = new URL(request.url).searchParams.get("userId")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const { error } = await auth.serviceClient.from("license_applications").delete().eq("user_id", userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
