-- Persist license applications for admin review queues.

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
