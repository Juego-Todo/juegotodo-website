import { NextResponse } from "next/server";
import { fetchCatalogOverrides, upsertCatalogProduct, deactivateCatalogProduct } from "@/lib/platform/catalog-server";
import { requirePlatformAdmin } from "@/lib/platform/auth";
import type { ShopProduct } from "@/data/shop";

export async function GET() {
  try {
    const products = await fetchCatalogOverrides();
    return NextResponse.json({ products });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to load catalog overrides." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { slug?: string; product?: ShopProduct };
    if (!body.slug?.trim() || !body.product?.name) {
      return NextResponse.json({ error: "Slug and product payload are required." }, { status: 400 });
    }

    await upsertCatalogProduct(body.slug.trim(), body.product, auth.user.id);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to save catalog product." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requirePlatformAdmin(request);
  if ("response" in auth) return auth.response;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  try {
    await deactivateCatalogProduct(slug);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unable to remove catalog product." },
      { status: 500 },
    );
  }
}
