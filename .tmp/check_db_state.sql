select 'function:' || proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('join_group','pay_participant','grant_manager','purchase_ticket','complete_group_if_paid')
union all
select 'table:' || tablename from pg_tables where schemaname='public' and tablename in ('group_participants','group_purchases','community_posts','user_roles','profiles')
union all
select 'users:' || count(*)::text from auth.users;
