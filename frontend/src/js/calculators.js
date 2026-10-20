function calcPuntos() {
  const pTarjeta = document.getElementById("p_tarjeta");
  const pGasto = document.getElementById("p_gasto");

  if (!pTarjeta || !pGasto) return;

  const pct = parseFloat(pTarjeta.value) || 0;
  const gasto = parseFloat(pGasto.value) || 0;
  const puntos = gasto * pct;
  const bono = puntos * 0.1;

  document.getElementById("p_out_pct").textContent = (pct * 100).toFixed(0) + "%";
  document.getElementById("p_out_puntos").textContent = puntos.toLocaleString("es-MX", {
    maximumFractionDigits: 2,
  });
  document.getElementById("p_out_bono").textContent =
    "$" + bono.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function calcIntereses() {
  const iTarjeta = document.getElementById("i_tarjeta");
  const iDeuda = document.getElementById("i_deuda");

  if (!iTarjeta || !iDeuda) return;

  const anual = parseFloat(iTarjeta.value) || 0;
  const deuda = parseFloat(iDeuda.value) || 0;
  const mensual = anual / 12;
  const intereses = deuda * mensual;

  document.getElementById("i_out_anual").textContent = (anual * 100).toFixed(2) + "%";
  document.getElementById("i_out_mensual").textContent = (mensual * 100).toFixed(2) + "%";
  document.getElementById("i_out_intereses").textContent =
    "$" + intereses.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function initCalculators() {
  document.querySelectorAll("select.custom-select").forEach(enhanceCustomSelect);
  const pTarjeta = document.getElementById("p_tarjeta");
  const pGasto = document.getElementById("p_gasto");
  const iTarjeta = document.getElementById("i_tarjeta");
  const iDeuda = document.getElementById("i_deuda");

  if (pTarjeta) pTarjeta.addEventListener("change", calcPuntos);
  if (pGasto) pGasto.addEventListener("input", calcPuntos);
  if (iTarjeta) iTarjeta.addEventListener("change", calcIntereses);
  if (iDeuda) iDeuda.addEventListener("input", calcIntereses);

  calcPuntos();
  calcIntereses();
}

function enhanceCustomSelect(select) {
  if (select.dataset.enhanced === "true") return;
  select.dataset.enhanced = "true";

  const wrapper = document.createElement("div");
  wrapper.className = "calculator-select";
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "calculator-select__trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.id = `${select.id}-menu`;
  menu.className = "calculator-select__menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  const closeMenu = () => {
    menu.hidden = true;
    wrapper.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };

  const syncLabel = () => {
    trigger.textContent = select.options[select.selectedIndex]?.text || "Selecciona una opción";
    menu.querySelectorAll('[role="option"]').forEach((option) => {
      option.setAttribute("aria-selected", String(option.dataset.value === select.value));
    });
  };

  Array.from(select.options).forEach((option) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "calculator-select__option";
    item.dataset.value = option.value;
    item.textContent = option.textContent;
    item.setAttribute("role", "option");
    item.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncLabel();
      closeMenu();
    });
    menu.appendChild(item);
  });

  trigger.addEventListener("click", () => {
    const willOpen = menu.hidden;
    document.querySelectorAll(".calculator-select.is-open").forEach((openWrapper) => {
      if (openWrapper !== wrapper) openWrapper.querySelector(".calculator-select__trigger")?.click();
    });
    menu.hidden = !willOpen;
    wrapper.classList.toggle("is-open", willOpen);
    trigger.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) closeMenu();
  });

  wrapper.append(trigger, menu);
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  syncLabel();
}

window.initCalculators = initCalculators;
