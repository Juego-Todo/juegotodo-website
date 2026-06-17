"use client";

import { ArrowRight, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { getOrderById } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import type { Order } from "@/lib/commerce/types";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/commerce/types";

export function OrderConfirmationPage({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    void getOrderById(orderId).then((result) => {
      setOrder(result ?? null);
    });
  }, [orderId]);

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

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-4xl py-10 sm:py-14">
        <PageNavigation currentLabel="Order Confirmed" />
        <div className="glass-panel mt-6 overflow-hidden rounded-[1.75rem]">
          <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(229,9,20,0.35),transparent_28rem),linear-gradient(135deg,#120305,#050506)] p-6 sm:p-8">
            <CheckCircle2 className="text-emerald-300" size={40} aria-hidden />
            <h1 className="font-display mt-4 text-5xl uppercase text-white sm:text-6xl">Order Confirmed</h1>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              Your order has been submitted. Complete payment using the reference below. An admin will verify
              and update your order status.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <InfoRow label="Order Number" value={order.orderNumber ?? order.id.slice(0, 8).toUpperCase()} />
            <InfoRow label="Order Status" value={orderStatusLabels[order.status]} />
            <InfoRow label="Payment Method" value={paymentMethodLabels[order.payment.method]} />
            <InfoRow label="Payment Status" value={paymentStatusLabels[order.payment.status]} />
            <InfoRow label="Transaction ID" value={order.payment.referenceNumber} />
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
