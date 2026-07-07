document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const filterForm = document.getElementById("repairInfoFilter");
  const list = document.getElementById("repairList");
  const status = document.getElementById("repairInfoStatus");
  const searchButton = document.getElementById("repairInfoSearch");

  if (!filterForm || !list || !status || !searchButton) return;

  const setStatus = (message, type = "idle") => {
    status.textContent = message;
    status.dataset.type = type;
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

  const formatDateInput = (date) => date.toISOString().slice(0, 10);

  const formatCompactDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
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

  const fetchRepairRecords = async (fromDate, toDate) => {
    const dateColumn = config.repairInfo.dateColumn;
    const params = new URLSearchParams({
      select: "*",
      order: `${dateColumn}.desc`,
      limit: "50"
    });
    params.append(dateColumn, `gte.${fromDate}T00:00:00+07:00`);
    params.append(dateColumn, `lte.${toDate}T23:59:59+07:00`);

    return fetchJson(`${config.url}/${config.repairInfo.table}?${params}`);
  };

  const fetchMachines = async (codes) => {
    const uniqueCodes = [...new Set(codes.filter(Boolean))];
    if (!uniqueCodes.length) return new Map();

    const inList = uniqueCodes.map((code) => `"${code}"`).join(",");
    const params = new URLSearchParams({
      select: "*",
      [config.codeColumn]: `in.(${inList})`
    });
    const rows = await fetchJson(`${config.url}/${config.table}?${params}`);
    return new Map(rows.map((row) => [row[config.codeColumn], row]));
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
    const compact = String(value).match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;

    const simpleDate = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (simpleDate) return `${simpleDate[1]}-${simpleDate[2]}-${simpleDate[3]}`;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  const toTimeValue = (value) => {
    if (!value) return "";
    const time = String(value).match(/(?:T|\s)(\d{2}):(\d{2})/);
    if (time) return `${time[1]}:${time[2]}`;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toTimeString().slice(0, 5);
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
            <span>Ngày báo hư</span>
            <input id="editReportedDate" type="date" required />
            <input id="editReportedTime" type="time" required />
          </label>
          <label>
            <span>Bắt đầu sửa</span>
            <input id="editStartedDate" type="date" />
            <input id="editStartedTime" type="time" />
          </label>
          <label>
            <span>Ngày sửa xong</span>
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
        status.textContent = error.message;
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
    modal.querySelector("#editIssue").value = record.issue || "";
    modal.querySelector("#editOther").value = record.other_issue || record.other || "";
    modal.querySelector("#editReason").value = record.reason || "";
    modal.querySelector("#editSolve").value = record.solve || "";
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

  const renderRecords = (records, machineMap) => {
    list.innerHTML = "";

    if (!records.length) {
      list.innerHTML = `<article class="repair-empty">No records found for the selected date range.</article>`;
      return;
    }

    const tableWrap = document.createElement("div");
    tableWrap.className = "repair-table-wrap";
    tableWrap.innerHTML = `
      <table class="repair-table">
        <thead>
          <tr>
            <th>Broken ID</th>
            <th>Item Code</th>
            <th>Machine Name</th>
            <th>Place1</th>
            <th>Place2</th>
            <th>Place3</th>
            <th>Issue</th>
            <th>Reason</th>
            <th>Solve</th>
            <th>Ngay hu</th>
            <th>Ngay sua</th>
            <th>Mechanic</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    const tbody = tableWrap.querySelector("tbody");

    records.forEach((record) => {
      const itemCode = getRecordValue(record, ["machine_id", "item_code", "ITEM_CODE"]);
      const machine = machineMap.get(itemCode) || record;
      const reportedAt = getRecordValue(record, ["reported_at"]);
      const repairStartedAt = getRecordValue(record, ["repaired_at", "repair_started_at", "started_at", "start_at", "repair_start_at"]);
      const repairedAt = getRecordValue(record, ["repair_completed_at", "repair_finished_at", "finished_at"]);
      const issueValue = getRecordValue(record, ["issue"]);
      const otherIssue = getRecordValue(record, ["other_issue", "other"]);
      const isDone = !!repairedAt;
      const issue = issueValue === "Khác" && otherIssue ? otherIssue : issueValue;

      const row = document.createElement("tr");
      row.dataset.recordId = record.id || "";
      row.innerHTML = `
        <td>${record.id || "-"}</td>
        <td><strong>${itemCode || "-"}</strong></td>
        <td>${getMachineValue(machine, "machineName") || "-"}</td>
        <td>${getMachineValue(machine, "machineLine") || "-"}</td>
        <td>${getMachineValue(machine, "machinePlant") || "-"}</td>
        <td>${getMachineValue(machine, "machineSection") || "-"}</td>
        <td>${issue || "-"}</td>
        <td>${record.reason || "-"}</td>
        <td>${record.solve || "-"}</td>
        <td>${formatCompactDate(reportedAt) || "-"}</td>
        <td>${formatCompactDate(repairedAt) || "-"}</td>
        <td>${record.technician || "-"}</td>
        <td><span class="repair-table-status ${isDone ? "done" : "pending"}">${isDone ? "Hoan thanh" : "Chua xong"}</span></td>
        <td>
          <button class="repair-edit" type="button" data-record-id="${record.id || ""}">
            <i data-lucide="square-pen"></i>
            Edit
          </button>
        </td>
      `;

      row.querySelector(".repair-edit")?.addEventListener("click", () => {
        emitEdit({ record, machine, itemCode, reportedAt, repairStartedAt, repairedAt });
      });

      tbody.appendChild(row);
    });

    list.appendChild(tableWrap);
  };

  const searchRecords = async () => {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

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
      const records = await fetchRepairRecords(fromDate, toDate);
      const machines = await fetchMachines(records.map((record) => getRecordValue(record, ["machine_id", "item_code", "ITEM_CODE"])));
      renderRecords(records, machines);
      setStatus(`Found ${records.length} repair records.`, "success");
    } catch (error) {
      list.innerHTML = "";
      setStatus(error.message, "error");
    } finally {
      searchButton.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
  };

  const today = new Date();
  const prior = new Date(today);
  prior.setDate(today.getDate() - 30);
  document.getElementById("fromDate").value = formatDateInput(prior);
  document.getElementById("toDate").value = formatDateInput(today);

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchRecords();
  });
});
