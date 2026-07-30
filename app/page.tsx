import { HomePage } from "@/components/HomePage";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DEFAULT_DESCRIPTION, SITE_TAGLINE } from "@/lib/seo/config";

export const metadata = {
  ...buildPageMetadata({
    title: `Juego Todo | ${SITE_TAGLINE}`,
    description: SITE_DEFAULT_DESCRIPTION,
    path: "/",
    image: "/hero-background.png",
    keywords: ["weaponized combat league", "Filipino combat sports", "buy fight tickets"],
  }),
  title: {
    absolute: `Juego Todo | ${SITE_TAGLINE}`,
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
