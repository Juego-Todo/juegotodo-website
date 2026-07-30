-- Persist admin-assigned identity tags on profiles (durable across devices).
alter table public.profiles
  add column if not exists assigned_tags text[] not null default '{}'::text[];

comment on column public.profiles.assigned_tags is
  'Admin-assigned user type tags (fighter, coach, staff, etc.) used for portal access.';
