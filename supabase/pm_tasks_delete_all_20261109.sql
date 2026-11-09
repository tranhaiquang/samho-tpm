-- Delete ALL rows from pm_tasks (hard delete, cannot be undone)
-- Run in Supabase SQL Editor. Written 2026-11-09.

-- 0) (Recommended) Preview how many rows will be removed
SELECT count(*) AS rows_to_delete FROM pm_tasks;

-- 1) Delete all
BEGIN;

DELETE FROM pm_tasks;

COMMIT;

-- 2) Verify (expect 0)
SELECT count(*) AS remaining FROM pm_tasks;

-- Note: this does not reset the id sequence. To also reset identity, use:
-- TRUNCATE TABLE pm_tasks RESTART IDENTITY;
