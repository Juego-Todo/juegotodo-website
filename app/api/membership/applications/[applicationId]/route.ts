import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  fetchMembershipApplicationBundle,
  filterApplicantVisibleHistory,
} from "@/lib/membership/service";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId } = await context.params;

  try {
    const application = await fetchMembershipApplicationBundle(auth.supabase, applicationId);
    if (!application || application.userId !== auth.user.id) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      application: {
        ...application,
        history: filterApplicantVisibleHistory(application.history),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load application." },
      { status: 500 },
    );
  }
}
