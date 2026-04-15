const carousels = document.querySelectorAll("[data-carousel]");

const updateControls = (track, prev, next) => {
  const maxScroll = track.scrollWidth - track.clientWidth;
  const current = track.scrollLeft;
  if (prev) {
    prev.disabled = current <= 4;
  }
  if (next) {
    next.disabled = current >= maxScroll - 4;
  }
};

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const prev = carousel.parentElement?.querySelector("[data-carousel-prev]") ??
    carousel.querySelector("[data-carousel-prev]");
  const next = carousel.parentElement?.querySelector("[data-carousel-next]") ??
    carousel.querySelector("[data-carousel-next]");

  if (!track) {
    return;
  }

  const scrollByAmount = () => Math.max(track.clientWidth * 0.9, 240);

  if (prev) {
    prev.addEventListener("click", () => {
      track.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      track.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
    });
  }

  track.addEventListener("scroll", () => updateControls(track, prev, next));
  window.addEventListener("resize", () => updateControls(track, prev, next));
  updateControls(track, prev, next);
});
