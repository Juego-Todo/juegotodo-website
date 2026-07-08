-- Fix incomplete profiles schema that breaks all new signups.
-- Symptom: auth.signUp returns "Database error saving new user".
-- Symptom: profiles trigger references gender/date_of_birth columns that do not exist yet.

alter table public.profiles add column if not exists gender text not null default '';
alter table public.profiles add column if not exists date_of_birth text not null default '';

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
