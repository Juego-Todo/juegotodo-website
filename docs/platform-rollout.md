# Platform completion rollout

Apply migration `supabase/migrations/20260822000000_platform_completion.sql` in the Supabase SQL Editor (or via CLI) before enabling production features.

## Required environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth + data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin APIs, inquiries, calendar sync, promo redemption |
| `PAYMONGO_SECRET_KEY` | Live checkout |
| `PAYMONGO_WEBHOOK_SECRET` | Payment confirmation webhook |
| `RESEND_API_KEY` | Optional transactional email delivery |
| `RESEND_FROM_EMAIL` | Sender for outbox/Resend |
| `NEXT_PUBLIC_SITE_URL` | Canonical links in checkout + emails |

## New capabilities

- **Inquiries** — `/api/inquiries` powers partnership, contact, and seminar forms
- **Public calendar** — admin-created events merge on `/calendar` via `/api/calendar/public`
- **Admin portal** — documents, officials, council, reports, announcements, competitions panels under `/admin/*`
- **Member workspace** — membership, competition entries, certificates, medical, club, rankings, role tools
- **Promo security** — welcome codes validated/redeemed server-side during PayMongo checkout
- **Rules PDFs** — generated at `/rules/*.pdf` from official rulebook content

## Manual smoke checklist

1. Submit partnership form on `/partners` — success toast, row in admin inquiries (Supabase)
2. Publish calendar event in admin — appears on `/calendar`
3. Download rules PDF from `/rules-regulations`
4. Member: submit competition entry in profile deep section
5. Admin: approve document / announcement / competition entry
6. Checkout with valid `JT10-*` promo — discount applied once, redemption recorded
7. Mobile: cart drawer Escape closes; profile More sheet opens analytics; invoice scrolls on 320px width

## Local development

Without Supabase, inquiries fall back to browser `localStorage` and several member/admin APIs return empty states with friendly copy. Production should always run with Supabase configured.
