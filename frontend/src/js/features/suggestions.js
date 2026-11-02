const suggestionForm = document.getElementById("suggestionForm");
const suggestionName = document.getElementById("suggestionName");
const suggestionMessage = document.getElementById("suggestionMessage");
const suggestionStatus = document.getElementById("suggestionStatus");
const adminSuggestionsList = document.getElementById("adminSuggestionsList");
const adminSuggestionsStatus = document.getElementById("adminSuggestionsStatus");

suggestionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!window.SUPABASE_AUTH_CLIENT) {
    suggestionStatus.textContent = "El servicio de sugerencias no está disponible por el momento.";
    suggestionStatus.classList.add("is-error");
    return;
  }
  const button = suggestionForm.querySelector('button[type="submit"]');
  button.disabled = true;
  suggestionStatus.textContent = "Enviando...";
  suggestionStatus.classList.remove("is-error");
  const { error } = await window.SUPABASE_AUTH_CLIENT.from("suggestions").insert({
    name: suggestionName.value.trim() || null,
    message: suggestionMessage.value.trim(),
  });
  button.disabled = false;
  if (error) {
    console.error("Error al enviar sugerencia:", error);
    suggestionStatus.textContent = "No se pudo enviar. Inténtalo de nuevo más tarde.";
    suggestionStatus.classList.add("is-error");
    return;
  }
  suggestionForm.reset();
  suggestionStatus.textContent = "¡Gracias! Tu sugerencia fue enviada.";
});

async function loadAdminSuggestions() {
  if (window.currentUserRole !== "admin" || !window.SUPABASE_AUTH_CLIENT) return;
  adminSuggestionsStatus.textContent = "Cargando sugerencias...";
  const { data, error } = await window.SUPABASE_AUTH_CLIENT
    .from("suggestions").select("id, name, message, created_at").order("created_at", { ascending: false });
  if (error) {
    console.error("Error al cargar sugerencias:", error);
    adminSuggestionsStatus.textContent = "No se pudieron cargar las sugerencias.";
    adminSuggestionsStatus.classList.add("is-error");
    return;
  }
  adminSuggestionsStatus.classList.remove("is-error");
  adminSuggestionsStatus.textContent = `${data.length} sugerencia(s)`;
  adminSuggestionsList.replaceChildren();
  data.forEach((item) => {
    const article = document.createElement("article");
    article.className = "suggestion-entry";
    const meta = document.createElement("p");
    meta.className = "suggestion-entry__meta";
    const date = new Date(item.created_at);
    meta.textContent = `${item.name || "Anónimo"} · ${Number.isNaN(date.getTime()) ? "" : date.toLocaleString("es-MX")}`;
    const message = document.createElement("p");
    message.className = "suggestion-entry__message";
    message.textContent = item.message;
    article.append(meta, message);
    adminSuggestionsList.append(article);
  });
  if (!data.length) adminSuggestionsList.textContent = "Todavía no hay sugerencias.";
}

document.getElementById("adminRefreshSuggestions")?.addEventListener("click", loadAdminSuggestions);
document.querySelector('[data-admin-tab="suggestions"]')?.addEventListener("click", loadAdminSuggestions);
