-- Update pm_tasks.name_en to match machine_info.NAME_EN
-- Target: name_en = 'NON PAD GEL PRESS MACHINE'
-- Run in Supabase SQL Editor. Written 2026-11-09.

-- 1) Preview affected rows (expect 21 rows, PM0001-PM0021)
--    Covers both old spellings: the as-imported name and the interim BGO-800S name.
SELECT equipment, name_en, task_no, task_name, frequency
FROM pm_tasks
WHERE name_en = 'NON PAD GEL PRESS'
   OR name_en = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
   OR name_en = 'NON PAD GEL PRESS MACHINE (BGO-800S)'
ORDER BY task_no;

-- 2) Update
BEGIN;

UPDATE pm_tasks
SET name_en = 'NON PAD GEL PRESS MACHINE'
WHERE name_en = 'NON PAD GEL PRESS'
   OR name_en = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
   OR name_en = 'NON PAD GEL PRESS MACHINE (BGO-800S)';

COMMIT;

-- 3) Verify
SELECT equipment, name_en, count(*) AS rows
FROM pm_tasks
WHERE name_en = 'NON PAD GEL PRESS MACHINE'
GROUP BY equipment, name_en;

-- Optional (display consistency): also align equipment to the same string so
-- the checklist header shows the final name. Uncomment if desired:
-- UPDATE pm_tasks
-- SET equipment = 'NON PAD GEL PRESS MACHINE'
-- WHERE equipment = 'NON PAD GEL PRESS'
--    OR equipment = 'NON-PAD GEL PRESS MACHINE (BGO-800S)'
--    OR equipment = 'NON PAD GEL PRESS MACHINE (BGO-800S)';
