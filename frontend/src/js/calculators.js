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

window.initCalculators = initCalculators;
