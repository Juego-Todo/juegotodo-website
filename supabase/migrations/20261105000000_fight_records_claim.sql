-- Fight records, Latayanology fighters, claiming, and guardian access.
-- Do not apply automatically; run manually after review.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core fight card tables
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  venue text not null default '',
  series text not null default '',
  source_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fighters (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  nickname text not null default '',
  gym text not null default '',
  hometown text not null default '',
  height text not null default '',
  weight_class text not null default '',
  photo_url text not null default '',
  photo_source_url text not null default '',
  date_of_birth date,
  is_minor boolean generated always as (
    case
      when date_of_birth is null then false
      else date_of_birth > (current_date - interval '18 years')
    end
  ) stored,
  user_id uuid unique references public.profiles (id) on delete set null,
  claim_status text not null default 'unclaimed'
    check (claim_status in ('unclaimed', 'pending', 'claimed')),
  public_visibility boolean not null default true,
  normalized_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fighters_slug_unique unique (slug)
);

create index if not exists fighters_normalized_name_idx on public.fighters (normalized_name);
create index if not exists fighters_gym_idx on public.fighters (lower(gym));
create index if not exists fighters_user_id_idx on public.fighters (user_id);

create table if not exists public.bouts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  bout_order integer not null,
  bout_label text not null default '',
  category text not null default ''
    check (category in ('', 'minor', 'female', 'amateur', 'pro')),
  division text not null default '',
  weight_class text not null default '',
  format text not null default '',
  method text not null default '',
  round text not null default '',
  time_remaining text not null default '',
  referee text not null default '',
  source_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, bout_order)
);

create index if not exists bouts_event_id_idx on public.bouts (event_id, bout_order);

create table if not exists public.bout_participants (
  id uuid primary key default gen_random_uuid(),
  bout_id uuid not null references public.bouts (id) on delete cascade,
  fighter_id uuid not null references public.fighters (id) on delete restrict,
  corner text not null check (corner in ('blue', 'red')),
  result text not null default ''
    check (result in ('', 'win', 'loss', 'draw', 'no_contest')),
  record_at_time text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bout_id, corner),
  unique (bout_id, fighter_id)
);

create index if not exists bout_participants_fighter_id_idx
  on public.bout_participants (fighter_id);

-- ---------------------------------------------------------------------------
-- Import review queue + sheet summary cross-check
-- ---------------------------------------------------------------------------

create table if not exists public.fighter_match_reviews (
  id uuid primary key default gen_random_uuid(),
  import_batch_id text not null,
  candidate_normalized_name text not null,
  candidate_first_name text not null default '',
  candidate_last_name text not null default '',
  candidate_gym text not null default '',
  existing_fighter_id uuid references public.fighters (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'merged', 'created', 'dismissed')),
  note text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sheet_record_snapshots (
  id uuid primary key default gen_random_uuid(),
  import_batch_id text not null,
  event_source_key text not null,
  fighter_first_name text not null default '',
  fighter_last_name text not null default '',
  corner text not null default '',
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace view public.fighter_records as
select
  f.id as fighter_id,
  f.slug,
  f.display_name,
  count(*) filter (where bp.result = 'win')::integer as wins,
  count(*) filter (where bp.result = 'loss')::integer as losses,
  count(*) filter (where bp.result = 'draw')::integer as draws,
  count(*) filter (where bp.result = 'no_contest')::integer as no_contests
from public.fighters f
left join public.bout_participants bp on bp.fighter_id = f.id
group by f.id, f.slug, f.display_name;

-- ---------------------------------------------------------------------------
-- Claiming
-- ---------------------------------------------------------------------------

create table if not exists public.fighter_claims (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references public.fighters (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  evidence_path text not null default '',
  reviewed_by uuid references public.profiles (id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists fighter_claims_one_approved_per_fighter
  on public.fighter_claims (fighter_id)
  where status = 'approved';

create table if not exists public.fighter_claim_invites (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references public.fighters (id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Guardians for minors
-- ---------------------------------------------------------------------------

create table if not exists public.fighter_guardians (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references public.fighters (id) on delete cascade,
  guardian_user_id uuid not null references public.profiles (id) on delete cascade,
  relationship text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'revoked')),
  consent_signed_at timestamptz,
  proof_path text not null default '',
  reviewed_by uuid references public.profiles (id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fighter_id, guardian_user_id)
);

create table if not exists public.fighter_guardian_actions (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references public.fighters (id) on delete cascade,
  guardian_user_id uuid references public.profiles (id) on delete set null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fighter_profile_change_requests (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references public.fighters (id) on delete cascade,
  requested_by uuid not null references public.profiles (id) on delete cascade,
  proposed_changes jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists fighters_set_updated_at on public.fighters;
create trigger fighters_set_updated_at before update on public.fighters
for each row execute function public.set_updated_at();

drop trigger if exists bouts_set_updated_at on public.bouts;
create trigger bouts_set_updated_at before update on public.bouts
for each row execute function public.set_updated_at();

drop trigger if exists bout_participants_set_updated_at on public.bout_participants;
create trigger bout_participants_set_updated_at before update on public.bout_participants
for each row execute function public.set_updated_at();

drop trigger if exists fighter_claims_set_updated_at on public.fighter_claims;
create trigger fighter_claims_set_updated_at before update on public.fighter_claims
for each row execute function public.set_updated_at();

drop trigger if exists fighter_guardians_set_updated_at on public.fighter_guardians;
create trigger fighter_guardians_set_updated_at before update on public.fighter_guardians
for each row execute function public.set_updated_at();

create or replace function public.is_approved_guardian(target_fighter uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.fighter_guardians g
    where g.fighter_id = target_fighter
      and g.guardian_user_id = auth.uid()
      and g.status = 'approved'
  );
$$;

create or replace function public.is_claimed_fighter_owner(target_fighter uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.fighters f
    where f.id = target_fighter
      and f.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.fighters enable row level security;
alter table public.bouts enable row level security;
alter table public.bout_participants enable row level security;
alter table public.fighter_match_reviews enable row level security;
alter table public.sheet_record_snapshots enable row level security;
alter table public.fighter_claims enable row level security;
alter table public.fighter_claim_invites enable row level security;
alter table public.fighter_guardians enable row level security;
alter table public.fighter_guardian_actions enable row level security;
alter table public.fighter_profile_change_requests enable row level security;

create policy events_public_read on public.events for select to anon, authenticated using (true);
create policy events_admin_write on public.events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighters_public_read on public.fighters for select to anon, authenticated
  using (public_visibility = true or public.is_admin() or user_id = auth.uid() or public.is_approved_guardian(id));

create policy fighters_admin_write on public.fighters for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighters_owner_or_guardian_update on public.fighters for update to authenticated
  using (public.is_claimed_fighter_owner(id) or public.is_approved_guardian(id))
  with check (public.is_claimed_fighter_owner(id) or public.is_approved_guardian(id));

create policy bouts_public_read on public.bouts for select to anon, authenticated using (true);
create policy bouts_admin_write on public.bouts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy bout_participants_public_read on public.bout_participants for select to anon, authenticated using (true);
create policy bout_participants_admin_write on public.bout_participants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighter_match_reviews_admin on public.fighter_match_reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy sheet_record_snapshots_admin on public.sheet_record_snapshots for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighter_claims_select_own_or_admin on public.fighter_claims for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy fighter_claims_insert_own on public.fighter_claims for insert to authenticated
  with check (user_id = auth.uid());
create policy fighter_claims_admin_update on public.fighter_claims for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighter_claim_invites_admin on public.fighter_claim_invites for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighter_guardians_select_related on public.fighter_guardians for select to authenticated
  using (
    public.is_admin()
    or guardian_user_id = auth.uid()
    or public.is_claimed_fighter_owner(fighter_id)
  );
create policy fighter_guardians_insert_own on public.fighter_guardians for insert to authenticated
  with check (guardian_user_id = auth.uid() or public.is_admin());
create policy fighter_guardians_admin_update on public.fighter_guardians for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy fighter_guardian_actions_select on public.fighter_guardian_actions for select to authenticated
  using (
    public.is_admin()
    or guardian_user_id = auth.uid()
    or public.is_claimed_fighter_owner(fighter_id)
  );
create policy fighter_guardian_actions_insert on public.fighter_guardian_actions for insert to authenticated
  with check (actor_user_id = auth.uid() or public.is_admin());

create policy fighter_change_requests_select on public.fighter_profile_change_requests for select to authenticated
  using (
    public.is_admin()
    or requested_by = auth.uid()
    or public.is_approved_guardian(fighter_id)
    or public.is_claimed_fighter_owner(fighter_id)
  );
create policy fighter_change_requests_insert on public.fighter_profile_change_requests for insert to authenticated
  with check (requested_by = auth.uid());
create policy fighter_change_requests_admin_or_guardian_update on public.fighter_profile_change_requests for update to authenticated
  using (public.is_admin() or public.is_approved_guardian(fighter_id))
  with check (public.is_admin() or public.is_approved_guardian(fighter_id));

-- Private evidence buckets
insert into storage.buckets (id, name, public)
values ('fighter-claim-evidence', 'fighter-claim-evidence', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('fighter-guardian-proof', 'fighter-guardian-proof', false)
on conflict (id) do nothing;

create policy fighter_claim_evidence_owner_read on storage.objects for select to authenticated
  using (
    bucket_id = 'fighter-claim-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy fighter_claim_evidence_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fighter-claim-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy fighter_guardian_proof_owner_read on storage.objects for select to authenticated
  using (
    bucket_id = 'fighter-guardian-proof'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy fighter_guardian_proof_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fighter-guardian-proof'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
