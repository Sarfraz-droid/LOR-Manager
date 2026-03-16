-- Migration: add optional Google Docs links to SOP and LOR records.
-- These columns are nullable to preserve backward compatibility with existing rows.

alter table if exists public.sop_entries
add column if not exists google_docs_link text;

alter table if exists public.lor_requests
add column if not exists google_docs_link text;
