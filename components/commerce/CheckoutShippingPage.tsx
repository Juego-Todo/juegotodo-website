"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutSteps } from "@/components/commerce/CheckoutSteps";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";

export function CheckoutShippingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, totals, userData, saveAddress, setCheckoutDraft, checkoutDraft } = useCommerce();
  const defaultAddress = userData.addresses.find((entry) => entry.isDefault) ?? userData.addresses[0];

  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName ?? user?.fullName ?? "",
    phone: defaultAddress?.phone ?? userData.phone ?? "",
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? user?.city ?? "",
    province: defaultAddress?.province ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
    country: defaultAddress?.country ?? userData.country ?? "Philippines",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/checkout/shipping");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      router.replace("/cart");
    }
  }, [loading, cart.length, router]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.fullName || !form.phone || !form.line1 || !form.city || !form.province) {
      setError("Complete all required shipping fields.");
      return;
    }

    const address = saveAddress({
      ...form,
      isDefault: true,
    });

    setCheckoutDraft({ ...checkoutDraft, addressId: address.id });
    router.push("/checkout/payment");
  }

  if (loading || !user || cart.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-zinc-400">Loading checkout...</p>
      </main>
    );
  }

  return (
    <main className="overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <PageNavigation currentLabel="Checkout — Shipping" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Shipping Details</h1>
        <CheckoutSteps />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleContinue}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" onChange={(value) => updateField("fullName", value)} value={form.fullName} />
              <Field label="Phone" onChange={(value) => updateField("phone", value)} value={form.phone} />
              <Field className="sm:col-span-2" label="Address line 1" onChange={(value) => updateField("line1", value)} value={form.line1} />
              <Field className="sm:col-span-2" label="Address line 2" onChange={(value) => updateField("line2", value)} value={form.line2} optional />
              <Field label="City" onChange={(value) => updateField("city", value)} value={form.city} />
              <Field label="Province" onChange={(value) => updateField("province", value)} value={form.province} />
              <Field label="Postal code" onChange={(value) => updateField("postalCode", value)} value={form.postalCode} />
              <Field label="Country" onChange={(value) => updateField("country", value)} value={form.country} />
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 sm:w-auto"
              type="submit"
            >
              Continue To Payment
              <ArrowRight className="ml-2" size={18} aria-hidden />
            </button>
          </form>

          <OrderSummary compact totals={totals} />
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  optional,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
        {optional ? " (optional)" : ""}
      </span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
