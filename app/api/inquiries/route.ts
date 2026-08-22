import { NextResponse } from "next/server";
import { validateInquiry, type InquiryInput } from "@/lib/platform/inquiries";
import { insertInquiry } from "@/lib/platform/inquiries-server";
import { sendInquiryConfirmation } from "@/lib/platform/email";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createInquiryLocal } from "@/lib/platform/inquiries";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InquiryInput;
    const errors = validateInquiry(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const record = isSupabaseConfigured()
      ? await insertInquiry(body)
      : createInquiryLocal(body);

    try {
      await sendInquiryConfirmation(record.email, record.fullName, body.subject || "Inquiry received");
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ ok: true, inquiry: record });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to submit inquiry." },
      { status: 500 },
    );
  }
}
