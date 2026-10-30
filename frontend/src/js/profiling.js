/* ============================================================
   PERFILAMIENTO DE CLIENTE - LÓGICA Y RENDERIZADO
   ============================================================ */

const PROFILING_STATE = {
  income: "clasico", // "clasico" ($10k-$30k), "oro" ($30k-$75k), "platinum" (> $75k)
  lim: "clasico",    // "clasico", "oro", "platinum", "no_pregunto"
  interest: "recompensas", // "cero_anualidad", "recompensas", "viajes", "eventos", "benefica"
  selectedCards: new Set(),
  activeCardTab: "bancarias", // "bancarias", "fintech", "departamentales", "invalidas"
  manualSuggestedId: null,   // Para cuando el usuario hace clic en una opción alternativa
};

const PROFILING_INCOME_OPTIONS = [
  { id: "clasico", range: "$10,000 a $30,000", label: "Segmento Clásico", level: 1 },
  { id: "oro", range: "$30,000 a $75,000", label: "Segmento Oro", level: 2 },
  { id: "platinum", range: "Más de $75,000", label: "Segmento Platinum", level: 3 },
];

const PROFILING_LIM_OPTIONS = [
  { id: "clasico", range: "$10,000 a $30,000", label: "Nivel Clásico", level: 1 },
  { id: "oro", range: "$30,000 a $75,000", label: "Nivel Oro", level: 2 },
  { id: "platinum", range: "Más de $75,000", label: "Nivel Platinum", level: 3 },
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
      message: "<strong>Límite actual bajo:</strong> El cliente califica formalmente por ingresos mínimos, pero maneja líneas menores. La asignación de línea inicial podría ser conservadora según su historial en buró.",
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

// Determina la mejor tarjeta según segmento e interés del cliente
function determineCardRecommendation(incomeId, interestId, manualId, selectedCards) {
  const cardsInSegment = (window.CARD_DATA ? Object.values(window.CARD_DATA) : []).filter(
    (c) => c.segment === incomeId
  );

  if (!cardsInSegment.length) {
    return { mainCard: null, alternatives: [] };
  }

  // Si el usuario forzó manualmente una tarjeta del segmento
  if (manualId && cardsInSegment.some((c) => c.id === manualId)) {
    const main = cardsInSegment.find((c) => c.id === manualId);
    const alts = cardsInSegment.filter((c) => c.id !== manualId);
    return { mainCard: main, alternatives: alts };
  }

  let recommendedId = "";

  if (incomeId === "clasico") {
    // Si viene de fintech y no eligió otro interés específico, Joy es ideal (cero costo)
    const hasFintech = Array.from(selectedCards).some((c) =>
      ["Nu", "Stori", "Plata Card (Tarjeta de usos especiales)", "Mercado Pago", "Didi Card", "Rappi Card"].some((f) => c.includes(f))
    );

    if (interestId === "cero_anualidad" || (hasFintech && interestId === "recompensas")) {
      recommendedId = "joy";
    } else if (interestId === "benefica") {
      recommendedId = "teleton";
    } else {
      recommendedId = "clasica";
    }
  } else if (incomeId === "oro") {
    if (interestId === "viajes") {
      recommendedId = "descubre";
    } else {
      recommendedId = "oro";
    }
  } else if (incomeId === "platinum") {
    if (interestId === "viajes") {
      recommendedId = "explora";
    } else {
      recommendedId = "platinum";
    }
  }

  const mainCard = cardsInSegment.find((c) => c.id === recommendedId) || cardsInSegment[0];
  const alternatives = cardsInSegment.filter((c) => c.id !== mainCard.id);

  return { mainCard, alternatives };
}

// Genera los argumentos de venta ("Se recomienda por:") dinámicos
function generateSalesReasons(mainCard, incomeId, limInfo, interestId, selectedCards) {
  const reasons = [];
  const selectedCardsList = Array.from(selectedCards);

  // 1. Argumento de segmento y requisitos
  if (incomeId === "clasico") {
    reasons.push({
      strong: "Segmento Clásico accesible:",
      text: "Diseñada para ingresos de $10,000 a $30,000 con los beneficios más competitivos del mercado bancario.",
    });
  } else if (incomeId === "oro") {
    reasons.push({
      strong: "Segmento Oro preferente:",
      text: "Respalda ingresos de $30,000 a $75,000 brindando asistencias completas, mayor porcentaje de recompensas y promociones exclusivas.",
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
  const hasInvalidas = selectedCardsList.some((c) =>
    ["Banco Azteca", "Coppel Departamental", "Mercado Pago", "Didi Card", "Rappi Card", "Hey Banco"].some((i) => c.includes(i))
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

  if (hasInvalidas) {
    reasons.push({
      strong: "⚠️ Nota sobre autenticación:",
      text: "El cliente cuenta con plásticos que NO autentican para trámite directo en Banamex. Asegúrate de verificar comprobante de ingresos o tarjetas bancarias válidas.",
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

// Genera speech rápido para el vendedor
function generateSalesPitch(mainCard, incomeId, limInfo, interestId, selectedCards) {
  let pitch = `Estimado cliente, revisando su perfil y sus ingresos comprobables, la tarjeta ideal que le recomendamos hoy es la **${mainCard.name}**. `;

  if (mainCard.id === "joy") {
    pitch += `Es una tarjeta sin costo de comisión de administración de por vida con solo realizar una compra de $300 al mes. Además, cuenta con la máxima seguridad al no tener CVV visible y le brinda acceso a las famosas Preventas Exclusivas Banamex.`;
  } else if (mainCard.id === "clasica") {
    pitch += `Le otorgará un 5% en Puntos Premia canjeables directamente por dinero en efectivo en cajeros, y se duplican al 10% en todas sus compras de gasolina, además de poder exentar la comisión de administración con un gasto mínimo de $300 pesos al mes.`;
  } else if (mainCard.id === "oro") {
    pitch += `Le entrega un 7% de recompensas en Puntos Premia y el doble (14%) en gasolineras, con la comodidad de exentar su comisión mensual y gozar de seguros y asistencias completas de categoría Oro.`;
  } else if (mainCard.id === "descubre") {
    pitch += `Con esta tarjeta categoría Platinum obtendrá boletos de avión 2x1 a destinos de playa nacionales y accesos ilimitados a la Sala VIP Mastercard en la Terminal 1 del AICM, acumulando puntos Momentos Banamex en cada compra.`;
  } else if (mainCard.id === "platinum") {
    pitch += `Le brinda nuestra tasa de interés más competitiva del 30.47%, 10% en Puntos Premia y el paquete de asistencia gratuita Libra Premium con cobertura vial, médica y en el hogar.`;
  } else if (mainCard.id === "explora") {
    pitch += `Es el producto ideal para viajar: 10 accesos gratuitos al año en Salas VIP Beyond en CDMX, Guadalajara y Monterrey, boletos 2x1 a playas y 1.15 puntos por dólar.`;
  } else {
    pitch += `Le brinda meses sin intereses en la mayoría de comercios, promociones en cines y restaurantes, y preventas exclusivas.`;
  }

  pitch += ` Con su autorización, yo mismo lo apoyaré con su solicitud de inmediato.`;
  return pitch;
}

// Inicialización y renderizado del módulo
function initProfilingModule() {
  const container = document.getElementById("profilingAppContainer");
  if (!container) return;

  renderProfilingUI();
}

function renderProfilingUI() {
  const container = document.getElementById("profilingAppContainer");
  if (!container) return;

  const limInfo = evaluateLimRelation(PROFILING_STATE.income, PROFILING_STATE.lim);
  const { mainCard, alternatives } = determineCardRecommendation(
    PROFILING_STATE.income,
    PROFILING_STATE.interest,
    PROFILING_STATE.manualSuggestedId,
    PROFILING_STATE.selectedCards
  );

  const reasons = mainCard
    ? generateSalesReasons(mainCard, PROFILING_STATE.income, limInfo, PROFILING_STATE.interest, PROFILING_STATE.selectedCards)
    : [];
  const pitchText = mainCard
    ? generateSalesPitch(mainCard, PROFILING_STATE.income, limInfo, PROFILING_STATE.interest, PROFILING_STATE.selectedCards)
    : "";

  // Segment metadata
  const currentSegMeta = (typeof SEGMENTS !== "undefined" ? SEGMENTS : []).find(
    (s) => s.id === PROFILING_STATE.income
  ) || { label: "Segmento " + PROFILING_STATE.income, bar: "#009cc6" };

  container.innerHTML = `
    <div class="profiling-layout">
      <!-- Columna Izquierda: Criterios del Prospecto -->
      <div class="profiling-card">
        
        <!-- 1. Ingresos Comprobables (Define segmento) -->
        <div class="profiling-section">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">1</span>
            <span>Ingresos Mensuales Comprobables</span>
          </div>
          <div class="profiling-section__subtitle">Define obligatoriamente el segmento por requisito mínimo</div>
          <div class="profiling-btn-grid">
            ${PROFILING_INCOME_OPTIONS.map(
              (opt) => `
              <button type="button" 
                      class="profiling-option-btn ${PROFILING_STATE.income === opt.id ? "is-selected" : ""}"
                      onclick="setProfilingIncome('${opt.id}')">
                <span class="profiling-option-btn__main">${opt.range}</span>
                <span class="profiling-option-btn__sub">${opt.label}</span>
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
          <div class="profiling-section__subtitle">Evalúa el límite respecto al segmento (no lo restringe)</div>
          <div class="profiling-btn-grid profiling-btn-grid--lim">
            ${PROFILING_LIM_OPTIONS.map(
              (opt) => `
              <button type="button" 
                      class="profiling-option-btn ${PROFILING_STATE.lim === opt.id ? "is-selected" : ""}"
                      onclick="setProfilingLim('${opt.id}')">
                <span class="profiling-option-btn__main">${opt.range}</span>
                <span class="profiling-option-btn__sub">${opt.label}</span>
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
        <div class="profiling-section">
          <div class="profiling-section__title">
            <span class="profiling-step-badge">4</span>
            <span>Tarjetas que maneja actualmente</span>
          </div>
          <div class="profiling-section__subtitle">Basadas en la tabla de validación de tarjetas del manual</div>
          
          <div class="profiling-cards-filter">
            <button type="button" class="profiling-cards-filter__btn ${PROFILING_STATE.activeCardTab === "bancarias" ? "is-active" : ""}" onclick="setProfilingCardTab('bancarias')">Bancarias</button>
            <button type="button" class="profiling-cards-filter__btn ${PROFILING_STATE.activeCardTab === "fintech" ? "is-active" : ""}" onclick="setProfilingCardTab('fintech')">Fintech</button>
            <button type="button" class="profiling-cards-filter__btn ${PROFILING_STATE.activeCardTab === "departamentales" ? "is-active" : ""}" onclick="setProfilingCardTab('departamentales')">Departamentales</button>
            <button type="button" class="profiling-cards-filter__btn ${PROFILING_STATE.activeCardTab === "invalidas" ? "is-active" : ""}" onclick="setProfilingCardTab('invalidas')">No Válidas</button>
          </div>

          <div class="profiling-cards-chips" id="profilingChipsContainer">
            ${renderProfilingCardChips()}
          </div>
        </div>

      </div>

      <!-- Columna Derecha: Tarjeta Sugerida y Recomendación -->
      <div class="profiling-result-card">
        
        <div class="profiling-result-header">
          <div>
            <span class="eyebrow" style="color:var(--brand-teal); font-weight:700;">Recomendación Inteligente</span>
            <h2 style="font-family:var(--font-display); margin:4px 0 0; font-size:1.4rem;">Tarjeta Sugerida</h2>
          </div>
          <div class="profiling-badge-group">
            <span class="profiling-segment-badge" style="background:${currentSegMeta.bar}">${currentSegMeta.label}</span>
            <span class="profiling-lim-badge ${limInfo.badgeClass}">${limInfo.badgeText}</span>
          </div>
        </div>

        <!-- Alerta / Mensaje sobre el Límite de Crédito -->
        <div class="profiling-lim-notice ${limInfo.noticeClass}">
          <div>${limInfo.message}</div>
        </div>

        <!-- Tarjeta Principal -->
        ${
          mainCard
            ? `
          <div class="profiling-suggested-card">
            <div class="profiling-suggested-card__img-wrap">
              <img class="profiling-suggested-card__img" src="${mainCard.image}" alt="${mainCard.name}">
            </div>
            <div class="profiling-suggested-card__info">
              <h3>${mainCard.name}</h3>
              <div class="profiling-suggested-card__specs">
                <span>Ingreso mínimo: <strong>${mainCard.income}</strong></span>
                <span>Comisión: <strong>${mainCard.admin || "Sin costo"}</strong></span>
                <span>CAT: <strong>${mainCard.cat || "N/A"}</strong></span>
              </div>
              <div class="profiling-suggested-card__actions">
                <button type="button" class="profiling-btn profiling-btn--primary" onclick="openCard('${mainCard.id}')">
                  Ver detalle completo
                </button>
                <button type="button" class="profiling-btn profiling-btn--secondary" onclick="openCardScript('${mainCard.id}')">
                  Ver Script Oficial
                </button>
              </div>
            </div>
          </div>
        `
            : `<p>Selecciona los datos para ver la tarjeta sugerida.</p>`
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
        <div class="profiling-pitch">
          <div class="profiling-pitch__header">
            <span class="profiling-pitch__title">Pitch de venta sugerido</span>
            <button type="button" class="profiling-pitch__copy" onclick="copyProfilingPitch()">
              Copiar texto 📋
            </button>
          </div>
          <p class="profiling-pitch__text" id="profilingPitchText">"${pitchText}"</p>
        </div>

        <!-- Otras opciones disponibles en el segmento -->
        ${
          alternatives.length > 0
            ? `
          <div class="profiling-alternatives">
            <div class="profiling-alternatives__title">Otras opciones en el segmento:</div>
            <div class="profiling-alternatives__grid">
              ${alternatives
                .map(
                  (alt) => `
                <div class="profiling-alt-card" onclick="selectAlternativeCard('${alt.id}')" title="Hacer clic para sugerir esta tarjeta">
                  <img class="profiling-alt-card__img" src="${alt.image}" alt="${alt.name}">
                  <span class="profiling-alt-card__name">${alt.name}</span>
                  <span class="profiling-alt-card__segment">Sugerir esta</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

      </div>
    </div>
  `;
}

// Renderiza los chips de tarjetas según la pestaña activa
function renderProfilingCardChips() {
  const groups = typeof VALID_CARD_GROUPS !== "undefined" ? VALID_CARD_GROUPS : [];
  let targetGroup = null;

  if (PROFILING_STATE.activeCardTab === "bancarias") {
    targetGroup = groups.find((g) => g.category === "Bancarias");
  } else if (PROFILING_STATE.activeCardTab === "fintech") {
    targetGroup = groups.find((g) => g.category === "Fintech");
  } else if (PROFILING_STATE.activeCardTab === "departamentales") {
    targetGroup = groups.find((g) => g.category === "Departamentales");
  } else if (PROFILING_STATE.activeCardTab === "invalidas") {
    targetGroup = groups.find((g) => g.category === "No Validas");
  }

  const cards = targetGroup ? targetGroup.cards : [];
  const isInvalidGroup = PROFILING_STATE.activeCardTab === "invalidas";

  let html = "";

  // Botón especial "Ninguna" en pestaña de bancarias
  if (PROFILING_STATE.activeCardTab === "bancarias") {
    const isNoneSelected = PROFILING_STATE.selectedCards.has("Ninguna");
    html += `
      <button type="button" 
              class="profiling-card-chip ${isNoneSelected ? "is-selected" : ""}"
              onclick="toggleProfilingCard('Ninguna')">
        <span class="profiling-card-chip__status" style="background:#888;"></span>
        <span>Sin tarjetas previas (Ninguna)</span>
      </button>
    `;
  }

  cards.forEach((cardName) => {
    const isSelected = PROFILING_STATE.selectedCards.has(cardName);
    const logoMarkup = typeof getCardLogoMarkup === "function" ? getCardLogoMarkup(cardName) : "";

    html += `
      <button type="button" 
              class="profiling-card-chip ${isSelected ? "is-selected" : ""} ${isInvalidGroup ? "is-invalid" : ""}"
              onclick="toggleProfilingCard('${cardName.replace(/'/g, "\\'")}')"
              title="${isInvalidGroup ? "No autentica para trámite Banamex" : "Autentica como referencia"}">
        ${logoMarkup}
        <span class="profiling-card-chip__status"></span>
        <span>${cardName}</span>
      </button>
    `;
  });

  return html;
}

// Controladores de eventos
function setProfilingIncome(incomeId) {
  PROFILING_STATE.income = incomeId;
  PROFILING_STATE.manualSuggestedId = null; // Reiniciar selección manual
  renderProfilingUI();
}

function setProfilingLim(limId) {
  PROFILING_STATE.lim = limId;
  renderProfilingUI();
}

function setProfilingInterest(interestId) {
  PROFILING_STATE.interest = interestId;
  PROFILING_STATE.manualSuggestedId = null;
  renderProfilingUI();
}

function setProfilingCardTab(tabName) {
  PROFILING_STATE.activeCardTab = tabName;
  const container = document.getElementById("profilingChipsContainer");
  if (container) {
    container.innerHTML = renderProfilingCardChips();
    // Actualizar botones de filtro
    document.querySelectorAll(".profiling-cards-filter__btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.textContent.toLowerCase().includes(tabName.substring(0, 4)));
    });
  }
}

function toggleProfilingCard(cardName) {
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

function copyProfilingPitch() {
  const el = document.getElementById("profilingPitchText");
  if (!el) return;
  const text = el.textContent.replace(/^"|"$/g, "");
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".profiling-pitch__copy");
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = "¡Copiado! ✅";
      setTimeout(() => (btn.textContent = prev), 2000);
    }
  }).catch(() => {
    alert("Texto copiado");
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
