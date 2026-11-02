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
│       │   ├── styles.css             # Punto de entrada; importa los módulos CSS
│       │   ├── foundation.css         # Variables, temas y estilos base
│       │   ├── layout.css             # Estructura, navegación y vista principal
│       │   ├── card-details.css       # Detalles y beneficios de tarjetas
│       │   ├── dark-theme.css         # Acabados del tema oscuro
│       │   ├── calculator-modals.css  # Calculadora y ventanas modales
│       │   └── responsive.css         # Ajustes para pantallas pequeñas
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

Los estilos se organizan en módulos dentro de `frontend/src/css/`. El archivo
`styles.css`, enlazado desde `frontend/index.html`, importa los módulos en el
orden necesario: estilos base, estructura, detalles de tarjetas, tema oscuro,
calculadora y modales, y ajustes responsivos. Para agregar o reorganizar estilos,
edita el módulo correspondiente y conserva el orden de importación.

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
