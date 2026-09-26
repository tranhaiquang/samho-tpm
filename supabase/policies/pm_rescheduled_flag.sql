-- pm_records: reschedule tracking (2026-09-26)
-- Adds a boolean flag set by the PM page whenever a record's due_date is edited.
-- Display statuses OVERDUE / RESCHEDULED are derived in JS; the status workflow
-- stays pending -> completed -> validated (check constraint untouched).
-- Safe to run repeatedly.

alter table public.pm_records
  add column if not exists rescheduled boolean not null default false;

-- Verify:
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'pm_records' and column_name = 'rescheduled';
