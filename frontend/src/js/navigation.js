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
  // {
  //   name: "Renapo (CURP)",
  //   url: "https://www.gob.mx/curp",
  //   icon: "assets/icons/curp.svg",
  // },
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
      html += `<button class="nav-item" data-card="${c.id}" data-tooltip="${shortName}" onclick="openCard('${c.id}')">
        <span class="nav-card-image" data-preview-image="${c.image}" style="--card-color:${c.color}" aria-hidden="true"></span><span class="nav-label">${shortName}</span>
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

  const cardPreview = document.getElementById("navCardPreview") || document.createElement("div");
  cardPreview.id = "navCardPreview";
  cardPreview.className = "nav-card-preview";
  cardPreview.setAttribute("aria-hidden", "true");
  if (!cardPreview.querySelector("img")) {
    const previewImage = document.createElement("img");
    previewImage.className = "nav-card-preview__image";
    previewImage.alt = "";
    const previewLabel = document.createElement("span");
    previewLabel.className = "nav-card-preview__label";
    cardPreview.append(previewImage, previewLabel);
  }
  if (!cardPreview.isConnected) document.body.appendChild(cardPreview);

  const hideCardPreview = () => cardPreview.classList.remove("is-visible");
  const showCardPreview = (image) => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar.classList.contains("collapsed") || window.innerWidth <= 900) {
      hideCardPreview();
      return;
    }

    const bounds = image.getBoundingClientRect();
    const previewWidth = 140;
    const previewHeight = cardPreview.offsetHeight || 126;
    const gap = 12;
    const left = bounds.right + previewWidth + gap <= window.innerWidth
      ? bounds.right + gap
      : Math.max(8, bounds.left - previewWidth - gap);
    const top = Math.min(
      Math.max(8, bounds.top + (bounds.height - previewHeight) / 2),
      window.innerHeight - previewHeight - 8,
    );

    cardPreview.querySelector(".nav-card-preview__image").src = image.dataset.previewImage || image.currentSrc || image.src;
    cardPreview.querySelector(".nav-card-preview__label").textContent =
      image.closest(".nav-item")?.querySelector(".nav-label")?.textContent.trim() || "Tarjeta";
    cardPreview.style.left = `${left}px`;
    cardPreview.style.top = `${top}px`;
    cardPreview.classList.add("is-visible");
  };

  nav.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const image = event.target.closest(".nav-card-image");
    if (image && !image.contains(event.relatedTarget)) showCardPreview(image);
  });
  nav.addEventListener("pointerout", (event) => {
    if (event.target.closest(".nav-card-image")) hideCardPreview();
  });
  nav.addEventListener("focusin", (event) => {
    const image = event.target.closest(".nav-item[data-card]")?.querySelector(".nav-card-image");
    if (image) showCardPreview(image);
  });
  nav.addEventListener("focusout", hideCardPreview);
  window.addEventListener("scroll", hideCardPreview, true);
  window.addEventListener("resize", hideCardPreview);
  document.getElementById("sidebarToggle")?.addEventListener("click", hideCardPreview);

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
const VALID_CARD_GROUPS = [
  {
    category: "Bancarias",
    status: "Autentican",
    statusClass: "is-valid",
    cards: [
      "Banorte", "Banamex", "Afirme", "Banregio", "Santander", "HSBC",
      "American Express (Crédito)", "Inbursa", "Scotiabank", "Invex", "Banbajío",
      "BBVA", "IXE", "Falabella", "Banjercito",
    ],
  },
  {
    category: "Departamentales",
    status: "Autentican",
    statusClass: "is-valid",
    cards: [
      "Liverpool", "Palacio de Hierro", "C&A (Visa)", "Suburbia", "Soriana (Falabella)",
      "Sanborns", "Walmart", "Bradescard (Visa o Mastercard)", "BanCoppel", "Sears",
    ],
  },
  {
    category: "Fintech",
    status: "Autentican",
    statusClass: "is-valid",
    cards: ["Stori", "Nu", "Plata Card (Tarjeta de usos especiales)"],
  },
  {
    category: "No Validas",
    status: "No autentican",
    statusClass: "is-invalid",
    cards: [
      "Coppel Departamental", "Famsa", "Banco Azteca", "Hey Banco", "La Surtidora",
      "La Del Sol", "Tarjeta Amiga", "Mercado Pago", "Didi Card", "Rappi Card",
      "Penfile Banamex", "Perfiles Banamex", "Tarjetas de Débito", "American Express (Servicios)",
    ],
  },
];

const CARD_LOGOS = {
  Banorte: "Banorte.svg",
  Banamex: "Banamex.svg",
  "Penfile Banamex": "Banamex.svg",
  "Perfiles Banamex": "Banamex.svg",
  Afirme: "afirme.svg",
  Banregio: "banregio.svg",
  Santander: "santander.png",
  HSBC: "hsbc.svg",
  "American Express": "americanexpress.svg",
  Inbursa: "inbursa.png",
  Scotiabank: "scotiabank.webp",
  Invex: "invex.webp",
  Banbajío: "banbajio.svg",
  BBVA: "BBVA.svg",
  IXE: "IXE.png",
  Falabella: "FALABELLA.webp",
  Banjercito: "BANJERCITO.svg",
  Liverpool: "LIVERPOOL.webp",
  "Palacio de Hierro": "PALACIO DE HIERRO.png",
  "C&A": "C&A.svg",
  Suburbia: "SUBURBIA.png",
  Soriana: "soriana.svg",
  Sanborns: "SANBORNS.webp",
  Walmart: "WAMART.webp",
  Bradescard: "BRADESCARD.svg",
  BanCoppel: "BANCOPPEL.svg",
  Sears: "SEARS.png",
  Stori: "STORI.png",
  Nu: "NU.svg",
  "Plata Card": "PLATA.jpeg",
  Famsa: "FAMSA.png",
  "Banco Azteca": "BANCO AZTECA.svg",
  "Hey Banco": "HEY BANCO.png",
  "Mercado Pago": "mercadopago.svg",
  Didi: "DIDI CARD.svg",
  Rappi: "RAPPI CARD.jpg",
  "La Surtidora": "SURTIDORA.png",
  "La Del Sol": "LA DEL SOL.png",
  "Tarjeta Amiga": "TAJETA AMIGA.png",
};

const CARD_LOGO_MASKS = new Set(["American Express", "HSBC", "Soriana", "Mercado Pago"]);

function getCardLogoMarkup(card) {
  const logoKey = Object.keys(CARD_LOGOS).find((key) => card.startsWith(key));
  if (logoKey) {
    const logoClass = logoKey.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (CARD_LOGO_MASKS.has(logoKey)) {
      return `<span class="validation-card-logo validation-card-logo--brand logo-${logoClass}" style="-webkit-mask-image:url('assets/logos/${CARD_LOGOS[logoKey]}');mask-image:url('assets/logos/${CARD_LOGOS[logoKey]}')" aria-hidden="true"></span>`;
    }
    return `<img class="validation-card-logo validation-card-logo--image" src="assets/logos/${CARD_LOGOS[logoKey]}" alt="" aria-hidden="true">`;
  }
  const initials = card
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `<span class="validation-card-logo validation-card-logo--initials" aria-hidden="true">${initials}</span>`;
}

function renderHome() {
  const cont = document.getElementById("segmentsContainer");
  cont.innerHTML = `
    <div class="segment-block">
      <div class="segment-heading">
        <h2 class="segment-title">Todas las tarjetas</h2>
        <div class="carousel-controls">
          <button class="carousel-manual-control" type="button" data-direction="-1" aria-label="Tarjeta anterior">‹</button>
          <button class="carousel-manual-control" type="button" data-direction="1" aria-label="Tarjeta siguiente">›</button>
          <button class="carousel-toggle" type="button" aria-pressed="false" aria-label="Pausar movimiento automático">Pausar</button>
        </div>
      </div>
      <div class="card-grid" id="card-carousel" role="region" aria-label="Todas las tarjetas" tabindex="0">
        <div class="card-track">
          <div class="card-set">
            ${CARDS.map((c) => {
              const segment = SEGMENTS.find((item) => item.id === c.segment);
              return `<button class="tcard" onclick="openCard('${c.id}')">
                <img src="${c.image}" alt="${c.name}">
                <div class="tc-body">
                  <span class="tc-segment" style="--segment-color:${segment?.bar || "var(--brand-teal)"}">${segment?.label || "Otros"}</span>
                  <div class="tc-name">${c.name}</div>
                  <div class="tc-meta">Ingresos desde ${c.income} · CAT ${c.cat}</div>
                </div>
              </button>`;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
    <section class="validation-table-section" aria-labelledby="validation-table-title">
      <div class="validation-table-heading">
        <div>
          <span class="eyebrow">Identifica · valida · autentica</span>
          <h2 class="segment-title" id="validation-table-title">Tarjetas válidas para autenticar</h2>
        </div>
        <p class="validation-table-note">Verifica la tarjeta antes de continuar.</p>
      </div>
            <p class="validation-warning"><strong>Importante:</strong> las tarjetas marcadas como “No autentican” no deben continuar en el proceso.</p>
      <div class="validation-columns" role="list" aria-label="Clasificación de tarjetas que autentican y que no autentican">
        ${VALID_CARD_GROUPS.map((group) => `
          <article class="validation-column ${group.statusClass}" role="listitem">
            <header class="validation-column-header">
              <h3>${group.category}</h3>
              <span class="validation-status">${group.status}</span>
            </header>
            <ul class="validation-card-list">
              ${group.cards.map((card) => `<li>${getCardLogoMarkup(card)}<span>${card}</span></li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </div>
      
    </section>`;

  const carousel = cont.querySelector(".card-grid");
  const track = carousel.querySelector(".card-track");
  const firstSet = track.querySelector(".card-set");
  const clone = firstSet.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  clone.querySelectorAll("button").forEach((button) => {
    button.tabIndex = -1;
  });
  track.appendChild(clone);

  const updateSpeed = () => {
    const duration = firstSet.getBoundingClientRect().width / 35;
    track.style.setProperty("--carousel-duration", `${duration}s`);
  };
  const getCardStep = () =>
    firstSet.querySelector(".tcard").getBoundingClientRect().width +
    parseFloat(getComputedStyle(firstSet).gap);
  const toggle = cont.querySelector(".carousel-toggle");
  toggle.addEventListener("click", () => {
    const isPaused = track.classList.toggle("is-paused");
    toggle.setAttribute("aria-pressed", String(isPaused));
    toggle.setAttribute(
      "aria-label",
      `${isPaused ? "Reanudar" : "Pausar"} movimiento automático`,
    );
    toggle.textContent = isPaused ? "Reanudar" : "Pausar";
  });
  cont.querySelectorAll(".carousel-manual-control").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.direction);
      const animation = track
        .getAnimations()
        .find((item) => item.animationName === "card-carousel-scroll");

      if (animation) {
        const duration = Number(animation.effect.getComputedTiming().duration);
        const currentTime = Number(animation.currentTime) || 0;
        const nextTime = currentTime + (direction * getCardStep() * 1000) / 35;
        animation.currentTime = ((nextTime % duration) + duration) % duration;
        return;
      }

      carousel.scrollLeft += direction * getCardStep();
    });
  });
  window.addEventListener("resize", updateSpeed);
  updateSpeed();
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
    .querySelectorAll(".nav-item, .utility-action")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector('[data-view="digitos"]');
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   Navegación entre vistas
   ============================================================ */
function showView(name) {
  if (name === "admin" && window.currentUserRole !== "admin") name = "home";
  const targetView = document.getElementById("view-" + name);
  if (!targetView) return;
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  targetView.classList.add("active");
  document
    .querySelectorAll(".nav-item, .utility-action")
    .forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(`.nav-item[data-view="${name}"], .utility-action[data-view="${name}"]`).forEach((button) => {
    button.classList.add("active");
  });
  document.querySelectorAll(".internal-tab").forEach((tab) => {
    const active = tab.dataset.view === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openExternalView(url, title = "Contenido externo") {
  const frame = document.getElementById("externalFrame");
  const heading = document.getElementById("externalFrameTitle");
  const externalLink = document.getElementById("externalFrameOpen");

  if (!frame || !heading || !externalLink) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  heading.textContent = title;
  frame.title = title;
  frame.src = url;
  externalLink.href = url;
  showView("external");
}
