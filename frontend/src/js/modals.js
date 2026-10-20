/* Apertura y cierre de los modales informativos y del script de venta. */
function setModalVariant(variant) {
  const modal = document.getElementById("scriptModal");
  const modalBox = modal.querySelector(".modal-box");
  const modalContent = document.getElementById("modalScript");
  ["venta", "redencion", "destinos"].forEach((name) => {
    modal.classList.remove(`modal--${name}`);
    modalBox.classList.remove(`modal-box--${name}`);
    modalContent.classList.remove(`modal-script--${name}`);
  });
  modal.classList.add(`modal--${variant}`);
  modalBox.classList.add(`modal-box--${variant}`);
  modalContent.classList.add(`modal-script--${variant}`);
}

function openInfoModal(title, html, variant) {
  setModalVariant(variant || "destinos");
  document.getElementById("modalTitle").textContent = title;
  const modalScript = document.getElementById("modalScript");
  modalScript.innerHTML = html || "";
  document.getElementById("scriptModal").classList.add("show");
}

function openScript() {
  setModalVariant("venta");
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
