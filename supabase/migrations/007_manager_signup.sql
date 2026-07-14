-- 007_manager_signup.sql — allow self-service manager signup (product decision 2026-07-14).
-- 005 hardened signup so no role was ever self-selected; that also killed legitimate
-- event-manager registration (ManagerRegister sends role='manager' in metadata but the
-- trigger ignored it, so ManagerRoute bounced new managers forever). Middle ground:
-- 'user' and 'manager' may be chosen at signup via raw_user_meta_data->>'role';
-- 'admin' is never self-selectable and grant_manager (admin-only, 005) remains the
-- out-of-band path. Idempotent / re-runnable.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name')
    on conflict (user_id) do nothing;
  -- Self-selectable tiers only: user / manager. 'admin' can never be claimed at signup.
  insert into public.user_roles (user_id, role)
    values (new.id, case
      when (new.raw_user_meta_data->>'role') = 'manager' then 'manager'::public.app_role
      else 'user'::public.app_role
    end)
    on conflict (user_id, role) do nothing;
  return new;
end $$;
