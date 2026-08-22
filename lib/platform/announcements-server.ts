import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  audience: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export async function listAnnouncements(publishedOnly = true): Promise<AnnouncementRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const service = createSupabaseServiceClient();
  if (!service) return [];

  let query = service
    .from("announcements")
    .select("id, title, body, audience, published, published_at, created_at")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    audience: row.audience,
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }));
}

export async function upsertAnnouncement(input: {
  id?: string;
  title: string;
  body: string;
  audience?: string;
  published?: boolean;
  createdBy?: string;
}) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Announcements require Supabase.");

  const payload = {
    title: input.title.trim(),
    body: input.body.trim(),
    audience: input.audience ?? "all",
    published: input.published ?? false,
    published_at: input.published ? new Date().toISOString() : null,
    created_by: input.createdBy ?? null,
  };

  if (input.id) {
    const { data, error } = await service
      .from("announcements")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await service.from("announcements").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}
