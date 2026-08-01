import { NextResponse } from "next/server";
import { requireAdminServiceClient } from "@/lib/auth/admin-route";
import { mapOrder } from "@/lib/commerce/supabase";
import type { OrderPayment, OrderStatus, PaymentStatus } from "@/lib/commerce/types";
import { orderStatusLabels } from "@/lib/commerce/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OrderRow } from "@/lib/supabase/types";

const allowedStatuses: OrderStatus[] = [
  "pending",
  "payment_received",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const { data, error } = await admin.serviceClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: ((data ?? []) as OrderRow[]).map(mapOrder),
  });
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = await requireAdminServiceClient(request);
  if ("response" in admin) {
    return admin.response;
  }

  const body = (await request.json()) as {
    orderId?: string;
    action?: "approve_payment" | "reject_payment" | "set_status";
    status?: OrderStatus;
    trackingNumber?: string;
  };

  if (!body.orderId || !body.action) {
    return NextResponse.json({ error: "orderId and action are required." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await admin.serviceClient
    .from("orders")
    .select("*")
    .eq("id", body.orderId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const current = mapOrder(existing as OrderRow);
  const now = new Date().toISOString();
  let nextStatus: OrderStatus = current.status;
  let nextPayment: OrderPayment = { ...current.payment };
  let trackingNumber = body.trackingNumber?.trim() || current.trackingNumber || null;
  let notificationTitle = "Order Updated";
  let notificationBody = `Order ${current.payment.referenceNumber} was updated.`;

  if (body.action === "approve_payment") {
    nextPayment = {
      ...current.payment,
      status: "approved" as PaymentStatus,
      verifiedAt: now,
    };
    nextStatus = "payment_received";
    notificationTitle = "Payment Approved";
    notificationBody = `Payment for order ${current.payment.referenceNumber} was approved. Your order is being prepared.`;
  } else if (body.action === "reject_payment") {
    nextPayment = {
      ...current.payment,
      status: "rejected" as PaymentStatus,
      verifiedAt: now,
    };
    nextStatus = "cancelled";
    notificationTitle = "Payment Rejected";
    notificationBody = `Payment for order ${current.payment.referenceNumber} was rejected. The order was cancelled.`;
  } else if (body.action === "set_status") {
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "A valid status is required." }, { status: 400 });
    }
    nextStatus = body.status;
    notificationTitle = "Order Status Updated";
    notificationBody = `Order ${current.payment.referenceNumber} is now ${orderStatusLabels[body.status]}.`;
    if (body.status === "shipped" && trackingNumber) {
      notificationBody += ` Tracking: ${trackingNumber}.`;
    }
  }

  const { data, error } = await admin.serviceClient
    .from("orders")
    .update({
      status: nextStatus,
      payment: nextPayment,
      tracking_number: trackingNumber,
      updated_at: now,
    })
    .eq("id", body.orderId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.serviceClient.from("notifications").insert({
    user_id: current.userId,
    title: notificationTitle,
    body: notificationBody,
    read: false,
  });

  return NextResponse.json({ order: mapOrder(data as OrderRow) });
}
