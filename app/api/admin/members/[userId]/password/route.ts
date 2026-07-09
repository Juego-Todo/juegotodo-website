import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient();
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const { error } = await admin.serviceClient.auth.admin.updateUserById(userId, { password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
