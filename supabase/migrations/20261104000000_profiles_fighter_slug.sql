-- Unique public fighter slug tied to profiles.id.
-- Backfills approved JT11 / fighter_license applicants and keeps payload.fighterSlug in sync.

alter table public.profiles
  add column if not exists fighter_slug text;

create unique index if not exists profiles_fighter_slug_unique_idx
  on public.profiles (fighter_slug)
  where fighter_slug is not null;

create or replace function public.slugify_fighter_name(value text)
returns text
language sql
immutable
as $$
  select left(
    trim(both '-' from lower(regexp_replace(coalesce(value, ''), '[^a-zA-Z0-9]+', '-', 'g'))),
    80
  );
$$;

do $$
declare
  application_row record;
  base_slug text;
  candidate text;
  suffix integer;
begin
  for application_row in
    select distinct on (la.user_id)
      la.id,
      la.user_id,
      la.full_name,
      coalesce(nullif(la.payload ->> 'fighterSlug', ''), '') as payload_slug,
      coalesce(nullif(la.payload #>> '{backgroundAnswers,nickname}', ''), '') as nickname,
      coalesce(nullif(la.payload ->> 'firstName', ''), '') as first_name,
      coalesce(nullif(la.payload ->> 'lastName', ''), '') as last_name
    from public.license_applications as la
    where la.status = 'approved'
      and (
        la.application_program = 'fighter_license'
        or la.restriction_code = 'JT11'
      )
    order by la.user_id, la.reviewed_at desc nulls last, la.submitted_at desc
  loop
    if exists (
      select 1
      from public.profiles as profiles
      where profiles.id = application_row.user_id
        and profiles.fighter_slug is not null
        and length(trim(profiles.fighter_slug)) > 0
    ) then
      continue;
    end if;

    base_slug := public.slugify_fighter_name(application_row.payload_slug);

    if base_slug = '' and application_row.nickname <> '' then
      base_slug := public.slugify_fighter_name(
        concat_ws(
          '-',
          nullif(application_row.first_name, ''),
          application_row.nickname,
          nullif(application_row.last_name, '')
        )
      );
    end if;

    if base_slug = '' then
      base_slug := public.slugify_fighter_name(application_row.full_name);
    end if;

    if base_slug = '' then
      base_slug := 'fighter-' || left(application_row.user_id::text, 8);
    end if;

    candidate := base_slug;
    suffix := 2;

    while exists (
      select 1
      from public.profiles as profiles
      where profiles.fighter_slug = candidate
        and profiles.id is distinct from application_row.user_id
    ) loop
      candidate := left(base_slug, 70) || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    update public.profiles
    set
      fighter_slug = candidate,
      updated_at = now()
    where id = application_row.user_id;

    update public.license_applications
    set
      payload = jsonb_set(coalesce(payload, '{}'::jsonb), '{fighterSlug}', to_jsonb(candidate), true),
      updated_at = now()
    where id = application_row.id;
  end loop;
end;
$$;
