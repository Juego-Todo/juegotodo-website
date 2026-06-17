"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { getOrderById } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import type { Order } from "@/lib/commerce/types";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/commerce/types";

export function OrderInvoicePage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrderById(orderId) ?? null);
  }, [orderId]);

  if (order === undefined) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading invoice...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm text-zinc-400">Invoice not found.</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-4xl py-10 sm:py-14">
        <PageNavigation currentLabel="Invoice" />
        <div className="glass-panel mt-6 rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Juego Todo Invoice</p>
              <h1 className="font-display mt-2 text-4xl uppercase text-white">Order Invoice</h1>
            </div>
            <div className="text-right text-sm text-zinc-400">
              <p>{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}</p>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Bill To</p>
              <p className="mt-2 font-semibold text-white">{order.userName}</p>
              <p className="text-sm text-zinc-400">{order.userEmail}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Payment</p>
              <p className="mt-2 text-sm text-zinc-300">{paymentMethodLabels[order.payment.method]}</p>
              <p className="text-sm text-zinc-400">{order.payment.referenceNumber}</p>
              <p className="text-sm text-amber-300">{paymentStatusLabels[order.payment.status]}</p>
            </div>
          </div>

          <table className="mt-8 w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="py-3">Item</th>
                <th className="py-3">Qty</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr className="border-b border-white/[0.06]" key={item.productSlug}>
                  <td className="py-3 text-zinc-300">{item.name}</td>
                  <td className="py-3 text-zinc-400">{item.quantity}</td>
                  <td className="py-3 text-right text-white">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-emerald-300"><dt>Discount</dt><dd>-{formatCurrency(order.discount)}</dd></div>
            ) : null}
            <div className="flex justify-between text-zinc-400"><dt>Shipping</dt><dd>{formatCurrency(order.shipping)}</dd></div>
            <div className="flex justify-between text-zinc-400"><dt>Tax</dt><dd>{formatCurrency(order.tax)}</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-white">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl">{formatCurrency(order.total)}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-zinc-500">Order Status: {orderStatusLabels[order.status]}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="text-xs font-black uppercase tracking-[0.16em] text-red-200" href={`/orders/${order.id}/tracking`}>
              View Tracking
            </Link>
            <Link className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400" href="/orders">
              All Orders
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
