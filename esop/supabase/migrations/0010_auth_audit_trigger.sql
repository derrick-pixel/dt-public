-- Mirror Supabase auth.audit_log_entries into our audit_log so Activity Log
-- can show login_success / login_failed / password_changed / magic_link_sent etc.
create or replace function public._mirror_auth_audit() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_action text; v_email text;
begin
  v_action := case new.payload->>'action'
    when 'login' then case when (new.payload->>'actor_id') is not null then 'login_success' else 'login_failed' end
    when 'logout' then 'logout'
    when 'user_recovery_requested' then 'password_reset_requested'
    when 'user_updated_password' then 'password_changed'
    when 'user_signedup' then 'password_set'
    when 'user_invited' then 'magic_link_sent'
    else 'auth_' || coalesce(new.payload->>'action', 'unknown')
  end;
  v_email := new.payload->>'actor_username';
  insert into public.audit_log(actor_id, actor_email, action, target, ip, user_agent, metadata)
  values (
    nullif(new.payload->>'actor_id','')::uuid,
    v_email, v_action, v_email,
    nullif(new.ip_address::text,'')::inet,
    null,
    new.payload
  );
  return new;
exception when others then return new;  -- never block auth
end $$;

create trigger trg_mirror_auth_audit
after insert on auth.audit_log_entries
for each row execute function public._mirror_auth_audit();
