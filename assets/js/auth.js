(function () {
  const SESSION_KEY = "samho.auth.session";
  // "." resolves to the site root (index.html -> login.html), which is the
  // canonical entry point. The login page rewrites its own URL to the same
  // place, so the filename never shows in the address bar.
  const LOGIN_PAGE = "./";
  const HOME_PAGE = "repair_submit.html";

  const getAuthBaseUrl = () => window.SAMHO_SUPABASE.url.replace("/rest/v1", "/auth/v1");

  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  };

  const saveSession = (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const isSessionValid = (session) => {
    return !!session?.access_token && Date.now() < (session.expires_at || 0);
  };

  const refreshToken = async () => {
    const session = getSession();
    if (!session?.refresh_token) return null;

    try {
      const response = await fetch(`${getAuthBaseUrl()}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: {
          apikey: window.SAMHO_SUPABASE.anonKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      if (!response.ok) return null;
      const data = await response.json();
      const updated = {
        ...session,
        ...data,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000
      };
      saveSession(updated);
      return updated;
    } catch {
      return null;
    }
  };

  // Detect the login page from the DOM, not the URL: login.html rewrites the
  // address bar to the site root, so the pathname no longer says "login.html".
  // A pathname check here would treat the login page as protected and loop.
  const isLoginDocument = () =>
    document.documentElement?.dataset?.page === "login" ||
    document.body?.classList.contains("login-page") === true;

  const requireAuth = async () => {
    if (isLoginDocument()) return;

    let session = getSession();
    if (!isSessionValid(session)) {
      if (session?.refresh_token) {
        session = await refreshToken();
      }
      if (!isSessionValid(session)) {
        clearSession();
        location.replace(LOGIN_PAGE);
      }
    }
  };

  const toAuthEmail = (userId) => {
    const value = userId.trim();
    return value.includes("@") ? value : `${value}@email.com`;
  };

  const currentUser = () => getSession()?.user || null;

  const currentUserId = () => {
    const user = currentUser();
    const email = String(user?.email || "").trim();
    const loginId = String(user?.user_metadata?.login_id || user?.user_metadata?.user_id || "").trim();
    return loginId || email.split("@")[0] || "";
  };

  const login = async (userId, password) => {
    const email = toAuthEmail(userId);

    const response = await fetch(`${getAuthBaseUrl()}/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: window.SAMHO_SUPABASE.anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || data.msg || "Login failed.");
    }

    saveSession({
      ...data,
      expires_at: Date.now() + data.expires_in * 1000
    });
    return data;
  };

  const logout = () => {
    clearSession();
    location.replace(LOGIN_PAGE);
  };

  const authHeaders = () => {
    const session = getSession();
    return isSessionValid(session) ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const initLogoutButtons = () => {
    document.querySelectorAll(".logout, [data-logout]").forEach((button) => {
      button.addEventListener("click", logout);
    });
  };

  const initGreeting = () => {
    const content = document.querySelector("main.content");
    if (!content) return;

    const user = currentUser();
    const displayName = String(user?.user_metadata?.display_name || currentUserId()).trim();
    if (!displayName) return;

    const greeting = document.createElement("header");
    greeting.className = "app-greeting";
    const displayNameSafe = displayName;
    greeting.textContent = window.SAMHO_LANG
      ? window.SAMHO_LANG.t("greeting.hello", { name: displayNameSafe })
      : `Hello, ${displayNameSafe}`;
    content.prepend(greeting);
  };

  window.SAMHO_AUTH = {
    authHeaders,
    clearSession,
    currentUser,
    currentUserId,
    getSession,
    homePage: HOME_PAGE,
    isSessionValid,
    login,
    logout,
    refreshToken,
    requireAuth
  };

  requireAuth();
  // Proactively refresh session every 5 minutes if expiring within 10 minutes
  setInterval(async () => {
    const session = getSession();
    if (!session?.refresh_token || !session?.expires_at) return;
    if (session.expires_at - Date.now() < 10 * 60 * 1000) {
      await refreshToken();
    }
  }, 5 * 60 * 1000);

  document.addEventListener("DOMContentLoaded", () => {
    initLogoutButtons();
    initGreeting();
  });
})();
