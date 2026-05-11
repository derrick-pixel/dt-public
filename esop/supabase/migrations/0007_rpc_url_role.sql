-- get_document_url — v1.1 hook. Paired with finalize_signed_document; will be
-- called by the documents-list UI in v1.1 once client-side PDF upload ships.
-- In v1 the docs.js page generates PDFs on demand (no persistence).
create or replace function public.get_document_url(p_document_id uuid)
returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_doc public.documents;
  v_profile public.profiles;
  v_url text;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id;
  if v_doc is null then raise exception 'not found' using errcode = '02000'; end if;
  if v_doc.holder_id is distinct from v_profile.holder_id and v_profile.role not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_doc.storage_path is null then raise exception 'document has no file' using errcode = '02000'; end if;

  select storage.create_signed_url('esop-documents', v_doc.storage_path, 60) into v_url;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_profile.email, 'file_downloaded', v_doc.id::text,
    jsonb_build_object('storage_path', v_doc.storage_path));

  return v_url;
end $$;

revoke all on function public.get_document_url(uuid) from public;
grant execute on function public.get_document_url(uuid) to authenticated;

create or replace function public.update_role(p_profile_id uuid, p_new_role text)
returns public.profiles
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_profile public.profiles;
  v_actor public.profiles;
  v_admin_count int;
begin
  select * into v_actor from public.profiles where id = auth.uid();
  if v_actor.role <> 'admin' then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_new_role not in ('holder','committee','admin') then
    raise exception 'invalid role' using errcode = '22023';
  end if;

  -- An admin must not silently self-demote — the legitimate use case
  -- (admin steps down) should go through a Committee resolution that
  -- another admin then executes.
  if v_actor.id = p_profile_id and p_new_role <> 'admin' then
    raise exception 'cannot self-demote — another admin must demote you' using errcode = '42501';
  end if;

  -- Don't leave the platform admin-less. Block demoting the last admin.
  if p_new_role <> 'admin' then
    select count(*) into v_admin_count from public.profiles
      where role = 'admin' and id <> p_profile_id;
    if v_admin_count = 0 then
      raise exception 'cannot demote the last admin' using errcode = '42501';
    end if;
  end if;

  update public.profiles set role = p_new_role, updated_at = now() where id = p_profile_id
    returning * into v_profile;
  if not found then raise exception 'profile not found' using errcode = '02000'; end if;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_actor.email, 'role_changed', p_profile_id::text,
    jsonb_build_object('new_role', p_new_role, 'previous_role', v_profile.role));

  return v_profile;
end $$;

revoke all on function public.update_role(uuid, text) from public;
grant execute on function public.update_role(uuid, text) to authenticated;
