document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const supabaseConfig = window.SAMHO_SUPABASE;

  const setSearchStatus = (message, type = "idle") => {
    const status = document.getElementById("searchStatus");
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  const setSaveStatus = (message, type = "idle") => {
    const status = document.getElementById("saveStatus");
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  const getValue = (id) => document.getElementById(id)?.value.trim() || "";

  const getLocalTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  };

  const getDateTimeValue = (dateId, timeId) => {
    const date = getValue(dateId);
    const time = getValue(timeId);
    if (!date || !time) return "";
    return `${date}T${time}:00${getLocalTimezoneOffset()}`;
  };

  const getFieldLabel = (field) => {
    const columns = [].concat(supabaseConfig.fieldMap[field] || []);
    return columns[0] || field;
  };

  const renderNoteGrid = () => {
    const noteGrid = document.getElementById("noteGrid");
    if (!noteGrid) return;

    noteGrid.innerHTML = "";
    supabaseConfig.noteFields.forEach((field) => {
      const input = document.createElement("input");
      input.id = field;
      input.type = "text";
      input.disabled = true;
      input.placeholder = getFieldLabel(field);
      input.setAttribute("aria-label", getFieldLabel(field));
      noteGrid.appendChild(input);
    });
  };

  const setMachineData = (machine) => {
    Object.keys(supabaseConfig.fieldMap).forEach((field) => {
      const input = document.getElementById(field);
      const mappedColumns = [].concat(supabaseConfig.fieldMap[field] || []);
      const matchedColumn = mappedColumns.find((column) => machine?.[column] != null);
      if (input) input.value = matchedColumn ? machine[matchedColumn] : "";
    });
  };

  const setDateTimeInputs = (value, dateId, timeId) => {
    const dateInput = document.getElementById(dateId);
    const timeInput = document.getElementById(timeId);
    if (!dateInput || !timeInput || !value) return;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;

    dateInput.value = date.toISOString().slice(0, 10);
    timeInput.value = date.toTimeString().slice(0, 5);
  };

  renderNoteGrid();

  const fetchMachineByCode = async (code) => {
    if (!supabaseConfig?.anonKey) {
      throw new Error("Add your Supabase anon key in supabase/config.js before searching.");
    }

    const requestMachine = async (operator, value) => {
      const params = new URLSearchParams({
        select: supabaseConfig.selectColumns.join(","),
        [supabaseConfig.codeColumn]: `${operator}.${value}`,
        limit: "1"
      });

      const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.table}?${params}`, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          ...window.SAMHO_AUTH.authHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Supabase search failed (${response.status}).`);
      }

      return response.json();
    };

    const exactRows = await requestMachine("eq", code);
    if (exactRows[0]) return exactRows[0];

    const fuzzyRows = await requestMachine("ilike", `*${code}*`);
    return fuzzyRows[0] || null;
  };

  const machineExistsByCode = async (code) => {
    const params = new URLSearchParams({
      select: supabaseConfig.codeColumn,
      [supabaseConfig.codeColumn]: `eq.${code}`,
      limit: "1"
    });

    const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.table}?${params}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Machine validation failed (${response.status}).`);
    }

    const rows = await response.json();
    return rows.length > 0;
  };

  const fetchVisibleMachineCount = async () => {
    const params = new URLSearchParams({
      select: supabaseConfig.codeColumn,
      limit: "1"
    });

    const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.table}?${params}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        Prefer: "count=exact"
      }
    });

    return response.headers.get("content-range") || "";
  };

  const runSearch = async () => {
    const searchInput = document.getElementById("codeSearch");
    const searchButton = document.getElementById("searchButton");
    const code = searchInput?.value.trim().toUpperCase();
    if (!code) {
      setMachineData(null);
      setSearchStatus("Enter or scan a machine code.", "warning");
      return;
    }

    searchButton.disabled = true;
    setSearchStatus("Searching database...", "loading");

    try {
      const machine = await fetchMachineByCode(code);
      setMachineData(machine);
      if (machine) {
        setSearchStatus("Machine data loaded.", "success");
        return;
      }

      const visibleCount = await fetchVisibleMachineCount();
      const message =
        visibleCount === "*/0"
          ? "No visible machine rows. Check data or Supabase RLS SELECT policy."
          : "No machine found for this code.";
      setSearchStatus(message, "warning");
    } catch (error) {
      setMachineData(null);
      setSearchStatus(error.message, "error");
    } finally {
      searchButton.disabled = false;
    }
  };

  document.getElementById("searchButton")?.addEventListener("click", runSearch);
  document.getElementById("codeSearch")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });

  const ensureScanModal = () => {
    let modal = document.getElementById("scanModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "scan-modal";
    modal.id = "scanModal";
    modal.innerHTML = `
      <div class="scan-backdrop" data-close-scan></div>
      <section class="scan-dialog">
        <header>
          <div>
            <span>Barcode scanner</span>
            <h2>Scan machine code</h2>
          </div>
          <button class="scan-close" type="button" data-close-scan aria-label="Close scanner">
            <i data-lucide="x"></i>
          </button>
        </header>
        <div class="scan-video-wrap">
          <video id="scanVideo" autoplay playsinline muted></video>
          <div class="scan-frame"></div>
        </div>
        <p class="scan-status" id="scanStatus">Point the camera at a barcode.</p>
      </section>
    `;

    document.body.appendChild(modal);
    modal.querySelectorAll("[data-close-scan]").forEach((button) => {
      button.addEventListener("click", stopScanner);
    });
    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  let scanStream = null;
  let scanTimer = null;
  let barcodeDetector = null;

  const stopScanner = () => {
    const modal = document.getElementById("scanModal");
    modal?.classList.remove("active");

    if (scanTimer) {
      window.clearInterval(scanTimer);
      scanTimer = null;
    }

    scanStream?.getTracks().forEach((track) => track.stop());
    scanStream = null;
  };

  const setScanStatus = (message, type = "idle") => {
    const status = document.getElementById("scanStatus");
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  const startScanner = async () => {
    const codeInput = document.getElementById("codeSearch");
    const modal = ensureScanModal();
    const video = modal.querySelector("#scanVideo");

    if (!codeInput) return;

    if (!("BarcodeDetector" in window)) {
      setSearchStatus("Barcode scanning is not supported by this browser.", "warning");
      return;
    }

    try {
      modal.classList.add("active");
      setScanStatus("Opening camera...", "loading");

      barcodeDetector =
        barcodeDetector ||
        new window.BarcodeDetector({
          formats: ["code_128", "code_39", "code_93", "codabar", "ean_13", "ean_8", "itf", "qr_code", "upc_a", "upc_e"]
        });

      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      video.srcObject = scanStream;
      await video.play();
      setScanStatus("Point the camera at a barcode.", "idle");

      scanTimer = window.setInterval(async () => {
        if (!video.videoWidth) return;

        const codes = await barcodeDetector.detect(video);
        if (!codes.length) return;

        const value = codes[0].rawValue?.trim();
        if (!value) return;

        codeInput.value = value.toUpperCase();
        setSearchStatus(`Scanned ${codeInput.value}.`, "success");
        stopScanner();
        runSearch();
      }, 450);
    } catch (error) {
      stopScanner();
      setSearchStatus(`Camera scan failed: ${error.message}`, "error");
    }
  };

  document.querySelectorAll(".scan-button").forEach((button) => {
    button.addEventListener("click", startScanner);
  });

  const syncOtherInputState = () => {
    const issue = document.getElementById("issue");
    const other = document.getElementById("other");
    if (!issue || !other) return;

    const selectedText = issue.options[issue.selectedIndex]?.textContent || "";
    const selectedValue = issue.value || selectedText;
    const normalizedIssue = selectedValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const shouldEnableOther = normalizedIssue.includes("khac");
    other.disabled = !shouldEnableOther;
    other.required = shouldEnableOther;
    if (!shouldEnableOther) other.value = "";
  };

  document.getElementById("issue")?.addEventListener("change", syncOtherInputState);
  syncOtherInputState();

  const buildRepairPayload = () => ({
    brokenAt: getDateTimeValue("brokenDate", "brokenTime"),
    repairStartedAt: getDateTimeValue("startDate", "startTime"),
    repairFinishedAt: getDateTimeValue("doneDate", "doneTime"),
    itemCode: getValue("itemCode") || getValue("codeSearch").toUpperCase(),
    issue: getValue("issue"),
    other: getValue("other"),
    reason: getValue("reason"),
    solve: getValue("solve"),
    mechanic: getValue("mechanic")
  });

  const validateRepairPayload = (formData) => {
    const requiredFields = [
      ["reportedAt", "Báo hư"],
      ["repairStartedAt", "Bắt đầu sửa"],
      ["repairFinishedAt", "Sửa xong"],
      ["itemCode", "Item Code"],
      ["issue", "Issue"],
      ["reason", "Reason"],
      ["solve", "Solve"],
      ["mechanic", "Mechanic"]
    ];

    requiredFields[0] = ["brokenAt", "Bao hu"];
    requiredFields[1] = ["repairStartedAt", "Bat dau sua"];
    requiredFields[2] = ["repairFinishedAt", "Sua xong"];
    if (document.getElementById("other")?.required) requiredFields.push(["other", "Other"]);

    return requiredFields
      .filter(([field]) => !formData[field])
      .map(([, label]) => label);
  };

  const mapRepairPayload = (formData) => {
    const insertMap = supabaseConfig.repairRecords.insertMap;
    return Object.fromEntries(
      Object.entries(insertMap)
        .filter(([, column]) => column)
        .map(([formField, column]) => [column, formData[formField] || null])
    );
  };

  const submitRepairRecord = async (payload) => {
    const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.repairRecords.table}`, {
      method: "POST",
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Repair record save failed (${response.status}).`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  document.getElementById("repairForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = document.getElementById("saveButton");
    const formData = buildRepairPayload();
    const missingFields = validateRepairPayload(formData);

    if (missingFields.length) {
      setSaveStatus(`Please fill in: ${missingFields.join(", ")}.`, "warning");
      return;
    }

    saveButton.disabled = true;
    setSaveStatus("Checking machine code...", "loading");

    try {
      const machineExists = await machineExistsByCode(formData.itemCode);
      if (!machineExists) {
        setSaveStatus(`Item Code ${formData.itemCode} does not exist in machine_info.`, "warning");
        return;
      }

      setSaveStatus("Saving repair record...", "loading");
      await submitRepairRecord(mapRepairPayload(formData));
      setSaveStatus("Repair record saved.", "success");
    } catch (error) {
      setSaveStatus(error.message, "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  const menuToggle = document.querySelector("#menuToggle");
  menuToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      document.body.classList.toggle("sidebar-open");
      return;
    }

    document.body.classList.toggle("sidebar-collapsed");
  });

  const subModeActions = {
    BM: [
      { label: "Nhập sửa máy", icon: "plus", color: "blue" },
      { label: "Thông tin máy hư", icon: "file-text", color: "green" },
      { label: "Summary Report", icon: "bar-chart-3", color: "yellow" }
    ],
    RM: [
      { label: "Nhập RM", icon: "plus", color: "green" },
      { label: "Lịch sử RM", icon: "history", color: "blue" },
      { label: "Summary Report", icon: "bar-chart-3", color: "yellow" }
    ],
    PM: [
      { label: "Nhập PM", icon: "plus", color: "yellow" },
      { label: "Checklist PM", icon: "clipboard-check", color: "green" },
      { label: "Summary Report", icon: "bar-chart-3", color: "blue" }
    ],
    CM: [
      { label: "Nhập CM", icon: "plus", color: "red" },
      { label: "Theo dõi CM", icon: "activity", color: "green" },
      { label: "Summary Report", icon: "bar-chart-3", color: "yellow" }
    ]
  };

  subModeActions.BM[0].view = "repairSubmitView";
  subModeActions.BM[1].view = "repairInfoView";
  subModeActions.BM[2].view = "summaryReportView";
  delete subModeActions.BM[1].url;

  const showPageView = (viewId) => {
    document.querySelectorAll(".page-view").forEach((view) => view.classList.remove("active"));
    document.getElementById(viewId)?.classList.add("active");

    if (viewId === "summaryReportView") {
      const frame = document.getElementById("powerBiFrame");
      const status = document.getElementById("summaryReportStatus");
      const reportUrl = supabaseConfig.summaryReport?.powerBiUrl;

      if (reportUrl) {
        frame.src = reportUrl;
        status.textContent = "";
        status.dataset.type = "idle";
      } else {
        frame.removeAttribute("src");
        status.textContent = "Add your Power BI link in supabase/config.js.";
        status.dataset.type = "warning";
      }
    }
  };

  const renderSubModeActions = (mode) => {
    const container = document.getElementById("modeSubButtons");
    if (!container) return;

    container.innerHTML = "";
    (subModeActions[mode] || []).forEach((action) => {
      const button = document.createElement("button");
      button.className = `sub-mode ${action.color}`;
      button.type = "button";
      button.dataset.action = action.label;
      if (action.view) button.dataset.view = action.view;
      if (action.url) button.dataset.url = action.url;
      button.innerHTML = `<i data-lucide="${action.icon}"></i>${action.label}`;
      button.addEventListener("click", () => {
        if (action.view) showPageView(action.view);
        if (action.url) window.location.href = action.url;
      });
      container.appendChild(button);
    });

    if (window.lucide) window.lucide.createIcons();
  };

  const hideSubModeActions = () => {
    const container = document.getElementById("modeSubButtons");
    if (!container) return;
    container.innerHTML = "";
  };

  document.querySelectorAll(".mode").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.mode === "RM") {
        window.location.href = "repair_submit.html";
        return;
      }

      const isAlreadyActive = button.classList.contains("active");
      const areSubButtonsVisible = !!document.querySelector("#modeSubButtons .sub-mode");

      document.querySelectorAll(".mode").forEach((mode) => mode.classList.remove("active"));

      if (isAlreadyActive && areSubButtonsVisible) {
        hideSubModeActions();
        return;
      }

      button.classList.add("active");
      renderSubModeActions(button.dataset.mode);
    });
  });
  hideSubModeActions();

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  ["brokenDate", "startDate"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = date;
  });

  ["brokenTime", "startTime"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = time;
  });
});
