"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MotionSection } from "@/components/MotionSection";
import {
  buildConsultationCalendar,
  consultationServices,
  formatConsultationDate,
  groupSlotsByDate,
  type ConsultationService,
  type ConsultationSlot,
} from "@/data/consultations";
import { useAuth } from "@/lib/auth/context";
import { useCommerce } from "@/lib/commerce/context";
import { formatCurrency } from "@/lib/commerce/pricing";
import { paymentMethodLabels, type PaymentMethod } from "@/lib/commerce/types";
import {
  createConsultationBooking,
  getBookedConsultationSlotIds,
  type ConsultationBooking,
} from "@/lib/consultations/storage";

const paymentOptions: { method: PaymentMethod; icon: React.ReactNode; description: string }[] = [
  {
    method: "gcash",
    icon: <Smartphone size={20} aria-hidden />,
    description: "Pay via GCash and use the reference number for verification.",
  },
  {
    method: "maya",
    icon: <Smartphone size={20} aria-hidden />,
    description: "Pay via Maya wallet with your generated JT reference.",
  },
  {
    method: "credit_card",
    icon: <CreditCard size={20} aria-hidden />,
    description: "Card payment flow for MVP testing.",
  },
  {
    method: "bank_transfer",
    icon: <Banknote size={20} aria-hidden />,
    description: "Manual bank transfer with JT reference number.",
  },
];

type BookingStep = "service" | "schedule" | "payment" | "confirmed";

export function ConsultationPage() {
  return (
    <div className="space-y-8 pb-14 sm:pb-20">
      <MotionSection className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="glass-panel overflow-hidden rounded-[1.75rem] border-red-500/20 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
              Consultation Atelier
            </p>
            <h2 className="font-display mt-3 max-w-4xl text-4xl uppercase leading-[0.92] text-white sm:text-6xl">
              Guidance For Every Chapter Of Life
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
              A refined suite of Feng Shui, BaZi, destiny, and timing services designed for
              modern lives, homes, and companies. Explore each service, then continue to booking
              when you are ready to reserve a private session.
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              href="/consultation/book"
            >
              Book Consultation
              <ArrowRight className="ml-2" size={18} aria-hidden />
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_40%_0%,rgba(255,16,16,0.18),transparent_20rem),linear-gradient(145deg,#171717,#050505)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-zinc-500">
              Booking Flow
            </p>
            <div className="mt-5 space-y-4">
              {["Choose a service", "Pick an available calendar slot", "Submit payment and receive reference"].map(
                (step, index) => (
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0" key={step}>
                    <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FF1010] text-2xl uppercase text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-200">{step}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">
              Consultation Tracks
            </p>
            <h3 className="font-display mt-2 text-4xl uppercase text-white">Pick Your Advisory Lane</h3>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-500/35 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-500/10"
            href="/consultation/book"
          >
            Open Booking Page
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {consultationServices.map((service) => (
            <article className="broadcast-line glass-panel rounded-[1.5rem] p-5 pt-7" key={service.slug}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FF1010] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white">
                  {service.audience}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300">
                  {service.duration}
                </span>
              </div>
              <h4 className="font-display mt-4 text-3xl uppercase text-white">{service.name}</h4>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{service.description}</p>
              <ul className="mt-4 space-y-2">
                {service.highlights.map((highlight) => (
                  <li className="text-xs uppercase tracking-[0.12em] text-zinc-500" key={highlight}>
                    • {highlight}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-3xl uppercase text-red-200">{formatCurrency(service.price)}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-red-500/30 hover:text-white"
                    href={`/consultation/${service.slug}`}
                  >
                    Learn More
                  </Link>
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-black transition hover:bg-red-100"
                    href="/consultation/book"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </MotionSection>
    </div>
  );
}

export function ConsultationBookingPage() {
  const { user, loading } = useAuth();
  const { userData } = useCommerce();
  const paymentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<ConsultationService>(
    consultationServices[0],
  );
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConsultationBooking | null>(null);
  const [bookedSlotIds, setBookedSlotIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setBookedSlotIds(getBookedConsultationSlotIds());
  }, []);

  useEffect(() => {
    if (userData.phone) {
      setPhone(userData.phone);
    }
  }, [userData.phone]);

  const slots = useMemo(
    () => buildConsultationCalendar(new Date(), 28, bookedSlotIds),
    [bookedSlotIds],
  );
  const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);
  const slotDates = useMemo(() => Object.keys(groupedSlots).sort(), [groupedSlots]);

  function handleSelectService(service: ConsultationService) {
    setSelectedService(service);
    setSelectedSlot(null);
    setConfirmation(null);
    setError(null);
    setStep("schedule");
  }

  function handleSelectSlot(slot: ConsultationSlot) {
    setSelectedSlot(slot);
    setConfirmation(null);
    setError(null);
    setStep("payment");

    window.setTimeout(() => {
      paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  async function handleSubmitBooking() {
    if (!selectedSlot) {
      return;
    }

    if (!user) {
      const next = encodeURIComponent("/consultation/book");
      window.location.href = `/login?next=${next}`;
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const booking = await createConsultationBooking({
        slotId: selectedSlot.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        consultant: selectedSlot.consultant,
        format: selectedSlot.format,
        consultationSlug: selectedService.slug,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        phone: phone.trim() || "Not provided",
        notes: notes.trim(),
        paymentMethod,
      });

      setBookedSlotIds(getBookedConsultationSlotIds());
      setConfirmation(booking);
      setStep("confirmed");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <MotionSection className="mx-auto max-w-4xl pb-14 sm:pb-20">
        <div className="glass-panel rounded-[1.75rem] border-emerald-500/30 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
              <CheckCircle2 size={28} aria-hidden />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Consultation Booked
              </p>
              <h2 className="font-display mt-2 text-4xl uppercase text-white sm:text-5xl">
                Payment Submitted
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
                Your consultation spot is reserved. Complete payment using the reference below.
                The consultation team will verify payment and send your session link or venue details.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoCard label="Consultation" value={confirmation.consultationName} />
            <InfoCard label="Schedule" value={`${formatConsultationDate(confirmation.date)} · ${confirmation.time}`} />
            <InfoCard label="Consultant" value={confirmation.consultant} />
            <InfoCard label="Format" value={confirmation.format} />
            <InfoCard label="Amount" value={formatCurrency(confirmation.amount)} />
            <InfoCard label="Payment Method" value={paymentMethodLabels[confirmation.paymentMethod]} />
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-[#FF1010]/30 bg-[#FF1010]/10 p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-200">
              Payment Reference
            </p>
            <p className="font-stats mt-2 text-2xl font-bold tracking-[0.14em] text-white">
              {confirmation.referenceNumber}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Order {confirmation.orderNumber} · Status awaiting verification
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              href={`/orders/${confirmation.orderId}/tracking`}
            >
              Track Booking
            </Link>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-zinc-200 transition hover:border-red-500/30 hover:text-white"
              onClick={() => {
                setConfirmation(null);
                setSelectedSlot(null);
                setStep("service");
              }}
              type="button"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </MotionSection>
    );
  }

  return (
    <div className="space-y-8 pb-14 sm:pb-20">
      <MotionSection className="mx-auto max-w-7xl">
        <div className="glass-panel overflow-hidden rounded-[1.75rem] border-red-500/20 p-6 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <StepBadge active={step === "service"} label="1. Choose Service" />
            <StepBadge active={step === "schedule"} label="2. Pick A Time" />
            <StepBadge active={step === "payment"} label="3. Pay & Confirm" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-red-300">
            Consultation Atelier
          </p>
          <h2 className="font-display mt-3 max-w-4xl text-4xl uppercase leading-[0.92] text-white sm:text-6xl">
            Book Your Session And Pay In One Place
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            Select a consultation track, reserve an open slot on the calendar, and submit payment
            on this page. Sessions are available on weekdays via video call or at Manila HQ.
          </p>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Consultation Tracks</p>
            <h3 className="font-display mt-2 text-4xl uppercase text-white">Choose Your Session Type</h3>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {consultationServices.map((service) => {
            const active = selectedService.slug === service.slug;
            return (
              <button
                className={`broadcast-line glass-panel rounded-[1.5rem] p-5 pt-7 text-left transition ${
                  active ? "border-red-500/40 bg-red-500/10" : "hover:border-red-500/25"
                }`}
                key={service.slug}
                onClick={() => handleSelectService(service)}
                type="button"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF1010] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white">
                    {service.audience}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300">
                    {service.duration}
                  </span>
                </div>
                <h4 className="font-display mt-4 text-3xl uppercase text-white">{service.name}</h4>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{service.description}</p>
                <ul className="mt-4 space-y-2">
                  {service.highlights.map((highlight) => (
                    <li className="text-xs uppercase tracking-[0.12em] text-zinc-500" key={highlight}>
                      • {highlight}
                    </li>
                  ))}
                </ul>
                <p className="font-display mt-5 text-3xl uppercase text-red-200">
                  {formatCurrency(service.price)}
                </p>
              </button>
            );
          })}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Availability Calendar</p>
            <h3 className="font-display mt-2 text-4xl uppercase text-white">Select An Open Slot</h3>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Booking for <span className="font-semibold text-zinc-200">{selectedService.name}</span>{" "}
              · {formatCurrency(selectedService.price)} · Weekdays only
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
            <CalendarDays size={14} aria-hidden />
            Next 4 Weeks
          </span>
        </div>

        <div className="grid gap-4">
          {slotDates.map((dateKey) => (
            <article className="glass-panel rounded-[1.5rem] p-5 sm:p-6" key={dateKey}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-[14rem]">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-red-300">
                    {new Intl.DateTimeFormat("en-PH", { weekday: "short" }).format(new Date(`${dateKey}T12:00:00`))}
                  </p>
                  <h4 className="font-display mt-1 text-3xl uppercase text-white">
                    {formatConsultationDate(dateKey)}
                  </h4>
                </div>

                <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groupedSlots[dateKey]?.map((slot) => {
                    const active = selectedSlot?.id === slot.id;
                    return (
                      <motion.button
                        className={`rounded-[1.15rem] border p-4 text-left transition ${
                          active
                            ? "border-red-500/50 bg-red-500/10"
                            : "border-white/10 bg-white/[0.03] hover:border-red-500/30"
                        }`}
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        type="button"
                        whileTap={{ scale: 0.99 }}
                      >
                        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
                          <Clock3 size={14} aria-hidden />
                          {slot.time}
                        </p>
                        <p className="mt-2 text-xs text-zinc-400">{slot.consultant}</p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500">
                          {slot.format.startsWith("Video") ? (
                            <Video size={12} aria-hidden />
                          ) : (
                            <CalendarDays size={12} aria-hidden />
                          )}
                          {slot.format}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </MotionSection>

      {selectedSlot ? (
        <div ref={paymentRef}>
          <MotionSection className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Booking Summary</p>
              <h3 className="font-display mt-2 text-4xl uppercase text-white">Your Selected Spot</h3>

              <div className="mt-6 space-y-4">
                <SummaryRow label="Service" value={selectedService.name} />
                <SummaryRow label="Date" value={formatConsultationDate(selectedSlot.date)} />
                <SummaryRow label="Time" value={selectedSlot.time} />
                <SummaryRow label="Consultant" value={selectedSlot.consultant} />
                <SummaryRow label="Format" value={selectedSlot.format} />
                <SummaryRow label="Total Due" value={formatCurrency(selectedService.price)} highlight />
              </div>

              {!loading && !user ? (
                <div className="mt-6 rounded-[1.25rem] border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-100">
                    Sign in to reserve this slot and submit payment.
                  </p>
                  <Link
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500"
                    href="/login?next=/consultation/book"
                  >
                    Sign In To Continue
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-red-300">
                <ShieldCheck size={18} aria-hidden />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Payment</p>
              </div>
              <h3 className="font-display mt-2 text-4xl uppercase text-white">Pay For Consultation</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Choose a payment method and confirm your booking. A JT reference number will be
                generated for admin verification.
              </p>

              <div className="mt-5 space-y-3">
                {paymentOptions.map((option) => {
                  const selected = paymentMethod === option.method;
                  return (
                    <button
                      className={`w-full rounded-[1.15rem] border p-4 text-left transition ${
                        selected
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-white/10 bg-black/20 hover:border-red-500/30"
                      }`}
                      key={option.method}
                      onClick={() => setPaymentMethod(option.method)}
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-red-300">
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-display text-2xl uppercase text-white">
                            {paymentMethodLabels[option.method]}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  aria-label="Contact phone"
                  className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Contact phone"
                  value={phone}
                />
                <textarea
                  aria-label="Session notes"
                  className="min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none ring-red-500/40 transition placeholder:text-zinc-500 focus:ring-4"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Tell us what you want to cover in this consultation"
                  value={notes}
                />
              </div>

              {error ? <p className="mt-4 text-sm font-semibold text-red-300">{error}</p> : null}

              <button
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting || loading}
                onClick={handleSubmitBooking}
                type="button"
              >
                {submitting ? "Processing..." : `Pay ${formatCurrency(selectedService.price)} & Book Spot`}
                <ArrowRight className="ml-2" size={18} aria-hidden />
              </button>
            </div>
          </div>
          </MotionSection>
        </div>
      ) : null}
    </div>
  );
}

function StepBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] ${
        active ? "bg-red-600 text-white" : "border border-white/10 bg-white/[0.04] text-zinc-400"
      }`}
    >
      {label}
    </span>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <span className={`text-right text-sm ${highlight ? "font-display text-2xl uppercase text-red-200" : "font-semibold text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
