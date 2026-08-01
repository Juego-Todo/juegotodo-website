import { shopProducts, type ProductVariantGroup, type ShopProduct } from "@/data/shop";
import type { ShopCategory } from "@/lib/commerce/types";

function formatCatalogPrice(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export const CATALOG_STORAGE_KEY = "juego-todo.shop.catalog-state";
export const CATALOG_CHANGED_EVENT = "juego-todo:catalog-changed";

export type CatalogProductInput = {
  slug?: string;
  name: string;
  category: ShopCategory;
  priceAmount: number;
  stock: number;
  description: string;
  summary: string;
  imageSrc?: string;
  badge?: string;
  digital?: boolean;
  searchTags?: string[];
  competitionUse?: string;
  features?: string[];
  specs?: { label: string; value: string }[];
  variantGroups?: ProductVariantGroup[];
};

export type CatalogState = {
  customProducts: ShopProduct[];
  overrides: Record<string, Partial<ShopProduct>>;
  removedSlugs: string[];
  updatedAt: string;
};

export function emptyCatalogState(): CatalogState {
  return {
    customProducts: [],
    overrides: {},
    removedSlugs: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function slugifyProductName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readLocalCatalogState(): CatalogState {
  if (typeof window === "undefined") {
    return emptyCatalogState();
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) {
      return emptyCatalogState();
    }
    const parsed = JSON.parse(raw) as CatalogState;
    return {
      customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
      removedSlugs: Array.isArray(parsed.removedSlugs) ? parsed.removedSlugs : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return emptyCatalogState();
  }
}

function writeLocalCatalogState(state: CatalogState) {
  if (typeof window === "undefined") {
    return;
  }

  const next = { ...state, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CATALOG_CHANGED_EVENT));
}

function applyOverride(product: ShopProduct, override?: Partial<ShopProduct>): ShopProduct {
  if (!override) {
    return product;
  }

  const merged = { ...product, ...override };
  if (typeof override.priceAmount === "number") {
    merged.price = formatCatalogPrice(override.priceAmount);
    merged.priceAmount = override.priceAmount;
  }
  return merged;
}

export function mergeCatalogState(base: ShopProduct[], state: CatalogState): ShopProduct[] {
  const removed = new Set(state.removedSlugs);
  const baseProducts = base
    .filter((product) => !removed.has(product.slug))
    .map((product) => applyOverride(product, state.overrides[product.slug]));

  const customProducts = state.customProducts
    .filter((product) => !removed.has(product.slug))
    .map((product) => applyOverride(product, state.overrides[product.slug]));

  const bySlug = new Map<string, ShopProduct>();
  for (const product of [...baseProducts, ...customProducts]) {
    bySlug.set(product.slug, product);
  }
  return Array.from(bySlug.values());
}

export function getCatalogState(): CatalogState {
  return readLocalCatalogState();
}

export function getLiveShopProducts(): ShopProduct[] {
  return mergeCatalogState(shopProducts, getCatalogState());
}

export function getLiveShopProduct(slug: string): ShopProduct | undefined {
  return getLiveShopProducts().find((product) => product.slug === slug);
}

export function isCustomCatalogProduct(slug: string): boolean {
  return getCatalogState().customProducts.some((product) => product.slug === slug);
}

function buildProductFromInput(input: CatalogProductInput, existingSlug?: string): ShopProduct {
  const slug = existingSlug || input.slug || slugifyProductName(input.name) || `product-${Date.now()}`;
  const priceAmount = Math.max(0, Math.round(input.priceAmount));

  return {
    slug,
    name: input.name.trim(),
    category: input.category,
    price: formatCatalogPrice(priceAmount),
    priceAmount,
    description: input.description.trim() || input.name.trim(),
    summary: input.summary.trim() || input.description.trim() || input.name.trim(),
    features: input.features?.length ? input.features : ["Official Juego Todo product"],
    specs: input.specs?.length
      ? input.specs
      : [
          { label: "Category", value: input.category },
          { label: "Stock", value: String(Math.max(0, Math.round(input.stock))) },
        ],
    competitionUse: input.competitionUse?.trim() || "Available through the official Juego Todo shop.",
    tone: "from-zinc-900 via-red-950 to-black",
    badge: input.badge?.trim() || undefined,
    digital: Boolean(input.digital),
    stock: Math.max(0, Math.round(input.stock)),
    searchTags: input.searchTags?.length
      ? input.searchTags.map((tag) => tag.trim()).filter(Boolean)
      : [input.name.trim().toLowerCase(), input.category],
    imageSrc: input.imageSrc?.trim() || undefined,
    variantGroups: sanitizeVariantGroups(input.variantGroups),
  };
}

function sanitizeVariantGroups(groups?: ProductVariantGroup[]): ProductVariantGroup[] | undefined {
  if (!groups?.length) {
    return undefined;
  }

  const cleaned = groups
    .map((group) => ({
      id: group.id || slugifyProductName(group.label) || `option-${Date.now()}`,
      label: group.label.trim(),
      options: group.options
        .map((option) => ({
          id: option.id || slugifyProductName(option.label) || `value-${Date.now()}`,
          label: option.label.trim(),
          imageSrc: option.imageSrc?.trim() || undefined,
          priceAmount:
            typeof option.priceAmount === "number" && option.priceAmount > 0
              ? Math.round(option.priceAmount)
              : undefined,
        }))
        .filter((option) => Boolean(option.label)),
    }))
    .filter((group) => Boolean(group.label) && group.options.length > 0);

  return cleaned.length > 0 ? cleaned : undefined;
}

export function upsertCatalogProduct(input: CatalogProductInput, slug?: string): ShopProduct {
  const state = getCatalogState();
  const targetSlug = slug || input.slug || slugifyProductName(input.name);
  const existingLive = mergeCatalogState(shopProducts, state).find((product) => product.slug === targetSlug);
  const nextProduct = buildProductFromInput(
    {
      ...input,
      slug: targetSlug,
      features: input.features ?? existingLive?.features,
      specs: input.specs ?? existingLive?.specs,
      competitionUse: input.competitionUse ?? existingLive?.competitionUse,
      variantGroups: input.variantGroups ?? existingLive?.variantGroups,
    },
    targetSlug,
  );

  const isBase = shopProducts.some((product) => product.slug === targetSlug);
  const customIndex = state.customProducts.findIndex((product) => product.slug === targetSlug);

  if (isBase) {
    state.overrides[targetSlug] = {
      name: nextProduct.name,
      category: nextProduct.category,
      price: nextProduct.price,
      priceAmount: nextProduct.priceAmount,
      stock: nextProduct.stock,
      description: nextProduct.description,
      summary: nextProduct.summary,
      imageSrc: nextProduct.imageSrc,
      badge: nextProduct.badge,
      digital: nextProduct.digital,
      searchTags: nextProduct.searchTags,
      competitionUse: nextProduct.competitionUse,
      features: nextProduct.features,
      specs: nextProduct.specs,
      // Empty array (not undefined) so clearing variants on a base product persists through JSON storage.
      variantGroups: nextProduct.variantGroups ?? [],
    };
    state.removedSlugs = state.removedSlugs.filter((value) => value !== targetSlug);
  } else if (customIndex >= 0) {
    state.customProducts[customIndex] = nextProduct;
    delete state.overrides[targetSlug];
    state.removedSlugs = state.removedSlugs.filter((value) => value !== targetSlug);
  } else {
    let uniqueSlug = nextProduct.slug;
    let suffix = 2;
    const existingSlugs = new Set(mergeCatalogState(shopProducts, state).map((product) => product.slug));
    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${nextProduct.slug}-${suffix}`;
      suffix += 1;
    }
    state.customProducts.push({ ...nextProduct, slug: uniqueSlug });
    nextProduct.slug = uniqueSlug;
  }

  writeLocalCatalogState(state);
  return getLiveShopProduct(nextProduct.slug) ?? nextProduct;
}

export function updateCatalogStock(slug: string, stock: number): ShopProduct | undefined {
  const state = getCatalogState();
  const nextStock = Math.max(0, Math.round(stock));
  const customIndex = state.customProducts.findIndex((product) => product.slug === slug);

  if (customIndex >= 0) {
    state.customProducts[customIndex] = {
      ...state.customProducts[customIndex],
      stock: nextStock,
    };
  } else if (shopProducts.some((product) => product.slug === slug)) {
    state.overrides[slug] = {
      ...state.overrides[slug],
      stock: nextStock,
    };
  } else {
    return undefined;
  }

  state.removedSlugs = state.removedSlugs.filter((value) => value !== slug);
  writeLocalCatalogState(state);
  return getLiveShopProduct(slug);
}

export function removeCatalogProduct(slug: string) {
  const state = getCatalogState();
  const customIndex = state.customProducts.findIndex((product) => product.slug === slug);

  if (customIndex >= 0) {
    state.customProducts.splice(customIndex, 1);
  } else if (!state.removedSlugs.includes(slug)) {
    state.removedSlugs.push(slug);
  }

  delete state.overrides[slug];
  writeLocalCatalogState(state);
}

export function restoreCatalogProduct(slug: string) {
  const state = getCatalogState();
  state.removedSlugs = state.removedSlugs.filter((value) => value !== slug);
  writeLocalCatalogState(state);
}

export function resetCatalogState() {
  writeLocalCatalogState(emptyCatalogState());
}

export function subscribeCatalogChanges(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onChange();
  window.addEventListener(CATALOG_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CATALOG_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
