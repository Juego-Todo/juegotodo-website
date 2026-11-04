-- Email-bound fighter claim invites (admin send + one-click accept).
-- Safe to re-run.

alter table public.fighter_claim_invites
  add column if not exists invited_email text not null default '';

alter table public.fighter_claim_invites
  add column if not exists invited_user_id uuid references public.profiles (id) on delete set null;

create index if not exists fighter_claim_invites_fighter_email_idx
  on public.fighter_claim_invites (fighter_id, invited_email);

comment on column public.fighter_claim_invites.invited_email is
  'Normalized lowercase email the invite is bound to. Empty for legacy open tokens.';

comment on column public.fighter_claim_invites.invited_user_id is
  'Profile id matched at send time when the email already has an account.';
