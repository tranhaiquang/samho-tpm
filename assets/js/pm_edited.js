(function () {
  const config = window.SAMHO_SUPABASE.pm;
  if (!config) return;

  const db = window.SAMHO_DB;
  if (!db) return;

  const recordsConfig = config.recordsTable || {};
  const recordsTable = recordsConfig.table || "pm_records";
  const recCol = recordsConfig.fieldMap || {};
  const col = (key, fallback) => recCol[key] || fallback;

  const today = new Date();

  const addDays = (date, days) => window.SAMHO_DATETIME.addDays(date, days);
  const formatDate = (value) => window.SAMHO_DATETIME.formatDate(value);
  const parseDate = (value) => window.SAMHO_DATETIME.parse(value);

  const machineMap = {};
  config.machines.forEach((m) => { machineMap[m.itemCode] = m; });
  const getMachineByCode = (code) => machineMap[code] || null;

  const equipReverse = {};
  Object.entries(config.equipmentMap || {}).forEach(([equipName, codes]) => {
    codes.forEach((code) => { if (!equipReverse[code]) equipReverse[code] = equipName; });
  });

  let scheduleRows = [];
  let taskCatalog = {};
  let currentRecords = [];
  let isValidator = false;
  let currentUserRole = "viewer";
  let calMonth = today.getMonth();
  let calYear = today.getFullYear();
  const scheduleFilter = { plant: "", search: "", status: "" };
  let schedulePage = 0;
  const SCHEDULE_PAGE_SIZE = 10;

  const apiInsert = (payload) => db.insert(recordsTable, payload);
  const apiUpdate = (id, payload) => db.update(recordsTable, { id }, payload);
  const apiDelete = (id) => db.remove(recordsTable, { id });
  const apiFindByCodeAndDate = (itemCode, dueDate) =>
    db.select(recordsTable, {
      columns: "id",
      where: { [col("itemCode", "item_code")]: itemCode, [col("dueDate", "due_date")]: dueDate }
    });

  const friendlyError = (error, action) => db.friendly(error, action);

  const loadMasterData = () => {
    if (window.PM_MASTER_DATA) {
      scheduleRows = window.PM_MASTER_DATA.scheduleRows || [];
      taskCatalog = window.PM_MASTER_DATA.taskCatalog || {};
    }
  };

  const getStatus = (rec) => {
    if (rec.status === "validated") return "validated";
    if (rec.status === "completed") return "completed";
    return "pending";
  };
  const statusLabel = (st) => {
    if (st === "validated") return "ĐÃ XÁC NHẬN";
    if (st === "completed") return "HOÀN THÀNH";
    return "ĐANG CHỜ";
  };
  const statusClass = { pending: "status-pending", completed: "status-completed", validated: "status-validated" };
  const freqLabel = (f) => {
    if (f === "Tháng") return "M";
    if (f === "Tuần") return "W";
    if (f === "Quí") return "Q";
    return f;
  };

  const renderStats = (records) => {
    const inMonth = records.filter((r) => {
      const due = parseDate(r.dueDate);
      return due && due.getMonth() === calMonth && due.getFullYear() === calYear;
    });
    const pending = inMonth.filter((r) => getStatus(r) === "pending").length;
    const completed = inMonth.filter((r) => getStatus(r) === "completed").length;
    const validated = inMonth.filter((r) => getStatus(r) === "validated").length;
    document.getElementById("pmStatPending").textContent = pending;
    document.getElementById("pmStatCompleted").textContent = completed;
    document.getElementById("pmStatValidated").textContent = validated;
  };

  const renderCalendar = (records) => {
    const grid = document.getElementById("pmCalendarGrid");
    const label = document.getElementById("calMonthLabel");
    if (!grid || !label) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    label.textContent = `${months[calMonth]} ${calYear}`;
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const headerDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let html = headerDays.map((d) => `<div class="cal-day-header">${d}</div>`).join("");
    for (let i = 0; i < firstDay; i++) { html += '<div class="cal-day empty"></div>'; }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayRecords = records.filter((r) => r.dueDate === dateStr);
      let cls = "cal-day";
      if (dayRecords.length) {
        const sts = dayRecords.map((r) => getStatus(r));
        if (sts.some((s) => s === "pending")) cls += " pending";
        else if (sts.some((s) => s === "validated")) cls += " validated";
        else cls += " completed";
      }
      const count = dayRecords.length;
      let label = "";
      if (count === 1) {
        label = `<span>${dayRecords[0].itemCode}</span>`;
      } else if (count <= 3) {
        const codes = [...new Set(dayRecords.map((r) => r.itemCode))];
        label = codes.map((c) => `<span>${c}</span>`).join("");
      } else {
        const sections = [...new Set(dayRecords.map((r) => r.section))];
        label = `<span class="cal-count-badge">${count} máy</span>`;
        if (sections.length <= 2) label += sections.map((s) => `<small>${s}</small>`).join("");
      }
      html += `<div class="${cls}"><strong>${d}</strong>${label}</div>`;
    }
    grid.innerHTML = html;
  };

  const renderSchedulePagination = (totalPages) => {
    const info = document.getElementById("pmSchedulePageInfo");
    const prevBtn = document.getElementById("pmSchedulePrevPage");
    const nextBtn = document.getElementById("pmScheduleNextPage");
    const pagination = document.getElementById("pmSchedulePagination");
    if (!info || !prevBtn || !nextBtn || !pagination) return;
    if (totalPages <= 1) { pagination.classList.add("sr-only"); return; }
    pagination.classList.remove("sr-only");
    info.textContent = `Page ${schedulePage + 1} / ${totalPages}`;
    prevBtn.disabled = schedulePage === 0;
    nextBtn.disabled = schedulePage >= totalPages - 1;
  };

  const setStatusMsg = (id, msg, type) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.dataset.type = type || "idle"; }
  };

  const getValue = (id) => (document.getElementById(id)?.value || "").trim();
  const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  const lucideIcons = () => { if (window.lucide) window.lucide.createIcons(); };

  const normalizeSearch = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLocaleLowerCase().trim();

  const getSelectedMechanics = (hiddenId) => getValue(hiddenId).split(",").map((n) => n.trim()).filter(Boolean);

  const renderMechanicSelection = (hiddenId, chipsId, names) => {
    const hidden = document.getElementById(hiddenId);
    const chips = document.getElementById(chipsId);
    if (!hidden || !chips) return;
    hidden.value = names.join(", ");
    chips.replaceChildren(...names.map((name) => {
      const chip = document.createElement("span");
      chip.className = "mechanic-chip";
      const label = document.createElement("span");
      label.className = "mechanic-name";
      label.textContent = name;
      const rm = document.createElement("button");
      rm.className = "mechanic-remove";
      rm.type = "button";
      rm.textContent = "×";
      rm.setAttribute("aria-label", `Remove ${name}`);
      rm.addEventListener("click", (e) => { e.stopPropagation(); renderMechanicSelection(hiddenId, chipsId, names.filter((n) => n !== name)); renderMechanicOptions(hiddenId, chipsId); });
      chip.addEventListener("click", (e) => { if (e.target !== rm) { e.preventDefault(); e.stopPropagation(); } }, true);
      chip.append(label, rm);
      return chip;
    }));
  };

  const renderMechanicOptions = (hiddenId, chipsId) => {
    const search = document.getElementById(hiddenId.replace("Technician", "MechanicSearch").replace("Team", "TeamSearch"));
    const options = document.getElementById(hiddenId.replace("Technician", "Options").replace("Team", "TeamOptions"));
    if (!search || !options) return;
    const selected = getSelectedMechanics(hiddenId);
    const query = normalizeSearch(search.value);
    const words = query.split(/\s+/).filter(Boolean);
    const allNames = [...new Set(config.defaultTeam)];
    const matches = allNames.filter((name) => {
      const nw = normalizeSearch(name).split(/\s+/);
      return !selected.includes(name) && words.every((w) => nw.some((nw2) => nw2.startsWith(w)));
    }).slice(0, 3);
    options.replaceChildren(...matches.map((name) => {
      const btn = document.createElement("button");
      btn.className = "mechanic-option";
      btn.type = "button";
      btn.role = "option";
      btn.textContent = name;
      btn.addEventListener("click", () => {
        renderMechanicSelection(hiddenId, chipsId, [...getSelectedMechanics(hiddenId), name]);
        search.value = "";
        renderMechanicOptions(hiddenId, chipsId);
        search.focus();
      });
      return btn;
    }));
    options.hidden = !query || document.activeElement !== search || !matches.length;
  };

  const initMechanicPicker = (hiddenId, chipsId, searchId, optionsId) => {
    const search = document.getElementById(searchId);
    const picker = search?.closest(".mechanic-picker");
    if (!search) return;
    const handler = () => renderMechanicOptions(hiddenId, chipsId);
    search.addEventListener("input", handler);
    document.addEventListener("click", (e) => {
      if (!picker?.contains(e.target)) {
        const opts = document.getElementById(optionsId);
        if (opts) opts.hidden = true;
      }
    });
  };

  const fetchTasks = async (equipmentName) => {
    const pmConfig = window.SAMHO_SUPABASE?.pm || {};
    const table = pmConfig.tasksTable || "pm_tasks";
    const fields = pmConfig.taskFields || {};
    const equipmentCol = fields.equipment || "equipment";
    if (!db) return null;
    const rows = await db.select(table, { where: { [equipmentCol]: equipmentName }, order: fields.taskNo || "task_no" });
    if (!rows || !rows.length) return null;
    return rows.map((row) => ({
      taskNo: row[fields.taskNo] || row.task_no,
      taskName: row[fields.taskName] || row.task_name,
      equipmentName: row[fields.equipment] || row.equipment || equipmentName,
      itemGroup: row[fields.itemGroup] || row.item_group,
      itemTask: row[fields.itemTask] || row.item_task,
      frequency: row[fields.frequency] || row.frequency,
      estHours: "",
      taskDetail: row[fields.taskDetail] || row.task_detail
    }));
  };

  const rowToRecord = (row) => {
    const recordType = row[col("recordType", "record_type")] || "generated";
    const itemCode = row[col("itemCode", "item_code")] || "";
    const machine = getMachineByCode(itemCode) || {};
    let taskProgress = {};
    let taskValidation = {};
    try { taskProgress = JSON.parse(row[col("taskProgress", "task_progress")] || "{}"); } catch (e) {}
    try { taskValidation = JSON.parse(row[col("taskValidation", "task_validation")] || "{}"); } catch (e) {}
    return {
      id: row[col("id", "id")],
      _type: recordType === "manual" ? "manual" : "generated",
      itemCode,
      equipment: machine.equipment || itemCode,
      plant: row[col("plant", "plant")] || machine.plant || "",
      section: machine.section || "",
      equipmentName: recordType === "generated" ? (equipReverse[itemCode] || "") : "",
      dueDate: String(row[col("dueDate", "due_date")] || "").slice(0, 10),
      status: row[col("status", "status")] || "pending",
      technician: row[col("technician", "technician")] || [],
      notes: row[col("notes", "notes")] || "",
      assignedTeam: row[col("pic", "pic")] || [],
      taskProgress,
      taskValidation
    };
  };

  const getPMDays = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(calYear, calMonth, d).getDay();
      if (dow >= 2 && dow <= 5) result.push(d);
    }
    return result;
  };

  const computeGeneratedRows = () => {
    const equipMap = config.equipmentMap || {};
    const equipTasks = {};
    for (const row of scheduleRows) {
      const marker = row.months[calMonth];
      if (!marker) continue;
      if (!equipTasks[row.equipmentName]) equipTasks[row.equipmentName] = [];
      equipTasks[row.equipmentName].push(row);
    }
    const pmDays = getPMDays();
    const result = [];
    for (const [equipName, tasks] of Object.entries(equipTasks)) {
      const machines = equipMap[equipName];
      if (!machines || !machines.length) continue;
      const step = Math.max(1, Math.floor(pmDays.length / machines.length));
      for (let i = 0; i < machines.length; i++) {
        const code = machines[i];
        const day = pmDays[Math.min(i * step, pmDays.length - 1)];
        const dueDate = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const m = getMachineByCode(code) || {};
        result.push({
          itemCode: code,
          equipment: m.equipment || code,
          plant: m.plant || "",
          section: m.section || "",
          equipmentName: equipName,
          dueDate
        });
      }
    }
    return result;
  };

  const loadMonthRecords = async () => {
    const dueDateCol = col("dueDate", "due_date");
    const first = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-01`;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const last = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(daysInMonth).padStart(2,"0")}`;
    const monthWhere = [[dueDateCol, "gte", first], [dueDateCol, "lte", last]];
    let rows = await db.select(recordsTable, { where: monthWhere });
    const existing = new Set(rows.map((r) => `${r[col("itemCode", "item_code")] || ""}::${String(r[col("dueDate", "due_date")] || "").slice(0, 10)}`));
    let inserted = 0;
    for (const g of computeGeneratedRows()) {
      const key = `${g.itemCode}::${g.dueDate}`;
      if (existing.has(key)) continue;
      await apiInsert({
        [col("itemCode", "item_code")]: g.itemCode,
        [col("plant", "plant")]: g.plant,
        [col("pic", "pic")]: [...config.defaultTeam],
        [col("status", "status")]: "pending",
        [col("dueDate", "due_date")]: g.dueDate,
        [col("recordType", "record_type")]: "generated"
      });
      existing.add(key);
      inserted++;
    }
    if (inserted) rows = await db.select(recordsTable, { where: monthWhere });
    currentRecords = rows.map(rowToRecord);
    return currentRecords;
  };

  const openTaskModal = async (record) => {
    const equipmentName = record?.equipmentName || "";
    let tasks = null;
    if (equipmentName) {
      try {
        tasks = await fetchTasks(equipmentName);
      } catch (e) {
        setStatusMsg("pmScheduleStatus", "Could not load the task checklist from pm_tasks.", "error");
      }
    }
    if (!tasks || !tasks.length) tasks = taskCatalog[equipmentName] || null;
    if (!tasks || !tasks.length) {
      setStatusMsg("pmScheduleStatus", "No task catalog found for this equipment.", "warning");
      return;
    }
    const container = document.getElementById("pmTaskChecklist");
    const title = document.getElementById("pmTaskDetailTitle");
    const progressEl = document.getElementById("pmTaskProgress");

    if (!container || !title || !progressEl) return;
    const prog = record?.taskProgress || {};
    const val = record?.taskValidation || {};
    title.textContent = `Task Checklist - ${tasks[0].equipmentName}`;
    container.innerHTML = tasks.map((t) => {
      const doneChecked = prog[t.taskNo] || false;
      const valChecked = val[t.taskNo] || false;
      const steps = (t.taskDetail || "").split("\n").filter(Boolean);
      const doneCls = doneChecked ? " done" : "";
      const valCls = valChecked ? " validated" : "";
      const valCb = isValidator ? `<label class="task-val-check${valChecked ? ' checked' : ''}">
        <input type="checkbox" class="val-cb" ${valChecked ? "checked" : ""} data-task-no="${t.taskNo}" />
        <span>Xác Nhận</span>
      </label>` : "";
      return `<div class="task-card${doneCls}${valCls}">
        <label class="task-card-check">
          <input type="checkbox" class="done-cb" ${doneChecked ? "checked" : ""} data-task-no="${t.taskNo}" />
          <div class="task-card-body">
            <div class="task-card-header">
              <div class="task-card-title">
                <span class="task-card-no">${t.taskNo}</span>
                <span class="task-card-name">${t.taskName}</span>
              </div>
              <div class="task-card-meta">${valCb}
                <span class="freq-badge freq-${t.frequency}">${freqLabel(t.frequency)}</span>
                <span class="task-est">${t.estHours}</span>
              </div>
            </div>
            <div class="task-card-sub">${t.itemGroup}${t.itemTask ? " / " + t.itemTask : ""}</div>
            <div class="task-card-steps">
              <ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
            </div>
          </div>
        </label>
      </div>`;
    }).join("");

    const updateProgress = () => {
      const total = tasks.length;
      const done = container.querySelectorAll(".done-cb:checked").length;
      const validated = container.querySelectorAll(".val-cb:checked").length;
      progressEl.textContent = `Hoàn thành: ${done}/${total}  •  Đã xác nhận: ${validated}/${total}`;
    };

    container.querySelectorAll(".done-cb").forEach((cb) => {
      cb.addEventListener("change", async () => {
        const tn = cb.dataset.taskNo;
        if (!tn || !record) return;
        const next = { ...record.taskProgress };
        if (cb.checked) next[tn] = true; else delete next[tn];
        cb.disabled = true;
        try {
          await apiUpdate(record.id, { [col("taskProgress", "task_progress")]: JSON.stringify(next) });
          record.taskProgress = next;
          cb.closest(".task-card").classList.toggle("done", cb.checked);
        } catch (e) {
          cb.checked = !cb.checked;
          setStatusMsg("pmScheduleStatus", friendlyError(e, "save task progress"), "error");
        } finally {
          cb.disabled = false;
          updateProgress();
        }
      });
    });

    container.querySelectorAll(".val-cb").forEach((cb) => {
      cb.addEventListener("change", async () => {
        const tn = cb.dataset.taskNo;
        if (!tn || !record) return;
        const next = { ...record.taskValidation };
        if (cb.checked) next[tn] = true; else delete next[tn];
        cb.disabled = true;
        try {
          await apiUpdate(record.id, { [col("taskValidation", "task_validation")]: JSON.stringify(next) });
          record.taskValidation = next;
          cb.closest(".task-val-check").classList.toggle("checked", cb.checked);
          const total = container.querySelectorAll(".val-cb").length;
          const checked = container.querySelectorAll(".val-cb:checked").length;
          if (total && checked === total && record.status !== "validated") {
            await apiUpdate(record.id, { [col("status", "status")]: "validated" });
            record.status = "validated";
          }
        } catch (e) {
          cb.checked = !cb.checked;
          setStatusMsg("pmScheduleStatus", friendlyError(e, "save validation"), "error");
        } finally {
          cb.disabled = false;
          updateProgress();
        }
      });
    });

    updateProgress();
    const modal = document.getElementById("pmTaskModal");
    modal.dataset.activeRecordId = record?.id || "";
    const approveBtn = document.getElementById("pmApproveBtn");
    if (approveBtn) {
      const st = record ? getStatus(record) : "pending";
      approveBtn.hidden = !(isValidator && st !== "validated");
      approveBtn.onclick = async () => {
        try {
          await apiUpdate(record.id, { [col("status", "status")]: "validated" });
          record.status = "validated";
          modal.classList.remove("active");
          await renderScheduleTab();
        } catch (e) {
          setStatusMsg("pmScheduleStatus", friendlyError(e, "validate this record"), "error");
        }
      };
    }
    modal.classList.add("active");
    lucideIcons();
  };

  const renderScheduleTab = async () => {
    window.SAMHO_LOADING?.show("Loading PM schedule...");
    let allRecords = [];
    let loadError = null;
    try {
      allRecords = await loadMonthRecords();
    } catch (e) {
      loadError = e;
      allRecords = [];
    }

    renderStats(allRecords);
    renderCalendar(allRecords);

    const tbody = document.getElementById("pmScheduleList");
    const summary = document.getElementById("pmScheduleSummary");
    if (tbody) {
      if (loadError) {
        tbody.innerHTML = '<tr><td colspan="7">Unable to load PM schedules.</td></tr>';
        if (summary) summary.textContent = "";
        document.getElementById("pmSchedulePagination")?.classList.add("sr-only");
        const raw = String(loadError?.message || loadError || "").slice(0, 300);
        setStatusMsg("pmScheduleStatus", `Unable to load PM records. ${raw}`, "error");
        window.SAMHO_LOADING?.hide();
        return;
      }
    }
    if (!tbody) { window.SAMHO_LOADING?.hide(); return; }

    let filtered = [...allRecords];
    if (scheduleFilter.plant) filtered = filtered.filter((r) => r.plant === scheduleFilter.plant);
    if (scheduleFilter.search) {
      const q = normalizeSearch(scheduleFilter.search);
      filtered = filtered.filter((r) => normalizeSearch(r.equipment).includes(q) || normalizeSearch(r.itemCode).includes(q));
    }
    if (scheduleFilter.status) filtered = filtered.filter((r) => getStatus(r) === scheduleFilter.status);

    filtered.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));

    const totalPages = Math.max(1, Math.ceil(filtered.length / SCHEDULE_PAGE_SIZE));
    if (schedulePage >= totalPages) schedulePage = totalPages - 1;
    const start = schedulePage * SCHEDULE_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + SCHEDULE_PAGE_SIZE);

    if (!pageItems.length) {
      tbody.innerHTML = '<tr><td colspan="7">No PM schedules found for this month.</td></tr>';
      summary.textContent = "0 schedules";
      document.getElementById("pmSchedulePagination")?.classList.add("sr-only");
      window.SAMHO_LOADING?.hide();
      return;
    }

    const isPid = currentUserRole === "pid";

    tbody.innerHTML = pageItems.map((r, i) => {
      const st = getStatus(r);
      const cls = statusClass[st];
      const lbl = statusLabel(st);
      return `<tr class="${cls}">
        <td>${start + i + 1}</td>
        <td><strong>${r.itemCode}</strong><br /><small>${r.section}</small></td>
        <td>${r.plant}</td>
        <td>${formatDate(r.dueDate)}</td>
        <td>${r.assignedTeam?.join(", ") || ""}</td>
        <td>${st === "validated" ? `<span class="pm-status-text ${cls}">${lbl}</span>` : `<select class="pm-status-select ${cls}" data-id="${r.id}">
          <option value="pending" ${st === "pending" ? "selected" : ""}>ĐANG CHỜ</option>
          <option value="completed" ${st === "completed" ? "selected" : ""}>HOÀN THÀNH</option>
        </select>`}</td>
        <td class="pm-actions">
          <button class="info-search control-icon-button pm-viewtask-btn" data-id="${r.id}" type="button" title="View Task"><i data-lucide="clipboard-list"></i></button>
          ${isPid && r._type === "manual" ? `<button class="info-search control-icon-button pm-edit-btn" data-id="${r.id}" type="button" title="Edit"><i data-lucide="pencil"></i></button>
          <button class="info-search control-icon-button pm-delete-btn" data-id="${r.id}" type="button" title="Delete"><i data-lucide="trash-2"></i></button>` : ""}
        </td>
      </tr>`;
    }).join("");

    summary.textContent = `${filtered.length} schedule(s)`;
    renderSchedulePagination(totalPages);

    tbody.querySelectorAll(".pm-status-select").forEach((sel) => {
      sel.addEventListener("change", () => updateStatus(sel.dataset.id, sel.value));
    });
    tbody.querySelectorAll(".pm-viewtask-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rec = currentRecords.find((r) => r.id === btn.dataset.id);
        if (rec) openTaskModal(rec);
      });
    });
    tbody.querySelectorAll(".pm-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });
    tbody.querySelectorAll(".pm-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deletePM(btn.dataset.id));
    });

    lucideIcons();
    window.SAMHO_LOADING?.hide();
  };

  const updateStatus = async (id, value) => {
    const record = currentRecords.find((r) => r.id === id);
    if (!record) return;
    try {
      await apiUpdate(id, { [col("status", "status")]: value });
    } catch (e) {
      setStatusMsg("pmScheduleStatus", friendlyError(e, "update this record"), "error");
      return;
    }
    await renderScheduleTab();
  };

  const openCompleteModal = (id) => {
    const record = currentRecords.find((r) => r.id === id);
    if (!record) return;
    const st = getStatus(record);
    if (st === "completed" || st === "validated") return;
    setValue("pmCompleteMachine", `${record.equipment} (${record.itemCode})`);
    setValue("pmCompleteDueDate", formatDate(record.dueDate));
    setValue("pmCompleteTechnician", "");
    setValue("pmCompleteNotes", "");
    renderMechanicSelection("pmCompleteTechnician", "pmCompleteChips", [window.SAMHO_AUTH?.currentUserId() || ""]);
    document.getElementById("pmCompleteForm").dataset.recordId = id;
    document.getElementById("pmCompleteModal").classList.add("active");
  };

  const completePM = async (id, technician, notes) => {
    const record = currentRecords.find((r) => r.id === id);
    if (!record) return false;
    try {
      await apiUpdate(id, {
        [col("status", "status")]: "completed",
        [col("technician", "technician")]: technician,
        [col("notes", "notes")]: notes
      });
      return true;
    } catch (e) {
      setStatusMsg("pmCompleteStatus", friendlyError(e, "complete this record"), "error");
      return false;
    }
  };

  const openCreateModal = () => {
    document.getElementById("pmFormTitle").textContent = "Thêm PM / Create PM";
    const select = document.getElementById("pmFormMachine");
    select.innerHTML = '<option value="">-- Select machine --</option>' +
      config.machines.map((m) => `<option value="${m.itemCode}">${m.equipment} (${m.itemCode})</option>`).join("");
    select.value = "";
    setValue("pmFormDueDate", addDays(today, config.defaultIntervalDays));
    renderMechanicSelection("pmFormTeam", "pmFormTeamChips", [...config.defaultTeam]);
    document.getElementById("pmForm").dataset.editId = "";
    document.getElementById("pmFormModal").classList.add("active");
  };

  const createPM = async (itemCode, dueDate, team) => {
    const machine = getMachineByCode(itemCode);
    if (!machine) return false;
    try {
      const existing = await apiFindByCodeAndDate(itemCode, dueDate);
      if (existing && existing.length) {
        setStatusMsg("pmFormStatus", "A PM record already exists for this machine on this date.", "warning");
        return false;
      }
      await apiInsert({
        [col("itemCode", "item_code")]: machine.itemCode,
        [col("equipment", "equipment")]: machine.equipment,
        [col("plant", "plant")]: machine.plant,
        [col("section", "section")]: machine.section,
        [col("pic", "pic")]: team,
        [col("status", "status")]: "pending",
        [col("dueDate", "due_date")]: dueDate,
        [col("recordType", "record_type")]: "manual"
      });
      return true;
    } catch (e) {
      setStatusMsg("pmFormStatus", friendlyError(e, "create this record"), "error");
      return false;
    }
  };

  const openEditModal = (id) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec || rec.status === "completed" || rec.status === "validated") return;
    document.getElementById("pmFormTitle").textContent = "Sửa PM / Edit PM";
    const select = document.getElementById("pmFormMachine");
    select.innerHTML = '<option value="">-- Select machine --</option>' +
      config.machines.map((m) => `<option value="${m.itemCode}">${m.equipment} (${m.itemCode})</option>`).join("");
    select.value = rec.itemCode;
    setValue("pmFormDueDate", rec.dueDate);
    renderMechanicSelection("pmFormTeam", "pmFormTeamChips", rec.assignedTeam || []);
    document.getElementById("pmForm").dataset.editId = id;
    document.getElementById("pmFormModal").classList.add("active");
  };

  const editPM = async (id, itemCode, dueDate, team) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec) return false;
    const machine = getMachineByCode(itemCode);
    try {
      const existing = await apiFindByCodeAndDate(itemCode, dueDate);
      if (existing && existing.length && existing[0].id !== id) {
        setStatusMsg("pmFormStatus", "A PM record already exists for this machine on this date.", "warning");
        return false;
      }
      const payload = {
        [col("dueDate", "due_date")]: dueDate,
        [col("pic", "pic")]: team
      };
      if (machine) {
        payload[col("itemCode", "item_code")] = machine.itemCode;
        payload[col("equipment", "equipment")] = machine.equipment;
        payload[col("plant", "plant")] = machine.plant;
        payload[col("section", "section")] = machine.section;
      }
      await apiUpdate(id, payload);
      return true;
    } catch (e) {
      setStatusMsg("pmFormStatus", friendlyError(e, "update this record"), "error");
      return false;
    }
  };

  const deletePM = async (id) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec || rec.status === "completed" || rec.status === "validated") return;
    if (!confirm(`Delete PM for ${rec.equipment}?`)) return;
    try {
      await apiDelete(id);
      await renderScheduleTab();
    } catch (e) {
      setStatusMsg("pmScheduleStatus", friendlyError(e, "delete this record"), "error");
    }
  };

  const checkUserRole = async () => {
    const user = window.SAMHO_AUTH?.currentUser();
    if (!user) return;
    const userId = String(user.email || "").split("@")[0];
    if (config.defaultTeam.includes(userId)) currentUserRole = "pid";
    if (config.validatorTeam && config.validatorTeam.includes(userId)) isValidator = true;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    loadMasterData();

    await checkUserRole();

    const machineSelect = document.getElementById("pmFormMachine");
    if (machineSelect) {
      machineSelect.innerHTML = '<option value="">-- Select machine --</option>' +
        config.machines.map((m) => `<option value="${m.itemCode}">${m.equipment} (${m.itemCode})</option>`).join("");
    }

    await renderScheduleTab();

    initMechanicPicker("pmCompleteTechnician", "pmCompleteChips", "pmCompleteMechanicSearch", "pmCompleteOptions");
    initMechanicPicker("pmFormTeam", "pmFormTeamChips", "pmFormTeamSearch", "pmFormTeamOptions");

    document.getElementById("pmCompleteForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = e.target.dataset.recordId;
      const technician = getSelectedMechanics("pmCompleteTechnician");
      if (!technician.length) { setStatusMsg("pmCompleteStatus", "Please select a technician.", "warning"); return; }
      const notes = getValue("pmCompleteNotes");
      if (await completePM(id, technician, notes)) {
        document.getElementById("pmCompleteModal").classList.remove("active");
        setStatusMsg("pmScheduleStatus", "PM completed successfully.", "success");
        await renderScheduleTab();
      }
    });

    document.getElementById("pmAddButton")?.addEventListener("click", openCreateModal);

    document.getElementById("pmForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = e.target.dataset.editId;
      const itemCode = getValue("pmFormMachine");
      const dueDate = getValue("pmFormDueDate");
      const team = getSelectedMechanics("pmFormTeam");
      if (!itemCode || !dueDate) { setStatusMsg("pmFormStatus", "Please fill all fields.", "warning"); return; }
      const ok = editId ? await editPM(editId, itemCode, dueDate, team) : await createPM(itemCode, dueDate, team);
      if (ok) {
        document.getElementById("pmFormModal").classList.remove("active");
        await renderScheduleTab();
      }
    });

    document.querySelectorAll("[data-close-pm-complete]").forEach((el) => {
      el.addEventListener("click", () => {
        document.getElementById("pmCompleteModal").classList.remove("active");
        setStatusMsg("pmCompleteStatus", "", "idle");
      });
    });

    document.querySelectorAll("[data-close-pm-form]").forEach((el) => {
      el.addEventListener("click", () => {
        document.getElementById("pmFormModal").classList.remove("active");
        setStatusMsg("pmFormStatus", "", "idle");
      });
    });

    document.querySelectorAll("[data-close-pm-task]").forEach((el) => {
      el.addEventListener("click", () => {
        document.getElementById("pmTaskModal").classList.remove("active");
      });
    });

    document.getElementById("pmSchedulePrevPage")?.addEventListener("click", async () => {
      if (schedulePage > 0) { schedulePage--; await renderScheduleTab(); }
    });
    document.getElementById("pmScheduleNextPage")?.addEventListener("click", async () => {
      schedulePage++; await renderScheduleTab();
    });

    document.getElementById("calPrev")?.addEventListener("click", async () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      schedulePage = 0;
      await renderScheduleTab();
    });
    document.getElementById("calNext")?.addEventListener("click", async () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      schedulePage = 0;
      await renderScheduleTab();
    });

    lucideIcons();
  });
})();
