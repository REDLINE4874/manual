const notesConfig = window.SUPABASE_CONFIG || {};
const notesReady = Boolean(
  window.supabase?.createClient
  && notesConfig.url
  && notesConfig.anonKey
  && !notesConfig.url.includes("TU-PROYECTO")
  && !notesConfig.anonKey.includes("TU-ANON-KEY"),
);

const notesAuthState = document.getElementById("notesAuthState");
const notesApp = document.getElementById("notesApp");
const notesStatus = document.getElementById("notesStatus");
const noteSaveStatus = document.getElementById("noteSaveStatus");
const noteForm = document.getElementById("noteForm");
const notesList = document.getElementById("notesList");
const notesUserLabel = document.getElementById("notesUserLabel");
const noteDateFilter = document.getElementById("noteDateFilter");
const noteDateFilterTrigger = document.getElementById("noteDateFilterTrigger");
const noteDateCalendar = document.getElementById("noteDateCalendar");
const clearNoteDateFilter = document.getElementById("clearNoteDateFilter");
const noteDateFilterLabel = document.getElementById("noteDateFilterLabel");

let notesClient = null;
let currentNotesUser = null;
let noteUsers = [];
let notesFeedbackTimer = null;
let loadedNotes = [];
let loadedSharePermissions = new Map();
let loadedShareOwners = new Map();
let loadedOwnerShares = new Map();
let displayedCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const NOTE_COLORS = ["yellow", "blue", "green", "pink", "purple", "coral"];

function getLocalDateValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatNoteDate(date) {
  if (!date) return "";
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function renderNoteDateCalendar() {
  if (!noteDateCalendar) return;
  const year = displayedCalendarMonth.getFullYear();
  const month = displayedCalendarMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getLocalDateValue();
  const monthLabel = displayedCalendarMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const dayButtons = Array.from({ length: firstWeekday }, () => (
    '<span class="notes-calendar__empty" aria-hidden="true"></span>'
  ));
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const value = getDateValue(date);
    const selected = value === noteDateFilter?.value;
    const isToday = value === today;
    dayButtons.push(`
      <button
        class="notes-calendar__day${selected ? " is-selected" : ""}${isToday ? " is-today" : ""}"
        type="button"
        data-calendar-date="${value}"
        aria-label="${escapeNoteHtml(formatNoteDate(value))}"
        aria-pressed="${selected}"
      >${day}</button>
    `);
  }
  noteDateCalendar.innerHTML = `
    <div class="notes-calendar__header">
      <button class="notes-calendar__nav" type="button" data-calendar-month="-1" aria-label="Mes anterior">‹</button>
      <strong>${escapeNoteHtml(monthLabel)}</strong>
      <button class="notes-calendar__nav" type="button" data-calendar-month="1" aria-label="Mes siguiente">›</button>
    </div>
    <div class="notes-calendar__weekdays">${weekdays.map((weekday) => `<span>${weekday}</span>`).join("")}</div>
    <div class="notes-calendar__days">${dayButtons.join("")}</div>
  `;
}

function normalizeNoteColor(color) {
  return NOTE_COLORS.includes(color) ? color : "yellow";
}

function readNoteFormat(noteId) {
  try {
    return JSON.parse(localStorage.getItem(`note-format-${noteId}`) || "{}");
  } catch {
    return {};
  }
}

function applyNoteFormatStyles(element, format) {
  if (!element) return;
  element.style.fontWeight = format.bold ? "700" : "400";
  element.style.fontStyle = format.italic ? "italic" : "normal";
  element.style.textDecoration = format.underline ? "underline" : "none";
}

function setNotesStatus(message, isError = false) {
  [notesStatus, noteSaveStatus].forEach((element) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  });

  document.querySelector(".note-feedback")?.remove();
  window.clearTimeout(notesFeedbackTimer);
  if (!message) return;

  const feedback = document.createElement("div");
  feedback.className = `note-feedback${isError ? " is-error" : ""}`;
  feedback.setAttribute("role", isError ? "alert" : "status");
  feedback.textContent = message;
  document.body.append(feedback);
  notesFeedbackTimer = window.setTimeout(() => {
    feedback.remove();
  }, isError ? 4800 : 2800);
}

function escapeNoteHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function renderNotes(
  notes,
  sharePermissions = new Map(),
  shareOwners = new Map(),
  ownerShares = new Map(),
) {
  if (!notesList) return;
  const selectedDate = noteDateFilter?.value;
  const visibleNotes = selectedDate
    ? notes.filter((note) => note.note_date === selectedDate)
    : notes;
  if (!visibleNotes.length) {
    const emptyMessage = notes.length && selectedDate
      ? "No hay notas para esta fecha."
      : "Todavía no tienes notas guardadas.";
    notesList.innerHTML = `<p class="notes-empty">${emptyMessage}</p>`;
    return;
  }
  notesList.innerHTML = visibleNotes.map((note) => {
    const isOwner = note.user_id === currentNotesUser?.id;
    const canEdit = isOwner || sharePermissions.get(note.id) === "edit";
    const noteColor = isOwner ? normalizeNoteColor(note.color) : "shared";
    const recipients = ownerShares.get(note.id) || [];
    return `
    <article class="note-card note-card--${noteColor}" data-note-id="${escapeNoteHtml(note.id)}">
      ${note.note_date ? `<time class="note-card__date" datetime="${escapeNoteHtml(note.note_date)}">${escapeNoteHtml(formatNoteDate(note.note_date))}</time>` : ""}
      <h2>${escapeNoteHtml(note.title || "Sin título")}</h2>
      <p data-note-content>${escapeNoteHtml(note.content).replace(/\n/g, "<br>")}</p>
      <div class="note-card__options">
        ${isOwner
    ? `${recipients.length ? `<div class="note-card__shared-access"><span class="note-card__shared-heading">Compartida con</span><ul>${recipients.map((share) => `<li><span>${escapeNoteHtml(share.recipient_email)} <small>${share.permission === "edit" ? "Puede editar" : "Solo lectura"}</small></span><button type="button" data-revoke-share="${escapeNoteHtml(share.recipient_email)}" aria-label="Dejar de compartir con ${escapeNoteHtml(share.recipient_email)}">Quitar acceso</button></li>`).join("")}</ul></div>` : ""}${NOTE_TOOL_MARKUP}`
    : `<div class="note-card__toolbar"><span>Compartida contigo${shareOwners.get(note.id) ? ` por ${escapeNoteHtml(shareOwners.get(note.id))}` : ""}</span><button type="button" class="note-card__leave-share" data-leave-share>Dejar de ver</button></div>`}
      </div>
    </article>
  `;
  }).join("");
  notesList.querySelectorAll("[data-note-content]").forEach((content) => {
    applyNoteFormatStyles(content, readNoteFormat(content.closest("[data-note-id]")?.dataset.noteId));
  });
  notesList.querySelectorAll("select.note-card__select").forEach((select) => {
    if (typeof enhanceCustomSelect === "function") enhanceCustomSelect(select);
  });
}

async function loadNotes() {
  const { data, error } = await notesClient
    .from("notes")
    .select("id, user_id, title, content, color, note_date, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    setNotesStatus(`No se pudieron cargar las notas: ${error.message}`, true);
    return;
  }
  const { data: shares, error: sharesError } = await notesClient
    .from("note_shares")
    .select("note_id, recipient_email, permission");
  if (sharesError) {
    setNotesStatus(`No se pudieron cargar los accesos compartidos: ${sharesError.message}`, true);
    return;
  }
  const visibleShares = shares || [];
  const currentEmail = currentNotesUser.email.toLowerCase();
  const sharePermissions = new Map(
    visibleShares
      .filter((share) => share.recipient_email.toLowerCase() === currentEmail)
      .map((share) => [share.note_id, share.permission]),
  );
  const ownedNoteIds = new Set(
    (data || [])
      .filter((note) => note.user_id === currentNotesUser?.id)
      .map((note) => note.id),
  );
  const ownerShares = new Map();
  visibleShares.forEach((share) => {
    if (!ownedNoteIds.has(share.note_id)) return;
    const recipients = ownerShares.get(share.note_id) || [];
    recipients.push(share);
    ownerShares.set(share.note_id, recipients);
  });
  const sharedNoteIds = (data || [])
    .filter((note) => note.user_id !== currentNotesUser?.id)
    .map((note) => note.id);
  const { data: owners, error: ownersError } = sharedNoteIds.length
    ? await notesClient.rpc("get_note_owner_emails", { target_note_ids: sharedNoteIds })
    : { data: [], error: null };
  if (ownersError) {
    setNotesStatus(`No se pudo identificar quién compartió una nota: ${ownersError.message}`, true);
  }
  const shareOwners = new Map((owners || []).map((owner) => [owner.note_id, owner.owner_email]));
  loadedNotes = data || [];
  loadedSharePermissions = sharePermissions;
  loadedShareOwners = shareOwners;
  loadedOwnerShares = ownerShares;
  renderNotes(loadedNotes, loadedSharePermissions, loadedShareOwners, loadedOwnerShares);
  loadNoteUsers();
}

const NOTE_TOOL_PROMPTS = {
  format: ["Formato", "Las opciones de formato de texto estarán disponibles próximamente."],
  color: ["Color de fondo", "Elige el color de la nota desde los círculos de color después de guardarla."],
  reminder: ["Recordatorio", "Los recordatorios se podrán agregar próximamente a esta nota."],
  image: ["Agregar imagen", "La carga de imágenes estará disponible próximamente."],
  more: ["Más opciones", "Aquí encontrarás acciones adicionales para organizar tus notas."],
};

const NOTE_TOOL_MARKUP = `
  <div class="note-card__tools" aria-label="Opciones de la nota">
    <button class="note-tool" type="button" data-note-tool="delete" aria-label="Eliminar"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg></button>
    <button class="note-tool" type="button" data-note-tool="format" aria-label="Formato"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3.5 19 5-14h2l5 14M5 15h9M17 11h2a2 2 0 0 1 0 4h-2v-4Zm0 4h2.5a2 2 0 0 1 0 4H17v-4Z" /></svg></button>
    <button class="note-tool" type="button" data-note-tool="color" aria-label="Color de fondo"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 1.5-4.1 1.9 1.9 0 0 1 1.2-3.4H18a4 4 0 0 0 4-4c0-3.6-4.5-6.5-10-6.5Z" /><circle cx="7.5" cy="10" r=".8" /><circle cx="10" cy="6.8" r=".8" /><circle cx="14" cy="6.8" r=".8" /><circle cx="17.5" cy="9.5" r=".8" /></svg></button>
    <button class="note-tool" type="button" data-note-tool="share" aria-label="Compartir"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="8" r="3" /><path d="M4.5 20a5.5 5.5 0 0 1 11 0M18 8v6m-3-3h6" /></svg></button>
  </div>
`;

function showNoteToolPrompt(tool) {
  const promptData = NOTE_TOOL_PROMPTS[tool];
  if (!promptData) return;
  const prompt = document.createElement("div");
  prompt.className = "note-prompt";
  prompt.innerHTML = `
    <div class="note-prompt__card" role="dialog" aria-modal="true" aria-labelledby="note-prompt-title">
      <h2 id="note-prompt-title">${promptData[0]}</h2>
      <p>${promptData[1]}</p>
      <button class="note-prompt__close" type="button">Entendido</button>
    </div>
  `;
  const close = () => prompt.remove();
  prompt.querySelector(".note-prompt__close").addEventListener("click", close);
  prompt.addEventListener("click", (event) => {
    const userPicker = prompt.querySelector(".note-user-picker");
    const userResults = prompt.querySelector("[data-note-user-results]");
    if (userResults && userPicker && !event.target.closest(".note-user-picker")) userResults.hidden = true;
    if (event.target === prompt) close();
  });
  document.body.append(prompt);
  prompt.querySelector(".note-prompt__close").focus();
}

function showNoteToolPrompt(tool, noteId) {
  const noteCard = notesList?.querySelector(`[data-note-id="${noteId}"]`);
  const content = noteCard?.querySelector("[data-note-content]")?.textContent || "";
  const titles = {
    edit: "Editar nota",
    delete: "Eliminar nota",
    share: "Compartir nota",
    color: "Color de fondo",
    format: "Formato",
    reminder: "Recordatorio",
    image: "Agregar imagen",
    more: "Mas opciones",
  };
  const prompt = document.createElement("div");
  prompt.className = "note-prompt";
  prompt.dataset.noteTool = tool;
  prompt.innerHTML = `<div class="note-prompt__card" role="dialog" aria-modal="true" aria-labelledby="note-prompt-title"><h2 id="note-prompt-title">${titles[tool] || "Opciones"}</h2><div class="note-prompt__body"></div><div class="note-prompt__actions"></div></div>`;
  const body = prompt.querySelector(".note-prompt__body");
  const actions = prompt.querySelector(".note-prompt__actions");
  const close = () => prompt.remove();
  const addButton = (label, className = "note-prompt__close") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    actions.append(button);
    return button;
  };

  if (tool === "edit") {
    const textarea = document.createElement("textarea");
    textarea.className = "note-prompt__textarea";
    textarea.value = content;
    textarea.setAttribute("aria-label", "Contenido de la nota");
    body.append(textarea);
    const save = addButton("Guardar");
    save.addEventListener("click", async () => { await updateNoteContent(noteId, textarea.value, save); close(); });
  } else if (tool === "delete") {
    body.innerHTML = "<p>Esta accion no se puede deshacer. ¿Quieres eliminar esta nota?</p>";
    const cancel = addButton("Cancelar", "note-prompt__secondary");
    const remove = addButton("Eliminar", "note-prompt__danger");
    cancel.addEventListener("click", close);
    remove.addEventListener("click", async () => { await deleteNote(noteId, remove, true); close(); });
  } else if (tool === "share") {
    body.innerHTML = '<label class="note-prompt__label">Usuario<div class="note-user-picker"><input class="note-prompt__input" data-share-email type="email" placeholder="Busca un usuario por correo" autocomplete="off" required /><div class="note-user-results" data-note-user-results hidden role="listbox"></div></div></label><label class="note-prompt__label">Permiso<select id="note-permission-' + noteId + '" class="note-prompt__select custom-select"><option value="view">Solo lectura</option><option value="edit">Puede editar</option></select></label>';
    const email = body.querySelector("[data-share-email]");
    const permission = body.querySelector(".note-prompt__select");
    const userResults = body.querySelector("[data-note-user-results]");
    if (typeof enhanceCustomSelect === "function") enhanceCustomSelect(permission);
    email.addEventListener("input", () => renderNoteUserResults(email));
    email.addEventListener("focus", () => renderNoteUserResults(email));
    userResults.addEventListener("click", (event) => {
      const userOption = event.target.closest("[data-note-user]");
      if (!userOption) return;
      email.value = userOption.dataset.noteUser;
      userResults.hidden = true;
    });
    renderNoteUserResults(email);
    loadNoteUsers().then(() => renderNoteUserResults(email));
    const share = addButton("Compartir");
    share.addEventListener("click", async () => {
      if (!email.value.trim()) { email.focus(); return; }
      await shareNote(noteId, email.value, permission.value, share);
      close();
    });
  } else if (tool === "color") {
    body.innerHTML = '<p>Selecciona un color para esta nota.</p><div class="note-prompt__colors"></div>';
    const colors = body.querySelector(".note-prompt__colors");
    NOTE_COLORS.forEach((color) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `note-card__color note-card__color--${color}`;
      button.setAttribute("aria-label", `Color ${color}`);
      colors.append(button);
      button.addEventListener("click", async () => { await updateNoteColor(noteId, color, null, noteCard); close(); });
    });
  } else if (tool === "format") {
    body.innerHTML = '<p>Selecciona el estilo que quieres aplicar al contenido.</p><div class="note-format-options"><button type="button" data-format-style="bold"><strong>Negrita</strong></button><button type="button" data-format-style="italic"><em>Cursiva</em></button><button type="button" data-format-style="underline"><u>Subrayado</u></button><button type="button" data-format-style="reset">Restablecer</button></div>';
    const expandedCard = notesList?.querySelector(`.note-expanded-card[data-note-id="${noteId}"]`);
    const contentInput = expandedCard?.querySelector(".note-expanded-content");
    const formatKey = `note-format-${noteId}`;
    let format = readNoteFormat(noteId);
    const applyFormat = () => {
      applyNoteFormatStyles(contentInput, format);
    };
    const syncFormatButtons = () => body.querySelectorAll("[data-format-style]").forEach((item) => item.classList.toggle("is-active", Boolean(format[item.dataset.formatStyle])));
    applyFormat();
    syncFormatButtons();
    body.querySelectorAll("[data-format-style]").forEach((button) => {
      button.addEventListener("click", () => {
        const style = button.dataset.formatStyle;
        if (style === "reset") format = {};
        else format[style] = !format[style];
        localStorage.setItem(formatKey, JSON.stringify(format));
        applyFormat();
        syncFormatButtons();
      });
    });
    addButton("Entendido").addEventListener("click", close);
  } else {
    close();
    return;
  }
  prompt.addEventListener("click", (event) => { if (event.target === prompt) close(); });
  document.body.append(prompt);
  prompt.querySelector("textarea, input, button")?.focus();
}

async function loadNoteUsers() {
  const { data, error } = await notesClient.rpc("list_note_users");
  if (error) {
    setNotesStatus(`No se pudieron cargar los usuarios: ${error.message}`, true);
    return;
  }
  noteUsers = (data || [])
    .filter(({ email }) => email)
    .map(({ email }) => email.toLowerCase());
  const activeInput = notesList?.querySelector("[data-share-email]:focus");
  if (activeInput) renderNoteUserResults(activeInput);
}

function renderNoteUserResults(input) {
  const picker = input.closest(".note-user-picker");
  const results = picker?.querySelector("[data-note-user-results]");
  if (!results) return;
  const query = input.value.trim().toLowerCase();
  const matches = noteUsers
    .filter((email) => !query || email.includes(query));
  results.innerHTML = matches.map((email) => `
    <button type="button" class="note-user-option" data-note-user="${escapeNoteHtml(email)}" role="option">
      ${escapeNoteHtml(email)}
    </button>
  `).join("");
  results.hidden = matches.length === 0;
}

function renderNotesSession(session) {
  currentNotesUser = session?.user || null;
  const signedIn = Boolean(currentNotesUser);
  if (notesAuthState) notesAuthState.hidden = signedIn;
  if (notesApp) notesApp.hidden = !signedIn;
  if (notesUserLabel && signedIn) notesUserLabel.textContent = currentNotesUser.email || "Sesión iniciada";
  if (window.bindSiteAuthButton) window.bindSiteAuthButton(signedIn);
  if (signedIn) {
    loadNotes();
  }
}

async function signInWithGoogle() {
  if (window.location.protocol === "file:") {
    setNotesStatus(
      "Para iniciar sesión, abre el manual mediante un servidor local (http://localhost), no como archivo local.",
      true,
    );
    return;
  }

  setNotesStatus("Abriendo Google...");
  const { error } = await notesClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });
  if (error) setNotesStatus(error.message, true);
}

async function saveNote(event) {
  event.preventDefault();
  const submitButton = noteForm?.querySelector("button[type=submit]");
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  if (!content) {
    setNotesStatus("Escribe algo antes de guardar.", true);
    return;
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Guardando...";
  }
  const { error } = await notesClient.from("notes").insert({
    user_id: currentNotesUser.id,
    title,
    content,
    note_date: getLocalDateValue(),
  });
  if (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Guardar nota";
    }
    setNotesStatus(error.message, true);
    return;
  }
  noteForm.reset();
  submitButton?.blur();
  setNotesStatus("Nota guardada.");
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar nota";
  }
  await loadNotes();
}

async function deleteNote(noteId, button, skipConfirmation = false) {
  if (!skipConfirmation && !window.confirm("¿Quieres eliminar esta nota? Esta acción no se puede deshacer.")) {
    setNotesStatus("Eliminación cancelada.");
    return;
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Eliminando...";
  }
  setNotesStatus("Eliminando nota...");
  const { error } = await notesClient.from("notes").delete().eq("id", noteId);
  if (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "Eliminar";
    }
    setNotesStatus(error.message, true);
    return;
  }
  setNotesStatus("Nota eliminada correctamente.");
  await loadNotes();
}

async function shareNote(noteId, email, permission, button) {
  const recipientEmail = email.trim().toLowerCase();
  if (!recipientEmail || !recipientEmail.includes("@")) {
    setNotesStatus("Escribe un correo válido para compartir la nota.", true);
    return;
  }
  if (recipientEmail === currentNotesUser.email?.toLowerCase()) {
    setNotesStatus("No necesitas compartir la nota contigo mismo.", true);
    return;
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Compartiendo...";
  }
  setNotesStatus("Verificando la cuenta...");
  const { data: userExists, error: lookupError } = await notesClient.rpc(
    "user_exists_by_email",
    { target_email: recipientEmail },
  );
  if (lookupError) {
    if (button) {
      button.disabled = false;
      button.textContent = "Compartir";
    }
    setNotesStatus(`No se pudo verificar el usuario: ${lookupError.message}`, true);
    return;
  }
  if (!userExists) {
    if (button) {
      button.disabled = false;
      button.textContent = "Compartir";
    }
    setNotesStatus(`No encontramos una cuenta registrada con ${recipientEmail}.`, true);
    return;
  }

  const { error } = await notesClient.from("note_shares").upsert({
    note_id: noteId,
    recipient_email: recipientEmail,
    permission,
  }, { onConflict: "note_id,recipient_email" });
  if (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "Compartir";
    }
    setNotesStatus(error.message, true);
    return;
  }
  setNotesStatus(`Nota compartida con ${recipientEmail}.`);
  if (button) {
    button.disabled = false;
    button.textContent = "Compartir";
  }
  const shareInput = notesList
    ?.querySelector(`[data-note-id="${noteId}"] [data-share-email]`);
  if (shareInput) shareInput.value = "";
  const shareResults = shareInput?.closest(".note-user-picker")
    ?.querySelector("[data-note-user-results]");
  if (shareResults) shareResults.hidden = true;
  await loadNotes();
}

function confirmRemoveNoteShare(isOwner, recipientEmail) {
  return new Promise((resolve) => {
    const prompt = document.createElement("div");
    prompt.className = "note-prompt";
    prompt.dataset.noteTool = "revoke-share";
    prompt.innerHTML = `
      <div class="note-prompt__card" role="dialog" aria-modal="true" aria-labelledby="note-share-confirm-title">
        <h2 id="note-share-confirm-title">${isOwner ? "Dejar de compartir" : "Dejar de ver nota"}</h2>
        <p></p>
        <div class="note-prompt__actions">
          <button class="note-prompt__secondary" type="button">Cancelar</button>
          <button class="note-prompt__danger" type="button">${isOwner ? "Quitar acceso" : "Dejar de ver"}</button>
        </div>
      </div>
    `;
    const message = isOwner
      ? `¿Quieres dejar de compartir esta nota con ${recipientEmail}?`
      : "¿Quieres dejar de ver esta nota compartida?";
    prompt.querySelector(".note-prompt__card p").textContent = message;
    const finish = (confirmed) => {
      document.removeEventListener("keydown", handleKeydown);
      prompt.remove();
      resolve(confirmed);
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") finish(false);
    };
    prompt.querySelector(".note-prompt__secondary").addEventListener("click", () => finish(false));
    prompt.querySelector(".note-prompt__danger").addEventListener("click", () => finish(true));
    prompt.addEventListener("click", (event) => {
      if (event.target === prompt) finish(false);
    });
    document.addEventListener("keydown", handleKeydown);
    document.body.append(prompt);
    prompt.querySelector(".note-prompt__secondary").focus();
  });
}

async function removeNoteShare(noteId, recipientEmail, button, isOwner) {
  if (!await confirmRemoveNoteShare(isOwner, recipientEmail)) {
    setNotesStatus("Acción cancelada.");
    return;
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Quitando...";
  }
  const { data, error } = await notesClient
    .from("note_shares")
    .delete()
    .eq("note_id", noteId)
    .eq("recipient_email", recipientEmail.toLowerCase())
    .select("id");
  if (error) {
    if (button) {
      button.disabled = false;
      button.textContent = isOwner ? "Quitar acceso" : "Dejar de ver";
    }
    setNotesStatus(`No se pudo quitar el acceso: ${error.message}`, true);
    return;
  }
  if (!data?.length) {
    setNotesStatus("El acceso compartido ya no estaba activo.", true);
    await loadNotes();
    return;
  }
  setNotesStatus(isOwner ? `Se quitó el acceso de ${recipientEmail}.` : "Ya no verás esta nota compartida.");
  await loadNotes();
}

async function updateNoteContent(noteId, content, button) {
  if (button) {
    button.disabled = true;
    button.textContent = "Guardando...";
  }
  setNotesStatus("Guardando cambios...");
  const { error } = await notesClient
    .from("notes")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", noteId);
  if (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "Guardar";
    }
    setNotesStatus(error.message, true);
    return;
  }
  setNotesStatus("Nota actualizada.");
  await loadNotes();
}

async function updateNoteDetails(noteId, title, content, button) {
  const nextContent = content.trim();
  if (!nextContent) {
    setNotesStatus("Escribe algo antes de guardar.", true);
    return false;
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Guardando...";
  }
  setNotesStatus("Guardando cambios...");
  const { error } = await notesClient
    .from("notes")
    .update({
      title: title.trim() || "Sin título",
      content: nextContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId);
  if (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "Guardar";
    }
    setNotesStatus(error.message, true);
    return false;
  }
  setNotesStatus("Nota actualizada.");
  await loadNotes();
  return true;
}

async function updateNoteColor(noteId, color, button, cardOverride = null) {
  const nextColor = normalizeNoteColor(color);
  const card = cardOverride || button?.closest("[data-note-id]");
  const previousColor = NOTE_COLORS.find((item) => card?.classList.contains(`note-card--${item}`)) || "yellow";
  if (!card || nextColor === previousColor) return;

  card.classList.remove(`note-card--${previousColor}`);
  card.classList.add(`note-card--${nextColor}`);
  card.querySelectorAll("[data-note-color]").forEach((colorButton) => {
    const selected = colorButton.dataset.noteColor === nextColor;
    colorButton.classList.toggle("is-selected", selected);
    colorButton.setAttribute("aria-pressed", String(selected));
  });
  const { error } = await notesClient
    .from("notes")
    .update({ color: nextColor })
    .eq("id", noteId);
  if (error) {
    card.classList.remove(`note-card--${nextColor}`);
    card.classList.add(`note-card--${previousColor}`);
    card.querySelectorAll("[data-note-color]").forEach((colorButton) => {
      const selected = colorButton.dataset.noteColor === previousColor;
      colorButton.classList.toggle("is-selected", selected);
      colorButton.setAttribute("aria-pressed", String(selected));
    });
    setNotesStatus(`No se pudo cambiar el color: ${error.message}`, true);
    return;
  }
  setNotesStatus("Color de la nota actualizado.");
}

function openExpandedNote(card) {
  if (!card || document.querySelector(".note-expanded-backdrop")) return;

  const backdrop = document.createElement("div");
  backdrop.className = "note-expanded-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-label", "Nota ampliada");

  const expandedCard = card.cloneNode(true);
  expandedCard.classList.add("note-expanded-card");
  const titleElement = expandedCard.querySelector("h2");
  const contentElement = expandedCard.querySelector("[data-note-content]");
  const optionsElement = expandedCard.querySelector(".note-card__options");
  const titleInput = document.createElement("input");
  titleInput.className = "note-expanded-title";
  titleInput.type = "text";
  titleInput.autocomplete = "off";
  titleInput.maxLength = 120;
  titleInput.value = titleElement?.textContent || "";
  titleInput.setAttribute("aria-label", "Título de la nota");
  const contentInput = document.createElement("textarea");
  contentInput.className = "note-expanded-content";
  contentInput.maxLength = 5000;
  contentInput.value = contentElement?.textContent || "";
  contentInput.setAttribute("aria-label", "Contenido de la nota");
  titleElement?.replaceWith(titleInput);
  contentElement?.replaceWith(contentInput);
  applyNoteFormatStyles(contentInput, readNoteFormat(card.dataset.noteId));

  const actions = document.createElement("div");
  actions.className = "note-expanded-actions";
  actions.innerHTML = '<button type="button" class="note-expanded-close">Cerrar</button><button type="button" class="note-expanded-save">Guardar</button>';
  optionsElement?.before(actions);
  backdrop.append(expandedCard);

  const close = () => {
    backdrop.remove();
    document.removeEventListener("keydown", onKeydown);
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") close();
  };

  actions.querySelector(".note-expanded-close")?.addEventListener("click", close);
  actions.querySelector(".note-expanded-save")?.addEventListener("click", async (event) => {
    const saved = await updateNoteDetails(
      card.dataset.noteId,
      titleInput.value,
      contentInput.value,
      event.currentTarget,
    );
    if (saved) close();
  });

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", onKeydown);
  notesList.append(backdrop);
  titleInput.focus();
}

if (!notesReady) {
  setNotesStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
} else {
  notesClient = window.supabase.createClient(notesConfig.url, notesConfig.anonKey);
  noteForm?.addEventListener("submit", saveNote);
  const updateDateFilter = () => {
    const hasDate = Boolean(noteDateFilter?.value);
    if (noteDateFilterTrigger) {
      noteDateFilterTrigger.textContent = hasDate ? formatNoteDate(noteDateFilter.value) : "Elegir fecha";
      noteDateFilterTrigger.classList.toggle("is-selected", hasDate);
    }
    if (noteDateFilterLabel) {
      noteDateFilterLabel.textContent = hasDate ? "Notas del día" : "Ver notas de la fecha";
    }
    renderNotes(loadedNotes, loadedSharePermissions, loadedShareOwners, loadedOwnerShares);
  };
  noteDateFilterTrigger?.addEventListener("click", () => {
    if (!noteDateCalendar) return;
    const isOpening = noteDateCalendar.hidden;
    if (isOpening) {
      const selectedDate = noteDateFilter?.value;
      const initialMonth = selectedDate
        ? new Date(`${selectedDate}T00:00:00`)
        : new Date();
      displayedCalendarMonth = new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1);
      renderNoteDateCalendar();
    }
    noteDateCalendar.hidden = !isOpening;
    noteDateFilterTrigger.setAttribute("aria-expanded", String(isOpening));
  });
  noteDateCalendar?.addEventListener("click", (event) => {
    const monthButton = event.target.closest("[data-calendar-month]");
    if (monthButton) {
      displayedCalendarMonth.setMonth(
        displayedCalendarMonth.getMonth() + Number(monthButton.dataset.calendarMonth),
      );
      renderNoteDateCalendar();
      return;
    }
    const dayButton = event.target.closest("[data-calendar-date]");
    if (!dayButton || !noteDateFilter) return;
    noteDateFilter.value = dayButton.dataset.calendarDate;
    noteDateCalendar.hidden = true;
    noteDateFilterTrigger?.setAttribute("aria-expanded", "false");
    updateDateFilter();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".notes-calendar")) return;
    if (noteDateCalendar) noteDateCalendar.hidden = true;
    noteDateFilterTrigger?.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || noteDateCalendar?.hidden) return;
    noteDateCalendar.hidden = true;
    noteDateFilterTrigger?.setAttribute("aria-expanded", "false");
    noteDateFilterTrigger?.focus();
  });
  clearNoteDateFilter?.addEventListener("click", () => {
    if (noteDateFilter) noteDateFilter.value = "";
    updateDateFilter();
  });
  notesList?.addEventListener("input", (event) => {
    if (event.target.matches("[data-share-email]")) renderNoteUserResults(event.target);
  });
  notesList?.addEventListener("focusin", (event) => {
    if (event.target.matches("[data-share-email]")) renderNoteUserResults(event.target);
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".note-user-picker")) return;
    document.querySelectorAll("[data-note-user-results]").forEach((results) => {
      results.hidden = true;
    });
  });
  notesList?.addEventListener("click", (event) => {
    const revokeShareButton = event.target.closest("[data-revoke-share]");
    if (revokeShareButton) {
      const card = revokeShareButton.closest("[data-note-id]");
      const recipientEmail = revokeShareButton.dataset.revokeShare;
      if (card && recipientEmail) {
        removeNoteShare(card.dataset.noteId, recipientEmail, revokeShareButton, true);
      }
      return;
    }
    const leaveShareButton = event.target.closest("[data-leave-share]");
    if (leaveShareButton) {
      const card = leaveShareButton.closest("[data-note-id]");
      if (card && currentNotesUser?.email) {
        removeNoteShare(card.dataset.noteId, currentNotesUser.email, leaveShareButton, false);
      }
      return;
    }
    const tool = event.target.closest("[data-note-tool]");
    if (tool) {
      showNoteToolPrompt(tool.dataset.noteTool, tool.closest("[data-note-id]")?.dataset.noteId);
      return;
    }
    const userOption = event.target.closest("[data-note-user]");
    if (userOption) {
      const picker = userOption.closest(".note-user-picker");
      const input = picker?.querySelector("[data-share-email]");
      if (input) input.value = userOption.dataset.noteUser;
      const results = picker?.querySelector("[data-note-user-results]");
      if (results) results.hidden = true;
      return;
    }
    const colorButton = event.target.closest("[data-note-color]");
    if (colorButton) {
      updateNoteColor(colorButton.closest("[data-note-id]")?.dataset.noteId, colorButton.dataset.noteColor, colorButton);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-note]");
    if (deleteButton) deleteNote(deleteButton.dataset.deleteNote, deleteButton);
    const shareButton = event.target.closest("[data-share-note]");
    if (shareButton) {
      const card = shareButton.closest("[data-note-id]");
      const email = card?.querySelector("[data-share-email]")?.value || "";
      const permission = card?.querySelector("[data-share-permission]")?.value || "view";
      shareNote(shareButton.dataset.shareNote, email, permission, shareButton);
    }
    const editButton = event.target.closest("[data-edit-note]");
    if (editButton) {
      const card = editButton.closest("[data-note-id]");
      const content = card?.querySelector("[data-note-content]");
      if (!card || !content) return;
      const textarea = document.createElement("textarea");
      textarea.className = "note-card__edit-area";
      textarea.value = content.textContent;
      content.hidden = true;
      content.after(textarea);
      editButton.textContent = "Guardar";
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "note-card__edit-cancel";
      cancelButton.dataset.cancelEdit = "true";
      cancelButton.textContent = "Cancelar";
      textarea.after(cancelButton);
      editButton.dataset.saveNote = editButton.dataset.editNote;
      delete editButton.dataset.editNote;
      return;
    }
    const saveButton = event.target.closest("[data-save-note]");
    if (saveButton) {
      const card = saveButton.closest("[data-note-id]");
      const textarea = card?.querySelector(".note-card__edit-area");
      if (textarea?.value.trim()) updateNoteContent(saveButton.dataset.saveNote, textarea.value, saveButton);
    }
    const cancelButton = event.target.closest("[data-cancel-edit]");
    if (cancelButton) {
      const card = cancelButton.closest("[data-note-id]");
      const content = card?.querySelector("[data-note-content]");
      const editButton = card?.querySelector("[data-save-note]");
      card?.querySelector(".note-card__edit-area")?.remove();
      cancelButton.remove();
      if (content) content.hidden = false;
      if (editButton) {
        editButton.textContent = "Editar";
        editButton.dataset.editNote = editButton.dataset.saveNote;
        delete editButton.dataset.saveNote;
      }
      setNotesStatus("Edición cancelada.");
    }

    if (event.target.closest(".note-expanded-backdrop")) return;
    const noteCard = event.target.closest(".note-card");
    if (noteCard && !event.target.closest("button, input, select, textarea, a")) {
      openExpandedNote(noteCard);
    }
  });
  notesClient.auth.onAuthStateChange((_event, session) => renderNotesSession(session));
  notesClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      setNotesStatus(`No se pudo recuperar la sesión: ${error.message}`, true);
      return;
    }
    renderNotesSession(data.session);
  });
}
