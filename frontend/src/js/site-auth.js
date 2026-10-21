const siteAuthConfig = window.SUPABASE_CONFIG || {};
const siteAuthReady = Boolean(
  window.supabase?.createClient
  && siteAuthConfig.url
  && siteAuthConfig.anonKey
  && !siteAuthConfig.url.includes("TU-PROYECTO")
  && !siteAuthConfig.anonKey.includes("TU-ANON-KEY"),
);

const siteAuthScreen = document.createElement("section");
siteAuthScreen.className = "site-auth-screen";
siteAuthScreen.id = "siteAuthScreen";
siteAuthScreen.setAttribute("aria-labelledby", "siteAuthTitle");
siteAuthScreen.innerHTML = `
  <div class="site-auth-card">
    <h1 id="siteAuthTitle">Acceso al manual</h1>
    <p id="siteAuthDescription">Inicia sesion con el correo y contrasena que te proporciono el administrador.</p>
    <form class="site-auth-form" id="siteAuthForm">
      <label>Correo electronico
        <input id="siteAuthEmail" type="email" autocomplete="email" required />
      </label>
      <label id="siteAuthPasswordLabel">Contrasena
        <input id="siteAuthPassword" type="password" autocomplete="current-password" required />
      </label>
      <label id="siteAuthConfirmLabel" hidden>Confirmar contrasena
        <input id="siteAuthConfirm" type="password" autocomplete="new-password" />
      </label>
      <button class="site-auth-submit" id="siteAuthSubmit" type="submit">Iniciar sesion</button>
    </form>
    <button class="site-auth-link" id="siteAuthForgot" type="button">Olvide mi contrasena</button>
    <button class="site-auth-link" id="siteAuthBack" type="button" hidden>Volver al inicio de sesion</button>
    <p class="site-auth-status" id="siteAuthStatus" role="status"></p>
  </div>
`;
document.body.prepend(siteAuthScreen);

const siteAuthForm = document.getElementById("siteAuthForm");
const siteAuthEmail = document.getElementById("siteAuthEmail");
const siteAuthPassword = document.getElementById("siteAuthPassword");
const siteAuthConfirm = document.getElementById("siteAuthConfirm");
const siteAuthPasswordLabel = document.getElementById("siteAuthPasswordLabel");
const siteAuthConfirmLabel = document.getElementById("siteAuthConfirmLabel");
const siteAuthSubmit = document.getElementById("siteAuthSubmit");
const siteAuthForgot = document.getElementById("siteAuthForgot");
const siteAuthBack = document.getElementById("siteAuthBack");
const siteAuthDescription = document.getElementById("siteAuthDescription");
const siteAuthStatus = document.getElementById("siteAuthStatus");
let siteAuthMode = "login";

function setSiteAuthStatus(message, isError = false) {
  siteAuthStatus.textContent = message;
  siteAuthStatus.classList.toggle("is-error", isError);
}

function setSiteAuthMode(mode) {
  siteAuthMode = mode;
  const isRequest = mode === "request";
  const isUpdate = mode === "update";
  siteAuthScreen.hidden = false;
  siteAuthPasswordLabel.hidden = isRequest;
  siteAuthConfirmLabel.hidden = !isUpdate;
  siteAuthPassword.required = !isRequest;
  siteAuthConfirm.required = isUpdate;
  siteAuthForgot.hidden = mode !== "login";
  siteAuthBack.hidden = mode === "login";
  siteAuthSubmit.textContent = isRequest ? "Enviar enlace" : isUpdate ? "Guardar contrasena" : "Iniciar sesion";
  siteAuthDescription.textContent = isRequest
    ? "Escribe tu correo y te enviaremos un enlace para cambiar la contrasena."
    : isUpdate
      ? "Escribe y confirma tu nueva contrasena."
      : "Inicia sesion con el correo y contrasena que te proporciono el administrador.";
  siteAuthPassword.autocomplete = isUpdate ? "new-password" : "current-password";
  setSiteAuthStatus("");
}

window.bindSiteAuthButton = (signedIn) => {
  const button = document.getElementById("authButton");
  if (!button) return;
  button.innerHTML = `<span class="sidebar-auth__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M10 17l5-5-5-5M15 12H3M21 3v18" /></svg></span><span class="nav-label">${signedIn ? "Cerrar sesion" : "Iniciar sesion"}</span>`;
  button.title = signedIn ? "Cerrar sesion" : "Iniciar sesion";
  button.onclick = () => signedIn
    ? window.SUPABASE_AUTH_CLIENT.auth.signOut()
    : siteAuthEmail.focus();
};

function updateSiteAuthSession(session) {
  const signedIn = Boolean(session?.user);
  const isRecovery = siteAuthMode === "update";
  document.body.classList.remove("site-auth-pending");
  document.body.classList.toggle("site-auth-required", !signedIn || isRecovery);
  siteAuthScreen.hidden = signedIn && !isRecovery;
  window.bindSiteAuthButton(signedIn);
  if (!signedIn) siteAuthEmail.focus();
}

async function submitSiteAuth(event) {
  event.preventDefault();
  if (!siteAuthReady) {
    setSiteAuthStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
    return;
  }
  siteAuthSubmit.disabled = true;
  setSiteAuthStatus(siteAuthMode === "request" ? "Enviando enlace..." : "Procesando...");
  let error = null;
  if (siteAuthMode === "request") {
    ({ error } = await window.SUPABASE_AUTH_CLIENT.auth.resetPasswordForEmail(siteAuthEmail.value.trim(), {
      redirectTo: window.location.href.split("#")[0],
    }));
  } else if (siteAuthMode === "update") {
    if (siteAuthPassword.value !== siteAuthConfirm.value) {
      error = { message: "Las contrasenas no coinciden." };
    } else {
      ({ error } = await window.SUPABASE_AUTH_CLIENT.auth.updateUser({ password: siteAuthPassword.value }));
    }
  } else {
    ({ error } = await window.SUPABASE_AUTH_CLIENT.auth.signInWithPassword({
      email: siteAuthEmail.value.trim(),
      password: siteAuthPassword.value,
    }));
  }
  siteAuthSubmit.disabled = false;
  if (error) {
    setSiteAuthStatus(siteAuthMode === "login" ? "Correo o contrasena incorrectos." : error.message, true);
    return;
  }
  if (siteAuthMode === "request") {
    setSiteAuthStatus("Revisa tu correo y abre el enlace para cambiar tu contrasena.");
    siteAuthForm.reset();
  } else if (siteAuthMode === "update") {
    setSiteAuthMode("login");
    setSiteAuthStatus("Contrasena actualizada. Ya puedes continuar.");
    updateSiteAuthSession({ user: true });
  }
}

if (!siteAuthReady) {
  document.body.classList.remove("site-auth-pending");
  document.body.classList.add("site-auth-required");
  setSiteAuthStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
} else {
  window.SUPABASE_AUTH_CLIENT = window.supabase.createClient(siteAuthConfig.url, siteAuthConfig.anonKey);
  siteAuthForm.addEventListener("submit", submitSiteAuth);
  siteAuthForgot.addEventListener("click", () => setSiteAuthMode("request"));
  siteAuthBack.addEventListener("click", () => setSiteAuthMode("login"));
  window.SUPABASE_AUTH_CLIENT.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") setSiteAuthMode("update");
    updateSiteAuthSession(session);
  });
  window.SUPABASE_AUTH_CLIENT.auth.getSession().then(({ data, error }) => {
    if (error) setSiteAuthStatus("No se pudo recuperar la sesion.", true);
    updateSiteAuthSession(data?.session);
  });
}
