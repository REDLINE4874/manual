/* Inicializa las vistas, calculadoras y navegación de la aplicación. */
renderNav();
renderHome();
renderDigitos();
initCalculators();
showView("home");

const utilityLinks = document.getElementById("utilityLinks");
const utilityLinksTrigger = utilityLinks?.querySelector(".utility-links__trigger");
utilityLinksTrigger?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = utilityLinks.classList.toggle("is-open");
  utilityLinksTrigger.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", () => {
  utilityLinks?.classList.remove("is-open");
  utilityLinksTrigger?.setAttribute("aria-expanded", "false");
});
