document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const supabaseConfig = window.SAMHO_SUPABASE;
  let searchedItemCode = "";

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

  let mechanicNames = [];

  const getSelectedMechanics = () => getValue("mechanic").split(",").map((name) => name.trim()).filter(Boolean);

  const renderMechanicSelection = (names) => {
    const mechanic = document.getElementById("mechanic");
    const chips = document.getElementById("mechanicChips");
    if (!mechanic || !chips) return;

    mechanic.value = names.join(", ");
    chips.replaceChildren(
      ...names.map((name) => {
        const chip = document.createElement("button");
        chip.className = "mechanic-chip";
        chip.type = "button";
        chip.textContent = name;
        chip.setAttribute("aria-label", `Remove ${name}`);
        chip.addEventListener("click", () => {
          renderMechanicSelection(names.filter((selected) => selected !== name));
          renderMechanicOptions();
        });
        return chip;
      })
    );
  };

  const renderMechanicOptions = () => {
    const search = document.getElementById("mechanicSearch");
    const options = document.getElementById("mechanicOptions");
    if (!search || !options) return;

    const selected = getSelectedMechanics();
    const query = search.value.trim().toLocaleLowerCase();
    const matches = mechanicNames
      .filter((name) => !selected.includes(name) && name.toLocaleLowerCase().includes(query))
      .slice(0, 3);
    options.replaceChildren(
      ...matches.map((name) => {
        const option = document.createElement("button");
        option.className = "mechanic-option";
        option.type = "button";
        option.role = "option";
        option.textContent = name;
        option.addEventListener("click", () => {
          renderMechanicSelection([...getSelectedMechanics(), name]);
          search.value = "";
          renderMechanicOptions();
          search.focus();
        });
        return option;
      })
    );
    options.hidden = !matches.length;
  };

  const setDefaultMechanic = () => {
    const displayName = String(window.SAMHO_AUTH?.currentUser?.()?.user_metadata?.display_name || "").trim();
    if (!getSelectedMechanics().length && displayName) renderMechanicSelection([displayName]);
  };

  const initMechanicPicker = () => {
    const picker = document.getElementById("mechanicPicker");
    const search = document.getElementById("mechanicSearch");
    if (!picker || !search) return;

    search.addEventListener("input", renderMechanicOptions);
    search.addEventListener("focus", renderMechanicOptions);
    search.addEventListener("keydown", (event) => {
      if (event.key !== "Backspace" || search.value || !getSelectedMechanics().length) return;
      renderMechanicSelection(getSelectedMechanics().slice(0, -1));
      renderMechanicOptions();
    });
    document.addEventListener("click", (event) => {
      if (!picker.contains(event.target)) document.getElementById("mechanicOptions").hidden = true;
    });
  };

  const loadMechanicOptions = async () => {
    const options = document.getElementById("mechanicOptions");
    if (!options) return;

    try {
      const response = await fetch(`${supabaseConfig.url}/rpc/list_user_display_names`, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          ...window.SAMHO_AUTH.authHeaders()
        }
      });

      if (!response.ok) throw new Error(`Could not load mechanic names (${response.status}).`);

      const names = await response.json();
      mechanicNames = [...new Set(names.map(({ display_name }) => display_name).filter(Boolean))];
      renderMechanicOptions();
    } catch (error) {
      console.warn("Could not load mechanic name suggestions.", error);
    }
  };

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

  const getDowntimeMinutes = (startValue, endValue) => {
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  };

  const getMonthValue = (dateTimeValue) => {
    if (!dateTimeValue) return "";
    return dateTimeValue.slice(0, 7);
  };

  const getFieldLabel = (field) => {
    const columns = [].concat(supabaseConfig.fieldMap[field] || []);
    return columns[0] || field;
  };

  const renderNoteGrid = () => {
    const noteGrid = document.getElementById("noteGrid");
    if (!noteGrid) return;

    noteGrid.innerHTML = "";
    supabaseConfig.noteFields
      .filter((field) => field !== "machineLine")
      .forEach((field) => {
        const input = document.createElement("input");
        input.id = field;
        input.type = "text";
        input.disabled = true;
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

  const clearSearchedMachine = () => {
    searchedItemCode = "";
    setMachineData(null);
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

  if (document.getElementById("noteGrid")) renderNoteGrid();
  initMechanicPicker();
  setDefaultMechanic();
  loadMechanicOptions();

  const fetchRowByCode = async ({ table, codeColumn, selectColumns }, code) => {
    const requestRow = async (operator, value) => {
      const params = new URLSearchParams({
        select: (selectColumns || ["*"]).join(","),
        [codeColumn]: `${operator}.${value}`,
        limit: "1"
      });

      const response = await fetch(`${supabaseConfig.url}/${table}?${params}`, {
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          ...window.SAMHO_AUTH.authHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Supabase search failed for ${table} (${response.status}).`);
      }

      return response.json();
    };

    const exactRows = await requestRow("eq", code);
    if (exactRows[0]) return exactRows[0];

    const fuzzyRows = await requestRow("ilike", `*${code}*`);
    return fuzzyRows[0] || null;
  };

  const fetchMachineByCode = async (code) => {
    if (!supabaseConfig?.anonKey) {
      throw new Error("Add your Supabase anon key in supabase/config.js before searching.");
    }

    const repairRecord = await fetchRowByCode(
      {
        table: supabaseConfig.table,
        codeColumn: supabaseConfig.codeColumn,
        selectColumns: supabaseConfig.selectColumns
      },
      code
    );

    const machineInfo = await fetchRowByCode(supabaseConfig.machineInfo, code);
    return repairRecord || machineInfo ? { ...(repairRecord || {}), ...(machineInfo || {}) } : null;
  };

  const machineExistsByCode = async (code) => {
    const table = supabaseConfig.machineInfo?.table || supabaseConfig.table;
    const codeColumn = supabaseConfig.machineInfo?.codeColumn || supabaseConfig.codeColumn;
    const params = new URLSearchParams({
      select: codeColumn,
      [codeColumn]: `eq.${code}`,
      limit: "1"
    });

    const response = await fetch(`${supabaseConfig.url}/${table}?${params}`, {
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
      searchedItemCode = "";
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
        searchedItemCode = code;
        setSearchStatus("Machine data loaded.", "success");
        return;
      }

      searchedItemCode = "";
      const visibleCount = await fetchVisibleMachineCount();
      const message =
        visibleCount === "*/0"
          ? "No visible machine rows. Check data or Supabase RLS SELECT policy."
          : "No machine found for this code.";
      setSearchStatus(message, "warning");
    } catch (error) {
      searchedItemCode = "";
      setMachineData(null);
      setSearchStatus(window.SAMHO_ERRORS.message(error, "load machine details"), "error");
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
  document.getElementById("codeSearch")?.addEventListener("input", clearSearchedMachine);

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
  let zxingReader = null;
  let zxingControls = null;

  const stopScanner = () => {
    const modal = document.getElementById("scanModal");
    modal?.classList.remove("active");

    if (scanTimer) {
      window.clearInterval(scanTimer);
      scanTimer = null;
    }

    zxingControls?.stop();
    zxingControls = null;
    scanStream?.getTracks().forEach((track) => track.stop());
    scanStream = null;

    const video = modal?.querySelector("#scanVideo");
    if (video) {
      video.pause();
      video.srcObject = null;
    }
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

    const supportsNativeScanner = "BarcodeDetector" in window;
    const supportsZxingScanner = Boolean(window.ZXingBrowser?.BrowserMultiFormatReader);
    if (!navigator.mediaDevices?.getUserMedia) {
      setSearchStatus("Camera access requires HTTPS and a supported browser.", "warning");
      return;
    }
    if (!supportsNativeScanner && !supportsZxingScanner) {
      setSearchStatus("Barcode scanner is loading. Please try again.", "warning");
      return;
    }

    try {
      modal.classList.add("active");
      setScanStatus("Opening camera...", "loading");

      const handleDetectedCode = (value) => {
        if (!value) return;
        codeInput.value = value.toUpperCase();
        setSearchStatus(`Scanned ${codeInput.value}.`, "success");
        stopScanner();
        runSearch();
      };

      if (!supportsNativeScanner) {
        zxingReader = zxingReader || new window.ZXingBrowser.BrowserMultiFormatReader();
        zxingControls = await zxingReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          video,
          (result) => handleDetectedCode(result?.getText()?.trim())
        );
        setScanStatus("Point the camera at a barcode.", "idle");
        return;
      }

      barcodeDetector =
        barcodeDetector ||
        new window.BarcodeDetector({
          formats: ["code_128", "code_39", "code_93", "codabar", "ean_13", "ean_8", "itf", "qr_code", "upc_a", "upc_e"]
        });

      scanStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      video.srcObject = scanStream;
      await video.play();
      setScanStatus("Point the camera at a barcode.", "idle");

      scanTimer = window.setInterval(async () => {
        if (!video.videoWidth) return;

        const codes = await barcodeDetector.detect(video);
        if (!codes.length) return;

        handleDetectedCode(codes[0].rawValue?.trim());
      }, 450);
    } catch (error) {
      stopScanner();
      setSearchStatus(window.SAMHO_ERRORS.message(error, "use the camera scanner"), "error");
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

  const buildRepairPayload = () => {
    const brokenAt = getDateTimeValue("brokenDate", "brokenTime");
    const repairFinishedAt = getDateTimeValue("doneDate", "doneTime");

    return {
      id: "",
      brokenAt,
      repairStartedAt: getDateTimeValue("startDate", "startTime"),
      repairFinishedAt,
      itemCode: getValue("itemCode") || getValue("codeSearch").toUpperCase(),
      machineName: getValue("machineName"),
      machinePlace: getValue("machinePlace"),
      machinePlant: getValue("machinePlant"),
      machineSection: getValue("machineSection"),
      totalDowntime: getDowntimeMinutes(brokenAt, repairFinishedAt),
      month: getMonthValue(brokenAt),
      issue: getValue("issue"),
      other: getValue("other"),
      reason: getValue("reason"),
      solve: getValue("solve"),
      mechanic: getValue("mechanic")
    };
  };

  const validateRepairPayload = (formData) => {
    const requiredFields = [
      ["brokenAt", "Bao hu"],
      ["repairStartedAt", "Bat dau sua"],
      ["repairFinishedAt", "Sua xong"],
      ["itemCode", "Item Code"],
      ["issue", "Issue"],
      ["reason", "Reason"],
      ["solve", "Solve"],
      ["mechanic", "Mechanic"]
    ];

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
        .map(([formField, column]) => {
          const value = formData[formField];
          return [column, value === "" || value == null ? null : value];
        })
    );
  };

  const fetchNextRepairRecordId = async () => {
    const params = new URLSearchParams({
      select: "id",
      order: "id.desc",
      limit: "1"
    });

    const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.repairRecords.table}?${params}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        ...window.SAMHO_AUTH.authHeaders()
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Could not get next repair record ID (${response.status}).`);
    }

    const rows = await response.json();
    const currentId = Number(rows?.[0]?.id || 0);
    return currentId + 1;
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

  const resetRepairInputs = () => {
    ["issue", "other", "reason", "solve", "mechanic"].forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      if (input.tagName === "SELECT") {
        input.selectedIndex = 0;
      } else {
        input.value = "";
      }
    });

    syncOtherInputState();
    setDefaultMechanic();
  };

  document.getElementById("repairForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = document.getElementById("saveButton");
    const formData = buildRepairPayload();
    const currentCode = getValue("codeSearch").toUpperCase();

    if (!searchedItemCode || searchedItemCode !== currentCode) {
      setSaveStatus("Please search and load the machine code before submitting.", "warning");
      setSearchStatus("Click Search to load machine data before saving.", "warning");
      return;
    }

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

      setSaveStatus("Preparing repair record ID...", "loading");
      formData.id = await fetchNextRepairRecordId();

      setSaveStatus("Saving repair record...", "loading");
      await submitRepairRecord(mapRepairPayload(formData));
      setSaveStatus("Repair record saved.", "success");
      resetRepairInputs();
    } catch (error) {
      setSaveStatus(window.SAMHO_ERRORS.message(error, "save the repair record"), "error");
    } finally {
      saveButton.disabled = false;
    }
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

  if (document.getElementById("repairSubmitView")) {
    subModeActions.BM[0].view = "repairSubmitView";
  } else {
    subModeActions.BM[0].url = "repair_submit.html";
  }
  subModeActions.BM[1].url = "repair_info.html";
  if (document.getElementById("summaryReportView")) {
    subModeActions.BM[2].view = "summaryReportView";
  } else {
    subModeActions.BM[2].url = "repair_submit.html";
  }

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
