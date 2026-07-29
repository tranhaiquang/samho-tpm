const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..", "data", "Master Data - PM - TECH.xlsx");
const out = path.resolve(__dirname, "..", "data", "pm_master_data.js");

const wb = XLSX.readFile(src);

// --- Schedule rows (PM_Task_Schedule) ---
const schedWs = wb.Sheets["PM_Task_Schedule"];
const schedData = XLSX.utils.sheet_to_json(schedWs, { header: 1, defval: "" });
const scheduleRows = [];
for (let i = 1; i < schedData.length; i++) {
  const r = schedData[i];
  const equip = (r[1] || "").trim();
  if (!equip) continue;
  const months = [];
  for (let m = 0; m < 12; m++) months.push((r[11 + m] || "").trim());
  scheduleRows.push({
    equipmentName: equip,
    workTaskNo: (r[2] || "").trim(),
    taskNo: (r[3] || "").trim(),
    itemGroup: (r[4] || "").trim(),
    itemTask: (r[5] || "").trim(),
    taskName: (r[8] || "").trim(),
    frequency: (r[9] || "").trim(),
    freqPlan: (r[10] || "").trim(),
    months,
    performedBy: (r[23] || "").trim()
  });
}

// --- Task catalog ---
const taskCatalog = {};

const SHEET_NAMES = ["EM CUTTING", "MARKING LINER", "SEMI CUTTING", "AUTO LASER PUCHING", "SOCKLINER"];
for (const name of SHEET_NAMES) {
  const ws = wb.Sheets[name];
  if (!ws) continue;
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[1]) continue;
    tasks.push({
      taskNo: (r[1] || "").trim(),
      equipmentName: (r[2] || "").trim(),
      itemGroup: (r[3] || "").trim(),
      itemTask: (r[4] || "").trim(),
      taskName: (r[6] || "").trim(),
      frequency: (r[7] || "").trim(),
      estHours: (r[8] || "").trim(),
      taskDetail: (r[9] || "").trim(),
      safetyNote: (r[10] || "").trim()
    });
  }
  if (tasks.length) taskCatalog[tasks[0].equipmentName] = tasks;
}

const detailWs = wb.Sheets["PM_Task_Detail"];
if (detailWs) {
  const data = XLSX.utils.sheet_to_json(detailWs, { header: 1, defval: "" });
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[1]) continue;
    tasks.push({
      taskNo: (r[1] || "").trim(),
      equipmentName: (r[2] || "").trim(),
      itemGroup: (r[3] || "").trim(),
      itemTask: (r[4] || "").trim(),
      taskName: (r[6] || "").trim(),
      frequency: (r[7] || "").trim(),
      estHours: (r[8] || "").trim(),
      taskDetail: (r[9] || "").trim(),
      safetyNote: (r[10] || "").trim()
    });
  }
  const key = tasks.length ? tasks[0].equipmentName : "";
  if (key && !taskCatalog[key]) taskCatalog[key] = tasks;
}

const output = JSON.stringify({ scheduleRows, taskCatalog }, null, 2);
fs.writeFileSync(out, "window.PM_MASTER_DATA = " + output + ";", "utf-8");
console.log("Written to " + out);
console.log("Schedule rows: " + scheduleRows.length);
console.log("Catalog entries: " + Object.keys(taskCatalog).join(", "));
