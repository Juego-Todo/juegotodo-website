import { HomePage } from "@/components/HomePage";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DEFAULT_DESCRIPTION, SITE_DEFAULT_TITLE } from "@/lib/seo/config";

export const metadata = {
  ...buildPageMetadata({
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    path: "/",
    image: "/hero-background.png",
    imageAlt: "Juego Todo Filipino combat sports athletes in competition",
    keywords: ["weaponized combat league", "Filipino combat sports", "buy fight tickets", "Barrio Brawls"],
  }),
  title: {
    absolute: SITE_DEFAULT_TITLE,
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <HomePage />
    </>
  );
}
