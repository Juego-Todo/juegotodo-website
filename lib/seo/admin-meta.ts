import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function buildAdminMetadata(title: string, path: string): Metadata {
  return buildPageMetadata({
    title,
    description: "Juego Todo administration.",
    path,
    noIndex: true,
  });
}
