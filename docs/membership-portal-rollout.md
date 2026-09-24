# Membership & Licensing Portal — Rollout

## Migration order

1. Ensure earlier migrations through `20260731000000_profiles_assigned_tags.sql` are applied.
2. Apply `supabase/migrations/20260820000000_membership_application_portal.sql`.
3. Confirm the private Storage bucket `application-documents` exists (created by the migration) and remains **private**.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin membership transitions)

Transactional email is **not** configured. Lifecycle updates use in-app `notifications` only.

## Payment assets

Official QR images (copied without transformation):

- `public/assets/payments/gcash-qr.jpg`
- `public/assets/payments/maya-qr.jpg`

GCash number shown in the UI: `09923040694`.

Payment screenshot upload **never** sets payment status to `VERIFIED`. Only admins can verify or reject via `/api/admin/membership-applications/[id]/transition`.

## Business configuration still open

Fee, eligibility, validity, and benefits for Local Membership are intentionally unset (`null` / omitted) until Juego Todo provides official values. The UI shows “To be confirmed by Juego Todo” where missing.

## License mutation security

Admin license review/delete and applicant role-license submits go through authenticated server routes:

- `POST /api/licenses` — applicant self-submit for role licenses only (blocks JT1/local membership; use Membership Portal)
- `GET|PATCH|DELETE /api/admin/licenses` — admin list/review/delete for **non-JT1** role licenses
- Membership apps are filtered to `application_program = jt1_member` and reviewed via `/api/admin/membership-applications`

Browser clients must not mutate `license_applications` directly for reviews or deletes.

## Safe rollout

1. Deploy migration during a maintenance window.
2. Deploy application code that includes membership APIs and UI.
3. Smoke-test applicant draft → upload → submit → admin verify payment → approve → ship → complete.
4. Confirm unauthorized users cannot access admin routes or signed document URLs for other users.

## Rollback

1. Revert application deploy to the previous release.
2. Do **not** drop new columns/tables if data was already collected; leave the migration in place and disable new UI routes via redeploy if needed.
3. If a full schema rollback is required, restore from a pre-migration database backup (destructive).

## Manual QA checklist

- [ ] Applicant can create draft, navigate steps backward, and re-upload documents
- [ ] Submit requires documents, payment proof, and consent
- [ ] After submit, payment status is Under Verification (not Verified)
- [ ] Applicant status page shows timeline, notes, and tracking when present
- [ ] Admin can verify/reject payment with reason
- [ ] Admin can request changes, approve, reject, process ID, ship, deliver, complete
- [ ] Non-admin cannot call admin transition APIs
- [ ] Document downloads use short-lived signed URLs only
- [ ] Mobile layout of apply + admin detail is usable
