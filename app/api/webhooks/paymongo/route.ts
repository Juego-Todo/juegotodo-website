import { NextResponse, type NextRequest } from "next/server";
import type { OrderPayment } from "@/lib/commerce/types";
import { PRO_CHECKOUT_TYPE } from "@/data/pro-membership";
import { verifyPayMongoWebhookSignature } from "@/lib/paymongo/client";
import { getPayMongoWebhookSecret } from "@/lib/paymongo/config";
import { activateProMembership } from "@/lib/pro/service";
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
}): Promise<{ ok: boolean; error?: string; userId?: string; isProCheckout?: boolean }> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };
  }

  const { data: orderRow, error: fetchError } = await supabase
    .from("orders")
    .select("id, user_id, order_number, status, payment, items")
    .eq("id", input.orderId)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }
  if (!orderRow) {
    return { ok: false, error: `Order ${input.orderId} not found.` };
  }

  const existingPayment = orderRow.payment as OrderPayment;
  const items = (orderRow.items as { productSlug?: string }[] | null) ?? [];
  const isProCheckout =
    items.some((item) => item.productSlug === "juegotodo-pro") ||
    String(orderRow.order_number ?? "").startsWith("JT-PRO-");

  // Idempotent — webhooks can be delivered more than once.
  if (existingPayment.status === "approved") {
    if (isProCheckout) {
      const activated = await activateProMembership({
        userId: orderRow.user_id,
        orderId: input.orderId,
        provider: "paymongo",
        paymentStatus: "paid",
        extendFromExisting: true,
      });
      if (!activated.ok) {
        return { ok: false, error: activated.error };
      }
    }
    return { ok: true, userId: orderRow.user_id, isProCheckout };
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

  if (isProCheckout) {
    const activated = await activateProMembership({
      userId: orderRow.user_id,
      orderId: input.orderId,
      provider: "paymongo",
      paymentStatus: "paid",
      extendFromExisting: true,
    });
    if (!activated.ok) {
      return { ok: false, error: activated.error };
    }
  } else {
    await supabase.from("notifications").insert({
      user_id: orderRow.user_id,
      title: "Payment Confirmed",
      body: `Payment for order ${orderRow.order_number} was received via PayMongo. We're preparing your order.`,
    });
  }

  return { ok: true, userId: orderRow.user_id, isProCheckout };
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
  const checkoutType = metadata?.type;

  switch (eventType) {
    case "checkout_session.payment.paid":
    case "payment.paid": {
      if (!orderId) {
        return NextResponse.json({ received: true, skipped: "no order_id metadata" });
      }
      const paymentId =
        eventType === "payment.paid"
          ? resource?.id
          : resource?.attributes?.payments?.[0]?.id;
      const result = await markOrderPaid({ orderId, paymongoPaymentId: paymentId });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      // Metadata type is authoritative when present; order items are the fallback.
      if (checkoutType === PRO_CHECKOUT_TYPE && !result.isProCheckout && result.userId) {
        const activated = await activateProMembership({
          userId: result.userId,
          orderId,
          provider: "paymongo",
          paymentStatus: "paid",
          extendFromExisting: true,
        });
        if (!activated.ok) {
          return NextResponse.json({ error: activated.error }, { status: 500 });
        }
      }

      return NextResponse.json({ received: true, pro: Boolean(result.isProCheckout) });
    }

    default:
      return NextResponse.json({ received: true, ignored: eventType });
  }
}
