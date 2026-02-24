-- Migration: add share_token to lor_requests and allow public read of shared letters
-- Run this in the Supabase SQL editor to enable shareable links for LORs.

-- -------------------------------------------------------------------------
-- 1. Add share_token column to lor_requests
-- -------------------------------------------------------------------------

alter table lor_requests
  add column if not exists share_token text unique;

-- -------------------------------------------------------------------------
-- 2. Allow public (unauthenticated) read of LOR requests that have been
--    shared (i.e., share_token IS NOT NULL).
-- -------------------------------------------------------------------------

drop policy if exists "Public can view shared lor_requests" on lor_requests;
create policy "Public can view shared lor_requests"
  on lor_requests for select
  using (share_token is not null);

-- -------------------------------------------------------------------------
-- 3. Allow public read of professors that are referenced by a shared LOR
--    (so the share page can show the professor's name).
-- -------------------------------------------------------------------------

drop policy if exists "Public can view professors in shared lors" on professors;
create policy "Public can view professors in shared lors"
  on professors for select
  using (
    exists (
      select 1 from lor_requests
      where lor_requests.professor_id = professors.id
        and lor_requests.share_token is not null
    )
  );

-- -------------------------------------------------------------------------
-- 4. Allow public read of university_applications referenced by a shared LOR
-- -------------------------------------------------------------------------

drop policy if exists "Public can view applications in shared lors" on university_applications;
create policy "Public can view applications in shared lors"
  on university_applications for select
  using (
    exists (
      select 1 from lor_requests
      where lor_requests.application_id = university_applications.id
        and lor_requests.share_token is not null
    )
  );
