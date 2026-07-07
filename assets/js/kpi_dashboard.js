document.addEventListener("DOMContentLoaded", () => {
  const config = window.SAMHO_SUPABASE;
  const downtimeConfig = config?.downtime;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const colors = ["#2d75dc", "#d9364f", "#3f9b5f", "#6d35f2", "#ff8a2a"];
  const operatingHoursPerDay = 7.5;
  let activeMonth = "";

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

  const configuredColumn = (field) => downtimeConfig?.fieldMap?.[field] || "";

  const readField = (row, field) => {
    const columns = [].concat(configuredColumn(field) || []);
    const matched = columns.find((column) => column && row[column] != null);
    return matched ? row[matched] : "";
  };

  const getMonthOptionLabel = (month) => {
    if (month.key.includes("-")) return `${month.label} ${month.key.slice(0, 4)}`;
    return month.label;
  };

  const normalizeMonth = (value) => {
    if (!value) return { key: "all", label: "All Data", order: 99 };

    const raw = String(value).trim();
    const compactDate = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (compactDate) {
      const year = Number(compactDate[1]);
      const index = Number(compactDate[2]) - 1;
      if (year && index >= 0 && index < 12) {
        return { key: `${year}-${String(index + 1).padStart(2, "0")}`, label: monthNames[index], order: index };
      }
    }

    const date = new Date(raw);
    if (!Number.isNaN(date.getTime()) && /\d{4}|\d{1,2}[/-]\d{1,2}/.test(raw)) {
      const index = date.getMonth();
      return { key: `${date.getFullYear()}-${String(index + 1).padStart(2, "0")}`, label: monthNames[index], order: index };
    }

    const lower = raw.toLowerCase();
    const foundIndex = monthNames.findIndex((month) => lower.includes(month.toLowerCase()));
    if (foundIndex >= 0) return { key: monthNames[foundIndex], label: monthNames[foundIndex], order: foundIndex };

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

  const getRows = async (monthValue = activeMonth) => {
    const selectedColumns = Array.from(
      new Set(
        Object.values(downtimeConfig.fieldMap)
          .flatMap((value) => [].concat(value || []))
          .filter(Boolean)
      )
    );

    const params = new URLSearchParams({
      select: selectedColumns.join(",") || "*",
      limit: "5000"
    });
    const monthColumn = configuredColumn("month");
    if (monthColumn && monthValue) {
      params.set(monthColumn, `eq.${monthValue}`);
    }

    return fetchPagedDowntime(params);
  };

  const fetchPagedDowntime = async (params, pageSize = 1000) => {
    const allRows = [];
    let offset = 0;

    while (true) {
      const pageParams = new URLSearchParams(params);
      pageParams.set("limit", String(pageSize));
      pageParams.set("offset", String(offset));

      const response = await fetch(`${config.url}/${downtimeConfig.table}?${pageParams}`, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          ...window.SAMHO_AUTH.authHeaders()
        }
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Downtime fetch failed (${response.status}).`);
      }

      const rows = await response.json();
      allRows.push(...rows);
      if (rows.length < pageSize) return allRows;
      offset += pageSize;
    }
  };

  const getAvailableMonths = async () => {
    const monthColumn = configuredColumn("month");
    if (!monthColumn) return [];

    const params = new URLSearchParams({
      select: monthColumn,
      order: `${monthColumn}.desc`
    });
    params.set(monthColumn, "not.is.null");

    const rows = await fetchPagedDowntime(params);
    const months = new Map();
    rows.forEach((row) => {
      const month = normalizeMonth(row[monthColumn]);
      if (month.key === "all") return;
      months.set(String(row[monthColumn]), {
        value: String(row[monthColumn]),
        key: month.key,
        label: getMonthOptionLabel(month),
        order: month.order,
        year: month.key.includes("-") ? Number(month.key.slice(0, 4)) : 0
      });
    });

    return Array.from(months.values()).sort((a, b) => b.year - a.year || b.order - a.order);
  };

  const getMonthsFromRows = (rows) => {
    const monthColumn = configuredColumn("month");
    const months = new Map();
    rows.forEach((row) => {
      const rawValue = readField(row, "month") || row[monthColumn];
      if (rawValue == null || rawValue === "") return;
      const month = normalizeMonth(rawValue);
      if (month.key === "all") return;
      months.set(String(rawValue), {
        value: String(rawValue),
        key: month.key,
        label: getMonthOptionLabel(month),
        order: month.order,
        year: month.key.includes("-") ? Number(month.key.slice(0, 4)) : 0
      });
    });

    return Array.from(months.values()).sort((a, b) => b.year - a.year || b.order - a.order);
  };

  const groupSum = (rows, getKey) => {
    const groups = new Map();
    rows.forEach((row) => {
      const key = getKey(row) || "Unknown";
      const current = groups.get(key) || { label: key, total: 0, count: 0 };
      current.total += row.downtime;
      current.count += 1;
      groups.set(key, current);
    });
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
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
            <div class="rank-row">
              <span>${index + 1}</span>
              <div>
                <strong>${item.label}</strong>
                <small>${item.count} failures</small>
                <b style="--w: ${Math.max((item.total / max) * 100, 4)}%"></b>
              </div>
              <em>${formatNumber(item.total)} min</em>
            </div>
          `
        )
        .join("") || `<p class="kpi-empty">No downtime records found.</p>`;
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
        .join("") || `<p class="kpi-empty">No machine downtime.</p>`;
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
              return `<b style="--h: ${height}%; background: ${colors[index % colors.length]}" title="${month.label}: ${formatNumber(value)} min"></b>`;
            })
            .join("");
          return `<div class="cluster" data-label="${section.label}"><span class="value-badge">${formatNumber(topValue)} min</span>${bars}</div>`;
        })
        .join("") || `<p class="kpi-empty">No monthly downtime.</p>`;

    legend.innerHTML = months
      .map((month, index) => `<span><b style="background: ${colors[index % colors.length]}"></b>${month.label}</span>`)
      .join("");
  };

  const renderMetricTrend = (items, selectedMonth) => {
    const container = document.getElementById("monthlyTrendBars");
    const lines = document.getElementById("comboLines");
    if (!container) return;
    if (lines) lines.innerHTML = "";

    const top = items.slice(0, 3);
    const operationDays = getOperationDaysMonSat(selectedMonth);
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
        .join("") || `<p class="kpi-empty">No MTTR/MTBF trend.</p>`;

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

  const renderDashboard = (sourceRows) => {
    const monthColumn = configuredColumn("month");
    const rows = sourceRows
      .map((row) => {
        const month = normalizeMonth(readField(row, "month"));
        return {
          raw: row,
          downtime: toNumber(readField(row, "totalDowntime")),
          errorCount: toNumber(readField(row, "errorCount")),
          mttr: toNumber(readField(row, "mttr")),
          mtbf: toNumber(readField(row, "mtbf")),
          itemCode: readField(row, "itemCode") || "Unknown machine",
          machineName: readField(row, "machineName") || readField(row, "itemCode") || "Unknown machine",
          section: readField(row, "section") || "Unknown section",
          plant: readField(row, "plant") || "Unknown plant",
          month
        };
      })
      .sort((a, b) => a.month.order - b.month.order || b.downtime - a.downtime);

    const totalDowntime = rows.reduce((sum, row) => sum + row.downtime, 0);
    const rowCount = rows.length;
    const totalErrors = rowCount;
    const uniqueItemCount = new Set(rows.map((row) => row.itemCode).filter(Boolean)).size;
    const operatingMinutes = getOperatingMinutes(activeMonth, uniqueItemCount, totalDowntime);
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
    text("downtimePeriod", `${formatNumber(rows.length)} records`);
    text("errorStatus", rows.length ? "Downtime rows" : "No data");
    text("mttrStatus", rows.length ? "Minutes" : "No data");
    text("mtbfStatus", rows.length ? (configuredColumn("mtbf") ? "Minutes" : "Operating min") : "No data");
    text("machineFooterTotal", `Total Downtime: ${formatNumber(totalDowntime)} min`);
    text("machineFooterCount", `${formatNumber(machineGroups.length)} machines`);
    const activeLabel = document.getElementById("monthFilterLabel")?.textContent || "Selected month";
    text("kpiSubtitle", monthColumn ? `Downtime sorted and calculated by ${monthColumn} · ${activeLabel}` : "Downtime totals from table · map a month column in supabase/config.js for monthly split");

    renderRankList(sectionGroups);
    renderMachineBars(machineGroups);
    renderMonthlyChart(months, plantMonthGroups);
    renderMetricTrend(machineGroups, activeMonth);

    setStatus(
      monthColumn
        ? `Loaded ${formatNumber(rows.length)} downtime records for ${activeLabel}.`
        : `Loaded ${formatNumber(rows.length)} downtime records. Month column is not mapped, so totals are grouped as All Data.`,
      rows.length ? "success" : "warning"
    );
  };

  const fetchAndRender = async (monthValue = activeMonth) => {
    if (!downtimeConfig?.table) {
      setStatus("Add downtime table settings in supabase/config.js.", "error");
      return;
    }

    try {
      setStatus("Loading downtime data...", "idle");
      const rows = await getRows(monthValue);
      renderDashboard(rows);
    } catch (error) {
      setStatus(error.message, "error");
    }
  };

  const renderMonthOptions = (months, emptyLabel = "No months") => {
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
  };

  const initMonthFilter = async () => {
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
        renderMonthOptions(months, fallbackRows.length ? "No month values" : "No visible rows");
        renderDashboard([]);
        setStatus(
          fallbackRows.length
            ? "Downtime rows are visible, but the month column is empty."
            : "No visible downtime rows returned from Supabase. Check table data or RLS SELECT policy.",
          "warning"
        );
      } else {
        renderMonthOptions(months);
      }
    } catch (error) {
      label.textContent = "Month error";
      button.disabled = true;
      menu.innerHTML = `<button type="button" disabled>Month load failed</button>`;
      setStatus(error.message, "error");
      return;
    }

    const closeMenu = () => {
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

      closeMenu();
    });

    menu.querySelectorAll("[data-month-value]").forEach((item) => {
      item.addEventListener("click", () => {
        activeMonth = item.dataset.monthValue || "";
        label.textContent = item.textContent.trim();
        menu.querySelectorAll("[data-month-value]").forEach((buttonItem) => buttonItem.classList.toggle("active", buttonItem === item));
        closeMenu();
        fetchAndRender(activeMonth);
      });
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden || button.contains(event.target) || menu.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || menu.hidden) return;
      closeMenu();
      button.focus();
    });

    if (activeMonth) fetchAndRender(activeMonth);
  };

  initMonthFilter();
});
