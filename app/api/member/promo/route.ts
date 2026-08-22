import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/platform/auth";
import { issueWelcomePromoCode } from "@/lib/platform/promo-server";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { code?: string };
    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Promo code is required." }, { status: 400 });
    }

    await issueWelcomePromoCode(auth.user.id, body.code.trim());
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to register promo code." },
      { status: 500 },
    );
  }
}
