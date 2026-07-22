"use client";

import { ArrowRight, CheckCircle2, Clock3, Copy, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { getOrderById } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import type { Order } from "@/lib/commerce/types";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/commerce/types";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

export function OrderConfirmationPage({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [returnState] = useState<"paid" | "cancelled" | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      return "paid";
    }
    if (params.get("cancelled") === "1") {
      return "cancelled";
    }
    return null;
  });
  const pollCount = useRef(0);

  useEffect(() => {
    void getOrderById(orderId).then((result) => {
      setOrder(result ?? null);
    });
  }, [orderId]);

  // After returning from PayMongo, poll briefly until the webhook confirms payment.
  useEffect(() => {
    if (returnState !== "paid" || !order || order.payment.status === "approved") {
      return;
    }
    if (pollCount.current >= MAX_POLLS) {
      return;
    }

    const timer = window.setTimeout(() => {
      pollCount.current += 1;
      void getOrderById(orderId).then((result) => {
        if (result) {
          setOrder(result);
        }
      });
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [returnState, order, orderId]);

  async function copyReference() {
    if (!order) {
      return;
    }
    await navigator.clipboard.writeText(order.payment.referenceNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (order === undefined) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Order not found.</p>
      </main>
    );
  }

  const paid = order.payment.status === "approved";
  const isPayMongo = order.payment.provider === "paymongo";
  const confirmingPayment = returnState === "paid" && !paid && isPayMongo;
  const cancelledPayment = returnState === "cancelled" && !paid;

  const heading = paid ? "Payment Confirmed" : "Order Confirmed";
  const subcopy = paid
    ? "Your payment has been received. We're preparing your order — track its status from your profile."
    : confirmingPayment
      ? "Thanks for paying via PayMongo. We're confirming your payment — this usually takes a few seconds."
      : isPayMongo
        ? "Your order has been created. Complete payment through PayMongo to confirm it."
        : "Your order has been submitted. Complete payment using the reference below. An admin will verify and update your order status.";

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-4xl py-10 sm:py-14">
        <PageNavigation currentLabel={heading} />
        <div className="glass-panel mt-6 overflow-hidden rounded-[1.75rem]">
          <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(229,9,20,0.35),transparent_28rem),linear-gradient(135deg,#120305,#050506)] p-6 sm:p-8">
            {paid ? (
              <CheckCircle2 className="text-emerald-300" size={40} aria-hidden />
            ) : confirmingPayment ? (
              <Clock3 className="text-amber-300" size={40} aria-hidden />
            ) : (
              <CheckCircle2 className="text-emerald-300" size={40} aria-hidden />
            )}
            <h1 className="font-display mt-4 text-5xl uppercase text-white sm:text-6xl">{heading}</h1>
            <p className="mt-4 text-sm leading-7 text-zinc-300">{subcopy}</p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            {cancelledPayment && order.payment.checkoutUrl ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="mt-0.5 shrink-0 text-amber-300" size={18} aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-amber-200">Payment not completed</p>
                    <p className="mt-1 text-sm text-amber-100/80">
                      Your order is saved but unpaid. You can complete payment any time using the button
                      below.
                    </p>
                    <a
                      className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-amber-400 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-amber-300"
                      href={order.payment.checkoutUrl}
                    >
                      Complete Payment
                      <ArrowRight className="ml-2" size={14} aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            <InfoRow label="Order Number" value={order.orderNumber ?? order.id.slice(0, 8).toUpperCase()} />
            <InfoRow label="Order Status" value={orderStatusLabels[order.status]} />
            <InfoRow label="Payment Method" value={paymentMethodLabels[order.payment.method]} />
            <InfoRow
              label="Payment Status"
              value={confirmingPayment ? "Confirming..." : paymentStatusLabels[order.payment.status]}
            />
            <InfoRow label="Transaction ID" value={order.payment.paymongoPaymentId ?? order.payment.referenceNumber} />
            <InfoRow label="Total" value={formatCurrency(order.total)} />

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Reference Number</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="font-display text-2xl uppercase tracking-[0.08em] text-white sm:text-3xl">
                  {order.payment.referenceNumber}
                </p>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
                  onClick={copyReference}
                  type="button"
                >
                  <Copy size={14} aria-hidden />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
                href="/profile?tab=orders"
              >
                View In Profile
              </Link>
              <Link
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                href="/shop"
              >
                Continue Shopping
                <ArrowRight className="ml-2" size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
