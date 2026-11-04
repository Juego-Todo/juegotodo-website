import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json } from "@/lib/supabase/types";

type EmailPayload = {
  toEmail: string;
  subject: string;
  body: string;
  template?: string;
  metadata?: Record<string, unknown>;
};

export async function queueEmail(payload: EmailPayload) {
  const service = createSupabaseServiceClient();
  if (!isSupabaseConfigured() || !service) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:outbox]", payload.subject, "→", payload.toEmail);
    }
    return { queued: false, delivery: "console" as const };
  }

  const { error } = await service.from("email_outbox").insert({
    to_email: payload.toEmail,
    subject: payload.subject,
    body: payload.body,
    template: payload.template ?? "generic",
    metadata: (payload.metadata ?? {}) as Json,
  });

  if (error) {
    throw new Error(error.message);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? "Juego Todo <noreply@juegotodo.com>",
          to: [payload.toEmail],
          subject: payload.subject,
          text: payload.body,
        }),
      });

      if (response.ok) {
        return { queued: true, delivery: "resend" as const };
      }
    } catch {
      // Outbox row remains queued for retry
    }
  }

  return { queued: true, delivery: "outbox" as const };
}

export async function sendInquiryConfirmation(email: string, name: string, subject: string) {
  return queueEmail({
    toEmail: email,
    subject: `Juego Todo — ${subject}`,
    body: `Hi ${name},\n\nWe received your inquiry and the JTGC team will review it shortly.\n\n— Juego Todo`,
    template: "inquiry_confirmation",
  });
}

export async function sendLicenseSubmissionEmail(userId: string, email: string, fullName: string) {
  await queueEmail({
    toEmail: email,
    subject: "Juego Todo — License application received",
    body: `Hi ${fullName},\n\nYour license application was submitted successfully. Track status in your profile.\n\n— Juego Todo Licensing`,
    template: "license_submission",
    metadata: { userId },
  });
}

export async function sendFighterClaimInviteEmail(input: {
  toEmail: string;
  fighterName: string;
  acceptUrl: string;
  loginUrl: string;
  existingAccount: boolean;
  accountCreated: boolean;
  temporaryPassword?: string | null;
  isMinor: boolean;
  expiresAt: string;
}) {
  const passwordBlock =
    input.accountCreated && input.temporaryPassword
      ? `\n\nYour Juego Todo account is ready:\nEmail: ${input.toEmail}\nTemporary password: ${input.temporaryPassword}\n\nSign in here:\n${input.loginUrl}\n\nYou will be asked to set a new password after sign-in.`
      : `\n\nSign in to your Juego Todo account (${input.toEmail}):\n${input.loginUrl}`;

  const claimLine = input.isMinor
    ? "\n\nThis is a youth athlete record. After signing in, open the link below and submit a guardian request with proof."
    : "\n\nAfter signing in, open the link below and accept the invitation to link your Latayanology record.";

  return queueEmail({
    toEmail: input.toEmail,
    subject: `Juego Todo — Your fighter account (${input.fighterName})`,
    body: `Hi there,\n\nJuego Todo set up access for the Latayanology fighter record for ${input.fighterName}.${passwordBlock}${claimLine}\n\nClaim / accept here:\n${input.acceptUrl}\n\nThis invite expires on ${new Date(input.expiresAt).toUTCString()}.\n\n— Juego Todo`,
    template: "fighter_claim_invite",
    metadata: {
      fighterName: input.fighterName,
      existingAccount: input.existingAccount,
      accountCreated: input.accountCreated,
      isMinor: input.isMinor,
    },
  });
}
