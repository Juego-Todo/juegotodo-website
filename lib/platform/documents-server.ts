import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type MemberDocumentRecord = {
  id: string;
  userId: string;
  documentType: "certificate" | "medical" | "credential" | "other";
  title: string;
  status: "pending" | "approved" | "rejected" | "expired";
  storagePath: string;
  expiresAt: string | null;
  notes: string;
  createdAt: string;
};

export async function listMemberDocuments(userId: string): Promise<MemberDocumentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("member_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function listAllMemberDocuments(): Promise<MemberDocumentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  const { data, error } = await service.from("member_documents").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

function mapRow(row: {
  id: string;
  user_id: string;
  document_type: string;
  title: string;
  status: string;
  storage_path: string;
  expires_at: string | null;
  notes: string;
  created_at: string;
}): MemberDocumentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.document_type as MemberDocumentRecord["documentType"],
    title: row.title,
    status: row.status as MemberDocumentRecord["status"],
    storagePath: row.storage_path,
    expiresAt: row.expires_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function createMemberDocument(input: {
  userId: string;
  documentType: MemberDocumentRecord["documentType"];
  title: string;
  storagePath?: string;
  expiresAt?: string | null;
  notes?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Documents require Supabase.");

  const { data, error } = await service
    .from("member_documents")
    .insert({
      user_id: input.userId,
      document_type: input.documentType,
      title: input.title.trim(),
      storage_path: input.storagePath ?? "",
      expires_at: input.expiresAt ?? null,
      notes: input.notes ?? "",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateMemberDocumentStatus(
  id: string,
  status: MemberDocumentRecord["status"],
  reviewedBy?: string,
) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Documents require Supabase.");

  const { error } = await service
    .from("member_documents")
    .update({ status, reviewed_by: reviewedBy ?? null })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
