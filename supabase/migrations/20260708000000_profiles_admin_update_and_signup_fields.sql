-- Allow admins to update member profiles and persist richer signup metadata.

create policy "profiles_update_admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

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
  on conflict (id) do nothing;
  return new;
end;
$$;
