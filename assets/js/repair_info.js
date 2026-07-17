document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const filterForm = document.getElementById("repairInfoFilter");
  const list = document.getElementById("repairList");
  const status = document.getElementById("repairInfoStatus");
  const searchButton = document.getElementById("repairInfoSearch");
  const exportButton = document.getElementById("repairInfoExport");
  const pageSize = 10;
  let currentRecords = [];
  let currentMachineMap = new Map();
  let currentPage = 1;

  if (!filterForm || !list || !status || !searchButton) return;

  const setStatus = (message, type = "idle") => {
    status.textContent = message;
    status.dataset.type = type;
  };

  const updateExportState = () => {
    if (exportButton) exportButton.disabled = !currentRecords.length;
  };

  setStatus("", "idle");
  list.innerHTML = "";

  const getMachineValue = (machine, field) => {
    const columns = [].concat(config.fieldMap[field] || []);
    const column = columns.find((name) => machine?.[name] != null);
    return column ? machine[column] : "";
  };

  const getRecordValue = (record, names) => {
    const name = names.find((key) => record?.[key] != null);
    return name ? record[name] : "";
  };

  const formatDateInput = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeYear = (value) => {
    const year = Number(value);
    if (value.length === 2) return 2000 + year;
    return year;
  };

  const parseDateTime = (value) => {
    if (!value) return null;
    const text = String(value).trim();

    const supabaseTextDate = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (supabaseTextDate) {
      const [, dd, mm, yy, hh = "0", min = "0"] = supabaseTextDate;
      return new Date(normalizeYear(yy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    }

    const compactDate = text.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compactDate) {
      return new Date(Number(compactDate[1]), Number(compactDate[2]) - 1, Number(compactDate[3]));
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateTime = (value) => {
    const date = parseDateTime(value);
    if (!date) return String(value || "").replace("T", " ").slice(0, 16);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders()
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Request failed (${response.status}).`);
    }

    return response.json();
  };

  const normalizeSearch = (value) => String(value || "").trim().toLowerCase();
  const allPlantLabel = "ALL PLANT";

  const plantSortRank = (plant) => {
    const value = normalizeSearch(plant);
    if (value === "other") return 2;
    return value.startsWith("plant") ? 0 : 1;
  };

  const filterRepairRecords = (records, filters = {}) => {
    const itemCodeFilter = normalizeSearch(filters.itemCode);
    const plantFilter = normalizeSearch(filters.plant);

    return records.filter((record) => {
      const itemCode = normalizeSearch(getRecordValue(record, ["item_code", "ITEM_CODE"]));
      const plant = normalizeSearch(getRecordValue(record, ["plant", "PLANT"]));

      return (!itemCodeFilter || itemCode.includes(itemCodeFilter)) && (!plantFilter || plant === plantFilter);
    });
  };

  const populatePlantOptions = (plants) => {
    const plantInput = document.getElementById("infoPlant");
    const plantMenu = document.getElementById("infoPlantMenu");
    const plantTrigger = document.getElementById("infoPlantTrigger");
    if (!plantInput || !plantMenu || !plantTrigger) return;

    const previous = plantInput.value;
    const plantOptions = [...new Set(plants.map((plant) => String(plant || "").trim()).filter(Boolean))]
      .sort((a, b) => {
        const rankDifference = plantSortRank(a) - plantSortRank(b);
        return rankDifference || String(a).localeCompare(String(b), undefined, { numeric: true });
      });

    const options = ["", ...plantOptions];
    plantMenu.innerHTML = "";
    options.forEach((plant) => {
      const option = document.createElement("button");
      const isActive = plant === previous;
      option.className = `scroll-select-option${isActive ? " active" : ""}`;
      option.type = "button";
      option.dataset.value = plant;
      option.role = "option";
      option.ariaSelected = String(isActive);
      option.textContent = plant || allPlantLabel;
      option.addEventListener("click", () => {
        plantInput.value = plant;
        plantTrigger.textContent = plant || allPlantLabel;
        closePlantDropdown();
        if (currentRecords.length) searchRecords();
      });
      plantMenu.appendChild(option);
    });

    if (plantOptions.includes(previous)) {
      plantInput.value = previous;
      plantTrigger.textContent = previous;
    } else {
      plantInput.value = "";
      plantTrigger.textContent = allPlantLabel;
    }
  };

  const closePlantDropdown = () => {
    const plantPicker = document.getElementById("infoPlantPicker");
    const plantTrigger = document.getElementById("infoPlantTrigger");
    plantPicker?.classList.remove("open");
    plantTrigger?.setAttribute("aria-expanded", "false");
  };

  const togglePlantDropdown = () => {
    const plantPicker = document.getElementById("infoPlantPicker");
    const plantTrigger = document.getElementById("infoPlantTrigger");
    if (!plantPicker || !plantTrigger) return;

    const isOpen = plantPicker.classList.toggle("open");
    plantTrigger.setAttribute("aria-expanded", String(isOpen));
  };

  const loadPlantOptions = async () => {
    const pageSize = 1000;
    const rows = [];

    for (let from = 0; ; from += pageSize) {
      const params = new URLSearchParams({
        select: "plant",
        order: "plant.asc"
      });
      const response = await fetch(`${config.url}/${config.repairInfo.table}?${params}`, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Range: `${from}-${from + pageSize - 1}`,
          ...window.SAMHO_AUTH.authHeaders()
        }
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Request failed (${response.status}).`);
      }

      const pageRows = await response.json();
      rows.push(...pageRows);
      if (pageRows.length < pageSize) break;
    }

    populatePlantOptions(rows.map((record) => getRecordValue(record, ["plant", "PLANT"])));
  };

  const fetchRepairRecords = async (fromDate, toDate) => {
    const dateColumn = config.repairInfo.dateColumn;
    const params = new URLSearchParams({
      select: "*",
      order: `${config.repairInfo.idColumn || "id"}.desc`,
      limit: "1000"
    });

    const rows = await fetchJson(`${config.url}/${config.repairInfo.table}?${params}`);
    const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();

    return rows
      .filter((record) => {
        const date = parseDateTime(getRecordValue(record, [dateColumn]));
        if (!date) return false;
        const time = date.getTime();
        return time >= fromTime && time <= toTime;
      })
      .sort((a, b) => {
        const aTime = parseDateTime(getRecordValue(a, [dateColumn]))?.getTime() || 0;
        const bTime = parseDateTime(getRecordValue(b, [dateColumn]))?.getTime() || 0;
        return bTime - aTime;
      });
  };

  const fetchMachines = async (codes) => {
    const uniqueCodes = [...new Set(codes.filter(Boolean))];
    if (!uniqueCodes.length) return new Map();

    const machineInfo = config.machineInfo || { table: config.table, codeColumn: config.codeColumn };
    const inList = uniqueCodes.map((code) => `"${code}"`).join(",");
    const params = new URLSearchParams({
      select: "*",
      [machineInfo.codeColumn]: `in.(${inList})`
    });
    const rows = await fetchJson(`${config.url}/${machineInfo.table}?${params}`);
    return new Map(rows.map((row) => [row[machineInfo.codeColumn], row]));
  };

  const emitEdit = ({ record, machine, itemCode, reportedAt, repairStartedAt, repairedAt }) => {
    window.dispatchEvent(
      new CustomEvent("repair-info:edit", {
        detail: { record, machine, itemCode, reportedAt, repairStartedAt, repairedAt }
      })
    );
  };

  const toDateValue = (value) => {
    if (!value) return "";
    const date = parseDateTime(value);
    return date ? formatDateInput(date) : "";
  };

  const toTimeValue = (value) => {
    if (!value) return "";
    const date = parseDateTime(value);
    return date ? date.toTimeString().slice(0, 5) : "";
  };

  const getLocalTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  };

  const getDateTimeInputValue = (dateId, timeId) => {
    const date = document.getElementById(dateId)?.value || "";
    const time = document.getElementById(timeId)?.value || "";
    if (!date || !time) return null;
    return `${date}T${time}:00${getLocalTimezoneOffset()}`;
  };

  const patchRepairInfo = async (recordId, payload) => {
    const idColumn = config.repairInfo.idColumn || "id";
    const params = new URLSearchParams({ [idColumn]: `eq.${recordId}` });
    const response = await fetch(`${config.url}/${config.repairInfo.table}?${params}`, {
      method: "PATCH",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Update failed (${response.status}).`);
    }
  };

  const buildUpdatePayload = () => {
    const formData = {
      reportedAt: getDateTimeInputValue("editReportedDate", "editReportedTime"),
      repairStartedAt: getDateTimeInputValue("editStartedDate", "editStartedTime"),
      repairedAt: getDateTimeInputValue("editRepairedDate", "editRepairedTime"),
      issue: document.getElementById("editIssue")?.value.trim() || null,
      other: document.getElementById("editOther")?.value.trim() || null,
      reason: document.getElementById("editReason")?.value.trim() || null,
      solve: document.getElementById("editSolve")?.value.trim() || null,
      technician: document.getElementById("editTechnician")?.value.trim() || null
    };

    return Object.fromEntries(
      Object.entries(config.repairInfo.updateMap)
        .filter(([, column]) => column)
        .map(([field, column]) => [column, formData[field]])
    );
  };

  const deleteRepairInfo = async (recordId) => {
    const params = new URLSearchParams({ [config.repairInfo.idColumn]: `eq.${recordId}` });
    const response = await fetch(`${config.url}/${config.repairInfo.table}?${params}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        Prefer: "return=minimal"
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Delete failed (${response.status}).`);
    }
  };

  const ensureEditModal = () => {
    let modal = document.getElementById("repairEditModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "repair-modal";
    modal.id = "repairEditModal";
    modal.innerHTML = `
      <div class="repair-modal-backdrop" data-close-edit></div>
      <form class="repair-modal-dialog" id="repairEditForm">
        <header class="repair-modal-header">
          <div>
            <span id="editRecordEyebrow">Repair record</span>
            <h2>Fill in repair information</h2>
          </div>
          <button class="repair-modal-close" type="button" data-close-edit aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </header>
        <p class="repair-modal-note">Current record data is loaded into the inputs. Review and update the fields below.</p>
        <div class="repair-modal-grid">
          <label>
            <span>Item Code</span>
            <input id="editItemCode" type="text" disabled />
          </label>
          <label>
            <span>Machine Name</span>
            <input id="editMachineName" type="text" disabled />
          </label>
          <label>
            <span>Issue</span>
            <input id="editIssue" type="text" required />
          </label>
          <label>
            <span>Other</span>
            <input id="editOther" type="text" />
          </label>
          <label>
            <span>Reason</span>
            <input id="editReason" type="text" required />
          </label>
          <label>
            <span>Solve</span>
            <input id="editSolve" type="text" required />
          </label>
          <label>
            <span>Mechanic</span>
            <input id="editTechnician" type="text" required />
          </label>
        </div>
        <div class="repair-modal-time-grid">
          <label>
            <span>Report datetime</span>
            <input id="editReportedDate" type="date" required />
            <input id="editReportedTime" type="time" required />
          </label>
          <label>
            <span>Start fixing datetime</span>
            <input id="editStartedDate" type="date" />
            <input id="editStartedTime" type="time" />
          </label>
          <label>
            <span>Done fixing datetime</span>
            <input id="editRepairedDate" type="date" />
            <input id="editRepairedTime" type="time" />
          </label>
        </div>
        <footer class="repair-modal-footer">
          <p class="repair-modal-status" id="repairEditStatus" aria-live="polite"></p>
          <button class="btn muted" type="button" data-close-edit>Cancel</button>
          <button class="save" type="submit"><i data-lucide="save"></i>Save</button>
        </footer>
      </form>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll("[data-close-edit]").forEach((button) => {
      button.addEventListener("click", () => modal.classList.remove("active"));
    });
    modal.querySelector("#repairEditForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const recordId = modal.dataset.recordId;
      const status = modal.querySelector("#repairEditStatus");

      if (!recordId) {
        status.textContent = "Missing record ID.";
        return;
      }

      status.textContent = "Saving changes...";

      try {
        await patchRepairInfo(recordId, buildUpdatePayload());
        status.textContent = "Changes saved.";
        window.setTimeout(() => {
          modal.classList.remove("active");
        }, 1200);
      } catch (error) {
        status.textContent = window.SAMHO_ERRORS.message(error, "save these changes");
      }
    });
    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  const openEditModal = ({ record, machine, itemCode, reportedAt, repairStartedAt, repairedAt }) => {
    const modal = ensureEditModal();
    modal.dataset.recordId = record.id || "";
    modal.querySelector("#editRecordEyebrow").textContent = `Repair record ${record.id || ""}`.trim();
    modal.querySelector("#editItemCode").value = itemCode || "";
    modal.querySelector("#editMachineName").value = getMachineValue(machine, "machineName") || "";
    modal.querySelector("#editIssue").value = getRecordValue(record, ["issue", "issue_nm_vn"]) || "";
    modal.querySelector("#editOther").value = getRecordValue(record, ["other_issue", "other_reason"]) || "";
    modal.querySelector("#editReason").value = getRecordValue(record, ["reason", "reason_nm_vn"]) || "";
    modal.querySelector("#editSolve").value = getRecordValue(record, ["solve", "solve_nm_en"]) || "";
    modal.querySelector("#editTechnician").value = record.technician || "";
    modal.querySelector("#editReportedDate").value = toDateValue(reportedAt);
    modal.querySelector("#editReportedTime").value = toTimeValue(reportedAt);
    const startedValue = repairStartedAt || reportedAt;
    modal.querySelector("#editStartedDate").value = toDateValue(startedValue);
    modal.querySelector("#editStartedTime").value = toTimeValue(startedValue);
    modal.querySelector("#editRepairedDate").value = toDateValue(repairedAt);
    modal.querySelector("#editRepairedTime").value = toTimeValue(repairedAt);
    modal.querySelector("#repairEditStatus").textContent = "";
    modal.classList.add("active");
  };

  window.addEventListener("repair-info:edit", (event) => {
    openEditModal(event.detail);
  });

  const renderRecords = (records, machineMap, page = 1) => {
    list.innerHTML = "";

    if (!records.length) {
      list.innerHTML = `<article class="repair-empty">No records found for the selected date range.</article>`;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
    currentPage = Math.min(Math.max(page, 1), totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageRecords = records.slice(pageStart, pageStart + pageSize);

    const tableWrap = document.createElement("div");
    tableWrap.className = "repair-table-wrap";
    tableWrap.innerHTML = `
      <table class="repair-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>item code</th>
            <th>name</th>
            <th>Plant</th>
            <th>section</th>
            <th>place</th>
            <th>Report datetime</th>
            <th>Start fixing datetime</th>
            <th>Done fixing datetime</th>
            <th>downtime (Min)</th>
            <th>issue</th>
            <th>Other issue</th>
            <th>reason</th>
            <th>Solve</th>
            <th>technician</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    const tbody = tableWrap.querySelector("tbody");

    pageRecords.forEach((record) => {
      const itemCode = getRecordValue(record, ["item_code", "ITEM_CODE"]);
      const machine = machineMap.get(itemCode) || record;
      const reportedAt = getRecordValue(record, ["start_datetime"]);
      const repairStartedAt = getRecordValue(record, ["fix_datetime"]);
      const repairedAt = getRecordValue(record, ["end_datetime"]);
      const plant = getRecordValue(record, ["plant", "PLANT"]);
      const section = getRecordValue(record, ["section", "SECTION"]);
      const place = getRecordValue(record, ["place", "PLACE"]);
      const issueValue = getRecordValue(record, ["issue", "issue_nm_vn"]);
      const otherIssueValue = getRecordValue(record, ["other_issue", "other_reason"]);
      const reasonValue = getRecordValue(record, ["reason", "reason_nm_vn"]);
      const solveValue = getRecordValue(record, ["solve", "solve_nm_en"]);
      const row = document.createElement("tr");
      row.dataset.recordId = record.id || "";
      row.innerHTML = `
        <td>${record.id || "-"}</td>
        <td><strong>${itemCode || "-"}</strong></td>
        <td>${getMachineValue(machine, "machineName") || "-"}</td>
        <td>${plant || "-"}</td>
        <td>${section || "-"}</td>
        <td>${place || "-"}</td>
        <td>${formatDateTime(reportedAt) || "-"}</td>
        <td>${formatDateTime(repairStartedAt) || "-"}</td>
        <td>${formatDateTime(repairedAt) || "-"}</td>
        <td>${record.total_downtime ?? "-"}</td>
        <td>${issueValue || "-"}</td>
        <td>${otherIssueValue || "-"}</td>
        <td>${reasonValue || "-"}</td>
        <td>${solveValue || "-"}</td>
        <td>${record.technician || "-"}</td>
        <td>
          <div class="repair-row-actions">
            <button class="repair-edit" type="button" data-record-id="${record.id || ""}" aria-label="Edit repair record" title="Edit">
              <i data-lucide="square-pen"></i>
            </button>
            <button class="repair-delete" type="button" data-record-id="${record.id || ""}" aria-label="Delete repair record" title="Delete">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      `;

      row.querySelector(".repair-edit")?.addEventListener("click", () => {
        emitEdit({ record, machine, itemCode, reportedAt, repairStartedAt, repairedAt });
      });

      row.querySelector(".repair-delete")?.addEventListener("click", async () => {
        if (!record.id || !window.confirm(`Delete repair record ${record.id}?`)) return;

        try {
          await deleteRepairInfo(record.id);
          currentRecords = currentRecords.filter((current) => String(current.id) !== String(record.id));
          renderRecords(currentRecords, currentMachineMap, currentPage);
          updateExportState();
          setStatus(`Deleted repair record ${record.id}.`, "success");
          if (window.lucide) window.lucide.createIcons();
        } catch (error) {
          setStatus(window.SAMHO_ERRORS.message(error, "delete this repair record"), "error");
        }
      });

      tbody.appendChild(row);
    });

    list.appendChild(tableWrap);

    const pagination = document.createElement("div");
    pagination.className = "repair-pagination";
    pagination.innerHTML = `
      <span>Showing ${pageStart + 1}-${Math.min(pageStart + pageSize, records.length)} of ${records.length}</span>
      <div class="repair-pagination-actions">
        <button type="button" class="repair-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
          <i data-lucide="chevron-left"></i>
          Previous
        </button>
        <strong>Page ${currentPage} / ${totalPages}</strong>
        <button type="button" class="repair-page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
          Next
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    `;

    pagination.querySelectorAll(".repair-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.page);
        renderRecords(currentRecords, currentMachineMap, nextPage);
        if (window.lucide) window.lucide.createIcons();
      });
    });

    list.appendChild(pagination);
  };

  const exportRecords = () => {
    if (!currentRecords.length) {
      setStatus("Search for repair records before exporting.", "warning");
      return;
    }

    if (!window.XLSX) {
      setStatus("Excel export is unavailable. Please refresh the page and try again.", "error");
      return;
    }

    const rows = currentRecords.map((record) => {
      const itemCode = getRecordValue(record, ["item_code", "ITEM_CODE"]);
      const machine = currentMachineMap.get(itemCode) || record;
      const reportedAt = getRecordValue(record, ["start_datetime"]);
      const repairStartedAt = getRecordValue(record, ["fix_datetime"]);
      const repairedAt = getRecordValue(record, ["end_datetime"]);

      return {
        ID: record.id || "",
        "Item Code": itemCode,
        "Machine Name": getMachineValue(machine, "machineName"),
        Plant: getRecordValue(record, ["plant", "PLANT"]),
        Section: getRecordValue(record, ["section", "SECTION"]),
        Place: getRecordValue(record, ["place", "PLACE"]),
        "Reported At": formatDateTime(reportedAt),
        "Repair Started At": formatDateTime(repairStartedAt),
        "Repaired At": formatDateTime(repairedAt),
        "Total Downtime": record.total_downtime ?? "",
        Issue: getRecordValue(record, ["issue", "issue_nm_vn"]),
        "Other Issue": getRecordValue(record, ["other_issue", "other_reason"]),
        Reason: getRecordValue(record, ["reason", "reason_nm_vn"]),
        Solve: getRecordValue(record, ["solve", "solve_nm_en"]),
        Technician: record.technician || "",
        Status: repairedAt ? "Completed" : "Pending"
      };
    });

    const worksheet = window.XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
      { wch: 19 }, { wch: 19 }, { wch: 19 }, { wch: 16 }, { wch: 18 }, { wch: 20 },
      { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 14 }
    ];
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Repair Records");

    const fromDate = document.getElementById("fromDate")?.value || "records";
    const toDate = document.getElementById("toDate")?.value || "";
    window.XLSX.writeFile(workbook, `repair-records_${fromDate}${toDate ? `_to_${toDate}` : ""}.xlsx`);
  };

  const searchRecords = async () => {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const itemCode = document.getElementById("infoItemCode")?.value || "";
    const plant = document.getElementById("infoPlant")?.value || "";

    if (!fromDate || !toDate) {
      setStatus("Please select both from and to dates.", "warning");
      return;
    }

    if (fromDate > toDate) {
      setStatus("From date cannot be later than to date.", "warning");
      return;
    }

    searchButton.disabled = true;
    setStatus("Searching...", "loading");

    try {
      const dateRecords = await fetchRepairRecords(fromDate, toDate);
      const records = filterRepairRecords(dateRecords, { itemCode, plant });
      const machines = await fetchMachines(records.map((record) => getRecordValue(record, ["item_code", "ITEM_CODE"])));
      currentRecords = records;
      currentMachineMap = machines;
      renderRecords(currentRecords, currentMachineMap, 1);
      updateExportState();
      setStatus(`Found ${records.length} repair records.`, "success");
    } catch (error) {
      currentRecords = [];
      currentMachineMap = new Map();
      updateExportState();
      list.innerHTML = "";
      setStatus(window.SAMHO_ERRORS.message(error, "load repair records"), "error");
    } finally {
      searchButton.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
  };

  const today = new Date();
  document.getElementById("fromDate").value = formatDateInput(today);
  document.getElementById("toDate").value = formatDateInput(today);
  loadPlantOptions().catch((error) => {
    setStatus(window.SAMHO_ERRORS.message(error, "load the plant list"), "warning");
  });

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchRecords();
  });
  exportButton?.addEventListener("click", exportRecords);

  document.getElementById("infoPlantTrigger")?.addEventListener("click", togglePlantDropdown);

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#infoPlantPicker")) closePlantDropdown();
  });
});
