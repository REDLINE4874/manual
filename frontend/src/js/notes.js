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

let notesClient = null;
let currentNotesUser = null;
let noteUsers = [];
const NOTE_COLORS = ["yellow", "blue", "green", "pink", "purple", "coral"];

function normalizeNoteColor(color) {
  return NOTE_COLORS.includes(color) ? color : "yellow";
}

function setNotesStatus(message, isError = false) {
  [notesStatus, noteSaveStatus].forEach((element) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  });
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

function renderNotes(notes, sharePermissions = new Map()) {
  if (!notesList) return;
  if (!notes.length) {
    notesList.innerHTML = '<p class="notes-empty">Todavía no tienes notas guardadas.</p>';
    return;
  }
  notesList.innerHTML = notes.map((note) => {
    const isOwner = note.user_id === currentNotesUser?.id;
    const canEdit = isOwner || sharePermissions.get(note.id) === "edit";
    const noteColor = isOwner ? normalizeNoteColor(note.color) : "shared";
    return `
    <article class="note-card note-card--${noteColor}" data-note-id="${escapeNoteHtml(note.id)}">
      <h2>${escapeNoteHtml(note.title || "Sin título")}</h2>
      <p data-note-content>${escapeNoteHtml(note.content).replace(/\n/g, "<br>")}</p>
      <div class="note-card__options">
        <div class="note-card__buttons">
          ${canEdit ? `<button class="note-card__edit" type="button" data-edit-note="${escapeNoteHtml(note.id)}">Editar</button>` : ""}
          ${isOwner ? `<button class="note-card__delete" type="button" data-delete-note="${escapeNoteHtml(note.id)}">Eliminar</button>` : ""}
        </div>
        ${isOwner ? `
          <div class="note-card__colors" aria-label="Color de la nota">
            <span>Color</span>
            ${NOTE_COLORS.map((color) => `
              <button type="button" class="note-card__color note-card__color--${color}${noteColor === color ? " is-selected" : ""}"
                data-note-color="${color}" aria-label="Color ${color}" aria-pressed="${noteColor === color}"></button>
            `).join("")}
          </div>
          <div class="note-card__share">
            <div class="note-user-picker">
              <input type="email" data-share-email autocomplete="off" placeholder="correo@ejemplo.com" aria-label="Correo de la persona con quien compartir" />
              <div class="note-user-results" data-note-user-results role="listbox" hidden></div>
            </div>
            <select class="note-card__select custom-select" data-share-permission aria-label="Permiso para compartir">
              <option value="view">Solo lectura</option>
              <option value="edit">Puede editar</option>
            </select>
            <button type="button" data-share-note="${escapeNoteHtml(note.id)}">Compartir</button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
  }).join("");
  notesList.querySelectorAll("select.note-card__select").forEach((select) => {
    if (typeof enhanceCustomSelect === "function") enhanceCustomSelect(select);
  });
}

async function loadNotes() {
  const { data, error } = await notesClient
    .from("notes")
    .select("id, user_id, title, content, color, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    setNotesStatus(`No se pudieron cargar las notas: ${error.message}`, true);
    return;
  }
  const { data: shares } = await notesClient
    .from("note_shares")
    .select("note_id, permission")
    .eq("recipient_email", currentNotesUser.email.toLowerCase());
  const sharePermissions = new Map((shares || []).map((share) => [share.note_id, share.permission]));
  renderNotes(data || [], sharePermissions);
  loadNoteUsers();
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
    .filter((email) => !query || email.includes(query))
    .slice(0, 8);
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
  setNotesStatus("Nota guardada.");
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar nota";
  }
  await loadNotes();
}

async function deleteNote(noteId, button) {
  if (!window.confirm("¿Quieres eliminar esta nota? Esta acción no se puede deshacer.")) {
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

async function updateNoteColor(noteId, color, button) {
  const nextColor = normalizeNoteColor(color);
  const card = button?.closest("[data-note-id]");
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

if (!notesReady) {
  setNotesStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
} else {
  notesClient = window.supabase.createClient(notesConfig.url, notesConfig.anonKey);
  noteForm?.addEventListener("submit", saveNote);
  notesList?.addEventListener("input", (event) => {
    if (event.target.matches("[data-share-email]")) renderNoteUserResults(event.target);
  });
  notesList?.addEventListener("focusin", (event) => {
    if (event.target.matches("[data-share-email]")) renderNoteUserResults(event.target);
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".note-user-picker")) return;
    notesList?.querySelectorAll("[data-note-user-results]").forEach((results) => {
      results.hidden = true;
    });
  });
  notesList?.addEventListener("click", (event) => {
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
