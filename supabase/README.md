# Supabase Setup

The Juego Todo site uses Supabase as the production backbone for auth, profiles, orders, and user data.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your project URL and anon key from **Project Settings → API**

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is required for admin mutations and reliable server-side profile repair. Never expose it to browser code.

Add the same variables in **Vercel → Project Settings → Environment Variables**.

## 3. Run the database schema

Open **Supabase → SQL Editor** and run the full script in:

`supabase/schema.sql`

For an existing project, apply every file in `supabase/migrations` in filename order. The latest required auth repair is:

`supabase/migrations/20260711000000_repair_auth_signup_trigger.sql`

Do not apply only selected auth migrations: the signup trigger, profile columns, RLS policies, and backfill depend on the complete ordered chain.

### Membership & Licensing Portal (required for `/membership`)

After the migrations above (through `20260731000000_profiles_assigned_tags.sql`), apply:

`supabase/migrations/20260820000000_membership_application_portal.sql`

This migration:

- Hardens profile self-updates (`assigned_tags`, `account_type`, `membership_tier`)
- Extends `license_applications` with application/payment lifecycle fields
- Adds `application_documents`, `application_payments`, `application_history`
- Creates the private Storage bucket `application-documents` with owner/admin policies

**Verify after apply** (SQL Editor):

```sql
select id, name, public from storage.buckets where id = 'application-documents';
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'license_applications'
  and column_name in ('application_number', 'application_status', 'payment_status');
select to_regclass('public.application_documents') as documents,
       to_regclass('public.application_payments') as payments,
       to_regclass('public.application_history') as history;
```

Expect: one private bucket row, three column names, and three non-null relation names.

This creates:

- `profiles` (extends auth users)
- `addresses`, `wishlist_items`, `saved_*`, `notifications`
- `orders` with JSON line items and payment payloads
- Row Level Security policies
- Auto profile creation on signup

Username availability requires `supabase/migrations/20260705000000_is_username_available.sql`. The service role provides a server-side fallback.

## 4. Auth redirect URLs

In **Supabase → Authentication → URL Configuration**, add:

- Site URL: `https://your-production-domain.com`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/auth/callback`

## 5. Admin access

Set a user's `profiles.role` to `admin` in the database, or register with a platform owner email (`admin@juegotodo.com`, `kiran.aames@gmail.com`).

## Fallback mode

If Supabase env vars are missing, browser-local demo auth is available only in development. Production fails closed instead of exposing test accounts.
