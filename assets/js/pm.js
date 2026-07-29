(function () {
  const config = window.SAMHO_SUPABASE.pm;
  if (!config) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const parseDate = (value) => {
    if (!value) return null;
    const parts = value.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})/);
    if (parts) {
      const [, dd, mm, yyyy] = parts;
      const year = yyyy.length === 2 ? 2000 + Number(yyyy) : Number(yyyy);
      return new Date(year, Number(mm) - 1, Number(dd));
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const machineMap = {};
  config.machines.forEach((m) => { machineMap[m.itemCode] = m; });
  const getMachineByCode = (code) => machineMap[code] || null;

  let scheduleRows = [];
  let taskCatalog = {};
  let completedData = {};
  let manualRecords = [];
  let taskProgress = {};
  let taskValidation = {};
  let isValidator = false;
  let currentUserRole = "viewer";
  let calMonth = today.getMonth();
  let calYear = today.getFullYear();
  const scheduleFilter = { plant: "", search: "", status: "" };
  let schedulePage = 0;
  const SCHEDULE_PAGE_SIZE = 10;

  const LS_COMPLETED = "pm_completed_data";
  const LS_MANUAL = "pm_manual_records";
  const LS_TASK_PROGRESS = "pm_task_progress";
  const LS_TASK_VALIDATION = "pm_task_validation";

  const loadPersistence = () => {
    try {
      const c = localStorage.getItem(LS_COMPLETED);
      if (c) completedData = JSON.parse(c);
      const m = localStorage.getItem(LS_MANUAL);
      if (m) manualRecords = JSON.parse(m);
      const p = localStorage.getItem(LS_TASK_PROGRESS);
      if (p) taskProgress = JSON.parse(p);
      const v = localStorage.getItem(LS_TASK_VALIDATION);
      if (v) taskValidation = JSON.parse(v);
    } catch (e) {}
  };

  const saveCompleted = () => {
    try { localStorage.setItem(LS_COMPLETED, JSON.stringify(completedData)); } catch (e) {}
  };

  const saveManual = () => {
    try { localStorage.setItem(LS_MANUAL, JSON.stringify(manualRecords)); } catch (e) {}
  };

  const saveTaskProgress = () => {
    try { localStorage.setItem(LS_TASK_PROGRESS, JSON.stringify(taskProgress)); } catch (e) {}
  };

  const saveTaskValidation = () => {
    try { localStorage.setItem(LS_TASK_VALIDATION, JSON.stringify(taskValidation)); } catch (e) {}
  };

  const loadMasterData = () => {
    if (window.PM_MASTER_DATA) {
      scheduleRows = window.PM_MASTER_DATA.scheduleRows || [];
      taskCatalog = window.PM_MASTER_DATA.taskCatalog || {};
    }
  };

  const getMonthRecords = () => {
    const result = [];
    const equipMap = config.equipmentMap || {};

    const equipTasks = {};
    for (const row of scheduleRows) {
      const marker = row.months[calMonth];
      if (!marker) continue;
      if (!equipTasks[row.equipmentName]) equipTasks[row.equipmentName] = [];
      equipTasks[row.equipmentName].push(row);
    }

    const getPMDays = () => {
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const result = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(calYear, calMonth, d).getDay();
        if (dow >= 2 && dow <= 5) result.push(d);
      }
      return result;
    };
    const pmDays = getPMDays();
    for (const [equipName, tasks] of Object.entries(equipTasks)) {
      const machines = equipMap[equipName];
      if (!machines || !machines.length) continue;
      const step = Math.max(1, Math.floor(pmDays.length / machines.length));
      for (let i = 0; i < machines.length; i++) {
        const code = machines[i];
        const day = pmDays[Math.min(i * step, pmDays.length - 1)];
        const dateStr = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const isPast = dateStr < todayStr;
        const m = getMachineByCode(code) || {};
        const key = `pm_${code}_${calYear}_${calMonth}`;
        const saved = completedData[key];
        const taskNos = [...new Set(tasks.map((t) => t.taskNo).filter(Boolean))];
        result.push({
          id: key,
          _type: "generated",
          itemCode: code,
          equipment: m.equipment || code,
          plant: m.plant || "",
          section: m.section || "",
          equipmentName: equipName,
          tasks,
          taskNo: taskNos.length <= 3 ? taskNos.join(", ") : `${taskNos.length} tasks`,
          taskName: taskNos.length <= 3 ? tasks.map((t) => t.taskName).filter(Boolean).join("; ") : `${taskNos.length} tasks`,
          dueDate: dateStr,
          status: saved ? saved.status : (isPast ? "completed" : "pending"),
          completedAt: saved ? saved.completedAt : (isPast ? dateStr : null),
          technician: saved ? saved.technician : [],
          notes: saved ? saved.notes : "",
          assignedTeam: [...config.defaultTeam]
        });
      }
    }
    for (const rec of manualRecords) {
      const due = parseDate(rec.dueDate);
      if (due && due.getMonth() === calMonth && due.getFullYear() === calYear) {
        result.push(rec);
      }
    }
    return result;
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

  const openTaskModal = (equipmentName, recordId) => {
    const tasks = taskCatalog[equipmentName];
    if (!tasks || !tasks.length) {
      setStatusMsg("pmScheduleStatus", "No task catalog found for this equipment.", "warning");
      return;
    }
    const container = document.getElementById("pmTaskChecklist");
    const title = document.getElementById("pmTaskDetailTitle");
    const progressEl = document.getElementById("pmTaskProgress");

    if (!container || !title || !progressEl) return;
    const parts = recordId ? recordId.split("_") : [];
    const pkey = parts.length >= 4 ? `${parts[1]}_${parts[2]}_${parts[3]}` : "";
    const prog = pkey ? (taskProgress[pkey] || {}) : {};
    const val = pkey ? (taskValidation[pkey] || {}) : {};
    title.textContent = `Task Checklist - ${tasks[0].equipmentName}`;
    container.innerHTML = tasks.map((t) => {
      const doneChecked = prog[t.taskNo] || false;
      const valChecked = val[t.taskNo] || false;
      const steps = (t.taskDetail || "").split("\n").filter(Boolean);
      const doneCls = doneChecked ? " done" : "";
      const valCls = valChecked ? " validated" : "";
      const valCb = isValidator ? `<label class="task-val-check${valChecked ? ' checked' : ''}">
        <input type="checkbox" class="val-cb" ${valChecked ? "checked" : ""} data-pkey="${pkey}" data-task-no="${t.taskNo}" />
        <span>Xác Nhận</span>
      </label>` : "";
      return `<div class="task-card${doneCls}${valCls}">
        <label class="task-card-check">
          <input type="checkbox" class="done-cb" ${doneChecked ? "checked" : ""} data-pkey="${pkey}" data-task-no="${t.taskNo}" />
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
      const allDone = done === total;
      const allVal = validated === total;
      if (allVal && pkey) {
        completedData[recordId] = completedData[recordId] || {};
        completedData[recordId].status = "validated";
        if (!completedData[recordId].completedAt) completedData[recordId].completedAt = todayStr;
        saveCompleted();
      }
    };

    container.querySelectorAll(".done-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const k = cb.dataset.pkey;
        const tn = cb.dataset.taskNo;
        if (!k) return;
        if (!taskProgress[k]) taskProgress[k] = {};
        if (cb.checked) {
          taskProgress[k][tn] = true;
          cb.closest(".task-card").classList.add("done");
        } else {
          delete taskProgress[k][tn];
          cb.closest(".task-card").classList.remove("done");
        }
        saveTaskProgress();
        updateProgress();
      });
    });

    container.querySelectorAll(".val-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const k = cb.dataset.pkey;
        const tn = cb.dataset.taskNo;
        if (!k) return;
        if (!taskValidation[k]) taskValidation[k] = {};
        if (cb.checked) {
          taskValidation[k][tn] = true;
          cb.closest(".task-val-check").classList.add("checked");
        } else {
          delete taskValidation[k][tn];
          cb.closest(".task-val-check").classList.remove("checked");
        }
        saveTaskValidation();
        updateProgress();
      });
    });

    updateProgress();
    const modal = document.getElementById("pmTaskModal");
    modal.dataset.activeRecordId = recordId || "";
    const approveBtn = document.getElementById("pmApproveBtn");
    if (approveBtn) {
      const rec = getMonthRecords().find((r) => r.id === recordId);
      const st = rec ? getStatus(rec) : "pending";
      approveBtn.hidden = !(isValidator && st !== "validated");
      approveBtn.onclick = () => {
        completedData[recordId] = completedData[recordId] || {};
        completedData[recordId].status = "validated";
        completedData[recordId].completedAt = completedData[recordId].completedAt || todayStr;
        saveCompleted();
        modal.classList.remove("active");
        renderScheduleTab();
      };
    }
    modal.classList.add("active");
    lucideIcons();
  };

  const renderScheduleTab = () => {
    const allRecords = getMonthRecords();
    renderStats(allRecords);
    renderCalendar(allRecords);

    const tbody = document.getElementById("pmScheduleList");
    const summary = document.getElementById("pmScheduleSummary");
    if (!tbody) return;

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
          <button class="info-search control-icon-button pm-viewtask-btn" data-equip="${r.equipmentName}" data-id="${r.id}" type="button" title="View Task"><i data-lucide="clipboard-list"></i></button>
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
      btn.addEventListener("click", () => openTaskModal(btn.dataset.equip, btn.dataset.id));
    });
    tbody.querySelectorAll(".pm-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });
    tbody.querySelectorAll(".pm-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deletePM(btn.dataset.id));
    });

    lucideIcons();
  };

  const updateStatus = (id, value) => {
    const record = getMonthRecords().find((r) => r.id === id);
    if (!record) return;
    if (record._type === "manual") {
      const mr = manualRecords.find((r) => r.id === id);
      if (mr) { mr.status = value; mr.completedAt = value === "completed" || value === "validated" ? todayStr : null; saveManual(); }
    } else {
      const key = id;
      completedData[key] = completedData[key] || {};
      completedData[key].status = value;
      if (value === "completed" || value === "validated") completedData[key].completedAt = todayStr;
      else if (value === "pending") completedData[key].completedAt = null;
      saveCompleted();
    }
    renderScheduleTab();
  };

  const openCompleteModal = (id) => {
    const record = getMonthRecords().find((r) => r.id === id);
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

  const completePM = (id, technician, notes) => {
    const record = getMonthRecords().find((r) => r.id === id);
    if (!record) return false;
    if (record._type === "manual") {
      const mr = manualRecords.find((r) => r.id === id);
      if (mr) { mr.status = "completed"; mr.completedAt = todayStr; mr.technician = technician; mr.notes = notes; saveManual(); }
    } else {
      const key = id;
      completedData[key] = { status: "completed", completedAt: todayStr, technician, notes };
      saveCompleted();
    }
    return true;
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

  const createPM = (itemCode, dueDate, team) => {
    const machine = getMachineByCode(itemCode);
    if (!machine) return false;
    const id = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    manualRecords.push({
      id,
      _type: "manual",
      itemCode: machine.itemCode,
      equipment: machine.equipment,
      plant: machine.plant,
      section: machine.section,
      equipmentName: "",
      taskNo: "",
      taskName: "Manual PM",
      itemGroup: "",
      itemTask: "",
      frequency: "",
      dueDate,
      status: "pending",
      completedAt: null,
      technician: [],
      notes: "",
      assignedTeam: team
    });
    saveManual();
    return true;
  };

  const openEditModal = (id) => {
    const rec = manualRecords.find((r) => r.id === id);
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

  const editPM = (id, itemCode, dueDate, team) => {
    const rec = manualRecords.find((r) => r.id === id);
    if (!rec) return false;
    const machine = getMachineByCode(itemCode);
    if (machine) {
      rec.itemCode = machine.itemCode;
      rec.equipment = machine.equipment;
      rec.plant = machine.plant;
      rec.section = machine.section;
    }
    rec.dueDate = dueDate;
    rec.assignedTeam = team;
    saveManual();
    return true;
  };

  const deletePM = (id) => {
    const rec = manualRecords.find((r) => r.id === id);
    if (!rec || rec.status === "completed" || rec.status === "validated") return;
    if (!confirm(`Delete PM for ${rec.equipment}?`)) return;
    manualRecords = manualRecords.filter((r) => r.id !== id);
    saveManual();
    renderScheduleTab();
  };

  const checkUserRole = async () => {
    const user = window.SAMHO_AUTH?.currentUser();
    if (!user) return;
    const userId = String(user.email || "").split("@")[0];
    if (config.defaultTeam.includes(userId)) currentUserRole = "pid";
    if (config.validatorTeam && config.validatorTeam.includes(userId)) isValidator = true;
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadPersistence();
    loadMasterData();

    checkUserRole();

    const machineSelect = document.getElementById("pmFormMachine");
    if (machineSelect) {
      machineSelect.innerHTML = '<option value="">-- Select machine --</option>' +
        config.machines.map((m) => `<option value="${m.itemCode}">${m.equipment} (${m.itemCode})</option>`).join("");
    }

    renderScheduleTab();

    initMechanicPicker("pmCompleteTechnician", "pmCompleteChips", "pmCompleteMechanicSearch", "pmCompleteOptions");
    initMechanicPicker("pmFormTeam", "pmFormTeamChips", "pmFormTeamSearch", "pmFormTeamOptions");

    document.getElementById("pmCompleteForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = e.target.dataset.recordId;
      const technician = getSelectedMechanics("pmCompleteTechnician");
      if (!technician.length) { setStatusMsg("pmCompleteStatus", "Please select a technician.", "warning"); return; }
      const notes = getValue("pmCompleteNotes");
      if (completePM(id, technician, notes)) {
        document.getElementById("pmCompleteModal").classList.remove("active");
        setStatusMsg("pmScheduleStatus", "PM completed successfully.", "success");
        renderScheduleTab();
      }
    });

    document.getElementById("pmAddButton")?.addEventListener("click", openCreateModal);

    document.getElementById("pmForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = e.target.dataset.editId;
      const itemCode = getValue("pmFormMachine");
      const dueDate = getValue("pmFormDueDate");
      const team = getSelectedMechanics("pmFormTeam");
      if (!itemCode || !dueDate) { setStatusMsg("pmFormStatus", "Please fill all fields.", "warning"); return; }
      if (editId) {
        editPM(editId, itemCode, dueDate, team);
      } else {
        createPM(itemCode, dueDate, team);
      }
      document.getElementById("pmFormModal").classList.remove("active");
      renderScheduleTab();
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

    document.getElementById("pmSchedulePrevPage")?.addEventListener("click", () => {
      if (schedulePage > 0) { schedulePage--; renderScheduleTab(); }
    });
    document.getElementById("pmScheduleNextPage")?.addEventListener("click", () => {
      schedulePage++; renderScheduleTab();
    });

    document.getElementById("calPrev")?.addEventListener("click", () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      schedulePage = 0;
      renderScheduleTab();
    });
    document.getElementById("calNext")?.addEventListener("click", () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      schedulePage = 0;
      renderScheduleTab();
    });

    lucideIcons();
  });
})();
