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
const noteSharingStatus = document.getElementById("noteSharingStatus");
const globalStatus = document.getElementById("globalStatus");
const noteEditor = document.getElementById("noteEditor");
const emptyState = document.getElementById("emptyState");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteContentHighlights = document.getElementById("noteContentHighlights");
const noteFindPanel = document.getElementById("noteFindPanel");
const noteFindInput = document.getElementById("noteFindInput");
const findInNote = document.getElementById("findInNote");
const noteFindCount = document.getElementById("noteFindCount");
const noteFindPrevious = document.getElementById("noteFindPrevious");
const noteFindNext = document.getElementById("noteFindNext");
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
const confirmDialog = document.getElementById("confirmDialog");
const confirmDialogTitle = document.getElementById("confirmDialogTitle");
const confirmDialogMessage = document.getElementById("confirmDialogMessage");
const cancelConfirmation = document.getElementById("cancelConfirmation");
const acceptConfirmation = document.getElementById("acceptConfirmation");
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const fontSizeOption = document.getElementById("fontSizeOption");
const fontSizeDialog = document.getElementById("fontSizeDialog");
const fontFamilySelect = document.getElementById("fontFamilySelect");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const codeLanguageSelect = document.getElementById("codeLanguageSelect");
const applyCodeFormat = document.getElementById("applyCodeFormat");
const cancelFontSize = document.getElementById("cancelFontSize");
const confirmFontSize = document.getElementById("confirmFontSize");
const formatToolbar = document.getElementById("formatToolbar");

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
const OPEN_TAB_STATE_TABLE = "note_tab_states";
const READ_SHARED_NOTES_PREFIX = "notas-app-read-shared-notes";
const NOTE_CONTENT_PREFIX = "<!-- notas-app-rich-text:v1 -->";
const CODE_LANGUAGE_IDS = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "css", "xml", "json", "sql", "bash", "yaml", "markdown",
];
const NOTE_FONT_FAMILIES = [
  "Inter, 'Segoe UI', system-ui, sans-serif",
  "Arial, sans-serif",
  "Aptos, sans-serif",
  "Calibri, sans-serif",
  "Georgia, serif",
  "Verdana, sans-serif",
  "'Courier New', monospace",
];
const NOTE_MAX_LENGTH = 20000;
const shortDateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "short",
  timeStyle: "short",
  hour12: true,
});

let client = null;
let currentUser = null;
let recoveryActive = false;
let persistentAuthMessage = "";
let pendingFormatContent = null;
let pendingEditorSelection = null;
let savedEditorSelection = null;
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
let openTabSaveQueue = Promise.resolve();
let readSharedNoteIds = new Set();
let installPrompt = null;
let saveTimer = null;
let saveQueue = Promise.resolve();
let globalStatusTimer = null;
let pendingConfirmResolution = null;
let noteFindMatches = [];
let noteFindCurrent = 0;
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

function finishConfirmation(confirmed) {
  if (!pendingConfirmResolution) return;
  const resolve = pendingConfirmResolution;
  pendingConfirmResolution = null;
  confirmDialog.close();
  resolve(confirmed);
}

function requestConfirmation({ title, message, confirmLabel }) {
  if (confirmDialog.open) return Promise.resolve(false);
  confirmDialogTitle.textContent = title;
  confirmDialogMessage.textContent = message;
  acceptConfirmation.textContent = confirmLabel;
  return new Promise((resolve) => {
    pendingConfirmResolution = resolve;
    confirmDialog.showModal();
    cancelConfirmation.focus();
  });
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  const selectedTheme = isDark ? "dark" : "light";
  document.documentElement.dataset.theme = selectedTheme;
  themeToggles.forEach((toggle) => {
    toggle.setAttribute("aria-checked", String(isDark));
    toggle.title = `Cambiar a tema ${isDark ? "claro" : "oscuro"}`;
  });
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#292929" : "#f6f7fb";
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

function sanitizeNoteContent(html) {
  const root = document.createElement("div");
  root.innerHTML = String(html ?? "");
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "BR", "SPAN", "DIV", "P", "CODE"]);
  const dangerousTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE"]);
  const normalizeFont = (value) => String(value || "").replace(/["']/g, "").trim().toLowerCase();

  function clean(parent) {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (!(node instanceof HTMLElement)) {
        node.remove();
        return;
      }
      if (dangerousTags.has(node.tagName)) {
        node.remove();
        return;
      }
      clean(node);
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }

      const fontFamily = node.tagName === "SPAN" ? node.style.fontFamily : "";
      const fontSize = node.tagName === "SPAN" ? node.style.fontSize : "";
      const codeLanguage = node.tagName === "CODE"
        && (CODE_LANGUAGE_IDS.includes(node.getAttribute("data-language")) || node.getAttribute("data-language") === "auto")
        ? node.getAttribute("data-language")
        : "";
      Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));
      if (codeLanguage) node.dataset.language = codeLanguage;
      if (fontFamily) {
        const safeFamily = NOTE_FONT_FAMILIES.find((family) => normalizeFont(family) === normalizeFont(fontFamily));
        if (safeFamily) node.style.fontFamily = safeFamily;
      }
      if (/^(?:[8-9]|[1-6]\d|7[0-2])px$/.test(fontSize)) node.style.fontSize = fontSize;
      if (!node.getAttribute("style")) node.removeAttribute("style");
    });
  }

  clean(root);
  return root.innerHTML;
}

function setNoteContent(content) {
  savedEditorSelection = null;
  const storedContent = String(content ?? "");
  if (storedContent.startsWith(NOTE_CONTENT_PREFIX)) {
    noteContent.innerHTML = sanitizeNoteContent(storedContent.slice(NOTE_CONTENT_PREFIX.length));
  } else {
    noteContent.textContent = storedContent;
  }
}

function getPlainTextFromRichContent(root, trimTrailingNewline = true) {
  let text = "";

  function append(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue;
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "BR") {
      text += "\n";
      return;
    }
    const start = text.length;
    node.childNodes.forEach(append);
    if (["DIV", "P"].includes(node.tagName) && text.length > start && !text.endsWith("\n")) text += "\n";
  }

  root.childNodes.forEach(append);
  return trimTrailingNewline && text.endsWith("\n") ? text.slice(0, -1) : text;
}

function getNoteContentText(content) {
  const storedContent = String(content ?? "");
  if (!storedContent.startsWith(NOTE_CONTENT_PREFIX)) return storedContent;
  const root = document.createElement("div");
  root.innerHTML = sanitizeNoteContent(storedContent.slice(NOTE_CONTENT_PREFIX.length));
  return getPlainTextFromRichContent(root);
}

function readNoteContentText() {
  return noteContent.innerText.replace(/\r/g, "");
}

function getEditorTextLength() {
  let length = 0;
  const walker = document.createTreeWalker(noteContent, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) length += node.textContent.length;
    else if (node instanceof HTMLElement && node.tagName === "BR") length += 1;
  }
  return length;
}

function trimEditorContent(maxLength) {
  let length = 0;
  const walker = document.createTreeWalker(noteContent, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof HTMLElement && node.tagName === "BR") {
      if (length >= maxLength) {
        const range = document.createRange();
        range.setStartBefore(node);
        range.setEnd(noteContent, noteContent.childNodes.length);
        range.deleteContents();
        return;
      }
      length += 1;
    } else if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent.length;
      if (length + textLength > maxLength) {
        const range = document.createRange();
        range.setStart(node, maxLength - length);
        range.setEnd(noteContent, noteContent.childNodes.length);
        range.deleteContents();
        return;
      }
      length += textLength;
    }
  }
}

function serializeNoteContent() {
  return `${NOTE_CONTENT_PREFIX}${sanitizeNoteContent(noteContent.innerHTML)}`;
}

function getHighlightedFragment(source, language, requireConfidence = false) {
  if (!window.hljs || !source) return null;
  const result = language === "auto"
    ? window.hljs.highlightAuto(source, CODE_LANGUAGE_IDS)
    : window.hljs.highlight(source, { language });
  if (requireConfidence
    && (!CODE_LANGUAGE_IDS.includes(result.language) || result.relevance < 2)) return null;

  const template = document.createElement("template");
  template.innerHTML = result.value;
  const fragment = document.createDocumentFragment();
  const appendSafeNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(document.createTextNode(node.nodeValue));
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "SPAN") {
      const tokenClasses = Array.from(node.classList).filter((className) => /^hljs-[a-z0-9_-]+$/i.test(className));
      if (tokenClasses.length) {
        const token = document.createElement("span");
        token.classList.add(...tokenClasses);
        node.childNodes.forEach((child) => appendSafeNode(child, token));
        parent.append(token);
        return;
      }
    }
    node.childNodes.forEach((child) => appendSafeNode(child, parent));
  };
  template.content.childNodes.forEach((node) => appendSafeNode(node, fragment));
  return fragment;
}

function getImmediateCodeLanguage(text) {
  const immediateLanguages = [
    { language: "typescript", pattern: /^\s*(?:interface|type)\b/ },
    { language: "javascript", pattern: /^\s*(?:const|let|var|function|return|import|export|async|await|class|if|for|while)\b/ },
    { language: "python", pattern: /^\s*(?:def|from|print|elif|self)\b/ },
    { language: "sql", pattern: /^\s*(?:select|insert|update|delete|create|where)\b/i },
    { language: "bash", pattern: /^\s*(?:echo|cd|sudo|npm|node|git)\b/ },
    { language: "xml", pattern: /^\s*<\/?[a-z][^>]*>/i },
  ];
  return immediateLanguages.find(({ pattern }) => pattern.test(text))?.language || "";
}

function isLikelyCode(text) {
  if (getImmediateCodeLanguage(text)) return true;
  if ((text.match(/<\/?[a-z][^>]*>/gi) || []).length >= 2) return true;
  const signals = [
    /(?:=>|->|===?|!==?|&&|\|\||\+\+|--|:=)/,
    /[{}[\]();]/,
    /\b(?:const|let|var|function|return|import|from|def|class|if|for|while|select|from|where|print|console)\b/i,
    /<\/?[a-z][^>]*>/i,
  ];
  return signals.filter((signal) => signal.test(text)).length >= 2;
}

function highlightAutomaticTextNode(node) {
  const text = node.nodeType === Node.TEXT_NODE
    ? node.textContent
    : getPlainTextFromRichContent(node);
  if (!text || text.length > NOTE_MAX_LENGTH || !isLikelyCode(text)) return false;
  const immediateLanguage = getImmediateCodeLanguage(text);
  const fragment = immediateLanguage
    ? getHighlightedFragment(text, immediateLanguage)
    : getHighlightedFragment(text, "auto", true);
  if (!fragment) return false;
  if (node.nodeType === Node.TEXT_NODE) node.replaceWith(fragment);
  else node.replaceChildren(fragment);
  return true;
}

function updateSyntaxHighlights() {
  if (noteFindPanel && !noteFindPanel.hidden) return false;
  const overlay = noteContent.cloneNode(true);
  let highlightedCount = 0;

  overlay.querySelectorAll("code[data-language]").forEach((code) => {
    const fragment = getHighlightedFragment(code.textContent, code.dataset.language);
    if (fragment) {
      code.replaceChildren(fragment);
      highlightedCount += 1;
    }
  });

  function highlightAutomaticBlocks(parent) {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (highlightAutomaticTextNode(node)) highlightedCount += 1;
        return;
      }
      if (!(node instanceof HTMLElement) || node.tagName === "CODE") return;
      if (["DIV", "P"].includes(node.tagName)) {
        const hasNestedElements = Array.from(node.children).some((child) => child.tagName !== "BR");
        if (!hasNestedElements) {
          if (highlightAutomaticTextNode(node)) highlightedCount += 1;
          return;
        }
      }
      highlightAutomaticBlocks(node);
    });
  }

  highlightAutomaticBlocks(overlay);
  noteContentHighlights.replaceChildren(...Array.from(overlay.childNodes));
  noteContent.classList.toggle("is-syntax-highlighted", highlightedCount > 0);
  noteContentHighlights.hidden = highlightedCount === 0;
  noteContentHighlights.style.transform = `translate(${-noteContent.scrollLeft}px, ${-noteContent.scrollTop}px)`;
  return highlightedCount > 0;
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
  const searchableText = normalizeSearchText(`${note.title || ""}\n${getNoteContentText(note.content)}`);
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

async function readRemoteOpenTabState() {
  const { data, error } = await client
    .from(OPEN_TAB_STATE_TABLE)
    .select("note_ids, active_note_id")
    .eq("user_id", currentUser.id)
    .maybeSingle();
  if (error) {
    setGlobalStatus(`No se pudieron sincronizar las pestañas abiertas: ${error.message}`, true);
    return null;
  }
  if (!data) return null;
  if (!Array.isArray(data.note_ids)
    || !data.note_ids.every((noteId) => typeof noteId === "string")
    || (data.active_note_id !== null && typeof data.active_note_id !== "string")) {
    setGlobalStatus("No se pudieron sincronizar las pestañas abiertas: el estado guardado no es válido.", true);
    return null;
  }
  return {
    noteIds: [...new Set(data.note_ids)],
    activeNoteId: data.active_note_id,
  };
}

function saveOpenNoteState() {
  try {
    localStorage.setItem(openTabsKey(), JSON.stringify(openNoteIds));
  } catch (error) {
    setGlobalStatus(`No se pudieron guardar las pestañas abiertas: ${error.message}`, true);
  }

  if (!currentUser) return;
  const state = {
    user_id: currentUser.id,
    note_ids: [...openNoteIds],
    active_note_id: activeNoteId,
  };
  openTabSaveQueue = openTabSaveQueue.then(async () => {
    const { error } = await client
      .from(OPEN_TAB_STATE_TABLE)
      .upsert(state, { onConflict: "user_id" });
    if (error) throw error;
  }).catch((error) => {
    setGlobalStatus(`No se pudieron sincronizar las pestañas abiertas: ${error.message}`, true);
  });
}

function readSharedNotesKey() {
  return `${READ_SHARED_NOTES_PREFIX}-${currentUser?.id}`;
}

function loadReadSharedNoteIds(sharedNoteIds) {
  let savedIds;
  try {
    const savedValue = localStorage.getItem(readSharedNotesKey());
    savedIds = savedValue === null ? [] : JSON.parse(savedValue);
  } catch (error) {
    setGlobalStatus(`No se pudo leer el estado de notas compartidas: ${error.message}`, true);
    readSharedNoteIds = new Set();
    return;
  }
  if (!Array.isArray(savedIds) || !savedIds.every((noteId) => typeof noteId === "string")) {
    setGlobalStatus("No se pudo leer el estado de notas compartidas: el formato guardado no es válido.", true);
    readSharedNoteIds = new Set();
    return;
  }
  readSharedNoteIds = new Set(savedIds.filter((noteId) => sharedNoteIds.has(noteId)));
}

function saveReadSharedNoteIds() {
  try {
    localStorage.setItem(readSharedNotesKey(), JSON.stringify([...readSharedNoteIds]));
  } catch (error) {
    setGlobalStatus(`No se pudo guardar el estado de notas compartidas: ${error.message}`, true);
  }
}

function updateSharedNotesCount() {
  const unreadCount = loadedNotes.filter((note) => !isNoteOwner(note) && !readSharedNoteIds.has(note.id)).length;
  sharedNotesCount.textContent = String(unreadCount);
  sharedNotesCount.hidden = unreadCount === 0;
  openSharedNotes.setAttribute(
    "aria-label",
    unreadCount ? `Compartidas, ${unreadCount} ${unreadCount === 1 ? "nota nueva" : "notas nuevas"}` : "Compartidas",
  );
}

function markSharedNoteAsRead(note) {
  if (isNoteOwner(note) || readSharedNoteIds.has(note.id)) return;
  readSharedNoteIds.add(note.id);
  saveReadSharedNoteIds();
  updateSharedNotesCount();
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
    const sharedWithMe = note.user_id !== currentUser?.id;
    const title = note.title?.trim() || "Nota sin título";
    const meta = sharedWithMe ? '<span class="note-tab__meta">Compartida contigo</span>' : "";
    return `
      <div class="note-tab-item${note.id === activeNoteId ? " is-active" : ""}${sharedWithMe ? " is-shared-with-me" : ""}" role="presentation">
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

  updateSharedNotesCount();
  libraryTitle.textContent = searching
    ? "Buscar notas"
    : `${showingShared ? "Compartidas" : "Mis notas"} (${visibleNotes.length})`;
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
    const isNewSharedNote = showingShared && !owned && !readSharedNoteIds.has(note.id);
    const title = note.title?.trim() || "Nota sin título";
    let meta = formatNoteDate(note.note_date);
    let removeAction = activeSection === "my-notes" && owned ? "Eliminar" : "";
    let preview = "";
    if (searching) {
      meta = owned
        ? (outgoingShareIds.has(note.id) ? "Compartida por ti" : "Tu nota")
        : `Compartida por ${shareOwners.get(note.id) || "otro usuario"}`;
      const content = getNoteContentText(note.content).trim().replace(/\s+/g, " ");
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
        <button class="notes-library-item__open" type="button" data-open-note-id="${escapeHtml(note.id)}" aria-label="Abrir ${escapeHtml(title)}${isNewSharedNote ? ", nueva" : ""}">
          <span class="notes-library-item__title">${escapeHtml(title)}</span>
          ${isNewSharedNote ? '<span class="notes-library-item__new">Nueva</span>' : ""}
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
  if (section !== "editor" && !noteFindPanel.hidden) closeNoteFind(false);
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

function updateNoteFindHighlights() {
  if (noteFindPanel.hidden) {
    noteFindMatches = [];
    updateSyntaxHighlights();
    return;
  }

  noteContent.classList.remove("is-syntax-highlighted");
  const query = noteFindInput.value;
  const content = getPlainTextFromRichContent(noteContent);
  noteFindMatches = [];
  noteContentHighlights.replaceChildren();

  const richOverlay = document.createDocumentFragment();
  noteContent.childNodes.forEach((node) => richOverlay.appendChild(node.cloneNode(true)));
  const richRoot = document.createElement("div");
  richRoot.appendChild(richOverlay);

  if (!query) {
    noteContentHighlights.append(...Array.from(richRoot.childNodes));
    noteFindCount.textContent = "0 de 0";
    noteFindPrevious.disabled = true;
    noteFindNext.disabled = true;
    return;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(escapedQuery, "gi");
  let match;
  while ((match = matcher.exec(content)) !== null) {
    noteFindMatches.push({ start: match.index, end: match.index + match[0].length });
  }

  noteFindCurrent = Math.min(noteFindCurrent, Math.max(noteFindMatches.length - 1, 0));
  noteContentHighlights.append(...Array.from(richRoot.childNodes));

  let plainTextOffset = 0;
  let plainTextEndsWithNewline = false;
  const textNodes = [];
  function collectTextRanges(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const start = plainTextOffset;
      plainTextOffset += node.nodeValue.length;
      plainTextEndsWithNewline = node.nodeValue.endsWith("\n");
      textNodes.push({ node, start, end: plainTextOffset });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "BR") {
      plainTextOffset += 1;
      plainTextEndsWithNewline = true;
      return;
    }
    const start = plainTextOffset;
    Array.from(node.childNodes).forEach(collectTextRanges);
    if (["DIV", "P"].includes(node.tagName) && plainTextOffset > start && !plainTextEndsWithNewline) {
      plainTextOffset += 1;
      plainTextEndsWithNewline = true;
    }
  }
  Array.from(noteContentHighlights.childNodes).forEach(collectTextRanges);

  textNodes.forEach(({ node, start, end }) => {
    if (!node.nodeValue || start === end) return;
    const segments = [];
    let textFrom = start;
    noteFindMatches.forEach((match, index) => {
      const overlapStart = Math.max(start, match.start);
      const overlapEnd = Math.min(end, match.end);
      if (overlapStart >= overlapEnd) return;
      if (textFrom < overlapStart) {
        segments.push(document.createTextNode(node.nodeValue.slice(textFrom - start, overlapStart - start)));
      }
      const mark = document.createElement("mark");
      mark.dataset.findIndex = String(index);
      mark.textContent = node.nodeValue.slice(overlapStart - start, overlapEnd - start);
      if (index === noteFindCurrent) mark.classList.add("is-current");
      segments.push(mark);
      textFrom = overlapEnd;
    });
    if (textFrom < end) {
      segments.push(document.createTextNode(node.nodeValue.slice(textFrom - start)));
    }
    if (segments.length > 0) node.replaceWith(...segments);
  });
  noteFindCount.textContent = noteFindMatches.length
    ? `${noteFindCurrent + 1} de ${noteFindMatches.length}`
    : "No hay resultados";
  noteFindPrevious.disabled = noteFindMatches.length === 0;
  noteFindNext.disabled = noteFindMatches.length === 0;
  noteContentHighlights.style.transform = `translate(${-noteContent.scrollLeft}px, ${-noteContent.scrollTop}px)`;
}

function openNoteFind() {
  if (!currentNote()) return false;
  noteFindPanel.hidden = false;
  noteContentHighlights.hidden = false;
  noteContent.classList.add("is-find-open");
  noteFindCurrent = 0;
  updateNoteFindHighlights();
  noteFindInput.focus();
  noteFindInput.select();
  return true;
}

function closeNoteFind(restoreFocus = true) {
  noteFindPanel.hidden = true;
  noteContentHighlights.hidden = true;
  noteContent.classList.remove("is-find-open");
  noteFindInput.value = "";
  updateNoteFindHighlights();
  if (restoreFocus && activeSection === "editor" && !noteEditor.hidden) noteContent.focus();
}

function moveNoteFindMatch(direction) {
  if (noteFindMatches.length < 1) return;
  noteFindCurrent = (noteFindCurrent + direction + noteFindMatches.length) % noteFindMatches.length;
  updateNoteFindHighlights();
  const mark = noteContentHighlights.querySelector(`[data-find-index="${noteFindCurrent}"]`);
  if (!mark) return;
  const textareaRect = noteContent.getBoundingClientRect();
  const matchRect = mark.getBoundingClientRect();
  noteContent.scrollTop = Math.max(
    0,
    Math.min(
      noteContent.scrollHeight - noteContent.clientHeight,
      noteContent.scrollTop + matchRect.top - textareaRect.top - noteContent.clientHeight * 0.35,
    ),
  );
  noteContentHighlights.style.transform = `translate(${-noteContent.scrollLeft}px, ${-noteContent.scrollTop}px)`;
}

async function handleGlobalKeydown(event) {
  if (
    event.key === "F5"
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey
    && !event.shiftKey
    && !event.repeat
    && activeSection === "editor"
    && document.activeElement === noteContent
    && !shareDialog.open
    && !confirmDialog.open
  ) {
    if (insertShortDateTime()) event.preventDefault();
    return;
  }

  if (
    (event.ctrlKey || event.metaKey)
    && !event.altKey
    && event.key.toLowerCase() === "y"
    && !noteFindPanel.hidden
    && activeSection === "editor"
    && !shareDialog.open
    && !confirmDialog.open
  ) {
    const focusedElement = document.activeElement;
    const editTarget = focusedElement === noteTitle ? noteTitle : noteContent;
    if (editTarget.disabled) return;
    event.preventDefault();
    editTarget.focus();
    document.execCommand("redo");
    if (focusedElement !== editTarget && focusedElement instanceof HTMLElement) focusedElement.focus();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "f") {
    if (!currentUser || shareDialog.open || confirmDialog.open) return;
    event.preventDefault();
    if (activeSection === "editor" && openNoteFind()) return;
    await openNoteSearch();
    return;
  }

  if (noteFindPanel.hidden === false && event.key === "Escape") {
    event.preventDefault();
    closeNoteFind();
    return;
  }

  if (noteFindPanel.hidden === false && event.key === "F3") {
    event.preventDefault();
    moveNoteFindMatch(event.shiftKey ? -1 : 1);
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

function getNoteSharingStatus(note) {
  if (!isNoteOwner(note)) {
    return `· Compartida por ${shareOwners.get(note.id) || "Usuario"}`;
  }
  const usernames = (ownerShares.get(note.id) || [])
    .map((share) => share.recipient_username || share.recipient_email || "Usuario");
  return usernames.length ? `· Compartida con ${usernames.join(", ")}` : "";
}

function renderEditor() {
  const note = currentNote();
  if (note) markSharedNoteAsRead(note);
  fontSizeOption.setAttribute("aria-disabled", String(!note || !canEditNote(note)));
  emptyState.hidden = Boolean(note);
  noteEditor.hidden = !note;
  if (!note) {
    noteSharingStatus.textContent = "";
    noteSharingStatus.removeAttribute("title");
    draftNotice.hidden = true;
    sharingSection.hidden = true;
    noteFindPanel.hidden = true;
    noteContentHighlights.hidden = true;
    noteContent.classList.remove("is-find-open");
    noteContent.classList.remove("is-syntax-highlighted");
    return;
  }

  const editable = canEditNote(note);
  const owned = isNoteOwner(note);
  noteTitle.value = note.title || "";
  setNoteContent(note.content || "");
  noteTitle.disabled = !editable;
  noteContent.contentEditable = String(editable);
  noteContent.setAttribute("aria-readonly", String(!editable));
  noteDate.textContent = formatNoteDate(note.note_date);
  noteSharingStatus.textContent = getNoteSharingStatus(note);
  if (noteSharingStatus.textContent) noteSharingStatus.title = noteSharingStatus.textContent.slice(2);
  else noteSharingStatus.removeAttribute("title");
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
  noteFindCurrent = 0;
  updateNoteFindHighlights();
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
  const snapshot = { title: noteTitle.value, content: serializeNoteContent() };
  writeLocalDraft(note.id, { ...snapshot, savedAt: new Date().toISOString() });
  setSaveStatus("Cambios sin guardar");
  renderNoteList();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    queueNoteSave(note.id, snapshot, revision);
  }, 700);
}

function noteContentHasChanged(note) {
  const savedContent = note.content || "";
  if (savedContent.startsWith(NOTE_CONTENT_PREFIX)) {
    return serializeNoteContent() !== savedContent;
  }
  return readNoteContentText() !== getNoteContentText(savedContent);
}

async function flushNoteSave() {
  const note = currentNote();
  if (!note || !canEditNote(note)) return saveQueue;
  const hasPendingChanges = saveTimer !== null
    || noteTitle.value !== (note.title || "")
    || noteContentHasChanged(note);
  if (!hasPendingChanges) return saveQueue;
  window.clearTimeout(saveTimer);
  saveTimer = null;
  const revision = (noteRevisions.get(note.id) || 0) + 1;
  noteRevisions.set(note.id, revision);
  const snapshot = { title: noteTitle.value, content: serializeNoteContent() };
  writeLocalDraft(note.id, { ...snapshot, savedAt: new Date().toISOString() });
  return queueNoteSave(note.id, snapshot, revision);
}

function restoreDraft() {
  const note = currentNote();
  const draft = note && readLocalDraft(note.id);
  if (!note || !draft) return;
  noteTitle.value = draft.title;
  setNoteContent(draft.content);
  draftNotice.hidden = true;
  scheduleNoteSave();
}

function discardDraft() {
  const note = currentNote();
  if (!note) return;
  removeLocalDraft(note.id);
  draftNotice.hidden = true;
  noteTitle.value = note.title || "";
  setNoteContent(note.content || "");
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
  const incomingSharedNoteIds = new Set(
    loadedNotes.filter((note) => note.user_id !== currentUser.id).map((note) => note.id),
  );
  loadReadSharedNoteIds(incomingSharedNoteIds);
  const savedNoteIds = new Set(loadedNotes.map((note) => note.id));
  if (openTabsUserId !== currentUser.id) {
    openTabsUserId = currentUser.id;
    const savedState = await readRemoteOpenTabState();
    if (savedState) {
      openNoteIds = savedState.noteIds.filter((noteId) => savedNoteIds.has(noteId));
      activeNoteId = savedState.activeNoteId;
    } else {
      const savedOpenNoteIds = readOpenNoteIds();
      const firstOwnedNote = loadedNotes.find((note) => note.user_id === currentUser.id);
      openNoteIds = savedOpenNoteIds === null
        ? (firstOwnedNote ? [firstOwnedNote.id] : [])
        : savedOpenNoteIds.filter((noteId) => savedNoteIds.has(noteId));
    }
  } else {
    openNoteIds = openNoteIds.filter((noteId) => savedNoteIds.has(noteId));
  }
  if (!openNoteIds.includes(activeNoteId)) activeNoteId = openNoteIds[0] || null;
  saveOpenNoteState();
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
  activeNoteId = data.id;
  saveOpenNoteState();
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
  if (file.size > 60000) {
    throw new Error("El archivo es demasiado grande para importarlo como nota.");
  }

  const content = await file.text();
  if (content.includes("\u0000")) {
    throw new Error("El archivo contiene datos que no se pueden importar como texto.");
  }
  if (content.length > 20000) {
    throw new Error("El contenido supera el límite de 20,000 caracteres por nota.");
  }

  const title = file.name.replace(/\.txt$/i, "").trim().slice(0, 120) || "Archivo de texto";
  await createNote(title, content, "TXT importado");
}

async function deleteNoteRecord(note) {
  if (!note || !isNoteOwner(note)) return;
  const title = note.title?.trim() || "Nota sin título";
  const confirmed = await requestConfirmation({
    title: "Eliminar nota",
    message: `¿Eliminar "${title}"? Esta acción no se puede deshacer.`,
    confirmLabel: "Eliminar",
  });
  if (!confirmed) return;
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
  removeLocalDraft(note.id);
  if (activeNoteId === note.id) {
    activeNoteId = openNoteIds[0] || null;
  }
  saveOpenNoteState();
  renderNoteList();
  renderLibrarySection();
  renderEditor();
  setGlobalStatus("Nota eliminada.");
}

async function deleteCurrentNote() {
  await deleteNoteRecord(currentNote());
}

function closeShareSelect(root, restoreFocus = false) {
  const trigger = root.querySelector(".share-select__trigger");
  const options = root.querySelector(".share-select__options");
  root.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  options.hidden = true;
  if (restoreFocus) trigger.focus();
}

function positionShareSelectOptions(root) {
  const trigger = root.querySelector(".share-select__trigger");
  const options = root.querySelector(".share-select__options");
  const triggerRect = trigger.getBoundingClientRect();
  const viewportPadding = 8;
  const menuGap = 6;
  const menuWidth = Math.min(triggerRect.width, window.innerWidth - viewportPadding * 2);
  const menuLeft = Math.max(
    viewportPadding,
    Math.min(triggerRect.left, window.innerWidth - menuWidth - viewportPadding),
  );
  const desiredHeight = Math.min(230, window.innerHeight * 0.35, options.scrollHeight);
  const spaceBelow = window.innerHeight - triggerRect.bottom - menuGap - viewportPadding;
  const spaceAbove = triggerRect.top - menuGap - viewportPadding;
  const openAbove = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
  const availableSpace = Math.max(60, openAbove ? spaceAbove : spaceBelow);

  options.style.left = `${menuLeft}px`;
  options.style.width = `${menuWidth}px`;
  options.style.maxHeight = `${Math.min(desiredHeight, availableSpace)}px`;
  if (openAbove) {
    options.style.top = "auto";
    options.style.bottom = `${window.innerHeight - triggerRect.top + menuGap}px`;
  } else {
    options.style.top = `${triggerRect.bottom + menuGap}px`;
    options.style.bottom = "auto";
  }
}

function setShareSelectValue(selectId, value) {
  const root = document.querySelector(`[data-share-select="${selectId}"]`);
  const input = document.getElementById(selectId);
  const trigger = root.querySelector(".share-select__trigger");
  const valueLabel = document.getElementById(`${selectId}Value`);
  const options = root.querySelectorAll('[role="option"]');
  const selectedOption = Array.from(options).find((option) => option.dataset.value === value);
  input.value = value;
  valueLabel.textContent = selectedOption?.textContent || root.dataset.placeholder;
  trigger.removeAttribute("aria-invalid");
  options.forEach((option) => {
    option.setAttribute("aria-selected", String(option === selectedOption));
  });
}

function shareSelectHasOption(selectId, value) {
  const root = document.querySelector(`[data-share-select="${selectId}"]`);
  return Array.from(root.querySelectorAll('[role="option"]'))
    .some((option) => option.dataset.value === value);
}

function setShareSelectOptions(selectId, items) {
  const root = document.querySelector(`[data-share-select="${selectId}"]`);
  const options = root.querySelector(".share-select__options");
  options.replaceChildren();
  items.forEach(({ value, label }) => {
    const option = document.createElement("div");
    option.className = "share-select__option";
    option.id = `${selectId}Option${options.childElementCount}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;
    option.dataset.value = value;
    option.textContent = label;
    options.append(option);
  });
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "share-select__empty";
    empty.setAttribute("role", "presentation");
    empty.textContent = "No hay opciones disponibles.";
    options.append(empty);
  }
  const currentValue = document.getElementById(selectId).value;
  setShareSelectValue(
    selectId,
    items.some(({ value }) => value === currentValue) ? currentValue : "",
  );
}

function initializeShareSelect(selectId, placeholder, items, onSelect) {
  const root = document.querySelector(`[data-share-select="${selectId}"]`);
  const trigger = root.querySelector(".share-select__trigger");
  const options = root.querySelector(".share-select__options");
  root.dataset.placeholder = placeholder;
  setShareSelectOptions(selectId, items);

  trigger.addEventListener("click", () => {
    if (trigger.getAttribute("aria-expanded") === "true") {
      closeShareSelect(root);
      return;
    }
    document.querySelectorAll("[data-share-select].is-open").forEach((openRoot) => closeShareSelect(openRoot));
    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    options.hidden = false;
    positionShareSelectOptions(root);
    const selectedOption = options.querySelector('[aria-selected="true"]');
    (selectedOption || options.querySelector('[role="option"]'))?.focus();
  });
  window.addEventListener("resize", () => {
    if (trigger.getAttribute("aria-expanded") === "true") positionShareSelectOptions(root);
  });
  window.addEventListener("scroll", () => {
    if (trigger.getAttribute("aria-expanded") === "true") positionShareSelectOptions(root);
  }, true);

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    trigger.click();
  });

  options.addEventListener("click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option || !options.contains(option)) return;
    const value = option.dataset.value;
    setShareSelectValue(selectId, value);
    if (selectId === "shareUsername") {
      shareStatus.textContent = "";
      shareStatus.classList.remove("is-error");
    }
    closeShareSelect(root, true);
    if (selectId === "codeLanguageSelect") restoreEditorSelection();
    onSelect?.(value);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && trigger.getAttribute("aria-expanded") === "true") {
      closeShareSelect(root);
      return;
    }
    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      closeShareSelect(root, true);
      return;
    }
    const optionElements = Array.from(options.querySelectorAll('[role="option"]'));
    if (optionElements.length === 0) return;
    const currentIndex = optionElements.indexOf(event.target);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % optionElements.length;
    else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + optionElements.length) % optionElements.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = optionElements.length - 1;
    else if (event.key === "Enter" || event.key === " ") {
      if (currentIndex < 0) return;
      event.preventDefault();
      optionElements[currentIndex].click();
      return;
    } else return;
    event.preventDefault();
    optionElements[nextIndex].focus();
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) closeShareSelect(root);
  });
}

async function loadNoteUsers() {
  const { data, error } = await client.rpc("list_note_users");
  if (error) {
    shareStatus.textContent = `No se pudieron cargar los usuarios: ${error.message}`;
    shareStatus.classList.add("is-error");
    return false;
  }
  noteUsers = (data || []).map(({ username }) => username).filter(Boolean);
  setShareSelectOptions("shareUsername", noteUsers.map((username) => ({ value: username, label: username })));
  return true;
}

async function openShareDialog() {
  const note = currentNote();
  if (!note || !isNoteOwner(note)) return;
  shareStatus.textContent = "";
  shareStatus.classList.remove("is-error");
  setShareSelectValue("shareUsername", "");
  setShareSelectOptions("shareUsername", []);
  shareDialog.showModal();
  await loadNoteUsers();
}

async function submitShare(event) {
  event.preventDefault();
  const note = currentNote();
  if (!note || !isNoteOwner(note)) return;
  if (!document.getElementById("shareUsername").value) {
    shareStatus.textContent = "Selecciona un usuario para compartir la nota.";
    shareStatus.classList.add("is-error");
    document.getElementById("shareUsernameButton").setAttribute("aria-invalid", "true");
    document.getElementById("shareUsernameButton").focus();
    return;
  }
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
  const confirmed = await requestConfirmation({
    title: isOwner ? "Quitar acceso" : "Dejar de ver la nota",
    message: isOwner
      ? `¿Quieres quitarle el acceso a ${name}?`
      : "¿Quieres dejar de ver esta nota compartida?",
    confirmLabel: isOwner ? "Quitar acceso" : "Dejar de ver",
  });
  if (!confirmed) return;
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
  activeNoteId = note.id;
  saveOpenNoteState();
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
  if (activeNoteId === noteId) {
    activeNoteId = openNoteIds[Math.min(tabIndex, openNoteIds.length - 1)] || null;
  }
  saveOpenNoteState();
  renderNoteList();
  renderEditor();
  const activeTab = notesList.querySelector('[role="tab"][aria-selected="true"]');
  (activeTab || openMyNotes).focus();
}

themeToggles.forEach((toggle) => toggle.addEventListener("click", toggleTheme));
initializeTheme();
settingsButton.addEventListener("click", () => {
  const willOpen = settingsMenu.hidden;
  settingsMenu.hidden = !willOpen;
  settingsButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) fontSizeOption.focus();
  else fontSizeOption.setAttribute("aria-expanded", "false");
});

function getEditorSelectionRange() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  return noteContent.contains(range.startContainer) && noteContent.contains(range.endContainer)
    ? range.cloneRange()
    : null;
}

function insertShortDateTime() {
  const note = currentNote();
  const range = getEditorSelectionRange();
  if (!note || !canEditNote(note) || !range) return false;

  const text = shortDateTimeFormatter.format(new Date());
  const availableLength = Math.max(0, NOTE_MAX_LENGTH - getEditorTextLength() + range.toString().length);
  if (text.length > availableLength) {
    setGlobalStatus("El contenido de la nota admite hasta 20 000 caracteres.", true);
    return true;
  }

  const selection = window.getSelection();
  range.deleteContents();
  const insertedText = document.createTextNode(text);
  range.insertNode(insertedText);
  range.setStartAfter(insertedText);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditorSelection();
  noteContent.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function restoreEditorSelection(range = savedEditorSelection) {
  if (!range
    || !noteContent.contains(range.startContainer)
    || !noteContent.contains(range.endContainer)) return;
  if (!fontSizeDialog.open) noteContent.focus();
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range.cloneRange());
}

function getFormattingRange() {
  const savedRange = savedEditorSelection
    && noteContent.contains(savedEditorSelection.startContainer)
    && noteContent.contains(savedEditorSelection.endContainer)
    ? savedEditorSelection.cloneRange()
    : null;
  const range = getEditorSelectionRange() || savedRange || document.createRange();
  if (!range.collapsed) return range;
  range.selectNodeContents(noteContent);
  return range;
}

function saveEditorSelection() {
  savedEditorSelection = getEditorSelectionRange();
  updateFormatToolbarState();
}

function removeInlineStyle(fragment, property) {
  fragment.querySelectorAll("span[style]").forEach((span) => {
    span.style.removeProperty(property);
    if (!span.getAttribute("style")) span.removeAttribute("style");
  });
}

function getFullSelectionSpan(range) {
  const selectedText = range.toString();
  let element = range.commonAncestorContainer instanceof Element
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  while (element && element !== noteContent) {
    if (element.tagName === "SPAN"
      && !element.querySelector("br")
      && element.textContent === selectedText) return element;
    element = element.parentElement;
  }
  return null;
}

function getFormattingAncestor(node, tagNames) {
  let element = node instanceof Element ? node : node.parentElement;
  while (element && element !== noteContent) {
    if (tagNames.includes(element.tagName)) return element;
    element = element.parentElement;
  }
  return null;
}

function applyCodeFormatting() {
  restoreEditorSelection();
  const range = getEditorSelectionRange() || savedEditorSelection?.cloneRange();
  if (!range || range.collapsed) {
    setGlobalStatus("Selecciona el código que quieres resaltar.", true);
    return;
  }

  const language = codeLanguageSelect.value;
  const existingCode = getFormattingAncestor(range.startContainer, ["CODE"]);
  if (existingCode && existingCode.contains(range.endContainer)) {
    if (language === "plain") {
      const plainText = document.createTextNode(existingCode.textContent);
      existingCode.replaceWith(plainText);
      range.selectNodeContents(plainText);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      saveEditorSelection();
      noteContent.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    existingCode.dataset.language = language;
    saveEditorSelection();
    noteContent.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  if (language === "plain") {
    setGlobalStatus("Selecciona un bloque de código para quitar su formato.", true);
    return;
  }

  const selectedText = getPlainTextFromRichContent(range.cloneContents());
  if (!selectedText) {
    setGlobalStatus("Selecciona el código que quieres resaltar.", true);
    return;
  }

  range.deleteContents();
  const code = document.createElement("code");
  code.dataset.language = language;
  code.textContent = selectedText;
  range.insertNode(code);
  range.selectNodeContents(code);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditorSelection();
  noteContent.dispatchEvent(new Event("input", { bubbles: true }));
}

function isRangeFormatted(range, tagNames) {
  const startAncestor = getFormattingAncestor(range.startContainer, tagNames);
  if (startAncestor && startAncestor === getFormattingAncestor(range.endContainer, tagNames)) return true;
  const contents = range.cloneContents();
  const walker = document.createTreeWalker(contents, NodeFilter.SHOW_TEXT);
  let hasText = false;
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent) continue;
    hasText = true;
    if (!getFormattingAncestor(walker.currentNode, tagNames)) return false;
  }
  return hasText;
}

function applyInlineStyle(property, value) {
  restoreEditorSelection();
  const range = getFormattingRange();
  if (range.collapsed) return;
  const existingSpan = getFullSelectionSpan(range);
  if (existingSpan) {
    if (value) existingSpan.style.setProperty(property, value);
    else existingSpan.style.removeProperty(property);
    if (!existingSpan.getAttribute("style")) existingSpan.removeAttribute("style");
    saveEditorSelection();
    noteContent.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  const contents = range.extractContents();
  removeInlineStyle(contents, property);
  const wrapper = document.createElement("span");
  if (value) wrapper.style.setProperty(property, value);
  wrapper.append(contents);
  range.insertNode(wrapper);
  range.selectNodeContents(wrapper);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditorSelection();
  noteContent.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyToggleFormat(command) {
  restoreEditorSelection();
  const range = getFormattingRange();
  if (range.collapsed) return;
  const tagNames = command === "bold" ? ["B", "STRONG"] : command === "italic" ? ["I", "EM"] : ["U"];
  const alreadyFormatted = isRangeFormatted(range, tagNames);
  const sharedWrapper = alreadyFormatted
    ? getFormattingAncestor(range.startContainer, tagNames)
    : null;
  const contents = range.extractContents();
  if (alreadyFormatted) {
    Array.from(contents.querySelectorAll(tagNames.join(","))).reverse().forEach((element) => {
      element.replaceWith(...Array.from(element.childNodes));
    });
    const firstSelected = contents.firstChild;
    const lastSelected = contents.lastChild;
    if (sharedWrapper && sharedWrapper.isConnected) {
      const point = range.cloneRange();
      const beforeRange = document.createRange();
      const afterRange = document.createRange();
      let before = document.createDocumentFragment();
      let after = document.createDocumentFragment();
      if (sharedWrapper.contains(point.startContainer)) {
        beforeRange.selectNodeContents(sharedWrapper);
        beforeRange.setEnd(point.startContainer, point.startOffset);
        before = beforeRange.cloneContents();
        afterRange.selectNodeContents(sharedWrapper);
        afterRange.setStart(point.startContainer, point.startOffset);
        after = afterRange.cloneContents();
      }
      const replacement = document.createDocumentFragment();
      if (before.textContent || before.querySelector("br")) {
        const beforeWrapper = sharedWrapper.cloneNode(false);
        beforeWrapper.append(before);
        replacement.append(beforeWrapper);
      }
      replacement.append(contents);
      if (after.textContent || after.querySelector("br")) {
        const afterWrapper = sharedWrapper.cloneNode(false);
        afterWrapper.append(after);
        replacement.append(afterWrapper);
      }
      sharedWrapper.replaceWith(replacement);
    } else {
      range.insertNode(contents);
    }
    if (firstSelected && lastSelected) {
      range.setStartBefore(firstSelected);
      range.setEndAfter(lastSelected);
    }
  } else {
    const wrapper = document.createElement(command === "bold" ? "strong" : command === "italic" ? "em" : "u");
    wrapper.append(contents);
    range.insertNode(wrapper);
    range.selectNodeContents(wrapper);
  }
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditorSelection();
  noteContent.dispatchEvent(new Event("input", { bubbles: true }));
}

function rangeHasFormat(range, command) {
  const tagNames = command === "bold" ? ["B", "STRONG"] : command === "italic" ? ["I", "EM"] : ["U"];
  return isRangeFormatted(range, tagNames);
}

function updateFormatToolbarState() {
  if (!fontSizeDialog.open) return;
  const range = getEditorSelectionRange() || savedEditorSelection;
  const parent = range?.commonAncestorContainer;
  const element = parent instanceof Element ? parent : parent?.parentElement;
  const style = element && noteContent.contains(element) ? getComputedStyle(element) : null;
  const code = range && getFormattingAncestor(range.startContainer, ["CODE"]);
  const codeLanguage = code && shareSelectHasOption("codeLanguageSelect", code.dataset.language)
    ? code.dataset.language
    : "auto";
  setShareSelectValue("codeLanguageSelect", codeLanguage);
  const fontFamily = style
    ? NOTE_FONT_FAMILIES.find((family) => family.replace(/["']/g, "").toLowerCase() === style.fontFamily.replace(/["']/g, "").toLowerCase()) || NOTE_FONT_FAMILIES[0]
    : NOTE_FONT_FAMILIES[0];
  setShareSelectValue("fontFamilySelect", fontFamily);
  const size = style ? `${Math.round(parseFloat(style.fontSize))}px` : "";
  setShareSelectValue("fontSizeSelect", shareSelectHasOption("fontSizeSelect", size) ? size : "16px");
  formatToolbar.querySelectorAll("[data-format-command]").forEach((button) => {
    let pressed = false;
    if (range && noteContent.contains(range.startContainer)) {
      pressed = rangeHasFormat(range, button.dataset.formatCommand);
    }
    button.setAttribute("aria-pressed", String(pressed));
  });
}

function openFormatDialog() {
  if (fontSizeOption.getAttribute("aria-disabled") === "true") return;
  pendingFormatContent = noteContent.innerHTML;
  const activeSelection = getEditorSelectionRange();
  const savedSelectionIsActive = savedEditorSelection
    && noteContent.contains(savedEditorSelection.startContainer)
    && noteContent.contains(savedEditorSelection.endContainer);
  pendingEditorSelection = activeSelection || (savedSelectionIsActive ? savedEditorSelection.cloneRange() : null);
  savedEditorSelection = pendingEditorSelection?.cloneRange() || null;
  fontSizeOption.setAttribute("aria-expanded", "false");
  settingsMenu.hidden = true;
  settingsButton.setAttribute("aria-expanded", "false");
  fontSizeDialog.showModal();
  updateFormatToolbarState();
  document.getElementById("fontSizeSelectButton").focus();
}

fontSizeOption.addEventListener("click", openFormatDialog);
formatToolbar.querySelectorAll("[data-format-command]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => event.preventDefault());
  button.addEventListener("click", () => applyToggleFormat(button.dataset.formatCommand));
});
applyCodeFormat.addEventListener("pointerdown", (event) => event.preventDefault());
applyCodeFormat.addEventListener("click", applyCodeFormatting);

if (!("focusGroup" in HTMLElement.prototype)) {
  const toolbarItems = Array.from(formatToolbar.querySelectorAll("button"));
  toolbarItems.forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1;
  });
  formatToolbar.addEventListener("focusin", (event) => {
    if (!toolbarItems.includes(event.target)) return;
    toolbarItems.forEach((item) => {
      item.tabIndex = item === event.target ? 0 : -1;
    });
  });
  formatToolbar.addEventListener("keydown", (event) => {
    const rtl = getComputedStyle(formatToolbar).direction === "rtl";
    const steps = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    const step = steps[event.key];
    const currentIndex = toolbarItems.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (step) nextIndex = (currentIndex + step + toolbarItems.length) % toolbarItems.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = toolbarItems.length - 1;
    else return;
    event.preventDefault();
    toolbarItems[nextIndex].focus();
  });
}

function closeFormatDialog(saveChanges) {
  const contentChanged = noteContent.innerHTML !== pendingFormatContent;
  const selectionToRestore = saveChanges ? savedEditorSelection : pendingEditorSelection;
  if (saveChanges && contentChanged) scheduleNoteSave();
  if (!saveChanges && pendingFormatContent !== null) {
    noteContent.innerHTML = pendingFormatContent;
    updateNoteFindHighlights();
  }
  pendingFormatContent = null;
  savedEditorSelection = selectionToRestore;
  pendingEditorSelection = null;
  fontSizeDialog.close();
  if (currentNote()) {
    noteContent.focus();
    restoreEditorSelection(savedEditorSelection);
  } else {
    settingsButton.focus();
  }
}

cancelFontSize.addEventListener("click", () => closeFormatDialog(false));
confirmFontSize.addEventListener("click", () => closeFormatDialog(true));
fontSizeDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeFormatDialog(false);
});
document.addEventListener("selectionchange", () => {
  const range = getEditorSelectionRange();
  if (range) savedEditorSelection = range;
  if (fontSizeDialog.open) updateFormatToolbarState();
});
findInNote.addEventListener("click", openNoteFind);
document.addEventListener("click", (event) => {
  if (settingsMenu.hidden || event.target.closest(".settings-control")) return;
  settingsMenu.hidden = true;
  settingsButton.setAttribute("aria-expanded", "false");
  fontSizeOption.setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsMenu.hidden) {
    settingsMenu.hidden = true;
    settingsButton.setAttribute("aria-expanded", "false");
    settingsButton.focus();
  }
});
initializeShareSelect("fontFamilySelect", "Predeterminada", [
  { value: NOTE_FONT_FAMILIES[0], label: "Predeterminada" },
  { value: NOTE_FONT_FAMILIES[1], label: "Arial" },
  { value: NOTE_FONT_FAMILIES[2], label: "Aptos (Cuerpo)" },
  { value: NOTE_FONT_FAMILIES[3], label: "Calibri" },
  { value: NOTE_FONT_FAMILIES[4], label: "Georgia" },
  { value: NOTE_FONT_FAMILIES[5], label: "Verdana" },
  { value: NOTE_FONT_FAMILIES[6], label: "Courier New" },
], (value) => applyInlineStyle("font-family", value));
initializeShareSelect("fontSizeSelect", "16", [
  "8px", "9px", "10px", "11px", "12px", "13px", "14px", "16px",
  "18px", "20px", "22px", "24px", "26px", "28px", "32px", "36px", "48px", "72px",
].map((value) => ({ value, label: value.slice(0, -2) })), (value) => applyInlineStyle("font-size", value));
initializeShareSelect("codeLanguageSelect", "Detectar lenguaje", [
  { value: "plain", label: "Texto normal" },
  { value: "auto", label: "Detectar lenguaje" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "xml", label: "HTML / XML" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
]);
initializeShareSelect("shareUsername", "Selecciona un usuario", []);
initializeShareSelect("sharePermission", "Selecciona un permiso", [
  { value: "view", label: "Solo lectura" },
  { value: "edit", label: "Puede editar" },
]);
cancelConfirmation.addEventListener("click", () => finishConfirmation(false));
acceptConfirmation.addEventListener("click", () => finishConfirmation(true));
confirmDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishConfirmation(false);
});
confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) finishConfirmation(false);
});

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
      persistSession: false,
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
  noteContent.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const selection = window.getSelection();
    const range = getEditorSelectionRange() || document.createRange();
    if (readNoteContentText().length >= NOTE_MAX_LENGTH && range.collapsed) return;
    range.deleteContents();
    const tab = document.createTextNode("\t");
    range.insertNode(tab);
    range.setStartAfter(tab);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveEditorSelection();
    noteContent.dispatchEvent(new Event("input", { bubbles: true }));
  });
  noteContent.addEventListener("input", () => {
    if (getEditorTextLength() > NOTE_MAX_LENGTH) {
      trimEditorContent(NOTE_MAX_LENGTH);
      setGlobalStatus("El contenido de la nota admite hasta 20 000 caracteres.", true);
    }
    if (!fontSizeDialog.open) scheduleNoteSave();
    if (!noteFindPanel.hidden) {
      noteFindCurrent = 0;
    }
    updateNoteFindHighlights();
  });
  noteContent.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text/plain") || "";
    const selection = window.getSelection();
    const range = getEditorSelectionRange();
    if (!range) return;
    const availableLength = Math.max(0, NOTE_MAX_LENGTH - readNoteContentText().length + range.toString().length);
    const text = pastedText.slice(0, availableLength);
    range.deleteContents();
    const pastedNode = document.createTextNode(text);
    range.insertNode(pastedNode);
    range.setStartAfter(pastedNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    noteContent.dispatchEvent(new Event("input", { bubbles: true }));
  });
  noteContent.addEventListener("copy", (event) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const selectedWithinEditor = commonAncestor === noteContent
      || (commonAncestor instanceof Node && noteContent.contains(commonAncestor));
    if (!selectedWithinEditor) return;

    const copiedFragment = range.cloneContents();
    const copiedRoot = document.createElement("div");
    copiedRoot.append(copiedFragment);
    const copiedText = getPlainTextFromRichContent(copiedRoot);
    if (!copiedText) return;

    event.preventDefault();
    event.clipboardData?.setData("text/plain", copiedText);
  });
  noteContent.addEventListener("keyup", saveEditorSelection);
  noteContent.addEventListener("mouseup", saveEditorSelection);
  noteContent.addEventListener("scroll", () => {
    noteContentHighlights.style.transform = `translate(${-noteContent.scrollLeft}px, ${-noteContent.scrollTop}px)`;
  }, { passive: true });
  noteFindInput.addEventListener("input", () => {
    noteFindCurrent = 0;
    updateNoteFindHighlights();
  });
  noteFindInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    moveNoteFindMatch(event.shiftKey ? -1 : 1);
  });
  noteFindPrevious.addEventListener("click", () => moveNoteFindMatch(-1));
  noteFindNext.addEventListener("click", () => moveNoteFindMatch(1));
  document.getElementById("closeNoteFind").addEventListener("click", closeNoteFind);
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
    saveOpenNoteState();
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
    saveOpenNoteState();
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
