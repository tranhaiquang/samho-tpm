(function () {
  const SESSION_KEY = "samho.auth.session";
  const LOGIN_PAGE = "login.html";
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

  const currentPage = () => location.pathname.split("/").pop() || "index.html";

  const requireAuth = () => {
    if (currentPage() === LOGIN_PAGE) return;

    const session = getSession();
    if (!isSessionValid(session)) {
      clearSession();
      location.replace(LOGIN_PAGE);
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
    greeting.textContent = `Hello, ${displayName}`;
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
    requireAuth
  };

  requireAuth();
  document.addEventListener("DOMContentLoaded", () => {
    initLogoutButtons();
    initGreeting();
  });
})();
