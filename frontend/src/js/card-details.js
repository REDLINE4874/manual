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

  const benefitsList = Array.isArray(c.benefits)
    ? c.benefits.map((benefit) => (typeof benefit === "string" ? { text: benefit } : benefit))
    : [];

  if (c.id === "descubre" && benefitsList[0]) {
    benefitsList[0] = {
      ...benefitsList[0],
      text: benefitsList[0].text || "",
      actions: [{
        label: "Ver redención",
        modalType: "redencion",
        title: "2. REDENCIÓN",
      }],
    };
  }

  if (c.id === "explora") {
    const puntosIndex = benefitsList.findIndex((benefit) => {
      const text = typeof benefit === "string" ? benefit : benefit.text || "";
      return text.toLowerCase().includes("puntos") || text.toLowerCase().includes("momentos");
    });

    const destinoIndex = benefitsList.findIndex((benefit) => {
      const text = typeof benefit === "string" ? benefit : benefit.text || "";
      return text.toLowerCase().includes("destinos") || text.toLowerCase().includes("certificado");
    });

    const redencionAction = {
      label: "Ver redención",
      modalType: "redencion",
      title: "2. REDENCIÓN",
    };

    const destinosAction = {
      label: "Ver destinos",
      modalType: "destinos",
      title: "Destinos y certificado 2x1 (beneficios de viaje)",
    };

    if (puntosIndex >= 0) {
      benefitsList[puntosIndex] = {
        ...benefitsList[puntosIndex],
        text: benefitsList[puntosIndex].text || "",
        actions: [redencionAction],
      };
    }

    if (destinoIndex >= 0) {
      benefitsList[destinoIndex] = {
        ...benefitsList[destinoIndex],
        text: benefitsList[destinoIndex].text || "",
        actions: [destinosAction],
      };
    } else {
      benefitsList.push({
        text: "Destinos y certificado 2x1",
        actions: [destinosAction],
      });
    }
  }

  const benefitsHtml =
    benefitsList.length
      ? `
    <ul class="benefits-list">
      ${benefitsList
        .map((b) => `<li>${renderBenefitItem(b)}</li>`)
        .join("")}
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

  const extraContentHtml = c.extraImage
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

    ${extraContentHtml}
  `;

  cont.querySelectorAll(".benefit-link-button").forEach((button) => {
    button.addEventListener("click", () => {
      const modalType = button.getAttribute("data-modal-type");
      const modalTitle = button.getAttribute("data-modal-title") || "Beneficio";

      if (modalType === "redencion") {
        openInfoModal(modalTitle, renderRedencionPuntos(), "redencion");
      }
      if (modalType === "destinos") {
        openInfoModal(modalTitle, renderExploraBenefitsTable(c.travelBenefitsTable), "destinos");
      }
    });
  });

  showView("card");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-item[data-card="${id}"]`);
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
