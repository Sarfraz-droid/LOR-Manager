create table if not exists application_resources (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id text not null references university_applications(id) on delete cascade,
  resource_type text not null check (resource_type in ('upload', 'link')),
  title text not null,
  url text,
  storage_path text,
  filename text,
  mime_type text,
  size_bytes bigint,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_resources_link_or_upload_fields check (
    (resource_type = 'link' and url is not null and storage_path is null)
    or
    (resource_type = 'upload' and storage_path is not null and url is null)
  )
);

create index if not exists idx_application_resources_user_application
  on application_resources(user_id, application_id);

create index if not exists idx_application_resources_tags_gin
  on application_resources using gin(tags);

create index if not exists idx_application_resources_title_lower
  on application_resources(lower(title));

alter table application_resources enable row level security;

drop policy if exists "Users can manage their own application_resources" on application_resources;
create policy "Users can manage their own application_resources"
  on application_resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('application-resources', 'application-resources', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own application resources" on storage.objects;
create policy "Users can upload own application resources"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'application-resources'
    and auth.uid() = owner
  );

drop policy if exists "Users can view own application resources" on storage.objects;
create policy "Users can view own application resources"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'application-resources'
    and auth.uid() = owner
  );

drop policy if exists "Users can update own application resources" on storage.objects;
create policy "Users can update own application resources"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'application-resources'
    and auth.uid() = owner
  )
  with check (
    bucket_id = 'application-resources'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete own application resources" on storage.objects;
create policy "Users can delete own application resources"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'application-resources'
    and auth.uid() = owner
  );
