-- Migration: make public shortlist preview resilient by exposing shared data
-- through explicit security definer RPC helpers instead of depending on table
-- select policies alone.

drop function if exists public.get_shared_shortlist(text);

create or replace function public.get_shared_shortlist(share_token_input text)
returns table (
  id text,
  university text,
  program text,
  deadline text,
  description text,
  relevant_links jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    university_applications.id,
    university_applications.university,
    university_applications.program,
    university_applications.deadline,
    university_applications.description,
    university_applications.relevant_links
  from public.university_applications
  where university_applications.share_token = share_token_input
  limit 1;
$$;

create or replace function public.get_shared_shortlist_sops(share_token_input text)
returns table (
  id text,
  program text,
  deadline text,
  status text,
  content text
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
    sop_entries.content
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
  professor_name text
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
    professors.name as professor_name
  from public.university_applications
  join public.lor_requests
    on lor_requests.application_id = university_applications.id
  left join public.professors
    on professors.id = lor_requests.professor_id
  where university_applications.share_token = share_token_input
  order by lor_requests.deadline nulls last, professors.name nulls last, lor_requests.id;
$$;

grant execute on function public.get_shared_shortlist(text) to anon, authenticated;
grant execute on function public.get_shared_shortlist_sops(text) to anon, authenticated;
grant execute on function public.get_shared_shortlist_lors(text) to anon, authenticated;
