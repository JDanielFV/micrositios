import Link from 'next/link';
import styles from './Header.module.css';

/**
 * @file Header.tsx
 * @description Este componente `Header` representa el encabezado de navegación de la aplicación.
 *              Muestra una lista de enlaces de navegación y puede controlar su visibilidad.
 */

/**
 * @interface HeaderProps
 * @description Define las propiedades que acepta el componente `Header`.
 * @property {Array<{ text: string; link: string; }>} links - Un array de objetos, donde cada objeto representa un enlace de navegación.
 *           Cada enlace debe tener `text` (el texto a mostrar) y `link` (la URL de destino).
 * @property {boolean} [isVisible=true] - Propiedad opcional que controla la visibilidad del encabezado.
 *           Si es `true`, el encabezado es visible; si es `false`, puede estar oculto o tener estilos diferentes.
 */
interface HeaderProps {
  links: Array<{ text: string; link: string; }>;
  isVisible?: boolean;
}

/**
 * @function Header
 * @param {HeaderProps} props - Las propiedades pasadas al componente.
 * @returns {React.FC<HeaderProps>} El componente funcional de React para el encabezado.
 * @description Componente funcional que renderiza el encabezado de la página.
 *              Utiliza `next/link` para una navegación eficiente entre las páginas de Next.js.
 *              Aplica estilos condicionales basados en la propiedad `isVisible` para controlar su presentación.
 */
const Header: React.FC<HeaderProps> = ({ links, isVisible = true }) => {
  return (
    // La etiqueta <header> es el contenedor principal del encabezado.
    // La clase CSS se construye dinámicamente para controlar la visibilidad.
    <header className={`${styles.header} ${isVisible ? styles.headerVisible : ''}`}>
      {/* La etiqueta <nav> contiene los enlaces de navegación. */}
      <nav className={styles.nav}>
        {/* Itera sobre el array `links` para crear un `Link` por cada elemento. */}
        {links.map((item, index) => (
          <Link key={index} href={item.link} className={styles.link}>
            {item.text}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
