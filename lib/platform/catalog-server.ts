import type { ShopProduct } from "@/data/shop";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function fetchCatalogOverrides(): Promise<Record<string, ShopProduct>> {
  if (!isSupabaseConfigured()) return {};
  const service = createSupabaseServiceClient();
  if (!service) return {};

  const { data, error } = await service.from("shop_catalog_products").select("slug, payload").eq("active", true);
  if (error || !data) return {};

  const map: Record<string, ShopProduct> = {};
  for (const row of data) {
    map[row.slug] = row.payload as ShopProduct;
  }
  return map;
}

export async function upsertCatalogProduct(slug: string, product: ShopProduct, updatedBy?: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Catalog sync requires Supabase.");

  const { error } = await service.from("shop_catalog_products").upsert(
    {
      slug,
      payload: product,
      active: true,
      updated_by: updatedBy ?? null,
    },
    { onConflict: "slug" },
  );

  if (error) throw new Error(error.message);
}

export async function deactivateCatalogProduct(slug: string) {
  const service = createSupabaseServiceClient();
  if (!service) throw new Error("Catalog sync requires Supabase.");
  const { error } = await service.from("shop_catalog_products").update({ active: false }).eq("slug", slug);
  if (error) throw new Error(error.message);
}
