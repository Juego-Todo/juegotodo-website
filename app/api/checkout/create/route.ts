import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { calculateLineItems, generatePaymentReference } from "@/lib/commerce/pricing";
import type { CartItem, MembershipTier, OrderPayment, PaymentMethod, ShippingAddress } from "@/lib/commerce/types";
import type { AccountType } from "@/lib/auth/types";
import {
  createPayMongoCheckoutSession,
  type PayMongoLineItem,
  type PayMongoPaymentMethodType,
} from "@/lib/paymongo/client";
import { getSiteUrl, isPayMongoConfigured } from "@/lib/paymongo/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAYMENT_METHOD_MAP: Partial<Record<PaymentMethod, PayMongoPaymentMethodType[]>> = {
  gcash: ["gcash"],
  maya: ["paymaya"],
  credit_card: ["card"],
  bank_transfer: ["dob"],
};

type CheckoutRequestBody = {
  cart?: CartItem[];
  address?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
};

export async function POST(request: NextRequest) {
  // When Supabase or PayMongo is not configured, tell the client to use the
  // existing local/manual order flow instead of failing.
  if (!isSupabaseConfigured() || !isPayMongoConfigured()) {
    return NextResponse.json({ configured: false });
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { cart, address, paymentMethod, promoCode } = body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!address?.line1 || !address.fullName) {
    return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
  }
  if (!paymentMethod || !PAYMENT_METHOD_MAP[paymentMethod]) {
    return NextResponse.json(
      { error: "This payment method is verified manually.", configured: false },
      { status: 200 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to check out." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, account_type, membership_tier, phone")
    .eq("id", user.id)
    .maybeSingle();

  const accountType = (profile?.account_type ?? "fan") as AccountType;
  const membershipTier = (profile?.membership_tier ?? "free") as MembershipTier;
  const userEmail = profile?.email ?? user.email ?? "";
  const userName = profile?.full_name ?? userEmail;

  // Server-side re-pricing — never trust client totals.
  const totals = calculateLineItems(cart, { accountType, membershipTier, promoCode });

  if (totals.items.length === 0) {
    return NextResponse.json({ error: "Cart items are no longer available." }, { status: 400 });
  }

  const orderId = randomUUID();
  const orderNumber = `JT-ORD-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const siteUrl = getSiteUrl();

  // Build PayMongo line items (amounts in centavos). When a promo discount is
  // applied we consolidate into one line so totals always match exactly.
  const lineItems: PayMongoLineItem[] =
    totals.promoDiscount > 0
      ? [
          {
            name: `Juego Todo Order ${orderNumber}`,
            amount: totals.total * 100,
            currency: "PHP",
            quantity: 1,
            description: `${totals.itemCount} item(s) incl. shipping, VAT, and promo discount`,
          },
        ]
      : [
          ...totals.items.map((item) => ({
            name: item.name.slice(0, 250),
            amount: item.unitPrice * 100,
            currency: "PHP" as const,
            quantity: item.quantity,
          })),
          ...(totals.shipping > 0
            ? [{ name: "Shipping", amount: totals.shipping * 100, currency: "PHP" as const, quantity: 1 }]
            : []),
          ...(totals.tax > 0
            ? [{ name: "VAT (12%)", amount: totals.tax * 100, currency: "PHP" as const, quantity: 1 }]
            : []),
        ];

  let session;
  try {
    session = await createPayMongoCheckoutSession({
      lineItems,
      paymentMethodTypes: PAYMENT_METHOD_MAP[paymentMethod] ?? ["gcash"],
      successUrl: `${siteUrl}/checkout/confirmation/${orderId}?paid=1`,
      cancelUrl: `${siteUrl}/checkout/confirmation/${orderId}?cancelled=1`,
      referenceNumber: orderNumber,
      description: `Juego Todo order ${orderNumber}`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        user_id: user.id,
      },
      billing: {
        name: userName,
        email: userEmail,
        phone: profile?.phone || address.phone || undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start PayMongo checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const payment: OrderPayment = {
    method: paymentMethod,
    status: "pending",
    referenceNumber: generatePaymentReference(paymentMethod),
    amount: totals.total,
    createdAt: now,
    provider: "paymongo",
    paymongoCheckoutSessionId: session.id,
    checkoutUrl: session.checkoutUrl,
  };

  const { error: insertError } = await supabase.from("orders").insert({
    id: orderId,
    order_number: orderNumber,
    user_id: user.id,
    user_email: userEmail,
    user_name: userName,
    items: totals.items.map((item) => ({
      productSlug: item.productSlug,
      name: item.name,
      category: item.category,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: totals.subtotal,
    discount: totals.promoDiscount,
    promo_code: totals.promoCode ?? null,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    status: "pending",
    payment,
    shipping_address: address,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Order Placed",
    body: `Order ${orderNumber} created — complete payment via PayMongo to confirm.`,
  });

  return NextResponse.json({
    configured: true,
    orderId,
    orderNumber,
    checkoutUrl: session.checkoutUrl,
  });
}
