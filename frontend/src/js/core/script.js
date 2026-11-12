/* Inicializa las vistas, calculadoras y navegación de la aplicación. */
renderNav();
renderHome();
renderDigitos();
initCalculators();
if (typeof initProfilingModule === "function") { initProfilingModule(); }
showView("home");

const utilityLinks = document.getElementById("utilityLinks");
const utilityNav = document.querySelector(".utility-nav");
document
  .querySelectorAll('.utility-nav__actions .utility-action[data-view="documentos"]')
  .forEach((button) => button.remove());

function updateUtilityNavOverflow() {
  if (!utilityNav) return;
  utilityNav.classList.toggle(
    "utility-nav--scrollable",
    utilityNav.scrollWidth > utilityNav.clientWidth + 1
  );
}

if (utilityNav) {
  if ("ResizeObserver" in window) {
    const navResizeObserver = new ResizeObserver(updateUtilityNavOverflow);
    [utilityNav, ...utilityNav.children].forEach((item) => navResizeObserver.observe(item));
  }
  window.addEventListener("resize", updateUtilityNavOverflow);
  window.addEventListener("load", updateUtilityNavOverflow);
  document.fonts?.ready.then(updateUtilityNavOverflow);
  requestAnimationFrame(updateUtilityNavOverflow);
}

const mobileNavigationMedia = window.matchMedia("(max-width: 900px)");
const mobileNavigationActions = utilityNav?.querySelector(".utility-nav__actions");
const mobileNavigationContainer = document.getElementById("navContainer");
const mobileHomeButton = mobileNavigationContainer?.querySelector('.nav-item[data-view="home"]');
const mobileHomeLabel = mobileHomeButton?.querySelector(".nav-label");
const originalMobileHomeLabel = mobileHomeLabel?.textContent ?? "";
const mobileInternalTabs = document.getElementById("internalTabs");
const mobileMoreButton = document.createElement("button");
mobileMoreButton.className = "mobile-navigation-more-toggle";
mobileMoreButton.type = "button";
mobileMoreButton.setAttribute("aria-controls", "mobileNavigationMore");
mobileMoreButton.setAttribute("aria-expanded", "false");
mobileMoreButton.setAttribute("aria-label", "Más opciones");
mobileMoreButton.innerHTML = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="5" cy="12" r="1.6" fill="currentColor"></circle>
    <circle cx="12" cy="12" r="1.6" fill="currentColor"></circle>
    <circle cx="19" cy="12" r="1.6" fill="currentColor"></circle>
  </svg>
  <span>Más</span>`;

const mobileMorePanel = document.createElement("section");
mobileMorePanel.className = "mobile-navigation-more";
mobileMorePanel.id = "mobileNavigationMore";
mobileMorePanel.setAttribute("aria-labelledby", "mobileNavigationMoreTitle");
mobileMorePanel.hidden = true;

const mobileMoreTitle = document.createElement("h2");
mobileMoreTitle.id = "mobileNavigationMoreTitle";
mobileMoreTitle.textContent = "Más opciones";

const mobileMoreSections = document.createElement("div");
mobileMoreSections.className = "mobile-navigation-more__sections";
const mobileCardSection = document.createElement("section");
mobileCardSection.className = "mobile-navigation-more__cards";
const mobileCardHeading = document.createElement("h3");
mobileCardHeading.textContent = "Tarjetas";
mobileCardSection.append(mobileCardHeading);

const mobileToolsSection = document.createElement("section");
mobileToolsSection.className = "mobile-navigation-more__tools";
const mobileToolsHeading = document.createElement("h3");
mobileToolsHeading.textContent = "Herramientas y preferencias";
const mobileToolsItems = document.createElement("div");
mobileToolsItems.className = "mobile-navigation-more__items";
mobileToolsSection.append(mobileToolsHeading, mobileToolsItems);
mobileMoreSections.append(mobileCardSection, mobileToolsSection);
mobileMorePanel.append(mobileMoreTitle, mobileMoreSections);
mobileMoreButton.addEventListener("click", () => {
  const isOpen = mobileMorePanel.hidden;
  mobileMorePanel.hidden = !isOpen;
  mobileMoreButton.setAttribute("aria-expanded", String(isOpen));
});
mobileMorePanel.addEventListener("click", (event) => {
  const action = event.target.closest(
    'a[href], .nav-item[data-card], .nav-item[data-view], .internal-tab, .utility-action[data-view], #adminNavButton, #authButton',
  );
  if (action) {
    mobileMorePanel.hidden = true;
    mobileMoreButton.setAttribute("aria-expanded", "false");
    mobileMoreButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (
    !mobileMorePanel.hidden &&
    !mobileMorePanel.contains(event.target) &&
    !mobileMoreButton.contains(event.target)
  ) {
    mobileMorePanel.hidden = true;
    mobileMoreButton.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMorePanel.hidden) {
    mobileMorePanel.hidden = true;
    mobileMoreButton.setAttribute("aria-expanded", "false");
    mobileMoreButton.focus();
  }
});

utilityNav?.append(mobileMoreButton);
utilityNav?.after(mobileMorePanel);

const mobileNavigationItems = [
  { element: mobileNavigationContainer, target: mobileCardSection },
  { element: mobileHomeButton, target: utilityNav },
  { element: mobileInternalTabs, target: mobileToolsItems },
  { element: utilityLinks, target: mobileToolsItems },
  { element: utilityNav?.querySelector(".utility-nav__updated"), target: mobileToolsItems },
  { element: utilityNav?.querySelector(".utility-nav__appearance"), target: mobileToolsItems },
  { element: document.getElementById("adminNavButton"), target: mobileToolsItems },
  { element: document.getElementById("authButton"), target: mobileToolsItems },
]
  .filter((item) => item.element)
  .map((item) => ({ ...item, placeholder: null }));

function updateMobileMoreButtonState() {
  const hasActiveItem = mobileMorePanel.querySelector(
    ".nav-item.active, .internal-tab.is-active, .utility-action.active",
  );
  mobileMoreButton.classList.toggle("active", Boolean(hasActiveItem));
}

const mobileMoreObserver = new MutationObserver(updateMobileMoreButtonState);
mobileMoreObserver.observe(mobileMorePanel, {
  subtree: true,
  attributes: true,
  attributeFilter: ["class"],
});

function updateMobileNavigation() {
  if (!utilityNav || !mobileNavigationActions) return;

  const isMobile = mobileNavigationMedia.matches;
  utilityNav.classList.toggle("utility-nav--mobile", isMobile);

  if (isMobile) {
    if (!mobileNavigationItems[0].placeholder) {
      if (typeof closeSidebar === "function") closeSidebar();
      mobileNavigationItems.forEach((item) => {
        item.placeholder = document.createComment("");
        item.element.before(item.placeholder);
        if (item.element === mobileHomeButton) utilityNav.prepend(item.element);
        else item.target.append(item.element);
      });
    }
    if (mobileHomeLabel) mobileHomeLabel.textContent = "Inicio";
    mobileHomeButton?.setAttribute("aria-label", "Inicio");
    utilityNav.setAttribute("aria-label", "Navegación principal");
  } else {
    mobileMorePanel.hidden = true;
    mobileMoreButton.setAttribute("aria-expanded", "false");
    mobileNavigationItems.forEach((item) => {
      if (item.placeholder?.isConnected) item.placeholder.replaceWith(item.element);
      item.placeholder = null;
    });
    if (mobileHomeLabel) mobileHomeLabel.textContent = originalMobileHomeLabel;
    mobileHomeButton?.removeAttribute("aria-label");
    utilityNav.setAttribute("aria-label", "Herramientas del manual");
  }

  updateMobileMoreButtonState();
  updateUtilityNavOverflow();
}

window.addEventListener("resize", updateMobileNavigation);
updateMobileNavigation();

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
