/**
 * @type {import('next').NextConfig}
 * @description Configuración de Next.js para el proyecto.
 *              Este archivo define cómo Next.js debe compilar y servir la aplicación.
 */
const nextConfig = {
  /**
   * @property {string} output
   * @description Configura Next.js para exportar la aplicación como un sitio estático.
   *              Esto significa que todas las páginas HTML, CSS y JavaScript se generan en tiempo de construcción
   *              y pueden ser servidas por cualquier servidor web sin necesidad de un servidor Node.js.
   *              Es ideal para micrositios o sitios que no requieren renderizado del lado del servidor en tiempo real.
   */
  output: 'export',

  /**
   * @property {string} basePath
   * @description Define un prefijo de ruta para todas las rutas de la aplicación.
   *              En este caso, la aplicación se servirá desde el subdirectorio '/not214c'.
   *              Esto es útil cuando la aplicación no se aloja en la raíz de un dominio,
   *              sino dentro de una subcarpeta.
   */
  basePath: '/not214c',

  /**
   * @property {object} images
   * @description Configuración relacionada con la optimización de imágenes en Next.js.
   */
  images: {
    /**
     * @property {boolean} images.unoptimized
     * @description Deshabilita la optimización automática de imágenes de Next.js.
     *              Cuando se exporta un sitio estático, el optimizador de imágenes de Next.js
     *              no puede funcionar en tiempo de ejecución, por lo que se deshabilita.
     *              Las imágenes se servirán tal cual, sin transformaciones automáticas.
     */
    unoptimized: true,
  },
};

/**
 * @description Exporta el objeto de configuración de Next.js.
 */
module.exports = nextConfig;