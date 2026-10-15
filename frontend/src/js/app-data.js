/* Estado y datos compartidos por los módulos de la aplicación. */
let currentScript = "";
let currentCardName = "";
const CARDS = Object.values(window.CARD_DATA || {});

/* Segmentos usados para agrupar las tarjetas en la navegación y la página de inicio. */
const SEGMENTS = [
  { id: "clasico", label: "Segmento Clásico", bar: "#009CC6" },
  { id: "oro", label: "Segmento Oro", bar: "#A9863B" },
  { id: "platinum", label: "Segmento Platinum", bar: "#5B6367" },
];

/* Imágenes disponibles para la vista de dígitos de cada banco. */
const DIGITOS = [
  { id: "invex", name: "INVEX", images: ["assets/images/INX-2.jpeg", "assets/images/INX-1.jpeg"] },
  { id: "bbva", name: "BBVA", images: ["assets/images/BBVA-1.jpeg", "assets/images/BBVA-2.jpeg"] },
  {
    id: "banamex",
    name: "BANAMEX",
    images: [
      "assets/images/BANA-1.jpeg",
      "assets/images/BANA-2.jpeg",
      "assets/images/BANA-3.jpeg",
      "assets/images/BANA-4.jpeg",
      "assets/images/BANA-5.jpeg",
    ],
  },
  {
    id: "plata",
    name: "PLATA Card",
    images: [
      "assets/images/Plata-1.jpeg",
      "assets/images/Plata-2.jpeg",
      "assets/images/Plata-3.jpeg",
      "assets/images/Plata-4.jpeg",
    ],
  },
  { id: "nu", name: "NU", images: [] },
  { id: "C&A", name: "C&A Bradescard", images: ["assets/images/CYA-1.jpeg"] },
];
