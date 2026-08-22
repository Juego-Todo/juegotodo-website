import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json } from "@/lib/supabase/types";
import type { InquiryInput, InquiryRecord } from "@/lib/platform/inquiries";

export async function insertInquiry(input: InquiryInput): Promise<InquiryRecord> {
  const service = createSupabaseServiceClient();
  if (!isSupabaseConfigured() || !service) {
    throw new Error("Inquiry submission requires Supabase configuration.");
  }

  const { data, error } = await service
    .from("inquiries")
    .insert({
      inquiry_type: input.inquiryType,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() ?? "",
      organization: input.organization?.trim() ?? "",
      subject: input.subject?.trim() ?? "",
      message: input.message.trim(),
      metadata: (input.metadata ?? {}) as Json,
    })
    .select("id, inquiry_type, full_name, email, phone, organization, subject, message, status, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save inquiry.");
  }

  return {
    id: data.id,
    inquiryType: data.inquiry_type as InquiryInput["inquiryType"],
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    subject: data.subject,
    message: data.message,
    status: data.status as InquiryRecord["status"],
    createdAt: data.created_at,
  };
}

export async function listInquiriesAdmin(type?: InquiryInput["inquiryType"]) {
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service
    .from("inquiries")
    .select("id, inquiry_type, full_name, email, phone, organization, subject, message, status, created_at")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("inquiry_type", type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    inquiryType: row.inquiry_type as InquiryInput["inquiryType"],
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    subject: row.subject,
    message: row.message,
    status: row.status as InquiryRecord["status"],
    createdAt: row.created_at,
  }));
}
