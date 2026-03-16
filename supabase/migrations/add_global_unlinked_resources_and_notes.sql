-- Migration: allow global (unlinked) resources and rich-text notes.
-- Changes:
-- 1) application_id becomes optional (resource may be global)
-- 2) resource_type adds 'note'
-- 3) note_content stores rich-text HTML for note resources
-- 4) resource shape constraint enforces valid fields per resource_type

alter table if exists application_resources
  alter column application_id drop not null;

alter table if exists application_resources
  add column if not exists note_content text;

alter table if exists application_resources
  drop constraint if exists application_resources_resource_type_check;

alter table if exists application_resources
  drop constraint if exists application_resources_link_or_upload_fields;

alter table if exists application_resources
  add constraint application_resources_resource_type_check
  check (resource_type in ('upload', 'link', 'note'));

alter table if exists application_resources
  add constraint application_resources_type_specific_fields check (
    (
      resource_type = 'link'
      and url is not null
      and storage_path is null
      and note_content is null
    )
    or
    (
      resource_type = 'upload'
      and storage_path is not null
      and url is null
      and note_content is null
    )
    or
    (
      resource_type = 'note'
      and note_content is not null
      and url is null
      and storage_path is null
    )
  );
