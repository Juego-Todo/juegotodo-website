"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalShell";
import { useCommerce } from "@/lib/commerce/context";
import { getShopProduct } from "@/data/shop";
import { getAllOrders } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  type Order,
  type OrderStatus,
} from "@/lib/commerce/types";

const statusFlow: OrderStatus[] = [
  "pending",
  "payment_received",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

function isEventTicketOrder(order: Order) {
  return order.items.some((item) => Boolean(getShopProduct(item.productSlug)?.eventTicket));
}

export function AdminStoreOrdersPanel({
  mode = "all",
}: {
  mode?: "all" | "tickets";
}) {
  const { adminApprovePayment, adminUpdateOrderStatus } = useCommerce();
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});

  function refreshOrders() {
    void getAllOrders().then((nextOrders) => {
      setOrders(nextOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  }

  useEffect(() => {
    refreshOrders();
  }, []);

  const visibleOrders = useMemo(
    () => (mode === "tickets" ? orders.filter(isEventTicketOrder) : orders),
    [mode, orders],
  );

  const title = mode === "tickets" ? "Event Tickets" : "Store Orders";
  const description =
    mode === "tickets"
      ? "Review digital event ticket purchases, payment verification, and delivery status."
      : "Review shop orders, approve payments, and update fulfillment status.";
  const emptyLabel = mode === "tickets" ? "No ticket orders yet." : "No orders yet.";

  return (
    <div className="space-y-6">
      <AdminPortalHeader description={description} tag="Commerce" title={title} />

      {visibleOrders.length === 0 ? (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">{emptyLabel}</div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <div className="glass-panel rounded-[1.5rem] p-5 sm:p-6" key={order.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    {order.payment.referenceNumber}
                  </p>
                  <p className="mt-1 font-semibold text-white">{order.userName}</p>
                  <p className="text-sm text-zinc-400">{order.userEmail}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {paymentMethodLabels[order.payment.method]} • {formatCurrency(order.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Status</p>
                  <p className="font-semibold text-white">{orderStatusLabels[order.status]}</p>
                  <p className="mt-1 text-xs text-amber-300">
                    Payment: {paymentStatusLabels[order.payment.status]}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-zinc-400">
                {order.items.map((item) => (
                  <li key={item.productSlug}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.payment.status === "awaiting_verification" || order.payment.status === "pending" ? (
                  <button
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white"
                    onClick={() => {
                      adminApprovePayment(order.id);
                      refreshOrders();
                    }}
                    type="button"
                  >
                    Approve Payment
                  </button>
                ) : null}
                {statusFlow.map((status) => (
                  <button
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-red-500/40"
                    key={status}
                    onClick={() => {
                      adminUpdateOrderStatus(order.id, status, trackingDraft[order.id] || order.trackingNumber);
                      refreshOrders();
                    }}
                    type="button"
                  >
                    {orderStatusLabels[status]}
                  </button>
                ))}
              </div>

              <input
                className="mt-3 w-full max-w-sm rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                onChange={(event) =>
                  setTrackingDraft((current) => ({ ...current, [order.id]: event.target.value }))
                }
                placeholder="Tracking number (optional)"
                value={trackingDraft[order.id] ?? order.trackingNumber ?? ""}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
