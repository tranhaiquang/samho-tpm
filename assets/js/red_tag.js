document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const redTagConfig = config?.redTag || {};
  const plantFilter = document.getElementById("redTagPlantFilter");
  const searchInput = document.getElementById("redTagSearchInput");
  const list = document.getElementById("redTagList");
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

  if (!config || !plantFilter || !searchInput || !list || !status || !modal || !modalList || !modalTitle || !addButton || !addModal || !addForm || !addStatus || !addSaveButton || !addStatusSelect || !addIssueField || !addIssueInput) return;

  const text = (value, fallback = "-") => String(value ?? "").trim() || fallback;
  const readField = (row, names) => names.find((name) => row?.[name] !== undefined && row?.[name] !== null) ? row[names.find((name) => row?.[name] !== undefined && row?.[name] !== null)] : "";
  const redTagField = (row, key) => readField(row, [].concat(redTagConfig.fieldMap?.[key] || []));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const setStatus = (message, type = "idle") => { status.textContent = message; status.dataset.type = type; };

  const fetchRedTagRecords = async () => {
    const response = await fetch(`${config.url}/${encodeURIComponent(redTagConfig.table || "redtag_records")}?${new URLSearchParams({ select: "*", limit: "10000" })}`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}) }
    });
    if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status}).`);
    return response.json();
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
    if (!displayedGroups.length) { list.innerHTML = '<tr><td colspan="4">No machines found.</td></tr>'; setStatus("No machines found for the selected plant.", "warning"); return; }
    list.innerHTML = displayedGroups.map((row, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(row.machineName)}</td><td>${row.quantity}</td><td><button class="repair-edit red-tag-view" type="button" data-index="${index}" aria-label="View details" title="View details"><i data-lucide="eye"></i></button></td></tr>`).join("");
    if (window.lucide) window.lucide.createIcons();
    setStatus(`${displayedGroups.length} machine name${displayedGroups.length === 1 ? "" : "s"} loaded.`, "success");
  };

  const openMachineTypes = (group) => {
    const machines = [...group.machines].sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true }));
    modalTitle.textContent = `${group.machineName} - Item Codes`;
    modalList.innerHTML = `<table class="repair-table incoming-summary-table red-tag-summary-table"><thead><tr><th>No.</th><th>Machine Name</th><th>Item Code</th><th>Date</th><th>Line</th><th>Status</th><th>Issue</th></tr></thead><tbody>${machines.map((machine, index) => {
      const statusClass = machine.status === "Máy Hư Chờ Sửa" ? "pending" : "done";
      return `<tr><td>${index + 1}</td><td>${escapeHtml(group.machineName)}</td><td>${escapeHtml(machine.itemCode)}</td><td>${escapeHtml(machine.date)}</td><td>${escapeHtml(machine.line)}</td><td><span class="repair-table-status ${statusClass}">${escapeHtml(machine.status)}</span></td><td>${escapeHtml(machine.issue)}</td></tr>`;
    }).join("")}</tbody></table>`;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); };
  document.querySelectorAll("[data-close-red-tag]").forEach((button) => button.addEventListener("click", closeModal));
  list.addEventListener("click", (event) => {
    const button = event.target.closest(".red-tag-view");
    if (button) openMachineTypes(displayedGroups[Number(button.dataset.index)]);
  });

  plantFilter.addEventListener("change", renderMachines);
  searchInput.addEventListener("input", renderMachines);
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
      await loadRecords();
      closeAddModal();
      setStatus("Red Tag record saved.", "success");
    } catch (error) {
      addStatus.textContent = `Could not save: ${error.message}`;
      addStatus.dataset.type = "error";
    } finally {
      addSaveButton.disabled = false;
    }
  });
  loadRecords().catch((error) => { list.innerHTML = '<tr><td colspan="4">Unable to load Red Tag records.</td></tr>'; setStatus(error.message, "error"); });
});
