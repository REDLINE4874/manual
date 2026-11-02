const adminNavButton = document.getElementById("adminNavButton");
const adminUsersTableBody = document.getElementById("adminUsersTableBody");
const adminStatus = document.getElementById("adminStatus");
const adminRefreshUsers = document.getElementById("adminRefreshUsers");
const adminPasswordModal = document.getElementById("adminPasswordModal");
const adminPasswordClose = document.getElementById("adminPasswordClose");
const adminPasswordCancel = document.getElementById("adminPasswordCancel");
const adminPasswordForm = document.getElementById("adminPasswordForm");
const adminPasswordUsername = document.getElementById("adminPasswordUsername");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminPasswordConfirm = document.getElementById("adminPasswordConfirm");
const adminPasswordStatus = document.getElementById("adminPasswordStatus");
const adminCardSelect = document.getElementById("adminCardSelect");
const adminCardForm = document.getElementById("adminCardForm");
const adminCardCat = document.getElementById("adminCardCat");
const adminCardRate = document.getElementById("adminCardRate");
const adminCardValidityFields = document.getElementById("adminCardValidityFields");
const adminOpenValidity = document.getElementById("adminOpenValidity");
const adminValidityModal = document.getElementById("adminValidityModal");
const adminValidityClose = document.getElementById("adminValidityClose");
const adminValidityDone = document.getElementById("adminValidityDone");
const adminRestoreCard = document.getElementById("adminRestoreCard");
const adminCardAdmin = document.getElementById("adminCardAdmin");
const manualUpdatedAt = document.getElementById("manualUpdatedAt");
const manualUpdatedHero = document.getElementById("manualUpdatedHero");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminTabPanels = document.querySelectorAll("[data-admin-panel]");

window.currentUserRole = "user";
const cardSettings = new Map();
const validityTemplates = new Map();
const cardDefaults = new Map();
let adminPasswordTargetId = "";

function setAdminPasswordModal(open, user = null) {
  adminPasswordModal?.classList.toggle("show", open);
  adminPasswordModal?.setAttribute("aria-hidden", String(!open));
  if (open && user) {
    adminPasswordTargetId = user.id;
    adminPasswordUsername.value = user.username || "";
    adminPasswordInput.value = "";
    adminPasswordConfirm.value = "";
    adminPasswordStatus.textContent = "";
    adminPasswordStatus.classList.remove("is-error");
    adminPasswordInput.focus();
  } else if (!open) {
    adminPasswordTargetId = "";
    adminPasswordForm?.reset();
  }
}

function setAdminValidityModal(open) {
  adminValidityModal?.classList.toggle("show", open);
  adminValidityModal?.setAttribute("aria-hidden", String(!open));
  if (open) adminValidityClose?.focus();
}

function captureCardDefaults() {
  if (!window.CARD_DATA || cardDefaults.size) return;
  Object.values(window.CARD_DATA).forEach((card) => {
    cardDefaults.set(card.id, {
      cat: card.cat || "", rate: card.rate || "", validity: card.validity || "", admin: card.admin || "",
    });
  });
}

function updateManualUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return;
  const isoDate = date.toISOString().slice(0, 10);
  const badgeDate = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const heroDate = date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (manualUpdatedAt) { manualUpdatedAt.dateTime = isoDate; manualUpdatedAt.textContent = badgeDate; }
  if (manualUpdatedHero) manualUpdatedHero.textContent = heroDate;
}

function setAdminTab(tabName) {
  adminTabs.forEach((tab) => {
    const active = tab.dataset.adminTab === tabName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  adminTabPanels.forEach((panel) => { panel.hidden = panel.dataset.adminPanel !== tabName; });
}

adminTabs.forEach((tab) => tab.addEventListener("click", () => setAdminTab(tab.dataset.adminTab)));

function setAdminStatus(message, isError = false) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.classList.toggle("is-error", isError);
}

function setAdminVisibility(isAdmin) {
  if (adminNavButton) adminNavButton.hidden = !isAdmin;
  if (!isAdmin && document.getElementById("view-admin")?.classList.contains("active")) showView("home");
}

function escapeAdminHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[character]));
}

async function loadAdminUsers() {
  if (window.currentUserRole !== "admin" || !window.SUPABASE_AUTH_CLIENT) return;
  setAdminStatus("Cargando usuarios...");
  const { data, error } = await window.SUPABASE_AUTH_CLIENT.rpc("list_admin_users");
  if (error) {
    console.error("Error al cargar usuarios administrativos:", error);
    setAdminStatus(`No se pudieron cargar los usuarios: ${error.message || "error desconocido"}`, true);
    return;
  }
  adminUsersTableBody.innerHTML = (data || []).map((user) => `
    <tr><td>${escapeAdminHtml(user.username)}</td>
    <td><span class="admin-role ${user.role === "admin" ? "admin-role--admin" : user.blocked ? "admin-role--blocked" : "admin-role--user"}">${user.role === "admin" ? "Administrador" : user.blocked ? "Bloqueado" : "Activo"}</span></td>
    <td class="admin-users-table__actions"><button class="notes-button notes-button--secondary" type="button" data-user-id="${escapeAdminHtml(user.id)}" data-next-blocked="${!user.blocked}" ${user.role === "admin" ? "disabled title=\"Los administradores no se pueden bloquear\"" : ""}>${user.role === "admin" ? "Protegido" : user.blocked ? "Desbloquear" : "Bloquear"}</button>
    <button class="notes-button notes-button--secondary" type="button" data-password-user-id="${escapeAdminHtml(user.id)}" data-password-username="${escapeAdminHtml(user.username)}">Cambiar contraseña</button></td></tr>`).join("");
  setAdminStatus(`${data?.length || 0} usuario(s) encontrado(s).`);
}

function applyCardSetting(cardId, setting) {
  const card = window.CARD_DATA?.[cardId];
  if (!card || !setting) return;
  ["cat", "rate", "validity", "admin"].forEach((field) => {
    if (setting[field] !== undefined && setting[field] !== "") card[field] = setting[field];
  });
}

async function loadCardSettings() {
  if (!window.SUPABASE_AUTH_CLIENT) return;
  captureCardDefaults();
  const { data, error } = await window.SUPABASE_AUTH_CLIENT.rpc("get_card_settings");
  if (error) return;
  (data || []).forEach((setting) => { cardSettings.set(setting.card_id, setting); applyCardSetting(setting.card_id, setting); });
  const lastUpdated = (data || []).map((setting) => setting.updated_at).filter(Boolean).sort().pop();
  if (lastUpdated) updateManualUpdatedAt(lastUpdated);
  if (typeof renderHome === "function") renderHome();
  else window.addEventListener("load", () => { if (typeof renderHome === "function") renderHome(); }, { once: true });
}

function fillCardEditor(cardId) {
  const card = window.CARD_DATA?.[cardId];
  if (!card) return;
  const setting = { ...(cardDefaults.get(cardId) || {}), ...card, ...(cardSettings.get(cardId) || {}) };
  adminCardCat.value = setting.cat || "";
  adminCardRate.value = setting.rate || "";
  renderValidityStrongFields(cardId, setting.validity || "");
  adminCardAdmin.value = setting.admin || "";
}

async function restoreCardDefaults() {
  const cardId = adminCardSelect?.value;
  const defaults = cardDefaults.get(cardId);
  if (!cardId || !defaults) return;
  const shouldRestore = await window.showCustomConfirm("Se reemplazarán los datos actuales de esta tarjeta por sus valores originales.", {
    title: "Restaurar valores originales",
    confirmText: "Restaurar",
  });
  if (!shouldRestore) return;
  const { error } = await window.SUPABASE_AUTH_CLIENT.rpc("set_card_settings", {
    target_card_id: cardId, target_cat: defaults.cat, target_rate: defaults.rate,
    target_validity: defaults.validity, target_admin: defaults.admin,
  });
  if (error) { setAdminStatus(`No se pudieron restaurar los valores: ${error.message || "error desconocido"}`, true); return; }
  const card = window.CARD_DATA?.[cardId];
  if (card) Object.assign(card, defaults);
  cardSettings.set(cardId, { card_id: cardId, ...defaults });
  fillCardEditor(cardId);
  updateManualUpdatedAt(new Date().toISOString());
  if (typeof renderHome === "function") renderHome();
  setAdminStatus("Valores originales restaurados correctamente.");
  window.showCustomNotice("Los valores originales de la tarjeta se restauraron correctamente.", {
    title: "Valores restaurados",
  });
}

function renderValidityStrongFields(cardId, validity) {
  validityTemplates.set(cardId, validity);
  if (!adminCardValidityFields) return;
  const holder = document.createElement("div");
  holder.innerHTML = validity || "";
  const strongValues = [...holder.querySelectorAll("strong")].map((strong) => strong.textContent);
  const fieldLabels = ["CAT", "VIGENCIA", "TASA DE INTERÉS", "COMISIÓN POR ADMINISTRACIÓN"];
  adminCardValidityFields.innerHTML = strongValues.length
    ? strongValues.map((value, index) => `<label>${fieldLabels[index] || `Texto destacado ${index + 1}`}<input type="text" data-validity-strong="${index}" value="${escapeAdminHtml(value)}" required></label>`).join("")
    : '<p class="admin-validity-empty">Esta tarjeta no tiene textos editables de vigencia.</p>';
}

function getEditedValidity(cardId) {
  const template = validityTemplates.get(cardId) || "";
  let index = 0;
  return template.replace(/(<strong\b[^>]*>)([\s\S]*?)(<\/strong>)/gi, (match, open, _value, close) => {
    const input = adminCardValidityFields?.querySelector(`[data-validity-strong="${index}"]`);
    const value = input?.value ?? "";
    index += 1;
    return `${open}${escapeAdminHtml(value)}${close}`;
  });
}

function initializeCardEditor() {
  if (!adminCardSelect || !window.CARD_DATA) return;
  captureCardDefaults();
  adminCardSelect.innerHTML = Object.values(window.CARD_DATA).map((card) => `<option value="${escapeAdminHtml(card.id)}">${escapeAdminHtml(card.name)}</option>`).join("");
  if (window.enhanceCustomSelect) window.enhanceCustomSelect(adminCardSelect);
  fillCardEditor(adminCardSelect.value);
}

async function refreshAdminAccess(session) {
  window.currentUserRole = "user";
  setAdminVisibility(false);
  if (!session?.user || !window.SUPABASE_AUTH_CLIENT) return;
  const { data, error } = await window.SUPABASE_AUTH_CLIENT.from("profiles").select("role, blocked").eq("id", session.user.id).maybeSingle();
  if (!error) window.currentUserRole = data?.role === "admin" && !data?.blocked ? "admin" : "user";
  setAdminVisibility(window.currentUserRole === "admin");
  if (window.currentUserRole === "admin") { loadAdminUsers(); initializeCardEditor(); }
}

adminNavButton?.addEventListener("click", () => showView("admin"));
adminRefreshUsers?.addEventListener("click", () => { loadAdminUsers(); loadCardSettings(); });
adminUsersTableBody?.addEventListener("click", async (event) => {
  const passwordButton = event.target.closest("[data-password-user-id]");
  if (passwordButton) {
    setAdminPasswordModal(true, { id: passwordButton.dataset.passwordUserId, username: passwordButton.dataset.passwordUsername });
    return;
  }
  const button = event.target.closest("[data-user-id]");
  if (!button) return;
  button.disabled = true;
  const { error } = await window.SUPABASE_AUTH_CLIENT.rpc("set_user_blocked", { target_user_id: button.dataset.userId, target_blocked: button.dataset.nextBlocked === "true" });
  button.disabled = false;
  if (error) { setAdminStatus(`No se pudo actualizar el bloqueo: ${error.message || "error desconocido"}`, true); return; }
  loadAdminUsers();
});

adminPasswordClose?.addEventListener("click", () => setAdminPasswordModal(false));
adminPasswordCancel?.addEventListener("click", () => setAdminPasswordModal(false));
adminPasswordModal?.addEventListener("click", (event) => {
  if (event.target === adminPasswordModal) setAdminPasswordModal(false);
});
adminPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = adminPasswordInput.value;
  if (password !== adminPasswordConfirm.value) {
    adminPasswordStatus.textContent = "Las contraseñas no coinciden.";
    adminPasswordStatus.classList.add("is-error");
    return;
  }
  if (password.length < 8) {
    adminPasswordStatus.textContent = "La contraseña debe tener al menos 8 caracteres.";
    adminPasswordStatus.classList.add("is-error");
    return;
  }
  const submit = adminPasswordForm.querySelector("button[type=submit]");
  submit.disabled = true;
  const { error } = await window.SUPABASE_AUTH_CLIENT.rpc("set_user_password", {
    target_user_id: adminPasswordTargetId,
    target_password: password,
  });
  submit.disabled = false;
  if (error) {
    adminPasswordStatus.textContent = `No se pudo cambiar la contraseña: ${error.message || "error desconocido"}`;
    adminPasswordStatus.classList.add("is-error");
    return;
  }
  const username = adminPasswordUsername.value;
  setAdminPasswordModal(false);
  setAdminStatus(`Contraseña actualizada para ${username}.`);
  window.showCustomNotice("La contraseña se actualizó correctamente. Comunica la nueva contraseña al usuario de forma segura.", { title: "Contraseña actualizada" });
});

adminCardSelect?.addEventListener("change", () => fillCardEditor(adminCardSelect.value));
adminRestoreCard?.addEventListener("click", restoreCardDefaults);
adminOpenValidity?.addEventListener("click", () => setAdminValidityModal(true));
adminValidityClose?.addEventListener("click", () => setAdminValidityModal(false));
adminValidityDone?.addEventListener("click", () => setAdminValidityModal(false));
adminValidityModal?.addEventListener("click", (event) => {
  if (event.target === adminValidityModal) setAdminValidityModal(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && adminValidityModal?.classList.contains("show")) setAdminValidityModal(false);
  if (event.key === "Escape" && adminPasswordModal?.classList.contains("show")) setAdminPasswordModal(false);
});
adminCardForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const shouldSave = await window.showCustomConfirm("Los cambios se mostrarán para todos los usuarios del manual.", {
    title: "Guardar cambios",
    confirmText: "Guardar",
  });
  if (!shouldSave) return;
  const { error } = await window.SUPABASE_AUTH_CLIENT.rpc("set_card_settings", {
    target_card_id: adminCardSelect.value, target_cat: adminCardCat.value.trim(), target_rate: adminCardRate.value.trim(),
    target_validity: getEditedValidity(adminCardSelect.value), target_admin: adminCardAdmin.value.trim(),
  });
  if (error) { setAdminStatus(`No se pudieron guardar los datos: ${error.message || "error desconocido"}`, true); return; }
  const setting = { card_id: adminCardSelect.value, cat: adminCardCat.value.trim(), rate: adminCardRate.value.trim(), validity: getEditedValidity(adminCardSelect.value), admin: adminCardAdmin.value.trim() };
  cardSettings.set(setting.card_id, setting); applyCardSetting(setting.card_id, setting);
  updateManualUpdatedAt(new Date().toISOString());
  if (typeof renderHome === "function") renderHome();
  setAdminStatus("Datos de la tarjeta guardados correctamente.");
  window.showCustomNotice("Los datos de la tarjeta se guardaron correctamente y ya están disponibles para los usuarios.", {
    title: "Datos guardados",
  });
});

if (window.SUPABASE_AUTH_CLIENT) {
  window.SUPABASE_AUTH_CLIENT.auth.onAuthStateChange((_event, session) => { refreshAdminAccess(session); loadCardSettings(); });
  window.SUPABASE_AUTH_CLIENT.auth.getSession().then(({ data }) => { refreshAdminAccess(data?.session); loadCardSettings(); });
}

window.addEventListener("load", () => {
  if (window.currentUserRole === "admin") initializeCardEditor();
});
