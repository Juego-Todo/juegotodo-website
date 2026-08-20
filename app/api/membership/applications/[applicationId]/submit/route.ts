import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  createOrUpdateMembershipDraft,
  submitMembershipApplication,
} from "@/lib/membership/service";
import { sanitizeMembershipDraft, validateMembershipDraft } from "@/lib/membership/validation";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { applicationId } = await context.params;

  try {
    const body = (await request.json()) as {
      draft?: Record<string, unknown>;
      paymentScreenshotDocumentId?: string | null;
      idempotencyKey?: string;
    };

    const draft = sanitizeMembershipDraft({
      ...(body.draft ?? {}),
      consentConfirmed: true,
      idempotencyKey: body.idempotencyKey,
    });

    const validationError = validateMembershipDraft(draft, {
      requirePayment: true,
      requireConsent: true,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await createOrUpdateMembershipDraft(auth.supabase, {
      userId: auth.user.id,
      userEmail: auth.user.email ?? draft.contactEmail,
      draft,
      applicationId,
    });

    const application = await submitMembershipApplication(auth.supabase, {
      applicationId,
      userId: auth.user.id,
      userEmail: auth.user.email ?? draft.contactEmail,
      draft,
      paymentScreenshotDocumentId: body.paymentScreenshotDocumentId,
    });

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit application." },
      { status: 400 },
    );
  }
}
