/* Inicializa las vistas, calculadoras y navegación de la aplicación. */
renderNav();
renderHome();
renderDigitos();
initCalculators();
if (typeof initProfilingModule === "function") { initProfilingModule(); }
showView("home");

const utilityLinks = document.getElementById("utilityLinks");
const utilityNav = document.querySelector(".utility-nav");
const utilityActions = utilityNav?.querySelector(".utility-nav__actions");
document
  .querySelectorAll('.utility-nav__actions .utility-action[data-view="documentos"]')
  .forEach((button) => button.remove());

function fitUtilityActions() {
  if (!utilityNav || !utilityActions) return;
  utilityNav.classList.remove("utility-nav--icons");
  utilityNav.classList.remove("utility-nav--actions-inline");

  const items = [...utilityActions.children];
  const actionGap = Number.parseFloat(getComputedStyle(utilityActions).columnGap) || 0;
  const navGap = Number.parseFloat(getComputedStyle(utilityNav).columnGap) || 0;
  const brand = utilityNav.querySelector(".utility-brand");
  const brandLogo = brand?.querySelector("img");
  const updated = utilityNav.querySelector(".utility-nav__updated");
  const appearance = utilityNav.querySelector(".utility-nav__appearance");
  const actionWidth = () => items.reduce((width, item) => width + item.getBoundingClientRect().width, 0)
    + Math.max(0, items.length - 1) * actionGap;
  const fixedWidth = () => (brandLogo?.getBoundingClientRect().width || brand?.scrollWidth || 0)
    + (updated?.scrollWidth || 0)
    + (appearance?.scrollWidth || 0)
    + navGap * 3;
  const fitsInline = () => fixedWidth() + actionWidth() <= utilityNav.clientWidth + 1;

  if (window.innerWidth <= 1300 || !fitsInline()) {
    utilityNav.classList.add("utility-nav--icons");
  }
  utilityNav.classList.toggle("utility-nav--actions-inline", fitsInline());
}

if (utilityActions) {
  if ("ResizeObserver" in window) {
    new ResizeObserver(fitUtilityActions).observe(utilityActions);
  }
  window.addEventListener("resize", fitUtilityActions);
  window.addEventListener("load", fitUtilityActions);
  document.fonts?.ready.then(fitUtilityActions);
  requestAnimationFrame(fitUtilityActions);
}

const utilityLinksTrigger = utilityLinks?.querySelector(".utility-links__trigger");
utilityLinksTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = utilityLinks.classList.toggle("is-open");
  utilityLinksTrigger.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", () => {
  utilityLinks?.classList.remove("is-open");
  utilityLinksTrigger?.setAttribute("aria-expanded", "false");
});

const internalTabs = document.getElementById("internalTabs");
internalTabs?.querySelector('.internal-tab[data-view="documentos"]')?.remove();
let draggedTab = null;

function lockParentScrollOnFrame(frame) {
  const lock = () => document.body.classList.add("iframe-scroll-active");
  const unlock = () => document.body.classList.remove("iframe-scroll-active");
  frame.addEventListener("mouseenter", lock);
  frame.addEventListener("mouseleave", unlock);
  frame.addEventListener("focus", lock);
  frame.addEventListener("blur", unlock);
}

document.querySelectorAll("iframe").forEach(lockParentScrollOnFrame);

internalTabs?.querySelectorAll(".internal-tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
  tab.addEventListener("dragstart", () => {
    draggedTab = tab;
    tab.classList.add("is-dragging");
  });
  tab.addEventListener("dragend", () => {
    draggedTab = null;
    tab.classList.remove("is-dragging");
    internalTabs.querySelectorAll(".internal-tab").forEach((item) => item.classList.remove("is-over"));
  });
  tab.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (draggedTab && draggedTab !== tab) tab.classList.add("is-over");
  });
  tab.addEventListener("dragleave", () => tab.classList.remove("is-over"));
  tab.addEventListener("drop", (event) => {
    event.preventDefault();
    tab.classList.remove("is-over");
    if (!draggedTab || draggedTab === tab) return;
    const tabs = [...internalTabs.children];
    const draggedIndex = tabs.indexOf(draggedTab);
    const targetIndex = tabs.indexOf(tab);
    internalTabs.insertBefore(draggedTab, draggedIndex < targetIndex ? tab.nextSibling : tab);
  });
});

const FLOATING_WINDOWS = {
  documentos: {
    title: "Formalización",
    url: "https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing",
  },
  guia: {
    title: "Script",
    url: "https://docs.google.com/document/d/1Zz8njzGEmzn64qu22OI75u31GSvuI3hcPHY3It_ZqzI/preview",
  },
};

let floatingWindowZ = 121;

function openFloatingWindow(view) {
  const config = FLOATING_WINDOWS[view];
  if (!config) return;

  const existing = document.querySelector(`.floating-window[data-view="${view}"]`);
  if (existing) {
    existing.hidden = false;
    existing.classList.remove("is-minimized");
    existing.style.zIndex = ++floatingWindowZ;
    return;
  }

  const windowElement = document.createElement("section");
  windowElement.className = "floating-window";
  windowElement.dataset.view = view;
  windowElement.setAttribute("aria-label", `Ventana de ${config.title}`);
  windowElement.style.zIndex = ++floatingWindowZ;
  windowElement.innerHTML = `
    <header class="floating-window__bar">
      <span class="floating-window__title">${config.title}</span>
      <button class="floating-window__control" type="button" data-window-action="minimize" title="Minimizar">−</button>
      <button class="floating-window__control" type="button" data-window-action="maximize" title="Maximizar">□</button>
      <button class="floating-window__control" type="button" data-window-action="close" title="Cerrar">×</button>
    </header>
    <div class="floating-window__body">
      <div class="floating-window__toolbar" aria-label="Controles de lectura">
        <span>Zoom</span>
        <button type="button" class="floating-window__zoom" data-zoom-action="decrease" title="Reducir zoom">−</button>
        <output class="floating-window__zoom-value">100%</output>
        <button type="button" class="floating-window__zoom" data-zoom-action="increase" title="Aumentar zoom">+</button>
        <button type="button" class="floating-window__zoom-reset" data-zoom-action="reset">Restablecer</button>
      </div>
      <div class="floating-window__viewport">
        <iframe src="${config.url}" title="${config.title}" loading="lazy"></iframe>
      </div>
      <span class="floating-window__resize" aria-hidden="true"></span>
    </div>`;

  document.body.appendChild(windowElement);
  lockParentScrollOnFrame(windowElement.querySelector("iframe"));
  makeFloatingWindowInteractive(windowElement);
}

function makeFloatingWindowInteractive(windowElement) {
  const bar = windowElement.querySelector(".floating-window__bar");
  const resizeHandle = windowElement.querySelector(".floating-window__resize");
  const viewport = windowElement.querySelector(".floating-window__viewport");
  const frame = viewport.querySelector("iframe");
  const zoomValue = windowElement.querySelector(".floating-window__zoom-value");
  let zoom = 1;
  let dragState = null;
  let resizeState = null;

  const applyZoom = () => {
    frame.style.width = `${100 / zoom}%`;
    frame.style.height = `${100 / zoom}%`;
    frame.style.transform = `scale(${zoom})`;
    zoomValue.value = `${Math.round(zoom * 100)}%`;
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  };
  applyZoom();

  windowElement.addEventListener("pointerdown", () => {
    windowElement.style.zIndex = ++floatingWindowZ;
  });

  bar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = windowElement.getBoundingClientRect();
    dragState = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    bar.setPointerCapture(event.pointerId);
  });
  bar.addEventListener("pointermove", (event) => {
    if (!dragState) return;
    windowElement.style.left = `${Math.max(0, event.clientX - dragState.offsetX)}px`;
    windowElement.style.top = `${Math.max(0, event.clientY - dragState.offsetY)}px`;
  });
  bar.addEventListener("pointerup", () => { dragState = null; });

  resizeHandle.addEventListener("pointerdown", (event) => {
    const rect = windowElement.getBoundingClientRect();
    resizeState = { startX: event.clientX, startY: event.clientY, width: rect.width, height: rect.height };
    resizeHandle.setPointerCapture(event.pointerId);
  });
  resizeHandle.addEventListener("pointermove", (event) => {
    if (!resizeState) return;
    windowElement.style.width = `${Math.max(360, resizeState.width + event.clientX - resizeState.startX)}px`;
    windowElement.style.height = `${Math.max(260, resizeState.height + event.clientY - resizeState.startY)}px`;
  });
  resizeHandle.addEventListener("pointerup", () => { resizeState = null; });

  windowElement.querySelectorAll("[data-window-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.windowAction;
      if (action === "close") windowElement.remove();
      if (action === "minimize") windowElement.classList.toggle("is-minimized");
      if (action === "maximize") {
        const maximized = windowElement.dataset.maximized === "true";
        windowElement.dataset.maximized = String(!maximized);
        windowElement.style.left = maximized ? "7%" : "0";
        windowElement.style.top = maximized ? "9%" : "0";
        windowElement.style.width = maximized ? "min(86vw,1280px)" : "100vw";
        windowElement.style.height = maximized ? "min(82vh,860px)" : "100vh";
      }
    });
  });

  windowElement.querySelectorAll("[data-zoom-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.zoomAction;
      if (action === "increase") zoom = Math.min(1.6, zoom + 0.1);
      if (action === "decrease") zoom = Math.max(0.8, zoom - 0.1);
      if (action === "reset") zoom = 1;
      applyZoom();
    });
  });
}
