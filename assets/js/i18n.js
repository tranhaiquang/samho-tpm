/**
 * SAMHO_LANG — lightweight VI/EN localization.
 *
 * - Dictionary lives in `register(entries)`, keyed by an id string, value is
 *   `{ vi, en }`. `en` is the fallback when a key is missing.
 * - `t(id, vars?)` returns the translated string; `{var}` placeholders are
 *   interpolated from the optional vars object.
 * - Static HTML: elements carry `data-i18n` (text), `data-i18n-ph`
 *   (placeholder), or `data-i18n-title` (title/aria-label).
 * - The VI|EN toggle is injected once per page, fixed to the top-right corner.
 * - Choice is persisted in localStorage under `samho.lang` (default `vi`).
 * - Toggling dispatches `samho:langchange` so modules can re-render dynamic
 *   text; it also updates `document.documentElement.lang`.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "samho.lang";

  const dict = Object.create(null);

  const lang = {
    current: "vi",
    register(entries) {
      Object.assign(dict, entries);
      return this;
    },
    t(id, vars) {
      const entry = dict[id];
      const value =
        entry && typeof entry === "object"
          ? this.current === "vi"
            ? entry.vi
            : entry.en
          : entry;
      let text = value ?? (this.current === "en" ? id : "");
      if (vars && typeof text === "string") {
        Object.entries(vars).forEach(([key, val]) => {
          text = text.replaceAll(`{${key}}`, String(val));
        });
      }
      return text;
    },
    set(langCode) {
      this.current = langCode === "vi" ? "vi" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, this.current);
      } catch { /* private mode */ }
      document.documentElement.lang = this.current === "vi" ? "vi" : "en";
      applyPage();
      renderToggle();
      document.dispatchEvent(new CustomEvent("samho:langchange", { detail: { lang: this.current } }));
    }
  };

  function applyPage() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = lang.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", lang.t(el.dataset.i18nPh));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", lang.t(el.dataset.i18nTitle));
      el.setAttribute("aria-label", lang.t(el.dataset.i18nTitle));
    });
  }

  function renderToggle() {
    const toggle = document.getElementById("langToggle");
    if (!toggle) return;
    toggle.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang.current);
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang.current));
    });
  }

  const POS_STORAGE_KEY = "samho.lang.pos";

  function applySavedPosition(toggle) {
    try {
      const saved = JSON.parse(localStorage.getItem(POS_STORAGE_KEY) || "null");
      if (!saved || typeof saved.x !== "number" || typeof saved.y !== "number") return;
      toggle.style.left = `${saved.x}px`;
      toggle.style.top = `${saved.y}px`;
      toggle.style.right = "auto";
      toggle.style.bottom = "auto";
    } catch { /* corrupt position */ }
  }

  function makeDraggable(toggle) {
    let dragStartX = 0;
    let dragStartY = 0;
    let startLeft = 0;
    let startTop = 0;
    let dragging = false;

    toggle.addEventListener("pointerdown", (event) => {
      if (event.target.closest("[data-lang]")) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      const rect = toggle.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      toggle.classList.add("dragging");
      toggle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    toggle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;
      toggle.style.left = `${startLeft + deltaX}px`;
      toggle.style.top = `${startTop + deltaY}px`;
      toggle.style.right = "auto";
      toggle.style.bottom = "auto";
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      toggle.classList.remove("dragging");
      try {
        const rect = toggle.getBoundingClientRect();
        localStorage.setItem(POS_STORAGE_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
      } catch { /* private mode */ }
    };

    toggle.addEventListener("pointerup", endDrag);
    toggle.addEventListener("pointercancel", endDrag);
  }

  function injectToggle() {
    if (document.getElementById("langToggle")) return;
    const toggle = document.createElement("div");
    toggle.className = "lang-toggle";
    toggle.id = "langToggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language / Ngôn ngữ");
    toggle.innerHTML =
      '<button type="button" class="lang-toggle-btn" data-lang="vi" aria-pressed="true">VI</button>' +
      '<button type="button" class="lang-toggle-btn" data-lang="en" aria-pressed="false">EN</button>';
    toggle.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lang]");
      if (!btn || btn.dataset.lang === lang.current) return;
      lang.set(btn.dataset.lang);
    });
    document.body.appendChild(toggle);
    applySavedPosition(toggle);
    makeDraggable(toggle);
    renderToggle();
  }

  let loaded = false;
  function init() {
    if (loaded) return;
    loaded = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      lang.current = stored === "en" ? "en" : "vi";
    } catch { /* private mode */ }
    document.documentElement.lang = lang.current === "vi" ? "vi" : "en";
  }

  window.SAMHO_LANG = lang;

  /* ── Shared base dictionary (nav, login, common messages) ───────────── */
  lang.register({
    // App chrome
    "nav.maintenance": { vi: "Bảo trì", en: "Maintenance" },
    "nav.tpm": { vi: "TPM", en: "TPM" },
    "nav.sparepart": { vi: "Quản lý phụ tùng", en: "Spare Part Management" },
    "nav.bm": { vi: "BM", en: "BM" },
    "nav.pm": { vi: "PM", en: "PM" },
    "nav.kpi": { vi: "Bảng KPI", en: "KPI Dashboard" },
    "nav.repairInfo": { vi: "Thông tin máy hư", en: "Repair Info" },
    "nav.redTag": { vi: "Red Tag", en: "Red Tag" },
    "nav.sparepartItem": { vi: "Phụ tùng", en: "Spare part" },
    "nav.incoming": { vi: "Hàng nhập", en: "Incoming stock" },
    "nav.logout": { vi: "Đăng xuất", en: "Logout" },
    "brand.tagline": { vi: "Hệ thống nhà máy", en: "Factory System" },
    "app.copyright": { vi: "© 2026 Phòng LEAN, Vietnam Samho", en: "© 2026 LEAN Department, Vietnam Samho" },
    // Login
    "login.title": { vi: "Đăng nhập", en: "Login" },
    "login.welcome": { vi: "Chào mừng trở lại", en: "Welcome back" },
    "login.subtitle": { vi: "Dùng mã nhân viên và mật khẩu để tiếp tục.", en: "Use your employee ID and password to continue." },
    "login.userId": { vi: "Mã nhân viên", en: "User ID" },
    "login.password": { vi: "Mật khẩu", en: "Password" },
    "login.signIn": { vi: "Đăng nhập", en: "Sign in" },
    "login.signingIn": { vi: "Đang đăng nhập...", en: "Signing in..." },
    "login.success": { vi: "Đăng nhập thành công. Đang chuyển hướng...", en: "Login successful. Redirecting..." },
    "login.subtitleTag": { vi: "Vận hành bảo trì", en: "Maintenance Operations" },
    "login.copyright": { vi: "© 2026 Phòng LEAN, Vietnam Samho. Bảo lưu mọi quyền.", en: "© 2026 LEAN Department, Vietnam Samho. All rights reserved." },
    // Greeting
    "greeting.hello": { vi: "Xin chào, {name}", en: "Hello, {name}" },
    // Loading
    "loading.data": { vi: "Đang tải dữ liệu...", en: "Loading data..." },
    // Errors
    "error.network": { vi: "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.", en: "Unable to connect. Please check your network and try again." },
    "error.permission": { vi: "Bạn không có quyền để {action}.", en: "You do not have permission to {action}." },
    "error.duplicate": { vi: "Bản ghi này đã tồn tại. Vui lòng kiểm tra lại.", en: "This record already exists. Please check the details and try again." },
    "error.invalidLogin": { vi: "Mã nhân viên hoặc mật khẩu không đúng. Vui lòng thử lại.", en: "Your user ID or password is incorrect. Please try again." },
    "error.couldNot": { vi: "Không thể {action}. Vui lòng thử lại.", en: "We couldn't {action}. Please try again." },
    "action.completeThis": { vi: "hoàn tất thao tác này", en: "complete this action" },
    // Common
    "common.search": { vi: "Tìm kiếm", en: "Search" },
    "common.save": { vi: "LƯU", en: "SAVE" },
    "common.all": { vi: "TẤT CẢ", en: "ALL" },
    "common.allPlant": { vi: "TẤT CẢ NHÀ MÁY", en: "ALL PLANT" },
  });

  init();
  document.addEventListener("DOMContentLoaded", () => {
    injectToggle();
    applyPage();
  });
})();
