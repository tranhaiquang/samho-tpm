document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const config = window.SAMHO_SUPABASE;
  const filterForm = document.getElementById("repairInfoFilter");
  const list = document.getElementById("repairList");
  const status = document.getElementById("repairInfoStatus");
  const searchButton = document.getElementById("repairInfoSearch");

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
        Authorization: `Bearer ${config.anonKey}`
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

  const createDetail = (label, value) => `
    <div>
      <span>${label}:</span>
      <strong>${value || "-"}</strong>
    </div>
  `;

  const getRecordValue = (record, names) => {
    const name = names.find((key) => record?.[key] != null);
    return name ? record[name] : "";
  };

  const renderRecords = (records, machineMap) => {
    list.innerHTML = "";

    if (!records.length) {
      list.innerHTML = `<article class="repair-empty">Không có dữ liệu trong khoảng ngày đã chọn.</article>`;
      return;
    }

    records.forEach((record) => {
      const itemCode = getRecordValue(record, ["machine_id", "item_code", "ITEM_CODE"]);
      const machine = machineMap.get(itemCode) || record;
      const reportedAt = getRecordValue(record, ["reported_at"]);
      const repairedAt = getRecordValue(record, ["repaired_at", "repair_finished_at", "finished_at"]);
      const isDone = !!repairedAt;
      const issue = record.issue === "Khác" && record.other_issue ? record.other_issue : record.issue;

      const card = document.createElement("article");
      card.className = "repair-card";
      card.innerHTML = `
        <div class="repair-card-head">
          <div>
            <span>Broken ID:</span>
            <strong>${record.id || "-"}</strong>
          </div>
          <div class="repair-machine">
            <strong>${itemCode || "-"}</strong>
            <span>${getMachineValue(machine, "machineName") || "-"}</span>
          </div>
          <div class="repair-status">
            <span>Status:</span>
            <strong class="${isDone ? "done" : "pending"}">${isDone ? "Hoàn thành" : "Chưa xong"}</strong>
          </div>
        </div>
        <div class="repair-card-body">
          ${createDetail("Place1", getMachineValue(machine, "machineLine"))}
          ${createDetail("Place2", getMachineValue(machine, "machinePlant"))}
          ${createDetail("Place3", getMachineValue(machine, "machineSection"))}
          ${createDetail("Issue", issue)}
          ${createDetail("Reason", record.reason)}
          ${createDetail("Solve", record.solve)}
          ${createDetail("Ngày hư", formatCompactDate(reportedAt))}
          ${createDetail("Ngày sửa", formatCompactDate(repairedAt))}
          ${createDetail("Hoàn thành", isDone ? formatCompactDate(repairedAt) : "")}
          ${createDetail("Mechanic", record.technician)}
        </div>
      `;
      list.appendChild(card);
    });
  };

  const searchRecords = async () => {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    if (!fromDate || !toDate) {
      setStatus("Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.", "warning");
      return;
    }

    if (fromDate > toDate) {
      setStatus("Ngày bắt đầu không được lớn hơn ngày kết thúc.", "warning");
      return;
    }

    searchButton.disabled = true;
    setStatus("Đang tìm kiếm...", "loading");

    try {
      const records = await fetchRepairRecords(fromDate, toDate);
      const machines = await fetchMachines(records.map((record) => getRecordValue(record, ["machine_id", "item_code", "ITEM_CODE"])));
      renderRecords(records, machines);
      setStatus(`Tìm thấy ${records.length} phiếu sửa chữa.`, "success");
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
