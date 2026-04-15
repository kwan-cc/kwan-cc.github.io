const tocToggle = document.querySelector("[data-toc-toggle]");
const tocPanel =
  document.querySelector("[data-toc-panel]") ||
  document.querySelector("[data-toc]");

if (tocToggle && tocPanel) {
  const setOpen = (open) => {
    tocPanel.hidden = !open;
    tocToggle.setAttribute("aria-expanded", String(open));
    tocPanel.setAttribute("aria-hidden", String(!open));
  };

  const initial = tocToggle.getAttribute("aria-expanded") === "true";
  setOpen(initial);

  tocToggle.addEventListener("click", () => {
    const isOpen = tocToggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });
}

const tocContainer = document.querySelector("[data-toc]") || tocPanel;
const tocLinks = tocContainer
  ? Array.from(tocContainer.querySelectorAll("a[href^='#']"))
  : [];
const headings = Array.from(document.querySelectorAll("h2[id]"));

if (tocLinks.length && headings.length) {
  const linkById = new Map(
    tocLinks.map((link) => [link.getAttribute("href").slice(1), link])
  );
  let activeId = null;

  const setActive = (id) => {
    if (!id || id === activeId) {
      return;
    }
    activeId = id;
    for (const link of tocLinks) {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "true" : "false");
      if (isActive) {
        link.dataset.active = "true";
      } else {
        delete link.dataset.active;
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "0px 0px -60% 0px",
      threshold: 0.1,
    }
  );

  for (const heading of headings) {
    observer.observe(heading);
  }

  const hash = window.location.hash.replace("#", "");
  if (hash && linkById.has(hash)) {
    setActive(hash);
  }

  window.addEventListener("hashchange", () => {
    const next = window.location.hash.replace("#", "");
    if (linkById.has(next)) {
      setActive(next);
    }
  });
}
