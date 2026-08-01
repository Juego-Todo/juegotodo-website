"use client";

import { FileText, Heart, Package, Ticket } from "lucide-react";
import Link from "next/link";
import {
  licenseApplicationStatusLabels,
  resolveApplicationProgram,
  resolveLicenseApplicationHref,
  type LicenseApplication,
} from "@/data/license-applications";
import { getShopProduct } from "@/data/shop";
import { events } from "@/data/site";
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

function programLabel(program: ReturnType<typeof resolveApplicationProgram>) {
  switch (program) {
    case "grand_council_officer":
      return "Grand Council Officer";
    case "grand_council_member":
      return "Grand Council Member";
    case "club_owner":
      return "Club Owner";
    case "coach_license":
      return "Coach License";
    case "senior_coach_license":
      return "Senior Coach License";
    case "adviser_license":
      return "Adviser License";
    case "trainer_license":
      return "Trainer License";
    case "referee_license":
      return "Referee License";
    case "judge_license":
      return "Judge License";
    case "fighter_license":
      return "Fighter License";
    case "staff_license":
      return "Staff License";
    default:
      return "Member License";
  }
}

function statusTone(status: LicenseApplication["status"]) {
  switch (status) {
    case "approved":
      return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
    case "pending":
      return "border-amber-400/25 bg-amber-500/10 text-amber-100";
    case "needs_info":
      return "border-sky-400/25 bg-sky-500/10 text-sky-100";
    case "rejected":
      return "border-red-400/25 bg-red-500/10 text-red-100";
    default:
      return "border-white/10 bg-white/[0.03] text-zinc-300";
  }
}

function FanPanelHeader({
  title,
  href,
  linkLabel,
  onAction,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</h3>
      {linkLabel && onAction ? (
        <button
          className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-200 transition hover:text-red-100"
          onClick={onAction}
          type="button"
        >
          {linkLabel}
        </button>
      ) : href && linkLabel ? (
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

/** Fan home — tickets, orders, licenses, and saved events. */
export function FanPortalOverview({
  licenseApplication,
  onOpenLicenses,
}: {
  licenseApplication?: LicenseApplication | null;
  onOpenLicenses?: () => void;
}) {
  const { userData, orders } = useCommerce();

  const ticketOrders = orders.filter(isEventTicketOrder);
  const recentOrders = orders.slice(0, 3);
  const savedEvents = events.filter((event) => userData.savedEvents.includes(event.slug));
  const application = licenseApplication ?? null;
  const applicationHref = application
    ? resolveLicenseApplicationHref(application)
    : "/register-for-license";
  const applicationProgram = application ? programLabel(resolveApplicationProgram(application)) : null;

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
          <FanPanelHeader linkLabel="Open Licenses" onAction={onOpenLicenses} title="My License Applications" />
          {!application ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <FileText className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">No license applications yet.</p>
              <Link
                className="mt-2 inline-block text-xs font-black uppercase tracking-[0.14em] text-red-200"
                href="/register-for-license"
              >
                Apply Now
              </Link>
            </div>
          ) : (
            <Link
              className={`flex items-center justify-between gap-3 rounded-[1.25rem] border px-4 py-3 transition hover:border-red-500/30 ${statusTone(application.status)}`}
              href={
                application.status === "pending"
                  ? `${applicationHref}?status=pending`
                  : applicationHref
              }
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{applicationProgram}</p>
                <p className="mt-0.5 text-xs opacity-80">
                  {licenseApplicationStatusLabels[application.status]}
                  {application.idNumber ? ` • ID ${application.idNumber}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[0.58rem] font-black uppercase tracking-[0.14em]">
                {application.status === "needs_info"
                  ? "Update"
                  : application.status === "rejected"
                    ? "Resubmit"
                    : "View"}
              </span>
            </Link>
          )}
        </section>

        <section className="glass-panel space-y-4 rounded-[1.75rem] p-5 sm:p-6">
          <FanPanelHeader title="Saved Events" />
          {savedEvents.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-6 text-center">
              <Heart className="mx-auto text-zinc-600" size={22} aria-hidden />
              <p className="mt-2 text-sm text-zinc-500">Save events from the Calendar tab to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-3">
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
      </div>
    </div>
  );
}
