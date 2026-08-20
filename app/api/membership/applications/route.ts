import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  createOrUpdateMembershipDraft,
  listMembershipApplications,
} from "@/lib/membership/service";
import { sanitizeMembershipDraft } from "@/lib/membership/validation";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const applications = await listMembershipApplications(auth.supabase, {
      userId: auth.user.id,
    });
    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load applications." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = (await request.json()) as {
      applicationId?: string;
      draft?: Record<string, unknown>;
    };

    const draft = sanitizeMembershipDraft(body.draft ?? {});
    // Draft saves only need identity fields; full validation runs on submit.
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      return NextResponse.json({ error: "First and last name are required to save a draft." }, { status: 400 });
    }
    if (draft.contactEmail.trim() && !draft.contactEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const application = await createOrUpdateMembershipDraft(auth.supabase, {
      userId: auth.user.id,
      userEmail: auth.user.email ?? draft.contactEmail,
      draft,
      applicationId: body.applicationId,
    });

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save draft." },
      { status: 400 },
    );
  }
}
