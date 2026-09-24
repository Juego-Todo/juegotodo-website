-- JuegoTodo Pro annual membership entitlement (separate from JT1 Local Membership).

create table if not exists public.pro_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null default 'pro' check (plan in ('pro')),
  status text not null default 'inactive'
    check (status in ('inactive', 'active', 'expired', 'cancelled', 'past_due', 'pending')),
  started_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'comped')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  order_id uuid references public.orders (id) on delete set null,
  membership_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pro_memberships_user_id_uidx
  on public.pro_memberships (user_id);

create index if not exists pro_memberships_status_expires_idx
  on public.pro_memberships (status, expires_at);

create index if not exists pro_memberships_membership_id_idx
  on public.pro_memberships (membership_id)
  where membership_id is not null;

create or replace function public.set_pro_memberships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pro_memberships_set_updated_at on public.pro_memberships;
create trigger pro_memberships_set_updated_at
before update on public.pro_memberships
for each row execute function public.set_pro_memberships_updated_at();

-- Users can read their own Pro row; only service role / admin may write.
alter table public.pro_memberships enable row level security;

drop policy if exists "Users can read own pro membership" on public.pro_memberships;
create policy "Users can read own pro membership"
  on public.pro_memberships
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can insert pro memberships" on public.pro_memberships;
create policy "Admins can insert pro memberships"
  on public.pro_memberships
  for insert
  with check (public.is_admin());

drop policy if exists "Admins can update pro memberships" on public.pro_memberships;
create policy "Admins can update pro memberships"
  on public.pro_memberships
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete pro memberships" on public.pro_memberships;
create policy "Admins can delete pro memberships"
  on public.pro_memberships
  for delete
  using (public.is_admin());

grant select on public.pro_memberships to authenticated;
grant all on public.pro_memberships to service_role;
