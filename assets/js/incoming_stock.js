if (window.SAMHO_LANG) {
  window.SAMHO_LANG.register({
    "incoming.title": { vi: "Hàng nhập", en: "Incoming Stock" },
    "incoming.note": { vi: "Chọn phụ tùng và nhập số lượng bạn muốn đặt hàng.", en: "Select spare parts and enter the quantity you want to order." },
    "incoming.filterAria": { vi: "Lọc phụ tùng", en: "Filter spare parts" },
    "incoming.plant": { vi: "Nhà máy", en: "Plant" },
    "incoming.allPlants": { vi: "Tất cả nhà máy", en: "All plants" },
    "incoming.search": { vi: "Tìm kiếm", en: "Search" },
    "incoming.searchPlaceholder": { vi: "Mã phụ tùng hoặc tên tiếng Việt", en: "Item code or Vietnamese name" },
    "incoming.status": { vi: "Trạng thái", en: "Status" },
    "incoming.allStatus": { vi: "Tất cả trạng thái", en: "All status" },
    "incoming.lowStock": { vi: "Sắp hết hàng", en: "Low stock" },
    "incoming.ok": { vi: "Đạt", en: "OK" },
    "incoming.listAria": { vi: "Phụ tùng cần đặt hàng", en: "Spare parts to order" },
    "incoming.itemCode": { vi: "Mã phụ tùng", en: "Item Code" },
    "incoming.image": { vi: "Hình ảnh", en: "Image" },
    "incoming.nameVn": { vi: "Tên tiếng Việt", en: "Name Vietnamese" },
    "incoming.quantity": { vi: "Số lượng", en: "Quantity" },
    "incoming.selectItem": { vi: "Chọn phụ tùng", en: "Select item" },
    "incoming.loading": { vi: "Đang tải phụ tùng...", en: "Loading spare parts..." },
    "incoming.reviewSelected": { vi: "Xem lại các mục đã chọn", en: "Review Selected Items" },
    "incoming.orderSummary": { vi: "Tóm tắt đơn hàng", en: "Order Summary" },
    "incoming.close": { vi: "Đóng", en: "Close" },
    "incoming.exportExcel": { vi: "Xuất Excel", en: "Export Excel" },
    "incoming.noImage": { vi: "Không có hình ảnh", en: "No image" },
    "incoming.imageAlt": { vi: "Phụ tùng {code}", en: "Spare part {code}" },
    "incoming.error.noTable": { vi: "Chưa cấu hình bảng phụ tùng trong supabase/config.js.", en: "No spare parts table configured in supabase/config.js." },
    "incoming.noParts": { vi: "Không tìm thấy phụ tùng nào.", en: "No spare parts found." },
    "incoming.quantityAria": { vi: "Số lượng đặt cho {code}", en: "Quantity to order for {code}" },
    "incoming.selectAria": { vi: "Chọn {code}", en: "Select {code}" },
    "incoming.showing": { vi: "Hiển thị {start}-{end} trên {total}", en: "Showing {start}-{end} of {total}" },
    "incoming.previous": { vi: "Trước", en: "Previous" },
    "incoming.page": { vi: "Trang {current} / {total}", en: "Page {current} / {total}" },
    "incoming.next": { vi: "Sau", en: "Next" },
    "incoming.unknownPlant": { vi: "Nhà máy không xác định", en: "Unknown plant" },
    "incoming.no": { vi: "STT", en: "No." },
    "incoming.error.noSelection": { vi: "Vui lòng chọn ít nhất một phụ tùng để xem lại đơn hàng.", en: "Select at least one item to review the order." },
    "incoming.error.invalidQuantity": { vi: "Vui lòng nhập số lượng nguyên lớn hơn hoặc bằng 1 cho từng mục đã chọn.", en: "Enter a whole quantity of at least 1 for every selected item." },
    "incoming.loaded.one": { vi: "Đã tải 1 phụ tùng.", en: "1 spare part loaded." },
    "incoming.loaded.many": { vi: "Đã tải {count} phụ tùng.", en: "{count} spare parts loaded." },
    "incoming.unableToLoad": { vi: "Không thể tải danh sách phụ tùng.", en: "Unable to load spare parts." },
    "incoming.action.load": { vi: "tải phụ tùng", en: "load spare parts" },
  });
}

const t = (id, vars) => (window.SAMHO_LANG ? window.SAMHO_LANG.t(id, vars) : "");

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
  let dataLoaded = false;
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
    return isLow ? { className: "pending", label: t("incoming.lowStock") } : { className: "done", label: t("incoming.ok") };
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
    if (!urls.length) return `<span class="spare-image-empty">${t("incoming.noImage")}</span>`;
    return `<img class="spare-part-image incoming-part-image" src="${escapeHtml(urls[0])}" data-image-urls="${escapeHtml(JSON.stringify(urls))}" alt="${escapeHtml(t("incoming.imageAlt", { code: itemCode }))}" loading="lazy" />`;
  };
  const loadImages = () => {
    list.querySelectorAll(".incoming-part-image").forEach((image) => image.addEventListener("error", () => {
      const urls = JSON.parse(image.dataset.imageUrls || "[]");
      const nextIndex = Number(image.dataset.imageIndex || 0) + 1;
      if (nextIndex < urls.length) {
        image.dataset.imageIndex = String(nextIndex);
        image.src = urls[nextIndex];
      } else {
        image.replaceWith(Object.assign(document.createElement("span"), { className: "spare-image-empty", textContent: t("incoming.noImage") }));
      }
    }));
  };

  const fetchParts = async () => {
    const tableNames = [...new Set([spareConfig.table, ...(spareConfig.tableCandidates || [])].filter(Boolean))];
    if (!tableNames.length) throw new Error(t("incoming.error.noTable"));

    const { rows } = await window.SAMHO_DB.discover(tableNames, {
      columns: "*",
      limit: spareConfig.pageSize || 1000
    });
    return rows.filter((row) => readField(row, "itemCode") && readField(row, "plant"));
  };

  const renderParts = (rows) => {
    if (!rows.length) {
      list.innerHTML = `<tr><td colspan="7">${t("incoming.noParts")}</td></tr>`;
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
        <td><input class="incoming-quantity" type="number" min="1" step="1" inputmode="numeric" aria-label="${escapeHtml(t("incoming.quantityAria", { code: text(readField(row, "itemCode")) }))}" ${selectedItems.has(text(readField(row, "itemCode"))) ? `value="${selectedItems.get(text(readField(row, "itemCode")))}" required` : "disabled"} /></td>
        <td><input class="incoming-select" id="incomingSelect${index}" type="checkbox" aria-label="${escapeHtml(t("incoming.selectAria", { code: text(readField(row, "itemCode")) }))}" data-item-code="${escapeHtml(text(readField(row, "itemCode")))}" data-name="${escapeHtml(text(readField(row, "nameVietnamese")))}" data-plant="${escapeHtml(text(readField(row, "plant")))}" ${selectedItems.has(text(readField(row, "itemCode"))) ? "checked" : ""} /></td>
      </tr>`;
    }).join("");
    loadImages();

    pagination.hidden = rows.length <= pageSize;
    pagination.innerHTML = `
      <span>${t("incoming.showing", { start: pageStart + 1, end: Math.min(pageStart + pageSize, rows.length), total: rows.length })}</span>
      <div class="repair-pagination-actions">
        <button class="repair-page-btn" type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i>${t("incoming.previous")}</button>
        <strong>${t("incoming.page", { current: currentPage, total: totalPages })}</strong>
        <button class="repair-page-btn" type="button" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>${t("incoming.next")}<i data-lucide="chevron-right"></i></button>
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
    const plants = [...new Set(spareRows.map((row) => text(readField(row, "plant"), t("incoming.unknownPlant"))))].sort((a, b) => a.localeCompare(b));
    plantFilter.innerHTML = `<option value="">${t("incoming.allPlants")}</option>`;
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
      [t("incoming.no")]: index + 1,
      [t("incoming.itemCode")]: item.itemCode,
      [t("incoming.nameVn")]: item.name,
      [t("incoming.plant")]: item.plant,
      [t("incoming.quantity")]: item.quantity
    })));
    worksheet["!cols"] = [{ wch: 7 }, { wch: 18 }, { wch: 34 }, { wch: 16 }, { wch: 12 }];
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, t("incoming.orderSummary"));
    const date = window.SAMHO_DATETIME.now().date;
    window.XLSX.writeFile(workbook, `incoming-stock-order_${date}.xlsx`);
  };

  exportButton.addEventListener("click", exportOrderSummary);

  const renderModal = () => {
    modalList.innerHTML = `<table class="repair-table incoming-summary-table"><thead><tr><th>${t("incoming.no")}</th><th>${t("incoming.itemCode")}</th><th>${t("incoming.nameVn")}</th><th>${t("incoming.plant")}</th><th>${t("incoming.quantity")}</th></tr></thead><tbody>${orderSummary.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.itemCode)}</strong></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.plant)}</td><td>${item.quantity}</td></tr>`).join("")}</tbody></table>`;
  };

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
    if (!selected.length) { setStatus(t("incoming.error.noSelection"), "error"); return; }
    if (selected.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) { setStatus(t("incoming.error.invalidQuantity"), "error"); return; }
    orderSummary = selected;
    renderModal();
    setStatus("");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    if (window.lucide) window.lucide.createIcons();
  });

  window.SAMHO_LOADING.show(t("incoming.loading"));
  fetchParts().then((rows) => { spareRows = rows; dataLoaded = true; populatePlants(); applyFilters(); setStatus(rows.length === 1 ? t("incoming.loaded.one") : t("incoming.loaded.many", { count: rows.length }), "success"); }).catch((error) => { list.innerHTML = `<tr><td colspan="7">${t("incoming.unableToLoad")}</td></tr>`; setStatus(window.SAMHO_ERRORS.message(error, t("incoming.action.load")), "error"); }).finally(() => { window.SAMHO_LOADING.hide(); });

  document.addEventListener("samho:langchange", () => {
    if (dataLoaded) renderParts(filteredRows);
    if (modal.classList.contains("active")) renderModal();
    if (window.lucide) window.lucide.createIcons();
  });
});
