import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

const licenseRoles: Record<string, { title: string; description: string }> = {
  "": {
    title: "Register for a JTGC License",
    description:
      "Apply for an official Juego Todo Grand Council membership license — fighters, coaches, officials, clubs, and staff.",
  },
  fighter: {
    title: "Fighter License Application",
    description:
      "Submit your official JTGC fighter license application for admin approval and competition eligibility.",
  },
  coach: {
    title: "Coach License Application",
    description: "Apply for an official Juego Todo coach license through the JTGC membership pathway.",
  },
  "senior-coach": {
    title: "Senior Coach License Application",
    description: "Apply for a senior coach license with the Juego Todo Grand Council.",
  },
  trainer: {
    title: "Trainer License Application",
    description: "Submit your official Juego Todo trainer license application for admin approval.",
  },
  referee: {
    title: "Referee License Application",
    description: "Apply to become a licensed Juego Todo referee under JTGC competition standards.",
  },
  judge: {
    title: "Judge License Application",
    description: "Apply for an official Juego Todo judge license through the JTGC pathway.",
  },
  adviser: {
    title: "Adviser License Application",
    description: "Submit your Juego Todo adviser license application for Grand Council review.",
  },
  staff: {
    title: "Staff License Application",
    description: "Apply for official Juego Todo staff licensing and event operations credentials.",
  },
  "club-owner": {
    title: "Club Owner Application",
    description: "Register your gym or club for official Juego Todo affiliation and club-owner licensing.",
  },
  "grand-council-member": {
    title: "Grand Council Member Application",
    description: "Apply for Juego Todo Grand Council member status and governance participation.",
  },
  "grand-council-officer": {
    title: "Grand Council Officer Application",
    description: "Apply for a JTGC officer role within the Juego Todo Grand Council.",
  },
};

export function buildLicenseMetadata(role: keyof typeof licenseRoles = ""): Metadata {
  const entry = licenseRoles[role] ?? licenseRoles[""];
  const path = role ? `/register-for-license/${role}` : "/register-for-license";
  return buildPageMetadata({
    title: entry.title,
    description: entry.description,
    path,
    keywords: ["JTGC license", "Juego Todo membership", entry.title],
  });
}
