import { NextResponse } from "next/server";
import { mapProfileRow } from "@/lib/auth/profile-sync";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { migrateAccountType, type AdminUserUpdateInput, type UserRole } from "@/lib/auth/types";
import { validateUsername } from "@/lib/auth/username";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

function resolveRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "user";
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient();
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const input = (await request.json()) as Partial<AdminUserUpdateInput>;
  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();
  const username = validateUsername(input.username ?? "");

  if (!email || !fullName) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }

  const accountType = migrateAccountType(input.accountType ?? "fan");
  const role = resolveRole(input.role);

  const { error: authError } = await admin.serviceClient.auth.admin.updateUserById(userId, {
    email,
    user_metadata: {
      full_name: fullName,
      username,
      account_type: accountType,
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { data, error } = await admin.serviceClient
    .from("profiles")
    .update({
      full_name: fullName,
      username,
      email,
      account_type: accountType,
      role,
      gym: input.gym?.trim() ?? "",
      city: input.city?.trim() ?? "",
      bio: input.bio?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      country: input.country?.trim() || "Philippines",
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: mapProfileRow(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient();
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const { error } = await admin.serviceClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
