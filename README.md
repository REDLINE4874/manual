# Manual de Tarjetas Banamex

Frontends estáticos hechos con HTML, CSS y JavaScript. El repositorio no incluye
un servidor propio ni requiere instalar dependencias o compilarse; la
autenticación y los datos usan Supabase. Sirve `frontend/` con un servidor local
para probarlos.

## Estructura

```text
.
├── frontend/
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── assets/
│   │   ├── icons/       # Iconos SVG de la interfaz
│   │   └── images/      # Imágenes de tarjetas, bancos y favicon
│   └── src/
│       ├── css/
│       │   ├── estilos.css                 # Punto de entrada de los módulos CSS
│       │   ├── fundamentos.css             # Variables, temas y estilos base
│       │   ├── estructura.css              # Contenedor y contenido compartido
│       │   ├── menu-lateral.css            # Navegación lateral
│       │   ├── barra-movil.css             # Barra superior móvil
│       │   ├── pestanas-internas.css       # Pestañas de navegación
│       │   ├── inicio.css                  # Inicio y tarjetas
│       │   ├── validacion-tarjetas.css     # Tabla de validación
│       │   ├── comision.css                # Vista de comisión
│       │   ├── documentos.css              # Documentos, guía y contenido externo
│       │   ├── digitos.css                 # Consulta de dígitos bancarios
│       │   ├── detalle-tarjetas.css        # Detalles y beneficios de tarjetas
│       │   ├── calculadoras-y-modales.css  # Calculadora y ventanas modales
│       │   ├── perfilamiento.css           # Vista de perfilamiento
│       │   ├── panel-administrativo.css    # Panel administrativo
│       │   ├── autenticacion.css           # Inicio de sesión
│       │   ├── tema-oscuro.css             # Ajustes del tema oscuro
│       │   ├── fondo-personalizado.css     # Fondos personalizados
│       │   ├── ajustes-fondo.css           # Ajustes de controles sobre fondos
│       │   ├── ajustes-indice.css          # Iconos y ajustes del índice
│       │   ├── adaptable.css               # Ajustes responsivos
│       │   └── bordes-flotantes.css        # Bordes de navegación y paneles elevados
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
├── supabase/
│   ├── admin-panel.sql
│   ├── profiles.sql
│   └── suggestions.sql
└── README.md
```

### Frontend

La interfaz, los estilos, la lógica de navegación, las calculadoras y los datos
de las tarjetas están en `frontend/`.

El menú **Personalización**, junto a Tema, agrupa los controles de Fondo y
Estilo. El estilo alterna entre brutalista y una variante suave con sombras
discretas; la elección se conserva en el navegador y no modifica el tema
claro/oscuro ni los colores.

Los estilos se organizan en módulos dentro de `frontend/src/css/`, con un archivo
por vista o área de la interfaz. `estilos.css`, enlazado desde
`frontend/index.html`, importa los módulos en el orden necesario. Para mantener
una sección del Manual, edita su archivo (por ejemplo, `inicio.css` o
`comision.css`); deja en `fundamentos.css` los tokens y estilos globales. Al
agregar o reorganizar módulos del Manual, actualiza el orden de importación en
`estilos.css`.

Los fondos principales y las superficies de panel usan HSL. El selector
personalizado limita el fondo a una luminosidad de 15% como mínimo y los
paneles a 20%; los colores cromáticos tienen un máximo de 30%, y los neutros
(saturación HSL de hasta 30%) pueden llegar a 93%. El tema oscuro fijo es una
excepción: usa HSL(0 0% 16.08%) para el fondo (#292929) y HSL(0 0% 21.18%)
para los paneles (#363636). Las sombras y los colores semánticos de estados,
etiquetas y notas también quedan fuera de estos límites.
Los textos principales, secundarios y semánticos usan colores de alto contraste
en ambos temas; en fondos personalizados el color de texto se elige según la
luminancia real de las superficies. Los estados de Perfilamiento conservan
contraste en ambos temas y ajustan texto y fondo al usar colores personalizados.
Los paneles y la navegación usan un contorno de 2px y un desplazamiento sólido
de 6px, sin desenfoque, en `#171717` para darles un aspecto neobrutalista,
también en el tema oscuro y los fondos personalizados. Las sombras pequeñas de
interacción y enfoque se conservan.

### Backend

Este repositorio no incluye un servidor propio. El frontend es estático y usa
Supabase como servicio externo de autenticación y datos. La configuración pública
está en `frontend/src/js/auth/supabase-config.js`; usa solo la clave `anon`
protegida por RLS, nunca una clave `service_role`.

La tabla `profiles` y los usuarios Auth deben existir antes de ejecutar
`supabase/profiles.sql`. Este script configura la consulta de nombre de usuario
usada por el inicio de sesión y protege la lectura de perfiles. Para habilitar el
panel administrativo, ejecuta después `supabase/admin-panel.sql`.
Además de los permisos y datos de tarjetas, este script crea la función protegida
que permite a un administrador cambiar la contraseña de cualquier usuario desde
la tabla de usuarios. La contraseña se guarda como hash en Supabase Auth y el
administrador debe comunicar la contraseña temporal al usuario de forma segura.

Para habilitar el apartado de sugerencias, ejecuta `supabase/suggestions.sql`
después de `supabase/admin-panel.sql`. Los usuarios del manual podrán enviar un
mensaje y dejar el nombre en blanco; solo un administrador activo podrá leer los
mensajes en Panel administrativo > Sugerencias. El SQL también permite inserciones
sin sesión por si el acceso al manual se hace público más adelante.

### Instalar como aplicación

El Manual es una PWA. Publícalo desde `frontend/`; Chrome permite instalarlo
desde HTTPS o `localhost`. La autenticación y los datos requieren conexión.

Al añadir recursos, conserva las rutas relativas a `frontend/index.html`:
imágenes en `frontend/assets/images/`, iconos en `frontend/assets/icons/` y
scripts en `frontend/src/js/`.
