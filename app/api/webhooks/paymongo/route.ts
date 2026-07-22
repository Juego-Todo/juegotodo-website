import { NextResponse, type NextRequest } from "next/server";
import type { OrderPayment } from "@/lib/commerce/types";
import { verifyPayMongoWebhookSignature } from "@/lib/paymongo/client";
import { getPayMongoWebhookSecret } from "@/lib/paymongo/config";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type PayMongoWebhookEvent = {
  data?: {
    id?: string;
    attributes?: {
      type?: string;
      data?: {
        id?: string;
        attributes?: {
          metadata?: Record<string, string> | null;
          payments?: { id?: string }[] | null;
          payment_intent_id?: string | null;
          status?: string;
        };
      };
    };
  };
};

async function markOrderPaid(input: {
  orderId: string;
  paymongoPaymentId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };
  }

  const { data: orderRow, error: fetchError } = await supabase
    .from("orders")
    .select("id, user_id, order_number, status, payment")
    .eq("id", input.orderId)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }
  if (!orderRow) {
    return { ok: false, error: `Order ${input.orderId} not found.` };
  }

  const existingPayment = orderRow.payment as OrderPayment;

  // Idempotent — webhooks can be delivered more than once.
  if (existingPayment.status === "approved") {
    return { ok: true };
  }

  const now = new Date().toISOString();
  const payment: OrderPayment = {
    ...existingPayment,
    status: "approved",
    verifiedAt: now,
    provider: "paymongo",
    paymongoPaymentId: input.paymongoPaymentId ?? existingPayment.paymongoPaymentId,
  };

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "payment_received", payment })
    .eq("id", input.orderId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from("notifications").insert({
    user_id: orderRow.user_id,
    title: "Payment Confirmed",
    body: `Payment for order ${orderRow.order_number} was received via PayMongo. We're preparing your order.`,
  });

  return { ok: true };
}

export async function POST(request: NextRequest) {
  if (!getPayMongoWebhookSecret()) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");

  if (!verifyPayMongoWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: PayMongoWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayMongoWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventType = event.data?.attributes?.type ?? "";
  const resource = event.data?.attributes?.data;
  const metadata = resource?.attributes?.metadata ?? {};
  const orderId = metadata?.order_id;

  switch (eventType) {
    case "checkout_session.payment.paid": {
      if (!orderId) {
        // Not one of our sessions (e.g. a dashboard-created payment link).
        return NextResponse.json({ received: true, skipped: "no order_id metadata" });
      }
      const paymentId = resource?.attributes?.payments?.[0]?.id;
      const result = await markOrderPaid({ orderId, paymongoPaymentId: paymentId });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    case "payment.paid": {
      if (!orderId) {
        return NextResponse.json({ received: true, skipped: "no order_id metadata" });
      }
      const result = await markOrderPaid({ orderId, paymongoPaymentId: resource?.id });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    default:
      // Acknowledge everything else (payment.failed, source.chargeable, etc.)
      return NextResponse.json({ received: true, ignored: eventType });
  }
}
