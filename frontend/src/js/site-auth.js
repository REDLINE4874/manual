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
    <p>Inicia sesion con el correo y contrasena que te proporciono el administrador.</p>
    <form class="site-auth-form" id="siteAuthForm">
      <label>Correo electronico
        <input id="siteAuthEmail" type="email" autocomplete="email" required />
      </label>
      <label>Contrasena
        <input id="siteAuthPassword" type="password" autocomplete="current-password" required />
      </label>
      <button class="site-auth-submit" id="siteAuthSubmit" type="submit">Iniciar sesion</button>
    </form>
    <p class="site-auth-status" id="siteAuthStatus" role="status"></p>
  </div>
`;
document.body.prepend(siteAuthScreen);

const siteAuthForm = document.getElementById("siteAuthForm");
const siteAuthEmail = document.getElementById("siteAuthEmail");
const siteAuthPassword = document.getElementById("siteAuthPassword");
const siteAuthSubmit = document.getElementById("siteAuthSubmit");
const siteAuthStatus = document.getElementById("siteAuthStatus");

function setSiteAuthStatus(message, isError = false) {
  siteAuthStatus.textContent = message;
  siteAuthStatus.classList.toggle("is-error", isError);
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
  document.body.classList.remove("site-auth-pending");
  document.body.classList.toggle("site-auth-required", !signedIn);
  siteAuthScreen.hidden = signedIn;
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
  setSiteAuthStatus("Iniciando sesion...");
  const { error } = await window.SUPABASE_AUTH_CLIENT.auth.signInWithPassword({
    email: siteAuthEmail.value.trim(),
    password: siteAuthPassword.value,
  });
  siteAuthSubmit.disabled = false;
  if (error) setSiteAuthStatus("Correo o contrasena incorrectos.", true);
}

if (!siteAuthReady) {
  document.body.classList.remove("site-auth-pending");
  document.body.classList.add("site-auth-required");
  setSiteAuthStatus("Falta configurar Supabase en src/js/supabase-config.js.", true);
} else {
  window.SUPABASE_AUTH_CLIENT = window.supabase.createClient(siteAuthConfig.url, siteAuthConfig.anonKey);
  siteAuthForm.addEventListener("submit", submitSiteAuth);
  window.SUPABASE_AUTH_CLIENT.auth.onAuthStateChange((_event, session) => updateSiteAuthSession(session));
  window.SUPABASE_AUTH_CLIENT.auth.getSession().then(({ data, error }) => {
    if (error) setSiteAuthStatus("No se pudo recuperar la sesion.", true);
    updateSiteAuthSession(data?.session);
  });
}
