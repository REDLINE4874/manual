/* ============================================================
   PERFILAMIENTO DE CLIENTE - LÓGICA Y RENDERIZADO
   ============================================================ */

const PROFILING_STATE = {
  income: "clasico", // "clasico" ($10k-$30k), "oro" ($30k-$75k), "platinum" (> $75k)
  lim: "clasico",    // "clasico", "oro", "platinum", "no_pregunto"
  interest: "recompensas", // "cero_anualidad", "recompensas", "viajes", "eventos", "benefica"
  selectedCards: new Set(),
  manualSuggestedId: null,   // Para cuando el usuario hace clic en una opción alternativa
};

const PROFILING_INCOME_OPTIONS = [
  { id: "clasico", range: "$10 mil a $30 mil", label: "Segmento Clásico", level: 1 },
  { id: "oro", range: "$30 mil a $75 mil", label: "Segmento Oro", level: 2 },
  { id: "platinum", range: "Más de $75 mil", label: "Segmento Platinum", level: 3 },
];

const PROFILING_LIM_OPTIONS = [
  { id: "clasico", range: "$10 mil a $30 mil", label: "Nivel Clásico", level: 1 },
  { id: "oro", range: "$30 mil a $75 mil", label: "Nivel Oro", level: 2 },
  { id: "platinum", range: "Más de $75 mil", label: "Nivel Platinum", level: 3 },
  { id: "no_pregunto", range: "No se preguntó", label: "Límite desconocido", level: 0 },
];

const PROFILING_INTEREST_OPTIONS = [
  { id: "recompensas", label: "Puntos / Recompensas y Gasolina", icon: "🪙", desc: "Puntos Premia canjeables por efectivo" },
  { id: "cero_anualidad", label: "Cero Anualidad / Ahorro", icon: "🛡️", desc: "Sin comisión por administración de por vida" },
  { id: "viajes", label: "Viajes / Boletos 2x1 y Salas VIP", icon: "✈️", desc: "Momentos Banamex, salas VIP y vuelos 2x1" },
  { id: "eventos", label: "Preventas y Compras Seguras", icon: "🎟️", desc: "Preventas Ticketmaster y compras protegidas" },
  { id: "benefica", label: "Causa Social / Teletón", icon: "💛", desc: "Apoyo a fundación y 2x1 en cines" },
];

// Evalúa el límite frente al segmento dictado por el ingreso
function evaluateLimRelation(incomeId, limId) {
  if (limId === "no_pregunto") {
    return {
      status: "incierto",
      badgeText: "⚠️ Límite no especificado",
      badgeClass: "profiling-lim-badge--incierto",
      noticeClass: "profiling-lim-notice--incierto",
      message: "<strong>Recomendación estimada/incierta:</strong> No se preguntó el límite actual del cliente. Se sugiere indagar su línea de crédito para calibrar con mayor precisión la capacidad de compra y monto preautorizado.",
    };
  }

  const incomeLevel = PROFILING_INCOME_OPTIONS.find((o) => o.id === incomeId)?.level || 1;
  const limLevel = PROFILING_LIM_OPTIONS.find((o) => o.id === limId)?.level || 1;

  if (limLevel > incomeLevel) {
    return {
      status: "alto",
      badgeText: "⭐ Límite alto para el producto",
      badgeClass: "profiling-lim-badge--alto",
      noticeClass: "profiling-lim-notice--alto",
      message: "<strong>Cliente con Límite Alto:</strong> El cliente maneja una línea superior a la media de este segmento. Representa un perfil con excelente experiencia crediticia y alta probabilidad de aprobación.",
    };
  } else if (limLevel < incomeLevel) {
    return {
      status: "bajo",
      badgeText: "ℹ️ Límite inferior al segmento",
      badgeClass: "profiling-lim-badge--bajo",
      noticeClass: "profiling-lim-notice--bajo",
      message: "<strong>Límite actual bajo:</strong> El cliente podría declinar por límite de crédito inferior al requerido.",
    };
  } else {
    return {
      status: "adecuado",
      badgeText: "✔️ Límite acorde al segmento",
      badgeClass: "profiling-lim-badge--adecuado",
      noticeClass: "profiling-lim-notice--adecuado",
      message: "<strong>Límite acorde:</strong> La línea de crédito actual del cliente empata perfectamente con el rango esperado para este producto.",
    };
  }
}

function getIncomeCeiling(incomeId) {
  return { clasico: 30, oro: 75, platinum: Infinity }[incomeId] ?? 0;
}

function getCardMinimumIncome(card) {
  const value = Number(String(card.income || "").match(/\d+/)?.[0]);
  return Number.isFinite(value) ? value : Infinity;
}

function getPreferredCardId(segmentId, interestId, selectedCards) {
  if (segmentId === "clasico") {
    const hasFintech = Array.from(selectedCards).some((card) =>
      ["Nu", "Stori", "Plata Card (Tarjeta de usos especiales)", "Mercado Pago", "Didi Card", "Rappi Card"].some((name) => card.includes(name))
    );
    if (interestId === "cero_anualidad" || (hasFintech && interestId === "recompensas")) return "joy";
    if (interestId === "benefica") return "teleton";
    return "clasica";
  }
  if (segmentId === "oro") return interestId === "viajes" ? "descubre" : "oro";
  if (segmentId === "platinum") return interestId === "viajes" ? "explora" : "platinum";
  return "";
}

function determineCardRecommendation(incomeId, limId, interestId, manualId, selectedCards) {
  const allCards = window.CARD_DATA ? Object.values(window.CARD_DATA) : [];
  const incomeCeiling = getIncomeCeiling(incomeId);
  const incomeCards = allCards.filter((card) =>
    card.segment === incomeId && getCardMinimumIncome(card) <= incomeCeiling
  );
  const incomePreferredId = getPreferredCardId(incomeId, interestId, selectedCards);
  const incomeCard = incomeCards.find((card) => card.id === incomePreferredId) || incomeCards[0] || null;
  const hasKnownLimit = ["clasico", "oro", "platinum"].includes(limId);
  const incomeLevels = { clasico: 1, oro: 2, platinum: 3 };
  const limitAboveIncome = hasKnownLimit && incomeLevels[incomeId] < incomeLevels[limId];
  const compatibleCards = hasKnownLimit && !limitAboveIncome
    ? allCards.filter((card) => card.segment === limId && getCardMinimumIncome(card) <= incomeCeiling)
    : incomeCards;
  const priorityPreferredId = hasKnownLimit && !limitAboveIncome
    ? getPreferredCardId(limId, interestId, selectedCards)
    : incomePreferredId;
  let priorityCard = compatibleCards.find((card) => card.id === priorityPreferredId)
    || (hasKnownLimit ? compatibleCards[0] || null : incomeCard);

  const manualCard = compatibleCards.find((card) => card.id === manualId);
  if (manualCard) priorityCard = manualCard;

  const alternatives = compatibleCards.filter((card) =>
    card.id !== priorityCard?.id && (!hasKnownLimit || card.id !== incomeCard?.id)
  );

  return { priorityCard, incomeCard, alternatives, hasKnownLimit, limitAboveIncome };
}

// Genera los argumentos de venta ("Se recomienda por:") dinámicos
function generateSalesReasons(mainCard, incomeId, limInfo, interestId, selectedCards) {
  const reasons = [];
  const selectedCardsList = Array.from(selectedCards);

  // 1. Argumento de segmento y requisitos
  if (incomeId === "clasico") {
    reasons.push({
      strong: "Segmento Clásico accesible:",
      text: "Diseñada para ingresos de $10 mil a $30 mil con los beneficios más competitivos del mercado bancario.",
    });
  } else if (incomeId === "oro") {
    reasons.push({
      strong: "Segmento Oro preferente:",
      text: "Respalda ingresos de $30 mil a $75 mil brindando asistencias completas, mayor porcentaje de recompensas y promociones exclusivas.",
    });
  } else if (incomeId === "platinum") {
    reasons.push({
      strong: "Máxima categoría Platinum:",
      text: "Exclusiva para clientes con ingresos mayores a $75,000 con tasa preferencial del 30.47%, asistencias Libra Premium y salas VIP.",
    });
  }

  // 2. Beneficios clave de la tarjeta
  if (mainCard.id === "joy") {
    reasons.push({
      strong: "Cero Comisión de Administración:",
      text: "Sin cobro de anualidad de por vida al realizar al menos 1 compra mínima de $300 MN al mes.",
    });
    reasons.push({
      strong: "Máxima Seguridad:",
      text: "No tiene CVV impreso en el plástico y permite cambiar su fecha de corte una vez al año.",
    });
  } else if (mainCard.id === "clasica") {
    reasons.push({
      strong: "Puntos Premia en Efectivo:",
      text: "Regresa 5% de puntos premia en todas las compras y el DOBLE (10%) en gasolineras todos los días de la semana.",
    });
    reasons.push({
      strong: "Exención de Anualidad:",
      text: "Comisión mensual bonificable al mantener consumo de $300 con tarjeta física o digital.",
    });
  } else if (mainCard.id === "oro") {
    reasons.push({
      strong: "7% en Puntos Premia:",
      text: "Retorno superior del 7% y Puntos Dobles (14%) en gasolineras, canjeables por dinero en efectivo en cajeros.",
    });
    reasons.push({
      strong: "Exención de Anualidad:",
      text: "Bonificación de la comisión mensual realizando al menos $300 de compra.",
    });
  } else if (mainCard.id === "descubre") {
    reasons.push({
      strong: "Vuelos 2x1 y Salas VIP:",
      text: "Certificado 2x1 en boletos de avión a playas nacionales y accesos ilimitados gratuitos a la Sala VIP Elite Lounge Mastercard en T1 AICM.",
    });
    reasons.push({
      strong: "Puntos Momentos Banamex:",
      text: "Acumula 1 punto por cada dólar gastado con vigencia de 3 años.",
    });
  } else if (mainCard.id === "platinum") {
    reasons.push({
      strong: "10% en Puntos Premia:",
      text: "La tasa más alta de retorno en compras, con respaldo Libra Premium gratis (asistencia vial, hogar, médica y legal).",
    });
    reasons.push({
      strong: "Tasa Preferencial:",
      text: "Tasa variable ponderada de 30.47% (una de las más bajas de la banca) y CAT del 39.4%.",
    });
  } else if (mainCard.id === "explora") {
    reasons.push({
      strong: "Experiencia de Viajes Élite:",
      text: "10 accesos gratuitos al año a Salas VIP Beyond (AICM T1/T2, GDL y MTY) más certificado 2x1 en boletos de avión.",
    });
    reasons.push({
      strong: "1.15 Puntos por Dólar:",
      text: "Puntos Momentos Banamex que no vencen en 3 años, con compras protegidas y MSI continuos.",
    });
  } else if (mainCard.id === "teleton") {
    reasons.push({
      strong: "Beneficios de Entretenimiento:",
      text: "2x1 en Cinépolis (código Mastercard), 30% en Starbucks, hasta 6 tarjetas adicionales sin costo y apoyo a Fundación Teletón.",
    });
  }

  // 3. Argumento comercial contra sus tarjetas actuales
  const hasFintech = selectedCardsList.some((c) =>
    ["Nu", "Stori", "Plata Card (Tarjeta de usos especiales)", "Mercado Pago", "Didi Card", "Rappi Card"].some((f) => c.includes(f))
  );
  const hasBancarias = selectedCardsList.some((c) =>
    ["BBVA", "Santander", "Banorte", "HSBC", "American Express", "Scotiabank", "Invex"].some((b) => c.includes(b))
  );

  if (hasFintech) {
    reasons.push({
      strong: "Supera a Fintechs:",
      text: "El cliente ya maneja fintech. Destácale que Banamex ofrece preventas exclusivas Ticketmaster, promociones reales a Meses Sin Intereses y la solidez de una institución formal con sucursales y efectivo.",
    });
  }

  if (hasBancarias) {
    reasons.push({
      strong: "Ventaja Competitiva Bancaria:",
      text: "Compara el beneficio de Puntos Premia dobles en gasolineras y la facilidad de exentar la comisión con solo $300 mensuales, beneficio que la mayoría de bancos no otorgan.",
    });
  }


  if (selectedCardsList.includes("Ninguna")) {
    reasons.push({
      strong: "Construcción de Historial:",
      text: "Excelente oportunidad para iniciar relación bancaria sólida con Citibanamex con la tarjeta más adecuada a su nivel de ingresos.",
    });
  }

  // 4. Argumento según Límite
  if (limInfo.status === "alto") {
    reasons.push({
      strong: "Perfil para aprobación ágil:",
      text: "Por contar con un límite alto actual, se proyecta un trámite sin contratiempos con posibilidad de asignación de línea competitiva.",
    });
  }

  return reasons;
}

// Inicialización y renderizado del módulo
function initProfilingModule() {
  const container = document.getElementById("profilingAppContainer");
  if (!container) return;

  renderProfilingUI();
}

function renderProfilingEligibilityAlerts(invalidCards, validCards) {
  const authenticationLevels = {
    Bancarias: "Mayor &#237;ndice de autenticaci&#243;n",
    Departamentales: "&#205;ndice de autenticaci&#243;n normal",
    Fintech: "&#205;ndice de autenticaci&#243;n bajo",
  };
  let markup = "";

  if (invalidCards.length) {
    markup += `
      <div class="profiling-eligibility-alert" role="alert" aria-live="assertive">
        <span class="profiling-eligibility-alert__icon" aria-hidden="true">!</span>
        <div>
          <strong>Tarjetas no aptas para este tr&#225;mite</strong>
          <p>Las tarjetas seleccionadas (${invalidCards.join(", ")}) no autentican para el tr&#225;mite.</p>
        </div>
      </div>`;
  }

  if (validCards.length) {
    markup += `
      <div class="profiling-eligibility-alert profiling-eligibility-alert--valid" role="status" aria-live="polite">
        <span class="profiling-eligibility-alert__icon" aria-hidden="true">&#10003;</span>
        <div>
          <strong>${validCards.length === 1 ? "Tarjeta apta" : "Tarjetas aptas"} para este tr&#225;mite</strong>
          <ul class="profiling-eligibility-alert__levels">
            ${["Bancarias", "Departamentales", "Fintech"].map((category) => {
              const cards = validCards.filter((card) => card.category === category).map((card) => card.cardName);
              if (!cards.length) return "";
              return `<li><strong>${category}:</strong> ${cards.join(", ")} &middot; <span class="profiling-auth-level profiling-auth-level--${category.toLowerCase()}">${authenticationLevels[category]}</span></li>`;
            }).join("")}
          </ul>
        </div>
      </div>`;
  }

  return markup;
}

function renderProfilingUI() {
  const container = document.getElementById("profilingAppContainer");
  if (!container) return;

  const { priorityCard, incomeCard, alternatives, hasKnownLimit, limitAboveIncome } = determineCardRecommendation(
    PROFILING_STATE.income,
    PROFILING_STATE.lim,
    PROFILING_STATE.interest,
    PROFILING_STATE.manualSuggestedId,
    PROFILING_STATE.selectedCards
  );
  const recommendationSegment = priorityCard?.segment || PROFILING_STATE.income;
  const limInfo = evaluateLimRelation(recommendationSegment, PROFILING_STATE.lim);
  const segmentLevels = { clasico: 1, oro: 2, platinum: 3 };
  const mayDeclineForLimit = hasKnownLimit
    && segmentLevels[PROFILING_STATE.lim] < segmentLevels[PROFILING_STATE.income];

  const cardGroups = typeof VALID_CARD_GROUPS !== "undefined" ? VALID_CARD_GROUPS : [];
  const invalidCardNames = cardGroups
    .filter((group) => group.category === "No Validas")
    .flatMap((group) => group.cards);
  const validCards = cardGroups
    .filter((group) => group.category !== "No Validas")
    .flatMap((group) => group.cards.map((cardName) => ({ cardName, category: group.category })));
  const selectedInvalidCards = Array.from(PROFILING_STATE.selectedCards)
    .filter((cardName) => invalidCardNames.includes(cardName));
  const selectedValidCards = validCards
    .filter(({ cardName }) => PROFILING_STATE.selectedCards.has(cardName));

  const reasons = priorityCard
    ? generateSalesReasons(priorityCard, recommendationSegment, limInfo, PROFILING_STATE.interest, PROFILING_STATE.selectedCards)
    : [];
  // Segment metadata
  const currentSegMeta = (typeof SEGMENTS !== "undefined" ? SEGMENTS : []).find(
    (s) => s.id === recommendationSegment
  ) || { label: "Segmento " + recommendationSegment, bar: "#009cc6" };

  container.innerHTML = `
    <div class="profiling-layout">
      <!-- Columna Izquierda: Criterios del Prospecto -->
      <section class="profiling-card profiling-profile-section">
        <header class="profiling-panel-heading">
          <span class="eyebrow">Perfil del cliente</span>
          <h2>Perfila por ingresos</h2>
        </header>
        <!-- 1. Ingresos Comprobables -->
        <div class="profiling-section">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">1</span>
            <span>Ingresos Mensuales Comprobables</span>
          </div>
          <div class="profiling-btn-grid">
            ${PROFILING_INCOME_OPTIONS.map(
              (opt) => `
              <button type="button" 
                      class="profiling-option-btn ${PROFILING_STATE.income === opt.id ? "is-selected" : ""}"
                      onclick="setProfilingIncome('${opt.id}')">
                <span class="profiling-option-btn__main">${opt.range}</span>
              </button>
            `
            ).join("")}
          </div>
        </div>

        <!-- 2. Límite de Crédito Actual ("LIM") -->
        <div class="profiling-section">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">2</span>
            <span>Límite de Crédito Actual ("LIM")</span>
          </div>
          <div class="profiling-btn-grid profiling-btn-grid--lim">
            ${PROFILING_LIM_OPTIONS.map(
              (opt) => `
              <button type="button" 
                      class="profiling-option-btn ${PROFILING_STATE.lim === opt.id ? "is-selected" : ""}"
                      onclick="setProfilingLim('${opt.id}')">
                <span class="profiling-option-btn__main">${opt.range}</span>
              </button>
            `
            ).join("")}
          </div>
        </div>

        <!-- 3. Interés / Prioridad del Cliente -->
        <div class="profiling-section">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">3</span>
            <span>¿Qué busca o prioriza el cliente?</span>
          </div>
          <div class="profiling-section__subtitle">Define la tarjeta recomendada dentro del segmento</div>
          <div class="profiling-interest-grid">
            ${PROFILING_INTEREST_OPTIONS.map(
              (opt) => `
              <button type="button"
                      class="profiling-interest-chip ${PROFILING_STATE.interest === opt.id ? "is-selected" : ""}"
                      onclick="setProfilingInterest('${opt.id}')"
                      title="${opt.desc}">
                <span class="profiling-interest-chip__icon">${opt.icon}</span>
                <span>${opt.label}</span>
              </button>
            `
            ).join("")}
          </div>
        </div>

        <!-- 4. Tarjetas que ya maneja el cliente -->
        <div class="profiling-section profiling-section--client-cards">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">4</span>
            <span>Tarjetas que maneja actualmente</span>
          </div>
          <div class="profiling-cards-chips" id="profilingChipsContainer">
            ${renderProfilingCardChips()}
          </div>
        </div>
      </section>

      <!-- Columna Derecha: Tarjeta Sugerida y Recomendación -->
      <div class="profiling-recommendation-column">
      <section class="profiling-feedback-section">
        <div class="profiling-profile-feedback">
          <div class="profiling-badge-group">
            <span class="profiling-lim-badge ${limInfo.badgeClass}">${limInfo.badgeText}</span>
          </div>
          ${limInfo.status !== "alto" ? `<div class="profiling-lim-notice ${limInfo.noticeClass}"><div>${limInfo.message}</div></div>` : ""}
        </div>

        ${renderProfilingEligibilityAlerts(selectedInvalidCards, selectedValidCards)}
      </section>
            <section class="profiling-result-card">
        
        <div class="profiling-result-header">
          <div>
            <span class="eyebrow profiling-recommendation-eyebrow">Recomendación Inteligente</span>
            <h2 style="font-family:var(--font-display); margin:4px 0 0; font-size:1.4rem;">Tarjeta recomendada</h2>
          </div>
          <div class="profiling-badge-group">
            <span class="profiling-priority-badge">Prioridad</span>
            <span class="profiling-segment-badge" style="background:${currentSegMeta.bar}">${currentSegMeta.label}</span>
          </div>
        </div>


        <!-- Tarjeta Principal -->
        ${
          priorityCard
            ? `
          <div class="profiling-suggested-card">
            <div class="profiling-suggested-card__img-wrap">
              <button type="button" class="profiling-suggested-card__image-button"
                      onclick="openCard('${priorityCard.id}')" aria-label="Ver detalle de ${priorityCard.name}"
                      title="Ver detalle de ${priorityCard.name}">
                <img class="profiling-suggested-card__img" src="${priorityCard.image}" alt="">
              </button>
            </div>
            <div class="profiling-suggested-card__info">
              <h3>${priorityCard.name}</h3>
              <div class="profiling-suggested-card__specs">
                <span>Ingreso mínimo: <strong>${priorityCard.income}</strong></span>
                <span>Comisión: <strong>${priorityCard.admin || "Sin costo"}</strong></span>
                <span>CAT: <strong>${priorityCard.cat || "N/A"}</strong></span>
              </div>
            </div>
          </div>
        `
            : `<p>No hay una tarjeta que cumpla con el ingreso y el l&iacute;mite seleccionados.</p>`
        }



        <!-- "Se recomienda por:" -->
        <div class="profiling-reasons">
          <div class="profiling-reasons__title">
            <span>✨</span>
            <span>Se recomienda por:</span>
          </div>
          <ul class="profiling-reasons__list">
            ${reasons
              .map(
                (r) => `
              <li class="profiling-reasons__item">
                <span class="profiling-reasons__bullet">•</span>
                <div><strong>${r.strong}</strong> ${r.text}</div>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <!-- Argumento de venta rápido para el vendedor -->





      <section class="profiling-options-section">
        ${incomeCard && incomeCard.id !== priorityCard?.id ? `
          <div class="profiling-income-recommendation">
            <div>
              <span class="eyebrow">Opci&oacute;n por ingresos</span>
              <strong>${incomeCard.name}</strong>
              <span>Ingreso m&iacute;nimo: ${incomeCard.income}</span>
              ${mayDeclineForLimit ? `<span class="profiling-income-recommendation__warning" role="note">⚠ Puede declinar por l&iacute;mite de cr&eacute;dito inferior al requerido</span>` : ""}
            </div>
            <button type="button" class="profiling-income-recommendation__image" onclick="openCard('${incomeCard.id}')" aria-label="Ver detalle de ${incomeCard.name}" title="Ver detalle de ${incomeCard.name}">
              <img src="${incomeCard.image}" alt="">
            </button>
          </div>
        ` : ""}

      <section class="profiling-alternatives-section">
        <header class="profiling-panel-heading">
          <span class="eyebrow">Alternativas</span>
          <h2>${hasKnownLimit && !limitAboveIncome ? "Otras opciones que cumplen ingreso y l&iacute;mite" : "Otras opciones por ingresos"}</h2>
        </header>
        ${
          alternatives.length > 0
            ? `
          <div class="profiling-alternatives">
            <div class="profiling-alternatives__grid">
              ${alternatives
                .map(
                  (alt) => `
                <div class="profiling-alt-card" onclick="selectAlternativeCard('${alt.id}')"
                     title="${hasKnownLimit && !limitAboveIncome ? "Cumple ingreso y l&iacute;mite seleccionados; queda despu&eacute;s por la prioridad del cliente" : "Cumple el ingreso seleccionado; queda despu&eacute;s por la prioridad del cliente"}">
                  <div class="profiling-alt-card__info">
                    <span class="profiling-alt-card__name">${alt.name}</span>
                    <span class="profiling-alt-card__badge">&#10003; Buena opci&oacute;n tambi&eacute;n</span>
                    <span class="profiling-alt-card__segment">${hasKnownLimit && !limitAboveIncome ? `Cumple ingreso y l&iacute;mite &middot; desde ${alt.income}` : `Cumple ingreso &middot; desde ${alt.income}`}</span>
                  </div>
                  <img class="profiling-alt-card__img" src="${alt.image}" alt="">
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : `<p>${hasKnownLimit && !limitAboveIncome ? "No hay otras tarjetas que cumplan ambos criterios." : "No hay otras tarjetas que cumplan el criterio de ingreso."}</p>`
        }
      </section>
      </section>
      </section>
      </div>


    </div>
  `;
}

// Renderiza todas las tarjetas juntas e identifica las que no autentican.
function renderProfilingCardChips() {
  const groups = typeof VALID_CARD_GROUPS !== "undefined" ? VALID_CARD_GROUPS : [];
  const isNoneSelected = PROFILING_STATE.selectedCards.has("Ninguna");
  const noneButton = `
    <button type="button" class="profiling-card-chip ${isNoneSelected ? "is-selected" : ""}"
            aria-pressed="${isNoneSelected}" onclick="toggleProfilingCard('Ninguna')">
      <span>Sin tarjetas previas (Ninguna)</span>
    </button>`;
  const allCards = groups.flatMap((group) => group.cards.map((cardName) => ({
    cardName,
    isInvalid: group.category === "No Validas",
  })));

  return noneButton + allCards.map(({ cardName, isInvalid }) => {
    const isSelected = PROFILING_STATE.selectedCards.has(cardName);
    const logoMarkup = typeof getCardLogoMarkup === "function" ? getCardLogoMarkup(cardName) : "";
    const safeCardName = cardName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

    return `
      <button type="button"
              class="profiling-card-chip ${isSelected ? "is-selected" : ""} ${isInvalid ? "is-invalid" : ""}"
              aria-pressed="${isSelected}"
              onclick="toggleProfilingCard('${safeCardName}')"
              title="${isInvalid ? "No autentica para trámite Banamex" : "Autentica como referencia"}">
        ${logoMarkup}
        <span>${cardName}</span>
      </button>`;
  }).join("");
}

// Controladores de eventos
function setProfilingIncome(incomeId) {
  PROFILING_STATE.income = incomeId;
  PROFILING_STATE.manualSuggestedId = null; // Reiniciar selección manual
  renderProfilingUI();
}

function setProfilingLim(limId) {
  PROFILING_STATE.lim = limId;
  PROFILING_STATE.manualSuggestedId = null;
  renderProfilingUI();
}

function setProfilingInterest(interestId) {
  PROFILING_STATE.interest = interestId;
  PROFILING_STATE.manualSuggestedId = null;
  renderProfilingUI();
}


function toggleProfilingCard(cardName) {
  PROFILING_STATE.manualSuggestedId = null;
  if (cardName === "Ninguna") {
    if (PROFILING_STATE.selectedCards.has("Ninguna")) {
      PROFILING_STATE.selectedCards.delete("Ninguna");
    } else {
      PROFILING_STATE.selectedCards.clear();
      PROFILING_STATE.selectedCards.add("Ninguna");
    }
  } else {
    PROFILING_STATE.selectedCards.delete("Ninguna");
    if (PROFILING_STATE.selectedCards.has(cardName)) {
      PROFILING_STATE.selectedCards.delete(cardName);
    } else {
      PROFILING_STATE.selectedCards.add(cardName);
    }
  }
  renderProfilingUI();
}

function selectAlternativeCard(cardId) {
  PROFILING_STATE.manualSuggestedId = cardId;
  renderProfilingUI();
}

function openCardScript(cardId) {
  const c = (window.CARD_DATA ? Object.values(window.CARD_DATA) : []).find((x) => x.id === cardId);
  if (!c || !c.script) return;
  const modal = document.getElementById("scriptModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalScript = document.getElementById("modalScript");
  if (modal && modalTitle && modalScript) {
    modalTitle.textContent = "Script para vender " + c.name;
    modalScript.textContent = c.script;
    modal.classList.add("active");
  }
}
