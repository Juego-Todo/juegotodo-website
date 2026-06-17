"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/commerce/types";

export function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders } = useCommerce();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/orders");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-5xl py-10 sm:py-14">
        <PageNavigation currentLabel="Order History" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Order History</h1>
        <p className="mt-4 text-sm text-zinc-400">Track payments, shipping status, and invoices for your JTGC gear orders.</p>

        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <div className="glass-panel rounded-[1.75rem] p-8 text-center">
              <p className="text-sm text-zinc-400">No orders yet.</p>
              <Link className="mt-4 inline-flex text-xs font-black uppercase tracking-[0.16em] text-red-200" href="/shop">
                Browse Shop
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6" key={order.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                      {order.orderNumber ?? order.payment.referenceNumber}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {paymentMethodLabels[order.payment.method]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-white">{formatCurrency(order.total)}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{orderStatusLabels[order.status]}</p>
                    <p className="text-xs text-amber-300">{paymentStatusLabels[order.payment.status]}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 hover:border-red-500/40"
                    href={`/orders/${order.id}/tracking`}
                  >
                    Tracking
                  </Link>
                  <Link
                    className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 hover:border-red-500/40"
                    href={`/orders/${order.id}/invoice`}
                  >
                    Invoice
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
