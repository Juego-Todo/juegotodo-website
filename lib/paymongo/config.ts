/**
 * PayMongo server-side configuration.
 *
 * Required environment variables (server-only — never expose to the browser):
 * - PAYMONGO_SECRET_KEY      e.g. sk_test_xxx or sk_live_xxx
 * - PAYMONGO_WEBHOOK_SECRET  e.g. whsk_xxx (from `POST /v1/webhooks` or the dashboard)
 */

import { getCanonicalSiteUrl } from "@/lib/seo/config";

export function getPayMongoSecretKey(): string {
  return process.env.PAYMONGO_SECRET_KEY ?? "";
}

export function getPayMongoWebhookSecret(): string {
  return process.env.PAYMONGO_WEBHOOK_SECRET ?? "";
}

export function isPayMongoConfigured(): boolean {
  return getPayMongoSecretKey().length > 0;
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return getCanonicalSiteUrl();
}
