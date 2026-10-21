/* ---------- Sidebar móvil ---------- */
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("show");
  const burger = document.getElementById("burgerBtn");
  burger.setAttribute("aria-expanded", "true");
  burger.setAttribute("aria-label", "Cerrar menú");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  const burger = document.getElementById("burgerBtn");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Abrir menú");
}
document.getElementById("burgerBtn").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});
document.getElementById("overlay").addEventListener("click", closeSidebar);

/* ---------- Sidebar: contraer / expandir (escritorio) ---------- */
function setSidebarCollapsed(collapsed) {
  const sb = document.getElementById("sidebar");
  sb.classList.toggle("collapsed", collapsed);
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn) toggleBtn.textContent = collapsed ? "☰" : "☰";
  try {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  } catch (e) {}
}
function toggleSidebarCollapsed() {
  const sb = document.getElementById("sidebar");
  setSidebarCollapsed(!sb.classList.contains("collapsed"));
}
document
  .getElementById("sidebarToggle")
  .addEventListener("click", toggleSidebarCollapsed);
(function restoreSidebarState() {
  let saved = null;
  try {
    saved = localStorage.getItem("sidebarCollapsed");
  } catch (e) {}

  if (saved === null) {
    setSidebarCollapsed(true);
    return;
  }

  if (saved === "1") setSidebarCollapsed(true);
})();

/* ---------- Sidebar: tooltip flotante al hacer hover en los iconos ---------- */
(function initSidebarTooltips() {
  const sidebar = document.getElementById("sidebar");
  let tooltipEl = null;

  function showTooltip(target, force = false) {
    // Solo cuando el sidebar está colapsado (modo solo iconos) y en escritorio
    if (!force && !sidebar.classList.contains("collapsed")) return;
    if (target.matches(".nav-item[data-card]")) return;

    const text =
      target.getAttribute("title") || target.getAttribute("data-tooltip");
    if (!text) return;

    // Evitar que aparezca el tooltip nativo del navegador duplicado
    target.setAttribute("data-tooltip", text);
    target.removeAttribute("title");

    hideTooltip();
    tooltipEl = document.createElement("div");
    tooltipEl.className = "sidebar-tooltip";
    tooltipEl.textContent = text;
    document.body.appendChild(tooltipEl);

    const rect = target.getBoundingClientRect();
    tooltipEl.style.top = rect.top + rect.height / 2 + "px";
    const tooltipLeft = rect.right + 14 + tooltipEl.offsetWidth <= window.innerWidth
      ? rect.right + 14
      : Math.max(8, rect.left - tooltipEl.offsetWidth - 14);
    tooltipEl.style.left = tooltipLeft + "px";
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  }

  sidebar.addEventListener(
    "mouseenter",
    (e) => {
      const item = e.target.closest && e.target.closest(".nav-item");
      if (item) showTooltip(item);
    },
    true,
  );

  sidebar.addEventListener(
    "mouseleave",
    (e) => {
      const item = e.target.closest && e.target.closest(".nav-item");
      if (item) hideTooltip();
    },
    true,
  );

  // Ocultar si se colapsa/expande el sidebar mientras el mouse está encima
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", hideTooltip);

  // Ocultar al hacer scroll dentro del sidebar (evita que quede "flotando")
  sidebar.addEventListener("scroll", hideTooltip);

  const utilityNav = document.getElementById("utilityNav");
  utilityNav?.querySelectorAll(".utility-action, .utility-links__trigger").forEach((item) => {
    const text = item.getAttribute("title") || item.getAttribute("aria-label");
    if (!text) return;
    item.setAttribute("data-tooltip", text);
    item.setAttribute("aria-label", text);
    item.removeAttribute("title");
  });
  utilityNav?.addEventListener("mouseenter", (e) => {
    const item = e.target.closest?.(".utility-action, .utility-links__trigger");
    if (item) showTooltip(item, true);
  }, true);
  utilityNav?.addEventListener("mouseleave", (e) => {
    if (e.target.closest?.(".utility-action, .utility-links__trigger")) hideTooltip();
  }, true);
})();
