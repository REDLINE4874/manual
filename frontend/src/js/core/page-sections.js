/* Vistas estáticas que no necesitan lógica propia en el documento principal. */

// Cambia a true para volver a mostrar la sección de Notas y su pestaña.
const ENABLE_NOTES = true;

const staticPageSectionIds = ["documentos", "guia", "puntos", "digitos", "external", "digito-detail", "notas", "perfilamiento", "comision", "admin"];
staticPageSectionIds.forEach((id) => document.getElementById(`view-${id}`)?.remove());

const staticPageSections = `
  <section class="view documents-view" id="view-documentos">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero documents-view__hero">
      <div><h1>Formalizaci&#243;n</h1></div>
      <a class="documents-view__external" href="https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Abrir en otra pesta&#241;a &#8599;</a>
      <button class="documents-view__external documents-view__floating" type="button" data-floating-view="documentos">Abrir como ventana flotante</button>
    </div>
    <div class="document-frame-wrap"><iframe class="document-frame" src="https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing" title="Documento de formalizaci&#243;n" loading="lazy" allowfullscreen></iframe></div>
  </section>

  <section class="view documents-view" id="view-guia">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero documents-view__hero">
      <div><h1>Script</h1></div>
      <a class="documents-view__external" href="https://docs.google.com/document/d/1Zz8njzGEmzn64qu22OI75u31GSvuI3hcPHY3It_ZqzI/preview" target="_blank" rel="noopener noreferrer">Abrir en otra pesta&#241;a &#8599;</a>
      <button class="documents-view__external documents-view__floating" type="button" data-floating-view="guia">Abrir como ventana flotante</button>
    </div>
    <div class="document-frame-wrap"><iframe class="document-frame" src="https://docs.google.com/document/d/1Zz8njzGEmzn64qu22OI75u31GSvuI3hcPHY3It_ZqzI/preview" title="Script" loading="lazy" allowfullscreen></iframe></div>
  </section>

  <section class="view" id="view-puntos">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero hero--compact"><div><h1>Conversi&#243;n de puntos y tasas de inter&#233;s</h1></div></div>
    <div class="calc-grid">
      <div class="calc-card">
        <h2>Conversi&#243;n de puntos</h2>
        <div class="field"><label for="p_tarjeta">Tarjeta</label><select id="p_tarjeta" class="custom-select"><option value="0.05">CL&#193;SICA</option><option value="0.07">ORO</option><option value="0.10">PLATINUM</option></select></div>
        <div class="field"><label for="p_gasto">Gasto ($)</label><input type="number" id="p_gasto" value="5000" min="0" step="100" /></div>
        <div class="calc-results"><div class="result"><div class="rl">Porcentaje</div><div class="rv" id="p_out_pct">5%</div></div><div class="result"><div class="rl">Puntos</div><div class="rv" id="p_out_puntos">250</div></div><div class="result pink result--full-width"><div class="rl">Bonificaci&#243;n</div><div class="rv" id="p_out_bono">$25</div></div></div>
        <div class="formula-note">Puntos = <code>Gasto &#215; Porcentaje</code> &#183; Bonificaci&#243;n = <code>Puntos &#215; 0.10</code></div>
      </div>
      <div class="calc-card">
        <h2>Tasas de inter&#233;s e intereses generados</h2>
        <div class="field"><label for="i_tarjeta">Tarjeta</label><select id="i_tarjeta" class="custom-select"><option value="0.6093">JOY</option><option value="0.6092">TELETON</option><option value="0.6093">CL&#193;SICA</option><option value="0.5895">ORO</option><option value="0.5901">DESCUBRE</option><option value="0.3047">PLATINUM</option><option value="0.5648" selected>EXPLORA</option></select></div>
        <div class="field"><label for="i_deuda">Deuda ($)</label><input type="number" id="i_deuda" value="1000" min="0" step="100" /></div>
        <div class="calc-results"><div class="result"><div class="rl">Tasa anual</div><div class="rv" id="i_out_anual">57.17%</div></div><div class="result"><div class="rl">Tasa mensual</div><div class="rv" id="i_out_mensual">4.76%</div></div><div class="result pink result--full-width"><div class="rl">Intereses generados</div><div class="rv" id="i_out_intereses">$47.64</div></div></div>
        <div class="formula-note">Tasa mensual = <code>Tasa anual &#247; 12</code> &#183; Intereses = <code>Deuda &#215; Tasa mensual</code></div>
      </div>
    </div>
    <footer class="page-footer"></footer>
  </section>

  <section class="view" id="view-digitos">
    <div class="hero hero--compact"><div><h1>Consulta de d&#237;gitos de diferentes bancos</h1><p>Selecciona un banco para ver sus d&#237;gitos de referencia.</p></div></div>
    <div class="digitos-grid" id="digitosContainer"><!-- generado por navigation.js --></div>
  </section>

  <section class="view documents-view" id="view-external">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero documents-view__hero"><div><span class="eyebrow">Enlace externo</span><h1 id="externalFrameTitle">Contenido externo</h1><p>Este sitio se est&#225; mostrando dentro del manual.</p></div><a class="documents-view__external" id="externalFrameOpen" href="#" target="_blank" rel="noopener noreferrer">Abrir en otra pesta&#241;a &#8599;</a></div>
    <div class="document-frame-wrap"><iframe class="document-frame" id="externalFrame" title="Contenido externo" loading="lazy"></iframe></div>
  </section>

  <section class="view" id="view-digito-detail"><button class="back-link" data-view="digitos">&#8592; Volver a D&#237;gitos</button><div id="digitoDetailContainer"><!-- generado por navigation.js --></div></section>

  <section class="view notes-view" id="view-notas">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero notes-view__hero"><div><h1>Mis notas</h1></div></div>
    <div class="notes-auth" id="notesAuthState">
      <h2>Inicia sesi&#243;n para ver tus notas</h2>
      <p>Tus notas quedan separadas de las de los dem&#225;s usuarios.</p>
      <p class="notes-status" id="notesStatus" role="status"></p>
    </div>
    <div class="notes-app" id="notesApp" hidden>
      <div class="notes-app__toolbar"><span id="notesUserLabel"></span></div>
      <form class="note-editor" id="noteForm" autocomplete="off">
        <input id="noteTitle" type="text" autocomplete="off" maxlength="120" placeholder="Crear una nota..." aria-label="T&#237;tulo de la nota" />
        <textarea id="noteContent" maxlength="5000" placeholder="Escribe una nota..." aria-label="Contenido de la nota"></textarea>
        <div class="note-editor__actions"><span class="notes-status" id="noteSaveStatus" role="status"></span><button class="note-editor__close" type="submit">Cerrar</button></div>
      </form>
      <div class="notes-filter">
        <span id="noteDateFilterLabel">Ver notas de la fecha</span>
        <input id="noteDateFilter" type="hidden" />
        <div class="notes-calendar">
          <button id="noteDateFilterTrigger" class="notes-calendar__trigger" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="noteDateCalendar">Elegir fecha</button>
          <div id="noteDateCalendar" class="notes-calendar__popup" role="dialog" aria-label="Calendario para filtrar notas" hidden></div>
        </div>
        <button id="clearNoteDateFilter" type="button">Todas las fechas</button>
      </div>
      <div class="notes-grid" id="notesList"></div>
    </div>
  </section>

  <section class="view profiling-view" id="view-perfilamiento">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero profiling-hero">
      <div>
        <div class="profiling-hero__eyebrow"><span class="eyebrow">Asesor&#237;a de Venta Consultiva</span><span class="profiling-beta-tag">Fase de prueba</span></div>
        <h1>Perfilamiento de Cliente</h1>
        <p>Ingresa los datos del cliente para obtener la mejor tarjeta Banamex recomendada y utilizar los argumentos comerciales clave listos para el cliente.</p>
      </div>
    </div>
    <div class="profiling-beta-banner" role="alert"><span class="profiling-beta-banner__icon">⚠️</span><div class="profiling-beta-banner__content"><strong>Secci&#243;n en fase de prueba (BETA):</strong> Esta herramienta se encuentra en periodo de prueba y ajuste para pulir detalles con el equipo. Las recomendaciones y argumentos se siguen perfeccionando seg&#250;n retroalimentaci&#243;n de ventas.</div></div>
    <div id="profilingAppContainer"><!-- Renderizado por profiling.js --></div>
    <div class="admin-card suggestions-card profiling-suggestions">
      <div class="admin-card__header"><div><h2>&#191;Tienes una sugerencia para Perfilamiento?</h2><p>Cu&#233;ntanos qu&#233; mejorar&#237;as de esta herramienta o qu&#233; funci&#243;n te gustar&#237;a agregar.</p></div></div>
      <form id="suggestionForm" class="suggestion-form">
        <label>Tu nombre (opcional)<input id="suggestionName" type="text" maxlength="80" autocomplete="name" placeholder="&#191;C&#243;mo te llamas?" /></label>
        <label>Tu sugerencia<textarea id="suggestionMessage" rows="5" minlength="5" maxlength="2000" required placeholder="Escribe aqu&#237; tu sugerencia sobre Perfilamiento..."></textarea></label>
        <p class="admin-status" id="suggestionStatus" role="status" aria-live="polite"></p>
        <button class="notes-button" type="submit">Enviar sugerencia</button>
      </form>
    </div>
  </section>

  <section class="view commission-view" id="view-comision">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="commission-hero"><div><span class="eyebrow">Nueva promoci&#243;n</span><h1>Comisi&#243;n por administraci&#243;n</h1><p>Durante el primer a&#241;o con la tarjeta, la comisi&#243;n se cobra mensualmente y puedes exentarla cumpliendo una compra m&#237;nima con tu tarjeta digital.</p></div><div class="commission-hero-badge" aria-label="La comisi&#243;n puede exentarse durante el primer a&#241;o"><span class="commission-hero-badge__symbol">$</span><strong>Exenta</strong><span>primer a&#241;o</span></div></div>
    <div class="commission-summary" aria-label="Gu&#237;a r&#225;pida para explicar el beneficio">
      <article class="commission-summary__item"><span class="commission-summary__step">1 &#183; Al contratar</span><h2>El primer mes es bonificado</h2><p>El cliente realiza la compra m&#237;nima y paga la primera mensualidad. Despu&#233;s de cubrir ese pago, se le bonifica la mensualidad.</p></article>
      <article class="commission-summary__item"><span class="commission-summary__step">2 &#183; Para exentar</span><h2>Debe comprar $300 al mes</h2><p>Del mes 2 al 12, debe acumular al menos $300 durante el mes anterior para exentar la comisi&#243;n del siguiente mes.</p></article>
      <article class="commission-summary__item"><span class="commission-summary__step">3 &#183; Despu&#233;s del a&#241;o</span><h2>La comisi&#243;n vuelve a cobrarse</h2><p>Al terminar el primer a&#241;o, el cobro mensual se aplica normalmente. Solo participan tarjetas que tienen esta comisi&#243;n.</p></article>
    </div>
    <div class="commission-eligibility"><div class="commission-eligibility__icon">i</div><div><h2>Condiciones importantes</h2><p><strong>El beneficio es v&#225;lido &#250;nicamente durante el primer a&#241;o</strong> con la tarjeta. A partir del segundo a&#241;o, la comisi&#243;n por administraci&#243;n mensual se aplicar&#225; de manera normal.</p><p>Solo est&#225; disponible para tarjetas que tienen cobro por administraci&#243;n mensual. <strong>JOY no participa porque no tiene esta comisi&#243;n.</strong></p></div></div>
    <div class="commission-section-heading"><span class="eyebrow">El proceso</span><h2>As&#237; funciona la promoci&#243;n</h2></div>
    <div class="commission-steps"><article class="commission-step"><span class="commission-step__number">01</span><div><h3>Recibe y activa tu tarjeta</h3><p>Acude a sucursal para recibir la tarjeta f&#237;sica y solicita su activaci&#243;n. Activa tambi&#233;n la tarjeta digital desde NetKey.</p></div></article><article class="commission-step"><span class="commission-step__number">02</span><div><h3>Compra y paga la primera mensualidad</h3><p>Realiza la compra m&#237;nima indicada y paga la primera mensualidad. Una vez cubierto el pago, se aplica la bonificaci&#243;n del primer mes.</p></div></article><article class="commission-step"><span class="commission-step__number">03</span><div><h3>Cumple la meta mensual</h3><p>A partir del mes 2, realiza compras por al menos <strong>$300</strong> durante el mes anterior para exentar la comisi&#243;n del siguiente mes.</p></div></article></div>
    <div class="commission-rule-grid"><article class="commission-rule commission-rule--success"><span class="commission-rule__icon">&#10003;</span><div><h3>Si cumples la meta</h3><p>La comisi&#243;n por administraci&#243;n del mes correspondiente se exenta autom&#225;ticamente.</p></div></article><article class="commission-rule commission-rule--warning"><span class="commission-rule__icon">!</span><div><h3>Si no cumples la meta</h3><p>Se realiza el cargo de la comisi&#243;n por administraci&#243;n mensual correspondiente.</p></div></article></div>
    <div class="commission-section-heading commission-section-heading--timeline"><span class="eyebrow">Ejemplo</span><h2>La condici&#243;n se revisa mes a mes</h2><p>El resultado de cada mes depende del consumo realizado en el mes anterior.</p></div>
    <div class="commission-timeline" aria-label="Ejemplo de aplicaci&#243;n mensual"><article class="commission-month commission-month--success"><span class="commission-month__label">Mes 1</span><h3>Compra con tarjeta digital</h3><strong>Bonificaci&#243;n aplicada</strong></article><article class="commission-month commission-month--success"><span class="commission-month__label">Mes 2</span><h3>Consumo anterior: <b>$350</b></h3><strong>Comisi&#243;n exenta</strong></article><article class="commission-month commission-month--warning"><span class="commission-month__label">Mes 3</span><h3>Consumo anterior: <b>$220</b></h3><strong>Se realiza el cargo</strong></article><article class="commission-month commission-month--success"><span class="commission-month__label">Mes 4</span><h3>Consumo anterior: <b>$480</b></h3><strong>Comisi&#243;n exenta</strong></article></div>
    <aside class="commission-note"><strong>Idea clave:</strong> el mes 1 se aplica la bonificaci&#243;n; del mes 2 al 12, solo se exenta la mensualidad de los meses en los que s&#237; se cumple la condici&#243;n. Al terminar el primer a&#241;o, la comisi&#243;n se aplicar&#225; normalmente.</aside>
  </section>

  <div id="adminPasswordModal" class="modal admin-modal" aria-hidden="true">
    <div class="modal-box admin-modal__box" role="dialog" aria-modal="true" aria-labelledby="adminPasswordTitle">
      <button id="adminPasswordClose" class="modal-close" type="button" aria-label="Cerrar">&#10005;</button>
      <h2 id="adminPasswordTitle">Cambiar contrase&#241;a</h2>
      <p id="adminPasswordDescription">Define una contrase&#241;a temporal para este usuario.</p>
      <form class="admin-password-form" id="adminPasswordForm">
        <label>Usuario <input id="adminPasswordUsername" type="text" readonly /></label>
        <label>Nueva contrase&#241;a <input id="adminPasswordInput" type="password" minlength="8" autocomplete="new-password" required /></label>
        <label>Confirmar contrase&#241;a <input id="adminPasswordConfirm" type="password" minlength="8" autocomplete="new-password" required /></label>
        <p class="admin-form-help">Usa al menos 8 caracteres. Comunica la contrase&#241;a temporal al usuario de forma segura.</p>
        <p class="admin-status" id="adminPasswordStatus" role="status"></p>
        <div class="admin-modal__actions"><button id="adminPasswordCancel" class="notes-button notes-button--secondary" type="button">Cancelar</button><button class="notes-button" type="submit">Guardar contrase&#241;a</button></div>
      </form>
    </div>
  </div>

  <section class="view admin-view" id="view-admin">
    <button class="back-link" data-view="home">&#8592; Volver al men&#250;</button>
    <div class="hero admin-view__hero"><div><span class="eyebrow">Acceso restringido</span><h1>Panel administrativo</h1></div></div>
    <div class="admin-tabs" role="tablist" aria-label="Secciones administrativas">
      <button class="admin-tab is-active" type="button" role="tab" aria-selected="true" aria-controls="admin-panel-users" data-admin-tab="users">Usuarios bloqueados</button>
      <button class="admin-tab" type="button" role="tab" aria-selected="false" aria-controls="admin-panel-cards" data-admin-tab="cards">Datos de tarjetas</button>
      <button class="admin-tab" type="button" role="tab" aria-selected="false" aria-controls="admin-panel-suggestions" data-admin-tab="suggestions">Sugerencias</button>
    </div>
    <div class="admin-card admin-tab-panel" id="admin-panel-users" data-admin-panel="users"><div class="admin-card__header"><div><h2>Usuarios y permisos</h2></div><button class="notes-button notes-button--secondary" id="adminRefreshUsers" type="button">Actualizar</button></div><p class="admin-status" id="adminStatus" role="status"></p><div class="admin-users-table-wrap"><table class="admin-users-table"><thead><tr><th>Usuario</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="adminUsersTableBody"></tbody></table></div></div>
    <div class="admin-card admin-card--settings admin-tab-panel" id="admin-panel-cards" data-admin-panel="cards" hidden><div class="admin-card__header"><div><h2>Datos de tarjetas</h2><p>Los cambios se mostrarán para todos los usuarios del manual.</p></div></div><form class="admin-card-form" id="adminCardForm"><section class="admin-form-section"><div class="admin-form-section__heading"><h3>Información financiera</h3><p>Selecciona la tarjeta y actualiza sus datos principales.</p></div><div class="admin-card-form-grid"><label>Tarjeta<select id="adminCardSelect" class="custom-select" required></select></label><label>CAT<input id="adminCardCat" type="text" required /></label><label>Tasa de interés<input id="adminCardRate" type="text" required /></label><label>Comisión por administración<input id="adminCardAdmin" type="text" required /></label></div></section><div class="admin-validity-launcher"><div><h3>Leyenda Sofom</h3><p>Edita CAT, vigencia, tasa de interés y comisión por administración.</p></div><button class="notes-button notes-button--secondary" id="adminOpenValidity" type="button">Editar leyenda</button></div><div class="admin-form-actions"><button class="notes-button notes-button--secondary" id="adminRestoreCard" type="button">Restaurar valores originales</button><button class="notes-button" type="submit">Guardar datos</button></div></form></div>
    <div class="admin-card admin-tab-panel" id="admin-panel-suggestions" data-admin-panel="suggestions" hidden><div class="admin-card__header"><div><h2>Sugerencias recibidas</h2><p>Solo tú puedes consultar los mensajes enviados desde el manual.</p></div><button class="notes-button notes-button--secondary" id="adminRefreshSuggestions" type="button">Actualizar</button></div><p class="admin-status" id="adminSuggestionsStatus" role="status"></p><div class="suggestions-list" id="adminSuggestionsList"></div></div>
  </section>
`;

const pageSectionsHost = document.getElementById("pageSections");
pageSectionsHost.insertAdjacentHTML("beforebegin", staticPageSections);
pageSectionsHost.remove();

const notesView = document.getElementById("view-notas");
if (!ENABLE_NOTES) {
  notesView?.remove();
} else {
  document.getElementById("internalTabs")?.insertAdjacentHTML("beforeend", `
    <button class="internal-tab internal-tab--notes" type="button" role="tab" data-view="notas" draggable="true">
      <svg class="internal-tab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 20h4L19 9l-4-4L4 16v4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
        <path d="m13.5 6.5 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
      <span>Notas</span>
    </button>
  `);
}
