"use client";

import { useEffect, useMemo, useState } from "react";
import { PageNavigation } from "@/components/PageNavigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { shopProducts } from "@/data/shop";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getAllOrders, isAdminProfile } from "@/lib/commerce/storage";
import { formatCurrency } from "@/lib/commerce/pricing";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels, type Order, type OrderStatus } from "@/lib/commerce/types";
import type { LicenseApplication } from "@/data/license-applications";
import { AdminAccountTagEditor } from "@/components/profile/AdminAccountTagEditor";
import { fetchAllLicenseApplications } from "@/lib/licenses/storage";
import { getAdminAssignedTags } from "@/lib/profile/account-tags";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AdminTab = "orders" | "payments" | "products" | "customers";

const statusFlow: OrderStatus[] = [
  "pending",
  "payment_received",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

export function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { adminApprovePayment, adminUpdateOrderStatus } = useCommerce();
  const [tab, setTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<LicenseApplication[]>([]);
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});

  const isAdmin = user ? isAdminProfile(user) : false;

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/login?next=/admin");
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    void getAllOrders().then((nextOrders) => {
      setOrders(nextOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    if (tab === "customers") {
      void fetchAllLicenseApplications().then(setLicenses);
    }
  }, [tab]);

  const customers = useMemo(() => {
    const map = new Map<string, { userId: string; email: string; name: string; orders: number; spent: number }>();
    orders.forEach((order) => {
      const existing = map.get(order.userId);
      if (existing) {
        existing.orders += 1;
        existing.spent += order.total;
      } else {
        map.set(order.userId, {
          userId: order.userId,
          email: order.userEmail,
          name: order.userName,
          orders: 1,
          spent: order.total,
        });
      }
    });

    licenses.forEach((application) => {
      if (map.has(application.userId)) {
        return;
      }

      map.set(application.userId, {
        userId: application.userId,
        email: application.userEmail,
        name: application.fullName,
        orders: 0,
        spent: 0,
      });
    });

    return [...map.values()];
  }, [orders, licenses]);

  function refreshOrders() {
    void getAllOrders().then((nextOrders) => {
      setOrders(nextOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  }

  if (!user || !isAdmin) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading admin..."
        redirectHref="/login?next=/admin"
        user={user && isAdmin ? user : null}
      />
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <PageNavigation currentLabel="Admin Dashboard" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Commerce Admin</h1>
        <p className="mt-3 text-sm text-zinc-400">Manage orders, payments, products, customers, licenses, and inventory.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["orders", "Orders"],
              ["payments", "Payments"],
              ["products", "Products"],
              ["customers", "Customers"],
            ] as const
          ).map(([value, label]) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                tab === value ? "bg-red-600 text-white" : "border border-white/10 text-zinc-300"
              }`}
              key={value}
              onClick={() => setTab(value)}
              type="button"
            >
              {label}
            </button>
          ))}
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-500/40 hover:text-white"
            href="/admin/members"
          >
            Member Directory →
          </Link>
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-500/40 hover:text-white"
            href="/admin/store-orders"
          >
            Store Orders →
          </Link>
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-500/40 hover:text-white"
            href="/profile?tab=membership&view=approvals"
          >
            License Approvals →
          </Link>
        </div>

        {tab === "orders" || tab === "payments" ? (
          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">No orders yet.</div>
            ) : (
              orders.map((order) => (
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
                          adminUpdateOrderStatus(
                            order.id,
                            status,
                            trackingDraft[order.id] || order.trackingNumber,
                          );
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
              ))
            )}
          </div>
        ) : null}

        {tab === "products" ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shopProducts.map((product) => (
              <div className="glass-panel rounded-[1.5rem] p-5" key={product.slug}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">{product.category}</p>
                <p className="font-display mt-2 text-2xl uppercase text-white">{product.name}</p>
                <p className="mt-2 text-sm text-zinc-400">{formatCurrency(product.priceAmount)}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Inventory: {product.digital ? "Digital" : `${product.stock} units`}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "customers" ? (
          <div className="mt-8 space-y-3">
            {customers.length === 0 ? (
              <div className="glass-panel rounded-[1.75rem] p-8 text-center text-zinc-400">No customers yet.</div>
            ) : (
              customers.map((customer) => (
                <div className="glass-panel rounded-[1.25rem] p-4" key={customer.userId}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{customer.name}</p>
                      <p className="text-sm text-zinc-400">{customer.email}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-400">
                      <p>{customer.orders} orders</p>
                      <p>{formatCurrency(customer.spent)} lifetime</p>
                    </div>
                  </div>
                  <AdminAccountTagEditor
                    initialTags={getAdminAssignedTags(customer.userId)}
                    userId={customer.userId}
                  />
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
