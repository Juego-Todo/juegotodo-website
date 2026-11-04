-- Attach fight_records and coach_roster_links to profiles.id via fighter_user_id.
-- Prefer profiles.fighter_slug; fall back to approved license payload.fighterSlug.

update public.fight_records as records
set
  fighter_user_id = profiles.id,
  updated_at = now()
from public.profiles as profiles
where records.fighter_user_id is null
  and profiles.fighter_slug is not null
  and profiles.fighter_slug = records.fighter_slug;

update public.fight_records as records
set
  fighter_user_id = licenses.user_id,
  updated_at = now()
from public.license_applications as licenses
where records.fighter_user_id is null
  and licenses.status = 'approved'
  and (
    licenses.application_program = 'fighter_license'
    or licenses.restriction_code = 'JT11'
  )
  and coalesce(licenses.payload ->> 'fighterSlug', '') = records.fighter_slug;

update public.coach_roster_links as roster
set
  fighter_user_id = profiles.id,
  updated_at = now()
from public.profiles as profiles
where roster.fighter_user_id is null
  and profiles.fighter_slug is not null
  and profiles.fighter_slug = roster.fighter_slug;

update public.coach_roster_links as roster
set
  fighter_user_id = licenses.user_id,
  updated_at = now()
from public.license_applications as licenses
where roster.fighter_user_id is null
  and licenses.status = 'approved'
  and (
    licenses.application_program = 'fighter_license'
    or licenses.restriction_code = 'JT11'
  )
  and coalesce(licenses.payload ->> 'fighterSlug', '') = roster.fighter_slug;

create index if not exists fight_records_fighter_user_id_idx
  on public.fight_records (fighter_user_id, event_date desc);

create index if not exists coach_roster_links_fighter_user_id_idx
  on public.coach_roster_links (fighter_user_id)
  where fighter_user_id is not null;
