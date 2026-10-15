/* Datos de las opciones de redención de puntos. */
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

/* Genera el contenido informativo de redención para el modal. */
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

/* Presenta destinos y certificados de viaje en el formato disponible. */
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
            <h2>Destinos a EEUU</h2>
            <ul class="explora-destination-list">
              ${usList.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          <div class="explora-destination-group">
            <h2>Destinos nacionales</h2>
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

/* Renderiza un beneficio como texto, enlace o acción para abrir un modal. */
function renderBenefitItem(item) {
  if (!item) return "";

  if (typeof item === "string") return item;

  const text = item.text || item.label || "";
  const link = (() => {
    if (typeof item.link === "string") {
      return { url: item.link, label: item.label || "Ver más" };
    }
    if (item.link && typeof item.link === "object") {
      return {
        url: item.link.url || item.link.href || "#",
        label: item.link.label || item.link.text || item.label || "Ver más",
      };
    }
    if (typeof item.href === "string") {
      return { url: item.href, label: item.label || "Ver más" };
    }
    return null;
  })();

  const actions = Array.isArray(item.actions)
    ? item.actions
    : item.modalType
      ? [{ label: item.label || "Ver más", modalType: item.modalType, title: item.title || item.label || text }]
      : [];

  if (actions.length) {
    const buttonsHtml = actions
      .map((action) => {
        const actionLabel = action.label || "Ver más";
        const actionType = action.modalType || "";
        const actionTitle = action.title || actionLabel || text;
        return `<button type="button" class="benefit-link benefit-link-button" data-modal-type="${actionType}" data-modal-title="${actionTitle}">${actionLabel}</button>`;
      })
      .join("");

    return `
      <span class="benefit-item-wrapper">
        <span class="benefit-copy">
          ${text}
          ${buttonsHtml}
        </span>
      </span>
    `;
  }

  const safeText = text ? `<span class="benefit-copy">${text}</span>` : "";
  const safeLink = link && link.url
    ? `<a class="benefit-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`
    : "";

  return safeText || safeLink
    ? `<span class="benefit-item-wrapper">${safeText}${safeLink}</span>`
    : "";
}
