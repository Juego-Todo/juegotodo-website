"use client";

import {
  CheckCircle2,
  Package,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getShopProduct } from "@/data/shop";
import { getLiveShopProduct } from "@/lib/commerce/catalog-store";
import { formatCurrency } from "@/lib/commerce/pricing";
import {
  approveOrderPayment,
  getAllOrders,
  rejectOrderPayment,
  updateOrderStatus,
} from "@/lib/commerce/storage";
import {
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  type Order,
  type OrderStatus,
} from "@/lib/commerce/types";

type OrderFilter = "needs_action" | "awaiting_payment" | "fulfilling" | "shipped" | "delivered" | "all";

const fulfillmentSteps: { status: OrderStatus; label: string; detail: string }[] = [
  { status: "payment_received", label: "Paid", detail: "Payment confirmed" },
  { status: "processing", label: "Processing", detail: "Being prepared" },
  { status: "packed", label: "Packed", detail: "Ready to ship" },
  { status: "shipped", label: "Shipped", detail: "On the way" },
  { status: "delivered", label: "Delivered", detail: "Completed" },
];

function resolveProduct(slug: string) {
  return getLiveShopProduct(slug) ?? getShopProduct(slug);
}

function isEventTicketOrder(order: Order) {
  return order.items.some((item) => Boolean(resolveProduct(item.productSlug)?.eventTicket));
}

function needsPaymentAction(order: Order) {
  return order.payment.status === "pending" || order.payment.status === "awaiting_verification";
}

function isFulfilling(order: Order) {
  return (
    order.payment.status === "approved" &&
    (order.status === "payment_received" ||
      order.status === "processing" ||
      order.status === "packed")
  );
}

function matchesFilter(order: Order, filter: OrderFilter) {
  switch (filter) {
    case "needs_action":
      return needsPaymentAction(order) || isFulfilling(order);
    case "awaiting_payment":
      return needsPaymentAction(order);
    case "fulfilling":
      return isFulfilling(order);
    case "shipped":
      return order.status === "shipped";
    case "delivered":
      return order.status === "delivered";
    default:
      return true;
  }
}

function statusTone(status: OrderStatus) {
  if (status === "delivered") return "text-emerald-300";
  if (status === "cancelled") return "text-red-300";
  if (status === "shipped") return "text-sky-300";
  if (status === "packed" || status === "processing") return "text-amber-200";
  return "text-white";
}

function formatAddress(order: Order) {
  const address = order.shippingAddress;
  if (!address) return "No shipping address";
  return [address.line1, address.line2, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function nextFulfillmentAction(order: Order): { status: OrderStatus; label: string } | null {
  if (order.status === "cancelled" || order.status === "delivered") return null;
  if (needsPaymentAction(order)) return null;
  if (order.status === "payment_received" || order.status === "pending") {
    return { status: "processing", label: "Start Fulfillment" };
  }
  if (order.status === "processing") return { status: "packed", label: "Mark Packed" };
  if (order.status === "packed") return { status: "shipped", label: "Mark Shipped" };
  if (order.status === "shipped") return { status: "delivered", label: "Mark Delivered" };
  return null;
}

export function AdminStoreOrdersPanel({
  mode = "all",
  embedded = false,
}: {
  mode?: "all" | "tickets";
  embedded?: boolean;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("needs_action");
  const [query, setQuery] = useState("");
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  // Load via the browser Supabase session (same pattern as licenses/members).
  // Cookie-based /api/admin/* auth is flaky from the profile portal.
  const refreshOrders = useCallback(async () => {
    setError("");
    try {
      const nextOrders = await getAllOrders();
      setOrders(nextOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  async function runOrderAction(orderId: string, action: () => Promise<void>) {
    setBusyId(orderId);
    setError("");
    try {
      await action();
      await refreshOrders();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update order.");
    } finally {
      setBusyId(null);
    }
  }

  async function approvePayment(orderId: string) {
    await runOrderAction(orderId, async () => {
      await approveOrderPayment(orderId);
    });
  }

  async function rejectPayment(orderId: string) {
    await runOrderAction(orderId, async () => {
      await rejectOrderPayment(orderId);
    });
  }

  async function setStatus(orderId: string, status: OrderStatus, trackingNumber?: string) {
    await runOrderAction(orderId, async () => {
      await updateOrderStatus(orderId, status, trackingNumber);
    });
  }

  const scopedOrders = useMemo(
    () => (mode === "tickets" ? orders.filter(isEventTicketOrder) : orders),
    [mode, orders],
  );

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return scopedOrders.filter((order) => {
      if (!matchesFilter(order, filter)) return false;
      if (!normalized) return true;
      const haystack = [
        order.userName,
        order.userEmail,
        order.orderNumber,
        order.payment.referenceNumber,
        order.trackingNumber ?? "",
        ...order.items.map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [scopedOrders, filter, query]);

  const counts = useMemo(
    () => ({
      needs_action: scopedOrders.filter((order) => matchesFilter(order, "needs_action")).length,
      awaiting_payment: scopedOrders.filter((order) => matchesFilter(order, "awaiting_payment")).length,
      fulfilling: scopedOrders.filter((order) => matchesFilter(order, "fulfilling")).length,
      shipped: scopedOrders.filter((order) => matchesFilter(order, "shipped")).length,
      delivered: scopedOrders.filter((order) => matchesFilter(order, "delivered")).length,
      all: scopedOrders.length,
    }),
    [scopedOrders],
  );

  const title = mode === "tickets" ? "Event Tickets" : "Store Orders";
  const description =
    mode === "tickets"
      ? "Review ticket purchases from members, verify payment, and mark delivery complete."
      : "See every customer order, approve payment, and update fulfillment as items are packed and shipped.";

  const filters: { id: OrderFilter; label: string }[] = [
    { id: "needs_action", label: `Needs Action (${counts.needs_action})` },
    { id: "awaiting_payment", label: `Awaiting Payment (${counts.awaiting_payment})` },
    { id: "fulfilling", label: `Fulfilling (${counts.fulfilling})` },
    { id: "shipped", label: `Shipped (${counts.shipped})` },
    { id: "delivered", label: `Delivered (${counts.delivered})` },
    { id: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-300">Commerce</p>
          <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{description}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Total Orders</p>
          <p className="font-display mt-1 text-3xl text-white">{counts.all}</p>
        </div>
        <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Needs Action</p>
          <p className="font-display mt-1 text-3xl text-white">{counts.needs_action}</p>
        </div>
        <div className="rounded-[1.25rem] border border-sky-500/20 bg-sky-500/[0.06] px-4 py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200/70">In Fulfillment</p>
          <p className="font-display mt-1 text-3xl text-white">{counts.fulfilling}</p>
        </div>
        <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-4">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-emerald-200/70">Delivered</p>
          <p className="font-display mt-1 text-3xl text-white">{counts.delivered}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              className={`rounded-full px-3.5 py-2 text-[0.6rem] font-black uppercase tracking-[0.12em] transition ${
                filter === item.id
                  ? "bg-[#FF1010] text-white"
                  : "border border-white/10 text-zinc-400 hover:text-white"
              }`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={14}
            aria-hidden
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer, email, reference, product…"
            value={query}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          Loading orders…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 px-5 py-10 text-center text-sm text-zinc-400">
          {scopedOrders.length === 0
            ? mode === "tickets"
              ? "No ticket orders yet."
              : "No customer orders yet. New shop checkouts will appear here for payment approval and fulfillment."
            : "No orders match this filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const next = nextFulfillmentAction(order);
            const tracking = trackingDraft[order.id] ?? order.trackingNumber ?? "";
            const busy = busyId === order.id;

            return (
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5 sm:p-6" key={order.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                        {order.payment.referenceNumber}
                      </p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-zinc-500">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-white">{order.userName}</p>
                    <p className="text-sm text-zinc-400">{order.userEmail}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {paymentMethodLabels[order.payment.method]} · {formatCurrency(order.total)} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Fulfillment</p>
                    <p className={`mt-1 text-lg font-semibold ${statusTone(order.status)}`}>
                      {orderStatusLabels[order.status]}
                    </p>
                    <p className="mt-1 text-xs text-amber-200/90">
                      Payment: {paymentStatusLabels[order.payment.status]}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm text-zinc-300">
                  {order.items.map((item) => (
                    <li className="flex justify-between gap-3" key={`${order.id}-${item.productSlug}-${item.name}`}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 text-zinc-500">{formatCurrency(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-3 rounded-2xl border border-white/5 bg-black/20 p-3 text-sm text-zinc-400 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600">Ship To</p>
                    <p className="mt-1 text-zinc-300">{order.shippingAddress?.fullName || order.userName}</p>
                    <p className="mt-0.5">{formatAddress(order)}</p>
                    {order.shippingAddress?.phone ? <p className="mt-0.5">{order.shippingAddress.phone}</p> : null}
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600">Progress</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {fulfillmentSteps.map((step) => {
                        const reached =
                          fulfillmentSteps.findIndex((entry) => entry.status === order.status) >=
                          fulfillmentSteps.findIndex((entry) => entry.status === step.status);
                        const current = order.status === step.status;
                        return (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[0.55rem] font-black uppercase tracking-[0.1em] ${
                              current
                                ? "bg-[#FF1010] text-white"
                                : reached
                                  ? "border border-emerald-500/30 text-emerald-300"
                                  : "border border-white/10 text-zinc-600"
                            }`}
                            key={step.status}
                            title={step.detail}
                          >
                            {step.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                  <label className="block max-w-md">
                    <span className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-500">
                      Tracking number
                    </span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2"
                      onChange={(event) =>
                        setTrackingDraft((current) => ({ ...current, [order.id]: event.target.value }))
                      }
                      placeholder="Optional — add before marking shipped"
                      value={tracking}
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {needsPaymentAction(order) ? (
                      <>
                        <button
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
                          disabled={busy}
                          onClick={() => void approvePayment(order.id)}
                          type="button"
                        >
                          <CheckCircle2 size={14} aria-hidden />
                          Approve Payment
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                          disabled={busy}
                          onClick={() => void rejectPayment(order.id)}
                          type="button"
                        >
                          <XCircle size={14} aria-hidden />
                          Reject Payment
                        </button>
                      </>
                    ) : null}

                    {next ? (
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-[#FF1010] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a] disabled:opacity-60"
                        disabled={busy}
                        onClick={() => void setStatus(order.id, next.status, tracking)}
                        type="button"
                      >
                        {next.status === "shipped" ? (
                          <Truck size={14} aria-hidden />
                        ) : next.status === "delivered" ? (
                          <PackageCheck size={14} aria-hidden />
                        ) : (
                          <Package size={14} aria-hidden />
                        )}
                        {next.label}
                      </button>
                    ) : null}

                    {order.status !== "cancelled" && order.status !== "delivered" ? (
                      <button
                        className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white disabled:opacity-60"
                        disabled={busy}
                        onClick={() => void setStatus(order.id, "cancelled", tracking)}
                        type="button"
                      >
                        Cancel Order
                      </button>
                    ) : null}

                    {order.status === "shipped" || order.trackingNumber ? (
                      <button
                        className="rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-white disabled:opacity-60"
                        disabled={busy || !tracking.trim()}
                        onClick={() => void setStatus(order.id, order.status, tracking)}
                        type="button"
                      >
                        Save Tracking
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
