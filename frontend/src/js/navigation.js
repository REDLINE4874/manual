/* ============================================================
   RENDER: navegación lateral
   ============================================================ */
const EXTERNAL_LINKS = [
  // {
  //   name: "Agendas",
  //   url: "https://agendas-rab6.onrender.com/",
  //   icon: "assets/icons/agenda.svg",
  // },
  {
    name: "Vicidial",
    url: "https://aliadosmed4.directo.com/agc/vicidial.php",
    icon: "assets/icons/dial.svg",
  },
  {
    name: "CRM",
    url: "http://aliados2.medc.com.mx:7070/MA_ALIADOS",
    icon: "assets/icons/crm.svg",
  },
  {
    name: "Renapo (CURP)",
    url: "https://www.gob.mx/curp",
    icon: "assets/icons/curp.svg",
  },
  // {
  //   name: "Formalización",
  //   url: "https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing",
  //   icon: "assets/icons/drive.svg",
  // },
  // {
  //   name: "Sucursales",
  //   url: "https://www.banamex.com/es/localizador-sucursales.html?lid=MX|index-H4-Information-IrLocalizadorSucursales-ES",
  //   icon: "assets/icons/sucursales.svg",
  // },
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
    <div class="nav-submenu">${EXTERNAL_LINKS.map(
      (link) => `
      <a class="nav-item nav-subitem" href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}">
        <span class="ico" style="-webkit-mask-image:url('${link.icon}');mask-image:url('${link.icon}')"></span>
        <span class="nav-label">${link.name}</span>
        <span class="ext-arrow">↗</span>
      </a>
    `,
    ).join("")}</div>
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
        item
          .querySelector(".nav-dropdown-trigger")
          ?.setAttribute("aria-expanded", "false");
      }
    });
  });

  const calc = document.createElement("div");
  calc.className = "nav-calc";
  calc.innerHTML = `<button class="nav-item" data-view="puntos" onclick="showView('puntos')" title="Calculadora de puntos"><span class="ico" style="-webkit-mask-image:url('assets/icons/cal.svg');mask-image:url('assets/icons/cal.svg')"></span><span class="nav-label">Calculadora de puntos</span></button>
  <button class="nav-item" data-view="digitos" onclick="showView('digitos')" title="Dígitos"><span class="ico" style="-webkit-mask-image:url('assets/icons/dig.svg');mask-image:url('assets/icons/dig.svg')"></span><span class="nav-label">Dígitos</span></button>`;
  document.getElementById("sidebar").appendChild(calc);

  // Agrega el acceso al inicio antes de los grupos de navegación.
  const homeBtn = document.createElement("button");
  homeBtn.className = "nav-item";
  homeBtn.setAttribute("data-view", "home");
  homeBtn.title = "Inicio / Menú general";
  homeBtn.innerHTML =
    '<span class="ico" style="-webkit-mask-image:url(\'assets/icons/home.svg\');mask-image:url(\'assets/icons/home.svg\')"></span><span class="nav-label">Inicio / Menú general</span>';
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
