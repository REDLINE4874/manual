/* Eventos declarativos de la estructura principal del manual. */

document.addEventListener("click", (event) => {
  const viewTrigger = event.target.closest("[data-view]");
  if (viewTrigger && viewTrigger.tagName !== "A") {
    event.preventDefault();
    showView(viewTrigger.dataset.view);
    return;
  }

  const linkTrigger = event.target.closest("a[data-view]");
  if (linkTrigger) {
    event.preventDefault();
    showView(linkTrigger.dataset.view);
    return;
  }

  const floatingTrigger = event.target.closest("[data-floating-view]");
  if (floatingTrigger) {
    openFloatingWindow(floatingTrigger.dataset.floatingView);
  }
});
