-- Migration: expose google_docs_link in public shortlist RPCs so shared preview
-- can route directly to Google Docs when an external doc exists.

drop function if exists public.get_shared_shortlist_sops(text);
drop function if exists public.get_shared_shortlist_lors(text);

create or replace function public.get_shared_shortlist_sops(share_token_input text)
returns table (
  id text,
  program text,
  deadline text,
  status text,
  content text,
  google_docs_link text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    sop_entries.id,
    sop_entries.program,
    sop_entries.deadline,
    sop_entries.status::text,
    sop_entries.content,
    sop_entries.google_docs_link
  from public.university_applications
  join public.sop_entries
    on (
      sop_entries.application_id = university_applications.id
      or (
        sop_entries.application_id is null
        and sop_entries.college = university_applications.university
        and sop_entries.program = university_applications.program
      )
    )
  where university_applications.share_token = share_token_input
  order by sop_entries.deadline nulls last, sop_entries.program, sop_entries.id;
$$;

create or replace function public.get_shared_shortlist_lors(share_token_input text)
returns table (
  id text,
  professor_id text,
  deadline text,
  status text,
  content text,
  professor_name text,
  google_docs_link text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    lor_requests.id,
    lor_requests.professor_id,
    lor_requests.deadline,
    lor_requests.status::text,
    lor_requests.content,
    professors.name as professor_name,
    lor_requests.google_docs_link
  from public.university_applications
  join public.lor_requests
    on lor_requests.application_id = university_applications.id
  left join public.professors
    on professors.id = lor_requests.professor_id
  where university_applications.share_token = share_token_input
  order by lor_requests.deadline nulls last, professors.name nulls last, lor_requests.id;
$$;
