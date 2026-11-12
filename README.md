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
│       │   ├── notas.css                   # Vista de notas
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
└── README.md
```

### Frontend

La interfaz, los estilos, la lógica de navegación, las calculadoras y los datos
de las tarjetas están en `frontend/`.

Los estilos se organizan en módulos dentro de `frontend/src/css/`, con un archivo
por vista o área de la interfaz. `estilos.css`, enlazado desde
`frontend/index.html`, importa los módulos en el orden necesario. Para mantener
una sección, edita su archivo (por ejemplo, `inicio.css`, `notas.css` o
`comision.css`); deja en `fundamentos.css` los tokens y estilos globales. Al
agregar o reorganizar módulos, actualiza el orden de importación en `estilos.css`.

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

### Inicio de sesión local

Para probar las notas y el inicio de sesión con Google, sirve `frontend/` con
un servidor local. Desde la raíz del proyecto ejecuta:

```powershell
py -m http.server 5500 --directory frontend
```

Después abre `http://localhost:5500/`. No abras `frontend/index.html` como
`file://`, porque Supabase no puede completar correctamente el retorno OAuth en
ese modo.

En Supabase agrega `http://localhost:5500/**` en Authentication > URL
Configuration > Redirect URLs. En Google conserva como URI de redirección la
URL de callback de Supabase:
`https://dpntowblygwkjybemoqk.supabase.co/auth/v1/callback`.

Para habilitar la validación de usuarios al compartir notas, ejecuta también
el contenido actualizado de `supabase/note-sharing.sql` en el SQL Editor de
Supabase. Este script también habilita que el propietario quite accesos y que
cada destinatario deje de ver una nota compartida.

Para habilitar el acceso por nombre de usuario y la recuperación por correo,
ejecuta primero `supabase/profiles.sql` y después `supabase/note-sharing.sql`.
El script supone que `profiles` y los usuarios Auth ya existen con sus `id` y
`username`; no crea usuarios nuevos. El correo se obtiene internamente desde
`auth.users` solo al guardar el acceso. Al compartir una nota se muestran
los nombres de usuario, aunque el acceso se guarda internamente con el correo
para conservar compatibilidad con las notas existentes.

Para habilitar las fechas en las notas (incluidas las existentes), ejecuta
`supabase/notes.sql` en el SQL Editor de Supabase. Las notas anteriores reciben
la fecha en que fueron creadas.

Para habilitar el panel administrativo, ejecuta después `supabase/admin-panel.sql`.
Además de los permisos y datos de tarjetas, este script crea la función protegida
que permite a un administrador cambiar la contraseña de cualquier usuario desde
la tabla de usuarios. La contraseña se guarda como hash en Supabase Auth y el
administrador debe comunicar la contraseña temporal al usuario de forma segura.

Para habilitar el apartado de sugerencias, ejecuta `supabase/suggestions.sql`
después de `supabase/admin-panel.sql`. Los usuarios del manual podrán enviar un
mensaje y dejar el nombre en blanco; solo un administrador activo podrá leer los
mensajes en Panel administrativo > Sugerencias. El SQL también permite inserciones
sin sesión por si el acceso al manual se hace público más adelante.

### Instalar como aplicacion

El frontend incluye un manifiesto web y un service worker para que Chrome pueda
ofrecer la instalacion. Publica el contenido de `frontend/` como raiz del sitio
y accede mediante HTTPS (o `localhost` durante desarrollo). Al abrir el sitio,
Chrome mostrara la opcion de instalar cuando se cumplan sus criterios; el
service worker conserva la pagina principal para abrirla sin conexion. Las
funciones que dependen de Supabase o de servicios externos requieren conexion.

### Backend

No hay backend en este proyecto: no existe servidor, API ni base de datos.
Actualmente, el sitio funciona enteramente en el navegador.

Al añadir recursos, conserva las rutas relativas a `frontend/index.html`:
imágenes en `frontend/assets/images/`, iconos en `frontend/assets/icons/` y
scripts en `frontend/src/js/`.
