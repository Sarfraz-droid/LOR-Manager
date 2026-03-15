alter table university_applications
  add column if not exists relevant_links jsonb not null default '[]'::jsonb;

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

grant execute on function public.get_shared_shortlist(text) to anon, authenticated;
