-- LoR Manager – Supabase schema
-- Run this in the Supabase SQL editor to create the required tables.

create table if not exists professors (
  id            text primary key,
  name          text not null,
  email         text not null,
  expertise     text not null,
  courses       jsonb not null default '[]'::jsonb
);

create table if not exists university_applications (
  id            text primary key,
  university    text not null,
  program       text not null,
  deadline      text not null,
  description   text not null default ''
);

create table if not exists lor_requests (
  id             text primary key,
  professor_id   text not null references professors(id) on delete cascade,
  application_id text not null references university_applications(id) on delete cascade,
  status         text not null default 'Requested',
  deadline       text not null,
  reminder_sent  boolean not null default false,
  content        text not null default '',
  last_edited    text
);

-- Enable Row Level Security (RLS) – allow all operations for now.
-- Replace with proper policies once authentication is set up.
alter table professors enable row level security;
alter table university_applications enable row level security;
alter table lor_requests enable row level security;

create policy "Allow all for professors"
  on professors for all using (true) with check (true);

create policy "Allow all for university_applications"
  on university_applications for all using (true) with check (true);

create policy "Allow all for lor_requests"
  on lor_requests for all using (true) with check (true);
