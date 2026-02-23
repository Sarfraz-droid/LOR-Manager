-- LoR Manager – Supabase schema
-- Run this in the Supabase SQL editor to create the required tables.

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
  description   text not null default ''
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
  last_edited    text
);

-- Enable Row Level Security (RLS) – each user can only access their own data.
alter table professors enable row level security;
alter table university_applications enable row level security;
alter table lor_requests enable row level security;

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
