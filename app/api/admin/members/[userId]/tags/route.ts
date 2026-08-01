import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import {
  normalizeAssignedTags,
  resolveAccountTypeFromAssignedTags,
} from "@/lib/profile/account-tags";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const { data, error } = await admin.serviceClient
    .from("profiles")
    .select("assigned_tags, account_type")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("assigned_tags")) {
      return NextResponse.json({ tags: [], accountType: "fan" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tags = normalizeAssignedTags(data?.assigned_tags);
  return NextResponse.json({
    tags,
    accountType: data?.account_type ?? resolveAccountTypeFromAssignedTags(tags),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { userId } = await context.params;
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = normalizeAssignedTags(body?.tags);
  const accountType = resolveAccountTypeFromAssignedTags(tags);

  const { data, error } = await admin.serviceClient
    .from("profiles")
    .update({
      assigned_tags: tags,
      account_type: accountType,
    })
    .eq("id", userId)
    .select("assigned_tags, account_type")
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
    accountType: data?.account_type ?? accountType,
  });
}
