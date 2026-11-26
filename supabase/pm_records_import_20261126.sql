-- Import PM records No. 1-14 from sheet "PM Schedule" of
-- Auto_Machine_PM_Schedule_TPM_Professional _Month 12.xlsx
-- Run in Supabase SQL Editor. Skips any (item_code, due_date) already present.
-- PIC alternates by row number: odd = pair 1, even = pair 2.
-- NOTE: row 13 (Gbos EM9) has the same item_code AND due_date as row 12
-- (MC15-06132 / 2026-12-14). The duplicate guard below skips row 13.
-- If both machines should be imported, fix the code for EM9 in the workbook first.

with src(no, item_code, machine_detail, due_date, pic) as (
  values
    (1,  'MC15-06091', 'Laser D04',  date '2026-12-01', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (2,  'MC15-06188', 'Laser D05',  date '2026-12-01', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (3,  'MC15-05837', 'LINE A01',   date '2026-12-02', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (4,  'AM24-71523', 'LINE A02',   date '2026-12-02', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (5,  'AM24-71524', 'LINE B03',   date '2026-12-03', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (6,  'MC15-05946', 'Gbos EM1',   date '2026-12-03', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (7,  'MC15-05847', 'Gbos EM2',   date '2026-12-07', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (8,  'MC15-05944', 'Gbos EM3',   date '2026-12-07', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (9,  'MC15-06093', 'Gbos EM5',   date '2026-12-08', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (10, 'MC15-06130', 'Gbos EM6',   date '2026-12-09', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (11, 'MC15-06131', 'Gbos EM7',   date '2026-12-09', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (12, 'MC15-06132', 'Gbos EM8',   date '2026-12-14', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[]),
    (13, 'MC15-06132', 'Gbos EM9',   date '2026-12-14', array['Nguyễn Thanh Phương','Phạm Duy Hậu']::text[]),
    (14, 'MC15-05945', 'Gbos EM10',  date '2026-12-15', array['Hoàng Minh Chiến','Đoàn Huỳnh Minh Trung']::text[])
)
insert into public.pm_records
  (item_code, name_en, plant, due_date, pic, status, notes, record_type)
select
  s.item_code,
  coalesce(mi."NAME_EN", s.machine_detail),
  coalesce(mi."PLANT", 'PLANT D'),   -- MC15-06188 is absent from machine_info; workbook machines are Plant D/E
  s.due_date,
  s.pic,
  'pending',
  'Tăng ca',
  'manual'
from src s
left join public.machine_info mi on mi."ITEM_CODE" = s.item_code
where not exists (
  select 1 from public.pm_records r
  where r.item_code = s.item_code and r.due_date = s.due_date
);

-- Verify:
-- select item_code, name_en, plant, due_date, pic, status
-- from public.pm_records where due_date between '2026-12-01' and '2026-12-15'
-- order by due_date, item_code;
