"use client";
import Header from '../components/Header/Header';
import db from '../../db.json';
import styles from './Home.module.css';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useState, useEffect } from 'react';

/**
 * @file page.tsx
 * @description Este archivo define la página principal (Home) de la aplicación.
 *              Utiliza componentes de React para estructurar el contenido y muestra información
 *              obtenida del archivo `db.json`.
 *              Incluye secciones como Hero, About y Contacto Principal, y gestiona la visibilidad del encabezado.
 */

// Componente reutilizable para botones de acción.
// Recibe `text` para el contenido del botón y `link` para la URL a la que apunta.
const ActionButton = ({ text, link }: { text: string, link: string }) => (
  <a href={link} className={`${styles.actionButton} ${styles.fadeInUp}`} style={{ animationDelay: '0.6s' }}>{text}</a>
);

// Componente de la sección Hero.
// Muestra una imagen de fondo, un título, un subtítulo y un botón de acción.
const Hero = ({ content }: { content: typeof db.hero }) => {
  return (
    <section 
      className={`${styles.section} ${styles.hero}`}
      style={{ backgroundImage: `url(${content.profileImage})` }}
    >
      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>Lic. Rosario Andrade Rodriguez</h1>
        <p className={`${styles.heroSubtitle} ${styles.fadeInUp}`} style={{ animationDelay: '0.3s' }}>Notaria titular No. 214</p>
        <ActionButton text={content.button.text} link={content.button.link} />
      </div>
    </section>
  );
};

// Componente de la sección About (Acerca de).
// Muestra un título, texto descriptivo y una imagen.
const About = ({ content }: { content: typeof db.about }) => (
  <section id="about" className={`${styles.section} ${styles.about}`}>
    <div className={styles.aboutContent}>
      <h2 className={styles.sectionTitle}>{content.title}</h2>
      <p>{content.text}</p>
    </div>
    <div 
      className={styles.aboutImage}
      style={{ backgroundImage: `url(${content.imageUrl})` }}
    ></div>
  </section>
);

// Componente de la sección de Contacto Principal.
// Muestra un título, texto y un botón de acción para contactar.
const MainContact = ({ content }: { content: typeof db.mainContact }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{content.title}</h2>
    <p>{content.text}</p>
    <ActionButton text={content.button.text} link={content.button.link} />
  </section>
);

/**
 * @function Home
 * @description Componente principal de la página de inicio.
 *              Gestiona el estado de visibilidad del `Header` basándose en el scroll del usuario
 *              y renderiza las diferentes secciones de la página.
 */
export default function Home() {
  // `isHeaderVisible` controla si el componente Header debe ser visible o no.
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  // `useEffect` se utiliza para añadir y limpiar un event listener de scroll.
  // Este listener detecta cuándo el usuario ha pasado la sección Hero para mostrar/ocultar el Header.
  useEffect(() => {
    const handleScroll = () => {
      // Obtiene la sección Hero para determinar su altura.
      const heroSection = document.querySelector(`.${styles.hero}`) as HTMLElement;
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        // Si el scroll vertical es mayor que la altura de la sección Hero, el Header se hace visible.
        if (window.scrollY > heroHeight) {
          setIsHeaderVisible(true);
        } else {
          setIsHeaderVisible(false);
        }
      }
    };

    // Añade el event listener cuando el componente se monta.
    window.addEventListener('scroll', handleScroll);
    // Limpia el event listener cuando el componente se desmonta para evitar fugas de memoria.
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar y al desmontar.

  return (
    // Fragmento de React para agrupar múltiples elementos sin añadir nodos extra al DOM.
    <>
      {/* El componente Header recibe los enlaces de navegación y su visibilidad. */}
      <Header links={db.navigation} isVisible={isHeaderVisible} />
      {/* Contenedor principal de las secciones de la página. */}
      <main className={styles.container}>
        {/* Renderiza la sección Hero con el contenido de `db.json`. */}
        <Hero content={db.hero} />
        {/* Renderiza la sección About con el contenido de `db.json`. */}
        <About content={db.about} />
        {/* Renderiza la sección MainContact con el contenido de `db.json`. */}
        <MainContact content={db.mainContact} />
      </main>
      {/* Componente de Vercel para la monitorización del rendimiento. */}
      <SpeedInsights />
    </>
  );
}
