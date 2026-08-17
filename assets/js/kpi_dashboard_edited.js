if (window.SAMHO_LANG) {
  window.SAMHO_LANG.register({
    "kpi.title": { vi: "Bảng điều khiển KPI", en: "KPI Monitoring Dashboard" },
    "kpi.subtitle": { vi: "Phân tích thời gian dừng theo thời gian thực", en: "Real-time downtime analysis" },
    "kpi.from": { vi: "Từ", en: "From" },
    "kpi.to": { vi: "Đến", en: "To" },
    "kpi.allPlants": { vi: "Tất cả nhà máy", en: "All Plants" },
    "kpi.summaryAria": { vi: "Tóm tắt KPI", en: "KPI summary" },
    "kpi.totalDowntime": { vi: "Tổng thời gian dừng", en: "Total Downtime" },
    "kpi.minutes": { vi: "phút", en: "minutes" },
    "kpi.loading": { vi: "Đang tải", en: "Loading" },
    "kpi.avgMttr": { vi: "MTTR trung bình", en: "Avg MTTR" },
    "kpi.min": { vi: "phút", en: "min" },
    "kpi.meanTimeToRepair": { vi: "Thời gian sửa chữa trung bình", en: "Mean Time to Repair" },
    "kpi.calculated": { vi: "Đã tính", en: "Calculated" },
    "kpi.avgMtbf": { vi: "MTBF trung bình", en: "Avg MTBF" },
    "kpi.meanTimeBetweenFailures": { vi: "Thời gian giữa các lần hỏng trung bình", en: "Mean Time Between Failures" },
    "kpi.totalErrors": { vi: "Tổng số lỗi", en: "Total Errors" },
    "kpi.errorEvents": { vi: "Số lần lỗi", en: "Error Events" },
    "kpi.loadingDowntime": { vi: "Đang tải dữ liệu thời gian dừng...", en: "Loading downtime data..." },
    "kpi.chartTotalDowntime": { vi: "Tổng thời gian dừng theo nhà máy", en: "Total Downtime by Plant" },
    "kpi.chartPlantAria": { vi: "Tổng thời gian dừng theo nhà máy", en: "Total downtime by plant" },
    "kpi.month.jan": { vi: "T1", en: "Jan" },
    "kpi.month.feb": { vi: "T2", en: "Feb" },
    "kpi.month.mar": { vi: "T3", en: "Mar" },
    "kpi.chartTop3": { vi: "Top 3 khu vực theo thời gian dừng", en: "Top 3 Areas by Downtime" },
    "kpi.chartTop5": { vi: "Top 5 số lần lỗi theo loại máy", en: "Top 5 Downtime Error Counts by Machine Type" },
    "kpi.chartMachineAria": { vi: "Tổng thời gian dừng theo máy", en: "Machine downtime totals" },
    "kpi.totalDowntimeColon": { vi: "Tổng thời gian dừng: --", en: "Total Downtime: --" },
    "kpi.machines": { vi: "-- máy", en: "-- machines" },
    "kpi.chartMttrMtbf": { vi: "Xu hướng MTTR & MTBF theo máy", en: "MTTR & MTBF Trends by Machine" },
    "kpi.legendDowntime": { vi: "Thời gian dừng (phút)", en: "Downtime (min)" },
    "kpi.legendMtbf": { vi: "MTBF (phút)", en: "MTBF (min)" },
    "kpi.legendMttr": { vi: "MTTR (phút)", en: "MTTR (min)" },
    "kpi.allData": { vi: "Tất cả dữ liệu", en: "All Data" },
    "kpi.unknown": { vi: "Không xác định", en: "Unknown" },
    "kpi.unknownMachine": { vi: "Máy không xác định", en: "Unknown machine" },
    "kpi.unknownPlant": { vi: "Nhà máy không xác định", en: "Unknown plant" },
    "kpi.records": { vi: "{count} bản ghi", en: "{count} records" },
    "kpi.statusDowntimeRows": { vi: "Số dòng thời gian dừng", en: "Downtime rows" },
    "kpi.statusNoData": { vi: "Không có dữ liệu", en: "No data" },
    "kpi.statusMinutes": { vi: "Phút", en: "Minutes" },
    "kpi.statusOperatingMin": { vi: "Phút vận hành", en: "Operating min" },
    "kpi.footerTotal": { vi: "Tổng thời gian dừng: {value} phút", en: "Total Downtime: {value} min" },
    "kpi.machinesCount": { vi: "{count} máy", en: "{count} machines" },
    "kpi.selectedMonth": { vi: "Tháng đã chọn", en: "Selected month" },
    "kpi.loaded": { vi: "Đã tải {count} bản ghi thời gian dừng cho {month}.", en: "Loaded {count} downtime records for {month}." },
    "kpi.errNoConfig": { vi: "Thiếu cấu hình bảng downtime trong supabase/config.js.", en: "Add downtime table settings in supabase/config.js." },
    "kpi.loadingDashboard": { vi: "Đang tải dữ liệu bảng KPI...", en: "Loading dashboard data..." },
    "kpi.action.loadData": { vi: "tải dữ liệu bảng KPI", en: "load dashboard data" },
    "kpi.action.loadMonths": { vi: "tải các tháng có sẵn", en: "load available months" },
    "kpi.noMonths": { vi: "Không có tháng", en: "No months" },
    "kpi.noMonthValues": { vi: "Không có giá trị tháng", en: "No month values" },
    "kpi.noVisibleRows": { vi: "Không có dòng hiển thị", en: "No visible rows" },
    "kpi.warnMonthEmpty": { vi: "Các dòng thời gian dừng hiển thị nhưng cột tháng đang trống.", en: "Downtime rows are visible, but the month column is empty." },
    "kpi.warnNoRows": { vi: "Supabase không trả về dòng thời gian dừng nào. Kiểm tra dữ liệu bảng hoặc policy RLS SELECT.", en: "No visible downtime rows returned from Supabase. Check table data or RLS SELECT policy." },
    "kpi.monthError": { vi: "Lỗi tháng", en: "Month error" },
    "kpi.monthLoadFailed": { vi: "Tải tháng thất bại", en: "Month load failed" },
    "kpi.hintSetFilters": { vi: "Đặt bộ lọc và bấm Tìm kiếm để tải dữ liệu.", en: "Set filters and click Search to load data." },
    "kpi.minTooltip": { vi: "{label}: {value} phút", en: "{label}: {value} min" },
    "kpi.legendTotalDowntime": { vi: "Tổng thời gian dừng", en: "Total downtime" },
    "kpi.failures": { vi: "{count} sự cố", en: "{count} failures" },
    "kpi.rank.viewPareto": { vi: "Xem Pareto nguyên nhân cho {section}", en: "View reason Pareto for {section}" },
    "kpi.rank.empty": { vi: "Không tìm thấy bản ghi thời gian dừng nào.", en: "No downtime records found." },
    "kpi.machine.empty": { vi: "Không có thời gian dừng máy.", en: "No machine downtime." },
    "kpi.monthly.empty": { vi: "Không có thời gian dừng hàng tháng.", en: "No monthly downtime." },
    "kpi.simple.empty": { vi: "Không có dữ liệu thời gian dừng.", en: "No downtime data." },
    "kpi.trend.empty": { vi: "Không có xu hướng MTTR/MTBF.", en: "No MTTR/MTBF trend." },
    "kpi.others": { vi: "Khác", en: "Others" },
    "kpi.pareto.title": { vi: "{section} — Pareto nguyên nhân", en: "{section} — Reason Pareto" },
    "kpi.pareto.subtitle": { vi: "{minutes} phút · {failures} sự cố", en: "{minutes} min · {failures} failures" },
    "kpi.pareto.eyebrow": { vi: "Phân tích downtime", en: "Downtime analysis" },
    "kpi.pareto.close": { vi: "Đóng", en: "Close" },
    "kpi.pareto.empty": { vi: "Không có dữ liệu nguyên nhân.", en: "No reason data." },
    "kpi.pareto.barTitle": { vi: "{label} · {count} sự cố", en: "{label} · {count} failures" },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const t = (id, vars) => (window.SAMHO_LANG ? window.SAMHO_LANG.t(id, vars) : "");
  const config = window.SAMHO_SUPABASE;
  const downtimeConfig = config?.downtime;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const colors = ["#2d75dc", "#d9364f", "#3f9b5f", "#6d35f2", "#ff8a2a"];
  const operatingHoursPerDay = 7.5;
  let activeMonth = "";
  let activePlant = "";
  let activeFromDate = "";
  let activeToDate = "";
  let lastRows = [];
  const plantFilterMap = { C2B: ["PLANT A", "PLANT B"], OS: ["PLANT H"], SF: ["PLANT E"], Treatment: ["PLANT D", "PLANT I"] };

  const text = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const setStatus = (message, type = "idle") => {
    const status = document.getElementById("kpiDataStatus");
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  const formatNumber = (value, digits = 0) =>
    Number(value || 0).toLocaleString("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    });

  const toNumber = (value) => {
    if (value == null || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const cleaned = String(value).replace(/,/g, "").trim();
    const number = Number.parseFloat(cleaned);
    return Number.isFinite(number) ? number : 0;
  };

  const parseDateTime = (value) => window.SAMHO_DATETIME.parse(value);

  const configuredColumn = (field) => downtimeConfig?.fieldMap?.[field] || "";

  const readField = (row, field) => {
    const columns = [].concat(configuredColumn(field) || []);
    const matched = columns.find((column) => column && row[column] != null);
    return matched ? row[matched] : "";
  };

  const getMonthOptionLabel = (month) => {
    if (/\d/.test(month.label)) return month.label;
    if (month.key.includes("-")) return `${month.label} ${month.key.slice(2, 4)}`;
    return month.label;
  };

  const normalizeMonth = (value) => {
    if (!value) return { key: "all", label: t("kpi.allData"), order: 99 };

    const raw = String(value).trim();

    const yyyymm = raw.match(/^(\d{4})-(\d{2})$/);
    if (yyyymm) {
      const year = Number(yyyymm[1]);
      const monthIndex = Number(yyyymm[2]) - 1;
      if (year && monthIndex >= 0 && monthIndex < 12) {
        return { key: raw, label: monthNames[monthIndex], order: monthIndex };
      }
    }

    const compactDate = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (compactDate) {
      const year = Number(compactDate[1]);
      const index = Number(compactDate[2]) - 1;
      if (year && index >= 0 && index < 12) {
        return { key: `${year}-${String(index + 1).padStart(2, "0")}`, label: monthNames[index], order: index };
      }
    }

    const monthYearMatch = raw.match(/^([A-Za-z]{3,})\s+(\d{2,4})$/);
    if (monthYearMatch) {
      const foundIndex = monthNames.findIndex((m) => m.toLowerCase() === monthYearMatch[1].toLowerCase().slice(0, 3));
      if (foundIndex >= 0) {
        let year = Number(monthYearMatch[2]);
        if (year < 100) year += 2000;
        return { key: `${year}-${String(foundIndex + 1).padStart(2, "0")}`, label: raw, order: foundIndex };
      }
    }

    const date = new Date(raw);
    if (!Number.isNaN(date.getTime()) && /\d{4}|\d{1,2}[/-]\d{1,2}/.test(raw)) {
      const index = date.getMonth();
      return { key: `${date.getFullYear()}-${String(index + 1).padStart(2, "0")}`, label: monthNames[index], order: index };
    }

    const lower = raw.toLowerCase();
    const foundIndex = monthNames.findIndex((month) => lower.includes(month.toLowerCase()));
    if (foundIndex >= 0) {
      const yearDigits = raw.match(/\b(20\d{2}|\d{2})\b/);
      if (yearDigits) {
        let year = Number(yearDigits[1]);
        if (year < 100) year += 2000;
        return { key: `${year}-${String(foundIndex + 1).padStart(2, "0")}`, label: raw, order: foundIndex };
      }
      return { key: monthNames[foundIndex], label: monthNames[foundIndex], order: foundIndex };
    }

    const monthNumber = Number.parseInt(raw, 10);
    if (monthNumber >= 1 && monthNumber <= 12) {
      return { key: monthNames[monthNumber - 1], label: monthNames[monthNumber - 1], order: monthNumber - 1 };
    }

    return { key: raw, label: raw, order: 98 };
  };

  const getMonthDateRange = (monthValue) => {
    const month = normalizeMonth(monthValue);
    if (!month.key || month.key === "all" || !month.key.includes("-")) return null;
    const [year, monthNumber] = month.key.split("-").map(Number);
    if (!year || !monthNumber) return null;
    return {
      start: new Date(Date.UTC(year, monthNumber - 1, 1)),
      end: new Date(Date.UTC(year, monthNumber, 1))
    };
  };

  const monthKeyFromDate = (date) => window.SAMHO_DATETIME.monthKey(date);

  const rowMonth = (row) => {
    const rawMonth = readField(row, "month") || row[configuredColumn("month")];
    if (rawMonth) return normalizeMonth(rawMonth);
    const dt = parseDateTime(row.start_datetime);
    if (!dt) return { key: "all", label: t("kpi.allData"), order: 99 };
    const index = dt.getMonth();
    return { key: monthKeyFromDate(dt), label: monthNames[index], order: index };
  };

  const getOperationDaysMonSat = (monthValue) => {
    const range = getMonthDateRange(monthValue);
    if (!range) return 0;

    let days = 0;
    for (let date = new Date(range.start); date < range.end; date.setUTCDate(date.getUTCDate() + 1)) {
      if (date.getUTCDay() !== 0) days += 1;
    }

    return days;
  };

  const getScheduledProductionMinutes = (monthValue, uniqueItemCount) => {
    const operationDays = getOperationDaysMonSat(monthValue);
    return uniqueItemCount * operationDays * operatingHoursPerDay * 60;
  };

  const getOperatingMinutes = (monthValue, uniqueItemCount, totalDowntime) => {
    const scheduledProductionMinutes = getScheduledProductionMinutes(monthValue, uniqueItemCount);
    return Math.max(scheduledProductionMinutes - totalDowntime, 0);
  };

  const getRows = async (monthValue = activeMonth, plantValue = activePlant) => {
    const monthColumn = configuredColumn("month");
    const selectedColumns = Array.from(
      new Set(
        Object.values(downtimeConfig.fieldMap)
          .flatMap((value) => [].concat(value || []))
          .filter(Boolean)
          .filter((column) => column !== monthColumn)
      )
    );

    const dateColumn = "start_datetime";
    if (!selectedColumns.includes(dateColumn)) {
      selectedColumns.push(dateColumn);
    }

    const where = {};
    const plantColumn = configuredColumn("plant");
    if (plantColumn && plantValue) {
      const mappedPlants = plantFilterMap[plantValue];
      where[plantColumn] = mappedPlants || plantValue;
    }

    const allRows = await window.SAMHO_DB.select(downtimeConfig.table, {
      columns: selectedColumns.join(",") || "*",
      where
    });
    const dateRangeActive = Boolean(activeFromDate || activeToDate);
    if (monthColumn && monthValue && !dateRangeActive) {
      return allRows.filter((row) => rowMonth(row).key === monthValue);
    }
    return allRows;
  };

  const getAvailableMonths = async () => {
    const rows = await window.SAMHO_DB.select(downtimeConfig.table, {
      columns: "start_datetime",
      where: { start_datetime: "not.is.null" }
    });
    const months = new Map();
    rows.forEach((row) => {
      const month = rowMonth(row);
      if (month.key === "all" || !month.key.includes("-")) return;
      months.set(month.key, {
        value: month.key,
        key: month.key,
        label: getMonthOptionLabel(month),
        order: month.order,
        year: Number(month.key.slice(0, 4))
      });
    });

    return Array.from(months.values()).sort((a, b) => b.year - a.year || b.order - a.order);
  };

  const getMonthsFromRows = (rows) => {
    const months = new Map();
    rows.forEach((row) => {
      const month = rowMonth(row);
      if (month.key === "all" || !month.key.includes("-")) return;
      months.set(month.key, {
        value: month.key,
        key: month.key,
        label: getMonthOptionLabel(month),
        order: month.order,
        year: Number(month.key.slice(0, 4))
      });
    });

    return Array.from(months.values()).sort((a, b) => b.year - a.year || b.order - a.order);
  };

  const groupSum = (rows, getKey) => {
    const groups = new Map();
    rows.forEach((row) => {
      const key = getKey(row) || t("kpi.unknown");
      const current = groups.get(key) || { label: key, total: 0, count: 0 };
      current.total += row.downtime;
      current.count += 1;
      groups.set(key, current);
    });
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  };

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  const closeParetoModal = () => {
    document.getElementById("paretoModal")?.classList.remove("active");
  };

  const openParetoModal = (section) => {
    const modal = ensureParetoModal();
    const sectionRows = lastRows.filter((row) => row.section === section);
    const reasons = buildReasonBuckets(sectionRows);
    const total = reasons.reduce((sum, bucket) => sum + bucket.total, 0);
    const count = reasons.reduce((sum, bucket) => sum + bucket.count, 0);

    modal.querySelector("#paretoTitle").textContent = t("kpi.pareto.title", { section });
    modal.querySelector("#paretoSubtitle").textContent = t("kpi.pareto.subtitle", { minutes: formatNumber(total), failures: formatNumber(count) });
    renderParetoChart(modal, reasons);
    if (window.lucide) window.lucide.createIcons();
    modal.classList.add("active");
    modal.querySelector(".repair-modal-close")?.focus();
  };

  const buildReasonBuckets = (rows) => {
    const groups = new Map();
    rows.forEach((row) => {
      const raw = String(readField(row.raw, "reason") || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase().replace(/\s+/g, " ");
      const group = groups.get(key) || { key, total: 0, count: 0, variants: new Map() };
      group.total += row.downtime;
      group.count += 1;
      group.variants.set(raw, (group.variants.get(raw) || 0) + 1);
      groups.set(key, group);
    });

    return Array.from(groups.values())
      .map((group) => {
        let label = group.raw;
        let best = 0;
        group.variants.forEach((count, text) => {
          if (count > best) {
            best = count;
            label = text;
          }
        });
        return { label, total: group.total, count: group.count };
      })
      .sort((a, b) => b.total - a.total);
  };

  const FULL_PARETO_BARS = 8;

  const renderParetoChart = (modal, buckets) => {
    const container = modal.querySelector("#paretoChart");
    if (!container) return;

    if (!buckets.length) {
      container.innerHTML = `<p class="kpi-empty">${t("kpi.pareto.empty")}</p>`;
      return;
    }

    const top = buckets.slice(0, FULL_PARETO_BARS);
    const rest = buckets.slice(FULL_PARETO_BARS);
    if (rest.length) {
      top.push({
        label: t("kpi.others"),
        total: rest.reduce((sum, bucket) => sum + bucket.total, 0),
        count: rest.reduce((sum, bucket) => sum + bucket.count, 0),
        others: true
      });
    }

    const total = top.reduce((sum, bucket) => sum + bucket.total, 0) || 1;
    const max = Math.max(...top.map((bucket) => bucket.total), 1);

    let running = 0;
    const plotted = top.map((bucket) => {
      running += bucket.total / total;
      return {
        ...bucket,
        height: Math.max((bucket.total / max) * 100, bucket.total > 0 ? 4 : 0),
        sharePct: Math.min(running * 100, 100)
      };
    });

    const barCount = plotted.length;
    const linePoints = plotted.map((bucket, index) => `${((index + 0.5) / barCount) * 100},${100 - bucket.sharePct}`).join(" ");

    const bars = plotted
      .map(
        (bucket) => `
          <div class="pareto-bar${bucket.others ? " others" : ""}" style="--h:${bucket.height}%">
            <b title="${escapeHtml(t("kpi.pareto.barTitle", { label: bucket.label, count: formatNumber(bucket.count) }))}"></b>
            <span class="pareto-value">${formatNumber(bucket.total)}</span>
            <label>${escapeHtml(bucket.label.length > 28 ? `${bucket.label.slice(0, 28)}…` : bucket.label)}</label>
          </div>
        `
      )
      .join("");

    container.innerHTML = `
      <div class="pareto-layout">
        <div class="pareto-plot">
          <div class="pareto-bars" style="--cols:${barCount}">${bars}</div>
          <svg class="pareto-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line class="pareto-ref" x1="0" y1="20" x2="100" y2="20"></line>
            <polyline class="pareto-cumline" points="${linePoints}"></polyline>
          </svg>
        </div>
        <div class="pareto-axis">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>
    `;
  };

  const ensureParetoModal = () => {
    let modal = document.getElementById("paretoModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "repair-modal pareto-modal";
    modal.id = "paretoModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="repair-modal-backdrop" data-close-pareto></div>
      <div class="repair-modal-dialog repair-modal-dialog-wide" aria-labelledby="paretoTitle">
        <header class="repair-modal-header">
          <div>
            <span id="paretoEyebrow">${t("kpi.pareto.eyebrow")}</span>
            <h2 id="paretoTitle"></h2>
          </div>
          <button class="repair-modal-close" type="button" data-close-pareto aria-label="${t("kpi.pareto.close")}">
            <i data-lucide="x"></i>
          </button>
        </header>
        <p class="repair-modal-note pareto-subtitle" id="paretoSubtitle"></p>
        <div id="paretoChart"></div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll("[data-close-pareto]").forEach((button) => {
      button.addEventListener("click", () => modal.classList.remove("active"));
    });

    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  const renderRankList = (items) => {
    const container = document.getElementById("sectionRankList");
    if (!container) return;
    const top = items.slice(0, 3);
    const max = top[0]?.total || 1;

    container.innerHTML =
      top
        .map(
          (item, index) => `
            <div class="rank-row" data-section="${escapeHtml(item.label)}" role="button" tabindex="0" aria-label="${escapeHtml(t("kpi.rank.viewPareto", { section: item.label }))}">
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <small>${t("kpi.failures", { count: item.count })}</small>
                <b style="--w: ${Math.max((item.total / max) * 100, 4)}%"></b>
              </div>
              <em>${formatNumber(item.total)} ${t("kpi.min")}</em>
              <i data-lucide="chevron-right" class="rank-hint"></i>
            </div>
          `
        )
        .join("") || `<p class="kpi-empty">${t("kpi.rank.empty")}</p>`;

    container.querySelectorAll(".rank-row").forEach((row) => {
      row.addEventListener("click", () => openParetoModal(row.dataset.section));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openParetoModal(row.dataset.section);
        }
      });
    });
    if (window.lucide) window.lucide.createIcons();
  };

  const renderMachineBars = (items) => {
    const container = document.getElementById("machineDowntimeBars");
    if (!container) return;
    const top = items.slice(0, 5);
    const max = Math.max(...top.map((item) => item.count), 1);

    container.innerHTML =
      top
        .map((item, index) => {
          const height = Math.max((item.count / max) * 88, 12);
          const label = item.label.length > 22 ? `${item.label.slice(0, 22)}...` : item.label;
          const barColor = index === 2 ? "#3f9b5f" : index === 3 ? "#2d75dc" : "#d9364f";
          return `<div style="--h: ${height}%; --bar: ${barColor}" data-value="${formatNumber(item.count)}"><b></b><span>${label}</span></div>`;
        })
        .join("") || `<p class="kpi-empty">${t("kpi.machine.empty")}</p>`;
  };

  const renderMonthlyChart = (months, sections) => {
    const container = document.getElementById("monthlyDowntimeChart");
    const legend = document.getElementById("monthlyLegend");
    if (!container || !legend) return;

    const topSections = sections.slice(0, 5);
    const max = Math.max(...topSections.flatMap((section) => months.map((month) => section.months.get(month.key) || 0)), 1);

    container.innerHTML =
      topSections
        .map((section) => {
          const topValue = Math.max(...months.map((month) => section.months.get(month.key) || 0), 0);
          const bars = months
            .map((month, index) => {
              const value = section.months.get(month.key) || 0;
              const height = Math.max((value / max) * 92, value > 0 ? 8 : 0);
              return `<b style="--h: ${height}%; background: ${colors[index % colors.length]}" title="${t("kpi.minTooltip", { label: month.label, value: formatNumber(value) })}"></b>`;
            })
            .join("");
          return `<div class="cluster" data-label="${section.label}"><span class="value-badge">${formatNumber(topValue)} ${t("kpi.min")}</span>${bars}</div>`;
        })
        .join("") || `<p class="kpi-empty">${t("kpi.monthly.empty")}</p>`;

    legend.innerHTML = months
      .map((month, index) => `<span><b style="background: ${colors[index % colors.length]}"></b>${month.label}</span>`)
      .join("");
  };

  const renderSimplePlantChart = (plants) => {
    const container = document.getElementById("monthlyDowntimeChart");
    const legend = document.getElementById("monthlyLegend");
    if (!container || !legend) return;

    const top = plants.slice(0, 5);
    const max = Math.max(...top.map((p) => p.total), 1);

    container.innerHTML = top
      .map((plant, index) => {
        const height = Math.max((plant.total / max) * 88, plant.total > 0 ? 8 : 0);
        return `<div class="cluster" data-label="${plant.label}"><span class="value-badge">${formatNumber(plant.total)} ${t("kpi.min")}</span><b style="--h: ${height}%; background: ${colors[index % colors.length]}" title="${t("kpi.minTooltip", { label: plant.label, value: formatNumber(plant.total) })}"></b></div>`;
      })
      .join("") || `<p class="kpi-empty">${t("kpi.simple.empty")}</p>`;

    legend.innerHTML = `<span><b style="background:${colors[0]}"></b>${t("kpi.legendTotalDowntime")}</span>`;
  };

  const renderMetricTrend = (items, operationDays) => {
    const container = document.getElementById("monthlyTrendBars");
    const lines = document.getElementById("comboLines");
    if (!container) return;
    if (lines) lines.innerHTML = "";

    const top = items.slice(0, 3);
    const maxDowntime = Math.max(...top.map((item) => item.total), 1);
    const mttrValues = top.map((item) => (item.count ? item.total / item.count : 0));
    const mtbfValues = top.map((item) => (item.count ? Math.max(operationDays * operatingHoursPerDay * 60 - item.total, 0) / item.count : 0));
    const maxMetric = Math.max(...mttrValues, ...mtbfValues, 1);
    const getMetricY = (value) => 84 - Math.max((value / maxMetric) * 58, value > 0 ? 8 : 0);

    container.innerHTML =
      top
        .map((item, index) => {
          const height = Math.max((item.total / maxDowntime) * 88, item.total > 0 ? 10 : 0);
          const mttr = mttrValues[index];
          const mtbf = mtbfValues[index];
          const mttrY = getMetricY(mttr);
          const mtbfY = getMetricY(mtbf);
          const label = item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label;
          return `
            <div data-label="${label}" data-top="${formatNumber(item.total)}">
              <b style="--h: ${height}%"></b>
              <span class="mtbf-point" style="--y: ${mtbfY}%">${formatNumber(mtbf, 0)}</span>
              <span class="mttr-point" style="--y: ${mttrY}%">${formatNumber(mttr, 0)}</span>
            </div>
          `;
        })
        .join("") || `<p class="kpi-empty">${t("kpi.trend.empty")}</p>`;

    if (lines && top.length > 1) {
      const xPositions = top.map((_, index) => (top.length === 1 ? 50 : 16 + index * (68 / (top.length - 1))));
      const mtbfPoints = mtbfValues.map((value, index) => `${xPositions[index]},${getMetricY(value)}`);
      const mttrPoints = mttrValues.map((value, index) => `${xPositions[index]},${getMetricY(value)}`);
      lines.innerHTML = `
        <polyline points="${mtbfPoints.join(" ")}" class="mtbf-line"></polyline>
        <polyline points="${mttrPoints.join(" ")}" class="mttr-line"></polyline>
      `;
    }
  };

  const applyDateFilter = (rows) => {
    if (!activeFromDate && !activeToDate) return rows;
    const fromDate = activeFromDate ? new Date(activeFromDate + "T00:00:00") : null;
    const toDate = activeToDate ? new Date(activeToDate + "T23:59:59") : null;
    return rows.filter((row) => {
      const dt = parseDateTime(row.start_datetime);
      if (!dt) return !fromDate && !toDate;
      if (fromDate && dt < fromDate) return false;
      if (toDate && dt > toDate) return false;
      return true;
    });
  };

  const renderDashboard = (sourceRows) => {
    const rows = sourceRows
      .map((row) => {
        const month = rowMonth(row);
        return {
          raw: row,
          downtime: toNumber(readField(row, "totalDowntime")),
          errorCount: toNumber(readField(row, "errorCount")),
          mttr: toNumber(readField(row, "mttr")),
          mtbf: toNumber(readField(row, "mtbf")),
          itemCode: readField(row, "itemCode") || t("kpi.unknownMachine"),
          machineName: readField(row, "machineName") || readField(row, "itemCode") || t("kpi.unknownMachine"),
          section: readField(row, "section") || t("kpi.unknown"),
          plant: readField(row, "plant") || t("kpi.unknownPlant"),
          month
        };
      })
      .sort((a, b) => a.month.order - b.month.order || b.downtime - a.downtime);

    lastRows = rows;

    const totalDowntime = rows.reduce((sum, row) => sum + row.downtime, 0);
    const rowCount = rows.length;
    const totalErrors = rowCount;
    const uniqueItemCount = new Set(rows.map((row) => row.itemCode).filter(Boolean)).size;
    let operationDays;
    if (activeFromDate || activeToDate) {
      const start = activeFromDate ? new Date(activeFromDate + "T00:00:00") : new Date(0);
      const end = activeToDate ? new Date(activeToDate + "T00:00:00") : new Date();
      operationDays = countWeekdaysMonSat(start, end);
    } else {
      operationDays = getOperationDaysMonSat(activeMonth);
    }
    const scheduledMinutes = uniqueItemCount * operationDays * operatingHoursPerDay * 60;
    const operatingMinutes = Math.max(scheduledMinutes - totalDowntime, 0);
    const avgMttr = totalErrors ? totalDowntime / totalErrors : 0;
    const avgMtbf =
      configuredColumn("mtbf") && rows.some((row) => row.mtbf)
        ? rows.reduce((sum, row) => sum + row.mtbf, 0) / rows.filter((row) => row.mtbf).length
        : totalErrors
          ? operatingMinutes / totalErrors
          : 0;

    const monthMap = new Map();
    rows.forEach((row) => {
      const current = monthMap.get(row.month.key) || { ...row.month, total: 0 };
      current.total += row.downtime;
      monthMap.set(row.month.key, current);
    });
    const months = Array.from(monthMap.values()).sort((a, b) => a.order - b.order);

    const sectionGroups = groupSum(rows, (row) => row.section);
    const plantGroups = groupSum(rows, (row) => row.plant);
    const plantMonthGroups = plantGroups.map((plant) => {
      const plantRows = rows.filter((row) => row.plant === plant.label);
      return {
        ...plant,
        months: new Map(months.map((month) => [month.key, plantRows.filter((row) => row.month.key === month.key).reduce((sum, row) => sum + row.downtime, 0)]))
      };
    });
    const machineGroups = groupSum(rows, (row) => row.machineName);

    text("totalDowntime", formatNumber(totalDowntime));
    text("avgMttr", formatNumber(avgMttr, 1));
    text("avgMtbf", formatNumber(avgMtbf, 0));
    text("totalErrors", formatNumber(totalErrors));
    text("downtimePeriod", t("kpi.records", { count: formatNumber(rows.length) }));
    text("errorStatus", rows.length ? t("kpi.statusDowntimeRows") : t("kpi.statusNoData"));
    text("mttrStatus", rows.length ? t("kpi.statusMinutes") : t("kpi.statusNoData"));
    text("mtbfStatus", rows.length ? (configuredColumn("mtbf") ? t("kpi.statusMinutes") : t("kpi.statusOperatingMin")) : t("kpi.statusNoData"));
    text("machineFooterTotal", t("kpi.footerTotal", { value: formatNumber(totalDowntime) }));
    text("machineFooterCount", t("kpi.machinesCount", { count: formatNumber(machineGroups.length) }));
    const activeLabel = document.getElementById("monthFilterLabel")?.textContent || t("kpi.selectedMonth");
    text("kpiSubtitle", t("kpi.subtitle"));

    renderRankList(sectionGroups);
    renderMachineBars(machineGroups);
    if (activeFromDate || activeToDate) {
      renderSimplePlantChart(plantGroups);
    } else {
      renderMonthlyChart(months, plantMonthGroups);
    }
    renderMetricTrend(machineGroups, operationDays);

    setStatus(
      t("kpi.loaded", { count: formatNumber(rows.length), month: activeLabel }),
      rows.length ? "success" : "warning"
    );
  };

  const fetchAndRender = async (monthValue = activeMonth, plantValue = activePlant) => {
    if (!downtimeConfig?.table) {
      setStatus(t("kpi.errNoConfig"), "error");
      return;
    }

    try {
      closeParetoModal();
      setStatus(t("kpi.loadingDowntime"), "idle");
      window.SAMHO_LOADING.show(t("kpi.loadingDashboard"));
      const rows = await getRows(monthValue, plantValue);
      const filteredRows = applyDateFilter(rows);
      renderDashboard(filteredRows);
    } catch (error) {
      setStatus(window.SAMHO_ERRORS.message(error, t("kpi.action.loadData")), "error");
    } finally {
      window.SAMHO_LOADING.hide();
    }
  };

  const renderMonthOptions = (months, emptyLabel = t("kpi.noMonths")) => {
    const button = document.getElementById("monthFilterButton");
    const menu = document.getElementById("monthFilterMenu");
    const label = document.getElementById("monthFilterLabel");
    if (!button || !menu || !label) return;

    if (!months.length) {
      activeMonth = "";
      label.textContent = emptyLabel;
      button.disabled = true;
      menu.innerHTML = `<button type="button" disabled>${emptyLabel}</button>`;
      return;
    }

    activeMonth = months[0].value;
    label.textContent = months[0].label;
    button.disabled = false;
    menu.innerHTML = months
      .map((month, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-month-value="${month.value}">${month.label}</button>`)
      .join("");

    menu.querySelectorAll("[data-month-value]").forEach((item) => {
      item.addEventListener("click", () => {
        activeMonth = item.dataset.monthValue || "";
        label.textContent = item.textContent.trim();
        menu.querySelectorAll("[data-month-value]").forEach((buttonItem) => buttonItem.classList.toggle("active", buttonItem === item));
        closeMonthMenu();
      });
    });
  };

  let closeMonthMenu;
  let closePlantMenu;

  const initMonthFilter = async () => {
    const button = document.getElementById("monthFilterButton");
    const menu = document.getElementById("monthFilterMenu");
    const label = document.getElementById("monthFilterLabel");
    if (!button || !menu || !label) return;

    closeMonthMenu = () => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.closest(".month-filter")?.classList.remove("open");
    };

    const openMenu = () => {
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.closest(".month-filter")?.classList.add("open");
    };

    button.addEventListener("click", () => {
      if (button.disabled) return;
      if (menu.hidden) {
        openMenu();
        return;
      }
      closeMonthMenu();
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden || button.contains(event.target) || menu.contains(event.target)) return;
      closeMonthMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || menu.hidden) return;
      closeMonthMenu();
      button.focus();
    });

    await loadMonthsAndFetch();
  };

  const loadMonthsAndFetch = async () => {
    const button = document.getElementById("monthFilterButton");
    const menu = document.getElementById("monthFilterMenu");
    const label = document.getElementById("monthFilterLabel");
    if (!button || !menu || !label) return;

    try {
      let months = await getAvailableMonths();
      let fallbackRows = [];
      if (!months.length) {
        fallbackRows = await getRows("");
        months = getMonthsFromRows(fallbackRows);
      }

      if (!months.length) {
        renderMonthOptions(months, fallbackRows.length ? t("kpi.noMonthValues") : t("kpi.noVisibleRows"));
        renderDashboard([]);
        setStatus(
          fallbackRows.length
            ? t("kpi.warnMonthEmpty")
            : t("kpi.warnNoRows"),
          "warning"
        );
      } else {
        renderMonthOptions(months);
      }
    } catch (error) {
      label.textContent = t("kpi.monthError");
      button.disabled = true;
      menu.innerHTML = `<button type="button" disabled>${t("kpi.monthLoadFailed")}</button>`;
      setStatus(window.SAMHO_ERRORS.message(error, t("kpi.action.loadMonths")), "error");
      return;
    }

    setStatus(t("kpi.hintSetFilters"), "idle");
  };

  const countWeekdaysMonSat = (start, end) => {
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) days += 1;
    }
    return days;
  };

  const initPlantFilter = () => {
    const button = document.getElementById("plantFilterButton");
    const menu = document.getElementById("plantFilterMenu");
    const label = document.getElementById("plantFilterLabel");
    if (!button || !menu || !label) return;

    closePlantMenu = () => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.closest(".plant-filter")?.classList.remove("open");
    };

    const openMenu = () => {
      menu.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.closest(".plant-filter")?.classList.add("open");
    };

    button.addEventListener("click", () => {
      if (menu.hidden) {
        openMenu();
        return;
      }
      closePlantMenu();
    });

    menu.querySelectorAll("[data-plant-value]").forEach((item) => {
      item.addEventListener("click", () => {
        const value = item.dataset.plantValue || "";
        activePlant = value;
        label.textContent = item.textContent.trim();
        menu.querySelectorAll("[data-plant-value]").forEach((btn) => btn.classList.toggle("active", btn === item));
        closePlantMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden || button.contains(event.target) || menu.contains(event.target)) return;
      closePlantMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || menu.hidden) return;
      closePlantMenu();
      button.focus();
    });
  };

  const initDateFilter = () => {
    const fromInput = document.getElementById("kpiFromDate");
    const toInput = document.getElementById("kpiToDate");
    const searchBtn = document.getElementById("kpiDateSearch");
    if (!fromInput || !toInput || !searchBtn) return;

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    fromInput.value = window.SAMHO_DATETIME.toInputDate(firstOfMonth);
    toInput.value = window.SAMHO_DATETIME.toInputDate(today);
    activeFromDate = fromInput.value;
    activeToDate = toInput.value;

    const applyDateRange = () => {
      activeFromDate = fromInput.value;
      activeToDate = toInput.value;
      fetchAndRender(activeMonth, activePlant);
    };

    searchBtn.addEventListener("click", applyDateRange);
  };

  initDateFilter();
  initPlantFilter();
  initMonthFilter();

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeParetoModal();
  });

  fetchAndRender(activeMonth, activePlant);

  document.addEventListener("samho:langchange", () => {
    const plantLabel = document.getElementById("plantFilterLabel");
    const activePlantButton = document.querySelector('#plantFilterMenu [data-plant-value].active');
    if (plantLabel && activePlantButton) {
      plantLabel.textContent = activePlantButton.textContent.trim();
    }
    renderDashboard(lastRows);
  });
});
