-- pm_records soft-delete flag.
-- Lets the UI remove a record permanently, including auto-generated ones:
--   * loadMonthRecords keeps deleted rows in its `existing` key set, so the
--     month-open generator does NOT re-insert the same (item_code, due_date).
--   * Display filters out rows where deleted = true.
-- Idempotent: safe to run once or more. Paste into the Supabase SQL editor and Run.
alter table public.pm_records
  add column if not exists deleted boolean not null default false;