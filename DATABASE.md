# Base de Datos SQLite

Este proyecto ahora utiliza **SQLite** (vía `bun:sqlite`) para almacenar la configuración de los micrositios, visitas y archivos subidos.

## 📁 Ubicación

La base de datos se encuentra en: `micrositios.db` (en la raíz del proyecto)

Los archivos temporales de SQLite (WAL, SHM) se generan automáticamente y están ignorados en `.gitignore`.

## 🗄️ Tablas

### `sites`
Almacena la configuración de todos los micrositios.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | TEXT | ID único del sitio |
| `slug` | TEXT | Slug para la URL (único) |
| `data` | TEXT | JSON con toda la configuración del sitio |
| `created_at` | DATETIME | Fecha de creación |
| `updated_at` | DATETIME | Última actualización |

### `visits`
Registro de visitas para analytics.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID autoincremental |
| `slug` | TEXT | Slug del sitio visitado |
| `page` | TEXT | Página visitada |
| `ip` | TEXT | IP del visitante |
| `user_agent` | TEXT | User agent del navegador |
| `referrer` | TEXT | URL de referencia |
| `timestamp` | DATETIME | Fecha y hora de la visita |

### `uploads`
Registro de archivos subidos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID autoincremental |
| `site_slug` | TEXT | Slug del sitio (foreign key) |
| `filename` | TEXT | Nombre del archivo |
| `original_name` | TEXT | Nombre original del archivo |
| `path` | TEXT | Ruta del archivo |
| `mime_type` | TEXT | Tipo MIME del archivo |
| `size` | INTEGER | Tamaño en bytes |
| `uploaded_at` | DATETIME | Fecha de subida |

## 🛠️ Comandos Disponibles

### Listar sitios
```bash
bun run db:list
```

### Crear nuevo sitio
```bash
bun run db:create <id> <slug> [titulo]

# Ejemplo:
bun run db:create not-178 cancun "Notaría 178 Cancún"
```

### Exportar base de datos a JSON
```bash
bun run db:export [archivo-salida]

# Ejemplo:
bun run db:export backup-2024.json
```

### Migrar desde JSON (solo una vez)
```bash
bun run db:migrate
```

## 📝 Uso Programático

### Importar la base de datos
```typescript
import db, { siteQueries, visitQueries, uploadQueries } from '@/lib/db';

// Obtener todos los sitios
const sites = siteQueries.getAll();

// Obtener un sitio por slug
const site = siteQueries.getBySlug('not-23-edomex');

// Crear un nuevo sitio
siteQueries.create('mi-id', 'mi-slug', datosDelSitio);

// Actualizar un sitio
siteQueries.update('mi-slug', nuevosDatos);

// Eliminar un sitio
siteQueries.delete('mi-slug');
```

### Registrar una visita
```typescript
import { visitQueries } from '@/lib/db';

visitQueries.record(
  'not-23-edomex',  // slug
  '/contacto',      // página
  '192.168.1.1',    // IP
  'Mozilla/5.0...', // user agent
  'https://...'     // referrer
);
```

## 🔄 Migración desde JSON

El archivo `db.json` fue migrado a SQLite. Se creó un backup en `db.json.backup`.

Para verificar que la migración fue exitosa:
1. Ejecuta `bun run db:list` para ver todos los sitios
2. Prueba el panel de administración `/admin`
3. Verifica que los sitios se pueden editar y guardar

Una vez confirmado, puedes eliminar o archivar `db.json` si lo deseas.

## 📊 Consultas Útiles

```bash
# Ver estadísticas de visitas
bun -e "import { Database } from 'bun:sqlite'; const db = new Database('micrositios.db'); console.log('Total visitas:', db.prepare('SELECT COUNT(*) FROM visits').get());"

# Ver sitios creados hoy
bun -e "import { Database } from 'bun:sqlite'; const db = new Database('micrositios.db'); console.log(db.prepare('SELECT * FROM sites WHERE DATE(created_at) = DATE(\"now\")').all());"
```

## 🔒 Seguridad

- La base de datos está en formato binario SQLite
- Los archivos `.db`, `.db-wal`, `.db-shm` están en `.gitignore`
- No commitees la base de datos a menos que sea necesario
- Usa `bun run db:export` para crear backups versionables en JSON
