# Manual de Tarjetas Banamex

Sitio web estático hecho con HTML, CSS y JavaScript. El proyecto tiene frontend;
no incluye backend ni requiere instalar dependencias o compilarse. Abre
`frontend/index.html` en un navegador o sírvelo con una extensión de servidor
local.

## Estructura

```text
.
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── icons/       # Iconos SVG de la interfaz
│   │   └── images/      # Imágenes de tarjetas, bancos y favicon
│   └── src/
│       ├── css/
│       │   └── styles.css
│       └── js/
│           ├── cards/                 # Datos de cada tarjeta
│           ├── components/            # Componentes reutilizables
│           ├── app-data.js            # Datos compartidos
│           ├── benefit-renderers.js   # Vistas de beneficios y redención
│           ├── card-details.js        # Detalles de tarjetas
│           ├── calculators.js         # Calculadoras
│           ├── modals.js              # Ventanas modales
│           ├── navigation.js          # Menús y cambio de vistas
│           ├── script.js              # Inicialización de la aplicación
│           └── sidebar.js             # Comportamiento del menú lateral
└── README.md
```

### Frontend

La interfaz, los estilos, la lógica de navegación, las calculadoras y los datos
de las tarjetas están en `frontend/`.

### Backend

No hay backend en este proyecto: no existe servidor, API ni base de datos.
Actualmente, el sitio funciona enteramente en el navegador.

Al añadir recursos, conserva las rutas relativas a `frontend/index.html`:
imágenes en `frontend/assets/images/`, iconos en `frontend/assets/icons/` y
scripts en `frontend/src/js/`.
