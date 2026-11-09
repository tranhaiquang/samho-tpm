-- Rename NON PAD GEL PRESS -> NON-PAD GEL PRESS MACHINE (BGO-800S) in pm_tasks
-- Run in Supabase SQL Editor. Safe to re-run (second run updates 0 rows).
-- Preview first. Written 2026-11-09.

-- 1) Preview affected rows (expect 21 rows, PM0001-PM0021)
SELECT equipment, name_en, task_no, task_name, frequency
FROM pm_tasks
WHERE equipment = 'NON PAD GEL PRESS' OR name_en = 'NON PAD GEL PRESS'
ORDER BY task_no;

BEGIN;

-- 2) Rename both the join key and display name.
--    name_en is the key the PM page filters on (pm_records.name_en), so it must change too.
UPDATE pm_tasks
SET equipment = 'NON-PAD GEL PRESS MACHINE (BGO-800S)',
    name_en   = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
WHERE equipment = 'NON PAD GEL PRESS' OR name_en = 'NON PAD GEL PRESS';

COMMIT;

-- 3) Verify
SELECT equipment, name_en, count(*) AS rows
FROM pm_tasks
WHERE equipment = 'NON-PAD GEL PRESS MACHINE (BGO-800S)' OR name_en = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
GROUP BY equipment, name_en;

-- Note: PM records still carrying the old name_en ('NON PAD GEL PRESS') will no longer find these
-- checklist rows (openTaskModal warns on no match). Backfill pm_records from machine_info if needed,
-- e.g. see supabase/policies/pm_name_en_backfill.sql, or update pm_records.name_en to the new name.
