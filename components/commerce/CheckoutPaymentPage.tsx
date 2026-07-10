"use client";

import { ArrowRight, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutSteps } from "@/components/commerce/CheckoutSteps";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import { paymentMethodLabels, type PaymentMethod } from "@/lib/commerce/types";

const paymentOptions: { method: PaymentMethod; icon: React.ReactNode; description: string }[] = [
  { method: "gcash", icon: <Smartphone size={20} aria-hidden />, description: "Pay via GCash and upload reference for verification." },
  { method: "maya", icon: <Smartphone size={20} aria-hidden />, description: "Pay via Maya wallet. Reference generated at review." },
  { method: "credit_card", icon: <CreditCard size={20} aria-hidden />, description: "Dummy card flow for MVP testing." },
  { method: "bank_transfer", icon: <Banknote size={20} aria-hidden />, description: "Manual bank transfer with JT reference number." },
  { method: "cash_pickup", icon: <Banknote size={20} aria-hidden />, description: "Pay cash when picking up at JT office or event." },
];

export function CheckoutPaymentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, totals, setCheckoutDraft, checkoutDraft } = useCommerce();
  const [method, setMethod] = useState<PaymentMethod | undefined>(checkoutDraft.paymentMethod);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(getCheckoutAuthHref("/checkout/payment"));
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      router.replace("/cart");
    }
  }, [loading, cart.length, router]);

  function handleContinue() {
    if (!method) {
      return;
    }
    setCheckoutDraft({ ...checkoutDraft, paymentMethod: method });
    router.push("/checkout/review");
  }

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading checkout..."
        redirectHref={getCheckoutAuthHref("/checkout/payment")}
        user={user}
      />
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading checkout...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <PageNavigation currentLabel="Checkout — Payment" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Payment Method</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          MVP dummy payment system. A reference number will be generated for admin verification.
        </p>
        <CheckoutSteps />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            {paymentOptions.map((option) => {
              const selected = method === option.method;
              return (
                <button
                  className={`glass-panel w-full rounded-[1.25rem] p-5 text-left transition ${
                    selected ? "border-red-500/50 bg-red-500/10" : "hover:border-red-500/30"
                  }`}
                  key={option.method}
                  onClick={() => setMethod(option.method)}
                  type="button"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-red-300">
                      {option.icon}
                    </div>
                    <div>
                      <p className="font-display text-2xl uppercase text-white">
                        {paymentMethodLabels[option.method]}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={!method}
              onClick={handleContinue}
              type="button"
            >
              Review Order
              <ArrowRight className="ml-2" size={18} aria-hidden />
            </button>
          </div>

          <OrderSummary compact totals={totals} />
        </div>
      </section>
    </main>
  );
}
