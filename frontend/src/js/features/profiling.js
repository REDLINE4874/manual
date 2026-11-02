/* ============================================================
   PERFILAMIENTO DE CLIENTE - LÓGICA Y RENDERIZADO
   ============================================================ */
const PROFILING_STATE = {
  income: "clasico", // "clasico" ($15k-$25k), "oro" ($25k-$75k), "platinum" (> $75k)
  lim: "clasico",    // "clasico", "oro", "platinum", "no_pregunto"
  interest: "sin_preferencias",
  selectedCards: new Set(["Ninguna"]),
  manualSuggestedId: null,   // Para cuando el usuario hace clic en una opción alternativa
};
const PROFILING_INCOME_OPTIONS = [
  { id: "clasico", range: "$15 mil a $25 mil", label: "Segmento Clásico", level: 1 },
  { id: "oro", range: "$25 mil a $75 mil", label: "Segmento Oro", level: 2 },
  { id: "platinum", range: "Más de $75 mil", label: "Segmento Platinum", level: 3 },
];
const PROFILING_LIM_OPTIONS = [
  { id: "clasico", range: "$10 mil a $30 mil", label: "Nivel Clásico", level: 1 },
  { id: "oro", range: "$30 mil a $75 mil", label: "Nivel Oro", level: 2 },
  { id: "platinum", range: "Más de $75 mil", label: "Nivel Platinum", level: 3 },
  { id: "no_pregunto", range: "No se preguntó", label: "Límite desconocido", level: 0 },
];
const PROFILING_INTEREST_OPTIONS = [
  { id: "cero_anualidad", label: "0 anualidad", icon: "🛡️", desc: "Prioriza JOY cuando cumple el perfil del cliente" },
  { id: "puntos_cotidianos", label: "Puntos y compras cotidianas", icon: "🪙", desc: "Prioriza Clásica u Oro según el perfil" },
  { id: "viajes_experiencias", label: "Viajes y experiencias", icon: "✈️", desc: "Prioriza Explora para el perfil Platinum" },
  { id: "sin_preferencias", label: "Sin preferencias", icon: "⚖️", desc: "Recomienda únicamente según el perfil" },
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
  return { clasico: 25, oro: 75, platinum: Infinity }[incomeId] ?? 0;
}
function getCardMinimumIncome(card) {
  const value = Number(String(card.income || "").match(/\d+/)?.[0]);
  return Number.isFinite(value) ? value : Infinity;
}
function getProfileCardId(segmentId) {
  return { clasico: "clasica", oro: "oro", platinum: "platinum" }[segmentId] || "";
}
function getPreferredCardId(segmentId, interestId) {
  if (interestId === "cero_anualidad" && segmentId === "clasico") return "joy";
  if (interestId === "puntos_cotidianos" && ["clasico", "oro"].includes(segmentId)) {
    return getProfileCardId(segmentId);
  }
  if (interestId === "viajes_experiencias" && segmentId === "platinum") return "explora";
  return getProfileCardId(segmentId);
}
function getModifierTargetCardId(segmentId, interestId) {
  if (interestId === "cero_anualidad") return "joy";
  if (interestId === "puntos_cotidianos") return segmentId === "clasico" ? "clasica" : "oro";
  if (interestId === "viajes_experiencias" && segmentId === "platinum") return "explora";
  return null;
}
function getModifierLabel(interestId) {
  return PROFILING_INTEREST_OPTIONS.find((option) => option.id === interestId)?.label || "modificador seleccionado";
}
function determineCardRecommendation(incomeId, limId, interestId, manualId, selectedCards) {
  const allCards = window.CARD_DATA ? Object.values(window.CARD_DATA) : [];
  const incomeCeiling = getIncomeCeiling(incomeId);
  const incomeLevels = { clasico: 1, oro: 2, platinum: 3 };
  const incomeCards = allCards.filter((card) =>
    incomeLevels[card.segment] <= incomeLevels[incomeId]
      && getCardMinimumIncome(card) <= incomeCeiling
  );
  const incomePreferredId = getPreferredCardId(incomeId, interestId);
  const incomeCard = incomeCards.find((card) => card.id === incomePreferredId) || incomeCards[0] || null;
  const hasKnownLimit = ["clasico", "oro", "platinum"].includes(limId);
  const limitAboveIncome = hasKnownLimit && incomeLevels[incomeId] < incomeLevels[limId];
  const compatibleCards = hasKnownLimit && !limitAboveIncome
    ? allCards.filter((card) => {
      const cardWithinLimit = incomeLevels[card.segment] <= incomeLevels[limId];
      return cardWithinLimit && getCardMinimumIncome(card) <= incomeCeiling;
    })
    : incomeCards;
  const joyCard = allCards.find((card) => card.id === "joy");
  const joyMeetsProfile = joyCard
    && getCardMinimumIncome(joyCard) <= incomeCeiling
    && (!hasKnownLimit || incomeLevels[limId] >= (incomeLevels[joyCard.segment] || 1));
  const profileSegment = hasKnownLimit && !limitAboveIncome ? limId : incomeId;
  const profileCardId = getProfileCardId(profileSegment);
  const modifierTargetId = getModifierTargetCardId(profileSegment, interestId);
  const modifierCard = modifierTargetId === "joy" && joyMeetsProfile
    ? joyCard
    : compatibleCards.find((card) => card.id === modifierTargetId) || null;
  const modifierNotApplicable = interestId !== "sin_preferencias" && !modifierCard;
  let priorityCard = modifierCard
    || compatibleCards.find((card) => card.id === profileCardId)
    || (hasKnownLimit ? compatibleCards[0] || null : incomeCard);
  const manualCard = compatibleCards.find((card) => card.id === manualId);
  if (manualCard) priorityCard = manualCard;
  const alternatives = compatibleCards
    .filter((card) => card.id !== priorityCard?.id && (!hasKnownLimit || card.id !== incomeCard?.id))
    .sort((a, b) => (incomeLevels[b.segment] || 0) - (incomeLevels[a.segment] || 0));
  return { priorityCard, incomeCard, incomeCards, alternatives, hasKnownLimit, limitAboveIncome, modifierNotApplicable, modifierLabel: getModifierLabel(interestId) };
}
// Genera los argumentos de venta ("Se recomienda por:") dinámicos
function generateSalesReasons(mainCard, incomeId, interestId, selectedCards) {
  const reasons = [];
  const selectedCardsList = Array.from(selectedCards);
  // 1. Argumento de segmento y requisitos
  if (incomeId === "clasico") {
    reasons.push({
      strong: "Segmento Clásico accesible:",
      text: "Diseñada para ingresos de $15 mil a $25 mil con los beneficios más competitivos del mercado bancario.",
    });
  } else if (incomeId === "oro") {
    reasons.push({
      strong: "Segmento Oro preferente:",
      text: "Respalda ingresos de $25 mil a $75 mil brindando asistencias completas, mayor porcentaje de recompensas y promociones exclusivas.",
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
  // 3. Argumentos comparativos contextualizados por tipo de tarjeta
  const cardGroups = typeof VALID_CARD_GROUPS !== "undefined" ? VALID_CARD_GROUPS : [];
  const selectedValidCards = cardGroups
    .filter((group) => group.category !== "No Validas")
    .flatMap((group) => group.cards.map((cardName) => ({ cardName, category: group.category })))
    .filter(({ cardName }) => selectedCardsList.includes(cardName));
  const selectedBanks = selectedValidCards
    .filter(({ category, cardName }) => category === "Bancarias" && !cardName.toLowerCase().includes("banamex"))
    .map(({ cardName }) => cardName);
  const selectedDepartments = selectedValidCards.filter(({ category }) => category === "Departamentales");
  const hasFintech = selectedValidCards.some(({ category }) => category === "Fintech");
  const hasIssuer = (name) => selectedBanks.some((bank) => bank.toLowerCase().includes(name.toLowerCase()));

  if (hasIssuer("Invex")) {
    reasons.push({
      strong: "Si valora la atención presencial:",
      text: "INVEX lista centros financieros para clientes inversionistas y también ofrece atención digital y telefónica para tarjetas; confirma si una ubicación atiende la operación que necesita el cliente antes de decir que no cuenta con sucursales. INVEX también publica promociones a meses sin intereses en comercios participantes: compara la oferta y sus condiciones vigentes.",
      type: "competitive",
    });
  }
  if (hasIssuer("American Express")) {
    reasons.push({
      strong: "Aceptación y promociones:",
      text: "No presentes a American Express como de baja aceptación: publica una amplia red de comercios y opciones de meses sin intereses. Pregunta dónde compra el cliente y compara esos comercios con las promociones y preventas vigentes de Banamex.",
      type: "competitive",
    });
  }
  if (hasIssuer("BBVA")) {
    reasons.push({
      strong: "Promociones frente a BBVA:",
      text: "BBVA también tiene promociones y meses sin intereses. Diferencia Banamex con una oferta concreta vigente —por ejemplo, una preventa o promoción exclusiva en un comercio que el cliente frecuente— en vez de afirmar que BBVA ofrece menos promociones.",
      type: "competitive",
    });
  }
  if (hasIssuer("Santander")) {
    reasons.push({
      strong: "Red de sucursales y MSI:",
      text: "Banamex publica una red de 1,261 sucursales y Santander alrededor de 1,000. Santander también mantiene promociones a meses sin intereses; si al cliente le importa la atención presencial, verifica la sucursal cercana y compara las ofertas vigentes.",
      type: "competitive",
    });
  }
  if (hasIssuer("HSBC")) {
    reasons.push({
      strong: "Atención presencial:",
      text: "Banamex publica 1,261 sucursales y HSBC más de 900; HSBC también cuenta con una amplia red de corresponsales. Si la sucursal es importante para el cliente, compara la ubicación y los servicios disponibles en su zona.",
      type: "competitive",
    });
  }
  const otherBanks = selectedBanks.filter((bank) => !["Invex", "American Express", "BBVA", "Santander", "HSBC"].some((name) => bank.toLowerCase().includes(name.toLowerCase())));
  if (otherBanks.length) {
    reasons.push({
      strong: "Compara beneficios concretos:",
      text: `Para ${otherBanks.join(", ")}, evita generalizar sobre sucursales o promociones. Contrasta la tarjeta específica con los beneficios propios del producto recomendado y las ofertas Banamex vigentes que coincidan con las compras habituales del cliente.`,
      type: "competitive",
    });
  }
  if (selectedDepartments.length) {
    reasons.push({
      strong: "Tarjetas departamentales:",
      text: "Algunos beneficios se concentran en la tienda o comercios participantes. Confirma el alcance de la tarjeta concreta y contrástalo con las recompensas y promociones Banamex en los comercios que el cliente usa.",
      type: "competitive",
    });
  }
  if (hasFintech) {
    reasons.push({
      strong: "Tarjetas fintech:",
      text: "En varias tarjetas fintech, las tasas y el CAT publicados suelen ser considerablemente superiores a los de Banamex. Si el cliente suele financiar saldo, destácalo como una desventaja de costo; confirma el producto y la vigencia antes de citar cifras, porque cambian entre tarjetas.",
      type: "competitive",
    });
  }
  if (selectedCardsList.includes("Ninguna")) {
    reasons.push({
      strong: "Construcción de Historial:",
      text: "Excelente oportunidad para iniciar relación bancaria sólida con Citibanamex con la tarjeta más adecuada a su nivel de ingresos.",
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
  const { priorityCard, incomeCard, incomeCards, alternatives, hasKnownLimit, limitAboveIncome, modifierNotApplicable, modifierLabel } = determineCardRecommendation(
    PROFILING_STATE.income,
    PROFILING_STATE.lim,
    PROFILING_STATE.interest,
    PROFILING_STATE.manualSuggestedId,
    PROFILING_STATE.selectedCards
  );
  const recommendationSegment = priorityCard?.segment || PROFILING_STATE.income;
  const limInfo = evaluateLimRelation(recommendationSegment, PROFILING_STATE.lim);
  if (priorityCard?.segment === "clasico" && PROFILING_STATE.lim === "platinum") {
    Object.assign(limInfo, {
      status: "demasiado_alto",
      badgeText: "⚠ Límite demasiado alto para el producto",
      badgeClass: "profiling-lim-badge--demasiado-alto",
      noticeClass: "profiling-lim-notice--demasiado-alto",
      message: "<strong>Puede declinar porque no cubre el perfil.</strong>",
    });
  }
  const segmentLevels = { clasico: 1, oro: 2, platinum: 3 };
  const incomeAboveLimit = hasKnownLimit
    && segmentLevels[PROFILING_STATE.income] > segmentLevels[PROFILING_STATE.lim];
  const incomeOptionCards = incomeAboveLimit
    ? incomeCards
        .filter((card) => card.segment === PROFILING_STATE.income && card.id !== priorityCard?.id)
        .sort((a, b) => (segmentLevels[b.segment] || 0) - (segmentLevels[a.segment] || 0))
    : [];
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
    ? generateSalesReasons(priorityCard, recommendationSegment, PROFILING_STATE.interest, PROFILING_STATE.selectedCards)
    : [];
  // Segment metadata
  const currentSegMeta = (typeof SEGMENTS !== "undefined" ? SEGMENTS : []).find(
    (s) => s.id === recommendationSegment
  ) || { label: "Segmento " + recommendationSegment, bar: "#009cc6" };
  container.innerHTML = `
    <div class="profiling-layout">
      <div class="profiling-recommendation-column">
            <section class="profiling-result-card">
        <div class="profiling-result-header">
          <div>
            <span class="eyebrow profiling-recommendation-eyebrow">Recomendación Inteligente</span>
            <h2 style="font-family:var(--font-display); margin:4px 0 0; font-size:1.4rem;">Tarjeta recomendada</h2>
          </div>
          <div class="profiling-badge-group">
            <span class="profiling-priority-badge">Prioridad</span>
            <span class="profiling-segment-badge profiling-segment-badge--${recommendationSegment}" style="background:${currentSegMeta.bar}">${currentSegMeta.label}</span>
          </div>
        </div>
      <section class="profiling-feedback-section">
        <div class="profiling-profile-feedback">
          <div class="profiling-badge-group">
            <span class="profiling-lim-badge ${limInfo.badgeClass}">${limInfo.badgeText}</span>
          </div>
          ${limInfo.status !== "alto" ? `<div class="profiling-lim-notice ${limInfo.noticeClass}"><div>${limInfo.message}</div></div>` : ""}
        </div>
        ${renderProfilingEligibilityAlerts(selectedInvalidCards, selectedValidCards)}
        ${selectedValidCards.length === 0 ? `
          <div class="profiling-card-question-alert" role="status" aria-live="polite">
            <span aria-hidden="true">?</span>
            <span><strong>Pregunta qué tarjeta tiene el cliente</strong> para garantizar la autenticaci&oacute;n y continuar con el tr&aacute;mite.</span>
          </div>
        ` : ""}
        ${modifierNotApplicable ? `
          <div class="profiling-modifier-alert" role="status" aria-live="polite">
            <span class="profiling-eligibility-alert__icon" aria-hidden="true">!</span>
            <span><strong>Modificador no apto:</strong> el cliente no es apto para &ldquo;${modifierLabel}&rdquo;. Se toma en cuenta &uacute;nicamente su perfil.</span>
          </div>
        ` : ""}
      </section>
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
              <li class="profiling-reasons__item ${r.type ? `profiling-reasons__item--${r.type}` : ""}">
                <span class="profiling-reasons__bullet">•</span>
                <div><strong>${r.strong}</strong> ${r.text}</div>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      <section class="profiling-options-section">
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
                    <span class="profiling-alt-card__badge ${PROFILING_STATE.income === "platinum" && PROFILING_STATE.lim === "platinum" && alt.segment === "clasico" ? "profiling-alt-card__badge--warning" : ""}">${PROFILING_STATE.income === "platinum" && PROFILING_STATE.lim === "platinum" && alt.segment === "clasico" ? "&#9888; Puede declinar porque no cubre el perfil" : "&#10003; Buena opci&oacute;n tambi&eacute;n"}</span>
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
        ${incomeOptionCards.length ? `
          <section class="profiling-income-options">
            <header class="profiling-income-options__heading">
              <span class="eyebrow">Opciones por ingresos</span>
            </header>
            ${incomeOptionCards.map((card) => {
              const cardMayDecline = hasKnownLimit
                && segmentLevels[PROFILING_STATE.lim] < segmentLevels[card.segment];
              const cardSegmentLabel = PROFILING_INCOME_OPTIONS.find((option) => option.id === card.segment)?.label || "";
              return `
                <div class="profiling-income-recommendation">
                  <div>
                    <strong>${card.name}</strong>
                    <span>${cardSegmentLabel} &middot; Ingreso m&iacute;nimo: ${card.income}</span>
                    ${cardMayDecline ? `<span class="profiling-income-recommendation__warning" role="note">⚠ Puede declinar por l&iacute;mite de cr&eacute;dito inferior al requerido</span>` : ""}
                  </div>
                  <button type="button" class="profiling-income-recommendation__image" onclick="openCard('${card.id}')" aria-label="Ver detalle de ${card.name}" title="Ver detalle de ${card.name}">
                    <img src="${card.image}" alt="">
                  </button>
                </div>`;
            }).join("")}
          </section>
        ` : ""}

      </section>
      </section>
      </div>
            <section class="profiling-card profiling-profile-section">
        <header class="profiling-panel-heading">
          <span class="eyebrow">Perfil del cliente</span>
          <h2>Perfila por ingresos</h2>
        </header>
        <!-- 1. Ingresos Comprobables -->
        <div class="profiling-section profiling-section--income">
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
        <!-- 2. Límite de Crédito Actual -->
        <div class="profiling-section profiling-section--limit">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">2</span>
            <span>Límite de Crédito Actual</span>
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
        <div class="profiling-section profiling-section--interest">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">3</span>
            <span>¿Qué busca o prioriza el cliente?</span>
          </div>
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
    </div>
  `;
}
// Renderiza las tarjetas válidas agrupadas por tipo.
function renderProfilingCardChips() {
  const groups = (typeof VALID_CARD_GROUPS !== "undefined" ? VALID_CARD_GROUPS : [])
    .filter((group) => group.category !== "No Validas" && group.cards.length > 0);
  const isNoneSelected = PROFILING_STATE.selectedCards.has("Ninguna");
  const noneButton = `
    <button type="button" class="profiling-card-chip ${isNoneSelected ? "is-selected" : ""}"
            aria-pressed="${isNoneSelected}" onclick="toggleProfilingCard('Ninguna')">
      <span>No se ha preguntado</span>
    </button>`;
  const popularityOrder = ["BBVA", "Banamex", "Nu", "Plata Card", "Santander", "Banorte", "BanCoppel", "HSBC", "Invex", "Inbursa"];
  const popularityRank = (cardName) => popularityOrder.findIndex((name) => cardName.startsWith(name));
  const renderCard = (cardName) => {
    const isSelected = PROFILING_STATE.selectedCards.has(cardName);
    const safeCardName = cardName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `
      <button type="button" class="profiling-card-chip ${isSelected ? "is-selected" : ""}"
              aria-pressed="${isSelected}"
              onclick="toggleProfilingCard('${safeCardName}')"
              title="Autentica como referencia">
        <span>${cardName}</span>
      </button>`;
  };
  return noneButton + groups.map((group) => {
    const sortedCards = [...group.cards].sort((a, b) => {
      const rankA = popularityRank(a);
      const rankB = popularityRank(b);
      if (rankA < 0) return rankB < 0 ? 0 : 1;
      if (rankB < 0) return -1;
      return rankA - rankB;
    });
    return `
      <section class="profiling-card-chip-group" aria-label="${group.category}">
        <h3 class="profiling-card-chip-group__title">${group.category}</h3>
        <div class="profiling-card-chip-group__items">
          ${sortedCards.map(renderCard).join("")}
        </div>
      </section>`;
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
  if (cardName !== "Ninguna" && PROFILING_STATE.selectedCards.has(cardName)) {
    requestAnimationFrame(scrollToProfilingRecommendation);
  }
}
function selectAlternativeCard(cardId) {
  PROFILING_STATE.manualSuggestedId = cardId;
  renderProfilingUI();
}
function scrollToProfilingRecommendation() {
  document.querySelector(".profiling-result-card")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
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
