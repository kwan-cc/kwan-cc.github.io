const toggleButton = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-nav-menu]");

if (toggleButton && menu) {
  const setExpanded = (open) => {
    menu.hidden = !open;
    toggleButton.setAttribute("aria-expanded", String(open));
  };

  setExpanded(false);

  toggleButton.addEventListener("click", () => {
    setExpanded(menu.hidden);
  });

  document.addEventListener("click", (event) => {
    if (menu.hidden) {
      return;
    }
    if (!menu.contains(event.target) && !toggleButton.contains(event.target)) {
      setExpanded(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setExpanded(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setExpanded(false);
    }
  });
}
