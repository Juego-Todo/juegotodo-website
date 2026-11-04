-- Prevent non-admins from changing their own public fighter slug.

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

    if new.fighter_slug is distinct from old.fighter_slug then
      raise exception 'Only administrators can change fighter slug.';
    end if;
  end if;

  return new;
end;
$$;
