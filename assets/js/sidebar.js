document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const isMobileSidebar = () => window.matchMedia("(max-width: 980px)").matches;

  document.querySelector("#menuToggle")?.addEventListener("click", () => {
    if (isMobileSidebar()) {
      document.body.classList.toggle("sidebar-open");
      return;
    }

    document.body.classList.toggle("sidebar-collapsed");
  });

  document.querySelectorAll(".nav-head").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".nav-group");
      if (!group) return;

      const isCollapsed = group.classList.toggle("collapsed");
      button.setAttribute("aria-expanded", String(!isCollapsed));
    });
  });

  document.addEventListener("click", (event) => {
    if (!isMobileSidebar() || !document.body.classList.contains("sidebar-open")) return;
    if (event.target.closest(".sidebar") || event.target.closest(".sidebar-toggle")) return;
    document.body.classList.remove("sidebar-open");
  });

  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileSidebar()) document.body.classList.remove("sidebar-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") document.body.classList.remove("sidebar-open");
  });
});
