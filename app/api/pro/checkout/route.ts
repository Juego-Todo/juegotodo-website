import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  PRO_ANNUAL_PRICE_PHP,
  PRO_CHECKOUT_TYPE,
  PRO_PRODUCT_DESCRIPTION,
  PRO_PRODUCT_NAME,
} from "@/data/pro-membership";
import type { OrderPayment } from "@/lib/commerce/types";
import { generatePaymentReference } from "@/lib/commerce/pricing";
import { requireAuthenticatedUser } from "@/lib/membership/auth";
import {
  createPayMongoCheckoutSession,
  type PayMongoPaymentMethodType,
} from "@/lib/paymongo/client";
import { getSiteUrl, isPayMongoConfigured } from "@/lib/paymongo/config";
import { hasActiveProMembership } from "@/lib/pro/entitlement";
import { markProMembershipPending } from "@/lib/pro/service";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const DEFAULT_METHODS: PayMongoPaymentMethodType[] = ["gcash", "paymaya", "card", "qrph"];

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  if (!isPayMongoConfigured()) {
    return NextResponse.json(
      { error: "PayMongo is not configured. Contact support to activate Pro." },
      { status: 503 },
    );
  }

  const service = createSupabaseServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Server payment processing is unavailable." },
      { status: 503 },
    );
  }

  const { data: existingPro } = await service
    .from("pro_memberships")
    .select("status, expires_at")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (hasActiveProMembership(existingPro)) {
    return NextResponse.json(
      { error: "You already have an active JuegoTodo Pro membership.", redirectTo: "/pro" },
      { status: 409 },
    );
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", auth.user.id)
    .maybeSingle();

  const userEmail = profile?.email ?? auth.user.email ?? "";
  const userName = profile?.full_name ?? userEmail;
  const orderId = randomUUID();
  const orderNumber = `JT-PRO-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const siteUrl = getSiteUrl();
  const amountPhp = PRO_ANNUAL_PRICE_PHP;

  let session;
  try {
    session = await createPayMongoCheckoutSession({
      lineItems: [
        {
          name: PRO_PRODUCT_NAME,
          amount: amountPhp * 100,
          currency: "PHP",
          quantity: 1,
          description: PRO_PRODUCT_DESCRIPTION,
        },
      ],
      paymentMethodTypes: DEFAULT_METHODS,
      successUrl: `${siteUrl}/pro?paid=1&order=${orderId}`,
      cancelUrl: `${siteUrl}/pro?cancelled=1&order=${orderId}`,
      referenceNumber: orderNumber,
      description: `${PRO_PRODUCT_NAME} annual membership`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        user_id: auth.user.id,
        type: PRO_CHECKOUT_TYPE,
      },
      billing: {
        name: userName,
        email: userEmail,
        phone: profile?.phone || undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start PayMongo checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const payment: OrderPayment = {
    method: "gcash",
    status: "pending",
    referenceNumber: generatePaymentReference("gcash"),
    amount: amountPhp,
    createdAt: now,
    provider: "paymongo",
    paymongoCheckoutSessionId: session.id,
    checkoutUrl: session.checkoutUrl,
  };

  const { error: insertError } = await service.from("orders").insert({
    id: orderId,
    order_number: orderNumber,
    user_id: auth.user.id,
    user_email: userEmail,
    user_name: userName,
    items: [
      {
        productSlug: "juegotodo-pro",
        name: PRO_PRODUCT_NAME,
        category: "membership",
        unitPrice: amountPhp,
        quantity: 1,
        lineTotal: amountPhp,
      },
    ],
    subtotal: amountPhp,
    discount: 0,
    promo_code: null,
    shipping: 0,
    tax: 0,
    total: amountPhp,
    status: "pending",
    payment,
    shipping_address: {
      fullName: userName,
      line1: "Digital — JuegoTodo Pro",
      city: "N/A",
      province: "N/A",
      postalCode: "0000",
      phone: profile?.phone || "",
    },
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await markProMembershipPending({ userId: auth.user.id, orderId });

  return NextResponse.json({
    configured: true,
    orderId,
    orderNumber,
    checkoutUrl: session.checkoutUrl,
  });
}
