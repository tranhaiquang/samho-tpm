(function () {
  if (window.SAMHO_LANG) {
    window.SAMHO_LANG.register({
      "pm.page.title": { vi: "Lịch Bảo Trì", en: "PM Schedule" },
      "pm.addButton": { vi: "Thêm PM", en: "New PM" },
      "pm.status.pending": { vi: "ĐANG CHỜ", en: "PENDING" },
      "pm.status.completed": { vi: "HOÀN THÀNH", en: "COMPLETED" },
      "pm.status.validated": { vi: "ĐÃ XÁC NHẬN", en: "VALIDATED" },
      "pm.month.jan": { vi: "Tháng 1", en: "Jan" },
      "pm.month.feb": { vi: "Tháng 2", en: "Feb" },
      "pm.month.mar": { vi: "Tháng 3", en: "Mar" },
      "pm.month.apr": { vi: "Tháng 4", en: "Apr" },
      "pm.month.may": { vi: "Tháng 5", en: "May" },
      "pm.month.jun": { vi: "Tháng 6", en: "Jun" },
      "pm.month.jul": { vi: "Tháng 7", en: "Jul" },
      "pm.month.aug": { vi: "Tháng 8", en: "Aug" },
      "pm.month.sep": { vi: "Tháng 9", en: "Sep" },
      "pm.month.oct": { vi: "Tháng 10", en: "Oct" },
      "pm.month.nov": { vi: "Tháng 11", en: "Nov" },
      "pm.month.dec": { vi: "Tháng 12", en: "Dec" },
      "pm.day.sun": { vi: "CN", en: "Sun" },
      "pm.day.mon": { vi: "T2", en: "Mon" },
      "pm.day.tue": { vi: "T3", en: "Tue" },
      "pm.day.wed": { vi: "T4", en: "Wed" },
      "pm.day.thu": { vi: "T5", en: "Thu" },
      "pm.day.fri": { vi: "T6", en: "Fri" },
      "pm.day.sat": { vi: "T7", en: "Sat" },
      "pm.calendar.machines": { vi: "{count} máy", en: "{count} machines" },
      "pm.filter.allPlants": { vi: "Tất cả nhà máy", en: "All Plants" },
      "pm.filter.plantsAria": { vi: "Lọc theo nhà máy", en: "Filter by plant" },
      "pm.calendar.unknownPlant": { vi: "Không rõ nhà máy", en: "Unknown plant" },
      "pm.hiddenNotice": { vi: "{count} bản ghi không có nhà máy đang bị ẩn.", en: "{count} record(s) without a plant are hidden." },
      "pm.day.title": { vi: "PM trong ngày", en: "PM for this day" },
      "pm.day.emptyDay": { vi: "Không có bản ghi PM trong ngày này.", en: "No PM records on this day." },
      "pm.day.viewTask": { vi: "Xem checklist", en: "View checklist" },
      "pm.column.no": { vi: "STT", en: "No." },
      "pm.column.itemCode": { vi: "MÃ MÁY", en: "ITEM CODE" },
      "pm.column.plant": { vi: "Nhà máy", en: "Plant" },
      "pm.column.dueDate": { vi: "Ngày đến hạn", en: "Due Date" },
      "pm.column.pic": { vi: "PIC", en: "PIC" },
      "pm.column.status": { vi: "Trạng thái", en: "Status" },
      "pm.column.checklist": { vi: "Checklist", en: "Checklist" },
      "pm.loading.schedule": { vi: "Đang tải lịch PM...", en: "Loading PM schedule..." },
      "pm.schedule.listAria": { vi: "Danh sách lịch PM", en: "PM schedule list" },
      "pm.pagination.prev": { vi: "Trước", en: "Prev" },
      "pm.pagination.next": { vi: "Sau", en: "Next" },
      "pm.pagination.pageInfo": { vi: "Trang {current} / {total}", en: "Page {current} / {total}" },
      "pm.summary.count": { vi: "{count} lịch", en: "{count} schedule(s)" },
      "pm.summary.zero": { vi: "0 lịch", en: "0 schedules" },
      "pm.error.loadSchedules": { vi: "Không thể tải lịch PM.", en: "Unable to load PM schedules." },
      "pm.error.loadRecords": { vi: "Không thể tải bản ghi PM. {detail}", en: "Unable to load PM records. {detail}" },
      "pm.empty.noSchedules": { vi: "Không có lịch PM trong tháng này.", en: "No PM schedules found for this month." },
      "pm.common.close": { vi: "Đóng", en: "Close" },
      "pm.common.cancel": { vi: "Hủy", en: "Cancel" },
      "pm.complete.title": { vi: "Xác Nhận PM", en: "Complete PM" },
      "pm.complete.submit": { vi: "Hoàn thành", en: "Complete" },
      "pm.complete.selectTechnician": { vi: "Vui lòng chọn thợ sửa chữa.", en: "Please select a technician." },
      "pm.complete.success": { vi: "Đã hoàn thành PM.", en: "PM completed successfully." },
      "pm.field.machine": { vi: "Máy", en: "Machine" },
      "pm.field.dueDate": { vi: "Ngày đến hạn", en: "Due Date" },
      "pm.field.technician": { vi: "Người sửa chữa", en: "Technician" },
      "pm.field.notes": { vi: "Ghi chú", en: "Notes" },
      "pm.field.itemCode": { vi: "Mã máy", en: "Item Code" },
      "pm.field.machineName": { vi: "Tên máy", en: "Machine Name" },
      "pm.field.plant": { vi: "Nhà máy", en: "Plant" },
      "pm.mechanic.placeholder": { vi: "Nhập tên", en: "Type a name" },
      "pm.mechanic.searchAria": { vi: "Tìm tên thợ", en: "Search mechanic names" },
      "pm.mechanic.remove": { vi: "Loại bỏ {name}", en: "Remove {name}" },
      "pm.form.eyebrow": { vi: "Bảo Trì PM", en: "PM Maintenance" },
      "pm.form.title.create": { vi: "Thêm PM", en: "Create PM" },
      "pm.form.title.edit": { vi: "Sửa PM", en: "Edit PM" },
      "pm.form.section.machine": { vi: "Máy móc", en: "Machine" },
      "pm.form.section.machineTitle": { vi: "Máy móc", en: "Machine" },
      "pm.form.section.machineHint": { vi: "Tìm mã máy để tự động điền thông tin", en: "Search the item code to auto-fill machine info" },
      "pm.form.section.schedule": { vi: "Lịch", en: "Schedule" },
      "pm.form.section.scheduleTitle": { vi: "Lịch", en: "Schedule" },
      "pm.form.section.scheduleHint": { vi: "Chọn ngày bảo trì đến hạn", en: "Pick the maintenance due date" },
      "pm.form.section.team": { vi: "Đội ngũ", en: "Team" },
      "pm.form.section.teamTitle": { vi: "Đội ngũ", en: "Team" },
      "pm.form.section.teamHint": { vi: "PIC được phân công thực hiện PM", en: "Assigned PIC who will carry out the PM" },
      "pm.form.itemCodePh": { vi: "Nhập mã máy", en: "Enter item code" },
      "pm.form.picLabel": { vi: "PIC / Đội ngũ phân công", en: "PIC / Assigned Team" },
      "pm.form.teamSearchAria": { vi: "Tìm tên thành viên", en: "Search team names" },
      "pm.form.searchFirst": { vi: "Vui lòng tìm và tải máy trước.", en: "Search and load a machine first." },
      "pm.form.duplicate": { vi: "Đã tồn tại bản ghi PM cho máy này vào ngày này.", en: "A PM record already exists for this machine on this date." },
      "pm.form.fillFields": { vi: "Vui lòng điền tất cả các trường.", en: "Please fill all fields." },
      "pm.search.enterCode": { vi: "Vui lòng nhập mã máy trước.", en: "Enter an item code first." },
      "pm.search.notFound": { vi: "Không tìm thấy máy với mã này.", en: "No machine found for this code." },
      "pm.search.loaded": { vi: "Đã tải thông tin máy.", en: "Machine loaded." },
      "pm.action.searchCode": { vi: "tìm kiếm mã này", en: "search this code" },
      "pm.action.create": { vi: "tạo bản ghi này", en: "create this record" },
      "pm.action.update": { vi: "cập nhật bản ghi này", en: "update this record" },
      "pm.action.deleteRecord": { vi: "xóa bản ghi này", en: "delete this record" },
      "pm.action.complete": { vi: "hoàn tất bản ghi này", en: "complete this record" },
      "pm.action.saveTaskProgress": { vi: "lưu tiến độ công việc", en: "save task progress" },
      "pm.action.saveValidation": { vi: "lưu xác nhận", en: "save validation" },
      "pm.action.validate": { vi: "xác nhận bản ghi này", en: "validate this record" },
      "pm.action.viewTask": { vi: "Xem công việc", en: "View Task" },
      "pm.action.delete": { vi: "Xóa", en: "Delete" },
      "pm.action.edit": { vi: "Sửa", en: "Edit" },
      "pm.task.title": { vi: "Checklist công việc", en: "Task Checklist" },
      "pm.task.titleWith": { vi: "Checklist công việc - {equipment}", en: "Task Checklist - {equipment}" },
      "pm.task.confirm": { vi: "Xác Nhận", en: "Confirm" },
      "pm.task.progress": { vi: "Hoàn thành: 0/0", en: "Completed: 0/0" },
      "pm.task.progressFull": { vi: "Hoàn thành: {done}/{total} • Đã xác nhận: {validated}/{total}", en: "Completed: {done}/{total} • Validated: {validated}/{total}" },
      "pm.task.loadError": { vi: "Không thể tải checklist công việc từ pm_tasks.", en: "Could not load the task checklist from pm_tasks." },
      "pm.task.noCatalog": { vi: "Không tìm thấy danh mục công việc cho máy này.", en: "No task catalog found for this machine." },
      "pm.task.checkAll": { vi: "Vui lòng đánh dấu tất cả công việc trước khi xác nhận.", en: "Check all tasks before confirming." },
      "pm.task.approveBtn": { vi: "Xác Nhận", en: "Confirm" },
      "pm.confirm.delete": { vi: "Xóa PM cho {equipment}?", en: "Delete PM for {equipment}?" },
      "pm.deleted": { vi: "Đã xóa PM cho {equipment}.", en: "Deleted PM for {equipment}." },
      "pm.delete.blocked": { vi: "Không thể xóa bản ghi đã hoàn thành hoặc đã xác nhận.", en: "Cannot delete a completed or validated record." },
      "pm.delete.noRows": { vi: "Không xóa được bản ghi (0 dòng bị ảnh hưởng). Vui lòng kiểm tra quyền xóa (RLS) trên bảng pm_records.", en: "Delete affected 0 rows — please check the delete (RLS) policy on pm_records." },
    });
  }

  const t = (id, vars) => (window.SAMHO_LANG ? window.SAMHO_LANG.t(id, vars) : "");

  const config = window.SAMHO_SUPABASE.pm;
  if (!config) return;

  const db = window.SAMHO_DB;
  if (!db) return;

  const recordsConfig = config.recordsTable || {};
  const recordsTable = recordsConfig.table || "pm_records";
  const recCol = recordsConfig.fieldMap || {};
  const col = (key, fallback) => recCol[key] || fallback;
  const deletedCol = col("deleted", "deleted");

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
  let lastLoadOk = false;
  let calMonth = today.getMonth();
  let calYear = today.getFullYear();
  const scheduleFilter = { search: "", status: "" };
  let schedulePage = 0;
  const SCHEDULE_PAGE_SIZE = 10;

  const normalizePlant = (value) => String(value || "").trim().toLowerCase();
  const hashString = (value) => {
    let h = 0;
    const s = String(value || "");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };
  const UNKNOWN_PLANT_COLOR = "#9ca3af";
  const plantColor = (value) => {
    const key = normalizePlant(value);
    if (!key) return UNKNOWN_PLANT_COLOR;
    const map = config.plantColors || {};
    if (map[key]) return map[key];
    const palette = config.plantFallbackPalette || [];
    return palette.length ? palette[hashString(key) % palette.length] : UNKNOWN_PLANT_COLOR;
  };
  const plantShort = (value) => {
    const key = normalizePlant(value);
    if (!key) return "?";
    const m = key.match(/plant\s*(\w+)/);
    if (m) return m[1].toUpperCase().slice(0, 3);
    return key.slice(0, 3).toUpperCase();
  };
  const recordLabel = (r) => r.nameEn || r.equipment || r.itemCode;

  const getVisibleRecords = () => currentRecords;

  const apiInsert = (payload) => db.insert(recordsTable, payload);
  const apiUpdate = (id, payload) => db.update(recordsTable, { id }, payload);
  const apiDelete = (id) => db.update(recordsTable, { id }, { [deletedCol]: true });
  const apiFindByCodeAndDate = (itemCode, dueDate) =>
    db.select(recordsTable, {
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
    if (st === "validated") return t("pm.status.validated");
    if (st === "completed") return t("pm.status.completed");
    return t("pm.status.pending");
  };
  const statusClass = { pending: "status-pending", completed: "status-completed", validated: "status-validated" };

  const syncStatusView = (rec) => {
    const st = getStatus(rec);
    const cls = statusClass[st];
    const lbl = statusLabel(st);
    const btn = document.querySelector(`.pm-viewtask-btn[data-id="${rec.id}"]`);
    if (btn) {
      const row = btn.closest("tr");
      const cell = row && row.querySelector(".pm-status-select");
      if (cell) { cell.className = `pm-status-select ${cls}`; cell.textContent = lbl; }
    }
    renderStats(getVisibleRecords());
    renderCalendar();
  };

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

  const renderDayCellLabel = (dayRecords) => {
    if (dayRecords.length === 1) {
      const r = dayRecords[0];
      return `<span class="cal-chip cal-chip-single" style="--pc:${plantColor(r.plant)}" title="${recordLabel(r)}"><span class="cal-chip-name">${recordLabel(r)}</span><small class="cal-chip-code">${r.itemCode}</small></span>`;
    }
    if (dayRecords.length <= 3) {
      return dayRecords.map((r) => `<span class="cal-chip" style="--pc:${plantColor(r.plant)}" title="${recordLabel(r)}">${recordLabel(r)}</span>`).join("");
    }
    const groups = new Map();
    dayRecords.forEach((r) => {
      const key = normalizePlant(r.plant);
      groups.set(key, (groups.get(key) || 0) + 1);
    });
    const parts = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, n]) =>
      `<span class="cal-plant-badge" style="--pc:${key ? plantColor(key) : UNKNOWN_PLANT_COLOR}">${key ? plantShort(key) : "?"}×${n}</span>`
    ).join("");
    return `<span class="cal-count-badge">${t("pm.calendar.machines", { count: dayRecords.length })}</span><span class="cal-plant-badges">${parts}</span>`;
  };

  const renderCalendar = () => {
    const grid = document.getElementById("pmCalendarGrid");
    const label = document.getElementById("calMonthLabel");
    if (!grid || !label) return;
    const records = getVisibleRecords();
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    label.textContent = `${t(`pm.month.${months[calMonth]}`)} ${calYear}`;
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const headerDays = ["sun","mon","tue","wed","thu","fri","sat"];
    let html = headerDays.map((d) => `<div class="cal-day-header">${t(`pm.day.${d}`)}</div>`).join("");
    for (let i = 0; i < firstDay; i++) { html += '<div class="cal-day empty"></div>'; }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayRecords = records.filter((r) => r.dueDate === dateStr);
      let cls = "cal-day";
      if (dayRecords.length) cls += " has-records";
      if (dayRecords.length) {
        const sts = dayRecords.map((r) => getStatus(r));
        if (sts.some((s) => s === "pending")) cls += " pending";
        else if (sts.some((s) => s === "validated")) cls += " validated";
        else cls += " completed";
      }
      html += `<div class="${cls}"${dayRecords.length ? ` data-date="${dateStr}" role="button" tabindex="0"` : ""}><strong>${d}</strong>${renderDayCellLabel(dayRecords)}</div>`;
    }
    grid.innerHTML = html;
    grid.querySelectorAll(".cal-day.has-records").forEach((cell) => {
      cell.addEventListener("click", () => openDayModal(cell.dataset.date));
    });
  };

  const closeDayModal = () => {
    document.getElementById("pmDayModal")?.classList.remove("active");
  };

  const openDayModal = (dateStr) => {
    const modal = document.getElementById("pmDayModal");
    const dateEl = document.getElementById("pmDayModalDate");
    const groupsEl = document.getElementById("pmDayGroups");
    if (!modal || !groupsEl) return;
    const visible = getVisibleRecords().filter((r) => r.dueDate === dateStr);
    if (dateEl) dateEl.textContent = formatDate(dateStr);
    if (!visible.length) {
      groupsEl.innerHTML = `<p class="pm-day-empty">${t("pm.day.emptyDay")}</p>`;
    } else {
      const groups = new Map();
      visible.forEach((r) => {
        const key = normalizePlant(r.plant) || "__unknown__";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      });
      groupsEl.innerHTML = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, recs]) => {
        const known = key !== "__unknown__";
        const color = known ? plantColor(key) : UNKNOWN_PLANT_COLOR;
        const name = known ? recs[0].plant : t("pm.calendar.unknownPlant");
        return `<section class="pm-day-group">
          <h4 class="pm-day-group-title" style="--pc:${color}">${name}<span>${recs.length}</span></h4>
          ${recs.map((r) => {
            const st = getStatus(r);
            return `<button class="pm-day-row" type="button" data-id="${r.id}">
              <span class="pm-day-row-name">${recordLabel(r)}<small>${r.itemCode}</small></span>
              <span class="pm-status-select ${statusClass[st]}">${statusLabel(st)}</span>
              <i data-lucide="clipboard-list"></i>
            </button>`;
          }).join("")}
        </section>`;
      }).join("");
      groupsEl.querySelectorAll(".pm-day-row").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rec = currentRecords.find((r) => r.id === btn.dataset.id);
          closeDayModal();
          if (rec) openTaskModal(rec);
        });
      });
    }
    modal.classList.add("active");
    lucideIcons();
  };

  const renderSchedulePagination = (totalPages) => {
    const info = document.getElementById("pmSchedulePageInfo");
    const prevBtn = document.getElementById("pmSchedulePrevPage");
    const nextBtn = document.getElementById("pmScheduleNextPage");
    const pagination = document.getElementById("pmSchedulePagination");
    if (!info || !prevBtn || !nextBtn || !pagination) return;
    if (totalPages <= 1) { pagination.classList.add("sr-only"); return; }
    pagination.classList.remove("sr-only");
    info.textContent = t("pm.pagination.pageInfo", { current: schedulePage + 1, total: totalPages });
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
      rm.setAttribute("aria-label", t("pm.mechanic.remove", { name }));
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

  const fetchTasks = async (nameEn) => {
    const pmConfig = window.SAMHO_SUPABASE?.pm || {};
    const table = pmConfig.tasksTable || "pm_tasks";
    const fields = pmConfig.taskFields || {};
    const filterCol = fields.filterColumn || fields.nameEn || "name_en";
    if (!db || !nameEn) return null;
    const rows = await db.select(table, { where: { [filterCol]: nameEn }, order: fields.taskNo || "task_no" });
    if (!rows || !rows.length) return null;
    return rows.map((row) => ({
      taskNo: row[fields.taskNo] || row.task_no,
      taskName: row[fields.taskName] || row.task_name,
      equipmentName: row[fields.nameEn] || row.name_en || nameEn,
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
    const parseList = (value) => {
      let parsed;
      try { parsed = JSON.parse(value || "[]"); } catch (e) { return []; }
      return Array.isArray(parsed) ? parsed : [];
    };
    return {
      id: row[col("id", "id")],
      _type: recordType === "manual" ? "manual" : "generated",
      itemCode,
      nameEn: row[col("nameEn", "name_en")] || "",
      equipment: machine.equipment || itemCode,
      plant: row[col("plant", "plant")] || machine.plant || "",
      section: machine.section || "",
      equipmentName: recordType === "generated" ? (equipReverse[itemCode] || "") : "",
      dueDate: String(row[col("dueDate", "due_date")] || "").slice(0, 10),
      status: row[col("status", "status")] || "pending",
      technician: row[col("technician", "technician")] || [],
      notes: row[col("notes", "notes")] || "",
      assignedTeam: row[col("pic", "pic")] || [],
      taskProgress: parseList(row[col("taskProgress", "task_progress")]),
      taskValidation: parseList(row[col("taskValidation", "task_validation")])
    };
  };

  const loadMonthRecords = async () => {
    const dueDateCol = col("dueDate", "due_date");
    const first = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-01`;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const last = `${String(calYear).padStart(4,"0")}-${String(calMonth+1).padStart(2,"0")}-${String(daysInMonth).padStart(2,"0")}`;
    const monthWhere = [[dueDateCol, "gte", first], [dueDateCol, "lte", last]];
    const allRows = await db.select(recordsTable, { where: monthWhere });
    const rows = allRows.filter((r) => !r[deletedCol]);
    const supabaseConfig = window.SAMHO_SUPABASE || {};
    const mi = supabaseConfig.machineInfo || {};
    const miCodes = [...new Set(rows.map((r) => r[col("itemCode", "item_code")] || "").filter(Boolean))];
    let miRows = [];
    try {
      if (miCodes.length) {
        miRows = await db.select(mi.table || "machine_info", { where: { [mi.codeColumn || "ITEM_CODE"]: miCodes } });
      }
    } catch (e) {
      console.error("machine_info lookup failed (name_en backfill skipped):", e);
    }
    const miNameByCode = new Map(miRows.map((r) => [r[mi.codeColumn || "ITEM_CODE"], r.name_en || r.NAME_EN || ""]));
    for (const r of rows) {
      const code = r[col("itemCode", "item_code")] || "";
      if (code && !(r[col("nameEn", "name_en")] || "")) {
        const nameEn = miNameByCode.get(code) || "";
        if (nameEn) {
          await apiUpdate(r[col("id", "id")], { [col("nameEn", "name_en")]: nameEn });
          r[col("nameEn", "name_en")] = nameEn;
        }
      }
    }
    currentRecords = rows.map(rowToRecord);
    return currentRecords;
  };

  const resolveRecordNameEn = async (record) => {
    if (!record) return "";
    const existing = String(record.nameEn || "").trim();
    if (existing) return existing;
    const code = String(record.itemCode || "").trim();
    if (!code) return "";
    const supabaseConfig = window.SAMHO_SUPABASE || {};
    const mi = supabaseConfig.machineInfo || {};
    try {
      const row = await db.getOne(mi.table || "machine_info", { where: { [mi.codeColumn || "ITEM_CODE"]: code } });
      const nameEn = String(row?.name_en || row?.NAME_EN || "").trim();
      if (nameEn) {
        record.nameEn = nameEn;
        if (record.id) {
          try {
            await apiUpdate(record.id, { [col("nameEn", "name_en")]: nameEn });
          } catch (e) {
            console.error("Failed to persist name_en for", code, e);
          }
        }
      }
      return nameEn;
    } catch (e) {
      console.error("machine_info lookup failed for", code, e);
      return "";
    }
  };

  const openTaskModal = async (record) => {
    let nameEn = await resolveRecordNameEn(record);
    let tasks = null;
    if (nameEn) {
      try {
        tasks = await fetchTasks(nameEn);
      } catch (e) {
        console.error("fetchTasks failed:", e);
        setStatusMsg("pmScheduleStatus", t("pm.task.loadError"), "error");
      }
    } else {
      console.warn("No task catalog: missing name_en for item_code:", record?.itemCode || "(none)");
    }
    if (!tasks || !tasks.length) {
      if (nameEn) {
        console.warn("No task catalog for name_en:", nameEn, "item_code:", record?.itemCode || "");
      }
      setStatusMsg("pmScheduleStatus", t("pm.task.noCatalog"), "warning");
      return;
    }
    const container = document.getElementById("pmTaskChecklist");
    const title = document.getElementById("pmTaskDetailTitle");
    const progressEl = document.getElementById("pmTaskProgress");

    if (!container || !title || !progressEl) return;
    const prog = record?.taskProgress || [];
    const val = record?.taskValidation || [];
    title.textContent = t("pm.task.titleWith", { equipment: tasks[0].equipmentName });
    container.innerHTML = tasks.map((t) => {
      const doneChecked = prog.includes(t.taskNo);
      const valChecked = val.includes(t.taskNo);
      const steps = (t.taskDetail || "").split("\n").filter(Boolean);
      const doneCls = doneChecked ? " done" : "";
      const valCls = valChecked ? " validated" : "";
      const valCb = isValidator ? `<label class="task-val-check${valChecked ? ' checked' : ''}">
        <input type="checkbox" class="val-cb" ${valChecked ? "checked" : ""} data-task-no="${t.taskNo}" />
        <span>${t("pm.task.confirm")}</span>
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
              <ol>${steps.map((s) => `<li>${s.replace(/^\s*\d+[)\.、]\s*/, "")}</li>`).join("")}</ol>
            </div>
          </div>
        </label>
      </div>`;
    }).join("");

    const updateProgress = () => {
      const total = tasks.length;
      const done = container.querySelectorAll(".done-cb:checked").length;
      const validated = container.querySelectorAll(".val-cb:checked").length;
      progressEl.textContent = t("pm.task.progressFull", { done, total, validated });
    };

    container.querySelectorAll(".done-cb").forEach((cb) => {
      cb.addEventListener("change", async () => {
        const tn = cb.dataset.taskNo;
        if (!tn || !record) return;
        const next = new Set(record.taskProgress || []);
        if (cb.checked) next.add(tn); else next.delete(tn);
        const arr = [...next];
        cb.disabled = true;
        try {
          await apiUpdate(record.id, { [col("taskProgress", "task_progress")]: JSON.stringify(arr) });
          record.taskProgress = arr;
          cb.closest(".task-card").classList.toggle("done", cb.checked);
          const total = container.querySelectorAll(".done-cb").length;
          const done = container.querySelectorAll(".done-cb:checked").length;
          if (total && done === total) {
            if (record.status !== "completed") {
              await apiUpdate(record.id, { [col("status", "status")]: "completed" });
              record.status = "completed";
            }
          } else if (record.status !== "pending") {
            await apiUpdate(record.id, { [col("status", "status")]: "pending" });
            record.status = "pending";
          }
          syncStatusView(record);
        } catch (e) {
          cb.checked = !cb.checked;
          setStatusMsg("pmScheduleStatus", friendlyError(e, t("pm.action.saveTaskProgress")), "error");
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
        const next = new Set(record.taskValidation || []);
        if (cb.checked) next.add(tn); else next.delete(tn);
        const arr = [...next];
        cb.disabled = true;
        try {
          await apiUpdate(record.id, { [col("taskValidation", "task_validation")]: JSON.stringify(arr) });
          record.taskValidation = arr;
          cb.closest(".task-val-check").classList.toggle("checked", cb.checked);
          const total = container.querySelectorAll(".val-cb").length;
          const checked = container.querySelectorAll(".val-cb:checked").length;
          if (total && checked === total) {
            if (record.status !== "validated") {
              await apiUpdate(record.id, { [col("status", "status")]: "validated" });
              record.status = "validated";
            }
          } else if (record.status !== "pending") {
            await apiUpdate(record.id, { [col("status", "status")]: "pending" });
            record.status = "pending";
          }
          syncStatusView(record);
        } catch (e) {
          cb.checked = !cb.checked;
          setStatusMsg("pmScheduleStatus", friendlyError(e, t("pm.action.saveValidation")), "error");
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
      approveBtn.disabled = !(isValidator && st !== "validated");
      approveBtn.onclick = async () => {
        try {
          const allVal = container.querySelectorAll(".val-cb");
          const checkedVal = container.querySelectorAll(".val-cb:checked");
          if (!allVal.length || checkedVal.length !== allVal.length) {
            setStatusMsg("pmScheduleStatus", t("pm.task.checkAll"), "warning");
            return;
          }
          await apiUpdate(record.id, { [col("status", "status")]: "validated" });
          record.status = "validated";
          modal.classList.remove("active");
          await renderScheduleTab();
        } catch (e) {
          setStatusMsg("pmScheduleStatus", friendlyError(e, t("pm.action.validate")), "error");
        }
      };
    }
    modal.classList.add("active");
    lucideIcons();
  };

  const renderScheduleList = () => {
    const tbody = document.getElementById("pmScheduleList");
    if (!tbody) return;
    const summary = document.getElementById("pmScheduleSummary");

    let filtered = [...currentRecords];
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
      tbody.innerHTML = `<tr><td colspan="7">${t("pm.empty.noSchedules")}</td></tr>`;
      summary.textContent = t("pm.summary.zero");
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
        <td><strong>${r.itemCode}</strong><br />${r.nameEn || ""}<br /><small>${r.section}</small></td>
        <td>${r.plant}</td>
        <td>${formatDate(r.dueDate)}</td>
        <td>${r.assignedTeam?.join(", ") || ""}</td>
        <td><span class="pm-status-select ${cls}">${lbl}</span></td>
        <td class="pm-actions">
          <button class="info-search control-icon-button pm-viewtask-btn" data-id="${r.id}" type="button" title="${t("pm.action.viewTask")}"><i data-lucide="clipboard-list"></i></button>
          <button class="info-search control-icon-button pm-delete-btn" data-id="${r.id}" type="button" title="${t("pm.action.delete")}"><i data-lucide="trash-2"></i></button>
          ${isPid && r._type === "manual" ? `<button class="info-search control-icon-button pm-edit-btn" data-id="${r.id}" type="button" title="${t("pm.action.edit")}"><i data-lucide="pencil"></i></button>` : ""}
        </td>
      </tr>`;
    }).join("");

    summary.textContent = t("pm.summary.count", { count: filtered.length });
    renderSchedulePagination(totalPages);

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
  };

  const renderScheduleTab = async () => {
    closeDayModal();
    window.SAMHO_LOADING?.show(t("pm.loading.schedule"));
    let allRecords = [];
    let loadError = null;
    try {
      allRecords = await loadMonthRecords();
    } catch (e) {
      loadError = e;
      allRecords = [];
    }

    lastLoadOk = !loadError;

    renderStats(getVisibleRecords());
    renderCalendar();

    const tbody = document.getElementById("pmScheduleList");
    const summary = document.getElementById("pmScheduleSummary");
    if (tbody) {
      if (loadError) {
        tbody.innerHTML = `<tr><td colspan="7">${t("pm.error.loadSchedules")}</td></tr>`;
        if (summary) summary.textContent = "";
        document.getElementById("pmSchedulePagination")?.classList.add("sr-only");
        const raw = String(loadError?.message || loadError || "").slice(0, 300);
        setStatusMsg("pmScheduleStatus", t("pm.error.loadRecords", { detail: raw }), "error");
        window.SAMHO_LOADING?.hide();
        return;
      }
    }
    if (!tbody) { window.SAMHO_LOADING?.hide(); return; }

    renderScheduleList();

    lucideIcons();
    window.SAMHO_LOADING?.hide();
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
      setStatusMsg("pmCompleteStatus", friendlyError(e, t("pm.action.complete")), "error");
      return false;
    }
  };

  const setCurrentUserName = () => {
    const user = window.SAMHO_AUTH?.currentUser?.();
    return String(user?.user_metadata?.display_name || "").trim() ||
      String(window.SAMHO_AUTH?.currentUserId?.() || "").trim();
  };

  const openCreateModal = () => {
    document.getElementById("pmFormTitle").textContent = t("pm.form.title.create");
    setValue("pmFormItemCode", "");
    setValue("pmFormNameEn", "");
    setValue("pmFormPlant", "");
    setStatusMsg("pmFormSearchStatus", "", "idle");
    setValue("pmFormDueDate", addDays(today, config.defaultIntervalDays));
    const name = setCurrentUserName();
    renderMechanicSelection("pmFormTeam", "pmFormTeamChips", name ? [name] : [...config.defaultTeam]);
    document.getElementById("pmForm").dataset.editId = "";
    document.getElementById("pmFormModal").classList.add("active");
  };

  const clearPmCodeSearch = () => {
    document.getElementById("pmForm").dataset.codeData = "";
    setValue("pmFormNameEn", "");
    setValue("pmFormPlant", "");
    setStatusMsg("pmFormSearchStatus", "", "idle");
  };

  const searchPmCode = async () => {
    const code = getValue("pmFormItemCode").toUpperCase();
    const btn = document.getElementById("pmFormSearchBtn");
    if (!code) { setStatusMsg("pmFormSearchStatus", t("pm.search.enterCode"), "warning"); return; }
    btn.disabled = true;
    try {
      const supabaseConfig = window.SAMHO_SUPABASE || {};
      const mi = supabaseConfig.machineInfo || {};
      const table = mi.table || "machine_info";
      const codeCol = mi.codeColumn || "ITEM_CODE";
      let row = await db.getOne(table, { where: { [codeCol]: code } });
      if (!row) row = await db.getOne(table, { where: { [codeCol]: { op: "ilike", value: `*${code}*` } } });
      if (!row) {
        clearPmCodeSearch();
        setStatusMsg("pmFormSearchStatus", t("pm.search.notFound"), "warning");
        return;
      }
      document.getElementById("pmForm").dataset.searchData = JSON.stringify({
        itemCode: row[codeCol] || code,
        nameEn: row.name_en || row.NAME_EN || "",
        plant: row.plant || row.PLANT || ""
      });
      setValue("pmFormNameEn", row.name_en || row.NAME_EN || "");
      setValue("pmFormPlant", row.plant || row.PLANT || "");
      setStatusMsg("pmFormSearchStatus", t("pm.search.loaded"), "success");
    } catch (e) {
      setStatusMsg("pmFormSearchStatus", db.friendly(e, t("pm.action.searchCode")), "error");
    } finally {
      btn.disabled = false;
    }
  };

  const createPM = async (itemCode, dueDate, team) => {
    const searchData = JSON.parse((document.getElementById("pmForm").dataset.searchData || "{}"));
    const code = itemCode || searchData.itemCode;
    if (!code) { setStatusMsg("pmFormStatus", t("pm.form.searchFirst"), "warning"); return false; }
    try {
      const existing = await apiFindByCodeAndDate(code, dueDate);
      if (existing && existing.length) {
        const soft = existing.find((r) => r[deletedCol]);
        if (soft) {
          await apiUpdate(soft.id, {
            [deletedCol]: false,
            [col("nameEn", "name_en")]: searchData.nameEn || "",
            [col("equipment", "equipment")]: searchData.nameEn || "",
            [col("plant", "plant")]: searchData.plant || "",
            [col("section", "section")]: "",
            [col("pic", "pic")]: team,
            [col("status", "status")]: "pending"
          });
          return true;
        }
        setStatusMsg("pmFormStatus", t("pm.form.duplicate"), "warning");
        return false;
      }
      await apiInsert({
        [col("itemCode", "item_code")]: code,
        [col("nameEn", "name_en")]: searchData.nameEn || "",
        [col("equipment", "equipment")]: searchData.nameEn || "",
        [col("plant", "plant")]: searchData.plant || "",
        [col("section", "section")]: "",
        [col("pic", "pic")]: team,
        [col("status", "status")]: "pending",
        [col("dueDate", "due_date")]: dueDate,
        [col("recordType", "record_type")]: "manual"
      });
      return true;
    } catch (e) {
      setStatusMsg("pmFormStatus", friendlyError(e, t("pm.action.create")), "error");
      return false;
    }
  };

  const openEditModal = (id) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec || rec.status === "completed" || rec.status === "validated") return;
    document.getElementById("pmFormTitle").textContent = t("pm.form.title.edit");
    setValue("pmFormItemCode", rec.itemCode);
    document.getElementById("pmForm").dataset.searchData = JSON.stringify({
      itemCode: rec.itemCode,
      nameEn: rec.nameEn || "",
      plant: rec.plant || ""
    });
    setValue("pmFormNameEn", rec.nameEn || "");
    setValue("pmFormPlant", rec.plant || "");
    setStatusMsg("pmFormSearchStatus", t("pm.search.loaded"), "success");
    setValue("pmFormDueDate", rec.dueDate);
    renderMechanicSelection("pmFormTeam", "pmFormTeamChips", rec.assignedTeam || []);
    document.getElementById("pmForm").dataset.editId = id;
    document.getElementById("pmFormModal").classList.add("active");
  };

  const editPM = async (id, itemCode, dueDate, team) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec) return false;
    const searchData = JSON.parse((document.getElementById("pmForm").dataset.searchData || "{}"));
    const code = itemCode || searchData.itemCode || rec.itemCode;
    try {
      const existing = await apiFindByCodeAndDate(code, dueDate);
      if (existing && existing.length && existing[0].id !== id) {
        setStatusMsg("pmFormStatus", t("pm.form.duplicate"), "warning");
        return false;
      }
      const payload = {
        [col("dueDate", "due_date")]: dueDate,
        [col("pic", "pic")]: team
      };
      if (code && searchData.itemCode) {
        payload[col("itemCode", "item_code")] = code;
        payload[col("nameEn", "name_en")] = searchData.nameEn || "";
        payload[col("equipment", "equipment")] = searchData.nameEn || "";
        payload[col("plant", "plant")] = searchData.plant || "";
      }
      await apiUpdate(id, payload);
      return true;
    } catch (e) {
      setStatusMsg("pmFormStatus", friendlyError(e, t("pm.action.update")), "error");
      return false;
    }
  };

  const deletePM = async (id) => {
    const rec = currentRecords.find((r) => r.id === id);
    if (!rec) return;
    if (!confirm(t("pm.confirm.delete", { equipment: rec.equipment }))) return;
    try {
      const updated = await apiDelete(id);
      if (!Array.isArray(updated) || updated.length === 0) {
        setStatusMsg("pmScheduleStatus", t("pm.delete.noRows"), "error");
        return;
      }
      setStatusMsg("pmScheduleStatus", t("pm.deleted", { equipment: rec.equipment }), "success");
      await renderScheduleTab();
    } catch (e) {
      setStatusMsg("pmScheduleStatus", friendlyError(e, t("pm.action.deleteRecord")), "error");
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

    await renderScheduleTab();

    initMechanicPicker("pmCompleteTechnician", "pmCompleteChips", "pmCompleteMechanicSearch", "pmCompleteOptions");
    initMechanicPicker("pmFormTeam", "pmFormTeamChips", "pmFormTeamSearch", "pmFormTeamOptions");

    document.getElementById("pmCompleteForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = e.target.dataset.recordId;
      const technician = getSelectedMechanics("pmCompleteTechnician");
      if (!technician.length) { setStatusMsg("pmCompleteStatus", t("pm.complete.selectTechnician"), "warning"); return; }
      const notes = getValue("pmCompleteNotes");
      if (await completePM(id, technician, notes)) {
        document.getElementById("pmCompleteModal").classList.remove("active");
        setStatusMsg("pmScheduleStatus", t("pm.complete.success"), "success");
        await renderScheduleTab();
      }
    });

    document.getElementById("pmAddButton")?.addEventListener("click", openCreateModal);

    document.getElementById("pmFormSearchBtn")?.addEventListener("click", searchPmCode);
    document.getElementById("pmFormItemCode")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); searchPmCode(); }
    });
    document.getElementById("pmFormItemCode")?.addEventListener("input", clearPmCodeSearch);

    document.getElementById("pmForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = e.target.dataset.editId;
      const itemCode = getValue("pmFormItemCode");
      const dueDate = getValue("pmFormDueDate");
      const team = getSelectedMechanics("pmFormTeam");
      if (!itemCode || !dueDate) { setStatusMsg("pmFormStatus", t("pm.form.fillFields"), "warning"); return; }
      const searchData = JSON.parse((e.target.dataset.searchData || "{}"));
      if (!searchData.itemCode) { setStatusMsg("pmFormStatus", t("pm.form.searchFirst"), "warning"); return; }
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

    document.querySelectorAll("[data-close-pm-day]").forEach((el) => {
      el.addEventListener("click", closeDayModal);
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

    document.addEventListener("samho:langchange", () => {
      if (lastLoadOk) {
        renderStats(getVisibleRecords());
        renderCalendar();
        renderScheduleList();
        lucideIcons();
      }
      const taskModal = document.getElementById("pmTaskModal");
      if (taskModal?.classList.contains("active")) {
        const rec = currentRecords.find((r) => r.id === taskModal.dataset.activeRecordId);
        if (rec) openTaskModal(rec);
      }
      const formTitle = document.getElementById("pmFormTitle");
      if (document.getElementById("pmFormModal")?.classList.contains("active") && formTitle) {
        formTitle.textContent = document.getElementById("pmForm")?.dataset.editId
          ? t("pm.form.title.edit")
          : t("pm.form.title.create");
      }
    });

    lucideIcons();
  });
})();
