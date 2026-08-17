window.SAMHO_ERRORS = {
  message(error, action = "complete this action") {
    const detail = String(error?.message || error || "").toLowerCase();
    const t = (id, vars) => window.SAMHO_LANG ? window.SAMHO_LANG.t(id, vars) : "";
    if (detail.includes("failed to fetch") || detail.includes("networkerror") || detail.includes("network request failed")) {
      return t("error.network");
    }
    if (detail.includes("row-level security") || detail.includes("permission denied") || detail.includes("not authorized")) {
      return t("error.permission", { action });
    }
    if (detail.includes("duplicate key") || detail.includes("unique constraint")) {
      return t("error.duplicate");
    }
    if (detail.includes("invalid login") || detail.includes("invalid credentials")) {
      return t("error.invalidLogin");
    }
    return t("error.couldNot", { action });
  }
};

window.SAMHO_LOADING = {
  overlay: null,
  show(message = "") {
    if (!message) message = window.SAMHO_LANG ? window.SAMHO_LANG.t("loading.data") : "Loading data...";
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.className = "loading-overlay";
      this.overlay.innerHTML =
        '<div class="loading-spinner"><div class="spinner"></div><p class="loading-message"></p></div>';
      document.body.appendChild(this.overlay);
    }
    this.overlay.querySelector(".loading-message").textContent = message;
    this.overlay.classList.add("active");
  },
  hide() {
    if (this.overlay) this.overlay.classList.remove("active");
  }
};
