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
      
      <form class="site-auth-form" id="siteAuthLoginForm" autocomplete="off">
        <label>Usuario
          <input id="siteAuthLoginUsername" type="text" autocomplete="username" minlength="3" required />
        </label>
        <label>Contrasena
          <input id="siteAuthLoginPassword" type="password" autocomplete="off" required />
        </label>
        <button class="site-auth-submit" type="submit">Iniciar sesion</button>
      </form>
      <button class="site-auth-link" id="siteAuthForgot" type="button">Olvide mi contrasena</button>
    </div>

    <div id="siteAuthRequestPanel" hidden>
      <p>Escribe tu correo y te enviaremos un enlace para cambiar la contrasena.</p>
      <form class="site-auth-form" id="siteAuthRequestForm" autocomplete="off">
        <label>Correo electronico
          <input id="siteAuthRequestEmail" type="email" autocomplete="off" required />
        </label>
        <button class="site-auth-submit" type="submit">Enviar enlace</button>
      </form>
      <button class="site-auth-link" id="siteAuthRequestBack" type="button">Volver al inicio de sesion</button>
    </div>

    <div id="siteAuthUpdatePanel" hidden>
      <p>Escribe y confirma tu nueva contrasena.</p>
      <form class="site-auth-form" id="siteAuthUpdateForm" autocomplete="off">
        <label>Contrasena nueva
          <input id="siteAuthNewPassword" type="password" autocomplete="off" required />
        </label>
        <label>Confirmar contrasena
          <input id="siteAuthConfirmPassword" type="password" autocomplete="off" required />
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
const siteAuthLoginUsername = document.getElementById("siteAuthLoginUsername");
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

function isPasswordResetRateLimitError(error) {
  const errorText = `${error?.message || ""} ${error?.code || ""}`.toLowerCase();
  return error?.status === 429
    || /rate[ _-]?limit|too many requests|once every|email.send.rate_limit|over_email_send_rate_limit/.test(errorText);
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

  if (panel === "login") siteAuthLoginUsername.focus();
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

async function enforceSiteAuthBlock(session) {
  if (!session?.user || !window.SUPABASE_AUTH_CLIENT) return false;
  const { data, error } = await window.SUPABASE_AUTH_CLIENT
    .from("profiles")
    .select("blocked")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error || !data?.blocked) return false;
  siteAuthScreen.hidden = false;
  await window.SUPABASE_AUTH_CLIENT.auth.signOut();
  siteAuthScreen.hidden = false;
  setSiteAuthStatus("Tu usuario ha sido bloqueado. Solicita acceso al administrador.", true);
  return true;
}

async function submitSiteAuthLogin(event) {
  event.preventDefault();
  siteAuthRecovery = false;
  const submit = siteAuthLoginForm.querySelector("button[type=submit]");
  submit.disabled = true;
  setSiteAuthStatus("Iniciando sesion...");
  const { data: email, error: lookupError } = await window.SUPABASE_AUTH_CLIENT.rpc(
    "get_auth_email_by_username",
    { target_username: siteAuthLoginUsername.value.trim() },
  );
  if (lookupError || !email) {
    submit.disabled = false;
    setSiteAuthStatus("Usuario o contrasena incorrectos.", true);
    return;
  }
  const { error } = await window.SUPABASE_AUTH_CLIENT.auth.signInWithPassword({
    email,
    password: siteAuthLoginPassword.value,
  });
  submit.disabled = false;
  if (error) setSiteAuthStatus("Usuario o contrasena incorrectos.", true);
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
    setSiteAuthStatus(
      isPasswordResetRateLimitError(error)
        ? "Se alcanzó el límite de solicitudes para cambiar la contraseña por correo. Solicita el cambio de contraseña a un administrador."
        : error.message,
      true,
    );
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
  window.SUPABASE_AUTH_CLIENT.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      siteAuthRecovery = true;
      showSiteAuthPanel("update");
    }
    if (!(await enforceSiteAuthBlock(session))) updateSiteAuthSession(session);
  });
  window.SUPABASE_AUTH_CLIENT.auth.getSession().then(async ({ data, error }) => {
    if (error) setSiteAuthStatus("No se pudo recuperar la sesion.", true);
    if (!(await enforceSiteAuthBlock(data?.session))) updateSiteAuthSession(data?.session);
  });
}
