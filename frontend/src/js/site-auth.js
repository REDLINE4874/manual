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
    <div class="site-auth-brand">
      <img class="site-auth-logo" src="assets/icons/talent.svg" alt="Talent" />
     
    </div>
    <h1 id="siteAuthTitle">Iniciar sesion</h1>

    <div id="siteAuthLoginPanel">
      
      <form class="site-auth-form" id="siteAuthLoginForm">
        <label>Correo electronico
          <input id="siteAuthLoginEmail" type="email" autocomplete="email" required />
        </label>
        <label>Contrasena
          <input id="siteAuthLoginPassword" type="password" autocomplete="current-password" required />
        </label>
        <button class="site-auth-submit" type="submit">Iniciar sesion</button>
      </form>
      <button class="site-auth-link" id="siteAuthForgot" type="button">Olvide mi contrasena</button>
    </div>

    <div id="siteAuthRequestPanel" hidden>
      <p>Escribe tu correo y te enviaremos un enlace para cambiar la contrasena.</p>
      <form class="site-auth-form" id="siteAuthRequestForm">
        <label>Correo electronico
          <input id="siteAuthRequestEmail" type="email" autocomplete="email" required />
        </label>
        <button class="site-auth-submit" type="submit">Enviar enlace</button>
      </form>
      <button class="site-auth-link" id="siteAuthRequestBack" type="button">Volver al inicio de sesion</button>
    </div>

    <div id="siteAuthUpdatePanel" hidden>
      <p>Escribe y confirma tu nueva contrasena.</p>
      <form class="site-auth-form" id="siteAuthUpdateForm">
        <label>Contrasena nueva
          <input id="siteAuthNewPassword" type="password" autocomplete="new-password" required />
        </label>
        <label>Confirmar contrasena
          <input id="siteAuthConfirmPassword" type="password" autocomplete="new-password" required />
        </label>
        <button class="site-auth-submit" type="submit">Guardar contrasena</button>
      </form>
    </div>

    <p class="site-auth-status" id="siteAuthStatus" role="status"></p>
  </div>
`;
document.body.prepend(siteAuthScreen);

const siteAuthLoginPanel = document.getElementById("siteAuthLoginPanel");
const siteAuthRequestPanel = document.getElementById("siteAuthRequestPanel");
const siteAuthUpdatePanel = document.getElementById("siteAuthUpdatePanel");
const siteAuthLoginForm = document.getElementById("siteAuthLoginForm");
const siteAuthRequestForm = document.getElementById("siteAuthRequestForm");
const siteAuthUpdateForm = document.getElementById("siteAuthUpdateForm");
const siteAuthLoginEmail = document.getElementById("siteAuthLoginEmail");
const siteAuthLoginPassword = document.getElementById("siteAuthLoginPassword");
const siteAuthRequestEmail = document.getElementById("siteAuthRequestEmail");
const siteAuthNewPassword = document.getElementById("siteAuthNewPassword");
const siteAuthConfirmPassword = document.getElementById("siteAuthConfirmPassword");
const siteAuthForgot = document.getElementById("siteAuthForgot");
const siteAuthRequestBack = document.getElementById("siteAuthRequestBack");
const siteAuthStatus = document.getElementById("siteAuthStatus");
const siteAuthTitle = document.getElementById("siteAuthTitle");
let siteAuthRecovery = false;

function setSiteAuthStatus(message, isError = false) {
  siteAuthStatus.textContent = message;
  siteAuthStatus.classList.toggle("is-error", isError);
}

function showSiteAuthPanel(panel) {
  siteAuthLoginPanel.hidden = panel !== "login";
  siteAuthRequestPanel.hidden = panel !== "request";
  siteAuthUpdatePanel.hidden = panel !== "update";
  siteAuthTitle.textContent = panel === "update"
    ? "Cambiar contrasena"
    : panel === "request"
      ? "Recuperar contrasena"
      : "Iniciar sesion";
  setSiteAuthStatus("");

  if (panel === "login") siteAuthLoginEmail.focus();
  if (panel === "request") siteAuthRequestEmail.focus();
  if (panel === "update") siteAuthNewPassword.focus();
}

window.bindSiteAuthButton = (signedIn) => {
  const button = document.getElementById("authButton");
  if (!button) return;
  button.innerHTML = `<span class="sidebar-auth__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M10 17l5-5-5-5M15 12H3M21 3v18" /></svg></span><span class="nav-label">${signedIn ? "Cerrar sesion" : "Iniciar sesion"}</span>`;
  button.title = signedIn ? "Cerrar sesion" : "Iniciar sesion";
  button.onclick = () => signedIn
    ? window.SUPABASE_AUTH_CLIENT.auth.signOut()
    : showSiteAuthPanel("login");
};

function updateSiteAuthSession(session) {
  const signedIn = Boolean(session?.user);
  document.body.classList.remove("site-auth-pending");
  document.body.classList.toggle("site-auth-required", !signedIn);
  siteAuthScreen.hidden = signedIn && !siteAuthRecovery;
  window.bindSiteAuthButton(signedIn);
  if (!signedIn) showSiteAuthPanel("login");
}

async function submitSiteAuthLogin(event) {
  event.preventDefault();
  siteAuthRecovery = false;
  const submit = siteAuthLoginForm.querySelector("button[type=submit]");
  submit.disabled = true;
  setSiteAuthStatus("Iniciando sesion...");
  const { error } = await window.SUPABASE_AUTH_CLIENT.auth.signInWithPassword({
    email: siteAuthLoginEmail.value.trim(),
    password: siteAuthLoginPassword.value,
  });
  submit.disabled = false;
  if (error) setSiteAuthStatus("Correo o contrasena incorrectos.", true);
}

async function submitSiteAuthRequest(event) {
  event.preventDefault();
  const submit = siteAuthRequestForm.querySelector("button[type=submit]");
  submit.disabled = true;
  setSiteAuthStatus("Enviando enlace...");
  const { error } = await window.SUPABASE_AUTH_CLIENT.auth.resetPasswordForEmail(
    siteAuthRequestEmail.value.trim(),
    { redirectTo: window.location.href.split("#")[0] },
  );
  submit.disabled = false;
  if (error) {
    setSiteAuthStatus(error.message, true);
    return;
  }
  setSiteAuthStatus("Revisa tu correo y abre el enlace para cambiar tu contrasena.");
  siteAuthRequestForm.reset();
}

async function submitSiteAuthUpdate(event) {
  event.preventDefault();
  const submit = siteAuthUpdateForm.querySelector("button[type=submit]");
  if (siteAuthNewPassword.value !== siteAuthConfirmPassword.value) {
    setSiteAuthStatus("Las contrasenas no coinciden.", true);
    return;
  }
  submit.disabled = true;
  setSiteAuthStatus("Guardando contrasena...");
  const { error } = await window.SUPABASE_AUTH_CLIENT.auth.updateUser({
    password: siteAuthNewPassword.value,
  });
  submit.disabled = false;
  if (error) {
    setSiteAuthStatus(error.message, true);
    return;
  }
  siteAuthRecovery = false;
  siteAuthUpdateForm.reset();
  setSiteAuthStatus("Contrasena actualizada. Ya puedes continuar.");
  const { data } = await window.SUPABASE_AUTH_CLIENT.auth.getSession();
  updateSiteAuthSession(data?.session);
}

if (!siteAuthReady) {
  document.body.classList.remove("site-auth-pending");
  document.body.classList.add("site-auth-required");
  setSiteAuthStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
} else {
  window.SUPABASE_AUTH_CLIENT = window.supabase.createClient(siteAuthConfig.url, siteAuthConfig.anonKey);
  siteAuthLoginForm.addEventListener("submit", submitSiteAuthLogin);
  siteAuthRequestForm.addEventListener("submit", submitSiteAuthRequest);
  siteAuthUpdateForm.addEventListener("submit", submitSiteAuthUpdate);
  siteAuthForgot.addEventListener("click", () => showSiteAuthPanel("request"));
  siteAuthRequestBack.addEventListener("click", () => showSiteAuthPanel("login"));
  window.SUPABASE_AUTH_CLIENT.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      siteAuthRecovery = true;
      showSiteAuthPanel("update");
    }
    updateSiteAuthSession(session);
  });
  window.SUPABASE_AUTH_CLIENT.auth.getSession().then(({ data, error }) => {
    if (error) setSiteAuthStatus("No se pudo recuperar la sesion.", true);
    updateSiteAuthSession(data?.session);
  });
}
