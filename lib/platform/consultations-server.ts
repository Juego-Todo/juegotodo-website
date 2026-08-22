import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json } from "@/lib/supabase/types";

export type ConsultationBookingRecord = {
  id: string;
  userId: string | null;
  serviceSlug: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  paymentStatus: string;
  createdAt: string;
};

export async function createConsultationBooking(input: {
  userId?: string | null;
  serviceSlug: string;
  slotStart: string;
  slotEnd: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Consultation bookings require Supabase.");

  const { data, error } = await service
    .from("consultation_bookings")
    .insert({
      user_id: input.userId ?? null,
      service_slug: input.serviceSlug,
      slot_start: input.slotStart,
      slot_end: input.slotEnd,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_phone: input.customerPhone?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      metadata: (input.metadata ?? {}) as Json,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function listConsultationBookings(userId?: string): Promise<ConsultationBookingRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service.from("consultation_bookings").select("*").order("slot_start", { ascending: false });
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapRow);
}

function mapRow(row: {
  id: string;
  user_id: string | null;
  service_slug: string;
  slot_start: string;
  slot_end: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  payment_status: string;
  created_at: string;
}): ConsultationBookingRecord {
  return {
    id: row.id,
    userId: row.user_id,
    serviceSlug: row.service_slug,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    notes: row.notes,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}
