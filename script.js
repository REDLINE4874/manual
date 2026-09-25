
let currentScript = "";
let currentCardName = "";
const CARDS = Object.values(window.CARD_DATA || {});

const SEGMENTS = [
  { id: "clasico", label: "Segmento Clásico", bar: "#009CC6" },
  { id: "oro", label: "Segmento Oro", bar: "#A9863B" },
  { id: "platinum", label: "Segmento Platinum", bar: "#5B6367" },
];

const REDENCION_ITEMS = [
  {
    id: 1,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
    text: "Para pagar la comisión por administración / anualidad de tu Tarjeta de Crédito",
  },
  {
    id: 2,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    text: "Abona tus puntos como dinero al saldo de tu Tarjeta de Crédito",
  },
  {
    id: 3,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    text: `<strong>Productos del catálogo:</strong> Cambia tus Puntos por productos de nuestro exclusivo catálogo, solo entra a www.banamexrewards.com`,
  },
  {
    id: 4,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="10" height="14" rx="2"></rect><path d="M5 7V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path><rect x="14" y="11" width="8" height="6" rx="1"></rect><circle cx="16" cy="18" r="1.5"></circle><circle cx="20" cy="18" r="1.5"></circle></svg>`,
    text: "Cambia tus Puntos por noches de hotel, renta de autos o para vivir experiencias increíbles",
  },
  {
    id: 5,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="12" cy="14" r="2"></circle></svg>`,
    text: "Cambia tus Puntos por certificados electrónicos",
  },
  {
    id: 6,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    text: `<strong>Paga con tus Puntos en los siguientes puntos de venta:</strong> Liverpool, La Comer, Soriana, Sumesa, City Market, Fresko La Comer`,
  },
  {
    id: 7,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"></path></svg>`,
    text: `Obtén una tarifa fija en puntos para volar en cualquier temporada, solo es necesario reservar con 21 días de anticipación en la página www.banamex.com/momentosbanamex`,
  },
  {
    id: 8,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    text: `<strong>Catálogo de mercancía:</strong> cambia tus Puntos por artículos del catálogo, incluyendo productos Apple dentro del sitio www.banamexrewards.com`,
  },
];

function renderRedencionPuntos() {
  return `
    <div class="redencion-container">
      <header class="section-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        </div>
        <h2>2. REDENCIÓN</h2>
      </header>

      <div class="redencion-grid">
        ${REDENCION_ITEMS.map(
          (item) => `
            <article class="redencion-card">
              <div class="redencion-card-icon">${item.icon}</div>
              <div class="redencion-card-content">
                <span class="step-badge">${item.id}</span>
                <p>${item.text}</p>
              </div>
            </article>
          `,
        ).join("")}
      </div>
    </div>
  `;
}

function renderExploraBenefitsTable(data) {
  const rows = Array.isArray(data) ? data : data && Array.isArray(data.rows) ? data.rows : [];
  const destinations = data && !Array.isArray(data) && data.destinations ? data.destinations : null;
  const certificates = data && !Array.isArray(data) && data.certificates ? data.certificates : null;

  if (destinations || certificates) {
    const usList = destinations?.us || [];
    const nationalList = destinations?.national || [];

    const certificateCards = (certificates || [])
      .map((item) => {
        const icon = item.icon === "cake"
          ? '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 30h40v6H12zm4-8h32v8H16zm-4 8h40v4H12zm0 0v10h40V30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 22h24v10H20zm-2-8h28v8H18zm9 0v8m14-8v8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M26 40h12v10H26z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20 50h24M24 58h16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'
          : '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="26" width="48" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="18" y="16" width="30" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M22 26V16M42 26V16M12 42h40M18 50h30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M32 26v24M26 32h12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

        return `
          <article class="explora-certificate-card">
            <div class="explora-certificate-icon">${icon}</div>
            <div class="explora-certificate-copy">
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </div>
          </article>
        `;
      })
      .join("");

    return `
      <div class="extra-block explora-table-block" style="margin-top:22px;">
        <div class="explora-destinations-grid">
          <div class="explora-destination-group">
            <h3>Destinos a EEUU</h3>
            <ul class="explora-destination-list">
              ${usList.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          <div class="explora-destination-group">
            <h3>Destinos nacionales</h3>
            <ul class="explora-destination-list">
              ${nationalList.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        </div>

        <h2 class="explora-certificate-title">Obtén tu certificado 2x1 al cumplir con los requisitos</h2>

        <div class="explora-certificate-grid">
          ${certificateCards}
        </div>
      </div>
    `;
  }

  if (rows.length) {
    return `
      <div class="extra-block explora-table-block" style="margin-top:22px;">
        <h2>Destinos y certificado 2x1 (beneficios de viaje)</h2>
        <div class="explora-table-wrap">
          <table class="explora-benefits-table">
            <thead>
              <tr>
                <th>Beneficio</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                    <tr>
                      <td>${row.beneficio}</td>
                      <td>${row.descripcion}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return "";
}

/* ============================================================
   DATOS: dígitos por banco
   Para agregar las imágenes de cada banco, sustituye el arreglo
   "images" con las rutas de tus archivos, por ejemplo:
   images: ["img/invex-1.png", "img/invex-2.png", "img/invex-3.png"]
   ============================================================ */
const DIGITOS = [
  { id: "invex", name: "INVEX", images: ["img/INX-2.jpeg", "img/INX-1.jpeg"] },
  { id: "bbva", name: "BBVA", images: ["img/BBVA-1.jpeg", "img/BBVA-2.jpeg"] },
  {
    id: "banamex",
    name: "BANAMEX",
    images: [
      "img/BANA-1.jpeg",
      "img/BANA-2.jpeg",
      "img/BANA-3.jpeg",
      "img/BANA-4.jpeg",
      "img/BANA-5.jpeg",
    ],
  },
  {
    id: "plata",
    name: "PLATA Card",
    images: [
      "img/Plata-1.jpeg",
      "img/Plata-2.jpeg",
      "img/Plata-3.jpeg",
      "img/Plata-4.jpeg",
    ],
  },
  { id: "nu", name: "NU", images: [] },
  { id: "C&A", name: "C&A Bradescard", images: ["img/CYA-1.jpeg"] },
];

/* ============================================================
   RENDER: navegación lateral
   ============================================================ */
const EXTERNAL_LINKS = [
  {
    name: "Agendas",
    url: "https://agendas-rab6.onrender.com/",
    icon: "assets/agenda.svg",
  },
  {
    name: "Vicidial",
    url: "https://aliadosmed.directo.com/agc/vicidial.php",
    icon: "assets/dial.svg",
  },
  {
    name: "CRM",
    url: "http://aliados.medc.com.mx:7070/MA_ALIADOS",
    icon: "assets/crm.svg",
  },
  {
    name: "Renapo (CURP)",
    url: "https://www.gob.mx/curp",
    icon: "assets/curp.svg",
  },
  {
    name: "Formalización",
    url: "https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing",
    icon: "assets/drive.svg",
  },
];

function renderNav() {
  const nav = document.getElementById("navContainer");
  let html = "";
  SEGMENTS.forEach((seg) => {
    html += `<div class="nav-group">
      <div class="nav-group-label">${seg.label}</div>`;
    CARDS.filter((c) => c.segment === seg.id).forEach((c) => {
      const shortName = c.name.replace(" Banamex", "");
      html += `<button class="nav-item" data-card="${c.id}" onclick="openCard('${c.id}')" title="${shortName}">
        <span class="dot" style="background:${c.color}"></span><span class="nav-label">${shortName}</span>
      </button>`;
    });
    html += `</div>`;
  });

  html += `<div class="nav-group nav-dropdown-group">
    <button class="nav-item nav-dropdown-trigger" type="button" aria-expanded="false" title="Enlaces">
      <svg class="nav-svg-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.5 13.5l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
        <path d="M8 15.5l-2.5 2.5a3 3 0 1 1-4.2-4.2L3.8 11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
        <path d="M16 8.5l2.5-2.5a3 3 0 1 1 4.2 4.2L20.2 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="2" fill="none"></circle>
      </svg>
      <span class="nav-label">Enlaces</span>
      <span class="caret">▾</span>
    </button>
    <div class="nav-submenu">${EXTERNAL_LINKS.map((link) => `
      <a class="nav-item nav-subitem" href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}">
        <span class="ico" style="-webkit-mask-image:url('${link.icon}');mask-image:url('${link.icon}')"></span>
        <span class="nav-label">${link.name}</span>
        <span class="ext-arrow">↗</span>
      </a>
    `).join("")}</div>
  </div>`;

  nav.innerHTML = html;

  const dropdownTrigger = nav.querySelector(".nav-dropdown-trigger");
  if (dropdownTrigger) {
    dropdownTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const group = dropdownTrigger.closest(".nav-dropdown-group");
      const isOpen = group.classList.toggle("expanded");
      dropdownTrigger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.addEventListener("click", (event) => {
    const group = event.target.closest(".nav-dropdown-group");
    document.querySelectorAll(".nav-dropdown-group").forEach((item) => {
      if (item !== group) {
        item.classList.remove("expanded");
        item.querySelector(".nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
      }
    });
  });

  const calc = document.createElement("div");
  calc.className = "nav-calc";
  calc.innerHTML = `<button class="nav-item" data-view="puntos" onclick="showView('puntos')" title="Calculadora de puntos"><span class="ico" style="-webkit-mask-image:url('assets/cal.svg');mask-image:url('assets/cal.svg')"></span><span class="nav-label">Calculadora de puntos</span></button>
  <button class="nav-item" data-view="digitos" onclick="showView('digitos')" title="Dígitos"><span class="ico" style="-webkit-mask-image:url('assets/dig.svg');mask-image:url('assets/dig.svg')"></span><span class="nav-label">Dígitos</span></button>`;
  document.getElementById("sidebar").appendChild(calc);

  // add a home nav item at very top of nav container (before groups)
  const homeBtn = document.createElement("button");
  homeBtn.className = "nav-item";
  homeBtn.setAttribute("data-view", "home");
  homeBtn.title = "Inicio / Menú general";
  homeBtn.innerHTML =
    '<span class="ico" style="-webkit-mask-image:url(\'assets/home.svg\');mask-image:url(\'assets/home.svg\')"></span><span class="nav-label">Inicio / Menú general</span>';
  homeBtn.onclick = () => showView("home");
  nav.prepend(homeBtn);
}

/* ============================================================
   RENDER: grid del menú principal (home)
   ============================================================ */
function renderHome() {
  const cont = document.getElementById("segmentsContainer");
  let html = "";
  SEGMENTS.forEach((seg) => {
    html += `<div class="segment-block">
      <div class="segment-title"><span class="bar" style="background:${seg.bar}"></span>${seg.label}</div>
      <div class="card-grid">`;
    CARDS.filter((c) => c.segment === seg.id).forEach((c) => {
      html += `<button class="tcard" onclick="openCard('${c.id}')">
        <img src="${c.image}" alt="${c.name}">
        <div class="tc-body">
          <div class="tc-name">${c.name}</div>
          <div class="tc-meta">Ingresos desde ${c.income} · CAT ${c.cat}</div>
        </div>
      </button>`;
    });
    html += `</div></div>`;
  });
  cont.innerHTML = html;
}

/* ============================================================
   RENDER: detalle de tarjeta
   ============================================================ */
function openCard(id) {
  const c = CARDS.find((x) => x.id === id);
  if (!c) return;
  currentScript = c.script || "";
  currentCardName = c.name;
  const seg = SEGMENTS.find((s) => s.id === c.segment);
  const cont = document.getElementById("cardDetailContainer");

  const benefitsHtml =
    c.benefits && c.benefits.length
      ? `
    <ul class="benefits-list">
      ${c.benefits.map((b) => `<li>${b}</li>`).join("")}
    </ul>`
      : '<p class="script-text">Sin beneficios adicionales registrados.</p>';

  const scriptHtml = c.script
    ? `<p class="script-text">${c.script}</p>`
    : '<p class="script-text">Sin script registrado.</p>';

  const bonifHtml = Array.isArray(c.bonification)
    ? `<ol class="bonif-list">${c.bonification.map((step) => `<li>${step}</li>`).join("")}</ol>`
    : c.bonification
      ? `<p class="script-text">${c.bonification}</p>`
      : '<p class="script-text">No aplica.</p>';

  const vigenciasHtml = c.validity
    ? `<p class="script-text">${c.validity}</p>`
    : '<p class="script-text">Sin información de vigencia.</p>';

  const redencionHtml = ["descubre", "explora"].includes(c.id)
    ? renderRedencionPuntos()
    : "";

  const extraContentHtml = c.id === "explora" && c.travelBenefitsTable
    ? renderExploraBenefitsTable(c.travelBenefitsTable)
    : c.extraImage
      ? `<div class="extra-block" style="margin-top:22px;"><h2>${c.extraTitle}</h2><img src="${c.extraImage}" alt="Beneficios ${c.name}"></div>`
      : "";

  cont.innerHTML = `
    <h1 class="detail-page-title">${c.name}</h1>

    <div class="detail-header">
      <div class="detail-img-col">
        <div class="detail-segment-tag"><span class="dot" style="background:${c.color}"></span>${seg.label}</div>
        <div class="detail-img-wrap"><img src="${c.image}" alt="${c.name}"></div>
      </div>

      <div class="costos-panel" style="--accent:${c.color}">
        <div class="costos-title">Costos y comisiones</div>
        <div class="costos-grid">
          <div class="stat"><div class="label">Ingresos mensuales</div><div class="value">${c.income}</div></div>
          <div class="stat"><div class="label">CAT anual</div><div class="value">${c.cat}</div></div>
          <div class="stat"><div class="label">Tasa de interés anual</div><div class="value">${c.rate}</div></div>
          <div class="stat"><div class="label">Administración mensual</div><div class="value">${c.admin}</div></div>
          <div class="stat"><div class="label">Adicional</div><div class="value">${c.additional}</div></div>
          <div class="stat stat-button" onclick="openScript()">
          <div class="script-icon"></div><div class="label">Script de venta</div><div class="value">Haz clic para visualizar →</div></div></div>
        </div>
      </div>
    </div>
      <div class="waiver-block">
          <div class="waiver-title">${c.id === "joy" ? "Sin comisión de administración de por vida" : "Bonificación de administración mensual"}</div>
          ${bonifHtml}</div>
     
    <div class="detail-two-col">
      <div class="extra-block"><h2>Beneficios</h2>${benefitsHtml}</div>
      <div class="extra-block"><h2>Vigencias</h2>${vigenciasHtml}</div>
    </div>

    ${redencionHtml}

    ${extraContentHtml}
  `;
  showView("card");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-item[data-card="${id}"]`);
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   RENDER: menú de Dígitos (lista de bancos)
   ============================================================ */
function renderDigitos() {
  const cont = document.getElementById("digitosContainer");
  let html = "";
  DIGITOS.forEach((d) => {
    html += `<button class="digito-btn" onclick="openDigito('${d.id}')">${d.name}</button>`;
  });
  cont.innerHTML = html;
}

/* ============================================================
   RENDER: detalle de dígitos por banco
   ============================================================ */
function openDigito(id) {
  const d = DIGITOS.find((x) => x.id === id);
  if (!d) return;
  const cont = document.getElementById("digitoDetailContainer");

  const slots = d.images && d.images.length ? d.images : ["", "", ""];
  const cardsHtml = slots
    .map(
      (src) => `
    <div class="digito-card">
      ${
        src
          ? `<img src="${src}" alt="Dígitos ${d.name}">`
          : `<div class="digito-placeholder">Próximamente</div>`
      }
    </div>`,
    )
    .join("");

  cont.innerHTML = `
    <h1 class="detail-page-title" style="text-align:center">${d.name}</h1>
    <div class="digito-cards-grid">${cardsHtml}</div>
  `;
  showView("digito-detail");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector('.nav-item[data-view="digitos"]');
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   Navegación entre vistas
   ============================================================ */
function showView(name) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (navBtn) navBtn.classList.add("active");
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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

/* ============================================================
   funciones para mostrar / ocultar modal de script
   ============================================================ */
function openScript() {
  document.getElementById("modalTitle").textContent =
    "Script de venta - " + currentCardName;

  document.getElementById("modalScript").textContent =
    currentScript || "No hay script registrado.";

  document.getElementById("scriptModal").classList.add("show");
}

function closeScript() {
  document.getElementById("scriptModal").classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeScript);

document.getElementById("scriptModal").addEventListener("click", (e) => {
  if (e.target.id === "scriptModal") closeScript();
});

/* ============================================================
   Init
   ============================================================ */
renderNav();
renderHome();
renderDigitos();
initCalculators();
showView("home");
