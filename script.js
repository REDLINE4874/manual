/* ============================================================
   DATOS DE LAS TARJETAS
   Para modificar cualquier dato (ingresos, CAT, tasa, comisiones)
   edita directamente los valores de este arreglo.
   ============================================================ */
let currentScript = "";
let currentCardName = "";
const CARDS = [
  {
    id: "joy",
    name: "JOY Banamex",
    segment: "clasico",
    color: "#009CC6",
    image:
      "img/joy.png",
    income: "15 MIL",
    cat: "82.7% sin IVA",
    rate: "61.80%",
    admin: "Sin comisión de por vida",
    additional: "No tiene",
    validity:
      "<strong>CAT PROMEDIO 82.7% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>61.80% tasa variable</strong>, la cual es sin costo de comisión por administración y al realizar al menos una compra de <strong>$300 MN al mes para evitar la comisión de penalización por inactividad de $149+IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC JOY, una tarjeta de crédito que aparte de no tener cobro por administración (anualidad), es la tarjeta más segura, ya que no tiene el CVV impreso en la parte posterior de la tarjeta, además como ventaja exclusiva usted podrá modificar su fecha de corte 1 vez al año. Únicamente tendría que gastar 300 pesos al mes para evitar la comisión de administración de $149 + IVA, para ello, yo lo apoyaré con su solicitud.\n\nCAT PROMEDIO 82.7% sin IVA. Tasa de interés anual promedio ponderada de 61.80% tasa variable, la cual es sin costo de comisión por administración y al realizar al menos una compra de $300 MN al mes para evitar la comisión de penalización por inactividad de $149+IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Realizar una compra mínima de $300 al mes para evitar la comisión de penalización por inactividad de $149 + IVA.</strong>"
    ],



    benefits: [
      "<strong>Descuentos y promociones todo el año en negocios con participación con Banamex</strong>",
      "<strong>Puede elegir su fecha de corte (una vez al año)</strong>",
      "<strong>Una tarjeta mas segura sin código de seguridad de la tarjeta impreso</strong> para mayor seguridad en sus compras en linea (CVV)",
      "<strong><strong><strong>Preventas exclusivas</strong></strong></strong>: Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
      "<strong>Mastercard global service respaldo en caso de perdida de TDC en 48 hrs te entregan la reposición.</strong>",
    ],
  },
  {
    id: "clasica",
    name: "Clásica Banamex",
    segment: "clasico",
    color: "#D6003F",
    image:
      "img/clasica.png",
    income: "15 MIL",
    cat: "87.4% sin IVA",
    rate: "61.62%",
    admin: "$67.92 sin IVA",
    additional: "$33.75 sin IVA",
    validity:
      "<strong>CAT PROMEDIO 87.4% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>61.62% tasa variable</strong> y una comisión por <strong>administración mensual de $67.92 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC CLÁSICA, la cual le estará regresando un 5% de puntos premia, o el doble al usarlo en gasolineras, esto para que usted pueda estarlo intercambiando por dinero en efectivo, entre otros productos, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta CLÁSICA le genera una administración mensual de $67.92 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 87.4% sin IVA. Tasa de interés anual promedio ponderada de 61.62% tasa variable y una comisión por administración mensual de $67.92 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey.</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>5% EN PUNTOS PREMIA</strong>: Obtenlo por tus compras y úsalos para comprar lo que quieras o como dinero en efectivo en Cajeros Automáticos Citibanamex.",
      "<strong>PUNTOS PREMIA DOBLES</strong> al cargar gasolina todos los días de la semana ( topado a 1000 puntos por semana) LE INVITAMOS A CONSULTAR TÉRMINOS Y CONDICIONES.",
      "<strong>3, 6 o 12 Pagos fijos en Salud y belleza</strong> (<strong>COMPRA MINIMA DE $3,000</strong>) ( hospitales, laboratorios medicos de cualquier especialidad, farmacias y clinicas de salud y belleza) Monto minimo de la compra de $3000 llamando al 55 2226 3639",
      "<strong><strong>Preventas exclusivas</strong></strong>: Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
      "<strong>ELIGE EL DIA QUE QUIERAS PAGAR CAMBIANDO TU FECHA DE CORTE UNA VEZ AL AÑO</strong>",
    ],
  },
  {
    id: "teleton",
    name: "Teletón Banamex",
    segment: "clasico",
    color: "#a813ff",
    image:
      "img/teleton.png",
    income: "15 MIL",
    cat: "85.8% sin IVA",
    rate: "61.57%",
    admin: "$45 sin IVA",
    additional: "Sin costo",
    validity:
      "<strong>CAT PROMEDIO 85.8% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>61.57% tasa variable</strong> y una comisión por <strong>administración mensual $45 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC TELETÓN, la cual le estará brindando meses sin intereses hasta en el 98% de comercios, 30% de descuento en Starbucks y 2x1 en Cinépolis, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta TELETÓN le genera una administración mensual de $45 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 85.8% sin IVA. Tasa de interés anual promedio ponderada de 61.57% tasa variable y una comisión por administración mensual de $45 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>6 tarjetas adicionales sin costo.</strong>",
      "<strong><strong>Preventas exclusivas</strong></strong>:Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
    ],
  },
  {
    id: "oro",
    name: "Oro Banamex",
    segment: "oro",
    color: "#A9863B",
    image:
      "img/oro.png",
    income: "25 MIL",
    cat: "84.4% sin IVA",
    rate: "59.61%",
    admin: "$102.50 sin IVA",
    additional: "$51.67 sin IVA",
    validity:
      "<strong>CAT PROMEDIO 84.4% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>59.61% tasa variable</strong> y una comisión por <strong>administración mensual de $102.50 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC ORO, la cual le estará regresando un 7% de puntos premia, o el doble al usarlo en gasolineras, esto para que usted pueda estarlo intercambiando por dinero en efectivo, entre otros productos, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta ORO le genera una administración mensual de $102.50 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 84.4% sin IVA. Tasa de interés anual promedio ponderada de 59.61% tasa variable y una comisión por administración mensual de $102.50 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>7% EN PUNTOS PREMIA</strong>: En tus compras y úsalos para comprar lo que quieras o como dinero en efectivo.",
      "<strong>PUNTOS PREMIA DOBLES</strong> al cargar gasolina todos los días de la semana ( topado a 1000 puntos por semana) LE INVITAMOS A CONSULTAR TÉRMINOS Y CONDICIONES.",
      "<strong>3 meses sin intereses en viajes, salud y belleza</strong> (<strong>COMPRA MINIMA $1,500</strong>) ( hospitales, laboratorios medicos de cualquier especialidad, farmacias y clinicas de salud y belleza)",
      "<strong>Meses sin intereses en negocios participantes:</strong> Compra tus viajes, tecnología, ropa y mucho más.",
      "<strong>Seguro de Accidente en viajes:</strong> Obtén hasta 400 USD de cobertura por incidente en caso de robo o daño accidental.",
      "<strong>Master Seguro de Viajes</strong> Obtén hasta 250,000 USD para cuidar tu integridad y la de tu familia",
      "<strong><strong>Preventas exclusivas</strong></strong>: Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
      "<strong>Seguro por uso y facturación fraudulenta de su TDC:</strong> Cubre hasta el saldo de la cuenta, siempre y cuando sea por robo, extravío o facturación fraudulenta del plástico.",
    ],
  },
  {
    id: "descubre",
    name: "Descubre Banamex",
    segment: "oro",
    color: "#003848",
    image:
      "img/descubre.png",
    income: "25 MIL",
    cat: "85.0% sin IVA",
    rate: "59.72%",
    admin: "$102.50 sin IVA",
    additional: "$51.67 sin IVA",
    validity:
      "<strong>CAT PROMEDIO 85.0% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>59.72% tasa variable</strong> y una comisión por <strong>administración mensual de $102.50 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC DESCUBRE, la cual ya es una categoría PLATINUM con la cual podrá viajar a playas nacionales con un certificado 2x1 en boletos de avión; puede obtenerlo como bienvenida durante los primeros 3 meses con su tarjeta, o en cada aniversario. Para ello es necesario acumular 600 puntos en los primeros 3 meses, y para el de aniversario, acumular mínimo 4,500 Momentos Banamex, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta DESCUBRE le genera una administración mensual de $102.50 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 85.0% sin IVA. Tasa de interés anual promedio ponderada de 59.72% tasa variable y una comisión por administración mensual de $102.50 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>1 PUNTO MOMENTO BANAMEX:</strong> por cada dólar gastado (o su equivalente en pesos).",
      "<strong>Accesos gratuitos e ilimitados en Salas VIP Elite Lounge Mastercard</strong> localizado en la T1 del aeropuerto Internacional de la CDMX.",
      "<strong>2X1 EN BOLETOS DE AVIÓN:</strong> Viaja a playas nacionales con un certificado 2x1 en boletos de avión, puedes obtenerlo como bienvenida durante los primeros 3 meses con tu tarjeta o en cada aniversario. La condición para obtener el de bienvenida es acumular un total de <strong>600 puntos en los primeros 3 meses</strong>, y para obtener el de aniversario, debe <strong>acumular mínimo 4,500 Puntos .</strong> Playas seleccionadas: <strong>Acapulco, La Paz, Puerto Vallarta, Huatulco, Cozumel, Cancun, Los Cabos, Veracruz, Mazatlán, Zihuatlanejo.</strong>",
      "<strong>MASTERCARD CONCIERGE</strong> asistente personal 24/7, Atención personalizada en todo el mundo para realizar reservas de restaurantes, coordinación de eventos especiales, entre otras.",
      "<strong>Elite Valet MasterCard :</strong> En el Aeropuerto Internacional de la Ciudad de México encontraras el servicio de Elite Valet MC. Con tu Tarjeta Citibanamex obtén 50% de descuento. El servicio es por hasta 5 días naturales, 2 entradas por mes.",
      "<strong>DINING PROGRAM:</strong> Obtén 20% descuento en tus consumos en restaurantes seleccionados al reservar a través del Mastercard Concierge. ¡Recibe una bebida de cortesía por persona como bienvenida!",
      "<strong><strong>Preventas exclusivas</strong></strong>:Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Banamex",
    segment: "platinum",
    color: "#5B6367",
    image:
      "img/platinum.png",
    income: "75 MIL",
    cat: "39.9% sin IVA",
    rate: "31.10%",
    admin: "$227.08 sin IVA",
    additional: "$113.33 sin IVA",
    validity:
      "<strong>CAT PROMEDIO 39.9% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>31.10% tasa variable</strong> y una comisión por <strong>administración mensual de $227.08 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC PLATINUM, una de nuestras mejores tarjetas, brindándole un excelente costo-beneficio, además de los servicios de asistencia gratuitos que Libra Premium tiene para usted: asistencia vial, asistencia legal y gestoría, asistencia en el hogar y asistencia médica, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta PLATINUM le genera una administración mensual de $227.08 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 39.9% sin IVA. Tasa de interés anual promedio ponderada de 31.10% tasa variable y una comisión por administración mensual de $227.08 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>10% EN PUNTOS PREMIA:</strong> Cada que realices compras con tu TDC Platinum.",
      "<strong>LIBRA Premium:</strong> Siéntete protegido con los servicios de asistencia gratuitos que libra Premiun tiene para ti: Asistencia Vial, Asistencia Legal y Gestoría, Asistencia en el Hogar, AsistenciaMedica.",
      "<strong>10 accesos GRATIS en las SALAS BEYOND</strong> para usted y 1 acompañante y… <strong>4 accesos a Salas Mastercard Airport Experiences</strong> en mas de 800 salas VIP alrededor del mundo al año.",
      "<strong>MASTERCARD CONCIERGE</strong> asistente personal 24/7, Atención personalizada en todo el mundo para realizar reservas de restaurantes, coordinación de eventos especiales, entre otras.",
      "<strong>DINING PROGRAM:</strong> Obtén 20% descuento en tus consumos en restaurantes seleccionados al reservar a través del Mastercard Concierge. ¡Recibe una bebida de cortesía por persona como bienvenida!",
      "<strong><strong>Elite Valet MasterCard:</strong></strong> En el Aeropuerto Internacional de la Ciudad de México encontraras el servicio de Elite Valet MC. Con tu Tarjeta Citibanamex Platinum obtén 50% de descuento. El servicio es por hasta 5 días naturales, 2 entradas por mes.",
      "<strong>Meses sin intereses en negocios participantes:</strong> Compra tus viajes, tecnología, ropa y mucho más.",
      "<strong><strong>Preventas exclusivas</strong></strong>: Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
    ],
  },
  {
    id: "explora",
    name: "Explora Banamex",
    segment: "platinum",
    color: "#706F6F",
    image:
      "img/explora.png",
    income: "75 MIL",
    cat: "79.5% sin IVA",
    rate: "57.17%",
    admin: "$227.08 sin IVA",
    additional: "$113.33 sin IVA",
    validity:
      "<strong>CAT PROMEDIO 79.5% sin IVA Informativo.</strong> Vigencia de la oferta: <strong>24 de Marzo del 2026 al 24 de Septiembre del 2026.</strong> Tasa de interés anual promedio ponderada de <strong>57.17% tasa variable</strong> y una comisión por <strong>administración mensual de $227.08 sin IVA</strong>, ¿de acuerdo?",
    script:
      "Según su perfil, el producto que le estaría recomendando es la TDC EXPLORA, la cual ya es una categoría PLATINUM que le estará brindando beneficios exclusivos de esta categoría, como 10 accesos gratuitos anuales en aeropuertos de la Ciudad de México (T1 y T2), Guadalajara y Monterrey, para brindarle mayor comodidad en sus viajes, incluso meses sin intereses en múltiples espacios, para ello, yo lo apoyaré con su solicitud.\n\nEsta tarjeta EXPLORA le genera una administración mensual de $227.08 sin IVA, la cual podrá exentar con una compra mínima de 300 pesos al mes en el primer año.\n\nCAT PROMEDIO 79.5% sin IVA. Tasa de interés anual promedio ponderada de 57.17% tasa variable y una comisión por administración mensual de $227.08 sin IVA, ¿de acuerdo?",
    bonification: [
      "<strong>Activar la TDC Física y Digital asi como NetKey</strong>",
      "<strong><strong>Realizar una compra sin monto mínimo con la tarjeta digital el primer mes.</strong></strong>",
      "<strong>A partir del segundo mes y hasta el mes 12 deberá mantener un consumo mínimo en compras de $300 con la tarjeta de crédito física o digital, para exentar la administración mensual.</strong>",
    ],
    benefits: [
      "<strong>1.15 PUNTOS MOMENTOS BANAMEX:</strong> por cada dólar gastado (o su equivalente en pesos). ¡Tus Tarjetas adicionales también generan puntos por compras!",
      "<strong>2X1 EN BOLETOS DE AVIÓN:</strong> Viaja a playas nacionales con un certificado 2x1 en boletos de avión, puedes obtenerlo como bienvenida durante los primeros 3 meses con tu tarjeta o en cada aniversario. La condición para obtener el de bienvenida es acumular <strong><strong>1,300 puntos en los primeros 3 meses</strong></strong>, y para obtener el de aniversario, debe acumular <strong>mínimo 10,000 PUNTOS</strong>.",
      "<strong>10 accesos GRATIS en las SALAS BEYOND</strong> para usted y 1 acompañante y… <strong>4 accesos a Salas Mastercard Airport Experiences</strong> en mas de 800 salas VIP alrededor del mundo al año",
      "<strong>MASTERCARD CONCIERGE</strong> asistente personal 24/7, Atención personalizada en todo el mundo para realizar reservas de restaurantes, coordinación de eventos especiales, entre otras.",
      "<strong><strong>Elite Valet MasterCard:</strong></strong> En el Aeropuerto Internacional de la Ciudad de México encontraras el servicio de Elite Valet MC. Con tu Tarjeta Citibanamex Platinum obtén 50% de descuento. El servicio es por hasta 5 días naturales, 2 entradas por mes.",
      "<strong>SEGUROS MASTERCARD:</strong> Recibe asistencias de viaje, equipaje, autos y toda la protección que necesitas.",
      "<strong><strong>Preventas exclusivas</strong></strong>: Compra tus boletos antes que nadie, elige el mejor lugar para tus eventos culturales, deportivos y lo mejor de los espectáculos en México.",
    ],
    extraImage:
      "img/explora-beneficios.png",
    extraTitle: "Destinos y certificado 2x1 (beneficios de viaje)",
  },
];

const SEGMENTS = [
  { id: "clasico", label: "Segmento Clásico", bar: "#009CC6" },
  { id: "oro", label: "Segmento Oro", bar: "#A9863B" },
  { id: "platinum", label: "Segmento Platinum", bar: "#5B6367" },
];

/* ============================================================
   DATOS: dígitos por banco
   Para agregar las imágenes de cada banco, sustituye el arreglo
   "images" con las rutas de tus archivos, por ejemplo:
   images: ["img/invex-1.png", "img/invex-2.png", "img/invex-3.png"]
   ============================================================ */
const DIGITOS = [
  { id: "invex", name: "INVEX", images: ["img/INX-2.jpeg", "img/INX-1.jpeg"] },
  { id: "bbva", name: "BBVA", images: ["img/BBVA-1.jpeg","img/BBVA-2.jpeg"] },
  { id: "banamex", name: "BANAMEX", images: ["img/BANA-1.jpeg","img/BANA-2.jpeg","img/BANA-3.jpeg","img/BANA-4.jpeg","img/BANA-5.jpeg"] },
  { id: "plata", name: "PLATA Card", images: ["img/Plata-1.jpeg","img/Plata-2.jpeg","img/Plata-3.jpeg","img/Plata-4.jpeg"] },
  { id: "nu", name: "NU", images: [] },
  { id: "C&A", name: "C&A Bradescard", images: ["img/CYA-1.jpeg"] },
];

/* ============================================================
   RENDER: navegación lateral
   ============================================================ */
const EXTERNAL_LINKS = [
  { name: "Agendas", url: "https://agendas-rab6.onrender.com/", icon: "assets/agenda.svg" },
  {
    name: "Vicidial",
    url: "https://aliadosmed.directo.com/agc/vicidial.php",
    icon: "assets/dial.svg",
  },
  {
    name: "CRM",
    url: "http://aliados.medc.com.mx:7070/MA_ALIADOS",
    icon: "assets/crm.svg",
  },
  { name: "Renapo (CURP)", url: "https://www.gob.mx/curp", icon: "assets/curp.svg" },
  {
    name: "Formalización",
    url: "https://docs.google.com/spreadsheets/d/1VcjjlgxWYKs2rRVI-MwBDXtqmDICwqb0lYqVTqrTnAk/edit?usp=sharing",
    icon: "assets/drive.svg",
  },
];

function renderNav() {
  const nav = document.getElementById("navContainer");
  let html = "";
  SEGMENTS.forEach((seg) => {
    html += `<div class="nav-group">
      <div class="nav-group-label">${seg.label}</div>`;
    CARDS.filter((c) => c.segment === seg.id).forEach((c) => {
      const shortName = c.name.replace(" Banamex", "");
      html += `<button class="nav-item" data-card="${c.id}" onclick="openCard('${c.id}')" title="${shortName}">
        <span class="dot" style="background:${c.color}"></span><span class="nav-label">${shortName}</span>
      </button>`;
    });
    html += `</div>`;
  });

  html += `<div class="nav-group">
    <div class="nav-group-label">Enlaces</div>`;
  EXTERNAL_LINKS.forEach((link) => {
    html += `<a class="nav-item" href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.name}">
<span class="ico" style="-webkit-mask-image:url('${link.icon}');mask-image:url('${link.icon}')"></span><span class="nav-label">${link.name}</span><span class="ext-arrow">↗</span>    </a>`;
  });
  html += `</div>`;

  nav.innerHTML = html;

  const calc = document.createElement("div");
  calc.className = "nav-calc";
  calc.innerHTML = `<button class="nav-item" data-view="puntos" onclick="showView('puntos')" title="Calculadora de puntos"><span class="ico" style="-webkit-mask-image:url('assets/cal.svg');mask-image:url('assets/cal.svg')"></span><span class="nav-label">Calculadora de puntos</span></button>
  <button class="nav-item" data-view="digitos" onclick="showView('digitos')" title="Dígitos"><span class="ico" style="-webkit-mask-image:url('assets/dig.svg');mask-image:url('assets/dig.svg')"></span><span class="nav-label">Dígitos</span></button>`;
  document.getElementById("sidebar").appendChild(calc);

  // add a home nav item at very top of nav container (before groups)
  const homeBtn = document.createElement("button");
  homeBtn.className = "nav-item";
  homeBtn.setAttribute("data-view", "home");
  homeBtn.title = "Inicio / Menú general";
  homeBtn.innerHTML =
    '<span class="ico" style="-webkit-mask-image:url(\'assets/home.svg\');mask-image:url(\'assets/home.svg\')"></span><span class="nav-label">Inicio / Menú general</span>';;
  homeBtn.onclick = () => showView("home");
  nav.prepend(homeBtn);
}

/* ============================================================
   RENDER: grid del menú principal (home)
   ============================================================ */
function renderHome() {
  const cont = document.getElementById("segmentsContainer");
  let html = "";
  SEGMENTS.forEach((seg) => {
    html += `<div class="segment-block">
      <div class="segment-title"><span class="bar" style="background:${seg.bar}"></span>${seg.label}</div>
      <div class="card-grid">`;
    CARDS.filter((c) => c.segment === seg.id).forEach((c) => {
      html += `<button class="tcard" onclick="openCard('${c.id}')">
        <img src="${c.image}" alt="${c.name}">
        <div class="tc-body">
          <div class="tc-name">${c.name}</div>
          <div class="tc-meta">Ingresos desde ${c.income} · CAT ${c.cat}</div>
        </div>
      </button>`;
    });
    html += `</div></div>`;
  });
  cont.innerHTML = html;
}

/* ============================================================
   RENDER: detalle de tarjeta
   ============================================================ */
function openCard(id) {
  const c = CARDS.find((x) => x.id === id);
  if (!c) return;
  currentScript = c.script || "";
  currentCardName = c.name;
  const seg = SEGMENTS.find((s) => s.id === c.segment);
  const cont = document.getElementById("cardDetailContainer");

  const benefitsHtml =
    c.benefits && c.benefits.length
      ? `
    <ul class="benefits-list">
      ${c.benefits.map((b) => `<li>${b}</li>`).join("")}
    </ul>`
      : '<p class="script-text">Sin beneficios adicionales registrados.</p>';

  const scriptHtml = c.script
    ? `<p class="script-text">${c.script}</p>`
    : '<p class="script-text">Sin script registrado.</p>';

  const bonifHtml = Array.isArray(c.bonification)
    ? `<ol class="bonif-list">${c.bonification.map((step) => `<li>${step}</li>`).join("")}</ol>`
    : c.bonification
      ? `<p class="script-text">${c.bonification}</p>`
      : '<p class="script-text">No aplica.</p>';

  const vigenciasHtml = c.validity
    ? `<p class="script-text">${c.validity}</p>`
    : '<p class="script-text">Sin información de vigencia.</p>';

  cont.innerHTML = `
    <h1 class="detail-page-title">${c.name}</h1>

    <div class="detail-header">
      <div class="detail-img-col">
        <div class="detail-segment-tag"><span class="dot" style="background:${c.color}"></span>${seg.label}</div>
        <div class="detail-img-wrap"><img src="${c.image}" alt="${c.name}"></div>
      </div>

      <div class="costos-panel" style="--accent:${c.color}">
        <div class="costos-title">Costos y comisiones</div>
        <div class="costos-grid">
          <div class="stat"><div class="label">Ingresos mensuales</div><div class="value">${c.income}</div></div>
          <div class="stat"><div class="label">CAT anual</div><div class="value">${c.cat}</div></div>
          <div class="stat"><div class="label">Tasa de interés anual</div><div class="value">${c.rate}</div></div>
          <div class="stat"><div class="label">Administración mensual</div><div class="value">${c.admin}</div></div>
          <div class="stat"><div class="label">Adicional</div><div class="value">${c.additional}</div></div>
          <div class="stat stat-button" onclick="openScript()">
          <div class="script-icon"></div><div class="label">Script de venta</div><div class="value">Haz clic para visualizar →</div></div></div>
        </div>
      </div>
    </div>
      <div class="waiver-block">
          <div class="waiver-title">${c.id === "joy" ? "Sin comisión de administración de por vida" : "Bonificación de administración mensual"}</div>
          ${bonifHtml}</div>
     
    <div class="detail-two-col">
      <div class="extra-block"><h2>Beneficios</h2>${benefitsHtml}</div>
      <div class="extra-block"><h2>Vigencias</h2>${vigenciasHtml}</div>
    </div>

    ${c.extraImage ? `<div class="extra-block" style="margin-top:22px;"><h2>${c.extraTitle}</h2><img src="${c.extraImage}" alt="Beneficios ${c.name}"></div>` : ""}
  `;
  showView("card");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-item[data-card="${id}"]`);
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   RENDER: menú de Dígitos (lista de bancos)
   ============================================================ */
function renderDigitos() {
  const cont = document.getElementById("digitosContainer");
  let html = "";
  DIGITOS.forEach((d) => {
    html += `<button class="digito-btn" onclick="openDigito('${d.id}')">${d.name}</button>`;
  });
  cont.innerHTML = html;
}

/* ============================================================
   RENDER: detalle de dígitos por banco
   ============================================================ */
function openDigito(id) {
  const d = DIGITOS.find((x) => x.id === id);
  if (!d) return;
  const cont = document.getElementById("digitoDetailContainer");

  const slots = d.images && d.images.length ? d.images : ["", "", ""];
  const cardsHtml = slots
    .map(
      (src) => `
    <div class="digito-card">
      ${
        src
          ? `<img src="${src}" alt="Dígitos ${d.name}">`
          : `<div class="digito-placeholder">Próximamente</div>`
      }
    </div>`,
    )
    .join("");

  cont.innerHTML = `
    <h1 class="detail-page-title" style="text-align:center">${d.name}</h1>
    <div class="digito-cards-grid">${cardsHtml}</div>
  `;
  showView("digito-detail");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector('.nav-item[data-view="digitos"]');
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   Navegación entre vistas
   ============================================================ */
function showView(name) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (navBtn) navBtn.classList.add("active");
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Sidebar móvil ---------- */
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}
document.getElementById("burgerBtn").addEventListener("click", openSidebar);
document.getElementById("overlay").addEventListener("click", closeSidebar);

/* ---------- Sidebar: contraer / expandir (escritorio) ---------- */
function setSidebarCollapsed(collapsed) {
  const sb = document.getElementById("sidebar");
  sb.classList.toggle("collapsed", collapsed);
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn) toggleBtn.textContent = collapsed ? "☰" : "☰";
  try {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  } catch (e) {}
}
function toggleSidebarCollapsed() {
  const sb = document.getElementById("sidebar");
  setSidebarCollapsed(!sb.classList.contains("collapsed"));
}
document
  .getElementById("sidebarToggle")
  .addEventListener("click", toggleSidebarCollapsed);
(function restoreSidebarState() {
  let saved = null;
  try {
    saved = localStorage.getItem("sidebarCollapsed");
  } catch (e) {}

  if (saved === null) {
    setSidebarCollapsed(true);
    return;
  }

  if (saved === "1") setSidebarCollapsed(true);
})();

/* ---------- Sidebar: tooltip flotante al hacer hover en los iconos ---------- */
(function initSidebarTooltips() {
  const sidebar = document.getElementById("sidebar");
  let tooltipEl = null;

  function showTooltip(target) {
    // Solo cuando el sidebar está colapsado (modo solo iconos) y en escritorio
    if (!sidebar.classList.contains("collapsed")) return;

    const text = target.getAttribute("title") || target.getAttribute("data-tooltip");
    if (!text) return;

    // Evitar que aparezca el tooltip nativo del navegador duplicado
    target.setAttribute("data-tooltip", text);
    target.removeAttribute("title");

    hideTooltip();
    tooltipEl = document.createElement("div");
    tooltipEl.className = "sidebar-tooltip";
    tooltipEl.textContent = text;
    document.body.appendChild(tooltipEl);

    const rect = target.getBoundingClientRect();
    tooltipEl.style.top = rect.top + rect.height / 2 + "px";
    tooltipEl.style.left = rect.right + 14 + "px";
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  }

  sidebar.addEventListener(
    "mouseenter",
    (e) => {
      const item = e.target.closest && e.target.closest(".nav-item");
      if (item) showTooltip(item);
    },
    true
  );

  sidebar.addEventListener(
    "mouseleave",
    (e) => {
      const item = e.target.closest && e.target.closest(".nav-item");
      if (item) hideTooltip();
    },
    true
  );

  // Ocultar si se colapsa/expande el sidebar mientras el mouse está encima
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", hideTooltip);

  // Ocultar al hacer scroll dentro del sidebar (evita que quede "flotando")
  sidebar.addEventListener("scroll", hideTooltip);
})();

/* ============================================================
   Calculadora 1: conversión de puntos
   ============================================================ */
function calcPuntos() {
  const pct = parseFloat(document.getElementById("p_tarjeta").value);
  const gasto = parseFloat(document.getElementById("p_gasto").value) || 0;
  const puntos = gasto * pct;
  const bono = puntos * 0.1;
  document.getElementById("p_out_pct").textContent =
    (pct * 100).toFixed(0) + "%";
  document.getElementById("p_out_puntos").textContent = puntos.toLocaleString(
    "es-MX",
    { maximumFractionDigits: 2 },
  );
  document.getElementById("p_out_bono").textContent = bono.toLocaleString(
    "es-MX",
    { maximumFractionDigits: 2 },
  );
}
document.getElementById("p_tarjeta").addEventListener("change", calcPuntos);
document.getElementById("p_gasto").addEventListener("input", calcPuntos);

/* ============================================================
   Calculadora 2: tasas de interés
   ============================================================ */
function calcIntereses() {
  const anual = parseFloat(document.getElementById("i_tarjeta").value);
  const deuda = parseFloat(document.getElementById("i_deuda").value) || 0;
  const mensual = anual / 12;
  const intereses = deuda * mensual;
  document.getElementById("i_out_anual").textContent =
    (anual * 100).toFixed(2) + "%";
  document.getElementById("i_out_mensual").textContent =
    (mensual * 100).toFixed(2) + "%";
  document.getElementById("i_out_intereses").textContent =
    "$" + intereses.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}
document.getElementById("i_tarjeta").addEventListener("change", calcIntereses);
document.getElementById("i_deuda").addEventListener("input", calcIntereses);
/* ============================================================
   funciones para mostrar / ocultar modal de script
   ============================================================ */
function openScript() {
  document.getElementById("modalTitle").textContent =
    "Script de venta - " + currentCardName;

  document.getElementById("modalScript").textContent =
    currentScript || "No hay script registrado.";

  document.getElementById("scriptModal").classList.add("show");
}

function closeScript() {
  document.getElementById("scriptModal").classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeScript);

document.getElementById("scriptModal").addEventListener("click", (e) => {
  if (e.target.id === "scriptModal") closeScript();
});

/* ============================================================
   Init
   ============================================================ */
renderNav();
renderHome();
renderDigitos();
calcPuntos();
calcIntereses();
showView("home");