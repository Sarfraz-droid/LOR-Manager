-- Migration: connect SOP entries directly to college shortlists and allow
-- public sharing of a shortlist with its connected SOPs and LORs.

alter table university_applications
  add column if not exists share_token text unique;

alter table sop_entries
  add column if not exists application_id text references university_applications(id) on delete cascade;

create index if not exists idx_sop_entries_application_id
  on sop_entries(application_id);

create or replace function public.is_shared_shortlist(application_id_input text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.university_applications
    where id = application_id_input
      and share_token is not null
  );
$$;

create or replace function public.has_shared_lor_for_application(application_id_input text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.lor_requests
    where application_id = application_id_input
      and share_token is not null
  );
$$;

create or replace function public.has_shared_reference_for_professor(professor_id_input text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.lor_requests
    left join public.university_applications
      on public.university_applications.id = public.lor_requests.application_id
    where public.lor_requests.professor_id = professor_id_input
      and (
        public.lor_requests.share_token is not null
        or public.university_applications.share_token is not null
      )
  );
$$;

grant execute on function public.is_shared_shortlist(text) to anon, authenticated;
grant execute on function public.has_shared_lor_for_application(text) to anon, authenticated;
grant execute on function public.has_shared_reference_for_professor(text) to anon, authenticated;

update sop_entries
set application_id = matched.application_id
from (
  select
    sop_entries.id as sop_id,
    min(university_applications.id) as application_id
  from sop_entries
  join university_applications
    on university_applications.user_id = sop_entries.user_id
   and university_applications.university = sop_entries.college
   and university_applications.program = sop_entries.program
   and university_applications.deadline = sop_entries.deadline
  where sop_entries.application_id is null
  group by sop_entries.id
  having count(*) = 1
) as matched
where sop_entries.id = matched.sop_id;

drop policy if exists "Public can view shared shortlists" on university_applications;
drop policy if exists "Public can view applications in shared lors" on university_applications;
create policy "Public can view shared shortlists"
  on university_applications for select
  using (share_token is not null);

create policy "Public can view applications in shared lors"
  on university_applications for select
  using (public.has_shared_lor_for_application(university_applications.id));

drop policy if exists "Public can view SOPs in shared shortlists" on sop_entries;
create policy "Public can view SOPs in shared shortlists"
  on sop_entries for select
  using (public.is_shared_shortlist(sop_entries.application_id));

drop policy if exists "Public can view lor_requests in shared shortlists" on lor_requests;
create policy "Public can view lor_requests in shared shortlists"
  on lor_requests for select
  using (public.is_shared_shortlist(lor_requests.application_id));

drop policy if exists "Public can view professors in shared lors" on professors;
drop policy if exists "Public can view professors in shared shortlists" on professors;
drop policy if exists "Public can view professors in shared links" on professors;
create policy "Public can view professors in shared links"
  on professors for select
  using (public.has_shared_reference_for_professor(professors.id));
