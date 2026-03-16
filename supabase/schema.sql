-- LoR & SOP Manager – Supabase schema
-- Use this file to create all tables from scratch in a fresh database.
-- If your database already has these tables (created before authentication
-- was added), run supabase/migrations/add_user_id.sql instead to add the
-- user_id column and update the RLS policies.
-- NOTE: The migration adds nullable user_id columns; existing rows will have
-- user_id = NULL and will NOT be visible to any user after RLS is applied.
-- See the migration file for instructions on re-assigning existing rows.

create table if not exists professors (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null,
  expertise     text not null,
  courses       jsonb not null default '[]'::jsonb
);

create table if not exists university_applications (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  university    text not null,
  program       text not null,
  deadline      text not null,
  description   text not null default '',
  relevant_links jsonb not null default '[]'::jsonb,
  share_token   text unique
);

create table if not exists lor_requests (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  professor_id   text not null references professors(id) on delete cascade,
  application_id text not null references university_applications(id) on delete cascade,
  status         text not null default 'Requested',
  deadline       text not null,
  reminder_sent  boolean not null default false,
  content        text not null default '',
  google_docs_link text,
  last_edited    text,
  share_token    text unique
);

create table if not exists sop_entries (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  application_id text references university_applications(id) on delete cascade,
  college        text not null,
  program        text not null,
  deadline       text not null,
  status         text not null default 'Draft',
  content        text not null default '',
  google_docs_link text,
  last_edited    text
);

-- Enable Row Level Security (RLS) – each user can only access their own data.
alter table professors enable row level security;
alter table university_applications enable row level security;
alter table lor_requests enable row level security;
alter table sop_entries enable row level security;

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

create policy "Users can manage their own professors"
  on professors for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own applications"
  on university_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own lor_requests"
  on lor_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view shared lor_requests"
  on lor_requests for select
  using (share_token is not null);

create policy "Public can view professors in shared links"
  on professors for select
  using (public.has_shared_reference_for_professor(professors.id));

create policy "Public can view applications in shared lors"
  on university_applications for select
  using (public.has_shared_lor_for_application(university_applications.id));

create policy "Public can view shared shortlists"
  on university_applications for select
  using (share_token is not null);

create policy "Users can manage their own sop_entries"
  on sop_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view SOPs in shared shortlists"
  on sop_entries for select
  using (public.is_shared_shortlist(sop_entries.application_id));

create policy "Public can view lor_requests in shared shortlists"
  on lor_requests for select
  using (public.is_shared_shortlist(lor_requests.application_id));
