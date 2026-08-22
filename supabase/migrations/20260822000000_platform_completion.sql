-- Platform completion: inquiries, calendar, announcements, documents, competitions,
-- officials, council, catalog, consultations, promos, fight records, email outbox.

-- ---------------------------------------------------------------------------
-- Inquiries (partnership, contact, seminar)
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('partnership', 'contact', 'seminar')),
  status text not null default 'new' check (status in ('new', 'reviewed', 'closed')),
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  organization text not null default '',
  subject text not null default '',
  message text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_type_status_idx on public.inquiries (inquiry_type, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Calendar events (admin-created; static site events remain in code)
-- ---------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_date timestamptz not null,
  published boolean not null default false,
  operational_status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendar_events_public_idx
  on public.calendar_events (published, event_date)
  where published = true;

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  audience text not null default 'all' check (audience in ('all', 'members', 'fighters', 'officials', 'staff')),
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_published_idx on public.announcements (published, published_at desc);

-- ---------------------------------------------------------------------------
-- Member documents (certificates, medical, credentials)
-- ---------------------------------------------------------------------------
create table if not exists public.member_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('certificate', 'medical', 'credential', 'other')),
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  storage_path text not null default '',
  expires_at timestamptz,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_documents_user_idx on public.member_documents (user_id, document_type, status);

-- ---------------------------------------------------------------------------
-- Competition entries
-- ---------------------------------------------------------------------------
create table if not exists public.competition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  event_title text not null default '',
  division text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists competition_entries_user_idx on public.competition_entries (user_id, status);

-- ---------------------------------------------------------------------------
-- Official assignments
-- ---------------------------------------------------------------------------
create table if not exists public.official_assignments (
  id uuid primary key default gen_random_uuid(),
  official_user_id uuid not null references public.profiles(id) on delete cascade,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  role text not null check (role in ('referee', 'judge', 'official', 'medic')),
  event_title text not null default '',
  status text not null default 'assigned' check (status in ('assigned', 'confirmed', 'completed', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists official_assignments_user_idx on public.official_assignments (official_user_id, status);

-- ---------------------------------------------------------------------------
-- Grand council records
-- ---------------------------------------------------------------------------
create table if not exists public.council_records (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('decision', 'committee', 'regional', 'governance')),
  title text not null,
  summary text not null default '',
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Coach roster links
-- ---------------------------------------------------------------------------
create table if not exists public.coach_roster_links (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references public.profiles(id) on delete cascade,
  fighter_user_id uuid references public.profiles(id) on delete set null,
  fighter_name text not null default '',
  fighter_slug text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_user_id, fighter_slug)
);

create index if not exists coach_roster_links_coach_idx on public.coach_roster_links (coach_user_id, status);

-- ---------------------------------------------------------------------------
-- Shop catalog overrides
-- ---------------------------------------------------------------------------
create table if not exists public.shop_catalog_products (
  slug text primary key,
  payload jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Consultation bookings
-- ---------------------------------------------------------------------------
create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  service_slug text not null,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  notes text not null default '',
  payment_status text not null default 'unpaid',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Promo codes
-- ---------------------------------------------------------------------------
create table if not exists public.promo_codes (
  code text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  discount_percent numeric(5, 2) not null default 10,
  redeemed boolean not null default false,
  redeemed_at timestamptz,
  order_id uuid references public.orders(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_user_idx on public.promo_codes (user_id, redeemed);

-- ---------------------------------------------------------------------------
-- Fight records
-- ---------------------------------------------------------------------------
create table if not exists public.fight_records (
  id uuid primary key default gen_random_uuid(),
  fighter_slug text not null,
  fighter_user_id uuid references public.profiles(id) on delete set null,
  opponent_name text not null default '',
  event_title text not null default '',
  event_date timestamptz,
  result text not null default '',
  method text not null default '',
  round text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fight_records_fighter_idx on public.fight_records (fighter_slug, event_date desc);

-- ---------------------------------------------------------------------------
-- Email outbox
-- ---------------------------------------------------------------------------
create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  body text not null,
  template text not null default 'generic',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error_message text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'inquiries', 'calendar_events', 'announcements', 'member_documents',
    'competition_entries', 'official_assignments', 'council_records',
    'coach_roster_links', 'shop_catalog_products', 'consultation_bookings',
    'fight_records'
  ]
  loop
    execute format('drop trigger if exists touch_%I_updated_at on public.%I', tbl, tbl);
    execute format(
      'create trigger touch_%I_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      tbl, tbl
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.inquiries enable row level security;
alter table public.calendar_events enable row level security;
alter table public.announcements enable row level security;
alter table public.member_documents enable row level security;
alter table public.competition_entries enable row level security;
alter table public.official_assignments enable row level security;
alter table public.council_records enable row level security;
alter table public.coach_roster_links enable row level security;
alter table public.shop_catalog_products enable row level security;
alter table public.consultation_bookings enable row level security;
alter table public.promo_codes enable row level security;
alter table public.fight_records enable row level security;
alter table public.email_outbox enable row level security;

-- Public can insert inquiries
create policy inquiries_public_insert on public.inquiries for insert to anon, authenticated with check (true);
create policy inquiries_admin_all on public.inquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Calendar: public read published; admin full
create policy calendar_public_read on public.calendar_events for select to anon, authenticated
  using (published = true);
create policy calendar_admin_all on public.calendar_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Announcements: public read published; admin full
create policy announcements_public_read on public.announcements for select to anon, authenticated
  using (published = true);
create policy announcements_admin_all on public.announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Member documents: owner read own; admin all
create policy member_documents_owner_read on public.member_documents for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy member_documents_owner_insert on public.member_documents for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy member_documents_admin_update on public.member_documents for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Competition entries: owner CRUD own; admin all
create policy competition_entries_owner on public.competition_entries for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Official assignments: assignee read; admin all
create policy official_assignments_read on public.official_assignments for select to authenticated
  using (official_user_id = auth.uid() or public.is_admin());
create policy official_assignments_admin on public.official_assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Council records: authenticated read active; admin write
create policy council_records_read on public.council_records for select to authenticated
  using (status = 'active' or public.is_admin());
create policy council_records_admin on public.council_records for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Coach roster: coach owns; admin all
create policy coach_roster_owner on public.coach_roster_links for all to authenticated
  using (coach_user_id = auth.uid() or public.is_admin())
  with check (coach_user_id = auth.uid() or public.is_admin());

-- Shop catalog: public read active; admin write
create policy shop_catalog_public_read on public.shop_catalog_products for select to anon, authenticated
  using (active = true);
create policy shop_catalog_admin on public.shop_catalog_products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Consultations: owner read own; public insert; admin all
create policy consultation_insert on public.consultation_bookings for insert to anon, authenticated with check (true);
create policy consultation_read on public.consultation_bookings for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy consultation_admin on public.consultation_bookings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Promo codes: owner read own unredeemed; admin all
create policy promo_owner_read on public.promo_codes for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy promo_admin on public.promo_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Fight records: public read; admin write
create policy fight_records_public_read on public.fight_records for select to anon, authenticated using (true);
create policy fight_records_admin on public.fight_records for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Email outbox: admin/service only (no client policies; use service role)
