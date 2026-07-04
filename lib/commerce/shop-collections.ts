import { merchandiseProducts } from "@/data/shop-merchandise";
import type { ShopProduct } from "@/data/shop";
import type { ShopCategory } from "@/lib/commerce/types";

export type ShopCollectionId =
  | "all"
  | "juego-todo-merch"
  | "event-tickets"
  | "jt-official-gear"
  | "championship"
  | "digital-courses";

export type ShopCollection = {
  id: ShopCollectionId;
  label: string;
  description: string;
};

const merchandiseSlugs = new Set(merchandiseProducts.map((product) => product.slug));

const officialGearCategories: ShopCategory[] = [
  "official-gear",
  "protective-equipment",
  "competition-equipment",
  "training-equipment",
];

export const shopCollections: ShopCollection[] = [
  {
    id: "juego-todo-merch",
    label: "Juego Todo Merch",
    description: "Shirts, shorts, caps, lanyards, and league apparel.",
  },
  {
    id: "event-tickets",
    label: "Event Tickets",
    description: "Admission and access for JTGC fight cards.",
  },
  {
    id: "jt-official-gear",
    label: "JT Official Gear",
    description: "Sticks, gloves, helmets, wraps, and training tools.",
  },
  {
    id: "championship",
    label: "Championship Collection",
    description: "Belts, signed jerseys, and premium collectibles.",
  },
  {
    id: "digital-courses",
    label: "Digital Courses",
    description: "Rulebooks, training libraries, and seminar access.",
  },
];

export function matchesShopCollection(product: ShopProduct, collectionId: ShopCollectionId) {
  if (collectionId === "all") {
    return true;
  }

  if (collectionId === "juego-todo-merch") {
    return (
      merchandiseSlugs.has(product.slug) ||
      product.slug.startsWith("juego-todo-") ||
      (product.category === "apparel" && product.slug.startsWith("jt-"))
    );
  }

  if (collectionId === "event-tickets") {
    return product.searchTags.some((tag) => tag.includes("ticket")) || product.slug.includes("ticket");
  }

  if (collectionId === "jt-official-gear") {
    return officialGearCategories.includes(product.category);
  }

  if (collectionId === "championship") {
    return product.category === "championship-collection";
  }

  if (collectionId === "digital-courses") {
    return (
      product.category === "digital-products" &&
      !product.searchTags.some((tag) => tag.includes("ticket")) &&
      !product.slug.includes("ticket")
    );
  }

  return true;
}

export function getShopCollection(id: ShopCollectionId) {
  return shopCollections.find((collection) => collection.id === id);
}
