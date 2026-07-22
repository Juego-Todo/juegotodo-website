/**
 * PayMongo server-side configuration.
 *
 * Required environment variables (server-only — never expose to the browser):
 * - PAYMONGO_SECRET_KEY      e.g. sk_test_xxx or sk_live_xxx
 * - PAYMONGO_WEBHOOK_SECRET  e.g. whsk_xxx (from `POST /v1/webhooks` or the dashboard)
 */

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
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
