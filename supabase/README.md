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

`SUPABASE_SERVICE_ROLE_KEY` enables server-side username availability checks during registration without extra SQL setup.

Add the same variables in **Vercel → Project Settings → Environment Variables**.

## 3. Run the database schema

Open **Supabase → SQL Editor** and run the full script in:

`supabase/schema.sql`

This creates:

- `profiles` (extends auth users)
- `addresses`, `wishlist_items`, `saved_*`, `notifications`
- `orders` with JSON line items and payment payloads
- Row Level Security policies
- Auto profile creation on signup

For username availability during sign-up, either:

- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (recommended), or
- Run `supabase/migrations/20260705000000_is_username_available.sql` in the SQL Editor

## 4. Auth redirect URLs

In **Supabase → Authentication → URL Configuration**, add:

- Site URL: `https://your-production-domain.com`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/auth/callback`

## 5. Admin access

Set a user's `profiles.role` to `admin` in the database, or register with `admin@juegotodo.com`.

## Fallback mode

If Supabase env vars are missing, the app falls back to browser localStorage for development previews.
