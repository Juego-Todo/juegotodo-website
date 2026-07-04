import { getConsultationService } from "@/data/consultations";
import { generatePaymentReference } from "@/lib/commerce/pricing";
import type { Order, PaymentMethod } from "@/lib/commerce/types";

const BOOKINGS_KEY = "juego-todo.consultation.bookings";
const ORDERS_KEY = "juego-todo.commerce.orders";

export type ConsultationBooking = {
  id: string;
  slotId: string;
  consultationSlug: string;
  consultationName: string;
  date: string;
  time: string;
  consultant: string;
  format: string;
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: "awaiting_verification" | "confirmed" | "cancelled";
  createdAt: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getConsultationBookings(): ConsultationBooking[] {
  return readJson<ConsultationBooking[]>(BOOKINGS_KEY, []);
}

export function getBookedConsultationSlotIds(): Set<string> {
  return new Set(
    getConsultationBookings()
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => booking.slotId),
  );
}

export function getUserConsultationBookings(userId: string) {
  return getConsultationBookings().filter((booking) => booking.userId === userId);
}

export async function createConsultationBooking(input: {
  slotId: string;
  date: string;
  time: string;
  consultant: string;
  format: string;
  consultationSlug: string;
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
}): Promise<ConsultationBooking> {
  const service = getConsultationService(input.consultationSlug);
  if (!service) {
    throw new Error("Consultation service not found.");
  }

  const bookedIds = getBookedConsultationSlotIds();
  if (bookedIds.has(input.slotId)) {
    throw new Error("This consultation slot is no longer available.");
  }

  const now = new Date().toISOString();
  const referenceNumber = generatePaymentReference(input.paymentMethod);
  const orderNumber = `JT-CON-${Date.now().toString(36).toUpperCase()}`;
  const orderId = crypto.randomUUID();
  const bookingId = crypto.randomUUID();

  const order: Order = {
    id: orderId,
    orderNumber,
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
    items: [
      {
        productSlug: `consultation-${service.slug}`,
        name: `${service.name} Consultation`,
        category: "digital-products",
        unitPrice: service.price,
        quantity: 1,
        lineTotal: service.price,
      },
    ],
    subtotal: service.price,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: service.price,
    status: "pending",
    payment: {
      method: input.paymentMethod,
      status: "awaiting_verification",
      referenceNumber,
      amount: service.price,
      createdAt: now,
    },
    shippingAddress: {
      id: "consultation-digital",
      fullName: input.userName,
      phone: input.phone,
      line1: "Digital consultation booking",
      line2: `${input.date} ${input.time}`,
      city: "Online",
      province: "N/A",
      postalCode: "0000",
      country: "Philippines",
      isDefault: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  const booking: ConsultationBooking = {
    id: bookingId,
    slotId: input.slotId,
    consultationSlug: service.slug,
    consultationName: service.name,
    date: input.date,
    time: input.time,
    consultant: input.consultant,
    format: input.format,
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
    phone: input.phone,
    notes: input.notes,
    paymentMethod: input.paymentMethod,
    referenceNumber,
    orderId,
    orderNumber,
    amount: service.price,
    status: "awaiting_verification",
    createdAt: now,
  };

  writeJson(ORDERS_KEY, [...readJson<Order[]>(ORDERS_KEY, []), order]);
  writeJson(BOOKINGS_KEY, [...getConsultationBookings(), booking]);

  return booking;
}
