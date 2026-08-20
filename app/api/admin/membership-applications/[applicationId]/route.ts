import { NextResponse } from "next/server";
import { requireMembershipAdmin } from "@/lib/membership/auth";
import { fetchMembershipApplicationBundle } from "@/lib/membership/service";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireMembershipAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId } = await context.params;

  try {
    const application = await fetchMembershipApplicationBundle(auth.serviceClient, applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load application." },
      { status: 500 },
    );
  }
}
