-- Update machine_info NAME_EN for the gel press machine (fixed: no PLACE column)
-- Target: NAME_EN = 'NON PAD GEL PRESS MACHINE'
-- Run in Supabase SQL Editor. Written 2026-11-09 (fixed copy).

-- 0) (Optional) List actual columns if you want to confirm schema
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'machine_info' ORDER BY ordinal_position;

-- 1) Preview — find the actual current value (covers spacing/hyphen variants)
SELECT "ITEM_CODE", "NAME_EN", "PLANT", "SECTION"
FROM machine_info
WHERE "NAME_EN" ILIKE '%NON%PAD%GEL%'
   OR "NAME_EN" ILIKE '%BGO-800S%'
   OR "NAME_EN" = 'NON -PAD GEL PRESS MACHINE (BGO-800S)'
   OR "NAME_EN" = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
ORDER BY "ITEM_CODE";

-- 2) Update
BEGIN;

UPDATE machine_info
SET "NAME_EN" = 'NON PAD GEL PRESS MACHINE'
WHERE "NAME_EN" = 'NON -PAD GEL PRESS MACHINE (BGO-800S)'
   OR "NAME_EN" = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
   OR "NAME_EN" = 'NON PAD GEL PRESS MACHINE (BGO-800S)'
   OR "NAME_EN" = 'NON PAD GEL PRESS';

COMMIT;

-- 3) Verify
SELECT "ITEM_CODE", "NAME_EN", "PLANT", "SECTION"
FROM machine_info
WHERE "NAME_EN" = 'NON PAD GEL PRESS MACHINE'
ORDER BY "ITEM_CODE";

-- Note: pm_tasks.name_en and pm_records.name_en must match this exact string
-- for the PM task checklist to resolve (openTaskModal filters pm_tasks on
-- pm_records.name_en). If pm_tasks.name_en is still
-- 'NON-PAD GEL PRESS MACHINE (BGO-800S)', also rename it to
-- 'NON PAD GEL PRESS MACHINE' to keep the join working.
