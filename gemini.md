# Resumen del Proyecto Gemini CLI

Este documento resume el estado actual y las funcionalidades implementadas en el proyecto, refactorizado para ser un generador multi-sitio escalable con un panel de administración web.

## Objetivo General

Refactorizar un proyecto Next.js de sitio único a un generador multi-sitio escalable con una interfaz de administración web para gestionar la creación, edición y contenido de sitios. El proyecto está configurado para despliegue estático bajo el subpath `/qr`.

## Tecnologías Clave

*   **Framework:** Next.js 14.2.3
*   **Librería UI:** React 18
*   **Estilos:** CSS Modules
*   **Base de Datos (simulada):** `db.json` (para almacenar la configuración de los sitios)

## Funcionalidades Implementadas

### 1. Generación Multi-sitio

*   **Estructura Dinámica:** Utiliza la generación dinámica de sitios a través de `app/[slug]` para servir múltiples micrositios desde una única base de código.
*   **Configuración de Rutas:** Cada sitio se accede a través de `/qr/[slug]`.

### 2. Panel de Administración Web

*   **CRUD de Sitios:** Interfaz de usuario completa para Crear, Leer (listar), Actualizar y Eliminar sitios.
*   **Formularios Dinámicos:** Permite la edición de diversas propiedades del sitio, incluyendo:
    *   **Datos Generales:** ID, Slug.
    *   **Tema y Estilo:** `color1`, `color2`, `angle` para degradados de fondo, `fontImportUrl` y `fontFamily` para fuentes personalizadas.
    *   **Metadatos (SEO):** Título y descripción del sitio.
    *   **Sección Principal (Hero):** Título, subtítulo, texto y enlace de botón, logo y video de fondo.
    *   **Sección "Acerca de":** Título, texto e imagen.
    *   **Sección Contacto Principal:** Título, texto y botón.
    *   **Página de Ubicación:** Dirección y URL de iframe de Google Maps.
    *   **Página de Servicios:** Título de la página y lista de servicios (título y descripción).
*   **Manejo de Archivos:**
    *   **Subida de Logo del Hero:** Se guarda forzando la extensión `.png` (ej. `hero_logo.png`).
    *   **Subida de Video del Hero:** Para el fondo de la sección Hero.
    *   **Subida de Imagen "Acerca de":** Para la sección "Acerca de".
    *   **Subida de Archivo vCard (`.vcf`):** Permite subir un archivo `.vcf` que luego se puede descargar desde la página de contacto del micrositio.
    *   **Subida de Iconos SVG para Acciones de Contacto:** Permite subir archivos SVG para iconos de acciones de contacto personalizadas (más allá de las 4 fijas).
    *   **Subida de Video para Splash Screen:** Permite subir un video para usarlo como fondo de la pantalla de bienvenida.

### 3. Temas y Estilos Dinámicos

*   **Degradados de Fondo:** Configuración de dos colores y un ángulo para generar degradados dinámicos.
*   **Fuentes Personalizadas:** Importación de fuentes externas (ej. Google Fonts) y aplicación de familias de fuentes.
*   **Inyección de Estilos:** Los estilos dinámicos se inyectan directamente en el `<head>` de `[slug]/layout.tsx` para evitar problemas de hidratación.

### 4. Funcionalidad de Contacto Mejorada

*   **Acciones de Contacto Fijas:** Las primeras 4 acciones de contacto (Guardar contacto, WhatsApp, Llamar Ahora, Enviar Email) son obligatorias y tienen iconos SVG por defecto. Solo se pueden editar el texto y el enlace.
*   **Acciones de Contacto Adicionales:** Se pueden añadir más acciones de contacto, que son completamente editables y permiten la subida de iconos SVG personalizados.
*   **Descarga de vCard:** Un botón en la página de contacto permite descargar el archivo `.vcf` subido.

### 5. Pantalla de Bienvenida (Splash Screen)

*   **Opcional:** Se puede habilitar/deshabilitar por sitio desde el panel de administración.
*   **Duración y Desvanecimiento:** Dura 5 segundos y comienza a desvanecerse a los 4.5 segundos.
*   **Video de Fondo:** Soporta la reproducción de un video como fondo del splash screen.
*   **Texto "Cargando...":** Muestra un texto de carga durante el splash.

### 6. Despliegue Estático

*   **`basePath: '/qr'`:** Configurado en `next.config.mjs` para servir la aplicación desde un subdirectorio `/qr`.
*   **Script `npm run export`:** Maneja el proceso de build para despliegues estáticos, moviendo temporalmente las carpetas `/admin` y `/api` para evitar conflictos.

## Correcciones Recientes y Mejoras

*   **Errores de Hidratación:** Resueltos mediante la refactorización de la inyección de estilos y la estructura de componentes.
*   **Errores `MODULE_NOT_FOUND`:** Abordados limpiando la caché `.next`.
*   **Inconsistencias en `db.json`:** Corregidas para asegurar la consistencia de los datos del sitio.
*   **Errores de Sintaxis:** Resueltos en archivos de administración y CSS.
*   **Duplicación de `basePath`:** Corregida en la construcción de enlaces de navegación y botones de acción.
*   **Tamaño del Logo del Hero:** Ajustado para evitar que sea excesivamente grande.
*   **Visibilidad y Estilos de Secciones:** Mejorados para las secciones "About" y "Main Contact", asegurando fondos y colores de texto adecuados.
*   **Posicionamiento del Video del Splash Screen:** Corregido para que ocupe el 100% del ancho y alto de la pantalla.
*   **Centrado de Contenido del Hero:** Ajustes CSS para asegurar que los elementos del hero estén centrados y visibles sobre el video.
*   **Formato de Secciones:** Ajustes CSS para asegurar que las secciones "About" y "Main Contact" tengan un formato adecuado.
