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
  "barrio-brawls-tickets": "digital",
  "official-arnis-stick-pair": "sticks",
  "jt-competition-gloves": "gloves",
  "jt-competition-helmet": "helmet",
  "jt-competition-jersey": "jersey",
  "championship-replica-belt": "belt",
  "champion-jersey-signed": "jersey",
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

export const heroShowcaseSlugs = ["jt-competition-gloves", "jt-competition-helmet", "jt-competition-jersey"] as const;

export const heroFeaturedSlugs = [
  { slug: "jt-competition-gloves", badge: "Best Seller" as const },
  { slug: "jt-competition-jersey", badge: "New Arrival" as const },
  { slug: "championship-replica-belt", badge: "Limited Drop" as const },
] as const;

export const bestSellerSlugs = [
  "juego-todo-shirt",
  "jt-competition-helmet",
  "juego-todo-fight-shorts",
  "juego-todo-premium-shirt",
  "juego-todo-trucker-cap",
  "juego-todo-id-lanyard",
  "juego-todo-sleeveless-hoodie",
  "jt-competition-gloves",
] as const;

export const bundleSlugs = ["jt-competition-gloves", "jt-competition-helmet", "jt-competition-jersey"] as const;

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
  "jt-fight-shorts",
  "jt-competition-jersey",
  "mouth-guard-elite",
  "jt-team-jersey",
] as const;

export const shopCollections = [
  {
    id: "competitor",
    name: "Competitor Collection",
    description: "Helmet, gloves, and wraps built for sanctioned JTGC competition.",
    href: "#bundles",
    imageKey: "gear" as ProductImageKey,
    items: ["JT Competition Helmet", "JT Competition Gloves", "Competition Hand Wraps"],
  },
  {
    id: "champion",
    name: "Champion Collection",
    description: "Walkout jersey, fight shorts, and official league equipment.",
    href: "/shop?category=apparel",
    imageKey: "jersey" as ProductImageKey,
    items: ["JT Competition Jersey", "JT Fight Shorts", "JT Team Jersey"],
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
    productSlug: "jt-competition-gloves",
    quote: "The grip profile is built for real weapon transitions.",
  },
  {
    athlete: "Brandon Vera",
    title: "Championship Veteran",
    productSlug: "foam-trainer-sticks",
    quote: "My go-to training kit for camp intensity without compromise.",
  },
] as const;

export const shopBundles = [
  {
    id: "beginner-kit",
    name: "Beginner Kit",
    slugs: ["solo-baston-training-stick", "training-knife-trainer", "competition-hand-wraps"],
    price: 2999,
    savings: 520,
  },
  {
    id: "competitor-kit",
    name: "Competitor Kit",
    slugs: ["jt-competition-gloves", "jt-competition-helmet", "jt-competition-jersey"],
    price: 8999,
    savings: 1400,
  },
  {
    id: "champion-bundle",
    name: "Champion Bundle",
    slugs: ["jt-competition-gloves", "jt-competition-helmet", "jt-competition-jersey", "championship-replica-belt"],
    price: 15999,
    savings: 3200,
  },
] as const;

export const shopCategoryTiles = [
  {
    label: "Official Gear",
    href: "/shop?category=official-gear",
    imageKey: "sticks" as ProductImageKey,
    description: "League sticks, bags, and sanctioned competition tools.",
  },
  {
    label: "Protective Equipment",
    href: "/shop?category=protective-equipment",
    imageKey: "protective" as ProductImageKey,
    description: "Wraps, guards, and safety essentials.",
  },
  {
    label: "Training Equipment",
    href: "/shop?category=training-equipment",
    imageKey: "training" as ProductImageKey,
    description: "Sticks, trainers, and gym-ready drill tools.",
  },
  {
    label: "Apparel",
    href: "/shop?category=apparel",
    imageKey: "apparel" as ProductImageKey,
    description: "Walkout gear, hoodies, and league apparel.",
  },
  {
    label: "Digital Courses",
    href: "/shop?category=digital-products",
    imageKey: "digital" as ProductImageKey,
    description: "Courses, rulebooks, and training libraries.",
  },
  {
    label: "Championship Collection",
    href: "/shop?category=championship-collection",
    imageKey: "belt" as ProductImageKey,
    description: "Belts, replicas, and premium collectibles.",
  },
] as const;

export const productAthleteUsers: Record<string, string[]> = {
  "jt-competition-gloves": ["Juan Reyes", "Mark Cruz", "Daniel Santos"],
  "jt-competition-helmet": ["Ana Bagaybay Santos", "Ramon Dumog Cruz"],
  "jt-competition-jersey": ["Miguel Lakan Reyes", "Carlo Diaz"],
  "official-arnis-stick-pair": ["Juan Reyes", "Noah Park"],
};

export function getProductImageKey(product: ShopProduct): ProductImageKey {
  return slugImageMap[product.slug] ?? categoryImageMap[product.category];
}

export function getProductRating(product: ShopProduct) {
  if (product.rating) {
    return { rating: product.rating, reviewCount: product.reviewCount ?? 0 };
  }

  const seed = product.slug.length + product.priceAmount;
  const rating = 4.6 + (seed % 4) * 0.1;
  const reviewCount = 48 + (seed % 140);
  return { rating: Math.min(5, Math.round(rating * 10) / 10), reviewCount };
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
    return "New arrival — ships tomorrow";
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
