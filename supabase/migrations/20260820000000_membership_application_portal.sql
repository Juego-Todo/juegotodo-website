-- Membership & Licensing Application Portal
-- Hardens profile privileges, extends license applications, adds private documents,
-- payment verification, audit history, and storage policies.

-- ---------------------------------------------------------------------------
-- 1. Harden profile self-updates (block privilege escalation)
-- ---------------------------------------------------------------------------

create or replace function public.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.id is distinct from old.id then
      raise exception 'You cannot change your profile id.';
    end if;

    if new.email is distinct from old.email then
      raise exception 'Email changes must be handled by an administrator.';
    end if;

    if new.role is distinct from old.role then
      raise exception 'You cannot change your own account role.';
    end if;

    if new.assigned_tags is distinct from old.assigned_tags then
      raise exception 'Only administrators can change assigned tags.';
    end if;

    if new.account_type is distinct from old.account_type then
      raise exception 'Only administrators can change account type.';
    end if;

    if new.membership_tier is distinct from old.membership_tier then
      raise exception 'Only administrators can change membership tier.';
    end if;
  end if;

  return new;
end;
$$;

-- Reconcile is_admin() with application layer (role OR platform owner email)
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
        and (
          role = 'admin'
          or lower(email) in ('admin@juegotodo.com', 'kiran.aames@gmail.com')
        )
    );
$$;

-- ---------------------------------------------------------------------------
-- 2. Extend license_applications for membership portal lifecycle
-- ---------------------------------------------------------------------------

alter table public.license_applications
  add column if not exists application_number text,
  add column if not exists application_status text not null default 'DRAFT',
  add column if not exists payment_status text not null default 'UNPAID',
  add column if not exists amount_due numeric(12, 2) not null default 0,
  add column if not exists amount_paid numeric(12, 2) not null default 0,
  add column if not exists place_of_birth text not null default '',
  add column if not exists facebook_url text not null default '',
  add column if not exists martial_arts_system text not null default '',
  add column if not exists fight_team text not null default '',
  add column if not exists delivery_recipient_name text not null default '',
  add column if not exists delivery_address text not null default '',
  add column if not exists delivery_zip text not null default '',
  add column if not exists delivery_landmark text not null default '',
  add column if not exists delivery_contact text not null default '',
  add column if not exists courier text not null default '',
  add column if not exists tracking_number text not null default '',
  add column if not exists shipping_date timestamptz,
  add column if not exists delivery_date timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists applicant_visible_notes text not null default '',
  add column if not exists idempotency_key text,
  add column if not exists consent_confirmed boolean not null default false;

-- Allow multiple applications per user (drop unique user_id constraint)
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.license_applications'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ilike '%user_id%';

  if constraint_name is not null then
    execute format('alter table public.license_applications drop constraint %I', constraint_name);
  end if;
end $$;

-- Backfill application numbers for existing rows
with numbered as (
  select
    id,
    'JT-' || to_char(coalesce(submitted_at, created_at, now()), 'YYYY') || '-' ||
      lpad((row_number() over (order by created_at, id))::text, 6, '0') as generated_number
  from public.license_applications
  where application_number is null or application_number = ''
)
update public.license_applications as apps
set application_number = numbered.generated_number
from numbered
where apps.id = numbered.id;

-- Map legacy status into new lifecycle fields
update public.license_applications
set
  application_status = case
    when status = 'approved' then 'APPROVED'
    when status = 'rejected' then 'REJECTED'
    when status = 'needs_info' then 'ACTION_REQUIRED'
    when status = 'pending' then 'SUBMITTED'
    else coalesce(nullif(application_status, ''), 'DRAFT')
  end,
  payment_status = case
    when status in ('approved', 'pending', 'needs_info') and payment_status = 'UNPAID' then 'UNDER_VERIFICATION'
    else payment_status
  end
where application_status = 'DRAFT' or application_status is null;

create unique index if not exists license_applications_application_number_uidx
  on public.license_applications (application_number);

create unique index if not exists license_applications_idempotency_uidx
  on public.license_applications (user_id, idempotency_key)
  where idempotency_key is not null and idempotency_key <> '';

create index if not exists license_applications_application_status_idx
  on public.license_applications (application_status);

create index if not exists license_applications_payment_status_idx
  on public.license_applications (payment_status);

alter table public.license_applications
  drop constraint if exists license_applications_application_status_check;

alter table public.license_applications
  add constraint license_applications_application_status_check
  check (
    application_status in (
      'DRAFT',
      'SUBMITTED',
      'PAYMENT_PENDING',
      'PAYMENT_VERIFICATION',
      'DOCUMENT_REVIEW',
      'ACTION_REQUIRED',
      'APPROVED',
      'ID_PROCESSING',
      'ID_PRINTING',
      'READY_FOR_DELIVERY',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
      'REJECTED',
      'CANCELLED'
    )
  );

alter table public.license_applications
  drop constraint if exists license_applications_payment_status_check;

alter table public.license_applications
  add constraint license_applications_payment_status_check
  check (
    payment_status in (
      'UNPAID',
      'PAYMENT_SUBMITTED',
      'UNDER_VERIFICATION',
      'VERIFIED',
      'REJECTED',
      'REFUNDED'
    )
  );

-- Application number generator
create sequence if not exists public.membership_application_number_seq;

create or replace function public.next_membership_application_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  year_part text := to_char(now(), 'YYYY');
  next_val bigint;
begin
  next_val := nextval('public.membership_application_number_seq');
  return 'JT-' || year_part || '-' || lpad(next_val::text, 6, '0');
end;
$$;

grant execute on function public.next_membership_application_number() to authenticated, service_role;

-- Sync legacy status column for older UI paths
create or replace function public.sync_license_application_legacy_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := case
    when new.application_status in ('APPROVED', 'ID_PROCESSING', 'ID_PRINTING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'COMPLETED') then 'approved'
    when new.application_status = 'REJECTED' then 'rejected'
    when new.application_status = 'ACTION_REQUIRED' then 'needs_info'
    when new.application_status in ('DRAFT') then coalesce(nullif(new.status, ''), 'pending')
    else 'pending'
  end;
  return new;
end;
$$;

drop trigger if exists license_applications_sync_legacy_status on public.license_applications;
create trigger license_applications_sync_legacy_status
before insert or update on public.license_applications
for each row execute function public.sync_license_application_legacy_status();

-- Harden applicant self-updates for new lifecycle
create or replace function public.guard_license_application_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.user_id and not public.is_admin() then
    if old.application_status in ('APPROVED', 'ID_PROCESSING', 'ID_PRINTING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'REJECTED', 'CANCELLED')
       or old.status in ('approved', 'rejected') then
      raise exception 'Finalized license applications cannot be changed by applicants.';
    end if;

    if new.user_id is distinct from old.user_id then
      raise exception 'You cannot move a license application to another user.';
    end if;

    if new.application_status is distinct from old.application_status
       and new.application_status not in ('DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_VERIFICATION', 'ACTION_REQUIRED') then
      raise exception 'Only administrators can set that application status.';
    end if;

    if new.payment_status is distinct from old.payment_status
       and new.payment_status not in ('UNPAID', 'PAYMENT_SUBMITTED', 'UNDER_VERIFICATION') then
      raise exception 'Only administrators can verify or reject payments.';
    end if;

    if new.reviewed_at is not null and old.reviewed_at is distinct from new.reviewed_at then
      raise exception 'Only administrators can set license review timestamps.';
    end if;

    if new.approved_at is distinct from old.approved_at
       or new.rejected_at is distinct from old.rejected_at
       or new.completed_at is distinct from old.completed_at
       or new.courier is distinct from old.courier
       or new.tracking_number is distinct from old.tracking_number
       or new.shipping_date is distinct from old.shipping_date
       or new.delivery_date is distinct from old.delivery_date then
      raise exception 'Only administrators can update fulfillment fields.';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. application_documents
-- ---------------------------------------------------------------------------

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.license_applications (id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  original_filename text not null default '',
  mime_type text not null default '',
  file_size bigint not null default 0,
  uploaded_by uuid references public.profiles (id) on delete set null,
  verification_status text not null default 'PENDING',
  rejection_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_documents_type_check check (
    document_type in (
      'VALID_ID',
      'PHOTO_1X1',
      'E_SIGNATURE',
      'PAYMENT_SCREENSHOT',
      'ADDITIONAL_DOCUMENT'
    )
  ),
  constraint application_documents_verification_check check (
    verification_status in ('PENDING', 'VERIFIED', 'REJECTED')
  )
);

create index if not exists application_documents_application_id_idx
  on public.application_documents (application_id);

drop trigger if exists application_documents_set_updated_at on public.application_documents;
create trigger application_documents_set_updated_at
before update on public.application_documents
for each row execute function public.set_updated_at();

alter table public.application_documents enable row level security;

drop policy if exists "application_documents_select_own_or_admin" on public.application_documents;
create policy "application_documents_select_own_or_admin"
on public.application_documents for select
using (
  public.is_admin()
  or exists (
    select 1 from public.license_applications la
    where la.id = application_id and la.user_id = auth.uid()
  )
);

drop policy if exists "application_documents_insert_own" on public.application_documents;
create policy "application_documents_insert_own"
on public.application_documents for insert
with check (
  public.is_admin()
  or (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.license_applications la
      where la.id = application_id and la.user_id = auth.uid()
    )
  )
);

drop policy if exists "application_documents_update_admin" on public.application_documents;
create policy "application_documents_update_admin"
on public.application_documents for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "application_documents_delete_own_or_admin" on public.application_documents;
create policy "application_documents_delete_own_or_admin"
on public.application_documents for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.license_applications la
    where la.id = application_id
      and la.user_id = auth.uid()
      and la.application_status in ('DRAFT', 'ACTION_REQUIRED', 'PAYMENT_PENDING')
  )
);

-- ---------------------------------------------------------------------------
-- 4. application_payments
-- ---------------------------------------------------------------------------

create table if not exists public.application_payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.license_applications (id) on delete cascade,
  payment_method text not null default '',
  amount numeric(12, 2) not null default 0,
  reference_number text not null default '',
  screenshot_document_id uuid references public.application_documents (id) on delete set null,
  submitted_at timestamptz not null default now(),
  verification_status text not null default 'UNDER_VERIFICATION',
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  rejection_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_payments_method_check check (
    payment_method in ('gcash', 'maya', 'qrph', 'cash', '')
  ),
  constraint application_payments_verification_check check (
    verification_status in (
      'UNPAID',
      'PAYMENT_SUBMITTED',
      'UNDER_VERIFICATION',
      'VERIFIED',
      'REJECTED',
      'REFUNDED'
    )
  )
);

create index if not exists application_payments_application_id_idx
  on public.application_payments (application_id);

drop trigger if exists application_payments_set_updated_at on public.application_payments;
create trigger application_payments_set_updated_at
before update on public.application_payments
for each row execute function public.set_updated_at();

alter table public.application_payments enable row level security;

drop policy if exists "application_payments_select_own_or_admin" on public.application_payments;
create policy "application_payments_select_own_or_admin"
on public.application_payments for select
using (
  public.is_admin()
  or exists (
    select 1 from public.license_applications la
    where la.id = application_id and la.user_id = auth.uid()
  )
);

drop policy if exists "application_payments_insert_own" on public.application_payments;
create policy "application_payments_insert_own"
on public.application_payments for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.license_applications la
    where la.id = application_id and la.user_id = auth.uid()
  )
);

drop policy if exists "application_payments_update_admin" on public.application_payments;
create policy "application_payments_update_admin"
on public.application_payments for update
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. application_history (audit log)
-- ---------------------------------------------------------------------------

create table if not exists public.application_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.license_applications (id) on delete cascade,
  action text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text not null default '',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists application_history_application_id_idx
  on public.application_history (application_id, created_at desc);

alter table public.application_history enable row level security;

drop policy if exists "application_history_select_own_or_admin" on public.application_history;
create policy "application_history_select_own_or_admin"
on public.application_history for select
using (
  public.is_admin()
  or exists (
    select 1 from public.license_applications la
    where la.id = application_id and la.user_id = auth.uid()
  )
);

drop policy if exists "application_history_insert_authenticated" on public.application_history;
create policy "application_history_insert_authenticated"
on public.application_history for insert
with check (
  public.is_admin()
  or (
    actor_id = auth.uid()
    and exists (
      select 1 from public.license_applications la
      where la.id = application_id and la.user_id = auth.uid()
    )
  )
);

-- ---------------------------------------------------------------------------
-- 6. Private storage bucket for application documents
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-documents',
  'application-documents',
  false,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "application_documents_storage_select_own_or_admin" on storage.objects;
create policy "application_documents_storage_select_own_or_admin"
on storage.objects for select
using (
  bucket_id = 'application-documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "application_documents_storage_insert_own" on storage.objects;
create policy "application_documents_storage_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'application-documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "application_documents_storage_update_own_or_admin" on storage.objects;
create policy "application_documents_storage_update_own_or_admin"
on storage.objects for update
using (
  bucket_id = 'application-documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'application-documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "application_documents_storage_delete_own_or_admin" on storage.objects;
create policy "application_documents_storage_delete_own_or_admin"
on storage.objects for delete
using (
  bucket_id = 'application-documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Seed sequence from existing numbered applications
select setval(
  'public.membership_application_number_seq',
  greatest(
    coalesce(
      (
        select max(nullif(regexp_replace(application_number, '^JT-[0-9]{4}-', ''), '')::bigint)
        from public.license_applications
        where application_number ~ '^JT-[0-9]{4}-[0-9]+$'
      ),
      0
    ),
    1
  ),
  true
);
