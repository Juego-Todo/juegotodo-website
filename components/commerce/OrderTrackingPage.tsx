"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { getOrderById } from "@/lib/commerce/storage";
import type { Order } from "@/lib/commerce/types";
import { orderStatusLabels, paymentStatusLabels } from "@/lib/commerce/types";

export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    void getOrderById(orderId).then((result) => {
      setOrder(result ?? null);
    });
  }, [orderId]);

  if (order === undefined) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading tracking...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm text-zinc-400">Order not found.</p>
      </main>
    );
  }

  const steps = ["pending", "payment_received", "processing", "packed", "shipped", "delivered"] as const;
  const currentIndex = steps.indexOf(order.status as (typeof steps)[number]);

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-4xl py-10 sm:py-14">
        <PageNavigation currentLabel="Order Tracking" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white">Order Tracking</h1>
        <p className="mt-3 text-sm text-zinc-400">{order.orderNumber ?? order.payment.referenceNumber}</p>

        <div className="glass-panel mt-8 rounded-[1.75rem] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Payment Status</p>
          <p className="mt-2 font-semibold text-white">{paymentStatusLabels[order.payment.status]}</p>
          {order.trackingNumber ? (
            <p className="mt-4 text-sm text-zinc-400">Tracking Number: {order.trackingNumber}</p>
          ) : null}

          <ol className="mt-8 space-y-4">
            {steps.map((step, index) => {
              const active = index <= currentIndex;
              return (
                <li className="flex items-center gap-4" key={step}>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                      active ? "bg-red-600 text-white" : "border border-white/10 text-zinc-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={active ? "font-semibold text-white" : "text-zinc-500"}>
                    {orderStatusLabels[step]}
                  </span>
                </li>
              );
            })}
          </ol>

          <Link
            className="mt-8 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200"
            href={`/orders/${order.id}/invoice`}
          >
            View Invoice
          </Link>
        </div>
      </section>
    </main>
  );
}
