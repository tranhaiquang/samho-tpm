-- Fix: pm_records.name_en empty -> openTaskModal "No task catalog for name_en:"
-- Run in Supabase SQL Editor (as a privileged role; anon/REST cannot see these rows reliably).

-- 1) Rule out an empty task catalog (checklist source).
SELECT count(*) AS pm_tasks_rows FROM pm_tasks;

-- 2) Preview affected PM records (empty name_en, not soft-deleted).
SELECT id, item_code, name_en, due_date, record_type, deleted
FROM pm_records
WHERE coalesce(name_en, '') = ''
  AND coalesce(deleted, false) = false
ORDER BY due_date;

-- 3) Backfill name_en from machine_info.
--    machine_info stores the column as uppercase "NAME_EN".
UPDATE pm_records r
SET name_en = mi."NAME_EN"
FROM machine_info mi
WHERE mi."ITEM_CODE" = r.item_code
  AND coalesce(r.name_en, '') = ''
  AND coalesce(mi."NAME_EN", '') <> '';

-- 4) Verify: remaining empties are codes missing from machine_info (or NAME_EN itself empty).
SELECT r.item_code, count(*) AS remaining
FROM pm_records r
LEFT JOIN machine_info mi ON mi."ITEM_CODE" = r.item_code
WHERE coalesce(r.name_en, '') = ''
  AND coalesce(r.deleted, false) = false
GROUP BY r.item_code
ORDER BY r.item_code;
