import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { normalizeAssignedTags } from "@/lib/profile/account-tags";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient();
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const { data, error } = await admin.serviceClient
    .from("profiles")
    .select("assigned_tags")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("assigned_tags")) {
      return NextResponse.json({ tags: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    tags: normalizeAssignedTags(data?.assigned_tags),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient();
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = normalizeAssignedTags(body?.tags);

  const { data, error } = await admin.serviceClient
    .from("profiles")
    .update({ assigned_tags: tags })
    .eq("id", userId)
    .select("assigned_tags")
    .single();

  if (error) {
    // Column may not exist yet on older projects — surface a clear fix message.
    if (error.message.toLowerCase().includes("assigned_tags")) {
      return NextResponse.json(
        {
          error:
            "assigned_tags column is missing. Run the latest Supabase migration (profiles assigned_tags), then retry.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    tags: normalizeAssignedTags(data?.assigned_tags),
  });
}
