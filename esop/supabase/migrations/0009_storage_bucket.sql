insert into storage.buckets (id, name, public)
  values ('esop-documents','esop-documents', false)
  on conflict (id) do nothing;

-- Direct browser SELECT/INSERT on the bucket is closed.
-- Reads via public.get_document_url RPC (returns 60s signed URL + audit row).
-- Uploads via signed-upload-url created by an authenticated client; service role
-- (used by Edge Functions) bypasses these policies entirely.
create policy "Disallow direct read"
on storage.objects for select to authenticated
using (false);

create policy "Disallow direct upload"
on storage.objects for insert to authenticated
with check (false);
