import type { CartItem } from "@/lib/commerce/types";

const SAVED_KEY = "juego-todo.commerce.saved";
const COMPARE_KEY = "juego-todo.commerce.compare";
const RECENT_KEY = "juego-todo.commerce.recent";
const MAX_COMPARE = 4;
const MAX_RECENT = 8;

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

export function cartItemKey(item: Pick<CartItem, "productSlug" | "variantSelections">) {
  return `${item.productSlug}:${JSON.stringify(item.variantSelections ?? {})}`;
}

export function getSavedForLater(): CartItem[] {
  return readJson<CartItem[]>(SAVED_KEY, []);
}

export function saveSavedForLater(items: CartItem[]) {
  writeJson(SAVED_KEY, items);
}

export function getCompareList(): string[] {
  return readJson<string[]>(COMPARE_KEY, []);
}

export function saveCompareList(slugs: string[]) {
  writeJson(COMPARE_KEY, slugs.slice(0, MAX_COMPARE));
}

export function toggleCompareSlug(slug: string): string[] {
  const current = getCompareList();
  if (current.includes(slug)) {
    const next = current.filter((entry) => entry !== slug);
    saveCompareList(next);
    return next;
  }
  const next = [...current, slug].slice(-MAX_COMPARE);
  saveCompareList(next);
  return next;
}

export function getRecentlyViewed(): string[] {
  return readJson<string[]>(RECENT_KEY, []);
}

export function trackRecentlyViewed(slug: string): string[] {
  const next = [slug, ...getRecentlyViewed().filter((entry) => entry !== slug)].slice(0, MAX_RECENT);
  writeJson(RECENT_KEY, next);
  return next;
}
