-- Migration: expose application resources in public shortlist share links.
-- Includes:
-- 1) RPC returning resources for a shortlist token
-- 2) table policy allowing public read only for resources tied to shared shortlists
-- 3) storage policy allowing public read for files tied to shared shortlists

create or replace function public.get_shared_shortlist_resources(share_token_input text)
returns table (
  id text,
  application_id text,
  resource_type text,
  title text,
  url text,
  storage_path text,
  filename text,
  mime_type text,
  size_bytes bigint,
  tags jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    application_resources.id,
    application_resources.application_id,
    application_resources.resource_type,
    application_resources.title,
    application_resources.url,
    application_resources.storage_path,
    application_resources.filename,
    application_resources.mime_type,
    application_resources.size_bytes,
    application_resources.tags
  from public.university_applications
  join public.application_resources
    on application_resources.application_id = university_applications.id
  where university_applications.share_token = share_token_input
  order by application_resources.created_at desc, application_resources.id;
$$;

grant execute on function public.get_shared_shortlist_resources(text) to anon, authenticated;

drop policy if exists "Public can view resources in shared shortlists" on application_resources;
create policy "Public can view resources in shared shortlists"
  on application_resources for select
  using (
    exists (
      select 1
      from public.university_applications
      where university_applications.id = application_resources.application_id
        and university_applications.share_token is not null
    )
  );

drop policy if exists "Public can view files in shared shortlists" on storage.objects;
create policy "Public can view files in shared shortlists"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'application-resources'
    and exists (
      select 1
      from public.application_resources
      join public.university_applications
        on university_applications.id = application_resources.application_id
      where application_resources.storage_path = storage.objects.name
        and university_applications.share_token is not null
    )
  );
