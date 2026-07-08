document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const spareConfig = config?.spareParts || {};
  const filterForm = document.getElementById("sparePartsFilter");
  const plantSelect = document.getElementById("sparePlantSelect");
  const searchInput = document.getElementById("spareSearchInput");
  const refreshButton = document.getElementById("spareRefreshButton");
  const addButton = document.getElementById("spareAddButton");
  const status = document.getElementById("sparePartsStatus");
  const list = document.getElementById("sparePartsList");

  if (!filterForm || !plantSelect || !searchInput || !refreshButton || !status || !list) return;

  const pageSize = 10;
  let spareRows = [];
  let currentPage = 1;
  let activeRecord = null;

  const setStatus = (message, type = "idle") => {
    status.textContent = message;
    status.dataset.type = type;
  };

  const readField = (row, key) => {
    const columns = [].concat(spareConfig.fieldMap?.[key] || []);
    const column = columns.find((name) => row?.[name] !== undefined && row?.[name] !== null);
    return column ? row[column] : "";
  };

  const getColumnName = (row, key) => {
    const columns = [].concat(spareConfig.fieldMap?.[key] || []);
    return columns.find((name) => row?.[name] !== undefined) || columns[0] || key;
  };

  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const text = (value, fallback = "-") => {
    const result = String(value ?? "").trim();
    return result || fallback;
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

  const requestSupabase = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Request failed (${response.status}).`);
    }

    const body = await response.text();
    return body ? JSON.parse(body) : null;
  };

  const fetchSpareParts = async () => {
    const tableNames = [...new Set([spareConfig.table, ...(spareConfig.tableCandidates || [])].filter(Boolean))];
    const errors = [];

    for (const tableName of tableNames) {
      const params = new URLSearchParams({
        select: "*",
        limit: String(spareConfig.pageSize || 1000)
      });
      const url = `${config.url}/${encodeURIComponent(tableName)}?${params}`;

      try {
        const rows = await fetchJson(url);
        spareConfig.activeTable = tableName;
        return rows;
      } catch (error) {
        errors.push(`${tableName}: ${error.message}`);
      }
    }

    throw new Error(`Could not fetch spare parts. Checked tables: ${errors.join(" | ")}`);
  };

  const populatePlants = (rows) => {
    const previous = plantSelect.value;
    const plants = [...new Set(rows.map((row) => text(readField(row, "plant"), "Unknown plant")))].sort((a, b) => a.localeCompare(b));

    plantSelect.innerHTML = `<option value="">All plants</option>`;
    plants.forEach((plant) => {
      const option = document.createElement("option");
      option.value = plant;
      option.textContent = plant;
      plantSelect.appendChild(option);
    });

    if (plants.includes(previous)) plantSelect.value = previous;
  };

  const buildPayload = () => {
    const form = document.getElementById("sparePartForm");
    const formData = new FormData(form);
    const values = {
      plant: text(formData.get("plant"), ""),
      itemCode: text(formData.get("itemCode"), "").toUpperCase(),
      nameVietnamese: text(formData.get("nameVietnamese"), ""),
      safetyStock: Number(formData.get("safetyStock")),
      onHand: Number(formData.get("onHand")),
      location: text(formData.get("location"), "")
    };

    if (!values.plant || !values.itemCode || !values.nameVietnamese) {
      throw new Error("Plant, item code, and name are required.");
    }

    if (!Number.isInteger(values.safetyStock) || values.safetyStock < 0 || !Number.isInteger(values.onHand) || values.onHand < 0) {
      throw new Error("Safety stock and on hand must be whole numbers greater than or equal to 0.");
    }

    const map = activeRecord ? spareConfig.updateMap : spareConfig.insertMap;
    return Object.fromEntries(
      Object.entries(map || {})
        .filter(([, column]) => column)
        .map(([field, column]) => [column, values[field]])
    );
  };

  const saveSparePart = async () => {
    const modal = document.getElementById("sparePartModal");
    const modalStatus = document.getElementById("sparePartModalStatus");
    const saveButton = document.getElementById("sparePartSave");

    modalStatus.textContent = "Saving...";
    saveButton.disabled = true;

    try {
      const payload = buildPayload();
      if (activeRecord) {
        const idColumn = getColumnName(activeRecord, "id");
        const idValue = readField(activeRecord, "id");
        if (!idValue) throw new Error("Missing spare part ID.");

        const params = new URLSearchParams({ [idColumn]: `eq.${idValue}` });
        await requestSupabase(`${config.url}/${encodeURIComponent(spareConfig.activeTable || spareConfig.table)}?${params}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload)
        });
      } else {
        await requestSupabase(`${config.url}/${encodeURIComponent(spareConfig.activeTable || spareConfig.table)}`, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload)
        });
      }

      modalStatus.textContent = "Saved.";
      modal.classList.remove("active");
      await loadSpareParts();
    } catch (error) {
      modalStatus.textContent = error.message;
    } finally {
      saveButton.disabled = false;
    }
  };

  const ensureModal = () => {
    let modal = document.getElementById("sparePartModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "repair-modal spare-modal";
    modal.id = "sparePartModal";
    modal.innerHTML = `
      <div class="repair-modal-backdrop" data-close-spare></div>
      <form class="repair-modal-dialog" id="sparePartForm">
        <header class="repair-modal-header">
          <div>
            <span id="sparePartEyebrow">Spare part</span>
            <h2 id="sparePartTitle">Add spare part</h2>
          </div>
          <button class="repair-modal-close" type="button" data-close-spare aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </header>
        <div class="repair-modal-grid spare-modal-grid">
          <label>
            <span>Plant</span>
            <input name="plant" id="spareFormPlant" type="text" required />
          </label>
          <label>
            <span>Item Code</span>
            <input name="itemCode" id="spareFormItemCode" type="text" required />
          </label>
          <label class="wide">
            <span>Name Vietnamese</span>
            <input name="nameVietnamese" id="spareFormName" type="text" required />
          </label>
          <label>
            <span>Safety Stock</span>
            <input name="safetyStock" id="spareFormSafety" type="number" min="0" step="1" required />
          </label>
          <label>
            <span>On Hand</span>
            <input name="onHand" id="spareFormOnHand" type="number" min="0" step="1" required />
          </label>
          <label>
            <span>Location</span>
            <input name="location" id="spareFormLocation" type="text" />
          </label>
        </div>
        <footer class="repair-modal-footer">
          <p class="repair-modal-status" id="sparePartModalStatus" aria-live="polite"></p>
          <button class="btn muted" type="button" data-close-spare>Cancel</button>
          <button class="save" id="sparePartSave" type="submit"><i data-lucide="save"></i>Save</button>
        </footer>
      </form>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll("[data-close-spare]").forEach((button) => {
      button.addEventListener("click", () => modal.classList.remove("active"));
    });
    modal.querySelector("#sparePartForm").addEventListener("submit", (event) => {
      event.preventDefault();
      saveSparePart();
    });

    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  const openModal = (row = null) => {
    activeRecord = row;
    const modal = ensureModal();
    const isEdit = Boolean(row);

    modal.querySelector("#sparePartEyebrow").textContent = isEdit ? `ID ${text(readField(row, "id"))}` : "New spare part";
    modal.querySelector("#sparePartTitle").textContent = isEdit ? "Edit spare part" : "Add spare part";
    modal.querySelector("#spareFormPlant").value = isEdit ? text(readField(row, "plant"), "") : plantSelect.value;
    modal.querySelector("#spareFormItemCode").value = isEdit ? text(readField(row, "itemCode"), "") : "";
    modal.querySelector("#spareFormName").value = isEdit ? text(readField(row, "nameVietnamese"), "") : "";
    modal.querySelector("#spareFormSafety").value = isEdit ? toNumber(readField(row, "safetyStock")) : 0;
    modal.querySelector("#spareFormOnHand").value = isEdit ? toNumber(readField(row, "onHand")) : 0;
    modal.querySelector("#spareFormLocation").value = isEdit ? text(readField(row, "location"), "") : "";
    modal.querySelector("#sparePartModalStatus").textContent = "";
    modal.classList.add("active");
  };

  const getFilteredRows = () => {
    const plant = plantSelect.value;
    const keyword = searchInput.value.trim().toLowerCase();

    return spareRows.filter((row) => {
      const rowPlant = text(readField(row, "plant"), "Unknown plant");
      const haystack = [
        readField(row, "itemCode"),
        readField(row, "nameVietnamese"),
        readField(row, "location")
      ].join(" ").toLowerCase();

      return (!plant || rowPlant === plant) && (!keyword || haystack.includes(keyword));
    });
  };

  const renderStats = (rows) => {
    const totalOnHand = rows.reduce((sum, row) => sum + toNumber(readField(row, "onHand")), 0);
    const belowSafety = rows.filter((row) => toNumber(readField(row, "onHand")) < toNumber(readField(row, "safetyStock"))).length;

    document.getElementById("spareTotalItems").textContent = rows.length.toLocaleString();
    document.getElementById("spareTotalOnHand").textContent = totalOnHand.toLocaleString();
    document.getElementById("spareBelowSafety").textContent = belowSafety.toLocaleString();
  };

  const renderRows = (page = 1) => {
    const rows = getFilteredRows().sort((a, b) => {
      const plantCompare = text(readField(a, "plant"), "Unknown plant").localeCompare(text(readField(b, "plant"), "Unknown plant"));
      if (plantCompare !== 0) return plantCompare;
      return text(readField(a, "itemCode"), "").localeCompare(text(readField(b, "itemCode"), ""));
    });
    renderStats(rows);
    list.innerHTML = "";

    if (!rows.length) {
      list.innerHTML = `<article class="repair-empty">No spare parts found for the selected plant.</article>`;
      setStatus(`No spare parts found${spareConfig.activeTable ? ` in ${spareConfig.activeTable}` : ""}.`, "warning");
      return;
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    currentPage = Math.min(Math.max(page, 1), totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageRows = rows.slice(pageStart, pageStart + pageSize);

    const tableWrap = document.createElement("div");
    tableWrap.className = "repair-table-wrap spare-table-wrap";
    tableWrap.innerHTML = `
      <table class="repair-table spare-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item Code</th>
            <th>Name Vietnamese</th>
            <th>Safety Stock</th>
            <th>On Hand</th>
            <th>Location</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    const tbody = tableWrap.querySelector("tbody");
    pageRows.forEach((row) => {
      const safetyStock = toNumber(readField(row, "safetyStock"));
      const onHand = toNumber(readField(row, "onHand"));
      const isLow = onHand < safetyStock;
      const tr = document.createElement("tr");
      if (isLow) tr.className = "spare-low-stock";

      tr.innerHTML = `
        <td>${text(readField(row, "id"))}</td>
        <td><strong>${text(readField(row, "itemCode"))}</strong></td>
        <td>${text(readField(row, "nameVietnamese"))}</td>
        <td>${safetyStock.toLocaleString()}</td>
        <td>${onHand.toLocaleString()}</td>
        <td>${text(readField(row, "location"))}</td>
        <td><span class="repair-table-status ${isLow ? "pending" : "done"}">${isLow ? "Low stock" : "OK"}</span></td>
        <td>
          <button class="repair-edit spare-edit" type="button">
            <i data-lucide="square-pen"></i>
            Edit
          </button>
        </td>
      `;

      tr.querySelector(".spare-edit")?.addEventListener("click", () => openModal(row));
      tbody.appendChild(tr);
    });

    list.appendChild(tableWrap);

    const pagination = document.createElement("div");
    pagination.className = "repair-pagination";
    pagination.innerHTML = `
      <span>Showing ${pageStart + 1}-${Math.min(pageStart + pageSize, rows.length)} of ${rows.length}</span>
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
        renderRows(Number(button.dataset.page));
        if (window.lucide) window.lucide.createIcons();
      });
    });

    list.appendChild(pagination);
    setStatus(`Showing ${rows.length.toLocaleString()} items`, "success");
  };

  const loadSpareParts = async () => {
    if (!spareConfig.table) {
      setStatus("Add spare_parts table settings in supabase/config.js.", "error");
      return;
    }

    refreshButton.disabled = true;
    setStatus("Loading spare parts...", "loading");

    try {
      spareRows = await fetchSpareParts();
      populatePlants(spareRows);
      renderRows();
    } catch (error) {
      spareRows = [];
      renderStats([]);
      list.innerHTML = "";
      setStatus(error.message, "error");
    } finally {
      refreshButton.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
  };

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadSpareParts();
  });
  plantSelect.addEventListener("change", () => renderRows(1));
  searchInput.addEventListener("input", () => renderRows(1));
  addButton?.addEventListener("click", () => openModal());

  loadSpareParts();
});
