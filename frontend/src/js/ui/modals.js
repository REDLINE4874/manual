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

function showCustomConfirm(message, options = {}) {
  const modal = document.getElementById("confirmModal");
  const title = document.getElementById("confirmModalTitle");
  const messageElement = document.getElementById("confirmModalMessage");
  const cancel = document.getElementById("confirmModalCancel");
  const accept = document.getElementById("confirmModalAccept");
  if (!modal || !title || !messageElement || !cancel || !accept) return Promise.resolve(false);

  title.textContent = options.title || "Confirmar acción";
  messageElement.textContent = message;
  cancel.textContent = options.cancelText || "Cancelar";
  accept.textContent = options.confirmText || "Confirmar";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  accept.focus();

  return new Promise((resolve) => {
    const finish = (result) => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      cancel.removeEventListener("click", onCancel);
      accept.removeEventListener("click", onAccept);
      modal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKeydown);
      resolve(result);
    };
    const onCancel = () => finish(false);
    const onAccept = () => finish(true);
    const onBackdrop = (event) => { if (event.target === modal) finish(false); };
    const onKeydown = (event) => { if (event.key === "Escape") finish(false); };
    cancel.addEventListener("click", onCancel);
    accept.addEventListener("click", onAccept);
    modal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeydown);
  });
}

window.showCustomConfirm = showCustomConfirm;

function showCustomNotice(message, options = {}) {
  const notice = document.getElementById("operationNotice");
  const messageElement = document.getElementById("operationNoticeMessage");
  if (!notice || !messageElement) return;
  messageElement.textContent = `${options.title ? `${options.title}: ` : ""}${message}`;
  notice.hidden = false;
  notice.classList.remove("is-visible");
  requestAnimationFrame(() => notice.classList.add("is-visible"));
  clearTimeout(showCustomNotice.timeoutId);
  showCustomNotice.timeoutId = setTimeout(() => {
    notice.classList.remove("is-visible");
    setTimeout(() => { notice.hidden = true; }, 220);
  }, 3800);
}

window.showCustomNotice = showCustomNotice;
