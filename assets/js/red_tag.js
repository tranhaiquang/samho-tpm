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
  const addItemCodeInput = document.getElementById("redTagAddItemCode");
  const addMachineNameInput = document.getElementById("redTagAddMachineName");
  const machineSearchButton = document.getElementById("redTagMachineSearch");
  const scanButton = document.getElementById("redTagScanButton");
  const scanModal = document.getElementById("redTagScanModal");
  const scanVideo = document.getElementById("redTagScanVideo");
  const scanStatus = document.getElementById("redTagScanStatus");
  let machineRows = [];
  let displayedGroups = [];
  let currentPage = 1;
  const pageSize = 10;

  if (!config || !plantFilter || !searchInput || !list || !summary || !pagination || !status || !modal || !modalList || !modalTitle || !addButton || !addModal || !addForm || !addStatus || !addSaveButton || !addStatusSelect || !addIssueField || !addIssueInput || !addItemCodeInput || !addMachineNameInput || !machineSearchButton || !scanButton || !scanModal || !scanVideo || !scanStatus) return;

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
  const clearMachineName = () => {
    addMachineNameInput.value = "";
    addMachineNameInput.readOnly = false;
    addMachineNameInput.disabled = true;
  };
  const findMachineByItemCode = async () => {
    const itemCode = addItemCodeInput.value.trim().toUpperCase();
    clearMachineName();
    if (!itemCode) {
      addStatus.textContent = "Scan or enter an Item Code first.";
      addStatus.dataset.type = "warning";
      return;
    }
    machineSearchButton.disabled = true;
    addStatus.textContent = "Searching machine information...";
    addStatus.dataset.type = "idle";
    try {
      const machineConfig = config.machineInfo || {};
      const codeColumn = machineConfig.codeColumn || "ITEM_CODE";
      const params = new URLSearchParams({ select: "*", [codeColumn]: `eq.${itemCode}`, limit: "1" });
      const response = await fetch(`${config.url}/${encodeURIComponent(machineConfig.table || "machine_info")}?${params}`, {
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}) }
      });
      if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status}).`);
      const machine = (await response.json())[0];
      const machineName = String(machine?.name_en || machine?.NAME_EN || "").trim();
      if (!machineName) {
        addStatus.textContent = "No machine was found for this Item Code. Please check the barcode and try again.";
        addStatus.dataset.type = "warning";
        return;
      }
      addItemCodeInput.value = itemCode;
      addMachineNameInput.value = machineName;
      addMachineNameInput.disabled = false;
      addMachineNameInput.readOnly = true;
      addStatus.textContent = "Machine information loaded.";
      addStatus.dataset.type = "success";
    } catch (error) {
      addStatus.textContent = window.SAMHO_ERRORS.message(error, "load machine information");
      addStatus.dataset.type = "error";
    } finally {
      machineSearchButton.disabled = false;
    }
  };
  let scanStream = null;
  let scanTimer = null;
  let barcodeDetector = null;
  let zxingReader = null;
  let zxingControls = null;
  const setScanStatus = (message, type = "idle") => { scanStatus.textContent = message; scanStatus.dataset.type = type; };
  const stopScanner = () => {
    if (scanTimer) window.clearInterval(scanTimer);
    scanTimer = null;
    zxingControls?.stop();
    zxingControls = null;
    scanStream?.getTracks().forEach((track) => track.stop());
    scanStream = null;
    scanVideo.pause();
    scanVideo.srcObject = null;
    scanModal.classList.remove("active");
    scanModal.setAttribute("aria-hidden", "true");
    scanButton.disabled = false;
  };
  const startScanner = async () => {
    const supportsNativeScanner = "BarcodeDetector" in window;
    const supportsZxingScanner = Boolean(window.ZXingBrowser?.BrowserMultiFormatReader);
    if (!navigator.mediaDevices?.getUserMedia) {
      addStatus.textContent = "Camera access requires HTTPS and a supported browser.";
      addStatus.dataset.type = "warning";
      return;
    }
    if (!supportsNativeScanner && !supportsZxingScanner) {
      addStatus.textContent = "Barcode scanner is still loading. Please try again in a moment.";
      addStatus.dataset.type = "warning";
      return;
    }
    scanButton.disabled = true;
    try {
      scanModal.classList.add("active");
      scanModal.setAttribute("aria-hidden", "false");
      setScanStatus("Opening camera...", "idle");
      const handleDetectedCode = async (value) => {
        if (!value) return;
        addItemCodeInput.value = value.toUpperCase();
        stopScanner();
        await findMachineByItemCode();
      };
      if (!supportsNativeScanner) {
        zxingReader = zxingReader || new window.ZXingBrowser.BrowserMultiFormatReader();
        zxingControls = await zxingReader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
          scanVideo,
          (result) => handleDetectedCode(result?.getText()?.trim())
        );
        setScanStatus("Point the camera at a barcode.", "idle");
        return;
      }
      barcodeDetector = barcodeDetector || new window.BarcodeDetector({ formats: ["code_128", "code_39", "code_93", "codabar", "ean_13", "ean_8", "itf", "qr_code", "upc_a", "upc_e"] });
      scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      scanVideo.srcObject = scanStream;
      await scanVideo.play();
      setScanStatus("Point the camera at a barcode.", "idle");
      scanTimer = window.setInterval(async () => {
        if (!scanVideo.videoWidth) return;
        const codes = await barcodeDetector.detect(scanVideo);
        const itemCode = codes[0]?.rawValue?.trim();
        if (!itemCode) return;
        await handleDetectedCode(itemCode);
      }, 450);
    } catch (error) {
      stopScanner();
      addStatus.textContent = window.SAMHO_ERRORS.message(error, "use the camera scanner");
      addStatus.dataset.type = "error";
    } finally {
      scanButton.disabled = false;
    }
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
    clearMachineName();
    updateIssueField();
    addStatus.textContent = "";
    addStatus.dataset.type = "idle";
    addModal.classList.add("active");
    addModal.setAttribute("aria-hidden", "false");
    addItemCodeInput.focus();
  });
  addItemCodeInput.addEventListener("input", clearMachineName);
  addItemCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      findMachineByItemCode();
    }
  });
  machineSearchButton.addEventListener("click", findMachineByItemCode);
  scanButton.addEventListener("click", startScanner);
  document.querySelectorAll("[data-close-red-tag-scan]").forEach((button) => button.addEventListener("click", stopScanner));
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
    const values = { ...Object.fromEntries(new FormData(addForm)), machineName: addMachineNameInput.value.trim() };
    if (!values.machineName) {
      addStatus.textContent = "Search the Item Code and load the Machine Name before saving.";
      addStatus.dataset.type = "warning";
      return;
    }
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
