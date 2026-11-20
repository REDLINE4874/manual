const personalizationToggle = document.getElementById("personalizationToggle");
const personalizationMenu = document.getElementById("personalizationMenu");
const personalizationPanel = document.getElementById("personalizationPanel");

function setPersonalizationMenuOpen(isOpen, restoreFocus = false) {
  personalizationPanel.hidden = !isOpen;
  personalizationToggle.setAttribute("aria-expanded", String(isOpen));
  if (!isOpen && restoreFocus) personalizationToggle.focus();
}

personalizationToggle.addEventListener("click", () => {
  setPersonalizationMenuOpen(personalizationPanel.hidden);
});

document.addEventListener("click", (event) => {
  if (personalizationPanel.hidden || personalizationMenu.contains(event.target)) return;
  setPersonalizationMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !personalizationPanel.hidden) {
    setPersonalizationMenuOpen(false, true);
  }
});
