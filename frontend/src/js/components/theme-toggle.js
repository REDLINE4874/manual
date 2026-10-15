/**
 * <theme-toggle></theme-toggle>
 * <theme-toggle size="sm"></theme-toggle>
 * <theme-toggle size="lg"></theme-toggle>
 *
 * Componente autónomo (Web Component) para alternar modo claro/oscuro.
 * No depende de CSS ni JS externo: todo vive encapsulado en su Shadow DOM.
 *
 * USO:
 *   1) Incluye este archivo:  <script src="theme-toggle.js" defer></script>
 *   2) Coloca la etiqueta donde quieras el switch:  <theme-toggle></theme-toggle>
 *
 * TAMAÑO:
 *   Usa el atributo "size" con uno de estos valores:
 *     - sm  (pequeño,  38x20px)
 *     - md  (mediano,  52x28px) — valor por defecto si no se especifica
 *     - lg  (grande,   64x34px)
 *   Ejemplo:  <theme-toggle size="sm"></theme-toggle>
 * ***************************************************************************************
 *      si se requiere otro valor solo coloca un numero en la equita del html, ejemplo: 
 *      <theme-toggle size="40"></theme-toggle> y el tamaño se ajustará a 40px de ancho.
 *******************************************************************************************
 * El componente:
 *   - Activa la clase "dark-mode" en <body> (misma convención que el CSS existente):
 *         body.dark-mode { ... }
 *   - Respeta la preferencia del sistema operativo al cargar.
 *   - Guarda la elección del usuario en localStorage (persiste entre visitas).
 *   - Emite un evento "theme-change" con el detalle { theme: "dark"|"light" }
 *     por si quieres reaccionar desde tu propio JS:
 *         document.querySelector('theme-toggle')
 *           .addEventListener('theme-change', e => console.log(e.detail.theme));
 */

class ThemeToggle extends HTMLElement {
  static get observedAttributes() {
    return ['size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host{
  display:inline-block;

  /* Tamaño md */
  --w:52px;
  --h:28px;
  --pad:3px;
  --knob:22px;
  --tx:24px;

  --switch-light-1:#8ec9f0;
  --switch-light-2:#f7d9a0;

  --switch-dark-1:#07171D;
  --switch-dark-2:#123A47;

  --knob-light:#ffb648;
  --knob-dark:#EAF2F4;

  --crater:#B9C5D8;
  --focus:#6ea8fe;
}

:host([size="sm"]){
  --w:38px;
  --h:20px;
  --pad:2px;
  --knob:16px;
  --tx:18px;
}

:host([size="lg"]){
  --w:64px;
  --h:34px;
  --pad:4px;
  --knob:26px;
  --tx:30px;
}

/* =========================================================
   SWITCH
   ========================================================= */

.switch{
  position:relative;

  width:var(--w);
  height:var(--h);

  padding:0;
  border:none;
  border-radius:999px;

  cursor:pointer;
  overflow:hidden;

  background:
    linear-gradient(
      135deg,
      var(--switch-light-1),
      var(--switch-light-2)
    );

  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.15),
    0 2px 5px rgba(0,0,0,.08);

  transition:
    background .35s ease,
    box-shadow .35s ease,
    transform .15s ease;
}

.switch:hover{
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.18),
    0 4px 10px rgba(0,0,0,.14);
}

.switch:active{
  transform:scale(.95);
}

/* =========================================================
   ESTADO OSCURO
   ========================================================= */

.switch.dark{
  background:
    linear-gradient(
      135deg,
      var(--switch-dark-1),
      var(--switch-dark-2)
    );

  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.35),
    0 2px 8px rgba(0,0,0,.25);
}

.switch:focus-visible{
  outline:3px solid var(--focus);
  outline-offset:3px;
}

/* =========================================================
   NUBES
   ========================================================= */

.clouds{
  position:absolute;
  inset:0;

  opacity:1;

  transition:
    opacity .35s ease,
    transform .35s ease;
}

.switch.dark .clouds{
  opacity:0;
  transform:translateX(-4px);
}

.clouds span{
  position:absolute;

  background:rgba(255,255,255,.88);

  border-radius:50%;

  box-shadow:
    0 1px 2px rgba(255,255,255,.25);
}

.clouds span:nth-child(1){
  width:17%;
  height:18%;
  top:18%;
  left:17%;
}

.clouds span:nth-child(2){
  width:12%;
  height:14%;
  top:61%;
  left:23%;
}

/* =========================================================
   ESTRELLAS
   ========================================================= */

.stars{
  position:absolute;
  inset:0;

  opacity:0;

  transition:
    opacity .4s ease,
    transform .4s ease;
}

.switch.dark .stars{
  opacity:1;
  transform:translateX(0);
}

.stars span{
  position:absolute;

  width:2px;
  height:2px;

  background:#fff;
  border-radius:50%;

  box-shadow:
    0 0 3px rgba(255,255,255,.8);
}

.stars span:nth-child(1){
  top:21%;
  left:15%;
}

.stars span:nth-child(2){
  top:43%;
  left:27%;

  width:1.5px;
  height:1.5px;
}

.stars span:nth-child(3){
  top:64%;
  left:17%;
}

.stars span:nth-child(4){
  top:29%;
  left:35%;

  width:1.5px;
  height:1.5px;
}

/* =========================================================
   PERILLA
   ========================================================= */

.knob{
  position:absolute;

  top:var(--pad);
  left:var(--pad);

  width:var(--knob);
  height:var(--knob);

  border-radius:50%;

  background:var(--knob-light);

  box-shadow:
    0 3px 8px rgba(0,0,0,.25),
    0 1px 2px rgba(255,255,255,.25);

  transform:translateX(0);

  transition:
    transform .35s cubic-bezier(.68,-0.4,.27,1.4),
    background .3s ease,
    box-shadow .3s ease;
}

.switch.dark .knob{
  transform:translateX(var(--tx));

  background:var(--knob-dark);

  box-shadow:
    0 3px 8px rgba(0,0,0,.35),
    inset 0 0 0 1px rgba(0,0,0,.06);
}

/* =========================================================
   CRÁTERES DE LA LUNA
   ========================================================= */

.knob .crater{
  position:absolute;

  background:var(--crater);

  border-radius:50%;

  opacity:0;

  transition:
    opacity .3s ease .1s,
    transform .3s ease;
}

.switch.dark .knob .crater{
  opacity:1;
}

.knob .crater.c1{
  width:23%;
  height:23%;
  top:18%;
  left:23%;
}

.knob .crater.c2{
  width:14%;
  height:14%;
  top:50%;
  left:50%;
}

.knob .crater.c3{
  width:11%;
  height:11%;
  top:27%;
  left:64%;
}
      </style>

      <button class="switch" part="switch" role="switch" aria-checked="false" aria-label="Cambiar entre modo claro y oscuro">
        <span class="clouds"><span></span><span></span></span>
        <span class="stars"><span></span><span></span><span></span><span></span></span>
        <span class="knob">
          <span class="crater c1"></span>
          <span class="crater c2"></span>
          <span class="crater c3"></span>
        </span>
      </button>
    `;

    this.$btn = this.shadowRoot.querySelector('.switch');
    this.$btn.addEventListener('click', () => this.toggle());

    // Estado inicial: localStorage > preferencia del sistema
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved ? saved === 'dark' : prefersDark;

    this._setTheme(initialDark, { persist: false });
  }

  toggle() {
    const isDark = this.$btn.classList.contains('dark');
    this._setTheme(!isDark, { persist: true });
  }

  _setTheme(isDark, { persist }) {
    this.$btn.classList.toggle('dark', isDark);
    this.$btn.setAttribute('aria-checked', String(isDark));

    // Activa el modo oscuro con la MISMA convención que ya usa tu CSS:
    // body.dark-mode { ... }
    document.body.classList.toggle('dark', isDark);

    if (persist) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: isDark ? 'dark' : 'light' },
      bubbles: true
    }));
  }
}

customElements.define('theme-toggle', ThemeToggle);