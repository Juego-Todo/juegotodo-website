"use client";

import { ArrowRight, MapPin, Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckoutSteps } from "@/components/commerce/CheckoutSteps";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { PageNavigation } from "@/components/PageNavigation";
import { AuthGateFallback } from "@/components/auth/AuthGateFallback";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { getCheckoutAuthHref } from "@/lib/commerce/checkout-auth";
import type { ShippingAddress } from "@/lib/commerce/types";

type ShippingFormState = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

function emptyForm(): ShippingFormState {
  return {
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Philippines",
  };
}

function formFromAddress(
  address: ShippingAddress | null | undefined,
  fallbacks: {
    fullName?: string;
    phone?: string;
    city?: string;
    country?: string;
  },
): ShippingFormState {
  return {
    fullName: address?.fullName || fallbacks.fullName || "",
    phone: address?.phone || fallbacks.phone || "",
    line1: address?.line1 || "",
    line2: address?.line2 || "",
    city: address?.city || fallbacks.city || "",
    province: address?.province || "",
    postalCode: address?.postalCode || "",
    country: address?.country || fallbacks.country || "Philippines",
  };
}

function resolveSelectedAddress(
  addresses: ShippingAddress[],
  draftAddressId?: string | null,
): ShippingAddress | null {
  if (draftAddressId) {
    const fromDraft = addresses.find((entry) => entry.id === draftAddressId);
    if (fromDraft) return fromDraft;
  }
  return addresses.find((entry) => entry.isDefault) ?? addresses[0] ?? null;
}

function formatAddressLines(address: ShippingFormState) {
  return [
    address.line1,
    address.line2,
    [address.city, address.province, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
}

export function CheckoutShippingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, totals, userData, saveAddress, setCheckoutDraft, checkoutDraft } = useCommerce();

  const [form, setForm] = useState<ShippingFormState>(emptyForm);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbacks = useMemo(
    () => ({
      fullName: user?.fullName ?? "",
      phone: userData.phone ?? "",
      city: user?.city ?? "",
      country: userData.country || "Philippines",
    }),
    [user?.fullName, user?.city, userData.phone, userData.country],
  );

  const selectedSavedAddress = useMemo(
    () => userData.addresses.find((entry) => entry.id === selectedAddressId) ?? null,
    [userData.addresses, selectedAddressId],
  );

  const hasCompleteSavedAddress = Boolean(
    selectedSavedAddress?.fullName &&
      selectedSavedAddress.phone &&
      selectedSavedAddress.line1 &&
      selectedSavedAddress.city &&
      selectedSavedAddress.province,
  );

  // Re-sync from async userData until the shopper edits.
  useEffect(() => {
    if (!user || dirty) {
      return;
    }

    const timer = window.setTimeout(() => {
      const selected = resolveSelectedAddress(userData.addresses, checkoutDraft.addressId);
      setForm(formFromAddress(selected, fallbacks));
      setSelectedAddressId(selected?.id ?? null);
      setSetAsDefault(selected?.isDefault ?? true);
      setEditing(!selected);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user, userData.addresses, checkoutDraft.addressId, fallbacks, dirty]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(getCheckoutAuthHref("/checkout/shipping"));
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      router.replace("/cart");
    }
  }, [loading, cart.length, router]);

  function updateField(field: keyof ShippingFormState, value: string) {
    setDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSelectSavedAddress(address: ShippingAddress) {
    setDirty(true);
    setSelectedAddressId(address.id);
    setForm(formFromAddress(address, fallbacks));
    setSetAsDefault(address.isDefault);
    setEditing(false);
    setError(null);
  }

  function handleChangeAddress() {
    setEditing(true);
    setError(null);
  }

  function handleShipElsewhere() {
    setDirty(true);
    setSelectedAddressId(null);
    setEditing(true);
    setSetAsDefault(false);
    setForm((current) => ({
      ...current,
      fullName: current.fullName || fallbacks.fullName,
      phone: current.phone || fallbacks.phone,
      line1: "",
      line2: "",
      city: "",
      province: "",
      postalCode: "",
      country: current.country || fallbacks.country || "Philippines",
    }));
    setError(null);
  }

  function handleCancelEdit() {
    const selected = resolveSelectedAddress(userData.addresses, checkoutDraft.addressId);
    setDirty(false);
    setForm(formFromAddress(selected, fallbacks));
    setSelectedAddressId(selected?.id ?? null);
    setSetAsDefault(selected?.isDefault ?? true);
    setEditing(!selected);
    setError(null);
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
      id: selectedAddressId ?? undefined,
      isDefault: setAsDefault || userData.addresses.length === 0,
    });

    setCheckoutDraft({ ...checkoutDraft, addressId: address.id });
    router.push("/checkout/payment");
  }

  if (!user) {
    return (
      <AuthGateFallback
        loading={loading}
        loadingLabel="Loading checkout..."
        redirectHref={getCheckoutAuthHref("/checkout/shipping")}
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

  const showSummary = hasCompleteSavedAddress && !editing;

  return (
    <main className="overflow-x-clip px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="relative mx-auto max-w-7xl py-10 sm:py-14">
        <PageNavigation currentLabel="Checkout — Shipping" />
        <h1 className="font-display mt-3 text-5xl uppercase text-white sm:text-6xl">Shipping Details</h1>
        <CheckoutSteps />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <form className="glass-panel rounded-[1.75rem] p-5 sm:p-8" onSubmit={handleContinue}>
            {showSummary ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                      Delivering to
                    </p>
                    <h2 className="mt-2 font-display text-3xl uppercase text-white">Saved Address</h2>
                  </div>
                  {selectedSavedAddress?.isDefault ? (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-emerald-100">
                      Default
                    </span>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                  <div className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-300">
                      <MapPin size={16} aria-hidden />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-white">{form.fullName}</p>
                      <p className="text-sm text-zinc-300">{form.phone}</p>
                      {formatAddressLines(form).map((line) => (
                        <p className="text-sm leading-6 text-zinc-400" key={line}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FF1010]/40 hover:bg-white/5"
                    onClick={handleChangeAddress}
                    type="button"
                  >
                    <Pencil className="mr-2" size={14} aria-hidden />
                    Change Address
                  </button>
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-white/30 hover:text-white"
                    onClick={handleShipElsewhere}
                    type="button"
                  >
                    <Plus className="mr-2" size={14} aria-hidden />
                    Ship Somewhere Else
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FF1010]">
                      Shipping address
                    </p>
                    <h2 className="mt-2 font-display text-3xl uppercase text-white">
                      {selectedAddressId ? "Edit Address" : "Enter Address"}
                    </h2>
                  </div>
                  {hasCompleteSavedAddress || userData.addresses.length > 0 ? (
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[0.65rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white"
                      onClick={handleCancelEdit}
                      type="button"
                    >
                      <X className="mr-2" size={14} aria-hidden />
                      Cancel
                    </button>
                  ) : null}
                </div>

                {userData.addresses.length > 1 ? (
                  <div className="space-y-2">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                      Saved addresses
                    </p>
                    <div className="flex flex-col gap-2">
                      {userData.addresses.map((address) => {
                        const active = address.id === selectedAddressId;
                        return (
                          <button
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active
                                ? "border-[#FF1010]/40 bg-[#FF1010]/10"
                                : "border-white/10 bg-black/20 hover:border-white/20"
                            }`}
                            key={address.id}
                            onClick={() => handleSelectSavedAddress(address)}
                            type="button"
                          >
                            <p className="text-sm font-bold text-white">{address.fullName}</p>
                            <p className="mt-1 text-xs text-zinc-400">
                              {[address.line1, address.city, address.province].filter(Boolean).join(" · ")}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="text-xs font-black uppercase tracking-[0.14em] text-red-200 transition hover:text-white"
                      onClick={handleShipElsewhere}
                      type="button"
                    >
                      + Ship to a different address
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" onChange={(value) => updateField("fullName", value)} value={form.fullName} />
                  <Field label="Phone" onChange={(value) => updateField("phone", value)} value={form.phone} />
                  <Field
                    className="sm:col-span-2"
                    label="Address line 1"
                    onChange={(value) => updateField("line1", value)}
                    value={form.line1}
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Address line 2"
                    onChange={(value) => updateField("line2", value)}
                    optional
                    value={form.line2}
                  />
                  <Field label="City" onChange={(value) => updateField("city", value)} value={form.city} />
                  <Field label="Province" onChange={(value) => updateField("province", value)} value={form.province} />
                  <Field
                    label="Postal code"
                    onChange={(value) => updateField("postalCode", value)}
                    value={form.postalCode}
                  />
                  <Field label="Country" onChange={(value) => updateField("country", value)} value={form.country} />
                </div>

                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    checked={setAsDefault}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#FF1010] focus:ring-[#FF1010]/40"
                    onChange={(event) => {
                      setDirty(true);
                      setSetAsDefault(event.target.checked);
                    }}
                    type="checkbox"
                  />
                  <span>Set as default shipping address</span>
                </label>
              </div>
            )}

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
