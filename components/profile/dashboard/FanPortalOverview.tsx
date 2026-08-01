"use client";

import { ArrowUpRight, CalendarDays, Heart, Package, Search, ShoppingBag, Ticket } from "lucide-react";
import Link from "next/link";
import { getShopProduct } from "@/data/shop";
import { events } from "@/data/site";
import type { LicenseApplication } from "@/data/license-applications";
import type { UserProfile } from "@/lib/auth/types";
import { getLiveShopProduct } from "@/lib/commerce/catalog-store";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";
import { orderStatusLabels, type Order } from "@/lib/commerce/types";

function resolveProduct(slug: string) {
  return getLiveShopProduct(slug) ?? getShopProduct(slug);
}

function isEventTicketOrder(order: Order) {
  return order.items.some((item) => Boolean(resolveProduct(item.productSlug)?.eventTicket));
}

const discoverLinks = [
  {
    href: "/latayanology",
    label: "Search Fighters",
    detail: "Browse the LATAYANOLOGY fighter database",
    icon: Search,
  },
  {
    href: "/events",
    label: "Events & Seminars",
    detail: "Upcoming fight cards and seminars",
    icon: CalendarDays,
  },
  {
    href: "/shop",
    label: "Official Shop",
    detail: "Gear, merch, and event tickets",
    icon: ShoppingBag,
  },
];

function FanPanelHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</h3>
      {href && linkLabel ? (
        <Link className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-200" href={href}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-red-500/30"
      href={`/orders/${order.id}/tracking`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {order.items.map((item) => item.name).join(", ")}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {new Date(order.createdAt).toLocaleDateString()} • {orderStatusLabels[order.status]}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-white">{formatCurrency(order.total)}</p>
    </Link>
  );
}

export function FanPortalOverview({
  user,
  licenseApplication,
}: {
  user: UserProfile;
  licenseApplication: LicenseApplication | null;
}) {
  const { userData, orders } = useCommerce();

  const ticketOrders = orders.filter(isEventTicketOrder);
  const recentOrders = orders.slice(0, 3);
  const savedEvents = events.filter((event) => userData.savedEvents.includes(event.slug));
  const firstName = user.fullName.trim().split(/\s+/)[0] || "Fan";
  const showLicenseCta = !licenseApplication || licenseApplication.status === "rejected";

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-200">Fan Account</p>
            <h2 className="font-display mt-2 text-3xl uppercase text-white sm:text-4xl">
              Welcome, {firstName}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Follow fighters, grab event tickets, and track your orders — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#FF1010] px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
              href="/events"
            >
              <CalendarDays size={14} aria-hidden />
              Browse Events
            </Link>
            {showLicenseCta ? (
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.14em] text-zinc-200 transition hover:border-red-500/40 hover:text-white"
                href="/register-for-license"
              >
                Apply for License
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
          <FanPanelHeader href="/orders" linkLabel="View All" title="My Tickets" />
          {ticketOrders.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <Ticket className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">No event tickets yet.</p>
              <Link
                className="mt-2 inline-block text-xs font-black uppercase tracking-[0.14em] text-red-200"
                href="/events"
              >
                Get Tickets
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ticketOrders.slice(0, 3).map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
          <FanPanelHeader href="/orders" linkLabel="Order History" title="My Orders" />
          {recentOrders.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <Package className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">No orders placed yet.</p>
              <Link
                className="mt-2 inline-block text-xs font-black uppercase tracking-[0.14em] text-red-200"
                href="/shop"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
        <FanPanelHeader href="/calendar" linkLabel="View Calendar" title="Saved Events" />
        {savedEvents.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
            <Heart className="mx-auto text-zinc-600" size={22} aria-hidden />
            <p className="mt-2 text-sm text-zinc-500">Save events to keep track of fight night.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {savedEvents.map((event) => (
              <Link
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-red-500/30"
                href={`/events/${event.slug}`}
                key={event.slug}
              >
                <p className="text-sm font-semibold text-white">{event.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {event.date} • {event.venue}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">Discover</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {discoverLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                className="group rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:border-red-500/30"
                href={link.href}
                key={link.href}
              >
                <div className="flex items-center justify-between">
                  <Icon className="text-red-200" size={18} aria-hidden />
                  <ArrowUpRight className="text-zinc-600 transition group-hover:text-red-200" size={14} aria-hidden />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-white">{link.label}</p>
                <p className="mt-1 text-xs text-zinc-500">{link.detail}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
