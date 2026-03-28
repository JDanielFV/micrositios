# Plan de Rediseño: Interfaz de Edición "Wizard" y Previsualización Ultra-Reactiva

Este plan detalla la transformación del panel de edición de micrositios en una experiencia guiada paso a paso, con previsualización permanente y reactividad inmediata para archivos y textos.

## Objetivos
- **Claridad:** Dividir el formulario extenso en pasos lógicos (Wizard).
- **Reactividad Extrema:** Reflejar cambios de texto y archivos (imágenes/videos) al instante usando `blob:` URLs.
- **Contexto Automático:** Navegar la previsualización a la página correspondiente según el paso que se esté editando.
- **Estética Superior:** Interfaz limpia, moderna y profesional.

## Cambios Propuestos

### 1. Sistema de Pasos (Wizard) en `src/app/admin/edit/[slug]/page.tsx`
- Implementar estado `currentStep` para controlar el flujo.
- Definir 6 pasos:
    1.  **Estilo e Identidad:** Colores, fuentes, ID y Slug. (Previsualización: `/`)
    2.  **Sección Hero:** Títulos, Logo, Video/Imagen de fondo. (Previsualización: `/`)
    3.  **Historia (About):** Título, texto e imagen. (Previsualización: `/`)
    4.  **Servicios:** Listado de servicios y descripción. (Previsualización: `/servicios/`)
    5.  **Ubicación:** Dirección y mapa. (Previsualización: `/ubicacion/`)
    6.  **Contacto:** Botones de acción, vCard y redes. (Previsualización: `/contacto/`)

### 2. Previsualización Instantánea de Archivos
- Actualizar `handleFileChange` para generar `URL.createObjectURL(file)`.
- Enviar estos URLs temporales al `iframe` mediante `postMessage`.
- Las páginas del micrositio usarán estos URLs para mostrar imágenes/videos antes de que se suban formalmente al servidor.

### 3. Automatización del Preview Panel
- Bloquear la previsualización en pantalla (sin opción a cerrar).
- Sincronizar la navegación del `iframe` con el cambio de pasos en el formulario.
- Asegurar que los datos se re-envíen al `iframe` tras cada cambio de ruta interna.

### 4. Estilos y Layout en `Admin.module.css`
- Crear un encabezado de pasos (stepper) visualmente atractivo.
- Ajustar el contenedor para que el formulario y el preview coexistan perfectamente.
- Mejorar la legibilidad de los campos de entrada y selectores de color.

## Pasos de Implementación
1.  **Modificar CSS:** Añadir clases para el stepper y el layout fijo.
2.  **Refactorizar Componente de Edición:** Implementar la lógica de pasos y la gestión de previsualizaciones de archivos.
3.  **Actualizar PreviewPanel:** Añadir control de navegación y persistencia de visibilidad.
4.  **Ajustar Componentes del Micrositio:** Asegurar compatibilidad con `blob:` URLs.

## Verificación
- Confirmar que al pasar del paso 3 al 4, el preview cambia a `/servicios/`.
- Verificar que al seleccionar una imagen, esta aparece en el preview antes de dar click a "Guardar".
- Validar que el botón "Guardar" sigue funcionando correctamente y persiste los datos en la base de datos.
