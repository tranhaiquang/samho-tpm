window.SAMHO_ERRORS = {
  message(error, action = "complete this action") {
    const detail = String(error?.message || error || "").toLowerCase();
    if (detail.includes("failed to fetch") || detail.includes("networkerror") || detail.includes("network request failed")) {
      return "Unable to connect. Please check your network and try again.";
    }
    if (detail.includes("row-level security") || detail.includes("permission denied") || detail.includes("not authorized")) {
      return `You do not have permission to ${action}.`;
    }
    if (detail.includes("duplicate key") || detail.includes("unique constraint")) {
      return "This record already exists. Please check the details and try again.";
    }
    if (detail.includes("invalid login") || detail.includes("invalid credentials")) {
      return "Your user ID or password is incorrect. Please try again.";
    }
    return `We couldn't ${action}. Please try again.`;
  }
};
