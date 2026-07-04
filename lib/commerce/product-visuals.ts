import type { ShopProduct } from "@/data/shop";
import type { ShopCategory } from "@/lib/commerce/types";

export type ProductImageKey =
  | "gloves"
  | "helmet"
  | "jersey"
  | "sticks"
  | "belt"
  | "apparel"
  | "protective"
  | "training"
  | "digital"
  | "gear";

const slugImageMap: Record<string, ProductImageKey> = {
  "jt-competition-helmet": "helmet",
  "juego-todo-id-lanyard": "apparel",
  "juego-todo-shirt": "apparel",
  "juego-todo-premium-shirt": "apparel",
  "juego-todo-fight-shorts": "apparel",
  "juego-todo-trucker-cap": "apparel",
  "juego-todo-sleeveless-hoodie": "apparel",
};

const categoryImageMap: Record<ShopCategory, ProductImageKey> = {
  "official-gear": "sticks",
  "competition-equipment": "gear",
  "protective-equipment": "protective",
  "training-equipment": "training",
  apparel: "apparel",
  "championship-collection": "belt",
  "digital-products": "digital",
};

export const heroShowcaseSlugs = [
  "jt-competition-helmet",
  "juego-todo-sleeveless-hoodie",
  "juego-todo-shirt",
] as const;

export const heroFeaturedSlugs = [
  { slug: "jt-competition-helmet", badge: "Best Seller" as const },
  { slug: "juego-todo-sleeveless-hoodie", badge: "New Arrival" as const },
  { slug: "juego-todo-premium-shirt", badge: "Limited Drop" as const },
] as const;

export const bestSellerSlugs = [
  "juego-todo-shirt",
  "jt-competition-helmet",
  "juego-todo-fight-shorts",
  "juego-todo-premium-shirt",
  "juego-todo-trucker-cap",
  "juego-todo-id-lanyard",
  "juego-todo-sleeveless-hoodie",
] as const;

export const bundleSlugs = ["juego-todo-fight-shorts", "juego-todo-shirt", "juego-todo-trucker-cap"] as const;

export const memberBenefits = [
  "Athlete Discounts",
  "Loyalty Rewards",
  "Early Access",
  "Exclusive Drops",
] as const;

export const newArrivalSlugs = [
  "juego-todo-shirt",
  "juego-todo-fight-shorts",
  "juego-todo-trucker-cap",
  "juego-todo-id-lanyard",
  "juego-todo-sleeveless-hoodie",
  "juego-todo-premium-shirt",
] as const;

export const shopCollections = [
  {
    id: "competitor",
    name: "Competitor Collection",
    description: "Helmet, fight shorts, and league apparel built for JTGC competition.",
    href: "#bundles",
    imageKey: "gear" as ProductImageKey,
    items: ["JT Competition Helmet", "Juego Todo Fight Shorts", "Juego Todo Shirt"],
  },
  {
    id: "champion",
    name: "Champion Collection",
    description: "Walkout hoodies, premium shirts, and official league equipment.",
    href: "/shop?category=apparel",
    imageKey: "jersey" as ProductImageKey,
    items: ["Juego Todo Sleeveless Hoodie", "Juego Todo Premium Shirt", "Juego Todo Trucker Cap"],
  },
] as const;

export const shopEditorialSections = [
  {
    id: "competition",
    eyebrow: "Used In Competition",
    title: "Proven on fight night.",
    body: "Official JTGC equipment is cleared for weapon rounds, Mano y Mano exchanges, and championship events across the Philippines.",
    imageKey: "sticks" as ProductImageKey,
  },
  {
    id: "athletes",
    eyebrow: "Trusted By Athletes",
    title: "Worn by verified roster fighters.",
    body: "125+ verified athletes train and compete in JT gear — from regional qualifiers to Grand Council main events.",
    imageKey: "gloves" as ProductImageKey,
  },
  {
    id: "official",
    eyebrow: "Official JTGC Equipment",
    title: "The league standard.",
    body: "Every armory piece is competition-certified, league-approved, and built for Filipino martial arts ranges.",
    imageKey: "helmet" as ProductImageKey,
  },
] as const;

export const athletePicks = [
  {
    athlete: "Doug Marcaida",
    title: "Weapons Master",
    productSlug: "jt-competition-helmet",
    quote: "The fit and visibility are built for real weapon transitions.",
  },
  {
    athlete: "Brandon Vera",
    title: "Championship Veteran",
    productSlug: "juego-todo-fight-shorts",
    quote: "My go-to walkout gear for camp intensity without compromise.",
  },
] as const;

export const shopBundles = [
  {
    id: "fan-kit",
    name: "Fan Kit",
    slugs: ["juego-todo-shirt", "juego-todo-trucker-cap", "juego-todo-id-lanyard"],
    price: 1299,
    savings: 98,
  },
  {
    id: "competitor-kit",
    name: "Competitor Kit",
    slugs: ["jt-competition-helmet", "juego-todo-fight-shorts", "juego-todo-sleeveless-hoodie"],
    price: 5749,
    savings: 399,
  },
  {
    id: "walkout-bundle",
    name: "Walkout Bundle",
    slugs: ["juego-todo-sleeveless-hoodie", "juego-todo-fight-shorts", "juego-todo-premium-shirt"],
    price: 3299,
    savings: 198,
  },
] as const;

export const shopCategoryTiles = [
  {
    label: "Competition Equipment",
    href: "/shop?category=competition-equipment",
    imageKey: "helmet" as ProductImageKey,
    description: "Helmets and sanctioned competition gear.",
  },
  {
    label: "Apparel",
    href: "/shop?category=apparel",
    imageKey: "apparel" as ProductImageKey,
    description: "Walkout gear, hoodies, and league apparel.",
  },
] as const;

export const productAthleteUsers: Record<string, string[]> = {
  "jt-competition-helmet": ["Ana Bagaybay Santos", "Ramon Dumog Cruz"],
  "juego-todo-shirt": ["Miguel Lakan Reyes", "Carlo Diaz"],
  "juego-todo-fight-shorts": ["Juan Reyes", "Mark Cruz"],
  "juego-todo-sleeveless-hoodie": ["Daniel Santos", "Noah Park"],
};

export function getProductImageKey(product: ShopProduct): ProductImageKey {
  return slugImageMap[product.slug] ?? categoryImageMap[product.category];
}

export function getProductRating(product: ShopProduct) {
  let hash = 0;
  for (let index = 0; index < product.slug.length; index += 1) {
    hash = (hash * 31 + product.slug.charCodeAt(index)) >>> 0;
  }
  hash = (hash + product.priceAmount * 17 + product.stock * 3) >>> 0;

  const rating = 3.4 + (hash % 17) / 10;
  const reviewCount = 8 + (hash % 312);

  return {
    rating: Math.min(5, Math.round(rating * 10) / 10),
    reviewCount,
  };
}

export function isBestSeller(product: ShopProduct) {
  return product.badge === "Best Seller" || bestSellerSlugs.includes(product.slug as (typeof bestSellerSlugs)[number]);
}

export function getProductSocialProof(product: ShopProduct) {
  const seed = product.slug.length * 7 + product.stock;
  const athleteCount = 42 + (seed % 90);
  if (isBestSeller(product)) {
    return `Purchased by ${athleteCount} athletes`;
  }
  if (product.category === "competition-equipment" || product.category === "official-gear") {
    return "Used in championship events";
  }
  if (product.badge === "New" || product.badge === "New Arrival") {
    return "Popular with fighters";
  }
  if (product.category === "championship-collection") {
    return "Limited drop — collector demand";
  }
  return `Trusted by ${athleteCount} JTGC members`;
}

export function getProductBadges(product: ShopProduct) {
  const badges: string[] = [];

  function addBadge(badge: string) {
    if (!badges.includes(badge)) {
      badges.push(badge);
    }
  }

  if (isBestSeller(product)) addBadge("Best Seller");
  if (product.badge) addBadge(product.badge);
  if (product.category === "competition-equipment") addBadge("Official Competition");
  if (product.stock <= 15) addBadge("Limited");
  if (product.slug.includes("signed") || product.category === "championship-collection") addBadge("Limited Edition");

  return badges.slice(0, 3);
}

export function getStockLabel(stock: number) {
  if (stock <= 12) {
    return { label: `Only ${stock} left`, urgent: true, ships: "Ships tomorrow" };
  }
  if (stock <= 24) {
    return { label: "Low stock", urgent: false, ships: "Ships tomorrow" };
  }
  return { label: "In stock", urgent: false, ships: "Ships in 1–3 days" };
}

export function getAthletesUsingProduct(slug: string) {
  return productAthleteUsers[slug] ?? ["Juan Reyes", "Mark Cruz"];
}
