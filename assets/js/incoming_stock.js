document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const spareConfig = config?.spareParts || {};
  const form = document.getElementById("incomingStockForm");
  const list = document.getElementById("incomingStockList");
  const status = document.getElementById("incomingStockStatus");
  const modal = document.getElementById("incomingStockModal");
  const modalList = document.getElementById("incomingStockModalList");
  const plantFilter = document.getElementById("incomingPlantFilter");
  const statusFilter = document.getElementById("incomingStatusFilter");
  const searchInput = document.getElementById("incomingSearchInput");
  const pagination = document.getElementById("incomingStockPagination");
  const exportButton = document.getElementById("incomingStockExport");
  const pageSize = 10;
  let spareRows = [];
  let filteredRows = [];
  let currentPage = 1;
  let orderSummary = [];
  const selectedItems = new Map();

  if (!config || !form || !list || !status || !modal || !modalList || !plantFilter || !statusFilter || !searchInput || !pagination || !exportButton) return;

  const text = (value, fallback = "-") => String(value ?? "").trim() || fallback;
  const toNumber = (value) => {
    const number = Number(String(value ?? "").replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  };
  const readField = (row, key) => {
    const columns = [].concat(spareConfig.fieldMap?.[key] || []);
    const column = columns.find((name) => row?.[name] !== undefined && row?.[name] !== null);
    return column ? row[column] : "";
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const setStatus = (message, type = "idle") => { status.textContent = message; status.dataset.type = type; };
  const stockStatus = (safetyStock, onHand) => {
    const safety = toNumber(safetyStock);
    const onHandQuantity = toNumber(onHand);
    const isLow = onHandQuantity < safety || (onHandQuantity === 0 && safety === 0);
    return isLow ? { className: "pending", label: "Low stock" } : { className: "done", label: "OK" };
  };
  const getImageUrls = (itemCode) => {
    const bucket = String(spareConfig.imageBucket || "").trim();
    const code = String(itemCode || "").trim();
    if (!bucket || !code) return [];
    const storageUrl = config.url.replace(/\/rest\/v1\/?$/, "/storage/v1/object/public");
    const prefix = String(spareConfig.imagePathPrefix || "").replace(/^\/+|\/+$/g, "");
    const extensions = spareConfig.imageExtensions?.length ? spareConfig.imageExtensions : ["jpg", "jpeg", "png", "webp"];
    return extensions.map((extension) => {
      const objectPath = [prefix, `${code}.${String(extension).replace(/^\./, "")}`].filter(Boolean).map(encodeURIComponent).join("/");
      return `${storageUrl}/${encodeURIComponent(bucket)}/${objectPath}`;
    });
  };
  const imageMarkup = (itemCode) => {
    const urls = getImageUrls(itemCode);
    if (!urls.length) return '<span class="spare-image-empty">No image</span>';
    return `<img class="spare-part-image incoming-part-image" src="${escapeHtml(urls[0])}" data-image-urls="${escapeHtml(JSON.stringify(urls))}" alt="Spare part ${escapeHtml(itemCode)}" loading="lazy" />`;
  };
  const loadImages = () => {
    list.querySelectorAll(".incoming-part-image").forEach((image) => image.addEventListener("error", () => {
      const urls = JSON.parse(image.dataset.imageUrls || "[]");
      const nextIndex = Number(image.dataset.imageIndex || 0) + 1;
      if (nextIndex < urls.length) {
        image.dataset.imageIndex = String(nextIndex);
        image.src = urls[nextIndex];
      } else {
        image.replaceWith(Object.assign(document.createElement("span"), { className: "spare-image-empty", textContent: "No image" }));
      }
    }));
  };

  const fetchParts = async () => {
    const tableNames = [...new Set([spareConfig.table, ...(spareConfig.tableCandidates || [])].filter(Boolean))];
    const errors = [];
    for (const tableName of tableNames) {
      try {
        const params = new URLSearchParams({ select: "*", limit: String(spareConfig.pageSize || 1000) });
        const response = await fetch(`${config.url}/${encodeURIComponent(tableName)}?${params}`, { headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(window.SAMHO_AUTH?.authHeaders?.() || {}) } });
        if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status}).`);
        const rows = await response.json();
        return rows.filter((row) => readField(row, "itemCode") && readField(row, "plant"));
      } catch (error) { errors.push(`${tableName}: ${error.message}`); }
    }
    throw new Error(`Could not load spare parts. ${errors.join(" | ")}`);
  };

  const renderParts = (rows) => {
    if (!rows.length) {
      list.innerHTML = '<tr><td colspan="7">No spare parts found.</td></tr>';
      pagination.hidden = true;
      return;
    }

    const totalPages = Math.ceil(rows.length / pageSize);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageRows = rows.slice(pageStart, pageStart + pageSize);

    list.innerHTML = pageRows.map((row, index) => {
      const itemStatus = stockStatus(readField(row, "safetyStock"), readField(row, "onHand"));
      return `
      <tr>
        <td><strong>${escapeHtml(text(readField(row, "itemCode")))}</strong></td>
        <td class="spare-image-cell">${imageMarkup(text(readField(row, "itemCode")))}</td>
        <td>${escapeHtml(text(readField(row, "nameVietnamese")))}</td>
        <td>${escapeHtml(text(readField(row, "plant")))}</td>
        <td><span class="repair-table-status ${itemStatus.className}">${itemStatus.label}</span></td>
        <td><input class="incoming-quantity" type="number" min="1" step="1" inputmode="numeric" aria-label="Quantity to order for ${escapeHtml(text(readField(row, "itemCode")))}" ${selectedItems.has(text(readField(row, "itemCode"))) ? `value="${selectedItems.get(text(readField(row, "itemCode")))}" required` : "disabled"} /></td>
        <td><input class="incoming-select" id="incomingSelect${index}" type="checkbox" aria-label="Select ${escapeHtml(text(readField(row, "itemCode")))}" data-item-code="${escapeHtml(text(readField(row, "itemCode")))}" data-name="${escapeHtml(text(readField(row, "nameVietnamese")))}" data-plant="${escapeHtml(text(readField(row, "plant")))}" ${selectedItems.has(text(readField(row, "itemCode"))) ? "checked" : ""} /></td>
      </tr>`;
    }).join("");
    loadImages();

    pagination.hidden = rows.length <= pageSize;
    pagination.innerHTML = `
      <span>Showing ${pageStart + 1}-${Math.min(pageStart + pageSize, rows.length)} of ${rows.length}</span>
      <div class="repair-pagination-actions">
        <button class="repair-page-btn" type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i>Previous</button>
        <strong>Page ${currentPage} / ${totalPages}</strong>
        <button class="repair-page-btn" type="button" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next<i data-lucide="chevron-right"></i></button>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
  };

  const applyFilters = () => {
    const plant = plantFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedStatusClass = { low: "pending", ok: "done" }[selectedStatus];
    const search = searchInput.value.trim().toLowerCase();
    filteredRows = spareRows.filter((row) => {
      const itemCode = text(readField(row, "itemCode"), "").toLowerCase();
      const name = text(readField(row, "nameVietnamese"), "").toLowerCase();
      return (!plant || text(readField(row, "plant")) === plant)
        && (!selectedStatus || stockStatus(readField(row, "safetyStock"), readField(row, "onHand")).className === selectedStatusClass)
        && (!search || itemCode.includes(search) || name.includes(search));
    });
    currentPage = 1;
    renderParts(filteredRows);
  };

  const populatePlants = () => {
    const plants = [...new Set(spareRows.map((row) => text(readField(row, "plant"), "Unknown plant")))].sort((a, b) => a.localeCompare(b));
    plantFilter.innerHTML = '<option value="">All plants</option>';
    plants.forEach((plant) => { const option = new Option(plant, plant); plantFilter.add(option); });
  };

  list.addEventListener("change", (event) => {
    if (!event.target.matches(".incoming-select")) return;
    const quantity = event.target.closest("tr").querySelector(".incoming-quantity");
    quantity.disabled = !event.target.checked;
    quantity.required = event.target.checked;
    if (event.target.checked) {
      quantity.value = quantity.value || "1";
      selectedItems.set(event.target.dataset.itemCode, quantity.value);
      quantity.focus();
    }
    else { quantity.value = ""; selectedItems.delete(event.target.dataset.itemCode); }
  });

  list.addEventListener("input", (event) => {
    if (event.target.matches(".incoming-quantity")) {
      const checkbox = event.target.closest("tr").querySelector(".incoming-select");
      if (checkbox.checked) selectedItems.set(checkbox.dataset.itemCode, event.target.value);
    }
  });

  plantFilter.addEventListener("change", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest(".repair-page-btn");
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    renderParts(filteredRows);
  });

  const closeModal = () => { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); };
  document.querySelectorAll("[data-close-incoming]").forEach((button) => button.addEventListener("click", closeModal));

  const exportOrderSummary = () => {
    if (!orderSummary.length || !window.XLSX) return;
    const worksheet = window.XLSX.utils.json_to_sheet(orderSummary.map((item, index) => ({
      "No.": index + 1,
      "Item Code": item.itemCode,
      "Name Vietnamese": item.name,
      Plant: item.plant,
      Quantity: item.quantity
    })));
    worksheet["!cols"] = [{ wch: 7 }, { wch: 18 }, { wch: 34 }, { wch: 16 }, { wch: 12 }];
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Order Summary");
    const date = new Date().toISOString().slice(0, 10);
    window.XLSX.writeFile(workbook, `incoming-stock-order_${date}.xlsx`);
  };

  exportButton.addEventListener("click", exportOrderSummary);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = [...selectedItems.entries()].map(([itemCode, quantity]) => {
      const row = spareRows.find((part) => text(readField(part, "itemCode")) === itemCode);
      return {
        itemCode,
        name: text(readField(row, "nameVietnamese")),
        plant: text(readField(row, "plant")),
        quantity: Number(quantity)
      };
    });
    if (!selected.length) { setStatus("Select at least one item to review the order.", "error"); return; }
    if (selected.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) { setStatus("Enter a whole quantity of at least 1 for every selected item.", "error"); return; }
    orderSummary = selected;
    modalList.innerHTML = `<table class="repair-table incoming-summary-table"><thead><tr><th>No.</th><th>Item Code</th><th>Name Vietnamese</th><th>Plant</th><th>Quantity</th></tr></thead><tbody>${orderSummary.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.itemCode)}</strong></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.plant)}</td><td>${item.quantity}</td></tr>`).join("")}</tbody></table>`;
    setStatus("");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    if (window.lucide) window.lucide.createIcons();
  });

  fetchParts().then((rows) => { spareRows = rows; populatePlants(); applyFilters(); setStatus(`${rows.length} spare part${rows.length === 1 ? "" : "s"} loaded.`, "success"); }).catch((error) => { list.innerHTML = '<tr><td colspan="7">Unable to load spare parts.</td></tr>'; setStatus(window.SAMHO_ERRORS.message(error, "load spare parts"), "error"); });
});
