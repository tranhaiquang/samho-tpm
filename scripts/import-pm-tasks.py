"""Extract pm_tasks rows from the two PM_TPM workbooks.

Sources:
  - PM_TPM Non Pad GeL Press MC.xlsx
      PM_Task_Detail  -> SDL PRESS OUTSOLE (10 tasks, with Task Detail steps)
      PM_Generation   -> NON PAD GEL PRESS (21 unique Task Nos, no steps)
  - PM_TPM Stitiching Machine.xlsx
      6 sheets, schedule-only (no Item Task / Task Detail columns)
      -> 29 unique (equipment, Task No) pairs

Outputs (run from repo root):
  supabase/pm_tasks_import_20261109.sql   -- SQL Editor script (privileged, bypasses RLS)
  data/pm_tasks_import_preview.csv        -- human-readable preview

Mapping to pm_tasks columns (config.pm.taskFields):
  equipment=name from file, name_en=same as equipment (file has one name),
  task_no, task_name, item_group, item_task, frequency, task_detail.
"""
import csv
import pathlib
import openpyxl

ROOT = pathlib.Path(__file__).resolve().parent.parent
F1 = ROOT / "PM_TPM Non Pad GeL Press MC.xlsx"
F2 = ROOT / "PM_TPM Stitiching Machine.xlsx"
OUT_SQL = ROOT / "supabase" / "pm_tasks_import_20261109.sql"
OUT_CSV = ROOT / "data" / "pm_tasks_import_preview.csv"

def s(v):
    return str(v).strip() if v is not None else ""

def sql_str(v):
    return "'" + s(v).replace("'", "''") + "'"

rows = []

def add(equipment, task_no, task_name, item_group, item_task, frequency, task_detail):
    if not s(equipment) or not s(task_no):
        return
    rows.append({
        "equipment": s(equipment),
        "name_en": s(equipment),
        "task_no": s(task_no),
        "task_name": s(task_name),
        "item_group": s(item_group),
        "item_task": s(item_task),
        "frequency": s(frequency),
        "task_detail": s(task_detail),
    })

# --- F1: PM_Task_Detail (SDL PRESS OUTSOLE, full detail) ---
wb1 = openpyxl.load_workbook(F1, data_only=True, read_only=True)
ws = wb1["PM_Task_Detail"]
for r in list(ws.iter_rows(values_only=True))[1:]:
    # cols: 0 No#, 1 Task No, 2 Equipment, 3 Item Group, 4 Item Task, 5 Checklist#, 6 Task Name, 7 Frequency, 8 Est Hours, 9 Task Detail, 10 Safety Note
    add(r[2], r[1], r[6], r[3], r[4], r[7], r[9])

# --- F1: PM_Generation (NON PAD GEL PRESS, dedup by Task No) ---
ws = wb1["PM_Generation"]
gen_rows = list(ws.iter_rows(values_only=True))[2:]  # skip title + header
seen = set()
for r in gen_rows:
    # cols: 0 Item#, 1 Equipment, 2 Task No, 3 Item Group, 4 Item Task, 5 Checklist#, 6 Task Name, 7 Frequency
    key = (s(r[1]), s(r[2]))
    if not key[1] or key in seen:
        continue
    seen.add(key)
    add(r[1], r[2], r[6], r[3], r[4], r[7], "")
wb1.close()

# --- F2: stitching sheets (dedup by Task No per sheet) ---
wb2 = openpyxl.load_workbook(F2, data_only=True, read_only=True)
for sheet in wb2.sheetnames:
    ws = wb2[sheet]
    data = list(ws.iter_rows(values_only=True))
    # header is row 0; check Frequency Plan presence to locate JAN column but we only need cols 1..6
    # cols: 0 Item#, 1 Equip, 2 WorkTaskNo, 3 Task No, 4 Item Group, 5 WO Task Name, 6 Tan suat
    seen_s = set()
    for r in data[1:]:
        key = (s(r[1]), s(r[3]))
        if not key[1] or key in seen_s:
            continue
        seen_s.add(key)
        # No Item Task / Task Detail columns in these sheets -> leave blank
        add(r[1], r[3], r[5], r[4], "", r[6], "")
wb2.close()

# Order: equipment asc, task_no asc
rows.sort(key=lambda d: (d["equipment"].lower(), d["task_no"].lower()))

print(f"Total pm_tasks rows to import: {len(rows)}")
for r in rows:
    print(f"  {r['equipment']} | {r['task_no']} | {r['task_name'][:50]}")

# --- CSV preview ---
with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=["equipment", "name_en", "task_no", "task_name", "item_group", "item_task", "frequency", "task_detail"])
    w.writeheader()
    w.writerows(rows)
print(f"Wrote {OUT_CSV}")

# --- SQL import script ---
# Idempotent per (equipment, name_en, task_no): delete matching keys first, then insert.
# Run in Supabase SQL Editor (privileged role). Safe to re-run.
lines = []
lines.append("-- pm_tasks import from PM_TPM workbooks (2026-11-09)")
lines.append("-- Sources: PM_TPM Non Pad GeL Press MC.xlsx (PM_Task_Detail + PM_Generation)")
lines.append("--          PM_TPM Stitiching Machine.xlsx (6 sheets)")
lines.append(f"-- Rows: {len(rows)} (SDL PRESS OUTSOLE + NON PAD GEL PRESS + 6 stitching equipments)")
lines.append("-- Run in Supabase SQL Editor. Re-running is safe (delete-then-insert per key).")
lines.append("")
lines.append("BEGIN;")
lines.append("")
# delete statement with keys
keys = ",\n".join(f"  ({sql_str(r['equipment'])}, {sql_str(r['name_en'])}, {sql_str(r['task_no'])})" for r in rows)
lines.append("DELETE FROM pm_tasks")
lines.append("WHERE (equipment, name_en, task_no) IN (VALUES")
lines.append(keys)
lines.append(");")
lines.append("")
lines.append("INSERT INTO pm_tasks (equipment, name_en, task_no, task_name, item_group, item_task, frequency, task_detail) VALUES")
vals = []
for r in rows:
    vals.append(f"  ({sql_str(r['equipment'])}, {sql_str(r['name_en'])}, {sql_str(r['task_no'])}, {sql_str(r['task_name'])}, {sql_str(r['item_group'])}, {sql_str(r['item_task'])}, {sql_str(r['frequency'])}, {sql_str(r['task_detail'])})")
lines.append(",\n".join(vals))
lines.append(";")
lines.append("")
lines.append("COMMIT;")
lines.append("")
lines.append("-- Verify:")
lines.append("SELECT equipment, name_en, count(*) AS rows FROM pm_tasks GROUP BY equipment, name_en ORDER BY equipment, name_en;")
lines.append("")
with open(OUT_SQL, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"Wrote {OUT_SQL}")
