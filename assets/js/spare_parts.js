document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const spareConfig = config?.spareParts || {};
  const filterForm = document.getElementById("sparePartsFilter");
  const plantSelect = document.getElementById("sparePlantSelect");
  const searchInput = document.getElementById("spareSearchInput");
  const statusSelect = document.getElementById("spareStatusSelect");
  const refreshButton = document.getElementById("spareRefreshButton");
  const addButton = document.getElementById("spareAddButton");
  const status = document.getElementById("sparePartsStatus");
  const list = document.getElementById("sparePartsList");

  if (!filterForm || !plantSelect || !searchInput || !refreshButton || !status || !list) return;

  const pageSize = 10;
  let spareRows = [];
  let currentPage = 1;
  let activeRecord = null;
  let userCanEdit = false;

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

  const normalizeUserValue = (value) => String(value || "").trim().toLowerCase();

  const getCurrentUserIdentity = () => {
    const user = window.SAMHO_AUTH?.currentUser?.();
    const email = normalizeUserValue(user?.email);
    const loginId = normalizeUserValue(window.SAMHO_AUTH?.currentUserId?.());

    return {
      email,
      userId: loginId || email.split("@")[0]
    };
  };

  const applyEditPermission = () => {
    if (!addButton) return;
    addButton.hidden = !userCanEdit;
    addButton.disabled = !userCanEdit;
  };

  applyEditPermission();

  const compareIds = (a, b) => {
    const aValue = readField(a, "id");
    const bValue = readField(b, "id");
    const aNumber = Number(aValue);
    const bNumber = Number(bValue);

    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
      return aNumber - bNumber;
    }

    return String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
  };

  const stockStatus = (safetyStock, onHand) => {
    const safety = toNumber(safetyStock);
    const onHandQuantity = toNumber(onHand);
    const isLow = onHandQuantity < safety || (onHandQuantity === 0 && safety === 0);
    return {
      className: isLow ? "pending" : "done",
      label: isLow ? "Low stock" : "OK"
    };
  };

  const getSparePartImageUrls = (itemCode) => {
    const bucket = String(spareConfig.imageBucket || "").trim();
    const code = String(itemCode || "").trim();
    if (!bucket || !code) return [];

    const storageUrl = config.url.replace(/\/rest\/v1\/?$/, "/storage/v1/object/public");
    const prefix = String(spareConfig.imagePathPrefix || "").replace(/^\/+|\/+$/g, "");
    const extensions = spareConfig.imageExtensions?.length ? spareConfig.imageExtensions : ["webp", "png", "jpg", "jpeg"];
    return extensions.map((extension) => {
      const fileName = `${code}.${String(extension).replace(/^\./, "")}`;
      const objectPath = [prefix, fileName].filter(Boolean).map(encodeURIComponent).join("/");
      return `${storageUrl}/${encodeURIComponent(bucket)}/${objectPath}`;
    });
  };

  const createImageCell = (itemCode) => {
    const cell = document.createElement("td");
    cell.className = "spare-image-cell";
    const urls = getSparePartImageUrls(itemCode);

    if (!urls.length) {
      cell.innerHTML = '<span class="spare-image-empty">No image</span>';
      return cell;
    }

    const image = document.createElement("img");
    image.className = "spare-part-image";
    image.alt = `Spare part ${text(itemCode, "image")}`;
    image.loading = "lazy";
    let imageIndex = 0;
    image.src = urls[imageIndex];
    image.addEventListener("error", () => {
      imageIndex += 1;
      if (imageIndex < urls.length) {
        image.src = urls[imageIndex];
      } else {
        image.remove();
        cell.innerHTML = '<span class="spare-image-empty">No image</span>';
      }
    });
    cell.appendChild(image);
    return cell;
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

  const canEditFromPermissionRow = (row) => {
    if (!row) return false;
    const column = spareConfig.permissions?.canEditColumn;
    if (!column || row[column] === undefined || row[column] === null) return true;
    return row[column] === true || row[column] === 1 || normalizeUserValue(row[column]) === "true";
  };

  const loadEditPermission = async () => {
    const permission = spareConfig.permissions || {};
    const table = permission.table;
    userCanEdit = false;

    if (!table) {
      applyEditPermission();
      return;
    }

    const identity = getCurrentUserIdentity();
    const checks = [
      { column: permission.userIdColumn, value: identity.userId },
      { column: permission.emailColumn, value: identity.email }
    ].filter((check) => check.column && check.value);

    try {
      for (const check of checks) {
        const params = new URLSearchParams({
          select: permission.canEditColumn || "*",
          [check.column]: `eq.${check.value}`,
          limit: "1"
        });
        const rows = await fetchJson(`${config.url}/${encodeURIComponent(table)}?${params}`);
        const hasMatchingPermission = rows.some(
          (row) => normalizeUserValue(row?.[check.column]) === normalizeUserValue(check.value) && canEditFromPermissionRow(row)
        );
        if (hasMatchingPermission) {
          userCanEdit = true;
          break;
        }
      }
    } catch (error) {
      console.warn("Could not check spare part edit permission.", error);
      userCanEdit = false;
    } finally {
      applyEditPermission();
    }
  };

  const patchSparePart = async (params, payload) => {
    return requestSupabase(`${config.url}/${encodeURIComponent(spareConfig.activeTable || spareConfig.table)}?${params}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(payload)
    });
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
        if (rows.length) {
          console.log("spare_parts columns:", Object.keys(rows[0]));
        }
        return rows.filter((row) => readField(row, "itemCode") && readField(row, "plant"));
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

    if (previous && plants.includes(previous)) {
      plantSelect.value = previous;
    }
  };

  const populateModalOptions = (modal) => {
    const setOptions = (selector, values) => {
      const list = modal.querySelector(selector);
      if (!list) return;

      list.innerHTML = "";
      [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .forEach((value) => {
          const option = document.createElement("option");
          option.value = value;
          list.appendChild(option);
        });
    };

    setOptions("#spareFormPlantOptions", spareRows.map((row) => readField(row, "plant")));
    setOptions("#spareFormLocationOptions", spareRows.map((row) => readField(row, "location")));
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

    if (!values.plant || !values.itemCode || !values.nameVietnamese || !values.location) {
      throw new Error("Plant, item code, name, and location are required.");
    }

    if (!Number.isInteger(values.safetyStock) || values.safetyStock < 0 || !Number.isInteger(values.onHand) || values.onHand < 0) {
      throw new Error("Safety stock and on hand must be whole numbers greater than or equal to 0.");
    }

    const map = activeRecord ? spareConfig.updateMap : spareConfig.insertMap;
    const entries = Object.entries(map || {}).filter(([, column]) => column);
    return Object.fromEntries(
      entries.map(([field, column]) => [column, values[field]])
    );
  };

  const getSelectedImage = () => document.getElementById("spareFormImage")?.files?.[0] || null;

  const uploadSparePartImage = async (itemCode, imageFile) => {
    if (!imageFile) return;

    const isJpeg = imageFile.type === "image/jpeg" || /\.jpe?g$/i.test(imageFile.name);
    if (!isJpeg) throw new Error("Please select a JPG image.");

    const bucket = String(spareConfig.imageBucket || "").trim();
    if (!bucket) throw new Error("Add the spare part image bucket in supabase/config.js.");

    const prefix = String(spareConfig.imagePathPrefix || "").replace(/^\/+|\/+$/g, "");
    const objectPath = [prefix, `${itemCode}.jpg`].filter(Boolean).map(encodeURIComponent).join("/");
    const storageUrl = config.url.replace(/\/rest\/v1\/?$/, "/storage/v1/object");
    const response = await fetch(`${storageUrl}/${encodeURIComponent(bucket)}/${objectPath}`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        "Content-Type": "image/jpeg",
        "x-upsert": "true"
      },
      body: imageFile
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Image upload failed (${response.status}).`);
    }
  };

  const deleteSparePartImage = async (itemCode) => {
    const bucket = String(spareConfig.imageBucket || "").trim();
    if (!bucket || !itemCode) return;

    const prefix = String(spareConfig.imagePathPrefix || "").replace(/^\/+|\/+$/g, "");
    const objectPath = [prefix, `${itemCode}.jpg`].filter(Boolean).map(encodeURIComponent).join("/");
    const storageUrl = config.url.replace(/\/rest\/v1\/?$/, "/storage/v1/object");
    const response = await fetch(`${storageUrl}/${encodeURIComponent(bucket)}/${objectPath}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders()
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Image delete failed (${response.status}).`);
    }
  };

  const saveSparePart = async () => {
    const modal = document.getElementById("sparePartModal");
    const modalStatus = document.getElementById("sparePartModalStatus");
    const saveButton = document.getElementById("sparePartSave");

    if (!userCanEdit) {
      modalStatus.textContent = "You do not have permission to edit spare part records.";
      return;
    }

    modalStatus.textContent = "Saving...";
    saveButton.disabled = true;

    try {
      const payload = buildPayload();
      const itemCode = text(document.getElementById("spareFormItemCode")?.value, "").toUpperCase();
      const imageFile = getSelectedImage();
      if (activeRecord) {
        const idColumn = getColumnName(activeRecord, "id");
        const idValue = readField(activeRecord, "id");
        if (!idValue) throw new Error("Missing spare part ID.");

        await patchSparePart(new URLSearchParams({ [idColumn]: `eq.${idValue}` }), payload);
        const itemCodeColumn = getColumnName(activeRecord, "itemCode");
        const itemCodeValue = readField(activeRecord, "itemCode");
        if (itemCodeColumn && itemCodeValue) {
          await patchSparePart(new URLSearchParams({ [itemCodeColumn]: `eq.${itemCodeValue}` }), payload);
        }
        if (imageFile) {
          modalStatus.textContent = "Uploading image...";
          await uploadSparePartImage(itemCode, imageFile);
        }
      } else {
        if (!imageFile) throw new Error("A JPG image is required for a new spare part.");
        if (spareRows.some((row) => text(readField(row, "itemCode"), "").toUpperCase() === itemCode)) {
          throw new Error("A spare part with this item code already exists.");
        }

        modalStatus.textContent = "Uploading image...";
        await uploadSparePartImage(itemCode, imageFile);
        modalStatus.textContent = "Saving...";
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
      modalStatus.textContent = window.SAMHO_ERRORS.message(error, "save this spare part");
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
            <input name="plant" id="spareFormPlant" type="text" list="spareFormPlantOptions" required />
            <datalist id="spareFormPlantOptions"></datalist>
          </label>
          <label>
            <span>Item Code</span>
            <input name="itemCode" id="spareFormItemCode" type="text" required />
          </label>
          <label class="wide">
            <span>Name Vietnamese</span>
            <input name="nameVietnamese" id="spareFormName" type="text" required />
          </label>
          <label class="wide">
            <span>Image (JPG)</span>
            <input name="image" id="spareFormImage" type="file" accept="image/jpeg,.jpg,.jpeg" />
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
            <span>Status</span>
            <output class="repair-table-status" id="spareFormStockStatus">OK</output>
          </label>
          <label>
            <span>Location</span>
            <input name="location" id="spareFormLocation" type="text" list="spareFormLocationOptions" required />
            <datalist id="spareFormLocationOptions"></datalist>
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
    ["#spareFormSafety", "#spareFormOnHand"].forEach((selector) => {
      modal.querySelector(selector)?.addEventListener("input", () => updateModalStockStatus(modal));
    });

    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  const updateModalStockStatus = (modal) => {
    const status = modal.querySelector("#spareFormStockStatus");
    if (!status) return;

    const nextStatus = stockStatus(
      modal.querySelector("#spareFormSafety")?.value,
      modal.querySelector("#spareFormOnHand")?.value
    );
    status.className = `repair-table-status ${nextStatus.className}`;
    status.textContent = nextStatus.label;
  };

  const openModal = (row = null) => {
    if (!userCanEdit) {
      setStatus("You can view spare parts, but your account cannot edit records.", "warning");
      return;
    }

    activeRecord = row;
    const modal = ensureModal();
    const isEdit = Boolean(row);

    populateModalOptions(modal);
    modal.querySelector("#sparePartEyebrow").textContent = isEdit ? `Item ${text(readField(row, "itemCode"))}` : "New spare part";
    modal.querySelector("#sparePartTitle").textContent = isEdit ? "Edit spare part" : "Add spare part";
    modal.querySelector("#spareFormPlant").value = isEdit ? text(readField(row, "plant"), "") : plantSelect.value;
    modal.querySelector("#spareFormItemCode").value = isEdit ? text(readField(row, "itemCode"), "") : "";
    modal.querySelector("#spareFormName").value = isEdit ? text(readField(row, "nameVietnamese"), "") : "";
    modal.querySelector("#spareFormImage").value = "";
    modal.querySelector("#spareFormImage").required = !isEdit;
    modal.querySelector("#spareFormSafety").value = isEdit ? toNumber(readField(row, "safetyStock")) : 0;
    modal.querySelector("#spareFormOnHand").value = isEdit ? toNumber(readField(row, "onHand")) : 0;
    modal.querySelector("#spareFormLocation").value = isEdit ? text(readField(row, "location"), "") : "";
    modal.querySelector("#sparePartModalStatus").textContent = "";
    updateModalStockStatus(modal);
    modal.classList.add("active");
  };

  const deleteSparePart = async (row) => {
    if (!userCanEdit) {
      setStatus("You do not have permission to delete spare part records.", "warning");
      return;
    }

    const idColumn = getColumnName(row, "id");
    const idValue = readField(row, "id");
    const itemCode = text(readField(row, "itemCode"), "");
    if (!idColumn || !idValue) {
      setStatus("Missing spare part ID.", "error");
      return;
    }
    if (!window.confirm(`Delete spare part ${itemCode || idValue}? This cannot be undone.`)) return;

    setStatus("Deleting spare part...", "loading");
    try {
      const params = new URLSearchParams({ [idColumn]: `eq.${idValue}` });
      await requestSupabase(`${config.url}/${encodeURIComponent(spareConfig.activeTable || spareConfig.table)}?${params}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });

      let imageDeleted = true;
      try {
        await deleteSparePartImage(itemCode);
      } catch (imageError) {
        console.warn("Spare part image was not deleted.", imageError);
        imageDeleted = false;
      }

      await loadSpareParts();
      setStatus(
        imageDeleted
          ? `Deleted spare part ${itemCode || idValue}.`
          : `Deleted spare part ${itemCode || idValue}, but its image could not be deleted.`,
        imageDeleted ? "success" : "warning"
      );
    } catch (error) {
      setStatus(window.SAMHO_ERRORS.message(error, "delete this spare part"), "error");
    }
  };

  const getFilteredRows = () => {
    const plant = String(plantSelect.value);
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusSelect?.value || "";
    const selectedStatusClass = { low: "pending", ok: "done" }[selectedStatus];

    return spareRows.filter((row) => {
      const rowPlant = text(readField(row, "plant"), "Unknown plant");
      const rowStatus = stockStatus(readField(row, "safetyStock"), readField(row, "onHand")).className;
      const haystack = [
        readField(row, "itemCode"),
        readField(row, "nameVietnamese"),
        readField(row, "location")
      ].join(" ").toLowerCase();

      if (!plant || rowPlant === plant) {
        if (!keyword || haystack.includes(keyword)) {
          if (!selectedStatus || rowStatus === selectedStatusClass) {
            return true;
          }
        }
      }
      return false;
    });
  };

  const renderStats = (rows) => {
    const totalOnHand = rows.reduce((sum, row) => sum + toNumber(readField(row, "onHand")), 0);
    const belowSafety = rows.filter((row) => stockStatus(readField(row, "safetyStock"), readField(row, "onHand")).className === "pending").length;

    document.getElementById("spareTotalItems").textContent = rows.length.toLocaleString();
    document.getElementById("spareTotalOnHand").textContent = totalOnHand.toLocaleString();
    document.getElementById("spareBelowSafety").textContent = belowSafety.toLocaleString();
  };

  const renderRows = (page = 1) => {
    const rows = getFilteredRows().sort(compareIds);
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
            <th>No.</th>
            <th>Item Code</th>
            <th>Image</th>
            <th>Name Vietnamese</th>
            <th>Safety Stock</th>
            <th>On Hand</th>
            <th>Difference</th>
            <th>Location</th>
            <th>Status</th>
            ${userCanEdit ? "<th>Actions</th>" : ""}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    const tbody = tableWrap.querySelector("tbody");
    pageRows.forEach((row, idx) => {
      const rowNumber = pageStart + idx + 1;
      const safetyStock = toNumber(readField(row, "safetyStock"));
      const onHand = toNumber(readField(row, "onHand"));
      const difference = onHand - safetyStock;
      const status = stockStatus(safetyStock, onHand);
      const tr = document.createElement("tr");
      if (status.className === "pending") tr.className = "spare-low-stock";
      const itemCode = readField(row, "itemCode");

      tr.innerHTML = `
        <td>${rowNumber}</td>
        <td><strong>${text(itemCode)}</strong></td>
        <td>${text(readField(row, "nameVietnamese"))}</td>
        <td>${safetyStock.toLocaleString()}</td>
        <td>${onHand.toLocaleString()}</td>
        <td><strong class="spare-stock-difference ${difference < 0 ? "negative" : difference > 0 ? "positive" : "neutral"}">${difference.toLocaleString()}</strong></td>
        <td>${text(readField(row, "location"))}</td>
        <td><span class="repair-table-status ${status.className}">${status.label}</span></td>
        ${userCanEdit
          ? `<td>
              <div class="spare-row-actions">
                <button class="repair-edit spare-edit" type="button" aria-label="Edit spare part" title="Edit">
                  <i data-lucide="square-pen"></i>
                </button>
                <button class="repair-edit spare-delete" type="button" aria-label="Delete spare part" title="Delete">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>`
          : ""}
      `;

      tr.insertBefore(createImageCell(itemCode), tr.children[2]);
      tr.querySelector(".spare-edit")?.addEventListener("click", () => openModal(row));
      tr.querySelector(".spare-delete")?.addEventListener("click", () => deleteSparePart(row));
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
    setStatus(
      userCanEdit
        ? `Showing ${rows.length.toLocaleString()} items`
        : `Showing ${rows.length.toLocaleString()} items. View-only account.`,
      "success"
    );

    if (window.lucide) window.lucide.createIcons();
  };

  const loadSpareParts = async () => {
    if (!spareConfig.table) {
      setStatus("Add spare_parts table settings in supabase/config.js.", "error");
      return;
    }

    refreshButton.disabled = true;
    setStatus("Loading spare parts...", "loading");

    try {
      await loadEditPermission();
      spareRows = await fetchSpareParts();
      populatePlants(spareRows);
      renderRows();
    } catch (error) {
      spareRows = [];
      renderStats([]);
      list.innerHTML = "";
      setStatus(window.SAMHO_ERRORS.message(error, "load spare parts"), "error");
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
  statusSelect?.addEventListener("change", () => renderRows(1));
  addButton?.addEventListener("click", () => openModal());

  loadSpareParts();
});
