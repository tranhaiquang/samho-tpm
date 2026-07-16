document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const redTagConfig = config?.redTag || {};
  const plantFilter = document.getElementById("redTagPlantFilter");
  const searchInput = document.getElementById("redTagSearchInput");
  const list = document.getElementById("redTagList");
  const summary = document.getElementById("redTagSummary");
  const pagination = document.getElementById("redTagPagination");
  const status = document.getElementById("redTagStatus");
  const modal = document.getElementById("redTagModal");
  const modalList = document.getElementById("redTagModalList");
  const modalTitle = document.getElementById("redTagModalTitle");
  const addButton = document.getElementById("redTagAddButton");
  const addModal = document.getElementById("redTagAddModal");
  const addForm = document.getElementById("redTagAddForm");
  const addStatus = document.getElementById("redTagAddStatus");
  const addSaveButton = document.getElementById("redTagAddSave");
  const addStatusSelect = document.getElementById("redTagAddStatusSelect");
  const addIssueField = document.getElementById("redTagAddIssueField");
  const addIssueInput = document.getElementById("redTagAddIssueInput");
  let machineRows = [];
  let displayedGroups = [];
  let currentPage = 1;
  const pageSize = 10;

  if (!config || !plantFilter || !searchInput || !list || !summary || !pagination || !status || !modal || !modalList || !modalTitle || !addButton || !addModal || !addForm || !addStatus || !addSaveButton || !addStatusSelect || !addIssueField || !addIssueInput) return;

  const text = (value, fallback = "-") => String(value ?? "").trim() || fallback;
  const readField = (row, names) => names.find((name) => row?.[name] !== undefined && row?.[name] !== null) ? row[names.find((name) => row?.[name] !== undefined && row?.[name] !== null)] : "";
  const redTagField = (row, key) => readField(row, [].concat(redTagConfig.fieldMap?.[key] || []));
  const itemCodeColumn = [].concat(redTagConfig.fieldMap?.itemCode || "item_code")[0];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const setStatus = (message, type = "idle") => { status.textContent = message; status.dataset.type = type; };
  const friendlyError = (error, action) => {
    const message = String(error?.message || error || "").toLowerCase();
    if (message.includes("duplicate key") || message.includes("unique constraint")) return "This Item Code already exists. Please use a different Item Code.";
    if (message.includes("row-level security") || message.includes("permission denied")) return `You do not have permission to ${action}.`;
    if (message.includes("failed to fetch") || message.includes("networkerror")) return "Unable to connect. Please check your network and try again.";
    return `Unable to ${action}. Please try again.`;
  };

  const fetchRedTagRecords = async () => {
    const records = [];
    const pageSize = 1000;
    let offset = 0;
    while (true) {
      const params = new URLSearchParams({ select: "*", limit: String(pageSize), offset: String(offset) });
      const response = await fetch(`${config.url}/${encodeURIComponent(redTagConfig.table || "redtag_records")}?${params}`, {
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}) }
      });
      if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status}).`);
      const page = await response.json();
      records.push(...page);
      if (page.length < pageSize) return records;
      offset += pageSize;
    }
  };

  const loadRecords = async () => {
    setStatus("Loading Red Tag records...", "idle");
    machineRows = await fetchRedTagRecords();
    renderMachines();
  };

  const renderMachines = () => {
    const selectedPlant = plantFilter.value;
    const search = searchInput.value.trim().toLowerCase();
    const groups = new Map();
    machineRows
      .filter((row) => {
        const machineName = text(redTagField(row, "machineName"), "").toLowerCase();
        return (!selectedPlant || text(redTagField(row, "plant")) === selectedPlant) && (!search || machineName.includes(search));
      })
      .forEach((row) => {
        const itemCode = text(redTagField(row, "itemCode"));
        const machineName = text(redTagField(row, "machineName"));
        const date = text(redTagField(row, "date"));
        const line = text(redTagField(row, "line"));
        const machineStatus = text(redTagField(row, "status"), "Máy Dự Phòng");
        const issue = text(redTagField(row, "issue"));
        const key = `${text(redTagField(row, "plant"))}\u0000${machineName}`;
        const group = groups.get(key) || { machineName, quantity: 0, machines: [] };
        group.quantity += 1;
        group.machines.push({ itemCode, date, line, status: machineStatus, issue });
        groups.set(key, group);
      });

    displayedGroups = [...groups.values()].sort((a, b) => a.machineName.localeCompare(b.machineName));
    if (!displayedGroups.length) {
      list.innerHTML = '<tr><td colspan="4">No machines found.</td></tr>';
      summary.textContent = "Total machines: 0";
      pagination.hidden = true;
      setStatus("No machines found for the selected plant.", "warning");
      return;
    }

    const totalPages = Math.ceil(displayedGroups.length / pageSize);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageRows = displayedGroups.slice(pageStart, pageStart + pageSize);
    const totalRecords = displayedGroups.reduce((total, group) => total + group.quantity, 0);
    list.innerHTML = pageRows.map((row, index) => `<tr><td>${pageStart + index + 1}</td><td>${escapeHtml(row.machineName)}</td><td>${row.quantity}</td><td><button class="repair-edit red-tag-view" type="button" data-index="${pageStart + index}" aria-label="View details" title="View details"><i data-lucide="eye"></i></button></td></tr>`).join("");
    summary.textContent = `Total machines: ${totalRecords}`;
    pagination.hidden = displayedGroups.length <= pageSize;
    pagination.innerHTML = `
      <span>Showing ${pageStart + 1}-${Math.min(pageStart + pageSize, displayedGroups.length)} of ${displayedGroups.length}</span>
      <div class="repair-pagination-actions">
        <button class="repair-page-btn" type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i>Previous</button>
        <strong>Page ${currentPage} / ${totalPages}</strong>
        <button class="repair-page-btn" type="button" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next<i data-lucide="chevron-right"></i></button>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    setStatus(`${displayedGroups.length} machine name${displayedGroups.length === 1 ? "" : "s"} loaded.`, "success");
  };

  const openMachineTypes = (group) => {
    const machines = [...group.machines].sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true }));
    modalTitle.textContent = `${group.machineName} - Item Codes`;
    modalList.innerHTML = `<table class="repair-table incoming-summary-table red-tag-summary-table"><thead><tr><th>No.</th><th>Machine Name</th><th>Item Code</th><th>Date</th><th>Line</th><th>Status</th><th>Issue</th><th><span class="sr-only">Remove</span></th></tr></thead><tbody>${machines.map((machine, index) => {
      const statusClass = machine.status === "Máy Hư Chờ Sửa" ? "pending" : "done";
      return `<tr><td>${index + 1}</td><td>${escapeHtml(group.machineName)}</td><td>${escapeHtml(machine.itemCode)}</td><td>${escapeHtml(machine.date)}</td><td>${escapeHtml(machine.line)}</td><td><span class="repair-table-status ${statusClass}">${escapeHtml(machine.status)}</span></td><td>${escapeHtml(machine.issue)}</td><td><button class="repair-edit spare-delete red-tag-remove" type="button" data-item-code="${escapeHtml(machine.itemCode)}" aria-label="Remove ${escapeHtml(machine.itemCode)}" title="Remove record"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5M14 11v5"></path></svg></button></td></tr>`;
    }).join("")}</tbody></table>`;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); };
  document.querySelectorAll("[data-close-red-tag]").forEach((button) => button.addEventListener("click", closeModal));
  modalList.addEventListener("click", async (event) => {
    const button = event.target.closest(".red-tag-remove");
    if (!button) return;
    const itemCode = button.dataset.itemCode;
    if (!itemCode || !window.confirm(`Remove Red Tag record ${itemCode}?`)) return;
    button.disabled = true;
    try {
      const params = new URLSearchParams({ [itemCodeColumn]: `eq.${itemCode}` });
      const response = await fetch(`${config.url}/${encodeURIComponent(redTagConfig.table || "redtag_records")}?${params}`, {
        method: "DELETE",
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}), Prefer: "return=minimal" }
      });
      if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status}).`);
      closeModal();
      await loadRecords();
      setStatus(`Removed Red Tag record ${itemCode}.`, "success");
    } catch (error) {
      setStatus(friendlyError(error, "remove this record"), "error");
      button.disabled = false;
    }
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest(".red-tag-view");
    if (button) openMachineTypes(displayedGroups[Number(button.dataset.index)]);
  });

  plantFilter.addEventListener("change", () => { currentPage = 1; renderMachines(); });
  searchInput.addEventListener("input", () => { currentPage = 1; renderMachines(); });
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest(".repair-page-btn");
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    renderMachines();
  });
  const closeAddModal = () => { addModal.classList.remove("active"); addModal.setAttribute("aria-hidden", "true"); };
  document.querySelectorAll("[data-close-red-tag-add]").forEach((button) => button.addEventListener("click", closeAddModal));
  addButton.addEventListener("click", () => {
    addForm.reset();
    addForm.elements.date.value = new Date().toISOString().slice(0, 10);
    updateIssueField();
    addStatus.textContent = "";
    addStatus.dataset.type = "idle";
    addModal.classList.add("active");
    addModal.setAttribute("aria-hidden", "false");
  });
  const updateIssueField = () => {
    const needsIssue = addStatusSelect.value === "Máy Hư Chờ Sửa";
    addIssueField.hidden = !needsIssue;
    addIssueInput.required = needsIssue;
    addIssueInput.disabled = !needsIssue;
    if (!needsIssue) addIssueInput.value = "";
  };
  addStatusSelect.addEventListener("change", updateIssueField);
  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(addForm));
    const payload = Object.fromEntries(Object.entries(redTagConfig.insertMap || {}).map(([field, column]) => [column, String(values[field] || "").trim()]));
    addStatus.textContent = "Saving...";
    addStatus.dataset.type = "idle";
    addSaveButton.disabled = true;
    try {
      const response = await fetch(`${config.url}/${encodeURIComponent(redTagConfig.table || "redtag_records")}`, {
        method: "POST",
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const detail = await response.text();
        let message = detail || `Request failed (${response.status}).`;
        try { message = JSON.parse(detail).message || message; } catch { /* Use the response text when it is not JSON. */ }
        throw new Error(message);
      }
      const itemCode = String(payload[itemCodeColumn] || "").trim();
      plantFilter.value = values.plant;
      currentPage = 1;
      machineRows = [payload, ...machineRows.filter((row) => String(row?.[itemCodeColumn] || "").trim() !== itemCode)];
      renderMachines();
      closeAddModal();
      setStatus("Red Tag record saved.", "success");
      try {
        await loadRecords();
        setStatus("Red Tag record saved.", "success");
      } catch {
        setStatus("Red Tag record saved. Refresh the page later if it is not visible to other users yet.", "warning");
      }
    } catch (error) {
      addStatus.textContent = friendlyError(error, "save this record");
      addStatus.dataset.type = "error";
    } finally {
      addSaveButton.disabled = false;
    }
  });
  loadRecords().catch((error) => { list.innerHTML = '<tr><td colspan="4">Unable to load Red Tag records.</td></tr>'; summary.textContent = ''; pagination.hidden = true; setStatus(friendlyError(error, "load Red Tag records"), "error"); });
});
