import { merchandiseProducts } from "@/data/shop-merchandise";
import type { ShopProduct } from "@/data/shop";
import type { ShopCategory } from "@/lib/commerce/types";

export type ShopCollectionId =
  | "all"
  | "juego-todo-merch"
  | "event-tickets"
  | "jt-official-gear";

export type ShopCollection = {
  id: ShopCollectionId;
  label: string;
  /** Large campaign headline shown on the collection card. */
  displayTitle: string;
  description: string;
  metadata: string;
  /** Drop a JPG/PNG at this path under `public/` (recommended 1080×1920). */
  imageSrc: string;
  /** Keeps subject framing above the lower text block. */
  imagePosition?: string;
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
    displayTitle: "Merch",
    description: "Official licensed apparel designed for Juego Todo athletes and supporters.",
    metadata: "40+ Products",
    imageSrc: "/shop/collections/juego-todo-merch.png",
    imagePosition: "center 18%",
  },
  {
    id: "event-tickets",
    label: "Event Tickets",
    displayTitle: "Event Tickets",
    description: "Official tickets for championships, seminars and special events.",
    metadata: "Upcoming Events",
    imageSrc: "/shop/collections/event-tickets.png",
    imagePosition: "center 35%",
  },
  {
    id: "jt-official-gear",
    label: "JT Official Gear",
    displayTitle: "Official Gear",
    description: "Professional licensed training equipment and protective gear.",
    metadata: "Official Equipment",
    imageSrc: "/shop/collections/jt-official-gear.png",
    imagePosition: "center 22%",
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

  return true;
}

export function getShopCollection(id: ShopCollectionId) {
  return shopCollections.find((collection) => collection.id === id);
}
