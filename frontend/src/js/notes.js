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

function renderNotes(notes) {
  if (!notesList) return;
  if (!notes.length) {
    notesList.innerHTML = '<p class="notes-empty">Todavía no tienes notas guardadas.</p>';
    return;
  }
  notesList.innerHTML = notes.map((note) => `
    <article class="note-card" data-note-id="${escapeNoteHtml(note.id)}">
      <h2>${escapeNoteHtml(note.title || "Sin título")}</h2>
      <p>${escapeNoteHtml(note.content).replace(/\n/g, "<br>")}</p>
      <button class="note-card__delete" type="button" data-delete-note="${escapeNoteHtml(note.id)}">Eliminar</button>
    </article>
  `).join("");
}

async function loadNotes() {
  const { data, error } = await notesClient
    .from("notes")
    .select("id, title, content, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    setNotesStatus(`No se pudieron cargar las notas: ${error.message}`, true);
    return;
  }
  renderNotes(data || []);
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
  setNotesStatus("Abriendo Google...");
  const { error } = await notesClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href.split("#")[0] },
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

if (!notesReady) {
  setNotesStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
  if (googleSignInButton) googleSignInButton.disabled = true;
} else {
  notesClient = window.supabase.createClient(notesConfig.url, notesConfig.anonKey);
  googleSignInButton?.addEventListener("click", signInWithGoogle);
  signOutButton?.addEventListener("click", () => notesClient.auth.signOut());
  noteForm?.addEventListener("submit", saveNote);
  notesList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-note]");
    if (button) deleteNote(button.dataset.deleteNote);
  });
  notesClient.auth.onAuthStateChange((_event, session) => renderNotesSession(session));
  notesClient.auth.getSession().then(({ data }) => renderNotesSession(data.session));
}
