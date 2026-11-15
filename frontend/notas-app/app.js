const authScreen = document.getElementById("authScreen");
const authTitle = document.getElementById("authTitle");
const loginForm = document.getElementById("loginForm");
const recoveryForm = document.getElementById("recoveryForm");
const updatePasswordForm = document.getElementById("updatePasswordForm");
const authStatus = document.getElementById("authStatus");
const appShell = document.getElementById("appShell");
const notesList = document.getElementById("notesList");
const scrollTabsLeft = document.getElementById("scrollTabsLeft");
const scrollTabsRight = document.getElementById("scrollTabsRight");
const notesEmpty = document.getElementById("notesEmpty");
const openEditor = document.getElementById("openEditor");
const openMyNotes = document.getElementById("openMyNotes");
const openSharedNotes = document.getElementById("openSharedNotes");
const myNotesCount = document.getElementById("myNotesCount");
const sharedNotesCount = document.getElementById("sharedNotesCount");
const workspace = document.getElementById("workspace");
const noteTabbar = document.querySelector(".note-tabbar");
const libraryView = document.getElementById("libraryView");
const libraryTitle = document.getElementById("libraryTitle");
const libraryDescription = document.getElementById("libraryDescription");
const librarySearch = document.getElementById("librarySearch");
const noteSearchInput = document.getElementById("noteSearchInput");
const libraryNotesList = document.getElementById("libraryNotesList");
const libraryEmpty = document.getElementById("libraryEmpty");
const importTextFile = document.getElementById("importTextFile");
const textFileInput = document.getElementById("textFileInput");
const accountToggle = document.getElementById("accountToggle");
const accountPopover = document.getElementById("accountPopover");
const accountPopoverName = document.getElementById("accountPopoverName");
const accountMenu = document.querySelector(".account-menu");
const saveStatus = document.getElementById("saveStatus");
const globalStatus = document.getElementById("globalStatus");
const noteEditor = document.getElementById("noteEditor");
const emptyState = document.getElementById("emptyState");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteDate = document.getElementById("noteDate");
const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const editorHint = document.getElementById("editorHint");
const draftNotice = document.getElementById("draftNotice");
const sharingSection = document.getElementById("sharingSection");
const sharedUserCount = document.getElementById("sharedUserCount");
const sharedUsers = document.getElementById("sharedUsers");
const shareDialog = document.getElementById("shareDialog");
const shareForm = document.getElementById("shareForm");
const shareStatus = document.getElementById("shareStatus");

const config = window.SUPABASE_CONFIG || {};
const supabaseReady = Boolean(
  window.supabase?.createClient
  && config.url
  && config.anonKey
  && !config.url.includes("TU-PROYECTO")
  && !config.anonKey.includes("TU-ANON-KEY"),
);
const DRAFT_PREFIX = "notas-app-draft";
const THEME_STORAGE_KEY = "notas-app-theme";
const OPEN_TABS_PREFIX = "notas-app-open-tabs";

let client = null;
let currentUser = null;
let recoveryActive = false;
let persistentAuthMessage = "";
let loadedNotes = [];
let loadedShares = [];
let sharePermissions = new Map();
let shareOwners = new Map();
let ownerShares = new Map();
let noteUsers = [];
let openNoteIds = [];
let openTabsUserId = null;
let activeSection = "editor";
let sectionBeforeSearch = "editor";
let activeNoteId = null;
let installPrompt = null;
let saveTimer = null;
let saveQueue = Promise.resolve();
let globalStatusTimer = null;
const noteRevisions = new Map();

function setAuthStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.classList.toggle("is-error", isError);
}

function setSaveStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.classList.toggle("is-error", isError);
}

function setGlobalStatus(message, isError = false) {
  globalStatus.textContent = message;
  globalStatus.classList.toggle("is-error", isError);
  window.clearTimeout(globalStatusTimer);
  if (message) {
    globalStatusTimer = window.setTimeout(() => {
      globalStatus.textContent = "";
      globalStatus.classList.remove("is-error");
    }, isError ? 7000 : 3200);
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  const selectedTheme = isDark ? "dark" : "light";
  document.documentElement.dataset.theme = selectedTheme;
  themeToggles.forEach((toggle) => {
    toggle.setAttribute("aria-checked", String(isDark));
    toggle.title = `Cambiar a tema ${isDark ? "claro" : "oscuro"}`;
    toggle.querySelector("[data-theme-label]").textContent = isDark ? "Oscuro" : "Claro";
  });
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#171a22" : "#f6f7fb";
}

function initializeTheme() {
  let theme = "light";
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
  } catch (error) {
    setGlobalStatus(`No se pudo leer la preferencia del tema: ${error.message}`, true);
  }
  applyTheme(theme);
}

function toggleTheme() {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    setGlobalStatus(`No se pudo guardar la preferencia del tema: ${error.message}`, true);
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function noteMatchesSearch(note, query) {
  const terms = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  const searchableText = normalizeSearchText(`${note.title || ""}\n${note.content || ""}`);
  return terms.length > 0 && terms.every((term) => searchableText.includes(term));
}

function formatNoteDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function localDateValue() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function noteDraftKey(noteId) {
  return `${DRAFT_PREFIX}-${currentUser?.id}-${noteId}`;
}

function openTabsKey() {
  return `${OPEN_TABS_PREFIX}-${currentUser?.id}`;
}

function readOpenNoteIds() {
  let savedTabs;
  try {
    savedTabs = localStorage.getItem(openTabsKey());
  } catch (error) {
    setGlobalStatus(`No se pudieron leer las pestañas abiertas: ${error.message}`, true);
    return null;
  }
  if (savedTabs === null) return null;

  try {
    const noteIds = JSON.parse(savedTabs);
    if (!Array.isArray(noteIds) || !noteIds.every((noteId) => typeof noteId === "string")) {
      setGlobalStatus("No se pudieron leer las pestañas abiertas: el formato guardado no es válido.", true);
      return null;
    }
    return [...new Set(noteIds)];
  } catch (error) {
    setGlobalStatus(`No se pudieron leer las pestañas abiertas: ${error.message}`, true);
    return null;
  }
}

function saveOpenNoteIds() {
  try {
    localStorage.setItem(openTabsKey(), JSON.stringify(openNoteIds));
  } catch (error) {
    setGlobalStatus(`No se pudieron guardar las pestañas abiertas: ${error.message}`, true);
  }
}

function readLocalDraft(noteId) {
  try {
    const raw = localStorage.getItem(noteDraftKey(noteId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    setGlobalStatus(`No se pudo leer el borrador local: ${error.message}`, true);
    return null;
  }
}

function writeLocalDraft(noteId, draft) {
  try {
    localStorage.setItem(noteDraftKey(noteId), JSON.stringify(draft));
    return true;
  } catch (error) {
    setSaveStatus(`No se pudo guardar el borrador en este dispositivo: ${error.message}`, true);
    return false;
  }
}

function removeLocalDraft(noteId) {
  try {
    localStorage.removeItem(noteDraftKey(noteId));
  } catch (error) {
    setGlobalStatus(`No se pudo borrar el borrador local: ${error.message}`, true);
  }
}

function currentNote() {
  return loadedNotes.find((note) => note.id === activeNoteId) || null;
}

function isNoteOwner(note) {
  return Boolean(note && note.user_id === currentUser?.id);
}

function canEditNote(note) {
  return isNoteOwner(note) || sharePermissions.get(note?.id) === "edit";
}

function updateTabScrollControls() {
  const maxScroll = notesList.scrollWidth - notesList.clientWidth;
  const hasOverflow = maxScroll > 1;
  scrollTabsLeft.hidden = !hasOverflow || notesList.scrollLeft <= 1;
  scrollTabsRight.hidden = !hasOverflow || notesList.scrollLeft >= maxScroll - 1;
}

function scrollNoteTabs(direction) {
  notesList.scrollBy({
    left: direction * Math.max(notesList.clientWidth * 0.75, 100),
    behavior: "smooth",
  });
}

function keepActiveTabVisible() {
  const activeTab = [...notesList.querySelectorAll('[role="tab"]')]
    .find((tab) => tab.dataset.noteId === activeNoteId);
  if (activeTab) {
    const listBounds = notesList.getBoundingClientRect();
    const tabBounds = activeTab.getBoundingClientRect();
    if (tabBounds.left < listBounds.left) {
      notesList.scrollLeft -= listBounds.left - tabBounds.left;
    } else if (tabBounds.right > listBounds.right) {
      notesList.scrollLeft += tabBounds.right - listBounds.right;
    }
  }
  updateTabScrollControls();
}

function setAuthPanel(panel) {
  loginForm.hidden = panel !== "login";
  recoveryForm.hidden = panel !== "recovery";
  updatePasswordForm.hidden = panel !== "update";
  authTitle.textContent = panel === "update"
    ? "Cambiar contraseña"
    : panel === "recovery"
      ? "Recuperar contraseña"
      : "Inicia sesión";
  setAuthStatus("");
}

async function handleSession(session) {
  if (!session?.user) {
    currentUser = null;
    appShell.hidden = true;
    authScreen.hidden = false;
    accountPopover.hidden = true;
    accountToggle.setAttribute("aria-expanded", "false");
    accountToggle.setAttribute("aria-label", "Mostrar nombre de usuario");
    if (!recoveryActive) {
      setAuthPanel("login");
      if (persistentAuthMessage) setAuthStatus(persistentAuthMessage, true);
    }
    return;
  }

  if (currentUser?.id === session.user.id && !appShell.hidden) {
    if (recoveryActive) {
      appShell.hidden = true;
      authScreen.hidden = false;
    }
    return;
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select("username, blocked")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error || !profile) {
    appShell.hidden = true;
    authScreen.hidden = false;
    setAuthPanel("login");
    persistentAuthMessage =
      error
        ? `No se pudo verificar el estado de la cuenta: ${error.message}`
        : "No se encontró el perfil de esta cuenta.";
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) persistentAuthMessage += ` No se pudo cerrar la sesión: ${signOutError.message}`;
    setAuthStatus(persistentAuthMessage, true);
    return;
  }
  if (profile.blocked) {
    appShell.hidden = true;
    authScreen.hidden = false;
    persistentAuthMessage = "Tu usuario ha sido bloqueado. Solicita acceso al administrador.";
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) persistentAuthMessage += ` No se pudo cerrar la sesión: ${signOutError.message}`;
    setAuthPanel("login");
    setAuthStatus(persistentAuthMessage, true);
    return;
  }

  persistentAuthMessage = "";
  currentUser = session.user;
  if (recoveryActive) {
    appShell.hidden = true;
    authScreen.hidden = false;
    return;
  }
  recoveryActive = false;
  authScreen.hidden = true;
  appShell.hidden = false;
  const username = profile.username?.trim() || "Usuario";
  accountPopoverName.textContent = username;
  accountPopover.hidden = true;
  accountToggle.textContent = username.charAt(0).toUpperCase();
  accountToggle.setAttribute("aria-expanded", "false");
  accountToggle.setAttribute("aria-label", "Mostrar nombre de usuario");
  await loadNotes();
}

async function submitLogin(event) {
  event.preventDefault();
  const submit = loginForm.querySelector('button[type="submit"]');
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  persistentAuthMessage = "";
  submit.disabled = true;
  setAuthStatus("Iniciando sesión...");

  const { data: email, error: lookupError } = await client.rpc(
    "get_auth_email_by_username",
    { target_username: username },
  );
  if (lookupError || !email) {
    submit.disabled = false;
    setAuthStatus("Usuario o contraseña incorrectos.", true);
    return;
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  submit.disabled = false;
  if (error) setAuthStatus("Usuario o contraseña incorrectos.", true);
}

async function submitRecovery(event) {
  event.preventDefault();
  const submit = recoveryForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  setAuthStatus("Enviando enlace...");
  const { error } = await client.auth.resetPasswordForEmail(
    document.getElementById("recoveryEmail").value.trim(),
    { redirectTo: `${window.location.origin}${window.location.pathname}` },
  );
  submit.disabled = false;
  if (error) {
    setAuthStatus(error.message, true);
    return;
  }
  setAuthStatus("Revisa tu correo y abre el enlace para cambiar la contraseña.");
  recoveryForm.reset();
}

async function submitPasswordUpdate(event) {
  event.preventDefault();
  const password = document.getElementById("newPassword").value;
  const confirmation = document.getElementById("confirmPassword").value;
  if (password !== confirmation) {
    setAuthStatus("Las contraseñas no coinciden.", true);
    return;
  }
  const submit = updatePasswordForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  setAuthStatus("Guardando contraseña...");
  const { error } = await client.auth.updateUser({ password });
  submit.disabled = false;
  if (error) {
    setAuthStatus(error.message, true);
    return;
  }
  recoveryActive = false;
  updatePasswordForm.reset();
  setAuthStatus("Contraseña actualizada.");
  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    setAuthStatus(`No se pudo recuperar la sesión: ${sessionError.message}`, true);
    return;
  }
  await handleSession(data?.session);
}

function renderNoteList() {
  const openNotes = openNoteIds
    .map((noteId) => loadedNotes.find((note) => note.id === noteId))
    .filter(Boolean);
  document.getElementById("noteCount").textContent = String(openNotes.length);

  if (!openNotes.length) {
    notesList.innerHTML = "";
    notesEmpty.textContent = "Abre una nota desde Mis notas o crea una nueva.";
    notesEmpty.hidden = false;
    noteEditor.removeAttribute("aria-labelledby");
    updateTabScrollControls();
    return;
  }

  notesEmpty.hidden = true;
  notesList.innerHTML = openNotes.map((note) => {
    const shared = note.user_id !== currentUser?.id;
    const title = note.title?.trim() || "Nota sin título";
    const meta = shared ? '<span class="note-tab__meta">Compartida contigo</span>' : "";
    return `
      <div class="note-tab-item${note.id === activeNoteId ? " is-active" : ""}" role="presentation">
        <button id="note-tab-${escapeHtml(note.id)}" class="note-tab" type="button" role="tab" aria-selected="${note.id === activeNoteId}" aria-controls="noteEditor" tabindex="${note.id === activeNoteId ? "0" : "-1"}" data-note-id="${escapeHtml(note.id)}" title="${escapeHtml(title)}">
          <span class="note-tab__title">${escapeHtml(title)}</span>
          ${meta}
        </button>
        <button class="note-tab__close" type="button" data-close-note-id="${escapeHtml(note.id)}" aria-label="Cerrar pestaña ${escapeHtml(title)}" title="Cerrar pestaña">×</button>
      </div>
    `;
  }).join("");
  const activeTab = [...notesList.querySelectorAll('[role="tab"]')]
    .find((tab) => tab.dataset.noteId === activeNoteId);
  if (activeTab) noteEditor.setAttribute("aria-labelledby", activeTab.id);
  else noteEditor.removeAttribute("aria-labelledby");
  keepActiveTabVisible();
}

function renderLibrarySection() {
  const ownedNotes = loadedNotes.filter(isNoteOwner);
  const outgoingShareIds = new Set(
    [...ownerShares.entries()]
      .filter(([, shares]) => shares.length > 0)
      .map(([noteId]) => noteId),
  );
  const sharedNotes = loadedNotes.filter((note) => !isNoteOwner(note) || outgoingShareIds.has(note.id));
  const searching = activeSection === "search";
  const showingShared = activeSection === "shared";
  const query = noteSearchInput.value.trim();
  const visibleNotes = searching
    ? (query ? loadedNotes.filter((note) => noteMatchesSearch(note, query)) : [])
    : showingShared
      ? sharedNotes
      : ownedNotes;

  myNotesCount.textContent = String(ownedNotes.length);
  sharedNotesCount.textContent = String(sharedNotes.length);
  libraryTitle.textContent = searching ? "Buscar notas" : showingShared ? "Compartidas" : "Mis notas";
  libraryDescription.textContent = searching
    ? "Busca por título o contenido en tus notas y las compartidas contigo."
    : showingShared
      ? "Notas que compartiste y notas que otros usuarios compartieron contigo."
      : "Tus notas guardadas. Selecciona una para abrirla en el lienzo.";
  librarySearch.hidden = !searching;
  libraryEmpty.textContent = searching
    ? (query ? `No se encontraron notas que coincidan con "${query}".` : "")
    : showingShared
      ? "Todavía no tienes notas compartidas."
      : "No tienes notas guardadas todavía.";
  libraryEmpty.hidden = visibleNotes.length > 0 || (searching && !query);

  libraryNotesList.innerHTML = visibleNotes.map((note) => {
    const owned = isNoteOwner(note);
    const title = note.title?.trim() || "Nota sin título";
    let meta = formatNoteDate(note.note_date);
    let removeAction = activeSection === "my-notes" && owned ? "Eliminar" : "";
    let preview = "";
    if (searching) {
      meta = owned
        ? (outgoingShareIds.has(note.id) ? "Compartida por ti" : "Tu nota")
        : `Compartida por ${shareOwners.get(note.id) || "otro usuario"}`;
      const content = note.content?.trim().replace(/\s+/g, " ") || "";
      preview = content.length > 120 ? `${content.slice(0, 120)}…` : content;
    } else if (showingShared && owned) {
      const recipientCount = ownerShares.get(note.id)?.length || 0;
      meta = `Compartida por ti con ${recipientCount} ${recipientCount === 1 ? "usuario" : "usuarios"}`;
    } else if (!owned) {
      meta = `Compartida por ${shareOwners.get(note.id) || "otro usuario"}`;
      if (showingShared) removeAction = "Dejar de ver";
    }

    return `
      <div class="notes-library-item" role="group" aria-label="Nota ${escapeHtml(title)}">
        <button class="notes-library-item__open" type="button" data-open-note-id="${escapeHtml(note.id)}" aria-label="Abrir ${escapeHtml(title)}">
          <span class="notes-library-item__title">${escapeHtml(title)}</span>
          <span class="notes-library-item__meta">${escapeHtml(meta)}</span>
          ${searching && preview ? `<span class="notes-library-item__preview">${escapeHtml(preview)}</span>` : ""}
        </button>
        ${removeAction ? `<button class="notes-library-item__delete" type="button" data-note-action-id="${escapeHtml(note.id)}" aria-label="${removeAction} ${escapeHtml(title)}" title="${removeAction}">×</button>` : ""}
      </div>
    `;
  }).join("");
}

function updateSectionVisibility() {
  const isEditor = activeSection === "editor";
  noteTabbar.hidden = !isEditor;
  workspace.hidden = !isEditor;
  libraryView.hidden = isEditor;
  [
    [openEditor, "editor"],
    [openMyNotes, "my-notes"],
    [openSharedNotes, "shared"],
  ].forEach(([button, section]) => {
    if (activeSection === section) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (!isEditor) renderLibrarySection();
}

async function navigateToSection(section) {
  if (section !== activeSection) await flushNoteSave();
  activeSection = section;
  updateSectionVisibility();
  if (section === "search") {
    noteSearchInput.focus();
    noteSearchInput.select();
  } else if (section !== "editor") {
    libraryTitle.focus();
  }
}

async function openNoteSearch() {
  if (activeSection !== "search") sectionBeforeSearch = activeSection;
  await navigateToSection("search");
}

async function handleGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "f") {
    if (!currentUser || shareDialog.open) return;
    event.preventDefault();
    await openNoteSearch();
    return;
  }

  if (event.key === "Escape" && activeSection === "search" && !shareDialog.open) {
    event.preventDefault();
    noteSearchInput.value = "";
    await navigateToSection(sectionBeforeSearch);
    return;
  }

  if (event.key !== "Escape" || accountPopover.hidden) return;
  accountPopover.hidden = true;
  accountToggle.setAttribute("aria-expanded", "false");
  accountToggle.setAttribute("aria-label", "Mostrar nombre de usuario");
  accountToggle.focus();
}

function renderSharedUsers(note) {
  const shares = ownerShares.get(note.id) || [];
  sharingSection.hidden = !isNoteOwner(note) || shares.length === 0;
  sharingSection.open = false;
  sharedUserCount.textContent = shares.length ? `(${shares.length})` : "";
  sharedUsers.innerHTML = shares.map((share) => `
    <li>
      <span>${escapeHtml(share.recipient_username || "Usuario")}<small>${share.permission === "edit" ? "Puede editar" : "Solo lectura"}</small></span>
      <button class="text-button" type="button" data-revoke-email="${escapeHtml(share.recipient_email)}" data-revoke-name="${escapeHtml(share.recipient_username || "Usuario")}">Quitar acceso</button>
    </li>
  `).join("");
}

function renderEditor() {
  const note = currentNote();
  emptyState.hidden = Boolean(note);
  noteEditor.hidden = !note;
  if (!note) {
    draftNotice.hidden = true;
    sharingSection.hidden = true;
    return;
  }

  const editable = canEditNote(note);
  const owned = isNoteOwner(note);
  noteTitle.value = note.title || "";
  noteContent.value = note.content || "";
  noteTitle.disabled = !editable;
  noteContent.disabled = !editable;
  noteDate.textContent = formatNoteDate(note.note_date);
  document.getElementById("shareNote").hidden = !owned;
  document.getElementById("deleteNote").hidden = !owned;
  document.getElementById("leaveSharedNote").hidden = !(!owned && note.user_id !== currentUser?.id);
  editorHint.textContent = editable
    ? "Se guarda automáticamente mientras escribes."
    : `Solo lectura${shareOwners.get(note.id) ? ` · Compartida por ${shareOwners.get(note.id)}` : ""}.`;
  renderSharedUsers(note);

  const draft = readLocalDraft(note.id);
  const serverTime = Date.parse(note.updated_at || "");
  const draftTime = Date.parse(draft?.savedAt || "");
  draftNotice.hidden = !(
    editable
    && draft
    && typeof draft.title === "string"
    && typeof draft.content === "string"
    && (!Number.isFinite(serverTime) || !Number.isFinite(draftTime) || draftTime > serverTime)
  );
}

function updateListPreview(noteId, title, content, updatedAt) {
  const note = loadedNotes.find((item) => item.id === noteId);
  if (!note) return;
  note.title = title;
  note.content = content;
  note.updated_at = updatedAt || new Date().toISOString();
  loadedNotes.sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at));
  renderNoteList();
}

function queueNoteSave(noteId, snapshot, revision) {
  saveQueue = saveQueue.then(async () => {
    if (noteRevisions.get(noteId) !== revision || !currentUser) return;
    if (!navigator.onLine) {
      if (activeNoteId === noteId) setSaveStatus("Sin conexión · borrador guardado en este dispositivo", true);
      return;
    }

    if (activeNoteId === noteId) setSaveStatus("Guardando...");
    try {
      const { data, error } = await client
        .from("notes")
        .update({
          title: snapshot.title,
          content: snapshot.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .select("id, updated_at")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No se pudo guardar la nota. Puede que ya no tengas permiso para editarla.");
      updateListPreview(noteId, snapshot.title, snapshot.content, data.updated_at);

      if (noteRevisions.get(noteId) === revision) {
        removeLocalDraft(noteId);
        if (activeNoteId === noteId) setSaveStatus("Guardado");
      }
    } catch (error) {
      if (activeNoteId === noteId) {
        setSaveStatus(`No se guardó · cambios guardados localmente: ${error.message}`, true);
      }
      setGlobalStatus(`No se pudieron sincronizar los cambios: ${error.message}`, true);
    }
  });
  return saveQueue;
}

function scheduleNoteSave() {
  const note = currentNote();
  if (!note || !canEditNote(note)) return;
  const revision = (noteRevisions.get(note.id) || 0) + 1;
  noteRevisions.set(note.id, revision);
  const snapshot = { title: noteTitle.value, content: noteContent.value };
  writeLocalDraft(note.id, { ...snapshot, savedAt: new Date().toISOString() });
  setSaveStatus("Cambios sin guardar");
  renderNoteList();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    queueNoteSave(note.id, snapshot, revision);
  }, 700);
}

async function flushNoteSave() {
  const note = currentNote();
  if (!note || !canEditNote(note)) return saveQueue;
  const hasPendingChanges = saveTimer !== null
    || noteTitle.value !== (note.title || "")
    || noteContent.value !== (note.content || "");
  if (!hasPendingChanges) return saveQueue;
  window.clearTimeout(saveTimer);
  saveTimer = null;
  const revision = (noteRevisions.get(note.id) || 0) + 1;
  noteRevisions.set(note.id, revision);
  const snapshot = { title: noteTitle.value, content: noteContent.value };
  writeLocalDraft(note.id, { ...snapshot, savedAt: new Date().toISOString() });
  return queueNoteSave(note.id, snapshot, revision);
}

function restoreDraft() {
  const note = currentNote();
  const draft = note && readLocalDraft(note.id);
  if (!note || !draft) return;
  noteTitle.value = draft.title;
  noteContent.value = draft.content;
  draftNotice.hidden = true;
  scheduleNoteSave();
}

function discardDraft() {
  const note = currentNote();
  if (!note) return;
  removeLocalDraft(note.id);
  draftNotice.hidden = true;
  noteTitle.value = note.title || "";
  noteContent.value = note.content || "";
  setSaveStatus("Borrador local descartado");
}

async function loadNotes() {
  setGlobalStatus("");
  const { data, error } = await client
    .from("notes")
    .select("id, user_id, title, content, note_date, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    setGlobalStatus(`No se pudieron cargar las notas: ${error.message}`, true);
    return;
  }

  let shares = [];
  if (data?.length) {
    let response = await client.rpc("get_note_shares", {
      target_note_ids: data.map((note) => note.id),
    });
    if (response.error?.message?.includes("Could not find the function public.get_note_shares")) {
      response = await client.from("note_shares").select("note_id, recipient_email, permission");
    }
    if (response.error) {
      setGlobalStatus(`No se pudieron cargar los permisos compartidos: ${response.error.message}`, true);
    } else {
      shares = response.data || [];
    }
  }

  const currentEmail = (currentUser.email || "").toLowerCase();
  sharePermissions = new Map(
    shares
      .filter((share) => (share.recipient_email || "").toLowerCase() === currentEmail)
      .map((share) => [share.note_id, share.permission]),
  );
  const ownedIds = new Set((data || []).filter((note) => note.user_id === currentUser.id).map((note) => note.id));
  ownerShares = new Map();
  shares.forEach((share) => {
    if (!ownedIds.has(share.note_id)) return;
    const items = ownerShares.get(share.note_id) || [];
    items.push(share);
    ownerShares.set(share.note_id, items);
  });

  const sharedIds = (data || []).filter((note) => note.user_id !== currentUser.id).map((note) => note.id);
  shareOwners = new Map();
  if (sharedIds.length) {
    const { data: owners, error: ownersError } = await client.rpc("get_note_owner_usernames", {
      target_note_ids: sharedIds,
    });
    if (ownersError) {
      setGlobalStatus(`No se pudo identificar quién compartió algunas notas: ${ownersError.message}`, true);
    } else {
      shareOwners = new Map((owners || []).map((owner) => [owner.note_id, owner.owner_username]));
    }
  }

  loadedNotes = data || [];
  const savedNoteIds = new Set(loadedNotes.map((note) => note.id));
  if (openTabsUserId !== currentUser.id) {
    openTabsUserId = currentUser.id;
    const savedOpenNoteIds = readOpenNoteIds();
    openNoteIds = savedOpenNoteIds === null
      ? (loadedNotes[0] ? [loadedNotes[0].id] : [])
      : savedOpenNoteIds.filter((noteId) => savedNoteIds.has(noteId));
  } else {
    openNoteIds = openNoteIds.filter((noteId) => savedNoteIds.has(noteId));
  }
  if (!openNoteIds.includes(activeNoteId)) activeNoteId = openNoteIds[0] || null;
  saveOpenNoteIds();
  renderNoteList();
  renderLibrarySection();
  renderEditor();
}

async function createNote(title = "", content = "", successMessage = "Nota nueva") {
  await flushNoteSave();
  const { data, error } = await client
    .from("notes")
    .insert({
      user_id: currentUser.id,
      title,
      content,
      note_date: localDateValue(),
    })
    .select("id, user_id, title, content, note_date, updated_at")
    .single();
  if (error) {
    setGlobalStatus(`No se pudo crear la nota: ${error.message}`, true);
    return;
  }
  loadedNotes.unshift(data);
  openNoteIds.unshift(data.id);
  saveOpenNoteIds();
  activeNoteId = data.id;
  renderNoteList();
  renderLibrarySection();
  renderEditor();
  noteTitle.focus();
  setSaveStatus(successMessage);
}

async function importTextFileContents(file) {
  if (!file.name.toLowerCase().endsWith(".txt")) {
    throw new Error("Selecciona un archivo con extensión .txt.");
  }
  if (file.size > 20000) {
    throw new Error("El archivo es demasiado grande para importarlo como nota.");
  }

  const content = await file.text();
  if (content.includes("\u0000")) {
    throw new Error("El archivo contiene datos que no se pueden importar como texto.");
  }
  if (content.length > 5000) {
    throw new Error("El contenido supera el límite de 5,000 caracteres por nota.");
  }

  const title = file.name.replace(/\.txt$/i, "").trim().slice(0, 120) || "Archivo de texto";
  await createNote(title, content, "TXT importado");
}

async function deleteNoteRecord(note) {
  if (!note || !isNoteOwner(note)) return;
  const title = note.title?.trim() || "Nota sin título";
  if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
  await flushNoteSave();
  const { data, error } = await client
    .from("notes")
    .delete()
    .eq("id", note.id)
    .select("id");
  if (error) {
    setGlobalStatus(`No se pudo eliminar la nota: ${error.message}`, true);
    return;
  }
  if (!data?.some((deletedNote) => deletedNote.id === note.id)) {
    setGlobalStatus("No se eliminó la nota. Verifica que todavía tengas permiso para borrarla.", true);
    return;
  }
  loadedNotes = loadedNotes.filter((item) => item.id !== note.id);
  openNoteIds = openNoteIds.filter((noteId) => noteId !== note.id);
  saveOpenNoteIds();
  removeLocalDraft(note.id);
  if (activeNoteId === note.id) {
    activeNoteId = openNoteIds[0] || null;
  }
  renderNoteList();
  renderLibrarySection();
  renderEditor();
  setGlobalStatus("Nota eliminada.");
}

async function deleteCurrentNote() {
  await deleteNoteRecord(currentNote());
}

async function loadNoteUsers() {
  const { data, error } = await client.rpc("list_note_users");
  if (error) {
    shareStatus.textContent = `No se pudieron cargar los usuarios: ${error.message}`;
    shareStatus.classList.add("is-error");
    return false;
  }
  noteUsers = (data || []).map(({ username }) => username).filter(Boolean);
  const select = document.getElementById("shareUsername");
  select.innerHTML = '<option value="">Selecciona un usuario</option>' + noteUsers.map((username) => (
    `<option value="${escapeHtml(username)}">${escapeHtml(username)}</option>`
  )).join("");
  return true;
}

async function openShareDialog() {
  const note = currentNote();
  if (!note || !isNoteOwner(note)) return;
  shareStatus.textContent = "";
  shareStatus.classList.remove("is-error");
  document.getElementById("shareUsername").value = "";
  shareDialog.showModal();
  await loadNoteUsers();
}

async function submitShare(event) {
  event.preventDefault();
  const note = currentNote();
  if (!note || !isNoteOwner(note)) return;
  const submit = shareForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  shareStatus.textContent = "Compartiendo...";
  shareStatus.classList.remove("is-error");
  const { error } = await client.rpc("share_note_with_username", {
    target_note_id: note.id,
    target_username: document.getElementById("shareUsername").value,
    target_permission: document.getElementById("sharePermission").value,
  });
  submit.disabled = false;
  if (error) {
    shareStatus.textContent = `No se pudo compartir la nota: ${error.message}`;
    shareStatus.classList.add("is-error");
    return;
  }
  shareDialog.close();
  await loadNotes();
  setGlobalStatus("Nota compartida.");
}

async function removeShare(noteId, email, name, isOwner) {
  if (!window.confirm(isOwner
    ? `¿Quieres quitarle el acceso a ${name}?`
    : "¿Quieres dejar de ver esta nota compartida?")) return;
  const { data, error } = await client
    .from("note_shares")
    .delete()
    .eq("note_id", noteId)
    .eq("recipient_email", email.toLowerCase())
    .select("id");
  if (error) {
    setGlobalStatus(`No se pudo actualizar el acceso: ${error.message}`, true);
    return;
  }
  if (!data?.length) {
    setGlobalStatus("El acceso compartido ya no estaba activo.", true);
  }
  await loadNotes();
}

async function leaveSharedNote(noteId = activeNoteId) {
  const note = loadedNotes.find((item) => item.id === noteId);
  if (!note || isNoteOwner(note) || !currentUser.email) return;
  await removeShare(note.id, currentUser.email, "", false);
}

async function openNoteFromLibrary(noteId) {
  const note = loadedNotes.find((item) => item.id === noteId);
  if (!note) return;
  await flushNoteSave();
  if (!openNoteIds.includes(note.id)) openNoteIds.push(note.id);
  saveOpenNoteIds();
  activeNoteId = note.id;
  activeSection = "editor";
  updateSectionVisibility();
  renderNoteList();
  renderEditor();
  [...notesList.querySelectorAll('[role="tab"]')]
    .find((tab) => tab.dataset.noteId === note.id)
    ?.focus();
}

async function closeNoteTab(noteId) {
  const tabIndex = openNoteIds.indexOf(noteId);
  if (tabIndex < 0) return;
  await flushNoteSave();
  openNoteIds = openNoteIds.filter((id) => id !== noteId);
  saveOpenNoteIds();
  if (activeNoteId === noteId) {
    activeNoteId = openNoteIds[Math.min(tabIndex, openNoteIds.length - 1)] || null;
  }
  renderNoteList();
  renderEditor();
  const activeTab = notesList.querySelector('[role="tab"][aria-selected="true"]');
  (activeTab || openMyNotes).focus();
}

themeToggles.forEach((toggle) => toggle.addEventListener("click", toggleTheme));
initializeTheme();

if (!supabaseReady) {
  authScreen.hidden = false;
  const missingConfig = !config.url
    || !config.anonKey
    || config.url.includes("TU-PROYECTO")
    || config.anonKey.includes("TU-ANON-KEY");
  setAuthStatus(
    missingConfig
      ? "Falta configurar Supabase en supabase-config.js."
      : "No se pudo cargar Supabase. Revisa tu conexión y vuelve a cargar la app.",
    true,
  );
} else {
  client = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      storage: window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  loginForm.addEventListener("submit", submitLogin);
  recoveryForm.addEventListener("submit", submitRecovery);
  updatePasswordForm.addEventListener("submit", submitPasswordUpdate);
  document.getElementById("forgotPassword").addEventListener("click", () => setAuthPanel("recovery"));
  document.getElementById("backToLogin").addEventListener("click", () => setAuthPanel("login"));
  document.getElementById("signOut").addEventListener("click", async () => {
    await flushNoteSave();
    persistentAuthMessage = "";
    const { error } = await client.auth.signOut();
    if (error) setGlobalStatus(`No se pudo cerrar la sesión: ${error.message}`, true);
  });
  accountToggle.addEventListener("click", () => {
    const showName = accountPopover.hidden;
    accountPopover.hidden = !showName;
    accountToggle.setAttribute("aria-expanded", String(showName));
    accountToggle.setAttribute("aria-label", `${showName ? "Ocultar" : "Mostrar"} nombre de usuario`);
    if (showName) accountPopover.focus();
  });
  document.addEventListener("click", (event) => {
    if (accountPopover.hidden || accountMenu.contains(event.target)) return;
    accountPopover.hidden = true;
    accountToggle.setAttribute("aria-expanded", "false");
    accountToggle.setAttribute("aria-label", "Mostrar nombre de usuario");
  });
  document.addEventListener("keydown", handleGlobalKeydown);

  document.getElementById("createNote").addEventListener("click", () => createNote());
  document.getElementById("emptyCreateNote").addEventListener("click", () => createNote());
  importTextFile.addEventListener("click", () => textFileInput.click());
  textFileInput.addEventListener("change", async () => {
    const [file] = textFileInput.files || [];
    textFileInput.value = "";
    if (!file) return;
    try {
      await importTextFileContents(file);
    } catch (error) {
      setGlobalStatus(`No se pudo importar el archivo TXT: ${error.message}`, true);
    }
  });
  document.getElementById("deleteNote").addEventListener("click", deleteCurrentNote);
  document.getElementById("shareNote").addEventListener("click", openShareDialog);
  document.getElementById("leaveSharedNote").addEventListener("click", () => leaveSharedNote());
  document.getElementById("restoreDraft").addEventListener("click", restoreDraft);
  document.getElementById("discardDraft").addEventListener("click", discardDraft);
  document.getElementById("cancelShare").addEventListener("click", () => shareDialog.close());
  noteTitle.addEventListener("input", scheduleNoteSave);
  noteContent.addEventListener("input", scheduleNoteSave);
  noteSearchInput.addEventListener("input", renderLibrarySection);
  shareForm.addEventListener("submit", submitShare);

  openEditor.addEventListener("click", () => navigateToSection("editor"));
  openMyNotes.addEventListener("click", () => navigateToSection("my-notes"));
  openSharedNotes.addEventListener("click", () => navigateToSection("shared"));
  libraryNotesList.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-note-action-id]");
    if (actionButton) {
      const note = loadedNotes.find((item) => item.id === actionButton.dataset.noteActionId);
      if (!note) return;
      if (isNoteOwner(note)) await deleteNoteRecord(note);
      else await leaveSharedNote(note.id);
      const nextAction = libraryNotesList.querySelector("[data-note-action-id]")
        || libraryNotesList.querySelector("[data-open-note-id]")
        || libraryTitle;
      nextAction.focus();
      return;
    }

    const openButton = event.target.closest("[data-open-note-id]");
    if (openButton) await openNoteFromLibrary(openButton.dataset.openNoteId);
  });

  notesList.addEventListener("click", async (event) => {
    const closeButton = event.target.closest("[data-close-note-id]");
    if (closeButton) {
      event.preventDefault();
      event.stopPropagation();
      await closeNoteTab(closeButton.dataset.closeNoteId);
      return;
    }

    const row = event.target.closest("[data-note-id]");
    if (!row) return;
    await flushNoteSave();
    activeNoteId = row.dataset.noteId;
    renderNoteList();
    renderEditor();
    [...notesList.querySelectorAll('[role="tab"]')]
      .find((tab) => tab.dataset.noteId === activeNoteId)
      ?.focus();
  });

  scrollTabsLeft.addEventListener("click", () => scrollNoteTabs(-1));
  scrollTabsRight.addEventListener("click", () => scrollNoteTabs(1));
  notesList.addEventListener("scroll", updateTabScrollControls, { passive: true });
  window.addEventListener("resize", updateTabScrollControls);

  notesList.addEventListener("keydown", async (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const tabs = [...notesList.querySelectorAll('[role="tab"]')];
    const activeTab = event.target.closest('[role="tab"]');
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < 0 || !tabs.length) return;
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = tabs[(currentIndex + offset + tabs.length) % tabs.length];
    await flushNoteSave();
    activeNoteId = nextTab.dataset.noteId;
    renderNoteList();
    renderEditor();
    [...notesList.querySelectorAll('[role="tab"]')]
      .find((tab) => tab.dataset.noteId === activeNoteId)
      ?.focus();
  });

  sharedUsers.addEventListener("click", (event) => {
    const button = event.target.closest("[data-revoke-email]");
    const note = currentNote();
    if (!button || !note) return;
    removeShare(note.id, button.dataset.revokeEmail, button.dataset.revokeName, true);
  });

  shareDialog.addEventListener("click", (event) => {
    if (event.target === shareDialog) shareDialog.close();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    document.getElementById("installApp").hidden = false;
  });
  document.getElementById("installApp").addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    document.getElementById("installApp").hidden = true;
  });
  window.addEventListener("online", () => {
    loadedNotes.forEach((note) => {
      const draft = readLocalDraft(note.id);
      if (!draft || !canEditNote(note)) return;
      const revision = (noteRevisions.get(note.id) || 0) + 1;
      noteRevisions.set(note.id, revision);
      queueNoteSave(note.id, draft, revision);
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushNoteSave();
    else if (currentUser) loadNotes();
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryActive = true;
      authScreen.hidden = false;
      setAuthPanel("update");
    }
    window.setTimeout(() => handleSession(session), 0);
  });
  client.auth.getSession().then(({ data, error }) => {
    if (error) setAuthStatus(`No se pudo recuperar la sesión: ${error.message}`, true);
    return handleSession(data?.session);
  });

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        setGlobalStatus(`No se pudo preparar el modo instalable: ${error.message}`, true);
      });
    });
  }
}
