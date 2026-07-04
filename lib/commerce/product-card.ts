import type { ShopProduct } from "@/data/shop";
import { getMemberDisplayPricing } from "@/lib/commerce/pricing";
import {
  bestSellerSlugs,
  getProductRating,
  getProductSocialProof,
  newArrivalSlugs,
} from "@/lib/commerce/product-visuals";

export function getProductCardBadge(product: ShopProduct): string {
  if (product.eventTicket) {
    return product.badge ?? "On Sale";
  }
  if (product.stock <= 12) {
    return `Only ${product.stock} Left`;
  }
  if (newArrivalSlugs.includes(product.slug as (typeof newArrivalSlugs)[number])) {
    return "New";
  }
  if (product.category === "competition-equipment") {
    return "Competition Approved";
  }
  if (bestSellerSlugs.includes(product.slug as (typeof bestSellerSlugs)[number])) {
    return "Most Popular";
  }
  if (product.badge === "Limited Drop" || product.stock <= 24) {
    return "Limited";
  }
  if (product.category === "official-gear" || product.category === "championship-collection") {
    return "Official JT";
  }
  return product.badge ?? "Official JT";
}

export function getProductCardSecondaryBadge(product: ShopProduct): string | null {
  if (product.eventTicket) {
    return "Digital Ticket";
  }
  if (product.stock <= 12 && product.category === "competition-equipment") {
    return "Low Stock";
  }
  if (product.badge && product.badge !== getProductCardBadge(product)) {
    return product.badge;
  }
  if (product.category === "competition-equipment" && getProductCardBadge(product) !== "Competition Approved") {
    return "Competition Approved";
  }
  return null;
}

export function getProductCardBenefits(product: ShopProduct, max = 3): string[] {
  return product.features.slice(0, max).map((feature) => {
    const trimmed = feature.replace(/\.$/, "");
    return trimmed.length > 42 ? `${trimmed.slice(0, 39)}…` : trimmed;
  });
}

export function getProductEcosystemLine(product: ShopProduct): string {
  if (product.eventTicket) {
    return "Official JTGC Event Admission";
  }
  if (product.slug.includes("helmet") || product.category === "protective-equipment") {
    return "Required for Official JT Events";
  }
  if (product.slug.includes("shorts") || product.slug.includes("gloves")) {
    return "Approved for National Events";
  }
  if (product.category === "competition-equipment") {
    return "Approved for National Events";
  }
  if (product.category === "official-gear") {
    return "Official JT Competition Equipment";
  }
  return "Official Supporter Merchandise";
}

export function getProductTrustLines(product: ShopProduct): string[] {
  if (product.eventTicket) {
    return ["Official Juego Todo Event Ticket", "Instant QR Delivery"];
  }

  const lines = ["Official Juego Todo Merchandise"];

  if (
    product.category === "competition-equipment" ||
    product.category === "official-gear" ||
    product.competitionUse.toLowerCase().includes("competition")
  ) {
    lines.push("Competition Approved");
  }

  return lines.slice(0, 2);
}

export function getShippingConfidence(product: ShopProduct): string {
  if (product.digital) {
    return "Instant Digital Delivery";
  }
  return "Ships within 24 Hours · Nationwide Delivery";
}

export function getProductSoldThisMonth(product: ShopProduct): number {
  let hash = 0;
  for (let index = 0; index < product.slug.length; index += 1) {
    hash = (hash * 17 + product.slug.charCodeAt(index)) >>> 0;
  }
  return 38 + ((hash + product.priceAmount) % 264);
}

export function getProductCardSocialProof(product: ShopProduct) {
  const { rating } = getProductRating(product);
  const soldThisMonth = getProductSoldThisMonth(product);
  const proofLine = getProductSocialProof(product);

  return { rating, soldThisMonth, proofLine };
}

export function getProductMemberPricing(product: ShopProduct) {
  return getMemberDisplayPricing(product.priceAmount);
}
