-- Remove auto-generated PM records (auto-insert feature removed 2026-09-23).
-- Manual records (record_type = 'manual') are NOT touched.
-- Run in Supabase SQL Editor.

-- 1) Preview affected rows before changing anything.
SELECT id, item_code, name_en, due_date, status, deleted
FROM pm_records
WHERE record_type = 'generated'
ORDER BY due_date;

-- 2) Soft-delete them (reversible; hidden from the PM page, kept for history).
UPDATE pm_records
SET deleted = true
WHERE record_type = 'generated'
  AND coalesce(deleted, false) = false;

-- 3) Verify: should return 0.
SELECT count(*) AS remaining_visible_generated
FROM pm_records
WHERE record_type = 'generated'
  AND coalesce(deleted, false) = false;

-- Undo if needed:
-- UPDATE pm_records SET deleted = false WHERE record_type = 'generated';
