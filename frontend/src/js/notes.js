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
const googleSignInButton = document.getElementById("googleSignInButton");
const signOutButton = document.getElementById("signOutButton");
const noteForm = document.getElementById("noteForm");
const notesList = document.getElementById("notesList");
const notesUserLabel = document.getElementById("notesUserLabel");
const authButton = document.getElementById("authButton");

let notesClient = null;
let currentNotesUser = null;

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
    return `
    <article class="note-card" data-note-id="${escapeNoteHtml(note.id)}">
      <h2>${escapeNoteHtml(note.title || "Sin título")}</h2>
      <p data-note-content>${escapeNoteHtml(note.content).replace(/\n/g, "<br>")}</p>
      ${canEdit ? `<button class="note-card__edit" type="button" data-edit-note="${escapeNoteHtml(note.id)}">Editar</button>` : ""}
      ${isOwner ? `
        <div class="note-card__share">
          <input type="email" data-share-email placeholder="correo@ejemplo.com" aria-label="Correo de la persona con quien compartir" />
          <select class="note-card__select custom-select" data-share-permission aria-label="Permiso para compartir">
            <option value="view">Solo lectura</option>
            <option value="edit">Puede editar</option>
          </select>
          <button type="button" data-share-note="${escapeNoteHtml(note.id)}">Compartir</button>
        </div>
      ` : ""}
      ${isOwner ? `<button class="note-card__delete" type="button" data-delete-note="${escapeNoteHtml(note.id)}">Eliminar</button>` : ""}
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
    .select("id, user_id, title, content, updated_at")
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
}

function renderNotesSession(session) {
  currentNotesUser = session?.user || null;
  const signedIn = Boolean(currentNotesUser);
  if (notesAuthState) notesAuthState.hidden = signedIn;
  if (notesApp) notesApp.hidden = !signedIn;
  if (authButton) {
    authButton.textContent = signedIn ? "Mis notas" : "Iniciar sesión";
    authButton.onclick = () => showView("notas");
  }
  if (notesUserLabel && signedIn) notesUserLabel.textContent = currentNotesUser.email || "Sesión iniciada";
  if (signedIn) loadNotes();
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
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  if (!content) {
    setNotesStatus("Escribe algo antes de guardar.", true);
    return;
  }
  const { error } = await notesClient.from("notes").insert({
    user_id: currentNotesUser.id,
    title,
    content,
  });
  if (error) {
    setNotesStatus(error.message, true);
    return;
  }
  noteForm.reset();
  setNotesStatus("Nota guardada.");
  await loadNotes();
}

async function deleteNote(noteId) {
  const { error } = await notesClient.from("notes").delete().eq("id", noteId);
  if (error) {
    setNotesStatus(error.message, true);
    return;
  }
  await loadNotes();
}

async function shareNote(noteId, email, permission) {
  const recipientEmail = email.trim().toLowerCase();
  if (!recipientEmail || !recipientEmail.includes("@")) {
    setNotesStatus("Escribe un correo válido para compartir la nota.", true);
    return;
  }
  if (recipientEmail === currentNotesUser.email?.toLowerCase()) {
    setNotesStatus("No necesitas compartir la nota contigo mismo.", true);
    return;
  }
  const { error } = await notesClient.from("note_shares").upsert({
    note_id: noteId,
    recipient_email: recipientEmail,
    permission,
  }, { onConflict: "note_id,recipient_email" });
  if (error) {
    setNotesStatus(error.message, true);
    return;
  }
  setNotesStatus(`Nota compartida con ${recipientEmail}.`);
}

async function updateNoteContent(noteId, content) {
  const { error } = await notesClient
    .from("notes")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", noteId);
  if (error) {
    setNotesStatus(error.message, true);
    return;
  }
  setNotesStatus("Nota actualizada.");
  await loadNotes();
}

if (!notesReady) {
  setNotesStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
  if (googleSignInButton) googleSignInButton.disabled = true;
} else {
  notesClient = window.supabase.createClient(notesConfig.url, notesConfig.anonKey);
  googleSignInButton?.addEventListener("click", signInWithGoogle);
  signOutButton?.addEventListener("click", () => notesClient.auth.signOut());
  noteForm?.addEventListener("submit", saveNote);
  notesList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-note]");
    if (deleteButton) deleteNote(deleteButton.dataset.deleteNote);
    const shareButton = event.target.closest("[data-share-note]");
    if (shareButton) {
      const card = shareButton.closest("[data-note-id]");
      const email = card?.querySelector("[data-share-email]")?.value || "";
      const permission = card?.querySelector("[data-share-permission]")?.value || "view";
      shareNote(shareButton.dataset.shareNote, email, permission);
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
      editButton.dataset.saveNote = editButton.dataset.editNote;
      delete editButton.dataset.editNote;
      return;
    }
    const saveButton = event.target.closest("[data-save-note]");
    if (saveButton) {
      const card = saveButton.closest("[data-note-id]");
      const textarea = card?.querySelector(".note-card__edit-area");
      if (textarea?.value.trim()) updateNoteContent(saveButton.dataset.saveNote, textarea.value);
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
