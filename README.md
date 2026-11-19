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
│   ├── notas-app/          # PWA independiente de Notas
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
│   ├── notes.sql
│   ├── note-sharing.sql
│   └── profiles.sql
└── README.md
```

### Frontend

La interfaz, los estilos, la lógica de navegación, las calculadoras y los datos
de las tarjetas están en `frontend/`.

Los estilos se organizan en módulos dentro de `frontend/src/css/`, con un archivo
por vista o área de la interfaz. `estilos.css`, enlazado desde
`frontend/index.html`, importa los módulos en el orden necesario. Para mantener
una sección del Manual, edita su archivo (por ejemplo, `inicio.css` o
`comision.css`); deja en `fundamentos.css` los tokens y estilos globales. La
interfaz de Notas se mantiene por separado en `frontend/notas-app/`. Al agregar
o reorganizar módulos del Manual, actualiza el orden de importación en
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

### App independiente de Notas

Notas ahora es una PWA independiente ubicada en `frontend/notas-app/`. Se puede
publicar esa carpeta en su propio sitio o servirla bajo `/notas-app/` junto al
Manual. Ambos frontends usan el mismo proyecto de Supabase, las cuentas
existentes, la tabla `notes` y las reglas de acceso compartido. La app recuerda
su sesión en el dispositivo donde se inicia; la sesión del Manual no se copia
automáticamente.

El título y el contenido de cada nota usan el corrector ortográfico nativo del
navegador en español. La detección y las sugerencias dependen de que el
navegador o el sistema operativo tenga habilitado un diccionario de español.

La configuración pública del proyecto está en
`frontend/notas-app/supabase-config.js`; si cambian la URL o la clave pública,
actualízalas también en `frontend/src/js/auth/supabase-config.js`. Usa solo la
clave `anon` protegida por RLS, nunca una clave `service_role`.

Para probar ambas apps en local, sirve `frontend/` desde la raíz del proyecto:

```powershell
py -m http.server 5500 --directory frontend
```

Abre `http://localhost:5500/` para el Manual y
`http://localhost:5500/notas-app/` para Notas. No abras los archivos como
`file://`, porque Supabase no puede completar correctamente el inicio de sesión
en ese modo. La opción de instalar aparece en Chrome cuando se sirve por HTTPS
o desde `localhost`.

El acceso a Notas desde el menú del Manual usa la ruta relativa
`notas-app/`. Si se publica Notas en otro dominio, cambia ese enlace por la URL
pública de la app.

### Backend de Notas

En Supabase agrega `http://localhost:5500/**` en Authentication > URL
Configuration > Redirect URLs. Al desplegar Notas, agrega también la URL HTTPS
de la app con el patrón `https://<dominio-de-notas>/**` para los enlaces de
recuperación. En Google conserva como URI de redirección la URL de callback de
Supabase:
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

El Manual y Notas tienen manifiestos e instalaciones PWA independientes.
Publica `frontend/` como raíz del Manual y, si quieres desplegarlas en el mismo
dominio, conserva `frontend/notas-app/` en la ruta `/notas-app/`. También puedes
publicar el contenido de esa carpeta en otro dominio. Chrome permite instalarlas
por separado desde HTTPS (o `localhost` durante desarrollo). Sus service workers
mantienen cachés separadas; autenticación, sincronización y edición en Supabase
requieren conexión.

### Backend

Este repositorio no incluye un servidor propio. Ambos frontends son estáticos y
usan Supabase como servicio externo de autenticación y datos.

Al añadir recursos, conserva las rutas relativas a `frontend/index.html`:
imágenes en `frontend/assets/images/`, iconos en `frontend/assets/icons/` y
scripts en `frontend/src/js/`.
