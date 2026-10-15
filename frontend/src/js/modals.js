/* Apertura y cierre de los modales informativos y del script de venta. */
function openInfoModal(title, html) {
  document.getElementById("modalTitle").textContent = title;
  const modalScript = document.getElementById("modalScript");
  modalScript.innerHTML = html || "";
  document.getElementById("scriptModal").classList.add("show");
}

function openScript() {
  document.getElementById("modalTitle").textContent =
    "Script de venta - " + currentCardName;

  const modalScript = document.getElementById("modalScript");
  modalScript.textContent = currentScript || "No hay script registrado.";

  document.getElementById("scriptModal").classList.add("show");
}

function closeScript() {
  document.getElementById("scriptModal").classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeScript);

document.getElementById("scriptModal").addEventListener("click", (e) => {
  if (e.target.id === "scriptModal") closeScript();
});
