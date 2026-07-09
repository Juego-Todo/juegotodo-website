-- Prevent client-side privilege escalation while preserving normal profile edits and license resubmission.

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
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_self_update on public.profiles;
create trigger profiles_guard_self_update
before update on public.profiles
for each row execute function public.guard_profile_self_update();

create or replace function public.guard_license_application_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.user_id and not public.is_admin() then
    if old.status in ('approved', 'rejected') then
      raise exception 'Finalized license applications cannot be changed by applicants.';
    end if;

    if new.user_id is distinct from old.user_id then
      raise exception 'You cannot move a license application to another user.';
    end if;

    if new.status <> 'pending' then
      raise exception 'Only administrators can set license review status.';
    end if;

    if new.reviewed_at is not null then
      raise exception 'Only administrators can set license review timestamps.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists license_applications_guard_self_update on public.license_applications;
create trigger license_applications_guard_self_update
before update on public.license_applications
for each row execute function public.guard_license_application_self_update();
