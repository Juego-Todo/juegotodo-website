-- Juego Todo Supabase backbone
-- Run in Supabase SQL Editor or via Supabase CLI migrations.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  username text not null default '',
  account_type text not null default 'fan',
  role text not null default 'user',
  gender text not null default '',
  date_of_birth text not null default '',
  gym text not null default '',
  city text not null default '',
  bio text not null default '',
  phone text not null default '',
  country text not null default 'Philippines',
  membership_tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  phone text not null default '',
  line1 text not null,
  line2 text not null default '',
  city text not null,
  province text not null default '',
  postal_code text not null default '',
  country text not null default 'Philippines',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create table if not exists public.saved_fighters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fighter_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, fighter_slug)
);

create table if not exists public.saved_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, team_slug)
);

create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_slug)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  user_email text not null,
  user_name text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0,
  promo_code text,
  shipping numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  status text not null default 'pending',
  payment jsonb not null,
  shipping_address jsonb not null,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists notifications_user_id_idx on public.notifications (user_id);
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    username,
    role,
    gender,
    date_of_birth,
    account_type,
    city,
    phone,
    country
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    case
      when lower(coalesce(new.email, '')) in ('admin@juegotodo.com', 'kiran.aames@gmail.com') then 'admin'
      else 'user'
    end,
    coalesce(new.raw_user_meta_data ->> 'gender', ''),
    coalesce(new.raw_user_meta_data ->> 'date_of_birth', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'account_type', ''), 'fan'),
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'Philippines')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    username = excluded.username,
    gender = excluded.gender,
    date_of_birth = excluded.date_of_birth,
    account_type = excluded.account_type,
    city = excluded.city,
    phone = excluded.phone,
    country = excluded.country,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_username_available(check_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(username) = lower(nullif(trim(check_username), ''))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.saved_fighters enable row level security;
alter table public.saved_teams enable row level security;
alter table public.saved_events enable row level security;
alter table public.notifications enable row level security;
alter table public.orders enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_update_admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "addresses_all_own"
on public.addresses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "wishlist_all_own"
on public.wishlist_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_fighters_all_own"
on public.saved_fighters for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_teams_all_own"
on public.saved_teams for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_events_all_own"
on public.saved_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notifications_all_own"
on public.notifications for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "orders_select_own_or_admin"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

create policy "orders_insert_own"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "orders_update_admin"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.license_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  user_email text not null default '',
  status text not null default 'pending',
  application_program text not null default 'jt1_member',
  restriction_code text not null default 'JT1',
  full_name text not null default '',
  id_number text not null default '',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists license_applications_status_idx on public.license_applications (status);
create index if not exists license_applications_submitted_at_idx on public.license_applications (submitted_at desc);

drop trigger if exists license_applications_set_updated_at on public.license_applications;
create trigger license_applications_set_updated_at
before update on public.license_applications
for each row execute function public.set_updated_at();

alter table public.license_applications enable row level security;

create policy "license_applications_select_own_or_admin"
on public.license_applications for select
using (auth.uid() = user_id or public.is_admin());

create policy "license_applications_insert_own"
on public.license_applications for insert
with check (auth.uid() = user_id);

create policy "license_applications_update_admin"
on public.license_applications for update
using (public.is_admin())
with check (public.is_admin());

create policy "license_applications_delete_admin"
on public.license_applications for delete
using (public.is_admin());
