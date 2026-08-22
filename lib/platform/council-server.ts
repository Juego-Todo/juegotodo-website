import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CouncilRecord = {
  id: string;
  recordType: string;
  title: string;
  summary: string;
  status: string;
  createdAt: string;
};

export async function listCouncilRecords(activeOnly = true): Promise<CouncilRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service
    .from("council_records")
    .select("id, record_type, title, summary, status, created_at")
    .order("created_at", { ascending: false });

  if (activeOnly) query = query.eq("status", "active");

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    recordType: row.record_type,
    title: row.title,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function upsertCouncilRecord(input: {
  id?: string;
  recordType: string;
  title: string;
  summary: string;
  status?: string;
  createdBy?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Council records require Supabase.");

  const payload = {
    record_type: input.recordType,
    title: input.title.trim(),
    summary: input.summary.trim(),
    status: input.status ?? "active",
    created_by: input.createdBy ?? null,
  };

  if (input.id) {
    const { error } = await service.from("council_records").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await service.from("council_records").insert(payload);
  if (error) throw new Error(error.message);
}
