import { NextResponse } from "next/server";
import { leadershipStaffAccounts } from "@/data/leadership-staff-accounts";
import { adminCreateOrRepairMember } from "@/lib/admin/create-member";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const results = [];

  for (const account of leadershipStaffAccounts) {
    try {
      const result = await adminCreateOrRepairMember(admin.serviceClient, {
        firstName: account.firstName,
        middleName: account.middleName,
        lastName: account.lastName,
        email: account.email,
        password: "JuegoTodo2026!",
        dateOfBirth: account.dateOfBirth,
        username: account.username,
        accountType: account.accountType,
        role: account.role,
        assignedTags: account.assignedTags,
        mustChangePassword: true,
        country: "Philippines",
      });
      results.push({
        email: account.email,
        created: result.created,
        ok: true,
        member: result.member,
      });
    } catch (error) {
      results.push({
        email: account.email,
        created: false,
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create account.",
      });
    }
  }

  const failed = results.filter((result) => !result.ok);
  return NextResponse.json(
    {
      ok: failed.length === 0,
      results,
    },
    { status: failed.length === 0 ? 200 : 207 },
  );
}