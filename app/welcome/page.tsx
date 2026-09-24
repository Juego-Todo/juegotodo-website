import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Welcome",
  description: "Continue to your Juego Todo member portal.",
  path: "/welcome",
});

/** Path chooser removed — send members straight to the portal. */
export default function WelcomePage() {
  redirect("/profile");
}
