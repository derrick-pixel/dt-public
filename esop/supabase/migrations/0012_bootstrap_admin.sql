-- Bootstrap Derrick as initial admin. This migration is a TEMPLATE — before
-- applying, replace PASTE_UUID_HERE with the auth.users.id created in
-- Supabase Dashboard → Authentication → Add user (email derrick@elitez.asia).
--
-- Idempotent: on conflict updates the existing profile to role=admin.
--
-- Once applied, all further admin elevation goes through the update_role RPC
-- (which requires an admin to call it).

insert into public.profiles (id, email, full_name, role)
values ('PASTE_UUID_HERE', 'derrick@elitez.asia', 'Teo Wen Shan, Derrick', 'admin')
on conflict (id) do update set role = 'admin', updated_at = now();
