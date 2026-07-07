document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  document.querySelector("#menuToggle")?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
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
});
