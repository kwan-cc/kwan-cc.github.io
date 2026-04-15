import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs";

const modal = document.querySelector("[data-search-modal]");
const input = modal?.querySelector("[data-search-input]");
const results = modal?.querySelector("[data-search-results]");
const count = modal?.querySelector("[data-search-count]");
const overlay = modal?.querySelector("[data-search-overlay]");
const openButtons = document.querySelectorAll("[data-search-open]");
const closeButton = modal?.querySelector("[data-search-close]");
const pageBody = document.body;
const pageRoot = document.documentElement;
const mainContent = document.querySelector("#main-content");
const DEFAULT_LIMIT = 20;
let updateResults = null;
let isOpen = false;
let lastFocused = null;
let originalBodyPaddingRight = "";

const getFocusable = () => {
  if (!modal) {
    return [];
  }
  return Array.from(
    modal.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )
  );
};

const openModal = () => {
  if (!modal) {
    return;
  }
  lastFocused = document.activeElement;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  originalBodyPaddingRight = pageBody.style.paddingRight;
  const scrollbarWidth = window.innerWidth - pageRoot.clientWidth;
  if (scrollbarWidth > 0) {
    pageBody.style.paddingRight = `${scrollbarWidth}px`;
  }
  pageBody.setAttribute("data-modal-open", "true");
  if (mainContent) {
    mainContent.setAttribute("aria-hidden", "true");
    mainContent.setAttribute("inert", "");
  }
  isOpen = true;
  if (input) {
    input.focus();
  }
  if (typeof updateResults === "function") {
    updateResults();
  }
};

const closeModal = () => {
  if (!modal) {
    return;
  }
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  pageBody.removeAttribute("data-modal-open");
  pageBody.style.paddingRight = originalBodyPaddingRight;
  if (mainContent) {
    mainContent.removeAttribute("aria-hidden");
    mainContent.removeAttribute("inert");
  }
  isOpen = false;
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus();
  }
};

if (openButtons.length > 0) {
  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });
}

if (closeButton) {
  closeButton.addEventListener("click", () => {
    closeModal();
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && isOpen) {
    const focusable = getFocusable();
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "Escape" && isOpen) {
    closeModal();
  }
});

if (!input || !results) {
  console.warn("Search modal elements not found");
} else {
  const createResultItem = (item) => {
    const li = document.createElement("li");
    const title = document.createElement("a");
    title.href = item.path;
    title.textContent = item.title;
    title.className = "text-lg font-semibold link-primary hover:underline";

    const meta = document.createElement("p");
    meta.textContent = item.description || "";
    meta.className = "text-sm text-[var(--color-muted)]";

    const taxonomy = document.createElement("p");
    taxonomy.textContent = [item.category, item.subcategory].filter(Boolean).join(" / ");
    taxonomy.className = "text-xs uppercase tracking-wide text-[var(--color-muted)]";

    li.className = "space-y-1";
    li.append(title, meta, taxonomy);
    return li;
  };

  const renderResults = (items) => {
    results.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const item of items) {
      fragment.append(createResultItem(item));
    }

    results.append(fragment);
    if (count) {
      count.textContent = String(items.length);
    }
  };

  const loadIndex = async () => {
    const indexUrl = new URL("/search-index.json", window.location.origin);
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error("Failed to load search index");
    }
    return response.json();
  };

  const setupSearch = async () => {
    const data = await loadIndex();
    const fuse = new Fuse(data, {
      keys: ["title", "description", "category", "subcategory"],
      threshold: 0.4,
      includeScore: true,
    });

    const update = () => {
      const query = input.value.trim();
      const items = query
        ? fuse.search(query).map((result) => result.item)
        : data.slice(0, DEFAULT_LIMIT);
      renderResults(items.slice(0, 50));
    };

    input.addEventListener("input", update);
    update();
    updateResults = update;
  };

  setupSearch().catch((error) => {
    results.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = "Search is unavailable right now.";
    message.className = "text-sm text-[var(--color-muted)]";
    results.append(message);
    if (count) {
      count.textContent = "0";
    }
    console.warn(error);
  });
}
