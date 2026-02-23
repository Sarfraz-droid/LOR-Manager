-- Migration: add user_id to existing tables and replace permissive RLS policies
-- Run this in the Supabase SQL editor if your tables were created before
-- authentication was added (i.e. they are missing the user_id column).

-- -------------------------------------------------------------------------
-- 1. Add user_id column to each table
--    NOTE: Existing rows will have user_id = NULL and will NOT be returned
--    by the per-user RLS policies below (auth.uid() = NULL is false).
--    This is intentional – pre-auth data had no owner and should not be
--    exposed to any user.  If you need to keep existing rows, update them
--    manually: UPDATE professors SET user_id = '<your-uuid>' WHERE user_id IS NULL;
-- -------------------------------------------------------------------------

alter table professors
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table university_applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table lor_requests
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- -------------------------------------------------------------------------
-- 2. Drop the old permissive "allow all" policies (ignore errors if they
--    don't exist – the policy names match what the original schema created).
-- -------------------------------------------------------------------------

drop policy if exists "Allow all for professors" on professors;
drop policy if exists "Allow all for university_applications" on university_applications;
drop policy if exists "Allow all for lor_requests" on lor_requests;

-- -------------------------------------------------------------------------
-- 3. Enable RLS (safe to run even if already enabled)
-- -------------------------------------------------------------------------

alter table professors enable row level security;
alter table university_applications enable row level security;
alter table lor_requests enable row level security;

-- -------------------------------------------------------------------------
-- 4. Create per-user policies (drop first so the script is idempotent)
-- -------------------------------------------------------------------------

drop policy if exists "Users can manage their own professors" on professors;
create policy "Users can manage their own professors"
  on professors for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own applications" on university_applications;
create policy "Users can manage their own applications"
  on university_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own lor_requests" on lor_requests;
create policy "Users can manage their own lor_requests"
  on lor_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
