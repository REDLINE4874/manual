/* ---------- Sidebar móvil ---------- */
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}
document.getElementById("burgerBtn").addEventListener("click", openSidebar);
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

  function showTooltip(target) {
    // Solo cuando el sidebar está colapsado (modo solo iconos) y en escritorio
    if (!sidebar.classList.contains("collapsed")) return;

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
    tooltipEl.style.left = rect.right + 14 + "px";
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
})();
