import styles from './DesktopWarning.module.css';

/**
 * @file DesktopWarning.tsx
 * @description Este componente `DesktopWarning` muestra una advertencia a los usuarios
 *              que acceden al sitio desde un dispositivo de escritorio, indicando que la experiencia
 *              está optimizada para dispositivos móviles. Se controla su visibilidad a través de CSS.
 */
const DesktopWarning = () => {
  return (
    // El div `overlay` cubre toda la pantalla y actúa como fondo para la advertencia.
    <div className={styles.overlay}>
      {/* El div `content` contiene el mensaje de advertencia. */}
      <div className={styles.content}>
        {/* Icono o emoji para indicar que es una experiencia móvil. */}
        📱
        {/* Título principal de la advertencia. */}
        <h1>Experiencia Optimizada para Móviles</h1>
        {/* Párrafo con la explicación para el usuario. */}
        <p>Para una mejor visualización, por favor abre este sitio en tu teléfono.</p>
      </div>
    </div>
  );
};

export default DesktopWarning;
