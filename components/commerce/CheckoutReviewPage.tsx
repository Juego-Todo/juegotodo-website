"use client";

import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutSteps } from "@/components/commerce/CheckoutSteps";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";
import { paymentMethodLabels } from "@/lib/commerce/types";

export function CheckoutReviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, totals, userData, checkoutDraft, placeOrder } = useCommerce();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address =
    userData.addresses.find((entry) => entry.id === checkoutDraft.addressId) ??
    userData.addresses.find((entry) => entry.isDefault);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/checkout/review");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      router.replace("/cart");
    }
  }, [loading, cart.length, router]);

  useEffect(() => {
    if (!loading && (!address || !checkoutDraft.paymentMethod)) {
      router.replace("/checkout/shipping");
    }
  }, [loading, address, checkoutDraft.paymentMethod, router]);

  async function handlePlaceOrder() {
    if (!address || !checkoutDraft.paymentMethod) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = placeOrder(checkoutDraft.paymentMethod, address, checkoutDraft.promoCode);
      router.push(`/checkout/confirmation/${order.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to place order.");
      setSubmitting(false);
    }
  }

  if (loading || !user || cart.length === 0 || !address || !checkoutDraft.paymentMethod) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading review...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <PageNavigation currentLabel="Checkout — Review" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Review Order</h1>
        <CheckoutSteps />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Items</p>
              <ul className="mt-4 space-y-3">
                {totals.items.map((item) => (
                  <li className="flex items-center justify-between gap-4 text-sm" key={item.productSlug}>
                    <span className="text-zinc-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-white">{formatCurrency(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-red-300">
                <MapPin size={18} aria-hidden />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Shipping To</p>
              </div>
              <p className="mt-4 font-semibold text-white">{address.fullName}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </p>
              <p className="text-sm text-zinc-400">
                {address.city}, {address.province} {address.postalCode}
              </p>
              <p className="text-sm text-zinc-400">{address.country}</p>
              <p className="mt-2 text-sm text-zinc-500">{address.phone}</p>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-red-300">
                <ShieldCheck size={18} aria-hidden />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Payment</p>
              </div>
              <p className="mt-4 font-display text-3xl uppercase text-white">
                {paymentMethodLabels[checkoutDraft.paymentMethod]}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Status will be set to Awaiting Verification until admin approves your payment.
              </p>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={submitting}
              onClick={handlePlaceOrder}
              type="button"
            >
              {submitting ? "Placing Order..." : "Place Order"}
              <ArrowRight className="ml-2" size={18} aria-hidden />
            </button>
          </div>

          <OrderSummary compact showShippingNote={false} totals={totals} />
        </div>
      </section>
    </main>
  );
}
