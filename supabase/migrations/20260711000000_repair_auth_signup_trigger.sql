-- Ensure every auth signup creates a matching profile, even when migrations
-- were applied without re-running the full schema file.

alter table public.profiles add column if not exists gender text not null default '';
alter table public.profiles add column if not exists date_of_birth text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists country text not null default 'Philippines';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := nullif(lower(trim(new.raw_user_meta_data ->> 'username')), '');

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
      requested_username,
      lower(split_part(coalesce(new.email, 'member'), '@', 1)) || '-' || left(new.id::text, 8)
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

grant execute on function public.handle_new_user() to service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@juegotodo.com', 'kiran.aames@gmail.com')
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    );
$$;
