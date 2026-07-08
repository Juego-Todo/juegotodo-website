-- Align database admin checks with platform owner emails and allow self-service profile creation.

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
      and (
        role = 'admin'
        or lower(email) in ('admin@juegotodo.com', 'kiran.aames@gmail.com')
      )
  );
$$;

update public.profiles
set role = 'admin'
where lower(email) in ('admin@juegotodo.com', 'kiran.aames@gmail.com')
  and role <> 'admin';

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "license_applications_update_own" on public.license_applications;
create policy "license_applications_update_own"
on public.license_applications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
