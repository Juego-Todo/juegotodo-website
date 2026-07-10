-- Backfill profiles for auth users that signed up before the signup trigger/schema was fixed.
-- Safe to run multiple times.

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
select
  users.id,
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  coalesce(
    nullif(lower(users.raw_user_meta_data ->> 'username'), ''),
    split_part(coalesce(users.email, ''), '@', 1)
  ),
  case
    when lower(coalesce(users.email, '')) in ('admin@juegotodo.com', 'kiran.aames@gmail.com') then 'admin'
    else 'user'
  end,
  coalesce(users.raw_user_meta_data ->> 'gender', ''),
  coalesce(users.raw_user_meta_data ->> 'date_of_birth', ''),
  coalesce(nullif(users.raw_user_meta_data ->> 'account_type', ''), 'fan'),
  coalesce(users.raw_user_meta_data ->> 'city', ''),
  coalesce(users.raw_user_meta_data ->> 'phone', ''),
  coalesce(nullif(users.raw_user_meta_data ->> 'country', ''), 'Philippines')
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;
