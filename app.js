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

  renderNoteGrid();

  const fetchMachineByCode = async (code) => {
    if (!supabaseConfig?.anonKey) {
      throw new Error("Add your Supabase anon key in supabase-config.js before searching.");
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
          Authorization: `Bearer ${supabaseConfig.anonKey}`
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

  const fetchVisibleMachineCount = async () => {
    const params = new URLSearchParams({
      select: supabaseConfig.codeColumn,
      limit: "1"
    });

    const response = await fetch(`${supabaseConfig.url}/${supabaseConfig.table}?${params}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
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

  const menuToggle = document.querySelector("#menuToggle");
  menuToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      document.body.classList.toggle("sidebar-open");
      return;
    }

    document.body.classList.toggle("sidebar-collapsed");
  });

  document.querySelectorAll(".mode").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".mode").forEach((mode) => mode.classList.remove("active"));
      button.classList.add("active");
    });
  });

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
