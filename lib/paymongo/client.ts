// Server-only module — import exclusively from API routes / server code.
import { createHmac, timingSafeEqual } from "crypto";
import { getPayMongoSecretKey, getPayMongoWebhookSecret } from "@/lib/paymongo/config";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

/** PayMongo line item — `amount` is in centavos (₱1,999 → 199900). */
export type PayMongoLineItem = {
  name: string;
  amount: number;
  currency: "PHP";
  quantity: number;
  description?: string;
};

export type PayMongoPaymentMethodType =
  | "gcash"
  | "paymaya"
  | "card"
  | "dob"
  | "grab_pay"
  | "qrph";

export type PayMongoCheckoutSession = {
  id: string;
  checkoutUrl: string;
  paymentIntentId?: string;
};

function buildAuthHeader(): string {
  const secretKey = getPayMongoSecretKey();
  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is not configured.");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

async function payMongoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: buildAuthHeader(),
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15000),
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: unknown; errors?: { detail?: string; code?: string }[] }
    | null;

  if (!response.ok) {
    const detail = payload?.errors?.[0]?.detail ?? `PayMongo request failed (${response.status}).`;
    throw new Error(detail);
  }

  return payload as T;
}

export async function createPayMongoCheckoutSession(input: {
  lineItems: PayMongoLineItem[];
  paymentMethodTypes: PayMongoPaymentMethodType[];
  successUrl: string;
  cancelUrl: string;
  referenceNumber: string;
  description: string;
  metadata: Record<string, string>;
  billing?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}): Promise<PayMongoCheckoutSession> {
  type CheckoutSessionResponse = {
    data: {
      id: string;
      attributes: {
        checkout_url: string;
        payment_intent?: { id: string };
      };
    };
  };

  const payload = await payMongoRequest<CheckoutSessionResponse>("/checkout_sessions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: input.lineItems,
          payment_method_types: input.paymentMethodTypes,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          reference_number: input.referenceNumber,
          description: input.description,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          metadata: input.metadata,
          ...(input.billing ? { billing: input.billing } : {}),
        },
      },
    }),
  });

  return {
    id: payload.data.id,
    checkoutUrl: payload.data.attributes.checkout_url,
    paymentIntentId: payload.data.attributes.payment_intent?.id,
  };
}

/**
 * Verify the `Paymongo-Signature` webhook header.
 * Format: `t=<timestamp>,te=<test-mode signature>,li=<live-mode signature>`
 * Signature = HMAC-SHA256(`${t}.${rawBody}`, webhookSecret) as hex.
 */
export function verifyPayMongoWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const webhookSecret = getPayMongoWebhookSecret();
  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  const parts = new Map<string, string>();
  for (const segment of signatureHeader.split(",")) {
    const [key, value] = segment.split("=").map((entry) => entry.trim());
    if (key && value) {
      parts.set(key, value);
    }
  }

  const timestamp = parts.get("t");
  const testSignature = parts.get("te");
  const liveSignature = parts.get("li");

  if (!timestamp || (!testSignature && !liveSignature)) {
    return false;
  }

  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");

  for (const candidate of [liveSignature, testSignature]) {
    if (!candidate) {
      continue;
    }
    const candidateBuffer = Buffer.from(candidate, "utf8");
    if (
      candidateBuffer.length === expectedBuffer.length &&
      timingSafeEqual(candidateBuffer, expectedBuffer)
    ) {
      return true;
    }
  }

  return false;
}
