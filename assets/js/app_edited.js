if (window.SAMHO_LANG) {
  window.SAMHO_LANG.register({
    "bm.search.prompt": { vi: "Nhập hoặc scan mã máy.", en: "Enter or scan a machine code." },
    "bm.search.searching": { vi: "Đang tìm trong cơ sở dữ liệu...", en: "Searching database..." },
    "bm.search.loaded": { vi: "Đã tải thông tin máy.", en: "Machine data loaded." },
    "bm.search.noRows": { vi: "Không có dữ liệu máy. Kiểm tra dữ liệu hoặc policy RLS SELECT của Supabase.", en: "No visible machine rows. Check data or Supabase RLS SELECT policy." },
    "bm.search.notFound": { vi: "Không tìm thấy máy với mã này.", en: "No machine found for this code." },
    "bm.action.loadMachineDetails": { vi: "tải thông tin máy", en: "load machine details" },
    "bm.scan.title": { vi: "Máy quét mã vạch", en: "Barcode scanner" },
    "bm.scan.heading": { vi: "Quét mã máy", en: "Scan machine code" },
    "bm.scan.close": { vi: "Đóng máy quét", en: "Close scanner" },
    "bm.scan.point": { vi: "Hướng camera vào mã vạch.", en: "Point the camera at a barcode." },
    "bm.scan.noHttps": { vi: "Camera yêu cầu HTTPS và trình duyệt hỗ trợ.", en: "Camera access requires HTTPS and a supported browser." },
    "bm.scan.loading": { vi: "Máy quét mã vạch đang tải. Vui lòng thử lại.", en: "Barcode scanner is loading. Please try again." },
    "bm.scan.opening": { vi: "Đang mở camera...", en: "Opening camera..." },
    "bm.scan.scanned": { vi: "Đã quét {code}.", en: "Scanned {code}." },
    "bm.action.useCameraScanner": { vi: "dùng máy quét camera", en: "use the camera scanner" },
    "bm.field.brokenAt": { vi: "Báo hư", en: "Reported" },
    "bm.field.repairStartedAt": { vi: "Bắt đầu sửa", en: "Repair started" },
    "bm.field.repairFinishedAt": { vi: "Sửa xong", en: "Repair finished" },
    "bm.field.itemCode": { vi: "Mã máy", en: "Item Code" },
    "bm.field.issue": { vi: "Vấn đề", en: "Issue" },
    "bm.field.reason": { vi: "Nguyên nhân", en: "Reason" },
    "bm.field.solve": { vi: "Cách khắc phục", en: "Solve" },
    "bm.field.mechanic": { vi: "Thợ sửa", en: "Mechanic" },
    "bm.field.other": { vi: "Khác", en: "Other" },
    "bm.save.searchFirst": { vi: "Vui lòng tìm và tải mã máy trước khi lưu.", en: "Please search and load the machine code before submitting." },
    "bm.save.clickSearch": { vi: "Bấm Tìm kiếm để tải thông tin máy trước khi lưu.", en: "Click Search to load machine data before saving." },
    "bm.save.fillIn": { vi: "Vui lòng điền: {fields}.", en: "Please fill in: {fields}." },
    "bm.save.checkingCode": { vi: "Đang kiểm tra mã máy...", en: "Checking machine code..." },
    "bm.save.saving": { vi: "Đang lưu phiếu sửa chữa...", en: "Saving repair record..." },
    "bm.save.codeNotExist": { vi: "Mã máy {code} không tồn tại trong machine_info.", en: "Item Code {code} does not exist in machine_info." },
    "bm.save.saved": { vi: "Đã lưu phiếu sửa chữa.", en: "Repair record saved." },
    "bm.action.saveRepairRecord": { vi: "lưu phiếu sửa chữa", en: "save the repair record" },
    "bm.summary.title": { vi: "Báo cáo tổng hợp", en: "Summary Report" },
    "bm.summary.powerBiMissing": { vi: "Thêm đường dẫn Power BI trong supabase/config.js.", en: "Add your Power BI link in supabase/config.js." },
    "bm.page.title": { vi: "Nhập máy hư", en: "Enter breakdown machine" },
    "bm.page.tag": { vi: "BM / Breakdown", en: "BM / Breakdown" },
    "bm.scan.srOnly": { vi: "Nhập code hoặc scan", en: "Enter code or scan" },
    "bm.scan.placeholder": { vi: "NHẬP CODE HOẶC SCAN", en: "ENTER CODE OR SCAN" },
    "bm.scan.button": { vi: "Quét", en: "Scan" },
    "bm.plate.title": { vi: "Thông tin máy", en: "Machine identity" },
    "bm.field.machineName": { vi: "Tên máy", en: "Machine Name" },
    "bm.field.specification": { vi: "Thông số kỹ thuật", en: "Specification" },
    "bm.field.madeBy": { vi: "Hãng sản xuất", en: "Made By" },
    "bm.field.status": { vi: "Trạng thái", en: "Status" },
    "bm.field.place": { vi: "Vị trí", en: "Place" },
    "bm.field.plant": { vi: "Nhà máy", en: "Plant" },
    "bm.field.section": { vi: "Chuyền", en: "Section" },
    "bm.timeline.title": { vi: "Thời gian", en: "Timeline" },
    "bm.timeline.brokenTime": { vi: "Báo hư - giờ 24h", en: "Reported - 24h time" },
    "bm.timeline.startTime": { vi: "Bắt đầu sửa - giờ 24h", en: "Repair started - 24h time" },
    "bm.timeline.doneTime": { vi: "Sửa xong - giờ 24h", en: "Repair finished - 24h time" },
    "bm.detail.title": { vi: "Chi tiết sửa chữa", en: "Repair detail" },
    "bm.issue.electric": { vi: "Điện", en: "Electric" },
    "bm.issue.mechanical": { vi: "Cơ khí", en: "Mechanical" },
    "bm.issue.pressure": { vi: "Áp suất", en: "Pressure" },
    "bm.issue.other": { vi: "Khác", en: "Other" },
    "bm.solve.repair": { vi: "SỬA CHỮA", en: "REPAIR" },
    "bm.solve.replace": { vi: "THAY THẾ", en: "REPLACE" },
    "bm.solve.clean": { vi: "VỆ SINH", en: "CLEAN" },
    "bm.mechanic.placeholder": { vi: "Nhập tên thợ", en: "Type a mechanic name" },
    "bm.mechanic.searchAria": { vi: "Tìm tên thợ", en: "Search mechanic names" },
    "bm.mechanic.remove": { vi: "Loại bỏ", en: "Remove" },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const t = (id, vars) => (window.SAMHO_LANG ? window.SAMHO_LANG.t(id, vars) : "");

  const supabaseConfig = window.SAMHO_SUPABASE;
  const db = window.SAMHO_DB;
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
  let defaultMechanicName = '';

  const getSelectedMechanics = () => getValue("mechanic").split(",").map((name) => name.trim()).filter(Boolean);

  const normalizeMechanicSearch = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLocaleLowerCase()
    .trim();

  const renderMechanicSelection = (names) => {
    const mechanic = document.getElementById("mechanic");
    const chips = document.getElementById("mechanicChips");
    if (!mechanic || !chips) return;

    mechanic.value = names.join(", ");
    chips.replaceChildren(
      ...names.map((name) => {
        const chip = document.createElement("span");
        chip.className = "mechanic-chip";
        const nameLabel = document.createElement("span");
        nameLabel.className = "mechanic-name";
        nameLabel.textContent = name;
        const blockChipClick = (event) => {
          event.preventDefault();
          event.stopPropagation();
        };
        const isDefault = name === defaultMechanicName;
        if (!isDefault) {
          const removeButton = document.createElement("button");
          removeButton.className = "mechanic-remove";
          removeButton.type = "button";
          removeButton.textContent = "×";
          removeButton.setAttribute("aria-label", `${t("bm.mechanic.remove")} ${name}`);
          removeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            renderMechanicSelection(names.filter((selected) => selected !== name));
            renderMechanicOptions();
          });
          chip.addEventListener("click", (event) => {
            if (event.target !== removeButton) blockChipClick(event);
          }, true);
          chip.append(nameLabel, removeButton);
        } else {
          chip.addEventListener("click", blockChipClick, true);
          chip.append(nameLabel);
        }
        return chip;
      })
    );
  };

  const renderMechanicOptions = () => {
    const search = document.getElementById("mechanicSearch");
    const options = document.getElementById("mechanicOptions");
    if (!search || !options) return;

    const selected = getSelectedMechanics();
    const query = normalizeMechanicSearch(search.value);
    const queryWords = query.split(/\s+/).filter(Boolean);
    const matches = mechanicNames
      .filter((name) => {
        const nameWords = normalizeMechanicSearch(name).split(/\s+/);
        return !selected.includes(name) && queryWords.every((word) => nameWords.some((nameWord) => nameWord.startsWith(word)));
      })
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
    options.hidden = !query || document.activeElement !== search || !matches.length;
  };

  const setDefaultMechanic = () => {
    const displayName = String(window.SAMHO_AUTH?.currentUser?.()?.user_metadata?.display_name || "").trim();
    defaultMechanicName = displayName;
    if (!getSelectedMechanics().length && displayName) renderMechanicSelection([displayName]);
  };

  const initMechanicPicker = () => {
    const picker = document.getElementById("mechanicPicker");
    const search = document.getElementById("mechanicSearch");
    if (!picker || !search) return;

    search.addEventListener("input", renderMechanicOptions);
    document.addEventListener("click", (event) => {
      if (!picker.contains(event.target)) document.getElementById("mechanicOptions").hidden = true;
    });
  };

  const loadMechanicOptions = async () => {
    const options = document.getElementById("mechanicOptions");
    if (!options) return;

    try {
      const names = await db.rpc("list_user_display_names");
      mechanicNames = [...new Set((names || []).map(({ display_name }) => display_name).filter(Boolean))];
      renderMechanicOptions();
    } catch (error) {
      console.warn("Could not load mechanic name suggestions.", error);
    }
  };

  const parseSimpleDateTime = (value) => window.SAMHO_DATETIME.parse(value);

  const getDateTimeValue = (dateId, timeId) => window.SAMHO_DATETIME.readInput(dateId, timeId);

  const getDowntimeMinutes = (startValue, endValue) => window.SAMHO_DATETIME.downtimeMinutes(startValue, endValue);

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

    window.SAMHO_DATETIME.setInputs(value, dateId, timeId);
  };

  if (document.getElementById("noteGrid")) renderNoteGrid();
  initMechanicPicker();
  setDefaultMechanic();
  loadMechanicOptions();

  const fetchRowByCode = async ({ table, codeColumn, selectColumns }, code) => {
    const columns = (selectColumns || ["*"]).join(",");

    const exact = await window.SAMHO_DB.getOne(table, { columns, where: { [codeColumn]: code } });
    if (exact) return exact;

    return window.SAMHO_DB.getOne(table, { columns, where: { [codeColumn]: { op: "ilike", value: `*${code}*` } } });
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
    const tables = [
      { table: supabaseConfig.machineInfo?.table || supabaseConfig.table, codeColumn: supabaseConfig.machineInfo?.codeColumn || supabaseConfig.codeColumn },
      { table: supabaseConfig.table, codeColumn: supabaseConfig.codeColumn }
    ];

    const seen = new Set();
    for (const { table, codeColumn } of tables) {
      const key = `${table}:${codeColumn}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const row = await window.SAMHO_DB.getOne(table, { columns: codeColumn, where: { [codeColumn]: code } });
      if (row) return true;
    }

    return false;
  };

  const fetchVisibleMachineCount = async () => {
    const total = await window.SAMHO_DB.count(supabaseConfig.table);
    return `*/${total}`;
  };

  const runSearch = async () => {
    const searchInput = document.getElementById("codeSearch");
    const searchButton = document.getElementById("searchButton");
    const code = searchInput?.value.trim().toUpperCase();
    if (!code) {
      searchedItemCode = "";
      setMachineData(null);
      setSearchStatus(t("bm.search.prompt"), "warning");
      return;
    }

    searchButton.disabled = true;
    setSearchStatus(t("bm.search.searching"), "loading");

    try {
      const machine = await fetchMachineByCode(code);
      setMachineData(machine);
      if (machine) {
        searchedItemCode = code;
        setSearchStatus(t("bm.search.loaded"), "success");
        return;
      }

      searchedItemCode = "";
      const visibleCount = await fetchVisibleMachineCount();
      const message =
        visibleCount === "*/0"
          ? t("bm.search.noRows")
          : t("bm.search.notFound");
      setSearchStatus(message, "warning");
    } catch (error) {
      searchedItemCode = "";
      setMachineData(null);
      setSearchStatus(window.SAMHO_ERRORS.message(error, t("bm.action.loadMachineDetails")), "error");
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
            <span>${t("bm.scan.title")}</span>
            <h2>${t("bm.scan.heading")}</h2>
          </div>
          <button class="scan-close" type="button" data-close-scan aria-label="${t("bm.scan.close")}">
            <i data-lucide="x"></i>
          </button>
        </header>
        <div class="scan-video-wrap">
          <video id="scanVideo" autoplay playsinline muted></video>
          <div class="scan-frame"></div>
        </div>
        <p class="scan-status" id="scanStatus">${t("bm.scan.point")}</p>
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
      setSearchStatus(t("bm.scan.noHttps"), "warning");
      return;
    }
    if (!supportsNativeScanner && !supportsZxingScanner) {
      setSearchStatus(t("bm.scan.loading"), "warning");
      return;
    }

    try {
      modal.classList.add("active");
      setScanStatus(t("bm.scan.opening"), "loading");

      const handleDetectedCode = (value) => {
        if (!value) return;
        codeInput.value = value.toUpperCase();
        setSearchStatus(t("bm.scan.scanned", { code: codeInput.value }), "success");
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
        setScanStatus(t("bm.scan.point"), "idle");
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
      setScanStatus(t("bm.scan.point"), "idle");

      scanTimer = window.setInterval(async () => {
        if (!video.videoWidth) return;

        const codes = await barcodeDetector.detect(video);
        if (!codes.length) return;

        handleDetectedCode(codes[0].rawValue?.trim());
      }, 450);
    } catch (error) {
      stopScanner();
      setSearchStatus(window.SAMHO_ERRORS.message(error, t("bm.action.useCameraScanner")), "error");
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
      brokenAt,
      repairStartedAt: getDateTimeValue("startDate", "startTime"),
      repairFinishedAt,
      itemCode: getValue("itemCode") || getValue("codeSearch").toUpperCase(),
      machineName: getValue("machineName"),
      machinePlace: getValue("machinePlace"),
      machinePlant: getValue("machinePlant"),
      machineSection: getValue("machineSection"),
      totalDowntime: getDowntimeMinutes(brokenAt, repairFinishedAt),
      issue: getValue("issue"),
      other: getValue("other"),
      reason: getValue("reason"),
      solve: getValue("solve"),
      mechanic: getValue("mechanic")
    };
  };

  const validateRepairPayload = (formData) => {
    const requiredFields = [
      ["brokenAt", t("bm.field.brokenAt")],
      ["repairStartedAt", t("bm.field.repairStartedAt")],
      ["repairFinishedAt", t("bm.field.repairFinishedAt")],
      ["itemCode", t("bm.field.itemCode")],
      ["issue", t("bm.field.issue")],
      ["reason", t("bm.field.reason")],
      ["solve", t("bm.field.solve")],
      ["mechanic", t("bm.field.mechanic")]
    ];

    if (document.getElementById("other")?.required) requiredFields.push(["other", t("bm.field.other")]);

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

  const submitRepairRecord = async (payload) => {
    await window.SAMHO_DB.insert(supabaseConfig.repairRecords.table, payload);
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
      setSaveStatus(t("bm.save.searchFirst"), "warning");
      setSearchStatus(t("bm.save.clickSearch"), "warning");
      return;
    }

    const missingFields = validateRepairPayload(formData);

    if (missingFields.length) {
      setSaveStatus(t("bm.save.fillIn", { fields: missingFields.join(", ") }), "warning");
      return;
    }

    saveButton.disabled = true;
    setSaveStatus(t("bm.save.checkingCode"), "loading");

    try {
      window.SAMHO_LOADING.show(t("bm.save.saving"));
      const machineExists = await machineExistsByCode(formData.itemCode);
      if (!machineExists) {
        setSaveStatus(t("bm.save.codeNotExist", { code: formData.itemCode }), "warning");
        return;
      }

      setSaveStatus(t("bm.save.saving"), "loading");
      await submitRepairRecord(mapRepairPayload(formData));
      setSaveStatus(t("bm.save.saved"), "success");
      resetRepairInputs();
    } catch (error) {
      setSaveStatus(window.SAMHO_ERRORS.message(error, t("bm.action.saveRepairRecord")), "error");
    } finally {
      window.SAMHO_LOADING.hide();
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
        status.textContent = t("bm.summary.powerBiMissing");
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

  const timePickerInstances = {};
  const initTimePickers = () => {
    const common = {
      enableTime: true,
      noCalendar: true,
      time_24hr: true,
      dateFormat: "H:i",
      minuteIncrement: 1,
      disableMobile: true,
    };
    ["brokenTime", "startTime", "doneTime"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) timePickerInstances[id] = flatpickr(input, common);
    });
  };

  initTimePickers();

  const pad2 = (n) => String(n).padStart(2, "0");
  const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const toTimeStr = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const baseNow = new Date();
  const brokenAt = baseNow;
  const startAt = new Date(brokenAt.getTime() + 5 * 60000);
  const doneAt = new Date(startAt.getTime() + 5 * 60000);

  const timeDefaults = {
    brokenDate: toDateStr(brokenAt), brokenTime: toTimeStr(brokenAt),
    startDate: toDateStr(startAt), startTime: toTimeStr(startAt),
    doneDate: toDateStr(doneAt), doneTime: toTimeStr(doneAt)
  };

  ["brokenDate", "startDate", "doneDate"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = timeDefaults[id];
  });

  ["brokenTime", "startTime", "doneTime"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      if (timePickerInstances[id]) timePickerInstances[id].setDate(timeDefaults[id], false);
      else input.value = timeDefaults[id];
    }
  });
});
