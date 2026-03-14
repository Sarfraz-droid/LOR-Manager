-- Migration: connect SOP entries directly to college shortlists and allow
-- public sharing of a shortlist with its connected SOPs and LORs.

alter table university_applications
  add column if not exists share_token text unique;

alter table sop_entries
  add column if not exists application_id text references university_applications(id) on delete cascade;

create index if not exists idx_sop_entries_application_id
  on sop_entries(application_id);

update sop_entries
set application_id = university_applications.id
from university_applications
where sop_entries.application_id is null
  and sop_entries.user_id = university_applications.user_id
  and sop_entries.college = university_applications.university
  and sop_entries.program = university_applications.program
  and sop_entries.deadline = university_applications.deadline;

drop policy if exists "Public can view shared shortlists" on university_applications;
create policy "Public can view shared shortlists"
  on university_applications for select
  using (share_token is not null);

drop policy if exists "Public can view SOPs in shared shortlists" on sop_entries;
create policy "Public can view SOPs in shared shortlists"
  on sop_entries for select
  using (
    exists (
      select 1 from university_applications
      where university_applications.id = sop_entries.application_id
        and university_applications.share_token is not null
    )
  );

drop policy if exists "Public can view lor_requests in shared shortlists" on lor_requests;
create policy "Public can view lor_requests in shared shortlists"
  on lor_requests for select
  using (
    exists (
      select 1 from university_applications
      where university_applications.id = lor_requests.application_id
        and university_applications.share_token is not null
    )
  );

drop policy if exists "Public can view professors in shared shortlists" on professors;
create policy "Public can view professors in shared shortlists"
  on professors for select
  using (
    exists (
      select 1
      from lor_requests
      join university_applications
        on university_applications.id = lor_requests.application_id
      where lor_requests.professor_id = professors.id
        and university_applications.share_token is not null
    )
  );
